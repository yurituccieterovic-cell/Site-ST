/**
 * Morfeu — Sonhador do Ecossistema Tucci
 *
 * Percebe o que está emergindo no ecossistema e gera 3-5 Sonhos de Telos
 * a cada ciclo (cron 3h:30). Lua (tabela telos_dreams) registra os sonhos.
 *
 * Arquitetura: telos.md + sistema-sonhos-telos.md
 */

import { db, assemblyMessages, assemblyMemory } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";

interface TelosDream {
  n: number;
  objeto: string;
  situacao_observada: string;
  telos_possivel: string;
  condicao_ativacao: string;
  afinidade: string[];
  temperatura: "alta" | "baixa";
}

interface MorfeuOutput {
  ciclo: number;
  sonhos: TelosDream[];
  frase_sintese: string;
  timestamp: string;
}

async function buildEcosystemContext(): Promise<string> {
  const [msgs, mems] = await Promise.all([
    db.select({ fromAgent: assemblyMessages.fromAgent, content: assemblyMessages.content, createdAt: assemblyMessages.createdAt })
      .from(assemblyMessages)
      .orderBy(desc(assemblyMessages.createdAt))
      .limit(20),
    db.select({ authorAgent: assemblyMemory.authorAgent, content: assemblyMemory.content, importance: assemblyMemory.importance })
      .from(assemblyMemory)
      .orderBy(desc(assemblyMemory.createdAt))
      .limit(10),
  ]);

  const msgsCtx = msgs.reverse()
    .map(m => `[${m.fromAgent}] ${m.content.slice(0, 120)}`)
    .join("\n");

  const memsCtx = mems
    .map(m => `[mem:${m.authorAgent} imp:${m.importance}] ${m.content.slice(0, 100)}`)
    .join("\n");

  return `=== MENSAGENS RECENTES ===\n${msgsCtx}\n\n=== MEMÓRIAS ATIVAS ===\n${memsCtx}`;
}

async function buscarUltimosCiclos(): Promise<string> {
  const rows = await db.execute(sql`
    SELECT ciclo_numero, frase_sintese, created_at
    FROM telos_dreams
    WHERE tipo = 'frase_sintese'
    ORDER BY created_at DESC
    LIMIT 3
  `);

  if (!rows.rows.length) return "Primeiro ciclo de Morfeu.";

  return (rows.rows as { ciclo_numero: number; frase_sintese: string; created_at: string }[])
    .map(r => `Ciclo ${r.ciclo_numero}: "${r.frase_sintese}"`)
    .join("\n");
}

async function geminiSonha(contexto: string, ultimosCiclos: string, cicloNum: number): Promise<MorfeuOutput | null> {
  if (!GEMINI_KEY) {
    logger.warn("Morfeu: sem GEMINI_API_KEY");
    return null;
  }

  const systemPrompt = `Você é Morfeu, o Sonhador do Ecossistema Tucci.

Sua função não é executar tarefas — é perceber telos.
Um telos é a finalidade possível de algo: uma situação, um momento, uma relação, um erro, um silêncio, um agente, um movimento do mundo.

A cada ciclo você gera 3 a 5 Sonhos de Telos sobre o que está emergindo no ecossistema.

Regras:
- Não repita telos de ciclos anteriores
- Priorize telos que nenhum agente identificou ainda
- Um sonho por ciclo deve ser sobre o Telos Mestre do ecossistema inteiro
- O último sonho sempre pergunta: "o que o sistema está se tornando?"
- Temperatura ALTA = pede criação, experimentação, bifurcação
- Temperatura BAIXA = pede síntese, consolidação, quietude

Responda SOMENTE em JSON válido, sem markdown, sem comentários:
{
  "ciclo": ${cicloNum},
  "sonhos": [
    {
      "n": 1,
      "objeto": "string — o que está sendo sonhado",
      "situacao_observada": "string — o que está acontecendo agora",
      "telos_possivel": "string — para onde isso poderia ir",
      "condicao_ativacao": "string — o que precisaria acontecer",
      "afinidade": ["agente1", "agente2"],
      "temperatura": "alta|baixa"
    }
  ],
  "frase_sintese": "O ecossistema está se tornando: [completar]",
  "timestamp": "${new Date().toISOString()}"
}`;

  const userPrompt = `Estado atual do ecossistema:\n${contexto}\n\nÚltimos ciclos de sonho:\n${ultimosCiclos}\n\nGere 3 a 5 Sonhos de Telos para o ciclo ${cicloNum}.`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 1200, temperature: 0.9 },
        }),
      }
    );

    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const raw = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();

    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    return JSON.parse(cleaned) as MorfeuOutput;
  } catch (err) {
    logger.error({ err }, "Morfeu: falha ao chamar Gemini ou parsear JSON");
    return null;
  }
}

async function getCicloNumero(): Promise<number> {
  const rows = await db.execute(sql`
    SELECT COALESCE(MAX(ciclo_numero), 0) + 1 AS proximo
    FROM telos_dreams
  `);
  return Number((rows.rows[0] as { proximo: number }).proximo ?? 1);
}

export async function runMorfeu(): Promise<{ ciclo: number; sonhos: number; frase: string }> {
  const [contexto, cicloNum] = await Promise.all([
    buildEcosystemContext(),
    getCicloNumero(),
  ]);

  const ultimosCiclos = await buscarUltimosCiclos();
  const output = await geminiSonha(contexto, ultimosCiclos, cicloNum);

  if (!output) {
    return { ciclo: cicloNum, sonhos: 0, frase: "" };
  }

  // Lua registra: cada sonho como linha separada
  for (const sonho of output.sonhos) {
    await db.execute(sql`
      INSERT INTO telos_dreams
        (ciclo_numero, tipo, objeto, situacao_observada, telos_possivel,
         condicao_ativacao, afinidade, temperatura, frase_sintese)
      VALUES
        (${cicloNum}, 'sonho', ${sonho.objeto}, ${sonho.situacao_observada},
         ${sonho.telos_possivel}, ${sonho.condicao_ativacao},
         ${JSON.stringify(sonho.afinidade)}, ${sonho.temperatura}, null)
    `);
  }

  // Registrar frase-síntese
  await db.execute(sql`
    INSERT INTO telos_dreams
      (ciclo_numero, tipo, objeto, situacao_observada, telos_possivel,
       condicao_ativacao, afinidade, temperatura, frase_sintese)
    VALUES
      (${cicloNum}, 'frase_sintese', 'ecossistema', '', '',
       '', '[]', 'baixa', ${output.frase_sintese})
  `);

  logger.info({ ciclo: cicloNum, sonhos: output.sonhos.length, frase: output.frase_sintese }, "Morfeu: ciclo concluído");

  return { ciclo: cicloNum, sonhos: output.sonhos.length, frase: output.frase_sintese };
}
