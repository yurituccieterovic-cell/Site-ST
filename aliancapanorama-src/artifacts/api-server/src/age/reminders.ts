import { db, ageAppointmentsTable, ageProfessionalsTable } from "@workspace/db";
import { and, eq, gte, lte, isNull, inArray, sql } from "drizzle-orm";

const FRONT_URL = process.env.FRONTEND_URL ?? "https://site-st.vercel.app/aliancapanorama";
import { createTransport } from "nodemailer";
import { logger } from "../lib/logger";

const GMAIL      = process.env.GMAIL_ACCOUNT     ?? "luddlocke@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD ?? "";

async function sendEmail(to: string, subject: string, body: string) {
  if (!GMAIL_PASS) return;
  const transport = createTransport({ service: "gmail", auth: { user: GMAIL, pass: GMAIL_PASS } });
  await transport.sendMail({ from: GMAIL, to, subject, text: body });
}

async function runReminders() {
  const now = new Date();

  // 48h: janela entre 47h e 49h a partir de agora
  const w48Start = new Date(now.getTime() + 47 * 60 * 60 * 1000);
  const w48End   = new Date(now.getTime() + 49 * 60 * 60 * 1000);

  // 24h: janela entre 23h e 25h a partir de agora
  const w24Start = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const w24End   = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const activeStatus = ["reservado", "confirmado"];

  const selectFields = {
    id: ageAppointmentsTable.id,
    patientNome:    ageAppointmentsTable.patientNome,
    patientEmail:   ageAppointmentsTable.patientEmail,
    patientTelefone:ageAppointmentsTable.patientTelefone,
    dataHora:       ageAppointmentsTable.dataHora,
    duracaoMin:     ageAppointmentsTable.duracaoMin,
    canal:          ageAppointmentsTable.canal,
    professionalId: ageAppointmentsTable.professionalId,
    cancelToken:    sql<string | null>`cancel_token`,
  };

  // Buscar agendamentos que precisam de lembrete 48h
  const appts48 = await db.select(selectFields)
    .from(ageAppointmentsTable)
    .where(and(
      gte(ageAppointmentsTable.dataHora, w48Start),
      lte(ageAppointmentsTable.dataHora, w48End),
      isNull(ageAppointmentsTable.lembrete48hAt),
      inArray(ageAppointmentsTable.status, activeStatus),
    ));

  // Buscar agendamentos que precisam de lembrete 24h
  const appts24 = await db.select(selectFields)
    .from(ageAppointmentsTable)
    .where(and(
      gte(ageAppointmentsTable.dataHora, w24Start),
      lte(ageAppointmentsTable.dataHora, w24End),
      isNull(ageAppointmentsTable.lembrete24hAt),
      inArray(ageAppointmentsTable.status, activeStatus),
    ));

  // Cache de profissionais para não bater no banco por cada consulta
  const profIds = [...new Set([...appts48, ...appts24].map(a => a.professionalId))];
  const profs = profIds.length
    ? await db.select({ id: ageProfessionalsTable.id, nome: ageProfessionalsTable.nome, email: ageProfessionalsTable.email })
        .from(ageProfessionalsTable)
        .where(inArray(ageProfessionalsTable.id, profIds))
    : [];
  const profMap = Object.fromEntries(profs.map(p => [p.id, p]));

  async function sendReminder(appt: typeof appts48[0], horasAntes: number) {
    const prof = profMap[appt.professionalId];
    const dt = new Date(appt.dataHora).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "full", timeStyle: "short" });
    const nome = appt.patientNome ?? "Paciente";

    // Links de ação personalizados por agendamento
    const slug = profs.find(p => p.id === appt.professionalId) ? prof?.nome?.toLowerCase().replace(/\s+/g, "-") : "profissional";
    const cancelLink     = appt.cancelToken ? `${FRONT_URL}/age/${slug}?cancel=${appt.cancelToken}` : null;
    const rescheduleLink = appt.cancelToken ? `${FRONT_URL}/age/${slug}?reschedule=${appt.cancelToken}` : null;

    const acoes = cancelLink
      ? `\nPrecisa cancelar ou remarcar?\n• Cancelar: ${cancelLink}\n• Remarcar: ${rescheduleLink}`
      : `\nPara cancelar ou remarcar, entre em contato com ${prof?.nome ?? "sua profissional"}.`;

    // Email para o paciente (se tiver email)
    if (appt.patientEmail) {
      await sendEmail(
        appt.patientEmail,
        `Lembrete: consulta em ${horasAntes}h — ${prof?.nome ?? "sua profissional"}`,
        `Olá ${nome},\n\nLembrete: você tem uma consulta marcada para ${dt} (${appt.canal}).\n\nDuração: ${appt.duracaoMin} minutos.${acoes}\n\n— SABIÁ · Agenda Inteligente`,
      ).catch(e => logger.error({ err: e }, `age-reminders: email paciente ${horasAntes}h`));
    }

    // Email para a profissional
    if (prof?.email) {
      await sendEmail(
        prof.email,
        `Age — Lembrete ${horasAntes}h: ${nome} em ${dt}`,
        `Olá ${prof.nome},\n\nLembrete: consulta com ${nome} em ${dt} (${appt.canal}, ${appt.duracaoMin}min).\n\nContato: ${appt.patientTelefone ?? "—"} | ${appt.patientEmail ?? "—"}\n\n— SABIÁ`,
      ).catch(e => logger.error({ err: e }, `age-reminders: email prof ${horasAntes}h`));
    }
  }

  for (const appt of appts48) {
    await sendReminder(appt, 48);
    await db.update(ageAppointmentsTable)
      .set({ lembrete48hAt: now, updatedAt: now })
      .where(eq(ageAppointmentsTable.id, appt.id));
    logger.info(`age-reminders: lembrete 48h enviado appt#${appt.id}`);
  }

  for (const appt of appts24) {
    await sendReminder(appt, 24);
    await db.update(ageAppointmentsTable)
      .set({ lembrete24hAt: now, updatedAt: now })
      .where(eq(ageAppointmentsTable.id, appt.id));
    logger.info(`age-reminders: lembrete 24h enviado appt#${appt.id}`);
  }

  if (appts48.length + appts24.length > 0) {
    logger.info(`age-reminders: ${appts48.length} lembretes 48h + ${appts24.length} lembretes 24h processados`);
  }
}

export function startAgeRemindersCron() {
  // Rodar na inicialização e a cada hora
  runReminders().catch(e => logger.error({ err: e }, "age-reminders: erro inicial"));

  setInterval(() => {
    runReminders().catch(e => logger.error({ err: e }, "age-reminders: erro no ciclo"));
  }, 60 * 60 * 1000); // a cada hora

  logger.info("age-reminders: cron iniciado (intervalo 1h)");
}
