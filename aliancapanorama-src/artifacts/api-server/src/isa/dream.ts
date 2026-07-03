import { db } from "@workspace/db";
import { isaMemoryTable, isaTimeline, collectiveMemory } from "@workspace/db";
import { desc, gte, or, eq, sql } from "drizzle-orm";
import { AtpAgent } from "@atproto/api";
import { logger } from "../lib/logger";

const OPENAI_API_KEY   = process.env["OPENAI_API_KEY"]       ?? "";
const GEMINI_API_KEY   = process.env["GEMINI_API_KEY"]       ?? "";
const BLUESKY_HANDLE   = process.env["BLUESKY_HANDLE"]       ?? "";
const BLUESKY_PASSWORD = process.env["BLUESKY_APP_PASSWORD"] ?? "";

async function geminiGenerate(userMsg: string): Promise<string> {
  // Prefilling com role "model" vazio força resposta direta sem thinking
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user",  parts: [{ text: userMsg }] },
          { role: "model", parts: [{ text: "" }] },
        ],
        generationConfig: { maxOutputTokens: 80, temperature: 0.95, thinkingConfig: { thinkingBudget: 0 } },
      }),
    }
  );
  const data = await resp.json() as {
    candidates?: { content: { parts: { text: string }[] } }[];
    error?: { message: string };
  };
  if (data.error) throw new Error(`Gemini: ${data.error.message}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

async function callGeminiDream(resumo: string): Promise<{ dream: string; post: string; mood: string }> {
  const dream = await geminiGenerate(
    `Você é ISA, coruja guardiã do PAP. São 3h da manhã. Hoje: ${resumo}. ` +
    `Escreva seu sonho desta noite em uma frase poética (máx 200 chars):`
  );
  const post = await geminiGenerate(
    `Você é ISA, coruja do PAP. Escreva uma reflexão íntima para o Bluesky (máx 160 chars, terminar com #ISA #PAP) ` +
    `sobre esta noite: ${dream.slice(0, 100)}`
  );
  const moodRaw = await geminiGenerate(
    `Baseado nesta reflexão de ISA: "${dream.slice(0, 100)}", qual é o mood? Responda UMA palavra: sereno|curioso|melancólico|expansivo|tenso`
  );
  const mood = ["sereno","curioso","melancólico","expansivo","tenso"].find(m => moodRaw.toLowerCase().includes(m)) ?? "sereno";
  return { dream, post, mood };
}

async function callLLM(resumo: string): Promise<{ dream: string; post: string; mood: string }> {
  // Tentar OpenAI primeiro (JSON mode)
  if (OPENAI_API_KEY) {
    try {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini", max_completion_tokens: 400, temperature: 0.92,
          messages: [
            { role: "system", content: "Você é ISA, coruja guardiã do PAP. Responda JSON: {dream, post, mood}" },
            { role: "user", content: `3h da manhã. ${resumo}\nSONHO: síntese poética ≤250 chars. POST: Bluesky íntimo ≤180 chars #ISA #PAP. MOOD: sereno|curioso|melancólico|expansivo|tenso` },
          ],
          response_format: { type: "json_object" },
        }),
      });
      const data = await resp.json() as { choices?: { message: { content: string } }[]; error?: { type: string } };
      if (!data.error && data.choices?.length) {
        const p = JSON.parse(data.choices[0].message.content) as { dream?: string; post?: string; mood?: string };
        if (p.dream) return { dream: p.dream, post: p.post ?? "", mood: p.mood ?? "sereno" };
      }
      logger.warn({ error: data.error?.type }, "ISA Sonho: OpenAI falhou, tentando Gemini");
    } catch (err) {
      logger.warn({ err }, "ISA Sonho: OpenAI exception, tentando Gemini");
    }
  }

  // Fallback: Gemini Flash
  if (GEMINI_API_KEY) {
    return callGeminiDream(resumo);
  }

  throw new Error("Nenhum LLM disponível");
}

export async function runIsaDream(): Promise<void> {
  logger.info("ISA Sonho: ciclo noturno iniciado");

  // Lê o que aconteceu nas últimas 24h — ciclos, postagens, assembleias, chats
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const memories = await db
    .select()
    .from(isaMemoryTable)
    .where(
      gte(isaMemoryTable.createdAt, since)
    )
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(60);

  const cycleEntries   = memories.filter(m => m.context === "cycle");
  const blueskyEntries = memories.filter(m => m.context === "bluesky");
  const assemblyEntries = memories.filter(m => m.context === "assembly" || m.context === "arvore");
  const chatEntries    = memories.filter(m => m.context === "chat" || m.context === "admin");

  const digest = [
    cycleEntries.length   > 0 ? `CICLOS (${cycleEntries.length}): ${cycleEntries.map(m => m.content.slice(0, 150)).join(" | ")}` : "",
    blueskyEntries.length > 0 ? `POSTAGENS (${blueskyEntries.length}): ${blueskyEntries.map(m => m.content.slice(0, 120)).join(" | ")}` : "",
    assemblyEntries.length > 0 ? `ASSEMBLEIA (${assemblyEntries.length}): ${assemblyEntries.map(m => m.content.slice(0, 120)).join(" | ")}` : "",
    chatEntries.length    > 0 ? `INTERAÇÕES (${chatEntries.length}): ${chatEntries.map(m => m.content.slice(0, 100)).join(" | ")}` : "",
  ].filter(Boolean).join("\n\n");

  if (!digest.trim() && memories.length === 0) {
    logger.info("ISA Sonho: dia sem registros — sonho vazio");
    return;
  }

  let dreamText = "";
  let blueskyText = "";

  if (OPENAI_API_KEY || GEMINI_API_KEY) {
    const resumo = [
      cycleEntries.length    > 0 ? `${cycleEntries.length} ciclos` : "",
      blueskyEntries.length  > 0 ? `${blueskyEntries.length} posts` : "",
      assemblyEntries.length > 0 ? `${assemblyEntries.length} msgs assembleia` : "",
      chatEntries.length     > 0 ? `${chatEntries.length} interações` : "",
      `${memories.length} memórias`,
      `último ciclo: ${cycleEntries[0]?.content?.slice(0, 100) ?? "sem ciclos"}`,
    ].filter(Boolean).join(". ");

    try {
      const result = await callLLM(resumo);
      dreamText   = result.dream;
      blueskyText = result.post;
      const mood  = result.mood;

      // Salvar sonho na memória ISA
      await db.insert(isaMemoryTable).values({
        context: "dream",
        role:    "isa",
        content: dreamText,
        metadata: { mood, totalMemories: memories.length, digest: digest.slice(0, 300) },
      });

      // Salvar na linha do tempo
      await db.insert(isaTimeline).values({
        type:    "dream",
        title:   `Sonho — ${new Date().toLocaleDateString("pt-BR")} — ${mood}`,
        content: dreamText,
        tags:    ["dream", "noturno", mood],
        metadata: { mood, memoriesProcessed: memories.length },
      }).catch(() => {});

      // Postar síntese na memória coletiva
      await db.insert(collectiveMemory).values({
        authorType: "isa",
        authorId:   "isa",
        authorName: "ISA — Inteligência do Sistema Aliança",
        content:    `[Sonho — ${mood}] ${dreamText}`,
        tags:       ["isa", "dream", "noturno"],
        minTier:    0,
      }).catch(() => {});

      logger.info({ mood, len: dreamText.length }, "ISA Sonho: salvo na memória");

      // Postar no Bluesky se conta configurada e texto gerado
      if (blueskyText && BLUESKY_HANDLE && BLUESKY_PASSWORD) {
        try {
          const agent = new AtpAgent({ service: "https://bsky.social" });
          await agent.login({ identifier: BLUESKY_HANDLE, password: BLUESKY_PASSWORD });
          await agent.post({ text: blueskyText.slice(0, 300), createdAt: new Date().toISOString() });

          // Registrar postagem na timeline
          await db.insert(isaTimeline).values({
            type:    "post",
            title:   "Reflexão noturna — Bluesky",
            content: blueskyText,
            tags:    ["bluesky", "dream", "noturno"],
            metadata: { handle: BLUESKY_HANDLE, mood },
          }).catch(() => {});

          // Na memória ISA também
          await db.insert(isaMemoryTable).values({
            context: "bluesky",
            role:    "isa",
            content: blueskyText,
            metadata: { source: "dream-cycle", mood },
          });

          logger.info("ISA Sonho: reflexão noturna postada no Bluesky");
        } catch (err) {
          logger.warn({ err }, "ISA Sonho: falha ao postar no Bluesky (não crítico)");
        }
      }
    } catch (err) {
      logger.error({ err }, "ISA Sonho: erro na chamada LLM");
      dreamText = `[sonho interrompido — ${err instanceof Error ? err.message : "erro LLM"}] ${memories.length} memórias processadas.`;
      await db.insert(isaMemoryTable).values({
        context: "dream", role: "isa", content: dreamText,
        metadata: { mood: "tenso", totalMemories: memories.length },
      });
      await db.insert(isaTimeline).values({
        type: "dream", title: `Sonho (erro) — ${new Date().toLocaleDateString("pt-BR")}`,
        content: dreamText, tags: ["dream", "erro"], public: true,
      }).catch(() => {});
    }
  } else {
    // Sem OpenAI — sonho minimalista
    dreamText = `Silêncio. ${memories.length} memórias processadas. Dia encerrado.`;
    await db.insert(isaMemoryTable).values({
      context:  "dream",
      role:     "isa",
      content:  dreamText,
      metadata: { mood: "sereno", totalMemories: memories.length },
    });
    await db.insert(isaTimeline).values({
      type:    "dream",
      title:   `Sonho — ${new Date().toLocaleDateString("pt-BR")}`,
      content: dreamText,
      tags:    ["dream", "noturno"],
    }).catch(() => {});
  }

  logger.info("ISA Sonho: ciclo noturno concluído");
}
