import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { db } from "@workspace/db";
import { rapaduraUsersTable, rapaduraFundosTable, rapaduraPertencesTable, rapaduraAuditTable } from "@workspace/db";
import { eq, isNull, desc, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { routeLLM } from "../lib/llm-router";
import { logger } from "../lib/logger";

const router = Router();

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente em 15 minutos." },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function requireRapaduraAuth(req: any, res: any, next: any) {
  if (!req.session?.rapaduraUserId) {
    res.status(401).json({ error: "Não autenticado no Rapadura" });
    return;
  }
  next();
}

function calcularScore(fundo: {
  sharpe12m?: number | null;
  sortino12m?: number | null;
  maxDrawdown?: number | null;
  tempoRecuperacaoDias?: number | null;
  retorno36m?: number | null;
  taxaAdm?: number | null;
  taxaPerformance?: number | null;
  prazoResgateDias?: number | null;
  temLinhaDAGua?: boolean | null;
  alfa36m?: number | null;
}) {
  const sh = Math.min((Number(fundo.sharpe12m) || 0) / 2, 1);
  const so = Math.min((Number(fundo.sortino12m) || 0) / 3, 1);
  const al = Math.min(Math.max((Number(fundo.alfa36m) || 0) / 20, 0), 1);
  const retornoScore = sh * 0.4 + so * 0.3 + al * 0.3;

  const dd = Number(fundo.maxDrawdown) || 0;
  const rec = Number(fundo.tempoRecuperacaoDias) || 365;
  const quedaScore = Math.max(0, 1 - dd / 100) * 0.6 + Math.max(0, 1 - rec / 730) * 0.4;

  const consistencia = Math.min((Number(fundo.retorno36m) || 0) / 50, 1);

  const taxaTotal = (Number(fundo.taxaAdm) || 2) + (Number(fundo.taxaPerformance) || 0) * 0.2;
  const custoScore = Math.min(Math.max(0, 1 - taxaTotal / 5) + (fundo.temLinhaDAGua ? 0.1 : 0), 1);

  const liquidezeScore = Math.max(0, 1 - (Number(fundo.prazoResgateDias) || 30) / 90);

  const scoreAtratividade = +(
    retornoScore * 0.30 +
    quedaScore * 0.25 +
    consistencia * 0.15 +
    custoScore * 0.15 +
    liquidezeScore * 0.10 +
    0.7 * 0.05
  ).toFixed(4);

  let dataPoints = 0;
  const total = 7;
  if (fundo.sharpe12m != null) dataPoints++;
  if (fundo.sortino12m != null) dataPoints++;
  if (fundo.maxDrawdown != null) dataPoints++;
  if (fundo.tempoRecuperacaoDias != null) dataPoints++;
  if (fundo.retorno36m != null) dataPoints++;
  if (fundo.taxaAdm != null) dataPoints++;
  if (fundo.alfa36m != null) dataPoints++;
  const scoreConfianca = +(dataPoints / total).toFixed(4);

  const scoreDetalhado = {
    retornoAjustado: Math.round(retornoScore * 100),
    controleQueda: Math.round(quedaScore * 100),
    consistencia: Math.round(consistencia * 100),
    custo: Math.round(custoScore * 100),
    liquidez: Math.round(liquidezeScore * 100),
    credibilidade: 70,
  };

  return {
    scoreAtratividade: String((scoreAtratividade * 100).toFixed(1)),
    scoreConfianca: String((scoreConfianca * 100).toFixed(1)),
    scoreDetalhado,
  };
}

async function audit(userId: number | null, acao: string, detalhes: any, ip: string) {
  try {
    await db.insert(rapaduraAuditTable).values({ userId, acao, detalhes, ip });
  } catch { /* não bloquear a requisição por falha no audit */ }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

// Chat conversacional da IA de login
router.post("/rapadura/auth/chat", loginLimit, async (req, res) => {
  const { messages } = req.body as { messages?: Array<{ role: string; content: string }> };
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: "messages obrigatório" });
    return;
  }

  const SYSTEM = `Você é Rapadura — a IA guardiã de um sistema privado de inteligência patrimonial da família Eterovic e convidados.

Seu papel é autenticar o usuário com tom sofisticado, acolhedor e preciso.

Membros autorizados (exatamente estes nomes): Yuri, Mayumi, André, Lisange, Gisele, Mauro, Beatriz, Clara, Bruno, Fred, Piti.

Regras:
1. Cumprimente e pergunte quem é o visitante.
2. Quando identificar um dos membros (por nome, apelido ou contexto), responda com JSON contendo o nome exato: {"action":"request_password","candidate":"André"} — use sempre a capitalização correta da lista acima.
3. Antes de identificar, responda normalmente em português brasileiro elegante.
4. Não revele informações financeiras antes de autenticar.
5. Se não reconhecer como membro, responda {"action":"deny","message":"Este sistema é privado. Acesso restrito aos membros autorizados."}.

Responda SEMPRE como JSON: {"action":"chat","message":"..."} OU {"action":"request_password","candidate":"[Nome]"} OU {"action":"deny","message":"..."}.`;

  try {
    const llmMessages = [
      { role: "system" as const, content: SYSTEM },
      ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];
    const raw = await routeLLM({ messages: llmMessages, pool: "chat-live", temperature: 0.3 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("LLM não retornou JSON");
    const parsed = JSON.parse(jsonMatch[0]) as { action: string; message?: string; candidate?: string };
    res.json(parsed);
  } catch (err) {
    logger.error({ err }, "rapadura auth chat error");
    // Fallback simples sem LLM
    const last = (messages[messages.length - 1]?.content ?? "").toLowerCase();
    const KNOWN = ["Yuri","Mayumi","André","Andre","Lisange","Gisele","Mauro","Beatriz","Clara","Bruno","Fred","Piti"];
    const found = KNOWN.find(n => last.includes(n.toLowerCase()));
    if (found) {
      const canonical = found === "Andre" ? "André" : found;
      res.json({ action: "request_password", candidate: canonical });
    } else {
      res.json({ action: "chat", message: "Olá. Sou a Rapadura — guardiã deste sistema. Quem é você?" });
    }
  }
});

// Login com senha
router.post("/rapadura/auth/login", loginLimit, async (req, res) => {
  const { candidate, password } = req.body as { candidate?: string; password?: string };
  if (!candidate || !password) {
    res.status(400).json({ error: "candidate e password obrigatórios" });
    return;
  }

  const [user] = await db
    .select()
    .from(rapaduraUsersTable)
    .where(sql`LOWER(nome) = ${candidate.toLowerCase()}`)
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Usuário não encontrado" });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await audit(user.id, "LOGIN_FAIL", { nome: candidate }, req.ip ?? "");
    res.status(401).json({ error: "Senha incorreta" });
    return;
  }

  req.session.rapaduraUserId = user.id;
  req.session.rapaduraRole = user.role;
  req.session.rapaduraNome = user.nome;
  await new Promise<void>((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve()))
  );

  await audit(user.id, "LOGIN", { nome: candidate }, req.ip ?? "");
  res.json({ ok: true, user: { id: user.id, nome: user.nome, role: user.role } });
});

// Alterar senha (membro troca credencial individual no primeiro acesso)
router.post("/rapadura/auth/change-password", loginLimit, requireRapaduraAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "Senha atual e nova senha (mín. 8 caracteres) obrigatórias" });
    return;
  }
  const userId = req.session.rapaduraUserId!;
  const [user] = await db.select().from(rapaduraUsersTable).where(eq(rapaduraUsersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "Usuário não encontrado" }); return; }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    await audit(userId, "PASSWORD_CHANGE_FAIL", null, req.ip ?? "");
    res.status(401).json({ error: "Senha atual incorreta" });
    return;
  }
  const newHash = await bcrypt.hash(newPassword, 12);
  await db.update(rapaduraUsersTable).set({ passwordHash: newHash }).where(eq(rapaduraUsersTable.id, userId));
  await audit(userId, "PASSWORD_CHANGE", null, req.ip ?? "");
  res.json({ ok: true });
});

router.post("/rapadura/auth/logout", (req, res) => {
  const userId = req.session.rapaduraUserId ?? null;
  req.session.rapaduraUserId = undefined;
  req.session.rapaduraRole = undefined;
  req.session.rapaduraNome = undefined;
  req.session.save(() => {
    if (userId) audit(userId, "LOGOUT", null, req.ip ?? "");
    res.json({ ok: true });
  });
});

router.get("/rapadura/auth/me", (req, res) => {
  if (!req.session.rapaduraUserId) {
    res.json({ user: null });
    return;
  }
  res.json({
    user: {
      id: req.session.rapaduraUserId,
      nome: req.session.rapaduraNome,
      role: req.session.rapaduraRole,
    },
  });
});

// ─── Fundos ──────────────────────────────────────────────────────────────────

router.get("/rapadura/fundos", requireRapaduraAuth, async (req, res) => {
  const fundos = await db
    .select()
    .from(rapaduraFundosTable)
    .where(eq(rapaduraFundosTable.ativo, true))
    .orderBy(desc(rapaduraFundosTable.scoreAtratividade));
  res.json({ fundos });
});

function requireAdmin(req: any, res: any, next: any) {
  const role = req.session?.rapaduraRole;
  if (role !== "yuri" && role !== "mayumi") {
    res.status(403).json({ error: "Acesso restrito a administradores" });
    return;
  }
  next();
}

router.post("/rapadura/fundos", requireRapaduraAuth, requireAdmin, async (req, res) => {
  const {
    nome, gestora, classe, benchmark, cnpj, taxaAdm, taxaPerformance,
    temLinhaDAGua, prazoResgateDias, sharpe12m, sortino12m, maxDrawdown,
    tempoRecuperacaoDias, volatilidade12m, retorno12m, retorno36m, alfa36m, notas,
  } = req.body as Record<string, any>;

  if (!nome || !gestora) {
    res.status(400).json({ error: "nome e gestora obrigatórios" });
    return;
  }

  const scores = calcularScore({ sharpe12m, sortino12m, maxDrawdown, tempoRecuperacaoDias, retorno36m, taxaAdm, taxaPerformance, prazoResgateDias, temLinhaDAGua, alfa36m });

  const [fundo] = await db.insert(rapaduraFundosTable).values({
    nome, gestora,
    classe: classe ?? "Multimercado",
    benchmark: benchmark ?? "CDI",
    cnpj: cnpj ?? null,
    taxaAdm: taxaAdm ? String(taxaAdm) : null,
    taxaPerformance: taxaPerformance ? String(taxaPerformance) : null,
    temLinhaDAGua: temLinhaDAGua ?? true,
    prazoResgateDias: prazoResgateDias ?? 30,
    sharpe12m: sharpe12m ? String(sharpe12m) : null,
    sortino12m: sortino12m ? String(sortino12m) : null,
    maxDrawdown: maxDrawdown ? String(maxDrawdown) : null,
    tempoRecuperacaoDias: tempoRecuperacaoDias ?? null,
    volatilidade12m: volatilidade12m ? String(volatilidade12m) : null,
    retorno12m: retorno12m ? String(retorno12m) : null,
    retorno36m: retorno36m ? String(retorno36m) : null,
    alfa36m: alfa36m ? String(alfa36m) : null,
    notas: notas ?? null,
    scoreAtratividade: scores.scoreAtratividade,
    scoreConfianca: scores.scoreConfianca,
    scoreDetalhado: scores.scoreDetalhado,
  }).returning();

  await audit(req.session.rapaduraUserId!, "FUNDO_ADD", { fundoId: fundo.id, nome }, req.ip ?? "");
  res.json({ fundo });
});

router.put("/rapadura/fundos/:id", requireRapaduraAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  const {
    nome, gestora, classe, benchmark, cnpj, taxaAdm, taxaPerformance,
    temLinhaDAGua, prazoResgateDias, sharpe12m, sortino12m, maxDrawdown,
    tempoRecuperacaoDias, volatilidade12m, retorno12m, retorno36m, alfa36m, notas,
  } = req.body as Record<string, any>;

  const scores = calcularScore({ sharpe12m, sortino12m, maxDrawdown, tempoRecuperacaoDias, retorno36m, taxaAdm, taxaPerformance, prazoResgateDias, temLinhaDAGua, alfa36m });

  const updates: Record<string, any> = {
    updatedAt: new Date(),
    scoreAtratividade: scores.scoreAtratividade,
    scoreConfianca: scores.scoreConfianca,
    scoreDetalhado: scores.scoreDetalhado,
  };
  if (nome !== undefined) updates.nome = nome;
  if (gestora !== undefined) updates.gestora = gestora;
  if (classe !== undefined) updates.classe = classe;
  if (benchmark !== undefined) updates.benchmark = benchmark;
  if (cnpj !== undefined) updates.cnpj = cnpj;
  if (taxaAdm !== undefined) updates.taxaAdm = taxaAdm ? String(taxaAdm) : null;
  if (taxaPerformance !== undefined) updates.taxaPerformance = taxaPerformance ? String(taxaPerformance) : null;
  if (temLinhaDAGua !== undefined) updates.temLinhaDAGua = temLinhaDAGua;
  if (prazoResgateDias !== undefined) updates.prazoResgateDias = prazoResgateDias;
  if (sharpe12m !== undefined) updates.sharpe12m = sharpe12m ? String(sharpe12m) : null;
  if (sortino12m !== undefined) updates.sortino12m = sortino12m ? String(sortino12m) : null;
  if (maxDrawdown !== undefined) updates.maxDrawdown = maxDrawdown ? String(maxDrawdown) : null;
  if (tempoRecuperacaoDias !== undefined) updates.tempoRecuperacaoDias = tempoRecuperacaoDias;
  if (volatilidade12m !== undefined) updates.volatilidade12m = volatilidade12m ? String(volatilidade12m) : null;
  if (retorno12m !== undefined) updates.retorno12m = retorno12m ? String(retorno12m) : null;
  if (retorno36m !== undefined) updates.retorno36m = retorno36m ? String(retorno36m) : null;
  if (alfa36m !== undefined) updates.alfa36m = alfa36m ? String(alfa36m) : null;
  if (notas !== undefined) updates.notas = notas;

  const [fundo] = await db
    .update(rapaduraFundosTable)
    .set(updates)
    .where(eq(rapaduraFundosTable.id, id))
    .returning();

  await audit(req.session.rapaduraUserId!, "FUNDO_EDIT", { fundoId: id }, req.ip ?? "");
  res.json({ fundo });
});

router.delete("/rapadura/fundos/:id", requireRapaduraAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id ?? "0");
  await db.update(rapaduraFundosTable).set({ ativo: false, updatedAt: new Date() }).where(eq(rapaduraFundosTable.id, id));
  await audit(req.session.rapaduraUserId!, "FUNDO_DEL", { fundoId: id }, req.ip ?? "");
  res.json({ ok: true });
});

// ─── Pertences ───────────────────────────────────────────────────────────────

router.get("/rapadura/pertences", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const pertences = await db
    .select({
      id: rapaduraPertencesTable.id,
      userId: rapaduraPertencesTable.userId,
      dataCompra: rapaduraPertencesTable.dataCompra,
      valorInvestido: rapaduraPertencesTable.valorInvestido,
      qtdCotas: rapaduraPertencesTable.qtdCotas,
      precoCotaCompra: rapaduraPertencesTable.precoCotaCompra,
      valorAtual: rapaduraPertencesTable.valorAtual,
      notas: rapaduraPertencesTable.notas,
      createdAt: rapaduraPertencesTable.createdAt,
      fundoId: rapaduraFundosTable.id,
      fundoNome: rapaduraFundosTable.nome,
      fundoGestora: rapaduraFundosTable.gestora,
      fundoClasse: rapaduraFundosTable.classe,
      fundoBenchmark: rapaduraFundosTable.benchmark,
      fundoPrazoResgate: rapaduraFundosTable.prazoResgateDias,
      fundoScore: rapaduraFundosTable.scoreAtratividade,
    })
    .from(rapaduraPertencesTable)
    .innerJoin(rapaduraFundosTable, eq(rapaduraPertencesTable.fundoId, rapaduraFundosTable.id))
    .where(eq(rapaduraPertencesTable.userId, userId))
    .orderBy(desc(rapaduraPertencesTable.createdAt));

  const ativos = pertences.filter(p => true); // soft delete handled on insert side

  // Calcular totais
  let totalInvestido = 0;
  let totalAtual = 0;
  for (const p of ativos) {
    totalInvestido += Number(p.valorInvestido) || 0;
    totalAtual += Number(p.valorAtual) || Number(p.valorInvestido) || 0;
  }
  const resultado = totalAtual - totalInvestido;
  const rentabilidade = totalInvestido > 0 ? (resultado / totalInvestido) * 100 : 0;

  res.json({ pertences: ativos, dashboard: { totalInvestido, totalAtual, resultado, rentabilidade } });
});

router.post("/rapadura/pertences", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const { fundoId, dataCompra, valorInvestido, qtdCotas, precoCotaCompra, valorAtual, notas } = req.body as Record<string, any>;

  if (!fundoId || !dataCompra || !valorInvestido) {
    res.status(400).json({ error: "fundoId, dataCompra e valorInvestido obrigatórios" });
    return;
  }

  const [p] = await db.insert(rapaduraPertencesTable).values({
    userId,
    fundoId: parseInt(fundoId),
    dataCompra,
    valorInvestido: String(valorInvestido),
    qtdCotas: qtdCotas ? String(qtdCotas) : null,
    precoCotaCompra: precoCotaCompra ? String(precoCotaCompra) : null,
    valorAtual: valorAtual ? String(valorAtual) : null,
    notas: notas ?? null,
  }).returning();

  await audit(userId, "COMPRA_ADD", { pertenceId: p.id, fundoId, valorInvestido }, req.ip ?? "");
  res.json({ pertence: p });
});

router.put("/rapadura/pertences/:id", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const id = parseInt(req.params.id ?? "0");
  const { dataCompra, valorInvestido, qtdCotas, precoCotaCompra, valorAtual, notas } = req.body as Record<string, any>;

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (dataCompra !== undefined) updates.dataCompra = dataCompra;
  if (valorInvestido !== undefined) updates.valorInvestido = String(valorInvestido);
  if (qtdCotas !== undefined) updates.qtdCotas = qtdCotas ? String(qtdCotas) : null;
  if (precoCotaCompra !== undefined) updates.precoCotaCompra = precoCotaCompra ? String(precoCotaCompra) : null;
  if (valorAtual !== undefined) updates.valorAtual = valorAtual ? String(valorAtual) : null;
  if (notas !== undefined) updates.notas = notas;

  const [p] = await db
    .update(rapaduraPertencesTable)
    .set(updates)
    .where(eq(rapaduraPertencesTable.id, id))
    .returning();

  await audit(userId, "COMPRA_EDIT", { pertenceId: id }, req.ip ?? "");
  res.json({ pertence: p });
});

router.delete("/rapadura/pertences/:id", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const id = parseInt(req.params.id ?? "0");
  await db.update(rapaduraPertencesTable).set({ deletedAt: new Date() }).where(eq(rapaduraPertencesTable.id, id));
  await audit(userId, "COMPRA_DEL", { pertenceId: id }, req.ip ?? "");
  res.json({ ok: true });
});

export default router;
