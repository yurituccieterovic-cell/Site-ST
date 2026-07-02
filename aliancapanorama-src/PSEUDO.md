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
    ├── GET /api/ai/nodes → árvore completa
    ├── POST /api/ai/nodes → criar nó
    ├── PUT /api/ai/nodes/:code → editar conteúdo
    ├── GET /api/ai/exercises?nodeCode=X → exercícios do nó
    ├── POST /api/ai/exercises → criar exercício
    ├── GET /api/ai/users → lista de usuários (sem senhas)
    └── GET /api/ai/stats → contadores + distribuição por tier
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

*Atualizado em: 2026-07-02 · Claude Code · Sessão 3*
