import { Router } from "express";
import { registrarPulso, getRoundtable } from "../lib/keepalive";

const router = Router();

// Endpoint de ping — qualquer sistema externo (GitHub Actions, UptimeRobot, etc.) bate aqui
// GET /api/sistemas/ping?from=github-actions
router.get("/sistemas/ping", (req, res) => {
  const from = (req.query["from"] as string) || "anon";
  const entry = registrarPulso(from, "ok");
  res.json({
    ok: true,
    pulso: entry,
    uptime_s: Math.floor(process.uptime()),
    roundtable: getRoundtable().slice(0, 5),
  });
});

// Roundtable completo — quem acordou quem e quando
// GET /api/sistemas/roundtable
router.get("/sistemas/roundtable", (_req, res) => {
  const pulsos = getRoundtable();
  const resumo = pulsos.reduce<Record<string, { total: number; ultimo: string }>>((acc, p) => {
    if (!acc[p.from]) acc[p.from] = { total: 0, ultimo: p.ts };
    acc[p.from]!.total++;
    return acc;
  }, {});

  res.json({
    total: pulsos.length,
    participantes: resumo,
    historico: pulsos.slice(0, 50),
  });
});

export default router;
