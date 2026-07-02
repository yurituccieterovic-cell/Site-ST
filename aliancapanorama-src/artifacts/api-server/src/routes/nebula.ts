import { Router } from "express";
import { db } from "@workspace/db";
import { nebulaIasTable, bibliotecaDocsTable, auliasTable } from "@workspace/db";
import { eq, desc, asc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function isAdmin(req: Parameters<Parameters<typeof router.get>[1]>[0]) {
  return (req.session.userTier ?? 0) >= 5;
}
function isLoggedIn(req: Parameters<Parameters<typeof router.get>[1]>[0]) {
  return !!req.session.userId;
}

/* ─── Nebula IAs ─────────────────────────────────────────────────────────── */

router.get("/nebula/ias", async (req, res) => {
  if (!isLoggedIn(req)) { res.status(401).json({ error: "Autenticação necessária" }); return; }
  const ias = await db.select().from(nebulaIasTable).orderBy(desc(nebulaIasTable.tier), asc(nebulaIasTable.name));
  res.json({ ias });
});

router.post("/nebula/ias", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const schema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    capabilities: z.array(z.string()).default([]),
    tier: z.number().int().min(0).max(5).default(0),
    status: z.string().default("ativa"),
    origem: z.string().default("manual"),
    principios: z.array(z.string()).default([]),
    parentIaId: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const [ia] = await db.insert(nebulaIasTable).values(parsed.data).returning();
  res.status(201).json(ia);
});

router.patch("/nebula/ias/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const schema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    capabilities: z.array(z.string()).optional(),
    tier: z.number().int().min(0).max(5).optional(),
    status: z.string().optional(),
    principios: z.array(z.string()).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  await db.update(nebulaIasTable).set(parsed.data).where(eq(nebulaIasTable.id, id));
  res.json({ ok: true });
});

router.delete("/nebula/ias/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  await db.delete(nebulaIasTable).where(eq(nebulaIasTable.id, id));
  res.json({ ok: true });
});

/* ─── Biblioteca ─────────────────────────────────────────────────────────── */

router.get("/nebula/biblioteca", async (req, res) => {
  if (!isLoggedIn(req)) { res.status(401).json({ error: "Autenticação necessária" }); return; }
  const docs = await db
    .select()
    .from(bibliotecaDocsTable)
    .where(eq(bibliotecaDocsTable.disponivel, true))
    .orderBy(desc(bibliotecaDocsTable.createdAt))
    .limit(100);
  res.json({ docs });
});

router.post("/nebula/biblioteca", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const schema = z.object({
    titulo: z.string().min(1).max(300),
    url: z.string().optional(),
    tipo: z.string().default("pdf"),
    origem: z.string().default("manual"),
    resumo: z.string().optional(),
    tags: z.array(z.string()).default([]),
    taskId: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const [doc] = await db.insert(bibliotecaDocsTable).values(parsed.data).returning();
  res.status(201).json(doc);
});

router.delete("/nebula/biblioteca/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  await db.update(bibliotecaDocsTable).set({ disponivel: false }).where(eq(bibliotecaDocsTable.id, id));
  res.json({ ok: true });
});

/* ─── Aulias ─────────────────────────────────────────────────────────────── */

router.get("/nebula/aulias", async (req, res) => {
  if (!isLoggedIn(req)) { res.status(401).json({ error: "Autenticação necessária" }); return; }
  const aulias = await db
    .select()
    .from(auliasTable)
    .where(eq(auliasTable.ativa, true))
    .orderBy(asc(auliasTable.ordem), desc(auliasTable.createdAt));
  res.json({ aulias });
});

router.post("/nebula/aulias", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const schema = z.object({
    titulo: z.string().min(1).max(200),
    descricao: z.string().optional(),
    docId: z.number().int().optional(),
    iaCourseId: z.number().int().optional(),
    publico: z.string().default("ias"),
    professoraIaId: z.number().int().optional(),
    conteudo: z.string().optional(),
    ordem: z.number().int().default(0),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const [aulia] = await db.insert(auliasTable).values(parsed.data).returning();
  res.status(201).json(aulia);
});

router.patch("/nebula/aulias/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const schema = z.object({
    titulo: z.string().optional(),
    descricao: z.string().optional(),
    conteudo: z.string().optional(),
    ativa: z.boolean().optional(),
    ordem: z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  await db.update(auliasTable).set(parsed.data).where(eq(auliasTable.id, id));
  res.json({ ok: true });
});

export default router;
