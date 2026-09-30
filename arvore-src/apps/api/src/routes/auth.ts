import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db, aoUsersTable } from "@arvore/db";
import { eq } from "drizzle-orm";
import { rateLimit } from "express-rate-limit";

const router: IRouter = Router();

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/auth/login", loginLimit, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(aoUsersTable).where(eq(aoUsersTable.email, email)).limit(1);

  // Tempo constante mesmo se usuário não existe (evita timing attack)
  const hash = user?.passwordHash ?? "$2b$12$invalidhashpadding000000000000000000000000000000000000";
  const valid = await bcrypt.compare(password, hash);

  if (!valid || !user || !user.isActive) {
    res.status(401).json({ error: "Email ou senha incorretos" });
    return;
  }

  req.session.userId  = user.id;
  req.session.isAdmin = user.isAdmin;

  await db.update(aoUsersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(aoUsersTable.id, user.id));

  res.json({
    ok: true,
    user: { id: user.id, email: user.email, displayName: user.displayName, isAdmin: user.isAdmin },
  });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) { res.status(500).json({ error: "Erro ao encerrar sessão" }); return; }
    res.clearCookie("arvore.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res) => {
  if (!req.session?.userId) {
    res.json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, userId: req.session.userId, isAdmin: req.session.isAdmin });
});

export default router;
