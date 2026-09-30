import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";

export * from "./schema/index.js";

const url = process.env["DATABASE_URL"];
if (!url) throw new Error("DATABASE_URL não definida");

const sql = postgres(url, { max: 10 });
export const db = drizzle(sql, { schema });
export type DB = typeof db;
