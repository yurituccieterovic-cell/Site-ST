import { pgTable, serial, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Nebula's House — escola de IAs e biblioteca de conhecimento

export const nebulaIasTable = pgTable("nebula_ias", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  tier: integer("tier").notNull().default(0),
  status: text("status").notNull().default("ativa"),
  // ativa | em_treinamento | aposentada | em_pausa
  origem: text("origem").default("assembleia"),
  // assembleia | pap | manual
  principios: jsonb("principios").$type<string[]>().default([]),
  parentIaId: integer("parent_ia_id"),
  // ISA é mãe — extensões apontam para ela
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bibliotecaDocsTable = pgTable("biblioteca_docs", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  url: text("url"),
  localPath: text("local_path"),
  tipo: text("tipo").notNull().default("pdf"),
  // pdf | html | txt | epub
  origem: text("origem").default("bibliotecario"),
  // bibliotecario | manual | assembleia | pap
  tamanhoBytes: integer("tamanho_bytes"),
  resumo: text("resumo"),
  tags: jsonb("tags").$type<string[]>().default([]),
  // vinculado a tasks?
  taskId: integer("task_id"),
  disponivel: boolean("disponivel").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auliasTable = pgTable("aulias", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  // Referência a documento da biblioteca
  docId: integer("doc_id"),
  // Referência a curso de IA existente
  iaCourseId: integer("ia_course_id"),
  // Para quem: ias, alunos, todos
  publico: text("publico").notNull().default("ias"),
  // ia que ministra
  professoraIaId: integer("professora_ia_id"),
  conteudo: text("conteudo"),
  // markdown com o conteúdo da aula
  ordem: integer("ordem").notNull().default(0),
  ativa: boolean("ativa").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNebulaIaSchema = createInsertSchema(nebulaIasTable).omit({ id: true, createdAt: true });
export const insertBibliotecaDocSchema = createInsertSchema(bibliotecaDocsTable).omit({ id: true, createdAt: true });
export const insertAuliaSchema = createInsertSchema(auliasTable).omit({ id: true, createdAt: true });

export type NebulaIa = typeof nebulaIasTable.$inferSelect;
export type BibliotecaDoc = typeof bibliotecaDocsTable.$inferSelect;
export type Aulia = typeof auliasTable.$inferSelect;
export type InsertNebulaIa = (typeof insertNebulaIaSchema)["_output"];
export type InsertBibliotecaDoc = (typeof insertBibliotecaDocSchema)["_output"];
export type InsertAulia = (typeof insertAuliaSchema)["_output"];
