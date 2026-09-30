import { db } from "@arvore/db";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function bootstrap() {
  // Cria todas as tabelas se não existirem (para deploy sem rodar migrações manualmente)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ao_users (
      id            SERIAL PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name  TEXT,
      is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
      is_active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ao_sessions (
      sid    TEXT PRIMARY KEY,
      sess   TEXT NOT NULL,
      expire TIMESTAMPTZ NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS ao_sessions_expire_idx ON ao_sessions (expire)
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ao_conversations (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES ao_users(id) ON DELETE CASCADE,
      title       TEXT NOT NULL DEFAULT 'Nova conversa',
      is_public   BOOLEAN NOT NULL DEFAULT FALSE,
      archived_at TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ao_messages (
      id              SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES ao_conversations(id) ON DELETE CASCADE,
      client_id       TEXT,
      role            TEXT NOT NULL,
      content         TEXT NOT NULL DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'done',
      provider        TEXT,
      model           TEXT,
      voice           TEXT,
      tokens_in       INTEGER,
      tokens_out      INTEGER,
      error_code      TEXT,
      error_message   TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ao_messages_client_id_idx
    ON ao_messages (conversation_id, client_id)
    WHERE client_id IS NOT NULL
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ao_memories (
      id              SERIAL PRIMARY KEY,
      user_id         INTEGER REFERENCES ao_users(id) ON DELETE CASCADE,
      conversation_id INTEGER REFERENCES ao_conversations(id) ON DELETE SET NULL,
      category        TEXT NOT NULL DEFAULT 'fact',
      visibility      TEXT NOT NULL DEFAULT 'private',
      content         TEXT NOT NULL,
      origin          TEXT,
      origin_ref      TEXT,
      valid_until     TIMESTAMPTZ,
      tags            JSONB DEFAULT '[]',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ao_circuit_breakers (
      id            SERIAL PRIMARY KEY,
      provider      TEXT NOT NULL UNIQUE,
      state         TEXT NOT NULL DEFAULT 'closed',
      fail_count    INTEGER NOT NULL DEFAULT 0,
      success_count INTEGER NOT NULL DEFAULT 0,
      last_fail_at  TIMESTAMPTZ,
      last_success_at TIMESTAMPTZ,
      cooldown_until TIMESTAMPTZ,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ao_provider_metrics (
      id          SERIAL PRIMARY KEY,
      provider    TEXT NOT NULL,
      model       TEXT NOT NULL,
      success     BOOLEAN NOT NULL,
      latency_ms  INTEGER,
      tokens_in   INTEGER,
      tokens_out  INTEGER,
      error_code  TEXT,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Índice para queries de métricas por provedor/tempo
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS ao_provider_metrics_provider_idx
    ON ao_provider_metrics (provider, recorded_at DESC)
  `);

  // Admin inicial se não existir
  const adminEmail = process.env["ADMIN_EMAIL"];
  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (adminEmail && adminPassword) {
    const existing = await db.execute(sql`SELECT id FROM ao_users WHERE email = ${adminEmail} LIMIT 1`);
    if ((existing as any).rowCount === 0) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await db.execute(sql`
        INSERT INTO ao_users (email, password_hash, display_name, is_admin)
        VALUES (${adminEmail}, ${hash}, 'Admin', TRUE)
        ON CONFLICT DO NOTHING
      `);
      console.log(`[bootstrap] Admin criado: ${adminEmail}`);
    }
  }

  console.log("[bootstrap] Tabelas ao_* OK");
}
