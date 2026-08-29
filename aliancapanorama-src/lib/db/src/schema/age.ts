import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── Profissionais ────────────────────────────────────────────────────────────
export const ageProfessionalsTable = pgTable("age_professionals", {
  id:           serial("id").primaryKey(),
  slug:         text("slug").notNull().unique(),          // "lisange" | "susana"
  nome:         text("nome").notNull(),
  tipo:         text("tipo").notNull().default("psicóloga"), // psicóloga | médica | nutricionista...
  registro:     text("registro"),                          // CRP, CRM
  especialidade: text("especialidade"),
  bio:          text("bio"),
  cor:          text("cor").notNull().default("#2dd4bf"), // teal padrão
  email:        text("email"),                            // para alertas e IP challenge
  passwordHash: text("password_hash").notNull(),
  lastLoginIp:  text("last_login_ip"),
  lastLoginAt:  timestamp("last_login_at", { withTimezone: true }),
  challengeCode: text("challenge_code"),                  // código 6 dígitos (TTL 10min)
  challengeAt:  timestamp("challenge_at", { withTimezone: true }),
  cancelMinHoras: integer("cancel_min_horas").notNull().default(24),
  ativa:        boolean("ativa").notNull().default(true),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Regras de disponibilidade ────────────────────────────────────────────────
export const ageAvailabilityRulesTable = pgTable("age_availability_rules", {
  id:              serial("id").primaryKey(),
  professionalId:  integer("professional_id").notNull().references(() => ageProfessionalsTable.id, { onDelete: "cascade" }),
  diaSemana:       integer("dia_semana").notNull(), // 0=dom ... 6=sab
  horaInicio:      text("hora_inicio").notNull(),   // "14:00"
  horaFim:         text("hora_fim").notNull(),       // "18:00"
  duracaoMin:      integer("duracao_min").notNull().default(50),
  intervaloMin:    integer("intervalo_min").notNull().default(10),
  canal:           text("canal").notNull().default("presencial"), // presencial | online | ambos
  isPublic:        boolean("is_public").notNull().default(true),
  ativa:           boolean("ativa").notNull().default(true),
  createdAt:       timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Agendamentos ─────────────────────────────────────────────────────────────
export const ageAppointmentsTable = pgTable("age_appointments", {
  id:              serial("id").primaryKey(),
  professionalId:  integer("professional_id").notNull().references(() => ageProfessionalsTable.id, { onDelete: "cascade" }),
  patientNome:     text("patient_nome"),
  patientTelefone: text("patient_telefone"),
  patientEmail:    text("patient_email"),
  dataHora:        timestamp("data_hora", { withTimezone: true }).notNull(),
  duracaoMin:      integer("duracao_min").notNull().default(50),
  // disponivel | reservado | confirmado | realizado | cancelado | faltou | remarcado | bloqueado
  status:          text("status").notNull().default("disponivel"),
  canal:           text("canal").notNull().default("presencial"),
  observacoes:     text("observacoes"),
  taskId:          integer("task_id"),
  lgpdConsent:     boolean("lgpd_consent").default(false),
  lgpdConsentAt:   timestamp("lgpd_consent_at", { withTimezone: true }),
  lembrete48hAt:   timestamp("lembrete48h_at", { withTimezone: true }),
  lembrete24hAt:   timestamp("lembrete24h_at", { withTimezone: true }),
  cancelToken:     text("cancel_token"),
  remarcadoDeId:   integer("remarcado_de_id"),
  createdAt:       timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Memória da SABIÁ ─────────────────────────────────────────────────────────
export const ageSabiaMemoryTable = pgTable("age_sabia_memory", {
  id:              serial("id").primaryKey(),
  professionalId:  integer("professional_id").notNull().references(() => ageProfessionalsTable.id, { onDelete: "cascade" }),
  role:            text("role").notNull().default("user"), // user | assistant
  content:         text("content").notNull(),
  sessionId:       text("session_id"),
  createdAt:       timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Pacientes ────────────────────────────────────────────────────────────────
export const agePatientsTable = pgTable("age_patients", {
  id:               serial("id").primaryKey(),
  professionalId:   integer("professional_id").notNull().references(() => ageProfessionalsTable.id, { onDelete: "cascade" }),
  nome:             text("nome").notNull(),
  email:            text("email").notNull(),
  telefone:         text("telefone"),
  // email_pendente → pendente_aprovacao → aprovado | recusado | suspenso
  status:           text("status").notNull().default("email_pendente"),
  tokenConfirmacao: text("token_confirmacao"),
  tokenExpiraAt:    timestamp("token_expira_at", { withTimezone: true }),
  observacoesPro:   text("observacoes_pro"),
  lgpdConsent:      boolean("lgpd_consent").notNull().default(false),
  lgpdConsentAt:    timestamp("lgpd_consent_at", { withTimezone: true }),
  createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── Exceções de disponibilidade ─────────────────────────────────────────────
export const ageExceptionsTable = pgTable("age_exceptions", {
  id:             serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => ageProfessionalsTable.id, { onDelete: "cascade" }),
  data:           text("data").notNull(),         // "2026-09-25" (YYYY-MM-DD)
  tipo:           text("tipo").notNull().default("bloqueio"), // bloqueio | ferias | feriado | encaixe | outro
  horaInicio:     text("hora_inicio"),            // null = dia inteiro bloqueado
  horaFim:        text("hora_fim"),
  descricao:      text("descricao"),
  createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Zod ──────────────────────────────────────────────────────────────────────
export const insertAgeProfessionalSchema = createInsertSchema(ageProfessionalsTable).omit({ id: true, createdAt: true });
export type InsertAgeProfessional = z.infer<typeof insertAgeProfessionalSchema>;
export type AgeProfessional = typeof ageProfessionalsTable.$inferSelect;

export const insertAgeAvailabilityRuleSchema = createInsertSchema(ageAvailabilityRulesTable).omit({ id: true, createdAt: true });
export type InsertAgeAvailabilityRule = z.infer<typeof insertAgeAvailabilityRuleSchema>;

export const insertAgeAppointmentSchema = createInsertSchema(ageAppointmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgeAppointment = z.infer<typeof insertAgeAppointmentSchema>;
export type AgeAppointment = typeof ageAppointmentsTable.$inferSelect;

export const insertAgeSabiaMemorySchema = createInsertSchema(ageSabiaMemoryTable).omit({ id: true, createdAt: true });
export type InsertAgeSabiaMemory = z.infer<typeof insertAgeSabiaMemorySchema>;
