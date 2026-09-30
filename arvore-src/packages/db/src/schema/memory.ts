import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { aoUsersTable } from "./auth.js";
import { aoConversationsTable } from "./chat.js";

// Memórias estruturadas — separadas do histórico bruto
// category: fact | preference | event | reflection | learning | assembleia
// visibility: private | public
export const aoMemoriesTable = pgTable("ao_memories", {
  id:             serial("id").primaryKey(),
  userId:         integer("user_id").references(() => aoUsersTable.id, { onDelete: "cascade" }),
  conversationId: integer("conversation_id").references(() => aoConversationsTable.id, { onDelete: "set null" }),
  category:       text("category").notNull().default("fact"),
  visibility:     text("visibility").notNull().default("private"),
  content:        text("content").notNull(),
  origin:         text("origin"),     // "assembleia" | "conversa" | "importação" | "manual"
  originRef:      text("origin_ref"), // ex: "assembleia:741"
  validUntil:     timestamp("valid_until", { withTimezone: true }),
  tags:           jsonb("tags").$type<string[]>().default([]),
  createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Estado do circuit breaker por provedor
export const aoCircuitBreakerTable = pgTable("ao_circuit_breakers", {
  id:             serial("id").primaryKey(),
  provider:       text("provider").notNull().unique(),
  state:          text("state").notNull().default("closed"),  // closed | open | half-open
  failCount:      integer("fail_count").notNull().default(0),
  successCount:   integer("success_count").notNull().default(0),
  lastFailAt:     timestamp("last_fail_at", { withTimezone: true }),
  lastSuccessAt:  timestamp("last_success_at", { withTimezone: true }),
  cooldownUntil:  timestamp("cooldown_until", { withTimezone: true }),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Métricas de chamadas para o painel admin
export const aoProviderMetricsTable = pgTable("ao_provider_metrics", {
  id:          serial("id").primaryKey(),
  provider:    text("provider").notNull(),
  model:       text("model").notNull(),
  success:     boolean("success").notNull(),
  latencyMs:   integer("latency_ms"),
  tokensIn:    integer("tokens_in"),
  tokensOut:   integer("tokens_out"),
  errorCode:   text("error_code"),
  recordedAt:  timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
});
