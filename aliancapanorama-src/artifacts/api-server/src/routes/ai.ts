import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, nodesTable, exercisesTable, usersTable, exerciseAttemptsTable } from "@workspace/db";
import { eq, sql, asc, count } from "drizzle-orm";
import { rateLimit } from "express-rate-limit";

const router: IRouter = Router();

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Rate limit atingido em /api/ai/*. Máximo 100 req/min por IP." },
});

function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-api-key"];
  const expected = process.env.AI_API_KEY;
  if (!expected || key !== expected) {
    res.status(401).json({ error: "API key inválida" });
    return;
  }
  next();
}

router.use("/ai", aiRateLimit, requireApiKey);

// ─── Nodes ───────────────────────────────────────────────────────────────────

router.get("/ai/nodes", async (req, res): Promise<void> => {
  const limit  = Math.min(Number(req.query["limit"]  ?? 100), 500);
  const offset = Math.max(Number(req.query["offset"] ?? 0), 0);

  const [{ total }] = await db.select({ total: count() }).from(nodesTable);
  const nodes = await db
    .select()
    .from(nodesTable)
    .orderBy(nodesTable.level, nodesTable.sortOrder)
    .limit(limit)
    .offset(offset);

  res.json({ data: nodes, total, limit, offset });
});

router.get("/ai/nodes/:code", async (req, res): Promise<void> => {
  const { code } = req.params;
  const [node] = await db.select().from(nodesTable).where(eq(nodesTable.code, code));
  if (!node) { res.status(404).json({ error: "Node não encontrado" }); return; }
  const children = await db
    .select()
    .from(nodesTable)
    .where(eq(nodesTable.parentCode, code))
    .orderBy(nodesTable.sortOrder);
  res.json({ ...node, children });
});

router.post("/ai/nodes", async (req, res): Promise<void> => {
  const { code, title, abbreviation, subtitle, content, imageUrl, parentCode, level, sortOrder } = req.body;
  if (!code || !title) { res.status(400).json({ error: "code e title são obrigatórios" }); return; }
  const [node] = await db
    .insert(nodesTable)
    .values({ code, title, abbreviation, subtitle, content, imageUrl, parentCode, level: level ?? 0, sortOrder: sortOrder ?? 0 })
    .returning();
  res.status(201).json(node);
});

router.put("/ai/nodes/:code", async (req, res): Promise<void> => {
  const { code } = req.params;
  const { title, abbreviation, subtitle, content, imageUrl, parentCode, level, sortOrder } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (abbreviation !== undefined) updates.abbreviation = abbreviation;
  if (subtitle !== undefined) updates.subtitle = subtitle;
  if (content !== undefined) updates.content = content;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (parentCode !== undefined) updates.parentCode = parentCode;
  if (level !== undefined) updates.level = level;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Nenhum campo para atualizar" }); return; }
  const [node] = await db.update(nodesTable).set(updates).where(eq(nodesTable.code, code)).returning();
  if (!node) { res.status(404).json({ error: "Node não encontrado" }); return; }
  res.json(node);
});

router.delete("/ai/nodes/:code", async (req, res): Promise<void> => {
  const { code } = req.params;
  const [deleted] = await db.delete(nodesTable).where(eq(nodesTable.code, code)).returning();
  if (!deleted) { res.status(404).json({ error: "Node não encontrado" }); return; }
  res.json({ ok: true });
});

// ─── Exercises ───────────────────────────────────────────────────────────────

router.get("/ai/exercises", async (req, res): Promise<void> => {
  const { nodeCode } = req.query;
  const rows = nodeCode
    ? await db.select().from(exercisesTable).where(eq(exercisesTable.nodeCode, String(nodeCode)))
    : await db.select().from(exercisesTable);
  res.json(rows);
});

router.post("/ai/exercises", async (req, res): Promise<void> => {
  const { nodeCode, question, options, correctOption, explanation } = req.body;
  if (!nodeCode || !question || !options || correctOption === undefined) {
    res.status(400).json({ error: "nodeCode, question, options e correctOption são obrigatórios" });
    return;
  }
  const [exercise] = await db
    .insert(exercisesTable)
    .values({ nodeCode, question, options, correctOption, explanation })
    .returning();
  res.status(201).json(exercise);
});

router.put("/ai/exercises/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { question, options, correctOption, explanation, nodeCode } = req.body;
  const updates: Record<string, unknown> = {};
  if (question !== undefined) updates.question = question;
  if (options !== undefined) updates.options = options;
  if (correctOption !== undefined) updates.correctOption = correctOption;
  if (explanation !== undefined) updates.explanation = explanation;
  if (nodeCode !== undefined) updates.nodeCode = nodeCode;
  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Nenhum campo para atualizar" }); return; }
  const [exercise] = await db.update(exercisesTable).set(updates).where(eq(exercisesTable.id, id)).returning();
  if (!exercise) { res.status(404).json({ error: "Exercício não encontrado" }); return; }
  res.json(exercise);
});

router.delete("/ai/exercises/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(exercisesTable).where(eq(exercisesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Exercício não encontrado" }); return; }
  res.json({ ok: true });
});

// ─── Users (read-only, sem senhas, paginado) ─────────────────────────────────

router.get("/ai/users", async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
  const offset = Number(req.query["offset"] ?? 0);
  const [users, [{ total }]] = await Promise.all([
    db
      .select({
        id: usersTable.id,
        login: usersTable.login,
        displayName: usersTable.displayName,
        tier: usersTable.tier,
        userCode: usersTable.userCode,
        subscriptionStatus: usersTable.subscriptionStatus,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(asc(usersTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)` }).from(usersTable),
  ]);
  res.json({ data: users, total: Number(total), limit, offset });
});

// ─── Stats ───────────────────────────────────────────────────────────────────

router.get("/ai/stats", async (_req, res): Promise<void> => {
  const [[userCount], [nodeCount], [exerciseCount], [attemptCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(nodesTable),
    db.select({ count: sql<number>`count(*)` }).from(exercisesTable),
    db.select({ count: sql<number>`count(*)` }).from(exerciseAttemptsTable),
  ]);
  const tierDist = await db
    .select({ tier: usersTable.tier, count: sql<number>`count(*)` })
    .from(usersTable)
    .groupBy(usersTable.tier);
  res.json({
    users: Number(userCount.count),
    nodes: Number(nodeCount.count),
    exercises: Number(exerciseCount.count),
    exerciseAttempts: Number(attemptCount.count),
    tierDistribution: Object.fromEntries(tierDist.map((r) => [r.tier, Number(r.count)])),
  });
});

export default router;
