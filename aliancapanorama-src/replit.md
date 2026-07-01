# PAP — Projeto Aliança Panorama

Gamified educational platform for FUVEST (Brazilian university entrance exam) preparation, featuring a hierarchical knowledge tree, spaceship cockpit dashboard, AI-generated exercises, achievement system, notes, heatmap calendar, and Isa the AI owl mascot.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/pap run dev` — run the React frontend (port 18434, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`
- Optional env (PayPal): `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` — REST API credentials from developer.paypal.com (Live or Sandbox; auto-detected). `PAYPAL_WEBHOOK_ID` — webhook ID from the PayPal app dashboard (Webhooks section), required for the `/api/paypal/webhook` listener to verify signatures and auto-downgrade users who cancel on PayPal. Stripe is via Replit connector (no env needed).

### PayPal webhook setup

1. In the PayPal Developer Dashboard, open your REST app → Webhooks → Add Webhook.
2. Webhook URL: `https://projetoaliancapanoramapap.replit.app/api/paypal/webhook` (or your custom domain).
3. Subscribe to events: `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.EXPIRED`, `BILLING.SUBSCRIPTION.SUSPENDED` (others are accepted but ignored).
4. Copy the generated Webhook ID and set it as the `PAYPAL_WEBHOOK_ID` env var.
5. The handler verifies signatures via PayPal's `/v1/notifications/verify-webhook-signature` API and downgrades any user whose `paypal_subscription_id` matches the cancelled subscription back to tier 1.

### Production deployment target: Replit Deployments

**Replit Deployments is the canonical production target** for the full app (frontend + Express API + Postgres + sessions). To publish, click the Publish button in the Replit workspace (this must be done from the main agent — task agents cannot trigger publishes). Both artifacts are pre-configured under `.replit-artifact/artifact.toml`:

- `artifacts/api-server`: builds `pap` (Vite) + `api-server` (esbuild bundle), runs `node dist/index.mjs` on port 8080, health-checked at `/api/healthz`. Serves all `/api/*` routes including session auth, exercises, Stripe, PayPal.
- `artifacts/pap`: static serve of `dist/public` for the React SPA at `/`.
- The shared Replit proxy routes `/api/*` to the API server and everything else to the static frontend, so a single published deployment serves the whole product.

**Vercel as a thin proxy to Replit.** The wired-up Vercel project (`pap-tan-seven.vercel.app`, auto-rebuilds on push to GitHub `main`) cannot host the Express API directly — Vercel only runs static sites + serverless functions, but the API uses Express 5 with `express-session` (memory store), bcrypt, long-lived `pg` pool connections, polling-based social chat, and Stripe webhook handlers that require raw-body middleware ordered before `express.json()`. Porting to serverless would require splitting every route into an `api/*.ts` function, replacing the in-memory session store with cookie/Redis sessions, and re-engineering the webhook raw-body handling.

Instead, `vercel.json` configures Vercel as a **server-side reverse proxy that rewrites every path** (`/(.*)`) to the Replit deployment at `https://projetoaliancapanoramapap.replit.app/$1`. This means visiting `pap-tan-seven.vercel.app` serves the full working app — frontend, `/api/*`, login, exercises, Stripe, PayPal — by transparently fetching from the Replit-hosted backend. Vercel runs no install/build; it only does HTTP rewrites. Both the `*.vercel.app` and `*.replit.app` URLs serve the same live product. Replit Deployments remains the authoritative source — Vercel only mirrors it.

CORS allowlist (`artifacts/api-server/src/lib/allowedOrigins.ts`) explicitly permits `pap-tan-seven.vercel.app`, `projetoaliancapanoramapap.replit.app`, `pap.sociedadetucci.com.br`, `sociedadetucci.com.br`, `www.sociedadetucci.com.br`, plus regex patterns for any `*.vercel.app`, `*.replit.app`, and `*.replit.dev`. Additional sociedadetucci subdomains must be added explicitly (no wildcard) to keep CORS least-privilege. An `ALLOWED_ORIGINS` env var (comma-separated) can add more origins (e.g. a future custom domain) without a code change. Session cookie is `secure: true` only when `NODE_ENV === "production"` and `sameSite: "lax"` is sufficient because Vercel's server-side rewrite makes all browser traffic look same-origin.

### Custom domain: `pap.sociedadetucci.com.br`

The branded production URL is **`https://pap.sociedadetucci.com.br`**, a subdomain of `sociedadetucci.com.br` pointed at the Replit deployment. Replit terminates TLS automatically once the domain is verified.

**To finish wiring the domain (manual, one-time, done in the Replit UI + DNS provider):**

1. In the Replit workspace, open the published deployment (Deployments tab) → **Settings → Custom Domains → Add domain** → enter `pap.sociedadetucci.com.br`. Replit will display two DNS records to create:
   - An `A` record (hostname `pap`) pointing at a Replit IP, and
   - A `TXT` record (hostname `_replit-verification.pap` or similar) with a verification token.
2. Open the DNS panel for `sociedadetucci.com.br` at the registrar (Registro.br for `.com.br`, or wherever DNS is hosted — Cloudflare, etc.) and create both records exactly as Replit shows them. TTL `3600` is fine.
3. Back in Replit, click **Verify**. After DNS propagates (usually a few minutes, up to a few hours on Registro.br) Replit will provision a Let's Encrypt certificate automatically. The site is then live at `https://pap.sociedadetucci.com.br`.

**Path-based hosting (`sociedadetucci.com.br/pap`) is not supported by DNS** — DNS only routes hostnames, not paths. To serve PAP under a path on the apex `sociedadetucci.com.br`, the apex site would need a reverse-proxy rule (Cloudflare Worker, Nginx, or whatever runs `sociedadetucci.com.br`) that forwards requests for `/pap/*` to `https://projetoaliancapanoramapap.replit.app/$1` — same pattern as the existing Vercel rewrite in `vercel.json`. We use the subdomain `pap.sociedadetucci.com.br` instead, which is the standard approach and works with just DNS.

The CORS allowlist already includes `pap.sociedadetucci.com.br` (and any other subdomain of `sociedadetucci.com.br`), so no env var change is needed once DNS is in place.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Lucide icons, TanStack Query
- API: Express 5 with pino logging, express-session (memory store)
- DB: PostgreSQL + Drizzle ORM (57 nodes + users + exercises + social tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks)
- Build: esbuild (CJS bundle for server)
- AI: `@workspace/integrations-openai-ai-server` via Replit AI Integrations proxy
- Payments: Stripe via Replit connector (`stripe-replit-sync` syncs to `stripe.*` schema in Postgres)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — generated React Query hooks (do not edit manually)
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (do not edit manually)
- `lib/db/src/schema/` — Drizzle schema (nodes, notes, node_progress, achievements, users, exercises, social)
- `lib/db/src/schema/social.ts` — friendships, friend_messages, social_notes tables
- `artifacts/api-server/src/routes/` — Express route handlers (auth, nodes, notes, progress, exercises, social, stripe, admin)
- `artifacts/api-server/src/stripeClient.ts` — Stripe credential fetch + StripeSync factory
- `artifacts/api-server/src/routes/stripe.ts` — /stripe/plans, /stripe/checkout, /stripe/sync-tier, /stripe/portal (not in openapi.yaml)
- `artifacts/api-server/src/paypalClient.ts` — PayPal OAuth token fetch + base URL auto-detect (live/sandbox)
- `artifacts/api-server/src/routes/paypal.ts` — /paypal/client-id, /paypal/plans, /paypal/create-subscription, /paypal/sync-tier, /paypal/cancel (not in openapi.yaml)
- `scripts/src/seed-paypal-products.ts` — creates Product + 4 Plans in PayPal, saves IDs to `paypal_plans` DB table (run via `pnpm --filter @workspace/scripts run seed-paypal-products`)
- `artifacts/api-server/src/routes/admin.ts` — POST /admin/generate-content (tier-5 only, regenerates all node content)
- `artifacts/api-server/src/scripts/generate-content.ts` — standalone content generation runner (run via `pnpm --filter @workspace/api-server run generate-content`)
- `scripts/src/seed-products.ts` — creates Stripe products+prices (run via `pnpm --filter @workspace/scripts run seed-products`)
- `artifacts/pap/src/components/MainApp.tsx` — full frontend (auth, tree, exercises, nav guide, Isa, PlansModal)

## Architecture decisions

- Contract-first API: OpenAPI spec → codegen → React Query hooks and Zod schemas. Never write API types by hand.
- Square viewport (≈900×900px) enforced in `App.tsx` with black bars on desktop.
- Knowledge tree root is tier-aware: tier ≥ 4 → root "0" (all branches); tier < 4 → root "1" (Ciências only). Lock enforced server-side via `canAccess(tier, code)`.
- Auth: express-session with bcrypt-hashed passwords (cost 12). 6 users: guest/aluno1-4/root. Passwords are never stored or compared in plaintext. Login endpoint is rate-limited (10 attempts per 15 min per IP). Run `pnpm --filter @workspace/scripts run randomize-passwords` to assign unique strong passwords to all accounts.
- Exercises: AI-generated via OpenAI (3 MCQ per node), cached in DB, submitted attempts tracked.
- Achievement system: two per node (explored + read). Read triggered after 30s of modal open. Achievements are stored per-user and lazily created on first earn; the full catalog is generated on-the-fly from nodes in API responses.
- No `console.log` in server — use `req.log` in handlers, `logger` singleton elsewhere.
- Stripe: routes bypass OpenAPI/codegen. /stripe/plans queries stripe.products/prices (synced via stripe-replit-sync). /stripe/checkout creates a Stripe Checkout session. /stripe/sync-tier polls Stripe API for active subscription and updates users.tier. /stripe/portal opens the Stripe billing portal. Webhook at /api/stripe/webhook is registered BEFORE express.json() (needs raw Buffer). Stripe schemas in `stripe.*` Postgres schema created by `stripe-replit-sync`'s runMigrations (call before server start, or run manually: `node -e "import('stripe-replit-sync').then(m=>m.runMigrations({databaseUrl:process.env.DATABASE_URL}))"`).
- PayPal: routes bypass OpenAPI/codegen. Uses raw fetch + cached OAuth token (env auto-detected as live/sandbox at first call). 4 Products + Plans seeded via `seed-paypal-products` script, IDs stored in `paypal_plans` table. /paypal/create-subscription is server-side and binds `custom_id=userId` to the PayPal subscription. /paypal/sync-tier verifies `custom_id` matches the authenticated user (anti-impersonation), requires status `ACTIVE` (polls up to 6×1.5s for APPROVAL_PENDING→ACTIVE transition), then updates users.tier and stores `paypal_subscription_id`. Webhook at `/api/paypal/webhook` is registered BEFORE `express.json()` (raw body needed for signature verification via `/v1/notifications/verify-webhook-signature`). On `BILLING.SUBSCRIPTION.CANCELLED`/`EXPIRED`/`SUSPENDED` events, the user matched by `paypal_subscription_id` is reset to tier 1 — so cancellations made directly on PayPal (outside the in-app cancel button) auto-downgrade. Requires `PAYPAL_WEBHOOK_ID` env var.
- Node content: all 57 nodes have AI-generated 3-paragraph educational summaries (~1380 chars each). Regenerate with `pnpm --filter @workspace/api-server run generate-content` (skips nodes that already have content >150 chars).
- Isa owl: CSS/Framer Motion, personalized greeting by user name/tier, keyword-matched FUVEST responses.
- Social routes (/api/social/*) bypass OpenAPI/codegen — use direct fetch + useQuery in SocialModal components. Not in openapi.yaml.
- DB has both `password_plain` (legacy) and `password_hash` (bcrypt, active) columns. Auth uses `password_hash`. userCode is auto-generated on first /social/me call (lazy).

## Product

- Space/universe themed UI in Portuguese, no emojis (Lucide icons only)
- 6-tier user system: Visitante (0), Aluno I–IV (1–4), Dev (5).
- Hierarchical knowledge tree (57 nodes FUVEST 2026), tier-gated with lock icons
- AI-generated 3-question FUVEST-style MCQ exercises per node (Aluno I+ only)
- AI-generated rich node content: 3-paragraph educational summary per node (all 57 nodes populated)
- Subscription plans (4 paid tiers): Aluno II R$19,90 → Aluno IV R$49,90/mês. Same plans available via Stripe (cartão/Pix/boleto) and PayPal (cartão/PayPal balance) at user choice.
- PlansModal: accessible via "Planos" button in Menu; fetches /api/stripe/plans + /api/paypal/plans, shows both payment buttons per plan card
- Spaceship cockpit dashboard: notes, map, social panels
- Social Area: profile (avatar/initials, score weighted by node depth × correct answers, user code), friends ring, chat com polling 5s, caderno compartilhado (shared notes between two users)
- Menu panel: Status, Calendário, Insígnias, Guia (navigation guide) tabs
- Activity heatmap calendar (last 90 days)
- Ad totem column (collapsible) on the right
- Isa owl mascot: flies in, perches, speech bubble, chat with FUVEST study tips, personalized by tier

## GitHub / Vercel deployment

- GitHub remote: `github.com/yurituccieterovic-cell/pap` (branch `main`), pushed via the Replit GitHub integration (account `yurituccieterovic-cell`).
- Last push (May 14, 2026): **force-push** `b824cce` → `6cd6d11` on `main` (verified via `git ls-remote`; remote `refs/heads/main` = `6cd6d11`). The remote commit `b824cce` ("SEO: URL routing /no/:code + Helmet dinâmico") was not in local history, so a force-push was required this one time to ship the local 5-commit lead (including the PayPal integration). This is exceptional — **future pushes should be normal fast-forwards**; only fall back to `--force-with-lease` if the remote diverges again.
- Push workaround (contingency, not the default workflow): a stale dangling reference in the local `.git` causes `git push` from the workspace to fail with "Could not read 32d8da62..." during reachability enumeration even though `git fsck` is clean. If that recurs, bundle main and push from a clean clone: `git bundle create /tmp/pap.bundle main && git clone /tmp/pap.bundle /tmp/pappush -b main && cd /tmp/pappush && git push --force-with-lease https://x-access-token:$TOKEN@github.com/yurituccieterovic-cell/pap.git main:main`. Pull the token from the GitHub connector at runtime (`listConnections('github')[0].settings.access_token`); never paste it inline. To avoid leaking it in shell history, prefix the command with a space (with `HISTCONTROL=ignorespace`) or write the token to an unexported var (`read -s TOKEN`) and `unset TOKEN` after.
- Vercel project `pap-tan-seven.vercel.app` is wired to this GitHub repo and rebuilds on push. Note: Vercel only hosts static frontend + serverless functions, so the Express API in `artifacts/api-server` will not run there as-is — the Vercel deploy currently serves the frontend only.

## User preferences

- UI language: Portuguese (Brazil)
- No emojis in code or UI (Lucide icons only)
- Square viewport centered with black bars

## Gotchas

- `useListNodes()` with no args returns only nodes where `parentCode IS NULL` (i.e., just node "0"). Always pass `{ parentCode: "X" }` to fetch children.
- Social notes unique constraint: stored as (min(u1,u2), max(u1,u2)) so upsert works. Use onConflictDoUpdate with target [user1Id, user2Id].
- Score formula: for each correct exercise_attempt with userId → nodeCode.length × 10 pts. Only exercise_attempts has userId (notes/node_progress/achievements now also have user_id per-user).
- Notes, node_progress, and achievements all have `user_id NOT NULL`. Every route handler for these tables checks `req.session.userId` and returns 401 if not authenticated. All queries are scoped to the session user.
- The DB originally had `password_plain` column in `users` — it was renamed to `password_hash` and all passwords re-hashed with bcrypt (cost 12). Run `pnpm --filter @workspace/scripts run randomize-passwords` to assign unique strong passwords to all accounts and print them once.
- `drizzle-kit push` may prompt interactively for column renames — run migrations via executeSql or raw SQL if needed.
- Orval zod output uses `mode: "single"` — generated schema names are PascalCase (e.g. `LoginBody`, not `loginBodySchema`).
- `lib/api-zod/src/index.ts` must only export `./generated/api` (not a schemas folder).
- Always run codegen after editing openapi.yaml.
- `custom-fetch.ts` has `credentials: "include"` so session cookies are sent automatically.
- IsaOwl phase state: "flying" → "perched" → "bubble" → "chat". useEffect must guard with early return to avoid TS7030.

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup
- `lib/api-spec/openapi.yaml` — full API contract with all routes and schemas
