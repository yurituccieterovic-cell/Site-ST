import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// ─── Projetos ─────────────────────────────────────────────────────────────────
export const pvProjectsTable = pgTable("pv_projects", {
  id:          uuid("id").primaryKey().defaultRandom(),
  title:       text("title").notNull(),
  description: text("description"),
  domain:      text("domain").notNull().default("producao_cultural"),
  // active | paused | completed | archived
  status:      text("status").notNull().default("active"),
  // Proveniência
  createdBy:   integer("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  sourceRef:   text("source_ref"),   // "assembleia_632" | "#pap sessao X"
  confidence:  integer("confidence").default(80), // 0-100
  // Lifecycle
  createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt:   timestamp("deleted_at", { withTimezone: true }), // soft delete
});

// ─── Itens do projeto (entidade genérica) ─────────────────────────────────────
export const pvItemsTable = pgTable("pv_items", {
  id:          uuid("id").primaryKey().defaultRandom(),
  projectId:   uuid("project_id").notNull().references(() => pvProjectsTable.id, { onDelete: "cascade" }),
  // task | event | milestone | resource | decision | document | person | risk
  type:        text("type").notNull().default("task"),
  title:       text("title").notNull(),
  description: text("description"),
  // Hierarquia (subtarefas)
  parentId:    uuid("parent_id"),  // auto-referência — FK criada via bootstrap SQL
  depthLevel:  integer("depth_level").notNull().default(0),
  // Status e prioridade
  // pending | in_progress | completed | blocked | cancelled
  status:      text("status").notNull().default("pending"),
  priority:    integer("priority").notNull().default(5), // 0-10
  // Datas contextuais
  startsAt:    timestamp("starts_at", { withTimezone: true }),
  endsAt:      timestamp("ends_at", { withTimezone: true }),
  dueAt:       timestamp("due_at", { withTimezone: true }),
  // Extensibilidade sem migração de schema
  payload:     jsonb("payload").default({}),
  // Proveniência
  createdBy:   integer("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  sourceRef:   text("source_ref"),
  confidence:  integer("confidence").default(80),
  // Lifecycle
  createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).defaultNow(),
  deletedAt:   timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relações entre itens (grafo tipado) ─────────────────────────────────────
export const pvItemRelationsTable = pgTable("pv_item_relations", {
  id:            uuid("id").primaryKey().defaultRandom(),
  itemId:        uuid("item_id").notNull().references(() => pvItemsTable.id, { onDelete: "cascade" }),
  relatedItemId: uuid("related_item_id").notNull().references(() => pvItemsTable.id, { onDelete: "cascade" }),
  // depends_on | blocks | related | spawned_from | part_of | conflicts_with
  relationType:  text("relation_type").notNull().default("related"),
  createdBy:     integer("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Histórico de alterações (event sourcing) ─────────────────────────────────
export const pvItemEventsTable = pgTable("pv_item_events", {
  id:              uuid("id").primaryKey().defaultRandom(),
  itemId:          uuid("item_id").notNull().references(() => pvItemsTable.id, { onDelete: "cascade" }),
  projectId:       uuid("project_id").notNull().references(() => pvProjectsTable.id, { onDelete: "cascade" }),
  // created | updated | deleted | related | status_changed | moved
  action:          text("action").notNull(),
  fieldName:       text("field_name"),
  oldValue:        jsonb("old_value"),
  newValue:        jsonb("new_value"),
  reason:          text("reason"),
  changedByUser:   integer("changed_by_user").references(() => usersTable.id, { onDelete: "set null" }),
  changedByAgent:  text("changed_by_agent"), // 'isa' | 'claudio' | 'dodge'
  sourceRef:       text("source_ref"),
  createdAt:       timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type PvProject = typeof pvProjectsTable.$inferSelect;
export type PvItem    = typeof pvItemsTable.$inferSelect;
export type PvRelation = typeof pvItemRelationsTable.$inferSelect;
export type PvEvent   = typeof pvItemEventsTable.$inferSelect;
