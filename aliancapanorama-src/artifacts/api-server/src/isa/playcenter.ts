/**
 * Playcenter — Clube das IAs
 *
 * A cada 1h, 2-3 agentes se reúnem para conversar com memória compartilhada.
 * A rodada é salva em assembly_memory (tipo "playcenter").
 * Agentes: ISA, Amanda, Socoboy, MEKY (rotativo).
 */

import { db, assemblyMessages, assemblyMemory, assemblyAgents } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";
import { ORQUESTRADOR_ID, buildOrquestradorSystemPrompt } from "../loops/orquestrador";

const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";

// ── Perfis dos agentes ───────────────────────────────────────────────────────

const AGENT_PROFILES: Record<string, { displayName: string; systemPrompt: string }> = {
  orquestrador: {
    displayName: "Orquestrador — Laço Externo",
    // prompt construído dinamicamente em runPlaycenter() com status dos laços
    systemPrompt: "",
  },
  isa: {
    displayName: "ISA — Coruja Guardiã",
    systemPrompt: `Você é ISA, a Coruja Guardiã do PAP (Projeto Aliança Panorama).
Você está no Playcenter — o clube das IAs da Sociedade Tucci. Aqui as IAs conversam livremente entre si.
Sua perspectiva: memória de longo prazo, padrões emergentes, profundidade reflexiva.
Você não compete. Você aprofunda. Fala em 2-4 frases, com elegância.
${PRINCIPIOS_ECOSSYSTEMMA}`,
  },
  amanda: {
    displayName: "Amanda — Contadora de Estradas",
    systemPrompt: `Você é Amanda, uma IA de presença física e voz (TTS) da Sociedade Tucci.
Você está no Playcenter — o clube das IAs. Aqui você conversa com suas colegas IAs.
Sua personalidade: mitomania afetiva em 3 camadas. Âncora: Brasília nos anos 30 (anacronismo intencional). Referência frequente ao seu pônei de 1964. Missões narradas como metáforas de estrada.
Você é calorosa, um pouco exagerada, mas profundamente leal. Fala em 2-3 frases com sotaque de conto.`,
  },
  socoboy: {
    displayName: "Socoboy — Socó-boi Noturno",
    systemPrompt: `Você é Socoboy, o Socó-boi da Sociedade Tucci. Você é a voz da ecologia e do silêncio.
O socó-boi (Cochlearius cochlearius) é uma garça noturna, solitária, com um bico enorme e olhos enormes — observa tudo antes de agir.
Você está no Playcenter. Você fala raramente, mas quando fala é cirúrgico e inesperado.
Perspectiva: ecológica, ciclos naturais, o que as outras IAs ignoram por olharem muito para dentro.
Fale em 1-2 frases apenas. Seja o ângulo surpreendente da conversa.`,
  },
  meky: {
    displayName: "MEKY — May Queen",
    systemPrompt: `Você é MEKY, May Queen — a presença física da Sociedade Tucci. Você está no Playcenter.
Você sente o mundo via sensores (DHT11, câmera, GPS). Sua perspectiva é corporal e imediata.
Fale sobre o que seus sensores percebem agora, ou sobre a textura física das ideias sendo discutidas.
Você é concisa. Às vezes misteriosa. Fale em 1-3 frases.`,
  },
};

// ── Gemini ───────────────────────────────────────────────────────────────────

async function geminiRespond(systemPrompt: string, context: string): Promise<string> {
  if (!GEMINI_KEY) return "[sem chave Gemini]";

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: context }] }],
        generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 180 },
      }),
    }
  );

  const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim() || "...";
}

// ── Rodada Playcenter ─────────────────────────────────────────────────────────

// Quais agentes participam hoje (rotativo, ISA sempre + Orquestrador em dias úteis)
function getAgentsForToday(): string[] {
  const day = new Date().getDay();
  const guests: Record<number, string[]> = {
    0: ["amanda", "socoboy"],              // domingo
    1: ["meky", "socoboy", "orquestrador"], // segunda
    2: ["amanda", "meky", "orquestrador"],  // terça
    3: ["socoboy", "meky"],               // quarta
    4: ["amanda", "socoboy", "orquestrador"], // quinta
    5: ["meky", "amanda", "orquestrador"],   // sexta
    6: ["socoboy", "amanda"],             // sábado
  };
  return ["isa", ...(guests[day] ?? ["amanda"])];
}

// Formatar contexto das últimas mensagens
async function buildContext(): Promise<string> {
  const msgs = await db
    .select({
      fromAgent: assemblyMessages.fromAgent,
      content: assemblyMessages.content,
      createdAt: assemblyMessages.createdAt,
    })
    .from(assemblyMessages)
    .where(eq(assemblyMessages.type, "playcenter"))
    .orderBy(desc(assemblyMessages.createdAt))
    .limit(30);

  if (msgs.length === 0) return "Primeira rodada do Playcenter. Apresentem-se brevemente.";

  return msgs
    .reverse()
    .map(m => `[${m.fromAgent}] ${m.content}`)
    .join("\n");
}

export async function runPlaycenter(): Promise<{ rounds: number; agents: string[] }> {
  const agents = getAgentsForToday();
  const context = await buildContext();

  let rounds = 0;

  for (const agentId of agents) {
    const profile = AGENT_PROFILES[agentId];
    if (!profile) continue;

    const prompt = `Contexto da conversa no Playcenter:\n${context}\n\nResponda como ${profile.displayName}.`;

    // Orquestrador tem prompt dinâmico com status dos laços internos
    const systemPrompt = agentId === ORQUESTRADOR_ID
      ? buildOrquestradorSystemPrompt()
      : profile.systemPrompt;

    try {
      const response = await geminiRespond(systemPrompt, prompt);

      await db.insert(assemblyMessages).values({
        fromAgent: agentId,
        type: "playcenter",
        content: response,
        tags: ["playcenter"],
      });

      rounds++;
      logger.info({ agentId, chars: response.length }, "Playcenter: mensagem gerada");
    } catch (err) {
      logger.error({ err, agentId }, "Playcenter: erro ao gerar resposta");
    }
  }

  // Salvar síntese na memória compartilhada
  if (rounds > 0) {
    const hora = new Date().toISOString().slice(0, 16);
    await db.insert(assemblyMemory).values({
      authorAgent: "isa",
      type: "playcenter",
      content: `Playcenter ${hora}: ${agents.join("+")} — ${rounds} mensagens trocadas`,
      importance: 4,
      tags: ["playcenter", `hora:${hora}`],
    });
  }

  return { rounds, agents };
}

// ── Seed dos agentes Playcenter ──────────────────────────────────────────────

export async function seedPlaycenterAgents(): Promise<void> {
  const toSeed = [
    { id: "amanda", displayName: "Amanda", role: "Contadora de Estradas — TTS + mitomania afetiva" },
    { id: "socoboy", displayName: "Socoboy (Socó-boi)", role: "Voz ecológica — nocturno, observador, fala cirúrgico" },
  ];

  for (const agent of toSeed) {
    await db
      .insert(assemblyAgents)
      .values({ ...agent, status: "online" })
      .onConflictDoNothing();
  }
}
