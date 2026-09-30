import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { aoUsersTable } from "./auth.js";

export const aoConversationsTable = pgTable("ao_conversations", {
  id:          serial("id").primaryKey(),
  userId:      integer("user_id").notNull().references(() => aoUsersTable.id, { onDelete: "cascade" }),
  title:       text("title").notNull().default("Nova conversa"),
  isPublic:    boolean("is_public").notNull().default(false),
  archivedAt:  timestamp("archived_at", { withTimezone: true }),
  createdAt:   timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// role: user | assistant | system | error
// status: pending | streaming | done | failed | interrupted
export const aoMessagesTable = pgTable("ao_messages", {
  id:             serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => aoConversationsTable.id, { onDelete: "cascade" }),
  clientId:       text("client_id"),     // idempotência — cliente gera UUID antes de enviar
  role:           text("role").notNull(),
  content:        text("content").notNull().default(""),
  status:         text("status").notNull().default("done"),
  provider:       text("provider"),      // groq | gemini | cloudflare | openrouter
  model:          text("model"),
  voice:          text("voice"),         // veloz | expansiva | minima | livre
  tokensIn:       integer("tokens_in"),
  tokensOut:      integer("tokens_out"),
  errorCode:      text("error_code"),
  errorMessage:   text("error_message"),
  createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
