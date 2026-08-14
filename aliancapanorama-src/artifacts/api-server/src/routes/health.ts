import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res): Promise<void> => {
  try {
    await pool.query("SELECT 1");
    const mem = process.memoryUsage();
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json({ ...data, memMb: Math.round(mem.rss / 1024 / 1024), heapMb: Math.round(mem.heapUsed / 1024 / 1024) });
  } catch {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

export default router;
