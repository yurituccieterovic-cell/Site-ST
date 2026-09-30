import "dotenv/config";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { bootstrap } from "./lib/bootstrap.js";
import authRouter from "./routes/auth.js";
import chatRouter from "./routes/chat.js";
import memoryRouter from "./routes/memory.js";
import adminRouter from "./routes/admin.js";

const PORT = Number(process.env["PORT"] ?? 3001);
const FRONTEND_URL = process.env["FRONTEND_URL"] ?? "http://localhost:5173";
const isProd = process.env["NODE_ENV"] === "production";

// Bootstrap: cria tabelas se não existirem
await bootstrap();

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: isProd,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

// Sessão com PostgreSQL store
const PgStore = connectPgSimple(session);
app.use(session({
  name: "arvore.sid",
  secret: process.env["SESSION_SECRET"] ?? "dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  store: new PgStore({
    conString: process.env["DATABASE_URL"],
    tableName: "ao_sessions",
    createTableIfMissing: false,
    ttl: 7 * 24 * 60 * 60,
  }),
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Rate limit global
app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Rate limit atingido. Máximo 120 requisições por minuto." },
}));

// Health
app.get("/healthz", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Rotas
app.use("/api", authRouter);
app.use("/api", chatRouter);
app.use("/api", memoryRouter);
app.use("/api", adminRouter);

// 404
app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada" }));

// Error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[api error]", err);
  res.status(500).json({ error: "Erro interno" });
});

app.listen(PORT, () => {
  console.log(`[api] Árvore Oracular rodando na porta ${PORT}`);
});
