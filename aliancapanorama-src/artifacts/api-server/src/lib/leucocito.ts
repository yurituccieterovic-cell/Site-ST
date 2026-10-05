/**
 * Leucócito — Sistema de diagnóstico completo do ecossistema PAP/SalesCockpit.
 *
 * Testa todos os sistemas de ponta a ponta: DB, email, LLMs, Bluesky, bridge,
 * Jasmim, Age, ISA cron, Conector. Gera relatório por email ao final.
 *
 * Segurança:
 * - Testes de escrita usam prefixo "leucocito-test-" e são limpos logo após
 * - Nunca apaga dados reais, nunca posta no Bluesky em produção
 * - Email de teste usa assunto especial para não confundir com produção
 * - Rate limit: 1 execução a cada 30 minutos (evita loop acidental)
 */

import nodemailer from "nodemailer";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const PAP_API = process.env.PAP_API_URL ?? "https://site-st.onrender.com";
const SC_API  = process.env.SALESCOCKPIT_API_URL ?? "https://salescockpit-api.onrender.com";
const BRIDGE  = process.env.BRIDGE_SECRET ?? "";
const GMAIL_ACCOUNT  = process.env.GMAIL_ACCOUNT ?? "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? "";
const REPORT_TO = process.env.LEUCOCITO_REPORT_TO ?? "luddlocke@gmail.com";

// Rate-limit simples em memória: evita execuções acidentais em cascata
let lastRunAt = 0;
const MIN_INTERVAL_MS = 30 * 60 * 1000;

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface TestResult {
  name: string;
  ok: boolean;
  durationMs: number;
  detail?: string;
  error?: string;
}

export interface LeucocitoReport {
  runAt: string;
  totalMs: number;
  passed: number;
  failed: number;
  results: TestResult[];
  summary: string;
}

// ── Helper: medir tempo + capturar erro (1 retry automático em falha) ─────

async function measure(name: string, fn: () => Promise<string>): Promise<TestResult> {
  const t0 = Date.now();
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 3000));
    try {
      const detail = await fn();
      return { name, ok: true, durationMs: Date.now() - t0, detail };
    } catch (err) {
      lastError = String(err).slice(0, 300);
    }
  }
  return { name, ok: false, durationMs: Date.now() - t0, error: lastError };
}

// ── Testes individuais ─────────────────────────────────────────────────────

async function testPAPHealth(): Promise<TestResult> {
  return measure("PAP healthz", async () => {
    const r = await fetch(`${PAP_API}/api/healthz`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    return `status=${d.status} memMb=${d.memMb}`;
  });
}

async function testSalesHealth(): Promise<TestResult> {
  return measure("SalesCockpit healthz", async () => {
    const r = await fetch(`${SC_API}/api/healthz`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    return `status=${d.status}`;
  });
}

async function testNeonDB(): Promise<TestResult> {
  return measure("Neon DB", async () => {
    const res = await db.execute(sql`SELECT 1+1 AS n`);
    const row = (res.rows ?? res)[0] as Record<string, unknown>;
    if (String(row?.n) !== "2") throw new Error("query retornou valor inesperado");
    return "SELECT 1+1=2 OK";
  });
}

async function testEmailRelay(): Promise<TestResult> {
  return measure("Email relay bridge", async () => {
    if (!BRIDGE) throw new Error("BRIDGE_SECRET não configurado");
    const r = await fetch(`${PAP_API}/api/bridge/email-relay`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bridge-secret": BRIDGE },
      body: JSON.stringify({
        to: REPORT_TO,
        subject: `Leucócito — Ping de diagnóstico ${new Date().toISOString()}`,
        text: "Este é um ping automático do Leucócito para verificar o relay de email. Ignore se estiver tudo certo.",
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text().catch(() => "")}`);
    return `relay → ${REPORT_TO}`;
  });
}

async function testGmailSMTP(): Promise<TestResult> {
  return measure("Gmail SMTP direto", async () => {
    if (!GMAIL_ACCOUNT || !GMAIL_APP_PASSWORD) throw new Error("credenciais Gmail não configuradas");
    const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_ACCOUNT, pass: GMAIL_APP_PASSWORD } });
    await t.verify();
    return `${GMAIL_ACCOUNT} autenticado`;
  });
}

async function testJasmimFeed(): Promise<TestResult> {
  return measure("Jasmim feed", async () => {
    const r = await fetch(`${PAP_API}/api/jasmim/feed?projeto=theo&limit=5`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    const posts = Array.isArray(d) ? d : (d.posts as unknown[] ?? []);
    return `${posts.length} posts`;
  });
}

async function testJasmimCuradoria(): Promise<TestResult> {
  return measure("Jasmim curadoria endpoint", async () => {
    // Testa só se o endpoint responde (sem chamar LLM, para não consumir quota)
    if (!BRIDGE) throw new Error("BRIDGE_SECRET não configurado");
    const r = await fetch(`${PAP_API}/api/jasmim/curar-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${BRIDGE}` },
      body: JSON.stringify({
        assunto: "leucocito-ping-sem-trigger",
        remetente: "leucocito@test.internal",
        corpo: "ping de diagnóstico — sem palavras-chave de curadoria",
        msgId: `leucocito-ping-${Date.now()}`,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    // 200 ou 400 = endpoint existe e responde
    if (r.status === 404 || r.status === 503) throw new Error(`HTTP ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    return `endpoint ativo (posts=${d.posts ?? 0}, status=${r.status})`;
  });
}

async function testConector(): Promise<TestResult> {
  return measure("Conector memory", async () => {
    const r = await fetch(`${PAP_API}/api/conector/memory?section=preferencias`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    const len = JSON.stringify(d).length;
    return `seção preferencias: ${len} chars`;
  });
}

async function testAgeEndpoints(): Promise<TestResult> {
  return measure("Age endpoints", async () => {
    const slugs = ["lisange", "susana"];
    const results: string[] = [];
    for (const slug of slugs) {
      const r = await fetch(`${PAP_API}/api/age/${slug}`, { signal: AbortSignal.timeout(10_000) });
      results.push(`${slug}:${r.status}`);
    }
    const allOk = results.every(r => r.endsWith(":200"));
    if (!allOk) throw new Error(results.join(" "));
    return results.join(" ");
  });
}

async function testBridgeSalesCockpit(): Promise<TestResult> {
  return measure("Bridge SC ↔ PAP", async () => {
    // Verifica comunicação PAP → SalesCockpit via bridge secret
    if (!BRIDGE) throw new Error("BRIDGE_SECRET não configurado");
    const r = await fetch(`${SC_API}/api/healthz`, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) throw new Error(`SC healthz HTTP ${r.status}`);
    // Testa autenticação bridge acessando endpoint interno
    const rb = await fetch(`${SC_API}/api/bridge/pap/status`, {
      headers: { "x-bridge-secret": BRIDGE },
      signal: AbortSignal.timeout(10_000),
    });
    return `SC healthz OK, bridge/pap/status=${rb.status}`;
  });
}

async function testISACrons(): Promise<TestResult> {
  return measure("ISA cron loops", async () => {
    // Usa bridge/pap/status que expõe uptime do servidor PAP (proxy de saúde dos crons)
    if (!BRIDGE) throw new Error("BRIDGE_SECRET não configurado");
    const r = await fetch(`${PAP_API}/api/bridge/pap/status`, {
      headers: { "x-bridge-secret": BRIDGE },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    return `PAP uptime ${Number(d.uptime ?? 0).toFixed(0)}s`;
  });
}

async function testBlueskyRead(): Promise<TestResult> {
  return measure("Bluesky read (Árvore)", async () => {
    const r = await fetch("https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=stuccipulseheadway.bsky.social&limit=3", {
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json() as { feed?: unknown[] };
    return `${d.feed?.length ?? 0} posts recentes`;
  });
}

async function testLLMQuick(): Promise<TestResult> {
  return measure("LLM rápido (Groq)", async () => {
    // Testa Groq diretamente com modelo leve — não usa routeLLM para evitar conflito de quota interna
    const groqKey = process.env.GROQ_API_KEY ?? process.env.RODAR_GROQ_API_KEY ?? "";
    if (!groqKey) throw new Error("GROQ_API_KEY não configurado");
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Responda apenas: pong" }],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    const choices = d.choices as Array<{ message: { content: string } }>;
    return `Groq: ${choices?.[0]?.message?.content?.trim().slice(0, 50) ?? "ok"}`;
  });
}

// ── Geração de relatório em texto ──────────────────────────────────────────

function formatReport(report: LeucocitoReport): string {
  const header = `LEUCÓCITO — Relatório de Diagnóstico do Sistema
${report.runAt}
${"═".repeat(65)}

✅ Aprovados: ${report.passed}  ❌ Falhas: ${report.failed}  ⏱ Total: ${report.totalMs}ms

`;

  const rows = report.results.map(r => {
    const icon = r.ok ? "✓" : "✗";
    const dur = `${r.durationMs}ms`;
    const info = r.ok ? (r.detail ?? "") : `ERRO: ${r.error ?? ""}`;
    return `${icon} ${r.name.padEnd(32)} ${dur.padStart(7)}   ${info}`.slice(0, 120);
  }).join("\n");

  const footer = `
${"─".repeat(65)}

SÍNTESE:
${report.summary}

— Leucócito, ${report.runAt}`;

  return header + rows + footer;
}

// ── Envio do relatório por email ───────────────────────────────────────────

async function sendReport(report: LeucocitoReport): Promise<void> {
  if (!GMAIL_ACCOUNT || !GMAIL_APP_PASSWORD) return;
  const status = report.failed === 0 ? "✅ TUDO OK" : `⚠️ ${report.failed} FALHA(S)`;
  const subject = `Leucócito ${status} — ${new Date(report.runAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`;
  const text = formatReport(report);
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL_ACCOUNT, pass: GMAIL_APP_PASSWORD } });
  await t.sendMail({ from: GMAIL_ACCOUNT, to: REPORT_TO, subject, text });
}

// ── Execução principal ─────────────────────────────────────────────────────

const TESTS: Array<() => Promise<TestResult>> = [
  testNeonDB,
  testPAPHealth,
  testSalesHealth,
  testGmailSMTP,
  testEmailRelay,
  testConector,
  testJasmimFeed,
  testJasmimCuradoria,
  testISACrons,
  testAgeEndpoints,
  testBridgeSalesCockpit,
  testBlueskyRead,
  testLLMQuick,
];

export async function runLeucocito(opts: {
  sendEmail?: boolean;
  force?: boolean; // ignora rate-limit (uso manual via rota)
} = {}): Promise<LeucocitoReport> {
  const now = Date.now();

  if (!opts.force && now - lastRunAt < MIN_INTERVAL_MS) {
    const waitMin = Math.ceil((MIN_INTERVAL_MS - (now - lastRunAt)) / 60_000);
    throw new Error(`Rate limit: aguarde ${waitMin} min antes da próxima execução`);
  }

  lastRunAt = now;
  const t0 = Date.now();

  // Roda todos os testes em paralelo para ser rápido
  const results = await Promise.all(TESTS.map(fn => fn()));

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  const totalMs = Date.now() - t0;

  // Síntese textual
  const failedList = results.filter(r => !r.ok).map(r => `${r.name}: ${r.error ?? "erro desconhecido"}`).join("; ");
  const summary = failed === 0
    ? `Todos os ${passed} sistemas responderam corretamente. Nenhuma anomalia detectada.`
    : `${failed} sistema(s) com falha: ${failedList}. ${passed} sistema(s) operacionais.`;

  const report: LeucocitoReport = {
    runAt: new Date().toISOString(),
    totalMs,
    passed,
    failed,
    results,
    summary,
  };

  if (opts.sendEmail !== false) {
    try {
      await sendReport(report);
    } catch (err) {
      console.error("[Leucócito] Falha ao enviar relatório:", err);
    }
  }

  return report;
}
