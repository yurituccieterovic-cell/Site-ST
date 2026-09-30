import { Router } from "express";
import { z } from "zod";
import { db, aoMemoriesTable } from "@arvore/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: import("express").IRouter = Router();
router.use(requireAuth);

const memorySchema = z.object({
  content: z.string().min(1).max(5000),
  category: z.enum(["fact", "preference", "event", "reflection", "learning", "assembleia"]).optional(),
  visibility: z.enum(["private", "public"]).optional(),
  origin: z.string().max(100).optional(),
  originRef: z.string().max(100).optional(),
  tags: z.array(z.string()).max(20).optional(),
  conversationId: z.number().int().positive().optional(),
});

router.get("/memories", async (req, res) => {
  const userId = req.session.userId!;
  const category = req.query["category"] as string | undefined;
  const q = req.query["q"] as string | undefined;
  const limit = Math.min(Number(req.query["limit"] ?? 50), 200);

  const conditions = [eq(aoMemoriesTable.userId, userId)];
  if (category) conditions.push(eq(aoMemoriesTable.category, category));
  if (q) conditions.push(sql`content ILIKE ${"%" + q.slice(0, 100) + "%"}`);

  const mems = await db
    .select()
    .from(aoMemoriesTable)
    .where(and(...conditions))
    .orderBy(desc(aoMemoriesTable.createdAt))
    .limit(limit);

  res.setHeader("Cache-Control", "private, no-store");
  res.json(mems);
});

router.post("/memories", async (req, res) => {
  const userId = req.session.userId!;
  const parsed = memorySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos", details: parsed.error.flatten() }); return; }

  const { content, category, visibility, origin, originRef, tags, conversationId } = parsed.data;
  const [mem] = await db.insert(aoMemoriesTable).values({
    userId,
    conversationId: conversationId ?? null,
    content,
    category: category ?? "fact",
    visibility: visibility ?? "private",
    origin: origin ?? "manual",
    originRef: originRef ?? null,
    tags: tags ?? [],
  }).returning();

  res.status(201).json(mem);
});

router.patch("/memories/:id", async (req, res) => {
  const userId = req.session.userId!;
  const id = Number(req.params["id"]);
  const parsed = memorySchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const d = parsed.data;
  if (d.content    !== undefined) updates["content"]    = d.content;
  if (d.category   !== undefined) updates["category"]   = d.category;
  if (d.visibility !== undefined) updates["visibility"] = d.visibility;
  if (d.tags       !== undefined) updates["tags"]       = d.tags;

  const [mem] = await db
    .update(aoMemoriesTable)
    .set(updates)
    .where(and(eq(aoMemoriesTable.id, id), eq(aoMemoriesTable.userId, userId)))
    .returning();
  if (!mem) { res.status(404).json({ error: "Memória não encontrada" }); return; }
  res.json(mem);
});

router.delete("/memories/:id", async (req, res) => {
  const userId = req.session.userId!;
  const id = Number(req.params["id"]);
  const [deleted] = await db
    .delete(aoMemoriesTable)
    .where(and(eq(aoMemoriesTable.id, id), eq(aoMemoriesTable.userId, userId)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Memória não encontrada" }); return; }
  res.json({ ok: true });
});

export default router;
