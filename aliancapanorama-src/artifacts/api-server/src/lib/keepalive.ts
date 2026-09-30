import cron from "node-cron";
import nodemailer from "nodemailer";
import { logger } from "./logger";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

// Roundtable: log em memória dos pulsos entre sistemas
export interface Pulso {
  from: string;
  ts: string;
  status: "ok" | "erro";
  msg?: string;
}

const roundtable: Pulso[] = [];

export function registrarPulso(from: string, status: Pulso["status"] = "ok", msg?: string): Pulso {
  const entry: Pulso = { from, ts: new Date().toISOString(), status, ...(msg ? { msg } : {}) };
  roundtable.unshift(entry);
  if (roundtable.length > 100) roundtable.pop();
  return entry;
}

export function getRoundtable(): Pulso[] {
  return roundtable;
}

export function startKeepaliveCron(): void {
  // Neon keepalive: SELECT 1 a cada 9 minutos (free tier hiberna após ~5min idle)
  // Roda nos minutos ímpares para intercalar com GitHub Actions (:00, :05, :10...)
  cron.schedule("*/9 * * * *", async () => {
    try {
      await db.execute(sql`SELECT 1`);
      registrarPulso("backend-neon", "ok");
      logger.info("Keepalive: Neon pulsou — conexão quente");
    } catch (err) {
      registrarPulso("backend-neon", "erro", String(err));
      logger.error({ err }, "Keepalive: Neon falhou no pulso");
    }
  });

  // Auto-ping: backend se anuncia no roundtable a cada 7 minutos
  // Garante que mesmo sem GitHub Actions o servidor registra presença
  cron.schedule("*/7 * * * *", () => {
    registrarPulso("backend-self", "ok");
    logger.debug("Keepalive: backend acordado");
  });

  // Self-ping: servidor pinga a própria URL externa a cada 13 min
  // Garante que o Render receba requisição HTTP de entrada mesmo quando GitHub Actions atrasa
  cron.schedule("*/13 * * * *", async () => {
    const base = process.env["RENDER_EXTERNAL_URL"] ?? "https://site-st.onrender.com";
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 20000);
      const r = await fetch(`${base}/api/healthz`, { signal: ctrl.signal }).finally(() => clearTimeout(tid));
      registrarPulso("self-ping", "ok", `${r.status}`);
    } catch (err) {
      registrarPulso("self-ping", "erro", String(err));
    }
  });

  // Age warm-up: mantém queries Age aquecidas no pool Neon a cada 11 min
  cron.schedule("*/11 * * * *", async () => {
    try {
      await db.execute(sql`SELECT COUNT(*) FROM age_professionals WHERE ativa = true`);
      await db.execute(sql`SELECT COUNT(*) FROM age_gestoras WHERE ativa = true`);
      registrarPulso("age-warm", "ok");
    } catch (err) {
      registrarPulso("age-warm", "erro", String(err));
    }
  });

  // Jasmim keepalive: conta posts para manter jm_posts aquecido no cache Neon
  cron.schedule("*/17 * * * *", async () => {
    try {
      const r = await db.execute(sql`SELECT COUNT(*) FROM jm_posts WHERE projeto = 'age'`);
      const total = (r as any).rows?.[0]?.count ?? 0;
      registrarPulso("jasmim-keepalive", "ok", `jm_posts.age=${total}`);
    } catch (err) {
      registrarPulso("jasmim-keepalive", "erro", String(err));
    }
  });

  // Scheduled emails: verifica diariamente às 08:00 BRT (11:00 UTC)
  cron.schedule("0 11 * * *", async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const pending = await db.execute(sql`
        SELECT id, to_email, subject, body FROM scheduled_emails
        WHERE send_at = ${today} AND sent = false
      `);
      const rows = (pending as any).rows ?? [];
      if (rows.length === 0) return;

      const mailer = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env["GMAIL_ACCOUNT"], pass: process.env["GMAIL_APP_PASSWORD"] },
      });
      for (const r of rows) {
        await mailer.sendMail({ from: process.env["GMAIL_ACCOUNT"], to: r.to_email, subject: r.subject, text: r.body });
        await db.execute(sql`UPDATE scheduled_emails SET sent = true, sent_at = now() WHERE id = ${r.id}`);
        registrarPulso("scheduled-email", "ok", `Enviado para ${r.to_email}: ${r.subject.slice(0, 40)}`);
        logger.info(`Scheduled email enviado: ${r.subject.slice(0, 40)}`);
      }
    } catch (err) {
      registrarPulso("scheduled-email", "erro", String(err));
      logger.error({ err }, "Scheduled email: erro ao enviar");
    }
  });

  // Rapadura snapshot mensal: 1º de cada mês às 06h UTC
  // Grava rapadura_historico_cotas com valor_cota atual de todos os fundos ativos
  cron.schedule("0 6 1 * *", async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const fundos = await db.execute(sql`
        SELECT id, valor_cota FROM rapadura_fundos WHERE deleted_at IS NULL AND valor_cota IS NOT NULL
      `);
      const rows = (fundos as any).rows ?? [];
      let inseridos = 0;
      for (const f of rows) {
        await db.execute(sql`
          INSERT INTO rapadura_historico_cotas (fundo_id, data, valor_cota, fonte)
          VALUES (${f.id}, ${today}, ${f.valor_cota}, 'CRON_MENSAL')
          ON CONFLICT (fundo_id, data) DO NOTHING
        `);
        inseridos++;
      }
      registrarPulso("rapadura-snapshot", "ok", `fundos:${inseridos} data:${today}`);
      logger.info({ inseridos, today }, "Rapadura: snapshot mensal concluído");
    } catch (err) {
      registrarPulso("rapadura-snapshot", "erro", String(err));
      logger.error({ err }, "Rapadura: erro no snapshot mensal");
    }
  });

  // Job Φ: recalcula coerência (phi) de tasks com indices_data preenchidos, 1x/hora
  cron.schedule("5 * * * *", async () => {
    try {
      const { calcularPhi } = await import("@workspace/db");
      const rows = await db.execute(sql`
        SELECT id, indices_data FROM tasks
        WHERE indices_data IS NOT NULL AND indices_data != '{}'::jsonb
        LIMIT 500
      `);
      const tasks = (rows as any).rows ?? [];
      let atualizadas = 0;
      for (const t of tasks) {
        const data = t.indices_data as Record<string, unknown>;
        const phi = calcularPhi(data);
        const idx0 = data["0"] as Record<string, unknown> ?? {};
        if (idx0["phi"] !== phi) {
          data["0"] = { ...idx0, phi };
          await db.execute(sql`
            UPDATE tasks SET indices_data = ${JSON.stringify(data)}::jsonb, updated_at = now()
            WHERE id = ${t.id}
          `);
          atualizadas++;
        }
      }
      if (atualizadas > 0) {
        registrarPulso("phi-job", "ok", `${atualizadas}/${tasks.length} tasks`);
        logger.info({ atualizadas }, "Job Φ: coerência recalculada");
      }
    } catch (err) {
      registrarPulso("phi-job", "erro", String(err));
      logger.error({ err }, "Job Φ: erro");
    }
  });

  // Lembrete semanal (segunda-feira às 10h UTC = 7h BRT): atualizar IAs, Céu, Jasmim
  cron.schedule("0 10 * * 1", async () => {
    const mailer = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env["GMAIL_ACCOUNT"], pass: process.env["GMAIL_APP_PASSWORD"] },
    });
    const week = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
    await mailer.sendMail({
      from: process.env["GMAIL_ACCOUNT"],
      to: "luddlocke@gmail.com",
      subject: `🔔 Lembrete semanal PAP — ${week}`,
      text: `Olá Yuri!\n\nLembrete automático de atualização semanal:\n\n📋 Itens para revisar:\n- IAs do sistema (CeuPage) — status, modelo, conversa, questao\n- Feed de sonhos do Céu — novos posts das IAs\n- Jasmim — projetos, setores, timeline\n- Tasks pendentes no Age\n- Pendências do MAPA\n\n🔗 Links rápidos:\n- Céu: https://site-st.vercel.app/aliancapanorama/ceu\n- Jasmim: https://site-st.vercel.app/aliancapanorama/jasmim\n- Age Lisange: https://site-st.onrender.com/age/lisange\n- Tasks: via Dodge (#2)\n\n— Sistema PAP · Dodge 🦔`,
    }).catch(() => {});
    registrarPulso("weekly-reminder", "ok", `enviado ${week}`);
    logger.info({ week }, "Lembrete semanal enviado");
  });

  logger.info("Keepalive: crons iniciados (Neon:*/9min · self-ping:*/13min · age-warm:*/11min · self-announce:*/7min · Jasmim:*/17min · email-diário:11h UTC · rapadura-snapshot:1º mês 06h · phi-job:*/hora:05 · weekly-reminder:seg 10h UTC)");
}
