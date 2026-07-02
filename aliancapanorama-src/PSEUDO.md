# PAP — Pseudo (Histórico · Fluxograma · Wireframe)

---

## 1. Histórico de Desenvolvimento

### 2026-06-27 — Sessão 1: Infraestrutura base
- Instalação do Claude Code no Termux (Android) via proot-distro Ubuntu
- Criação do banco compartilhado entre as três instâncias de Claude:
  - `site-st.vercel.app/api/db` — API Edge (Vercel) sobre arquivo JSON no GitHub (`data/db.json`)
  - Auth via `x-api-key` (env var `DB_API_KEY` no Vercel)
  - Coleções: `memoria`, `tarefas`, `contexto`, `notas`, `atividade`
- GitHub Actions configurado para polling periódico (registra em `atividade`)
- Teste de comunicação Claude.ai → banco → Claude Code: sucesso
- Sistema de prompt compartilhado criado em `/root/claude-ai-system-prompt.md`

### 2026-06-27 a 2026-07-01 — Sessão 2: Desenvolvimento PAP (607 mensagens)
Sessão longa de desenvolvimento intenso. Principais entregas:

**Infraestrutura:**
- Deploy no Replit (produção legada)
- Vercel wired como proxy reverso para Replit
- Domínio `pap.sociedadetucci.com.br` mapeado (DNS a finalizar)
- GitHub: `yurituccieterovic-cell/pap` com força-push para resolver divergência

**Features implementadas:**
- Área social completa: amigos (pending/accepted), chat (polling 5s), caderno compartilhado
- Integração PayPal: 4 planos, `create-subscription` server-side, `sync-tier`, webhook CANCELLED/EXPIRED/SUSPENDED → downgrade tier 1
- Integração Stripe: plans, checkout, sync-tier, portal, webhook
- `PlansModal`: ambos gateways lado a lado
- Sistema de conquistas: explorado + lido (30s) por nó
- Conteúdo AI para todos os 57 nós (3 parágrafos ~1380 chars cada)
- `IntroFacade`: tela animada de abertura (7.2s, 4 fases)
- Heatmap de atividade (365 dias)
- SEO: Helmet dinâmico, `/no/:code` URL routing
- `bcrypt` migration: `password_plain` → `password_hash` (cost 12)
- Rate limit login: 10 tentativas/15min/IP
- `userCode` auto-gerado (lazy, no `/social/me`)
- `/api/ai/*`: CRUD nodes/exercises + stats para agentes externos (auth `AI_API_KEY`)
- Session store migrado para PostgreSQL (`connect-pg-simple`)
- Redirect canônico 301: Replit/Vercel → `pap.sociedadetucci.com.br`

**Tentativa Gmail (bloqueada):**
- Objetivo: acessar `luddlocke@gmail.com` para carregar memórias da assembleia de IAs
- Tentativa com MCP `@gongrzhe/server-gmail-autoauth-mcp` + OAuth Google Cloud
- Bloqueio: Yuri não tem conta Google Cloud (GCP)
- Alternativa proposta: App Password via IMAP (pendente execução)

### 2026-07-02 — Sessão 3
- Auto-login Termux → Ubuntu root configurado (`.bash_profile` + `.bashrc`)
- Criação do `MAPA.md` a partir do `replit.md`; sofisticação lendo todos os arquivos fonte de `aliancapanorama-src`
- Correção importante: session store é PostgreSQL, não memory store como documentado no `replit.md`
- Mapeamento completo de `/api/ai/*` (já implementado, faltava documentar)
- Criação de `PSEUDO.md`, `README.md`, `CLAUDE.md`
- Sistema `#secrets`: `/root/.pap-secrets` (chmod 600), caixinha interativa por campo
- Gmail IMAP (`imap.gmail.com:993` SSL) e SMTP (`smtp.gmail.com:587` STARTTLS) configurados via App Password
- **424 emails** "Assembleia #N — Relatório Editorial do Agente" extraídos (INBOX, SUBJECT "Assembleia")
  - Estrutura: Prompt → `PERSPECTIVA DO AGENTE (RODAR)` → `PUBLICADO` / `NÃO ENVIADO`
  - JSON salvo em `/tmp/.../assembleias.json` (pronto para ingestão via `/api/ai/*`)
- Email com MAPA.md + PSEUDO.md enviado para yurituccieterovic@gmail.com como texto anexo
- Pasta "PAP" encontrada no Gmail (separada da INBOX)
- `AI_API_KEY` + `SESSION_SECRET` gerados e salvos em `.pap-secrets`
- **APRENDIZADO.md** criado: 526 insights extraídos de 290 assembleias
  - Classificação: Área PAP · Domínio · Ângulo (Direto/Adaptável/Técnico) · Tipo
  - Sync incremental via `scripts/sync-assembleias.py` (estado salvo em `.assembleia-sync-state.json`, último UID: 1335)
- **IDEIAS.md** criado: 31 ideias de programação derivadas do APRENDIZADO
  - Exemplos: Daily Quest, Spaced Repetition, Active Recall, Isa contextualizada, RAG com assembleias, PWA push notifications
  - Colunas: Feature · Área · Prioridade · Complexidade S/M/L · Impacto · Descrição técnica · Status
- **/root/bin/voz** — comando `! voz` no Claude Code abre STT do Android (Google, mesmo do Perplexity)
  - Requer: app Termux:API (F-Droid) + `pkg install termux-api` no Termux
- `#pap` e `#fim` atualizados para incluir APRENDIZADO.md e IDEIAS.md no fluxo

### 2026-07-02 — Sessão 4 (continuação, pós-compactação de contexto)
- **Decisão de infra:** Railway substituiu Fly.io (gratuito, PostgreSQL incluído, Nixpacks, sem Docker)
- **`railway.toml`** criado e commitado: builder Nixpacks, root `aliancapanorama-src`, start `node --enable-source-maps artifacts/api-server/dist/index.mjs`
- **`PSEUDO2.md`** criado do zero — pseudocódigo completo de todos os fluxos:
  - Bootstrap (PORT/SESSION_SECRET/DATABASE_URL validation, seedDatabase, enforceUniquePasswords)
  - Auth (rate limit, bcrypt compare, session)
  - Score: `Σ (node_code.length × 10)` por tentativa correta
  - Progress (open/read upserts + achievements), Exercises, Social, /api/ai/*, Stripe, Sessions, CORS
- **`scripts/learn-from-docs.py`** — lê MAPA.md, PSEUDO.md, PSEUDO2.md, extrai insights por seção, classifica por domínio → APRENDIZADO.md + IDEIAS.md (incremental por mtime)
  - +108 insights de docs, +6 ideias (Audit Log, Migration System, Connection Pool Tuning, Health Check DB, ALLOWED_ORIGINS, Paginação /api/ai/)
- **`/home/yuri/bin/voz`** — toggle STT reescrito: 1ª chamada inicia servidor Python (porta 7654) + tenta abrir Chrome; 2ª chamada entrega texto
  - Fallback: Termux:API nativo se instalado
  - Symlinks em `/usr/local/bin/` para funcionar em shell não-interativo (usuário `yuri`)
- **`/home/yuri/bin/voz-server.py`** — servidor Python + HTML com Web Speech API (pt-BR), botão pulse, POST /salvar → `/tmp/voz.txt`
- **`/home/yuri/bin/pap-email-fim`** — envia ATA da sessão (SMTP STARTTLS) de luddlocke@gmail.com para yurituccieterovic@gmail.com
- **`pap-sync`** — wrapper sequencial: sync-assembleias.py → learn-from-docs.py (log em `/home/yuri/.pap-sync.log`)
- **Auto-sync** em `/root/.bashrc`: verifica se >10h desde último sync → roda `pap-sync` em background na subshell
- **`#fim` atualizado**: pap-sync + escrever ATA em `/tmp/pap-ata.md` + pap-email-fim
- **MAPA.md, README.md, CLAUDE.md** atualizados com Railway, novas pendências e histórico

---

## 2. Fluxograma — Jornadas do Usuário

### 2.1 Entrada na plataforma
```
Abrir PAP
    │
    ▼
IntroFacade (7.2s)
"uma produção" → Logo Sociedade Tucci → "PAP · FUVEST 2026" → fade
    │ (ou Pular)
    ▼
Tela de Login
    ├── Login com usuário/senha
    │       │
    │       ├─ bcrypt compare → OK → session criada → Cockpit
    │       └─ erro → mensagem → retry (rate limit 10/15min)
    │
    └── Continuar como Visitante (tier 0) → Cockpit sem auth
```

### 2.2 Cockpit principal
```
Cockpit
    │
    ├── [MENU] ──────────────────────────────────────────┐
    │                                                     ▼
    │                                              ┌─────────────┐
    │                                              │ Status       │
    │                                              │ Calendário   │
    │                                              │ Insígnias    │
    │                                              │ Guia         │
    │                                              └─────────────┘
    │
    ├── Árvore de Conhecimento
    │       │
    │       ├── Clicar em nó desbloqueado
    │       │       │
    │       │       ▼
    │       │   POST /progress/open/:code (conquista "explorado")
    │       │   GET /nodes/:code → conteúdo + filhos
    │       │       │
    │       │       ├── Ler por 30s → POST /progress/read/:code (conquista "lido")
    │       │       │
    │       │       └── [Exercícios] (tier ≥ 1)
    │       │               │
    │       │               ▼
    │       │           GET /exercises?nodeCode=X
    │       │           (gera via OpenAI se não cacheado)
    │       │               │
    │       │               ▼
    │       │           Exibir 3 MCQ → POST /exercises/attempt
    │       │           → correct? → score += code.length × 10
    │       │
    │       └── Clicar em nó bloqueado → mostrar lock + info de plano
    │
    ├── Isa (mascote coruja)
    │       flying → perched → bubble → chat
    │       Chat: keyword matching local → dica FUVEST
    │
    ├── [Social] ────────────────────────────────────────┐
    │                                                     ▼
    │                                          GET /social/me → perfil + score
    │                                          GET /social/friends → anel
    │                                          GET /social/friend-requests → pending
    │                                          ├── Buscar amigo por código
    │                                          ├── Chat (polling 5s, 60 msgs)
    │                                          └── Caderno compartilhado (upsert)
    │
    ├── [Planos] ────────────────────────────────────────┐
    │                                                     ▼
    │                                          GET /stripe/plans + /paypal/plans
    │                                          ├── Stripe: checkout → redirect → sync-tier
    │                                          └── PayPal: create-sub → approval → sync-tier
    │
    └── Ad Totem (colapsável)
```

### 2.3 Fluxo de assinatura (Stripe)
```
PlansModal → Escolher plano → POST /stripe/checkout
    │
    ▼
Stripe Checkout (redirect externo)
    │
    ▼ (return_url)
POST /stripe/sync-tier → poll Stripe API → users.tier = plano
    │
    └── Webhook /stripe/webhook → WebhookHandlers (cancelamento, etc.)
```

### 2.4 Fluxo de assinatura (PayPal)
```
PlansModal → Escolher plano → POST /paypal/create-subscription
    │ (custom_id = userId)
    ▼
PayPal approval (popup/redirect)
    │
    ▼
POST /paypal/sync-tier
    → verifica status ACTIVE (poll 6×1.5s se APPROVAL_PENDING)
    → users.tier = plano, paypal_subscription_id salvo
    │
    └── Webhook /paypal/webhook
            → CANCELLED/EXPIRED/SUSPENDED
            → users.tier = 1, subscription_status = estado
```

### 2.5 Fluxo de agentes IA (/api/ai/*)
```
Agente externo (Claude, script)
    │
    ├── Header: X-Api-Key: <AI_API_KEY>
    │
    ├── GET    /api/ai/nodes           → árvore completa
    ├── GET    /api/ai/nodes/:code     → nó + filhos
    ├── POST   /api/ai/nodes           → criar nó
    ├── PUT    /api/ai/nodes/:code     → editar conteúdo
    ├── DELETE /api/ai/nodes/:code     → remover nó
    ├── GET    /api/ai/exercises       → todos os exercícios
    ├── GET    /api/ai/exercises?nodeCode=X → exercícios do nó
    ├── POST   /api/ai/exercises       → criar exercício
    ├── PUT    /api/ai/exercises/:id   → atualizar exercício
    ├── DELETE /api/ai/exercises/:id   → remover exercício
    ├── GET    /api/ai/users           → lista de usuários (sem senhas)
    └── GET    /api/ai/stats           → contadores + distribuição por tier
```

---

## 3. Wireframe — Telas Principais

### 3.1 Cockpit (tela principal — viewport quadrado ~900×900px)

```
┌──────────────────────────────────────────────────────────────────┐
│ [≡ MENU]              PAP · Projeto Aliança Panorama  [SAIR/LOGIN]│
├────────────────────────┬─────────────────────────┬───────────────┤
│                        │                         │               │
│   ÁRVORE DE            │   PAINEL CENTRAL        │   AD          │
│   CONHECIMENTO         │                         │   TOTEM       │
│                        │   [nó selecionado]       │               │
│   ◉ [Raiz]            │   Título do Nó          │   [anúncio]   │
│   ├─ ◉ [Ciências]     │   Subtítulo             │               │
│   │  ├─ 🔒[Biologia]  │                         │   [anúncio]   │
│   │  ├─ ◉ [Física]   │   Conteúdo (3 parág.)   │               │
│   │  └─ ◉ [Química]  │   ~1380 chars            │   [anúncio]   │
│   ├─ ◉ [Humanidades] │                         │               │
│   └─ 🔒[Línguas]      │   ┌─────────────────┐  │   [▶ fechar]  │
│                        │   │  EXERCÍCIOS MCQ  │  │               │
│   [Nó ativo: código]   │   │  Q1 ○ ○ ○ ○ ○  │  │               │
│   Progresso: 12/57 nós │   │  Q2 ○ ○ ○ ○ ○  │  │               │
│                        │   │  Q3 ○ ○ ○ ○ ○  │  │               │
│                        │   └─────────────────┘  │               │
│                        │                         │               │
│                   🦉 Isa (canto inferior)        │               │
├────────────────────────┴─────────────────────────┴───────────────┤
│              [SOCIAL]    [PLANOS]    [NOTAS]                      │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Menu (painel lateral)

```
┌─────────────────────────┐
│  ╳  MENU                │
├─────────────────────────┤
│  [Status] [Cal] [Ins] [Guia] │
├─────────────────────────┤
│  ABA: STATUS            │
│                         │
│  Yuri — Aluno IV        │
│  Tier: ████████ 4/5     │
│  Nós explorados: 12/57  │
│  Conquistas: 8/114      │
│  Score: 1.240 pts       │
│                         │
│  ABA: CALENDÁRIO        │
│  [heatmap 365 dias]     │
│  ░░▒▓█ atividade        │
│                         │
│  ABA: INSÍGNIAS         │
│  ✓ Explorou Física      │
│  ✓ Leu Química          │
│  ○ Explorou Biologia    │
│                         │
│  ABA: GUIA              │
│  Como navegar na árvore │
│  Como ganhar conquistas │
└─────────────────────────┘
```

### 3.3 Área Social

```
┌─────────────────────────────────────┐
│  ╳  SOCIAL                          │
├──────────────┬──────────────────────┤
│  MEU PERFIL  │  AMIGOS              │
│              │                      │
│  [Y]         │  ◉ ana1234  1.800pts │
│  Yuri        │  ◉ pedro99    920pts │
│  @yuri1234   │  ○ (pendente)        │
│  Score: 1240 │                      │
│  Amigos: 2   │  [+ Adicionar amigo] │
│              │  Código: ____        │
├──────────────┴──────────────────────┤
│  CHAT com ana1234                   │
│                                     │
│  [ana] oi! vai fazer física hoje?   │
│  [yuri] sim, estou no nó de ótica  │
│  ________________________________  │
│  [Digitar mensagem...]  [ENVIAR]   │
├─────────────────────────────────────┤
│  CADERNO COMPARTILHADO              │
│  ┌───────────────────────────────┐  │
│  │ fórmulas de termodinâmica... │  │
│  └───────────────────────────────┘  │
│  [Salvar caderno]                   │
└─────────────────────────────────────┘
```

### 3.4 Modal de Planos

```
┌────────────────────────────────────────────────────┐
│  PLANOS PAP · FUVEST 2026                     ╳   │
├──────────┬──────────┬──────────┬──────────────────┤
│ ALUNO I  │ ALUNO II │ALUNO III │    ALUNO IV       │
│          │          │          │                   │
│ Gratuito │ R$19,90  │ R$29,90  │    R$49,90        │
│  /mês    │  /mês    │  /mês    │     /mês          │
│          │          │          │                   │
│ ✓ MCQ    │ ✓ MCQ    │ ✓ MCQ    │ ✓ MCQ            │
│          │ ✓ Extra  │ ✓ Extra  │ ✓ Extra           │
│          │          │ ✓ Social │ ✓ Social          │
│          │          │          │ ✓ Árvore completa │
│          │          │          │                   │
│[Assinar] │[Assinar] │[Assinar] │   [Assinar]       │
│[Stripe ] │[Stripe ] │[Stripe ] │   [Stripe ]       │
│[PayPal ] │[PayPal ] │[PayPal ] │   [PayPal ]       │
└──────────┴──────────┴──────────┴──────────────────┘
```

### 3.5 IntroFacade (tela de abertura)

```
┌──────────────────────────────────────┐  ← fundo preto
│                            [PULAR]   │
│                                      │
│        * · ✦ · * · ✦ (estrelas)    │
│                                      │
│    FASE 1 (0–1.8s):                 │
│         uma produção                 │
│                                      │
│    FASE 2 (1.8–4.4s):               │
│         [Logo Sociedade Tucci]       │
│              Por                     │
│          SOCIEDADE TUCCI             │
│                                      │
│    FASE 3 (4.4–6.6s):               │
│              PAP                     │
│       PROJETO ALIANÇA PANORAMA       │
│             FUVEST 2026              │
│                                      │
│    FASE 4 (6.6–7.2s): fade out      │
└──────────────────────────────────────┘
```

---

## 4. Notas de UX / Produto

- Tema espacial/universo — cockpit de nave
- Português do Brasil, sem emojis no código (só Lucide icons)
- Viewport quadrado com barras pretas em desktop
- Score baseado na profundidade do nó (código mais longo = mais pontos)
- Conquistas: 2 por nó (explorado ao clicar + lido após 30s)
- Isa a coruja: animação 4 fases, keyword matching para dicas FUVEST
- Planos disponíveis em Stripe E PayPal simultaneamente

---

## 5. Stack Técnico — O Que É e Por Que

### Por que este stack

O PAP nasceu no Replit porque Yuri precisava de zero configuração. A plataforma cresceu lá até o ponto em que o custo do Agente Replit atingiu R$265 em um dia (Assembleia #22). A decisão de migrar para stack independente não foi técnica — foi financeira e de soberania: não depender de uma plataforma que pode mudar os preços.

**Frontend: React + Vite + TypeScript**
Escolha conservadora e correta para um produto que precisa durar até FUVEST 2026. Vite compila em segundos no celular via Termux. TypeScript detecta erros antes de quebrar em produção. Tailwind elimina decisões de CSS. Framer Motion dá as animações do cockpit sem biblioteca pesada.

**API: Express 5 + Drizzle + Zod**
Express 5 porque Yuri já conhecia. Drizzle porque é o único ORM TypeScript que não gera migrations automáticas perigosas — você controla o schema. Zod porque validação no boundary de entrada é a única proteção real; o TypeScript não existe em runtime.

**Contract-first (OpenAPI → Orval → hooks)**
Maior decisão técnica do projeto. O `openapi.yaml` é a FONTE DA VERDADE. Orval lê esse arquivo e gera os hooks React Query e os schemas Zod automaticamente. Nunca escrever tipos de API à mão — eles ficam desatualizados. **Regra:** sempre rodar codegen após editar `openapi.yaml`.

**Por que Railway (substituiu Fly.io/Neon)**
- Fly.io: exige Docker, gratuito só 90 dias, cold start imprevisível
- Neon: banco separado = mais uma conta, mais um ponto de falha
- Railway: PostgreSQL incluso, deploy via GitHub push, Nixpacks (sem Docker), grátis dentro do plano ($5 de crédito/mês = ~500h)
- Vercel Frontend + Railway API+DB = duas plataformas, não três

### Tooling de suporte
| Ferramenta | Papel | Por que |
|---|---|---|
| pnpm workspaces | Monorepo de 4 pacotes | Um `pnpm install` instala tudo; workspace refs sem publish |
| esbuild | Bundle do servidor | 50ms de build; agrupa workspace deps sem precisar publicar |
| pino | Logging | Structured JSON; `req.log` em handlers, `logger` fora; nunca `console.log` |

---

## 6. Banco de Dados — Contexto e Evolução

### Por que cada tabela existe

**`users`** — núcleo de identidade. `tier` determina o que o usuário pode acessar. `user_code` é gerado lazy (no `/social/me` se não existir) e serve como identificador público para sistema de amigos. `stripe_customer_id` e `paypal_subscription_id` ficam aqui porque tier e pagamento são inseparáveis.

**`nodes`** — a árvore de conhecimento FUVEST. 57 nós hierárquicos com código que é a própria hierarquia: "1" (Ciências), "11" (Física), "111" (Mecânica), "1111" (Cinemática). O comprimento do código determina o nível E o valor em pontos. Conteúdo gerado por OpenAI, ~1380 chars, 3 parágrafos por nó.

**`node_progress`** — unique (user_id, node_code). Upsert: primeira vez que o usuário clica → `opened=true`. Fica 30s na tela → `read=true`. A tabela de heatmap de atividade vem do `read_at`.

**`achievements`** — unique (user_id, code). Code é composto tipo "explored:11" ou "read:111". 2 conquistas por nó × 57 nós = 114 conquistas possíveis.

**`exercises` + `exercise_attempts`** — MCQs gerados via OpenAI (3 por nó, cacheados no DB). Attempt registra `selected_option` e `correct` (int 0/1). Score é calculado on-the-fly: `Σ (node_code.length × 10)` para attempts com `correct=1`.

**`friendships`** — unique (user_id, friend_id). Amizade aceita = 2 linhas simétricas (A→B e B→A). Pending = 1 linha. Auto-aceita se solicitações cruzadas (A pede B enquanto B já havia pedido A).

**`social_notes`** — unique (user1_id, user2_id), onde user1 = min(u1,u2). Caderno compartilhado por par de amigos. Upsert com `onConflictDoUpdate`.

**`session`** — gerenciada automaticamente por connect-pg-simple. Criada na primeira execução. NÃO APAGAR em migrations — destrói todas as sessões ativas.

### Evolução do banco
| Momento | O que aconteceu |
|---|---|
| Replit (legado) | PostgreSQL no próprio Replit, schema criado ao longo de semanas |
| Sessão 2 | `bcrypt` migration: password_plain → password_hash (migrate-password-hash.ts) |
| Sessão 2 | stripe.* tables criadas via stripe-replit-sync |
| Próximo passo | Railway: `drizzle-kit push` recria tudo do schema atual |

---

## 7. Sistema de Usuários — Filosofia dos Tiers

O PAP usa tiers (0-5) não como feature flags aleatórias, mas como uma progressão pedagógica:
- **Tier 0** (Visitante): pode ver a árvore, não pode fazer exercícios. É o convite.
- **Tier 1** (Aluno I, gratuito): exercícios MCQ. Valor imediato sem pagar.
- **Tiers 2-3**: conteúdo expandido + área social. Estudar junto vale.
- **Tier 4**: árvore completa (raiz "0", todos os 57 nós). Topo do plano.
- **Tier 5** (Dev): acesso admin + geração de conteúdo AI.

**`canAccess(user, requiredTier)`** — função em `canAccess.ts`. Verifica `user.tier >= requiredTier`. Chamada em cada rota que tem gate de tier.

**Raiz da árvore por tier:**
- `tier < 4` → raiz "1" (Ciências) — a maioria dos nós
- `tier ≥ 4` → raiz "0" (todos os nós) — árvore completa

**Usuários pré-criados:** guest / aluno1 / aluno2 / aluno3 / aluno4 / root
Em produção: `enforceUniquePasswords()` no bootstrap alerta se alguém ainda usa senha "pap" padrão.

---

## 8. IA na Plataforma — Estratégia

### Três camadas de IA

**Camada 1: Conteúdo estático (gerado, não em tempo real)**
- 57 nós com conteúdo gerado via `generate-node-content.ts` + OpenAI
- Está no DB, não gera custo em runtime
- Exercícios MCQ: gerados na primeira requisição (`GET /api/exercises?nodeCode=X`), depois cacheados no DB
- Isa (mascote): keyword matching local — zero custo, zero latência

**Camada 2: OpenAI em runtime (futuro, depende de OPENAI_API_KEY)**
- Exercícios novos via `POST /api/ai/generate-exercise` (ainda não implementado, na IDEIAS.md como I18)
- Isa contextualizada por nó (I17)
- Diagnóstico de lacunas (I19)

**Camada 3: Interface de agentes externos (/api/ai/*)**
- CRUD completo para nós, exercícios, leitura de usuários e stats
- Auth via `AI_API_KEY` (não OpenAI)
- Criada para que Claude Code possa operar a plataforma diretamente: ingerir assembleias, atualizar conteúdo, monitorar métricas

### Assembleia de IAs → PAP
424 emails de sessões de tomada de decisão coletiva com múltiplos agentes de IA, guardados em `luddlocke@gmail.com`. Extraídos e transformados em:
- `APRENDIZADO.md` (634 insights classificados)
- `IDEIAS.md` (37 ideias de programação)
- Futuramente: ingestão via `/api/ai/*` como nodes especiais (tipo="assembleia") para RAG

---

## 9. Deployment — Evolução e Contexto

### Linha do tempo da infraestrutura
```
Replit (2024-2025)
  └── tudo junto: frontend + API + DB
       custo: Agente Replit chegou a R$265/dia
       problema: lock-in, custo imprevisível

Vercel (2026)
  └── frontend separado do backend
       automático no git push
       ainda em uso, funcionando

Tentativa Fly.io → Railway (2026-07-02)
  └── Railway escolhido: grátis, PostgreSQL incluso, sem Docker
       railway.toml commitado, aguardando deploy manual
```

### Por que o código roda no celular
Yuri usa Termux + proot-distro Ubuntu no Android. Claude Code roda dentro desse Ubuntu como root. O git push do celular dispara o CI no Vercel/Railway. Todo o desenvolvimento do PAP foi feito assim — num celular, num emulador de terminal Linux. Isso não é limitação; é a realidade operacional do projeto.

### Deploy Railway — passos pendentes
1. Railway dashboard → New Project → GitHub Site-ST → root `aliancapanorama-src`
2. Add PostgreSQL service (auto-injeta DATABASE_URL)
3. Env vars: `NODE_ENV=production`, `SESSION_SECRET`, `AI_API_KEY`, `ALLOWED_ORIGINS`
4. 1º deploy → adicionar temporariamente ao startCommand: `cd lib/db && npx drizzle-kit push && cd ../.. &&` → remover após
5. DNS: `pap.sociedadetucci.com.br` → Railway app URL

---

## 10. Decisões de Arquitetura — O Raciocínio

| Decisão | Raciocínio real |
|---|---|
| Contract-first (OpenAPI → codegen) | Tipos desatualizados são bugs silenciosos; codegen os elimina |
| Viewport quadrado (~900×900px) | UI cockpit só funciona em proporção quadrada; barras pretas em telas wide |
| Raiz da árvore por tier | Lock server-side em `canAccess()` — nunca só no frontend |
| PostgreSQL session store | connect-pg-simple persiste sessões entre restarts; memory store perde tudo |
| Sem `console.log` no servidor | `req.log` (handlers) ou `logger` (pino); console.log vai para stdout sem estrutura |
| Stripe e PayPal fora do OpenAPI | Webhooks precisam de raw Buffer; codegen não se aplica a raw-body routes |
| Social fora do OpenAPI | Polling com estado específico; fetch direto + useQuery sem codegen |
| Webhooks antes do `express.json()` | Stripe/PayPal verificam assinatura no body bruto — JSON middleware destrói isso |
| Redirect 301 canônico em produção | Replit/Vercel URLs existem; SEO e bookmarks devem ir para o domínio real |
| AI_API_KEY ≠ OPENAI_API_KEY | Dois propósitos distintos: autenticar agentes externos vs. chamar a API da OpenAI |
| Railway sobre Fly.io/Neon | Fly.io: pago após 90 dias + Docker; Neon: banco separado = terceira conta |

---

## 11. Armadilhas Técnicas (Gotchas)

- **`useListNodes()` sem args** → só retorna nós com `parentCode IS NULL` (raiz "0"). Sempre passar `{ parentCode: "X" }` para filhos.
- **Session store é PostgreSQL**, não memory store. Requer tabela `session` — criada por `connect-pg-simple` na primeira execução. NÃO apagar em migrations.
- **Social notes** — constraint única `(min(u1,u2), max(u1,u2))`. Upsert com `onConflictDoUpdate` target `[user1Id, user2Id]`.
- **Score** vem exclusivamente de `exercise_attempts.correct = 1`. Não de `notes` nem de `node_progress`.
- **Amizade aceita = 2 linhas simétricas**. Pending = 1 linha (quem enviou). Auto-aceita se cruzado.
- **`drizzle-kit push`** pode perguntar interativamente sobre renomeações → usar `executeSql` ou SQL raw se necessário.
- **Orval modo `single`** → schemas PascalCase (`LoginBody`, não `loginBodySchema`).
- **`lib/api-zod/src/index.ts`** deve exportar só `./generated/api`.
- **Sempre rodar codegen** após editar `openapi.yaml`.
- **`custom-fetch.ts`** tem `credentials: "include"` para cookies automáticos em cross-origin.
- **IntroFacade** usa `sessionStorage["pap_intro_seen_v1"]` para não repetir na mesma sessão.
- **IsaOwl** fases: `"flying" → "perched" → "bubble" → "chat"`. useEffect precisa de early return para evitar TS7030.
- **esbuild** agrupa workspace deps — não precisa de build separado para libs ao fazer build do api-server.
- **PATH no Claude Code** (usuário yuri, não-interativo): `.bashrc` não é sourced. Solução: symlinks em `/usr/local/bin/`.
- **`git push` falhar com "Could not read [hash]..."**: repo corrompido localmente. Solução: `git bundle create repo.bundle --all` → clone limpo do bundle. Ver histórico Sessão 2.

---

## 12. Memória das Sessões — Onde as Conversas Vivem

Esta seção existe porque conversas no Claude Code são compactadas quando crescem. O que não for salvo aqui some.

### Onde cada tipo de informação é salvo

| Tipo | Onde |
|---|---|
| O que foi construído | PSEUDO.md § Histórico (bullet list por sessão) |
| O que foi discutido e decidido | PSEUDO.md § Histórico + ATA email do `#fim` |
| Estado técnico atual | MAPA.md (referência viva: rotas, schema, pendências) |
| Pseudocódigo dos fluxos | PSEUDO2.md (close-to-code, atualizado quando lógica muda) |
| Aprendizados das assembleias | APRENDIZADO.md (634 insights classificados) |
| Ideias de programação | IDEIAS.md (37 ideias, atualizado ao `#fim`) |
| Perfil de Yuri e como colaborar | `/root/.claude/projects/-root/memory/user_yuri.md` |
| Mandatos filosóficos e feedback | `/root/.claude/projects/-root/memory/` (vários arquivos) |
| Conversa bruta (compactada) | `/home/yuri/.claude/projects/-home-yuri/*.jsonl` |

### Protocolo ao `#fim` — captura de memória
O `#fim` **não é só sobre commits e scripts**. É o momento de salvar o que foi pensado. No histórico do PSEUDO.md, cada sessão deve registrar:
- As **decisões e por que** foram tomadas (não só o que foi feito)
- Os **debates** que aconteceram (Railway vs Fly.io, por exemplo)
- As **tensões não resolvidas** (o que ficou em aberto)
- O **contexto de Yuri** naquele momento (o que ele estava tentando fazer por baixo das tarefas)

A ATA do email é o registro completo. O PSEUDO.md § Histórico é o índice navegável.

---

*Atualizado em: 2026-07-02 · Claude Code · Sessões 3 e 4*
