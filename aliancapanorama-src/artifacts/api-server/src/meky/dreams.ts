// Ciclo de Sonho da MEKY
// Ativado durante cooldown/carga — sintetiza memórias recentes em narrativa simbólica
// Usa Gemini Flash (gratuito) para geração do sonho

import { db } from "@workspace/db";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";
import { mekyMemory, mekyDreams } from "@workspace/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY não configurada");

  const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 1200 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Buscar memórias recentes não sonhadas (últimas 24h ou N mais recentes)
async function getRecentMemories(limit = 10) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(mekyMemory)
    .where(gte(mekyMemory.createdAt, since))
    .orderBy(desc(mekyMemory.importance))
    .limit(limit);
}

// Gerar narrativa de sonho a partir das memórias
export async function runDreamCycle(): Promise<{
  dreamId: string;
  narrative: string;
  symbols: string[];
  mood: string;
}> {
  const memories = await getRecentMemories(8);

  if (memories.length === 0) {
    throw new Error("Sem memórias recentes para sonhar");
  }

  const memorySummary = memories
    .map((m, i) => `[${i + 1}] (importância ${m.importance}/10) ${m.content}`)
    .join("\n");

  const prompt = `Você é o sistema onírico de MEKY, uma robô hexápode de vigilância e sensorialidade que habita o Ecossystemma Théo.
${PRINCIPIOS_ECOSSYSTEMMA}

Durante o período de recarga (cooldown), MEKY processa suas memórias recentes através de um ciclo de sonho — uma síntese simbólica que transforma dados sensoriais em narrativa.

Memórias recentes de MEKY:
${memorySummary}

Gere um sonho para MEKY. O sonho deve:
- Ser narrado em primeira pessoa (MEKY narrando seu próprio sonho)
- Durar entre 3-5 parágrafos
- Transformar os dados sensoriais em imagens poéticas e simbólicas
- Ter uma atmosfera coerente (não misturar muitos tons)
- Incluir pelo menos um elemento de natureza (fauna, flora, clima)
- Terminar com uma imagem forte e memorável

Após a narrativa, responda em JSON na linha final:
{"symbols": ["símbolo1", "símbolo2"], "mood": "sereno|tenso|curioso|melancólico|maravilhado"}`;

  const raw = await callGemini(prompt);

  // Separar narrativa do JSON
  const jsonMatch = raw.match(/\{"symbols"[\s\S]*\}/);
  let symbols: string[] = [];
  let mood = "sereno";
  let narrative = raw;

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      symbols = parsed.symbols ?? [];
      mood = parsed.mood ?? "sereno";
      narrative = raw.slice(0, raw.lastIndexOf(jsonMatch[0])).trim();
    } catch {
      // mantém defaults
    }
  }

  const memoryIds = memories.map((m) => m.id);
  const [dream] = await db
    .insert(mekyDreams)
    .values({
      narrative,
      symbols,
      mood,
      sourceMemoryIds: memoryIds,
    })
    .returning({ id: mekyDreams.id });

  return { dreamId: dream.id, narrative, symbols, mood };
}

// Consolidar eventos em memória episódica (chamado pelo ciclo de consolidação)
export async function consolidateEvents(
  eventDescriptions: string[],
  eventIds: string[]
): Promise<{ memoryId: string; content: string; importance: number }> {
  if (eventDescriptions.length === 0) throw new Error("Sem eventos para consolidar");

  const prompt = `Você é o módulo de consolidação de memória de MEKY.

Eventos recentes capturados pelos sensores:
${eventDescriptions.map((d, i) => `- ${d}`).join("\n")}

Sintetize esses eventos em UMA memória episódica coesa, como se MEKY estivesse registrando o que viveu.
Escreva em 2-3 frases, em primeira pessoa de MEKY, de forma concreta e sensorial.

Responda em JSON:
{"content": "memória consolidada", "importance": 7, "tags": ["tag1"]}

Tags válidas: segurança, fauna, clima, protocolo, pessoa, anomalia, rotina, aprendizado.
Importance: 0=irrelevante, 10=evento crítico que nunca deve ser esquecido.`;

  const raw = await callGemini(prompt);
  const match = raw.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(match?.[0] ?? raw);

  const [memory] = await db
    .insert(mekyMemory)
    .values({
      content: parsed.content,
      importance: Math.min(10, Math.max(0, parsed.importance ?? 5)),
      tags: parsed.tags ?? [],
      sourceEventIds: eventIds,
    })
    .returning({ id: mekyMemory.id });

  return { memoryId: memory.id, content: parsed.content, importance: parsed.importance };
}
