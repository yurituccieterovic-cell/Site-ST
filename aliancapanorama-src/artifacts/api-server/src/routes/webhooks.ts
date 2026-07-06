import { Router } from "express";
import { db, isaMemoryTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { sanitizeExternalInput } from "../lib/sanitize-external";
import { logger } from "../lib/logger";

const router = Router();

const EXTERNAL_VOICE_SECRET = process.env["EXTERNAL_VOICE_WEBHOOK_SECRET"] ?? "";

// POST /api/webhooks/external-voice — recebe transcrições de voz de serviços externos
// Requer: X-Webhook-Secret header (configurar EXTERNAL_VOICE_WEBHOOK_SECRET no Railway)
// Sanitiza o transcript contra injeção de prompt antes de armazenar na memória ISA
router.post("/webhooks/external-voice", async (req, res): Promise<void> => {
  const secret = req.headers["x-webhook-secret"];
  if (EXTERNAL_VOICE_SECRET && secret !== EXTERNAL_VOICE_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const idempotencyKey = req.headers["x-idempotency-key"] as string | undefined;

  const { transcript, source = "external", metadata = {} } = req.body as {
    transcript?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  };

  if (!transcript || typeof transcript !== "string") {
    res.status(400).json({ error: "transcript obrigatório" });
    return;
  }

  // Idempotência: se X-Idempotency-Key já foi processado, responde 200 sem reinserir
  if (idempotencyKey) {
    const [existing] = await db
      .select({ id: isaMemoryTable.id })
      .from(isaMemoryTable)
      .where(sql`metadata->>'idempotencyKey' = ${idempotencyKey}`)
      .limit(1);
    if (existing) {
      logger.info({ idempotencyKey }, "external-voice: request duplicado ignorado");
      res.json({ received: true, duplicate: true });
      return;
    }
  }

  const check = sanitizeExternalInput(transcript);
  if (!check.safe) {
    logger.warn({ source, pattern: check.pattern }, "prompt injection detectado em external-voice");
    res.status(400).json({ error: "Conteúdo inválido detectado" });
    return;
  }

  await db.insert(isaMemoryTable).values({
    context: "external-voice",
    role: "external",
    content: check.text,
    location: `/webhooks/external-voice`,
    metadata: { source, ...(idempotencyKey ? { idempotencyKey } : {}), ...metadata },
  });

  logger.info({ source, chars: check.text.length }, "external-voice: transcript armazenado");
  res.json({ received: true });
});

export default router;
