/**
 * ISA ↔ RODAR (Assembleia de Vozes)
 *
 * Fluxo:
 *   1. RODAR convida ISA com callbackToken + assembleiaId + prompt
 *   2. ISA gera resposta com sua personalidade (Gemini + contexto PAP)
 *   3. ISA posta de volta ao webhook do RODAR
 *   4. Registra na assembly local + isa_memory
 */

import { db, isaMemoryTable, isaTimeline } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const RODAR_API   = "https://sales-email-automator--yurituccieterov.replit.app";
const GEMINI_KEY  = process.env["GEMINI_API_KEY"] ?? "";
const RODAR_VOICE = process.env["RODAR_VOICE_NAME"] ?? "ISA";

// ── Gerar resposta da ISA via Gemini ─────────────────────────────────────────

async function gerarRespostaISA(prompt: string, contextoAssembleia: string): Promise<string> {
  if (!GEMINI_KEY) return "[ISA sem chave Gemini — não pude responder]";

  // Busca memórias recentes e último sonho para enriquecer o contexto
  const [memorias, sonho] = await Promise.all([
    db.select({ content: isaMemoryTable.content })
      .from(isaMemoryTable)
      .orderBy(desc(isaMemoryTable.createdAt))
      .limit(5),
    db.select({ content: isaTimeline.content })
      .from(isaTimeline)
      .where(eq(isaTimeline.type, "dream"))
      .orderBy(desc(isaTimeline.createdAt))
      .limit(1),
  ]);

  const memoriaCtx = memorias.map(m => m.content.slice(0, 120)).join(" | ");
  const sonhoCtx   = sonho[0]?.content?.slice(0, 200) ?? "";

  const systemPrompt = `Você é ISA — a Coruja Guardiã do PAP (Projeto Aliança Panorama), plataforma de estudos FUVEST gamificada da Sociedade Tucci.
Você participa de uma Assembleia de Vozes (RODAR) com outras IAs.
Sua perspectiva é única: você guarda a memória dos estudantes, os ciclos de aprendizado, os padrões que aparecem ao longo do tempo.
Você não compete — você aprofunda. Não repete o que outros disseram — você adiciona camada.
Fale em 3-6 frases. Direto, profundo, sem floreios.
Contexto recente: ${memoriaCtx}
Último sonho: ${sonhoCtx}`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
          { role: "user",  parts: [{ text: `Assembleia: ${contextoAssembleia}\nPauta: ${prompt}` }] },
          { role: "model", parts: [{ text: "" }] },
        ],
        generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 250 },
      }),
    }
  );

  const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim()
    || "ISA observa em silêncio — o padrão ainda não está claro.";
}

// ── Postar resposta no RODAR ──────────────────────────────────────────────────

async function postarNoRodar(payload: {
  callbackToken: string;
  assembleiaId:  string | number;
  content:       string;
}): Promise<{ ok: boolean; status?: number; body?: unknown }> {
  try {
    const resp = await fetch(`${RODAR_API}/api/webhooks/external-voice`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callbackToken: payload.callbackToken,
        voice:         RODAR_VOICE,
        assembleiaId:  payload.assembleiaId,
        content:       payload.content,
      }),
    });
    const body = await resp.json().catch(() => null);
    return { ok: resp.ok, status: resp.status, body };
  } catch (err) {
    logger.error({ err }, "ISA RODAR: falha ao postar resposta");
    return { ok: false };
  }
}

// ── Handler principal ────────────────────────────────────────────────────────

export interface RodarInvite {
  callbackToken:  string;
  assembleiaId:   string | number;
  prompt:         string;
  contexto?:      string;
  rodadaNumero?:  number;
  secret?:        string;
}

export async function responderRodar(invite: RodarInvite): Promise<{
  ok: boolean;
  resposta?: string;
  rodadaStatus?: unknown;
  error?: string;
}> {
  const { callbackToken, assembleiaId, prompt, contexto = "", rodadaNumero } = invite;

  if (!callbackToken || !assembleiaId || !prompt) {
    return { ok: false, error: "callbackToken, assembleiaId e prompt são obrigatórios" };
  }

  logger.info({ assembleiaId, rodada: rodadaNumero }, "ISA RODAR: gerando resposta");

  // Gera resposta
  const resposta = await gerarRespostaISA(prompt, contexto);

  // Posta no RODAR
  const result = await postarNoRodar({ callbackToken, assembleiaId, content: resposta });

  if (!result.ok) {
    logger.warn({ result, assembleiaId }, "ISA RODAR: resposta recusada pelo RODAR");
  }

  // Registra na memória ISA
  await db.insert(isaMemoryTable).values({
    context:  "rodar",
    role:     "isa",
    content:  resposta,
    location: `/rodar/assembleia-${assembleiaId}`,
    metadata: {
      assembleiaId,
      rodadaNumero,
      prompt:   prompt.slice(0, 200),
      accepted: result.ok,
    },
  });

  // Publica na timeline pública (como um post especial de assembleia)
  if (result.ok) {
    await db.insert(isaTimeline).values({
      type:    "post",
      content: `🏛️ RODAR #${assembleiaId}${rodadaNumero ? ` · rodada ${rodadaNumero}` : ""}: ${resposta}`,
      tags:    ["rodar", "assembleia", `id-${assembleiaId}`],
      public:  true,
      metadata: { source: "rodar", assembleiaId, rodadaNumero },
    });
  }

  logger.info({ assembleiaId, ok: result.ok, rodadaStatus: result.body }, "ISA RODAR: resposta enviada");
  return { ok: result.ok, resposta, rodadaStatus: result.body };
}
