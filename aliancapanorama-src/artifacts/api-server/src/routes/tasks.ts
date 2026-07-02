import { Router } from "express";
import { db } from "@workspace/db";
import {
  tasksTable,
  taskRelationsTable,
  eventTypesTable,
  catalogoCentralTable,
  insertTaskSchema,
  insertEventTypeSchema,
  insertCatalogoCentralSchema,
} from "@workspace/db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";

const router = Router();

// ─── TASKS ────────────────────────────────────────────────────────────────────

router.get("/tasks", async (req, res) => {
  const { status, type, assigned_to, limit = "50", offset = "0" } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit), 200);
  const off = parseInt(offset) || 0;

  const conditions = [];
  if (status) conditions.push(eq(tasksTable.status, status));
  if (type) conditions.push(eq(tasksTable.type, type));
  if (assigned_to) conditions.push(eq(tasksTable.assignedTo, parseInt(assigned_to)));

  const rows = await db
    .select()
    .from(tasksTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tasksTable.priority), desc(tasksTable.createdAt))
    .limit(lim)
    .offset(off);

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(tasksTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  res.json({ data: rows, total: count, limit: lim, offset: off });
});

router.get("/tasks/stats", async (req, res) => {
  const byStatus = await db.execute(sql`
    SELECT status, count(*)::int as count FROM tasks GROUP BY status ORDER BY count DESC
  `);
  const byType = await db.execute(sql`
    SELECT type, count(*)::int as count FROM tasks GROUP BY type ORDER BY count DESC
  `);
  const avgPriority = await db.execute(sql`SELECT avg(priority)::float as avg FROM tasks`);
  res.json({ byStatus: byStatus.rows, byType: byType.rows, avgPriority: avgPriority.rows[0]?.avg });
});

router.get("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "id inválido" }); return; }

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id)).limit(1);
  if (!task) { res.status(404).json({ error: "Task não encontrada" }); return; }

  const relations = await db.select().from(taskRelationsTable).where(eq(taskRelationsTable.taskId, id));
  res.json({ ...task, relations });
});

router.post("/tasks", async (req, res) => {
  const parsed = insertTaskSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const [task] = await db.insert(tasksTable).values(parsed.data).returning();
  res.status(201).json(task);
});

router.patch("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "id inválido" }); return; }

  const { status, priority, title, description, assignedToAgent, catalogTags } = req.body as {
    status?: string; priority?: number; title?: string; description?: string;
    assignedToAgent?: string; catalogTags?: Record<string, unknown>;
  };

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status !== undefined) {
    updates["status"] = status;
    if (status === "completed" || status === "failed") updates["completedAt"] = new Date();
  }
  if (priority !== undefined) updates["priority"] = priority;
  if (title !== undefined) updates["title"] = title;
  if (description !== undefined) updates["description"] = description;
  if (assignedToAgent !== undefined) updates["assignedToAgent"] = assignedToAgent;
  if (catalogTags !== undefined) updates["catalogTags"] = catalogTags;

  const [updated] = await db
    .update(tasksTable)
    .set(updates as Parameters<typeof db.update>[0] extends { set: infer S } ? S : never)
    .where(eq(tasksTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Task não encontrada" }); return; }
  res.json(updated);
});

// ─── TASK RELATIONS ───────────────────────────────────────────────────────────

router.post("/tasks/:id/relations", async (req, res) => {
  const taskId = parseInt(req.params["id"] ?? "");
  const { relatedTaskId, relationType = "related" } = req.body as { relatedTaskId: number; relationType?: string };

  if (isNaN(taskId) || !relatedTaskId) { res.status(400).json({ error: "IDs inválidos" }); return; }

  const [rel] = await db.insert(taskRelationsTable).values({ taskId, relatedTaskId, relationType }).returning();
  res.status(201).json(rel);
});

router.get("/tasks/:id/relations", async (req, res) => {
  const taskId = parseInt(req.params["id"] ?? "");
  if (isNaN(taskId)) { res.status(400).json({ error: "id inválido" }); return; }

  const relations = await db.select().from(taskRelationsTable).where(eq(taskRelationsTable.taskId, taskId));
  res.json(relations);
});

// ─── EVENT TYPES ──────────────────────────────────────────────────────────────

router.get("/tasks/event-types", async (_req, res) => {
  const types = await db.select().from(eventTypesTable).orderBy(eventTypesTable.name);
  res.json(types);
});

router.post("/tasks/event-types", async (req, res) => {
  const parsed = insertEventTypeSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [et] = await db.insert(eventTypesTable).values(parsed.data).returning();
  res.status(201).json(et);
});

// ─── CATÁLOGO CENTRAL ─────────────────────────────────────────────────────────

router.get("/catalog", async (req, res) => {
  const { tipo, tags, limit = "50", offset = "0" } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit), 200);
  const off = parseInt(offset) || 0;

  const conditions = [];
  if (tipo) conditions.push(eq(catalogoCentralTable.tipo, tipo));

  const rows = await db
    .select()
    .from(catalogoCentralTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(catalogoCentralTable.createdAt))
    .limit(lim)
    .offset(off);

  res.json({ data: rows, total: rows.length, limit: lim, offset: off });
});

router.post("/catalog", async (req, res) => {
  const parsed = insertCatalogoCentralSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [item] = await db.insert(catalogoCentralTable).values(parsed.data).returning();
  res.status(201).json(item);
});

router.patch("/catalog/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, tags, acesso, validadoPor, artefatoUrl } = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (titulo) updates["titulo"] = titulo;
  if (descricao) updates["descricao"] = descricao;
  if (tags) updates["tags"] = tags;
  if (acesso) updates["acesso"] = acesso;
  if (validadoPor) updates["validadoPor"] = validadoPor;
  if (artefatoUrl) updates["artefatoUrl"] = artefatoUrl;

  const [updated] = await db
    .update(catalogoCentralTable)
    .set(updates as Parameters<typeof db.update>[0] extends { set: infer S } ? S : never)
    .where(eq(catalogoCentralTable.id, id as string))
    .returning();

  if (!updated) { res.status(404).json({ error: "Item não encontrado" }); return; }
  res.json(updated);
});

export default router;
