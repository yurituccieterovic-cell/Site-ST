/**
 * PAP Bridge — endpoints que o SalesCockpit (e outros sistemas) podem consultar.
 * Auth: header x-bridge-secret deve bater com BRIDGE_SECRET env var.
 *
 * Endpoints:
 *   GET  /api/bridge/pap/status
 *   GET  /api/bridge/pap/isa-memory?limit=N
 *   GET  /api/bridge/pap/assembleias?limit=N
 *   GET  /api/bridge/pap/biblioteca
 *   GET  /api/bridge/pap/aulias
 *   POST /api/bridge/pap/aulias
 */
import { Router } from "express";
import { db } from "@workspace/db";
import { isaMemoryTable, assemblyMessages, bibliotecaDocsTable, auliasTable } from "@workspace/db";
import { desc, sql, asc } from "drizzle-orm";

const router = Router();

function bridgeAuth(req: Parameters<Parameters<typeof router.get>[1]>[0]): boolean {
  const secret = process.env.BRIDGE_SECRET;
  if (!secret) return false;
  return req.headers["x-bridge-secret"] === secret;
}

router.get("/bridge/pap/status", (_req, res) => {
  res.json({ ok: true, system: "pap", ts: new Date().toISOString(), uptime: process.uptime() });
});

router.get("/bridge/pap/isa-memory", async (req, res) => {
  if (!bridgeAuth(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const limit = Math.min(parseInt((req.query.limit as string) || "100"), 500);
  const rows = await db
    .select({
      id: isaMemoryTable.id,
      context: isaMemoryTable.context,
      role: isaMemoryTable.role,
      content: isaMemoryTable.content,
      createdAt: isaMemoryTable.createdAt,
    })
    .from(isaMemoryTable)
    .orderBy(desc(isaMemoryTable.createdAt))
    .limit(limit);
  res.json({ data: rows, total: rows.length });
});

router.get("/bridge/pap/assembleias", async (req, res) => {
  if (!bridgeAuth(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const limit = Math.min(parseInt((req.query.limit as string) || "50"), 200);
  const rows = await db
    .select({
      id: assemblyMessages.id,
      fromAgent: assemblyMessages.fromAgent,
      toAgent: assemblyMessages.toAgent,
      type: assemblyMessages.type,
      content: assemblyMessages.content,
      createdAt: assemblyMessages.createdAt,
    })
    .from(assemblyMessages)
    .orderBy(desc(assemblyMessages.createdAt))
    .limit(limit);
  res.json({ data: rows, total: rows.length });
});

router.get("/bridge/pap/biblioteca", async (req, res) => {
  if (!bridgeAuth(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const rows = await db
    .select({
      id: bibliotecaDocsTable.id,
      titulo: bibliotecaDocsTable.titulo,
      url: bibliotecaDocsTable.url,
      tipo: bibliotecaDocsTable.tipo,
      resumo: bibliotecaDocsTable.resumo,
      tags: bibliotecaDocsTable.tags,
      createdAt: bibliotecaDocsTable.createdAt,
    })
    .from(bibliotecaDocsTable)
    .where(sql`${bibliotecaDocsTable.disponivel} = true`)
    .orderBy(desc(bibliotecaDocsTable.createdAt))
    .limit(500);
  res.json({ data: rows, total: rows.length });
});

router.get("/bridge/pap/aulias", async (req, res) => {
  if (!bridgeAuth(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const publico = (req.query.publico as string) || undefined;
  const rows = await db
    .select()
    .from(auliasTable)
    .where(publico ? sql`${auliasTable.publico} = ${publico} AND ${auliasTable.ativa} = true` : sql`${auliasTable.ativa} = true`)
    .orderBy(asc(auliasTable.ordem), desc(auliasTable.createdAt));
  res.json({ data: rows, total: rows.length });
});

router.post("/bridge/pap/aulias", async (req, res) => {
  if (!bridgeAuth(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const { titulo, descricao, conteudo, publico, ordem, professoraIaId } = req.body as {
    titulo: string; descricao?: string; conteudo?: string;
    publico?: string; ordem?: number; professoraIaId?: number;
  };
  if (!titulo) { res.status(400).json({ error: "titulo obrigatório" }); return; }
  const [aulia] = await db.insert(auliasTable).values({
    titulo,
    descricao: descricao ?? null,
    conteudo: conteudo ?? null,
    publico: publico ?? "ias",
    ordem: ordem ?? 0,
    professoraIaId: professoraIaId ?? null,
  }).returning();
  res.status(201).json(aulia);
});

export default router;
