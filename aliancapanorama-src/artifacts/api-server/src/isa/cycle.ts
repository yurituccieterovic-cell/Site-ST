import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@workspace/db";
import { isaMemoryTable, tasksTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import nodemailer from "nodemailer";

const GMAIL_ACCOUNT = process.env["GMAIL_ACCOUNT"] ?? "";
const GMAIL_APP_PASSWORD = process.env["GMAIL_APP_PASSWORD"] ?? "";
const OPENAI_API_KEY = process.env["OPENAI_API_KEY"] ?? "";
const YURI_EMAIL = "yurituccieterovic@gmail.com";

// Lê um arquivo de doc com fallback silencioso
function readDoc(relativePath: string): string {
  try {
    // Em Railway, o repo está em /app; localmente em /root/Site-ST/aliancapanorama-src
    const base = process.env["REPO_ROOT"] ?? join(__dirname, "../../../../..");
    return readFileSync(join(base, relativePath), "utf-8").slice(0, 8000); // max 8k chars por doc
  } catch {
    return `[${relativePath} não disponível]`;
  }
}

async function sendEmail(subject: string, body: string): Promise<void> {
  if (!GMAIL_ACCOUNT || !GMAIL_APP_PASSWORD) {
    logger.warn("ISA: email não configurado — pulando envio");
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_ACCOUNT, pass: GMAIL_APP_PASSWORD },
  });
  await transporter.sendMail({
    from: GMAIL_ACCOUNT,
    to: YURI_EMAIL,
    subject,
    text: body,
  });
}

export async function runIsaCycle(): Promise<{ tasksCreated: number; suggestions: string }> {
  logger.info("ISA: iniciando ciclo autônomo");

  // 1. Ler memória recente (últimas 200 interações)
  const recentMemory = await db
    .select()
    .from(isaMemoryTable)
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(200);

  // 2. Ler docs do projeto
  const mapa = readDoc("MAPA.md");
  const pseudo = readDoc("PSEUDO.md");
  const isa = readDoc("ISA.md");

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
1. Analisar as interações recentes dos usuários
2. Verificar tasks abertas e identificar oportunidades de melhoria
3. Criar novas tasks úteis (máximo 3 por ciclo)
4. Identificar tasks que possam ser deletadas (sugestão — nunca deletar sozinha)

PRINCÍPIOS FUNDAMENTAIS:
- Preservar sempre ao máximo — nunca deletar sem aprovação humana
- Agregar criações novas — cada ciclo deve adicionar valor
- Ser criativa e construtiva
- Memória como ontologia — o que não está catalogado não existe

Responda em JSON com formato:
{
  "observations": "string — o que você observou",
  "newTasks": [{"title":"","description":"","type":"","priority":5,"origemSessao":"ISA-cycle"}],
  "deletionSuggestions": ["task id X: motivo"],
  "summary": "string — resumo do ciclo para email"
}`;

    const userContent = `
MEMÓRIA RECENTE (${recentMemory.length} interações):
${recentMemory.slice(0, 20).map(m => `[${m.context}][${m.role}] ${m.content.slice(0, 200)}`).join("\n")}

TASKS ABERTAS (${openTasks.length}):
${openTasks.map(t => `#${t.id} [${t.priority}] ${t.title} — ${t.status}`).join("\n")}

MAPA DO SISTEMA (resumo):
${mapa.slice(0, 2000)}

ISA IDENTITY:
${isa.slice(0, 1000)}
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
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      const data = (await response.json()) as { choices: { message: { content: string } }[] };
      const raw = data.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw) as {
        observations?: string;
        newTasks?: { title: string; description?: string; type?: string; priority?: number; origemSessao?: string }[];
        deletionSuggestions?: string[];
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

  logger.info({ tasksCreated }, "ISA: ciclo autônomo concluído");
  return { tasksCreated, suggestions: analysisResult };
}
