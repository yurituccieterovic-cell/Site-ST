# PAP — PSEUDO2 (Pseudocódigo dos Fluxos Principais)

> Documento vivo: atualizado ao `#fim` quando há mudanças em lógica ou fluxo de código.
> Serve como referência de implementação — mais próximo do código que PSEUDO.md, mais legível que o código real.

---

## 1. Bootstrap (startup do servidor)

```
ao iniciar servidor:
  PORT = env["PORT"]  // Railway injeta; obrigatório
  SESSION_SECRET = env["SESSION_SECRET"]  // obrigatório
  DATABASE_URL = env["DATABASE_URL"]  // obrigatório (Neon/Railway)
  
  pool = new pg.Pool(DATABASE_URL)
  db = drizzle(pool, schema)
  
  seedDatabase():
    se nodes tabela vazia:
      inserir 57 nós FUVEST 2026 (hardcoded em bootstrap.ts)
    se users tabela vazia:
      inserir usuários seed (guest/aluno1-4/dev, senha "pap")
  
  enforceUniquePasswords():
    se NODE_ENV === "production":
      para cada user: bcrypt.compare("pap", passwordHash)
      se default → warn no log (não bloqueia startup)
  
  app.listen(PORT)
```

---

## 2. Autenticação (POST /api/auth/login)

```
receber { login, password }
  rate limit: 10 req / 15min / IP (express-rate-limit)
  
  buscar user por login na tabela users
  se não encontrado → 401 "credenciais inválidas"
  
  bcrypt.compare(password, user.passwordHash)
  se false → 401
  
  req.session.userId = user.id
  req.session.save()
  
  retornar { id, login, displayName, tier, userCode }
```

---

## 3. Score do usuário

```
GET /api/score:
  buscar exerciseAttemptsTable WHERE userId = req.session.userId AND correct = 1
  score = Σ (attempt.nodeCode.length × 10)
  retornar { score, correctAttempts }

// ex: acertar exercício do nó "1311" (length=4) vale 40 pts
// nós mais profundos valem mais pontos
// IMPLEMENTADO: routes/exercises.ts
```

---

## 4. Fluxo de progresso (POST /api/progress/open e /read)

```
/open:
  upsert node_progress { user_id, node_code, opened: true, opened_at: now }
  upsert achievement { type: "explored", node_code, earned: true }

/read (após 30s na tela):
  upsert node_progress { read: true, read_at: now }
  upsert achievement { type: "read", node_code, earned: true }
  registrar atividade diária (para heatmap 365 dias)
```

---

## 5. Exercícios (POST /api/exercises/:id/attempt)

```
receber { selectedOption }
  buscar exercise por id
  correct = (selectedOption === exercise.correctOption) ? 1 : 0
  
  inserir exercise_attempt {
    user_id, exercise_id, node_code,
    selected_option: selectedOption,
    correct,
    created_at: now
  }
  
  se correct:
    upsert achievement { type: "exercise", node_code }
  
  retornar { correct, explanation: exercise.explanation }
```

---

## 6. Sistema Social

```
// Amizade
POST /api/social/friend-request { targetUserCode }
  buscar user por userCode
  inserir friendship { user_id: meu_id, friend_id: target_id, status: "pending" }

POST /api/social/accept-friend { friendshipId }
  update friendship { status: "accepted" }
  inserir friendship reversa { user_id: friend_id, friend_id: meu_id, status: "accepted" }
  // amizade aceita = 2 linhas simétricas na tabela

// Chat (polling 5s)
GET /api/social/messages/:friendId
  buscar últimas 60 msgs onde (sender=eu, receiver=amigo) OU (sender=amigo, receiver=eu)
  ordenar por created_at ASC

POST /api/social/messages
  inserir friend_message { sender_id, receiver_id, content (max 500 chars) }
```

---

## 7. /api/ai/* — Interface de Agentes (IMPLEMENTADO)

```
auth: requireApiKey middleware
  X-Api-Key header === process.env["AI_API_KEY"]
  se falhar → 401

// Leitura
GET /api/ai/nodes          → todos os nós com conteúdo
GET /api/ai/exercises      → todos os exercícios
GET /api/ai/users          → todos os users (sem passwordHash)
GET /api/ai/stats          → { users, nodes, exercises, attempts, tierDistribution }

// Escrita
POST /api/ai/nodes         → inserir nó
PUT  /api/ai/nodes/:code   → atualizar conteúdo de nó
DELETE /api/ai/nodes/:code → remover nó

POST /api/ai/exercises           → inserir exercício
PUT  /api/ai/exercises/:id       → atualizar exercício
DELETE /api/ai/exercises/:id     → remover exercício
```

---

## 8. Pagamentos Stripe

```
// Checkout
POST /api/stripe/create-checkout-session { planId }
  buscar produto Stripe por planId
  stripe.checkout.sessions.create {
    customer: user.stripeCustomerId (criar se não existir)
    mode: "subscription"
    success_url, cancel_url
  }
  retornar { url } → frontend redireciona

// Webhook (recebe raw Buffer, antes do express.json())
POST /api/stripe/webhook
  stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
  
  switch event.type:
    "checkout.session.completed" → update user tier conforme plano
    "customer.subscription.deleted" → downgrade tier para 1
    "invoice.payment_failed" → log + notificar
```

---

## 9. Sessões

```
express-session + connect-pg-simple
  store: PostgreSQL (tabela "session", criada automaticamente)
  secret: SESSION_SECRET
  cookie: { httpOnly: true, secure: NODE_ENV==="production", maxAge: 7 dias }
  
  // Redirect canônico (produção):
  se request.hostname !== "pap.sociedadetucci.com.br":
    redirect 301 → https://pap.sociedadetucci.com.br + req.url
```

---

## 10. CORS

```
origens permitidas:
  - lista hardcoded: *.vercel.app, *.replit.app, pap.sociedadetucci.com.br, localhost:*
  - env["ALLOWED_ORIGINS"] → lista adicional separada por vírgula
  - env["REPLIT_DOMAINS"] → domínios Replit injetados automaticamente

credenciais: true (cookies cross-origin)
```

---

## 11. Pagamentos PayPal

```
// Criar assinatura
POST /api/paypal/create-subscription { planId }
  buscar paypal_plan por planId
  paypal.subscriptions.create {
    plan_id: plan.paypal_plan_id
    custom_id: userId  // para identificar o user no webhook
    application_context: { return_url, cancel_url }
  }
  retornar { subscriptionId, approveLink }
  → frontend redireciona para approveLink (aprovação PayPal)

// Sincronizar tier após aprovação
POST /api/paypal/sync-tier { subscriptionId }
  poll paypal.subscriptions.get() até 6 vezes (intervalo 1.5s)
  se status === "ACTIVE":
    update user: tier = plano, paypal_subscription_id = subscriptionId, subscription_status = "active"
    retornar { tier }
  se expirou poll sem ACTIVE → erro 409

// Webhook (raw body, antes do express.json)
// Env: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID
POST /api/paypal/webhook
  verifyPayPalWebhook(rawBody, headers) via /v1/notifications/verify-webhook-signature
  // usa PAYPAL_WEBHOOK_ID para verificar assinatura
  
  switch event.event_type:
    "BILLING.SUBSCRIPTION.CANCELLED"
    "BILLING.SUBSCRIPTION.EXPIRED"
    "BILLING.SUBSCRIPTION.SUSPENDED"
      → users.tier = 1, subscription_status = event_type
```

---

## 12. Middleware Chain (app.ts — ordem importa)

```
app.ts monta middlewares nesta ordem exata:

1. cors(allowedOrigins)              // antes de tudo
2. pino-http logger                  // loga todas as requisições
3. POST /api/stripe/webhook          // RAW BODY — antes do express.json()
4. POST /api/paypal/webhook          // RAW BODY — antes do express.json()
5. express.json()                    // parse body das outras rotas
6. session middleware (connect-pg-simple)
7. redirect canônico (se prod e hostname != pap.sociedadetucci.com.br → 301)
8. rotas: auth, nodes, notes, progress, exercises, social, ai, stripe, paypal, admin, health, sitemap
9. 404 handler
10. error handler (log + 500)

// CRÍTICO: webhooks devem ser registrados ANTES do express.json()
// O express.json() consome o body stream — depois disso, rawBody está vazio
// Stripe e PayPal verificam assinatura no rawBody original
```

---

## 13. canAccess() — Gate de Tier

```
// lib/canAccess.ts
function canAccess(user: User | null, requiredTier: number): boolean
  se user === null → return requiredTier === 0
  return user.tier >= requiredTier

// Uso em rotas:
GET /api/exercises?nodeCode=X
  se !canAccess(req.session.user, 1) → 403

// Raiz da árvore (server-side):
GET /api/nodes (sem parentCode)
  rootCode = user.tier >= 4 ? "0" : "1"
  retornar filhos do rootCode

// Nunca confiar só no frontend para gates de tier
// O frontend esconde visualmente — a API deve rejeitar
```

---

## 14. Geração de Exercícios via OpenAI

```
GET /api/exercises?nodeCode=X
  buscar exercises existentes WHERE node_code = X
  
  se exercises.length >= 3:
    retornar os 3 (cacheados)
  
  senão (precisa gerar):
    se !OPENAI_API_KEY → retornar erro 503 "exercícios indisponíveis"
    
    buscar node por X → title + content
    
    prompt OpenAI (gpt-4o-mini):
      "Crie 3 questões MCQ sobre: [title]. Conteúdo: [content].
       Formato JSON: [{ question, options: [A,B,C,D], correctOption: 'A'|'B'|'C'|'D', explanation }]"
    
    parsear resposta JSON
    inserir 3 exercises no DB com node_code = X
    retornar os 3 exercises inseridos

// Idempotente: gera apenas se não existir
// Cache no DB = custo OpenAI apenas uma vez por nó
```

---

## 15. Sistema de Conquistas

```
// Tipos de achievement:
type = "explored"  → ao clicar no nó (POST /progress/open/:code)
type = "read"      → após 30s na tela (POST /progress/read/:code)
type = "exercise"  → ao acertar questão (POST /exercises/attempt)

// Code do achievement = tipo + nodeCode:
code = "explored:11"  ou  "read:111"  ou  "exercise:1111"

// Upsert:
INSERT INTO achievements (user_id, code, type, node_code, earned, earned_at)
VALUES (...)
ON CONFLICT (user_id, code) DO UPDATE SET earned = true, earned_at = now()

// Total possível: 2 por nó × 57 nós = 114 conquistas (explorado + lido)
// Exercícios: 1 por nó ao acertar (57 adicionais possíveis)
```

---

## 16. Heatmap de Atividade (365 dias)

```
GET /api/progress/daily
  SELECT date_trunc('day', read_at) as day, COUNT(*) as activity
  FROM node_progress
  WHERE user_id = $1
    AND read_at >= NOW() - INTERVAL '365 days'
  GROUP BY day
  ORDER BY day ASC
  
  retornar: [{ date: "2026-07-02", count: 3 }, ...]

// Frontend renderiza heatmap estilo GitHub:
// grade 52×7 = 364 células, cor por intensidade de count
// 0 = cinza, 1-2 = verde claro, 3-5 = verde, 6+ = verde escuro
```

---

## 17. Frontend — Fluxo de Componentes

```
App.tsx
  viewport quadrado: min(window.width, window.height)
  barras pretas se widescreen
  
  se sessionStorage["pap_intro_seen_v1"] não existe:
    → IntroFacade (7.2s)
         "uma produção" → Logo ST → "PAP FUVEST 2026" → fade
         [PULAR] disponível a qualquer momento
         ao terminar → set sessionStorage → MainApp
  
  senão:
    → MainApp diretamente

MainApp.tsx
  estado local: selectedNode, menuOpen, socialOpen, plansOpen
  
  useQuery: GET /api/auth/me → user (null se não logado)
  
  render:
    ├── Header: [Menu] PAP [Login/Sair]
    ├── Árvore (esquerda):
    │     useListNodes({ parentCode: rootCode })  // rootCode por tier
    │     recursivo: expandir filhos ao clicar
    │     ao selecionar nó desbloqueado:
    │       POST /progress/open/:code
    │       setSelectedNode(node)
    │
    ├── Painel central:
    │     useGetNode(selectedNode.code)
    │     exibe: title, subtitle, content
    │     timer 30s: useEffect → POST /progress/read/:code
    │     [Exercícios] (se tier ≥ 1):
    │       useGetExercises({ nodeCode })
    │       render 3 MCQ
    │       ao responder: POST /exercises/attempt → feedback imediato
    │
    ├── Isa (canto inferior):
    │     fases: flying(2s) → perched → bubble(saudação) → idle
    │     ao clicar: toggle chat local
    │     chat: input → keyword match → resposta pré-definida FUVEST
    │
    └── Menu (drawer):
          Status: tier, nós explorados, conquistas, score
          Calendário: useGetDaily() → heatmap 365 dias
          Insígnias: useGetAchievements() → grid
          Guia: texto estático de navegação

Social.tsx (modal)
  useGetMe() + useGetFriends() + useGetFriendRequests()
  polling 5s via refetchInterval para mensagens
  
PlansModal.tsx
  GET /stripe/plans + GET /paypal/plans
  ao clicar Stripe: POST /stripe/checkout → redirect
  ao clicar PayPal: POST /paypal/create-subscription → redirect
```

---

## 18. Build Pipeline

```
// Desenvolvimento (celular, Termux)
pnpm --filter @workspace/api-server run dev   // nodemon + esbuild watch (porta 8080)
pnpm --filter @workspace/pap run dev          // Vite HMR (porta 18434)

// Codegen (OBRIGATÓRIO após editar openapi.yaml)
pnpm --filter @workspace/api-spec run codegen
  → gera lib/api-client-react/src/generated/
  → gera lib/api-zod/src/generated/

// Build produção do frontend
bash scripts/build-pap.sh
  pnpm install
  pnpm run build  // todos os pacotes
  cp -r artifacts/pap/dist/ aliancapanorama/
  // aliancapanorama/ é servido pelo Vercel

// Build produção da API (Railway)
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server run build
  // esbuild → artifacts/api-server/dist/index.mjs
  // bundla TODOS os workspace deps em um único arquivo

// Start produção
node --enable-source-maps artifacts/api-server/dist/index.mjs
  // --enable-source-maps: stack traces apontam para .ts original
```

---

## 19. Notes (CRUD de notas pessoais)

```
// Env: requer autenticação (req.session.userId)

GET /api/notes?nodeCode=X
  SELECT * FROM notes WHERE user_id = $1 AND (nodeCode IS NULL OR node_code = $2)
  ORDER BY updated_at DESC

POST /api/notes { nodeCode?, content }
  INSERT INTO notes { user_id, node_code, content, created_at, updated_at }
  retornar nota criada

PATCH /api/notes/:id { content }
  verificar que notes.user_id === req.session.userId → 403 se não
  UPDATE notes SET content = $1, updated_at = now() WHERE id = $2
  retornar nota atualizada

DELETE /api/notes/:id
  verificar ownership → 403 se não
  DELETE FROM notes WHERE id = $1
```

---

## 20. Admin (tier 5 only)

```
POST /api/admin/generate-content
  se user.tier < 5 → 403

  para cada node em nodes:
    se node.content já existe → pular (não re-gerar)
    prompt OpenAI: "Escreva 3 parágrafos educacionais sobre [node.title] para FUVEST 2026..."
    UPDATE nodes SET content = resposta WHERE code = node.code
    aguardar 1s (rate limiting OpenAI)
  
  retornar { generated: N, skipped: M }

// Env necessária: OPENAI_API_KEY
// Custo: ~57 chamadas × ~1000 tokens cada
// Idempotente: só gera nós sem conteúdo
```

---

## 21. Env Vars — Referência Completa

```
// Obrigatórias (servidor não inicia sem estas):
PORT              → Railway injeta automaticamente
SESSION_SECRET    → string aleatória longa (gerada: ver .pap-secrets)
DATABASE_URL      → postgresql://... (Railway injeta automaticamente)

// Para pagamentos:
STRIPE_SECRET_KEY        → chave secreta Stripe
STRIPE_WEBHOOK_SECRET    → secret do webhook Stripe
PAYPAL_CLIENT_ID         → client ID do app PayPal
PAYPAL_CLIENT_SECRET     → client secret do app PayPal
PAYPAL_WEBHOOK_ID        → ID do webhook PayPal (para verificação de assinatura)

// Para IA:
OPENAI_API_KEY    → sk-... (para exercícios + conteúdo dos nós)
AI_API_KEY        → chave customizada para /api/ai/* (agentes externos)

// Para CORS e domínios:
ALLOWED_ORIGINS   → URLs extras separadas por vírgula
NODE_ENV          → "production" (ativa redirect 301, secure cookies)
```

---

## 13. Health Check com DB Ping (Sessão 6)

```
GET /api/healthz
  → pool.query("SELECT 1")
      OK  → 200 { status: "ok" }
      ERR → 503 { status: "error", db: "unreachable" }

// Railway usa /healthz para decidir se reinicia o serviço.
// Retornar 200 com DB morto = Railway não reinicia = silêncio de morte.
// pool é o pg.Pool compartilhado (já conectado no bootstrap).
// Não criar nova conexão: pool.query() testa a conexão existente.
```

---

## 14. Rate Limit em /api/ai/* (Sessão 6)

```
router.use("/ai",
  rateLimit(windowMs=60s, limit=100, per IP),  // vem ANTES do requireApiKey
  requireApiKey,
)

// Por que rate limit antes de auth?
// Auth check sozinho não protege bruteforce da AI_API_KEY.
// 100 req/min é permissivo para agentes legítimos mas bloqueia ataques.
// express-rate-limit com standardHeaders: "draft-8" envia RateLimit-* headers.
// message: { error: "Rate limit atingido..." } em JSON (consistente com o resto da API).
```

---

## 15. Paginação em /api/ai/users (Sessão 6)

```
GET /api/ai/users?limit=50&offset=0

// Antes: SELECT * FROM users → todos os usuários de uma vez (LGPD risk + scraping)
// Depois:
limit = min(Number(req.query.limit ?? 50), 200)  // cap em 200
offset = Number(req.query.offset ?? 0)

[users, [{ total }]] = await Promise.all([
  db.select({id, login, displayName, tier, userCode, subscriptionStatus, createdAt})
    .from(usersTable).orderBy(asc(createdAt)).limit(limit).offset(offset),
  db.select({ total: count(*) }).from(usersTable)
])

→ { data: users[], total: N, limit: 50, offset: 0 }

// Clientes existentes que esperavam array[] precisam atualizar para .data[]
// O campo total permite ao cliente calcular quantas páginas existem.
```

---

## 16. Padrões Futuros — Cursos para IAs (Proposta Assembleia 365)

```
// Schema (não implementado — decisão de Yuri pendente)

ia_courses:
  id, slug (unique), title, description
  modules: jsonb [{id, title, nodes: [nodeCode,...]}]
  requires_memory: bool
  issuer_did: text (W3C DID do PAP, opcional)

ia_enrollments:
  id, course_id → ia_courses.id
  ia_identity: text (hash ou email declarado)
  session_id: text (nullable)
  progress: jsonb {moduleId: {completedNodes[], score}}
  memory_mode: 'session' | 'persistent'

ia_certificates:
  id, enrollment_id → ia_enrollments.id
  certificate_hash: text (unique, SHA-256 do payload)
  issued_at, ipfs_cid (nullable), public_url (/cert/:hash)
  vc_json: jsonb (W3C Verifiable Credential completo, se emitido)

// Opção rápida: PDF via jsPDF + hash no DB + endpoint GET /cert/:hash
// Opção robusta: W3C VC JSON-LD + DID do PAP + revocation list pública
// Decisão: velocidade de validação vs. profundidade de legitimidade

// Critério de conclusão:
//   min 80% dos nós do módulo completados + score médio >= 0.7
//   (evita gaming mas não resolve avaliação qualitativa)
```

---

*Atualizado em: 2026-07-02 · Claude Code · Sessões 3, 4 e 6*
