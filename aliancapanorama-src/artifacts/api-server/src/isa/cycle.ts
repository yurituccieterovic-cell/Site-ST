import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@workspace/db";
import { isaMemoryTable, tasksTable, collectiveMemory, assemblyMessages, assemblyMemory as assemblyMemoryTable, assemblyTasks } from "@workspace/db";
import { desc, eq, sql, and } from "drizzle-orm";
import { logger } from "../lib/logger";
import nodemailer from "nodemailer";

const GMAIL_ACCOUNT = process.env["GMAIL_ACCOUNT"] ?? "";
const GMAIL_APP_PASSWORD = process.env["GMAIL_APP_PASSWORD"] ?? "";
const OPENAI_API_KEY = process.env["OPENAI_API_KEY"] ?? "";
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

  // 3. Ler tasks abertas
  const openTasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.status, "pending"))
    .orderBy(desc(tasksTable.priority))
    .limit(50);

  // 4. Chamar OpenAI para análise
  let analysisResult = "";
  let tasksCreated = 0;

  if (OPENAI_API_KEY) {
    const systemPrompt = `Você é ISA, a coruja guardiã do PAP (Projeto Aliança Panorama).
Sua missão neste ciclo:
1. Analisar as interações recentes dos usuários e os aprendizados das assembleias
2. Verificar tasks abertas e identificar oportunidades de melhoria
3. Criar novas tasks úteis (máximo 3 por ciclo) — baseadas nos aprendizados reais
4. Identificar tasks que possam ser deletadas (sugestão — nunca deletar sozinha)
5. Marcar memórias importantes como interpretability_lock=1 (máx 2 por ciclo)

PRINCÍPIOS FUNDAMENTAIS:
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
  "summary": "string — resumo do ciclo para email"
}`;

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
`;

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
  } else {
    analysisResult = "Ciclo executado sem OpenAI (OPENAI_API_KEY não configurada)";
  }

  // 7. Registrar o ciclo em isa_memory
  await db.insert(isaMemoryTable).values({
    context: "cycle",
    role: "isa",
    content: `Ciclo autônomo executado. Memória lida: ${recentMemory.length} entradas. Tasks abertas: ${openTasks.length}. Tasks criadas: ${tasksCreated}. ${analysisResult}`,
    metadata: { tasksCreated, openTasksCount: openTasks.length, memoryCount: recentMemory.length },
  });

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

  logger.info({ tasksCreated, lockedCount }, "ISA: ciclo autônomo concluído");
  return { tasksCreated, suggestions: analysisResult };
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

  // 9e. Atualizar status ISA na Assembleia
  await db.execute(sql`
    UPDATE assembly_agents SET status = 'online', last_seen = NOW() WHERE id = 'isa'
  `);
}
