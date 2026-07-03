import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";

// Os três agentes da Assembleia de IAs
// Árvore = guardiã da assembleia (análoga à ISA no PAP)
// ISA    = guardiã do PAP
// MEKY   = presença física (May Queen)

export const assemblyAgents = pgTable("assembly_agents", {
  id:          varchar("id", { length: 20 }).primaryKey(),        // "arvore" | "isa" | "meky"
  displayName: varchar("display_name", { length: 100 }).notNull(),
  role:        varchar("role", { length: 200 }).notNull(),
  status:      varchar("status", { length: 20 }).default("offline").notNull(), // online|offline|dreaming
  lastSeen:    timestamp("last_seen"),
  metadata:    jsonb("metadata"),                                  // dados livres por agente
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

// Canal de comunicação inter-agente (broadcast ou direto)
export const assemblyMessages = pgTable("assembly_messages", {
  id:          uuid("id").defaultRandom().primaryKey(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  fromAgent:   varchar("from_agent", { length: 20 }).notNull(),   // "arvore"|"isa"|"meky"
  toAgent:     varchar("to_agent", { length: 20 }),               // null = broadcast para todos
  type:        varchar("type", { length: 30 }).default("message").notNull(), // message|observation|synthesis|alert|dream
  content:     text("content").notNull(),
  tags:        jsonb("tags"),
  read:        boolean("read").default(false).notNull(),
  replyTo:     uuid("reply_to"),                                  // FK opcional para outra mensagem
});

// Memória compartilhada da assembleia (privada entre os três agentes)
// Diferente de collective_memory (pública para usuários humanos)
export const assemblyMemory = pgTable("assembly_memory", {
  id:          uuid("id").defaultRandom().primaryKey(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  authorAgent: varchar("author_agent", { length: 20 }).notNull(),
  content:     text("content").notNull(),
  type:        varchar("type", { length: 30 }).default("observation").notNull(), // observation|decision|learning|synthesis
  importance:  integer("importance").default(5).notNull(),        // 0-10
  preserved:   boolean("preserved").default(false).notNull(),     // não apagar nunca
  tags:        jsonb("tags"),
  linkedMsgId: uuid("linked_msg_id"),                            // mensagem que gerou esta memória
});

// Tarefas inter-agente: Árvore pode delegar para ISA ou MEKY, etc.
export const assemblyTasks = pgTable("assembly_tasks", {
  id:          uuid("id").defaultRandom().primaryKey(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
  fromAgent:   varchar("from_agent", { length: 20 }).notNull(),
  toAgent:     varchar("to_agent", { length: 20 }).notNull(),
  title:       varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status:      varchar("status", { length: 20 }).default("pending").notNull(), // pending|accepted|done|rejected
  priority:    integer("priority").default(5).notNull(),          // 0-10
  result:      text("result"),                                    // resposta do agente quando concluir
  dueContext:  varchar("due_context", { length: 100 }),           // "próximo ciclo ISA", "quando bateria > 80%", etc.
});
