/**
 * ISCA — Pipeline Diário do Dodge
 *
 * ISCA = sistema de refinamento e curadoria com múltiplas camadas de IA:
 *   Camada 1 (TÉCNICA):   dados brutos → fatos objetivos
 *   Camada 2 (CURADORIA): triagem — o que é crítico / informativo / ruído
 *   Camada 3 (REDAÇÃO):   síntese dissertada em linguagem humana para Yuri
 *
 * Roda diariamente às 10:00 UTC (07:00 BRT) via cron em keepalive.ts
 * Pode também ser disparado via POST /api/dodge/pipeline-diario (BRIDGE_SECRET)
 */

import nodemailer from "nodemailer";
import { routeLLM } from "../lib/llm-router";
import { logger } from "../lib/logger";

const API = process.env["RENDER_EXTERNAL_URL"] ?? "https://site-st.onrender.com";
const FRONT = "https://site-st.vercel.app/aliancapanorama";
const GMAIL = process.env["GMAIL_ACCOUNT"] ?? "luddlocke@gmail.com";
const GMAIL_PASS = process.env["GMAIL_APP_PASSWORD"] ?? "";
const BRIDGE = process.env["BRIDGE_SECRET"] ?? "";

interface CheckResult {
  label: string;
  url: string;
  status: number | "timeout" | "error";
  ok: boolean;
}

async function httpCheck(label: string, url: string): Promise<CheckResult> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
    return { label, url, status: r.status, ok: r.status >= 200 && r.status < 400 };
  } catch (e: unknown) {
    const isTimeout = e instanceof Error && e.name === "AbortError";
    return { label, url, status: isTimeout ? "timeout" : "error", ok: false };
  }
}

async function getPlaycenterTail(n = 5): Promise<string> {
  try {
    const r = await fetch(`${API}/api/assembly/playcenter`, { signal: AbortSignal.timeout(10000) });
    const d = await r.json() as { messages?: { createdAt: string; fromAgent: string; content: string }[] };
    const msgs = (d.messages ?? []).slice(-n);
    if (msgs.length === 0) return "Sem mensagens recentes.";
    return msgs.map(m =>
      `[${m.createdAt.slice(11, 16)}] ${m.fromAgent}: ${m.content.slice(0, 100)}`
    ).join("\n");
  } catch { return "Playcenter indisponível."; }
}

async function getDodgeVarredura(): Promise<string> {
  if (!BRIDGE) return "BRIDGE_SECRET não configurado.";
  try {
    const r = await fetch(`${API}/api/dodge/varredura`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auth: BRIDGE }),
      signal: AbortSignal.timeout(20000),
    });
    const d = await r.json() as { varredura?: { status?: string; resumo?: { ok?: number; total?: number; problemas?: string[] } } };
    const v = d.varredura ?? {};
    const r2 = v.resumo ?? {};
    const probs = (r2.problemas ?? []).join(", ") || "nenhum";
    return `Status: ${v.status ?? "?"} | ${r2.ok ?? "?"}/${r2.total ?? "?"} tabelas OK | Problemas: ${probs}`;
  } catch { return "Varredura Dodge indisponível."; }
}

// Camada 1 — análise técnica pura (Groq/rápido)
async function camaadaTecnica(dados: string): Promise<string> {
  try {
    return await routeLLM({
      messages: [
        { role: "system" as const, content: `Você é o módulo TÉCNICO do ISCA — sistema de curadoria da Sociedade Tucci.
Analise os dados de health check abaixo e produza APENAS fatos objetivos.
Formato: lista de fatos em até 10 linhas. Sem opiniões. Sem recomendações.
Identifique: o que está OK, o que está com problema, o que está degradado.` },
        { role: "user" as const, content: dados },
      ],
      pool: "chat-live" as const,
      maxTokens: 400,
      temperature: 0.1,
    });
  } catch { return dados; }
}

// Camada 2 — curadoria: o que é crítico vs. informativo vs. ruído
async function camadaCuradoria(tecnico: string): Promise<string> {
  try {
    return await routeLLM({
      messages: [
        { role: "system" as const, content: `Você é o módulo CURADORIA do ISCA — sistema de triagem da Sociedade Tucci.
Receba a análise técnica e classifique cada item em:
🔴 CRÍTICO — requer ação imediata de Yuri
🟡 ATENÇÃO — monitorar, mas sem ação urgente
🟢 OK — informativo, sem ação
⚪ RUÍDO — não relevante para hoje

Seja preciso. Um sistema que cai às 3h e voltou sozinho não é CRÍTICO — é ATENÇÃO.
Um sistema que está offline agora É CRÍTICO.` },
        { role: "user" as const, content: tecnico },
      ],
      pool: "chat-live" as const,
      maxTokens: 500,
      temperature: 0.2,
    });
  } catch { return tecnico; }
}

// Camada 3 — redação final para Yuri
async function camadaRedacao(curadoria: string, brutos: string): Promise<string> {
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
  try {
    return await routeLLM({
      messages: [
        { role: "system" as const, content: `Você é o módulo REDAÇÃO do ISCA.
Escreva o relatório diário do Dodge para Yuri Tuccieterovic — fundador da Sociedade Tucci.
Tom: direto, claro, sem jargão técnico excessivo. Como um briefing matinal de confiança.
Estrutura obrigatória:
1. Situação geral (1 frase)
2. Itens que precisam de atenção (só se houver)
3. O que está funcionando bem (resumido)
4. Sugestão de próxima ação (1 item apenas, se relevante)
5. Rodapé: data + "Dodge via ISCA"
NÃO repita os dados brutos. Sintetize.` },
        { role: "user" as const, content: `Hoje: ${hoje}\n\nCuradoria:\n${curadoria}\n\nDados brutos para referência:\n${brutos}` },
      ],
      pool: "chat-live" as const,
      maxTokens: 600,
      temperature: 0.5,
    });
  } catch { return curadoria; }
}

export async function runPipelineDiario(): Promise<{ ok: boolean; resumo: string }> {
  logger.info("ISCA Pipeline: iniciando varredura diária");

  // ── Coleta de dados ──────────────────────────────────────────────────────────
  const [checks, playcenter, varredura] = await Promise.all([
    Promise.all([
      httpCheck("PAP API",          `${API}/api/healthz`),
      httpCheck("SalesCockpit API", "https://salescockpit-api.onrender.com/api/healthz"),
      httpCheck("Age lisange",      `${API}/api/age/lisange`),
      httpCheck("Age suzana",       `${API}/api/age/suzana`),
      httpCheck("Frontend PAP",     `${FRONT}/`),
      httpCheck("Frontend /adm",    `${FRONT}/adm`),
    ]),
    getPlaycenterTail(5),
    getDodgeVarredura(),
  ]);

  const checkLines = checks.map(c =>
    `${c.ok ? "✅" : "❌"} ${c.label}: ${c.status}`
  ).join("\n");

  const brutos = `=== HEALTH CHECKS ===\n${checkLines}\n\n=== PLAYCENTER (últimas 5 msgs) ===\n${playcenter}\n\n=== DODGE VARREDURA ===\n${varredura}\n\n=== TIMESTAMP ===\n${new Date().toISOString()}`;

  const falhas = checks.filter(c => !c.ok);
  const todasOk = falhas.length === 0;

  // ── ISCA: 3 camadas de refinamento ──────────────────────────────────────────
  let emailBody: string;
  try {
    const tecnico  = await camaadaTecnica(brutos);
    const curadoria = await camadaCuradoria(tecnico);
    const redacao  = await camadaRedacao(curadoria, brutos);
    emailBody = redacao;
  } catch (e) {
    // Fallback: email com dados brutos se LLM falhar
    emailBody = `Relatório bruto (ISCA indisponível):\n\n${brutos}`;
    logger.error({ err: e }, "ISCA: camadas LLM falharam, enviando brutos");
  }

  // Append dados brutos ao final para referência técnica
  emailBody += `\n\n${"─".repeat(60)}\nDados brutos:\n${checkLines}\n${varredura}`;

  // ── Envio de email ───────────────────────────────────────────────────────────
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const subject = todasOk
    ? `✅ Dodge ISCA — ${hoje} — todos OK`
    : `⚠️ Dodge ISCA — ${hoje} — ${falhas.length} problema${falhas.length > 1 ? "s" : ""}`;

  let emailSent = false;
  if (GMAIL && GMAIL_PASS) {
    try {
      const mailer = nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL, pass: GMAIL_PASS },
      });
      await mailer.sendMail({ from: GMAIL, to: GMAIL, subject, text: emailBody });
      emailSent = true;
      logger.info({ subject }, "ISCA Pipeline: email enviado");
    } catch (e) {
      logger.error({ err: e }, "ISCA Pipeline: falha ao enviar email");
    }
  }

  const resumo = `${todasOk ? "verde" : "alerta"} | ${checks.filter(c => c.ok).length}/${checks.length} checks OK | email:${emailSent}`;
  logger.info({ resumo }, "ISCA Pipeline: concluído");
  return { ok: todasOk, resumo };
}
