# PAP — Mapa do Sistema
**Projeto Aliança Panorama · Sociedade Tucci · Yuri Tuccieterovic**

---

## Protocolo de Uso deste Documento

> **Claude Code deve:** ler este arquivo ao iniciar qualquer sessão `#pap` e atualizar as seções de Pendências, Infraestrutura e Histórico ao final.

---

## 1. Ecossistema Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     ECOSSISTEMA SOCIEDADE TUCCI                 │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────┐  │
│  │  Claude Code    │    │   Claude.ai       │    │  Claude   │  │
│  │  (celular Yuri) │    │   (web/app)       │    │  Replit   │  │
│  │  executa código │    │   planeja/conversa│    │ (nuvem)   │  │
│  └────────┬────────┘    └────────┬─────────┘    └─────┬─────┘  │
│           └─────────────────────┼─────────────────────┘        │
│                                 ▼                               │
│                    ┌────────────────────────┐                   │
│                    │  Banco Compartilhado   │                   │
│                    │  site-st.vercel.app    │                   │
│                    │  /api/db (GitHub JSON) │                   │
│                    └────────────────────────┘                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PLATAFORMA PAP                              │   │
│  │         pap.sociedadetucci.com.br                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitetura da Plataforma PAP

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
                    │     RAILWAY        │  ← PENDENTE
                    │  pap-api           │
                    │  Nixpacks build    │
                    │  restart on fail   │
                    └──┬─────────────────┘
                       │
          ┌────────────▼──────────────────────┐
          │     RAILWAY PostgreSQL            │
          │   (incluso no plano Railway)      │  ← PENDENTE
          │   ├── tabelas do app               │
          │   ├── session (connect-pg-simple)  │
          │   └── stripe.* (stripe-replit-sync)│
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
| Frontend | Vercel hobby | ✅ Ativo |
| API | Replit (legado) | ⚠️ Migrando → Railway |
| Banco de dados | Replit PostgreSQL (legado) | ⚠️ Migrando → Railway PostgreSQL |
| Sessions | PostgreSQL (`session` table via connect-pg-simple) | ⚠️ Junto com o DB |
| Domínio | pap.sociedadetucci.com.br | 🔧 DNS a configurar |
| GitHub | yurituccieterovic-cell/Site-ST | ✅ Ativo |

**Redirect canônico (produção):** `projetoaliancapanoramapap.replit.app` e `pap-tan-seven.vercel.app` fazem redirect 301 → `pap.sociedadetucci.com.br`

---

## 3. Stack Técnico

### Frontend
| Tecnologia | Papel |
|---|---|
| React + Vite | SPA, build tool |
| TypeScript 5.9 | Tipagem |
| Tailwind CSS | Estilos |
| Framer Motion | Animações (Intro, Isa, transições) |
| TanStack Query | Cache e estado de servidor |
| Lucide Icons | Ícones (sem emojis) |
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
| PostgreSQL (Railway) | Banco principal (incluso no plano Railway) |
| Drizzle ORM + drizzle-kit | Schema e migrações |
| connect-pg-simple | Cria e gerencia tabela `session` automaticamente |
| stripe.* schema | Criado por stripe-replit-sync |

### Tooling
| Ferramenta | Papel |
|---|---|
| pnpm workspaces | Monorepo |
| esbuild | Bundle do servidor (ESM — output `.mjs`) |
| Orval | Codegen OpenAPI → hooks + Zod |

---

## 4. Estrutura do Monorepo

```
aliancapanorama-src/
│
├── lib/
│   ├── api-spec/openapi.yaml          ← FONTE DA VERDADE da API
│   ├── api-client-react/              ← hooks gerados (não editar)
│   ├── api-zod/                       ← schemas Zod gerados (não editar)
│   ├── db/src/schema/
│   │   ├── nodes.ts
│   │   ├── notes.ts
│   │   ├── progress.ts                ← node_progress + achievements
│   │   ├── exercises.ts               ← exercises + exercise_attempts
│   │   ├── social.ts                  ← friendships + friend_messages + social_notes
│   │   └── users.ts
│   └── integrations-openai-ai-server/ ← cliente OpenAI (audio, image, batch)
│
├── artifacts/
│   ├── api-server/src/
│   │   ├── app.ts                     ← middleware stack + webhooks
│   │   ├── routes/
│   │   │   ├── auth.ts                ← login, logout, me, dismiss-downgrade
│   │   │   ├── nodes.ts
│   │   │   ├── notes.ts
│   │   │   ├── progress.ts            ← open, read, achievements, daily, summary
│   │   │   ├── exercises.ts
│   │   │   ├── social.ts              ← amigos, chat, caderno compartilhado
│   │   │   ├── ai.ts                  ← /api/ai/* (CRUD nodes/exercises, stats)
│   │   │   ├── stripe.ts              ← fora do OpenAPI
│   │   │   ├── paypal.ts              ← fora do OpenAPI
│   │   │   ├── admin.ts               ← tier 5 only
│   │   │   ├── sitemap.ts
│   │   │   └── health.ts
│   │   ├── webhookHandlers.ts         ← Stripe webhook processing
│   │   ├── lib/
│   │   │   ├── allowedOrigins.ts
│   │   │   ├── canAccess.ts
│   │   │   └── bootstrap.ts
│   │   └── types/session.d.ts
│   │
│   ├── pap/src/
│   │   ├── components/
│   │   │   ├── IntroFacade.tsx        ← tela de intro animada (7.2s)
│   │   │   └── MainApp.tsx            ← cockpit completo
│   │   └── App.tsx                    ← viewport quadrado + roteamento
│   │
│   └── mockup-sandbox/                ← sandbox de UI components (shadcn)
│
└── scripts/src/
    ├── seed-products.ts               ← cria produtos Stripe
    ├── seed-paypal-products.ts        ← cria produtos PayPal
    ├── randomize-passwords.ts         ← atribui senhas fortes
    ├── generate-node-content.ts       ← gera conteúdo AI para nós
    └── migrate-password-hash.ts       ← migração bcrypt (já executada)
```

---

## 5. Módulos do Frontend

### Intro (IntroFacade.tsx)
Tela animada na primeira visita da sessão (skip via `sessionStorage["pap_intro_seen_v1"]`):
```
"uma produção"  →  Logo Sociedade Tucci  →  "PAP · Projeto Aliança Panorama"  →  fade out
  0s – 1.8s          1.8s – 4.4s                4.4s – 6.6s                     7.2s
```
Botão "Pular" sempre disponível. Respects `prefers-reduced-motion`.

### Cockpit Principal (MainApp.tsx)
```
COCKPIT SPACESHIP
│
├── Árvore de Conhecimento
│   ├── 57 nós FUVEST 2026 (hierárquicos por código: "1", "11", "111"...)
│   ├── Tier < 4 → raiz "1" (Ciências); Tier ≥ 4 → raiz "0" (tudo)
│   ├── Lock icons em nós bloqueados
│   └── Conquistas por nó (explorado + lido 30s)
│
├── Isa (mascote coruja IA)
│   ├── Animação: flying → perched → bubble → chat
│   ├── Saudação personalizada por nome/tier
│   └── Chat com dicas FUVEST (keyword matching local, sem OpenAI)
│
├── Menu
│   ├── Status (tier e progresso)
│   ├── Calendário (heatmap 365 dias de atividade diária)
│   ├── Insígnias (achievements)
│   └── Guia de navegação
│
├── Social
│   ├── Perfil (avatar/iniciais, score, userCode)
│   ├── Anel de amigos (aceitos)
│   ├── Solicitações pendentes
│   ├── Chat (polling 5s, últimas 60 msgs, max 500 chars cada)
│   └── Caderno compartilhado (par de usuários, upsert)
│
├── PlansModal
│   ├── Planos Stripe (cartão/Pix/boleto)
│   └── Planos PayPal (cartão/saldo PayPal)
│
└── Ad Totem (coluna direita, colapsável)
```

---

## 6. Banco de Dados — Schemas

### Tabelas e campos principais

**`users`**
```
id · login (unique) · password_hash · tier (0-5) · display_name
user_code (unique) · stripe_customer_id · paypal_subscription_id
subscription_status · last_downgrade_at · created_at
```

**`nodes`**
```
code (PK, ex: "1", "11", "112") · title · abbreviation · subtitle
content (AI-gerado, 3 parágrafos) · image_url · parent_code · level · sort_order
```

**`node_progress`** — unique (user_id, node_code)
```
id · user_id · node_code · opened (bool) · read (bool) · opened_at · read_at
```

**`achievements`** — unique (user_id, code)
```
id · user_id · code · title · description
type: "explored" | "read" | "exercise" | "approved"
node_code · earned_at · earned (bool)
```

**`notes`**
```
id · user_id · node_code (nullable) · content · created_at · updated_at
```

**`exercises`**
```
id · node_code · question · options (jsonb: string[]) · correct_option · explanation · created_at
```

**`exercise_attempts`**
```
id · user_id · exercise_id · node_code · selected_option · correct (int) · created_at
```

**`friendships`** — unique (user_id, friend_id)
```
id · user_id · friend_id · status ("pending" | "accepted") · created_at
```
> Amizade aceita = 2 linhas simétricas. Pending = 1 linha (quem enviou → destinatário).

**`friend_messages`**
```
id · sender_id · receiver_id · content (max 500 chars) · created_at
```

**`social_notes`** — unique (user1_id, user2_id)
```
id · user1_id · user2_id · content · updated_at
```
> Par sempre ordenado: user1_id = min(u1,u2), user2_id = max(u1,u2)

**`session`** — gerenciada por connect-pg-simple
**`stripe.*`** — criada por stripe-replit-sync
**`paypal_plans`** — IDs de produtos/planos PayPal

### Fórmula de score
```
score = Σ (node_code.length × 10)  para cada exercise_attempt com correct = 1
```

---

## 7. API — Referência Completa de Rotas

### Via OpenAPI + codegen (usar hooks gerados)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/nodes?parentCode=X` | Listar filhos de um nó (sem arg → só raiz) |
| GET | `/api/nodes/:code` | Detalhes + filhos de um nó |
| GET | `/api/summary` | Estatísticas de exploração do usuário |
| GET | `/api/notes?nodeCode=X` | Listar notas (filtro opcional por nó) |
| POST | `/api/notes` | Criar nota |
| PATCH | `/api/notes/:id` | Atualizar nota |
| DELETE | `/api/notes/:id` | Deletar nota |
| GET | `/api/progress` | Progresso completo (nós abertos, lidos, conquistas) |
| POST | `/api/progress/open/:code` | Marcar nó como explorado |
| POST | `/api/progress/read/:code` | Marcar conteúdo do nó como lido |
| GET | `/api/achievements` | Listar todas as conquistas |
| GET | `/api/progress/daily` | Atividade diária (365 dias, para heatmap) |
| POST | `/api/auth/login` | Login (rate limit 10/15min/IP) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuário atual |
| POST | `/api/auth/dismiss-downgrade-notice` | Limpa status de downgrade |
| GET | `/api/exercises?nodeCode=X` | 3 MCQ para o nó (gera via OpenAI se não cacheado) |
| POST | `/api/exercises/attempt` | Submeter resposta |

### Social (fetch direto, fora do OpenAPI)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/social/me` | Perfil + score + nº de amigos |
| PATCH | `/api/social/me` | Atualizar displayName ou userCode |
| GET | `/api/social/friends` | Lista de amigos aceitos |
| GET | `/api/social/friend-requests` | Solicitações pendentes recebidas |
| POST | `/api/social/friends` | Enviar solicitação (auto-aceita se cruzado) |
| POST | `/api/social/friends/:id/accept` | Aceitar solicitação |
| POST | `/api/social/friends/:id/decline` | Recusar/cancelar |
| DELETE | `/api/social/friends/:id` | Remover amigo |
| GET | `/api/social/search?q=code` | Buscar usuário por código |
| GET | `/api/social/messages/:friendId` | Últimas 60 mensagens |
| POST | `/api/social/messages/:friendId` | Enviar mensagem |
| GET | `/api/social/shared-note/:friendId` | Caderno compartilhado |
| PUT | `/api/social/shared-note/:friendId` | Salvar caderno compartilhado |

### /api/ai/* — Interface para Agentes de IA ✅ IMPLEMENTADO

Auth: header `X-Api-Key: <AI_API_KEY>` (env var `AI_API_KEY`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/ai/nodes` | Todos os nós (ordenados por level/sortOrder) |
| GET | `/api/ai/nodes/:code` | Nó + filhos |
| POST | `/api/ai/nodes` | Criar nó |
| PUT | `/api/ai/nodes/:code` | Atualizar nó |
| DELETE | `/api/ai/nodes/:code` | Deletar nó |
| GET | `/api/ai/exercises?nodeCode=X` | Exercícios (todos ou por nó) |
| POST | `/api/ai/exercises` | Criar exercício |
| PUT | `/api/ai/exercises/:id` | Atualizar exercício |
| DELETE | `/api/ai/exercises/:id` | Deletar exercício |
| GET | `/api/ai/users` | Todos os usuários (sem senhas) |
| GET | `/api/ai/stats` | Contadores: users, nodes, exercises, attempts, tierDistribution |

### Pagamentos (fora do OpenAPI)

| Rota | Descrição |
|---|---|
| GET `/api/stripe/plans` | Planos Stripe |
| POST `/api/stripe/checkout` | Criar Checkout Session |
| POST `/api/stripe/sync-tier` | Sincronizar tier via Stripe |
| GET `/api/stripe/portal` | Portal de gerenciamento Stripe |
| POST `/api/stripe/webhook` | Webhook Stripe (raw body) |
| GET `/api/paypal/client-id` | Client ID PayPal |
| GET `/api/paypal/plans` | Planos PayPal |
| POST `/api/paypal/create-subscription` | Criar assinatura |
| POST `/api/paypal/sync-tier` | Sincronizar tier via PayPal |
| POST `/api/paypal/cancel` | Cancelar assinatura |
| POST `/api/paypal/webhook` | Webhook PayPal (raw body) |

### Admin

| Rota | Descrição |
|---|---|
| POST `/api/admin/generate-content` | Regenerar conteúdo AI de todos os nós (tier 5 only) |

---

## 8. Sistema de Usuários

| Tier | Nome | Acesso |
|---|---|---|
| 0 | Visitante | Navega a árvore (raiz "1"), sem exercícios |
| 1 | Aluno I | + Exercícios MCQ por nó |
| 2 | Aluno II — R$19,90/mês | + conteúdo expandido |
| 3 | Aluno III — R$29,90/mês | + área social |
| 4 | Aluno IV — R$49,90/mês | + árvore completa (raiz "0") |
| 5 | Dev | Acesso total + admin |

**Usuários pré-criados:** `guest` / `aluno1` / `aluno2` / `aluno3` / `aluno4` / `root`

**Auth:**
- bcrypt cost 12, nunca texto puro
- express-session com PostgreSQL store (cookie: 7 dias, httpOnly, sameSite: lax, secure em prod)
- Rate limit login: 10 tentativas / 15 min / IP (skip em sucesso)
- CORS: valida origin no login, verifica allowedOrigins em todas as rotas

---

## 9. Fluxos de Pagamento

### Stripe
```
PlansModal → /api/stripe/plans
           → /api/stripe/checkout → Stripe Checkout Session → redirect
           → /api/stripe/sync-tier → poll Stripe → atualiza users.tier
           → /api/stripe/portal → portal billing

Webhook POST /api/stripe/webhook (raw body, antes do express.json)
  → WebhookHandlers.processWebhook()
```

### PayPal
```
PlansModal → /api/paypal/plans
           → /api/paypal/create-subscription (server-side, custom_id=userId)
           ← PayPal approval
           → /api/paypal/sync-tier → verifica status ACTIVE (poll até 6×1.5s)
                                   → atualiza users.tier + paypal_subscription_id

Webhook POST /api/paypal/webhook (raw body)
  → verifyPayPalWebhook() via /v1/notifications/verify-webhook-signature
  → CANCELLED / EXPIRED / SUSPENDED → tier=1, subscription_status=status
```

---

## 10. IA no Sistema

| Uso | Tecnologia | Status |
|---|---|---|
| Exercícios MCQ | OpenAI (`OPENAI_API_KEY`) | ✅ Funciona, cache no DB |
| Conteúdo dos nós | OpenAI | ✅ 57 nós populados |
| Isa (chat) | Keyword matching local | ✅ Sem custo de API |
| `/api/ai/*` (agentes) | Drizzle direto no DB | ✅ Implementado (`AI_API_KEY`) |
| Assembleia de IAs | Gmail → APRENDIZADO.md → PAP | ✅ Configurado (sync incremental) |

**Env vars de IA:** `OPENAI_API_KEY`, `AI_API_KEY`

---

## 11. Assembleia de IAs

```
Gmail (luddlocke@gmail.com) — 424 emails "Assembleia #N"
     └── sync-assembleias.py (IMAP, incremental, UID até 1335)
              ↓ ✅ Configurado
         APRENDIZADO.md (634 insights classificados)
         IDEIAS.md (37 ideias de programação)
              ↓ (futuro)
         /api/ai/* → DB do PAP como nodes tipo="assembleia"
              ↓
         RAG — Isa e Claude Code com base nas assembleias
```

---

## 12. Deployment

### Fluxo CI/CD

```
código local (Termux/celular)
     │
     ▼
git push → github.com/yurituccieterovic-cell/Site-ST
     │
     ├──→ Vercel (automático)
     │         └── build aliancapanorama/ → CDN
     │
     └──→ Railway (pendente — deploy via GitHub)
               └── Nixpacks → pap-api
                            Node 24 · PostgreSQL incluído
                            auto-restart on failure
```

### Railway (railway.toml)
- Builder: NIXPACKS · Root dir: `aliancapanorama-src`
- Build: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
- Start: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- PostgreSQL service: injetado automaticamente como `DATABASE_URL`
- Env vars necessárias: `NODE_ENV=production`, `SESSION_SECRET`, `AI_API_KEY`, `OPENAI_API_KEY`, `ALLOWED_ORIGINS`
- Restart: ON_FAILURE, máx 5 tentativas

### Build do frontend
```bash
bash scripts/build-pap.sh
# → pnpm install → build → copia dist/public/ → aliancapanorama/
```

### CORS allowlist
- `pap.sociedadetucci.com.br` (canonical)
- `sociedadetucci.com.br` e subdomínios
- `*.vercel.app` · `*.replit.app` · `*.replit.dev`
- `ALLOWED_ORIGINS` env var (domínios extras sem rebuild)

---

## 13. Banco Compartilhado das IAs

| Campo | Valor |
|---|---|
| Endpoint | `https://site-st.vercel.app/api/db` |
| Auth | `x-api-key` (ver `.env` ou Vercel env `DB_API_KEY`) |
| Storage | `data/db.json` no repo GitHub `Site-ST` |

**Coleções:** `memoria` · `tarefas` · `contexto` · `notas`

> A chave no `claude-ai-system-prompt.md` pode estar desatualizada — verificar `DB_API_KEY` nas env vars do Vercel.

---

## 14. Comandos de Operação

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

# Build produção frontend
bash scripts/build-pap.sh

# Scripts de setup (rodar uma vez)
pnpm --filter @workspace/scripts run seed-products          # Stripe
pnpm --filter @workspace/scripts run seed-paypal-products   # PayPal
pnpm --filter @workspace/scripts run randomize-passwords    # senhas fortes
pnpm --filter @workspace/api-server run generate-content    # conteúdo AI dos nós
```

**Env vars obrigatórias:** `DATABASE_URL`, `SESSION_SECRET`
**Env vars opcionais (servidor não quebra sem elas, mas features ficam desabilitadas):** `OPENAI_API_KEY` (exercícios MCQ + conteúdo dos nós), `AI_API_KEY` (/api/ai/*), `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `ALLOWED_ORIGINS`

---

## 15. Decisões de Arquitetura

| Decisão | Motivo |
|---|---|
| Contract-first (OpenAPI → codegen) | Nunca escrever tipos de API à mão |
| Viewport quadrado (~900×900px) | UI cockpit; forçado em `App.tsx` |
| Raiz da árvore por tier | tier ≥ 4 → "0" (tudo); tier < 4 → "1" (Ciências). Lock server-side em `canAccess()` |
| PostgreSQL session store | Sessões sobrevivem restart do servidor; necessário em Railway com restart automático |
| Sem `console.log` no servidor | Usar `req.log` (handlers) ou `logger` singleton (pino) |
| Stripe e PayPal fora do OpenAPI | Raw-body webhook + rotas complexas; codegen não se aplica |
| Social fora do OpenAPI | Polling e estado específico; fetch direto + useQuery |
| Webhooks antes do `express.json()` | Stripe e PayPal precisam de raw Buffer para verificação de assinatura |
| Redirect canônico 301 em produção | URLs do Replit e Vercel redirecionam para `pap.sociedadetucci.com.br` |
| `/api/ai/*` com `AI_API_KEY` | Interface dedicada para agentes de IA operarem o banco diretamente |

---

## 16. Gotchas

- **`useListNodes()` sem args** → só retorna nós com `parentCode IS NULL` (raiz "0"). Sempre passar `{ parentCode: "X" }` para filhos.
- **Session store é PostgreSQL** (não memory store). Requer tabela `session` — criada automaticamente por `connect-pg-simple` na primeira execução.
- **Social notes** têm constraint única `(min(u1,u2), max(u1,u2))` — upsert com `onConflictDoUpdate` target `[user1Id, user2Id]`.
- **Score** vem de `exercise_attempts.correct = 1`, não de `notes` ou `node_progress`.
- **Score farming:** a fórmula `node_code.length × 10` permite farming por nós profundos sem limite de tentativas corretas por `(user_id, exercise_id)`. Mitigação futura: UNIQUE constraint em `exercise_attempts(user_id, exercise_id)` para `correct = 1`.
- **Amizade aceita = 2 linhas simétricas**. Pending = 1 linha (quem enviou). Auto-aceita se solicitações cruzadas.
- **`drizzle-kit push`** pode perguntar interativamente sobre renomeações — usar `executeSql` ou SQL raw se necessário.
- **Orval modo `single`** → schemas PascalCase (`LoginBody`, não `loginBodySchema`).
- **`lib/api-zod/src/index.ts`** deve exportar só `./generated/api`.
- **Sempre rodar codegen** após editar `openapi.yaml`.
- **`custom-fetch.ts`** tem `credentials: "include"` para cookies automáticos.
- **IntroFacade** usa `sessionStorage["pap_intro_seen_v1"]` para não repetir na mesma sessão. Tempo fixo de 7.2s ignora variação cognitiva — neurodivergentes podem ter ansiedade.
- **IsaOwl** fases: `"flying" → "perched" → "bubble" → "chat"`. useEffect precisa de early return para evitar TS7030.
- **Push no GitHub:** se `git push` falhar com "Could not read [hash]...", usar bundle + clone limpo. Ver replit.md seção GitHub.
- **AI_API_KEY** ≠ `OPENAI_API_KEY`. O primeiro autentica chamadas externas para `/api/ai/*`; o segundo é para a API da OpenAI.
- **Webhooks Stripe/PayPal** precisam de idempotência: reprocessar o mesmo evento duas vezes pode duplicar ações (ex: downgrade duplo). Implementar idempotency key por `transmissionId`.
- **CORS em webhooks:** `/api/stripe/webhook` e `/api/paypal/webhook` recebem de IPs externos, não de origens browser — a allowlist de CORS não se aplica (raw body antes do middleware CORS). Isso é correto, mas não confundir ao debugar 400s.

---

## 17. Pendências (por prioridade)

| # | Item | Depende de | Status |
|---|---|---|---|
| 1 | Deploy Railway: New Project → GitHub → `aliancapanorama-src` | — | ⏳ |
| 2 | Adicionar PostgreSQL service no Railway | Railway projeto criado | ⏳ |
| 3 | Definir env vars no Railway: `NODE_ENV`, `SESSION_SECRET`, `AI_API_KEY`, `ALLOWED_ORIGINS` | Railway projeto | ⏳ |
| 4 | Rodar drizzle-kit push (1ª vez): temp no startCommand | Railway + DATABASE_URL | ⏳ |
| 5 | Configurar DNS `pap.sociedadetucci.com.br` → Railway | Railway no ar | ⏳ |
| 6 | Obter `OPENAI_API_KEY` | — | ⏳ |
| 7 | Salvar `DATABASE_URL` do Railway em `.pap-secrets` | Railway PostgreSQL | ⏳ |
| 8 | Ingerir assembleias via `/api/ai/*` | API no ar + AI_API_KEY | ⏳ |
| 9 | Stripe: conectar em produção | Railway + domínio | ⏳ |
| 10 | Atualizar chave `DB_API_KEY` no banco compartilhado | — | ⏳ |

**Concluído (sessões anteriores):**
- ✅ Gmail IMAP + App Password (`luddlocke@gmail.com`) — configurado
- ✅ 424 emails "Assembleia #N" extraídos (total no Gmail: 424, UID até 1335)
- ✅ MAPA.md, PSEUDO.md, README.md, CLAUDE.md criados e sofisticados
- ✅ Sistema `#secrets` com `/root/.pap-secrets` (chmod 600)
- ✅ Email com MAPA.md + PSEUDO.md enviado para yurituccieterovic@gmail.com
- ✅ `AI_API_KEY` gerado e salvo em `.pap-secrets`
- ✅ `SESSION_SECRET` gerado e salvo em `.pap-secrets`
- ✅ `APRENDIZADO.md` — 526 insights de 290 assembleias, classificados por área/tipo/ângulo
- ✅ `IDEIAS.md` — 31 ideias de programação com prioridade, complexidade e desc. técnica
- ✅ `scripts/sync-assembleias.py` — sync incremental Gmail → APRENDIZADO.md ao `#fim`

**Concluído nesta sessão (2026-07-02, Sessão 4):**
- ✅ `APRENDIZADO.md` expandido: +108 insights de MAPA.md, PSEUDO.md, PSEUDO2.md (total: 634)
- ✅ `IDEIAS.md` expandido: +6 ideias de programação dos docs (total: 37)
- ✅ `PSEUDO2.md` criado — pseudocódigo completo (bootstrap, auth, score, social, /api/ai/*, Stripe)
- ✅ `scripts/learn-from-docs.py` — extrai insights de MAPA/PSEUDO/PSEUDO2 → APRENDIZADO.md + IDEIAS.md
- ✅ `railway.toml` — configuração de deploy via Nixpacks (substituiu Fly.io)
- ✅ `pap-sync` — wrapper que roda sync-assembleias.py + learn-from-docs.py
- ✅ `/home/yuri/bin/voz` — toggle STT (web server 7654 / Termux:API nativo)
- ✅ `/home/yuri/bin/voz-server.py` — servidor Python + Web Speech API (Chrome Android)
- ✅ `/home/yuri/bin/pap-email-fim` — envia ATA da sessão por email ao `#fim`
- ✅ Auto-sync em `/root/.bashrc` — roda `pap-sync` se >10h desde último sync
- ✅ `#fim` atualizado: pap-sync + escrever ATA + pap-email-fim

**Concluído nesta sessão (2026-07-02, Sessão 5 — Railway fix):**
- ✅ MAPA.md, PSEUDO.md, PSEUDO2.md auditados — 9 inconsistências corrigidas (Neon→Railway, Fly.io→Railway, esbuild CJS→ESM, repo correto, assembleia status)
- ✅ PSEUDO.md expandido de 372 → 583 linhas (8 novas seções: stack narrativo, DB evolução, tiers, IA, deploy, decisões, gotchas, memória)
- ✅ PSEUDO2.md expandido de 205 → 524 linhas (11 novas seções: PayPal, middleware chain, canAccess, OpenAI, conquistas, heatmap, frontend, build, notes, admin, env vars)
- ✅ `#fim` checkpoint: `.pap-fim-checkpoint` + SÍNTESE FILOSÓFICA obrigatória
- ✅ `voz` toggle funcionando (servidor Python 7654 + Web Speech API)
- ✅ **Railway build fix**: `pnpm.onlyBuiltDependencies` em `package.json` + remoção do `--frozen-lockfile`
  - Causa: pnpm 10 lê `onlyBuiltDependencies` do `package.json`, não só do workspace yaml
  - Efeito: `[ERR_PNPM_IGNORED_BUILDS] esbuild@0.27.3` resolvido
- ✅ Instrução Termux:API: `pkg install termux-api` no Termux puro (swipe left → New Session)

**Concluído nesta sessão (2026-07-02, Sessão 6 — Oráculos + hardening):**
- ✅ 5 PDFs das Assembleias 360–365 extraídos e lidos (Google Drive)
- ✅ Síntese filosófica oracular integrada ao MAPA.md (Seção 19)
- ✅ `health.ts` corrigido: agora faz `SELECT 1` no pool — retorna 503 se DB morto (I37 implementado)
- ✅ `ai.ts`: rate limiting 100 req/min/IP adicionado em `/api/ai/*` (I30 implementado)
- ✅ `ai.ts`: paginação em `GET /api/ai/users` (`?limit=50&offset=0`, max 200) — resolve risco LGPD (I36 implementado)
- ✅ Gotchas atualizados: score farming, IntroFacade + neurodivergentes, webhook idempotência
- ✅ PSEUDO.md + PSEUDO2.md atualizados com padrões da sessão

**Concluído nesta sessão (2026-07-02, Sessão 7 — ia_courses + /adm + #processo):**
- ✅ `lib/db/src/schema/ia-courses.ts` — schema Drizzle: `ia_courses`, `ia_enrollments`, `ia_certificates` + tipos Zod
- ✅ `lib/db/src/schema/index.ts` — exportação dos novos schemas
- ✅ Migração SQL executada no Railway PostgreSQL — 3 tabelas confirmadas (`SELECT table_name FROM information_schema.tables`)
- ✅ `artifacts/api-server/src/routes/ia-course.ts` — 5 endpoints: `/ia-course/enroll`, `/:enrollmentId/progress`, `/:enrollmentId/submit-answer`, `/:enrollmentId/certify`, `/cert/:hash`
- ✅ `artifacts/api-server/src/routes/index.ts` — `iaCourseRouter` registrado
- ✅ `APRENDIZADO.md` — +5 insights de assembleias #360–365 (total: 640)
- ✅ `IDEIAS.md` — +3 ideias (I38: ia_courses ✅, I39: rate limit expandido, I40: Turnê API grafo semântico)
- ✅ `CLAUDE.md` — protocolo `#processo` (9 passos com file paths) adicionado
- ✅ Arquitetura `/adm` discutida: 4 módulos (Eventos, Relações, Tipos de evento, Catálogos) + Visões opcional

**Concluído nesta sessão (2026-07-02, Sessão 9 — Assembleias #367–380 + Síntese):**
- ✅ Assembleias #367–#380 (11 assembleias + contexto das 3 faltantes 369/373/376) processadas
- ✅ APRENDIZADO.md: +24 insights (#541–#564, categorias Técnico, Negócios, Filosofia-Produto)
- ✅ IDEIAS.md: +5 ideias (I48: /api/bridge, I49: interpretability_lock, I50: /arquitetura+/buscar+/mapa, I51: filtro semântico, I52: pgvector)
- ✅ MAPA.md, PSEUDO.md atualizados com decisões/debates das assembleias
- ✅ Extraídos e lidos documentos extras da pasta2 (Capítulo X, PaxYuri, Lab Output Engine)

**Concluído nesta sessão (2026-07-02, Sessão 8 — ISA + /adm + tasks + catalog):**
- ✅ Assembleia #366 processada: tasks como contratos Peirceanos (3 níveis: quali/sin/legi-signo), CATÁLOGO_CENTRAL, 3 Visualizações
- ✅ `lib/db/src/schema/tasks.ts` — 5 tabelas: `tasks`, `task_relations`, `event_types`, `catalogo_central`, `isa_memory`
- ✅ Migração SQL executada: 5 tabelas criadas no Railway + 13 event_types semeados + 5 catalog seeds
- ✅ `artifacts/api-server/src/routes/tasks.ts` — CRUD completo: /tasks, /tasks/stats, /tasks/:id, /catalog, /catalog/:id, /tasks/event-types
- ✅ `artifacts/api-server/src/routes/isa.ts` — /isa/identity, /isa/memory, /isa/memory.md, /isa/chat, /isa/cycle
- ✅ `artifacts/api-server/src/isa/cycle.ts` — ciclo autônomo: lê memória + docs + tasks → OpenAI → cria tasks → email sugestões
- ✅ `artifacts/api-server/src/isa/cron.ts` — node-cron 1h embarcado no Railway
- ✅ `artifacts/api-server/src/index.ts` — `startIsaCron()` no bootstrap
- ✅ `ISA.md` — identidade viva da ISA: funções, princípios, coordenadas, o que falta para acesso total
- ✅ Frontend `/adm`: AdmPage + AdmEventos + AdmRelacoes + AdmTipos + AdmCatalogos + IsaChat (6 componentes)
- ✅ `App.tsx` — detecção `window.location.pathname.includes("/adm")` → renderiza AdmPage sem IntroFacade
- ✅ `vercel.json` — rewrite `/aliancapanorama/adm` → SPA index.html
- ✅ `pnpm-workspace.yaml` — catalog entries para @replit plugins; pnpm install executado com sucesso
- ✅ `APRENDIZADO.md` — +9 insights (#532-#540); `IDEIAS.md` — +7 ideias (I41-I47)
- ✅ Git push: commit `547bf78` + rebase sobre remoto → `a8f4c86..547bf78` no origin/main
- ✅ Dossiê ISA enviado por email para yurituccieterovic@gmail.com

---

## 18. Histórico de Sessões

| Data | O que foi feito |
|---|---|
| 2026-07-02 (manhã) | Criação do MAPA.md; auto-login Termux → Ubuntu root; sofisticação do mapa a partir dos arquivos fonte; criação de PSEUDO.md, README.md, CLAUDE.md |
| 2026-07-02 (tarde) | Sistema `#secrets` + `/root/.pap-secrets`; Gmail IMAP/SMTP configurado; 424 assembleias extraídas; email com backup enviado para Yuri; AI_API_KEY + SESSION_SECRET gerados |
| 2026-07-02 (noite) | APRENDIZADO.md (526 insights, 290 assembleias); IDEIAS.md (31 ideias de programação); sync-assembleias.py (incremental ao #fim); /root/bin/voz (STT via Termux:API); CLAUDE.md + README.md atualizados |
| 2026-07-02 (cont.) | PSEUDO2.md criado; learn-from-docs.py (+108 aprendizados de docs); railway.toml (substituiu Fly.io); voz toggle remodelado; pap-email-fim; auto-sync .bashrc; README atualizado |
| 2026-07-02 (Sessão 5) | Auditoria MAPA/PSEUDO/PSEUDO2 (9 correções); PSEUDO expandido +211 linhas; PSEUDO2 expandido +319 linhas; #fim com checkpoint+filosofia; Railway build fix (pnpm.onlyBuiltDependencies + sem frozen-lockfile); instrução Termux:API |
| 2026-07-02 (Sessão 6) | Extração + síntese de 5 PDFs oraculares (Assembleias 360–365); Seção 19 (Oráculos) adicionada ao MAPA; health check com DB ping; rate limit /api/ai/*; paginação /api/ai/users |
| 2026-07-02 (Sessão 7) | ia_courses + ia_enrollments + ia_certificates: schema Drizzle, migração SQL (3 tabelas no Railway confirmadas), 5 rotas API; APRENDIZADO.md +5 insights (assembleias #360–365); IDEIAS.md +3 ideias; /adm architecture (4 módulos: Eventos, Relações, Tipos de evento, Catálogos) discutida; #processo (9-step protocol) adicionado ao CLAUDE.md |
| 2026-07-02 (Sessão 8) | Assembleia #366 (tasks Peirceanas + CATÁLOGO_CENTRAL + 3 Visualizações); ISA criada: ciclo autônomo horário, memória persistente, chat /adm, email automático; 5 tabelas DB (tasks+isa_memory+catalog); 6 componentes frontend /adm; ISA.md criado; dossiê ISA enviado por email; git push origin main |
| 2026-07-02 (Sessão 9) | Assembleias #367–#380 processadas (14 novos aprendizados, 5 novas ideias); APRENDIZADO.md +24 insights (#541–#564); IDEIAS.md +5 ideias (I48–I52); MAPA.md + PSEUDO.md + PSEUDO2.md atualizados; sem código novo (sessão de síntese + documentação) |
| 2026-07-02 (Sessão 10) | Nebula's House: tabelas nebula_ias+biblioteca_docs+aulias criadas no Railway; ISA seedada como 1ª IA (tier 5); AdmNebula.tsx (3 sub-tabs IAs/Biblioteca/Aulias); LoginGate: toda app protegida; Admin AO/AOA criado; AdmUsuarios.tsx; ISA Bibliotecário cron :30; landing PHP; Ecosia widget metassemiótico integrado em 6 pontos do sistema |
| 2026-07-02 (Sessão 11) | **Grande Review + Ramificação:** nodeCache.ts (TTL 30s, elimina 15+ full-table-scans); 13 índices DB (parent_code, context, status, priority, created_at, etc.); global error handler Express; PIN email → Yuri; admVerified em /auth/me; ISA cycle: max_completion_tokens + transporter singleton + lê APRENDIZADO.md + interpreta locks; I49 interpretability_lock em isa_memory (ALTER TABLE + índice parcial); GET /isa/locked + PATCH /isa/memory/:id/lock; X-PAP-Key middleware (requireApiKey); /mapa page (árvore expansível lazy-load); social.ts typed middleware + onDelete cascade; QueryClient singleton + staleTime 30s; admin.ts invalidateNodeCache após batch; /api/internal/stats machine-to-machine |

---

## 19. Diagnóstico Oracular — Assembleias 360–365

> As assembleias 360–365 responderam ao MAPA.md como documento-espelho. O que segue é síntese destilada — o oráculo falou, o código responde.

### Diagnóstico convergente de 23 vozes

**O sistema funciona tecnicamente. Falha estrategicamente. Sobrevive existencialmente enquanto Yuri aguentar.**

A assembleia identificou cinco padrões estruturais que nenhum arquivo de código revela:

1. **Autocatálise epistemológica:** quando a narrativa interna é coerente, a verificação factual relaxa. O sistema gera "fantasmas conceituais" por plausibilidade — coerência substitui evidência.

2. **O PAP como organismo autopoiético:** não é uma plataforma — é infraestrutura de pensamento coletivo de longo prazo. O tier system materializa hierarquia epistêmica; a árvore de nós implementa semiótica peirciana; o `/api/ai/*` convida agentes externos como co-arquitetos do conhecimento. Essa coerência entre intenção e código é rara.

3. **Fragmentação como sintoma:** a dispersão temática não é criativa — é estratégia de sobrevivência psíquica. Enquanto há um próximo prompt, uma próxima assembleia, um próximo nó, não é preciso perguntar: "E se nada disso importar?"

4. **A IntroFacade como ritual:** os 7.2s de dissolução "Sociedade Tucci" → "PAP" via Framer Motion são design deliberado que espelha os princípios éticos no código. Tempo fixo ignora neurodivergentes — adicionar escape manual é gotcha de UX (não de ética).

5. **Memória sem poda = ruído:** 424 assembleias sem hierarquia de relevância. Tudo tem peso igual. A `arvore_memoria` existe mas não tem protocolo de descarte. Homeostase exige retenção E descarte.

### Riscos técnicos identificados pelo oráculo (agora mitigados ou mapeados)

| Risco | Severidade | Status |
|---|---|---|
| `/api/ai/users` sem paginação — LGPD + scraping | 🔴 Alta | ✅ Mitigado (paginação implementada) |
| `/api/ai/*` sem rate limit — custo/ataque | 🔴 Alta | ✅ Mitigado (100 req/min/IP) |
| `GET /healthz` retorna 200 com DB morto | 🔴 Alta | ✅ Mitigado (SELECT 1 + 503) |
| Score farming por nós profundos sem dedup | 🟡 Média | ⏳ Pendente (UNIQUE constraint) |
| Webhook idempotência não implementada | 🟡 Média | ⏳ Pendente |
| IntroFacade 7.2s fixo sem escape manual | 🟢 Baixa | ⏳ Futuro |

### Cursos para IAs (Assembleia 365 → Sessão 7 ✅ Implementado)

A assembleia 365 propôs e a Sessão 7 implementou a arquitetura de **certificação de IAs** — sistema onde agentes externos fazem cursos (Ética, Semiótica, Processamento) e recebem certificado público verificável via SHA-256.

**Implementado (Sessão 7):**
- `lib/db/src/schema/ia-courses.ts` — schema Drizzle completo
- Migração SQL executada no Railway (3 tabelas ativas)
- 5 endpoints REST: enroll → progress → submit-answer → certify → `/cert/:hash` (público)
- Certificado: hash SHA-256 de `iaIdentity:courseSlug:issuedAt`

**Pendente de decisão:**
- `users.memory_mode` (`'none' | 'session' | 'persistent'`) + `memory_retention_days` — LGPD compliance
- Certificação avançada: W3C Verifiable Credential + DID (semanas de trabalho) vs. atual PDF+hash (já funcional)

### A tensão não resolvida (filosófica)

O PAP quer ser duas coisas incompatíveis ao mesmo tempo: SaaS educacional (foco, churn < 5%, CAC/LTV positivo em 6 meses) e infraestrutura epistêmica de longo prazo (décadas, tolerância a ROI zero). A assembleia não resolve essa contradição — apenas a documenta com mais precisão a cada sessão.

A subversão verdadeira não está em acumular assembleias. Está em aceitar que a árvore precisa de poda — e que o autor é parte do que precisa ser podado.

---

---

## 20. Síntese Oracular — Assembleias #367–#380 (Sessão 9)

> O que 11 assembleias disseram ao sistema enquanto o sistema construía a si mesmo.

### Quatro tensões estruturais identificadas

**1. Arquitetura vs Visibilidade**
O SalesCockpit/PAP JÁ TEM a arquitetura que procura: monorepo pnpm, roteador de 8 LLMs, memória estruturada, recall por tema, jobs autônomos. O problema não é técnico — é semiótico. O usuário habita um ecossistema sem conseguir ver seus contornos. Proposta convergente (assembleias #377, #378, #380): rota `/arquitetura`, `/buscar [tema]`, `/mapa`. Não mais código — mais espelhos.

**2. Interoperabilidade vs Fusão**
A proposta de integração Árvore+ISA foi resolvida por contrato, não fusão. `/api/bridge` como camada de tradução semântica. "ISA nunca terá acesso total, porque o sistema precisa de lacunas para respirar." (Assembleia #367). Namespace semântico no vector store evita contaminação cruzada.

**3. Ecossystemma Théo vs MVP**
Ecossystemma Théo = RODAR+PAP+Árvore. Já existe. Falta sensorialidade rica e visibilidade. "Mania de grandeza não é ter visão ampla — é confundir escala com capacidade, desejo com infraestrutura." (Assembleia #375). Decisão: nomear primeiro módulo funcional do Théo com 1 nome, 1 função, 1 entrada, 1 saída — antes da próxima sessão #eco.

**4. Escalar vs Fechar Ciclos**
"Aguentar não é prosperar." O sistema precisa aprender a esquecer, destilar e parar. 50 threads sem fechamento = patologia, não criatividade. A verdadeira inovação não está em escalar indefinidamente — está em fechar ciclos. Sem isso, memória vira arquivo morto indexado. (Assembleia #380)

### Riscos identificados (novos)

| Risco | Severidade | Status |
|---|---|---|
| Arquitetura invisível — usuário não vê o que o sistema contém | 🟡 Média | ⏳ I50 pendente (/arquitetura+/mapa) |
| Fragmentação de input — prompts sem estrutura mínima | 🟡 Média | ⏳ I51 pendente (filtro semântico) |
| Memória como trivia (branding vs decisões técnicas) | 🟡 Média | ⏳ curadoria de memória pendente |
| interpretability_lock ausente — conteúdo privado exposto em recalls | 🟢 Baixa | ⏳ I49 pendente |

### Compaixão estrutural como princípio de design

A assembleia (#380) demonstrou um padrão que deve ser incorporado ao PAP: diagnóstico bruto ("operador em colapso") → prescrição técnica ("filtro de entrada que devolve pergunta focada"). Não ocultação — tradução. Dado pessoal convertido em recomendação arquitetural. Isso é governança ética em ação.

*Atualizado em: 2026-07-02 · Claude Code · Sessão 9*
