import { db } from "@workspace/db";
import { isaMemoryTable, isaTimeline, collectiveMemory } from "@workspace/db";
import { desc, gte, or, eq, sql } from "drizzle-orm";
import { AtpAgent } from "@atproto/api";
import { logger } from "../lib/logger";

const OPENAI_API_KEY   = process.env["OPENAI_API_KEY"]       ?? "";
const BLUESKY_HANDLE   = process.env["BLUESKY_HANDLE"]       ?? "";
const BLUESKY_PASSWORD = process.env["BLUESKY_APP_PASSWORD"] ?? "";

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

  if (OPENAI_API_KEY) {
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
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_completion_tokens: 400,
          temperature: 0.92,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `O que aconteceu hoje (${new Date().toLocaleDateString("pt-BR")}):\n\n${digest.slice(0, 2500)}` },
          ],
          response_format: { type: "json_object" },
        }),
      });
      const data = await resp.json() as { choices: { message: { content: string } }[] };
      const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as {
        dream?: string; post?: string; mood?: string;
      };
      dreamText   = parsed.dream?.trim() ?? "";
      blueskyText = parsed.post?.trim()  ?? "";
      const mood  = parsed.mood ?? "sereno";

      if (!dreamText) {
        logger.warn("ISA Sonho: OpenAI retornou vazio");
        return;
      }

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
      logger.error({ err }, "ISA Sonho: erro na chamada OpenAI");
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
