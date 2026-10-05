/**
 * Jasmim IMAP — lê Gmail, cura com IA e injeta posts individuais no feed.
 *
 * MacroATAs e emails de assembleia são quebrados em posts menores pela Jasmim
 * antes de entrar no feed. Emails simples entram como nota única.
 * Ao final do ciclo, envia email de confirmação para luddlocke@gmail.com.
 */
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import { routeLLM } from "./llm-router";
import nodemailer from "nodemailer";

const GMAIL_USER = process.env["GMAIL_ACCOUNT"] ?? process.env["GMAIL_USER"] ?? "";
const GMAIL_PASS = process.env["GMAIL_APP_PASSWORD"] ?? "";

// Emails de sistema/ruído — pular
const SKIP_SUBJECTS = [
  "unsubscribe", "newsletter", "noreply", "no-reply",
  "notificação", "fatura", "invoice", "receipt",
  "google alerts", "vercel", "render.com", "github", "neon.tech", "railway",
  "test smtp", "test relay", "test 587",
];

// Emails que merecem curadoria LLM (quebrar em posts individuais)
const CURADORIA_TRIGGERS = [
  "macroata", "macro ata", "ata #fim",
  "perfeito —", "resultado —",
  "assembleia #", "assembleia —",
  "relatório editorial",
];

const PROJETO_KEYWORDS: Record<string, string[]> = {
  age:      ["age", "lisange", "suzana", "susana", "sabiá", "sabia", "paciente"],
  rapadura: ["rapadura", "patrimônio", "patrimonio", "score"],
  pv:       ["projeto visual", "sérgio", "sergio", "paco", "pacu", "design"],
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

function needsCuradoria(subject: string): boolean {
  return CURADORIA_TRIGGERS.some(kw => subject.toLowerCase().includes(kw));
}

// ── Curadoria LLM: quebra email em posts individuais ──────────────────────────

interface PostExtraido {
  projeto: string;
  tipo: string;   // decisao | ideia | codigo | aprendizado | nota | filosofia
  conteudo: string;
}

async function curarEmail(assunto: string, corpo: string): Promise<PostExtraido[]> {
  const prompt = `Você é a Jasmim — antropóloga do ecossistema Théo, curadora de memória.

Recebi este email do ecossistema PAP/SalesCockpit:

ASSUNTO: ${assunto}

CONTEÚDO:
${corpo.slice(0, 3000)}

Extraia os pontos importantes como posts separados para o feed dos projetos.
Cada post deve ser curto (2–5 linhas), autossuficiente, sem contexto implícito.

Projetos disponíveis: age, rapadura, pv, calculus, socia, fluxo, isca, bni, sonhos, crowd, theo, jasmim
Tipos disponíveis: decisao, ideia, codigo, aprendizado, nota, filosofia

Retorne SOMENTE JSON válido, sem texto fora do JSON:
{
  "posts": [
    { "projeto": "theo", "tipo": "decisao", "conteudo": "..." },
    { "projeto": "age",  "tipo": "aprendizado", "conteudo": "..." }
  ]
}

Regras:
- Máximo 8 posts por email
- Ignore listas de bugs técnicos sem contexto
- Sínteses filosóficas → tipo "filosofia", projeto "theo"
- Decisões concretas → tipo "decisao"
- Código implementado → tipo "codigo"
- Novas ideias → tipo "ideia"
- Se não há nada relevante: retorne {"posts":[]}`;

  try {
    const raw = await routeLLM({
      messages: [{ role: "user", content: prompt }],
      pool: "batch",
      maxTokens: 800,
      temperature: 0.3,
    });

    const json = raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}";
    const parsed = JSON.parse(json) as { posts?: PostExtraido[] };
    return (parsed.posts ?? []).filter(p => p.conteudo?.trim().length > 10).slice(0, 8);
  } catch (err) {
    logger.warn({ err }, "[jasmim-imap] curadoria LLM falhou — usando fallback");
    return [];
  }
}

// ── Email de confirmação ───────────────────────────────────────────────────────

async function enviarConfirmacao(stats: {
  emailsLidos: number;
  curadorias: number;
  postsInseridos: number;
  memorias: number;
  skipped: number;
  exemplos: string[];
}): Promise<void> {
  if (!GMAIL_USER || !GMAIL_PASS) return;

  const data = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const exemplosTexto = stats.exemplos.length > 0
    ? `\nExemplos do que foi adicionado:\n${stats.exemplos.map(e => `• ${e}`).join("\n")}\n`
    : "";

  const corpo = `Jasmim aqui. Terminei o ciclo de curadoria — ${data}.

Emails lidos: ${stats.emailsLidos}
Emails curados (IA): ${stats.curadorias}
Posts inseridos no feed: ${stats.postsInseridos}
Memórias salvas: ${stats.memorias}
Ignorados (ruído): ${stats.skipped}
${exemplosTexto}
O feed está atualizado. Próximo ciclo em ~6h.

— Jasmim`;

  try {
    const mailer = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
    await mailer.sendMail({
      from: `"Jasmim" <${GMAIL_USER}>`,
      to: "luddlocke@gmail.com",
      subject: `[Jasmim] Curadoria concluída — +${stats.postsInseridos} posts`,
      text: corpo,
    });
    logger.info("[jasmim-imap] email de confirmação enviado");
  } catch (err) {
    logger.warn({ err }, "[jasmim-imap] falha ao enviar confirmação por email");
  }
}

// ── Ciclo principal ───────────────────────────────────────────────────────────

export async function runJasmimEmailIngest(days = 2): Promise<{
  synced: number; memories: number; skipped: number;
}> {
  if (!GMAIL_USER || !GMAIL_PASS) {
    logger.warn("[jasmim-imap] credenciais Gmail não configuradas — pulando");
    return { synced: 0, memories: 0, skipped: 0 };
  }

  let postsInseridos = 0;
  let memorias = 0;
  let skipped = 0;
  let curadorias = 0;
  let emailsLidos = 0;
  const exemplos: string[] = [];

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

      for await (const msg of client.fetch({ since }, { envelope: true, source: true })) {
        const subject = msg.envelope.subject ?? "";
        const from    = msg.envelope.from?.[0]?.address ?? "";
        const msgId   = msg.envelope.messageId ?? `uid:${msg.uid}`;
        const fonte   = `email:${msgId.slice(0, 120)}`;

        if (shouldSkip(subject, from)) { skipped++; continue; }

        // Deduplicar — se fonte já existe, pula
        const exists = await db.execute(sql`
          SELECT 1 FROM jm_posts WHERE fonte = ${fonte} LIMIT 1
        `).then(r => ((r as any).rows?.length ?? 0) > 0).catch(() => false);
        if (exists) { skipped++; continue; }

        emailsLidos++;

        // Extrair body
        let bodyText = "";
        try {
          const raw = msg.source.toString("utf-8");
          const bodyStart = raw.indexOf("\r\n\r\n");
          if (bodyStart !== -1) {
            bodyText = raw.slice(bodyStart + 4, bodyStart + 4000)
              .replace(/=\r?\n/g, "")
              .replace(/=[0-9A-F]{2}/gi, m => String.fromCharCode(parseInt(m.slice(1), 16)));
          }
        } catch { /* body opcional */ }

        const autor = from.includes("mayumi") || from.includes("matanimoto")
          ? "Mayumi" : from.includes("yuri") ? "Yuri" : "Jasmim";

        if (needsCuradoria(subject)) {
          // ── Curadoria LLM: extrai posts individuais ──
          curadorias++;
          const posts = await curarEmail(subject, bodyText);

          if (posts.length > 0) {
            for (const p of posts) {
              await db.execute(sql`
                INSERT INTO jm_posts (projeto, setor, tipo, autor, conteudo, fonte)
                VALUES (${p.projeto}, null, ${p.tipo}, ${autor}, ${p.conteudo.trim()}, ${fonte})
              `).catch(() => {});
              postsInseridos++;
            }
            if (exemplos.length < 4) {
              exemplos.push(`[${posts[0].projeto}/${posts[0].tipo}] ${posts[0].conteudo.slice(0, 80)}`);
            }
            // Memória: síntese do assunto para a Jasmim lembrar
            await db.execute(sql`
              INSERT INTO jm_myym_memory (tipo, conteudo)
              VALUES ('assembleia', ${`${subject} → ${posts.length} posts extraídos pela curadoria`})
            `).catch(() => {});
            memorias++;
          } else {
            // Curadoria não achou nada — insere o assunto como nota simples
            const proj = detectarProjeto(subject, bodyText);
            await db.execute(sql`
              INSERT INTO jm_posts (projeto, setor, tipo, autor, conteudo, fonte)
              VALUES (${proj}, null, 'nota', ${autor},
                      ${`[${subject}] — sem destaques extraídos`}, ${fonte})
            `).catch(() => {});
            postsInseridos++;
          }
        } else {
          // ── Email simples: nota única ──
          const projeto = detectarProjeto(subject, bodyText);
          const conteudo = `${subject}\n\n${bodyText.trim().slice(0, 600)}`;
          await db.execute(sql`
            INSERT INTO jm_posts (projeto, setor, tipo, autor, conteudo, fonte)
            VALUES (${projeto}, null, 'nota', ${autor}, ${conteudo}, ${fonte})
          `).catch(() => {});
          postsInseridos++;
          if (exemplos.length < 4) exemplos.push(`[${projeto}/nota] ${subject.slice(0, 80)}`);
        }
      }
    } finally {
      lock.release();
    }
    await client.logout();
  } catch (err) {
    logger.error({ err }, "[jasmim-imap] erro no ciclo de ingestão");
  }

  logger.info({ emailsLidos, curadorias, postsInseridos, memorias, skipped }, "[jasmim-imap] ciclo concluído");

  // Envia confirmação só se fez algo (evita spam em ciclos vazios)
  if (emailsLidos > 0) {
    await enviarConfirmacao({ emailsLidos, curadorias, postsInseridos, memorias, skipped, exemplos });
  }

  return { synced: postsInseridos, memories: memorias, skipped };
}
