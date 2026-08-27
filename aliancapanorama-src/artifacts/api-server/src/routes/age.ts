import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { createTransport } from "nodemailer";
import { db } from "@workspace/db";
import {
  ageProfessionalsTable, ageAvailabilityRulesTable,
  ageAppointmentsTable, ageSabiaMemoryTable,
} from "@workspace/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { routeLLM } from "../lib/llm-router";
import { logger } from "../lib/logger";

const router = Router();

const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente em 15 minutos." },
});

const GMAIL      = process.env.GMAIL_ACCOUNT      ?? "luddlocke@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD  ?? "";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, body: string) {
  if (!GMAIL_PASS) { logger.warn("AGE: GMAIL_APP_PASSWORD ausente, email não enviado"); return; }
  const transport = createTransport({ service: "gmail", auth: { user: GMAIL, pass: GMAIL_PASS } });
  await transport.sendMail({ from: GMAIL, to, subject, text: body });
}

function requireAgeAuth(req: any, res: any, next: any) {
  if (!req.session?.ageProfessionalId) {
    res.status(401).json({ error: "Não autenticado no Age" });
    return;
  }
  next();
}

function canonicalIp(req: any): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "";
}

// Gera slots livres a partir das regras de disponibilidade num intervalo de datas
function generateSlots(
  rules: { diaSemana: number; horaInicio: string; horaFim: string; duracaoMin: number; intervaloMin: number; canal: string }[],
  from: Date,
  to: Date,
) {
  const slots: { dataHora: Date; duracaoMin: number; canal: string }[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= to) {
    const dow = cursor.getDay();
    for (const rule of rules) {
      if (rule.diaSemana !== dow) continue;
      const [startH, startM] = rule.horaInicio.split(":").map(Number);
      const [endH, endM]     = rule.horaFim.split(":").map(Number);
      const slotDur = rule.duracaoMin + rule.intervaloMin;

      let t = new Date(cursor);
      t.setHours(startH!, startM!, 0, 0);
      const end = new Date(cursor);
      end.setHours(endH!, endM!, 0, 0);

      while (t.getTime() + rule.duracaoMin * 60000 <= end.getTime()) {
        slots.push({ dataHora: new Date(t), duracaoMin: rule.duracaoMin, canal: rule.canal });
        t = new Date(t.getTime() + slotDur * 60000);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

// POST /api/age/auth/login
router.post("/age/auth/login", loginLimit, async (req, res): Promise<void> => {
  const { slug, password } = req.body as { slug?: string; password?: string };
  if (!slug || !password) {
    res.status(400).json({ error: "slug e password obrigatórios" });
    return;
  }

  const [prof] = await db.select().from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);

  if (!prof) { res.status(401).json({ error: "Profissional não encontrado" }); return; }

  const ok = await bcrypt.compare(password, prof.passwordHash);
  if (!ok) { res.status(401).json({ error: "Senha incorreta" }); return; }

  const ip = canonicalIp(req);
  const isNewIp = prof.lastLoginIp && prof.lastLoginIp !== ip;

  if (isNewIp && prof.email) {
    // IP novo → challenge por email
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await db.update(ageProfessionalsTable)
      .set({ challengeCode: code, challengeAt: new Date() })
      .where(eq(ageProfessionalsTable.id, prof.id));

    await sendEmail(
      prof.email,
      `Age — Código de verificação: ${code}`,
      `Olá ${prof.nome},\n\nDetectamos um acesso de um dispositivo ou local diferente do habitual.\n\nCódigo de verificação: ${code}\n\nVálido por 10 minutos. Se não foi você, ignore.\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail challenge"));

    res.json({ challenge: true, message: "Código enviado para o seu email. Verifique e insira abaixo." });
    return;
  }

  // Login normal
  req.session.ageProfessionalId = prof.id;
  req.session.ageProfessionalSlug = prof.slug;
  req.session.ageProfessionalNome = prof.nome;
  await new Promise<void>((resolve, reject) =>
    req.session.save((err: unknown) => (err ? reject(err) : resolve())));

  await db.update(ageProfessionalsTable)
    .set({ lastLoginIp: ip, lastLoginAt: new Date(), challengeCode: null, challengeAt: null })
    .where(eq(ageProfessionalsTable.id, prof.id));

  res.json({ ok: true, nome: prof.nome, slug: prof.slug });
});

// POST /api/age/auth/verify-challenge
router.post("/age/auth/verify-challenge", loginLimit, async (req, res): Promise<void> => {
  const { slug, code } = req.body as { slug?: string; code?: string };
  if (!slug || !code) { res.status(400).json({ error: "slug e code obrigatórios" }); return; }

  const [prof] = await db.select().from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);

  if (!prof?.challengeCode || !prof.challengeAt) {
    res.status(400).json({ error: "Nenhum desafio pendente" });
    return;
  }

  const expired = Date.now() - prof.challengeAt.getTime() > 10 * 60 * 1000;
  if (expired) { res.status(400).json({ error: "Código expirado. Faça login novamente." }); return; }

  if (prof.challengeCode !== code.trim()) {
    res.status(401).json({ error: "Código incorreto" });
    return;
  }

  const ip = canonicalIp(req);
  req.session.ageProfessionalId = prof.id;
  req.session.ageProfessionalSlug = prof.slug;
  req.session.ageProfessionalNome = prof.nome;
  await new Promise<void>((resolve, reject) =>
    req.session.save((err: unknown) => (err ? reject(err) : resolve())));

  await db.update(ageProfessionalsTable)
    .set({ lastLoginIp: ip, lastLoginAt: new Date(), challengeCode: null, challengeAt: null })
    .where(eq(ageProfessionalsTable.id, prof.id));

  res.json({ ok: true, nome: prof.nome, slug: prof.slug });
});

// GET /api/age/auth/me
router.get("/age/auth/me", (req, res) => {
  if (!req.session?.ageProfessionalId) {
    res.json({ authenticated: false });
    return;
  }
  res.json({
    authenticated: true,
    id: req.session.ageProfessionalId,
    nome: req.session.ageProfessionalNome,
    slug: req.session.ageProfessionalSlug,
  });
});

// POST /api/age/auth/logout
router.post("/age/auth/logout", (req, res) => {
  req.session.ageProfessionalId = undefined;
  req.session.ageProfessionalSlug = undefined;
  req.session.ageProfessionalNome = undefined;
  req.session.save(() => res.json({ ok: true }));
});

// POST /api/age/auth/change-password
router.post("/age/auth/change-password", loginLimit, requireAgeAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "Senha atual e nova senha (mín. 8 chars) obrigatórias" });
    return;
  }

  const [prof] = await db.select().from(ageProfessionalsTable)
    .where(eq(ageProfessionalsTable.id, req.session.ageProfessionalId!)).limit(1);

  if (!prof) { res.status(404).json({ error: "Profissional não encontrado" }); return; }
  const ok = await bcrypt.compare(currentPassword, prof.passwordHash);
  if (!ok) { res.status(401).json({ error: "Senha atual incorreta" }); return; }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.update(ageProfessionalsTable).set({ passwordHash: hash }).where(eq(ageProfessionalsTable.id, prof.id));
  res.json({ ok: true });
});

// ─── Perfil público ───────────────────────────────────────────────────────────

// GET /api/age/:slug — info pública da profissional
router.get("/age/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const [prof] = await db.select({
    id: ageProfessionalsTable.id,
    slug: ageProfessionalsTable.slug,
    nome: ageProfessionalsTable.nome,
    tipo: ageProfessionalsTable.tipo,
    registro: ageProfessionalsTable.registro,
    especialidade: ageProfessionalsTable.especialidade,
    bio: ageProfessionalsTable.bio,
    cor: ageProfessionalsTable.cor,
  }).from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);

  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }
  res.json(prof);
});

// ─── Disponibilidade ──────────────────────────────────────────────────────────

// GET /api/age/:slug/availability
router.get("/age/:slug/availability", async (req, res): Promise<void> => {
  const [prof] = await db.select({ id: ageProfessionalsTable.id })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, req.params.slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Não encontrado" }); return; }

  const rules = await db.select().from(ageAvailabilityRulesTable)
    .where(and(eq(ageAvailabilityRulesTable.professionalId, prof.id), eq(ageAvailabilityRulesTable.ativa, true)));
  res.json(rules);
});

// POST /api/age/:slug/availability (auth required)
router.post("/age/:slug/availability", requireAgeAuth, async (req, res): Promise<void> => {
  const { diaSemana, horaInicio, horaFim, duracaoMin = 50, intervaloMin = 10, canal = "presencial" } = req.body as {
    diaSemana: number; horaInicio: string; horaFim: string;
    duracaoMin?: number; intervaloMin?: number; canal?: string;
  };

  if (diaSemana === undefined || !horaInicio || !horaFim) {
    res.status(400).json({ error: "diaSemana, horaInicio e horaFim obrigatórios" });
    return;
  }

  const [rule] = await db.insert(ageAvailabilityRulesTable)
    .values({ professionalId: req.session.ageProfessionalId!, diaSemana, horaInicio, horaFim, duracaoMin, intervaloMin, canal })
    .returning();
  res.status(201).json(rule);
});

// DELETE /api/age/:slug/availability/:id (auth required)
router.delete("/age/:slug/availability/:id", requireAgeAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id ?? "0", 10);
  await db.update(ageAvailabilityRulesTable).set({ ativa: false }).where(
    and(eq(ageAvailabilityRulesTable.id, id), eq(ageAvailabilityRulesTable.professionalId, req.session.ageProfessionalId!))
  );
  res.json({ ok: true });
});

// ─── Slots disponíveis (público) ──────────────────────────────────────────────

// GET /api/age/:slug/slots?de=2026-09-01&ate=2026-09-30
router.get("/age/:slug/slots", async (req, res): Promise<void> => {
  const [prof] = await db.select({ id: ageProfessionalsTable.id })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, req.params.slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Não encontrado" }); return; }

  const de  = new Date(req.query["de"]  as string || new Date().toISOString().slice(0, 10));
  const ate = new Date(req.query["ate"] as string || new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10));
  ate.setHours(23, 59, 59, 999);

  const rules = await db.select().from(ageAvailabilityRulesTable)
    .where(and(eq(ageAvailabilityRulesTable.professionalId, prof.id), eq(ageAvailabilityRulesTable.ativa, true)));

  const booked = await db.select({ dataHora: ageAppointmentsTable.dataHora })
    .from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      gte(ageAppointmentsTable.dataHora, de),
      lte(ageAppointmentsTable.dataHora, ate),
    ));

  const bookedSet = new Set(booked.map(b => b.dataHora.getTime()));
  const now = Date.now();

  const allSlots = generateSlots(rules, de, ate)
    .filter(s => s.dataHora.getTime() > now && !bookedSet.has(s.dataHora.getTime()))
    .map(s => ({ dataHora: s.dataHora.toISOString(), duracaoMin: s.duracaoMin, canal: s.canal }));

  res.json(allSlots);
});

// ─── Agendamentos ─────────────────────────────────────────────────────────────

// GET /api/age/:slug/appointments (auth required)
router.get("/age/:slug/appointments", requireAgeAuth, async (req, res): Promise<void> => {
  const { de, ate } = req.query as Record<string, string | undefined>;
  const conditions = [eq(ageAppointmentsTable.professionalId, req.session.ageProfessionalId!)];
  if (de)  conditions.push(gte(ageAppointmentsTable.dataHora, new Date(de)));
  if (ate) conditions.push(lte(ageAppointmentsTable.dataHora, new Date(ate)));

  const rows = await db.select().from(ageAppointmentsTable)
    .where(and(...conditions))
    .orderBy(ageAppointmentsTable.dataHora);
  res.json(rows);
});

// POST /api/age/:slug/book — paciente marca horário (público)
router.post("/age/:slug/book", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const { patientNome, patientTelefone, patientEmail, dataHora, canal = "presencial" } = req.body as {
    patientNome?: string; patientTelefone?: string; patientEmail?: string;
    dataHora?: string; canal?: string;
  };

  if (!patientNome || !dataHora) {
    res.status(400).json({ error: "patientNome e dataHora obrigatórios" });
    return;
  }

  const [prof] = await db.select().from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  // Verificar se o slot já foi reservado
  const [existing] = await db.select({ id: ageAppointmentsTable.id })
    .from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      eq(ageAppointmentsTable.dataHora, new Date(dataHora)),
    )).limit(1);

  if (existing) { res.status(409).json({ error: "Horário já reservado. Escolha outro." }); return; }

  const [appt] = await db.insert(ageAppointmentsTable).values({
    professionalId: prof.id,
    patientNome, patientTelefone, patientEmail,
    dataHora: new Date(dataHora),
    duracaoMin: 50,
    status: "reservado",
    canal,
  }).returning();

  // Notificar profissional por email
  if (prof.email) {
    const dt = new Date(dataHora).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    sendEmail(
      prof.email,
      `Age — Nova consulta marcada: ${patientNome}`,
      `Olá ${prof.nome},\n\n${patientNome} marcou uma consulta para ${dt}.\nContato: ${patientTelefone ?? "—"} | ${patientEmail ?? "—"}\nCanal: ${canal}\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail book notify"));
  }

  res.status(201).json(appt);
});

// PATCH /api/age/:slug/appointments/:id (auth required)
router.patch("/age/:slug/appointments/:id", requireAgeAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id ?? "0", 10);
  const { status, observacoes, patientNome, patientTelefone, patientEmail } = req.body as Record<string, string | undefined>;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status)           updates["status"]           = status;
  if (observacoes !== undefined) updates["observacoes"] = observacoes;
  if (patientNome)      updates["patientNome"]      = patientNome;
  if (patientTelefone)  updates["patientTelefone"]  = patientTelefone;
  if (patientEmail)     updates["patientEmail"]     = patientEmail;

  const [updated] = await db.update(ageAppointmentsTable)
    .set(updates as any)
    .where(and(eq(ageAppointmentsTable.id, id), eq(ageAppointmentsTable.professionalId, req.session.ageProfessionalId!)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Agendamento não encontrado" }); return; }
  res.json(updated);
});

// DELETE /api/age/:slug/appointments/:id (auth required)
router.delete("/age/:slug/appointments/:id", requireAgeAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id ?? "0", 10);
  await db.delete(ageAppointmentsTable)
    .where(and(eq(ageAppointmentsTable.id, id), eq(ageAppointmentsTable.professionalId, req.session.ageProfessionalId!)));
  res.json({ ok: true });
});

// ─── SABIÁ ────────────────────────────────────────────────────────────────────

// POST /api/age/:slug/sabia (auth required)
router.post("/age/:slug/sabia", requireAgeAuth, async (req, res): Promise<void> => {
  const { message, sessionId } = req.body as { message?: string; sessionId?: string };
  if (!message?.trim()) { res.status(400).json({ error: "message obrigatório" }); return; }

  const profId = req.session.ageProfessionalId!;
  const profNome = req.session.ageProfessionalNome ?? "profissional";

  // Contexto: próximas consultas do dia
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const todayAppts = await db.select().from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, profId),
      gte(ageAppointmentsTable.dataHora, today),
      lte(ageAppointmentsTable.dataHora, tomorrow),
    )).orderBy(ageAppointmentsTable.dataHora);

  const agendaHoje = todayAppts.length === 0
    ? "Nenhuma consulta hoje."
    : todayAppts.map(a => {
        const h = new Date(a.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        return `${h} — ${a.patientNome ?? "paciente"} (${a.status}, ${a.canal})`;
      }).join("\n");

  // Histórico da sessão
  const history = await db.select().from(ageSabiaMemoryTable)
    .where(and(
      eq(ageSabiaMemoryTable.professionalId, profId),
      sessionId ? eq(ageSabiaMemoryTable.sessionId, sessionId) : eq(ageSabiaMemoryTable.professionalId, profId),
    ))
    .orderBy(desc(ageSabiaMemoryTable.createdAt))
    .limit(10);

  const messages = [
    {
      role: "system" as const,
      content: `Você é SABIÁ, assistente de agenda e cuidado de ${profNome}. Assim como o pássaro, você está sempre presente e conhece cada detalhe. Você combina a memória afetiva da Cana, a presença cíclica da ISA e a precisão triageadora do DODGE. Responda sempre em português, com cuidado, clareza e calma. Nunca invente dados clínicos. Ajude ${profNome} a gerenciar sua agenda, entender sua semana e cuidar de seus pacientes com sabedoria.\n\nAgenda de hoje:\n${agendaHoje}`,
    },
    ...history.reverse().map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
    { role: "user" as const, content: message },
  ];

  let reply = "Desculpe, não consegui processar agora. Tente em instantes.";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    try {
      reply = await routeLLM({ messages, pool: "chat-live", temperature: 0.4, signal: ctrl.signal });
    } finally { clearTimeout(timer); }
  } catch (e) { logger.error({ err: e }, "age: sabia LLM error"); }

  // Salvar na memória
  const sid = sessionId ?? `age-${profId}-${Date.now()}`;
  await db.insert(ageSabiaMemoryTable).values([
    { professionalId: profId, role: "user",      content: message, sessionId: sid },
    { professionalId: profId, role: "assistant", content: reply,   sessionId: sid },
  ]);

  res.json({ reply, sessionId: sid });
});

// ─── Admin: criar profissional (tier 5) ───────────────────────────────────────

// POST /api/age/admin/setup
router.post("/age/admin/setup", async (req, res): Promise<void> => {
  if ((req.session as any).userTier < 5) {
    res.status(403).json({ error: "Acesso restrito a tier 5" });
    return;
  }

  const { slug, nome, tipo, registro, especialidade, bio, cor, email, password } = req.body as Record<string, string>;
  if (!slug || !nome || !password) {
    res.status(400).json({ error: "slug, nome e password obrigatórios" });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const [prof] = await db.insert(ageProfessionalsTable)
    .values({ slug, nome, tipo: tipo ?? "psicóloga", registro, especialidade, bio, cor: cor ?? "#2dd4bf", email, passwordHash: hash })
    .onConflictDoUpdate({ target: ageProfessionalsTable.slug, set: { nome, tipo, registro, especialidade, bio, cor, email } })
    .returning();

  res.status(201).json({ ok: true, id: prof.id, slug: prof.slug });
});

export default router;
