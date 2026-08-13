import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { db } from "@workspace/db";
import { rapaduraUsersTable, rapaduraFundosTable, rapaduraPertencesTable, rapaduraAuditTable, rapaduraAprovacoesTable } from "@workspace/db";
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
}) {
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
    tempoRecuperacaoDias, volatilidade12m, retorno12m, retorno36m, alfa36m,
    fatorVerde, confiancaVerde, valorMinAplicacao, notas,
  } = req.body as Record<string, any>;

  if (!nome || !gestora) {
    res.status(400).json({ error: "nome e gestora obrigatórios" });
    return;
  }

  const scores = calcularScore({ sharpe12m, sortino12m, maxDrawdown, tempoRecuperacaoDias, retorno12m, retorno36m, taxaAdm, taxaPerformance, prazoResgateDias, temLinhaDAGua, alfa36m, fatorVerde, confiancaVerde });

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

  const scores = calcularScore({ sharpe12m, sortino12m, maxDrawdown, tempoRecuperacaoDias, retorno12m, retorno36m, taxaAdm, taxaPerformance, prazoResgateDias, temLinhaDAGua, alfa36m, fatorVerde, confiancaVerde });

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

  // Oportunidades fora da carteira com score > scoremédia + 15
  const oportunidades = fundos.filter(f => !idsNaCerteira.has(f.id) && Number(f.scoreAtratividade ?? 0) > scoreMedioCarters + 15);

  // Sugestões de troca: fundo da carteira com score < 50 → melhor fundo disponível
  const sugestoesTroca = pertences
    .filter(p => Number(p.fundoScore ?? 0) < 50)
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

{
  "acao": "ADD_FUNDO" | "EDIT_FUNDO" | "DELETE_FUNDO" | "ADD_PERTENCE" | "EDIT_PERTENCE" | "DELETE_PERTENCE" | "QUERY" | "CHAT",
  "itens": [  // array — pode ter múltiplos fundos na mesma mensagem
    {
      "id": <number ou null para ADD>,
      "nome": "string",
      "gestora": "string",
      "classe": "Renda Fixa"|"Multimercado"|"Ações"|"FII"|"Internacional"|"Criptoativos",
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
  "resposta": "mensagem amigável confirmando o que entendeu e vai fazer"
}

Regras:
- prazoResgate "D+0" = 0, "D+1" = 1, "D+2" = 2, etc
- "em até X dia(s)" → X dias
- Rentabilidade Bruta = retorno12m
- Aplicação mínima = valorMinAplicacao
- Se não tiver um campo, omita ou use null
- Para DELETE: só precisa de id ou nome
- Para QUERY ou CHAT: itens pode ser []
- Sempre extraia TODOS os fundos mencionados na mensagem em itens[]`;

router.post("/rapadura/cana", requireRapaduraAuth, async (req, res) => {
  const { message, history = [] } = req.body as { message: string; history?: any[] };
  if (!message) { res.status(400).json({ error: "message obrigatório" }); return; }

  const userId = req.session.rapaduraUserId!;
  const userRole = req.session.rapaduraRole as string;
  const isAdmin = userRole === "yuri" || userRole === "mayumi" || userRole === "admin";

  // Buscar fundos existentes para contexto
  const fundosExistentes = await db.select({
    id: rapaduraFundosTable.id,
    nome: rapaduraFundosTable.nome,
    gestora: rapaduraFundosTable.gestora,
    score: rapaduraFundosTable.scoreAtratividade,
  }).from(rapaduraFundosTable).where(eq(rapaduraFundosTable.ativo, true)).limit(30);

  const contextoFundos = fundosExistentes.map(f => `ID${f.id}: ${f.nome} (${f.gestora}) score=${f.score}`).join("\n");

  const systemWithContext = CANA_SYSTEM + `\n\nFundos já cadastrados:\n${contextoFundos || "(nenhum ainda)"}`;

  // Chamar Gemini via routeLLM
  let rawJson = "";
  try {
    const msgs: any[] = [
      { role: "system", content: systemWithContext },
      ...history.slice(-4).map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];
    rawJson = await routeLLM({ messages: msgs, maxTokens: 1200 });
  } catch (e) {
    res.status(500).json({ error: "Erro ao chamar IA", details: String(e) }); return;
  }

  // Parse JSON da resposta
  let parsed: any;
  try {
    const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? rawJson);
  } catch {
    res.json({ acao: "CHAT", resposta: rawJson, executado: [] }); return;
  }

  const { acao, itens = [], resposta } = parsed;
  const executado: any[] = [];

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
      }
    } catch (e) {
      executado.push({ erro: String(e), item });
    }
  }

  res.json({ acao, resposta, executado, itens: itens.length });
});

export default router;
