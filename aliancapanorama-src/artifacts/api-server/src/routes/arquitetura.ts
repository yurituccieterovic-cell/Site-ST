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
      backend:  "Express 5 + Drizzle ORM → Railway (LIVE)",
      arpia:    "FastAPI + SQLAlchemy async → Railway (pendente deploy)",
      banco:    "PostgreSQL → Railway (LIVE)",
      auth:     "express-session + bcryptjs + PIN 2FA (adm)",
      ia:       "OpenAI GPT-4o-mini (exercícios + ISA) + Gemini Flash (visão) + Anthropic Claude (ARPIA)",
    },
    agentes: {
      isa:     { status: "LIVE",    descricao: "Ciclo autônomo horário — memória, tasks, Bluesky, RODAR" },
      meky:    { status: "pendente", descricao: "Robô físico — 200 estados LED, firmware v0.6, hardware a chegar" },
      mc:      { status: "pronto",  descricao: "Leucócito Digital — vigilância, diapedese, fagocitose, quimiotaxia" },
      arvore:  { status: "pronto",  descricao: "Memória profunda Replit — aguarda REPLIT_TOKEN" },
      socoboy: { status: "pronto",  descricao: "Telegram bot — aguarda TELEGRAM_BOT_TOKEN" },
      amanda:  { status: "pronto",  descricao: "IA narrativa (mitomania em 3 camadas) — MEKY + Gemini" },
    },
    fractal: {
      camadas: 7,
      descricao: "Hierarquia Fractal Auto-Replicante — tríade Peirceana em cada camada",
      layer_1: "MANGA — Qualisigno/Sinsigno/Legisigno (substrato ontológico)",
      layer_2: "ARPIA Semiótica — interpretação de face_ids (1-200)",
      layer_3: "DAG Tasks — grafo acíclico com DFS anti-ciclo",
      layer_4: "Hardware MEKY — manifestação física",
      layer_5: "MC Imunológico — vigilância e preservação",
      layer_6: "Governança Árvore — distribuição igualitária 1/17",
      layer_7: "Ecossistema Oráculos — síntese coletiva",
    },
    tabelas: [
      "nodes", "notes", "progress", "users", "exercises",
      "social_posts", "ia_courses", "ia_enrollments", "ia_certificates",
      "tasks", "task_relations", "event_types", "catalogo_central", "isa_memory",
      "nebula_ias", "biblioteca_docs", "aulias",
      "assembly_agents", "assembly_messages", "assembly_memory", "assembly_tasks",
      "collective_memory", "meky_telemetry", "meky_events", "meky_control_queue",
      "meky_memory", "meky_dreams", "meky_art",
      "isa_timeline",
    ],
    tabelas_arpia: [
      "qualisignos", "sinsignos", "legisignos", "tasks", "task_relations",
      "conversations", "messages", "users", "clube_mensagens",
      "fauna_nodes", "arvore_node_weights",
    ],
    rotas_pap: {
      auth:       ["POST /auth/login", "POST /auth/logout", "GET /auth/me"],
      nodes:      ["GET /nodes", "GET /nodes/:code", "POST /nodes/open"],
      ai:         ["GET /ai/exercises/:nodeCode", "POST /ai/attempt"],
      isa:        ["GET /isa/identity", "POST /isa/chat", "GET /isa/memory.md", "POST /isa/cycle"],
      assembly:   ["GET /assembly/messages", "POST /assembly/message", "GET /assembly/agents"],
      collective: ["GET /collective", "POST /collective"],
      nebula:     ["GET /nebula/ias", "GET /nebula/biblioteca"],
      social:     ["GET /social/me", "PATCH /social/me", "GET /social/friends"],
    },
    rotas_arpia: {
      semiotics:  ["GET /api/semiotics/interpret/{id}", "GET /api/semiotics/spectrum"],
      tasks:      ["GET /api/tasks", "POST /api/tasks", "GET /api/view/"],
      hardware:   ["GET /api/hardware/stream (SSE)", "POST /api/hardware/power"],
      mc:         ["GET /api/mc/status", "POST /api/mc/walk", "POST /api/mc/alert"],
      governance: ["GET /api/governance/weights", "GET /api/governance/validate", "POST /api/governance/seed"],
      fractal:    ["GET /api/fractal", "GET /api/fractal/{layer}", "GET /api/fractal/summary"],
    },
    jobs: [
      { nome: "ISA ciclo principal",     cron: "0 * * * *",    desc: "Lê memória + tasks → OpenAI → email" },
      { nome: "ISA Bibliotecário",        cron: "30 * * * *",   desc: "Baixa PDFs assembleias → biblioteca_docs" },
      { nome: "ISA sonho noturno",        cron: "0 3 * * *",    desc: "Gemini prefill → dream consolidation" },
      { nome: "ISA Bluesky",             cron: "15 */2 * * *", desc: "Posta reflexões FUVEST (@isa-pap.bsky.social)" },
      { nome: "ISA engajamento Bluesky", cron: "45 */2 * * *", desc: "Responde menções, curte, segue" },
      { nome: "MC caminhada rápida",     cron: "0 * * * *",    desc: "Inspeciona nós críticos (ARPIA)" },
      { nome: "MC caminhada full",       cron: "0 0 * * *",    desc: "Percorre todos os 8 nós (ARPIA)" },
    ],
    contagens: {
      nos: Number(nodeCount?.count ?? 0),
      usuarios: Number(userCount?.count ?? 0),
      tasks: Number(taskCount?.count ?? 0),
      memorias_isa: Number(memCount?.count ?? 0),
    },
    versao: "Sessão 15 — 2026-07-04",
    governanca: {
      nos_ledger: 17,
      peso_igualitario: "1/17 ≈ 5.88% por nó",
      principio: "EPR²T — Privacidade, Respeito, Preservação, Transparência, Responsabilidade",
    },
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
