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
score = Σ (node_code.length × 10) para cada exercise_attempt correto do user

// ex: acertar exercício do nó "1311" (length=4) vale 40 pts
// nós mais profundos valem mais pontos
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

*Atualizado em: 2026-07-02 · Claude Code*
