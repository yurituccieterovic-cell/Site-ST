import { Router } from "express";
import { db } from "@workspace/db";
import { gastadorListasTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function requireAdmin(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): boolean {
  if ((req.session.userTier ?? 0) < 5) {
    res.status(403).json({ error: "Acesso restrito" });
    return false;
  }
  return true;
}

// GET /api/gastador/listas — lista itens (filtro opcional: ?local=X&comprado=false)
router.get("/gastador/listas", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { local, comprado } = req.query as Record<string, string | undefined>;

  const conditions = [];
  if (local)    conditions.push(eq(gastadorListasTable.local, local));
  if (comprado !== undefined) conditions.push(eq(gastadorListasTable.comprado, comprado === "true"));

  const items = conditions.length > 0
    ? await db.select().from(gastadorListasTable).where(and(...conditions))
    : await db.select().from(gastadorListasTable);

  res.json(items);
});

// POST /api/gastador/listas — adicionar item
router.post("/gastador/listas", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { local, item, quantidade } = req.body as {
    local?: string;
    item?: string;
    quantidade?: string;
  };

  if (!local || !item) { res.status(400).json({ error: "local e item obrigatórios" }); return; }

  const [created] = await db.insert(gastadorListasTable)
    .values({ local, item, quantidade })
    .returning();

  res.status(201).json(created);
});

// PATCH /api/gastador/listas/:id/comprado — marcar como comprado/pendente
router.patch("/gastador/listas/:id/comprado", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id ?? "0", 10);
  if (!id) { res.status(400).json({ error: "id inválido" }); return; }

  const { comprado } = req.body as { comprado?: boolean };
  const [updated] = await db.update(gastadorListasTable)
    .set({ comprado: comprado ?? true })
    .where(eq(gastadorListasTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Item não encontrado" }); return; }
  res.json(updated);
});

// DELETE /api/gastador/listas/:id
router.delete("/gastador/listas/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id ?? "0", 10);
  if (!id) { res.status(400).json({ error: "id inválido" }); return; }

  await db.delete(gastadorListasTable).where(eq(gastadorListasTable.id, id));
  res.json({ ok: true });
});

export default router;
