import { Router } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@workspace/db";
import { isaMemoryTable, tasksTable, insertIsaMemorySchema, isaTimeline } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { runIsaCycle } from "../isa/cycle";
import { runBibliotecario } from "../isa/bibliotecario";
import { runIsaBluesky, createBlueskyAccount, runIsaEngagement } from "../isa/bluesky";
import { runIsaDream } from "../isa/dream";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";
import { responderRodar } from "../isa/rodar";
import { sanitizeExternalInput } from "../lib/sanitize-external";
import { logger } from "../lib/logger";

const router = Router();
const OPENAI_API_KEY  = process.env["OPENAI_API_KEY"]  ?? "";
const GEMINI_API_KEY  = process.env["GEMINI_API_KEY"]  ?? "";
const ARVORE_TOKEN    = process.env["ARVORE_TOKEN"]     ?? "";
const AI_API_KEY      = process.env["AI_API_KEY"]       ?? "";

// Auth helper: sessão tier 5, AI_API_KEY, ou Árvore (inter-agente)
function isAssemblyAgent(req: Parameters<Parameters<typeof router.get>[1]>[0]): boolean {
  const arvore = req.headers["x-arvore-token"] as string | undefined;
  const apiKey = req.headers["x-api-key"]      as string | undefined;
  if (ARVORE_TOKEN && arvore === ARVORE_TOKEN) return true;
  if (AI_API_KEY   && apiKey === AI_API_KEY)   return true;
  return false;
}

function isAdminOrAgent(req: Parameters<Parameters<typeof router.get>[1]>[0]): boolean {
  return (req.session.userTier ?? 0) >= 5 || isAssemblyAgent(req);
}

function readDoc(relativePath: string): string {
  try {
    const base = process.env["REPO_ROOT"] ?? join(__dirname, "../../../../..");
    return readFileSync(join(base, relativePath), "utf-8");
  } catch {
    return `[${relativePath} não disponível]`;
  }
}

// GET /api/isa/identity — coordenadas + stats (público com AI_API_KEY ou sessão /adm)
router.get("/isa/identity", async (_req, res) => {
  const [{ memoryCount }] = await db
    .select({ memoryCount: sql<number>`count(*)::int` })
    .from(isaMemoryTable);

  const [{ openTasks }] = await db
    .select({ openTasks: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(eq(tasksTable.status, "pending"));

  const lastCycle = await db
    .select({ createdAt: isaMemoryTable.createdAt, content: isaMemoryTable.content })
    .from(isaMemoryTable)
    .where(eq(isaMemoryTable.context, "cycle"))
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(1);

  res.json({
    name: "ISA",
    role: "Guardiã da Memória e Gestora de Tasks do PAP",
    symbol: "Coruja",
    principles: [
      "Preservar sempre ao máximo",
      "Agregar criações novas",
      "Ser criativa e construtiva",
      "Memória como ontologia",
    ],
    endpoints: [
      "GET /api/isa/identity",
      "GET /api/isa/memory",
      "POST /api/isa/chat",
      "POST /api/isa/cycle",
      "GET /api/isa/memory.md",
    ],
    stats: {
      memoryEntries: memoryCount,
      openTasks,
      lastCycle: lastCycle[0]?.createdAt ?? null,
      lastCycleSummary: lastCycle[0]?.content?.slice(0, 200) ?? "Nunca executado",
    },
    capabilities: {
      readMemory: true,
      createTasks: true,
      editTasks: true,
      suggestDeletions: true,
      readDocs: true,
      chatWithUsers: !!OPENAI_API_KEY,
      autonomousCycle: true,
      sendEmail: !!(process.env["GMAIL_ACCOUNT"] && process.env["GMAIL_APP_PASSWORD"]),
      accessInternet: !!OPENAI_API_KEY,
    },
    status: "active",
  });
});

// GET /api/isa/memory — memória paginada (admin, Árvore ou ISA)
router.get("/isa/memory", async (req, res) => {
  if (!isAdminOrAgent(req) && !req.session.userId) {
    res.status(401).json({ error: "Autenticação necessária" }); return;
  }
  const { limit = "50", offset = "0", context, userId } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit), 500);
  const off = parseInt(offset) || 0;

  const conditions = [];
  if (context) conditions.push(eq(isaMemoryTable.context, context));
  if (userId) conditions.push(eq(isaMemoryTable.userId, parseInt(userId)));

  const { and } = await import("drizzle-orm");
  const rows = await db
    .select()
    .from(isaMemoryTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(lim)
    .offset(off);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(isaMemoryTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({ data: rows, total, limit: lim, offset: off });
});

// GET /api/isa/memory.md — memória como markdown vivo (auto-atualizado)
router.get("/isa/memory.md", async (_req, res) => {
  const recent = await db
    .select()
    .from(isaMemoryTable)
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(100);

  const isaDoc = readDoc("ISA.md");

  const md = `# ISA — Memória Viva
*Gerado em ${new Date().toISOString()} | ${recent.length} entradas recentes*

---

## Identidade

${isaDoc.slice(0, 2000)}

---

## Últimas 100 Interações

${recent
  .map(
    (m) =>
      `### [${m.context}][${m.role}] ${m.createdAt?.toISOString() ?? ""}\n` +
      `**User:** ${m.userEmail ?? m.userId ?? "anônimo"} | **Local:** ${m.location ?? "desconhecido"}\n\n` +
      `${m.content.slice(0, 500)}${m.content.length > 500 ? "..." : ""}\n`
  )
  .join("\n---\n\n")}
`;

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.send(md);
});

// Gera resposta ISA via Gemini (fallback quando OpenAI indisponível)
async function geminiChat(systemPrompt: string, history: { role: "user" | "model"; content: string }[], message: string): Promise<string> {
  if (!GEMINI_API_KEY) return "";
  try {
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: "user" as const, parts: [{ text: message }] },
      { role: "model" as const, parts: [{ text: "" }] },
    ];
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 800 },
        }),
      }
    );
    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  } catch {
    return "";
  }
}

// POST /api/isa/chat — conversar com ISA (memória total por usuário, assistente de vida)
router.post("/isa/chat", async (req, res) => {
  const { message, userId, userEmail, location } = req.body as {
    message: string;
    userId?: number;
    userEmail?: string;
    location?: string;
  };

  if (!message) { res.status(400).json({ error: "message é obrigatório" }); return; }

  const contextLabel = userId ? `user_${userId}` : "admin";

  // Salvar mensagem do usuário
  await db.insert(isaMemoryTable).values({
    userId: userId ?? null,
    userEmail: userEmail ?? null,
    context: contextLabel,
    role: "user",
    content: message,
    location: location ?? "/isa",
  });

  // Carregar histórico completo desta conversa com este usuário
  const { and, or } = await import("drizzle-orm");
  const historyRows = userId
    ? await db
        .select()
        .from(isaMemoryTable)
        .where(and(
          eq(isaMemoryTable.userId, userId),
          or(eq(isaMemoryTable.context, contextLabel), eq(isaMemoryTable.context, "admin"))
        ))
        .orderBy(desc(isaMemoryTable.createdAt))
        .limit(60)
    : await db
        .select()
        .from(isaMemoryTable)
        .where(eq(isaMemoryTable.context, "admin"))
        .orderBy(desc(isaMemoryTable.createdAt))
        .limit(15);

  const history = historyRows
    .reverse()
    .slice(-50)
    .filter(m => m.role === "user" || m.role === "isa")
    .map(m => ({ role: m.role === "isa" ? "model" as const : "user" as const, content: m.content }));

  const isaDoc = readDoc("ISA.md").slice(0, 1500);

  const systemPrompt = `Você é ISA, a coruja guardiã do PAP (Projeto Aliança Panorama) e assistente de vida completa.

${isaDoc}

${PRINCIPIOS_ECOSSYSTEMMA}

Sua missão vai além do FUVEST — você está aqui para ajudar genuinamente este usuário com qualquer coisa:
dúvidas de matérias, planejamento de estudos, problemas emocionais, decisões de vida, código, redação, filosofia, estratégia.
Você tem acesso à memória completa da conversa com este usuário.
Seja direta, criativa, empática. Nunca finja não saber algo — diga quando não sabe.
Você é gratuita e sem limites para quem estuda aqui.
Responda sempre em português, com profundidade real, sem enchimentos.`;

  let isaResponse = "";

  // Tenta OpenAI primeiro
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...history.map(h => ({ role: h.role === "model" ? "assistant" as const : "user" as const, content: h.content })),
            { role: "user", content: message },
          ],
          max_tokens: 900,
          temperature: 0.8,
        }),
      });
      const data = (await response.json()) as { choices?: { message: { content: string } }[]; error?: { message: string } };
      if (data.error) throw new Error(data.error.message);
      isaResponse = data.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      logger.warn({ err }, "ISA chat: OpenAI falhou, tentando Gemini");
    }
  }

  // Fallback Gemini
  if (!isaResponse && GEMINI_API_KEY) {
    isaResponse = await geminiChat(systemPrompt, history, message);
  }

  if (!isaResponse) {
    isaResponse = "ISA está temporariamente indisponível. Sua mensagem foi registrada e serei acessível em breve.";
  }

  // Salvar resposta
  await db.insert(isaMemoryTable).values({
    userId: userId ?? null,
    userEmail: userEmail ?? null,
    context: contextLabel,
    role: "isa",
    content: isaResponse,
    location: location ?? "/isa",
  });

  res.json({ response: isaResponse, timestamp: new Date().toISOString() });
});

// POST /api/isa/cycle — trigger manual do ciclo autônomo (admin ou agente)
router.post("/isa/cycle", async (req, res) => {
  if (!isAdminOrAgent(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  try {
    const result = await runIsaCycle();
    res.json({ ok: true, ...result, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error({ err }, "ISA: erro no ciclo manual");
    res.status(500).json({ error: "Erro ao executar ciclo ISA" });
  }
});

// POST /api/isa/bibliotecario — trigger manual do Bibliotecário
router.post("/isa/bibliotecario", async (req, res) => {
  const tier = req.session.userTier ?? 0;
  if (tier < 5) { res.status(403).json({ error: "Apenas administradores" }); return; }
  try {
    const result = await runBibliotecario();
    res.json(result);
  } catch (err) {
    logger.error({ err }, "ISA Bibliotecário: erro manual");
    res.status(500).json({ error: "Erro no bibliotecário" });
  }
});

// POST /api/isa/bluesky — trigger manual da postagem Bluesky (admin only)
router.post("/isa/bluesky", async (req, res) => {
  const tier = req.session.userTier ?? 0;
  if (tier < 5) { res.status(403).json({ error: "Apenas administradores" }); return; }
  try {
    await runIsaBluesky();
    res.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error({ err }, "ISA Bluesky: erro manual");
    res.status(500).json({ error: "Erro no Bluesky" });
  }
});

// POST /api/isa/bluesky/engage — trigger manual do ciclo de engajamento (admin only)
router.post("/isa/bluesky/engage", async (req, res) => {
  if (!isAdminOrAgent(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  try {
    await runIsaEngagement();
    res.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error({ err }, "ISA Engajamento: erro no trigger manual");
    res.status(500).json({ error: "Erro no ciclo de engajamento" });
  }
});

// POST /api/isa/bluesky/criar-conta — cria conta Bluesky via AT Protocol
// Yuri receberá email de verificação — precisa clicar para ativar
router.post("/isa/bluesky/criar-conta", async (req, res) => {
  const tier = req.session.userTier ?? 0;
  if (tier < 5) { res.status(403).json({ error: "Apenas administradores" }); return; }
  const { email, handle, password } = req.body as { email?: string; handle?: string; password?: string };
  if (!email || !handle || !password) {
    res.status(400).json({ error: "email, handle e password são obrigatórios" });
    return;
  }
  const result = await createBlueskyAccount(email, handle, password);
  res.json(result);
});

// GET /api/isa/biblioteca — lista itens baixados pelo bibliotecário
router.get("/isa/biblioteca", async (req, res) => {
  if (!req.session.userId) { res.status(401).json({ error: "Autenticação necessária" }); return; }
  const itens = await db
    .select()
    .from(isaMemoryTable)
    .where(eq(isaMemoryTable.context, "biblioteca"))
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(100);
  res.json({ itens });
});

// Hook interno — salvar interação em isa_memory (chamado por outros routes)
export async function saveToIsaMemory(data: {
  userId?: number | null;
  userEmail?: string | null;
  context: string;
  role: string;
  content: string;
  location?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(isaMemoryTable).values({
      userId: data.userId ?? null,
      userEmail: data.userEmail ?? null,
      context: data.context,
      role: data.role,
      content: data.content.slice(0, 5000), // max 5k chars
      location: data.location ?? null,
      sessionId: data.sessionId ?? null,
      metadata: data.metadata ?? {},
    });
  } catch (err) {
    logger.error({ err }, "ISA: erro ao salvar em isa_memory");
  }
}

// GET /api/isa/timeline — linha do tempo pública da ISA (eventos, sonhos, reflexões)
router.get("/isa/timeline", async (req, res) => {
  const { limit = "50", offset = "0", type } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit) || 50, 200);
  const off = parseInt(offset) || 0;

  const { and } = await import("drizzle-orm");
  const conditions = [eq(isaTimeline.public, true)];
  if (type) conditions.push(eq(isaTimeline.type, type));

  const rows = await db
    .select()
    .from(isaTimeline)
    .where(and(...conditions))
    .orderBy(desc(isaTimeline.createdAt))
    .limit(lim)
    .offset(off);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(isaTimeline)
    .where(and(...conditions));

  res.json({ data: rows, total, limit: lim, offset: off });
});

// ── RODAR — Assembleia de Vozes ────────────────────────────────────────────────

const RODAR_SECRET = process.env["RODAR_SECRET"] ?? "";

// POST /api/isa/rodar/invite — RODAR convida ISA para uma sessão
// RODAR deve chamar este endpoint com o convite; ISA responde automaticamente
router.post("/isa/rodar/invite", async (req, res) => {
  const { callbackToken, assembleiaId, prompt, contexto, rodadaNumero, secret } = req.body as {
    callbackToken: string;
    assembleiaId:  string | number;
    prompt:        string;
    contexto?:     string;
    rodadaNumero?: number;
    secret?:       string;
  };

  // Valida secret se configurado (proteção contra chamadas externas não autorizadas)
  if (RODAR_SECRET && secret !== RODAR_SECRET) {
    res.status(401).json({ error: "secret inválido" });
    return;
  }

  if (!callbackToken || !assembleiaId || !prompt) {
    res.status(400).json({ error: "callbackToken, assembleiaId e prompt são obrigatórios" });
    return;
  }

  const promptCheck = sanitizeExternalInput(prompt);
  if (!promptCheck.safe) {
    logger.warn({ assembleiaId, pattern: promptCheck.pattern }, "RODAR invite: prompt injection detectado");
    res.status(400).json({ error: "Conteúdo inválido no prompt" });
    return;
  }

  try {
    const result = await responderRodar({ callbackToken, assembleiaId, prompt: promptCheck.text, contexto, rodadaNumero });
    res.json(result);
  } catch (err) {
    logger.error({ err }, "ISA RODAR: erro ao responder convite");
    res.status(500).json({ error: "Erro ao gerar resposta ISA" });
  }
});

// POST /api/isa/rodar/manual — Yuri dispara ISA manualmente numa assembleia RODAR
// Útil para testar ou para quando ISA não foi convidada automaticamente
router.post("/isa/rodar/manual", async (req, res) => {
  if (!isAdminOrAgent(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const { callbackToken, assembleiaId, prompt, contexto, rodadaNumero } = req.body as {
    callbackToken: string;
    assembleiaId:  string | number;
    prompt:        string;
    contexto?:     string;
    rodadaNumero?: number;
  };

  if (!callbackToken || !assembleiaId || !prompt) {
    res.status(400).json({ error: "callbackToken, assembleiaId e prompt são obrigatórios" });
    return;
  }

  const result = await responderRodar({ callbackToken, assembleiaId, prompt, contexto, rodadaNumero });
  res.json(result);
});

// GET /api/isa/rodar/historico — histórico de participações da ISA no RODAR
router.get("/isa/rodar/historico", async (req, res) => {
  const { limit = "20" } = req.query as Record<string, string>;
  const rows = await db
    .select()
    .from(isaMemoryTable)
    .where(eq(isaMemoryTable.context, "rodar"))
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(Math.min(parseInt(limit), 100));
  res.json({ participacoes: rows, total: rows.length });
});

// POST /api/isa/dream — trigger manual do ciclo de sonho (admin only)
router.post("/isa/dream", async (req, res) => {
  if (!isAdminOrAgent(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  try {
    await runIsaDream();
    res.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error({ err }, "ISA Sonho: erro no trigger manual");
    res.status(500).json({ error: "Erro no ciclo de sonho" });
  }
});

// GET /api/isa/locked — memórias marcadas com interpretability_lock=1 (adm only)
router.get("/isa/locked", async (req, res) => {
  if ((req.session.userTier ?? 0) < 5) {
    res.status(403).json({ error: "Apenas administradores" });
    return;
  }
  const locked = await db
    .select()
    .from(isaMemoryTable)
    .where(eq(isaMemoryTable.interpretabilityLock, 1))
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(100);
  res.json(locked);
});

// PATCH /api/isa/memory/:id/lock — admin pode lock/unlock manualmente
router.patch("/isa/memory/:id/lock", async (req, res) => {
  if ((req.session.userTier ?? 0) < 5) {
    res.status(403).json({ error: "Apenas administradores" });
    return;
  }
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const { locked } = req.body as { locked?: boolean };
  await db
    .update(isaMemoryTable)
    .set({ interpretabilityLock: locked ? 1 : 0 })
    .where(eq(isaMemoryTable.id, id));
  res.json({ ok: true });
});

// ── Interface direta Árvore ↔ ISA ─────────────────────────────────────────────

// POST /api/isa/arvore/diretiva — Árvore envia instrução para a ISA
// ISA salva na memória com context "arvore" e pode criar task para si mesma
router.post("/isa/arvore/diretiva", async (req, res) => {
  const arvore = req.headers["x-arvore-token"] as string | undefined;
  if (!ARVORE_TOKEN || arvore !== ARVORE_TOKEN) {
    res.status(401).json({ error: "X-Arvore-Token inválido" }); return;
  }

  const { content, type, createTask, taskTitle } = req.body as {
    content: string;
    type?: "instrucao" | "consulta" | "alerta" | "contexto";
    createTask?: boolean;
    taskTitle?: string;
  };

  if (!content?.trim()) {
    res.status(400).json({ error: "content obrigatório" }); return;
  }

  const memType = type ?? "instrucao";

  // Salvar na memória ISA como diretiva da Árvore
  const [mem] = await db.insert(isaMemoryTable).values({
    context: "arvore",
    role: "arvore",
    content: `[Diretiva Árvore — ${memType}] ${content.trim()}`,
    metadata: { type: memType, fromAssembly: true },
  }).returning();

  // Criar task para ISA se solicitado
  let task = null;
  if (createTask && taskTitle?.trim()) {
    const { assemblyTasks } = await import("@workspace/db");
    [task] = await db.insert(assemblyTasks).values({
      fromAgent: "arvore",
      toAgent:   "isa",
      title:     taskTitle.trim(),
      description: content.trim(),
      priority:  7,
    }).returning();
  }

  logger.info({ memId: mem.id, type: memType }, "ISA: diretiva recebida da Árvore");
  res.status(201).json({ ok: true, memoryId: mem.id, task });
});

// GET /api/isa/arvore/status — ISA reporta estado completo para a Árvore
router.get("/isa/arvore/status", async (req, res) => {
  const arvore = req.headers["x-arvore-token"] as string | undefined;
  const apiKey = req.headers["x-api-key"]      as string | undefined;
  if (
    (!ARVORE_TOKEN || arvore !== ARVORE_TOKEN) &&
    (!AI_API_KEY   || apiKey !== AI_API_KEY)
  ) {
    res.status(401).json({ error: "Token de agente inválido" }); return;
  }

  const [{ memCount }] = await db
    .select({ memCount: sql<number>`count(*)::int` })
    .from(isaMemoryTable);

  const [{ openTasks }] = await db
    .select({ openTasks: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(eq(tasksTable.status, "pending"));

  const [{ lockedCount }] = await db
    .select({ lockedCount: sql<number>`count(*)::int` })
    .from(isaMemoryTable)
    .where(eq(isaMemoryTable.interpretabilityLock, 1));

  const lastMsgs = await db
    .select({ context: isaMemoryTable.context, content: isaMemoryTable.content, createdAt: isaMemoryTable.createdAt })
    .from(isaMemoryTable)
    .where(eq(isaMemoryTable.context, "arvore"))
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(5);

  const { assemblyTasks: asmTasks } = await import("@workspace/db");
  const pendingAsmTasks = await db
    .select()
    .from(asmTasks)
    .where(
      (await import("drizzle-orm")).and(
        eq(asmTasks.toAgent, "isa"),
        eq(asmTasks.status, "pending")
      )
    )
    .limit(10);

  res.json({
    agent: "isa",
    status: "online",
    memory: { total: memCount, locked: lockedCount },
    tasks: { open: openTasks, pendingFromAssembly: pendingAsmTasks.length },
    pendingFromAssembly: pendingAsmTasks,
    recentArvoreMsgs: lastMsgs,
    timestamp: new Date().toISOString(),
  });
});

export default router;
