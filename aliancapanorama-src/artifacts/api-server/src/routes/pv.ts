import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function now() { return new Date(); }

// ─── Projects ─────────────────────────────────────────────────────────────────

// GET /pv/projects — lista todos (não deletados)
router.get("/projects", async (_req, res) => {
  const rows = await db.execute(sql`
    SELECT p.*, COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL) AS item_count
    FROM pv_projects p
    LEFT JOIN pv_items i ON i.project_id = p.id
    WHERE p.deleted_at IS NULL
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `);
  res.json(rows.rows);
});

// GET /pv/projects/:id — detalhe + itens top-level
router.get("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const [proj] = (await db.execute(sql`
    SELECT * FROM pv_projects WHERE id = ${id} AND deleted_at IS NULL
  `)).rows;
  if (!proj) { res.status(404).json({ error: "Projeto não encontrado" }); return; }

  const items = (await db.execute(sql`
    SELECT * FROM pv_items
    WHERE project_id = ${id} AND deleted_at IS NULL
    ORDER BY depth_level, priority DESC, created_at ASC
  `)).rows;

  res.json({ ...proj, items });
});

// POST /pv/projects — criar projeto
router.post("/projects", async (req, res) => {
  const { title, description, domain = "producao_cultural", status = "active", source_ref, confidence = 80 } = req.body as Record<string, string | number>;
  if (!title) { res.status(400).json({ error: "title é obrigatório" }); return; }

  const [row] = (await db.execute(sql`
    INSERT INTO pv_projects (title, description, domain, status, source_ref, confidence)
    VALUES (${title}, ${description ?? null}, ${domain}, ${status}, ${source_ref ?? null}, ${confidence})
    RETURNING *
  `)).rows;
  res.status(201).json(row);
});

// PATCH /pv/projects/:id — atualizar campos
router.patch("/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, domain, status, source_ref, confidence } = req.body as Record<string, string | number>;

  const [existing] = (await db.execute(sql`
    SELECT id FROM pv_projects WHERE id = ${id} AND deleted_at IS NULL
  `)).rows;
  if (!existing) { res.status(404).json({ error: "Projeto não encontrado" }); return; }

  const [row] = (await db.execute(sql`
    UPDATE pv_projects SET
      title       = COALESCE(${title ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      domain      = COALESCE(${domain ?? null}, domain),
      status      = COALESCE(${status ?? null}, status),
      source_ref  = COALESCE(${source_ref ?? null}, source_ref),
      confidence  = COALESCE(${confidence ?? null}::integer, confidence),
      updated_at  = now()
    WHERE id = ${id}
    RETURNING *
  `)).rows;
  res.json(row);
});

// DELETE /pv/projects/:id — soft delete
router.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;
  await db.execute(sql`
    UPDATE pv_projects SET deleted_at = now() WHERE id = ${id} AND deleted_at IS NULL
  `);
  res.json({ ok: true });
});

// ─── Items ────────────────────────────────────────────────────────────────────

// GET /pv/projects/:projectId/items — todos os itens do projeto
router.get("/projects/:projectId/items", async (req, res) => {
  const { projectId } = req.params;
  const { status, type } = req.query as Record<string, string>;

  const rows = (await db.execute(sql`
    SELECT * FROM pv_items
    WHERE project_id = ${projectId}
      AND deleted_at IS NULL
      AND (${status ?? null} IS NULL OR status = ${status ?? ""})
      AND (${type ?? null} IS NULL OR type = ${type ?? ""})
    ORDER BY depth_level, priority DESC, created_at ASC
  `)).rows;
  res.json(rows);
});

// GET /pv/items/:id — detalhe de item + relações + eventos recentes
router.get("/items/:id", async (req, res) => {
  const { id } = req.params;
  const [item] = (await db.execute(sql`
    SELECT * FROM pv_items WHERE id = ${id} AND deleted_at IS NULL
  `)).rows;
  if (!item) { res.status(404).json({ error: "Item não encontrado" }); return; }

  const relations = (await db.execute(sql`
    SELECT r.*, i.title AS related_title, i.type AS related_type
    FROM pv_item_relations r
    JOIN pv_items i ON i.id = r.related_item_id
    WHERE r.item_id = ${id}
  `)).rows;

  const events = (await db.execute(sql`
    SELECT * FROM pv_item_events WHERE item_id = ${id} ORDER BY created_at DESC LIMIT 20
  `)).rows;

  res.json({ ...item, relations, events });
});

// POST /pv/projects/:projectId/items — criar item
router.post("/projects/:projectId/items", async (req, res) => {
  const { projectId } = req.params;
  const {
    type = "task", title, description,
    parent_id = null, status = "pending", priority = 5,
    starts_at = null, ends_at = null, due_at = null,
    payload = {}, source_ref = null, confidence = 80,
  } = req.body as Record<string, unknown>;

  if (!title) { res.status(400).json({ error: "title é obrigatório" }); return; }

  // Calcular depth_level a partir do parent
  let depthLevel = 0;
  if (parent_id) {
    const [parent] = (await db.execute(sql`
      SELECT depth_level FROM pv_items WHERE id = ${parent_id as string}
    `)).rows;
    if (parent) depthLevel = (parent.depth_level as number) + 1;
  }

  const [row] = (await db.execute(sql`
    INSERT INTO pv_items
      (project_id, type, title, description, parent_id, depth_level, status, priority,
       starts_at, ends_at, due_at, payload, source_ref, confidence)
    VALUES (
      ${projectId}, ${type}, ${title}, ${description ?? null},
      ${parent_id}, ${depthLevel}, ${status}, ${priority as number},
      ${starts_at}, ${ends_at}, ${due_at},
      ${JSON.stringify(payload)}::jsonb, ${source_ref}, ${confidence as number}
    )
    RETURNING *
  `)).rows;

  // Registrar evento de criação
  await db.execute(sql`
    INSERT INTO pv_item_events (item_id, project_id, action, new_value, changed_by_agent)
    VALUES (${(row as Record<string, unknown>).id}, ${projectId}, 'created', ${JSON.stringify({ title, type })}::jsonb, 'claudio')
  `);

  // Atualizar updated_at do projeto
  await db.execute(sql`UPDATE pv_projects SET updated_at = now() WHERE id = ${projectId}`);

  res.status(201).json(row);
});

// PATCH /pv/items/:id — atualizar item
router.patch("/items/:id", async (req, res) => {
  const { id } = req.params;
  const body = req.body as Record<string, unknown>;

  const [existing] = (await db.execute(sql`
    SELECT * FROM pv_items WHERE id = ${id} AND deleted_at IS NULL
  `)).rows;
  if (!existing) { res.status(404).json({ error: "Item não encontrado" }); return; }

  const { title, description, type, status, priority, starts_at, ends_at, due_at, payload, source_ref, confidence, changed_by_agent = "claudio" } = body;

  const [row] = (await db.execute(sql`
    UPDATE pv_items SET
      title       = COALESCE(${title ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      type        = COALESCE(${type ?? null}, type),
      status      = COALESCE(${status ?? null}, status),
      priority    = COALESCE(${priority ?? null}::integer, priority),
      starts_at   = COALESCE(${starts_at ?? null}::timestamptz, starts_at),
      ends_at     = COALESCE(${ends_at ?? null}::timestamptz, ends_at),
      due_at      = COALESCE(${due_at ?? null}::timestamptz, due_at),
      payload     = COALESCE(${payload != null ? JSON.stringify(payload) : null}::jsonb, payload),
      source_ref  = COALESCE(${source_ref ?? null}, source_ref),
      confidence  = COALESCE(${confidence ?? null}::integer, confidence),
      updated_at  = now()
    WHERE id = ${id}
    RETURNING *
  `)).rows;

  // Registrar evento de update
  await db.execute(sql`
    INSERT INTO pv_item_events (item_id, project_id, action, new_value, changed_by_agent)
    VALUES (${id}, ${(existing as Record<string, unknown>).project_id}, 'updated', ${JSON.stringify(body)}::jsonb, ${changed_by_agent})
  `);

  res.json(row);
});

// DELETE /pv/items/:id — soft delete
router.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  await db.execute(sql`
    UPDATE pv_items SET deleted_at = now() WHERE id = ${id} AND deleted_at IS NULL
  `);
  res.json({ ok: true });
});

// ─── Relations ────────────────────────────────────────────────────────────────

// POST /pv/items/:id/relations — criar relação
router.post("/items/:id/relations", async (req, res) => {
  const { id } = req.params;
  const { related_item_id, relation_type = "related" } = req.body as Record<string, string>;
  if (!related_item_id) { res.status(400).json({ error: "related_item_id é obrigatório" }); return; }

  const [row] = (await db.execute(sql`
    INSERT INTO pv_item_relations (item_id, related_item_id, relation_type)
    VALUES (${id}, ${related_item_id}, ${relation_type})
    ON CONFLICT DO NOTHING
    RETURNING *
  `)).rows;
  res.status(201).json(row ?? { ok: true });
});

// DELETE /pv/relations/:id — remover relação
router.delete("/relations/:id", async (req, res) => {
  const { id } = req.params;
  await db.execute(sql`DELETE FROM pv_item_relations WHERE id = ${id}`);
  res.json({ ok: true });
});

// ─── Events ───────────────────────────────────────────────────────────────────

// GET /pv/projects/:projectId/events — histórico do projeto (últimos 100)
router.get("/projects/:projectId/events", async (req, res) => {
  const { projectId } = req.params;
  const rows = (await db.execute(sql`
    SELECT e.*, i.title AS item_title
    FROM pv_item_events e
    JOIN pv_items i ON i.id = e.item_id
    WHERE e.project_id = ${projectId}
    ORDER BY e.created_at DESC
    LIMIT 100
  `)).rows;
  res.json(rows);
});

// ─── Stats ────────────────────────────────────────────────────────────────────

// GET /pv/stats — resumo geral (para dashboard)
router.get("/stats", async (_req, res) => {
  const [row] = (await db.execute(sql`
    SELECT
      COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL)                         AS total_projects,
      COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL)                                   AS total_items,
      COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL AND i.status = 'completed')        AS completed_items,
      COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL AND i.status = 'in_progress')      AS in_progress_items,
      COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL AND i.status = 'blocked')          AS blocked_items
    FROM pv_projects p
    LEFT JOIN pv_items i ON i.project_id = p.id
  `)).rows;
  res.json(row);
});

export default router;
