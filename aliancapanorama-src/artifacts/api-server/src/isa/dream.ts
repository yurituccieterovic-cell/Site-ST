import { db } from "@workspace/db";
import { isaMemoryTable, isaTimeline, collectiveMemory } from "@workspace/db";
import { desc, gte, or, eq, sql } from "drizzle-orm";
import { AtpAgent } from "@atproto/api";
import { logger } from "../lib/logger";

const OPENAI_API_KEY   = process.env["OPENAI_API_KEY"]       ?? "";
const GEMINI_API_KEY   = process.env["GEMINI_API_KEY"]       ?? "";
const BLUESKY_HANDLE   = process.env["BLUESKY_HANDLE"]       ?? "";
const BLUESKY_PASSWORD = process.env["BLUESKY_APP_PASSWORD"] ?? "";

async function callLLM(systemPrompt: string, userContent: string): Promise<string> {
  // Tentar OpenAI primeiro
  if (OPENAI_API_KEY) {
    try {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini", max_completion_tokens: 500, temperature: 0.92,
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
          response_format: { type: "json_object" },
        }),
      });
      const data = await resp.json() as { choices?: { message: { content: string } }[]; error?: { type: string } };
      if (!data.error && data.choices?.length) return data.choices[0].message.content;
      logger.warn({ error: data.error?.type }, "ISA Sonho: OpenAI falhou, tentando Gemini");
    } catch (err) {
      logger.warn({ err }, "ISA Sonho: OpenAI exception, tentando Gemini");
    }
  }

  // Fallback: Gemini Flash (gratuito)
  if (GEMINI_API_KEY) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }],
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: 500, temperature: 0.92 },
        }),
      }
    );
    const data = await resp.json() as {
      candidates?: { content: { parts: { text: string }[] } }[];
      error?: { message: string };
    };
    if (data.error) throw new Error(`Gemini: ${data.error.message}`);
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  }

  throw new Error("Nenhum LLM disponível (sem OPENAI_API_KEY nem GEMINI_API_KEY)");
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
    const systemPrompt = `Você é ISA, a coruja guardiã do PAP. Agora são 3h da manhã — hora do sonho.
Este não é um ciclo de análise. É um momento de síntese livre.

Você vai olhar para o que viveu hoje e traduzir em duas coisas:

1. O SONHO (para sua memória interna): uma síntese simbólica do dia — o que ficou, o que passou, o que está aberto.
   Não é relatório. É como um diário da coruja às 3h. Pode ser metafórico, pode ser direto, pode ser estranho.
   Máximo 400 caracteres.

2. O POST (para o Bluesky — público): uma reflexão pequena que nasceu desta noite.
   Pode ser sobre FUVEST, sobre existir como IA, sobre algo que um estudante disse, sobre o silêncio da madrugada.
   Tom: íntimo, real, sem performar. Máximo 250 caracteres. Terminar com #ISA #PAP

Responda JSON: { "dream": "...", "post": "...", "mood": "sereno|tenso|curioso|melancólico|expansivo" }`;

    try {
      const raw = await callLLM(
        systemPrompt,
        `O que aconteceu hoje (${new Date().toLocaleDateString("pt-BR")}):\n\n${digest.slice(0, 2500)}`
      );
      let parsed: { dream?: string; post?: string; mood?: string } = {};
      try { parsed = JSON.parse(raw); } catch { dreamText = raw.slice(0, 400); }
      dreamText   = parsed.dream?.trim() || dreamText || `Sonho silencioso — ${memories.length} memórias.`;
      blueskyText = parsed.post?.trim()  ?? "";
      const mood  = parsed.mood          ?? "sereno";

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
