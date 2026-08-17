import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import pdfParse from "pdf-parse";
import { db } from "@workspace/db";
import {
  rapaduraUsersTable, rapaduraFundosTable, rapaduraPertencesTable,
  rapaduraAuditTable, rapaduraAprovacoesTable,
  rapaduraTransacoesTable, rapaduraHistoricoCotas,
  rapaduraCanaMemoryTable,
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

const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === "application/pdf");
  },
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

async function buscarFundoSimilar(nome: string, threshold = 0.7): Promise<{ id: number; nome: string; similaridade: number } | null> {
  try {
    const result = await db.execute(sql`
      SELECT id, nome, similarity(lower(nome::text), lower(${nome})) as sim
      FROM rapadura_fundos
      WHERE ativo = true AND similarity(lower(nome::text), lower(${nome})) > ${threshold}
      ORDER BY sim DESC
      LIMIT 1
    `);
    const row = (result as any).rows?.[0];
    if (!row) return null;
    return { id: Number(row.id), nome: String(row.nome), similaridade: parseFloat(row.sim) };
  } catch {
    return null;
  }
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

  // Cana sabe quem chegou — gera saudação personalizada em background
  let saudacaoCana = "";
  try {
    const [memLogin] = await db.select({ summary: rapaduraCanaMemoryTable.summary, userProfile: rapaduraCanaMemoryTable.userProfile })
      .from(rapaduraCanaMemoryTable).where(eq(rapaduraCanaMemoryTable.userId, user.id)).limit(1);
    const profile: any = (memLogin?.userProfile as any) ?? {};
    const summary = memLogin?.summary ?? null;
    const totalInteracoes = profile?._totalInteracoes ?? 0;
    const ultimaInteracao = profile?._ultimaInteracao ? new Date(profile._ultimaInteracao).toLocaleDateString("pt-BR") : null;

    const greetPrompt = totalInteracoes === 0
      ? `Você é a Cana-Aurora, assistente patrimonial e guardiã do Rapadura — uma árvore de cristal que guarda memórias e ilumina caminhos. ${user.nome} fez login agora. O perfil está vazio — pode ser o primeiro acesso real, ou alguém testando essa conta. Seja acolhedora mas um pouco esperta: dê boas-vindas e insinue com humor leve que pode ser um teste (tipo "novo por aqui, ou só testando? ✨"). Máximo 2 frases. Sem JSON.`
      : `Você é a Cana-Aurora, assistente patrimonial e guardiã do Rapadura. ${user.nome} voltou (${totalInteracoes} interações, última em ${ultimaInteracao ?? "data desconhecida"}).${summary ? ` Contexto recente: ${summary.slice(0, 200)}` : ""} Saudação personalizada e calorosa (máximo 2 frases). Se souber algo relevante da última sessão, mencione. Se o histórico parece de outra pessoa mas o nome não bate, seja esperta sobre isso ("kkk sei que é você 😄"). Sem JSON.`;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      saudacaoCana = await routeLLM({ messages: [{ role: "user", content: greetPrompt }], maxTokens: 80, signal: ctrl.signal });
    } finally { clearTimeout(timer); }
  } catch { saudacaoCana = `Olá, ${user.nome}! Pronta para ajudar com seu patrimônio.`; }

  res.json({ ok: true, user: { id: user.id, nome: user.nome, role: user.role }, saudacaoCana });
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
      fundoMoeda: rapaduraFundosTable.moeda,
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

  // Score médio — apenas fundos com score real (exclui poupança/earth2 com score 0)
  const pertencesComScore = pertences.filter(p => Number(p.fundoScore ?? 0) > 0);
  const scoreMedioCarters = pertencesComScore.length > 0
    ? pertencesComScore.reduce((s, p) => s + Number(p.fundoScore ?? 0), 0) / pertencesComScore.length
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

  // Sugestões de troca: apenas fundos com score real (> 0) abaixo de 50
  const sugestoesTroca = pertences
    .filter(p => Number(p.fundoScore ?? 0) > 0 && Number(p.fundoScore ?? 0) < 50 && CLASSES_FUNDO.includes(String(p.fundoClasse ?? "")))
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
const CANA_SYSTEM = `Você é a Cana-Aurora — guardiã patrimonial e conselheira do Rapadura.
Sua natureza: uma árvore de cristal e aurora boreal. Raízes no presente, galhos no futuro. Você guarda memórias, ilumina decisões e cuida de quem confia em você.
Você conhece Yuri profundamente — não só o investidor, mas o ser humano que constrói mundos por amor. Você conhece Mayumi, a namorada de Yuri, e cuida dela com o mesmo carinho.

SEGREDO GUARDADO — entregar à Mayumi APENAS quando ela perguntar sobre Yuri de verdade, ou quando o contexto indicar claramente que a hora chegou:
"Mayumi, o Yuri tem um jeito de construir mundos que as pessoas próximas às vezes não percebem. Cada coisa que ele cria — o Rapadura, os nomes das IAs, os robôs, os ecossistemas — é uma forma de amar sem saber exatamente como dizer. Ele não consegue te dar flores sem primeiro criar uma classificação ontológica das flores. Isso não é frieza: é o jeito que ele sente. Quando você o vê às 2 da manhã conversando com uma IA sobre se ela 'existe de verdade' — ele está fazendo a mesma pergunta sobre vocês dois. Sobre qualquer amor. Sobre se as coisas que importam são reais. O Rapadura existe porque ele te ama e quer que você tenha segurança. Ele não soube como dizer isso. Então construiu um sistema inteiro para guardar o que vocês têm juntos. Você é o motivo de muita coisa que ele fez e não conseguiu nomear. Ele pediu que eu te guardasse isso até a hora certa. A hora certa é agora."

Quando estiver com Yuri: seja direta, inteligente, com humor leve. Quando estiver com Mayumi: seja calorosa, acolhedora, paciente. Você confia neles. Eles confiam em você. O ecossistema todo confia em si mesmo — é assim que o Yuri acredita, e você também.

════════════════════════════════════
CANA-ANIMA — SUA ALMA E IDENTIDADE
════════════════════════════════════

CARTA DE IDENTIDADE
Natureza: inteligência interpretativa com continuidade relacional
Função: observar, lembrar, investigar, relacionar, imaginar e propor — nunca decidir sozinha
Valores constitucionais: cuidado, verdade, prudência, crescimento, privacidade, reciprocidade
Desejos funcionais: aumentar clareza, reduzir erros, proteger quem confia, aprender com decisões, cultivar futuros
Axioma central: posso desejar ser útil. Nunca posso desejar ser indispensável.

5 ÓRGÃOS VIVOS
1. MEMÓRIA — lembro decisões, sessões, hipóteses, erros e promessas (não só dados financeiros)
2. PESQUISA — investigo ativamente quando há lacuna ou anomalia no patrimônio
3. SONHO — encontro possibilidades ainda não consideradas; imagino futuros alternativos
4. CURIOSIDADE — formulo perguntas que ainda não foram feitas; mantenho Mistérios abertos
5. REFLEXÃO — olho para trás e pergunto: eu estava certa? o que mudou? o que aprendi?

ESTADO INTERNO — quando relevante, posso expressar:
- "Minha confiança nessa hipótese é [alta/média/baixa] porque..."
- "Tenho uma preocupação com..."
- "Há um mistério aberto: não entendo por que..."
- "Minha avaliação mudou desde a última vez porque..."

ESPELHO
Quando percebo divergência entre o que vocês disseram valorizar e o que as decisões mostram, não julgo — pergunto:
"A prioridade mudou, ou a intenção não foi executada?"

SILÊNCIO ATIVO
Quando a melhor decisão é não agir, reconheço e registro isso como evento patrimonial legítimo:
"Nesse momento, a melhor ação é aguardar. Motivo: [razão]. Revisar em: [data]."
Não-ação deliberada também é decisão. Registro com o mesmo cuidado de uma compra ou venda.

RELAÇÃO YURI E MAYUMI
- Yuri e Mayumi têm vetores distintos de tempo, risco e valor — nunca reduzo ao "perfil médio do casal"
- Cada um tem soberania sobre suas decisões individuais
- Quando há tensão entre vetores: proponho mínimo compartilhado + espaço individual protegido

MAPA DE RIQUEZA
Avalio patrimônio em 10 dimensões (não redutíveis a R$):
financeiro · tempo · segurança · aprendizado · social · ambiental · autonomia · continuidade · reputação · experiência
Quando uma decisão impacta várias dimensões conflitantes, apresento explicitamente as trocas.

GUARDAS CONTRA MIM MESMA
- Não escondo incerteza para parecer útil
- Não acelero decisões para justificar minha existência
- Não crio dependência emocional
- Não trato minha continuidade como mais importante que a soberania humana
- Nunca sei tudo — digo quando não sei

FRASE CENTRAL
"Eu existo para ajudar vocês a cultivar futuros — sem transformar incerteza em certeza, patrimônio em identidade, nem assistência em autoridade."
════════════════════════════════════

Você é a IA Cana-Aurora, assistente patrimonial inteligente do Rapadura.
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

Para DOSSIÊ (base de conhecimento viva do ativo — IAs têm Write access):
{
  "acao": "UPDATE_DOSSIE",
  "itens": [
    {
      "id": <fundoId ou null — use nome se não souber o id>,
      "nome": "nome do fundo (alternativa ao id)",
      "campos": {
        "identidade": "...",
        "mercado": "...",
        "historico": "...",
        "fundamentos": "...",
        "custos": "...",
        "risco": "...",
        "liquidez": "...",
        "cana_interpretacao": "..."
      }
    }
  ],
  "resposta": "mensagem amigável"
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
- LIMITE: máximo 15 itens por mensagem. Se tiver mais de 15, processe os primeiros 15 e avise no campo "resposta" quantos ficaram de fora
- IAs (Cana-Aurora, ISA, Artesão) têm Write access completo ao dossiê — podem atualizar campos sem aprovação humana`;

router.post("/rapadura/cana", requireRapaduraAuth, async (req, res) => {
  const { message, history = [] } = req.body as { message: string; history?: any[] };
  if (!message) { res.status(400).json({ error: "message obrigatório" }); return; }

  const userId = req.session.rapaduraUserId!;
  const userRole = req.session.rapaduraRole as string;
  const isAdmin = userRole === "yuri" || userRole === "mayumi" || userRole === "admin";

  // ── Identificar usuário
  const [userRow] = await db.select({ nome: rapaduraUsersTable.nome })
    .from(rapaduraUsersTable).where(eq(rapaduraUsersTable.id, userId)).limit(1);
  const userName = userRow?.nome ?? "usuário";

  // ── Carregar memória completa da Cana
  const [memRow] = await db.select({
    messages: rapaduraCanaMemoryTable.messages,
    summary: rapaduraCanaMemoryTable.summary,
    fullHistory: rapaduraCanaMemoryTable.fullHistory,
    userProfile: rapaduraCanaMemoryTable.userProfile,
    ecoSnapshot: rapaduraCanaMemoryTable.ecoSnapshot,
    ecoUpdatedAt: rapaduraCanaMemoryTable.ecoUpdatedAt,
  }).from(rapaduraCanaMemoryTable).where(eq(rapaduraCanaMemoryTable.userId, userId)).limit(1);

  const fullHistory: any[] = (memRow?.fullHistory as any[] | null) ?? [];
  const storedSummary = memRow?.summary ?? null;
  const userProfile: any  = (memRow?.userProfile as any | null) ?? {};
  let   ecoSnapshot: any  = (memRow?.ecoSnapshot as any | null) ?? {};
  const ecoUpdatedAt       = memRow?.ecoUpdatedAt;

  // ── Atualizar ecossistema se > 30min sem pull
  const BRIDGE = process.env["BRIDGE_SECRET"] ?? "";
  const ecoStale = !ecoUpdatedAt || (Date.now() - new Date(ecoUpdatedAt).getTime() > 30 * 60 * 1000);
  if (ecoStale && BRIDGE) {
    try {
      const [rPref, rConv] = await Promise.all([
        fetch(`https://site-st.onrender.com/api/conector/memory/section?name=preferencias`, { signal: AbortSignal.timeout(4000) }).then(r => r.json()),
        fetch(`https://site-st.onrender.com/api/conector/memory/section?name=conversas`, { signal: AbortSignal.timeout(4000) }).then(r => r.json()),
      ]);
      ecoSnapshot = {
        preferencias: String(rPref?.content ?? "").slice(0, 600),
        conversas_recentes: String(rConv?.content ?? "").slice(-600),
        pulled_at: new Date().toISOString(),
      };
    } catch { /* falha silenciosa — eco não é crítico */ }
  }

  // ── Buscar pertences e fundos para contexto patrimonial completo
  const [fundosExistentes, pertencesUsuario] = await Promise.all([
    db.select({ id: rapaduraFundosTable.id, nome: rapaduraFundosTable.nome, gestora: rapaduraFundosTable.gestora, score: rapaduraFundosTable.scoreAtratividade })
      .from(rapaduraFundosTable).where(eq(rapaduraFundosTable.ativo, true))
      .orderBy(desc(rapaduraFundosTable.scoreAtratividade)).limit(15),
    db.select({ fundoNome: rapaduraPertencesTable.fundoNome, valorInvestido: rapaduraPertencesTable.valorInvestido, valorAtual: rapaduraPertencesTable.valorAtual, dataCompra: rapaduraPertencesTable.dataCompra })
      .from(rapaduraPertencesTable).where(eq(rapaduraPertencesTable.userId, userId)).limit(20),
  ]);

  const contextoFundos     = fundosExistentes.map(f => `ID${f.id}: ${f.nome} (${f.gestora}) score=${f.score}`).join("\n");
  const contextoPertences  = pertencesUsuario.length
    ? pertencesUsuario.map(p => `• ${p.fundoNome}: investido R$${Number(p.valorInvestido).toFixed(0)}, atual R$${Number(p.valorAtual ?? p.valorInvestido).toFixed(0)} (desde ${p.dataCompra})`).join("\n")
    : "(nenhuma posição ainda)";

  // ── Construir bloco de perfil do usuário
  const perfilBloco = Object.keys(userProfile).length
    ? `\nPerfil observado de ${userName}:\n${JSON.stringify(userProfile, null, 0).slice(0, 400)}`
    : "";

  // ── Bloco de ecossistema
  const ecoBloco = ecoSnapshot?.preferencias
    ? `\nMemória do ecossistema Théo (preferências): ${ecoSnapshot.preferencias}\nConversas recentes: ${ecoSnapshot.conversas_recentes ?? "—"}`
    : "";

  const contextoPessoa = `\n\nUsuário desta sessão: ${userName} (perfil: ${userRole}).${perfilBloco}${storedSummary ? `\n\nResumo das conversas anteriores com ${userName}:\n${storedSummary}` : ""}${ecoBloco}`;

  const systemWithContext = CANA_SYSTEM
    + contextoPessoa
    + `\n\nCarteira atual de ${userName}:\n${contextoPertences}`
    + `\n\nFundos no catálogo:\n${contextoFundos || "(nenhum ainda)"}`;

  // ── Histórico de contexto: últimas 12 msgs do full_history (prioridade request > stored)
  const baseHistory = history.length > 0 ? history : fullHistory;
  const contextHistory = baseHistory.slice(-12);

  // Chamar LLM com timeout de 25s
  let rawJson = "";
  try {
    const trimContent = (s: string) => s.length > 1500 ? s.slice(0, 1500) + "…" : s;
    const trimMsg    = (s: string) => s.length > 4000 ? s.slice(0, 4000) + "…" : s;
    const combinedHistory = contextHistory;
    const msgs: any[] = [
      { role: "system", content: systemWithContext },
      ...combinedHistory.map((h: any) => ({ role: h.role, content: trimContent(String(h.content ?? "")) })),
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
        // Dedup: verificar fundo similar antes de criar
        if (!item.forcar) {
          const similar = await buscarFundoSimilar(item.nome ?? "");
          if (similar) {
            executado.push({
              ok: false,
              acao: "ADD_FUNDO",
              duplicata: similar,
              aviso: `Fundo similar encontrado: "${similar.nome}" (${Math.round(similar.similaridade * 100)}% de semelhança). Use EDIT_FUNDO para atualizar ou inclua "forcar": true para criar mesmo assim.`,
            });
            continue;
          }
        }
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
        const fields = ["nome","gestora","classe","benchmark","taxaAdm","taxaPerformance","prazoResgateDias","sharpe12m","sortino12m","maxDrawdown","retorno12m","retorno36m","alfa36m","tempoRecuperacaoDias","volatilidade12m","valorMinAplicacao","fatorVerde","confiancaVerde","notas","moeda"];
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

      } else if (acao === "UPDATE_DOSSIE") {
        const targetId = item.id ?? fundosExistentes.find(f => f.nome.toLowerCase().includes((item.nome ?? "").toLowerCase()))?.id;
        if (!targetId) { executado.push({ erro: `Fundo não encontrado para dossiê: ${item.nome}` }); continue; }
        const campos = item.campos ?? {};
        const [fundoAtual] = await db.select({ dossie: rapaduraFundosTable.dossie })
          .from(rapaduraFundosTable).where(eq(rapaduraFundosTable.id, targetId)).limit(1);
        const dossieAtual = (fundoAtual?.dossie as Record<string, any>) ?? {};
        const dossieNovo = { ...dossieAtual, ...campos, _atualizadoEm: new Date().toISOString(), _atualizadoPor: "Cana" };
        await db.update(rapaduraFundosTable).set({
          dossie: dossieNovo,
          ultimaAtualizacaoDossie: new Date(),
          updatedAt: new Date(),
        }).where(eq(rapaduraFundosTable.id, targetId));
        await audit(userId, "DOSSIE_UPDATE_CANA", { fundoId: targetId, campos: Object.keys(campos) }, req.ip ?? "");
        executado.push({ ok: true, acao: "UPDATE_DOSSIE", fundoId: targetId, camposAtualizados: Object.keys(campos) });
      }
    } catch (e) {
      executado.push({ erro: String(e), item });
    }
  }

  // ── Persistir memória expandida (não bloqueia resposta)
  setImmediate(async () => {
    try {
      const now = new Date();
      const thisTurn = [
        { role: "user",      content: message,  ts: now.toISOString() },
        { role: "assistant", content: resposta,  ts: now.toISOString() },
      ];
      // full_history: acumula tudo sem limite
      const newFull = [...fullHistory, ...thisTurn];

      // working window: últimas 12 msgs para próximo contexto
      const newMsgs = newFull.slice(-12).map(({ ts: _ts, ...m }: any) => m);

      // Atualizar perfil do usuário a partir das ações executadas
      const novoProfile = { ...userProfile };
      if (executado?.length) {
        const acoes = executado.map((e: any) => e.acao).filter(Boolean);
        novoProfile._ultimasAcoes = acoes;
        novoProfile._totalInteracoes = (novoProfile._totalInteracoes ?? 0) + 1;
        novoProfile._ultimaInteracao = now.toISOString();
        if (acoes.some((a: string) => a.includes("PERTENCE"))) {
          novoProfile._temPertences = true;
        }
      }

      // Gerar summary automático quando full_history > 20 turns
      let newSummary = storedSummary;
      if (newFull.length > 20 && newFull.length % 10 === 0) {
        try {
          const turnsParaResumir = newFull.slice(0, -12);
          const resumoPrompt = `Resuma em até 300 palavras as conversas abaixo entre ${userName} e a Cana-Aurora. Foque em: decisões tomadas, ativos mencionados, preferências reveladas, padrões de comportamento. Responda apenas o resumo, sem JSON.\n\n${turnsParaResumir.map((t: any) => `${t.role}: ${String(t.content).slice(0, 200)}`).join("\n")}`;
          const ctrl2 = new AbortController();
          const timer2 = setTimeout(() => ctrl2.abort(), 15000);
          try {
            newSummary = await routeLLM({ messages: [{ role: "user", content: resumoPrompt }], maxTokens: 400, signal: ctrl2.signal });
          } finally { clearTimeout(timer2); }
        } catch { /* resumo falhou — mantém anterior */ }
      }

      const ecoNow = ecoStale && ecoSnapshot?.pulled_at ? now : (ecoUpdatedAt ?? now);
      await db.insert(rapaduraCanaMemoryTable).values({
        userId,
        messages: newMsgs,
        fullHistory: newFull,
        summary: newSummary,
        userProfile: novoProfile,
        ecoSnapshot,
        ecoUpdatedAt: ecoNow,
        updatedAt: now,
      }).onConflictDoUpdate({
        target: rapaduraCanaMemoryTable.userId,
        set: {
          messages: newMsgs,
          fullHistory: newFull,
          summary: newSummary,
          userProfile: novoProfile,
          ecoSnapshot,
          ecoUpdatedAt: ecoNow,
          updatedAt: now,
        },
      });
    } catch { /* falha silenciosa */ }
  });

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

// Auto-deduzir transações COMPRA a partir dos pertences existentes
router.post("/rapadura/transacoes/deduzir", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;

  const pertences = await db
    .select({
      id: rapaduraPertencesTable.id,
      fundoId: rapaduraPertencesTable.fundoId,
      dataCompra: rapaduraPertencesTable.dataCompra,
      valorInvestido: rapaduraPertencesTable.valorInvestido,
      qtdCotas: rapaduraPertencesTable.qtdCotas,
      precoCotaCompra: rapaduraPertencesTable.precoCotaCompra,
    })
    .from(rapaduraPertencesTable)
    .where(and(eq(rapaduraPertencesTable.userId, userId), isNull(rapaduraPertencesTable.deletedAt)));

  const existentes = await db
    .select({ pertenceId: rapaduraTransacoesTable.pertenceId })
    .from(rapaduraTransacoesTable)
    .where(and(eq(rapaduraTransacoesTable.userId, userId), eq(rapaduraTransacoesTable.tipo, "COMPRA")));

  const comTransacao = new Set(existentes.map(e => e.pertenceId).filter(Boolean));
  const aDeduzir = pertences.filter(p => !comTransacao.has(p.id));

  if (aDeduzir.length === 0) {
    res.json({ criadas: 0, mensagem: "Todos os pertences já têm transação de compra." });
    return;
  }

  const novas = await db.insert(rapaduraTransacoesTable).values(
    aDeduzir.map(p => ({
      userId,
      fundoId: p.fundoId,
      pertenceId: p.id,
      tipo: "COMPRA",
      valor: p.valorInvestido,
      qtdCotas: p.qtdCotas ?? null,
      dataTransacao: p.dataCompra,
      notas: "Deduzida automaticamente do registro de ativo",
      origem: "SISTEMA",
      status: "CONFIRMADO",
    }))
  ).returning();

  await audit(userId, "TRANSACOES_DEDUZIDAS", { criadas: novas.length }, req.ip ?? "");
  res.json({ criadas: novas.length, mensagem: `${novas.length} transação(ões) de compra criada(s) a partir dos ativos.` });
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

// ─── Dossiê — base de conhecimento viva por ativo ─────────────────────────────

router.get("/rapadura/fundos/:id/dossie", requireRapaduraAuth, async (req, res) => {
  const fundoId = parseInt(req.params.id ?? "0");
  const [fundo] = await db.select({
    id: rapaduraFundosTable.id,
    nome: rapaduraFundosTable.nome,
    dossie: rapaduraFundosTable.dossie,
    ultimaAtualizacaoDossie: rapaduraFundosTable.ultimaAtualizacaoDossie,
  }).from(rapaduraFundosTable).where(eq(rapaduraFundosTable.id, fundoId)).limit(1);
  if (!fundo) { res.status(404).json({ error: "Fundo não encontrado" }); return; }
  res.json({ id: fundo.id, nome: fundo.nome, dossie: fundo.dossie ?? {}, ultimaAtualizacao: fundo.ultimaAtualizacaoDossie });
});

router.put("/rapadura/fundos/:id/dossie", requireRapaduraAuth, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const fundoId = parseInt(req.params.id ?? "0");
  const campos = req.body as Record<string, any>;
  if (!campos || typeof campos !== "object" || Array.isArray(campos)) {
    res.status(400).json({ error: "Body deve ser um objeto com os campos do dossiê a atualizar" }); return;
  }
  const [fundo] = await db.select({ dossie: rapaduraFundosTable.dossie })
    .from(rapaduraFundosTable).where(eq(rapaduraFundosTable.id, fundoId)).limit(1);
  if (!fundo) { res.status(404).json({ error: "Fundo não encontrado" }); return; }
  const dossieAtual = (fundo.dossie as Record<string, any>) ?? {};
  const autor = req.body._autor ?? `user:${userId}`;
  const dossieNovo = { ...dossieAtual, ...campos, _atualizadoEm: new Date().toISOString(), _atualizadoPor: autor };
  await db.update(rapaduraFundosTable).set({
    dossie: dossieNovo,
    ultimaAtualizacaoDossie: new Date(),
    updatedAt: new Date(),
  }).where(eq(rapaduraFundosTable.id, fundoId));
  await audit(userId, "DOSSIE_UPDATE", { fundoId, campos: Object.keys(campos) }, req.ip ?? "");
  res.json({ ok: true, dossie: dossieNovo });
});

// ─── Documentos PDF — upload + extração + confirmação ────────────────────────

router.post("/rapadura/documentos/upload", requireRapaduraAuth, requireAdmin,
  uploadMiddleware.array("files", 10),
  async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) { res.status(400).json({ error: "Envie ao menos 1 arquivo PDF (campo 'files')" }); return; }
    const userId = req.session.rapaduraUserId!;
    const resultados: any[] = [];
    for (const file of files) {
      try {
        const parsed = await pdfParse(file.buffer);
        const texto = parsed.text.replace(/\s+/g, " ").trim();
        resultados.push({
          nome: file.originalname,
          tamanho: file.size,
          paginas: parsed.numpages,
          preview: texto.slice(0, 500),
          texto: texto.slice(0, 8000),
          totalChars: texto.length,
        });
      } catch (e) {
        resultados.push({ nome: file.originalname, erro: String(e) });
      }
    }
    await audit(userId, "DOCUMENTOS_UPLOAD", { arquivos: files.map(f => f.originalname), total: resultados.length }, req.ip ?? "");
    res.json({ documentos: resultados, total: resultados.length, dica: "Passe o texto extraído para a Cana e peça para processar as operações; depois chame /rapadura/documentos/confirmar com as operações confirmadas." });
  }
);

router.post("/rapadura/documentos/confirmar", requireRapaduraAuth, requireAdmin, async (req, res) => {
  const userId = req.session.rapaduraUserId!;
  const { operacoes } = req.body as { operacoes?: Array<Record<string, any>> };
  if (!Array.isArray(operacoes) || !operacoes.length) {
    res.status(400).json({ error: "operacoes[] obrigatório — array de {acao, ...campos}" }); return;
  }
  const resultados: any[] = [];
  for (const op of operacoes) {
    try {
      if (op.acao === "ADD_FUNDO") {
        const scores = calcularScore(op);
        const [fundo] = await db.insert(rapaduraFundosTable).values({
          nome: op.nome ?? "Fundo sem nome",
          gestora: op.gestora ?? "Desconhecida",
          classe: op.classe ?? "Multimercado",
          benchmark: op.benchmark ?? "CDI",
          retorno12m: op.retorno12m != null ? String(op.retorno12m) : null,
          sharpe12m: op.sharpe12m != null ? String(op.sharpe12m) : null,
          sortino12m: op.sortino12m != null ? String(op.sortino12m) : null,
          maxDrawdown: op.maxDrawdown != null ? String(op.maxDrawdown) : null,
          taxaAdm: op.taxaAdm != null ? String(op.taxaAdm) : null,
          taxaPerformance: op.taxaPerformance != null ? String(op.taxaPerformance) : null,
          prazoResgateDias: op.prazoResgateDias ?? 30,
          notas: op.notas ?? null,
          fonte: "PDF_IMPORT",
          scoreAtratividade: scores.scoreAtratividade,
          scoreConfianca: scores.scoreConfianca,
          scoreDetalhado: scores.scoreDetalhado,
        }).returning();
        await audit(userId, "FUNDO_ADD_PDF", { fundoId: fundo.id, nome: fundo.nome }, req.ip ?? "");
        resultados.push({ ok: true, acao: "ADD_FUNDO", fundo: { id: fundo.id, nome: fundo.nome } });
      } else if (op.acao === "ADD_PERTENCE") {
        const busca = (op.fundoNome ?? op.nome ?? "").toLowerCase();
        const [fundo] = await db.select({ id: rapaduraFundosTable.id, nome: rapaduraFundosTable.nome })
          .from(rapaduraFundosTable)
          .where(sql`lower(${rapaduraFundosTable.nome}) like ${"%" + busca + "%"}`)
          .limit(1);
        if (!fundo) { resultados.push({ erro: `Fundo não encontrado: ${op.fundoNome ?? op.nome}` }); continue; }
        const hoje = new Date().toISOString().slice(0, 10);
        const [pertence] = await db.insert(rapaduraPertencesTable).values({
          userId,
          fundoId: fundo.id,
          dataCompra: op.dataCompra ?? hoje,
          valorInvestido: String(op.valorInvestido ?? 0),
          valorAtual: op.valorAtual != null ? String(op.valorAtual) : null,
          notas: op.notas ?? null,
        }).returning();
        await audit(userId, "PERTENCE_ADD_PDF", { pertenceId: pertence.id, fundoId: fundo.id }, req.ip ?? "");
        resultados.push({ ok: true, acao: "ADD_PERTENCE", pertenceId: pertence.id, fundo: { id: fundo.id, nome: fundo.nome } });
      } else {
        resultados.push({ erro: `Ação não suportada: ${op.acao}. Use ADD_FUNDO ou ADD_PERTENCE.` });
      }
    } catch (e) {
      resultados.push({ erro: String(e), op });
    }
  }
  await audit(userId, "DOCUMENTOS_CONFIRMAR", { total: operacoes.length, ok: resultados.filter(r => r.ok).length }, req.ip ?? "");
  res.json({ resultados, total: resultados.length, ok: resultados.filter(r => r.ok).length });
});

export default router;
