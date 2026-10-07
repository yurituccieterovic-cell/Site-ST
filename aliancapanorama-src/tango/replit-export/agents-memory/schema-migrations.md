---
name: schema migrations (drizzle push quirk + prod DB)
description: How to add a new DB table in this repo without drizzle-kit push hanging, and the prod-DB caveat on deploy.
---

# Adding a new table

`pnpm --filter @workspace/db run push` (drizzle-kit push) can **hang on an interactive prompt** when the live DB has drift unrelated to your change. Observed: it stops asking whether to truncate `app_users` to add a `app_users_email_unique` constraint. The bash tool can't answer interactive prompts, so the push neither applies your table nor exits cleanly.

**How to apply a new table:** define the schema file under `lib/db/src/schema/` + re-export in `schema/index.ts` (keeps the repo source of truth), then create the table directly with `psql "$DATABASE_URL"` using `CREATE TABLE IF NOT EXISTS ...` matching the Drizzle columns. Surgical, avoids touching unrelated tables.

**Why:** drizzle push diffs the *entire* schema vs the live DB; any accumulated drift surfaces as a blocking prompt.

# Production DB caveat

`push` is manual and dev-only. Schema novo deve ser aplicado por ALTER/CREATE idempotente no boot (em index.ts) e/ou psql direto. Features que leem tabela nova devem degradar gracioso (try/catch → vazio). Confirmar com Yuri antes de mexer em prod (ele quer email antes de republish).

# Deploy espelha o schema FÍSICO do banco de DEV → cuidado com objetos exóticos

**Regra dura:** o publish roda uma migração de schema que ESPELHA o banco de DEV no de PROD (gera CREATE a partir do que existe fisicamente no dev DB). Essa ferramenta NÃO reproduz classes de operador / objetos não-padrão. Um índice `USING gin (content gin_trgm_ops)` criado no dev DB vira `CREATE INDEX ... USING gin ("content")` (sem a classe) no deploy e o Postgres rejeita ("data type text has no default operator class for access method gin") — o publish inteiro falha.

**Why:** o espelhamento introspecta o dev DB e regenera DDL perdendo detalhes que precisam de extensão/operator class (pg_trgm, etc.). Não importa que o replit.md diga "prod não migra no deploy" — esse espelhamento roda mesmo assim.

**How to apply:** objetos de DB exóticos (índice com operator class, extensões, tipos custom) NÃO podem viver no banco de DEV. Crie-os SÓ no boot de produção (`if (process.env.NODE_ENV !== "production") return;` antes do DDL) e mantenha o dev DB limpo (dropar o objeto se já existir lá). Assim o deploy não tem o que espelhar e o boot de prod cria com a classe correta. Em dev, o caminho lento (scan sequencial) é aceitável.
