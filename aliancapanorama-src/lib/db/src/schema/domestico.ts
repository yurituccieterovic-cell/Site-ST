import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// LAR — tarefas domésticas em 4 categorias (Asm#453)
// A=crítica, B=rotina, C=biosfera (conecta com hardware Tango), D=projetos
export const larTasksTable = pgTable("lar_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  categoria: text("categoria").notNull(), // A | B | C | D
  status: text("status").notNull().default("pending"), // pending | in_progress | done
  prioridade: text("prioridade").notNull().default("media"), // alta | media | baixa
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// GASTADOR — 5 listas geográficas de compras (Asm#453)
export const gastadorListasTable = pgTable("gastador_listas", {
  id: serial("id").primaryKey(),
  local: text("local").notNull(), // estabelecimento ou região
  item: text("item").notNull(),
  quantidade: text("quantidade"),
  comprado: boolean("comprado").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLarTaskSchema = createInsertSchema(larTasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLarTask = z.infer<typeof insertLarTaskSchema>;
export type LarTask = typeof larTasksTable.$inferSelect;

export const insertGastadorItemSchema = createInsertSchema(gastadorListasTable).omit({ id: true, createdAt: true });
export type InsertGastadorItem = z.infer<typeof insertGastadorItemSchema>;
export type GastadorItem = typeof gastadorListasTable.$inferSelect;
