import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function requireColesterolAuth(req: any, res: any, next: any) {
  if (!req.session?.rapaduraNome) {
    res.status(401).json({ error: "Faça login no Rapadura primeiro" }); return;
  }
  next();
}

// GET /api/colesterol/items
router.get("/colesterol/items", requireColesterolAuth, async (req, res): Promise<void> => {
  const { status, categoria, carrinho } = req.query as Record<string, string | undefined>;

  // Monta query com filtros opcionais (usando sql tagged template para evitar injection)
  let result;
  if (status && categoria && carrinho) {
    result = await db.execute(sql`SELECT * FROM colesterol_items WHERE status = ${status} AND categoria = ${categoria} AND carrinho = ${carrinho} ORDER BY created_at DESC LIMIT 200`);
  } else if (status && categoria) {
    result = await db.execute(sql`SELECT * FROM colesterol_items WHERE status = ${status} AND categoria = ${categoria} ORDER BY created_at DESC LIMIT 200`);
  } else if (status && carrinho) {
    result = await db.execute(sql`SELECT * FROM colesterol_items WHERE status = ${status} AND carrinho = ${carrinho} ORDER BY created_at DESC LIMIT 200`);
  } else if (categoria && carrinho) {
    result = await db.execute(sql`SELECT * FROM colesterol_items WHERE status != 'cancelado' AND categoria = ${categoria} AND carrinho = ${carrinho} ORDER BY created_at DESC LIMIT 200`);
  } else if (status) {
    result = await db.execute(sql`SELECT * FROM colesterol_items WHERE status = ${status} ORDER BY created_at DESC LIMIT 200`);
  } else if (categoria) {
    result = await db.execute(sql`SELECT * FROM colesterol_items WHERE status != 'cancelado' AND categoria = ${categoria} ORDER BY created_at DESC LIMIT 200`);
  } else if (carrinho) {
    result = await db.execute(sql`SELECT * FROM colesterol_items WHERE status != 'cancelado' AND carrinho = ${carrinho} ORDER BY created_at DESC LIMIT 200`);
  } else {
    result = await db.execute(sql`SELECT * FROM colesterol_items WHERE status != 'cancelado' ORDER BY created_at DESC LIMIT 200`);
  }
  res.json({ items: (result as any).rows });
});

// GET /api/colesterol/meta — carrinhos e categorias únicos
router.get("/colesterol/meta", requireColesterolAuth, async (_req, res): Promise<void> => {
  const [carrinhos, cats] = await Promise.all([
    db.execute(sql`SELECT DISTINCT carrinho FROM colesterol_items WHERE status != 'cancelado' AND carrinho IS NOT NULL ORDER BY carrinho`),
    db.execute(sql`SELECT DISTINCT categoria FROM colesterol_items WHERE status != 'cancelado' ORDER BY categoria`),
  ]);
  res.json({
    carrinhos: ((carrinhos as any).rows as { carrinho: string }[]).map(r => r.carrinho).filter(Boolean),
    categorias: ((cats as any).rows as { categoria: string }[]).map(r => r.categoria).filter(Boolean),
  });
});

// POST /api/colesterol/items
router.post("/colesterol/items", requireColesterolAuth, async (req, res): Promise<void> => {
  const { nome, categoria = "geral", quantidade = "1", recorrente = false, carrinho = "geral", notas, preco_ref } =
    req.body as { nome?: string; categoria?: string; quantidade?: string; recorrente?: boolean; carrinho?: string; notas?: string; preco_ref?: number | null };
  if (!nome?.trim()) { res.status(400).json({ error: "nome obrigatório" }); return; }

  const criado_por = (req.session as any).rapaduraNome ?? "yuri";
  const result = await db.execute(sql`
    INSERT INTO colesterol_items (nome, categoria, quantidade, recorrente, carrinho, notas, criado_por, preco_ref)
    VALUES (${nome.trim()}, ${categoria}, ${quantidade}, ${Boolean(recorrente)}, ${carrinho}, ${notas ?? null}, ${criado_por}, ${preco_ref ?? null})
    RETURNING *
  `);
  res.status(201).json({ item: (result as any).rows[0] });
});

// PATCH /api/colesterol/items/:id — atualização parcial (status, campos individuais)
router.patch("/colesterol/items/:id", requireColesterolAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  if (!id) { res.status(400).json({ error: "id inválido" }); return; }

  const body = req.body as Record<string, unknown>;

  // Constrói SET dinâmico com apenas os campos enviados
  const allowed = ["nome", "categoria", "quantidade", "recorrente", "carrinho", "notas", "preco_ref", "status"];
  const updates: [string, unknown][] = [];
  for (const field of allowed) {
    if (field in body) updates.push([field, body[field]]);
  }
  if (!updates.length) { res.status(400).json({ error: "Nenhum campo para atualizar" }); return; }

  // Gera SQL dinamicamente via drizzle sql tag (safe against injection)
  const setParts = updates.map(([f, v]) => sql`${sql.identifier(f)} = ${v}`);
  const setClause = setParts.reduce((acc, part, i) =>
    i === 0 ? part : sql`${acc}, ${part}`, sql``);

  const markBought = body["status"] === "comprado";
  const clearBought = body["status"] !== undefined && body["status"] !== "comprado";

  let result;
  if (markBought) {
    result = await db.execute(sql`UPDATE colesterol_items SET ${setClause}, comprado_em = NOW(), updated_at = NOW() WHERE id = ${id} RETURNING *`);
  } else if (clearBought) {
    result = await db.execute(sql`UPDATE colesterol_items SET ${setClause}, comprado_em = NULL, updated_at = NOW() WHERE id = ${id} RETURNING *`);
  } else {
    result = await db.execute(sql`UPDATE colesterol_items SET ${setClause}, updated_at = NOW() WHERE id = ${id} RETURNING *`);
  }

  if (!(result as any).rows.length) { res.status(404).json({ error: "Item não encontrado" }); return; }
  res.json({ item: (result as any).rows[0] });
});

// DELETE /api/colesterol/items/:id — soft delete
router.delete("/colesterol/items/:id", requireColesterolAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.execute(sql`UPDATE colesterol_items SET status = 'cancelado', updated_at = NOW() WHERE id = ${id}`);
  res.json({ ok: true });
});

export { router as colesterolRouter };
