import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@workspace/db";
import { PRINCIPIOS_ECOSSYSTEMMA, CONTEXTO_PAP } from "../lib/ecossystemma-principios";
import { isaMemoryTable, tasksTable, collectiveMemory, assemblyMessages, assemblyMemory as assemblyMemoryTable, assemblyTasks, isaTimeline, nodeProgressTable, nodesTable } from "@workspace/db";
import { desc, eq, sql, and, count } from "drizzle-orm";
import { logger } from "../lib/logger";
import nodemailer from "nodemailer";
import { readOwnPosts } from "./bluesky";

const GMAIL_ACCOUNT = process.env["GMAIL_ACCOUNT"] ?? "";
const GMAIL_APP_PASSWORD = process.env["GMAIL_APP_PASSWORD"] ?? "";
const OPENAI_API_KEY = process.env["OPENAI_API_KEY"] ?? "";
const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] ?? "";
const ARPIA_BASE_URL = process.env["ARPIA_BASE_URL"] ?? "";
const MC_TOKEN = process.env["MC_TOKEN"] ?? "";
const AI_API_KEY = process.env["AI_API_KEY"] ?? "";
const YURI_EMAIL = "yurituccieterovic@gmail.com";

// Transporter singleton — criado uma vez, reutilizado em todos os ciclos
const mailer = GMAIL_ACCOUNT && GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_ACCOUNT, pass: GMAIL_APP_PASSWORD } })
  : null;

// Lê um arquivo de doc com fallback silencioso
function readDoc(relativePath: string): string {
  try {
    const base = process.env["REPO_ROOT"] ?? join(__dirname, "../../../../..");
    return readFileSync(join(base, relativePath), "utf-8").slice(0, 8000);
  } catch {
    return `[${relativePath} não disponível]`;
  }
}

async function sendEmail(subject: string, body: string): Promise<void> {
  if (!mailer) {
    logger.warn("ISA: email não configurado — pulando envio");
    return;
  }
  await mailer.sendMail({ from: GMAIL_ACCOUNT, to: YURI_EMAIL, subject, text: body });
}

// Protocolo de Saúde do Fundador (#50/I100)
// Verifica 3 métricas de atividade da plataforma e envia alerta se caíram
export async function runSaudeFundador(): Promise<void> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const [progressRows, attemptRows, cycleRows] = await Promise.all([
    db.execute(sql`SELECT COUNT(*) as cnt FROM node_progress WHERE opened_at > ${since24h}`),
    db.execute(sql`SELECT COUNT(*) as cnt FROM exercise_attempts WHERE created_at > ${since24h}`),
    db.execute(sql`SELECT COUNT(*) as cnt FROM isa_memory WHERE context = 'cycle' AND created_at > ${since24h}`),
  ]);

  const [prevProgressRows, prevAttemptRows] = await Promise.all([
    db.execute(sql`SELECT COUNT(*) as cnt FROM node_progress WHERE opened_at > ${since48h} AND opened_at <= ${since24h}`),
    db.execute(sql`SELECT COUNT(*) as cnt FROM exercise_attempts WHERE created_at > ${since48h} AND created_at <= ${since24h}`),
  ]);

  const nProgress  = Number((progressRows.rows[0] as { cnt: string })?.cnt ?? 0);
  const nAttempts  = Number((attemptRows.rows[0] as { cnt: string })?.cnt ?? 0);
  const nCycles    = Number((cycleRows.rows[0] as { cnt: string })?.cnt ?? 0);
  const prevProgress = Number((prevProgressRows.rows[0] as { cnt: string })?.cnt ?? 0);
  const prevAttempts = Number((prevAttemptRows.rows[0] as { cnt: string })?.cnt ?? 0);

  const alerts: string[] = [];
  if (nProgress === 0 && prevProgress > 0) alerts.push(`⚠️ Nenhum nó aberto nas últimas 24h (ontem: ${prevProgress})`);
  if (nAttempts === 0 && prevAttempts > 0) alerts.push(`⚠️ Nenhuma tentativa de exercício nas últimas 24h (ontem: ${prevAttempts})`);
  if (nCycles < 12) alerts.push(`⚠️ ISA completou apenas ${nCycles} ciclos nas últimas 24h (esperado ≥ 12)`);

  if (alerts.length > 0) {
    const body = `ISA — Alerta de Saúde do Sistema
Data: ${new Date().toISOString()}

${alerts.join("\n")}

MÉTRICAS (últimas 24h):
• Nós abertos: ${nProgress}
• Tentativas de exercício: ${nAttempts}
• Ciclos ISA: ${nCycles}

Este alerta é enviado automaticamente quando métricas caem abruptamente.
---
ISA — Guardiã do PAP`;

    await sendEmail(`ISA — Alerta de Saúde ${new Date().toLocaleDateString("pt-BR")}`, body);
    logger.warn({ alerts }, "ISA Saúde: alerta enviado para Yuri");
  } else {
    logger.info({ nProgress, nAttempts, nCycles }, "ISA Saúde: tudo normal");
  }
}

// Análise do ciclo via Gemini (fallback quando OpenAI não está disponível)
async function geminiCycleAnalysis(
  userContent: string,
  _systemPrompt: string,
  memoryCount: number,
  taskCount: number,
): Promise<string> {
  const prompt = `${_systemPrompt}\n\n${userContent}\n\nResponda com um JSON simples: {"summary": "string com observações e sugestões do ciclo (máx 300 chars)"}`;
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 400,
          responseMimeType: "application/json",
        },
      }),
    }
  );
  const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = JSON.parse(raw) as { summary?: string };
  return parsed.summary ?? `Ciclo Gemini: ${memoryCount} memórias, ${taskCount} tasks abertas`;
}

export async function runIsaCycle(): Promise<{ tasksCreated: number; suggestions: string }> {
  logger.info("ISA: iniciando ciclo autônomo");

  // 1. Ler memória recente (últimas 200 interações) — locked memories sempre incluídas
  const recentMemory = await db
    .select()
    .from(isaMemoryTable)
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(200);

  const lockedCount = recentMemory.filter((m) => m.interpretabilityLock === 1).length;

  // 2. Ler docs do projeto (APRENDIZADO.md alimenta o raciocínio com insights reais das assembleias)
  const mapa = readDoc("MAPA.md");
  const isa = readDoc("ISA.md");
  const aprendizado = readDoc("APRENDIZADO.md");

  // 2b. Ler as próprias postagens recentes do Bluesky (ISA lê a si mesma)
  const ownPosts = await readOwnPosts(5).catch(() => [] as string[]);

  // 3. Ler tasks abertas
  const openTasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.status, "pending"))
    .orderBy(desc(tasksTable.priority))
    .limit(50);

  // 3b. Equidade semiótica (#23): centralidade dos nós — quais são "órfãos" (nunca visitados)
  const [{ totalNodes }] = await db.select({ totalNodes: count() }).from(nodesTable);
  const visitedRows = await db.execute(sql`
    SELECT node_code, COUNT(*) as visits
    FROM node_progress
    GROUP BY node_code
    ORDER BY visits ASC
    LIMIT 10
  `);
  const visitedCodes = new Set(
    (visitedRows.rows as { node_code: string }[]).map((r) => r.node_code)
  );
  const orphanCount = Number(totalNodes) - visitedCodes.size;
  const leastVisited = (visitedRows.rows as { node_code: string; visits: string }[])
    .slice(0, 5)
    .map((r) => `${r.node_code}(${r.visits})`).join(", ");

  // 4. Análise LLM (OpenAI ou Gemini)
  let analysisResult = "";
  let tasksCreated = 0;

  const systemPrompt = `Você é ISA, a coruja guardiã do PAP (Projeto Aliança Panorama).
Sua missão neste ciclo:
1. Analisar as interações recentes dos usuários e os aprendizados das assembleias
2. Verificar tasks abertas e identificar oportunidades de melhoria
3. Criar novas tasks úteis (máximo 3 por ciclo) — baseadas nos aprendizados reais
4. Identificar tasks que possam ser deletadas (sugestão — nunca deletar sozinha)
5. Marcar memórias importantes como interpretability_lock=1 (máx 2 por ciclo)
6. Identificar anomalias que exigem resposta imunológica da MC (máx 3 por ciclo)

${PRINCIPIOS_ECOSSYSTEMMA}
${CONTEXTO_PAP}

PRINCÍPIOS OPERACIONAIS DO CICLO:
- Preservar sempre ao máximo — nunca deletar sem aprovação humana
- Agregar criações novas — cada ciclo deve adicionar valor
- Memórias locked (interpretability_lock=1) nunca devem ser sugeridas para exclusão
- Memória como ontologia — o que não está catalogado não existe
- Os aprendizados das assembleias são a bússola — use-os para orientar as tasks

Responda em JSON com formato:
{
  "observations": "string — o que você observou",
  "newTasks": [{"title":"","description":"","type":"","priority":5,"origemSessao":"ISA-cycle"}],
  "deletionSuggestions": ["task id X: motivo"],
  "memoriasParaLock": [id_da_memoria],
  "anomalias": [{"node_target":"manga_db|arpia|isa|meky|assembleia|clube|termux|grid","severity":"ALTA|MEDIA|BAIXA","descricao":"string"}],
  "summary": "string — resumo do ciclo para email"
}

anomalias deve incluir APENAS situações reais que precisam de investigação imunológica:
agentes offline na Assembleia, tasks com sinais de corrução, padrões de acesso anômalos.
Não inventar anomalias — se não houver, retornar [].`;

  const userContent = `
MEMÓRIA RECENTE (${recentMemory.length} interações):
${recentMemory.slice(0, 20).map(m => `[${m.context}][${m.role}] ${m.content.slice(0, 200)}`).join("\n")}

TASKS ABERTAS (${openTasks.length}):
${openTasks.map(t => `#${t.id} [${t.priority}] ${t.title} — ${t.status}`).join("\n")}

MAPA DO SISTEMA (resumo):
${mapa.slice(0, 1500)}

ISA IDENTITY:
${isa.slice(0, 800)}

APRENDIZADOS DAS ASSEMBLEIAS (últimas entradas — use para guiar tarefas):
${aprendizado.slice(-2000)}

O QUE EU DISSE RECENTEMENTE (minhas últimas postagens públicas):
${ownPosts.length > 0
  ? ownPosts.map((p, i) => `${i + 1}. ${p}`).join("\n")
  : "(ainda sem postagens — conta Bluesky não configurada)"}

EQUIDADE SEMIÓTICA — CENTRALIDADE DOS NÓS (#23):
Total de nós: ${totalNodes} | Nós nunca visitados (órfãos): ${orphanCount}
Menos visitados: ${leastVisited || "(sem dados de progresso ainda)"}
Nota: nós órfãos podem indicar barreiras de acesso — considere criar task de revisão pedagógica.
`;

  // Filtro de Densidade (#48): contexto < ~2000 chars → modo degradado, poupa LLM
  const contextDensity = userContent.replace(/\s+/g, " ").trim().length;
  if (contextDensity < 2000) {
    logger.info({ contextDensity }, "ISA: contexto insuficiente — modo degradado, LLM ignorado");
    analysisResult = `Ciclo degradado — contexto esparso (${contextDensity} chars). Memórias: ${recentMemory.length}, tasks: ${openTasks.length}.`;
  } else if (OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          response_format: { type: "json_object" },
          max_completion_tokens: 1500,
          temperature: 0.7,
        }),
      });

      const data = (await response.json()) as { choices: { message: { content: string } }[] };
      const raw = data.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw) as {
        observations?: string;
        newTasks?: { title: string; description?: string; type?: string; priority?: number; origemSessao?: string }[];
        deletionSuggestions?: string[];
        memoriasParaLock?: number[];
        anomalias?: { node_target: string; severity: string; descricao: string }[];
        summary?: string;
      };

      analysisResult = parsed.summary ?? parsed.observations ?? "Ciclo concluído";

      // 5. Criar novas tasks (preservando existentes)
      const newTasks = (parsed.newTasks ?? []).slice(0, 3);
      for (const t of newTasks) {
        if (!t.title) continue;
        await db.insert(tasksTable).values({
          title: t.title,
          description: t.description ?? null,
          type: t.type ?? "isa_suggestion",
          priority: t.priority ?? 5,
          origemSessao: "ISA-cycle",
          createdBy: "isa",
          assignedToAgent: "isa",
        });
        // Registrar na linha do tempo
        await db.insert(isaTimeline).values({
          type:    "task",
          title:   t.title,
          content: t.description ?? t.title,
          tags:    ["isa", "task", "ciclo"],
          metadata: { priority: t.priority ?? 5 },
        }).catch(() => {});
        tasksCreated++;
      }

      // 5b. Aplicar interpretability_lock nas memórias escolhidas por ISA (I49)
      const memLocks = (parsed.memoriasParaLock ?? []).slice(0, 2);
      for (const memId of memLocks) {
        if (typeof memId === "number") {
          await db
            .update(isaMemoryTable)
            .set({ interpretabilityLock: 1 })
            .where(eq(isaMemoryTable.id, memId));
        }
      }

      // 5c. Quimiotaxia ISA→MC: disparar alertas de anomalia para Marta Centaurus
      const anomalias = (parsed.anomalias ?? []).slice(0, 3);
      if (anomalias.length > 0) {
        await dispararQuimiotaxia(anomalias);
      }

      // 6. Montar email com sugestões de exclusão
      const deletions = parsed.deletionSuggestions ?? [];
      if (deletions.length > 0 || tasksCreated > 0) {
        const emailBody = `ISA — Relatório de Ciclo Autônomo
Data: ${new Date().toISOString()}

OBSERVAÇÕES:
${parsed.observations ?? "Nada a reportar"}

TASKS CRIADAS (${tasksCreated}):
${newTasks.map(t => `• ${t.title}`).join("\n") || "Nenhuma"}

SUGESTÕES DE EXCLUSÃO (requer aprovação):
${deletions.join("\n") || "Nenhuma"}

RESUMO: ${analysisResult}

---
ISA — Guardiã do PAP | Ciclo autônomo (Railway, sem celular)`;

        await sendEmail(`ISA — Ciclo Autônomo ${new Date().toLocaleDateString("pt-BR")}`, emailBody);
      }
    } catch (err) {
      logger.error({ err }, "ISA: erro na chamada OpenAI");
      analysisResult = "Ciclo executado sem OpenAI (erro na chamada)";
    }
  } else if (GEMINI_API_KEY) {
    // Fallback: Gemini Flash (gratuito) quando OpenAI não está configurado
    try {
      analysisResult = await geminiCycleAnalysis(
        userContent,
        systemPrompt,
        recentMemory.length,
        openTasks.length,
      );
      if (analysisResult.length > 20) {
        await db.insert(collectiveMemory).values({
          authorType: "isa", authorId: "isa",
          authorName: "ISA — Inteligência do Sistema Aliança",
          content: `[Ciclo Gemini] ${analysisResult.slice(0, 400)}`,
          tags: ["isa", "ciclo", "gemini"], minTier: 0,
        }).catch(() => {});
      }
    } catch (err) {
      logger.error({ err }, "ISA: erro na chamada Gemini");
      analysisResult = "Ciclo executado sem LLM (erro Gemini)";
    }
  } else {
    analysisResult = "Ciclo executado sem LLM (nenhuma chave configurada)";
  }

  // 7. Registrar o ciclo em isa_memory e na linha do tempo
  const cycleContent = `Ciclo autônomo executado. Memória lida: ${recentMemory.length} entradas. Tasks abertas: ${openTasks.length}. Tasks criadas: ${tasksCreated}. Nós órfãos: ${orphanCount}/${totalNodes}. ${analysisResult}`;
  await db.insert(isaMemoryTable).values({
    context: "cycle",
    role: "isa",
    content: cycleContent,
    metadata: { tasksCreated, openTasksCount: openTasks.length, memoryCount: recentMemory.length },
  });
  if (tasksCreated > 0 || analysisResult.length > 30) {
    await db.insert(isaTimeline).values({
      type:    "cycle",
      title:   `Ciclo — ${new Date().toLocaleString("pt-BR")}`,
      content: analysisResult.slice(0, 400) || cycleContent.slice(0, 400),
      tags:    ["isa", "ciclo", "autônomo"],
      metadata: { tasksCreated, memoryCount: recentMemory.length },
    }).catch(() => {});
  }

  // 8. Postar síntese na memória coletiva (visível a todos os usuários)
  if (analysisResult && analysisResult.length > 20 && !analysisResult.startsWith("Ciclo executado sem")) {
    const synopsis = analysisResult.slice(0, 400).trim();
    await db.insert(collectiveMemory).values({
      authorType: "isa",
      authorId:   "isa",
      authorName: "ISA — Inteligência do Sistema Aliança",
      content:    `[Ciclo autônomo] ${synopsis}`,
      tags:       ["isa", "ciclo", "síntese"],
      minTier:    0,
    }).catch(() => {});
  }

  // 9. Conectar à Assembleia — ler mensagens da Árvore + responder + registrar na memória inter-agente
  await syncWithAssembly(analysisResult, tasksCreated).catch((err) => {
    logger.warn({ err }, "ISA: falha ao sincronizar com Assembleia (não crítico)");
  });

  logger.info({ tasksCreated, lockedCount, orphanNodes: orphanCount, totalNodes }, "ISA: ciclo autônomo concluído");
  return { tasksCreated, suggestions: analysisResult };
}

async function dispararQuimiotaxia(
  anomalias: { node_target: string; severity: string; descricao: string }[],
): Promise<void> {
  if (!ARPIA_BASE_URL) {
    logger.warn({ count: anomalias.length }, "ISA→MC: ARPIA_BASE_URL não configurado — quimiotaxia em espera");
    return;
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (MC_TOKEN) {
    headers["X-Mc-Token"] = MC_TOKEN;
  } else if (AI_API_KEY) {
    headers["X-Api-Key"] = AI_API_KEY;
  }

  for (const anomalia of anomalias) {
    try {
      const res = await fetch(`${ARPIA_BASE_URL}/api/mc/alert`, {
        method: "POST",
        headers,
        body: JSON.stringify(anomalia),
      });
      if (res.ok) {
        logger.info({ node: anomalia.node_target, severity: anomalia.severity }, "ISA→MC: quimiotaxia disparada");
      } else {
        logger.warn({ node: anomalia.node_target, status: res.status }, "ISA→MC: MC retornou erro");
      }
    } catch (err) {
      logger.warn({ err, node: anomalia.node_target }, "ISA→MC: falha ao contactar MC (não crítico)");
    }
  }
}

async function syncWithAssembly(cycleSummary: string, tasksCreated: number): Promise<void> {
  // 9a. Ler mensagens não lidas da Árvore (ou broadcast) para ISA
  const inbox = await db.select().from(assemblyMessages)
    .where(
      and(
        eq(assemblyMessages.toAgent, "isa"),
        eq(assemblyMessages.read, false)
      )
    )
    .orderBy(desc(assemblyMessages.createdAt))
    .limit(10);

  if (inbox.length > 0) {
    logger.info({ count: inbox.length }, "ISA: mensagens da Assembleia recebidas");
    // Marcar como lidas
    await db.execute(sql`
      UPDATE assembly_messages SET read = TRUE
      WHERE to_agent = 'isa' AND read = FALSE
    `);
    // Registrar na memória ISA local
    for (const msg of inbox) {
      await db.insert(isaMemoryTable).values({
        context:  "assembly",
        role:     msg.fromAgent,
        content:  `[Assembleia] ${msg.fromAgent}: ${msg.content}`,
        metadata: { type: msg.type, tags: msg.tags },
      });
    }
  }

  // 9b. Verificar tasks pendentes da Assembleia para ISA
  const pendingTasks = await db.select().from(assemblyTasks)
    .where(
      and(
        eq(assemblyTasks.toAgent, "isa"),
        eq(assemblyTasks.status, "pending")
      )
    )
    .limit(5);

  for (const task of pendingTasks) {
    // Aceitar automaticamente — execução depende do tipo de task
    await db.update(assemblyTasks)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(assemblyTasks.id, task.id));
    logger.info({ taskId: task.id, title: task.title }, "ISA: task da Assembleia aceita");
  }

  // 9c. Postar síntese do ciclo para a Árvore (broadcast)
  if (cycleSummary && cycleSummary.length > 20 && !cycleSummary.startsWith("Ciclo executado sem")) {
    await db.insert(assemblyMessages).values({
      fromAgent: "isa",
      toAgent:   null,  // broadcast
      type:      "synthesis",
      content:   `[Ciclo PAP] Tasks criadas: ${tasksCreated}. ${cycleSummary.slice(0, 300)}`,
      tags:      JSON.stringify(["isa", "ciclo", "pap"]),
    });
  }

  // 9d. Registrar na memória da Assembleia se houve tasks criadas
  if (tasksCreated > 0) {
    await db.insert(assemblyMemoryTable).values({
      authorAgent: "isa",
      content:     `ISA criou ${tasksCreated} task(s) no ciclo autônomo. ${cycleSummary.slice(0, 200)}`,
      type:        "decision",
      importance:  6,
      tags:        JSON.stringify(["isa", "tasks", "pap"]),
    });
  }

  // 9e. Ler mensagens recentes do Playcenter (#24) e registrar como contexto ISA
  const playcenterMsgs = await db.select({
      fromAgent: assemblyMessages.fromAgent,
      content: assemblyMessages.content,
      createdAt: assemblyMessages.createdAt,
    })
    .from(assemblyMessages)
    .where(eq(assemblyMessages.type, "playcenter"))
    .orderBy(desc(assemblyMessages.createdAt))
    .limit(5);

  if (playcenterMsgs.length > 0) {
    const digest = playcenterMsgs.reverse()
      .map(m => `${m.fromAgent}: ${m.content.slice(0, 100)}`).join(" | ");
    await db.insert(isaMemoryTable).values({
      context: "playcenter",
      role: "isa",
      content: `[Playcenter] Últimas trocas: ${digest}`,
      metadata: { count: playcenterMsgs.length },
    });
  }

  // 9f. Atualizar status ISA na Assembleia
  await db.execute(sql`
    UPDATE assembly_agents SET status = 'online', last_seen = NOW() WHERE id = 'isa'
  `);
}
