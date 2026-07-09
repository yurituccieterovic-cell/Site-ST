# MAPA-INFRA.md — Infraestrutura e Stack
**PAP · Sociedade Tucci**
> Parte do sistema MAPA. Ver MAPA-MASTER.md para índice geral.

---

## Arquitetura da Plataforma PAP

```
                        USUÁRIO (browser)
                              │
                    ┌─────────▼──────────┐
                    │       VERCEL       │
                    │  CDN estático      │
                    │  aliancapanorama/  │
                    └─────────┬──────────┘
                              │ /api/* → proxy
                              │
                    ┌─────────▼──────────┐
                    │     RAILWAY        │
                    │  pap-api           │
                    │  Nixpacks build    │
                    │  restart on fail   │
                    └──┬─────────────────┘
                       │
          ┌────────────▼──────────────────────┐
          │     RAILWAY PostgreSQL            │
          │   (incluso no plano Railway)      │
          └────────────┬──────────────────────┘
                       │
          ┌────────────▼──────────────────────┐
          │         INTEGRAÇÕES               │
          │  OpenAI API  · Stripe  · PayPal   │
          └───────────────────────────────────┘
```

### Estado da Infraestrutura

| Componente | Onde roda | Status |
|---|---|---|
| Frontend | Vercel hobby (`site-st.vercel.app/aliancapanorama`) | ✅ LIVE |
| API | Railway (`site-st-production.up.railway.app`) | ✅ LIVE |
| Banco de dados | Railway PostgreSQL | ✅ LIVE |
| Sessions | PostgreSQL (`session` table via connect-pg-simple) | ✅ Ativo |
| Domínio | pap.sociedadetucci.com.br | 🔧 DNS a configurar |
| GitHub | yurituccieterovic-cell/Site-ST | ✅ Ativo |
| Bluesky ISA | isa-pap.bsky.social | ✅ LIVE |
| ARPIA | Railway (pendente) + `/root/Arpia/` | ✅ Código pronto |

---

## Stack Técnico

### Frontend
| Tecnologia | Papel |
|---|---|
| React + Vite | SPA, build tool |
| TypeScript 5.9 | Tipagem |
| Tailwind CSS | Estilos |
| Framer Motion | Animações |
| TanStack Query | Cache e estado de servidor |
| Orval (codegen) | Gera hooks React Query a partir do OpenAPI |

### API
| Tecnologia | Papel |
|---|---|
| Node.js 24 + Express 5 | Servidor HTTP |
| pino + pino-http | Logging estruturado (nunca `console.log`) |
| express-session + connect-pg-simple | Sessões persistidas no PostgreSQL (7 dias) |
| bcrypt (cost 12) | Hash de senhas |
| Drizzle ORM | Queries tipadas |
| Zod v4 | Validação de schemas |

### Banco de Dados
| Tecnologia | Papel |
|---|---|
| PostgreSQL (Railway) | Banco principal |
| Drizzle ORM + drizzle-kit | Schema e migrações |
| connect-pg-simple | Cria e gerencia tabela `session` automaticamente |

### Tooling
| Ferramenta | Papel |
|---|---|
| pnpm workspaces | Monorepo |
| esbuild | Bundle do servidor (ESM — output `.mjs`) |
| Orval | Codegen OpenAPI → hooks + Zod |

---

## Estrutura do Monorepo

```
aliancapanorama-src/
│
├── lib/
│   ├── api-spec/openapi.yaml          ← FONTE DA VERDADE da API
│   ├── api-client-react/              ← hooks gerados (não editar)
│   ├── api-zod/                       ← schemas Zod gerados (não editar)
│   ├── db/src/schema/
│   │   ├── nodes.ts · notes.ts · progress.ts · exercises.ts
│   │   ├── social.ts · users.ts · tasks.ts · nebula.ts
│   │   ├── domestico.ts · lisange.ts
│   │   └── ia-courses.ts
│   └── integrations-openai-ai-server/ ← cliente OpenAI
│
├── artifacts/
│   ├── api-server/src/
│   │   ├── app.ts                     ← middleware stack + webhooks
│   │   ├── routes/
│   │   │   ├── auth.ts · nodes.ts · notes.ts · progress.ts
│   │   │   ├── exercises.ts · social.ts · ai.ts · admin.ts
│   │   │   ├── stripe.ts · paypal.ts · health.ts · sitemap.ts
│   │   │   ├── isa.ts · tasks.ts · ia-course.ts · nebula.ts
│   │   │   ├── meky.ts · assembly.ts · governance.ts
│   │   │   ├── lar.ts · gastador.ts · lisange.ts
│   │   │   └── webhooks.ts
│   │   ├── isa/ (cycle.ts · cron.ts · bluesky.ts · rodar.ts · dream.ts)
│   │   └── lib/ (bootstrap.ts · logger.ts · llm-router.ts · json-robust-parse.ts · sanitize-external.ts)
│   │
│   └── pap/src/
│       ├── components/ (IntroFacade.tsx · MainApp.tsx)
│       └── App.tsx
│
└── scripts/src/
    ├── sync-assembleias.py · learn-from-docs.py
    └── seed-products.ts · randomize-passwords.ts
```

---

## Deployment

### Railway (railway.toml)
- Builder: NIXPACKS · Root dir: `aliancapanorama-src`
- Build: `pnpm install --no-frozen-lockfile && pnpm --filter @workspace/api-server run build`
- Start: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- PostgreSQL service: injetado automaticamente como `DATABASE_URL`
- Env vars necessárias: `NODE_ENV=production`, `SESSION_SECRET`, `AI_API_KEY`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`
- Env vars pendentes: `MEKY_TOKEN`, `GEMINI_API_KEY`, `MC_TOKEN`, `TELEGRAM_BOT_TOKEN`
- Restart: ON_FAILURE, máx 5 tentativas

### Fluxo CI/CD
```
código local (Termux/celular)
     │
     ▼
git push → github.com/yurituccieterovic-cell/Site-ST
     │
     ├──→ Vercel (automático) → build aliancapanorama/ → CDN
     └──→ Railway (automático via GitHub) → pap-api
```

### CORS allowlist
- `pap.sociedadetucci.com.br` (canonical)
- `*.vercel.app` · `*.replit.app` · `*.replit.dev`
- `ALLOWED_ORIGINS` env var (domínios extras sem rebuild)

---

## Comandos de Operação

```bash
# Dev
pnpm --filter @workspace/api-server run dev   # API (porta 8080)
pnpm --filter @workspace/pap run dev          # Frontend (porta 18434)

# Qualidade
pnpm run typecheck
pnpm run build

# Codegen (após editar openapi.yaml — OBRIGATÓRIO)
pnpm --filter @workspace/api-spec run codegen

# DB
pnpm --filter @workspace/db run push          # push schema (dev only)
pnpm --filter @workspace/db run generate      # gerar migration
pnpm --filter @workspace/db run migrate       # aplicar migration

# Build produção frontend
bash scripts/build-pap.sh

# Scripts de setup
pnpm --filter @workspace/scripts run seed-products
pnpm --filter @workspace/scripts run randomize-passwords
pnpm --filter @workspace/api-server run generate-content

# Sync assembleias (ao #fim)
pap-sync
```

**Env vars obrigatórias:** `DATABASE_URL`, `SESSION_SECRET`
**Opcionais:** `OPENAI_API_KEY`, `AI_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `PAYPAL_*`, `ALLOWED_ORIGINS`

*Atualizado: 2026-07-07 · Sessão 26*
