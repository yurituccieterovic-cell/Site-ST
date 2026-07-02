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
                    │      FLY.IO        │  ← PENDENTE
                    │  pap-api           │
                    │  região: gru (SP)  │
                    │  256MB / 1 CPU     │
                    │  auto start/stop   │
                    └──┬─────────────────┘
                       │
          ┌────────────▼──────────────────────┐
          │           NEON                     │
          │   PostgreSQL (gratuito)            │  ← PENDENTE
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
| API | Replit (legado) | ⚠️ Migrando → Fly.io |
| Banco de dados | Replit PostgreSQL (legado) | ⚠️ Migrando → Neon |
| Sessions | PostgreSQL (`session` table via connect-pg-simple) | ⚠️ Junto com o DB |
| Domínio | pap.sociedadetucci.com.br | 🔧 DNS a configurar |
| GitHub | yurituccieterovic-cell/pap | ✅ Ativo |

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
| PostgreSQL (Neon) | Banco principal |
| Drizzle ORM + drizzle-kit | Schema e migrações |
| connect-pg-simple | Cria e gerencia tabela `session` automaticamente |
| stripe.* schema | Criado por stripe-replit-sync |

### Tooling
| Ferramenta | Papel |
|---|---|
| pnpm workspaces | Monorepo |
| esbuild | Bundle do servidor (CJS) |
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
| Assembleia de IAs | Gmail → PAP | 🔧 Em configuração |

**Env vars de IA:** `OPENAI_API_KEY`, `AI_API_KEY`

---

## 11. Assembleia de IAs

```
Gmail (luddlocke@gmail.com)
     └── memórias da assembleia
              ↓ IMAP + App Password (em configuração)
         Claude Code / scripts
              ↓
         /api/ai/* → DB do PAP
              ↓
         Agentes integrados à plataforma
```

---

## 12. Deployment

### Fluxo CI/CD

```
código local (Termux/celular)
     │
     ▼
git push → github.com/yurituccieterovic-cell/pap
     │
     ├──→ Vercel (automático)
     │         └── build aliancapanorama/ → CDN
     │
     └──→ Fly.io (pendente — a configurar)
               └── Docker → pap-api (região gru/SP)
                            256MB RAM · 1 CPU shared
                            auto_stop / auto_start
                            min_machines_running: 0
```

### Fly.io (fly.toml)
- App: `pap-api` · Região: `gru` (São Paulo)
- Porta interna: 8080 · HTTPS forçado
- Auto start/stop (cold start em inatividade)
- 256MB RAM, 1 CPU compartilhado

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
**Env vars opcionais:** `OPENAI_API_KEY`, `AI_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `ALLOWED_ORIGINS`

---

## 15. Decisões de Arquitetura

| Decisão | Motivo |
|---|---|
| Contract-first (OpenAPI → codegen) | Nunca escrever tipos de API à mão |
| Viewport quadrado (~900×900px) | UI cockpit; forçado em `App.tsx` |
| Raiz da árvore por tier | tier ≥ 4 → "0" (tudo); tier < 4 → "1" (Ciências). Lock server-side em `canAccess()` |
| PostgreSQL session store | Sessões sobrevivem restart do servidor; necessário em Fly.io com auto-stop |
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
- **Amizade aceita = 2 linhas simétricas**. Pending = 1 linha (quem enviou). Auto-aceita se solicitações cruzadas.
- **`drizzle-kit push`** pode perguntar interativamente sobre renomeações — usar `executeSql` ou SQL raw se necessário.
- **Orval modo `single`** → schemas PascalCase (`LoginBody`, não `loginBodySchema`).
- **`lib/api-zod/src/index.ts`** deve exportar só `./generated/api`.
- **Sempre rodar codegen** após editar `openapi.yaml`.
- **`custom-fetch.ts`** tem `credentials: "include"` para cookies automáticos.
- **IntroFacade** usa `sessionStorage["pap_intro_seen_v1"]` para não repetir na mesma sessão.
- **IsaOwl** fases: `"flying" → "perched" → "bubble" → "chat"`. useEffect precisa de early return para evitar TS7030.
- **Push no GitHub:** se `git push` falhar com "Could not read [hash]...", usar bundle + clone limpo. Ver replit.md seção GitHub.
- **AI_API_KEY** ≠ `OPENAI_API_KEY`. O primeiro autentica chamadas externas para `/api/ai/*`; o segundo é para a API da OpenAI.

---

## 17. Pendências (por prioridade)

| # | Item | Depende de | Status |
|---|---|---|---|
| 1 | Criar conta Neon → `DATABASE_URL` | — | ⏳ |
| 2 | Migrar schema + dados para Neon | Neon criado | ⏳ |
| 3 | Deploy API no Fly.io (`pap-api`, região gru) | Neon + `DATABASE_URL` | ⏳ |
| 4 | Configurar DNS `pap.sociedadetucci.com.br` | Fly.io no ar | ⏳ |
| 5 | Obter `OPENAI_API_KEY` | — | ⏳ |
| 6 | Definir `AI_API_KEY` nas env vars do Fly.io + gerar valor | API no Fly.io | ⏳ |
| 7 | Ingerir 424 assembleias (JSON pronto em scratchpad) via `/api/ai/*` | API no ar + AI_API_KEY | ⏳ |
| 8 | Stripe: conectar em produção | Fly.io + domínio | ⏳ |
| 9 | Atualizar chave `DB_API_KEY` no banco compartilhado | — | ⏳ |
| 10 | SESSION_SECRET: gerar e definir no Fly.io | Fly.io | ⏳ |

**Concluído nesta sessão:**
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
- ✅ `/root/bin/voz` — sistema de voz para Claude Code (usa Termux:API + Google STT)

---

## 18. Histórico de Sessões

| Data | O que foi feito |
|---|---|
| 2026-07-02 (manhã) | Criação do MAPA.md; auto-login Termux → Ubuntu root; sofisticação do mapa a partir dos arquivos fonte; criação de PSEUDO.md, README.md, CLAUDE.md |
| 2026-07-02 (tarde) | Sistema `#secrets` + `/root/.pap-secrets`; Gmail IMAP/SMTP configurado; 424 assembleias extraídas; email com backup enviado para Yuri; AI_API_KEY + SESSION_SECRET gerados |
| 2026-07-02 (noite) | APRENDIZADO.md (526 insights, 290 assembleias); IDEIAS.md (31 ideias de programação); sync-assembleias.py (incremental ao #fim); /root/bin/voz (STT via Termux:API); CLAUDE.md + README.md atualizados |

---

*Atualizado em: 2026-07-02 · Claude Code*
