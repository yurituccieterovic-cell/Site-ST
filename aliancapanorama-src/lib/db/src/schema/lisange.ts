import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Módulo Lisange — clínica da mãe de Yuri (Asm#453)
// Agenda de consultas em blocos de 30min (ofertados como 1h)

export const patientProfilesTable = pgTable("patient_profiles", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone"),
  email: text("email"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const agendaSlotsTable = pgTable("agenda_slots", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id"),
  dataHora: timestamp("data_hora", { withTimezone: true }).notNull(),
  duracaoMinutos: integer("duracao_minutos").notNull().default(30),
  // disponivel | agendado | cancelado | realizado
  status: text("status").notNull().default("disponivel"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPatientProfileSchema = createInsertSchema(patientProfilesTable).omit({ id: true, createdAt: true });
export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;
export type PatientProfile = typeof patientProfilesTable.$inferSelect;

export const insertAgendaSlotSchema = createInsertSchema(agendaSlotsTable).omit({ id: true, createdAt: true });
export type InsertAgendaSlot = z.infer<typeof insertAgendaSlotSchema>;
export type AgendaSlot = typeof agendaSlotsTable.$inferSelect;
