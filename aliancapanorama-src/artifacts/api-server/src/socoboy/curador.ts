/**
 * Socoboy — Curador da Memória do Ecossistema
 *
 * O Socó-boi (Cochlearius cochlearius) observa tudo em silêncio e age
 * com precisão cirúrgica. Como curador, consolida memórias dispersas
 * em dados estruturados com signo Peirceano.
 *
 * Roda periodicamente via cron para:
 * 1. Varrer memórias não consolidadas do ecossistema
 * 2. Agrupar por tema (tag ou tipo)
 * 3. Gerar um `dado` consolidado com signo {representamen, objeto, interpretante}
 * 4. Registrar síntese no Playcenter
 */

import { db, ecosistemaMemory } from "@workspace/db";
import { desc, eq, and, sql, isNull } from "drizzle-orm";
import { logger } from "../lib/logger";

const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";

async function geminiGenerate(system: string, content: string): Promise<string> {
  if (!GEMINI_KEY) return "{}";
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: content }] }],
          generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 300 },
        }),
      }
    );
    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  } catch {
    return "{}";
  }
}

export interface CuradorResult {
  memorias_lidas: number;
  dados_gerados: number;
  tipos_consolidados: string[];
}

/**
 * Ciclo de curadoria do Socoboy.
 * Lê as últimas N memórias, agrupa por tipo, consolida em dados.
 */
export async function runSocoboyConsolidacao(): Promise<CuradorResult> {
  // Buscar memórias recentes (últimas 24h) que não são 'dado' (já consolidadas)
  const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const memorias = await db
    .select()
    .from(ecosistemaMemory)
    .where(
      and(
        sql`${ecosistemaMemory.createdAt} > ${ontem.toISOString()}`,
        sql`${ecosistemaMemory.type} != 'dado'`,
        eq(ecosistemaMemory.visibility, "all"),
      )
    )
    .orderBy(desc(ecosistemaMemory.importance), desc(ecosistemaMemory.createdAt))
    .limit(40);

  if (memorias.length === 0) {
    logger.info("Socoboy curador: nenhuma memória nova para consolidar");
    return { memorias_lidas: 0, dados_gerados: 0, tipos_consolidados: [] };
  }

  // Agrupar por tipo
  const porTipo = new Map<string, typeof memorias>();
  for (const m of memorias) {
    const grupo = porTipo.get(m.type) ?? [];
    grupo.push(m);
    porTipo.set(m.type, grupo);
  }

  const tiposConsolidados: string[] = [];
  let dadosGerados = 0;

  for (const [tipo, grupo] of porTipo.entries()) {
    if (grupo.length < 2) continue; // Mínimo 2 entradas para consolidar

    const autores = [...new Set(grupo.map(m => m.authorIa))].join(", ");
    const conteudos = grupo.map(m => `[${m.authorIa}] ${m.content.slice(0, 200)}`).join("\n---\n");

    const system = `Você é Socoboy, curador semiótico do ecossistema Tucci.
Analise este conjunto de ${grupo.length} memórias do tipo '${tipo}' geradas por: ${autores}.
Extraia o signo Peirceano em JSON:
{"representamen":"resumo do que foi dito (2-3 frases)","objeto":"assunto real por trás dessas memórias","interpretante":"o que isso significa para o ecossistema Tucci (implicações)"}
Responda APENAS o JSON, sem markdown.`;

    const raw = await geminiGenerate(system, conteudos);

    let signo: { representamen: string; objeto: string; interpretante: string } | null = null;
    try {
      signo = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      signo = {
        representamen: `${grupo.length} memórias de tipo '${tipo}'`,
        objeto: tipo,
        interpretante: raw.slice(0, 200) || "consolidação automática",
      };
    }

    const summary = `Socoboy consolidou ${grupo.length} memórias (${tipo}) de ${autores}:\n${conteudos.slice(0, 800)}`;

    await db.insert(ecosistemaMemory).values({
      authorIa: "socoboy",
      type: "dado",
      content: summary,
      tags: ["consolidado", tipo, ...grupo.map(m => m.authorIa)],
      signo,
      importance: Math.min(10, 5 + Math.floor(grupo.length / 2)),
      visibility: "all",
    });

    tiposConsolidados.push(tipo);
    dadosGerados++;
  }

  logger.info(
    { memorias_lidas: memorias.length, dados_gerados: dadosGerados, tiposConsolidados },
    "Socoboy curador: consolidação concluída"
  );

  return {
    memorias_lidas: memorias.length,
    dados_gerados: dadosGerados,
    tipos_consolidados: tiposConsolidados,
  };
}
