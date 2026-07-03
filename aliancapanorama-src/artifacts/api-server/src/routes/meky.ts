import { Router } from "express";
import { db } from "@workspace/db";
import { mekyTelemetry, mekyEvents, mekyControlQueue } from "@workspace/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const mekyRouter = Router();

// Middleware de autenticação simples via X-Meky-Token
function requireMekyToken(req: any, res: any, next: any) {
  const token = req.headers["x-meky-token"];
  if (!token || token !== process.env.MEKY_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

// POST /api/meky/telemetry — Termux envia estado periódico
mekyRouter.post("/telemetry", requireMekyToken, async (req, res) => {
  const { battery, gyroscope, activeProtocol, status, metadata } = req.body;
  if (battery == null || !gyroscope || !activeProtocol || !status) {
    return res.status(400).json({ error: "battery, gyroscope, activeProtocol e status são obrigatórios" });
  }
  const [row] = await db
    .insert(mekyTelemetry)
    .values({ battery, gyroscope, activeProtocol, status, metadata: metadata ?? null })
    .returning({ id: mekyTelemetry.id });

  // Limpar telemetria com mais de 7 dias (mantém apenas marcos)
  await db.execute(
    sql`DELETE FROM meky_telemetry WHERE timestamp < NOW() - INTERVAL '7 days'`
  );

  res.json({ ok: true, id: row.id });
});

// POST /api/meky/event — evento crítico imediato
mekyRouter.post("/event", requireMekyToken, async (req, res) => {
  const { source, description, protocol, metadata } = req.body;
  if (!source || !description) {
    return res.status(400).json({ error: "source e description são obrigatórios" });
  }
  const [row] = await db
    .insert(mekyEvents)
    .values({ source, description, protocol: protocol ?? null, metadata: metadata ?? null })
    .returning({ id: mekyEvents.id });
  res.json({ ok: true, id: row.id });
});

// GET /api/meky/control — robô faz polling de ordens pendentes
mekyRouter.get("/control", requireMekyToken, async (req, res) => {
  const pending = await db
    .select()
    .from(mekyControlQueue)
    .where(eq(mekyControlQueue.executed, 0))
    .orderBy(mekyControlQueue.createdAt)
    .limit(5);

  // Marcar como executado
  if (pending.length > 0) {
    const ids = pending.map((r) => r.id);
    await db.execute(
      sql`UPDATE meky_control_queue SET executed = 1, executed_at = NOW() WHERE id = ANY(${ids})`
    );
  }

  res.json({ orders: pending });
});

// GET /api/meky/status — dashboard (para /adm, requer sessão admin)
mekyRouter.get("/status", async (req, res) => {
  if (!req.session?.user || req.session.user.tier < 5) {
    return res.status(403).json({ error: "forbidden" });
  }
  const [lastTelemetry] = await db
    .select()
    .from(mekyTelemetry)
    .orderBy(desc(mekyTelemetry.timestamp))
    .limit(1);

  const recentEvents = await db
    .select()
    .from(mekyEvents)
    .orderBy(desc(mekyEvents.timestamp))
    .limit(20);

  const pendingOrders = await db
    .select()
    .from(mekyControlQueue)
    .where(eq(mekyControlQueue.executed, 0))
    .limit(10);

  res.json({ lastTelemetry: lastTelemetry ?? null, recentEvents, pendingOrders });
});

// POST /api/meky/command — Yuri ou ISA emitem ordem (requer sessão admin)
mekyRouter.post("/command", async (req, res) => {
  if (!req.session?.user || req.session.user.tier < 5) {
    return res.status(403).json({ error: "forbidden" });
  }
  const { protocol, payload } = req.body;
  if (!protocol) return res.status(400).json({ error: "protocol é obrigatório" });

  const [row] = await db
    .insert(mekyControlQueue)
    .values({ issuedBy: "yuri", protocol, payload: payload ?? null })
    .returning({ id: mekyControlQueue.id });

  res.json({ ok: true, id: row.id });
});
