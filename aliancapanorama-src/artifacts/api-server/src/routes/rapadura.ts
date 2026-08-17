import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { db } from "@workspace/db";
import {
  rapaduraUsersTable, rapaduraFundosTable, rapaduraPertencesTable,
  rapaduraAuditTable, rapaduraAprovacoesTable,
  rapaduraTransacoesTable, rapaduraHistoricoCotas,
} from "@workspace/db";
import { eq, isNull, desc, sql, and, asc, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import PDFDocument from "pdfkit";
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

// Score Engine v2 — 7 dimensões (Calmar Ratio + Fator Verde)
function calcularScore(fundo: {
  sharpe12m?: number | null;
  sortino12m?: number | null;
  maxDrawdown?: number | null;
  tempoRecuperacaoDias?: number | null;
  retorno12m?: number | null;
  retorno36m?: number | null;
  taxaAdm?: number | null;
  taxaPerformance?: number | null;
  prazoResgateDias?: number | null;
  temLinhaDAGua?: boolean | null;
  alfa36m?: number | null;
  fatorVerde?: number | null;
  confiancaVerde?: number | null;
  classe?: string | null;
}) {
  // Ações individuais: score baseado em retorno12m (não têm sharpe/sortino de fundo)
  if (fundo.classe === "Ação") {
    const ret = Number(fundo.retorno12m) || 0;
    // Score 0-100: retorno normalizado em faixa -50%..+100% → 0..100
    const base = Math.max(0, Math.min((ret + 50) / 150, 1));
    const scoreAtratividade = +(base * 100).toFixed(1);
    const scoreConfianca = fundo.retorno12m != null ? "25.0" : "0.0";
    return { scoreAtratividade: String(scoreAtratividade), scoreConfianca, calmarRatio: null, scoreVerde: null, scoreDetalhado: { retornoAjustado: Math.round(base * 100), controleQueda: 0, consistencia: 0, custo: 0, liquidez: 0, fatorVerde: null, calmarRatio: null } };
  }

  // Retorno Ajustado ao Risco (30%): Sharpe + Sortino + Alfa + Calmar
  const sh = Math.min((Number(fundo.sharpe12m) || 0) / 2, 1);
  const so = Math.min((Number(fundo.sortino12m) || 0) / 3, 1);
  const al = Math.min(Math.max((Number(fundo.alfa36m) || 0) / 20, 0), 1);
  // Calmar = retorno12m / maxDrawdown — normalizado: calmar > 2 = excelente
  const ret12 = Number(fundo.retorno12m) || 0;
  const dd = Number(fundo.maxDrawdown) || 0;
  const calmar = dd > 0 ? Math.min(ret12 / dd / 2, 1) : 0;
  const retornoScore = sh * 0.30 + so * 0.25 + al * 0.25 + calmar * 0.20;

  // Controle de Queda (25%)
  const rec = Number(fundo.tempoRecuperacaoDias) || 365;
  const quedaScore = Math.max(0, 1 - dd / 100) * 0.6 + Math.max(0, 1 - rec / 730) * 0.4;

  // Consistência (15%): retorno36m vs benchmark
  const consistencia = Math.min((Number(fundo.retorno36m) || 0) / 50, 1);

  // Custo Real (15%): taxa adm + drag performance + High-Water Mark
  const taxaTotal = (Number(fundo.taxaAdm) || 2) + (Number(fundo.taxaPerformance) || 0) * 0.2;
  const custoScore = Math.min(Math.max(0, 1 - taxaTotal / 5) + (fundo.temLinhaDAGua ? 0.1 : 0), 1);

  // Liquidez (10%)
  const liquidezeScore = Math.max(0, 1 - (Number(fundo.prazoResgateDias) || 30) / 90);

  // Fator Verde (5%) — só conta se ambos os campos estiverem preenchidos (anti-greenwashing)
  const verdeScore = (fundo.fatorVerde != null && fundo.confiancaVerde != null)
    ? (Number(fundo.fatorVerde) / 100) * (Number(fundo.confiancaVerde) / 100)
    : null;

  // Ponderação: quando fatorVerde ausente, 5% vai para retornoAjustado
  const scoreAtratividade = verdeScore !== null
    ? retornoScore * 0.30 + quedaScore * 0.25 + consistencia * 0.15 + custoScore * 0.15 + liquidezeScore * 0.10 + verdeScore * 0.05
    : retornoScore * 0.35 + quedaScore * 0.25 + consistencia * 0.15 + custoScore * 0.15 + liquidezeScore * 0.10;

  // Score de Confiança: completude de 8 campos-chave
  let dataPoints = 0;
  const total = 8;
  if (fundo.sharpe12m != null) dataPoints++;
  if (fundo.sortino12m != null) dataPoints++;
  if (fundo.maxDrawdown != null) dataPoints++;
  if (fundo.tempoRecuperacaoDias != null) dataPoints++;
  if (fundo.retorno36m != null) dataPoints++;
  if (fundo.taxaAdm != null) dataPoints++;
  if (fundo.alfa36m != null) dataPoints++;
  if (fundo.retorno12m != null) dataPoints++;
  const scoreConfianca = +(dataPoints / total).toFixed(4);

  // Calmar armazenado para exibição
  const calmarRatio = dd > 0 && ret12 > 0 ? +(ret12 / dd).toFixed(3) : null;

  // Score Verde calculado para armazenamento
  const scoreVerdeNum = verdeScore !== null ? +((verdeScore * 100).toFixed(1)) : null;

  const scoreDetalhado = {
    retornoAjustado: Math.round(retornoScore * 100),
    controleQueda: Math.round(quedaScore * 100),
    consistencia: Math.round(consistencia * 100),
    custo: Math.round(custoScore * 100),
    liquidez: Math.round(liquidezeScore * 100),
    fatorVerde: verdeScore !== null ? Math.round(verdeScore * 100) : null,
    calmarRatio: calmarRatio,
  };

  return {
    scoreAtratividade: String((scoreAtratividade * 100).toFixed(1)),
    scoreConfianca: String((scoreConfianca * 100).toFixed(1)),
    calmarRatio: calmarRatio ? String(calmarRatio) : null,
    scoreVerde: scoreVerdeNum !== null ? String(scoreVerdeNum) : null,
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
    const authCtrl = new AbortController();
    const authTimer = setTimeout(() => authCtrl.abort(), 10000);
    let raw: string;
    try {
      raw = await routeLLM({ messages: llmMessages, pool: "chat-live", temperature: 0.3, signal: authCtrl.signal });
    } finally { clearTimeout(authTimer); }
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
    tempoRecuperacaoDias, volatilidade12m, retorno12m, retorno36m, alfa36m,
    fatorVerde, confiancaVerde, valorMinAplicacao, notas,
  } = req.body as Record<string, any>;

  if (!nome || !gestora) {
    res.status(400).json({ error: "nome e gestora obrigatórios" });
    return;
  }

  const scores = calcularScore({ sharpe12m, sortino12m, maxDrawdown, tempoRecuperacaoDias, retorno12m, retorno36m, taxaAdm, taxaPerformance, prazoResgateDias, temLinhaDAGua, alfa36m, fatorVerde, confiancaVerde, classe });

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
    fatorVerde: fatorVerde != null ? parseInt(fatorVerde) : null,
    confiancaVerde: confiancaVerde != null ? parseInt(confiancaVerde) : null,
    valorMinAplicacao: valorMinAplicacao ? String(valorMinAplicacao) : null,
    notas: notas ?? null,
    scoreAtratividade: scores.scoreAtratividade,
    scoreConfianca: scores.scoreConfianca,
    calmarRatio: scores.calmarRatio,
    scoreVerde: scores.scoreVerde,
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
    tempoRecuperacaoDias, volatilidade12m, retorno12m, retorno36m, alfa36m,
    fatorVerde, confiancaVerde, valorMinAplicacao, notas,
  } = req.body as Record<string, any>;

  const scores = calcularScore({ sharpe12m, sortino12m, maxDrawdown, tempoRecuperacaoDias, retorno12m, retorno36m, taxaAdm, taxaPerformance, prazoResgateDias, temLinhaDAGua, alfa36m, fatorVerde, confiancaVerde, classe });

  const updates: Record<string, any> = {
    updatedAt: new Date(),
    scoreAtratividade: scores.scoreAtratividade,
    scoreConfianca: scores.scoreConfianca,
    calmarRatio: scores.calmarRatio,
    scoreVerde: scores.scoreVerde,
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
  if (fatorVerde !== undefined) updates.fatorVerde = fatorVerde != null ? parseInt(fatorVerde) : null;
  if (confiancaVerde !== undefined) updates.confiancaVerde = confiancaVerde != null ? parseInt(confiancaVerde) : null;
  if (valorMinAplicacao !== undefined) updates.valorMinAplicacao = valorMinAplicacao ? String(valorMinAplicacao) : null;
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
      statusReconciliacao: rapaduraPertencesTable.statusReconciliacao,
      totalRetirado: rapaduraPertencesTable.totalRetirado,
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

  // Calcular totais com resultado correto: inclui retiradas parciais já feitas
  let totalInvestido = 0;
  let totalAtual = 0;
  let totalRetirado = 0;
  for (const p of pertences) {
    totalInvestido += Number(p.valorInvestido) || 0;
    totalAtual += Number(p.valorAtual) || Number(p.valorInvestido) || 0;
    totalRetirado += Number(p.totalRetirado) || 0;
  }
  // resultado real = (posição atual + o que já saiu) - o que entrou
  const resultadoReal = (totalAtual + totalRetirado) - totalInvestido;
  const rentabilidade = totalInvestido > 0 ? (resultadoReal / totalInvestido) * 100 : 0;

  res.json({
    pertences,
    dashboard: { totalInvestido, totalAtual, totalRetirado, resultado: resultadoReal, rentabilidade },
  });
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

// ─── Investir — Alocação Inteligente ─────────────────────────────────────────

router.post("/rapadura/investir", requireRapaduraAuth, async (req, res) => {
  const { valorTotal } = req.body as { valorTotal?: number };
  if (!valorTotal || valorTotal <= 0) {
    res.status(400).json({ error: "valorTotal obrigatório e deve ser positivo" });
    return;
  }

  const fundos = await db
    .select()
    .from(rapaduraFundosTable)
    .where(eq(rapaduraFundosTable.ativo, true))
    .orderBy(desc(rapaduraFundosTable.scoreAtratividade));

  // Filtrar fundos com valor mínimo acessível
  const elegiveis = fundos.filter(f => {
    const minimo = Number(f.valorMinAplicacao ?? 500);
    return valorTotal >= minimo;
  });

  if (elegiveis.length === 0) {
    res.json({ alocacao: [], mensagem: "Valor insuficiente para qualquer fundo disponível." });
    return;
  }

  // Top 5 fundos por score
  const top = elegiveis.slice(0, 5);

  // Pesos quadráticos (concentra nos melhores sem ignorar os demais)
  const scores = top.map(f => Math.pow(Number(f.scoreAtratividade ?? 0), 2));
  const pesoTotal = scores.reduce((a, b) => a + b, 0);

  let restante = valorTotal;
  const alocacao = top.map((f, i) => {
    const percentual = pesoTotal > 0 ? (scores[i] / pesoTotal) * 100 : 100 / top.length;
    const minimo = Number(f.valorMinAplicacao ?? 500);
    const raw = (percentual / 100) * valorTotal;
    // Arredonda para múltiplos de R$100 respeitando o mínimo
    const valor = i === top.length - 1
      ? restante // último leva o restante
      : Math.max(minimo, Math.floor(raw / 100) * 100);
    restante -= i === top.length - 1 ? restante : valor;
    return {
      fundoId: f.id,
      nome: f.nome,
      gestora: f.gestora,
      scoreAtratividade: f.scoreAtratividade,
      scoreConfianca: f.scoreConfianca,
      scoreVerde: f.scoreVerde,
      percentual: +percentual.toFixed(1),
      valor: Math.round(valor * 100) / 100,
      valorMin: minimo,
    };
  }).filter(a => a.valor > 0);

  await audit(req.session.rapaduraUserId!, "INVESTIR_SIMULAR", { valorTotal, alocacao: alocacao.length }, req.ip ?? "");
  res.json({ alocacao, valorTotal, totalAlocado: alocacao.reduce((s, a) => s + a.valor, 0) });
});

// ─── Colher — Resgate com Raiz Mínima ────────────────────────────────────────

router.post("/rapadura/colher", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const { valorDesejado, raizMinima } = req.body as { valorDesejado?: number; raizMinima?: number };
  if (!valorDesejado || valorDesejado <= 0) {
    res.status(400).json({ error: "valorDesejado obrigatório e deve ser positivo" });
    return;
  }

  const raizPct = raizMinima != null ? Math.min(Math.max(raizMinima, 0), 100) : 10;

  const pertences = await db
    .select({
      id: rapaduraPertencesTable.id,
      valorInvestido: rapaduraPertencesTable.valorInvestido,
      valorAtual: rapaduraPertencesTable.valorAtual,
      notas: rapaduraPertencesTable.notas,
      fundoId: rapaduraFundosTable.id,
      fundoNome: rapaduraFundosTable.nome,
      fundoGestora: rapaduraFundosTable.gestora,
      fundoScore: rapaduraFundosTable.scoreAtratividade,
      prazoResgateDias: rapaduraFundosTable.prazoResgateDias,
    })
    .from(rapaduraPertencesTable)
    .innerJoin(rapaduraFundosTable, eq(rapaduraPertencesTable.fundoId, rapaduraFundosTable.id))
    .where(eq(rapaduraPertencesTable.userId, userId))
    .orderBy(rapaduraFundosTable.scoreAtratividade); // resgata dos piores primeiro

  let restante = valorDesejado;
  const colheita = [];

  for (const p of pertences) {
    if (restante <= 0) break;
    const valorAtual = Number(p.valorAtual ?? p.valorInvestido);
    const raizValor = (raizPct / 100) * Number(p.valorInvestido);
    const disponivel = Math.max(0, valorAtual - raizValor);
    const resgatar = Math.min(disponivel, restante);
    if (resgatar > 50) { // não resgatar menos de R$50
      colheita.push({
        pertenceId: p.id,
        fundoId: p.fundoId,
        fundoNome: p.fundoNome,
        fundoGestora: p.fundoGestora,
        fundoScore: p.fundoScore,
        prazoResgateDias: p.prazoResgateDias,
        valorAtual: Math.round(valorAtual * 100) / 100,
        valorResgatar: Math.round(resgatar * 100) / 100,
        valorRestante: Math.round((valorAtual - resgatar) * 100) / 100,
        raizPreservada: Math.round(raizValor * 100) / 100,
      });
      restante -= resgatar;
    }
  }

  const totalDisponivel = pertences.reduce((s, p) => {
    const va = Number(p.valorAtual ?? p.valorInvestido);
    const raiz = (raizPct / 100) * Number(p.valorInvestido);
    return s + Math.max(0, va - raiz);
  }, 0);

  await audit(userId, "COLHER_SIMULAR", { valorDesejado, totalResgatavel: totalDisponivel, itens: colheita.length }, req.ip ?? "");
  res.json({
    colheita,
    valorDesejado,
    totalResgatado: Math.round((valorDesejado - restante) * 100) / 100,
    totalDisponivel: Math.round(totalDisponivel * 100) / 100,
    naoAtendido: restante > 0 ? Math.round(restante * 100) / 100 : 0,
    raizPct,
  });
});

// ─── Análise — Pertences × Oportunidades ─────────────────────────────────────

router.get("/rapadura/analise", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;

  const [pertences, fundos] = await Promise.all([
    db.select({
      id: rapaduraPertencesTable.id,
      valorInvestido: rapaduraPertencesTable.valorInvestido,
      valorAtual: rapaduraPertencesTable.valorAtual,
      fundoId: rapaduraFundosTable.id,
      fundoNome: rapaduraFundosTable.nome,
      fundoGestora: rapaduraFundosTable.gestora,
      fundoScore: rapaduraFundosTable.scoreAtratividade,
      fundoConfianca: rapaduraFundosTable.scoreConfianca,
      fundoClasse: rapaduraFundosTable.classe,
    })
      .from(rapaduraPertencesTable)
      .innerJoin(rapaduraFundosTable, eq(rapaduraPertencesTable.fundoId, rapaduraFundosTable.id))
      .where(eq(rapaduraPertencesTable.userId, userId)),
    db.select().from(rapaduraFundosTable).where(eq(rapaduraFundosTable.ativo, true)).orderBy(desc(rapaduraFundosTable.scoreAtratividade)),
  ]);

  // Score médio da carteira
  const scoreMedioCarters = pertences.length > 0
    ? pertences.reduce((s, p) => s + Number(p.fundoScore ?? 0), 0) / pertences.length
    : 0;

  // IDs de fundos já na carteira
  const idsNaCerteira = new Set(pertences.map(p => p.fundoId));

  // Oportunidades: fora da carteira, score alto, apenas fundos comparáveis (não ações/poupança/ativo digital)
  const CLASSES_FUNDO = ["Renda Fixa", "Multimercado", "Ações", "Pós Fixado", "Renda Variável"];
  const oportunidades = fundos.filter(f =>
    !idsNaCerteira.has(f.id) &&
    Number(f.scoreAtratividade ?? 0) > scoreMedioCarters + 15 &&
    (f.exibirOportunidades !== false) &&
    CLASSES_FUNDO.includes(f.classe ?? "")
  );

  // Sugestões de troca: apenas fundos (não ações individuais, poupança, ativo digital)
  const sugestoesTroca = pertences
    .filter(p => Number(p.fundoScore ?? 0) < 50 && CLASSES_FUNDO.includes(String(p.fundoClasse ?? "")))
    .map(p => {
      const melhorAlternativa = oportunidades.find(f => f.classe === p.fundoClasse)
        ?? oportunidades[0];
      if (!melhorAlternativa) return null;
      const ganhoScore = Number(melhorAlternativa.scoreAtratividade ?? 0) - Number(p.fundoScore ?? 0);
      return {
        emCarteira: { fundoId: p.fundoId, nome: p.fundoNome, score: p.fundoScore, valorInvestido: p.valorInvestido },
        sugerido: { fundoId: melhorAlternativa.id, nome: melhorAlternativa.nome, score: melhorAlternativa.scoreAtratividade },
        ganhoScore: +ganhoScore.toFixed(1),
        indiceTroca: ganhoScore > 30 ? "FORTE" : ganhoScore > 15 ? "MODERADO" : "FRACO",
      };
    })
    .filter(Boolean);

  res.json({
    carteira: {
      quantidadeFundos: pertences.length,
      scoreMedio: +scoreMedioCarters.toFixed(1),
      totalInvestido: pertences.reduce((s, p) => s + Number(p.valorInvestido), 0),
    },
    oportunidadesForaCerteira: oportunidades.slice(0, 5),
    sugestoesTroca,
  });
});

// ─── IA Cana — linguagem natural → operações no Rapadura ─────────────────────
//
// POST /rapadura/cana
// Body: { message: string, history?: {role,content}[] }
// Aceita texto livre com um ou vários fundos para ADD/EDIT/DELETE/QUERY
//
const CANA_SYSTEM = `Você é a IA Cana, assistente patrimonial inteligente do Rapadura.
Analise a mensagem do usuário e retorne APENAS um JSON válido (sem markdown, sem explicação):

Para FUNDOS (catálogo compartilhado — requer admin):
{
  "acao": "ADD_FUNDO" | "EDIT_FUNDO" | "DELETE_FUNDO",
  "itens": [
    {
      "id": <number ou null para ADD>,
      "nome": "string",
      "gestora": "string",
      "classe": "Renda Fixa"|"Multimercado"|"Ações"|"Ação"|"Renda Variável"|"Pós Fixado"|"Pré Fixado"|"FII"|"Internacional"|"Cripto",
      "benchmark": "CDI"|"IBOV"|"IPCA"|"Outro",
      "retorno12m": <number % ou null>,
      "sharpe12m": <number ou null>,
      "sortino12m": <number ou null>,
      "maxDrawdown": <number % positivo ou null>,
      "taxaAdm": <number % ou null>,
      "taxaPerformance": <number % ou null>,
      "prazoResgateDias": <0|1|2|3|5|7|30|90 ou null>,
      "valorMinAplicacao": <number R$ ou null>,
      "fatorVerde": <0-100 ou null>,
      "confiancaVerde": <0-100 ou null>,
      "notas": "string ou null"
    }
  ],
  "resposta": "mensagem amigável"
}

Para PERTENCES (investimentos pessoais do usuário logado):
{
  "acao": "ADD_PERTENCE" | "EDIT_PERTENCE" | "DELETE_PERTENCE",
  "itens": [
    {
      "id": <number — só para EDIT/DELETE>,
      "fundoNome": "nome do fundo para buscar",
      "gestora": "gestora (se o fundo precisar ser criado)",
      "classe": "classe do fundo (se precisar criar)",
      "retorno12m": <number % — se informado e fundo não existe>,
      "prazoResgateDias": <number — se informado>,
      "valorInvestido": <number R$ — custo de aquisição>,
      "valorAtual": <number R$ — saldo atual, se informado>,
      "dataCompra": "YYYY-MM-DD",
      "notas": "string ou null"
    }
  ],
  "resposta": "mensagem amigável"
}

Para CONSULTAS e CONVERSAS:
{
  "acao": "QUERY" | "CHAT",
  "itens": [],
  "resposta": "resposta direta"
}

Regras:
- prazoResgate "D+0" = 0, "D+1" = 1, "D+2" = 2, etc
- Rentabilidade Bruta 12M = retorno12m
- Saldo líquido ≈ valorInvestido (custo); Saldo total = valorAtual
- Se usuário menciona saldo e rendimento: valorInvestido = saldo - rendimento; valorAtual = saldo
- dataCompra: use a data de hoje se não informada (formato YYYY-MM-DD)
- Para DELETE: só precisa de id ou fundoNome
- Para QUERY ou CHAT: itens pode ser []
- Use ADD_PERTENCE quando o usuário diz "tenho", "investi", "adiciona ao meu patrimônio", etc
- Use ADD_FUNDO apenas quando explicitamente pedido por admin para adicionar ao catálogo
- Sempre extraia TODOS os itens mencionados em itens[]
- LIMITE: máximo 15 itens por mensagem. Se tiver mais de 15, processe os primeiros 15 e avise no campo "resposta" quantos ficaram de fora`;

router.post("/rapadura/cana", requireRapaduraAuth, async (req, res) => {
  const { message, history = [] } = req.body as { message: string; history?: any[] };
  if (!message) { res.status(400).json({ error: "message obrigatório" }); return; }

  const userId = req.session.rapaduraUserId!;
  const userRole = req.session.rapaduraRole as string;
  const isAdmin = userRole === "yuri" || userRole === "mayumi" || userRole === "admin";

  // Buscar fundos existentes para contexto (top 15 por score)
  const fundosExistentes = await db.select({
    id: rapaduraFundosTable.id,
    nome: rapaduraFundosTable.nome,
    gestora: rapaduraFundosTable.gestora,
    score: rapaduraFundosTable.scoreAtratividade,
  }).from(rapaduraFundosTable).where(eq(rapaduraFundosTable.ativo, true))
    .orderBy(desc(rapaduraFundosTable.scoreAtratividade))
    .limit(15);

  const contextoFundos = fundosExistentes.map(f => `ID${f.id}: ${f.nome} (${f.gestora}) score=${f.score}`).join("\n");

  const systemWithContext = CANA_SYSTEM + `\n\nFundos já cadastrados:\n${contextoFundos || "(nenhum ainda)"}`;

  // Chamar LLM com timeout de 25s — sem timeout causava hang no Render até OOM
  let rawJson = "";
  try {
    const trimContent = (s: string) => s.length > 1500 ? s.slice(0, 1500) + "…" : s;
    const trimMsg = (s: string) => s.length > 4000 ? s.slice(0, 4000) + "…" : s;
    const msgs: any[] = [
      { role: "system", content: systemWithContext },
      ...history.slice(-4).map((h: any) => ({ role: h.role, content: trimContent(String(h.content ?? "")) })),
      { role: "user", content: trimMsg(message) },
    ];
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      rawJson = await routeLLM({ messages: msgs, maxTokens: 2000, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  } catch (e: any) {
    const isTimeout = e?.name === "AbortError" || /abort/i.test(String(e));
    if (isTimeout) {
      res.status(503).json({ error: "Cana demorou demais, tente de novo em instantes" }); return;
    }
    res.status(500).json({ error: "Erro ao chamar IA", details: String(e) }); return;
  }

  // Parse JSON da resposta
  let parsed: any;
  try {
    const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? rawJson);
  } catch {
    // JSON quebrado geralmente significa payload muito grande (resposta truncada)
    const muitoGrande = rawJson.length > 3000 || (rawJson.match(/"nome"/g) ?? []).length > 10;
    if (muitoGrande) {
      res.json({
        acao: "CHAT",
        resposta: "🎵 Tudo que quer me dar é demais, é pesado, não há paz...\n\nTantinhos ativos de uma vez só me deixam tonta! Meu limite é 15 itens por mensagem. Por favor, divida em partes menores e mande de novo — prometo processar cada um com carinho.",
        executado: [],
        limite: { max: 15, dica: "Divida em lotes de até 15 itens por mensagem" }
      }); return;
    }
    res.json({
      acao: "CHAT",
      resposta: "Não consegui entender o formato da sua mensagem. Pode reescrever de outra forma? Se estava adicionando investimentos, tente descrever um a um: nome do fundo, valor investido e data de compra.",
      executado: []
    }); return;
  }

  const { acao, itens = [], resposta } = parsed;
  const executado: any[] = [];

  // Limite de segurança: no máximo 15 itens por chamada
  const LIMITE_ITENS = 15;
  if (itens.length > LIMITE_ITENS) {
    res.json({
      acao: "CHAT",
      resposta: `🎵 Tudo que quer me dar é demais, é pesado, não há paz...\n\nVocê mandou ${itens.length} itens de uma vez — meu limite é ${LIMITE_ITENS}! Mande em lotes menores e processo tudo certinho.`,
      executado: [],
      limite: { recebido: itens.length, max: LIMITE_ITENS, dica: `Divida em lotes de até ${LIMITE_ITENS} itens` }
    }); return;
  }

  // Executar operações
  for (const item of itens) {
    try {
      if (acao === "ADD_FUNDO") {
        if (!isAdmin) { executado.push({ erro: "Sem permissão para adicionar fundos" }); continue; }
        const scores = calcularScore(item);
        const [fundo] = await db.insert(rapaduraFundosTable).values({
          nome: item.nome ?? "Fundo sem nome",
          gestora: item.gestora ?? "Desconhecida",
          classe: item.classe ?? "Multimercado",
          benchmark: item.benchmark ?? "CDI",
          taxaAdm: item.taxaAdm != null ? String(item.taxaAdm) : null,
          taxaPerformance: item.taxaPerformance != null ? String(item.taxaPerformance) : null,
          prazoResgateDias: item.prazoResgateDias ?? 30,
          sharpe12m: item.sharpe12m != null ? String(item.sharpe12m) : null,
          sortino12m: item.sortino12m != null ? String(item.sortino12m) : null,
          maxDrawdown: item.maxDrawdown != null ? String(item.maxDrawdown) : null,
          retorno12m: item.retorno12m != null ? String(item.retorno12m) : null,
          retorno36m: item.retorno36m != null ? String(item.retorno36m) : null,
          alfa36m: item.alfa36m != null ? String(item.alfa36m) : null,
          tempoRecuperacaoDias: item.tempoRecuperacaoDias ?? null,
          volatilidade12m: item.volatilidade12m != null ? String(item.volatilidade12m) : null,
          valorMinAplicacao: item.valorMinAplicacao != null ? String(item.valorMinAplicacao) : null,
          fatorVerde: item.fatorVerde != null ? parseInt(item.fatorVerde) : null,
          confiancaVerde: item.confiancaVerde != null ? parseInt(item.confiancaVerde) : null,
          notas: item.notas ?? null,
          scoreAtratividade: scores.scoreAtratividade,
          scoreConfianca: scores.scoreConfianca,
          calmarRatio: scores.calmarRatio,
          scoreVerde: scores.scoreVerde,
          scoreDetalhado: scores.scoreDetalhado,
        }).returning();
        await audit(userId, "FUNDO_ADD_CANA", { fundoId: fundo.id, nome: fundo.nome }, req.ip ?? "");
        executado.push({ ok: true, acao: "ADD_FUNDO", fundo: { id: fundo.id, nome: fundo.nome, score: fundo.scoreAtratividade } });

      } else if (acao === "EDIT_FUNDO") {
        if (!isAdmin) { executado.push({ erro: "Sem permissão" }); continue; }
        const targetId = item.id ?? fundosExistentes.find(f => f.nome.toLowerCase().includes((item.nome ?? "").toLowerCase()))?.id;
        if (!targetId) { executado.push({ erro: `Fundo não encontrado: ${item.nome}` }); continue; }
        const scores = calcularScore(item);
        const updates: Record<string, any> = {};
        const fields = ["nome","gestora","classe","benchmark","taxaAdm","taxaPerformance","prazoResgateDias","sharpe12m","sortino12m","maxDrawdown","retorno12m","retorno36m","alfa36m","tempoRecuperacaoDias","volatilidade12m","valorMinAplicacao","fatorVerde","confiancaVerde","notas"];
        for (const f of fields) if (item[f] != null) updates[f] = f === "fatorVerde" || f === "confiancaVerde" ? parseInt(item[f]) : (typeof item[f] === "number" ? String(item[f]) : item[f]);
        updates.scoreAtratividade = scores.scoreAtratividade;
        updates.scoreConfianca = scores.scoreConfianca;
        updates.scoreDetalhado = scores.scoreDetalhado;
        updates.calmarRatio = scores.calmarRatio;
        updates.scoreVerde = scores.scoreVerde;
        await db.update(rapaduraFundosTable).set(updates).where(eq(rapaduraFundosTable.id, targetId));
        await audit(userId, "FUNDO_EDIT_CANA", { fundoId: targetId }, req.ip ?? "");
        executado.push({ ok: true, acao: "EDIT_FUNDO", fundoId: targetId });

      } else if (acao === "DELETE_FUNDO") {
        if (!isAdmin) { executado.push({ erro: "Sem permissão" }); continue; }
        const targetId = item.id ?? fundosExistentes.find(f => f.nome.toLowerCase().includes((item.nome ?? "").toLowerCase()))?.id;
        if (!targetId) { executado.push({ erro: `Fundo não encontrado: ${item.nome}` }); continue; }
        await db.update(rapaduraFundosTable).set({ ativo: false, updatedAt: new Date() }).where(eq(rapaduraFundosTable.id, targetId));
        await audit(userId, "FUNDO_DELETE_CANA", { fundoId: targetId }, req.ip ?? "");
        executado.push({ ok: true, acao: "DELETE_FUNDO", fundoId: targetId });

      } else if (acao === "ADD_PERTENCE") {
        // Buscar fundo pelo nome
        const busca = (item.fundoNome ?? item.nome ?? "").toLowerCase();
        let fundo = fundosExistentes.find(f => f.nome.toLowerCase().includes(busca));
        // Se não achou, buscar no DB completo
        if (!fundo) {
          const [found] = await db.select({ id: rapaduraFundosTable.id, nome: rapaduraFundosTable.nome, score: rapaduraFundosTable.scoreAtratividade })
            .from(rapaduraFundosTable).where(sql`lower(${rapaduraFundosTable.nome}) like ${"%" + busca + "%"}`)
            .limit(1);
          if (found) fundo = found;
        }
        // Se ainda não achou e isAdmin: criar o fundo
        if (!fundo) {
          if (!isAdmin) { executado.push({ erro: `Fundo não encontrado: "${item.fundoNome}". Peça ao admin para cadastrá-lo primeiro.` }); continue; }
          const scores = calcularScore(item);
          const [novoFundo] = await db.insert(rapaduraFundosTable).values({
            nome: item.fundoNome ?? item.nome ?? "Fundo sem nome",
            gestora: item.gestora ?? "Não informada",
            classe: item.classe ?? "Renda Fixa",
            benchmark: item.benchmark ?? "CDI",
            retorno12m: item.retorno12m != null ? String(item.retorno12m) : null,
            prazoResgateDias: item.prazoResgateDias ?? 0,
            notas: item.notas ?? null,
            scoreAtratividade: scores.scoreAtratividade,
            scoreConfianca: scores.scoreConfianca,
            scoreDetalhado: scores.scoreDetalhado,
          }).returning({ id: rapaduraFundosTable.id, nome: rapaduraFundosTable.nome, score: rapaduraFundosTable.scoreAtratividade });
          fundo = novoFundo;
          await audit(userId, "FUNDO_ADD_CANA_AUTO", { fundoId: fundo.id, nome: fundo.nome }, req.ip ?? "");
        }
        const hoje = new Date().toISOString().slice(0, 10);
        const [pertence] = await db.insert(rapaduraPertencesTable).values({
          userId,
          fundoId: fundo.id,
          dataCompra: item.dataCompra ?? hoje,
          valorInvestido: String(item.valorInvestido ?? 0),
          valorAtual: item.valorAtual != null ? String(item.valorAtual) : null,
          notas: item.notas ?? null,
        }).returning();
        await audit(userId, "PERTENCE_ADD_CANA", { pertenceId: pertence.id, fundoId: fundo.id, nome: fundo.nome }, req.ip ?? "");
        executado.push({ ok: true, acao: "ADD_PERTENCE", pertenceId: pertence.id, fundo: { id: fundo.id, nome: fundo.nome } });

      } else if (acao === "EDIT_PERTENCE") {
        if (!item.id) { executado.push({ erro: "ID do pertence obrigatório para edição" }); continue; }
        const updates: Record<string, any> = {};
        if (item.valorInvestido != null) updates.valorInvestido = String(item.valorInvestido);
        if (item.valorAtual != null) updates.valorAtual = String(item.valorAtual);
        if (item.dataCompra) updates.dataCompra = item.dataCompra;
        if (item.notas != null) updates.notas = item.notas;
        updates.updatedAt = new Date();
        await db.update(rapaduraPertencesTable).set(updates)
          .where(and(eq(rapaduraPertencesTable.id, item.id), eq(rapaduraPertencesTable.userId, userId)));
        await audit(userId, "PERTENCE_EDIT_CANA", { pertenceId: item.id }, req.ip ?? "");
        executado.push({ ok: true, acao: "EDIT_PERTENCE", pertenceId: item.id });

      } else if (acao === "DELETE_PERTENCE") {
        if (!item.id) { executado.push({ erro: "ID do pertence obrigatório para exclusão" }); continue; }
        await db.update(rapaduraPertencesTable).set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(and(eq(rapaduraPertencesTable.id, item.id), eq(rapaduraPertencesTable.userId, userId)));
        await audit(userId, "PERTENCE_DELETE_CANA", { pertenceId: item.id }, req.ip ?? "");
        executado.push({ ok: true, acao: "DELETE_PERTENCE", pertenceId: item.id });
      }
    } catch (e) {
      executado.push({ erro: String(e), item });
    }
  }

  res.json({ acao, resposta, executado, itens: itens.length });
});

// ─── Transações (I438 + histórico de motivos) ─────────────────────────────────

router.get("/rapadura/transacoes", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const pertenceId = req.query.pertenceId ? parseInt(String(req.query.pertenceId)) : null;

  const where = pertenceId
    ? and(eq(rapaduraTransacoesTable.userId, userId), eq(rapaduraTransacoesTable.pertenceId, pertenceId))
    : eq(rapaduraTransacoesTable.userId, userId);

  const transacoes = await db
    .select({
      id: rapaduraTransacoesTable.id,
      tipo: rapaduraTransacoesTable.tipo,
      valor: rapaduraTransacoesTable.valor,
      qtdCotas: rapaduraTransacoesTable.qtdCotas,
      dataTransacao: rapaduraTransacoesTable.dataTransacao,
      motivoI438: rapaduraTransacoesTable.motivoI438,
      status: rapaduraTransacoesTable.status,
      origem: rapaduraTransacoesTable.origem,
      notas: rapaduraTransacoesTable.notas,
      createdAt: rapaduraTransacoesTable.createdAt,
      pertenceId: rapaduraTransacoesTable.pertenceId,
      fundoId: rapaduraFundosTable.id,
      fundoNome: rapaduraFundosTable.nome,
    })
    .from(rapaduraTransacoesTable)
    .innerJoin(rapaduraFundosTable, eq(rapaduraTransacoesTable.fundoId, rapaduraFundosTable.id))
    .where(where)
    .orderBy(desc(rapaduraTransacoesTable.dataTransacao));

  res.json({ transacoes });
});

router.post("/rapadura/transacoes", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const { pertenceId, fundoId, tipo, valor, qtdCotas, dataTransacao, motivoI438, notas } =
    req.body as Record<string, any>;

  if (!fundoId || !tipo || !valor || !dataTransacao) {
    res.status(400).json({ error: "fundoId, tipo, valor e dataTransacao obrigatórios" });
    return;
  }

  // I438: motivo obrigatório para operações >= R$1.000
  if (Math.abs(Number(valor)) >= 1000 && !motivoI438?.trim()) {
    res.status(400).json({
      error: "Operação acima de R$1.000 exige justificativa no campo 'Por que estou fazendo isso?' (motivo I438).",
      campo: "motivoI438",
    });
    return;
  }

  const [transacao] = await db.insert(rapaduraTransacoesTable).values({
    userId,
    pertenceId: pertenceId ? parseInt(pertenceId) : null,
    fundoId: parseInt(fundoId),
    tipo,
    valor: String(valor),
    qtdCotas: qtdCotas ? String(qtdCotas) : null,
    dataTransacao,
    motivoI438: motivoI438 ?? null,
    status: "CONFIRMADO",
    origem: "MANUAL",
    notas: notas ?? null,
  }).returning();

  // Se é resgate parcial: atualizar totalRetirado e marcar pertence se necessário
  if ((tipo === "RESGATE_PARCIAL" || tipo === "RESGATE_TOTAL") && pertenceId) {
    const pId = parseInt(pertenceId);
    const [pertence] = await db.select().from(rapaduraPertencesTable).where(eq(rapaduraPertencesTable.id, pId)).limit(1);
    if (pertence) {
      const novoTotal = (Number(pertence.totalRetirado) || 0) + Math.abs(Number(valor));
      await db.update(rapaduraPertencesTable).set({
        totalRetirado: String(novoTotal),
        statusReconciliacao: tipo === "RESGATE_TOTAL" ? "EM_DIA" : "RECONCILIACAO_PENDENTE",
        updatedAt: new Date(),
      }).where(eq(rapaduraPertencesTable.id, pId));
    }
  }

  await audit(userId, "TRANSACAO_ADD", { transacaoId: transacao.id, tipo, valor }, req.ip ?? "");
  res.json({ transacao });
});

// Confirmar reconciliação de pertence (após informar parcial)
router.post("/rapadura/pertences/:id/reconciliar", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const id = parseInt(req.params.id ?? "0");
  const { valorRetiradoConfirmado } = req.body as { valorRetiradoConfirmado?: number };

  if (!valorRetiradoConfirmado) {
    res.status(400).json({ error: "valorRetiradoConfirmado obrigatório" });
    return;
  }

  await db.update(rapaduraPertencesTable).set({
    totalRetirado: String(valorRetiradoConfirmado),
    statusReconciliacao: "EM_DIA",
    updatedAt: new Date(),
  }).where(and(eq(rapaduraPertencesTable.id, id), eq(rapaduraPertencesTable.userId, userId)));

  await audit(userId, "PERTENCE_RECONCILIAR", { pertenceId: id, valorRetiradoConfirmado }, req.ip ?? "");
  res.json({ ok: true });
});

// ─── Histórico de cotas ───────────────────────────────────────────────────────

router.get("/rapadura/historico-cotas/:fundoId", requireRapaduraAuth, async (req, res) => {
  const fundoId = parseInt(req.params.fundoId ?? "0");
  const cotas = await db
    .select()
    .from(rapaduraHistoricoCotas)
    .where(eq(rapaduraHistoricoCotas.fundoId, fundoId))
    .orderBy(asc(rapaduraHistoricoCotas.data))
    .limit(365);
  res.json({ cotas });
});

router.post("/rapadura/historico-cotas", requireRapaduraAuth, requireAdmin, async (req, res) => {
  const { fundoId, data, valorCota, fonte } = req.body as Record<string, any>;
  if (!fundoId || !data || !valorCota) {
    res.status(400).json({ error: "fundoId, data e valorCota obrigatórios" });
    return;
  }
  const [cota] = await db.insert(rapaduraHistoricoCotas).values({
    fundoId: parseInt(fundoId),
    data,
    valorCota: String(valorCota),
    fonte: fonte ?? "MANUAL",
  }).onConflictDoUpdate({
    target: [rapaduraHistoricoCotas.fundoId, rapaduraHistoricoCotas.data],
    set: { valorCota: String(valorCota), fonte: fonte ?? "MANUAL" },
  }).returning();
  res.json({ cota });
});

// ─── Importar XP (CSV) ────────────────────────────────────────────────────────

// Parser do extrato XP: aceita conteúdo CSV como texto
function parseXpCsv(csvText: string): Array<{ data: string; descricao: string; valor: number; tipo: string }> {
  const linhas = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items: Array<{ data: string; descricao: string; valor: number; tipo: string }> = [];

  for (const linha of linhas) {
    // Separador pode ser ; ou ,
    const sep = linha.includes(";") ? ";" : ",";
    const cols = linha.split(sep).map(c => c.replace(/^"|"$/g, "").trim());

    // Detectar data no formato DD/MM/YYYY ou YYYY-MM-DD
    const dateRaw = cols[0] ?? "";
    let data = "";
    const dmatch = dateRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const ymatch = dateRaw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dmatch) data = `${dmatch[3]}-${dmatch[2]}-${dmatch[1]}`;
    else if (ymatch) data = dateRaw;
    else continue; // linha sem data reconhecida = cabeçalho ou irrelevante

    const descricao = cols[1] ?? "";

    // Valor: pode estar na coluna 2 (positivo) ou 3 (negativo), ou só coluna 2 com sinal
    const raw2 = (cols[2] ?? "").replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    const raw3 = (cols[3] ?? "").replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    let valor = parseFloat(raw2);
    if (isNaN(valor) || valor === 0) valor = parseFloat(raw3);
    if (isNaN(valor)) continue;

    // Inferir tipo pela descrição
    const desc = descricao.toLowerCase();
    let tipo = "AJUSTE";
    if (desc.includes("aplic") || desc.includes("compra") || desc.includes("subscri")) tipo = "COMPRA";
    else if (desc.includes("resgat") && desc.includes("parcial")) tipo = "RESGATE_PARCIAL";
    else if (desc.includes("resgat")) tipo = "RESGATE_TOTAL";
    else if (desc.includes("dividend") || desc.includes("rendimento") || desc.includes("jcp")) tipo = "DIVIDENDO";

    items.push({ data, descricao, valor, tipo });
  }
  return items;
}

// Preview: recebe CSV como texto, retorna itens detectados sem gravar
router.post("/rapadura/importar-xp", requireRapaduraAuth, async (req, res) => {
  const { csvTexto } = req.body as { csvTexto?: string };
  if (!csvTexto?.trim()) {
    res.status(400).json({ error: "csvTexto obrigatório (conteúdo do extrato XP)" });
    return;
  }

  const itens = parseXpCsv(csvTexto);
  if (itens.length === 0) {
    res.status(400).json({ error: "Nenhuma linha válida detectada. Verifique o formato do extrato." });
    return;
  }

  res.json({ preview: itens, total: itens.length });
});

// Confirmar importação: grava as transações escolhidas
router.post("/rapadura/importar-xp/confirmar", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const { itens, fundoId, pertenceId } = req.body as {
    itens?: Array<{ data: string; descricao: string; valor: number; tipo: string; motivoI438?: string }>;
    fundoId?: number;
    pertenceId?: number;
  };

  if (!itens?.length || !fundoId) {
    res.status(400).json({ error: "itens e fundoId obrigatórios" });
    return;
  }

  // Validar I438 para todos os itens >= R$1.000
  const semMotivo = itens.filter(it => Math.abs(it.valor) >= 1000 && !it.motivoI438?.trim());
  if (semMotivo.length > 0) {
    res.status(400).json({
      error: `${semMotivo.length} item(ns) acima de R$1.000 sem justificativa (I438). Preencha 'Por que estou fazendo isso?' para cada.`,
      itensSemMotivo: semMotivo.map(i => i.descricao),
    });
    return;
  }

  const gravadas = [];
  let totalRetiradoAcumulado = 0;

  for (const it of itens) {
    const [t] = await db.insert(rapaduraTransacoesTable).values({
      userId,
      pertenceId: pertenceId ?? null,
      fundoId,
      tipo: it.tipo,
      valor: String(it.valor),
      dataTransacao: it.data,
      motivoI438: it.motivoI438 ?? null,
      notas: it.descricao,
      status: "CONFIRMADO",
      origem: "XP_IMPORT",
    }).returning();
    gravadas.push(t);

    if (it.tipo === "RESGATE_PARCIAL" || it.tipo === "RESGATE_TOTAL") {
      totalRetiradoAcumulado += Math.abs(it.valor);
    }
  }

  // Atualizar totalRetirado do pertence se informado
  if (pertenceId && totalRetiradoAcumulado > 0) {
    const [pertence] = await db.select().from(rapaduraPertencesTable).where(eq(rapaduraPertencesTable.id, pertenceId)).limit(1);
    if (pertence) {
      const novoTotal = (Number(pertence.totalRetirado) || 0) + totalRetiradoAcumulado;
      await db.update(rapaduraPertencesTable).set({
        totalRetirado: String(novoTotal),
        statusReconciliacao: "EM_DIA",
        updatedAt: new Date(),
      }).where(eq(rapaduraPertencesTable.id, pertenceId));
    }
  }

  await audit(userId, "XP_IMPORT", { fundoId, itens: gravadas.length }, req.ip ?? "");
  res.json({ ok: true, gravadas: gravadas.length });
});

// ─── Relatório PDF ────────────────────────────────────────────────────────────

router.get("/rapadura/relatorio/pdf", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const userName = req.session.rapaduraNome ?? "Membro";
  const hoje = new Date().toLocaleDateString("pt-BR");

  const [pertences, fundos] = await Promise.all([
    db.select({
      id: rapaduraPertencesTable.id,
      dataCompra: rapaduraPertencesTable.dataCompra,
      valorInvestido: rapaduraPertencesTable.valorInvestido,
      valorAtual: rapaduraPertencesTable.valorAtual,
      totalRetirado: rapaduraPertencesTable.totalRetirado,
      statusReconciliacao: rapaduraPertencesTable.statusReconciliacao,
      notas: rapaduraPertencesTable.notas,
      fundoId: rapaduraFundosTable.id,
      fundoNome: rapaduraFundosTable.nome,
      fundoGestora: rapaduraFundosTable.gestora,
      fundoClasse: rapaduraFundosTable.classe,
      fundoBenchmark: rapaduraFundosTable.benchmark,
      fundoScore: rapaduraFundosTable.scoreAtratividade,
    })
      .from(rapaduraPertencesTable)
      .innerJoin(rapaduraFundosTable, eq(rapaduraPertencesTable.fundoId, rapaduraFundosTable.id))
      .where(and(eq(rapaduraPertencesTable.userId, userId), isNull(rapaduraPertencesTable.deletedAt)))
      .orderBy(desc(rapaduraPertencesTable.valorAtual)),
    db.select().from(rapaduraFundosTable).where(eq(rapaduraFundosTable.ativo, true)),
  ]);

  const fmtBRL = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  let totalInvestido = 0, totalAtual = 0, totalRetirado = 0;
  for (const p of pertences) {
    totalInvestido += Number(p.valorInvestido) || 0;
    totalAtual += Number(p.valorAtual) || Number(p.valorInvestido) || 0;
    totalRetirado += Number(p.totalRetirado) || 0;
  }
  const resultado = (totalAtual + totalRetirado) - totalInvestido;
  const rentabilidade = totalInvestido > 0 ? (resultado / totalInvestido) * 100 : 0;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="rapadura-${hoje.replace(/\//g, "-")}.pdf"`);

  const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: "Rapadura — Relatório Patrimonial" } });
  doc.pipe(res);

  const GOLD = "#c8963b";
  const DARK = "#1a1f2a";
  const GRAY = "#5a5650";

  // Cabeçalho
  doc.fontSize(22).fillColor(GOLD).font("Helvetica").text("Rapadura", 48, 48);
  doc.fontSize(9).fillColor(GRAY).font("Helvetica").text("MOTOR DE INTELIGÊNCIA PATRIMONIAL", 48, 74);
  doc.fontSize(9).fillColor(GRAY).text(`${userName}  ·  ${hoje}`, 48, 86);

  doc.moveTo(48, 102).lineTo(547, 102).strokeColor(DARK).lineWidth(0.5).stroke();

  // KPIs
  doc.moveDown(0.5);
  const kpis = [
    ["Total Investido", fmtBRL(totalInvestido)],
    ["Valor Atual", fmtBRL(totalAtual)],
    ["Total Retirado", fmtBRL(totalRetirado)],
    ["Resultado Total", `${resultado >= 0 ? "+" : ""}${fmtBRL(resultado)} (${rentabilidade >= 0 ? "+" : ""}${rentabilidade.toFixed(2)}%)`],
  ];

  let kx = 48;
  const ky = 116;
  for (const [label, value] of kpis) {
    doc.fontSize(7).fillColor(GRAY).text(label.toUpperCase(), kx, ky, { width: 120 });
    doc.fontSize(11).fillColor(resultado >= 0 || label !== "Resultado Total" ? "#ddd8d0" : "#9a4040")
      .font("Helvetica-Bold").text(value, kx, ky + 12, { width: 120 });
    doc.font("Helvetica");
    kx += 125;
  }

  doc.moveTo(48, 160).lineTo(547, 160).strokeColor(DARK).lineWidth(0.5).stroke();

  // Tabela de posições
  doc.moveDown(0.5);
  doc.y = 170;
  doc.fontSize(8).fillColor(GOLD).text("POSIÇÕES DA CARTEIRA", 48, doc.y);
  doc.moveDown(0.5);

  const headerY = doc.y;
  doc.fontSize(7).fillColor(GRAY);
  doc.text("FUNDO", 48, headerY, { width: 180 });
  doc.text("CLASSE", 232, headerY, { width: 70 });
  doc.text("INVESTIDO", 306, headerY, { width: 80, align: "right" });
  doc.text("ATUAL", 390, headerY, { width: 80, align: "right" });
  doc.text("RESULTADO", 474, headerY, { width: 73, align: "right" });
  doc.moveDown(0.3);
  doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor(DARK).lineWidth(0.3).stroke();
  doc.moveDown(0.3);

  for (const p of pertences) {
    if (doc.y > 720) { doc.addPage(); doc.y = 48; }

    const vi = Number(p.valorInvestido) || 0;
    const va = Number(p.valorAtual) || vi;
    const retiradoPdf = Number(p.totalRetirado) || 0;
    const res = (va + retiradoPdf) - vi;
    const rowY = doc.y;

    doc.fontSize(8).fillColor("#c5c0b8").font("Helvetica-Bold")
      .text(p.fundoNome.length > 28 ? p.fundoNome.slice(0, 27) + "…" : p.fundoNome, 48, rowY, { width: 180 });
    doc.font("Helvetica").fillColor(GRAY)
      .text(p.fundoGestora.length > 20 ? p.fundoGestora.slice(0, 19) + "…" : p.fundoGestora, 48, rowY + 10, { width: 180 });

    doc.fontSize(8).fillColor(GRAY).text(p.fundoClasse, 232, rowY, { width: 70 });
    doc.fillColor("#c5c0b8").text(fmtBRL(vi), 306, rowY, { width: 80, align: "right" });
    doc.text(fmtBRL(va), 390, rowY, { width: 80, align: "right" });
    doc.fillColor(res >= 0 ? "#3f7254" : "#9a4040")
      .text(`${res >= 0 ? "+" : ""}${fmtBRL(res)}`, 474, rowY, { width: 73, align: "right" });

    if (p.statusReconciliacao === "RECONCILIACAO_PENDENTE") {
      doc.fontSize(6).fillColor("#c8963b").text("⚠ reconciliação pendente", 232, rowY + 10, { width: 120 });
    }

    doc.y = rowY + 24;
    doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor(DARK).lineWidth(0.2).stroke();
    doc.moveDown(0.3);
  }

  // Rodapé
  doc.fontSize(7).fillColor(GRAY).text(
    "Rapadura · Motor de Inteligência Patrimonial · Sociedade Tucci · 2026  —  Documento confidencial.",
    48, 790, { width: 499, align: "center" }
  );

  doc.end();
  await audit(userId, "RELATORIO_PDF", { pertences: pertences.length }, req.ip ?? "");
});

export default router;
