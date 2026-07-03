import { pgTable, uuid, varchar, jsonb, timestamp, text, integer } from "drizzle-orm/pg-core";

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
