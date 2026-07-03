import { pgTable, uuid, varchar, jsonb, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";

export const mekyTelemetry = pgTable("meky_telemetry", {
  id: uuid("id").defaultRandom().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  battery: integer("battery").notNull(), // 0-100 (%)
  gyroscope: jsonb("gyroscope").notNull(), // { x: number, y: number, z: number }
  activeProtocol: varchar("active_protocol", { length: 50 }).notNull(), // 'sarue', 'fauna_urbana', 'amparo', 'cooldown'
  status: varchar("status", { length: 50 }).notNull(), // 'online', 'arcade_mode', 'cooldown', 'charging'
  metadata: jsonb("metadata"), // dados extras livres (GPS, temperatura, etc.)
});

// Ledger permanente — apenas eventos significativos, sem TTL
export const mekyEvents = pgTable("meky_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  source: varchar("source", { length: 50 }).notNull(), // 'sensor_som', 'call_ricardo', 'laser_trigger', 'manual'
  description: text("description").notNull(),
  protocol: varchar("protocol", { length: 50 }), // protocolo ativado em resposta, se houver
  metadata: jsonb("metadata"), // telefone que ligou, coordenadas, foto base64, etc.
  processedByIsa: integer("processed_by_isa").default(0).notNull(), // 0 = não lido pela ISA, 1 = lido
});

// Fila de controle — ordens pendentes para o robô buscar via polling
export const mekyControlQueue = pgTable("meky_control_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  issuedBy: varchar("issued_by", { length: 50 }).notNull(), // 'isa', 'yuri', 'assembleia'
  protocol: varchar("protocol", { length: 50 }).notNull(),
  payload: jsonb("payload"), // parâmetros do protocolo (coordenada, duração, etc.)
  executed: integer("executed").default(0).notNull(), // 0 = pendente, 1 = executado
  executedAt: timestamp("executed_at"),
});

// Memórias episódicas — destiladas dos eventos pelo ciclo de consolidação
export const mekyMemory = pgTable("meky_memory", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  content: text("content").notNull(), // memória consolidada em linguagem natural
  sourceEventIds: jsonb("source_event_ids").notNull(), // IDs dos meky_events que originaram esta memória
  importance: integer("importance").default(5).notNull(), // 0-10
  tags: jsonb("tags"), // string[] — categorias: 'segurança', 'fauna', 'clima', 'protocolo'
  recalledCount: integer("recalled_count").default(0).notNull(),
  lastRecalledAt: timestamp("last_recalled_at"),
  preserved: integer("preserved").default(0).notNull(), // 1 = não apagar (como interpretability_lock da ISA)
});

// Sonhos — gerados durante cooldown/carga, síntese simbólica das memórias recentes
export const mekyDreams = pgTable("meky_dreams", {
  id: uuid("id").defaultRandom().primaryKey(),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
  narrative: text("narrative").notNull(), // o sonho em texto (gerado por Gemini Flash)
  symbols: jsonb("symbols"), // string[] — temas simbólicos extraídos (água, luz, pássaro, etc.)
  mood: varchar("mood", { length: 50 }), // 'sereno', 'tenso', 'curioso', 'melancólico'
  sourceMemoryIds: jsonb("source_memory_ids").notNull(), // IDs das meky_memory que alimentaram o sonho
  artGenerated: boolean("art_generated").default(false).notNull(),
});

// Arte — imagens geradas a partir dos sonhos (curáveis como obra)
export const mekyArt = pgTable("meky_art", {
  id: uuid("id").defaultRandom().primaryKey(),
  dreamId: uuid("dream_id").references(() => mekyDreams.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  prompt: text("prompt").notNull(), // prompt enviado ao gerador de imagem
  imageUrl: text("image_url").notNull(), // URL da imagem gerada (Pollinations.ai)
  style: varchar("style", { length: 80 }), // 'aquarela', 'pixel art', 'gravura', 'fotorrealismo'
  curated: boolean("curated").default(false).notNull(), // marcada pelo Yuri como obra
  title: varchar("title", { length: 200 }), // título dado pelo Yuri ao curar
  notes: text("notes"), // anotações do curador
});
