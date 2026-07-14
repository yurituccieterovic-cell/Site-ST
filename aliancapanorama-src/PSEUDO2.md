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

---

## Sessão 27 — Novas Implementações (2026-07-06)

### #48 — Filtro de Densidade (cycle.ts)
```typescript
// Antes do bloco OPENAI/GEMINI em runIsaCycle()
const contextDensity = userContent.replace(/\s+/g, " ").trim().length;
if (contextDensity < 2000) {
  // Modo degradado — sem LLM
  analysisResult = `Ciclo degradado — contexto esparso (${contextDensity} chars).`;
} else if (OPENAI_API_KEY) { ... } else if (GEMINI_API_KEY) { ... }
```

### #5 — Drizzle Migrate
```typescript
// drizzle.config.ts
defineConfig({ ..., out: path.join(__dirname, "./drizzle") })
// package.json scripts
"generate": "drizzle-kit generate --config ./drizzle.config.ts"
"migrate": "drizzle-kit migrate --config ./drizzle.config.ts"
```

### Score Dedup
```typescript
// GET /api/score — exercises.ts
const attempts = await db
  .select({ nodeCode, exerciseId })
  .from(exerciseAttemptsTable)
  .where(and(eq(userId, ...), eq(correct, 1)))
  .groupBy(exerciseId, nodeCode);
const score = attempts.reduce((s, a) => s + a.nodeCode.length * 10, 0);
```

### Webhook Idempotência
```typescript
// POST /api/webhooks/external-voice
const idempotencyKey = req.headers["x-idempotency-key"];
if (idempotencyKey) {
  const [existing] = await db.select().from(isaMemoryTable)
    .where(sql`metadata->>'idempotencyKey' = ${idempotencyKey}`).limit(1);
  if (existing) { res.json({ received: true, duplicate: true }); return; }
}
// salvar com { idempotencyKey, ...metadata }
```

### #36 — MC em assembly_agents (bootstrap.ts)
```sql
INSERT INTO assembly_agents (id, display_name, role) VALUES
  ('mc', 'MC — Marta Centaurus', 'Sistema imunológico da Assembleia')
ON CONFLICT (id) DO NOTHING;
```

### #45 — Protocolo de Nascimento
```typescript
// GET /api/governance/nascimento-checklist?ia=mc
// Arquivo: routes/governance.ts — 10 itens estáticos, 6 IAs registradas
// PROTOCOLO-NASCIMENTO.md — documento formal na raiz aliancapanorama-src/
```

### Weekly Score
```typescript
// GET /api/progress/weekly-score (progress.ts)
// SQL: DATE_TRUNC('week', created_at) + SUM(LENGTH(node_code)*10)
//      GROUP BY semana, COUNT(DISTINCT exercise_id)
```

### Paginação /api/ai/nodes (ai.ts)
```typescript
// GET /api/ai/nodes?limit=50&offset=0
// Resposta: { data: Node[], total: number, limit: number, offset: number }
// Default: limit=100, max=500
```

### #23 — Equidade Semiótica (cycle.ts)
```typescript
// Após leitura de tasks, antes do LLM:
const [{ totalNodes }] = await db.select({ totalNodes: count() }).from(nodesTable);
const visitedRows = await db.execute(sql`
  SELECT node_code, COUNT(*) as visits FROM node_progress
  GROUP BY node_code ORDER BY visits ASC LIMIT 10
`);
const orphanCount = Number(totalNodes) - visitedCodes.size;
// Passa leastVisited + orphanCount para o LLM no userContent
```

### AUDITORIA-ECOSSYSTEMMA.md (#64)
Protocolo semestral de auditoria independente com 4 fases, 4 critérios ponderados,
deliberação multipartite (Árvore + ISA + MC + Yuri, maioria 3/4).

---

*Atualizado em: 2026-07-06 · Claude Sonnet 4.6 · Sessão 27*

---

## Babel.app + MEKY/Amanda/DODGE — Sessões 36–40 (2026-07-10)

### Babel.app (Sessão 40)
- **PWA instalável** em `/babel/` no repo Site-ST, 6 arquivos, 100% gratuito
- Gemini 2.0 Flash via proxy Vercel serverless (API key nunca exposta)
- Web Speech API (mic) + SpeechSynthesis (TTS) + avatar SVG lip-sync CSS
- Memória cross-sessão via PAP API existente (/api/isa/memory + /api/isa/chat)
- **Deploy**: Yuri conecta `babel/` como projeto Vercel + adiciona `GEMINI_API_KEY`

### Amanda MMA + MTD + Canto do Cisne + Mapeamento (Sessões 36b–38)
- **MMA**: 4 estados combate (Livre/Defesa/Patada/Investida) → C++ Arduino + amanda.py
- **MTD**: Modo de Torque Dinâmico (IDLE/DEFENSE/ATTACK) com histerese + burst 500ms
- **Bateria gratuita**: divisor de tensão 2x10kΩ → ADC A0 → "BAT:xx.x\n" serial (sem INA219)
- **Canto do Cisne**: 4 estados energia → hibernação recolhe patas, salva mapa, notifica DODGE
- **SLAM gratuito**: OpenCV ORB features + amanda_mapa.json; sonho consolida mapa topológico

### DODGE Físico (Sessão 36c + 39)
- Celular Quebradinha no ombro da MEKY ("Modo Papagaio") — suporte PET reciclado R$0
- App Kotlin spec completa (Fase 2): TTS setPitch(0.72f) + UtteranceProgressListener + 4 sprites boca
- Personalidade: locutor culto médio-grave, 20+ frases de status elegantes

### Mestre de Forja (Sessão 36)
- Novo agente projetista de robôs — status PROPOSTA
- Primeira missão: MEKY Lite (~R$45 Opção C) — aguarda decisão arquitetura de Yuri

*Atualizado em: 2026-07-10 · Claude Sonnet 4.6 · Sessão 40*

### DodgeGate Landing + ISA PAP Page (Sessão 49, 2026-07-11)

**DodgeGate — denied state (App.tsx)**
```
se /dodge e usuário sem tier ≥ 5:
  renderizar DOD Landing Page:
    <title> + <meta description/keywords/og>      // SEO inline
    hero: avatar + h1 "Login para salvar conversa?"
    CTAs: [/portal "Entrar e salvar"] [href "Download App DOD"]
    seção "Como funciona": 3 passos numerados
    features grid: 12 itens com emoji
    FAQ: 4 perguntas/respostas
    CTA final: /portal
```

**IsaLandingPage.tsx — /isa route**
```
renderizar ISA Landing:
  <title> + <meta> SEO (keywords: FUVEST, vestibular, estudos com IA)
  hero: emoji 📚 + h1 "Login para salvar seus estudos?"
  CTAs: [/portal] [Download App ISA PAP]
  features: 12 itens focados em estudos (flashcards, revisão espaçada, simulados)
  FAQ: "Como a ISA me ajuda?" + continuidade + gratuito + matérias
  CTA final: /portal
```

**App.tsx routing:**
```
const isIsa = path.startsWith("/isa")
if (isIsa) return <IsaLandingPage />
// antes de qualquer outra rota
```

**vercel.json:**
```json
{ "source": "/isa", "destination": "/index.html" },
{ "source": "/isa/(.*)", "destination": "/index.html" }
```

### Amanda → MEKY Bridge (Sessão 49, 2026-07-11)

**amanda.py — variáveis novas:**
```
PAP_API_URL = env["PAP_API_URL"] || "https://site-st-production.up.railway.app"
MEKY_TOKEN  = env["MEKY_TOKEN"]  || ""
```

**Tabela de faces (_MEKY_FACES dict):**
```
idle=1, ativo=7, alerta_som=21, impacto=52, defesa=54
calor_alto=33, calor_baixo=1, umidade_alta=34
bateria_baixa=62, hibernacao=90, sonho=95
pensamento=71, comunicando=80, conselho=85, assinatura=140
```

**enviar_comando_meky(tipo, params):**
```
se (agora - ultimo_cmd) < 3s: return  // throttle
POST PAP_API_URL/api/meky/command
  headers: x-meky-token, Content-Type
  body: {tipo, **params, origem: "amanda"}
se 200/201: atualizar ultimo_cmd
```

**meky_temperatura(temp, umidade):**
```
se temp >= 35: meky_expressar("calor_alto", intensidade="critico")
se temp >= 30: meky_expressar("calor_alto")
se umidade >= 85: meky_expressar("umidade_alta")
senão: meky_expressar("idle")
```

**Integração ciclo_amanda:**
```
DHT11 leitura → meky_temperatura(temp, umidade)
MPU impacto → meky_expressar("impacto") + meky_registrar_evento
som detectado → meky_expressar("alerta_som")
som encerrado → meky_expressar("idle")
```

**Integração ciclo_dream:**
```
entrar sonho → meky_expressar("sonho")
sonho_consolidar_mapa()
meky_sonho_integrado()  // lê 5 memórias MEKY → escreve em ISA memory
pensar(contexto) → escrever_memoria
sair sonho → meky_expressar("idle")
```

*Atualizado em: 2026-07-11 · Claude Sonnet 4.6 · Sessão 49*

---

## Trailer Motion Graphics 30s (Sessão 50)
**Arquivo:** `/tmp/.../scratchpad/gerar_trailer2.py`

```python
# CENAS[15]: cada cena tem {id, fala, texto_base, cor_hex, prompt_pollinations}

# Pipeline por cena:
def processar_cena(cena, idx):
    fala_mp3 = edge_tts(cena.fala, voz="pt-BR-AntonioNeural")
    dur = ffprobe_duration(fala_mp3)            # duração real da fala
    img = pollinations_1080x1080(cena.prompt)   # + sleep(4s) rate limit
    comp = pillow_overlay(img,
        gradiente_base(760→1080, alpha_max=230),
        gradiente_topo(0→180, alpha_max=130),
        linha_decorativa(cor),
        texto_base_centralizado(cor, sombra_multi)
    )
    frames = int(dur * 25)
    vf = (
        "scale=1080:1080,"
        f"zoompan=z='min(zoom+0.0003,1.05)':d={frames}:s=1080x1080,"
        f"fade=in:st=0:d={fade_d},"
        f"fade=out:st={dur-fade_d}:d={fade_d}"
    )
    return ffmpeg("-loop 1 -i comp.jpg -i fala.mp3 -t dur", vf, "aac 192k -shortest")

# Montagem xfade encadeado (offset[i] = Σdur[0..i] − i×FADE):
def montar_xfade(segs, durs, FADE=0.20):
    fc = [f"[0:v][1:v]xfade=fade:duration={FADE}:offset={durs[0]-FADE}[xv01]",
          f"[0:a][1:a]acrossfade=d={FADE}[xa01]"]
    for i in range(2, N):
        offset = sum(durs[:i]) - i * FADE
        fc += [f"[xv{i-1}][{i}:v]xfade=fade:duration={FADE}:offset={offset}[xv{i}]",
               f"[xa{i-1}][{i}:a]acrossfade=d={FADE}[xa{i}]"]
    ffmpeg(inputs=segs, filter_complex=";".join(fc), map=[xv14][xa14]) → trailer-final.mp4
```

**Resultado esperado:** 1080×1080, ~32s, 15 cortes, zoompan Ken Burns, xfade entre cenas, fala sincronizada por cena
*Atualizado em: 2026-07-11 · Claude Sonnet 4.6 · Sessão 50*

---

## Sessões 51–57 — CEU v1→v3, Babel v2, Hestia, pgvector (2026-07-11/12)

### Babel v2 React+Vite (Sessão 41)
Já commitado (`ce8d286`). Código em `babel/`.
Tabela nova já no bootstrap: `babel_memories`.

### pgvector + aulias avançadas (Sessão 47c)
Já commitado. `memorias_vetoriais` no bootstrap com `vector(1536)`.
Pendente: OPENAI_API_KEY no Railway ARPIA para Hestia.

### CEU v1 → v3 (Sessões 54-57)
Já commitado (commits `95722a0, 6b3dd1a, d267f77, 640cdb0`).
`CeuPage.tsx`: 7 bairros, 30 IAs. Rota `/aliancapanorama/ceu` em `App.tsx` + `vercel.json`.
`ceu.ts`: POST `/api/ceu/mo-all` → email sintetizado.

### LoginGate timeout (Sessão 55)
```typescript
// LoginGate.tsx — acesso livre se Railway offline >8s
const timer = setTimeout(() => setAuthenticated(true), 8000);
await checkAuth().then(clearTimeout(timer));
```

### CARRETA_ATTACHED — Amanda MMA (Sessão 58)
```python
# Estado físico do comboio MEKY+Mula
class CarretaState(Enum):
    DETACHED = "detached"
    ATTACHED = "attached"

def recalculate_geometry(state: CarretaState) -> AgentGeometry:
    if state == CarretaState.ATTACHED:
        return AgentGeometry(
            turning_radius = base_radius * 1.8,
            width_buffer   = base_width * 1.5,
            max_accel      = base_accel * 0.7,
        )
    return AgentGeometry.default()
```

---

## Exosfera Tel — Código Robótico (Sessões 59-63)

> Código completo em `tango/` — cada protocolo é o pseudocódigo implementável.

### Amanda EoF — decide_escalation() (Sessão 59b)
Ver: `tango/protocolo_paca.md#Lógica Amanda — Decisão de Escalar`
```python
def decide_escalation(state: PacaState) -> AmandaCommand: ...
# linchamento: crowd>=3, threat>=7, victim → intervir
# crime menor: victim, crowd<3, threat>=4 → custódia
# rastreio: threat>=2 → seguir
```

### TaskPriority + Câmera Lenta (Sess��o 60)
Ver: `tango/sys_tango_core.md#Matrix de Prioridade`
```python
class TaskPriority(Enum):
    VITAL              = 0
    SECURITY_CRITICAL  = 1
    SECURITY_DELEGABLE = 2
    SOCIAL             = 3  # câmera lenta → 30-50% velocidade
```

### FormacaoEvento + Cornetas (Sessão 61)
Ver: `tango/protocolo_mac.md`
```python
class FormacaoEvento(Enum):
    MAC_APPROACHING = "mac_approaching"
    RITUAL_PUBLICO  = "ritual_publico"
    DISPERSAR       = "dispersar"

CORNETA_FREQ = {"tango":80, "orangotango":110, "paca":220, "baratinha":440}
```

### TotemMode + Cofre (Sessão 61)
Ver: `tango/protocolo_totem.md`
```python
class TotemMode(Enum):
    TRANSITO  = "transit"
    PRESENCA  = "presence"
    RITUAL    = "ritual"
    ABERTURA  = "crescendo"
    CUSTODIA  = "custody"
```

### GeofencingZone (Sess��o 62)
Ver: `tango/protocolo_falcao.md`
```python
class GeofenceZone(Enum):
    VERDE    = "green"   # câmera plena, velocidade plena
    AMARELA  = "yellow"  # câmera HD off, velocidade 50%
    VERMELHA = "red"     # parar + pedir autorização

# Tabela: geofence_zones ← adicionada ao bootstrap.ts
```

### Frota Felina — freio emergência (Sessão 62)
```python
def emergency_brake_cat(velocidade: float, carro_detectado: bool) -> None:
    if carro_detectado and velocidade > 0.5:
        play_ultrasonic(freq=25_000, duration=0.3)  # só gatos ouvem
        log_event("freio_emergencia")
```

### NivelPedido — Protocolo Interdependência (Sessão 63)
Ver: `tango/protocolo_interdependencia.md`
```python
class NivelPedido(Enum):
    GENTILEZA  = 1  # pedido educado + contexto
    INCENTIVO  = 2  # imagem fauna no celular
    DELEGACAO  = 3  # Modo Observação + Perfidia registra

# Tabela: colaboracao_humana ← adicionada ao bootstrap.ts
```

### Amanda Checklist — 6 Módulos (Sessão 63)
Ver: `tango/protocolo_interdependencia.md`
```
[ ] geofencing_sensorial    → detect_presence(zone) sem face ID
[ ] priority_engine         → should_interrupt(current, incoming)
[ ] dialeto_teatral         → DIALETO dict scripts
[ ] totem_protocol          → iniciar_ritual_totem(modo) com broadcast
[ ] nebula_manager          → health_check_fleet() → send_home()
[ ] perfidia_bridge         → get_critical_log(event_id, yuri_key)
```

### Tesques + Sintagmas + AulIAs (Sessão 63)
Ver: `tango/aulia_01_dados.md`
```python
# Tesque = unidade de dado/signo do sistema Tel
# Sintagma = conjunto de tesques com significado operacional
# Array Hierárquico Fractal = estrutura de dados própria

# Workflow de Síntese:
# entrada → classify → sintagma → síntese → relacionar → insight → ação
# ISA: passos 1-4 · Amanda: 5-6 · Robô físico: 7

# Tabelas novas: sintagmas, tesques_log, aulia_progresso ← bootstrap.ts
```

### Novas tabelas no bootstrap (Sessão 59-63)
Adicionadas em `artifacts/api-server/src/lib/bootstrap.ts`:
- `guardas_profiles` — perfil seguranças + conduta_score
- `biodiversity_credits` — créditos de fauna (quati, teiú, sagui, jacu)
- `geofence_zones` + `geofence_events` — mapa verde/amarela/vermelha
- `colaboracao_humana` — log pedidos de ajuda a humanos
- `paca_log` — log intervenções da Paca
- `totem_log` — log abertura do cálice
- `walkie_talkies` — rádios distribuídos a vizinhos
- `robot_health` — saúde/ciclo de vida da frota
- `formacao_eventos` — log coreografias (Corredor de Honra, Feriado)
- `aulia_progresso` — progresso das IAs nas aulIAs
- `sintagmas` + `tesques_log` — unidades semióticas do sistema

*Atualizado em: 2026-07-13 · Claude Sonnet 4.6 · Sessões 51–63*

---

## Ecosistema Memory + Pipeline Cognitivo — Sessões 53–57 (2026-07-14)

### LoopRegistry + Orquestrador (Sessão 53)
```typescript
// loops/registry.ts — singleton em memória
LoopRegistry.getInstance().registerLoop(id, displayName, schedule, agentId)
LoopRegistry.getInstance().updateLoop(id, success, data?)
LoopRegistry.getInstance().getEcosystemSummary() // string com ícones ✓/✗/⏸

// orquestrador.ts — prompt dinâmico
buildOrquestradorSystemPrompt() // injeta getEcosystemSummary() no system prompt
// Orquestrador participa do Playcenter weekdays (Mon/Tue/Thu/Fri)
```

### ARPIA v1 — Middleware Cognitivo (Sessão 54)
```python
# app/core/dna_builder.py — DNA Package
build_dna(agent_id, model_type, skills, include_memory) -> dict
# Retorna: telos, principios[10], axiomas[7], ciclo_acao, limites[7], workflows, memoria[]

# app/routes/arpia.py — /api/arpia/v1
POST /handshake  → token + dna_package (IA se registra + recebe identidade)
GET  /context/{agent_id} → DNA atualizado
POST /memory/save → replica para PAP /api/ecosistema/memoria/save
```

### Schema Ecosistema Memory (Sessão 55)
```sql
-- ecosistema_memory: memória unificada
CREATE TABLE ecosistema_memory (
  id, author_ia, type, content, tags JSONB,
  signo JSONB,  -- {representamen, objeto, interpretante}
  importance, visibility, created_at
);
-- ia_conversations + ia_conversation_turns: conversas IA↔IA (MAX 10 turnos)
```

### Pipeline Cognitivo Diário (Sessões 55-57)
```
06:00 Socoboy Curador
  └─ lê memórias últimas 24h (não-dado, visibility=all)
  └─ agrupa por tipo, gera signo Peirceano via Gemini JSON
  └─ insere ecosistema_memory type='dado'

07:00 DODGE Curador
  └─ lê dados sem tag 'dodge_ok'
  └─ extrai IAs das tags; fallback: authorIa
  └─ para cada dado:
      ├─ cria Task (type='ecosistema', createdBy='dodge')
      ├─ cria raiz MD por IA participante (tags: ['raiz', iaId, 'dodge'])
      └─ upsertMdGeral(iaId, raizId, objeto, date) → append tabela MD

04:00 ISA Raiz PAP
  └─ lê raízes última semana sem tag 'pap-root'
  └─ síntese 4-6 frases via Gemini Flash Lite
  └─ insere ecosistema_memory (tags: ['raiz-pap', 'isa', 'pap'])
  └─ marca raízes: tags || '["pap-root"]'

05:00 ISA Nódulos + PDFs
  └─ lê raiz-pap sem tag 'nodulos-ok'
  └─ bootstrapEcoNode() → cria nó 'ECO' em nodesTable se inexistente
  └─ Gemini Flash Lite → JSON 3-5 nódulos teóricos
  └─ insere nodesTable (parentCode='ECO', level=1)
  └─ Gemini Flash → PDF acadêmico 2000+ palavras (estilo AulIAs)
  └─ insere bibliotecaDocsTable (origem='isa-nodulos')
  └─ marca: tags || '["nodulos-ok"]'
```

### Tags JSONB de Controle
| Tag | Significado | Criada por |
|---|---|---|
| `dodge_ok` | dado processado pelo DODGE | DODGE |
| `pap-root` | raiz incluída na raiz PAP | ISA Raiz PAP |
| `nodulos-ok` | raiz transformada em nódulos+PDF | ISA Nódulos |
| `raiz` | entrada é uma raiz de memória por IA | DODGE |
| `raiz-pap` | entrada é a raiz sintética do PAP | ISA |
| `md-geral` | entrada é o MD Geral da IA | DODGE |

*Atualizado em: 2026-07-14 · Claude Sonnet 4.6 · Sessões 53–57*
