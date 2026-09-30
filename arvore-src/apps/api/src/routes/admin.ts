import { Router } from "express";
import { db, aoProviderMetricsTable } from "@arvore/db";
import { eq, desc, sql, gte } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth.js";
import { listProviders, getCircuitBreakerStates } from "@arvore/router";

const router: import("express").IRouter = Router();
router.use(requireAdmin);

router.get("/admin/status", async (_req, res) => {
  const breakers = getCircuitBreakerStates();
  const providers = listProviders();

  // Métricas das últimas 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const metrics = await db
    .select({
      provider: aoProviderMetricsTable.provider,
      model: aoProviderMetricsTable.model,
      calls: sql<number>`count(*)`,
      successes: sql<number>`count(*) filter (where success = true)`,
      avgLatency: sql<number>`round(avg(latency_ms)) filter (where success = true)`,
      lastSuccess: sql<Date>`max(recorded_at) filter (where success = true)`,
      lastFail: sql<Date>`max(recorded_at) filter (where success = false)`,
    })
    .from(aoProviderMetricsTable)
    .where(gte(aoProviderMetricsTable.recordedAt, since))
    .groupBy(aoProviderMetricsTable.provider, aoProviderMetricsTable.model);

  const metricsMap = Object.fromEntries(metrics.map((m) => [m.provider, m]));

  const status = providers.map((p) => ({
    ...p,
    circuit: breakers[p.name],
    metrics: metricsMap[p.name] ?? null,
  }));

  res.json({ ok: true, providers: status });
});

// Teste manual de conexão (envia uma mensagem curta e mede latência)
router.post("/admin/test/:provider", async (req, res) => {
  const provider = req.params["provider"] as "groq" | "gemini" | "cloudflare" | "openrouter";
  const { routeChat } = await import("@arvore/router");
  const { buildSystemPrompt } = await import("@arvore/identity");

  let content = "";
  let error: string | undefined;
  const start = Date.now();

  try {
    await routeChat(
      [{ role: "user", content: "Diga apenas: OK" }],
      buildSystemPrompt("veloz"),
      (chunk) => { if (chunk.type === "delta" && chunk.content) content += chunk.content; },
      { preferProvider: provider }
    );
  } catch (err) {
    error = String(err);
  }

  const latencyMs = Date.now() - start;
  res.json({ ok: !error, provider, latencyMs, preview: content.slice(0, 100), error });
});

export default router;
