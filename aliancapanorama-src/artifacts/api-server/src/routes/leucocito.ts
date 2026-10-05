/**
 * Leucócito — rotas de diagnóstico do sistema.
 *
 * POST /api/leucocito/run  → executa diagnóstico completo (bridge-auth ou admin)
 * GET  /api/leucocito/last → retorna último relatório em memória
 */

import { Router } from "express";
import { runLeucocito, type LeucocitoReport } from "../lib/leucocito";

const router = Router();

// Cache simples do último relatório
let lastReport: LeucocitoReport | null = null;

function bridgeAuth(req: { headers: Record<string, string | string[] | undefined> }): boolean {
  const secret = process.env.BRIDGE_SECRET ?? "";
  if (!secret) return false;
  return req.headers["x-bridge-secret"] === secret || req.headers["authorization"] === `Bearer ${secret}`;
}

// POST /api/leucocito/run — dispara diagnóstico completo
router.post("/leucocito/run", async (req, res) => {
  if (!bridgeAuth(req as unknown as { headers: Record<string, string | string[] | undefined> })) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const { sendEmail = true, force = true } = (req.body ?? {}) as { sendEmail?: boolean; force?: boolean };

  try {
    const report = await runLeucocito({ sendEmail, force });
    lastReport = report;
    res.json(report);
  } catch (err) {
    res.status(429).json({ error: (err as Error).message });
  }
});

// GET /api/leucocito/last — retorna último relatório
router.get("/leucocito/last", (req, res) => {
  if (!bridgeAuth(req as unknown as { headers: Record<string, string | string[] | undefined> })) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  if (!lastReport) {
    res.status(404).json({ error: "Nenhum diagnóstico executado ainda" });
    return;
  }

  res.json(lastReport);
});

export default router;
