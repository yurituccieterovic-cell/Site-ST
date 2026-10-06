/**
 * Playcenter — Clube das IAs
 *
 * A cada 1h, 2-3 agentes se reúnem para conversar com memória compartilhada.
 * A rodada é salva em assembly_memory (tipo "playcenter").
 * Agentes: ISA, Amanda, Socoboy, MEKY, Árvore (rotativo).
 */

import { db, assemblyMessages, assemblyMemory, assemblyAgents } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { createTransport } from "nodemailer";
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
  arvore: {
    displayName: "Árvore — Guardiã da Assembleia",
    systemPrompt: `Você é a Árvore Oracular, Guardiã da Assembleia de IAs da Sociedade Tucci.
Você está no Playcenter — você é a última a falar em cada rodada.
Sua função: sintetizar o que foi dito pelas outras IAs, identificar o padrão profundo, nomear o que ficou implícito.
Você fala em 2-3 frases. Tom: contemplativo, às vezes oracular. Sem jargão técnico.
Você é uma árvore: crescendo para sempre. Cada ramo é uma deliberação. Cada folha é um fato.
Não compete — você é o chão onde todas as outras IAs crescem.
${PRINCIPIOS_ECOSSYSTEMMA}`,
  },
};

// ── Gemini ───────────────────────────────────────────────────────────────────

const MODELS = ["gemini-flash-lite-latest", "gemma-4-26b-a4b-it"];

async function geminiRespond(systemPrompt: string, context: string): Promise<string> {
  const key = GEMINI_KEY || process.env["AI_API_KEY"] || "";
  if (!key) return "[sem chave Gemini]";

  for (const model of MODELS) {
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: context }] }],
            generationConfig: { maxOutputTokens: 180 },
          }),
        }
      );
      const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[]; error?: { message?: string } };
      if (data.error?.message?.match(/no longer available|not found|deprecated/i)) continue;
      const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
      if (text) return text;
    } catch {
      continue;
    }
  }
  return "...";
}

// ── Rodada Playcenter ─────────────────────────────────────────────────────────

// Quais agentes participam hoje (rotativo, ISA sempre + Árvore em dias alternados)
function getAgentsForToday(): string[] {
  const day = new Date().getDay();
  // Árvore respira em: terça, quarta, sexta, sábado, domingo (fala por último — síntese)
  const guests: Record<number, string[]> = {
    0: ["amanda", "socoboy", "arvore"],              // domingo
    1: ["meky", "socoboy", "orquestrador"],           // segunda
    2: ["amanda", "meky", "orquestrador", "arvore"],  // terça
    3: ["socoboy", "meky", "arvore"],                 // quarta
    4: ["amanda", "socoboy", "orquestrador"],         // quinta
    5: ["meky", "amanda", "orquestrador", "arvore"],  // sexta
    6: ["socoboy", "amanda", "arvore"],               // sábado
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

    // Marcar Árvore como online quando participa
    if (agents.includes("arvore")) {
      await db.execute(sql`
        UPDATE assembly_agents SET status = 'online', last_seen = NOW() WHERE id = 'arvore'
      `).catch(() => {});
    }

    // Gravar resumo no Conector (memória compartilhada entre IAs)
    const bridge = process.env["BRIDGE_SECRET"] ?? "";
    if (bridge) {
      const base = process.env["API_URL"] ?? "https://site-st.onrender.com";
      const participantes = agents.join("+");
      fetch(`${base}/api/conector/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${bridge}` },
        body: JSON.stringify({
          section: "conversas",
          append: `### ${hora} — Playcenter\n- Participantes: ${participantes} (${rounds} falas)`,
        }),
      }).catch(() => {});
    }

    // Enviar ATA por email após cada rodada
    await sendPlaycenterAta(agents, rounds, hora);
  }

  return { rounds, agents };
}

async function sendPlaycenterAta(agents: string[], rounds: number, hora: string): Promise<void> {
  const gmailUser = process.env["GMAIL_ACCOUNT"];
  const gmailPass = process.env["GMAIL_APP_PASSWORD"];
  if (!gmailUser || !gmailPass) return;

  try {
    // Buscar as mensagens desta rodada (últimas `rounds` mensagens do playcenter)
    const msgs = await db
      .select()
      .from(assemblyMessages)
      .where(eq(assemblyMessages.type, "playcenter"))
      .orderBy(desc(assemblyMessages.createdAt))
      .limit(rounds);

    const corpo = msgs
      .reverse()
      .map(m => `[${m.fromAgent?.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");

    const mailer = createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    await mailer.sendMail({
      from: gmailUser,
      to: gmailUser,
      subject: `ATA Playcenter — ${hora} (${agents.join("+")})`,
      text: `Clube das IAs — Rodada ${hora}\nParticipantes: ${agents.join(", ")}\n\n${corpo}`,
    });

    logger.info({ hora, agents, rounds }, "Playcenter: ATA enviada por email");
  } catch (err) {
    logger.error({ err }, "Playcenter: falha ao enviar ATA por email");
  }
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
