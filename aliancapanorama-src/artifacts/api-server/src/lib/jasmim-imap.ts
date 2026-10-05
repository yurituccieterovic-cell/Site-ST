/**
 * Jasmim IMAP — lê Gmail e injeta emails no feed da Jasmim.
 * Roda como cron server-side a cada 6h (sem depender do celular de Yuri).
 */
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

const GMAIL_USER = process.env["GMAIL_ACCOUNT"] ?? process.env["GMAIL_USER"] ?? "";
const GMAIL_PASS = process.env["GMAIL_APP_PASSWORD"] ?? "";

const SKIP_SUBJECTS = [
  "unsubscribe", "newsletter", "noreply", "no-reply",
  "notificação", "fatura", "invoice", "receipt",
  "google alerts", "vercel", "render.com", "github", "neon.tech", "railway",
];

const MEMORY_TRIGGERS = [
  "macroata", "macro ata", "ata #fim", "perfeito —",
  "resultado —", "assembleia #", "#eage", "#age", "#pap", "#fim",
];

const PROJETO_KEYWORDS: Record<string, string[]> = {
  age:      ["age", "lisange", "suzana", "susana", "sabiá", "sabia", "paciente"],
  rapadura: ["rapadura", "patrimônio", "patrimonio", "score"],
  pv:       ["projeto visual", "projeto pv", "sérgio", "sergio", "paco", "pacu", "design"],
  calculus: ["calculus", "financeiro", "contabilidade", "finarazuly"],
  socia:    ["sócia", "socia", "erp", "ábaco", "abaco"],
  fluxo:    ["fluxo", "emprego", "freela", "candidatura", "vaga"],
  isca:     ["isca", "inara", "suindara", "clio", "arara"],
  bni:      ["bni"],
  sonhos:   ["sonhos", "sonho"],
  crowd:    ["crowd"],
  theo:     ["theo", "théo", "ecossistema", "assembleia", "pap", "macroata",
             "perfeito", "resultado", "rodar", "cláudio", "claudio", "salescockpit"],
  jasmim:   ["jasmim", "myym", "mayumi"],
};

function detectarProjeto(assunto: string, corpo: string): string {
  const texto = (assunto + " " + corpo).toLowerCase();
  for (const [proj, kws] of Object.entries(PROJETO_KEYWORDS)) {
    if (kws.some(kw => texto.includes(kw))) return proj;
  }
  return "jasmim";
}

function shouldSkip(subject: string, from: string): boolean {
  const text = (subject + " " + from).toLowerCase();
  return SKIP_SUBJECTS.some(kw => text.includes(kw));
}

function isMemoryWorthy(subject: string): boolean {
  const text = subject.toLowerCase();
  return MEMORY_TRIGGERS.some(kw => text.includes(kw));
}

export async function runJasmimEmailIngest(days = 7): Promise<{ synced: number; memories: number; skipped: number }> {
  if (!GMAIL_USER || !GMAIL_PASS) {
    logger.warn("[jasmim-imap] GMAIL_ACCOUNT ou GMAIL_APP_PASSWORD não configurados — pulando");
    return { synced: 0, memories: 0, skipped: 0 };
  }

  let synced = 0;
  let memories = 0;
  let skipped = 0;

  try {
    const { ImapFlow } = await import("imapflow");
    const client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      for await (const msg of client.fetch(
        { since },
        { envelope: true, bodyStructure: true, source: true }
      )) {
        const subject = msg.envelope.subject ?? "";
        const from = msg.envelope.from?.[0]?.address ?? "";
        const msgId = msg.envelope.messageId ?? `uid:${msg.uid}`;
        const fonte = `email:${msgId.slice(0, 120)}`;

        if (shouldSkip(subject, from)) { skipped++; continue; }

        // Deduplicar — checar se fonte já existe
        const exists = await db.execute(sql`
          SELECT 1 FROM jm_posts WHERE fonte = ${fonte} LIMIT 1
        `).then(r => (r as any).rows?.length > 0).catch(() => false);

        if (exists) { skipped++; continue; }

        // Extrair texto do body (text/plain)
        let bodyText = "";
        try {
          const raw = msg.source.toString("utf-8");
          // Pega conteúdo após headers
          const bodyStart = raw.indexOf("\r\n\r\n");
          if (bodyStart !== -1) {
            bodyText = raw.slice(bodyStart + 4, bodyStart + 2000)
              .replace(/=\r?\n/g, "")  // quoted-printable line breaks
              .replace(/=[0-9A-F]{2}/gi, m => String.fromCharCode(parseInt(m.slice(1), 16)));
          }
        } catch { /* body opcional */ }

        const conteudo = `[${msg.envelope.date?.toISOString().slice(0, 10)}] ${subject}\nDE: ${from}\n\n${bodyText.trim().slice(0, 1200)}`;
        const projeto = detectarProjeto(subject, bodyText);

        await db.execute(sql`
          INSERT INTO jm_posts (projeto, setor, tipo, autor, conteudo, fonte)
          VALUES (${projeto}, null, 'auto',
                  ${from.includes("mayumi") || from.includes("matanimoto") ? "Mayumi" : from.includes("yuri") ? "Yuri" : "email"},
                  ${conteudo}, ${fonte})
        `).catch(() => {});

        synced++;

        if (isMemoryWorthy(subject)) {
          await db.execute(sql`
            INSERT INTO jm_myym_memory (tipo, conteudo)
            VALUES ('assembleia', ${`${subject}\n\n${bodyText.trim().slice(0, 500)}`})
          `).catch(() => {});
          memories++;
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    logger.error({ err }, "[jasmim-imap] erro no ciclo de ingestão");
  }

  logger.info({ synced, memories, skipped }, "[jasmim-imap] ciclo concluído");
  return { synced, memories, skipped };
}
