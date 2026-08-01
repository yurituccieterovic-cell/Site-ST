import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type PgPool = InstanceType<typeof Pool>;
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _pool: PgPool | undefined;
let _db: DrizzleDb | undefined;

function resolvePool(): PgPool {
  if (!_pool) {
    const url = process.env["DATABASE_URL"];
    if (!url) throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
    const ssl = url.includes("neon.tech") || url.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined;
    _pool = new Pool({ connectionString: url, ssl });
  }
  return _pool;
}

function resolveDb(): DrizzleDb {
  if (!_db) _db = drizzle(resolvePool(), { schema });
  return _db;
}

// Lazy proxies — fail at first use, not at module load (allows server to boot without DATABASE_URL)
export const pool: PgPool = new Proxy({} as PgPool, {
  get(_t, prop) { return resolvePool()[prop as keyof PgPool]; },
});

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_t, prop) { return resolveDb()[prop as keyof DrizzleDb]; },
});

export * from "./schema";
