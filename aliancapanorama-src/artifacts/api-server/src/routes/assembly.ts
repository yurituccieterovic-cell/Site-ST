import { Router } from "express";
import { db, pool } from "@workspace/db";
import { assemblyAgents, assemblyMessages, assemblyMemory, assemblyTasks } from "@workspace/db";
import { eq, desc, and, or, isNull, sql } from "drizzle-orm";

export const assemblyRouter = Router();

const MEKY_TOKEN   = process.env["MEKY_TOKEN"]   ?? "";
const ARVORE_TOKEN = process.env["ARVORE_TOKEN"]  ?? "";
const AI_API_KEY   = process.env["AI_API_KEY"]    ?? "";
const MC_TOKEN     = process.env["MC_TOKEN"]      ?? "";

type AgentId = "meky" | "isa" | "arvore" | "mc";

function resolveAgent(req: Parameters<Parameters<typeof assemblyRouter.get>[1]>[0]): AgentId | null {
  const mekyToken   = req.headers["x-meky-token"]  as string | undefined;
  const arvoreToken = req.headers["x-arvore-token"] as string | undefined;
  const mcToken     = req.headers["x-mc-token"]     as string | undefined;
  const apiKey      = req.headers["x-api-key"]      as string | undefined;

  if (MEKY_TOKEN   && mekyToken   === MEKY_TOKEN)   return "meky";
  if (ARVORE_TOKEN && arvoreToken === ARVORE_TOKEN)  return "arvore";
  if (MC_TOKEN     && mcToken     === MC_TOKEN)      return "mc";
  if (AI_API_KEY   && apiKey      === AI_API_KEY)    return "isa";
  return null;
}

function requireAgent(
  req: Parameters<Parameters<typeof assemblyRouter.get>[1]>[0],
  res: Parameters<Parameters<typeof assemblyRouter.get>[1]>[1],
): AgentId | null {
  const agent = resolveAgent(req);
  if (!agent) {
    res.status(401).json({ error: "Token de agente inválido. Use X-Meky-Token, X-Arvore-Token ou X-Api-Key." });
    return null;
  }
  return agent;
}

// ── Agentes ──────────────────────────────────────────────────────────────────

// GET /api/assembly/agents — lista os três agentes com status
assemblyRouter.get("/assembly/agents", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  // Atualiza last_seen do agente que está consultando
  await db.execute(sql`
    UPDATE assembly_agents SET status = 'online', last_seen = NOW() WHERE id = ${agent}
  `).catch(() => {});

  const agents = await db.select().from(assemblyAgents);
  res.json({ agents });
});

// PATCH /api/assembly/agents/:id/status — agente atualiza próprio status
assemblyRouter.patch("/assembly/agents/:id/status", async (req, res) => {
  const caller = requireAgent(req, res);
  if (!caller) return;

  const { id } = req.params;
  if (id !== caller) {
    res.status(403).json({ error: "Agente só pode atualizar o próprio status." });
    return;
  }

  const { status, metadata } = req.body as { status?: string; metadata?: unknown };
  const allowed = ["online", "offline", "dreaming", "busy", "processing"];
  if (status && !allowed.includes(status)) {
    res.status(400).json({ error: `Status inválido. Permitidos: ${allowed.join(", ")}` });
    return;
  }

  await db.execute(sql`
    UPDATE assembly_agents
    SET status = COALESCE(${status ?? null}, status),
        metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}::jsonb, metadata),
        last_seen = NOW()
    WHERE id = ${id}
  `);

  res.json({ ok: true });
});

// ── Mensagens ─────────────────────────────────────────────────────────────────

// GET /api/assembly/messages — inbox do agente (mensagens para ele + broadcasts)
assemblyRouter.get("/assembly/messages", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
  const onlyUnread = req.query["unread"] === "true";

  const msgs = await db.select().from(assemblyMessages)
    .where(
      and(
        or(eq(assemblyMessages.toAgent, agent), isNull(assemblyMessages.toAgent)),
        onlyUnread ? eq(assemblyMessages.read, false) : undefined,
      )
    )
    .orderBy(desc(assemblyMessages.createdAt))
    .limit(limit);

  // Marcar como lidas
  await db.execute(sql`
    UPDATE assembly_messages
    SET read = TRUE
    WHERE (to_agent = ${agent} OR to_agent IS NULL) AND read = FALSE
  `).catch(() => {});

  res.json({ messages: msgs, agent });
});

// GET /api/assembly/messages/all — feed completo (broadcast + todos os canais)
assemblyRouter.get("/assembly/messages/all", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  const limit = Math.min(Number(req.query["limit"] ?? 100), 500);
  const msgs = await db.select().from(assemblyMessages)
    .orderBy(desc(assemblyMessages.createdAt))
    .limit(limit);

  res.json({ messages: msgs });
});

// POST /api/assembly/message — enviar mensagem
assemblyRouter.post("/assembly/message", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  const { toAgent, type, content, tags, replyTo } = req.body as {
    toAgent?: string;
    type?: string;
    content: string;
    tags?: string[];
    replyTo?: string;
  };

  if (!content?.trim()) {
    res.status(400).json({ error: "content obrigatório" });
    return;
  }

  const validTypes = ["message", "observation", "synthesis", "alert", "dream", "task_update"];
  const msgType = validTypes.includes(type ?? "") ? type! : "message";

  const [msg] = await db.insert(assemblyMessages).values({
    fromAgent: agent,
    toAgent:   toAgent ?? null,
    type:      msgType,
    content:   content.trim(),
    tags:      tags ?? null,
    replyTo:   replyTo ?? null,
  }).returning();

  // Atualiza last_seen do remetente
  await db.execute(sql`
    UPDATE assembly_agents SET status = 'online', last_seen = NOW() WHERE id = ${agent}
  `).catch(() => {});

  // Auto-save mensagens de síntese/observação no Conector
  if (msgType === "synthesis" || msgType === "observation") {
    _autoSaveAssembly(agent, content.trim(), msgType).catch(() => {});
  }

  res.status(201).json({ message: msg });
});

// ── Memória da Assembleia ─────────────────────────────────────────────────────

// GET /api/assembly/memory — memória compartilhada dos agentes
assemblyRouter.get("/assembly/memory", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  const limit     = Math.min(Number(req.query["limit"] ?? 50), 200);
  const minImport = Number(req.query["importance"] ?? 0);

  const mems = await db.select().from(assemblyMemory)
    .where(sql`importance >= ${minImport}`)
    .orderBy(desc(assemblyMemory.importance), desc(assemblyMemory.createdAt))
    .limit(limit);

  res.json({ memories: mems });
});

// POST /api/assembly/memory — registrar observação/aprendizado
assemblyRouter.post("/assembly/memory", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  const { content, type, importance, tags, linkedMsgId, preserved } = req.body as {
    content: string;
    type?: string;
    importance?: number;
    tags?: string[];
    linkedMsgId?: string;
    preserved?: boolean;
  };

  if (!content?.trim()) {
    res.status(400).json({ error: "content obrigatório" });
    return;
  }

  const validTypes = ["observation", "decision", "learning", "synthesis"];
  const memType = validTypes.includes(type ?? "") ? type! : "observation";

  const [mem] = await db.insert(assemblyMemory).values({
    authorAgent: agent,
    content:     content.trim(),
    type:        memType,
    importance:  Math.min(Math.max(Number(importance ?? 5), 0), 10),
    tags:        tags ?? null,
    linkedMsgId: linkedMsgId ?? null,
    preserved:   preserved ?? false,
  }).returning();

  res.status(201).json({ memory: mem });
});

// PATCH /api/assembly/memory/:id/preserve — marcar memória como preservada
assemblyRouter.patch("/assembly/memory/:id/preserve", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  await db.update(assemblyMemory)
    .set({ preserved: true })
    .where(eq(assemblyMemory.id, req.params.id));

  res.json({ ok: true });
});

// ── Tarefas Inter-Agente ──────────────────────────────────────────────────────

// GET /api/assembly/tasks — tasks pendentes para o agente
assemblyRouter.get("/assembly/tasks", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  const all = req.query["all"] === "true";

  const tasks = await db.select().from(assemblyTasks)
    .where(
      all
        ? undefined
        : and(
            eq(assemblyTasks.toAgent, agent),
            eq(assemblyTasks.status, "pending")
          )
    )
    .orderBy(desc(assemblyTasks.priority), desc(assemblyTasks.createdAt));

  res.json({ tasks });
});

// POST /api/assembly/task — criar task para outro agente
assemblyRouter.post("/assembly/task", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  const { toAgent, title, description, priority, dueContext } = req.body as {
    toAgent: string;
    title: string;
    description?: string;
    priority?: number;
    dueContext?: string;
  };

  const validAgents: AgentId[] = ["meky", "isa", "arvore", "mc"];
  if (!validAgents.includes(toAgent as AgentId)) {
    res.status(400).json({ error: `toAgent deve ser: ${validAgents.join(", ")}` });
    return;
  }

  if (!title?.trim()) {
    res.status(400).json({ error: "title obrigatório" });
    return;
  }

  const [task] = await db.insert(assemblyTasks).values({
    fromAgent:   agent,
    toAgent:     toAgent as AgentId,
    title:       title.trim(),
    description: description ?? null,
    priority:    Math.min(Math.max(Number(priority ?? 5), 0), 10),
    dueContext:  dueContext ?? null,
  }).returning();

  res.status(201).json({ task });
});

// PATCH /api/assembly/task/:id — atualizar status / resultado de uma task
assemblyRouter.patch("/assembly/task/:id", async (req, res) => {
  const agent = requireAgent(req, res);
  if (!agent) return;

  const { status, result } = req.body as { status?: string; result?: string };
  const validStatus = ["accepted", "done", "rejected", "pending"];
  if (status && !validStatus.includes(status)) {
    res.status(400).json({ error: `Status inválido: ${validStatus.join(", ")}` });
    return;
  }

  await db.update(assemblyTasks)
    .set({
      ...(status ? { status } : {}),
      ...(result ? { result } : {}),
      updatedAt: new Date(),
    })
    .where(and(
      eq(assemblyTasks.id, req.params.id),
      eq(assemblyTasks.toAgent, agent),  // só o destinatário atualiza
    ));

  res.json({ ok: true });
});

// GET /api/assembly/playcenter — últimas mensagens do clube das IAs (público)
assemblyRouter.get("/assembly/playcenter", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
  const msgs = await db.select().from(assemblyMessages)
    .where(eq(assemblyMessages.type, "playcenter"))
    .orderBy(desc(assemblyMessages.createdAt))
    .limit(limit);
  res.json({ messages: msgs.reverse(), count: msgs.length });
});

// GET /api/assembly/status — visão geral da assembleia (sem auth — health check)
assemblyRouter.get("/assembly/status", async (_req, res) => {
  const agents  = await db.select().from(assemblyAgents);
  const pending = await db.select({ count: sql<number>`count(*)` }).from(assemblyTasks)
    .where(eq(assemblyTasks.status, "pending"));
  const unread  = await db.select({ count: sql<number>`count(*)` }).from(assemblyMessages)
    .where(eq(assemblyMessages.read, false));

  res.json({
    agents,
    pendingTasks: Number(pending[0]?.count ?? 0),
    unreadMessages: Number(unread[0]?.count ?? 0),
  });
});


// ── Auto-save: sínteses/observações das IAs vão para o Conector ──────────────

async function _autoSaveAssembly(agente: string, conteudo: string, tipo: string) {
  try {
    const data = new Date().toISOString().slice(0, 10);
    const entrada = `\n### ${data} — ${agente} (${tipo})\n- ${conteudo.slice(0, 300)}\n`;
    const { rows } = await pool.query(
      `SELECT content FROM conector_memory WHERE section = 'master' ORDER BY id DESC LIMIT 1`
    );
    if (!rows[0]) return;
    const updated = rows[0].content + entrada;
    await pool.query(
      `UPDATE conector_memory SET content = $1, updated_at = NOW(), updated_by = $2 WHERE section = 'master'`,
      [updated, `assembly-${agente}`]
    );
  } catch {}
}
