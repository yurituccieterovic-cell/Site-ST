import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

type CrowdRow = { id: number; username: string; password_hash: string; email: string | null; display_name: string | null; role: string };

// POST /api/crowd/login
router.post("/crowd/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) { res.status(400).json({ error: "Credenciais obrigatórias" }); return; }

  const rows = await db.execute(sql`SELECT * FROM crowd_users WHERE username = ${username.toLowerCase()} LIMIT 1`);
  const user = rows.rows[0] as CrowdRow | undefined;
  if (!user) { res.status(401).json({ error: "Usuário ou senha inválidos" }); return; }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) { res.status(401).json({ error: "Usuário ou senha inválidos" }); return; }

  req.session.crowdUserId = user.id;
  req.session.crowdUserName = user.username;
  req.session.crowdDisplayName = user.display_name ?? user.username;
  req.session.save(() => {
    res.json({ ok: true, displayName: user.display_name ?? user.username, email: user.email, role: user.role });
  });
});

// POST /api/crowd/logout
router.post("/crowd/logout", (req, res) => {
  req.session.crowdUserId = undefined;
  req.session.crowdUserName = undefined;
  req.session.crowdDisplayName = undefined;
  req.session.save(() => res.json({ ok: true }));
});

// GET /api/crowd/me
router.get("/crowd/me", async (req, res) => {
  if (!req.session.crowdUserId) { res.status(401).json({ error: "Não autenticado" }); return; }
  const rows = await db.execute(sql`SELECT id, username, email, display_name, role FROM crowd_users WHERE id = ${req.session.crowdUserId} LIMIT 1`);
  const user = rows.rows[0] as Omit<CrowdRow, "password_hash"> | undefined;
  if (!user) { res.status(404).json({ error: "Usuário não encontrado" }); return; }
  res.json({ id: user.id, username: user.username, email: user.email, displayName: user.display_name, role: user.role });
});

// POST /api/crowd/change-password
router.post("/crowd/change-password", async (req, res) => {
  if (!req.session.crowdUserId) { res.status(401).json({ error: "Não autenticado" }); return; }
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) { res.status(400).json({ error: "Senhas obrigatórias" }); return; }
  if (newPassword.length < 6) { res.status(400).json({ error: "Nova senha precisa ter ao menos 6 caracteres" }); return; }

  const rows = await db.execute(sql`SELECT password_hash FROM crowd_users WHERE id = ${req.session.crowdUserId} LIMIT 1`);
  const user = rows.rows[0] as { password_hash: string } | undefined;
  if (!user) { res.status(404).json({ error: "Usuário não encontrado" }); return; }

  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) { res.status(401).json({ error: "Senha atual incorreta" }); return; }

  const newHash = await bcrypt.hash(newPassword, 10);
  await db.execute(sql`UPDATE crowd_users SET password_hash = ${newHash}, updated_at = NOW() WHERE id = ${req.session.crowdUserId}`);
  res.json({ ok: true });
});

// POST /api/crowd/update-email
router.post("/crowd/update-email", async (req, res) => {
  if (!req.session.crowdUserId) { res.status(401).json({ error: "Não autenticado" }); return; }
  const { email } = req.body as { email?: string };
  if (!email || !email.includes("@")) { res.status(400).json({ error: "Email inválido" }); return; }

  await db.execute(sql`UPDATE crowd_users SET email = ${email}, updated_at = NOW() WHERE id = ${req.session.crowdUserId}`);
  res.json({ ok: true, email });
});

// GET /api/crowd/reports — relatório público do sistema (requer auth crowd)
router.get("/crowd/reports", async (req, res) => {
  if (!req.session.crowdUserId) { res.status(401).json({ error: "Não autenticado" }); return; }

  const reports: Record<string, unknown> = {};

  // Playcenter — última mensagem
  try {
    const pc = await db.execute(sql`
      SELECT from_agent, content, created_at FROM assembly_messages
      WHERE assembly_name = 'playcenter' ORDER BY created_at DESC LIMIT 1
    `);
    const last = pc.rows[0] as { from_agent: string; content: string; created_at: string } | undefined;
    const count = await db.execute(sql`SELECT COUNT(*)::int as n FROM assembly_messages WHERE assembly_name = 'playcenter'`);
    reports.playcenter = {
      status: last ? "ativo" : "vazio",
      totalMsgs: (count.rows[0] as { n: number }).n,
      ultimaMensagem: last ? { agente: last.from_agent, preview: last.content.slice(0, 80), em: last.created_at } : null,
    };
  } catch {
    reports.playcenter = { status: "erro" };
  }

  // Leucócito — último relatório
  try {
    const leu = await db.execute(sql`
      SELECT run_at, passed, failed, summary FROM leucocito_reports ORDER BY run_at DESC LIMIT 1
    `);
    const last = leu.rows[0] as { run_at: string; passed: number; failed: number; summary: string } | undefined;
    reports.leucocito = last
      ? { run_at: last.run_at, passed: last.passed, failed: last.failed, summary: last.summary, status: last.failed === 0 ? "ok" : "atencao" }
      : { status: "nunca_executado" };
  } catch {
    reports.leucocito = { status: "erro" };
  }

  // IAs ativas — contagem de agentes com mensagem nas últimas 48h
  try {
    const ativas = await db.execute(sql`
      SELECT COUNT(DISTINCT from_agent)::int as n FROM assembly_messages
      WHERE assembly_name = 'playcenter' AND created_at > NOW() - INTERVAL '48 hours'
    `);
    reports.ias_ativas_48h = (ativas.rows[0] as { n: number }).n;
  } catch {
    reports.ias_ativas_48h = 0;
  }

  reports.api = { status: "online", timestamp: new Date().toISOString() };
  res.json(reports);
});

export default router;
