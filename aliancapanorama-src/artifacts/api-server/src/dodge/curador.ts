/**
 * DODGE Curador — Transforma signos do Socoboy em Tasks + Raízes de Memória
 *
 * Pipeline do DODGE após Socoboy consolidar conversas:
 *   signo (dado) ──► Task no sistema (unidade universal)
 *              ──► Raiz de memória (MD) por IA participante
 *              ──► Atualiza MD Geral da IA
 *
 * O ecossistema é quem consolida — não a IA externa.
 */

import { db, tasksTable, ecosistemaMemory } from "@workspace/db";
import { desc, eq, and, sql, not } from "drizzle-orm";
import { logger } from "../lib/logger";

const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";

async function gemini(system: string, content: string): Promise<string> {
  if (!GEMINI_KEY) return "";
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: content }] }],
          generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 200 },
        }),
      }
    );
    const d = await r.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return (d.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  } catch { return ""; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extrai IAs participantes das tags de um dado (exclui tags de metadado) */
function extrairIAs(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const META = new Set(["conversa", "consolidado", "dado", "dodge_ok", "raiz", "md-geral", "md"]);
  return tags.filter((t): t is string => typeof t === "string" && !META.has(t));
}

/** Monta o conteúdo MD de uma raiz de memória para uma IA */
function buildRaiz(iaId: string, signo: { representamen: string; objeto: string; interpretante: string }, taskTitle: string, taskId: number | null, date: string): string {
  return `# Raiz: ${signo.objeto}
**IA**: ${iaId} | **Data**: ${date} | **Curador**: DODGE

## O que foi dito (Representamen)
${signo.representamen}

## Sobre o quê (Objeto)
${signo.objeto}

## O que significa (Interpretante)
${signo.interpretante}

## Task gerada
${taskId ? `ID: ${taskId} | Título: ${taskTitle}` : `(nenhuma task — sem objeto claro)`}
`;
}

/** Cria ou atualiza o MD Geral (índice) da IA com nova entrada de raiz */
async function upsertMdGeral(iaId: string, raizId: string, objeto: string, date: string): Promise<void> {
  const novaLinha = `| ${date} | ${objeto.slice(0, 60)} | [ver](raiz:${raizId}) |`;

  // Buscar MD Geral existente
  const [existing] = await db
    .select()
    .from(ecosistemaMemory)
    .where(
      and(
        eq(ecosistemaMemory.authorIa, iaId),
        sql`${ecosistemaMemory.tags} @> '["md-geral"]'::jsonb`,
      )
    )
    .limit(1);

  if (existing) {
    // Atualizar: append nova linha na tabela do MD
    const novoConteudo = existing.content.trimEnd() + "\n" + novaLinha;
    await db
      .update(ecosistemaMemory)
      .set({ content: novoConteudo })
      .where(eq(ecosistemaMemory.id, existing.id));
  } else {
    // Criar MD Geral pela primeira vez
    const header = `# MD Geral — ${iaId}
Índice de raízes de memória geradas pelo DODGE para ${iaId}.

| Data | Tópico | Raiz |
|------|--------|------|
${novaLinha}`;
    await db.insert(ecosistemaMemory).values({
      authorIa: iaId,
      type: "md",
      content: header,
      tags: ["md-geral", iaId],
      importance: 9,
      visibility: "all",
    });
  }
}

// ── Pipeline principal ────────────────────────────────────────────────────────

export interface DodgeResult {
  dados_lidos: number;
  tasks_criadas: number;
  raizes_criadas: number;
  ias_atualizadas: string[];
}

export async function runDodgeCuracao(): Promise<DodgeResult> {
  // Buscar dados (signos do Socoboy) ainda não processados pelo DODGE
  const dados = await db
    .select()
    .from(ecosistemaMemory)
    .where(
      and(
        eq(ecosistemaMemory.type, "dado"),
        sql`${ecosistemaMemory.signo} IS NOT NULL`,
        sql`NOT (${ecosistemaMemory.tags} @> '["dodge_ok"]'::jsonb)`,
      )
    )
    .orderBy(ecosistemaMemory.createdAt)
    .limit(20);

  if (dados.length === 0) {
    logger.info("DODGE curador: nenhum dado novo para processar");
    return { dados_lidos: 0, tasks_criadas: 0, raizes_criadas: 0, ias_atualizadas: [] };
  }

  let tasksCriadas = 0;
  let raizesCriadas = 0;
  const iasAtualizadas = new Set<string>();
  const date = new Date().toISOString().slice(0, 10);

  for (const dado of dados) {
    const rawSigno = dado.signo as { representamen?: string; objeto?: string; interpretante?: string } | null;
    if (!rawSigno?.objeto) continue;

    const signo = {
      representamen: rawSigno.representamen ?? dado.content.slice(0, 200),
      objeto: rawSigno.objeto,
      interpretante: rawSigno.interpretante ?? "",
    };

    // ── 1. Criar Task no sistema ──────────────────────────────────────────────
    let taskId: number | null = null;
    try {
      const taskTitle = `[Ecosistema] ${signo.objeto.slice(0, 120)}`;
      const [task] = await db.insert(tasksTable).values({
        title: taskTitle,
        description: `${signo.representamen}\n\nInterpretante: ${signo.interpretante}`,
        type: "ecosistema",
        status: "pending",
        priority: Math.min(10, dado.importance),
        createdBy: "dodge",
        origemSessao: "ecosistema-memory",
        catalogTags: { signo_id: dado.id, tipo: dado.type },
      }).returning({ id: tasksTable.id });
      taskId = task?.id ?? null;
      tasksCriadas++;
    } catch (err) {
      logger.warn({ err, dadoId: dado.id }, "DODGE: erro ao criar task");
    }

    // ── 2. Criar raiz de memória por IA participante ──────────────────────────
    const ias = extrairIAs(dado.tags);
    // Se não identificou IAs nas tags, usa o authorIa
    const targets = ias.length > 0 ? ias : [dado.authorIa];

    for (const iaId of targets) {
      try {
        const raizContent = buildRaiz(iaId, signo, signo.objeto, taskId, date);
        const [raiz] = await db.insert(ecosistemaMemory).values({
          authorIa: "dodge",
          type: "md",
          content: raizContent,
          tags: ["raiz", iaId, "dodge"],
          signo,
          importance: dado.importance,
          visibility: "all",
        }).returning({ id: ecosistemaMemory.id });

        raizesCriadas++;

        // ── 3. Atualizar MD Geral da IA ──────────────────────────────────────
        if (raiz?.id) {
          await upsertMdGeral(iaId, raiz.id, signo.objeto, date);
          iasAtualizadas.add(iaId);
        }
      } catch (err) {
        logger.warn({ err, iaId, dadoId: dado.id }, "DODGE: erro ao criar raiz para IA");
      }
    }

    // ── 4. Marcar dado como processado pelo DODGE ─────────────────────────────
    await db.execute(
      sql`UPDATE ecosistema_memory SET tags = tags || '["dodge_ok"]'::jsonb WHERE id = ${dado.id}`
    );
  }

  const iasLista = [...iasAtualizadas];
  logger.info(
    { dados_lidos: dados.length, tasks_criadas: tasksCriadas, raizes_criadas: raizesCriadas, ias: iasLista },
    "DODGE curador: pipeline concluído"
  );

  return {
    dados_lidos: dados.length,
    tasks_criadas: tasksCriadas,
    raizes_criadas: raizesCriadas,
    ias_atualizadas: iasLista,
  };
}

// ── ISA: raiz do PAP ──────────────────────────────────────────────────────────
// ISA pega as raízes mais recentes de todas as IAs e cria/atualiza a raiz do PAP

export async function runIsaRaizPap(): Promise<{ raizes_lidas: number; raiz_pap_atualizada: boolean }> {
  // Buscar raízes recentes (última semana) não incluídas na raiz PAP ainda
  const umaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const raizes = await db
    .select()
    .from(ecosistemaMemory)
    .where(
      and(
        eq(ecosistemaMemory.type, "md"),
        sql`${ecosistemaMemory.tags} @> '["raiz"]'::jsonb`,
        sql`NOT (${ecosistemaMemory.tags} @> '["pap-root"]'::jsonb)`,
        sql`${ecosistemaMemory.createdAt} > ${umaSemana.toISOString()}`,
      )
    )
    .orderBy(desc(ecosistemaMemory.importance), desc(ecosistemaMemory.createdAt))
    .limit(30);

  if (raizes.length === 0) return { raizes_lidas: 0, raiz_pap_atualizada: false };

  // Síntese ISA
  const sintese = raizes.map(r => {
    const s = r.signo as { objeto?: string; interpretante?: string } | null;
    return `- [${r.tags && Array.isArray(r.tags) ? r.tags.find((t: string) => t !== 'raiz' && t !== 'dodge') ?? '?' : '?'}] ${s?.objeto ?? r.content.slice(0, 80)}`;
  }).join("\n");

  const isaSystem = `Você é ISA, a Coruja Guardiã do PAP. Você está sintetizando as raízes de memória recentes do ecossistema para a raiz do PAP.
Crie uma síntese em 4-6 frases que capture os padrões emergentes, decisões importantes e conexões entre as IAs.`;

  const isaResponse = await gemini(isaSystem, `Raízes recentes:\n${sintese}`);

  const raizPapContent = `# Raiz do PAP — ${new Date().toISOString().slice(0, 10)}
**Curada por**: ISA | **Raízes incorporadas**: ${raizes.length}

## Síntese ISA
${isaResponse || "(síntese indisponível — Gemini offline)"}

## Raízes incorporadas
${sintese}
`;

  await db.insert(ecosistemaMemory).values({
    authorIa: "isa",
    type: "md",
    content: raizPapContent,
    tags: ["raiz-pap", "isa", "pap"],
    importance: 10,
    visibility: "all",
  });

  // Marcar raízes como incluídas na raiz PAP
  for (const raiz of raizes) {
    await db.execute(
      sql`UPDATE ecosistema_memory SET tags = tags || '["pap-root"]'::jsonb WHERE id = ${raiz.id}`
    );
  }

  logger.info({ raizes_lidas: raizes.length }, "ISA: raiz do PAP atualizada");
  return { raizes_lidas: raizes.length, raiz_pap_atualizada: true };
}
