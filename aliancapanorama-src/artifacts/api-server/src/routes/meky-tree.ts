// Acesso de MEKY e ISA à Árvore de Conhecimento
// MEKY pode explorar nós (observação física → nó relevante)
// ISA pode ler e anotar nós (síntese cognitiva → insight no nó)
// Ambos postam na memória coletiva automaticamente

import { Router } from "express";
import { db } from "@workspace/db";
import {
  nodesTable, nodeProgressTable, collectiveMemory, usersTable
} from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

export const mekyTreeRouter = Router();

// Auth: MEKY por token, ISA por X-Api-Key
function resolveAgent(req: any): { userId: number | null; name: string; type: string } | null {
  if (req.headers["x-meky-token"] === process.env.MEKY_TOKEN) {
    return { userId: null, name: "MEKY — Marta Centauros", type: "meky" };
  }
  if (req.headers["x-api-key"] === process.env.AI_API_KEY) {
    return { userId: null, name: "ISA — Inteligência do Sistema Aliança", type: "isa" };
  }
  return null;
}

async function getAgentUserId(login: string): Promise<number | null> {
  const [user] = await db.select({ id: usersTable.id })
    .from(usersTable).where(eq(usersTable.login, login)).limit(1);
  return user?.id ?? null;
}

// POST /api/meky/tree/explore
// MEKY observou algo no mundo físico relacionado a um nó
// Body: { nodeCode, observation, tags? }
mekyTreeRouter.post("/tree/explore", async (req, res) => {
  const agent = resolveAgent(req);
  if (!agent) return res.status(401).json({ error: "unauthorized" });

  const { nodeCode, observation, tags } = req.body;
  if (!nodeCode || !observation) {
    return res.status(400).json({ error: "nodeCode e observation obrigatórios" });
  }

  // Verificar nó existe
  const [node] = await db.select({ code: nodesTable.code, title: nodesTable.title })
    .from(nodesTable).where(eq(nodesTable.code, nodeCode)).limit(1);
  if (!node) return res.status(404).json({ error: `nó '${nodeCode}' não existe` });

  // Obter ID do agente na tabela users
  const userId = await getAgentUserId(agent.type === "meky" ? "meky" : "isa");
  if (userId) {
    // Marcar nó como explorado e lido pelo agente
    await db.execute(sql`
      INSERT INTO node_progress (user_id, node_code, opened, read, opened_at, read_at)
      VALUES (${userId}, ${nodeCode}, true, true, NOW(), NOW())
      ON CONFLICT (user_id, node_code) DO NOTHING
    `);
  }

  // Postar observação na memória coletiva
  const [entry] = await db.insert(collectiveMemory).values({
    authorType: agent.type,
    authorId:   agent.type,
    authorName: agent.name,
    content:    observation,
    nodeCode:   nodeCode,
    tags:       tags ?? [agent.type, "árvore"],
    minTier:    0,
  }).returning({ id: collectiveMemory.id });

  res.json({
    ok: true,
    node: { code: node.code, title: node.title },
    collectiveEntryId: entry.id,
    message: `${agent.name} explorou o nó '${node.title}' e postou na memória coletiva`,
  });
});

// POST /api/meky/tree/insight
// ISA ou MEKY registram um insight sobre um nó (sem marcar como explorado)
// Body: { nodeCode, insight, minTier? }
mekyTreeRouter.post("/tree/insight", async (req, res) => {
  const agent = resolveAgent(req);
  if (!agent) return res.status(401).json({ error: "unauthorized" });

  const { nodeCode, insight, minTier } = req.body;
  if (!insight) return res.status(400).json({ error: "insight obrigatório" });

  if (nodeCode) {
    const [node] = await db.select({ code: nodesTable.code })
      .from(nodesTable).where(eq(nodesTable.code, nodeCode)).limit(1);
    if (!node) return res.status(404).json({ error: `nó '${nodeCode}' não existe` });
  }

  const [entry] = await db.insert(collectiveMemory).values({
    authorType: agent.type,
    authorId:   agent.type,
    authorName: agent.name,
    content:    insight,
    nodeCode:   nodeCode ?? null,
    tags:       ["insight", agent.type],
    minTier:    minTier ?? 0,
  }).returning({ id: collectiveMemory.id });

  res.json({ ok: true, collectiveEntryId: entry.id });
});

// GET /api/meky/tree/nodes — MEKY/ISA listam nós da árvore para navegar
mekyTreeRouter.get("/tree/nodes", async (req, res) => {
  const agent = resolveAgent(req);
  if (!agent) return res.status(401).json({ error: "unauthorized" });

  const parentCode = req.query.parent as string | undefined;
  const nodes = parentCode
    ? await db.select().from(nodesTable).where(eq(nodesTable.parentCode, parentCode))
    : await db.select().from(nodesTable).where(sql`parent_code IS NULL`);

  res.json({ nodes });
});
