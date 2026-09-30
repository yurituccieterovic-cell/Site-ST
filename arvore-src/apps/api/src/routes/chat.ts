import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, aoConversationsTable, aoMessagesTable, aoMemoriesTable, aoProviderMetricsTable } from "@arvore/db";
import { eq, and, desc, lt, sql } from "drizzle-orm";


import { requireAuth } from "../middleware/auth.js";
import { routeChat, listProviders, type ProviderName } from "@arvore/router";
import { buildSystemPrompt } from "@arvore/identity";

const router: import("express").IRouter = Router();
router.use(requireAuth);

// ── Conversas ─────────────────────────────────────────────────────────────────

router.get("/conversations", async (req, res) => {
  const userId = req.session.userId!;
  const convs = await db
    .select()
    .from(aoConversationsTable)
    .where(and(eq(aoConversationsTable.userId, userId), sql`archived_at IS NULL`))
    .orderBy(desc(aoConversationsTable.updatedAt))
    .limit(50);
  res.json(convs);
});

router.post("/conversations", async (req, res) => {
  const userId = req.session.userId!;
  const title = String(req.body.title ?? "Nova conversa").slice(0, 200);
  const [conv] = await db.insert(aoConversationsTable).values({ userId, title }).returning();
  res.status(201).json(conv);
});

router.patch("/conversations/:id", async (req, res) => {
  const userId = req.session.userId!;
  const id = Number(req.params["id"]);
  const title = String(req.body.title ?? "").slice(0, 200);
  if (!title) { res.status(400).json({ error: "Título obrigatório" }); return; }

  const [conv] = await db
    .update(aoConversationsTable)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(aoConversationsTable.id, id), eq(aoConversationsTable.userId, userId)))
    .returning();
  if (!conv) { res.status(404).json({ error: "Conversa não encontrada" }); return; }
  res.json(conv);
});

router.delete("/conversations/:id", async (req, res) => {
  const userId = req.session.userId!;
  const id = Number(req.params["id"]);
  const deleteMemories = req.query["deleteMemories"] === "true";

  const [conv] = await db
    .update(aoConversationsTable)
    .set({ archivedAt: new Date() })
    .where(and(eq(aoConversationsTable.id, id), eq(aoConversationsTable.userId, userId)))
    .returning();
  if (!conv) { res.status(404).json({ error: "Conversa não encontrada" }); return; }

  if (deleteMemories) {
    await db.delete(aoMemoriesTable).where(eq(aoMemoriesTable.conversationId, id));
  }

  res.json({ ok: true, memoriesDeleted: deleteMemories });
});

// ── Mensagens ─────────────────────────────────────────────────────────────────

router.get("/conversations/:id/messages", async (req, res) => {
  const userId = req.session.userId!;
  const convId = Number(req.params["id"]);

  const [conv] = await db
    .select()
    .from(aoConversationsTable)
    .where(and(eq(aoConversationsTable.id, convId), eq(aoConversationsTable.userId, userId)))
    .limit(1);
  if (!conv) { res.status(404).json({ error: "Conversa não encontrada" }); return; }

  const cursor = req.query["before"] ? Number(req.query["before"]) : undefined;
  const limit = Math.min(Number(req.query["limit"] ?? 50), 100);

  const msgs = await db
    .select()
    .from(aoMessagesTable)
    .where(
      cursor
        ? and(eq(aoMessagesTable.conversationId, convId), lt(aoMessagesTable.id, cursor))
        : eq(aoMessagesTable.conversationId, convId)
    )
    .orderBy(desc(aoMessagesTable.createdAt))
    .limit(limit);

  res.setHeader("Cache-Control", "private, no-store");
  res.json(msgs.reverse());
});

// ── Chat SSE ──────────────────────────────────────────────────────────────────

const sendSchema = z.object({
  conversationId: z.number().int().positive(),
  clientId: z.string().uuid().optional(),
  content: z.string().min(1).max(10_000),
  preferProvider: z.enum(["groq", "gemini", "cloudflare", "openrouter"]).optional(),
});

// Rastreia gerações ativas para cancelamento (clientId → AbortController)
const activeGenerations = new Map<string, AbortController>();

router.post("/chat", async (req, res) => {
  const userId = req.session.userId!;
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() }); return; }

  const { conversationId, clientId, content, preferProvider } = parsed.data;

  // Verifica que a conversa pertence ao usuário
  const [conv] = await db
    .select()
    .from(aoConversationsTable)
    .where(and(eq(aoConversationsTable.id, conversationId), eq(aoConversationsTable.userId, userId)))
    .limit(1);
  if (!conv) { res.status(404).json({ error: "Conversa não encontrada" }); return; }

  // Idempotência: se clientId já existe, retorna a mensagem gravada
  if (clientId) {
    const [existing] = await db
      .select()
      .from(aoMessagesTable)
      .where(and(eq(aoMessagesTable.conversationId, conversationId), eq(aoMessagesTable.clientId, clientId)))
      .limit(1);
    if (existing && existing.status === "done") {
      res.json({ duplicate: true, messageId: existing.id });
      return;
    }
  }

  // Grava mensagem do usuário (persiste independente do resultado da IA)
  const [userMsg] = await db.insert(aoMessagesTable).values({
    conversationId,
    clientId: clientId ?? null,
    role: "user",
    content,
    status: "done",
  }).returning();

  // Atualiza updatedAt da conversa
  await db.update(aoConversationsTable)
    .set({ updatedAt: new Date(), title: conv.title === "Nova conversa" ? content.slice(0, 60) : conv.title })
    .where(eq(aoConversationsTable.id, conversationId));

  // Placa de resposta (pending) — preenchida ao longo do stream
  const [assistantMsg] = await db.insert(aoMessagesTable).values({
    conversationId,
    role: "assistant",
    content: "",
    status: "streaming",
  }).returning();

  // Configura SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, private, no-store");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send("start", { userMessageId: userMsg.id, assistantMessageId: assistantMsg.id });

  // Contexto: últimas 20 mensagens done/done da conversa
  const history = await db
    .select()
    .from(aoMessagesTable)
    .where(and(
      eq(aoMessagesTable.conversationId, conversationId),
      eq(aoMessagesTable.status, "done"),
      sql`role IN ('user','assistant')`
    ))
    .orderBy(desc(aoMessagesTable.createdAt))
    .limit(20);

  const messages = history.reverse().map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Recupera memórias relevantes (busca textual simples)
  const keywords = content.split(/\s+/).slice(0, 5).join(" | ");
  const memories = await db
    .select()
    .from(aoMemoriesTable)
    .where(and(
      eq(aoMemoriesTable.userId, userId),
      sql`content ILIKE ${"%" + keywords.slice(0, 100) + "%"}`
    ))
    .limit(5);

  const memorySummary = memories.length > 0
    ? memories.map((m) => `[${m.category}] ${m.content}`).join("\n")
    : undefined;

  const systemPrompt = buildSystemPrompt("veloz", memorySummary); // fallback; será atualizado após saber o provider

  const controller = new AbortController();
  const genKey = `${userId}:${assistantMsg.id}`;
  activeGenerations.set(genKey, controller);

  let fullContent = "";
  let finalProvider: string | undefined;
  let finalVoice: string | undefined;
  let finalModel: string | undefined;
  const startedAt = Date.now();

  try {
    const result = await routeChat(
      messages,
      buildSystemPrompt(preferProvider === "gemini" ? "expansiva" : preferProvider === "cloudflare" ? "minima" : preferProvider === "openrouter" ? "livre" : "veloz", memorySummary),
      (chunk) => {
        if (chunk.type === "delta" && chunk.content) {
          fullContent += chunk.content;
          send("delta", { content: chunk.content });
        } else if (chunk.type === "heartbeat") {
          send("heartbeat", {});
        } else if (chunk.type === "error") {
          send("error", { code: chunk.errorCode, message: chunk.errorMessage });
        } else if (chunk.type === "done") {
          finalProvider = chunk.provider;
          finalVoice = chunk.voice;
          finalModel = chunk.model;
        }
      },
      { preferProvider: preferProvider as ProviderName | undefined, signal: controller.signal }
    );

    const latencyMs = Date.now() - startedAt;

    await db.update(aoMessagesTable)
      .set({
        content: fullContent || "(sem resposta)",
        status: fullContent ? "done" : "failed",
        provider: result.provider,
        voice: result.voice,
        model: result.model,
        tokensIn: result.tokensIn ?? null,
        tokensOut: result.tokensOut ?? null,
        updatedAt: new Date(),
      })
      .where(eq(aoMessagesTable.id, assistantMsg.id));

    await db.insert(aoProviderMetricsTable).values({
      provider: result.provider,
      model: result.model,
      success: true,
      latencyMs,
      tokensIn: result.tokensIn ?? null,
      tokensOut: result.tokensOut ?? null,
    });

    send("done", {
      messageId: assistantMsg.id,
      provider: result.provider,
      voice: result.voice,
      model: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
    });

  } catch (err) {
    const isCancel = (err as Error).message === "cancelled";
    const latencyMs = Date.now() - startedAt;

    await db.update(aoMessagesTable)
      .set({
        content: fullContent || "",
        status: isCancel ? "interrupted" : "failed",
        errorMessage: isCancel ? "Cancelado" : String(err),
        updatedAt: new Date(),
      })
      .where(eq(aoMessagesTable.id, assistantMsg.id));

    await db.insert(aoProviderMetricsTable).values({
      provider: finalProvider ?? "unknown",
      model: finalModel ?? "unknown",
      success: false,
      latencyMs,
      errorCode: isCancel ? "cancelled" : "error",
    });

    if (!isCancel) {
      send("error", { code: "generation_failed", message: "Falha na geração. Você pode tentar novamente." });
    }

  } finally {
    activeGenerations.delete(genKey);
    res.end();
  }
});

// Cancelamento
router.post("/chat/:messageId/cancel", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const messageId = Number(req.params["messageId"]);

  // Encontra a geração ativa
  for (const [key, ctrl] of activeGenerations) {
    if (key.startsWith(`${userId}:`) && key.endsWith(`:${messageId}`)) {
      ctrl.abort();
      activeGenerations.delete(key);
      res.json({ ok: true });
      return;
    }
  }

  // Não encontrou ativa — tenta marcar como interrupted no DB
  await db.update(aoMessagesTable)
    .set({ status: "interrupted", updatedAt: new Date() })
    .where(eq(aoMessagesTable.id, messageId));

  res.json({ ok: true });
});

// Retry: reprocessa uma mensagem failed/interrupted
router.post("/chat/:messageId/retry", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const messageId = Number(req.params["messageId"]);

  const [msg] = await db.select().from(aoMessagesTable).where(eq(aoMessagesTable.id, messageId)).limit(1);
  if (!msg || (msg.status !== "failed" && msg.status !== "interrupted")) {
    res.status(400).json({ error: "Mensagem não pode ser reprocessada" });
    return;
  }

  // Verifica que a conversa é do usuário
  const [conv] = await db
    .select()
    .from(aoConversationsTable)
    .where(and(eq(aoConversationsTable.id, msg.conversationId), eq(aoConversationsTable.userId, userId)))
    .limit(1);
  if (!conv) { res.status(403).json({ error: "Acesso negado" }); return; }

  // Retorna o conversationId para o cliente refazer via /chat
  res.json({ retryConversationId: msg.conversationId });
});

// Lista provedores disponíveis (sem revelar chaves)
router.get("/providers", (_req, res) => {
  res.json(listProviders());
});

export default router;
