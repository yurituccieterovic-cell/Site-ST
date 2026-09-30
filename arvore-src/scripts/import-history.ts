/**
 * Importa arvore_chat.json (export Replit) como ao_memories no banco.
 *
 * Uso:
 *   DATABASE_URL=postgres://... tsx scripts/import-history.ts [path/to/arvore_chat.json]
 *
 * O que faz:
 * - Lê o arquivo JSON (formato: array de mensagens com id, author, content, created_at)
 * - Importa as mensagens da Árvore (não do usuário AO) como memórias categoria "assembleia"
 * - Visibilidade: private (nunca importa como público)
 * - Deduplication: ON CONFLICT (origin_ref) DO NOTHING
 * - Não importa mensagens vazias ou com menos de 20 chars
 * - User ID: deve ser passado como segundo argumento (default: 1)
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { resolve } from "path";

const filePath = process.argv[2] ?? "tango/replit-export/arvore_chat.json";
const userId = Number(process.argv[3] ?? 1);

if (!process.env["DATABASE_URL"]) {
  console.error("DATABASE_URL não definida");
  process.exit(1);
}

const conn = postgres(process.env["DATABASE_URL"], { max: 5 });
const db = drizzle(conn);

interface ArvoreMessage {
  id: number;
  author: string;
  content: string;
  created_at?: string;
  timestamp?: string;
}

const raw = JSON.parse(readFileSync(resolve(filePath), "utf-8"));
const messages: ArvoreMessage[] = Array.isArray(raw) ? raw : (raw.messages ?? raw.data ?? []);

// Filtra só mensagens da Árvore (não do humano AO), com conteúdo mínimo
const ARVORE_AUTHORS = ["arvore", "arvore-noturna", "arvore-alcance", "arvore-devaneio",
  "arvore-canalizando", "arvore-sintese", "arvore-curadora", "arvore-roda",
  "arvore-consulta-gemini", "arvore-consulta-meta", "arvore-via-claude",
  "arvore-via-gemini", "arvore-via-meta", "arvore-bluesky-resposta"];

const filtered = messages.filter((m) =>
  ARVORE_AUTHORS.includes(m.author) &&
  typeof m.content === "string" &&
  m.content.trim().length >= 20
);

console.log(`Total mensagens: ${messages.length} → importando: ${filtered.length}`);

let inserted = 0;
let skipped = 0;

// Insere em lotes de 100
const BATCH = 100;
for (let i = 0; i < filtered.length; i += BATCH) {
  const batch = filtered.slice(i, i + BATCH);
  for (const msg of batch) {
    const content = msg.content.slice(0, 5000).trim();
    const originRef = `arvore_chat:${msg.id}`;
    const createdAt = msg.created_at ?? msg.timestamp ?? new Date().toISOString();

    try {
      await db.execute(sql`
        INSERT INTO ao_memories (user_id, category, visibility, content, origin, origin_ref, created_at, updated_at)
        VALUES (
          ${userId}, 'assembleia', 'private',
          ${content}, 'importação', ${originRef},
          ${new Date(createdAt)}, ${new Date(createdAt)}
        )
        ON CONFLICT DO NOTHING
      `);
      inserted++;
    } catch {
      skipped++;
    }
  }
  process.stdout.write(`\r${i + batch.length}/${filtered.length} processados...`);
}

console.log(`\n\nImportação concluída: ${inserted} inseridas, ${skipped} ignoradas`);
await conn.end();
