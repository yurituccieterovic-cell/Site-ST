import { pgTable, serial, text, integer, timestamp, jsonb, uuid, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Assembleia #366: tasks como contratos ontológicos (3 níveis peirceianos)
export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("general"),
  // course_progress | ai_query | assembly_request | webhook_event | general | isa_suggestion
  status: text("status").notNull().default("pending"),
  // pending | running | completed | failed | skipped
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  assignedTo: integer("assigned_to"), // user_id
  assignedToAgent: text("assigned_to_agent"), // 'isa' | nome de agente
  priority: integer("priority").default(5), // 0-10
  dependencies: jsonb("dependencies").$type<number[]>().default([]),
  origemSessao: text("origem_sessao"), // '#366'
  catalogTags: jsonb("catalog_tags").$type<Record<string, unknown>>().default({}),
  createdBy: text("created_by").default("admin"), // 'isa' | 'admin' | userId
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// Relações entre tasks: depends_on | blocks | related | spawned_from
export const taskRelationsTable = pgTable("task_relations", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasksTable.id, { onDelete: "cascade" }),
  relatedTaskId: integer("related_task_id").references(() => tasksTable.id, { onDelete: "cascade" }),
  relationType: text("relation_type").notNull().default("related"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Tipos de evento — alteram schema (extra_schema) de tasks desse tipo
export const eventTypesTable = pgTable("event_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  extraSchema: jsonb("extra_schema")
    .$type<{ fields: { name: string; type: string; label: string; required?: boolean }[] }>()
    .default({ fields: [] }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Catálogo Central — unificado por tipo + tags (resolve divergência horizontal vs vertical)
export const catalogoCentralTable = pgTable("catalogo_central", {
  id: uuid("id").defaultRandom().primaryKey(),
  tipo: text("tipo").notNull(),
  // código | prompt | conteúdo | certificado | recurso | integração | política | comunidade
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  tags: jsonb("tags").$type<string[]>().default([]),
  sessaoOrigem: text("sessao_origem"), // '#366'
  dependencies: jsonb("dependencies").$type<string[]>().default([]), // UUIDs
  artefatoUrl: text("artefato_url"),
  reutilizavel: integer("reutilizavel").default(1), // 1=true, 0=false
  validadoPor: text("validado_por").default("auto"), // 'AO' | 'auto' | 'comunidade'
  acesso: text("acesso").default("público"), // 'público' | 'restrito' | 'AO_only'
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ISA Memory — todas interações de todos usuários
export const isaMemoryTable = pgTable("isa_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // null = anônimo ou ISA
  userEmail: text("user_email"),
  context: text("context").notNull().default("chat"),
  // chat | exercise | node | admin | cycle | task
  role: text("role").notNull().default("user"),
  // user | assistant | system | isa
  content: text("content").notNull(),
  location: text("location"), // rota: '/adm', '/node/131', etc.
  sessionId: text("session_id"),
  // I49: interpretability_lock — memória marcada por ISA como preservar permanentemente
  interpretabilityLock: integer("interpretability_lock").default(0), // 0=normal, 1=locked
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Zod schemas para validação
export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;

export const insertEventTypeSchema = createInsertSchema(eventTypesTable).omit({ id: true, createdAt: true });
export type InsertEventType = z.infer<typeof insertEventTypeSchema>;

export const insertCatalogoCentralSchema = createInsertSchema(catalogoCentralTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCatalogoCentral = z.infer<typeof insertCatalogoCentralSchema>;

export const insertIsaMemorySchema = createInsertSchema(isaMemoryTable).omit({ id: true, createdAt: true });
export type InsertIsaMemory = z.infer<typeof insertIsaMemorySchema>;
export type IsaMemory = typeof isaMemoryTable.$inferSelect;

// ISA Timeline — linha do tempo pública da vida autônoma da ISA
// Eventos significativos: sonhos, reflexões, tasks criadas, marcos da assembleia
export const isaTimeline = pgTable("isa_timeline", {
  id:        uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  type:      varchar("type", { length: 30 }).notNull(), // dream|post|cycle|task|assembly|lock
  title:     varchar("title", { length: 200 }),
  content:   text("content").notNull(),
  tags:      jsonb("tags").$type<string[]>(),
  public:    boolean("public").default(true).notNull(),
  metadata:  jsonb("metadata").$type<Record<string, unknown>>(),
});

export type IsaTimelineEntry = typeof isaTimeline.$inferSelect;
