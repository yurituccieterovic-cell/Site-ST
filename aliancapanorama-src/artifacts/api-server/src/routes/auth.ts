import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { allowedOrigins } from "../lib/allowedOrigins";
import nodemailer from "nodemailer";

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_ACCOUNT, pass: process.env.GMAIL_APP_PASSWORD },
});

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendAdmPin(email: string, pin: string, login: string) {
  await mailer.sendMail({
    from: `PAP Admin <${process.env.GMAIL_ACCOUNT}>`,
    to: email,
    subject: `PAP /adm — PIN de acesso: ${pin}`,
    text: `Olá ${login},\n\nSeu PIN de acesso ao /adm é: ${pin}\n\nVálido por 10 minutos. Não compartilhe.\n\n— PAP · Projeto Aliança Panorama`,
  });
}

const router = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  skipSuccessfulRequests: true,
});

router.post("/auth/login", loginRateLimit, async (req, res) => {
  const origin = req.headers["origin"];
  const referer = req.headers["referer"];

  let originToCheck: string | undefined = origin;
  if (originToCheck === undefined && referer) {
    try {
      originToCheck = new URL(referer).origin;
    } catch {
      res.status(403).json({ error: "Origem não permitida" });
      return;
    }
  }

  if (originToCheck !== undefined && !allowedOrigins.has(originToCheck)) {
    res.status(403).json({ error: "Origem não permitida" });
    return;
  }

  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { login, password } = parsed.data;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.login, login))
    .limit(1);

  const passwordValid =
    user && typeof user.passwordHash === "string" && user.passwordHash.length > 0
      ? await bcrypt.compare(password, user.passwordHash)
      : false;
  if (!user || !passwordValid) {
    res.status(401).json({ error: "Login ou senha incorretos" });
    return;
  }

  // Tier 5 (admin) requer PIN 2FA via email
  if (user.tier >= 5) {
    const pin = generatePin();
    req.session.admPin = pin;
    req.session.admPinExpiry = Date.now() + 10 * 60 * 1000;
    req.session.admPinUserId = user.id;
    req.session.admVerified = false;

    // PIN vai para o email do usuário admin (campo email) ou fallback para Yuri
    const emailDest = (user as { email?: string | null }).email ?? "yurituccieterovic@gmail.com";
    try {
      await sendAdmPin(emailDest, pin, user.login);
    } catch {
      // em dev, não falhar se email não configurado
    }

    res.json({ requiresPin: true, login: user.login });
    return;
  }

  req.session.userId = user.id;
  req.session.userLogin = user.login;
  req.session.userTier = user.tier;

  // Forçar gravação da sessão antes de responder (connect-pg-simple salva assíncrono)
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });

  res.json({
    id: user.id,
    login: user.login,
    tier: user.tier,
    displayName: user.displayName,
  });
});

// PIN 2FA para admins
const pinRateLimit = rateLimit({ windowMs: 5 * 60 * 1000, limit: 5, skipSuccessfulRequests: true });

router.post("/auth/adm-pin", pinRateLimit, async (req, res) => {
  const { pin } = req.body as { pin?: string };
  const { admPin, admPinExpiry, admPinUserId } = req.session;

  if (!admPin || !admPinExpiry || !admPinUserId) {
    res.status(400).json({ error: "Nenhum PIN pendente. Faça login primeiro." });
    return;
  }
  if (Date.now() > admPinExpiry) {
    req.session.admPin = undefined;
    res.status(401).json({ error: "PIN expirado. Faça login novamente." });
    return;
  }
  if (pin !== admPin) {
    res.status(401).json({ error: "PIN incorreto." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, admPinUserId)).limit(1);
  if (!user) { res.status(401).json({ error: "Usuário não encontrado." }); return; }

  req.session.userId = user.id;
  req.session.userLogin = user.login;
  req.session.userTier = user.tier;
  req.session.admVerified = true;
  req.session.admPin = undefined;
  req.session.admPinExpiry = undefined;
  req.session.admPinUserId = undefined;

  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });

  res.json({ id: user.id, login: user.login, tier: user.tier, displayName: user.displayName });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(204).end();
  });
});

router.get("/auth/me", async (req, res) => {
  if (!req.session.userId) {
    res.json({ user: null });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId))
    .limit(1);

  if (!user) {
    req.session.destroy(() => {});
    res.json({ user: null });
    return;
  }

  res.json({
    user: {
      id: user.id,
      login: user.login,
      tier: user.tier,
      displayName: user.displayName,
      subscriptionStatus: user.subscriptionStatus ?? null,
      lastDowngradeAt: user.lastDowngradeAt ? user.lastDowngradeAt.toISOString() : null,
      admVerified: req.session.admVerified ?? false,
    },
  });
});

router.post("/auth/dismiss-downgrade-notice", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }
  await db
    .update(usersTable)
    .set({ subscriptionStatus: null, lastDowngradeAt: null })
    .where(eq(usersTable.id, req.session.userId));
  res.json({ ok: true });
});

export default router;
