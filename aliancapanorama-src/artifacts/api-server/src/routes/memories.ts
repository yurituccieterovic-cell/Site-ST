import { Router } from "express";
import { db } from "@workspace/db";
import { babelMemories } from "@workspace/db/schema";
import { desc, sql, ilike } from "drizzle-orm";

const router = Router();

// GET /api/memories — busca por texto, filtra por source/tags
router.get("/memories", async (req, res) => {
  const { query, source, limit = "10" } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit) || 10, 100);

  const rows = await db
    .select()
    .from(babelMemories)
    .where(query?.trim() ? ilike(babelMemories.content, `%${query.trim()}%`) : undefined)
    .orderBy(desc(babelMemories.createdAt))
    .limit(lim);

  res.json({ memories: rows, total: rows.length });
});

// POST /api/memories — salva nova memória
router.post("/memories", async (req, res) => {
  const { content, tags, source = "babel", metadata } = req.body ?? {};
  if (!content?.trim()) {
    res.status(400).json({ error: "content required" }); return;
  }
  await db.insert(babelMemories).values({
    content: String(content).trim().slice(0, 8000),
    tags:    tags ? String(tags).slice(0, 200) : null,
    source:  String(source).slice(0, 100),
    metadata: metadata ?? null,
  });
  res.status(201).json({ ok: true });
});

export default router;
