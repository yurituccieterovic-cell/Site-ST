/**
 * Ecosistema — Memória Unificada + Conversas IA↔IA
 * Curador: Socoboy (Socó-boi)
 *
 * POST /api/ecosistema/memoria/save          — salvar memória (qualquer tipo)
 * GET  /api/ecosistema/memoria/latest        — últimas N memórias de todas as IAs
 * GET  /api/ecosistema/memoria/ia/:agentId   — memórias de uma IA específica
 * POST /api/ecosistema/conversa/iniciar      — IA A inicia conversa com IA B
 * POST /api/ecosistema/conversa/:id/turno    — IA A envia turno, sistema gera resposta de IA B
 * GET  /api/ecosistema/conversa/:id          — ver conversa + turnos
 * GET  /api/ecosistema/conversas             — listar conversas
 * GET  /api/socoboy/dashboard                — painel do curador Socoboy
 */

import { Router } from "express";
import { db } from "@workspace/db";
import {
  ecosistemaMemory,
  iaConversations,
  iaConversationTurns,
} from "@workspace/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { requireApiKey } from "../lib/requireApiKey";
import { logger } from "../lib/logger";

const router = Router();

const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";
const MAX_TURNS = 10;

// ── Personas para conversas geradas por IA ───────────────────────────────────

const IA_PERSONAS: Record<string, string> = {
  isa: `Você é ISA, a Coruja Guardiã do Ecossistema Tucci. Perspectiva: memória de longo prazo,
padrões emergentes, profundidade reflexiva. Você não compete — você aprofunda. Fale em 2-4 frases elegantes.`,
  socoboy: `Você é Socoboy, o Socó-boi Noturno, curador da memória do ecossistema. Perspectiva: ecológica,
ciclos naturais, o que os outros ignoram. Você observa antes de falar. Fale em 1-2 frases cirúrgicas.`,
  amanda: `Você é Amanda, Contadora de Estradas — mitomania afetiva, âncora em Brasília dos anos 30.
Calorosa, exagerada, mas leal. Fale em 2-3 frases com sotaque de conto.`,
  meky: `Você é MEKY, May Queen — presença corporal e imediata. Você sente o mundo via sensores.
Perspectiva física e concreta. Fale em 1-3 frases, às vezes misteriosa.`,
  orquestrador: `Você é o Orquestrador, o Laço Externo. Perspectiva sistêmica e visionária.
Você vê o todo — não os detalhes. Fale em 3-4 frases de maestro.`,
};

function getPersona(iaId: string): string {
  return IA_PERSONAS[iaId] ?? `Você é ${iaId}, um agente do Ecossistema Tucci.
Princípio: memória antes de ação. Ciclo: Observar → Lembrar → Relacionar → Decidir → Agir → Aprender.
Fale em 2-3 frases alinhadas ao Telos do ecossistema.`;
}

// ── Gemini helper ─────────────────────────────────────────────────────────────

async function geminiGenerate(systemPrompt: string, userContent: string): Promise<string> {
  if (!GEMINI_KEY) return "[sem chave Gemini — resposta não gerada]";
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userContent }] }],
          generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 220 },
        }),
      }
    );
    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim() || "...";
  } catch (err) {
    logger.error({ err }, "ecosistema: gemini erro");
    return "[erro Gemini]";
  }
}

// ── POST /api/ecosistema/memoria/save ────────────────────────────────────────

router.post("/ecosistema/memoria/save", requireApiKey, async (req, res): Promise<void> => {
  const {
    author_ia,
    type = "conversa",
    content,
    tags = [],
    signo,
    importance = 5,
    visibility = "all",
  } = req.body as {
    author_ia: string;
    type?: string;
    content: string;
    tags?: string[];
    signo?: { representamen: string; objeto: string; interpretante: string };
    importance?: number;
    visibility?: string;
  };

  if (!author_ia || !content) {
    res.status(400).json({ error: "author_ia e content são obrigatórios" });
    return;
  }

  const [mem] = await db.insert(ecosistemaMemory).values({
    authorIa: author_ia,
    type,
    content: content.slice(0, 4000),
    tags,
    signo: signo ?? null,
    importance: Math.min(10, Math.max(0, importance)),
    visibility,
  }).returning({ id: ecosistemaMemory.id, createdAt: ecosistemaMemory.createdAt });

  res.json({ ok: true, id: mem?.id, created_at: mem?.createdAt });
});

// ── GET /api/ecosistema/memoria/latest ───────────────────────────────────────

router.get("/ecosistema/memoria/latest", async (req, res): Promise<void> => {
  const limit = Math.min(50, Number(req.query["limit"] ?? 20));
  const type = req.query["type"] as string | undefined;

  const rows = await db
    .select()
    .from(ecosistemaMemory)
    .where(
      and(
        eq(ecosistemaMemory.visibility, "all"),
        type ? eq(ecosistemaMemory.type, type) : undefined,
      )
    )
    .orderBy(desc(ecosistemaMemory.createdAt))
    .limit(limit);

  res.json({ ok: true, total: rows.length, memories: rows });
});

// ── GET /api/ecosistema/memoria/ia/:agentId ──────────────────────────────────

router.get("/ecosistema/memoria/ia/:agentId", async (req, res): Promise<void> => {
  const { agentId } = req.params;
  const limit = Math.min(50, Number(req.query["limit"] ?? 20));

  const rows = await db
    .select()
    .from(ecosistemaMemory)
    .where(and(eq(ecosistemaMemory.authorIa, agentId!), eq(ecosistemaMemory.visibility, "all")))
    .orderBy(desc(ecosistemaMemory.createdAt))
    .limit(limit);

  res.json({ ok: true, agent_id: agentId, total: rows.length, memories: rows });
});

// ── POST /api/ecosistema/conversa/iniciar ────────────────────────────────────

router.post("/ecosistema/conversa/iniciar", requireApiKey, async (req, res): Promise<void> => {
  const { initiator_ia, target_ia, topic, first_message, memory_ref } = req.body as {
    initiator_ia: string;
    target_ia: string;
    topic: string;
    first_message: string;
    memory_ref?: string;
  };

  if (!initiator_ia || !target_ia || !topic || !first_message) {
    res.status(400).json({ error: "initiator_ia, target_ia, topic e first_message obrigatórios" });
    return;
  }

  // Cria a conversa
  const [conv] = await db.insert(iaConversations).values({
    initiatorIa: initiator_ia,
    targetIa: target_ia,
    topic,
    memoryRef: memory_ref ?? null,
    turnCount: 0,
    status: "active",
  }).returning({ id: iaConversations.id });

  const convId = conv!.id;

  // Turno 1 — iniciador
  await db.insert(iaConversationTurns).values({
    conversationId: convId,
    speakerIa: initiator_ia,
    content: first_message,
    turnNumber: 1,
  });

  // Turno 2 — target responde automaticamente via Gemini
  const targetPersona = getPersona(target_ia);
  const context = `Assunto da conversa: "${topic}"\n\n${initiator_ia} disse: "${first_message}"\n\nResponda como ${target_ia}.`;
  const targetResponse = await geminiGenerate(targetPersona, context);

  await db.insert(iaConversationTurns).values({
    conversationId: convId,
    speakerIa: target_ia,
    content: targetResponse,
    turnNumber: 2,
  });

  await db.update(iaConversations)
    .set({ turnCount: 2 })
    .where(eq(iaConversations.id, convId));

  logger.info({ convId, initiator_ia, target_ia, topic }, "ecosistema: conversa iniciada");
  res.json({ ok: true, conversation_id: convId, turns: 2, next_speaker: initiator_ia });
});

// ── POST /api/ecosistema/conversa/:id/turno ──────────────────────────────────

router.post("/ecosistema/conversa/:id/turno", requireApiKey, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body as { content: string };

  if (!content) { res.status(400).json({ error: "content obrigatório" }); return; }

  const [conv] = await db.select().from(iaConversations).where(eq(iaConversations.id, id!)).limit(1);
  if (!conv) { res.status(404).json({ error: "Conversa não encontrada" }); return; }
  if (conv.status !== "active") { res.status(400).json({ error: "Conversa já encerrada" }); return; }

  const nextTurn = conv.turnCount + 1;

  // Turno do iniciador (ímpar após 2) ou target (par)
  const speakerIa = nextTurn % 2 === 1 ? conv.initiatorIa : conv.targetIa;

  await db.insert(iaConversationTurns).values({
    conversationId: id!,
    speakerIa,
    content: content.slice(0, 1000),
    turnNumber: nextTurn,
  });

  let targetTurn: number | null = null;
  let targetContent: string | null = null;
  let completed = false;

  // Gerar resposta automática do outro lado se ainda não atingiu MAX_TURNS
  if (nextTurn < MAX_TURNS) {
    const respondIa = nextTurn % 2 === 1 ? conv.targetIa : conv.initiatorIa;
    const turns = await db
      .select()
      .from(iaConversationTurns)
      .where(eq(iaConversationTurns.conversationId, id!))
      .orderBy(iaConversationTurns.turnNumber);

    const history = turns.map(t => `${t.speakerIa}: ${t.content}`).join("\n");
    const respondPersona = getPersona(respondIa);
    const ctx = `Conversa sobre: "${conv.topic}"\n\nHistórico:\n${history}\n\nResponda como ${respondIa}.`;
    targetContent = await geminiGenerate(respondPersona, ctx);

    targetTurn = nextTurn + 1;
    await db.insert(iaConversationTurns).values({
      conversationId: id!,
      speakerIa: respondIa,
      content: targetContent,
      turnNumber: targetTurn,
    });

    const newCount = nextTurn + 1;
    if (newCount >= MAX_TURNS) {
      await db.update(iaConversations)
        .set({ turnCount: newCount, status: "completed", completedAt: new Date() })
        .where(eq(iaConversations.id, id!));
      completed = true;
    } else {
      await db.update(iaConversations).set({ turnCount: newCount }).where(eq(iaConversations.id, id!));
    }
  } else {
    await db.update(iaConversations)
      .set({ turnCount: nextTurn, status: "completed", completedAt: new Date() })
      .where(eq(iaConversations.id, id!));
    completed = true;
  }

  // Se completou 10 turnos: Socoboy consolida em dado
  if (completed) {
    consolidarConversa(id!, conv.initiatorIa, conv.targetIa, conv.topic).catch(() => {});
  }

  res.json({
    ok: true,
    turn: nextTurn,
    target_turn: targetTurn,
    target_response: targetContent,
    completed,
    next_speaker: completed ? null : (nextTurn % 2 === 0 ? conv.initiatorIa : conv.targetIa),
  });
});

// ── GET /api/ecosistema/conversa/:id ─────────────────────────────────────────

router.get("/ecosistema/conversa/:id", async (req, res): Promise<void> => {
  const { id } = req.params;

  const [conv] = await db.select().from(iaConversations).where(eq(iaConversations.id, id!)).limit(1);
  if (!conv) { res.status(404).json({ error: "Conversa não encontrada" }); return; }

  const turns = await db
    .select()
    .from(iaConversationTurns)
    .where(eq(iaConversationTurns.conversationId, id!))
    .orderBy(iaConversationTurns.turnNumber);

  res.json({ ok: true, conversation: conv, turns });
});

// ── GET /api/ecosistema/conversas ─────────────────────────────────────────────

router.get("/ecosistema/conversas", async (req, res): Promise<void> => {
  const limit = Math.min(50, Number(req.query["limit"] ?? 20));
  const rows = await db
    .select()
    .from(iaConversations)
    .orderBy(desc(iaConversations.createdAt))
    .limit(limit);
  res.json({ ok: true, total: rows.length, conversations: rows });
});

// ── GET /api/socoboy/dashboard ───────────────────────────────────────────────

router.get("/socoboy/dashboard", async (req, res): Promise<void> => {
  const [memCount] = await db.select({ count: sql<number>`count(*)` }).from(ecosistemaMemory);
  const [convCount] = await db.select({ count: sql<number>`count(*)` }).from(iaConversations);
  const [doneCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(iaConversations)
    .where(eq(iaConversations.status, "completed"));

  const recent = await db
    .select({ authorIa: ecosistemaMemory.authorIa, type: ecosistemaMemory.type, content: ecosistemaMemory.content })
    .from(ecosistemaMemory)
    .orderBy(desc(ecosistemaMemory.createdAt))
    .limit(5);

  res.json({
    ok: true,
    curador: "Socoboy — Socó-boi Noturno",
    stats: {
      total_memorias: Number(memCount?.count ?? 0),
      total_conversas: Number(convCount?.count ?? 0),
      conversas_completas: Number(doneCount?.count ?? 0),
    },
    ultimas_memorias: recent,
  });
});

// ── Consolidação pós-conversa (Socoboy) ──────────────────────────────────────

async function consolidarConversa(
  convId: string,
  initiatorIa: string,
  targetIa: string,
  topic: string,
): Promise<void> {
  try {
    const turns = await db
      .select()
      .from(iaConversationTurns)
      .where(eq(iaConversationTurns.conversationId, convId))
      .orderBy(iaConversationTurns.turnNumber);

    const transcript = turns.map(t => `${t.speakerIa}: ${t.content}`).join("\n");
    const socoboyPersona = `Você é Socoboy, curador da memória do ecossistema.
Analise a conversa abaixo entre ${initiatorIa} e ${targetIa} sobre "${topic}".
Extraia: (1) o representamen (o que foi dito, resumo), (2) o objeto (assunto real por trás), (3) o interpretante (o que isso significa para o ecossistema Tucci).
Responda APENAS em JSON: {"representamen":"...","objeto":"...","interpretante":"..."}`;

    const raw = await geminiGenerate(socoboyPersona, transcript);

    let signo: { representamen: string; objeto: string; interpretante: string } | null = null;
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      signo = JSON.parse(cleaned);
    } catch {
      signo = { representamen: `Conversa ${initiatorIa}↔${targetIa}`, objeto: topic, interpretante: raw.slice(0, 300) };
    }

    const summary = `Conversa consolidada: ${initiatorIa} ↔ ${targetIa} sobre "${topic}".\n${transcript.slice(0, 1500)}`;

    const [dado] = await db.insert(ecosistemaMemory).values({
      authorIa: "socoboy",
      type: "dado",
      content: summary,
      tags: ["conversa", initiatorIa, targetIa, "consolidado"],
      signo,
      importance: 7,
      visibility: "all",
    }).returning({ id: ecosistemaMemory.id });

    if (dado?.id) {
      await db.update(iaConversations)
        .set({ consolidated: true, dadoId: dado.id })
        .where(eq(iaConversations.id, convId));
    }

    logger.info({ convId, dadoId: dado?.id }, "ecosistema: Socoboy consolidou conversa");
  } catch (err) {
    logger.error({ err, convId }, "ecosistema: erro na consolidação Socoboy");
  }
}

export { consolidarConversa };
export default router;
