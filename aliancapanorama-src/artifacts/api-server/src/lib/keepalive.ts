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

  // Jasmim keepalive: conta posts para manter jm_posts aquecido no cache Neon
  cron.schedule("*/11 * * * *", async () => {
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

  logger.info("Keepalive: crons iniciados (Neon:*/9min · self:*/7min · Jasmim:*/11min · email-diário:11h UTC)");
}
