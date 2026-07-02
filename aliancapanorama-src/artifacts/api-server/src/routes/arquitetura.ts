import { Router } from "express";
import { db } from "@workspace/db";
import { nodesTable, usersTable, tasksTable, isaMemoryTable } from "@workspace/db";
import { sql, ilike, or } from "drizzle-orm";
import { requireApiKey } from "../lib/requireApiKey";

const router = Router();

// GET /api/arquitetura — snapshot do sistema para página /arquitetura
router.get("/arquitetura", async (req, res) => {
  const [nodeCount] = await db.select({ count: sql<number>`count(*)` }).from(nodesTable);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [taskCount] = await db.select({ count: sql<number>`count(*)` }).from(tasksTable);
  const [memCount] = await db.select({ count: sql<number>`count(*)` }).from(isaMemoryTable);

  res.json({
    stack: {
      frontend: "React + Vite + Tailwind → Vercel",
      backend: "Express 5 + Drizzle ORM → Railway",
      banco: "PostgreSQL → Railway",
      auth: "express-session + bcryptjs + PIN 2FA (adm)",
      ia: "OpenAI GPT-4o-mini (exercícios + ISA)",
    },
    tabelas: [
      "nodes", "notes", "progress", "users", "exercises",
      "social_posts", "ia_courses", "ia_enrollments", "ia_certificates",
      "tasks", "task_relations", "event_types", "catalogo_central", "isa_memory",
      "nebula_ias", "biblioteca_docs", "aulias",
    ],
    rotas: {
      auth: ["POST /auth/login", "POST /auth/logout", "GET /auth/me", "POST /auth/adm-pin"],
      nodes: ["GET /nodes", "GET /nodes/:code", "POST /nodes/open", "POST /nodes/read"],
      ai: ["GET /ai/exercises/:nodeCode", "POST /ai/attempt"],
      isa: ["GET /isa/identity", "POST /isa/chat", "GET /isa/memory.md", "POST /isa/cycle"],
      nebula: ["GET /nebula/ias", "GET /nebula/biblioteca", "GET /nebula/aulias"],
      admin: ["GET /admin/users", "POST /admin/users", "PATCH /admin/users/:id", "POST /admin/setup"],
    },
    jobs: [
      { nome: "ISA ciclo principal", cron: "0 * * * *", desc: "Lê memória + tasks → OpenAI → email" },
      { nome: "ISA Bibliotecário", cron: "30 * * * *", desc: "Baixa PDFs de assembleias → biblioteca_docs" },
    ],
    contagens: {
      nos: Number(nodeCount?.count ?? 0),
      usuarios: Number(userCount?.count ?? 0),
      tasks: Number(taskCount?.count ?? 0),
      memorias_isa: Number(memCount?.count ?? 0),
    },
    versao: "Sessão 11 — 2026-07-02",
  });
});

// GET /api/internal/stats — machine-to-machine (requer X-PAP-Key)
router.get("/internal/stats", requireApiKey, async (_req, res) => {
  const [nodeCount] = await db.select({ count: sql<number>`count(*)` }).from(nodesTable);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [taskCount] = await db.select({ count: sql<number>`count(*)` }).from(tasksTable);
  const [memCount] = await db.select({ count: sql<number>`count(*)` }).from(isaMemoryTable);
  res.json({
    nos: Number(nodeCount?.count ?? 0),
    usuarios: Number(userCount?.count ?? 0),
    tasks: Number(taskCount?.count ?? 0),
    memorias_isa: Number(memCount?.count ?? 0),
    ts: new Date().toISOString(),
  });
});

// GET /api/buscar?q=termo — busca semântica simples em nós + memória ISA
router.get("/buscar", async (req, res) => {
  if (!req.session.userId) { res.status(401).json({ error: "Autenticação necessária" }); return; }

  const q = String(req.query.q ?? "").trim().slice(0, 200);
  if (!q) { res.json({ nos: [], memorias: [] }); return; }

  const pattern = `%${q}%`;

  const nos = await db
    .select({ code: nodesTable.code, title: nodesTable.title, subtitle: nodesTable.subtitle })
    .from(nodesTable)
    .where(or(ilike(nodesTable.title, pattern), ilike(nodesTable.subtitle, pattern), ilike(nodesTable.content, pattern)))
    .limit(10);

  const memorias = await db
    .select({ id: isaMemoryTable.id, context: isaMemoryTable.context, content: isaMemoryTable.content, createdAt: isaMemoryTable.createdAt })
    .from(isaMemoryTable)
    .where(ilike(isaMemoryTable.content, pattern))
    .orderBy(sql`${isaMemoryTable.createdAt} DESC`)
    .limit(5);

  res.json({ nos, memorias, total: nos.length + memorias.length });
});

export default router;
