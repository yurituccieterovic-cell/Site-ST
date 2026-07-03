import { Router } from "express";
import { db } from "../lib/db.js";
import { collectiveMemory, usersTable, nodesTable } from "@workspace/db/schema";
import { desc, eq, sql, and, gte } from "drizzle-orm";

export const collectiveRouter = Router();

// ── Auth helpers ──────────────────────────────────────────────────────────────

function getAuthor(req: any): { type: string; id: string; name: string; tier: number } | null {
  // Usuário humano logado
  if (req.session?.user) {
    const u = req.session.user;
    return { type: "human", id: String(u.id), name: u.displayName ?? u.login, tier: u.tier };
  }
  // MEKY via token
  if (req.headers["x-meky-token"] === process.env.MEKY_TOKEN) {
    return { type: "meky", id: "meky", name: "MEKY — Marta Centauros", tier: 5 };
  }
  // ISA via chave interna (mesmo AI_API_KEY)
  if (req.headers["x-api-key"] === process.env.AI_API_KEY) {
    return { type: "isa", id: "isa", name: "ISA — Inteligência do Sistema Aliança", tier: 5 };
  }
  return null;
}

// ── GET /api/collective — lê memória coletiva (paginada) ─────────────────────

collectiveRouter.get("/collective", async (req, res) => {
  const userTier = req.session?.user?.tier ?? 0;
  const limit  = Math.min(Number(req.query.limit) || 30, 100);
  const offset = Number(req.query.offset) || 0;
  const nodeCode = req.query.node as string | undefined;

  const conditions = [gte(collectiveMemory.minTier, 0), sql`min_tier <= ${userTier}`];
  if (nodeCode) conditions.push(eq(collectiveMemory.nodeCode, nodeCode));

  const entries = await db
    .select()
    .from(collectiveMemory)
    .where(and(...conditions))
    .orderBy(desc(collectiveMemory.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({ entries, limit, offset });
});

// ── POST /api/collective — qualquer agente posta uma memória ─────────────────

collectiveRouter.post("/collective", async (req, res) => {
  const author = getAuthor(req);
  if (!author) return res.status(401).json({ error: "unauthorized" });

  const { content, nodeCode, tags, minTier } = req.body;
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "content obrigatório" });
  }

  // Verificar se node_code existe na árvore (se fornecido)
  if (nodeCode) {
    const node = await db.select({ code: nodesTable.code })
      .from(nodesTable).where(eq(nodesTable.code, nodeCode)).limit(1);
    if (node.length === 0) {
      return res.status(400).json({ error: `nó '${nodeCode}' não existe na árvore` });
    }
  }

  const [entry] = await db.insert(collectiveMemory).values({
    authorType: author.type,
    authorId:   author.id,
    authorName: author.name,
    content:    content.trim(),
    nodeCode:   nodeCode ?? null,
    tags:       tags ?? null,
    minTier:    minTier ?? 0,
  }).returning({ id: collectiveMemory.id });

  res.json({ ok: true, id: entry.id });
});

// ── POST /api/collective/:id/react — reagir a uma memória ────────────────────

collectiveRouter.post("/collective/:id/react", async (req, res) => {
  const author = getAuthor(req);
  if (!author) return res.status(401).json({ error: "unauthorized" });

  await db.execute(
    sql`UPDATE collective_memory SET reactions = reactions + 1 WHERE id = ${req.params.id}`
  );
  res.json({ ok: true });
});

// ── GET /api/collective/node/:code — memória coletiva de um nó específico ────

collectiveRouter.get("/collective/node/:code", async (req, res) => {
  const userTier = req.session?.user?.tier ?? 0;

  // Validar que o nó existe
  const [node] = await db.select()
    .from(nodesTable).where(eq(nodesTable.code, req.params.code)).limit(1);
  if (!node) return res.status(404).json({ error: "nó não encontrado" });

  const entries = await db.select().from(collectiveMemory)
    .where(and(
      eq(collectiveMemory.nodeCode, req.params.code),
      sql`min_tier <= ${userTier}`
    ))
    .orderBy(desc(collectiveMemory.createdAt))
    .limit(50);

  res.json({ node: { code: node.code, title: node.title }, entries });
});

// ── GET /api/collective/stats — contagens por tipo de autor ──────────────────

collectiveRouter.get("/collective/stats", async (req, res) => {
  const rows = await db.execute(
    sql`SELECT author_type, COUNT(*) as count FROM collective_memory GROUP BY author_type`
  );
  res.json({ stats: rows.rows });
});
