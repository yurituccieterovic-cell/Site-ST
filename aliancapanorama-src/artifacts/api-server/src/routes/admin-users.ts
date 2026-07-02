import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const router = Router();

function isAdmin(req: Parameters<Parameters<typeof router.get>[1]>[0]) {
  return (req.session.userTier ?? 0) >= 5;
}

// GET /api/admin/users — lista todos os usuários
router.get("/admin/users", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const users = await db
    .select({
      id: usersTable.id,
      login: usersTable.login,
      tier: usersTable.tier,
      displayName: usersTable.displayName,
      userCode: usersTable.userCode,
      subscriptionStatus: usersTable.subscriptionStatus,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  res.json({ users });
});

// POST /api/admin/users — cria novo usuário
router.post("/admin/users", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const schema = z.object({
    login: z.string().min(2).max(50),
    password: z.string().min(4).max(100),
    tier: z.number().int().min(0).max(5).default(1),
    displayName: z.string().max(100).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const { login, password, tier, displayName } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const [user] = await db.insert(usersTable).values({ login, passwordHash, tier, displayName }).returning();
    res.status(201).json({ id: user?.id, login: user?.login, tier: user?.tier });
  } catch {
    res.status(409).json({ error: "Login já existe" });
  }
});

// PATCH /api/admin/users/:id — edita tier, displayName ou senha
router.patch("/admin/users/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const schema = z.object({
    tier: z.number().int().min(0).max(5).optional(),
    displayName: z.string().max(100).optional(),
    password: z.string().min(4).max(100).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const { tier, displayName, password } = parsed.data;
  const updates: Record<string, unknown> = {};
  if (tier !== undefined) updates.tier = tier;
  if (displayName !== undefined) updates.displayName = displayName;
  if (password) updates.passwordHash = await bcrypt.hash(password, 12);
  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Nada para atualizar" }); return; }
  await db.update(usersTable).set(updates).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

// DELETE /api/admin/users/:id — exclui usuário
router.delete("/admin/users/:id", async (req, res) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Acesso negado" }); return; }
  const id = parseInt(req.params.id ?? "");
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  if (id === req.session.userId) { res.status(400).json({ error: "Não pode excluir a si mesmo" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

// POST /api/admin/setup — cria primeiro admin se tabela vazia (bootstrap único)
router.post("/admin/setup", async (req, res) => {
  const schema = z.object({ login: z.string().min(1), password: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Dados inválidos" }); return; }
  const existing = await db.select().from(usersTable).limit(1);
  if (existing.length > 0) { res.status(409).json({ error: "Admin já configurado" }); return; }
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const [user] = await db
    .insert(usersTable)
    .values({ login: parsed.data.login, passwordHash, tier: 5, displayName: "Admin" })
    .returning();
  res.status(201).json({ id: user?.id, login: user?.login });
});

export default router;
