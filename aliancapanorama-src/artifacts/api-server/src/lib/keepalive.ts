import cron from "node-cron";
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

  logger.info("Keepalive: crons iniciados (Neon:*/9min · self:*/7min)");
}
