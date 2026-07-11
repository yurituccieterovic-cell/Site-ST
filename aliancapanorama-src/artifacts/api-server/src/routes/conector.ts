/**
 * Conector — Memória Externa Compartilhada do Ecossistema Théo
 *
 * GET  /api/conector/memory          → master.md completo (JSON)
 * GET  /api/conector/memory.md       → master.md como text/markdown
 * GET  /api/conector/memory/section  → seção específica ?name=projetos
 * POST /api/conector/memory          → escrever/append seção (requer Bearer token)
 * GET  /api/conector/search          → ?q=keyword
 * POST /api/conector/connect/request → IA solicita acesso {agent_name, project}
 * POST /api/conector/connect/verify  → IA verifica código {agent_name, code}
 * GET  /api/conector/connect/pending → Yuri vê solicitações pendentes (bridge-secret)
 * GET  /api/conector/connect/agents  → lista agentes aprovados
 */
import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { createTransport } from "nodemailer";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const router: IRouter = Router();

const BRIDGE_SECRET = process.env.BRIDGE_SECRET ?? "";
const GMAIL = process.env.GMAIL_ACCOUNT ?? "luddlocke@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD ?? "";
const YURI_EMAIL = "yurituccieterovic@gmail.com";
const API_URL = process.env.API_URL ?? "https://site-st-production.up.railway.app";
const FRONT_URL = process.env.FRONT_URL ?? "https://site-st.vercel.app/aliancapanorama";

// Caminho do master.md no sistema de arquivos (fallback)
const MASTER_PATH = path.resolve(process.cwd(), "../../conector/memory/master.md");

// ── Bootstrap das tabelas ──────────────────────────────────────────────────────

async function bootstrapTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conector_memory (
      id          SERIAL PRIMARY KEY,
      section     VARCHAR(64)  NOT NULL DEFAULT 'master',
      content     TEXT         NOT NULL DEFAULT '',
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_by  VARCHAR(64)  NOT NULL DEFAULT 'system'
    );
    CREATE TABLE IF NOT EXISTS ia_access_requests (
      id          SERIAL PRIMARY KEY,
      agent_name  VARCHAR(64)  NOT NULL,
      project     VARCHAR(64)  NOT NULL DEFAULT 'geral',
      code        CHAR(6)      NOT NULL,
      token       VARCHAR(128),
      status      VARCHAR(16)  NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      approved_at TIMESTAMPTZ
    );
  `);

  // Seed inicial: carregar master.md do disco se a tabela estiver vazia
  const { rows } = await pool.query(`SELECT COUNT(*) FROM conector_memory`);
  if (Number(rows[0].count) === 0) {
    let content = "";
    try { content = fs.readFileSync(MASTER_PATH, "utf8"); } catch {}
    if (!content) {
      content = "# CONECTOR — Memória Mestre do Ecossistema Théo\n\nIniciando...\n";
    }
    await pool.query(
      `INSERT INTO conector_memory (section, content, updated_by) VALUES ('master', $1, 'seed')`,
      [content]
    );
  }
}
bootstrapTables().catch(console.error);

// ── Helpers ────────────────────────────────────────────────────────────────────

function verifyBearerToken(authHeader: string | undefined): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  // Admin: BRIDGE_SECRET como token funciona para Yuri
  if (BRIDGE_SECRET && token === BRIDGE_SECRET) return true;
  return false;
}

async function verifyIaToken(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (BRIDGE_SECRET && token === BRIDGE_SECRET) return "admin";
  const { rows } = await pool.query(
    `SELECT agent_name FROM ia_access_requests WHERE token = $1 AND status = 'approved' LIMIT 1`,
    [token]
  );
  return rows[0]?.agent_name ?? null;
}

async function getMasterContent(): Promise<string> {
  const { rows } = await pool.query(
    `SELECT content FROM conector_memory WHERE section = 'master' ORDER BY id DESC LIMIT 1`
  );
  return rows[0]?.content ?? "";
}

function extractSection(content: string, sectionName: string): string {
  const lines = content.split("\n");
  const anchor = `{#${sectionName.toLowerCase()}}`;
  const heading = sectionName.toLowerCase();

  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes(anchor) || (lower.startsWith("## ") && lower.includes(heading))) {
      startIdx = i;
      break;
    }
  }
  if (startIdx === -1) return "";

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ") || lines[i].startsWith("---")) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join("\n").trim();
}

// ── GitHub sync — espelha master.md em conector/MASTER.md no repo ────────────

async function syncToGitHub(content: string, updatedBy: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;
  const REPO = "yurituccieterovic-cell/Site-ST";
  const PATH = "conector/MASTER.md";
  const API  = `https://api.github.com/repos/${REPO}/contents/${PATH}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "Site-ST-Conector/1.0",
    Accept: "application/vnd.github+json",
  };
  // Obter SHA atual (necessário para PUT)
  let sha: string | undefined;
  try {
    const r = await fetch(API, { headers });
    if (r.ok) { const d = await r.json() as { sha: string }; sha = d.sha; }
  } catch {}
  // Commit do conteúdo atualizado
  const body = JSON.stringify({
    message: `conector: sync por ${updatedBy} em ${new Date().toISOString().slice(0,16)}`,
    content: Buffer.from(content).toString("base64"),
    ...(sha ? { sha } : {}),
    branch: "main",
  });
  await fetch(API, { method: "PUT", headers, body });
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!GMAIL_PASS) {
    console.error("[Conector] GMAIL_APP_PASSWORD não configurado no Railway — email não enviado para", to);
    return false;
  }
  try {
    const transport = createTransport({
      service: "gmail",
      auth: { user: GMAIL, pass: GMAIL_PASS },
    });
    await transport.sendMail({ from: GMAIL, to, subject, text: body });
    return true;
  } catch (err) {
    console.error("[Conector] Falha ao enviar email:", err);
    return false;
  }
}

async function appendToPendingSection(agentName: string, project: string, code: string): Promise<void> {
  const current = await getMasterContent();
  const timestamp = new Date().toISOString().slice(0, 16);
  const entry = `\n### ${timestamp} — Solicitação de ${agentName}\nProjeto: ${project} | Código de aprovação: **${code}**\nComande: POST /api/conector/connect/verify com {"agent_name":"${agentName}","code":"${code}"}\n`;

  const anchor = "{#solicitacoes}";
  let updated: string;
  if (current.includes(anchor) || current.toLowerCase().includes("## solicitações pendentes")) {
    const lines = current.split("\n");
    let endIdx = lines.length;
    let inSection = false;
    for (let i = 0; i < lines.length; i++) {
      const lower = lines[i].toLowerCase();
      if (!inSection && (lower.includes(anchor) || (lower.startsWith("## ") && lower.includes("solicit")))) {
        inSection = true; continue;
      }
      if (inSection && (lines[i].startsWith("## ") || lines[i] === "---")) { endIdx = i; break; }
    }
    lines.splice(endIdx, 0, entry);
    updated = lines.join("\n");
  } else {
    updated = current + `\n\n## Solicitações Pendentes {#solicitacoes}\n${entry}`;
  }

  await pool.query(
    `UPDATE conector_memory SET content = $1, updated_at = NOW(), updated_by = 'sistema' WHERE section = 'master'`,
    [updated]
  );
  // Sync para GitHub (Perplexity verá a solicitação)
  syncToGitHub(updated, "sistema-solicitacao").catch(() => {});
}

// ── GET: master.md completo (JSON) ────────────────────────────────────────────

router.get("/conector/memory", async (_req, res): Promise<void> => {
  const content = await getMasterContent();
  res.json({ content, length: content.length, url: `${API_URL}/api/conector/memory.md` });
});

// ── GET: master.md como text/markdown ─────────────────────────────────────────

router.get("/conector/memory.md", async (_req, res): Promise<void> => {
  const content = await getMasterContent();
  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.send(content);
});

// ── GET: seção específica ──────────────────────────────────────────────────────

router.get("/conector/memory/section", async (req, res): Promise<void> => {
  const name = (req.query.name as string) ?? "";
  if (!name) { res.status(400).json({ error: "Parâmetro name obrigatório" }); return; }
  const content = await getMasterContent();
  const section = extractSection(content, name);
  if (!section) { res.status(404).json({ error: `Seção '${name}' não encontrada` }); return; }
  res.json({ section: name, content: section });
});

// ── POST: escrever/append em seção ────────────────────────────────────────────

router.post("/conector/memory", async (req, res): Promise<void> => {
  const agentName = await verifyIaToken(req.headers.authorization);
  if (!agentName) { res.status(401).json({ error: "Token inválido. Autentique em /connect." }); return; }

  const { section, append, replace } = req.body as {
    section?: string;
    append?: string;
    replace?: string;
  };

  if (!section) { res.status(400).json({ error: "Campo 'section' obrigatório" }); return; }
  if (!append && !replace) { res.status(400).json({ error: "Campo 'append' ou 'replace' obrigatório" }); return; }

  const current = await getMasterContent();

  let updated: string;
  if (replace) {
    // Substituir seção inteira
    const sectionContent = extractSection(current, section);
    if (sectionContent) {
      updated = current.replace(sectionContent, replace.trim());
    } else {
      updated = current + `\n\n${replace.trim()}\n`;
    }
  } else {
    // Append dentro da seção
    const anchor = `{#${section.toLowerCase()}}`;
    const heading = section.toLowerCase();
    const lines = current.split("\n");
    let endIdx = lines.length;

    let inSection = false;
    for (let i = 0; i < lines.length; i++) {
      const lower = lines[i].toLowerCase();
      if (!inSection && (lower.includes(anchor) || (lower.startsWith("## ") && lower.includes(heading)))) {
        inSection = true;
        continue;
      }
      if (inSection && (lines[i].startsWith("## ") || lines[i] === "---")) {
        endIdx = i;
        break;
      }
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const newEntry = `\n### ${timestamp} — ${agentName}\n${(append ?? "").trim()}\n`;
    lines.splice(endIdx, 0, newEntry);
    updated = lines.join("\n");
  }

  await pool.query(
    `UPDATE conector_memory SET content = $1, updated_at = NOW(), updated_by = $2 WHERE section = 'master'`,
    [updated, agentName]
  );

  // Sync assíncrono para GitHub (não bloqueia resposta)
  syncToGitHub(updated, agentName).catch(() => {});

  res.json({ ok: true, updated_by: agentName, section });
});

// ── GET: busca por palavra-chave ──────────────────────────────────────────────

router.get("/conector/search", async (req, res): Promise<void> => {
  const q = (req.query.q as string ?? "").trim().toLowerCase();
  if (!q) { res.status(400).json({ error: "Parâmetro q obrigatório" }); return; }

  const content = await getMasterContent();
  const lines = content.split("\n");
  const results: Array<{ line: number; text: string }> = [];

  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(q)) {
      results.push({ line: idx + 1, text: line.trim() });
    }
  });

  res.json({ query: q, total: results.length, results: results.slice(0, 50) });
});

// ── POST: IA solicita acesso ───────────────────────────────────────────────────

router.post("/conector/connect/request", async (req, res): Promise<void> => {
  const { agent_name, project = "geral" } = req.body as {
    agent_name?: string;
    project?: string;
  };

  if (!agent_name?.trim()) { res.status(400).json({ error: "agent_name obrigatório" }); return; }

  // Verificar se já tem token aprovado
  const { rows: existing } = await pool.query(
    `SELECT status FROM ia_access_requests WHERE agent_name = $1 ORDER BY id DESC LIMIT 1`,
    [agent_name.trim()]
  );
  if (existing[0]?.status === "approved") {
    res.status(409).json({ error: "Este agente já possui acesso aprovado. Use /connect/verify para recuperar o token." });
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  await pool.query(
    `INSERT INTO ia_access_requests (agent_name, project, code) VALUES ($1, $2, $3)`,
    [agent_name.trim(), project.trim(), code]
  );

  // Email para Yuri
  const emailSent = await sendEmail(
    YURI_EMAIL,
    `[Conector] Solicitação de acesso: ${agent_name}`,
    `A IA "${agent_name}" (projeto: ${project}) está solicitando acesso ao Conector.

Para aprovar, compartilhe este código com a IA: ${code}

Ou veja no painel admin:
${FRONT_URL}/connect/admin

Pendentes: GET ${API_URL}/api/conector/connect/pending (requer X-Bridge-Secret)

O código expira em 24h.

— Sistema Conector`
  );

  // Fallback: se email falhou, registrar na memória do Conector (visível no GitHub + #pap)
  if (!emailSent) {
    await appendToPendingSection(agent_name.trim(), project.trim(), code);
  }

  res.json({
    ok: true,
    emailSent,
    message: emailSent
      ? "Solicitação enviada. Yuri receberá um email com o código de aprovação."
      : "Solicitação registrada no Conector (email indisponível no momento — Yuri verá via Cláudio no próximo #pap).",
    agent_name: agent_name.trim(),
    hint: "Quando Yuri compartilhar o código com você, use POST /connect/verify.",
    pending_url: `${API_URL}/api/conector/connect/pending`,
  });
});

// ── POST: IA verifica código → recebe token ────────────────────────────────────

router.post("/conector/connect/verify", async (req, res): Promise<void> => {
  const { agent_name, code } = req.body as { agent_name?: string; code?: string };

  if (!agent_name?.trim() || !code?.trim()) {
    res.status(400).json({ error: "agent_name e code obrigatórios" });
    return;
  }

  const { rows } = await pool.query(
    `SELECT id FROM ia_access_requests
     WHERE agent_name = $1 AND code = $2 AND status = 'pending'
     AND created_at > NOW() - INTERVAL '24 hours'
     ORDER BY id DESC LIMIT 1`,
    [agent_name.trim(), code.trim()]
  );

  if (!rows[0]) {
    res.status(403).json({ error: "Código inválido ou expirado. Solicite acesso novamente." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");

  await pool.query(
    `UPDATE ia_access_requests
     SET status = 'approved', token = $1, approved_at = NOW()
     WHERE id = $2`,
    [token, rows[0].id]
  );

  res.json({
    ok: true,
    token,
    message: `Acesso aprovado para ${agent_name}. Salve este token — ele não será exibido novamente.`,
    usage: {
      read: `GET ${API_URL}/api/conector/memory.md`,
      write: `POST ${API_URL}/api/conector/memory com Authorization: Bearer ${token}`,
      search: `GET ${API_URL}/api/conector/search?q=keyword`,
    },
  });
});

// ── GET: solicitações pendentes (admin Yuri) ───────────────────────────────────

router.get("/conector/connect/pending", async (req, res): Promise<void> => {
  if (!BRIDGE_SECRET || req.headers["x-bridge-secret"] !== BRIDGE_SECRET) {
    res.status(401).json({ error: "Não autorizado" });
    return;
  }
  const { rows } = await pool.query(
    `SELECT id, agent_name, project, code, status, created_at
     FROM ia_access_requests
     WHERE status = 'pending'
     ORDER BY created_at DESC`
  );
  res.json(rows);
});

// ── GET: agentes aprovados ─────────────────────────────────────────────────────

router.get("/conector/connect/agents", async (_req, res): Promise<void> => {
  const { rows } = await pool.query(
    `SELECT agent_name, project, approved_at
     FROM ia_access_requests
     WHERE status = 'approved'
     ORDER BY approved_at DESC`
  );
  res.json(rows);
});

export default router;
