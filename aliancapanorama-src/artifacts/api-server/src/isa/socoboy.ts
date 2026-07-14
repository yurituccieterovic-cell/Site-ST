/**
 * Socoboy — Socó-boi Noturno · Buscador de LLMs e Modelos de IA
 *
 * Roda 2x/dia (8h e 20h UTC). Usa o llm-router para perguntar aos provedores
 * disponíveis quais LLMs/modelos foram lançados ou anunciados recentemente.
 * Salva os resultados na biblioteca (tipo: txt, categoria: llm-modelos).
 * Envia email para Yuri com o digest.
 */

import { createTransport } from "nodemailer";
import { db, bibliotecaDocsTable, isaMemoryTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { askLLM } from "../lib/llm-router";
import { logger } from "../lib/logger";

const GMAIL = process.env.GMAIL_ACCOUNT ?? "luddlocke@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD ?? "";
const YURI_EMAIL = "yurituccieterovic@gmail.com";

// ── Prompt do Socoboy ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é Socoboy, um agente de monitoramento de inteligência artificial.
Sua tarefa é reunir e sintetizar informações sobre LLMs (Large Language Models) e novos modelos de IA.
Responda sempre em português. Seja preciso, conciso e use formato estruturado.`;

const SEARCH_PROMPT = `Liste os LLMs e modelos de IA mais relevantes, recentes e notáveis que você conhece.
Inclua: modelos lançados recentemente, modelos open-source importantes, e modelos que tiveram atualizações significativas.

Para cada modelo, forneça:
- Nome do modelo
- Empresa / organização
- Data aproximada de lançamento (ou "em desenvolvimento")
- Principais capacidades
- Tamanho de contexto (se conhecido)
- Licença (open/closed)
- Novidade ou destaque

Retorne uma lista de 10-15 modelos no formato:
---
MODELO: [nome]
EMPRESA: [empresa]
DATA: [data]
CAPACIDADES: [capacidades em 1 linha]
CONTEXTO: [X tokens ou "não divulgado"]
LICENÇA: [open-source / comercial / gratuita]
DESTAQUE: [o que torna esse modelo notável]
---

Foque nos modelos mais importantes e recentes que você tem conhecimento.`;

// ── Salvamento na biblioteca ─────────────────────────────────────────────────

async function saveModelToLibrary(
  titulo: string,
  content: string,
  rodada: "manha" | "noite"
): Promise<void> {
  const existing = await db
    .select({ id: bibliotecaDocsTable.id })
    .from(bibliotecaDocsTable)
    .where(sql`${bibliotecaDocsTable.titulo} = ${titulo}`)
    .limit(1);

  if (existing.length > 0) return; // já existe

  await db.insert(bibliotecaDocsTable).values({
    titulo,
    url: null,
    localPath: null,
    tipo: "txt",
    origem: "socoboy",
    tamanhoBytes: Buffer.byteLength(content, "utf8"),
    tags: ["llm", "modelos", "ia", "socoboy", rodada],
  }).onConflictDoNothing();
}

// ── Email ────────────────────────────────────────────────────────────────────

async function sendDigestEmail(digest: string, rodada: "manha" | "noite"): Promise<boolean> {
  if (!GMAIL_PASS) {
    logger.warn("Socoboy: GMAIL_APP_PASSWORD não configurado — email não enviado");
    return false;
  }
  try {
    const transport = createTransport({
      service: "gmail",
      auth: { user: GMAIL, pass: GMAIL_PASS },
    });
    const emoji = rodada === "manha" ? "🌅" : "🌙";
    await transport.sendMail({
      from: GMAIL,
      to: YURI_EMAIL,
      subject: `${emoji} Socoboy — LLMs & Modelos de IA (${rodada === "manha" ? "manhã" : "noite"})`,
      text: [
        `Socoboy — Socó-boi Noturno · ${new Date().toLocaleDateString("pt-BR")} · ${rodada === "manha" ? "Rodada da Manhã (8h)" : "Rodada da Noite (20h)"}`,
        "=".repeat(60),
        "",
        digest,
        "",
        "=".repeat(60),
        "Salvo na Biblioteca ISA · categoria: llm-modelos",
        "— Socoboy, Socó-boi da Sociedade Tucci 🦅",
      ].join("\n"),
    });
    logger.info({ rodada }, "Socoboy: email enviado com digest de LLMs");
    return true;
  } catch (err) {
    logger.error({ err }, "Socoboy: falha ao enviar email");
    return false;
  }
}

// ── Ciclo principal ──────────────────────────────────────────────────────────

export async function runSocoboyLLMSearch(rodada: "manha" | "noite" = "manha"): Promise<{
  digest: string;
  savedCount: number;
  emailSent: boolean;
}> {
  logger.info({ rodada }, "Socoboy: iniciando busca de LLMs e modelos");

  // 1. Gerar digest via LLM
  let digest: string;
  try {
    digest = await askLLM(SEARCH_PROMPT, {
      systemPrompt: SYSTEM_PROMPT,
      pool: "batch",
      maxTokens: 1200,
      temperature: 0.3,
    });
  } catch (err) {
    logger.error({ err }, "Socoboy: falha na geração do digest — todos os provedores ocupados");
    digest = `[Socoboy — ${new Date().toISOString()}] Provedores LLM indisponíveis nesta rodada. Tentativa registrada.`;
  }

  // 2. Salvar digest completo na biblioteca
  const tituloDigest = `[Socoboy] LLMs & Modelos — ${new Date().toISOString().slice(0, 10)} · ${rodada}`;
  await saveModelToLibrary(tituloDigest, digest, rodada);

  // 3. Extrair modelos individuais do digest e salvar cada um
  const blocos = digest.split(/---+/).filter(b => b.includes("MODELO:"));
  let savedCount = 1; // pelo menos o digest completo

  for (const bloco of blocos) {
    const nomeMatch = bloco.match(/MODELO:\s*(.+)/);
    const empresaMatch = bloco.match(/EMPRESA:\s*(.+)/);
    if (!nomeMatch) continue;
    const nome = nomeMatch[1].trim();
    const empresa = empresaMatch?.[1].trim() ?? "";
    const titulo = `[LLM] ${nome}${empresa ? " — " + empresa : ""} (via Socoboy ${new Date().toISOString().slice(0, 10)})`;
    await saveModelToLibrary(titulo, bloco.trim(), rodada);
    savedCount++;
  }

  // 4. Registrar na memória da ISA
  await db.insert(isaMemoryTable).values({
    userId: null,
    userEmail: null,
    context: "biblioteca",
    role: "socoboy",
    content: `🦅 Socoboy (${rodada}): ${savedCount} entradas LLM/modelos salvas na biblioteca.\n\n${digest.slice(0, 500)}...`,
    location: "/biblioteca/llm-modelos",
    sessionId: `socoboy-${Date.now()}`,
    metadata: { rodada, savedCount, blocos: blocos.length },
  });

  // 5. Enviar email para Yuri
  const emailSent = await sendDigestEmail(digest, rodada);

  logger.info({ rodada, savedCount, emailSent }, "Socoboy: ciclo concluído");
  return { digest, savedCount, emailSent };
}
