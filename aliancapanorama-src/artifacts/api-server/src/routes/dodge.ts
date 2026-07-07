import { Router } from "express";
import { db, nodesTable } from "@workspace/db";
import { eq, inArray, sql } from "drizzle-orm";
import { invalidateNodeCache, getAllNodes } from "../lib/nodeCache";
import { z } from "zod";

const router = Router();

function isSuperAdm(req: Parameters<Parameters<typeof router.get>[1]>[0]) {
  return (req.session.userTier ?? 0) >= 9;
}
function isAdm(req: Parameters<Parameters<typeof router.get>[1]>[0]) {
  return (req.session.userTier ?? 0) >= 5;
}

// GET /api/dodge/tree — árvore completa de nódulos (adm)
router.get("/dodge/tree", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const { nodes } = await getAllNodes();
  res.json({ nodes: nodes.map(n => ({
    code: n.code, title: n.title, abbreviation: n.abbreviation ?? null,
    subtitle: n.subtitle ?? null, content: n.content ?? null,
    parentCode: n.parentCode ?? null, level: n.level, sortOrder: n.sortOrder,
  })) });
});

// POST /api/dodge/nodes — criar nódulo (superadm)
router.post("/dodge/nodes", async (req, res) => {
  if (!isSuperAdm(req)) { res.status(403).json({ error: "Acesso superadm obrigatório" }); return; }
  const schema = z.object({
    code: z.string().min(1).max(20),
    title: z.string().min(1).max(200),
    abbreviation: z.string().max(20).optional(),
    subtitle: z.string().max(300).optional(),
    content: z.string().optional(),
    parentCode: z.string().nullable().optional(),
    sortOrder: z.number().int().default(0),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { code, title, abbreviation, subtitle, content, parentCode, sortOrder } = parsed.data;

  // Calcular level automaticamente a partir do pai
  let level = 0;
  if (parentCode) {
    const parent = await db.select({ level: nodesTable.level })
      .from(nodesTable).where(eq(nodesTable.code, parentCode)).limit(1);
    if (parent[0]) level = parent[0].level + 1;
  }

  try {
    await db.insert(nodesTable).values({ code, title, abbreviation, subtitle, content, parentCode: parentCode ?? null, level, sortOrder });
    invalidateNodeCache();
    res.status(201).json({ code, level });
  } catch {
    res.status(409).json({ error: "Código já existe" });
  }
});

// PATCH /api/dodge/nodes/:code — editar nódulo (adm pode editar title/content, superadm tudo)
router.patch("/dodge/nodes/:code", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const superAdm = isSuperAdm(req);
  const { code } = req.params;

  const schema = z.object({
    title:        z.string().min(1).max(200).optional(),
    abbreviation: z.string().max(20).optional(),
    subtitle:     z.string().max(300).optional(),
    content:      z.string().optional(),
    sortOrder:    z.number().int().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const update: Partial<typeof parsed.data> = {};
  if (parsed.data.title !== undefined)        update.title = parsed.data.title;
  if (parsed.data.content !== undefined)      update.content = parsed.data.content;
  if (superAdm) {
    if (parsed.data.abbreviation !== undefined) update.abbreviation = parsed.data.abbreviation;
    if (parsed.data.subtitle !== undefined)     update.subtitle = parsed.data.subtitle;
    if (parsed.data.sortOrder !== undefined)    update.sortOrder = parsed.data.sortOrder;
  }

  if (Object.keys(update).length === 0) { res.status(400).json({ error: "Nada para atualizar" }); return; }

  await db.update(nodesTable).set(update).where(eq(nodesTable.code, code));
  invalidateNodeCache();
  res.json({ ok: true, code });
});

// DELETE /api/dodge/nodes/:code — apagar nódulo e toda a sub-árvore (superadm)
router.delete("/dodge/nodes/:code", async (req, res) => {
  if (!isSuperAdm(req)) { res.status(403).json({ error: "Acesso superadm obrigatório" }); return; }
  const { code } = req.params;
  const { nodes: all } = await getAllNodes();

  // BFS para coletar sub-árvore inteira
  const toDelete = new Set<string>([code]);
  const queue = [code];
  while (queue.length > 0) {
    const parent = queue.shift()!;
    for (const n of all) {
      if (n.parentCode === parent && !toDelete.has(n.code)) {
        toDelete.add(n.code);
        queue.push(n.code);
      }
    }
  }

  const codes = Array.from(toDelete);
  await db.delete(nodesTable).where(inArray(nodesTable.code, codes));
  invalidateNodeCache();
  res.json({ deleted: codes.length, codes });
});

// POST /api/dodge/nodes/:code/move — mover nódulo (com sub-árvore) para outro pai (superadm)
router.post("/dodge/nodes/:code/move", async (req, res) => {
  if (!isSuperAdm(req)) { res.status(403).json({ error: "Acesso superadm obrigatório" }); return; }
  const { code } = req.params;
  const schema = z.object({ newParentCode: z.string().nullable() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { newParentCode } = parsed.data;

  const { nodes: all, map: nodeMap } = await getAllNodes();

  // Calcular novo level base
  let newBaseLevel = 0;
  if (newParentCode) {
    const parent = nodeMap.get(newParentCode);
    if (!parent) { res.status(404).json({ error: "Novo pai não encontrado" }); return; }
    newBaseLevel = parent.level + 1;
  }

  const root = nodeMap.get(code);
  if (!root) { res.status(404).json({ error: "Nódulo não encontrado" }); return; }
  const oldBaseLevel = root.level;
  const levelDelta = newBaseLevel - oldBaseLevel;

  // Coletar sub-árvore
  const subtree = new Set<string>([code]);
  const queue = [code];
  while (queue.length > 0) {
    const parent = queue.shift()!;
    for (const n of all) {
      if (n.parentCode === parent && !subtree.has(n.code)) {
        subtree.add(n.code); queue.push(n.code);
      }
    }
  }

  // Atualizar parentCode do raiz e level de toda a sub-árvore
  await db.update(nodesTable)
    .set({ parentCode: newParentCode, level: newBaseLevel })
    .where(eq(nodesTable.code, code));

  if (levelDelta !== 0) {
    const children = Array.from(subtree).filter(c => c !== code);
    for (const child of children) {
      const node = nodeMap.get(child);
      if (node) {
        await db.update(nodesTable)
          .set({ level: node.level + levelDelta })
          .where(eq(nodesTable.code, child));
      }
    }
  }

  invalidateNodeCache();
  res.json({ moved: code, to: newParentCode, subtreeSize: subtree.size });
});

// GET /api/dodge/mds — lista arquivos .md disponíveis no sistema
router.get("/dodge/mds", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  // Lista de MDs conhecidos do sistema PAP
  const mds = [
    { name: "MAPA-MASTER.md",      desc: "Índice geral do sistema" },
    { name: "MAPA-PENDENCIAS.md",   desc: "Pendências ativas e concluídas" },
    { name: "MAPA-ARQUITETURA.md",  desc: "Arquitetura técnica" },
    { name: "MAPA-IAS.md",          desc: "IAs: ISA, Amanda, MC, MEKY, VESPER" },
    { name: "MAPA-INFRA.md",        desc: "Infraestrutura: Railway, Vercel, Oracle" },
    { name: "MAPA-PLATAFORMA.md",   desc: "Plataforma PAP: nódulos, exercícios" },
    { name: "MAPA-HISTORICO.md",    desc: "Histórico de sessões" },
    { name: "IDEIAS.md",            desc: "Ideias em aberto" },
    { name: "APRENDIZADO-INDICE.md",desc: "Índice de aprendizados (5200 linhas)" },
    { name: "PSEUDO-INDICE.md",     desc: "Índice pseudocódigo" },
    { name: "YURI-NAVEGACAO.md",    desc: "Mapa de projetos e vida de Yuri" },
    { name: "ISA.md",               desc: "Perfil ISA completo" },
    { name: "LIVRO-WORKFLOW.md",     desc: "Pipeline geração do livro PDF" },
    { name: "LIVRO-VISAO-WORKFLOW.md", desc: "Pipeline extração imagens/vídeos" },
    { name: "AUDITORIA-ECOSSYSTEMMA.md", desc: "Protocolo auditoria semestral" },
  ];
  res.json({ mds });
});

export default router;
