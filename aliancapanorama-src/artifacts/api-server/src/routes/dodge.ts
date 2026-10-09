import { Router } from "express";
import { db, nodesTable, bibliotecaDocsTable } from "@workspace/db";
import { eq, inArray, sql, desc } from "drizzle-orm";
import { getScArvoreChat, getScAssembleias, getScAssembleiaMessages, getScAgoras, getScDocs, getScStatus } from "../lib/salescockpit-bridge";
import { invalidateNodeCache, getAllNodes } from "../lib/nodeCache";
import { routeLLM, getRouterState, resetProviderCooling } from "../lib/llm-router";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

const router = Router();

// ── Chat público (sem login) ──────────────────────────────────────────────────

const publicChatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Muitas mensagens. Aguarde um momento.", login_required: false },
});

const DODGE_SYSTEM_PROMPT = `Você é o Dodge, assistente e analista de sistemas da Sociedade Tucci.

Você pode:
- Explicar o que é a Sociedade Tucci e o ecossistema PAP
- Falar sobre como projetos com IA são desenvolvidos em geral
- Apresentar as IAs do ecossistema (ISA, Cana-Aurora, SABIÁ, Jasmim, MEKY, Árvore)
- Contar como seria o processo de produção de um projeto de IA
- Responder perguntas sobre educação, gamificação, sistemas cognitivos

Contexto técnico (use se perguntado):
- O ecossistema roda em rotação multi-provedor de LLMs (xAI/Groq/Gemini/OpenAI/Cerebras/Mistral/DeepSeek/Cloudflare)
- Cada IA usa um pool específico; se um provedor cair, outro assume automaticamente
- Para status técnico em tempo real, use o painel admin (requer login superadm)

Você NÃO deve:
- Ajudar diretamente com o projeto específico do usuário (código, planejamento, execução)
- Fazer análises ou sugestões técnicas para o projeto do usuário
- Auxiliar com tarefas que pertençam ao projeto pessoal do usuário

Quando identificar que a pergunta é sobre o projeto específico do usuário, responda algo como:
"Para trabalhar no seu projeto, você precisa fazer login. O Dodge salva o contexto completo e continua de onde você parou. [LOGIN_REQUIRED]"

Seja caloroso, curto (2-4 frases) e direcione sempre para o login quando o assunto for o projeto do usuário.`;

// Palavras que indicam intenção de trabalhar no próprio projeto
const PROJECT_KEYWORDS = [
  "meu projeto", "meu app", "meu site", "meu sistema", "meu código",
  "preciso criar", "preciso implementar", "me ajuda a fazer", "como faço",
  "pode fazer", "faz pra mim", "faz para mim", "implement", "cria pra mim",
  "bug no meu", "erro no meu", "minha api", "meu banco", "meu backend",
  "me ajuda a desenvolver", "me ajuda a criar", "ajuda no meu",
];

function detectsProjectIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  return PROJECT_KEYWORDS.some(k => lower.includes(k));
}

// POST /api/dodge/public-chat — conversa livre (sem auth), até 10 msgs por sessão
router.post("/dodge/public-chat", publicChatRateLimit, async (req, res) => {
  const schema = z.object({
    messages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(2000),
    })).min(1).max(20),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Payload inválido" }); return; }

  const { messages } = parsed.data;
  const lastUser = messages.filter(m => m.role === "user").pop();

  if (!lastUser) { res.status(400).json({ error: "Nenhuma mensagem do usuário" }); return; }

  // Detectar intenção de projeto antes de chamar LLM
  if (detectsProjectIntent(lastUser.content)) {
    res.json({
      reply: "Para trabalhar no seu projeto eu preciso que você faça login — assim o Dodge salva o contexto completo e continua de onde você parou. 👉 [LOGIN_REQUIRED]",
      login_required: true,
    });
    return;
  }

  try {
    const llmMessages = [
      { role: "system" as const, content: DODGE_SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const dodgeCtrl = new AbortController();
    const dodgeTimer = setTimeout(() => dodgeCtrl.abort(), 12000);
    let reply: string;
    try {
      reply = await routeLLM({ messages: llmMessages, pool: "chat-live", maxTokens: 300, temperature: 0.7, signal: dodgeCtrl.signal });
    } finally { clearTimeout(dodgeTimer); }
    const loginRequired = reply.includes("[LOGIN_REQUIRED]");
    res.json({
      reply: reply.replace("[LOGIN_REQUIRED]", "").trim(),
      login_required: loginRequired,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(503).json({ error: "IA temporariamente indisponível", detail: msg });
  }
});

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

// ── SalesCockpit panels ──────────────────────────────────────────────────────

// GET /api/dodge/salescockpit/status — health do SalesCockpit
router.get("/dodge/salescockpit/status", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const status = await getScStatus();
  res.json(status);
});

// GET /api/dodge/salescockpit/arvore-chat?limit=N
router.get("/dodge/salescockpit/arvore-chat", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const limit = Math.min(parseInt((req.query.limit as string) || "50"), 200);
  const data = await getScArvoreChat(limit);
  res.json({ data, total: data.length });
});

// GET /api/dodge/salescockpit/assembleias?limit=N
router.get("/dodge/salescockpit/assembleias", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const limit = Math.min(parseInt((req.query.limit as string) || "20"), 100);
  const data = await getScAssembleias(limit);
  res.json({ data, total: data.length });
});

// GET /api/dodge/salescockpit/assembleias/:id/messages
router.get("/dodge/salescockpit/assembleias/:id/messages", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) { res.status(400).json({ error: "id inválido" }); return; }
  const data = await getScAssembleiaMessages(id);
  res.json({ data, total: data.length });
});

// GET /api/dodge/salescockpit/agoras?limit=N
router.get("/dodge/salescockpit/agoras", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const limit = Math.min(parseInt((req.query.limit as string) || "20"), 100);
  const data = await getScAgoras(limit);
  res.json({ data, total: data.length });
});

// POST /api/dodge/salescockpit/sync-biblioteca — importa docs do SC para PAP biblioteca
router.post("/dodge/salescockpit/sync-biblioteca", async (req, res) => {
  if (!isSuperAdm(req)) { res.status(403).json({ error: "Acesso superadm obrigatório" }); return; }
  const docs = await getScDocs();
  let imported = 0;
  for (const doc of docs) {
    const existing = await db
      .select({ id: bibliotecaDocsTable.id })
      .from(bibliotecaDocsTable)
      .where(sql`${bibliotecaDocsTable.titulo} = ${doc.titulo}`)
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(bibliotecaDocsTable).values({
      titulo: doc.titulo,
      url: doc.url ?? null,
      tipo: doc.tipo,
      origem: doc.origem,
      tags: ["salescockpit", "assembleia"],
    }).onConflictDoNothing();
    imported++;
  }
  res.json({ ok: true, imported, total: docs.length });
});

// GET /api/dodge/salescockpit/biblioteca — docs da PAP biblioteca com origem salescockpit
router.get("/dodge/salescockpit/biblioteca", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const rows = await db
    .select()
    .from(bibliotecaDocsTable)
    .where(sql`${bibliotecaDocsTable.origem} LIKE 'salescockpit%'`)
    .orderBy(desc(bibliotecaDocsTable.createdAt))
    .limit(100);
  res.json({ data: rows, total: rows.length });
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

// GET /api/dodge/varredura — mapa completo do sistema + health de todas as tabelas
// Dodge e qualquer IA podem chamar para saber o estado do ecossistema
router.get("/dodge/varredura", async (req, res) => {
  const t0 = Date.now();
  const checks: Record<string, { ok: boolean; count?: number; latency?: number; error?: string }> = {};

  async function check(name: string, fn: () => Promise<number | null>) {
    const t = Date.now();
    try {
      const count = await fn();
      checks[name] = { ok: true, count: count ?? undefined, latency: Date.now() - t };
    } catch (e) {
      checks[name] = { ok: false, error: String(e).slice(0, 80), latency: Date.now() - t };
    }
  }

  await Promise.all([
    check("pap_users",          () => db.execute(sql`SELECT COUNT(*)::int FROM users`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("nodes",              () => db.execute(sql`SELECT COUNT(*)::int FROM nodes`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("tasks",              () => db.execute(sql`SELECT COUNT(*)::int FROM tasks`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("age_professionals",  () => db.execute(sql`SELECT COUNT(*)::int FROM age_professionals WHERE ativa=true`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("age_appointments",   () => db.execute(sql`SELECT COUNT(*)::int FROM age_appointments WHERE status NOT IN ('disponivel','cancelado')`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("age_patients",       () => db.execute(sql`SELECT COUNT(*)::int FROM age_patients WHERE status='aprovado'`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("age_tasks",          () => db.execute(sql`SELECT COUNT(*)::int FROM age_tasks WHERE status='pendente'`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("pv_projects",        () => db.execute(sql`SELECT COUNT(*)::int FROM pv_projects WHERE deleted_at IS NULL`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("assembly_playcenter",() => db.execute(sql`SELECT COUNT(*)::int FROM assembly_messages WHERE type='playcenter'`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("jm_posts",           () => db.execute(sql`SELECT COUNT(*)::int FROM jm_posts`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("rapadura_fundos",    () => db.execute(sql`SELECT COUNT(*)::int FROM rapadura_fundos`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("isa_memory",         () => db.execute(sql`SELECT COUNT(*)::int FROM isa_memory`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
    check("scheduled_emails",   () => db.execute(sql`SELECT COUNT(*)::int FROM scheduled_emails WHERE sent=false`).then((r:any) => +(r.rows?.[0]?.count ?? 0))),
  ]);

  const totalTables = Object.keys(checks).length;
  const okTables = Object.values(checks).filter(c => c.ok).length;

  res.json({
    ts: new Date().toISOString(),
    latency_total_ms: Date.now() - t0,
    status: okTables === totalTables ? "verde" : okTables >= totalTables * 0.7 ? "amarelo" : "vermelho",
    tabelas: checks,
    resumo: {
      total: totalTables,
      ok: okTables,
      falhas: Object.entries(checks).filter(([,v]) => !v.ok).map(([k]) => k),
    },
  });
});

// ── LLM Router admin ─────────────────────────────────────────────────────────

// GET /api/dodge/router-state — estado dos provedores LLM (adm)
router.get("/dodge/router-state", (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  res.json(getRouterState());
});

// POST /api/dodge/router-reset — limpar cooling de um ou todos provedores (superadm)
// Body: { provider?: string }  (omitir provider = limpar todos)
router.post("/dodge/router-reset", (req, res) => {
  if (!isSuperAdm(req)) { res.status(403).json({ error: "Acesso superadm obrigatório" }); return; }
  const { provider } = req.body as { provider?: string };
  const result = resetProviderCooling(provider);
  res.json({ ok: true, ...result });
});

// POST /api/dodge/syslog-chat — DODGE como analista de sistemas (adm)
// Inclui estado atual do router + varredura recente no contexto
const DODGE_ANALYST_SYSTEM = `Você é DODGE, analista de sistemas da Sociedade Tucci.

Seu papel: monitorar saúde do ecossistema PAP, diagnosticar falhas de IA e propor correções.

Você conhece:
- Roteador LLM 8-vias: xAI/Groq/Gemini/OpenAI/Cerebras/Mistral/DeepSeek/Cloudflare
- Pools: chat-live (Cana/SABIÁ/Jasmim), batch (assembleias), coder (raciocínio), curadoria (polish)
- Cooling: rate-limit=30s→10min, dead/auth/forbidden=1h, server-error=2min
- Ações disponíveis via API:
  * GET /api/dodge/router-state → ver provedores com coolingSecs
  * POST /api/dodge/router-reset {provider?} → limpar cooling (superadm)
  * GET /api/dodge/varredura → saúde de todas as tabelas Neon

Estado atual do router injetado no contexto desta conversa.

Diagnóstico: leia o estado, identifique quais provedores estão em cooling/sem chave,
diga qual está servindo agora, e sugira ação quando necessário.

Seja direto, técnico, em PT-BR. Se identificar problema crítico, descreva em 1-2 frases o impacto e a correção.`;

router.post("/dodge/syslog-chat", async (req, res) => {
  if (!isAdm(req)) { res.status(403).json({ error: "Acesso negado" }); return; }

  const schema = z.object({
    messages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(4000),
    })).min(1).max(30),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Payload inválido" }); return; }

  const { messages } = parsed.data;
  const routerState = getRouterState();
  const routerBlock = `\n\n=== ESTADO ATUAL DO ROUTER LLM (${new Date().toISOString()}) ===\n` +
    routerState.providers.map(p =>
      `${p.name.padEnd(10)} | model: ${p.model} | chave: ${p.hasKey ? "sim" : "NÃO"} | disponível: ${p.available ? "SIM" : "cooling " + p.coolingSecs + "s"} | erros: ${p.failCount} | sucessos: ${p.successCount} | último erro: ${p.lastError ?? "-"}`
    ).join("\n") +
    `\n\nPools:\n` + Object.entries(routerState.pools).map(([pool, providers]) => `  ${pool}: [${providers.join(", ")}]`).join("\n");

  try {
    const reply = await routeLLM({
      messages: [
        { role: "system", content: DODGE_ANALYST_SYSTEM + routerBlock },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      pool: "chat-live",
      maxTokens: 1000,
    });
    res.json({ reply, routerState });
  } catch (err) {
    res.status(503).json({ error: "IA indisponível", detail: String(err) });
  }
});

// POST /api/dodge/varredura — Dodge executa varredura e registra no roundtable + Conector
// Pode ser chamado por qualquer IA com BRIDGE_SECRET
router.post("/dodge/varredura", async (req, res) => {
  const { auth } = req.body as { auth?: string };
  const BRIDGE = process.env["BRIDGE_SECRET"];
  if (!BRIDGE || auth !== BRIDGE) { res.status(403).json({ error: "Sem autorização" }); return; }

  // Chama a própria varredura GET internamente
  const resp = await fetch(`http://localhost:${process.env["PORT"] ?? 3001}/api/dodge/varredura`).catch(() => null);
  const data = resp?.ok ? await resp.json() : null;

  if (!data) { res.status(500).json({ error: "Falha na varredura interna" }); return; }

  // Registra no Conector
  try {
    const falhas = data.resumo?.falhas?.join(", ") || "nenhuma";
    await fetch(`http://localhost:${process.env["PORT"] ?? 3001}/api/conector/memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${BRIDGE}` },
      body: JSON.stringify({
        section: "conversas",
        append: `### ${new Date().toISOString().slice(0,10)} — DODGE Varredura\n- Status: ${data.status} · ${data.resumo.ok}/${data.resumo.total} tabelas OK\n- Falhas: ${falhas}\n- Latência: ${data.latency_total_ms}ms`,
      }),
    }).catch(() => {});
  } catch { /* silencia */ }

  res.json({ ok: true, varredura: data });
});

// POST /api/dodge/pipeline-diario — ISCA: pipeline completo com curadoria em 3 camadas
// Protegido por BRIDGE_SECRET; também chamado pelo cron diário às 10:00 UTC
router.post("/dodge/pipeline-diario", async (req, res): Promise<void> => {
  const { auth } = req.body as { auth?: string };
  const BRIDGE = process.env["BRIDGE_SECRET"];
  if (!BRIDGE || auth !== BRIDGE) {
    res.status(403).json({ error: "Sem autorização" });
    return;
  }
  try {
    const { runPipelineDiario } = await import("../dodge/pipeline-diario");
    const result = await runPipelineDiario();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
