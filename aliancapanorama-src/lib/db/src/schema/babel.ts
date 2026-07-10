import { pgTable, uuid, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const babelMemories = pgTable("babel_memories", {
  id:        uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  content:   text("content").notNull(),
  tags:      varchar("tags", { length: 200 }),
  source:    varchar("source", { length: 100 }).default("babel"),
  metadata:  jsonb("metadata"),
});
