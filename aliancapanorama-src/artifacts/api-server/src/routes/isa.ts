import { Router } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@workspace/db";
import { isaMemoryTable, tasksTable, insertIsaMemorySchema } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { runIsaCycle } from "../isa/cycle";
import { runBibliotecario } from "../isa/bibliotecario";
import { logger } from "../lib/logger";

const router = Router();
const OPENAI_API_KEY = process.env["OPENAI_API_KEY"] ?? "";

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

// GET /api/isa/memory — memória paginada
router.get("/isa/memory", async (req, res) => {
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

// POST /api/isa/chat — conversar com ISA (armazena em isa_memory)
router.post("/isa/chat", async (req, res) => {
  const { message, userId, userEmail, location } = req.body as {
    message: string;
    userId?: number;
    userEmail?: string;
    location?: string;
  };

  if (!message) { res.status(400).json({ error: "message é obrigatório" }); return; }

  // Salvar mensagem do usuário
  await db.insert(isaMemoryTable).values({
    userId: userId ?? null,
    userEmail: userEmail ?? null,
    context: "admin",
    role: "user",
    content: message,
    location: location ?? "/adm",
  });

  let isaResponse = "ISA está processando...";

  if (OPENAI_API_KEY) {
    // Buscar contexto recente desta conversa
    const recentCtx = await db
      .select()
      .from(isaMemoryTable)
      .where(eq(isaMemoryTable.context, "admin"))
      .orderBy(desc(isaMemoryTable.createdAt))
      .limit(10);

    const isaDoc = readDoc("ISA.md").slice(0, 2000);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Você é ISA, a coruja guardiã do PAP (Projeto Aliança Panorama).
Identidade: ${isaDoc.slice(0, 500)}
Responda em português, de forma direta e criativa. Você tem acesso à memória do sistema.`,
            },
            ...recentCtx
              .reverse()
              .slice(-8)
              .map((m) => ({ role: m.role === "isa" ? "assistant" : "user" as const, content: m.content })),
            { role: "user", content: message },
          ],
          max_tokens: 800,
          temperature: 0.8,
        }),
      });
      const data = (await response.json()) as { choices: { message: { content: string } }[] };
      isaResponse = data.choices?.[0]?.message?.content ?? "ISA não conseguiu responder.";
    } catch (err) {
      logger.error({ err }, "ISA: erro no chat OpenAI");
      isaResponse = "ISA está temporariamente indisponível. Tente novamente em breve.";
    }
  } else {
    isaResponse = "ISA está em modo silencioso (OPENAI_API_KEY não configurada). Sua mensagem foi registrada na memória.";
  }

  // Salvar resposta da ISA
  await db.insert(isaMemoryTable).values({
    userId: userId ?? null,
    userEmail: userEmail ?? null,
    context: "admin",
    role: "isa",
    content: isaResponse,
    location: location ?? "/adm",
  });

  res.json({ response: isaResponse, timestamp: new Date().toISOString() });
});

// POST /api/isa/cycle — trigger manual do ciclo autônomo
router.post("/isa/cycle", async (_req, res) => {
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

export default router;
