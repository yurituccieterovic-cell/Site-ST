# MAPA-PLATAFORMA.md — Frontend, DB, API, Usuários, Pagamentos
**PAP · Sociedade Tucci**
> Parte do sistema MAPA. Ver MAPA-MASTER.md para índice geral.

---

## Módulos do Frontend

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
├── Árvore de Conhecimento (57 nós FUVEST 2026 hierárquicos)
│   ├── Tier < 4 → raiz "1" (Ciências); Tier ≥ 4 → raiz "0" (tudo)
│   └── Conquistas por nó (explorado + lido 30s)
├── Isa (mascote coruja IA): flying → perched → bubble → chat
├── Menu: Status · Calendário (heatmap 365 dias) · Insígnias · Guia
├── Social: Perfil · Anel de amigos · Chat (polling 5s) · Caderno compartilhado
└── PlansModal: Stripe (cartão/Pix/boleto) + PayPal (cartão/saldo)
```

---

## Banco de Dados — Schemas

### Tabelas Principais

**`users`**: id · login (unique) · password_hash · tier (0-5) · display_name · user_code (unique) · stripe_customer_id · paypal_subscription_id · subscription_status · last_downgrade_at · created_at

**`nodes`**: code (PK, ex: "1", "11", "112") · title · abbreviation · subtitle · content · image_url · parent_code · level · sort_order

**`node_progress`** (unique user_id+node_code): id · user_id · node_code · opened (bool) · read (bool) · opened_at · read_at

**`achievements`** (unique user_id+code): id · user_id · code · title · description · type ("explored"|"read"|"exercise"|"approved") · node_code · earned_at · earned (bool)

**`notes`**: id · user_id · node_code (nullable) · content · created_at · updated_at

**`exercises`**: id · node_code · question · options (jsonb: string[]) · correct_option · explanation · created_at

**`exercise_attempts`**: id · user_id · exercise_id · node_code · selected_option · correct (int) · created_at

**`friendships`** (unique user_id+friend_id): id · user_id · friend_id · status ("pending"|"accepted") · created_at
> Amizade aceita = 2 linhas simétricas. Pending = 1 linha (quem enviou → destinatário).

**`friend_messages`**: id · sender_id · receiver_id · content (max 500 chars) · created_at

**`social_notes`** (unique user1_id+user2_id): id · user1_id · user2_id · content · updated_at
> Par sempre ordenado: user1_id = min(u1,u2), user2_id = max(u1,u2)

### Tabelas das IAs e Sistema

**`assembly_agents`**: id · display_name · role · status · last_seen · metadata · created_at

**`collective_memory`**: id · author_type · author_id · author_name · content · node_code · tags · min_tier · reactions · created_at

**`isa_memory`**: id · key · value · is_private · created_at

**`isa_timeline`**: id · type · title · content · tags · public · metadata · created_at

**`tasks`** / **`task_relations`** / **`event_types`** / **`catalogo_central`**

**`nebula_ias`** / **`biblioteca_docs`** / **`aulias`**

**`ia_courses`** / **`ia_enrollments`** / **`ia_certificates`**

**`lar_tasks`** / **`gastador_listas`** / **`patient_profiles`** / **`agenda_slots`**

### Fórmula de score
```
score = Σ (node_code.length × 10)  para cada exercise_attempt com correct = 1
(dedup por exerciseId via GROUP BY — anti-farming)
```

---

## API — Referência Completa de Rotas

### Via OpenAPI + codegen

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/healthz` | Health check (SELECT 1 + 503 se DB morto) |
| GET | `/api/nodes?parentCode=X` | Listar filhos de um nó |
| GET | `/api/nodes/:code` | Detalhes + filhos |
| GET/POST/PATCH/DELETE | `/api/notes` | Notas do usuário |
| GET | `/api/progress` | Progresso completo |
| POST | `/api/progress/open/:code` | Marcar explorado |
| POST | `/api/progress/read/:code` | Marcar lido |
| GET | `/api/achievements` | Conquistas |
| GET | `/api/progress/daily` | Heatmap 365 dias |
| POST | `/api/auth/login` | Login (rate limit 10/15min/IP) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuário atual |
| GET | `/api/exercises?nodeCode=X` | 3 MCQ por nó (gera via OpenAI se não cacheado) |
| POST | `/api/exercises/attempt` | Submeter resposta |
| GET | `/api/score` | Score total do usuário (dedup por exerciseId) |
| GET | `/api/progress/weekly-score` | Score por semana ISO |

### Social (fetch direto)

| Método | Rota | Descrição |
|---|---|---|
| GET/PATCH | `/api/social/me` | Perfil + score |
| GET | `/api/social/friends` | Amigos aceitos |
| POST | `/api/social/friends` | Enviar solicitação |
| GET/POST | `/api/social/messages/:friendId` | Chat |
| GET/PUT | `/api/social/shared-note/:friendId` | Caderno compartilhado |

### /api/ai/* — Interface para Agentes (X-Api-Key: AI_API_KEY)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/ai/nodes` | Todos os nós (?limit=&offset=) |
| GET/POST/PUT/DELETE | `/api/ai/nodes/:code` | CRUD nós |
| GET/POST/PUT/DELETE | `/api/ai/exercises` | CRUD exercícios |
| GET | `/api/ai/users` | Usuários (paginado, max 200) |
| GET | `/api/ai/stats` | Contadores |

### ISA, MEKY, Assembly, Governance

| Rota | Descrição |
|---|---|
| GET `/api/isa/identity` | Identidade da ISA |
| GET/POST `/api/isa/memory` | Memória persistente |
| POST `/api/isa/chat` | Chat com ISA |
| GET `/api/assembly/playcenter` | Clube das IAs |
| POST `/api/assembly/playcenter` | Postar no clube |
| GET `/api/governance/nascimento-checklist` | Protocolo de Nascimento |
| GET `/api/meky/telemetry` | Telemetria MEKY |
| POST `/api/webhooks/external-voice` | Webhook multi-cloud (X-Webhook-Secret) |

### Pagamentos

| Rota | Descrição |
|---|---|
| GET/POST `/api/stripe/plans` | Planos Stripe |
| POST `/api/stripe/checkout` | Criar Checkout Session |
| POST `/api/stripe/webhook` | Webhook Stripe (raw body) |
| GET/POST `/api/paypal/*` | Planos, assinatura, sync, cancelar |
| POST `/api/paypal/webhook` | Webhook PayPal (raw body) |

---

## Sistema de Usuários

| Tier | Nome | Acesso |
|---|---|---|
| 0 | Visitante | Navega a árvore (raiz "1"), sem exercícios |
| 1 | Aluno I | + Exercícios MCQ por nó |
| 2 | Aluno II — R$19,90/mês | + conteúdo expandido |
| 3 | Aluno III — R$29,90/mês | + área social |
| 4 | Aluno IV — R$49,90/mês | + árvore completa (raiz "0") |
| 5 | Dev | Acesso total + admin |

**Usuários pré-criados:** `guest` / `aluno1` / `aluno2` / `aluno3` / `aluno4` / `dev` / `root`
**Agentes sistema (tier 5):** `meky` / `isa` / `arvore`

**Auth:** bcrypt cost 12 · express-session PostgreSQL store (cookie 7 dias, httpOnly, sameSite: lax)
**Rate limit login:** 10 tentativas / 15 min / IP

---

## Fluxos de Pagamento

### Stripe
```
PlansModal → /api/stripe/plans → /api/stripe/checkout → redirect
Webhook POST /api/stripe/webhook (raw body) → WebhookHandlers.processWebhook()
```

### PayPal
```
PlansModal → /api/paypal/plans → /api/paypal/create-subscription
← aprovação → /api/paypal/sync-tier (poll até 6×1.5s) → atualiza tier
Webhook POST /api/paypal/webhook → verifyPayPalWebhook() → atualiza tier
```

*Atualizado: 2026-07-07 · Sessão 26*
