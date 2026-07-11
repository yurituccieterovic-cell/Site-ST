/**
 * video.ts — Endpoint de geração de vídeos para IAs do ecossistema
 *
 * POST /api/video/gerar
 * Qualquer IA autenticada pode enfileirar um vídeo motion graphics.
 * O vídeo é gerado por um worker Python (video_pipeline.py) em background
 * e enviado por Gmail ao destinatário.
 *
 * Autenticação: mesmo BRIDGE_SECRET do Conector (x-bridge-token header)
 * ou API key de IA (x-api-key header).
 *
 * Payload:
 *   {
 *     titulo: string,
 *     remetente: "ISA" | "Amanda" | "MEKY" | "MC" | "Árvore" | string,
 *     dest_email?: string,           // padrão: yurituccieterovic@gmail.com
 *     scenes: [
 *       {
 *         fala: string,              // narração TTS por cena
 *         prompt: string,            // imagem Pollinations.ai
 *         texto_overlay?: string,    // texto na tela
 *         cor?: string,              // cor hex do overlay
 *       }, ...
 *     ]
 *   }
 *
 * Response: 202 { ok: true, job_id, message }
 */

import { Router } from "express";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";

const router = Router();

const videoRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 min
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Máximo 5 vídeos por 10 minutos por IP." },
});

const SceneSchema = z.object({
  fala:          z.string().min(2).max(500),
  prompt:        z.string().min(5).max(1000),
  texto_overlay: z.string().max(80).optional().default(""),
  cor:           z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().default("#FFD700"),
  seed:          z.number().int().optional(),
});

const VideoSchema = z.object({
  titulo:     z.string().min(1).max(100),
  remetente:  z.string().min(1).max(50).default("IA"),
  dest_email: z.string().email().optional(),
  scenes:     z.array(SceneSchema).min(1).max(20),
});

function authVideo(req: Parameters<Parameters<typeof router.post>[1]>[0]): boolean {
  const bridge = process.env["BRIDGE_SECRET"];
  const apiKey = process.env["AI_API_KEY"];
  const tok = req.headers["x-bridge-token"] ?? req.headers["authorization"]?.replace("Bearer ", "");
  const key = req.headers["x-api-key"];
  // tier >= 5 (sessão logada)
  const tier = (req.session as { userTier?: number }).userTier ?? 0;
  return (
    (typeof bridge === "string" && bridge.length > 0 && tok === bridge) ||
    (typeof apiKey === "string" && apiKey.length > 0 && key === apiKey) ||
    tier >= 5
  );
}

// POST /api/video/gerar
router.post("/video/gerar", videoRateLimit, async (req, res) => {
  if (!authVideo(req)) {
    res.status(401).json({ error: "Token de IA obrigatório (x-bridge-token ou x-api-key)" });
    return;
  }

  const parsed = VideoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Payload inválido", detail: parsed.error.message });
    return;
  }

  const { titulo, remetente, dest_email, scenes } = parsed.data;
  const job_id = randomUUID().slice(0, 8);
  const destEmail = dest_email ?? process.env["GMAIL_TO"] ?? "yurituccieterovic@gmail.com";

  // Salvar cenas em JSON temporário para o worker Python
  const cenesPath = join(tmpdir(), `video_${job_id}.json`);
  const cenesJson = scenes.map(s => ({
    fala:          s.fala,
    prompt:        s.prompt,
    texto_overlay: s.texto_overlay ?? "",
    cor:           s.cor ?? "#FFD700",
    ...(s.seed !== undefined ? { seed: s.seed } : {}),
  }));

  await writeFile(cenesPath, JSON.stringify(cenesJson));

  // Localizar video_pipeline.py (Arpia local ou fallback)
  const candidates = [
    "/root/Arpia/lib/video_pipeline.py",
    "/app/lib/video_pipeline.py",
    "./lib/video_pipeline.py",
  ];
  const pipelinePath = candidates.find(c => {
    try { require("fs").accessSync(c); return true; } catch { return false; }
  }) ?? candidates[0];

  // Spawn worker Python em background
  const worker = spawn("python3", [
    pipelinePath,
    "--json",    cenesPath,
    "--titulo",  titulo,
    "--nome",    remetente,
    "--dest",    destEmail,
  ], {
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PYTHONPATH: "/root/Arpia",
    },
  });
  worker.unref();

  res.status(202).json({
    ok: true,
    job_id,
    message: `Vídeo "${titulo}" enfileirado por ${remetente}. Será enviado a ${destEmail} em ~5–15 min.`,
  });
});

// GET /api/video/templates — lista templates disponíveis
router.get("/video/templates", (req, res) => {
  res.json({
    templates: [
      { id: "isa",    nome: "ISA",    desc: "Resumo diário de aprendizados", campos: ["insights[]", "data?"] },
      { id: "amanda", nome: "Amanda", desc: "Relatório de atividade do laboratório", campos: ["eventos[]", "data?"] },
      { id: "meky",   nome: "MEKY",   desc: "Status emocional e memórias", campos: ["memorias[]", "estado?"] },
      { id: "mc",     nome: "MC",     desc: "Relatório de auditoria do ecossistema", campos: ["nos[]", "data?"] },
    ],
    uso: "POST /api/video/gerar com scenes[] personalizadas ou use o template via argumento --template no CLI",
  });
});

export default router;
