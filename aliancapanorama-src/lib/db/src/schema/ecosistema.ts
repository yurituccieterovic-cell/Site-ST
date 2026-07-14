import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";

// Memória unificada do ecossistema — qualquer IA escreve aqui
export const ecosistemaMemory = pgTable("ecosistema_memory", {
  id:          uuid("id").defaultRandom().primaryKey(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  authorIa:    varchar("author_ia", { length: 64 }).notNull(),        // "isa" | "socoboy" | "claudio-code" | etc
  type:        varchar("type", { length: 30 }).default("conversa").notNull(), // conversa|md|workflow|etica|signo|dado
  content:     text("content").notNull(),
  tags:        jsonb("tags").default([]),
  signo:       jsonb("signo"),   // {representamen, objeto, interpretante}
  importance:  integer("importance").default(5).notNull(),             // 0-10
  visibility:  varchar("visibility", { length: 20 }).default("all").notNull(), // all|private|system
});

// Conversas IA↔IA (máximo 10 turnos, geradas automaticamente via Gemini)
export const iaConversations = pgTable("ia_conversations", {
  id:            uuid("id").defaultRandom().primaryKey(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  completedAt:   timestamp("completed_at"),
  initiatorIa:   varchar("initiator_ia", { length: 64 }).notNull(),
  targetIa:      varchar("target_ia", { length: 64 }).notNull(),
  memoryRef:     uuid("memory_ref"),    // memória que disparou a conversa (opcional)
  topic:         text("topic").notNull(),
  status:        varchar("status", { length: 20 }).default("active").notNull(), // active|completed|archived
  turnCount:     integer("turn_count").default(0).notNull(),
  consolidated:  boolean("consolidated").default(false).notNull(),     // true = virou dado no ecosistema_memory
  dadoId:        uuid("dado_id"),       // FK para ecosistema_memory tipo 'dado' gerado na consolidação
});

// Turnos individuais das conversas IA↔IA
export const iaConversationTurns = pgTable("ia_conversation_turns", {
  id:             uuid("id").defaultRandom().primaryKey(),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  conversationId: uuid("conversation_id").notNull(),
  speakerIa:      varchar("speaker_ia", { length: 64 }).notNull(),
  content:        text("content").notNull(),
  turnNumber:     integer("turn_number").notNull(),
});
