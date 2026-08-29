import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { createTransport } from "nodemailer";
import { db } from "@workspace/db";
import {
  ageProfessionalsTable, ageAvailabilityRulesTable,
  ageAppointmentsTable, ageSabiaMemoryTable, ageExceptionsTable, agePatientsTable,
} from "@workspace/db";
import { randomUUID } from "crypto";
import { eq, and, gte, lte, desc, not, inArray, sql } from "drizzle-orm";
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

type ExceptionRow = { data: string; horaInicio: string | null; horaFim: string | null };

// Gera slots livres a partir das regras de disponibilidade num intervalo de datas
function generateSlots(
  rules: { diaSemana: number; horaInicio: string; horaFim: string; duracaoMin: number; intervaloMin: number; canal: string }[],
  from: Date,
  to: Date,
  exceptions: ExceptionRow[] = [],
) {
  // Exceções de dia inteiro (sem hora) e parciais (com hora)
  const fullDayBlocks = new Set(exceptions.filter(e => !e.horaInicio).map(e => e.data));
  const partialBlocks = exceptions.filter(e => e.horaInicio && e.horaFim);

  const slots: { dataHora: Date; duracaoMin: number; canal: string }[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= to) {
    const dateStr = cursor.toISOString().slice(0, 10);

    if (!fullDayBlocks.has(dateStr)) {
      const dayPartials = partialBlocks.filter(e => e.data === dateStr);
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
          const blocked = dayPartials.some(e => {
            const [bH, bM] = e.horaInicio!.split(":").map(Number);
            const [eH, eM] = e.horaFim!.split(":").map(Number);
            const bStart = bH! * 60 + bM!;
            const bEnd   = eH! * 60 + eM!;
            const sMin   = t.getHours() * 60 + t.getMinutes();
            return sMin >= bStart && sMin < bEnd;
          });
          if (!blocked) slots.push({ dataHora: new Date(t), duracaoMin: rule.duracaoMin, canal: rule.canal });
          t = new Date(t.getTime() + slotDur * 60000);
        }
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

// DELETE /api/age/:slug/availability/:id (auth required) — soft delete
router.delete("/age/:slug/availability/:id", requireAgeAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id ?? "0", 10);
  await db.update(ageAvailabilityRulesTable).set({ ativa: false }).where(
    and(eq(ageAvailabilityRulesTable.id, id), eq(ageAvailabilityRulesTable.professionalId, req.session.ageProfessionalId!))
  );
  res.json({ ok: true });
});

// PATCH /api/age/:slug/availability/:id (auth required) — restore soft-deleted rule
router.patch("/age/:slug/availability/:id", requireAgeAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id ?? "0", 10);
  await db.update(ageAvailabilityRulesTable).set({ ativa: true }).where(
    and(eq(ageAvailabilityRulesTable.id, id), eq(ageAvailabilityRulesTable.professionalId, req.session.ageProfessionalId!))
  );
  res.json({ ok: true });
});

// ─── Exceções ─────────────────────────────────────────────────────────────────

// GET /api/age/:slug/exceptions (auth required)
router.get("/age/:slug/exceptions", requireAgeAuth, async (req, res): Promise<void> => {
  const rows = await db.select().from(ageExceptionsTable)
    .where(eq(ageExceptionsTable.professionalId, req.session.ageProfessionalId!))
    .orderBy(ageExceptionsTable.data);
  res.json(rows);
});

// POST /api/age/:slug/exceptions (auth required)
router.post("/age/:slug/exceptions", requireAgeAuth, async (req, res): Promise<void> => {
  const { data, tipo = "bloqueio", horaInicio, horaFim, descricao } = req.body as {
    data?: string; tipo?: string; horaInicio?: string; horaFim?: string; descricao?: string;
  };
  if (!data) { res.status(400).json({ error: "data (YYYY-MM-DD) obrigatória" }); return; }

  const [row] = await db.insert(ageExceptionsTable)
    .values({ professionalId: req.session.ageProfessionalId!, data, tipo, horaInicio: horaInicio ?? null, horaFim: horaFim ?? null, descricao })
    .returning();
  res.status(201).json(row);
});

// DELETE /api/age/:slug/exceptions/:id (auth required)
router.delete("/age/:slug/exceptions/:id", requireAgeAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id ?? "0", 10);
  await db.delete(ageExceptionsTable).where(
    and(eq(ageExceptionsTable.id, id), eq(ageExceptionsTable.professionalId, req.session.ageProfessionalId!))
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
      not(inArray(ageAppointmentsTable.status, ["cancelado", "remarcado"])),
    ));

  const exceptions = await db.select({
    data: ageExceptionsTable.data,
    horaInicio: ageExceptionsTable.horaInicio,
    horaFim: ageExceptionsTable.horaFim,
  }).from(ageExceptionsTable)
    .where(and(
      eq(ageExceptionsTable.professionalId, prof.id),
      gte(ageExceptionsTable.data, de.toISOString().slice(0, 10)),
      lte(ageExceptionsTable.data, ate.toISOString().slice(0, 10)),
    ));

  const bookedSet = new Set(booked.map(b => b.dataHora.getTime()));
  const now = Date.now();

  const allSlots = generateSlots(rules, de, ate, exceptions)
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
  const { patientNome, patientTelefone, patientEmail, dataHora, canal = "presencial", lgpdConsent } = req.body as {
    patientNome?: string; patientTelefone?: string; patientEmail?: string;
    dataHora?: string; canal?: string; lgpdConsent?: boolean;
  };

  if (!patientNome || !dataHora) {
    res.status(400).json({ error: "patientNome e dataHora obrigatórios" });
    return;
  }
  if (!lgpdConsent) {
    res.status(400).json({ error: "É necessário aceitar a Política de Privacidade para agendar." });
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

  const cancelToken = randomUUID();
  const [appt] = await db.insert(ageAppointmentsTable).values({
    professionalId: prof.id,
    patientNome, patientTelefone, patientEmail,
    dataHora: new Date(dataHora),
    duracaoMin: 50,
    status: "reservado",
    canal,
    lgpdConsent: true,
    lgpdConsentAt: new Date(),
    cancelToken,
  }).returning();

  const dt = new Date(dataHora).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const cancelLink     = `${FRONT_URL}/age/${slug}?cancel=${cancelToken}`;
  const rescheduleLink = `${FRONT_URL}/age/${slug}?reschedule=${cancelToken}`;

  // Email para o paciente
  if (patientEmail) {
    sendEmail(
      patientEmail,
      `Consulta confirmada — ${prof.nome}`,
      `Olá ${patientNome},\n\nSua consulta foi marcada!\n\n📅 ${dt}\n👤 ${prof.nome} (${prof.tipo})\n📍 Canal: ${canal}\n\nPrecisa cancelar ou remarcar?\n• Cancelar: ${cancelLink}\n• Remarcar: ${rescheduleLink}\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail book patient"));
  }

  // Email para a profissional
  if (prof.email) {
    sendEmail(
      prof.email,
      `Age — Nova consulta marcada: ${patientNome}`,
      `Olá ${prof.nome},\n\n${patientNome} marcou uma consulta para ${dt}.\nContato: ${patientTelefone ?? "—"} | ${patientEmail ?? "—"}\nCanal: ${canal}\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail book notify"));
  }

  res.status(201).json(appt);
});

// ─── Cancelamento e reagendamento por token (sem login) ───────────────────────

// GET /api/age/:slug/appointments/by-token/:token — info pública do agendamento
router.get("/age/:slug/appointments/by-token/:token", async (req, res): Promise<void> => {
  const { slug, token } = req.params;

  const [prof] = await db.select({ id: ageProfessionalsTable.id, nome: ageProfessionalsTable.nome, cancelMinHoras: (ageProfessionalsTable as any).cancelMinHoras })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  const [appt] = await db.select({
    id: ageAppointmentsTable.id,
    dataHora: ageAppointmentsTable.dataHora,
    duracaoMin: ageAppointmentsTable.duracaoMin,
    status: ageAppointmentsTable.status,
    canal: ageAppointmentsTable.canal,
    patientNome: ageAppointmentsTable.patientNome,
  }).from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      eq((ageAppointmentsTable as any).cancelToken, token!),
    )).limit(1);

  if (!appt) { res.status(404).json({ error: "Agendamento não encontrado." }); return; }

  const cancelMinHoras: number = (prof as any).cancelMinHoras ?? 24;
  const horasRestantes = (appt.dataHora.getTime() - Date.now()) / 3600000;
  const dentroJanela   = horasRestantes >= cancelMinHoras;

  res.json({
    ...appt,
    profNome: prof.nome,
    cancelMinHoras,
    dentroJanela,
    horasRestantes: Math.round(horasRestantes),
  });
});

// POST /api/age/:slug/appointments/by-token/:token/cancel
router.post("/age/:slug/appointments/by-token/:token/cancel", async (req, res): Promise<void> => {
  const { slug, token } = req.params;

  const [prof] = await db.select({ id: ageProfessionalsTable.id, nome: ageProfessionalsTable.nome, email: ageProfessionalsTable.email })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  const [appt] = await db.select().from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      eq((ageAppointmentsTable as any).cancelToken, token!),
    )).limit(1);

  if (!appt) { res.status(404).json({ error: "Agendamento não encontrado." }); return; }
  if (["cancelado", "realizado", "faltou"].includes(appt.status)) {
    res.status(409).json({ error: `Agendamento já está ${appt.status}.` }); return;
  }

  const cancelMinHoras = (prof as any).cancelMinHoras ?? 24;
  const horasRestantes = (appt.dataHora.getTime() - Date.now()) / 3600000;
  if (horasRestantes < cancelMinHoras) {
    res.status(422).json({
      error: `Cancelamento só é permitido com ${cancelMinHoras}h de antecedência. Faltam ${Math.round(horasRestantes)}h para a consulta. Entre em contato diretamente com ${prof.nome}.`,
    });
    return;
  }

  await db.update(ageAppointmentsTable)
    .set({ status: "cancelado", updatedAt: new Date() })
    .where(eq(ageAppointmentsTable.id, appt.id));

  const dt = appt.dataHora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  if (appt.patientEmail) {
    sendEmail(
      appt.patientEmail,
      `Consulta cancelada — ${prof.nome}`,
      `Olá ${appt.patientNome ?? ""},\n\nSua consulta do dia ${dt} com ${prof.nome} foi cancelada.\n\nSe quiser remarcar, entre em contato ou acesse o site.\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail cancel patient"));
  }
  if (prof.email) {
    sendEmail(
      prof.email,
      `Age — Consulta cancelada: ${appt.patientNome ?? "paciente"}`,
      `Olá ${prof.nome},\n\n${appt.patientNome ?? "Um paciente"} cancelou a consulta do dia ${dt}.\n\nO horário está novamente disponível.\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail cancel prof"));
  }

  res.json({ ok: true, message: "Consulta cancelada com sucesso." });
});

// GET /api/age/:slug/appointments/by-token/:token/reschedule-slots — slots disponíveis para remarcar
router.get("/age/:slug/appointments/by-token/:token/reschedule-slots", async (req, res): Promise<void> => {
  const { slug, token } = req.params;

  const [prof] = await db.select({ id: ageProfessionalsTable.id })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  const [appt] = await db.select({ id: ageAppointmentsTable.id, status: ageAppointmentsTable.status })
    .from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      eq((ageAppointmentsTable as any).cancelToken, token!),
    )).limit(1);
  if (!appt) { res.status(404).json({ error: "Agendamento não encontrado." }); return; }
  if (["cancelado", "realizado", "faltou"].includes(appt.status)) {
    res.status(409).json({ error: "Este agendamento não pode ser remarcado." }); return;
  }

  const de  = new Date();
  const ate = new Date(Date.now() + 45 * 864e5);
  ate.setHours(23, 59, 59, 999);

  const rules = await db.select().from(ageAvailabilityRulesTable)
    .where(and(eq(ageAvailabilityRulesTable.professionalId, prof.id), eq(ageAvailabilityRulesTable.ativa, true)));

  const booked = await db.select({ dataHora: ageAppointmentsTable.dataHora })
    .from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      gte(ageAppointmentsTable.dataHora, de),
      lte(ageAppointmentsTable.dataHora, ate),
      not(inArray(ageAppointmentsTable.status, ["cancelado", "remarcado"])),
      sql`id != ${appt.id}`,
    ));

  const exceptions = await db.select({
    data: ageExceptionsTable.data,
    horaInicio: ageExceptionsTable.horaInicio,
    horaFim: ageExceptionsTable.horaFim,
  }).from(ageExceptionsTable)
    .where(and(
      eq(ageExceptionsTable.professionalId, prof.id),
      gte(ageExceptionsTable.data, de.toISOString().slice(0, 10)),
      lte(ageExceptionsTable.data, ate.toISOString().slice(0, 10)),
    ));

  const bookedSet = new Set(booked.map(b => b.dataHora.getTime()));
  const now = Date.now();

  const slots = generateSlots(rules, de, ate, exceptions)
    .filter(s => s.dataHora.getTime() > now && !bookedSet.has(s.dataHora.getTime()))
    .map(s => ({ dataHora: s.dataHora.toISOString(), duracaoMin: s.duracaoMin, canal: s.canal }));

  res.json(slots);
});

// POST /api/age/:slug/appointments/by-token/:token/reschedule — confirma remarcação
router.post("/age/:slug/appointments/by-token/:token/reschedule", async (req, res): Promise<void> => {
  const { slug, token } = req.params;
  const { novaDataHora } = req.body as { novaDataHora?: string };
  if (!novaDataHora) { res.status(400).json({ error: "novaDataHora obrigatório" }); return; }

  const [prof] = await db.select({ id: ageProfessionalsTable.id, nome: ageProfessionalsTable.nome, email: ageProfessionalsTable.email, cancelMinHoras: (ageProfessionalsTable as any).cancelMinHoras })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  const [appt] = await db.select().from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      eq((ageAppointmentsTable as any).cancelToken, token!),
    )).limit(1);
  if (!appt) { res.status(404).json({ error: "Agendamento não encontrado." }); return; }
  if (["cancelado", "realizado", "faltou", "remarcado"].includes(appt.status)) {
    res.status(409).json({ error: "Este agendamento não pode ser remarcado." }); return;
  }

  const cancelMinHoras = (prof as any).cancelMinHoras ?? 24;
  const horasRestantes = (appt.dataHora.getTime() - Date.now()) / 3600000;
  if (horasRestantes < cancelMinHoras) {
    res.status(422).json({
      error: `Remarcação só é permitida com ${cancelMinHoras}h de antecedência. Entre em contato diretamente com ${prof.nome}.`,
    });
    return;
  }

  // Verificar se novo slot está livre
  const [conflito] = await db.select({ id: ageAppointmentsTable.id })
    .from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      eq(ageAppointmentsTable.dataHora, new Date(novaDataHora)),
      not(inArray(ageAppointmentsTable.status, ["cancelado", "remarcado"])),
    )).limit(1);
  if (conflito) { res.status(409).json({ error: "Horário já ocupado. Escolha outro." }); return; }

  // Marcar original como "remarcado" e criar novo agendamento
  await db.update(ageAppointmentsTable)
    .set({ status: "remarcado", updatedAt: new Date() })
    .where(eq(ageAppointmentsTable.id, appt.id));

  const newToken = randomUUID();
  const [newAppt] = await db.insert(ageAppointmentsTable).values({
    professionalId: prof.id,
    patientNome: appt.patientNome,
    patientTelefone: appt.patientTelefone,
    patientEmail: appt.patientEmail,
    dataHora: new Date(novaDataHora),
    duracaoMin: appt.duracaoMin,
    status: "reservado",
    canal: appt.canal,
    lgpdConsent: appt.lgpdConsent ?? false,
    lgpdConsentAt: appt.lgpdConsentAt,
    cancelToken: newToken,
    remarcadoDeId: appt.id,
  } as any).returning();

  const dtAntes = appt.dataHora.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const dtNovo  = new Date(novaDataHora).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const cancelLink     = `${FRONT_URL}/age/${slug}?cancel=${newToken}`;
  const rescheduleLink = `${FRONT_URL}/age/${slug}?reschedule=${newToken}`;

  if (appt.patientEmail) {
    sendEmail(
      appt.patientEmail,
      `Consulta remarcada — ${prof.nome}`,
      `Olá ${appt.patientNome ?? ""},\n\nSua consulta foi remarcada!\n\n✅ Novo horário: ${dtNovo}\n❌ Horário anterior: ${dtAntes}\n\nPrecisa cancelar ou remarcar novamente?\n• Cancelar: ${cancelLink}\n• Remarcar: ${rescheduleLink}\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail reschedule patient"));
  }
  if (prof.email) {
    sendEmail(
      prof.email,
      `Age — Consulta remarcada: ${appt.patientNome ?? "paciente"}`,
      `Olá ${prof.nome},\n\n${appt.patientNome ?? "Um paciente"} remarcou a consulta:\n❌ Antes: ${dtAntes}\n✅ Agora: ${dtNovo}\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail reschedule prof"));
  }

  res.status(201).json({ ok: true, appt: newAppt, message: "Consulta remarcada com sucesso!" });
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

// ─── Pacientes ────────────────────────────────────────────────────────────────

const FRONT_URL = process.env.FRONTEND_URL ?? "https://site-st.vercel.app/aliancapanorama";

// POST /api/age/:slug/patients — paciente se cadastra (público)
router.post("/age/:slug/patients", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const { nome, email, telefone, lgpdConsent } = req.body as { nome?: string; email?: string; telefone?: string; lgpdConsent?: boolean };
  if (!nome || !email) { res.status(400).json({ error: "nome e email obrigatórios" }); return; }
  if (!lgpdConsent) { res.status(400).json({ error: "É necessário aceitar a Política de Privacidade para se cadastrar." }); return; }

  const [prof] = await db.select({ id: ageProfessionalsTable.id, nome: ageProfessionalsTable.nome, email: ageProfessionalsTable.email })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  // Evitar duplicata por email no mesmo profissional
  const [existing] = await db.select({ id: agePatientsTable.id, status: agePatientsTable.status })
    .from(agePatientsTable)
    .where(and(eq(agePatientsTable.professionalId, prof.id), eq(agePatientsTable.email, email.toLowerCase())))
    .limit(1);

  if (existing) {
    const msg = existing.status === "aprovado"
      ? "Este email já está cadastrado e aprovado."
      : "Este email já está cadastrado. Verifique sua caixa de entrada.";
    res.status(409).json({ error: msg });
    return;
  }

  const token = randomUUID();
  const expira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await db.insert(agePatientsTable).values({
    professionalId: prof.id,
    nome,
    email: email.toLowerCase(),
    telefone,
    status: "email_pendente",
    tokenConfirmacao: token,
    tokenExpiraAt: expira,
    lgpdConsent: true,
    lgpdConsentAt: new Date(),
  });

  const confirmLink = `${FRONT_URL}/age/${slug}?confirm=${token}`;
  await sendEmail(
    email,
    `Age — Confirme seu cadastro com ${prof.nome}`,
    `Olá ${nome},\n\nSeu cadastro foi recebido! Clique no link abaixo para confirmar seu email:\n\n${confirmLink}\n\nO link expira em 24 horas.\n\nApós a confirmação, ${prof.nome} receberá uma notificação e aprovará seu acesso.\n\n— SABIÁ`,
  ).catch(e => logger.error({ err: e }, "age: sendEmail confirm patient"));

  res.status(201).json({ ok: true, message: "Cadastro recebido! Verifique seu email para confirmar." });
});

// POST /api/age/:slug/confirm-email — paciente confirma email via token
router.post("/age/:slug/confirm-email", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const { token } = req.body as { token?: string };
  if (!token) { res.status(400).json({ error: "token obrigatório" }); return; }

  const [prof] = await db.select({ id: ageProfessionalsTable.id, nome: ageProfessionalsTable.nome, email: ageProfessionalsTable.email })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  const [patient] = await db.select()
    .from(agePatientsTable)
    .where(and(
      eq(agePatientsTable.professionalId, prof.id),
      eq(agePatientsTable.tokenConfirmacao, token),
    )).limit(1);

  if (!patient) { res.status(404).json({ error: "Link inválido ou já utilizado." }); return; }
  if (patient.tokenExpiraAt && patient.tokenExpiraAt < new Date()) {
    res.status(400).json({ error: "Link expirado. Solicite um novo cadastro." }); return;
  }
  if (patient.status !== "email_pendente") {
    res.json({ ok: true, status: patient.status, message: "Email já confirmado." }); return;
  }

  await db.update(agePatientsTable)
    .set({ status: "pendente_aprovacao", tokenConfirmacao: null, tokenExpiraAt: null, updatedAt: new Date() })
    .where(eq(agePatientsTable.id, patient.id));

  // Notificar profissional
  if (prof.email) {
    const profLink = `${FRONT_URL}/age/${slug}`;
    sendEmail(
      prof.email,
      `Age — Novo paciente aguardando aprovação: ${patient.nome}`,
      `Olá ${prof.nome},\n\n${patient.nome} (${patient.email}) confirmou o email e está aguardando sua aprovação.\n\nAcesse seu painel para aprovar ou recusar:\n${profLink}\n\n— SABIÁ`,
    ).catch(e => logger.error({ err: e }, "age: sendEmail notify prof"));
  }

  res.json({ ok: true, status: "pendente_aprovacao", message: "Email confirmado! Aguardando aprovação." });
});

// GET /api/age/:slug/patients (auth required)
router.get("/age/:slug/patients", requireAgeAuth, async (req, res): Promise<void> => {
  const { status } = req.query as Record<string, string | undefined>;
  const conditions = [eq(agePatientsTable.professionalId, req.session.ageProfessionalId!)];
  if (status && status !== "todos") conditions.push(eq(agePatientsTable.status, status));

  const rows = await db.select({
    id:           agePatientsTable.id,
    nome:         agePatientsTable.nome,
    email:        agePatientsTable.email,
    telefone:     agePatientsTable.telefone,
    status:       agePatientsTable.status,
    observacoesPro: agePatientsTable.observacoesPro,
    createdAt:    agePatientsTable.createdAt,
    updatedAt:    agePatientsTable.updatedAt,
  }).from(agePatientsTable).where(and(...conditions)).orderBy(agePatientsTable.createdAt);

  res.json(rows);
});

// PATCH /api/age/:slug/patients/:id (auth required) — aprovar/recusar/anotar
router.patch("/age/:slug/patients/:id", requireAgeAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id ?? "0", 10);
  const { status, observacoesPro } = req.body as { status?: string; observacoesPro?: string };

  const validStatus = ["aprovado", "recusado", "suspenso", "pendente_aprovacao"];
  if (status && !validStatus.includes(status)) {
    res.status(400).json({ error: "Status inválido" }); return;
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (status)             updates["status"]          = status;
  if (observacoesPro !== undefined) updates["observacoesPro"] = observacoesPro;

  const [updated] = await db.update(agePatientsTable)
    .set(updates as any)
    .where(and(eq(agePatientsTable.id, id), eq(agePatientsTable.professionalId, req.session.ageProfessionalId!)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Paciente não encontrado" }); return; }

  // Notificar paciente por email quando status muda
  if (status && updated.email) {
    const [prof] = await db.select({ slug: ageProfessionalsTable.slug, nome: ageProfessionalsTable.nome })
      .from(ageProfessionalsTable).where(eq(ageProfessionalsTable.id, req.session.ageProfessionalId!)).limit(1);
    const profNome = prof?.nome ?? "a profissional";

    if (status === "aprovado") {
      // Gerar token para o paciente criar sua senha
      const resetTok = randomUUID();
      const resetExp = new Date(Date.now() + 72 * 3600 * 1000); // 72h
      await db.update(agePatientsTable)
        .set({ resetToken: resetTok, resetTokenExpiraAt: resetExp } as any)
        .where(eq(agePatientsTable.id, updated.id));
      const setPasswordLink = `${FRONT_URL}/age/${prof?.slug}?set-password=${resetTok}`;
      sendEmail(
        updated.email,
        `Cadastro aprovado — crie sua senha para acessar a área do paciente`,
        `Olá ${updated.nome},\n\nSeu cadastro com ${profNome} foi aprovado!\n\nClique no link abaixo para criar sua senha e acessar sua área do paciente:\n\n${setPasswordLink}\n\nO link expira em 72 horas.\n\n— SABIÁ`,
      ).catch(e => logger.error({ err: e }, "age: sendEmail patient approved"));
    } else if (status === "recusado") {
      sendEmail(
        updated.email,
        `Age — Atualização do seu cadastro com ${profNome}`,
        `Olá ${updated.nome},\n\nSua solicitação não foi aprovada desta vez. Entre em contato para mais informações.\n\n— SABIÁ`,
      ).catch(e => logger.error({ err: e }, "age: sendEmail patient recusado"));
    } else if (status === "suspenso") {
      sendEmail(
        updated.email,
        `Age — Atualização do seu cadastro com ${profNome}`,
        `Olá ${updated.nome},\n\nSeu acesso foi temporariamente suspenso. Entre em contato para esclarecimentos.\n\n— SABIÁ`,
      ).catch(e => logger.error({ err: e }, "age: sendEmail patient suspenso"));
    }
  }

  res.json(updated);
});

// ─── Feed operacional ─────────────────────────────────────────────────────────

// GET /api/age/:slug/feed — log de eventos recentes (auth required)
router.get("/age/:slug/feed", requireAgeAuth, async (req, res): Promise<void> => {
  const { slug } = req.params;
  const limit = Math.min(Number(req.query["limit"] ?? 50), 100);

  const [prof] = await db.select({ id: ageProfessionalsTable.id })
    .from(ageProfessionalsTable)
    .where(eq(ageProfessionalsTable.slug, slug)).limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }
  if (req.session.ageProfessionalId !== prof.id) {
    res.status(403).json({ error: "Sem permissão" }); return;
  }

  // Últimos agendamentos com atividade (ordenados por updated_at)
  const appts = await db.execute(sql`
    SELECT
      'appointment' AS tipo,
      id::text,
      COALESCE(patient_nome, 'Paciente') AS titulo,
      status,
      canal,
      data_hora AS data_evento,
      updated_at AS ts,
      COALESCE(patient_email, '') AS email,
      lembrete48h_at IS NOT NULL AS lembrete48h_sent,
      lembrete24h_at IS NOT NULL AS lembrete24h_sent
    FROM age_appointments
    WHERE professional_id = ${prof.id}
    ORDER BY updated_at DESC
    LIMIT ${limit}
  `);

  // Últimos pacientes
  const pats = await db.execute(sql`
    SELECT
      'patient' AS tipo,
      id::text,
      nome AS titulo,
      status,
      NULL AS canal,
      created_at AS data_evento,
      updated_at AS ts,
      email,
      FALSE AS lembrete48h_sent,
      FALSE AS lembrete24h_sent
    FROM age_patients
    WHERE professional_id = ${prof.id}
    ORDER BY updated_at DESC
    LIMIT 20
  `);

  // Merge cronológico
  const merged = [...appts.rows, ...pats.rows].sort(
    (a, b) => new Date((b as Record<string, unknown>).ts as string).getTime()
            - new Date((a as Record<string, unknown>).ts as string).getTime()
  ).slice(0, limit);

  res.json(merged);
});

// ─── Auth do paciente ─────────────────────────────────────────────────────────

function requirePatientAuth(req: any, res: any, next: any) {
  if (!req.session?.agePatientId) {
    res.status(401).json({ error: "Área do paciente: faça login primeiro." });
    return;
  }
  next();
}

// POST /api/age/:slug/patients/auth/set-password — define senha pela 1ª vez (via token de aprovação)
router.post("/age/:slug/patients/auth/set-password", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password || password.length < 8) {
    res.status(400).json({ error: "token e password (mín. 8 chars) obrigatórios" }); return;
  }

  const [prof] = await db.select({ id: ageProfessionalsTable.id })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  const [patient] = await db.select().from(agePatientsTable)
    .where(and(
      eq(agePatientsTable.professionalId, prof.id),
      eq((agePatientsTable as any).resetToken, token),
    )).limit(1);

  if (!patient) { res.status(404).json({ error: "Link inválido ou já utilizado." }); return; }
  if ((patient as any).resetTokenExpiraAt && new Date((patient as any).resetTokenExpiraAt) < new Date()) {
    res.status(400).json({ error: "Link expirado. Solicite um novo link à profissional." }); return;
  }
  if (patient.status !== "aprovado") {
    res.status(403).json({ error: "Cadastro ainda não aprovado." }); return;
  }

  const hash = await bcrypt.hash(password, 12);
  await db.update(agePatientsTable)
    .set({ passwordHash: hash, resetToken: null, resetTokenExpiraAt: null, updatedAt: new Date() } as any)
    .where(eq(agePatientsTable.id, patient.id));

  req.session.agePatientId   = patient.id;
  req.session.agePatientSlug = slug;
  req.session.agePatientNome = patient.nome;
  await new Promise<void>((resolve, reject) =>
    req.session.save((err: unknown) => (err ? reject(err) : resolve())));

  res.json({ ok: true, nome: patient.nome });
});

// POST /api/age/:slug/patients/auth/login
router.post("/age/:slug/patients/auth/login", loginLimit, async (req, res): Promise<void> => {
  const { slug } = req.params;
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ error: "email e password obrigatórios" }); return; }

  const [prof] = await db.select({ id: ageProfessionalsTable.id })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  const [patient] = await db.select().from(agePatientsTable)
    .where(and(
      eq(agePatientsTable.professionalId, prof.id),
      eq(agePatientsTable.email, email.toLowerCase()),
    )).limit(1);

  if (!patient || !(patient as any).passwordHash) {
    res.status(401).json({ error: "Email ou senha incorretos." }); return;
  }
  if (patient.status !== "aprovado") {
    res.status(403).json({ error: "Cadastro não aprovado. Aguarde aprovação ou entre em contato." }); return;
  }

  const ok = await bcrypt.compare(password, (patient as any).passwordHash);
  if (!ok) { res.status(401).json({ error: "Email ou senha incorretos." }); return; }

  req.session.agePatientId   = patient.id;
  req.session.agePatientSlug = slug;
  req.session.agePatientNome = patient.nome;
  await new Promise<void>((resolve, reject) =>
    req.session.save((err: unknown) => (err ? reject(err) : resolve())));

  res.json({ ok: true, nome: patient.nome });
});

// GET /api/age/:slug/patients/auth/me
router.get("/age/:slug/patients/auth/me", (req, res) => {
  const { slug } = req.params;
  if (!req.session?.agePatientId || req.session.agePatientSlug !== slug) {
    res.json({ authenticated: false }); return;
  }
  res.json({ authenticated: true, id: req.session.agePatientId, nome: req.session.agePatientNome });
});

// POST /api/age/:slug/patients/auth/logout
router.post("/age/:slug/patients/auth/logout", (req, res) => {
  req.session.agePatientId   = undefined;
  req.session.agePatientSlug = undefined;
  req.session.agePatientNome = undefined;
  req.session.save(() => res.json({ ok: true }));
});

// POST /api/age/:slug/patients/auth/forgot-password
router.post("/age/:slug/patients/auth/forgot-password", loginLimit, async (req, res): Promise<void> => {
  const { slug } = req.params;
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "email obrigatório" }); return; }

  const [prof] = await db.select({ id: ageProfessionalsTable.id, nome: ageProfessionalsTable.nome })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }

  const [patient] = await db.select({ id: agePatientsTable.id, nome: agePatientsTable.nome, status: agePatientsTable.status })
    .from(agePatientsTable)
    .where(and(
      eq(agePatientsTable.professionalId, prof.id),
      eq(agePatientsTable.email, email.toLowerCase()),
    )).limit(1);

  // Resposta sempre neutra (não revelar se email existe)
  if (!patient || patient.status !== "aprovado") {
    res.json({ ok: true, message: "Se o email estiver cadastrado, você receberá um link em breve." }); return;
  }

  const tok = randomUUID();
  const exp = new Date(Date.now() + 2 * 3600 * 1000); // 2h
  await db.update(agePatientsTable)
    .set({ resetToken: tok, resetTokenExpiraAt: exp, updatedAt: new Date() } as any)
    .where(eq(agePatientsTable.id, patient.id));

  const link = `${FRONT_URL}/age/${slug}?set-password=${tok}`;
  sendEmail(
    email.toLowerCase(),
    `Age — Redefinir senha`,
    `Olá ${patient.nome},\n\nClique no link para redefinir sua senha:\n\n${link}\n\nVálido por 2 horas. Se não foi você, ignore.\n\n— SABIÁ`,
  ).catch(e => logger.error({ err: e }, "age: sendEmail forgot-password"));

  res.json({ ok: true, message: "Se o email estiver cadastrado, você receberá um link em breve." });
});

// POST /api/age/:slug/patients/auth/change-password (paciente logado)
router.post("/age/:slug/patients/auth/change-password", requirePatientAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "Senha atual e nova senha (mín. 8 chars) obrigatórias" }); return;
  }

  const [patient] = await db.select().from(agePatientsTable)
    .where(eq(agePatientsTable.id, req.session.agePatientId!)).limit(1);
  if (!patient || !(patient as any).passwordHash) { res.status(404).json({ error: "Paciente não encontrado" }); return; }

  const ok = await bcrypt.compare(currentPassword, (patient as any).passwordHash);
  if (!ok) { res.status(401).json({ error: "Senha atual incorreta." }); return; }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.update(agePatientsTable)
    .set({ passwordHash: hash, updatedAt: new Date() } as any)
    .where(eq(agePatientsTable.id, patient.id));

  res.json({ ok: true });
});

// GET /api/age/:slug/patients/my/appointments (paciente logado)
router.get("/age/:slug/patients/my/appointments", requirePatientAuth, async (req, res): Promise<void> => {
  const { slug } = req.params;

  const [prof] = await db.select({ id: ageProfessionalsTable.id, nome: ageProfessionalsTable.nome })
    .from(ageProfessionalsTable)
    .where(and(eq(ageProfessionalsTable.slug, slug!), eq(ageProfessionalsTable.ativa, true)))
    .limit(1);
  if (!prof) { res.status(404).json({ error: "Profissional não encontrada" }); return; }
  if (req.session.agePatientSlug !== slug) {
    res.status(403).json({ error: "Sem permissão" }); return;
  }

  // Buscar pelo email do paciente logado
  const [patient] = await db.select({ email: agePatientsTable.email })
    .from(agePatientsTable).where(eq(agePatientsTable.id, req.session.agePatientId!)).limit(1);
  if (!patient) { res.status(404).json({ error: "Paciente não encontrado" }); return; }

  const appts = await db.select({
    id:          ageAppointmentsTable.id,
    dataHora:    ageAppointmentsTable.dataHora,
    duracaoMin:  ageAppointmentsTable.duracaoMin,
    status:      ageAppointmentsTable.status,
    canal:       ageAppointmentsTable.canal,
    observacoes: ageAppointmentsTable.observacoes,
    cancelToken: (ageAppointmentsTable as any).cancelToken,
  }).from(ageAppointmentsTable)
    .where(and(
      eq(ageAppointmentsTable.professionalId, prof.id),
      eq(ageAppointmentsTable.patientEmail, patient.email),
    ))
    .orderBy(desc(ageAppointmentsTable.dataHora))
    .limit(50);

  res.json({ profNome: prof.nome, appointments: appts });
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
