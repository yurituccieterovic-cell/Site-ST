import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const aoUsersTable = pgTable("ao_users", {
  id:           serial("id").primaryKey(),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName:  text("display_name"),
  isAdmin:      boolean("is_admin").notNull().default(false),
  isActive:     boolean("is_active").notNull().default(true),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt:  timestamp("last_login_at", { withTimezone: true }),
});

export const aoSessionsTable = pgTable("ao_sessions", {
  sid:    text("sid").primaryKey(),
  sess:   text("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true }).notNull(),
});

export const aoRateLimitTable = pgTable("ao_rate_limits", {
  id:        serial("id").primaryKey(),
  key:       text("key").notNull().unique(),
  count:     integer("count").notNull().default(0),
  windowEnd: timestamp("window_end", { withTimezone: true }).notNull(),
});
