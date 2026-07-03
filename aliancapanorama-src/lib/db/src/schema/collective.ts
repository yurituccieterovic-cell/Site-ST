import { pgTable, uuid, varchar, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";

// Memória coletiva — convergência de MEKY (físico) + ISA (cognitivo) + humanos (estudo)
// Qualquer agente ou usuário pode postar; todos podem ler
export const collectiveMemory = pgTable("collective_memory", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Quem postou
  authorType: varchar("author_type", { length: 20 }).notNull(), // 'human' | 'meky' | 'isa'
  authorId: varchar("author_id", { length: 50 }).notNull(),     // user.id ou 'meky' ou 'isa'
  authorName: varchar("author_name", { length: 100 }).notNull(),

  // Conteúdo
  content: text("content").notNull(),
  nodeCode: varchar("node_code", { length: 20 }), // nó da árvore relacionado (opcional)
  tags: jsonb("tags"),                             // string[] — 'fauna', 'física', 'filosofia', etc.

  // Visibilidade e reações
  minTier: integer("min_tier").default(0).notNull(), // 0 = todos veem
  reactions: integer("reactions").default(0).notNull(),
});
