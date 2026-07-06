import { Router } from "express";
import { db } from "@workspace/db";
import { larTasksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function requireAdmin(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): boolean {
  if ((req.session.userTier ?? 0) < 5) {
    res.status(403).json({ error: "Acesso restrito" });
    return false;
  }
  return true;
}

// GET /api/lar/tasks — lista tarefas (filtro opcional: ?categoria=A|B|C|D)
router.get("/lar/tasks", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { categoria, status } = req.query as Record<string, string | undefined>;

  let query = db.select().from(larTasksTable);
  const conditions = [];
  if (categoria) conditions.push(eq(larTasksTable.categoria, categoria));
  if (status)    conditions.push(eq(larTasksTable.status, status));

  const tasks = conditions.length > 0
    ? await db.select().from(larTasksTable).where(and(...conditions))
    : await query;

  res.json(tasks);
});

// POST /api/lar/tasks — criar tarefa
router.post("/lar/tasks", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { title, categoria = "B", prioridade = "media", observacoes } = req.body as {
    title?: string;
    categoria?: string;
    prioridade?: string;
    observacoes?: string;
  };

  if (!title) { res.status(400).json({ error: "title obrigatório" }); return; }

  const [task] = await db.insert(larTasksTable)
    .values({ title, categoria, prioridade, observacoes })
    .returning();

  res.status(201).json(task);
});

// PATCH /api/lar/tasks/:id — atualizar status ou dados
router.patch("/lar/tasks/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id ?? "0", 10);
  if (!id) { res.status(400).json({ error: "id inválido" }); return; }

  const { status, prioridade, observacoes } = req.body as Record<string, string | undefined>;
  const updates: Partial<typeof larTasksTable.$inferInsert> = { updatedAt: new Date() };
  if (status)    updates.status    = status;
  if (prioridade) updates.prioridade = prioridade;
  if (observacoes !== undefined) updates.observacoes = observacoes;

  const [updated] = await db.update(larTasksTable)
    .set(updates)
    .where(eq(larTasksTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Tarefa não encontrada" }); return; }
  res.json(updated);
});

// DELETE /api/lar/tasks/:id
router.delete("/lar/tasks/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id ?? "0", 10);
  if (!id) { res.status(400).json({ error: "id inválido" }); return; }

  await db.delete(larTasksTable).where(eq(larTasksTable.id, id));
  res.json({ ok: true });
});

export default router;
