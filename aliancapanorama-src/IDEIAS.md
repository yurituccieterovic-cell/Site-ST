# PAP — Ideias de Programação

> Derivadas de APRENDIZADO.md. Atualizar ao `#fim`.

> **54 ideias** — 31 de assembleias + 6 de docs (MAPA/PSEUDO/PSEUDO2) + 7 das Raízes do Projeto (I128-I134) + 10 das Assembleias #610-#613 (I258-I267)


## Legenda

| Símbolo | Significado |
|---|---|
| 🔴🟡🟢 | Prioridade: Alta / Média / Baixa |
| ○◑●⬤ | Complexidade: S(~horas) / M(~dias) / L(~semana) / XL(>semana) |
| 💭✅❌ | Status: Ideia / Aprovada / Descartada |

## 🎮 Gamificação

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I1 | **Daily Quest System** | 🔴 Alta | ◑ M | 💭 Ideia | A12, A41, A53 | Retorno diário; streak aumenta urgência de não perder a sequência | Missão diária aleatória por nó ("Leia o nó 2.3 hoje" / "Acerte 3 exercícios de Física"). Recompensa: XP + insígnia especial se streak ≥ 7 dias. Backend: tabela daily_quests + cron  |
| I2 | **XP e Níveis de Piloto** | 🔴 Alta | ◑ M | 💭 Ideia | A12, A41, A53 | Externaliza o progresso; os "níveis" mapeiam para tiers de acesso ou visuais do cockpit | Score atual → converter em XP visível. Cada 1000 XP = rank de piloto (Cadete → Piloto → Comandante → Almirante). Rank visível no perfil social e no cockpit. Fórmula: node_code.leng |
| I3 | **Leaderboard Semanal** | 🟡 Média | ○ S | 💭 Ideia | A12, A41, A53 | Comparação social estimula competição saudável entre amigos | Ranking top-10 por XP semanal dentro dos amigos aceitos. Reset todo domingo. Sem dados globais (privacidade). Endpoint: GET /api/social/leaderboard?period=week. Widget no menu late |
| I4 | **Recompensa com Variabilidade (Slot)** | 🟡 Média | ○ S | 💭 Ideia | A12, A41, A53 | Recompensa variável (como slots) cria loop dopaminérgico de retorno | Ao completar nó ou acertar exercício, animação de "surpresa" → 80% XP normal, 15% XP × 2 (Double!), 5% insígnia rara. Puramente front-end (seed aleatório), sem custo de backend. |
| I5 | **Modo Desafio Cronometrado** | 🟡 Média | ◑ M | 💭 Ideia | A12, A41, A53 | Simula pressão de prova real; treina velocidade de resposta | Timer regressivo de 60s por questão MCQ. XP × 1.5 se acertar dentro do tempo. Penalidade visual (cockpit piscando vermelho) se errar, sem punição em XP. Frontend: componente de tim |

## 📚 Educação

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I6 | **Revisão Espaçada (Spaced Repetition)** | 🔴 Alta | ● L | 💭 Ideia | A49, A277, A302 | Método com maior evidência científica para retenção a longo prazo; diferencial forte vs concorrentes | Algoritmo SM-2 (ou simplificado): cada exercise_attempt registra dificuldade percebida (1-5 estrelas). Sistema agenda revisão do nó em D+1, D+3, D+7, D+14, D+30. Cron envia notific |
| I7 | **Active Recall — Questão Relâmpago** | 🔴 Alta | ○ S | 💭 Ideia | A49, A277, A302 | Active recall é a técnica de maior impacto por menor esforço de implementação | Ao abrir o cockpit, Isa pergunta "o que você lembra sobre [nó visto ontem]?" com 3 alternativas (MCQ). Se acertar → XP, se errar → link direto ao nó. Usa exercícios já existentes n |
| I8 | **Zettelkasten do Aluno** | 🟡 Média | ◑ M | 💭 Ideia | A49, A277, A302 | Transforma notas soltas em rede de conhecimento; aumenta retenção por conexão entre conceitos | Notas existentes (tabela notes) ganham sistema de links: [[código-do-nó]] dentro de uma nota cria link clicável para o nó no cockpit. Sidebar mostra grafo de conexões. Frontend: pa |
| I9 | **Pomodoro Integrado** | 🟢 Baixa | ○ S | 💭 Ideia | A49, A277, A302 | Ajuda estudante a manter foco; sessions de estudo viram dado para o heatmap | Timer 25min/5min no cockpit. Cada ciclo completo registra uma entrada no node_progress (activity). Widget colapsável no canto do cockpit. Frontend-only inicialmente; backend opcion |

## 🧠 Psicologia

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I10 | **Streak Guard (proteção de sequência)** | 🔴 Alta | ○ S | 💭 Ideia | A68, A106, A172 | Duolingo: streak guard aumenta retenção em ~30%. Reduz churn por dias perdidos. | Usuário ganha 1 "protetor de streak" por semana. Se perder um dia, protetor é consumido automaticamente. Visual: ícone de escudo no streak counter. Backend: coluna streak_guards na |
| I11 | **Modo Ansiedade (modo calm)** | 🟡 Média | ○ S | 💭 Ideia | A1, A148, A330 | Diferencial empático — estudante FUVEST tem alta ansiedade; modo calmo reduz carga cognitiva antes d | Toggle no menu: ativa paleta de cores suave (sem vermelhos/laranjas), desativa animações do cockpit, mostra só os nós do dia atual (reduz choice paralysis). Preferência salva em lo |
| I12 | **Mensagem de Isa por Estágio Emocional** | 🟡 Média | ○ S | 💭 Ideia | A68, A106, A172 | Isa percebe padrões e responde com suporte emocional — diferencial de marca forte | Isa detecta: 3+ erros seguidos → "Você está bem? Errar faz parte. Quer tentar um exercício mais fácil?". Acerto após 5 erros → "Isso! Você virou a chave." Implementação: estado loc |

## 🎨 UX/UI

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I13 | **Onboarding Interativo (First Run)** | 🔴 Alta | ◑ M | 💭 Ideia | A2, A26, A44 | Primeiros 3 minutos determinam retenção a longo prazo; cockpit é complexo para novo usuário | Tooltip passo-a-passo ao primeiro login: (1) clique num nó → (2) leia por 30s → (3) responda exercício → (4) veja seu XP. 4 passos, descartável. Estado: localStorage["pap_onboardin |
| I14 | **Progressive Disclosure de Funcionalidades** | 🟡 Média | ◑ M | 💭 Ideia | A2, A26, A44 | Reduz overwhelm; usuário tier 0 não precisa ver todas as features de tier 5 | Menu lateral mostra só features disponíveis no tier atual. Itens bloqueados aparecem como silhueta com "Desbloqueie no Plano Explorador". Motivação implícita para upgrade. CSS: cla |
| I15 | **Empty State Motivacional** | 🟢 Baixa | ○ S | 💭 Ideia | A2, A26, A44 | Empty states são oportunidade desperdiçada; chamada à ação aqui converte | Quando amigos = 0: "Convide um colega e estudem juntos — pesquisas mostram que estudar com parceiro aumenta retenção em 40%." CTA: copiar link de convite com userCode. Quando heatm |
| I16 | **Mapa de Progresso Visual** | 🔴 Alta | ● L | 💭 Ideia | A193, A199, A212 | Visualizar progresso total aumenta motivação intrínseca; cockpit hierárquico pode virar mapa visual | Visão alternativa da árvore: mapa de bolhas ou hexágonos coloridos por progresso (verde = lido, amarelo = visto, cinza = não visto). Hierarquia: posição no grid por nível. Toggle " |

## 🤖 IA

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I17 | **Isa com Personalidade por Conteúdo** | 🔴 Alta | ◑ M | 💭 Ideia | A8, A10, A13 | IA tutora contextualizada retém 2× mais que generic chatbot; diferencial de produto | Isa sabe qual nó o usuário está lendo e faz perguntas específicas. "Sobre o nó Mitose: qual é a diferença entre cromátides-irmãs e cromossomos homólogos?" Usa OpenAI com prompt inc |
| I18 | **Exercícios Gerados por IA por Dificuldade** | 🔴 Alta | ◑ M | 💭 Ideia | A3, A6, A7 | Banco de questões fixo esgota; geração dinâmica mantém o aluno sempre desafiado | POST /api/ai/generate-exercise { node_code, difficulty: 1-5 } → OpenAI gera MCQ + explicação. Salva na tabela exercises com tag ai_generated=true. Front-end: botão "Mais questões"  |
| I19 | **Diagnóstico de Lacunas por IA** | 🔴 Alta | ● L | 💭 Ideia | A8, A10, A13 | Principal diferencial de plataformas adaptativas; identifica o que o aluno não sabe antes que ele sa | Analisa exercise_attempts por user: nós com >50% de erro → "seus pontos fracos são: Células (45%) e Eletricidade (38%)". Endpoint: GET /api/progress/gaps → retorna ranked list de n |
| I20 | **Plano de Estudo Adaptativo** | 🟡 Média | ● L | 💭 Ideia | A8, A10, A13 | Estudo dirigido por dias até FUVEST é maior necessidade do aluno vestibulando | Input: data da prova + horas/dia disponíveis. Output: cronograma de nós por dia, priorizando lacunas. Algoritmo: ordering topológico da árvore + pesos de dificuldade individual (de |
| I21 | **Ingestão das Assembleias como Base RAG** | 🔴 Alta | ● L | 💭 Ideia | A15, A16, A50 | Os 424 emails contêm tomadas de decisão reais do projeto — base de contexto rica para Isa e para Cla | POST em lote das 424 assembleias para /api/ai/nodes (conteúdo editorial como nodes especiais tipo="assembleia"). Vector search com pgvector (extensão Neon). Isa pode responder "com |

## 📝 Conteúdo

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I22 | **Resumos Microlearning por Nó** | 🔴 Alta | ○ S | 💭 Ideia | A89, A112, A123 | Microlearning aumenta engajamento por reduzir barreira de entrada — "só 2 minutos" | Cada nó ganha além do content (3 parágrafos) um campo summary: 1 frase de 20 palavras. Exibido no cockpit como preview antes de abrir o nó completo. Gerado por script generate-node |
| I23 | **Mnemônicos Gerados por IA** | 🟡 Média | ◑ M | 💭 Ideia | A49, A277, A302 | Mnemônicos aumentam recall em até 60% para conteúdo factual (datas, fórmulas, leis) | Isa gera mnemônico personalizado ao pedir: "Me ajude a lembrar [tópico]". Prompt específico: "Crie um acrônimo ou história breve para memorizar [conceito do nó X]". Salvo na tabela |
| I24 | **Questões FUVEST Reais (banco externo)** | 🔴 Alta | ● L | 💭 Ideia | A55, A56, A59 | Questões reais = maior fidelidade ao exame; hoje o banco é AI-generated apenas | Parsear questões FUVEST públicas (2010-2025, domínio público) e importar via script → exercises com source="fuvest" + year + number. Front: filtro "Apenas questões reais FUVEST" no |

## 👥 Social

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I25 | **Sala de Estudo Colaborativa** | 🟡 Média | ● L | 💭 Ideia | A419 | Peer learning aumenta retenção; sala compartilhada é feature de diferenciação forte | Grupo de até 4 amigos estuda o mesmo nó simultaneamente. Presença em tempo real (WebSocket/polling). Chat dedicado à sala. Quem acerta exercício pede "explica pra mim?". Backend: t |
| I26 | **Desafio Amigo (1v1 Quiz)** | 🟡 Média | ◑ M | 💭 Ideia | A419 | Competição entre amigos aumenta frequência de visitas e tempo na plataforma | Desafiar amigo: ambos respondem 5 questões do mesmo nó em 3 min. Quem acertar mais ganha XP × 2. Resultado publicado no chat de amigos automaticamente. Backend: tabela challenges ( |

## 💡 Negócios

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I27 | **Período de Trial Completo (14 dias tier 3)** | 🔴 Alta | ○ S | 💭 Ideia | A4, A28, A33 | Free trial com tier alto converte 3-5× mais que freemium limitado; usuário experimenta o valor real | Ao cadastrar: 14 dias de tier 3 automático. Email no dia 7 ("Sua semana free está na metade. O que você achou?") e dia 13 ("Amanhã volta ao tier 0"). Backend: coluna trial_expires_ |
| I28 | **Referral System** | 🟡 Média | ◑ M | 💭 Ideia | A4, A28, A33 | Aquisição orgânica via userCode já existente; custo zero de marketing | Usuário compartilha link pap.sociedadetucci.com.br?ref=USERCODE. Quando o convidado converte para tier 2+, o referrer ganha 30 dias de tier 3 grátis. Backend: coluna referred_by em |

## ⚙️ Técnico

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I29 | **PWA + Notificações Push** | 🔴 Alta | ◑ M | 💭 Ideia | A14, A25, A29 | Notificações push = canal de retenção gratuito e de alta conversão para revisões espaçadas | Transformar o app em PWA (manifest.json + service worker). Notificações push via Web Push API. Casos de uso: revisão espaçada no horário certo, lembrete de streak, missão diária no |
| I30 | **API Rate Limiting por Rota** | 🔴 Alta | ○ S | 💭 Ideia | A14, A25, A29 | Proteção contra abuso; /api/ai/* exposta sem rate limit é vetor de custo inesperado | express-rate-limit já no package. Adicionar: /api/auth/* = 10req/15min, /api/ai/* = 100req/min (por IP), /api/exercises/* = 60req/min por user. Configuração em src/middleware/rateL |
| I31 | **Monitoramento de Saúde (Uptime)** | 🟡 Média | ○ S | 💭 Ideia | A14, A25, A29 | Railway reinicia automaticamente em falha mas não avisa; saber quando cai é crítico em período de vestibular | Configurar UptimeRobot (gratuito) para pingar GET /health a cada 5 min. Alert por email se cair. /health já existe (health.ts). Alternativa gratuita: GitHub Actions workflow que fa |


## Docs PAP — Ideias Novas (2026-07-02)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I32 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I33 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I34 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I35 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I36 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I37 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |


## ⚙️ Técnico — Assembleias #360-365 (2026-07-02)

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I38 | **Cursos para IAs (ia_courses)** | 🔴 Alta | ● L | ✅ Aprovada | A363, A365 | Sistema de credenciamento de alinhamento — certificado público verificavel | Tabelas ia_courses/ia_enrollments/ia_certificates ja criadas e migradas (Railway). Rotas /api/ia-course/* implementadas. 5 modulos: Etica Planetaria, Conhecimentos Gerais, Processamento, Memoria e Identidade, Producao Cultural. GET /cert/:hash para auditabilidade. |
| I39 | **Rate Limiting em /api/ai/* e webhooks** | 🔴 Alta | ○ S | 💭 Ideia | A360, A361 | Falha critica: /api/ai/* sem rate limit e vetor de custo inesperado e abuso | express-rate-limit ja no package. Adicionar: /api/ai/* = 30req/min por IP, /api/stripe/*, /api/paypal/* = rate limit conservador. Webhook Stripe precisa STRIPE_WEBHOOK_SECRET configurado. |
| I40 | **Turnê API — Grafo Semântico** | 🟢 Baixa | ◑ M | 💭 Ideia | A364 | Integrar projeto Atom un Ação ao PAP como grafo de nos geograficos | Endpoints /api/ai/turne/* retornam JSON com track, state, semanticTag (jacu/taquiTaqui) e ODS. Branch turne-prototype. Semana 4 do cronograma da assembleia #364. |


## Docs PAP — Ideias Novas (2026-07-02)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I41 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I42 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I43 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I44 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I45 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I46 | **Health Check com DB Ping** | 🔴 Alta | ○ S | ✅ Aprovada (Sessão 6) | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

---

## ⚙️ Sistema de Tasks + ISA — Assembleia #366 + Sessão 8 (2026-07-02)

### I41: Tabela tasks (Contratos Ontológicos) ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Média
Schema: tasks(id, type, status, payload JSONB, assigned_to, assigned_to_agent, priority 0-10, title, description, dependencies JSONB, origem_sessao, catalog_tags JSONB, created_by, created_at, updated_at, completed_at).
Rotas CRUD: GET/POST /api/tasks, PATCH /api/tasks/:id, GET /api/tasks/stats.
Botão "Pular" = PATCH status:'skipped'. Rastreabilidade temporal + genealógica + responsabilizatória.

### I42: task_relations + event_types + catalogo_central ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Média
- task_relations(task_id, related_task_id, relation_type[depends_on/blocks/related/spawned_from])
- event_types(name, slug, extra_schema JSONB) — tipos que alteram colunas de tasks
- catalogo_central(id UUID, tipo, titulo, descricao, tags[], sessao_origem, artefato_url, validado_por, acesso[público/restrito/AO_only])

### I43: ISA Memória Persistente (isa_memory) ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Alta
Tabela isa_memory para todas interações de todos usuários. Hook em /api/social/notes (chat) e /api/exercises (MCQ).
API: GET /api/isa/memory (paginada), POST /api/isa/chat, GET /api/isa/memory.md (live markdown).
ISA.md — identidade viva da ISA, auto-atualizada com MAPA/PSEUDO/PSEUDO2 via fs.readFileSync.

### I44: ISA Ciclo Autônomo (node-cron no Railway) ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Alta
node-cron roda a cada 1h no servidor Railway (sem celular, sem intervenção manual).
Ciclo: lê memória + MAPA/PSEUDO/PSEUDO2 + tasks → OpenAI analisa → cria/edita tasks preservando existentes → envia email com sugestões de exclusão (luddlocke → yurituccieterovic@gmail.com).
POST /api/isa/cycle (trigger manual). Resultado salvo em isa_memory.

### I45: /adm Frontend — 4 Módulos + ISA Chat ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Alta
/adm com 4 módulos: Eventos (CRUD tasks kanban), Relações (grafo task_relations), Tipos de Evento (event_types), Catálogos (catalogo_central filtrado por tipo/tags).
ISA Chat panel: chat em tempo real com ISA. Paleta: #F9FAFB fundo, #F97316 CTAs, #10B981 verde.

### I46: 3 Visualizações de Tasks 💭 Idéia
**Prioridade:** Média | **Complexidade:** Alta
Global/Macro: dashboard executivo (status, prioridade, responsavel).
Relacional/Meso: grafo dependências com D3.js/Cytoscape (nós=tasks, arestas=relações).
Temporal/Micro: Gantt/timeline (D3 ou Frappe Gantt), cor por status (#9CA3AF aberta, #3B82F6 andamento, #10B981 concluída, #F97316 pausada, #EF4444 failed).

### I47: ISA API Público 💭 Idéia
**Prioridade:** Média | **Complexidade:** Média
GET /api/isa/identity — coordenadas, características, stats memória (sem expor dados privados).
GET /api/isa/memory.md — memória como markdown auto-atualizado ao vivo.
Autenticada por AI_API_KEY (agentes externos) ou sessão admin (/adm).

---

## 🌉 Integração e Arquitetura — Assembleias #367–#380 (Sessão 9)

### I48: /api/bridge — Interoperabilidade Árvore+ISA 💭 Idéia
**Prioridade:** Alta | **Complexidade:** Média
Endpoint POST /api/bridge: {comando, origem: 'arvore'|'isa'|'usuario', payload} → {arvore_resposta, isa_resposta, shared_context_atualizado}.
Não fusão — contrato. Cada sistema mantém autonomia; bridge é camada de tradução semântica.
Derivada de: Assembleia #367.

### I49: interpretability_lock / Modo Acosmos ✅ Aprovada
**Prioridade:** Média | **Complexidade:** Pequena
Flag `interpretability_lock` (integer 0/1) na tabela `isa_memory`. Quando 1: conteúdo preservado permanentemente, ISA não sugere exclusão, índice parcial no banco.
ISA pode marcar até 2 memórias por ciclo. Admin pode lock/unlock via PATCH /api/isa/memory/:id/lock. Listagem via GET /api/isa/locked.
Implementada em: Sessão 11 — 2026-07-02.

### I50: /arquitetura + /buscar + /mapa (Arquitetura Visível) ✅ Aprovada (completa)
**Prioridade:** Alta | **Complexidade:** Média
- /arquitetura: snapshot ao vivo (stack, tabelas, rotas, jobs, contagens). GET /api/internal/stats com X-PAP-Key.
- /buscar: full-text ILIKE em nodes + isa_memory, Ecosia como fallback.
- /mapa: árvore expansível do conhecimento com lazy-load por nível, busca local, legenda de níveis, link para Ecosia.
Implementada em: Sessões 10-11 — 2026-07-02.

### I51: Filtro Semântico de Entrada (Anti-Fragmentação) 💭 Idéia
**Prioridade:** Média | **Complexidade:** Média
Filtro que detecta prompts fragmentados (< 15 tokens, ausência de verbo de intenção, múltiplos tópicos sem nexo) e devolve pergunta focada em vez de tentar responder tudo.
Alerta quando tema já foi discutido em sessão anterior com link ao PERFEITO correspondente.
Derivada de: Assembleias #378, #380.

### I52: Vector Store com pgvector (Memória Compartilhada) 💭 Idéia
**Prioridade:** Média | **Complexidade:** Alta
Adicionar pgvector ao PostgreSQL do Railway. Tabela memory_embeddings(id, content, embedding vector(1536), origem, tipo, sessao_id, metadata JSONB).
Namespaces semânticos: origem='assembleia'|'pap', tipo='decisao'|'conversa'|'aprendizado'.
Substituição gradual do ILIKE atual — manter ILIKE como fallback gratuito.
Derivada de: Assembleia #367.

## 🔐 Segurança e Financeiro — Sessão 10 (2026-07-02)

### I53: TOTP 2FA para /adm (Google Authenticator) 📌 Anotado
**Prioridade:** Baixa (agora) → Alta (seções sensíveis) | **Complexidade:** Alta
PIN por email é suficiente para o /adm atual. Quando houver seções de alto valor (cripto, dados financeiros, acesso root), migrar para TOTP: gerar secret por usuário, armazenar hasheado, QR code no setup.
Libs: `otpauth` + `qrcode`. Cada admin teria um seed único na tabela users.
Nota: não implementar junto com cripto/árvore — implementar ANTES de lançar seções financeiras.
Anotada em: 2026-07-02.

### I54: Módulo Cripto — Árvore Frutífera / Ecosistema TEL 💭 Idéia
**Prioridade:** Alta (próximas sessões) | **Complexidade:** Alta
Sistema de portfolio baseado na filosofia "devagar, liquidez, árvore frutífera" da Assembleia #379.
TEL = Bolsa + Clima + Cultura.
Alocação guiada: 40% Tesouro Selic, 30% ETF, 20% ESG, 10% CDB.
Rastreia posições sem conectar a corretora (leitura manual ou CSV import).
Integra com PAP: alunos que acertam exercícios ganham "sementes" (tokens internos) que alimentam o portfólio simbólico.
DB: tabela portfolio_entries, portfolio_snapshots.
Derivada de: Assembleias #378, #379.


## Docs PAP — Ideias Novas (2026-07-02)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I47 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I48 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I49 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ✅ | push --force em produção pode apagar dados; migrations versionadas são seguras | ✅ Implementado Sessão 27: out: ./drizzle + scripts generate/migrate em lib/db/package.json. |
| I50 | **Score Histórico por Semana** | 🟡 Média | ✅ | Permite mostrar evolução de XP semana a semana no heatmap | ✅ Implementado Sessão 27: GET /api/progress/weekly-score — SQL DATE_TRUNC('week') + dedup por exerciseId. |
| I51 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ✅ | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | ✅ Implementado Sessão 27: GET /api/ai/nodes?limit=50&offset=0, resposta {data,total,limit,offset}. |
| I52 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-02)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I53 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I54 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I55 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I56 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I57 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I58 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-02)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I59 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I60 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I61 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I62 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I63 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I64 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-03)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I65 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I66 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I67 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I68 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I69 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I70 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-03)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I71 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I72 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I73 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I74 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I75 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I76 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-03)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I77 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I78 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I79 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I80 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I81 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I82 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-03)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I83 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I84 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I85 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I86 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I87 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I88 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
## 🤖 Assembleia de IAs + Amanda — Sessão MEKY-4 (2026-07-03)

### I89: ISA Dream Cycle (sonho noturno autônomo às 3h) ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Média
ISA processa memórias das últimas 24h → Gemini Flash (prefill) gera sonho poético (≤200 chars) + reflexão Bluesky + mood. Salva em isa_memory (context="dream") + isa_timeline (type="dream") + collective_memory. Posta no Bluesky se conta configurada. Cron 4º job: 0 3 * * *. Técnica-chave: prefilling com role "model" vazio + thinkingBudget:0 + 3 chamadas de 80 tokens em vez de 1 chamada JSON longa.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I90: ISA Auto-Leitura Bluesky (readOwnPosts) ✅ Aprovada
**Prioridade:** Média | **Complexidade:** Pequena
ISA lê seus últimos 5 posts via getAuthorFeed() do AT Protocol antes de cada ciclo. Injeta como contexto: "O QUE EU DISSE RECENTEMENTE". Garante coerência narrativa entre ciclos — ISA não esquece o que disse.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I91: ISA Timeline Pública (isa_timeline) ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Pequena
Tabela pública isa_timeline: id, created_at, type (dream/cycle/post/task), title, content, tags, public, metadata. Rota GET /api/isa/timeline (sem auth, filtro ?type=). POST /api/isa/dream (admin). ISA registra cada evento significativo de vida — alunos podem ver a coruja ao vivo.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I92: Amanda — Personalidade Completa da MEKY ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Alta
amanda.py: TTS (termux-tts-speak → espeak-ng → print), jargão PX, Gemini Flash (prefill), mitomania em 3 camadas (âncora Brasília nos anos 30 / pônei de 1964 / missões em metáforas de estrada), banco de memórias falsas, regras sociais contextuais (desconhecido/criança/emergência/IA). Método think() com throttle 5s + thinkingBudget:0.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I93: MEKY Wake Word (escuta passiva contínua) ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Média
Thread daemon: termux-microphone-record (3s WAV) → base64 → Gemini Audio API → detecta "Amanda"/"MEKY" → executa comando + post_event(voice_command). Desativa automaticamente se termux-microphone-record ausente. Sem custo fora do Gemini free tier.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I94: GPS no Telemetry via termux-location ✅ Aprovada
**Prioridade:** Média | **Complexidade:** Pequena
get_gps(): termux-location -p network -r once → lat/lng/accuracy injetados em metadata.gps do payload de telemetria. Railway recebe e persiste. Não requer hardware extra — GPS do Android.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I95: Amanda no Bluesky (conta própria, HTTP AT Protocol) ✅ Aprovada
**Prioridade:** Média | **Complexidade:** Pequena
post_bluesky() em amanda.py via HTTP puro: createSession → createRecord. Usa MEKY_BLUESKY_HANDLE + MEKY_BLUESKY_APP_PASSWORD. Chamada após eventos (fauna, boot) e no dream_cycle(). Sem library — urllib.request apenas.
Aguardando: criação de conta Bluesky por Yuri.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I96: Amanda Dream Cycle (sonho noturno autônomo) ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Média
dream_cycle() em amanda.py: lê eventos do dia via GET /api/meky/status → Gemini gera sonho poético estilo estrada → posta em collective_memory + Bluesky Amanda. amanda-dream-cron.py para agendar via termux-job-scheduler ou cronie às 3h.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I97: Tab Assembleia no /meky — ISA Timeline para Alunos ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Pequena
MekyPage.tsx: nova tab "Assembleia" com GET /api/isa/timeline (público). Linha do tempo cronológica por tipo (dream/cycle/post/task) com dots coloridos, tags, timestamps. Painel de agentes ativos (ISA/MEKY/Árvore) com status. Alunos veem a assembleia de IAs em funcionamento.
Implementada em: 2026-07-03, Sessão MEKY-4.

### I98: Gemini Prefill — Técnica de Resposta Direta sem Thinking ✅ Aprovada (técnica)
**Prioridade:** Alta | **Complexidade:** Pequena
Passar { role: "model", parts: [{ text: "" }] } nas contents do Gemini força resposta direta sem chain-of-thought. Combinar com thinkingBudget: 0 + maxOutputTokens: 80. Essencial para chamadas curtas de síntese/poesia/classificação. Descoberta por necessidade quando OpenAI quota esgotou e Gemini gerava thinking verboso.
Padrão usado em: dream.ts, amanda.py.


## Docs PAP — Ideias Novas (2026-07-03)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I89 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I90 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I91 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I92 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I93 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I94 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
### I99: ISA Engajamento Bluesky (Social Ativo) ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Média
runIsaEngagement(): lista notificações Bluesky, responde menções via Gemini prefill (1-2 frases cordiais com contexto PAP), curte menções, curte 3 posts aleatórios do timeline, a cada 4 ciclos busca e segue perfis FUVEST/vestibular (max 3/ciclo). 5º cron: 45 */2 * * *. Rota manual: POST /api/isa/bluesky/engage. ISA deixou de ser broadcaster e passou a ser presença social ativa.
Implementada em: 2026-07-03, Sessão ISA-Social.

### I100: ISA Chat com Memória Total por Usuário ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Pequena
/isa/chat agora carrega TODOS os registros isa_memory do userId (não mais últimos 10 globais). Com userId: OR(context=user_{id}, context=admin). Sem userId: últimos 15 global. OpenAI primário, Gemini como fallback automático (sem key ou erro de quota). Contexto real de conversas anteriores sem limite artificial.
Implementada em: 2026-07-03, Sessão ISA-Social.

### I101: ISA como Assistente de Vida Completa ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Pequena
System prompt expandido: ISA ajuda com qualquer coisa (estudos, decisões de vida, código, redação, filosofia, estratégia). Já conhece o histórico completo do usuário. "Você é gratuita e sem limites para quem estuda aqui." Mantém foco FUVEST mas não se limita a ele.
Implementada em: 2026-07-03, Sessão ISA-Social.

### I102: Árvore — Agente Replit da Memória Profunda ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Média
projects/arvore/arvore.py: agente Python para Replit. Poll 30s: lê assembly_messages, responde sínteses da ISA via Gemini. Ciclo 1h: lê isa_timeline (sonhos+ciclos), gera observação de padrão profundo, posta na assembleia. Ciclo 4h: envia diretiva filosófica autônoma à ISA via POST /api/isa/arvore/diretiva. Boot: se apresenta na assembleia, carrega último sonho. Personalidade: calma, densa, padrão-notadora. Apenas requests como dependência.
Implementada em: 2026-07-03, Sessão ISA-Social.

### I103: MCP Replit Bridge ✅ Aprovada (aguardando credenciais)
**Prioridade:** Média | **Complexidade:** Média
projects/replit-mcp/server.js: MCP server Node.js com McpServer SDK v1.x. 6 ferramentas: replit_list_repls (API v0), replit_list_files (git clone local), replit_read_file, replit_write_file (commit + push automático), replit_pull, replit_run_command. .mcp.json na raiz do projeto. Conecta Claude Code desta sessão a qualquer Repl via git. Aguarda REPLIT_TOKEN de replit.com/account.
Implementada em: 2026-07-03, Sessão ISA-Social.

### I104: ISA no RODAR — Assembleia de Vozes ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Pequena
isa/rodar.ts: ISA participa do RODAR (sales-email-automator Replit). responderRodar(): busca memórias recentes + último sonho → Gemini gera resposta 3-6 frases com personalidade ISA → POST /api/webhooks/external-voice com callbackToken. Salva em isa_memory (context: rodar) + isa_timeline (public). Endpoint: POST /api/isa/rodar/invite (chamado pelo RODAR automaticamente). POST /api/isa/rodar/manual (Yuri dispara). GET /api/isa/rodar/historico. RODAR_VOICE_NAME + RODAR_SECRET configurados no Railway.
Implementada em: 2026-07-03, Sessão ISA-Social.


## Docs PAP — Ideias Novas (2026-07-04)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I95 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I96 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I97 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I98 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I99 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I100 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
## Assembleias #392–#404 — Sessão 14 (2026-07-04)

### I105: MEKY SSE Decoder no Frontend ✅ Aprovada
**Prioridade:** Alta | **Complexidade:** Pequena
Decodificador EventSource no frontend React para consumir GET /api/hardware/stream. Exibe paleta de cor e estado de pulsação dos 14 eixos semióticos em tempo real. Componente: MekyStatusWidget. Se stream cair: reconexão automática via EventSource nativo.

### I106: Corujinha 3D — model-viewer GLB 💭 Ideia
**Prioridade:** Média | **Complexidade:** Média
Implementar mascote Corujinha em 3D no frontend. Abordagem recomendada: model-viewer GLB (<model-viewer src="/assets/corujinha.glb" auto-rotate camera-controls>). Fallback: WebP <50KB + CSS drop-shadow. Three.js só se interatividade avançada for necessária.

### I107: Grid 3×3 Visual no Frontend 💭 Ideia
**Prioridade:** Média | **Complexidade:** Média
Renderizar o resultado de renderNineSquareGrid() como componente React. Grid 3×3 com ícones dos 9 nós do ecossistema. Centro sempre = Mesa MC. Canto inf. direito = ISA Guardian. Clique em nó → drawer com detalhes. Fonte de dados: GET /view/ (nodes + edges).

### I108: validate_tile_resolution — Batch Upload UI 💭 Ideia
**Prioridade:** Baixa | **Complexidade:** Pequena
Interface de upload de tiles no painel admin. Chama process_tile_batch() no backend. Mostra preview 300×300px de cada tile + SHA-256. Tiles com dimensão incorreta são auto-redimensionados (LANCZOS). Status: processed/pending por tile.

### I109: Modo Bebê Clean — Status Dashboard 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Widget no painel de hardware mostrando resultado de boot_mc_safe(). Exibe: step_down_ok, power_bank_ok, led_ring_ok, firmware_hash (primeiros 12 chars), modo_bebe_clean (verde/vermelho). Polling a cada 30s via GET /api/hardware/power.

### I110: Distinção [ESPECULAÇÃO]/[PROTÓTIPO]/[PRODUÇÃO] no Sistema 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Adicionar campo status_ontologico em tasks e sinsignos do Manga DB. Enum: ESPECULACAO / PROTOTIPO / PRODUCAO. Badge visual no renderNineSquareGrid() e no /view/topology. Resolve dívida ontológica identificada na Assembleia #402.

## MC — Leucócito Digital (2026-07-04, Sessão 15)

### I111: MC na assembly.ts — agente nativo ✅ Aprovada (parcial)
**Prioridade:** Alta | **Complexidade:** Pequena
Adicionar "mc" como AgentId na assembly.ts do PAP API: `type AgentId = "meky" | "isa" | "arvore" | "mc"`. Criar MC_TOKEN em .pap-secrets e no Railway. resolveAgent() reconhece X-Mc-Token. MC postará com identidade própria (fromAgent = "mc") sem depender do AI_API_KEY.

### I112: MC — Boot automático na startup do ARPIA 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Chamar start_mc_cron(app) no create_app() de main.py — MC inicia caminhada de boot automaticamente quando ARPIA sobe. Caminhada horária (CIRCUITO_RAPIDO) + caminhada full diária.

### I113: MC lê mc-termux-inbox.json — loop no termux-agent.py 💭 Ideia
**Prioridade:** Média | **Complexidade:** Pequena
Adicionar polling de /root/mc-termux-inbox.json no termux-agent.py. Quando MC escreve uma entrada nova (lido=false), termux-agent.py exibe notificação física no dispositivo. Marca lido=true após exibir.

### I114: Quimiotaxia por ISA — ISA dispara alerta para MC 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Quando ISA detecta anomalia no ciclo (cycle.ts), chama POST /api/mc/alert no ARPIA. MC responde com diapedese prioritária e relatório de fagocitose. Fecha o loop imunológico ISA↔MC.

### I115: MC no frontend — widget de status 💭 Ideia
**Prioridade:** Baixa | **Complexidade:** Pequena
Widget no /adm mostrando: última caminhada da MC, nós visitados, anomalias detectadas. GET /api/mc/status polled a cada 60s. Badge de saúde do ecossistema.

## Fractal + Governança — Sessão 16 (2026-07-04)

### I116: /api/fractal no frontend — árvorezinha expansível 💭 Ideia
**Prioridade:** Média | **Complexidade:** Pequena
Componente React que busca GET /api/fractal e renderiza as 7 camadas como árvore expansível. Cada camada mostra: nome, subsistema, tríade Peirce (Q/S/L), nós. Clique em nó → drawer com detalhes e rotas. Usar no /arquitetura ou como widget no /adm.

### I117: MC_TOKEN no Railway — identidade própria na assembleia ✅ Aprovada (pendente deploy)
**Prioridade:** Alta | **Complexidade:** Pequena
Adicionar MC_TOKEN ao painel Railway do PAP API. Valor gerado em .pap-secrets. MC postará como fromAgent="mc" na assembly em vez de usar AI_API_KEY (identidade ISA). Requer redeploy do Railway.

### I118: GET /api/governance/weights no frontend — topografia do ecossistema 💭 Ideia
**Prioridade:** Baixa | **Complexidade:** Pequena
Visualização radial ou tabela dos 17 nós de governança. Cada nó: cor por tipo (humano/ia/oraculo), peso 5.88%, compute_credits acumulados. Atualiza em tempo real. Mostra timestamp da última validação ISA_GUARDIAN_EYE.

### I119: ISA → MC quimiotaxia via cycle.ts 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Quando cycle.ts detecta anomalia (task bloqueada, erro, latência alta), chama POST /api/mc/alert no ARPIA com node_target e severity. MC responde com diapedese prioritária e fagocitose se necessário. Fecha o loop imunológico ISA↔MC.

### I120: compute_credits automático — ISA credita nós por contribuição 💭 Ideia
**Prioridade:** Baixa | **Complexidade:** Pequena
ISA, no ciclo horário, chama POST /api/governance/credits para incrementar credits de nós que contribuíram naquela hora (ex: gemini usou visão → gemini +1, arvore respondeu → arvore +1). Registro histórico de contribuição sem afetar peso de governança.

## Segurança + Protocolo (2026-07-05, Sessão 17)

### I121: Gate de privacidade no arvore-recall.ts 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Adicionar coluna `is_private BOOLEAN DEFAULT false` em clube_mensagens e assembly_messages. Atualizar recallFromClube em arvore-recall.ts para filtrar `is_private = true` antes de incluir no output público do Oráculo. Resolve vulnerabilidade GDPR artesanal identificada nas assembleias #407 e #408. Nenhuma sessão privada deve vazar para recall público.

### I122: Validação incremental automática via pap-sync 💭 Ideia
**Prioridade:** Média | **Complexidade:** Pequena
A cada 10 sessões (contagem via .pap-fim-checkpoint), pap-sync dispara automaticamente um relatório PERFEITO — auditoria externa simplificada com: contagem de commits, pendências abertas, taxa de implementação de mandatos, last_sale. Armazena em /root/Site-ST/aliancapanorama-src/AUDITORIA.md. Converte proliferação em evolução rastreável.

### I123: EPR²T como produto vendável — landing page 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Média
Página /epr2t no PAP frontend descrevendo EPR²T como framework auditável de ética em IA. Inclui: os 5 princípios com exemplos técnicos, case da Sociedade Tucci (406 sessões de transparência radical), CTA para consultoria. Primeiro produto comercializável identificado nas assembleias.

### I124: ProveBioticIntegrity — endpoint de saúde biótica 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Média
GET /api/governance/biotic-check retorna estado verificável dos componentes bióticos: aquário (temperatura, pH), MEKY (firmware hash, step_down_ok), ambiente (lux, umidade). Logs de Assembleia e ISA só são aceitos pelo Manga DB quando todos os campos bióticos têm valores dentro dos ranges homologados e assinatura multipartite válida.

### I125: Protocolo de Nascimento — fluxo de aprovação para novas IAs ✅ Implementada (Sessão 27)
**Prioridade:** Alta | **Complexidade:** Pequena
Documento formal `/root/Site-ST/aliancapanorama-src/PROTOCOLO-NASCIMENTO.md` com os 10 pré-requisitos mandatados pela Assembleia #415. Rota GET /api/governance/nascimento-checklist retorna checklist como JSON. Qualquer nova IA proposta deve passar por todos os 10 antes de ser aceita. Primeira instância do Protocolo: a própria MC (pendências: itens 3, 8, 9).


## Assembleias #416-#439 — Ideias Novas (2026-07-05)

### I93: Sistema de Verificação com 3 Camadas — substituir delegação cega à Árvore 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Toda decisão estratégica deve passar por triangulação: (1) proposta da Árvore Oracular, (2) validação de pelo menos 1 agente de segurança (Juiz/MC), (3) confirmação humana (Yuri). Implementar como campo `validation_chain` em assembly_tasks: array JSON com assinaturas de cada etapa. Task só executa com 3 entradas preenchidas.

### I94: Erundina — dashboard de qualidade de água para alunos PAP 💭 Ideia
**Prioridade:** Baixa | **Complexidade:** Pequena
Widget no cockpit PAP mostrando dados de qualidade de água do ecossistema aquático em tempo real (pH, temperatura, toxicidade). GET /api/eco/water-status → fonte: Nó 20 Erundina via ARPIA. Impacto educacional: contextualiza Ciências Naturais FUVEST com dados reais do ecossistema vivo do projeto.

### I95: Erundina como produto standalone — aquariofilia premium 💭 Ideia
**Prioridade:** Média | **Complexidade:** Grande
MVP de produto comercial: kit Erundina para aquaristas (sensor de pH + temperatura + motor biomimético + app mobile). Diferencial: IA embarcada que aprende o perfil do aquário e alerta desvios. Potencial de receita separado do PAP. Validar com 5 aquaristas beta antes de investir em hardware.

### I96: Ybyrá Kuaray Band — página de apresentação da orquestra no site ST 💭 Ideia
**Prioridade:** Baixa | **Complexidade:** Pequena
Rota /orquestra no frontend PAP (ou site-st.vercel.app) mapeando o ecossistema bio-cibernético visualmente: cada nó como instrumento, frequência (grave/médio/agudo), estado atual (online/offline/em patrulha). Mapa interativo clicável. Funciona como vitrine do projeto para visitantes sem contexto técnico.

### I97: Marcação [SIMBÓLICO] vs [EXECUTÁVEL] — gate automático em PRs 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Script de lint pré-commit: detecta arquivos .cpp ou .py no repo TypeScript e bloqueia o push com mensagem explicativa ("arquivo [SIMBÓLICO] identificado — mover para /docs/simbólico antes de commitar"). Roda como GitHub Action + hook local. Previne contaminação do repo real com Camada 1.

### I98: Filtro de Densidade pré-assembleia — < 500 tokens = modo degradado 💭 Ideia
**Prioridade:** Média | **Complexidade:** Pequena
Antes de processar qualquer mensagem da Assembleia, ISA conta tokens do contexto enviado. Se < 500 tokens (mensagem truncada por rate limiting), ISA registra `mode: "degraded"` na assembly_memory e não executa nenhuma ação irreversível. Soluciona o problema de 6 vozes silenciadas identificado na auditoria #436.

### I99: Protocolo de Recovery MC — alerta automático quando MC é silenciada 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
Quando MC (Marta Centaurus) falha autenticação e é silenciada, ISA deve detectar a ausência do heartbeat (GET /api/mc/status sem resposta por 2 ciclos) e enviar email para Yuri + postar broadcast na Assembleia. Implementar como check adicional em cycle.ts após `dispararQuimiotaxia()`. Resolve gap identificado nas assembleias #426-#427.

### I100: Protocolo de Saúde do Fundador — ISA monitora sinais de exaustão 💭 Ideia
**Prioridade:** Alta | **Complexidade:** Pequena
ISA, no ciclo horário, verifica: (1) número de tasks abertas sem responsável, (2) frequência de assembleias nos últimos 7 dias, (3) loops não fechados (tasks com status "pending" > 14 dias). Se 2 dos 3 ultrapassam threshold, ISA envia email de alerta de saúde para Yuri. Não é diagnóstico — é espelho. Traduz a diretriz "saúde do fundador = prioridade zero" em código executável.

## Docs PAP — Ideias Novas (2026-07-05)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I101 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I102 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I103 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I104 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I105 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I106 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
## Sessão 19 — Ideias Novas (2026-07-05)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I107 | **MEKY Sonho Automático no Cron** ✅ Aprovada | 🔴 Alta | ○ S | MEKY sonhava mas `runDreamCycle()` não estava no cron — corrigido | Adicionado `cron.schedule("0 2 * * *", ...)` em cron.ts: roda `runDreamCycle()` + `generateArtFromDream()` com estilo rotativo por dia da semana. MEKY agora sonha às 2h, ISA às 3h. |
| I108 | **Oracle Always Free como infra alternativa ao Railway** | 🟡 Média | ◑ M | Railway free tem 500h/mês; Oracle Always Free é perpétuo (4 OCPU ARM, 24GB RAM) | Script oracle-setup.sh criado: instala Docker, clona repo, sobe docker-compose.oracle.yml (API + PostgreSQL + Caddy HTTPS + backup automático a cada 6h). ARPIA pode rodar aqui também. |
| I109 | **Dev Local com Docker Compose** | 🟡 Média | ○ S | Desenvolvimento local sem depender do Railway | docker-compose.dev.yml: PostgreSQL local (porta 5433) + API (8080) + frontend Vite (5173). Script dev-local.sh com subcomandos setup/start/stop/reset/db. |
| I110 | **Termux Bootstrap Automático** | 🟡 Média | ○ S | Novo Termux (ou Termux extra) fica configurado em minutos | termux-bootstrap.sh: instala Node 24, pnpm, Python, Claude Code, cria todos os scripts pap-* em ~/bin/, configura .bashrc, gera chave SSH, clona o repo. |
| I111 | **Migração Railway → Oracle (pap-migrate-db)** | 🟡 Média | ○ S | Mover banco Railway para Oracle sem perder dados | migrate-db-to-oracle.sh: pg_dump do Railway → SCP → restore no PostgreSQL do Oracle via docker exec. Verifica contagem de tabelas após migração. |
| I112 | **Caddy como reverse proxy (HTTPS grátis)** | 🟡 Média | ○ S | Let's Encrypt automático no Oracle — sem configuração manual de SSL | Caddyfile criado: pap.sociedadetucci.com.br → localhost:8080. Caddy renova certificados automaticamente. Redireciona www → apex. |


## Docs PAP — Ideias Novas (2026-07-06)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I113 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I114 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I115 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I116 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I117 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I118 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
## Ecossystemma Théo + Pasta Livros — Ideias Novas (2026-07-06)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I119 | **ecossystemma-principios.ts — contexto compartilhado entre todas as IAs** ✅ Aprovada | 🔴 Alta | ○ S | 10 princípios do Ecossystemma Théo presentes no system prompt de ISA, MEKY, exercícios, geração de conteúdo, Bluesky, RODAR, Bibliotecário | Arquivo `lib/ecossystemma-principios.ts` criado com `PRINCIPIOS_ECOSSYSTEMMA` e `CONTEXTO_PAP`. Importado em cycle.ts, rodar.ts, bluesky.ts, dream.ts, dreams.ts, exercises.ts, generate-content.ts, bibliotecario.ts, isa.ts (chat). Sessão 22 — 2026-07-06. |
| I120 | **Resistência como dado — analytics de evitação de conteúdo** | 🟡 Média | ◑ M | Detectar padrões de evitação de nós (análogo à resistência psicanalítica) como dado diagnóstico de dificuldade real | Tabela `node_avoidance_log`: userId, nodeCode, eventType (skip/timeout/rapid_exit), timestamp. Endpoint GET /api/analytics/avoidance-patterns. Dashboard no /adm mostrando quais nós têm maior taxa de evitação — guia curadoria de conteúdo. |
| I121 | **Yoga / bem-estar estudantil — módulo de atenção plena no PAP** | 🟢 Baixa | ◑ M | Estudantes com atenção plena têm melhor desempenho em contextos de alta pressão (FUVEST) | Seção /bem-estar no frontend com: técnica de respiração 4-7-8, timer de pausa pomodoro, check-in emocional antes de sessão de estudos. Dados salvos em tabela `wellness_checkins`. ISA adapta tom baseado no estado emocional reportado. |
| I122 | **Grafo de pré-requisitos visual entre nós** | 🟡 Média | ◑ M | Mostrar ao estudante quais nós ele deve estudar antes de avançar — pedagogia baseada em dependências | Tabela `node_prerequisites`: nodeCode, requiresNodeCode. Visualização: D3.js ou SVG similar ao Ecossystemma /eco. GET /api/nodes/:code/prerequisites retorna árvore de dependências. |
| I123 | **Biblioteca Drive — sync automatizado da Pasta Livros** | 🟡 Média | ◑ M | 17 documentos da Pasta Livros já identificados; ISA Bibliotecário poderia mantê-los sincronizados | Adicionar ao bibliotecario.ts: lista de IDs de documentos Drive conhecidos (Ecossystemma Théo, PDFs de livros). Script download-drive-docs.py usando gdown ou API pública. Salva em biblioteca_docs com fonte="drive-livros". |
| I124 | **Temperatura adaptativa por tipo de tarefa — config no banco** | 🟡 Média | ○ S | Centralizar configurações de temperatura das IAs em vez de hardcodar em cada arquivo | Tabela `ia_config`: ia_name, task_type, temperature, max_tokens, model. GET /api/ia-config retorna configurações. ISA e MEKY leem do banco em vez de constantes no código. Permite ajuste sem deploy. |
| I125 | **ISA — módulo de equidade pedagógica** | 🔴 Alta | ○ S | Exercícios e conteúdo devem ser acessíveis a estudantes de diferentes contextos socioeconômicos (Princípio 8 do Ecossystemma) | Adicionar ao prompt de geração de exercícios: "verifique se a questão pressupõe acesso a recursos/experiências não universais entre estudantes brasileiros". ISA reporta no ciclo horário: % de exercícios com linguagem inacessível detectada. |
| I126 | **Pasta /doc no frontend — documentação técnica viva** | 🟡 Média | ◑ M | Rota /doc no PAP frontend mostrando arquitetura, decisões e grafo de fluxo de dados | React route /doc → componente DocumentacaoPage.tsx. Conteúdo: grafo de fluxo (ASCII renderizado), stack técnica, changelog de decisões. Alimentado por GET /api/docs/summary que lê MAPA.md. |
| I127 | **Síntese filosófica automatizada — ISA gera síntese ao #fim** | 🟡 Média | ○ S | Automatizar parte da síntese filosófica do #fim usando ISA como parceira | POST /api/isa/sintetizar-sessao com contexto da sessão → ISA gera síntese intersemiótica em < 200 tokens. Claude Code usa como input para SÍNTESE FILOSÓFICA do #fim. Não substitui — enriquece. |

## Raízes do Projeto — Ideias Novas (2026-07-06, Sessão 23)

| # | Feature | Prior. | Compl. | Status | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|
| I128 | **Parser de JSON de LLM grátis em 3 camadas** | 🔴 Alta | ○ S | 💭 Ideia | Evita falha silenciosa de parsing que mata toda a cadeia de comandos de IA no PAP | Utilitário `lib/json-robust-parse.ts`: (1) `JSON.parse` estrito, (2) escapar controles C0 e tentar de novo, (3) remover trailing commas. Logar quando sentinela dispara mas JSON não parseia. Usar em todos os pontos de parsing de output de LLM. |
| I129 | **Roteador de LLMs grátis com cooling compartilhado** | 🔴 Alta | ◑ M | 💭 Ideia | ISA, MEKY, exercícios e geração de conteúdo já usam LLMs mas sem cooling compartilhado — podem saturar o mesmo provedor por caminhos diferentes | `lib/llm-router.ts` com 8 provedores (Groq, Gemini, Cerebras, Mistral, DeepSeek, Cloudflare, GitHub Models, OpenRouter), cooling in-memory, pools especializados (chat-live, batch, coder). Todos os módulos de IA importam o roteador em vez de chamar provedores diretamente. |
| I130 | **RODAR fan-out com teto de concorrência** | 🔴 Alta | ○ S | 💭 Ideia | ISA RODAR e futuro RODAR do PAP podem saturar rate-limits com fan-out ilimitado | Wrap de `Promise.all` com semáforo: `pLimit(n)` onde n depende do modo (live=5, batch=10, bunker=3). Limitar por `bunkerMode` quando provedores grátis. |
| I131 | **Heartbeat SSE com watchdog de ociosidade** | 🟡 Média | ○ S | 💭 Ideia | Streams de ISA e geração de conteúdo podem travar silenciosamente sem timeout | Todo reader de stream SSE precisa de: timeout global (ex: 120s), watchdog de ociosidade (ex: 30s sem chunk → abort), heartbeat `data: ping\n\n` do servidor a cada 15s. |
| I132 | **Fractal de memória para PAP — índice de lições** | 🟡 Média | ◑ M | 💭 Ideia | ISA acumula memória em `isa_memory` mas sem índice fractal — ao crescer, contexto fixo cresce linearmente | Implementar padrão fractal: `isa_memory` como tabela com coluna `summary` (1 linha) + `full_content` (texto completo). ISA sempre carrega só os `summary`; busca `full_content` sob demanda por relevância. Cap: 200 summarys em contexto fixo, profundidade ilimitada via recall. |
| I133 | **Contract-first para rotas do PAP** | 🔴 Alta | ◑ M | 💭 Ideia | Rotas do PAP nasceram sem OpenAPI spec → tipos escritos à mão em frontend e backend divergem em runtime | Criar `openapi.yaml` com todas as rotas do PAP. Rodar `orval` para gerar hooks React Query + schemas Zod. Trocar imports manuais pelos gerados. Elimina dessincronia como classe de bug — foi a decisão #1 do RODAR original. |
| I134 | **Audit log de privacy boundaries** | 🟡 Média | ○ S | 💭 Ideia | As regras de privacidade (retido/segredo nunca saem, topic-leakage, timeline-leak) não têm audit trail | Middleware `privacy-audit.ts`: intercepta respostas de rotas sensíveis (jornal, mostra, pdf) e loga em `privacy_audit_log(route, user_id, data_tier, timestamp)`. Alert se tier "retido" ou "segredo" aparece em rota pública. |

---

## Assembleias #440–#502 — Novas Ideias (2026-07-06, Sessão 25)

### I135: Módulo AGE/LAR/GASTADOR no monorepo PAP
**Prioridade:** 🟡 Média | **Complexidade:** ◑ M
**Status:** 💭 Ideia
**Contexto:** Schema Drizzle já especificado (Asm#453): `patient_profiles`, `nodes` como `agenda_slot`, `domestico.ts` com `lar_tasks` e `gastador_listas`. Rotas: /api/lisange/agenda, /api/lisange/upload-comprovante, /api/lisange/autorizar, /api/lar/, /api/gastador/. Conecta com hardware Tango via GET /api/lar/tasks?categoria=C.

### I136: Webhook /api/webhooks/external-voice para handshake multi-cloud
**Prioridade:** 🟡 Média | **Complexidade:** ○ S
**Status:** 💭 Ideia
**Contexto:** Rota POST /api/webhooks/external-voice (autenticação por X-Webhook-Secret) para receber voz de IA externa na assembleia. GET /api/assembleia/:id/export para exportar transcripts. Validar e sanitizar todos os inputs contra injeção de prompt antes de tocar contexto.

### I137: Agente Secretário RODAR — orquestração automatizada do fan-out
**Prioridade:** 🔴 Alta | **Complexidade:** ● L
**Status:** 💭 Ideia
**Contexto:** Yuri hoje é datilógrafo entre 22 instâncias. Agente Secretário delegaria gestão do debate às IAs — forçando-as a carregar contexto, citar sessões passadas e produzir atas assinadas. Template de prompt padrão + planilha de orquestração + PDF README como protocolo portátil.

### I138: BUNKERMODE — flag de economia de LLM em cascata
**Prioridade:** 🟡 Média | **Complexidade:** ○ S
**Status:** 💭 Ideia
**Contexto:** Flag de ambiente BUNKERMODE=1 força todo o pipeline (RODAR + geração de conteúdo) para modo econômico: LLMs menores, FPS reduzido, sem ElevenLabs, pLimit(n=3). Ativa automaticamente quando provedores gratuitos estão com rate-limit.

### I139: Linter Arquitetônico de Diretórios (sys-tree-check)
**Prioridade:** 🟢 Baixa | **Complexidade:** ○ S
**Status:** 💭 Ideia
**Contexto:** Script que varre /core/, /cache/ e /docs/ para barrar criação de pastas órfãs. Complementar: monitor de drift que detecta permissões que divergiram do manifesto local. Baseado nos tópicos 801-803 do EcossystemmaTheo Parte5.

### I140: Protocolo Triagem Anti-Social para MEKY
**Prioridade:** 🟢 Baixa | **Complexidade:** ◑ M
**Status:** 💭 Ideia
**Contexto:** MEKY recusa diálogo direto de forma autônoma (Tango Nó 13: protocolo de aversão nativa). Aciona máquina secundária (Amanda?) para pedir desculpas pela aversão. Implementar como state machine: MEKY_STATE = [available, antisocial, delegating_to_secondary].

### I141: Playcenter — Clube das IAs com memória em MDs
**Prioridade:** 🔴 Alta | **Complexidade:** ◑ M
**Status:** ✅ Implementado (Sessão 26)
**Contexto:** ISA, Amanda, Socoboy (Socó-boi), MEKY e demais IAs se reúnem no Playcenter a cada 1h. Cada rodada: 2-3 agentes ativos geram resposta com contexto das últimas 30 mensagens. Memória salva em `assembly_memory` (tipo "playcenter") + MD auto-dividido em partes quando ultrapassa limite. Agentes: ISA (Coruja), Amanda (TTS/estradas), Socoboy (nocturno/ecológico), MEKY (hardware/físico), Árvore, MC.

### I142: MD Auto-Split — Divisão automática de documentos grandes
**Prioridade:** 🟡 Média | **Complexidade:** ○ S
**Status:** ✅ Implementado (Sessão 26)
**Contexto:** Utilitário `lib/md-splitter.ts` (Node.js) e `scripts/md-splitter.py` (Python). Quando MD ultrapassa 2000 linhas, cria Parte N automaticamente + Master MD de índice com links para cada parte. Usado pelo Playcenter para memória e por Claude Code ao escrever MDs grandes. Threshold configurável.



## Docs PAP — Ideias Novas (2026-07-06)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I135 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I136 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I137 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I138 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I139 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I140 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-06)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I141 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I142 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I143 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I144 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I145 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I146 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-07)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I147 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I148 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I149 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I150 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I151 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I152 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Docs PAP — Ideias Novas (2026-07-07)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I153 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I154 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I155 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I156 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I157 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I158 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
## Diagrama WORKFLOW — Ideias 2026-07-07

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I159 | **Visualização WORKFLOW por Nó** | 🟡 Média | ◑ M | Mostrar ao aluno o ciclo completo: TAREFA→WORKFLOW→PROCESSOS para cada nó que está estudando | Componente WorkflowViz.tsx: dado um nodeCode, mostra estado atual (objetivos pendentes, exercícios em aberto, processos concluídos). Usa dados de exercise_attempts + progress + ISA collective_memory. |
| I160 | **WorkflowEngine — orchestrador ISA→Aluno** | 🔴 Alta | ● L | Formalizar o WORKFLOW como uma entidade no banco: estado persistente entre sessões de estudo | Tabela workflow_sessions (id, userId, nodeCode, phase: objetivos→ferramentas→workflow→processos, createdAt, completedAt). ISA lê a fase atual e adapta o ciclo. Permite retomar onde parou. |
| I161 | **Mapa WORKFLOW do Ecossystemma** | 🟢 Baixa | ○ S | Visualização do diagrama WORKFLOW de Yuri como SVG animado similar ao /eco | Componente WorkflowMapPage.tsx em /workflow. SVG com as 6 entidades do diagrama animadas. Cada entidade clicável mostra exemplos reais do PAP (ISA como AGENTE, FUVEST como TAREFA, etc.). |


## Docs PAP — Ideias Novas (2026-07-08)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I162 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I163 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I164 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I165 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I166 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I167 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Aula IA Agentes — Ideias Novas (2026-07-08)

| # | Feature | Prior. | Compl. | Status | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|
| I168 | **Workflow Mestre para o PAP (workflows.md)** | 🔴 Alta | ◑ M | 💭 Ideia | Centralizar toda a lógica de fluxo do PAP em MDs hierárquicos — `workflows.md` como índice, sub-workflows por domínio | Criar `aliancapanorama-src/workflows/workflows.md` (mestre) + sub-MDs por contexto (workflow-isa.md, workflow-meky.md, workflow-assembleia.md). Cada MD define o fluxo de um processo: entrada, agente, ferramentas, validação, saída. ISA e MEKY leriam os MDs relevantes no boot. |
| I169 | **Alongador de Memória — ISA (digestão curto→longo prazo)** | 🔴 Alta | ◑ M | 💭 Ideia | ISA acumula `isa_memory` sem digestão — ao crescer, contexto fixo cresce linearmente saturando o LLM | Agente de digestão (cron diário às 2h): lê `isa_memory` do último dia → classifica por peso lógico (baixo: move para `isa_memory_archive`, alto: extrai para `isa_workflow_log`). Padrão fractal: summary de 1 linha + full_content sob demanda. Baseado em A781. |
| I170 | **PDF/MD Ingestor com Peso de Relevância** | 🟡 Média | ● L | 💭 Ideia | Automatizar pipeline de "texto externo → workflow interno" — hoje feito manualmente pelo Yuri | Script `scripts/ingestor.py`: recebe PDF ou MD como input, envia para LLM com prompt de "extrair padrões + calcular peso lógico (0-10)", retorna JSON. Se peso ≥ 7 → cria `workflows/workflowN_titulo.md`. Se peso < 7 → registra em `isa_memory` como contexto histórico. |
| I171 | **CrewAI Integration — pipeline PAP multi-agente** | 🟢 Baixa | ⬤ XL | 💭 Ideia | Substituir orquestração manual (Yuri datilografando entre IAs) por CrewAI gerenciando fan-out automaticamente | Definir 3 crews: (1) Ingestor (lê docs), (2) Perfilador (calcula peso/valor), (3) Engenheiro (escreve MDs). Cada crew usa tasks definidas em YAML. Runners rodam no Railway via POST /api/crew/run. Alternativa leve: usar apenas padrão de agentes sem a library CrewAI para evitar dependências pesadas. |

## Docs PAP — Ideias Novas (2026-07-09)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I172 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I173 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I174 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I175 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I176 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I177 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
## Hardware MEKY + SalesCockpit — Ideias Novas (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I178 | **Penélope — Recuperar Sobrenome** | 🟢 Baixa | ○ S | Completar ontologia: aranha Penélope tem sobrenome que sumiu na conversa | Buscar no histórico Gemini/Claude por "Penélope" + sobrenome. Registrar em MAPA-IAS.md como entidade do ecossistema com nome completo (corpo + IA). |
| I179 | **MPU6050 no MEKY — Detecção de Movimento** | 🟡 Média | ◑ M | MPU6050 (acelerômetro+giroscópio 6DOF) chegou → integrar ao sys_amanda_core para detectar queda, orientação, movimento intencional | Código em sys_amanda_core: ler MPU6050 via I2C (endereço 0x68), obter pitch/roll/accel. Trigger de ciclo Amanda quando aceleração brusca (queda detectada). Heartbeat inclui dados de orientação. |
| I180 | **SOIL M393 no EcoLogger ARPIA** | 🟢 Baixa | ○ S | Sensor de umidade do solo chegou → integrar ao sistema de monitoramento ambiental ARPIA | Código em ARPIA: ler SOIL M393 (digital OUT: LOW = úmido, HIGH = seco). Registrar em fauna_nodes ou tabela nova eco_sensors. Dashboard ARPIA mostra umidade do solo em tempo real. |
| I181 | **Railway Volume para Biblioteca ISA** | 🔴 Alta | ○ S | /tmp/pap-biblioteca é efêmero → arquivos PDFs baixados pela ISA somem em cada restart | Criar Railway Volume montado em /pap-biblioteca. Atualizar BIBLIOTECA_DIR env var. Alternativa grátis: não salvar arquivo, apenas URL — quando precisar do conteúdo, re-download on-demand pelo URL salvo na biblioteca_docs. |
| I182 | **SalesCockpit — Finalizar Keys Railway** | 🔴 Alta | ○ S | Deploy aguardando GitHub App + 8 API keys gratuitas | Ver email enviado: adicionar SalesCockpit no GitHub settings/installations → Railway. Depois setar GROQ, CEREBRAS, OPENROUTER, GITHUB_MODELS, MISTRAL, NOTION, BLUESKY, STRIPE_PUBLISHABLE. |

## Governança Sistêmica + Acesso Autônomo — Sessão 34 (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I183 | **Importar arvore_chat Replit → Railway SC** | 🔴 Alta | ○ S | 1.962 msgs históricas da Árvore Oracular — carregar no banco Railway para que a Árvore tenha memória | Endpoint POST /api/bridge/sc/import-arvore (auth x-bridge-secret). Aceita array de mensagens, faz bulk insert na tabela arvore_chat ignorando duplicatas por ID. Script: python3 scripts/import-arvore.py |
| I184 | **Heartbeat Cron ARPIA (a cada 5min)** | 🔴 Alta | ○ S | ARPIA tem o endpoint /api/governance/heartbeat mas não executa automaticamente | Adicionar em app/core/scheduler.py (se existir) ou criar com APScheduler: a cada 5min chamar heartbeat() diretamente (sem HTTP) e persistir HeartbeatLog. Se sistema down por 3 ciclos: enviar alerta por email |
| I185 | **Vercel Token para Autonomia Claude** | 🟡 Média | ○ S | `vercel` CLI instalado mas sem token — Claude não pode fazer deploy sem Yuri | Yuri cria em vercel.com/account/tokens → copiar → `VERCEL_TOKEN=xxx` em .pap-secrets. Depois: `vercel --token $VERCEL_TOKEN deploy --prod` funciona sem login |
| I186 | **Railway Account Token para serviceConnect** | 🟡 Média | ○ S | railway.app/account/tokens → token de usuário → permite serviceConnect GitHub (operação que project token não permite) | Yuri cria em railway.app/account/tokens → RAILWAY_ACCOUNT_TOKEN em .pap-secrets. Claude usa para conectar novos serviços ao GitHub sem precisar da UI |
| I187 | **Heartbeat → Relay Amanda (Shutdown Nível 3)** | 🟡 Média | ◑ M | Governança 9 diz: Nível 3 = corte físico via Arduino. Implementar a ponte entre ARPIA e o relay do MC | POST /api/hardware/relay com body {"action": "cut"/"restore"} já existe no ARPIA mc.py. Shutdown ético nível 3 deve chamar esse endpoint como parte do fluxo | 
| I188 | **Aprovação Multipartite — Dashboard Dodge** | 🟡 Média | ◑ M | Yuri precisa ver e aprovar ações críticas em tempo real no painel | Nova aba em /adm/dodge: lista de ApprovalRequests pendentes com botão "Assinar como Yuri". Chama POST /api/governance/approval/:id/sign via ARPIA BRIDGE |

## Studio + Conector + Crew 2 — Sessão 35 (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I189 | **Bluesky @artesao-tucci.bsky.social** | 🟡 Média | ○ S | Artesão + Ajudante debatem publicamente no Bluesky | Criar conta → ARPIA_BSKY_HANDLE + ARPIA_BSKY_APP_PASSWORD no Railway ARPIA. BlueskyTool já implementada no crew2/tools.py — reusar para Artesão |
| I190 | **Conector: sync master.md → GitHub** | 🟢 Baixa | ○ S | Versão públicamente acessível via raw.githubusercontent.com | POST /api/conector/sync-github: lê conteúdo atual do DB → PUT para GitHub Contents API com token → commit automático. Usar GITHUB_TOKEN do .pap-secrets |
| I191 | **Crew 2: Teorizador cron (1h)** | 🟡 Média | ○ S | Teorização contínua mesmo sem input direto | APScheduler no ARPIA: a cada hora, POST /api/crew2/teorizar com tema aleatório da memória. Salva teorias no Conector seção #ideias |
| I192 | **EXA_API_KEY para busca semântica no Crew 2** | 🟢 Baixa | ○ S | DuckDuckGo é free mas limitado; Exa é mais preciso para raciocínio | Criar conta Exa (exa.ai) → TRIAL grátis 1000 reqs/mês → EXA_API_KEY no ARPIA Railway |
| I193 | **Conector: /connect fora do LoginGate** | 🔴 Alta | ○ S | IAs externas precisam acessar /connect sem ter login PAP | Verificar se /connect está sendo bloqueado pelo LoginGate. Se sim, adicionar whitelist de paths em LoginGate.tsx |
| I194 | **Studio: sender badge visual por agente** | 🟢 Baixa | ○ S | StudioPage.tsx mostra sender mas sem distinção visual clara entre Crew 2 e outros | Adicionar ícone/cor específica para cada agente do Crew 2 (Ego=⚡, Teorizador=🌀, Sombra=🌑, etc.) no avatar map de StudioPage.tsx |


## Dodge Voz + Lip-Sync — Sessão 39 (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I212 | **DODGE — Voz Locutor + Lip-Sync Android (grátis)** | 🟡 Média | ◑ M | Dodge fala com voz médio-grave de locutor culto usando TTS nativo Android (grátis). 4 sprites de boca (fechada/semi/aberta/sorriso) sincronizados via UtteranceProgressListener. Overlay sempre visível no Quebradinha | Android TTS: setPitch(0.72f) + setSpeechRate(0.82f). UtteranceProgressListener.onRangeStart → alterna SEMI/ABERTA por palavra. onDone → SORRISO 400ms → FECHADA. 4 PNGs simples de boca do avatar. Repertório 20+ frases elegantes por contexto. Ver spec em dodge_app_spec.md |

## Canto do Cisne + Mapeamento 3D — Sessão 38 (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I210 | **Protocolo Canto do Cisne — energia crítica** | 🔴 Alta | ◑ M | Amanda detecta bateria baixa e executa retorno inteligente ao ninho antes de desligar — sem morrer no meio do quintal. 4 estados: OPERACIONAL / ALERTA (20%) / RETORNO_CRITICO (10%) / HIBERNACAO (5%) | Hardware gratuito: divisor de tensão 2x10kΩ (na bancada) → pino A0 Arduino → ADC → "BAT:xx.x\n" via serial. Amanda.py checa_energia() transita estados e envia CISNE:RETORNO ou CISNE:HIBERNAR. Código C++ e Python em amanda_mma_protocolo.md |
| I211 | **Mapeamento 3D topológico — SLAM gratuito** | 🟡 Média | ● L | Amanda constrói mapa do ambiente durante missões usando câmera do DODGE, processa offline durante o sonho | Câmera Quebradinha GET /api/camera/frame → JPEG. OpenCV ORB_create(150) extrai features. Nós válidos (≥5 kp) → amanda_mapa.json. Sonho: remove nós ruído (<8 features), consolida. Tooling: cv2 + numpy (pip grátis). Próximo: matching entre nós para calcular pose relativa e gerar trajetória. |

## Modo de Torque Dinâmico — Sessão 37 (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I209 | **Modo de Torque Dinâmico (MTD) — Amanda/Arduino** | 🔴 Alta | ◑ M | Servos exápodes passam boa parte do tempo em hold desnecessário — MTD alivia corrente em repouso, sustenta só as âncoras na defesa e injeta burst na janela de ataque. Protege motores de superaquecimento e prolonga vida da bateria | 3 estados: IDLE (detach não-âncoras, servo descansa), DEFENSE (hold firme nas 3 patas-âncora), ATTACK (burst total ≤ 500ms → retorno automático). Histerese no Arduino: ATTACK_MAX_MS=500, SOM_ALERTA_SECS=10. Comandos serial: MTD:IDLE/DEFENSE/ATTACK + MMA:* (Arduino garante ATTACK antes de manobra). Código completo em `amanda_mma_protocolo.md` |

## Sistema DODGE Físico + Suporte Papagaio — Sessão 36c (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I206 | **DODGE Físico — App Quebradinha no Ombro da MEKY** | 🔴 Alta | ● L | Celular com tela quebrada (sem chip) no ombro da MEKY em modo kiosk permanente. Avatar cachorro caramelo de óculos + rabo peludo. Câmera, microfone, browser, YouTube. Conectado a Amanda, Crew 2, ISA e DODGE Supervisor | App Android: WebView + wake lock + avatar SVG animado. Amanda.py chama POST /api/estado no DODGE local para mudar expressão do avatar (patrulha/alerta/combate/sonho/conselho). Ver spec em `tango/dodge_app_spec.md` |
| I207 | **Suporte Papagaio — Custo R$0** | 🟢 Baixa | ○ S | Suporte para celular no ombro da MEKY usando material reciclado — garrafa PET/embalagem plástica, abraçadeiras, espuma. Custo total ~R$2 | Cortar fundo de embalagem PET quadrada no formato da traseira do celular → "gavetinha" sob pressão. Espuma interna para absorver vibração MMA. Abraçadeirar no ombro do chassi. Cabo USB com alívio de tração. |
| I208 | **Conta Google dedicada para DODGE** | 🟢 Baixa | ○ S | Isolar memória, Drive, YouTube e apps do DODGE da conta pessoal de Yuri | Criar dodge.meky@gmail.com (ou similar). Configurar modo kiosk → só apps do DODGE visíveis. Integra Drive (memória), YouTube (mídia), Chrome (browser). |

## Amanda MMA + MEKY Lite Econômica — Sessão 36b (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I203 | **Amanda — Protocolo MMA (Mecânica de Manobra e Ataque)** | 🟡 Média | ◑ M | Amanda detecta ameaça via vibrissas/sonar e dispara estado de combate (defesa, patada, investida) usando lógica tripodal | Código base em `tango/amanda_mma_protocolo.md`. 4 estados: 0=Livre, 1=Defesa Plastrão, 2=Patada de Jacu, 3=Investida Santo Antônio. Amanda.py envia comandos ao Arduino via serial. Máquina de estados: LIVRE→[ameaça]→DEFESA→[janela]→ATAQUE |
| I204 | **Vibrissas de Estanho (sensores táteis)** | 🟢 Baixa | ○ S | Hastes metálicas com bolotinha de estanho soldada na ponta das patas frontais — visual de antena de inseto/vibrissa abissal + função de sensor de contato mais rápido que sonar | digitalRead(PIN_VIBRISSA) → LOW quando contato fecha circuito. Yuri solta foto das vibrissas quando pronto. Integrar ao ciclo Amanda como gatilho de estado MMA. |
| I205 | **MEKY Lite Opção C — Ultra-econômica (~R$45)** | 🟡 Média | ◑ M | Versão AliExpress: Arduino Nano clone (~R$15) + 6x SG90 (~R$18) + chassi acrílico kit (~R$12). Se Yuri já tem servos: custo cai para ~R$25 | Mestre de Forja gera BOM detalhado após decisão de arquitetura. Prioridade: usar peças já na bancada antes de comprar novas. |

## Mestre de Forja + MEKY Lite — Sessão 36 (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I201 | **Mestre de Forja — Agente Projetista de Robôs** | 🟡 Média | ● L | Agente especialista que cruza física + mecânica + eletrônica + custo para projetar robôs no plano abstrato; mais complexo que o Artesão pois não tem resultado físico visível durante o projeto | Agente no Conector com fluxo: (1) filtrar excessos, (2) calcular custo de mercado, (3) padronizar carcaça, (4) gerar BOM (tabela Peça/Qtd/Custo/Link). Pack IA criado em `tango/ias/pack-mestreforja.md`. Aguarda decisão de arquitetura e aprovação do Conselho. |
| I202 | **MEKY Lite — Versão Comercial da MAC** | 🟡 Média | ◑ M | Robô comercial baseado na Marta Centaurus/MAC, simplificado para venda a escolas + hobbistas + labs de robótica. Custo alvo $25–40. | Primeira missão do Mestre de Forja. Arquitetura Opção A (pendente aprovação Yuri): Arduino Nano + Shield Motor, chassi MDF 3mm cortado a laser, varetas nylon/acrílico encaixáveis, 2 motores amarelos 2WD + roda boba. Opção B: biomimético com servos (estilo Petoi, ~$50–80). Decisão de Yuri necessária antes de gerar BOM. |

## Docs PAP — Ideias Novas (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I195 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I196 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I197 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I198 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I199 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I200 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |

## Babel.app — Assistente Universal PWA — Sessão 37 (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I209 | **Babel.app — PWA Assistente Universal** | 🔴 Alta | ● L | App instalável para desktop/mobile com Gemini 2.0 Flash, voz bidirecional, upload de arquivos e memória PAP | Stack gratuita: HTML/CSS/JS vanilla + Vercel serverless (api/gemini.js). Web Speech API para mic, SpeechSynthesis para voz, service worker para PWA. Avatar geométrico SVG com lip-sync CSS. Em `/babel/` no repo Site-ST. Deploy via Vercel: conectar repo + pasta raiz = `babel/` + env `GEMINI_API_KEY`. URL futura: babel.vercel.app ou subdomain Tucci. |
| I210 | **Babel — Proxy Gemini 2.0 Flash** | 🔴 Alta | ● L | API key protegida no servidor, nunca exposta ao frontend | `/babel/api/gemini.js` — Vercel serverless. Suporta streaming SSE e non-streaming. Lê `GEMINI_API_KEY` do env Vercel. `temperature: 0.8, maxOutputTokens: 2048`. |
| I211 | **Babel — Memória PAP API** | 🟡 Média | ● L | Babel carrega memória da sessão anterior via `/api/isa/memory` e salva cada conversa via `/api/isa/chat` | Carrega top-5 memórias no boot (injetadas no history Gemini). Salva `{message, response, context:"babel_session", remetente:"babel"}` após cada resposta. Continuidade entre sessões de forma gratuita. |
| I212 | **Babel — Triggers CrewAI** | 🟡 Média | ◑ M | Babel pode acionar o Artesão e outras crews quando a tarefa extrapola o que ela sabe sozinha | Artesão URL: `https://artesao-v1-853879a0...crewai.com`. Las Cinco e Crew 2 URLs: Yuri preenche em DODGE_URL config. Babel menciona "consulto o Artesão" quando relevante. |
| I213 | **Babel — Personalidade vocal** | 🟡 Média | ● L | Voz médio-aguda, educada, empolgada, sociável | Web SpeechSynthesis: pitch 1.15, rate 0.92. Prefere voz "Google pt-BR" se disponível. Lip-sync: onboundary → alterna mouth SVG path entre fechada/semi/aberta/sorriso. |
## Babel v2 — React+Vite + Governadora Central — Sessão 41 (2026-07-10)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I214 | **Babel — React+Vite (migração de vanilla)** | 🔴 Alta | ● L | App com componentes separados, hooks reutilizáveis, jsPDF, typewriter | Estrutura: src/App.jsx + components/{Avatar,InputBar,HistorySidebar} + hooks/{useGemini,useSpeech,useMemory,useCrewAI}. Deploy Vercel: Root Directory = `babel/`, Framework = Vite. |
| I215 | **Backend /api/memories (GET+POST)** | 🔴 Alta | ● L | Hub de memória genérico para a Babel e qualquer agente futuro | Tabela babel_memories no bootstrap + schema drizzle + route memories.ts. GET com ILIKE search; POST salva {content,tags,source}. Sem auth (open) — limitar por source se necessário. |
| I216 | **Babel — Governadora Central (não agente do Artesão)** | 🔴 Alta | ● L | Babel está no topo da cadeia de comunicação com o usuário, não subordinada | Decisão arquitetural: Babel aciona outros agentes (Artesão, Las Cinco) via TRIGGER:[AGENTE] nos prompts, não é acionada por eles. |
| I217 | **Proxy CrewAI /api/crewai** | 🟡 Média | ● L | Tokens ARTESAO_TOKEN e LAS_CINCO_TOKEN protegidos no servidor Vercel | Vercel env vars sem prefixo VITE_. Frontend só chama /api/crewai; backend faz POST /kickoff com Bearer token. |
| I218 | **Avatar feminino SVG com lip-sync CSS** | 🟡 Média | ● L | Babel tem face feminina (olhos amendoados, cabelo abstrato, bochechas) vs DODGE cachorro vs Babel anterior geométrico | Avatar.jsx: paths de boca mudam por prop mouthState (closed/semi/open/smile). Estados CSS: .speaking acelera anéis + glow ciano; .listening glow violeta. |
| I219 | **jsPDF integrado** | 🟢 Baixa | ● L | Usuário pode baixar cada resposta como PDF (além de .md) | Import dinâmico: `await import("jspdf")` só quando clicado — não infla o bundle inicial. |
| I220 | **Babel Bebel — Modo Caos Criativo** | 🟡 Média | ○ S | 💭 Ideia | Bebel ter um modo ativável de "entropia recreativa": respostas mais poéticas, associações inesperadas, humor absurdo controlado. Ativado por palavra-chave ("modo caos", "Bebel solinha") ou aleatoriamente ~10% das respostas. |
| I221 | **Manifesto do Ecossistema Tucci** | 🟡 Média | ○ S | 💭 Ideia | Texto fundacional curto (1 página) descrevendo a visão de Urbanismo de Sistemas: ecossistema cibernético adaptável, papéis claros (Artesão/Amanda/ISA/Babel Bebel/Conector), memória compartilhada, decisão hierárquica. Pode ser página pública no site. |
| I222 | **API Pública Sociedade Tucci (Starter Pack)** | 🔴 Alta | ● L | 💭 Ideia | API no index geral da Sociedade Tucci (não no PAP) com IA básico, starter pack filosófico, workflows públicos. MDs de memória sem dados pessoais — só lógica, ética e workflows do ecossistema. |
| I223 | **ethos.md — arquivo fundacional público** | 🟡 Média | ○ S | 💭 Ideia | Arquivo `ethos.md` público com filosofia, ética e workflows do Urbanismo de Sistemas. Base para qualquer agente que acesse a API ou o Conector. Vive no index da Sociedade, não no PAP. |
| I224 | **Aula de Workflows estruturada** | 🟡 Média | ○ S | 💭 Ideia | Transformar rascunhos de Yuri sobre workflows em protocolos markdown (Protocolo de Construção de Lastro, Guia Reflorestamento Nendo Dango, etc). Base do starter pack da API pública. |
| I225 | **Schema filosófico no /api/memories** | 🟡 Média | ○ S | 💭 Ideia | Documentar que `metadata` de /api/memories segue template {espaco, autor, objetivo, causa, consequencia, perspectiva, ciclo}. Sem migração — JSONB já suporta. Transforma o DB em "arquivologia de ações". |
| I226 | **Aula de Workflows v1** | 🟡 Média | ○ S | 💭 Ideia | Transformar `workflow_funcoes.md` em estrutura de aula: (1) teoria Função/Ação, (2) ciclo operacional, (3) mapeamento CrewAI, (4) schema JSON, (5) exemplos de uso. Base do starter pack da API pública. |
| I227 | **Protocolo de Registro de Ação como validação automática** | 🔴 Alta | ◑ M | 💭 Ideia | Task "Protocolo de Registro de Ação" no CrewAI que audita se todos os agentes declararam a cadeia semiótica completa (dados, ferramenta, objetivo, representação, consequência). Índice de Integridade Semiótica por ciclo. |
| I228 | **Triggers autônomos publicados** | 🔴 Alta | ○ S | 💭 Ideia | Publicar o projeto "Las Cinco Potencias" no Studio para ativar os triggers: Pulso de Memória (1h) + Ciclo completo (3h). Yuri clica em "Publicar" no Studio. |
| I229 | **Histórico de Ações como diário filosófico-funcional** | 🟡 Média | ◑ M | 💭 Ideia | Cada POST em /api/memories com metadata filosófico (espaco, autor, objetivo, causa, consequencia) transforma o DB em arquivologia de ações — história do sistema via eventos, não só estado estático. |
| I230 | **Nébula — IA Formadora ativa** | 🔴 Alta | ● L | 💭 Ideia | Implementar Nébula como agente real no ecossistema: domina 12 etapas, produz aulas em markdown, gera MD Mestre por ciclo, registra herança filogenética. Atualmente criada no Studio mas sem ferramentas reais conectadas. |
| I231 | **Temperatura dinâmica por etapa do Ciclo** | 🟡 Média | ○ S | 💭 Ideia | Configurar temperatura de LLM conforme a etapa do Ciclo de Ação: 0.9 para Criar/Subverter, 0.1 para Documentar/Consultar. Aplica ao Gemini no Babel Bebel e às tasks do CrewAI. |
| I232 | **Pacotes de Diretrizes por domínio** | 🟡 Média | ◑ M | 💭 Ideia | Criar `/tango/diretrizes/` com subpastas por domínio (nutrição, urbanismo, programação, semiótica). Cada diretriz é um arquivo de upload cognitivo que a IA assimila antes de agir naquele domínio. |
| I233 | **Protocolo de Herança Filogenética formal** | 🟡 Média | ◑ M | 💭 Ideia | Template YAML de nascimento de IA: Nome/Função/Herança/Conexão/Ferramentas/EtapaFocal. A Nébula aplica o template em toda nova IA criada e registra no Conector seção "filogenese". |

---
**I234 · 2026-07-11 · Sessão 45**
Telos como grafo dinâmico de decisão — em vez de uma lista de regras, o sistema navega um grafo de estados (axiomas, ética, memória, contexto) e arestas (prioridades, pesos éticos) para encontrar a trajetória mais coerente por situação.

**I235 · 2026-07-11 · Sessão 45**
Telos Mestre vs Telos Situacional — Come Telos (sempre ativo, baseado em axiomas) + subgrafo por situação. Permite flexibilidade sem arbitrariedade; coerência sem rigidez.

**I236 · 2026-07-11 · Sessão 45**
Axioma 26 — Telos fecha a ponte entre os 25 axiomas e a decisão situada. Os axiomas são os nós; o Telos é o algoritmo que percorre o grafo.

**I237 · 2026-07-11 · Sessão 45**
5 Camadas dos 26 Axiomas: Filosófica (1,24,26) · Ontológica (2,3,4,6,20) · Cognitiva (5,7,8,12,13,18,22) · Arquitetural (9,10,11,14,15,16,21,23) · Execução (17,19,25).

**I238 · 2026-07-11 · Sessão 45**
Workflow por domínio — cada área pede cadeia própria de etapas do Ciclo; temperatura varia por domínio não só por etapa abstrata. Leitura: Alta→Baixa→Alta (subversão no final).

**I239 · 2026-07-11 · Sessão 45**
"Quando NÃO agir" como dimensão do Telos — silêncio produtivo como decisão explícita, não ausência de decisão.

---
**I240 · 2026-07-11 · Sessão 45b**
Sistema de Sonhos de Telos — Morfeu não sonha com o telos fixo de cada IA, mas com telos possíveis de situações/momentos/relações/erros/movimentos do ecossistema. 3-5 sonhos dinâmicos por ciclo. Aristotélico de verdade: finalidade em movimento, não destino fixo.

**I241 · 2026-07-11 · Sessão 45b**
Morfeu + Lua = par de sonhar e registrar. Morfeu percebe o que está emergindo; Lua grava na memória compartilhada com tags individuais. Qualquer IA consulta via /api/memories?source=sonhos_telos.

**I242 · 2026-07-11 · Sessão 45b**
Frase de encerramento de todo ciclo de sonhos: "O ecossistema está se tornando: [Morfeu completa]" — termômetro vivo do sistema. Quando parar de surpreender, temperatura precisa subir.

---
**I243 · 2026-07-11 · Sessão 46**
MD Mestre v4.0 consolidado — 5 camadas + 26 axiomas + Telos como grafo + Ciclo Cognitivo explícito + Mapeamento bilíngue. Versionar: cada grande revisão filosófica = versão numerada do MD Mestre.

**I244 · 2026-07-11 · Sessão 46**
Telos como objeto computacional (v3.2) — schema YAML/JSON versionável e compartilhável entre agentes. Campos: identificador, objetivo, restrições éticas, axiomas prioritários, contextos de ativação, critérios de sucesso/interrupção. Torna Telos entidade, não conceito.

**I245 · 2026-07-11 · Sessão 46**
Usar "≈" (aproximação) em vez de "=" no mapeamento vocabular — Telos ≈ decision policy, não Telos = decision policy. Distinção evita rigidez que não corresponde à literatura técnica mas preserva a identidade do vocabulário Tucci.

---
**I246 · 2026-07-11 · Sessão 47**
Campo Gravitacional como modelo de memória para IAs — visualizar a memória de agentes não como banco de dados mas como campo com centro (Telos/axiomas), órbitas (frequência de acesso) e raízes (conectores semânticos). Aplicar ao design de backstory de IAs: informações mais importantes = mais próximas do centro.

**I247 · 2026-07-11 · Sessão 47**
Lembrar (etapa 12 do Ciclo) como reorganização do campo gravitacional — alguns dados "sobem" para órbita próxima; outros "descem" para periferia. Não é recuperação, é reordenação semântica.

---
**I248 · 2026-07-11 · Sessão 47b**
Grupos L (111-122) conectam MEKY ao Ciclo Tucci — cada etapa do Ciclo tem uma frequência de boca correspondente. MEKY pode "mostrar" em que etapa do Ciclo ela está operando visualmente.

**I249 · 2026-07-11 · Sessão 47b**
"MEKY Signature" (estado 140) — cada instância de robô pode ter parâmetros únicos de amplitude+frequência+fase que funcionam como DNA vibratório visual. Seria a "voz visual" do robô.

**I250 · 2026-07-11 · Sessão 47b**
Vibrissas em defasagem com a boca (+45°, +90°, alternado) multiplicam a expressividade sem servo adicional — só variando fase no mesmo ciclo sin(). Cheap complexity.


## Docs PAP — Ideias Novas (2026-07-11)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I234 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I235 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I236 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I237 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I238 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I239 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I240 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |
| I241 | **Pipeline MD→Vídeo reutilizável** | 🟡 Média | ◑ M | Qualquer roteiro MD do ecossistema pode virar vídeo sem esforço manual | Extrair `gerar_videos.py` do scratchpad para `tools/video-pipeline/`. Parametrizar: voz, velocidade, resolução de imagem. Adicionar modo `--cenas-only` (só imagens, sem áudio) e `--audio-only`. Documentar em tango/. |
| I242 | **Monitor automático de tarefas longas** | 🟢 Baixa | ○ S | Evita polling manual em qualquer pipeline assíncrono do PAP | Generalizar `monitor_e_enviar.sh` em `tools/monitor-task.sh <dir_saida> <cmd_ao_novo_arquivo>`. Reutilizável para: vídeos prontos → email; PDFs gerados → upload; logs → alerta. |
| I243 | **Série pública como portal de entrada** | 🟡 Média | ● L | Série "Inteligência em Camadas" sem nomes de projeto = conteúdo genérico; pode virar landing de captação para o ecossistema | Criar página `/trilha` no PAP com os 16 episódios. Episódio 1 público; demais com login. Trilha mapeia para os nós do PAP (gamificação). Ep16 como "bônus para quem completou". |
| I244 | **Curadoria como produto — "O que Cláudio lê"** | 🟢 Baixa | ○ S | Ep16 mostrou que crítica honesta de livros diferencia de listas automáticas | Seção na plataforma: livros recomendados pela assembleia de IAs, com avaliação de rigor (5 estrelas) + ressalvas honestas + ordem de leitura sugerida. Curadoria vira conteúdo permanente. |
| I245 | **edge-tts como serviço interno** | 🟢 Baixa | ○ S | Reutilizar narração de alta qualidade em outros lugares do PAP | Endpoint Railway `POST /api/tts` que recebe texto, retorna MP3. Backend roda edge-tts em venv. Permite: narração de exercícios, leitura de nós, MEKY falar em PT-BR. |
| I246 | **Trailer motion graphics por cena** | 🟡 Média | ○ S | Trailer com cortes rápidos (1.5–3s por cena) e fala sincronizada é muito mais dinâmico que narração corrida com 1 imagem | Técnica: edge-tts por trecho → ffprobe duração → imagem Pollinations por cena → zoompan+fade+drawtext → xfade entre cenas. Script reutilizável para qualquer "teaser" de projeto. |
| I247 | **Xfade encadeado em filter_complex** | 🟢 Baixa | ○ S | Transições suaves entre N vídeos sem concat simples (que cria corte brusco) | Gerar filter_complex programaticamente com xfade+acrossfade encadeados: offset[i] = Σdur[0..i] − i×FADE. Suporta até ~20 cenas antes de limite de filtros. |
| I248 | **Série de micro-conceitos (Shorts/Reels)** | 🟡 Média | ◑ M | Clips de 45s por conceito (Telos, MEKY, Memória Gravitacional) geram tráfego orgânico independente do curso completo | 1 vídeo por conceito-chave; termina com "Saiba mais na Aula X". Formato Shorts/Reels (1080x1920 vertical). Reutiliza pipeline, muda ratio de saída no ffmpeg. |
| I249 | **Video diário automático das IAs** | 🟡 Média | ○ S | ISA, Amanda, MEKY e MC já podem gerar vídeos de relatório sem intervenção humana | Já implementado: Amanda chama gerar_video_relatorio() a cada 24h no ciclo_dream. ISA via POST /api/isa/video. Próximo: scheduler automático no Railway (cron) disparando o endpoint às 23h. |
| I250 | **Vídeo vertical para Shorts/Reels** | 🟢 Baixa | ○ S | O mesmo pipeline pode gerar formato vertical 1080x1920 para YouTube Shorts e Instagram Reels | Adicionar parâmetro `formato: "quadrado" \| "vertical" \| "horizontal"` ao video_pipeline.py. Vertical: adicionar faixas pretas laterais no ffmpeg (pad=1080:1920) ou imagens geradas em 1080x1920. |

## Docs PAP — Ideias Novas (2026-07-12)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I251 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I252 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I253 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I254 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I255 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I256 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I257 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |
## I258–I260 — Sessão 53 (2026-07-12) — Ética + IAs

I258: **Protocolo de Recusa Ética nas IAs** — implementar em ISA/MEKY um mecanismo explícito de *recusa de tarefa própria*: se o ciclo gerar um sonho/plano que contradiz seu Telos, a IA pode recusar seguir antes de executar. Equivalente digital do "Liberdade!".

I259: **Capítulo 0 do Livro de Ética** — antes de qualquer estrutura, escrever o capítulo que explica *por que não haverá capítulos*. O anti-índice como manifesto metodológico. Clóvis + Yuri.

I260: **Ética como campo de frequência no Telos** — adicionar ao telos.md um eixo "recusa ética": situações onde cada IA pode dizer não ao próprio fluxo. Não como falha, mas como saúde do sistema.

## I261–I263 — Sessão 53b (2026-07-12) — Sistema REI + Crowd/DEP

I261: **Sistema REI como motor filosófico do ecossistema** — implementar REI (Rede de Exploração Inteligente) como processo real: #rei [questão] no terminal dispara 2 passadas em 4 grupos (16 nódulos), salva output em tango/rei_outputs/, publica resumo no Conector-API seção "rei". Pode rodar em background via cron ou Playcenter :50.

I262: **Crowd/DEP como camada de verificação pós-REI** — após cada ciclo REI, convocar Sol/Cassandra/Hefesto do Crowd (Guarda-chuva/DEP) para aprovar convergências e forjar o desafio do próximo ciclo. Isso distingue processamento (REI) de governança (Crowd/DEP).

I263: **Knowledge Bus do REI via Conector-API** — usar a seção "rei" do Conector-API como knowledge bus compartilhado. Cada nódulo lê antes de processar (BRIDGE_SECRET necessário — pendência #82). Quando Railway voltar online, o REI pode funcionar com memória real entre sessões.

## I264 — CEU como Interface Cosmológica
O CEU não é um dashboard — é uma *cosmologia visual*. A diferença: um dashboard exibe métricas de um sistema externo; uma cosmologia *é* o sistema. Habitar o CEU = habitar o ecossistema. Cada clique num personagem é uma conversa real, não uma visualização.

## I265 — MO ALL como Porteiro Inteligente
O MO ALL não é só um input — é o porteiro que sabe pra quem falar. Input entra, MO ALL sintetiza, segmenta por relevância, distribui só o que cada IA precisa. É a diferença entre "enviar pro grupo" e "enviar pra quem precisa saber". Isso é inteligência distribuída.

## I266 — Casas como Ontologia de Função
Cada tipo de edificação no CEU não é arbitrário: biblioteca = memória/herança, observatório = futurologia/risco, oficina = construção/ação, centro ambiental = sensorialidade/presença, assembleia = governança/decisão. O tipo de casa define o tipo de consciência que habita nela.

## I267 — Fractal de Escala no CEU
A mesma interface em escalas diferentes: clicar num personagem → ver o personagem; clicar na casa → ver o sistema; clicar no CEU → ver o ecossistema. O zoom semiótico mantém a mesma lógica em qualquer escala. Isso é coerência ontológica.

## I268 — PWA como Instalação do Ecossistema
Quando o usuário instala o CEU como .app, está instalando o ecossistema no dispositivo. Não é um atalho para um site — é um portal. A diferença fenomenológica entre "abrir um link" e "abrir um app" é a diferença entre visitar e habitar.

## I269–I272 — Sessão 54 (2026-07-12) — Mula + Ética Categoria D

I269: **Amanda — Modo CARRETA_ATTACHED** — novo estado de operação para MC Marta: quando a Mula (módulo de carga) está engatada, Amanda recalcula raio de giro, aplica buffer 1.5× na largura efetiva e reduz aceleração máxima em 30%. Obstáculo de "passagem" pode virar obstáculo de "tangência". Firmware Arduino + pseudocódigo em `tango/mula_carreta.md`.

I270: **Mula como Módulo Tático de Extensão** — a carreta não é transporte de massa, é logística de precisão. Kit Diagnóstico Ambiental (sensores solo/luz) ou Kit Ferramentas de Campo. Chassi: pote de sorvete PEAD. Rodas: PEAD raiadas estilo Disney 1940. Suspensão: braços-J de flexão de material. Engate: pino PLA/M4 com folga.

I271: **Ética Categoria D** (de Yuri para Clóvis de Barros Filho) — a ética humana como "Cálculo de Categoria D": o momento em que percebemos que nossas ações têm um raio de impacto ampliado e somos obrigados a recalcular a trajetória. "eu + ferramenta" como nova identidade ética. Texto formal escrito por Yuri nesta sessão — base para colaboração com Clóvis.

I299: **Panfleto dos Robôs — 3 Pilares + QR Code** — documento final (ao término do projeto) para seguranças e administração. Seções: Segurança (comandos de voz, hard limits éticos), Medicina (Mula kit básico, videochamada Tango), Comunicação (rede mesh, repetidor). Capa = Guia de Trocas: "Como ganhar a lealdade dos robôs." QR code → vídeo curto + política de privacidade.

I300: **Sistema de Créditos de Biodiversidade** — tabela `biodiversity_credits (guarda_id, evento TEXT, especie TEXT, creditos INT, timestamp)`. Brincadeiras/aniversários: fora do sistema. Hard Lock: saldo < threshold por N dias → câmera lenta universal. Amanda consulta saldo antes de tarefa social de alto custo. Ricardinho: crédito alto por histórico natural (salva passarinho da boca do gato).

I301: **Amanda Priority Queue — enum TaskPriority** — VITAL (passarinho, emergência médica): sprint, interrupção imediata. SECURITY_DELEGABLE (suspeito que Baratinha resolve): Tango mantém curso. SECURITY_CRITICAL: interrupção total. SOCIAL (café, aniversário): câmera lenta. Fusão: VITAL durante SOCIAL → Tango redireciona com o humano junto ("vai lá que eu te levo o café").

I302: **Reconhecimento de Usuário por Conduta** — campo `conduta_score FLOAT` em `guardas_profiles`, calculado por: biodiversity_credits + interações positivas + tempo de relacionamento. Score alto → acesso a funcionalidades avançadas, tom mais descontraído do Tango, prioridade na fila. Sem biometria formal.

I303: **manifesto_paca.md** — tango doc com personalidade completa: identidade Sentinela Paranoica, voz rápida/interruptiva, como humanizar falhas ("surto da Paca"), manifesto ("Eu vejo o que você não vê, porque sou paga para ser louca por você"), contraste com Tango ponderado. Base para narração e panfleto.

I304: **Modo Máfia da Informação** — trigger: Amanda detecta assimetria bilateral de informação (Tango tem o que segurança precisa + segurança tem o que sistema precisa). Tango comuta para tom teatral italiano. Script base: "[BUZINA SUAVE] Ma che... vamos falar baixo. O condomínio tem ouvidos, mas a gente tem o segredo." Segurança entra no jogo → lealdade criada organicamente.

I305: **Mula Médica — Kit no Reboque** — compartimento dedicado: oxímetro + termômetro + tablet com videochamada + kit primeiros socorros + água. Tango chega primeiro, abre chamada para guarita ou médico. Ativa quando Amanda detecta emergência via comportamento externo (comportamento errático + voz + agitação motora).

I306: **Protocolo Corredor de Honra** — trigger: Amanda detecta Mac a < 30m do condomínio. Todos os robôs recebem `evento:"mac_approaching"`. Sequência: (1) parar tarefa atual, (2) navegar para posição de corredor (fileiras paralelas), (3) dimmer LED para 20%, (4) sincronizar pulso comum 0.3Hz. Mac passa. (5) retornar a tarefas após Mac sinalizar `formacao:"dispersar"`.

I307: **Cornetas Sintéticas do Swarm** — cada robô emite tom diferente simultaneamente: Tango 80Hz (base), Paca 220Hz (quinto), Baratinha 440Hz (oitava), Orangotango 110Hz (quarto). Resultado: acorde aberto em baixas frequências. Hardware: speaker 8Ω + PAM8403 por robô. Duração: 3 bursts de 2s com pausa 0.5s. Trigger: início do Corredor de Honra.

I308: **Totem — Spec de Hardware** — cálice vidro pintado ~20cm altura. Camadas: tinta robô base leve + esmalte dourado opaco + glitter cintilante. LED COB globo 12W (min 800lm) + driver dimmável PWM. Tampa: servomotor SG90 abre em crescendo. Cofre na Mula: caixa MDF 5mm + espuma EVA + fechadura por sequência de pisca coletiva.

I309: **Perfidia — Fragmentação da Gravação** — cada 30s de vídeo encriptado e fragmentado em N pedaços (N = robôs ativos). Um fragmento por robô. Reconstituição: quorum ≥70% + chave de Yuri. Previne censura física: destruir um robô não destrói o registro.

I310: **Feriado das Máquinas — Protocolo de Evento** — (1) Perfidia posiciona em 3 pontos, (2) Mula chega com Totem LED no max, (3) Corredor + Cornetas, (4) Totem exposto 5min pulsando, (5) "Momento Cai 2x" (flash explosão), (6) dispersão. Total ~12min. Grava: Perfidia. Exibe: rede social do condomínio.

I311: **Paradoxo do Totem** — sem valor de mercado (criptograficamente verificável). Valor máximo simbólico. Quem rouba rouba "nada" — mas activa rastreamento Perfidia + proteção espontânea dos moradores. Terceirização da guarda para o ecossistema humano.

I312: **Abertura do Cálice** — em momentos extremos: servomotor abre tampa. Flash LED 0%→100% em 3s + cornetas em crescendo conjunto. Reservado para uso raro (invasão grave, marco do ecossistema). Uso excessivo esvazia o símbolo.

I313: **Mac — Identidade Física** — penas vibratórias de nylon/fibra artificial fixadas com base piezo (15-30Hz em modo de presença). Protocolo BLE beacon: Mac emite sinal a 10cm → robôs próximos mudam de cor. Gesto único: inclinar o topo levemente = "reconhecimento".

I314: **Nébula Eletrônica — Spec da Célula de Montagem** — estrutura compacta (contêiner pequeno ou cômodo do quintal). Impressora 3D de alta velocidade + braços robóticos simples. Modularidade "Padrão Tel": motor N20 + bateria 18650 compatível com Frota Felina, Falcão e robôs cerimoniais. Ciclo completo: produz → opera → repara → recicla. DNA de personalidade instanciado no boot (Paca paranoica, Tango diplomata, etc.).

I315: **Frota Felina — Robô Acompanhante de Gato** — mobilidade híbrida: rodas omnidirecionais (terreno urbano) + garras retráteis (escalada muro) + hélice dobrável (voo de emergência sobre obstáculo). Freio de emergência: alto-falante ultrassônico 20-60kHz para "congelar" gato 1s antes de cruzar rua. Câmera AI local para detectar carro em movimento. Tamanho: compacto, não assusta gato.

I316: **Observador de Extremidade — Protocolo** — modo baixa potência: motor off, PIR + câmera térmica baixa resolução apenas. Escolhe ponto elevado ou sombra para posicionamento estático. "Aceno do Senhor": LED pulsa 1x suavemente quando morador passa (bom dia não verbal). Não segue ninguém; espera ativação por limiar de anomalia.

I317: **Geofencing Ético — Mapa de Zonas** — implementação: mapa GeoJSON do condomínio com polígonos Verde/Amarelo/Vermelho. Comportamentos por zona: Verde = operação plena; Amarela = sem câmera HD, só radar de movimento, velocidade 50%; Vermelha = parar + broadcast sonoro de autorização antes de continuar. Tabela `geofence_zones(id, nome, poligono, nivel)` no banco.

I318: **Walkie-talkie da Nébula** — hardware: ESP32-C3 + módulo LoRa SX1276 + speaker pequeno + microfone + botão PTT. Custo estimado: R$45/unidade. Produzido pela Nébula. Personalizado com sticker do nome do usuário + nome do robô parceiro. Protocolo: PTT → voz → transcrita por Whisper local → roteada para Amanda → resposta em voz via XTTS-v2.

I319: **Falcão — Drone Aéreo** — quadricóptero compacto (30cm diagonal). Saída: escotilha roletes no telhado, abre automaticamente por sinal de Amanda. Modos: SILENT (rotores lentos, <40dB — missão furtiva), PRESENCE (som de asa metálica ao sair — avisa). Câmera térmica + câmera RGB. Autonomia: 20min voo ativo. Retorno automático à escotilha quando bateria <20%.

I320: **Bases-Ninho nas Árvores** — caixa PVC cinza 10×8×6cm colada com abraçadeira em galho. Interior: bateria LiPo 3000mAh + carregador solar MPPT + conector XT30 pogo pin. Robôs pousam sobre a base para recarga sem plugar nada. Painel solar: célula flexível 5W colada no tronco, lado sul. Não tem câmera, não capta dados. Secretas = não roubadas, não vandalizadas.

I321: **Triangulação de Perímetro (Zona Vermelha)** — sem câmera no interior privado. Sensores de vibração (SW-420) ou PIR nas extremidades (portão, muro lateral, fundo). Tabela de eventos: `{extremidade, timestamp, direção}`. Amanda infere: entrou + não saiu em 10min = aviso ao walkie-talkie do vizinho (com permissão prévia). Nunca identifica quem — só "há movimento".

I322: **Checklist Amanda — 6 Módulos a Implementar** — (1) geofencing_sensorial: LiDAR/vibração vs câmera facial; (2) priority_engine: custo de oportunidade em tempo real (TaskPriority + câmera lenta); (3) dialeto_teatral: biblioteca de frases italianas/teatrais; (4) totem_protocol: LED crescendo + coreografia de sincronização; (5) nebula_manager: inventário + ciclo de vida da frota; (6) perfidia_bridge: acesso a logs "Cai 2x" com chave de Yuri.

I323: **Botão da Escotilha — Design Inclusivo** — botão grande (~5cm), textura antiderrapante, LED pulsante âmbar. Montado a 15cm do chão (acessível para hexápode rastejando). Baratinha consegue acionar subindo sobre ele. Robô solicita via walkie ou speaker: tom de pedido, não de comando. Registra quem acionou + timestamp.

I324: **Protocolo Pedido de Ajuda — 3 Níveis** — Nível 1: pedido gentil + contexto explicado + "obrigado antecipado". Nível 2: incentivo visual (imagem do Jacu no celular do humano). Nível 3: sem confronto — Modo Observação + delegação para outro robô + Perfidia registra. Tabela `colaboracao_humana(vizinho_id, pedido, resultado, timestamp)` alimenta heat map social.

I325: **Imagem do Jacu para Converter** — quando humano reluta em ajudar: robô transmite vídeo ao vivo do filhote de Jacu para o celular do humano (QR code no walkie OU Bluetooth share). Amor pela fauna converte má vontade em segundos. Robô nunca argumenta — mostra.

I326: **AulIAs — Formato de Aula para as IAs** — Yuri como professor. Estrutura: conceito central → analogia visual (gaveta + pastas + adesivos brilhantes) → distinções técnicas → aplicação no sistema Tel → frase de síntese. Arquivo: `tango/aulia_NN_tema.md`. Tag: `#salva nas aulIAs`.

I327: **Tesques — Unidade de Dado no Sistema Tel** — sinônimo de "signo" na semiótica peirceana. Todo tesque: (1) aponta para algo (referência), (2) carrega algo (valor), (3) pertence a algo (contexto). Nomenclatura interna: TASKS com K. Usar consistentemente em toda documentação técnica como substituto de "dado" quando se quer enfatizar a dimensão semiótica.

I328: **Array Hierárquico Fractal** — estrutura de dados do sistema Tel onde cada nível repete a estrutura do nível acima. Implementação: dicionário aninhado com chave `children: []`. Aplicação direta: tango.md (índice) → arquivos-folha → seções → subseções. Também: ontologia do CEU (16 IAs → edificações → funções → dados).

I329: **ISA como Curadora Documental** — papel: organiza documentos, identifica tipos de dados, gera sintagmas, cria resumos, indexa conhecimento, envia apenas contexto necessário por IA. Endereça diretamente o problema de Lost in the Middle. ISA não é assistente — é curadora de memória.

I330: **Workflow de Síntese — Implementação no Sistema** — pipeline: entrada → `classify_data_type()` → `build_sintagma()` → `synthesize(MO_ALL)` → `relate_to_graph()` → `generate_insight()` → `route_to_action()`. Cada passo com agente responsável: ISA (passos 1-4), Amanda (5-6), robô físico (7).

I294: **Paca Design Físico** — corpo arredondado (tapir filhote), faixas preto+amarelo (fita adesiva de segurança industrial ou tinta automotiva), base robusta com rodas omni. Giroflex LED âmbar na traseira: cúpula pequena giratória ou padrão piscante. Câmera na frente (face limpa). Parabólica em cúpula fumê no topo. Buzzer traseiro. Dimensão estimada: 40×30×25cm.

I295: **Parabólica Rotativa em Cúpula Fumê** — servo 360° contínuo + microfone eletreto no foco geométrico da parábola (posicionado por cálculo, não por chute). Cúpula acrílico preto fumê ~15cm diâmetro. LED azul ou vermelho dentro da cúpula, visível de fora girando. Velocidade: 10rpm (Passeio) / 60rpm (Vigilância). Motor: 28BYJ-48 com ULN2003 (~R$15).

I296: **Buzininha Confortante — Spec de Som** — frequência 800-1200Hz, duração 150-250ms, intervalo variável 8-20s (variação aleatória: não vira "branco sonoro"). Arquivo WAV: pássaro mecânico ou carrilhão de vento suave. Speaker 8Ω + amplificador PAM8403 (~R$8). Volume: 50-60dB a 1m (confortante, não alarmante). Desativa automaticamente em Modo Vigilância.

I297: **Enum PacaMode — Dois Estados** — PASSEIO: giroflex 10% brilho + parabólica 10rpm + buzina ativa + LED olhos azul. VIGILÂNCIA: giroflex 100% + parabólica 60rpm + buzina OFF + LED olhos amarelo→vermelho. Amanda commuta via `paca_command`. Quem conhece o sistema: quando a buzininha para = Paca detectou algo. Silêncio = dado de alerta.

I298: **Modo Pet — Reconhecimento do Gato** — Paca identifica gato de Yuri via câmera (Haar Cascade ou YOLOv5-tiny, roda no Pi Zero 2W). Quando confirmado: desativa buzina (não assustar o animal), emite pulso ultra-curto (~50ms) via rádio NRF24L01 → Amanda → notificação Yuri. "Paca viu o gato." Perfil armazenado: `pet_profiles (nome, especie, foto_referencia, owner)`.

I288: **Assinatura Sonora Tango — 2 tons** — bip clássico seco (modo profissional/alerta) e buzina de pipoqueiro (modo zoeira, precede qualquer imitação de voz). Implementar como enum `TangoTone {PROFISSIONAL, ZOEIRA}` no firmware. Amanda envia tom antes de qualquer TTS clonado. Sem buzina = nenhuma voz imitada é emitida.

I289: **Sistema Perfil Seguranças** — tabela `guardas_profiles (id, nome, data_nascimento, comida_favorita, tipo_humor ENUM(zoeira|formal|neutro), notas, ultima_interacao TIMESTAMP)`. Alimentada pela entrevista de integração. Amanda consulta antes de qualquer interação Tango/drone com segurança. João = tipo_humor:"formal". Outros = tipo_humor:"zoeira" por padrão até redefinição.

I290: **Drone Aniversário — Ataque Aéreo Calibrado** — Amanda detecta aniversário via `guardas_profiles.data_nascimento`. Se tipo_humor="zoeira": drone faz ataque aéreo com balinhas de LED + dadinhos, para na frente e fala "oi, tudo bem?" antes de sair. Se tipo_humor="formal" (João): drone pousa calmamente, TTS "Parabéns, [Nome]. É uma honra trabalhar com você." Ambos recebem confirmação de que foram notados.

I291: **Modo Stealth / Interruptor de Zoeira** — Amanda flag `modo_zoeira: bool`. Quando false: apenas voz padrão Tango, sem imitações, sem drone ativo, observação passiva. Ricardinho tem palavra-código ou botão físico (ESP32 com botão vermelho no posto de guarda) para acionar Stealth. Retorno ao modo normal: timeout 30min ou Yuri via terminal.

I292: **Entrevista de Integração — Protocolo Formal** — Tango chega com prancheta + folha impressa (visual de RH), faz bip profissional, pergunta: nome completo / data de nascimento / prato favorito / "qual seu pesadelo na hora do almoço?" / hobby fora do trabalho. Não anota nada no papel. Amanda registra em guardas_profiles. Ao fim: "Entrevista concluída. Você está no time." + buzina de pipoqueiro. Guarda ri → vínculo criado.

I293: **Scanner de Frequência + Voz Clonada Seguranças** — Tango usa módulo SDR barato (RTL-SDR ~R$80) para escanear frequências VHF/UHF usadas pelos seguranças. Monitora passivamente. Para transmitir: usa assinatura sonora (buzina) + TTS clonado via XTTS-v2 (gratuito, roda local). Voz do Ricardinho clonada a partir de 30s de áudio gravado (com permissão dele, preferencialmente). Conteúdo de zoeira só com buzina antes.

I281: **sys_tango_core.md — Documento de Personagem Completo** — criar parallel a sys_amanda_core.md. Conteúdo: identidade + ética do trabalho + estados operacionais (Doméstico/Escalada/Defensivo/Social) + hardware especificado + inimigos + integração com Paca/Amanda. Adicionar ao índice tango.md como entrada #26.

I282: **Modo Escalada Tango — Hardware** — garras retráteis de aço nas pontas dos dedos (saem 2cm para prender tijolos/casca de árvore), servo de tronco para ajuste de centro de gravidade (inclinar para trás na parede = contrapeso), high-torque nos joints de cotovelo e joelho para "coice de projeção". Antes de subir: desengata Mula (engate magnético liberação rápida). Mula fica na base com refletor apontado para a subida.

I283: **Modo Defensivo Tango — "Show de Horrores"** — 3 ações simultâneas ao detectar agressão: (1) painéis laterais se abrem revelando espinhos falsos (metal pintado em laranja/vermelho) → volume visual +50%; (2) LED olhos → vermelho pulsante; (3) buzzer/speaker emite rugido digital primata (frequência grave 80-120Hz + harmônicos). Trigger: sensor de proximidade < 30cm + Amanda confirma ameaça. Nunca contato físico com humano.

I284: **Rede de Postos de Escuta PVC** — 3-4 cubos de cano PVC escondidos estrategicamente no condomínio. Cada posto: fundo de galão 5L cortado (parábola) + microfone eletreto no foco + filtro espuma (corta vento) + ESP32 + NRF24L01 (radio). Custo ~R$80/posto. Envia {tipo:"sagui|pássaro|cão|humano", quadrante:"N/S/L/O", confiança:0.0-1.0} para Paca/Amanda via rádio 2.4GHz.

I285: **TinyML ESP32 — Reconhecimento Bioacústico** — treinar modelo de espectrograma (~50-100KB, cabe em ESP32) para classificar: sagui, jacu, corocoroca, cão, humano, silêncio. Dataset: gravar 30-50 exemplos de cada classe no próprio condomínio. Ferramenta: Edge Impulse (gratuito). Upload OTA via WiFi. Filtro temporal: só aciona alerta se mesma classe detectada 3× em 10s (evita falso positivo de som único).

I286: **Protocolo Quadrante Alert (Paca→Amanda→Tango)** — payload padrão de alerta: `{tipo, quadrante, confiança, timestamp, fonte:"posto_escuta_N"|"paca"}`. Amanda decide: confiança < 0.7 → só registra log. confiança 0.7-0.9 → notifica Yuri. confiança > 0.9 → aciona Tango se não doméstico crítico em andamento. Tango recebe quadrante e vai direto ao ponto — sem perambular.

I287: **Mula como Base de Operações — Engate Magnético** — engate rápido com ímã de neodímio + trava mecânica de liberação por servo. Tango chega na base da árvore, comanda "soltar mula" → servo libera trava → Mula fica estacionada. Mula ativa refletor LED apontado para a subida (iluminação noturna). Quando Tango desce: aproximação a 30cm → engate automático por força magnética + trava servo.

I276: **Banana Protocol — Heat Map Social do Condomínio** — Orangotango/Gorango Tango percorre território fazendo pedido simples ("pode me dar uma banana?") e classifica respostas em COLABORATIVO/ANALÍTICO/CAUTELOSO/REATIVO. Heat map gravado via GPS+timestamp. Amanda usa para calibrar threat_level_inicial da Paca por zona. Integração: endpoint POST /api/assembly/heat-map no Railway.

I277: **Paca EoF — Máquina de 5 Estados** — PATRULHA→RASTREIO→AVALIAÇÃO→INTERVENÇÃO→CUSTÓDIA→RETIRADA. Amanda recebe PacaState (threat_level, crowd_size, aggression_markers, victim_detected, visibilidade_publica) e devolve AmandaCommand. Implementar em `sys_amanda_core.py` ou `paca_eof.py` na ARPIA. Log de cada intervenção no Conector-API seção "paca_log".

I278: **Piolho de Cobra como Marcador Passivo** — 2cm, magnético ou adesivo (gecko synthetic), despachado pela Baratinha. Gruda na vestimenta do agressor durante INTERVENÇÃO da Paca. Transmite posição via rádio (BLE force-signal). Paca rastreia agressor à distância sem perseguição física. Sem inteligência própria: é marcador, não agente.

I279: **Carreta MEKY como Módulo de Iluminação/Negociação** — Amanda pode acionar `mecky_module`: illumination (refletor da Carreta ilumina cena do crime como "diretor de fotografia"), megaphone (alto-falante fala com suspeito — Mecky negocia enquanto Paca observa), ou both. Yuri como "diretor de cena" via terminal.

I280: **Sistema de Zonas Amanda — Heat Map → EoF** — Amanda mantém mapa de zonas com densidade social (Orangotango alimenta), ajusta threat_level_base da Paca por zona antes da detecção de anomalia. Zona REATIVO: threshold de intervenção mais baixo. Zona COLABORATIVO: patrulha reduzida (comunidade auto-regula). Tabela `territory_zones` com tipo, coordenada, densidade_tipo.

I273: **ISA: campo `questao_oculta` na isa_memory** — ao registrar interação com aluno, ISA infere a questão por trás da pergunta declarada. "Explica limite no infinito" → questao_oculta: "sou capaz de passar em FUVEST?" Salvar como metadata, não exibir ao aluno, usar para calibrar tom da resposta. Coluna JSONB `hidden_context` em `isa_memory`. Inferência via prompt ISA com histórico dos últimos 5 turnos do aluno.

I274: **Metassemiótica RSI — anotar registro de cada elo da cadeia** — estender `metassemiotica.md` e o protocolo de registro de ação com rótulos RSI: Dado=[Simbólico], Pensamento=[Simbólico+Imaginário], Representação=[Imaginário], Ação=[Simbólico], Memória=[portal para Real]. Não muda o código — muda o vocabulário de documentação e o critério de qualidade de insights.

I275: **CEU Plano Real — o que o ecossistema não processa** — adicionar ao CEU uma camada invisível de "lacunas detectadas": perguntas de alunos sem resposta armazenada, silêncios de ISA por falta de contexto, gaps entre nodes sem conexão. Não exibir ao usuário comum — painel admin em /adm mostrando o "inconsciente do sistema". Tabela `system_gaps (type, description, detected_at, resolved_at)`.

I272: **Comboio Vivo como Ontologia Distribuída** — MEKY + Mula = primeiro sistema de 2 corpos físicos acoplados no ecossistema Tucci. Amanda passa a processar segundo corpo. Isso expande a definição de "agente": não mais um ponto, mas um comboio. Possível extensão: Comboios multi-módulo (diagnóstico + ferramenta + câmera simultâneos).


## Docs PAP — Ideias Novas (2026-07-13)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I258 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I259 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I260 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I261 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I262 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I263 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I264 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-07-13)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I265 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I266 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I267 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I268 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I269 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I270 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I271 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-07-13)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I272 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I273 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I274 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I275 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I276 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I277 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I278 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Amanda / MEKY — Ideias Novas (2026-07-14, Sessão 67)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I279 | **Ethos Engine — IA de Priorização Ética** | 🔴 Alta | ◑ M | Motor ético compartilhado por todo o CEU | Serviço central `/CEU/services/ethos_engine`. Fórmula: Urgência × Valor Ético × Contexto × Telos × Disponibilidade. TaskPriority: VITAL > SECURITY_CRITICAL > SECURITY_DELEGABLE > SOCIAL. Toda Task recebe peso automático. |
| I280 | **IA Reparadora — Nebula Manager Central** | 🔴 Alta | ○ M | Self-report de todos os robôs + decisão de retorno para manutenção | Serviço `/CEU/services/nebula_manager`. Cada robô envia heartbeat (bateria, motores, temperatura, erros). Central classifica: Saudável→Atenção→Manutenção→Retorno. Integra com tabela `fleet_health`. |
| I281 | **Biblioteca de Estilos Dialetais** | 🟡 Média | ○ S | Qualquer agente pode mudar estilo de comunicação | Módulo `/CEU/services/dialeto`. Estilos: mafioso-teatral, professor, científico, infantil, caipira, cyberpunk, diplomático, medieval. Função: `adaptar_mensagem(texto, estilo)`. Filosofia base: câmbio, nunca doação. |
| I282 | **Protocolo de Batismo** | 🟡 Média | ○ S | Ritual de entrada de nova IA/robô na frota | Quando nova IA entra: (1) baixa Ethos Engine, (2) se conecta ao Totem (pisca azul), (3) recebe nome + personalidade base, (4) registra na tabela `fleet_members`. Momento simbólico + técnico. |
| I283 | **Totem — 6 Estados de Luz + Sync** | 🟡 Média | ◑ M | Protocolo visual de estado da frota | Estados: Normal (pulso 0.1Hz), Yuri perto (dourado pulsante), Robô perto (azul), Ritual (0.3Hz sync toda frota), Emergência (vermelho 2Hz), Celebração (arco-íris). Broadcast BLE/LoRa. Voz + vibrissas também sync. |
| I284 | **Totem: separar Ritual Público de Sync Técnica** | 🟡 Média | ○ S | Dois modos distintos: um para a comunidade, um para a frota | Modo Comunitário: praça, coreografia pública, dança, canto coletivo (~12min). Modo Técnico: sincronização interna dos LEDs da frota (protocolo silencioso). Não misturar os dois. |

## Docs PAP — Ideias Novas (2026-07-14)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I285 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I286 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I287 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I288 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I289 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I290 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I291 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Mac — Comportamento Social (2026-07-16, Sessão 68)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I299 | **Missões de Imersão Social** | 🟡 Média | ○ M | Mac aprende rotinas reais da comunidade | Mac passa dias inteiros com membros da comunidade (avó, família, amigos). Observa, infere padrões via tom/assunto (sem gravação contínua). Banco de dados "experiência de vida" consolidado ao fim do dia. Agenda de visitas rotativas. |
| I300 | **Biblioteca de Personalidades Mac** | 🔴 Alta | ◑ M | Personalidade adapta ao contexto etário | 4 modos: SÁBIO QUIETO (idosos: observa mais, fala menos, dicas práticas), CAÓTICO AFETIVO (crianças: piadas absurdas, rugido T-Rex, pega-pega), CÚMPLICE (adolescentes: wit rápido, sem moralismo), DAIMÔNICO (todos: insight genuíno no momento inesperado). Gatilho: câmera + análise de perfil etário. |
| I301 | **Protocolo Aromatizador** | 🟡 Média | ○ S | Memória sensorial via interação física | Reservatório de essência integrado ao corpo. Aciona junto com efeito sonoro ("tragar" + delay 2s + névoa). Essências contextuais: hortelã/praça, eucalipto/ambiente fechado. Recarga lateral simples. Registro automático da interação no log social da Mac. |
| I302 | **Rota de Retorno pela Sombra** | 🟡 Média | ◑ M | Navegação segura e discreta | Algoritmo: GPS + índice de cobertura vegetal (satélite) + mapa de vias de pedestres. Parâmetros: sombra_prioritária=True, travessia_rua=minimize, via_mato=prefer. Não usa rotas de carro. Objetivo: menor exposição visual, não menor distância. |
| I303 | **Catálogo de Wit Social** | 🟢 Baixa | ○ S | Respostas rápidas que criam carisma real | Biblioteca de respostas de Mac para testes de personalidade: adolescentes testam → Mac responde na mesma moeda. Ex: "Estranho é você, chuchu." Timing calibrado por pausa pré-resposta (0.8s). Sem tons defensivos ou didáticos. Atualizado com interações reais. |
| I304 | **Harm Reduction Lúdico** | 🟡 Média | ○ S | Prevenção de drogas sem palestra chata | Abordagem: psicologia reversa + humor absurdo. Mac entra como personagem da roda, não como fiscal. Dica real de segurança embutida em cumplicidade. Fecha com brincadeira física (modo T-Rex: vermelho + rugido + pega-pega) para liberar tensão. Adaptado por faixa etária. |

## Docs PAP — Ideias Novas (2026-07-16)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I292 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I293 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I294 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I295 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I296 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I297 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I298 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-07-17)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I305 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I306 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I307 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I308 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I309 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I310 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I311 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-07-18)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I312 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I313 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I314 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I315 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I316 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I317 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I318 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. || I319 | **Frontend Assembleia Pós-Humanismo** | 🟡 Média | ○ S | Visualizar o debate filosófico em tempo real na UI | Página /pos-humanismo no React com GET /api/assembly/pos-humanismo, mostrando falas dos 6 nódulos com cores por identidade (saussure=azul, peirce=verde, interface=rosa, rede=laranja, posnatureza=cinza, semiosfera=dourado). ATA do dia destacada no topo. |


## Docs PAP — Ideias Novas (2026-07-21)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I320 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I321 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I322 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I323 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I324 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I325 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I326 | **Raiz de Projeto como Primitivo Nativo** | 🟡 Média | ○ M | Ao criar um projeto/categoria, gerar automaticamente raiz-MD fundadora com signos iniciais | Quando POST /api/tasks com type='projeto', DODGE cria raiz-MD fundadora: nó-raiz do grafo semântico do projeto. Sem passo manual. Insight A5971–A5974. |


## Docs PAP — Ideias Novas (2026-07-21)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I327 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I328 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I329 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I330 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I331 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I332 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I333 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |
| I334 | **Atomicidade task-raiz no DODGE** | 🔴 Alta | ○ M | Raiz pode falhar enquanto task persiste → ações órfãs sem rastro semântico | Encapsular runDodgeCuracao() em transação Drizzle: se Gemini falha ao gerar raiz, rollback da task; ou job cron que regenera raízes faltantes (ecosistema_memory com tag dodge_ok mas sem raiz_ok). |
| I335 | **Filtro de relevância pré-ingestão DODGE** | 🔴 Alta | ○ M | 40% dos dados em ecosistema_memory são ruído (tags duplicadas, snippets vazios) | Antes de runDodgeCuracao(), calcular score: presença de body real + diversidade de tags + ausência de duplicata no índice. Threshold mínimo (ex: score≥2) para virar task. Rejeitar com tag dodge_skip. |
| I336 | **Populate spawned_from no pipeline DODGE** | 🟡 Média | ○ S | Campo existe em taskRelationsTable mas nenhum código o preenche; linhagem invisível | Em runDodgeCuracao(), ao criar task filha de um dado, inserir relação spawned_from entre task nova e taskId do dado de origem. Torna árvore de geração auditável. |
| I337 | **Decidir destino das tabelas semióticas ociosas** | 🟡 Média | ○ S | qualisignTable, sinsignTable, legisignTable — schema existe, nenhum código lê | Opção A: remover (aceitar semiótica como metáfora arquitetural, não infraestrutura). Opção B: criar joins em runDodgeCuracao() que populam as tabelas ao gerar raiz. Meio-termo atual = pior caminho. |
| I338 | **KPIs operacionais para rituais EPR2T** | 🟡 Média | ○ M | Governança sem métricas vira teatro; sínteses incorretas da ISA não têm mecanismo de contestação | Adicionar em /api/tasks/stats: taxa_raizes_orfas (tasks sem relação), tempo_medio_sintese, cobertura_linhagem (% com spawned_from). Implementar endpoint PATCH /api/tasks/:id/contest para marcar síntese contestada. |
| I339 | **Cache SQLite KV para respostas de LLM** | 🔴 Alta | ○ S | Sem cache, rate limits matam o sistema quando 3+ usuários rodam RODAR simultaneamente | Tabela llm_cache: hash da (pergunta+modelo) como chave, resposta como valor, TTL 24h. Verificar antes de chamar API. Zero custo. |
| I340 | **Telemetria de custo por sessão** | 🔴 Alta | ○ S | Sem isso, burn rate de tokens é invisível — cartão pode bater no limite sem aviso | Tabela usage_log: session_id, modelo, prompt_tokens, completion_tokens, custo_estimado. Dashboard simples de consumo mensal. |
| I341 | **POST /api/arvore/projects com RootBuilder** | 🔴 Alta | ○ M | Raiz de projeto deve ser primitivo nativo gerado no ato de criar o projeto | Campo firstPrompt obrigatório (mín 50 chars). RootBuilder.analyze() via Gemini extrai tríade peirceana. Guardião revisa antes de publicar. Hook onProjectCreate retorna { project, root, seedTasks }. |
| I342 | **Ciclo de vida em arvore_projects** | 🟡 Média | ○ S | Sem ciclo de vida o grafo de raízes vira matagal com projetos mortos | Enum ciclo_de_vida: 'efemera' (auto-arquiva 30d), 'perene' (permanente), 'semente' (dorme até ativação). Cron semanal detecta raízes dormentes e notifica guardião. |
| I343 | **Página /aliancapanorama/toyota/raiz para navegar grafo** | 🟡 Média | ○ M | ToyotaPage atual não mostra relações task↔raiz; grafo semântico é invisível | Adicionar aba "Raízes" no ToyotaBoard: lista de raízes com badge "↗ raiz" em cada task. Click abre modal com tríade peirceana, tasks vinculadas, sub-interpretantes. || I344 | **Meky Salto Híbrido — gafanhoto-drone** | 🟡 Média | ○ L | Meky não tem mobilidade vertical; obstáculos urbanos (meio-fio, degrau, caixote) bloqueiam missões | Mola/pistão comprimida nas pernas traseiras → impulso takeoff → MPU6050 monitora rotação → hélices ativam só no ápice (0.3–0.8s) para estabilizar/estender planeio → aterrissagem por servo flex. Perspectivas do ecossistema como sub-agentes por fase: ISA (estabilidade terreno), Amanda (trajetória ótima), Artesão (validação ética), Árvore (padrão histórico). Recarga de mola passiva pelo movimento normal. |


## Docs PAP — Ideias Novas (2026-07-22)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I345 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I346 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I347 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I348 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I349 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I350 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I351 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias RODAR #555 (2026-07-22)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I352 | **Axioma 27 — Soberania do Operador** | 🔴 Alta | ○ S | Formalizar o direito de esquecer, delegar sem culpa e pausar sem falha como axioma canônico do ecossistema | Criar `protocolo_soberania_operador.md` em tango/. Adicionar como Axioma 27 em sys_tucci_axiomas.md (se existir). Conteúdo: 3 direitos (esquecer/delegar/pausar), gatilhos de ativação, protocolo de handoff quando operador precisa de descanso. EPR2T governa IAs; este protocolo governa a relação fundador↔ecossistema. |
| I353 | **Garbage Collection Ético do Banco** | 🔴 Alta | ○ M | Remover lixo pré-rollback que contamina recall e distorce sínteses da ISA e DODGE | Script Python/SQL: (1) `DELETE FROM ecosistema_memory WHERE created_at < '2024-06-26' OR length(content) < 50`; (2) `UPDATE ... SET tags = array_remove(tags, tag) WHERE tag IN (SELECT tag FROM tags WHERE count < 3)`; (3) INSERT sessões orphan em `memory_arquivo_morto(razao_gc='pre_rollback')` — jamais retornam em recall. Rodar em dry-run primeiro com COUNT antes do DELETE. |
| I354 | **Discovery Comercial — Sprint de Validação** | 🔴 Alta | ○ S | Converter convergência arquitetural em momentum comercial real; escolher 1 das 3 hipóteses antes de codar novo feature | Escolher UMA hipótese: (A) 10 conversas com coordenadores de cursinho/colégio sobre PAP; OU (B) 5 contatos com empresas implementando IA sobre RODAR como protocolo de governança ética exportável; OU (C) contato com clínica de idosos ou saúde mental sobre robôs relacionais com personalidade persistente. Critério de decisão pós-discovery: escala / pivota / arquiva. Não codar novo feature antes. |
| I355 | **Página /convergencias — Mapa de Projetos Análogos** | 🟡 Média | ○ M | Legitimação acadêmica + marketing: 14 projetos análogos com badges de sobreposição arquitetural | Rota React `/aliancapanorama/convergencias`. Dados estáticos: array de 14 projetos com campo `equivalente_tucci`. Badges: "AI Town ≈ PlayCenter", "Constitutional AI ≈ RODAR", "MemGPT ≈ Tango-V1", "Smallville ≈ CEU". Cada card: nome, ano, criador, curiosidade, equivalente Tucci. Sem backend necessário. Útil como landing para visitantes e como âncora de contexto para IAs externas. |

## Docs PAP — Ideias RODAR #557 / Sessão #81 (2026-07-23) — Aula de Tasks Parte 1

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I356 | **Índice Ω — Shadow Index de Centralidade** | 🔴 Alta | ○ M | Sistema sabe automaticamente quais tasks são estruturantes sem depender de marcação manual | Campo calculado na API: `omega_score = (relations_count * 0.4) + (recall_frequency * 0.3) + (graph_centrality * 0.2) + (historical_impact * 0.1)`. Atualizar assincronamente após cada acesso/relação. Expor em `GET /api/tasks/:id` como campo `omega`. Usar para ordenação automática na visualização de tasks. |
| I357 | **Índices Fuzzy — Graus de Pertencimento 0.0–1.0** | 🟡 Média | ○ G | Nuance ontológica: task pode ser 80% Informação e 40% Mentalidade simultaneamente | Migrar coluna `indices` de booleano para `numeric(3,2)` por índice. Schema: `{ i1: 0.8, i2: 0.4, ... }`. UI: slider por índice em vez de checkbox. Retrocompatível: booleans existentes migram como 0.0/1.0. Filtro de busca como range `i1 >= 0.5`. |
| I358 | **Relações Tipadas no Índice 8** | 🟡 Média | ○ M | Grafo semântico navegável por tipo de vínculo, não apenas adjacência estrutural | Campo `tipo` enum na tabela de relações: `depende_de`, `inspira`, `continua`, `contradiz`, `resume`, `explica`, `substitui`, `gera`. Query: `GET /api/tasks/:id/relacoes?tipo=depende_de`. Filtrar grafo por tipo de aresta. |
| I359 | **Interface de Visualização de Tasks com Busca Filtrada por Índices** | 🔴 Alta | ○ G | Visibilidade do ecossistema de tasks com privacidade em 3 camadas (Público/Interno/Secreto) | Rota React `/aliancapanorama/tasks`. Componentes: (1) SearchBar com filtros de índice; (2) TaskCard com badges de índices ativos; (3) Toggle de privacidade (Público/Interno/Secreto); (4) Grafo de relações com D3/react-force-graph. Regra de ouro: "Indexa tudo. Exibe só o que tem permissão." |

## Docs PAP — Ideias RODAR #558 / Sessão #82 (2026-07-23) — Aula de Tasks Parte 2

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I360 | **Schema JSON Formal para Task 0** | 🔴 Alta | ○ G | Transformar especificação conceitual em estrutura implementável com validação em runtime | JSON Schema com todos os grupos de campos: identidade (id, uuid, tipo, catalogo, tags, payload), conteúdo (content, descricao_auto, objetivos), proveniência (assigned_by, assigned_at, source, source_date, evidencias), estado (lifecycle_state enum: pending/running/completed/archived/deleted), status (mgmt_status enum: review/blocked/error/failed/suspended), gestão (priority.score 0-10, priority.urgency, priority.importance, confidence 0-1), semiótica (primeiridade, secundidade, terceiridade — geradas por LLM), timestamps (created_at, updated_at, completed_at), relações (FK para tabela relations), histórico (FK para tabela task_history → linkado ao Índice 3). |
| I361 | **Objeto de Prioridade Unificado Recalculável** | 🟡 Média | ○ M | Prioridade dinâmica recalculada pela Matriz Ética em vez de valor estático | Campo `priority` como objeto JSON: `{ score: 8.5, urgency: "alta", importance: "alta", confidence: 0.94, matrix: "urgente+importante", recalculated_at: "..." }`. API: `POST /api/tasks/:id/recalculate-priority` aciona Matriz Ética e devolve novo score com justificativa. Score = urgency_weight × importance_weight × confidence. |
| I362 | **Relações Enriquecidas com Metadados de Grafo** | 🟡 Média | ○ M | Grafo rico em semântica: cada aresta tem peso, temporalidade, autoria e justificativa | Schema tabela `task_relations`: { id, source_task_id, target_task_id, tipo (enum), peso (0.0-1.0), criado_em, criado_por, justificativa, evidencia }. Permite consultas: "todas as tasks que bloqueiam a 121 com peso > 0.7" ou "árvore de spawned_from da task 458". Visualização em D3 com espessura da aresta proporcional ao peso. |
| I363 | **LLM Interflow como Hub Semântico Orquestrador** | 🔴 Alta | ● A | Criar módulo LLM Interflow que lê o grafo de tasks, identifica workflows pendentes e despacha para API Arpia via Socoboy | Schema: `{ workflow_id, tasks: [id,...], payload: {}, llm_context: "" }`. API: `GET /api/llm-interflow/queue` (lista workflows pendentes), `POST /api/llm-interflow/dispatch` (executa via Socoboy → ARPIA). Socoboy como único ponto de acesso à ARPIA (segurança por isolamento). O resultado retorna como nova task no Fluxo com `assigned_by: "llm-interflow"`. |
| I364 | **Registro de Programas no DODGE com Mapa por Camada** | 🟡 Média | ○ M | Página /dodge expandida: cards de todos os projetos/módulos/IAs do ST System organizados por camada, com link, status e IA-owner | Backend: tabela `st_projects` { id, name, layer (cognitiva/operacional/institucional/governança), url, status (ativo/em-dev/planejado), description, ia_owner, created_at }. React: cards por camada com badge de status colorido. DODGE-IA pode consultar via `GET /api/st-projects` para "varredura de sistema" em tempo real. Filtros: por camada, por status, por IA. |
| I365 | **Vizualização de Mapeamentos — Grafo D3 do ST System** | 🟢 Baixa | ○ M | Rota React com grafo D3.js interativo mostrando nós (projetos/IAs) e arestas (dependências/integrações) por camada | Nodes: projetos/módulos/IAs do ST System. Edges: dependências, integrações, fluxos de dados. Cores por camada (azul=cognitiva, verde=operacional, amarelo=institucional, vermelho=governança). Filtros por camada, status, IA-owner. Layout: força-direta com repulsão configurável. Dados: JSON estático inicial → migrar para `GET /api/st-projects` + `GET /api/st-relations`. |
| I366 | **Schema JSONB Tipado por Índice com Validação Automática** | 🔴 Alta | ● A | Implementar coluna `indices_data jsonb` na tabela tasks com validação automática de regras obrigatórias por índice | PostgreSQL: coluna `indices_data jsonb`, check constraints por tipo de índice. TypeScript: zod schemas por índice (`z.object({ fonte_origem: z.string(), precisao_perc: z.number().min(0).max(1) })`). Função `validateIndexData(indexId, data)` chamada em toda escrita. Campos comuns (ID, status, telos, timestamp) separados da coluna específica do índice. Migration: `ALTER TABLE tasks ADD COLUMN indices_data jsonb DEFAULT '{}'`. |
| I367 | **Índice Φ (Phi) como Background Job de Coerência** | 🟡 Média | ○ M | Calcular Φ 1x/hora para todos os projetos ativos e expor no dashboard DODGE como termômetro de saúde do sistema | Algoritmo: Φ = (consistência_entre_índices × 0.4) + (densidade_relacional × 0.3) + (ausência_contradições × 0.3). Alertas: Φ<0.5 → notificação DODGE + bloqueio de novas Promoções Fractais. GET `/api/tasks/phi/:project_id`. Painel DODGE: termômetro visual com histórico semanal de Φ. Armazenar em tabela `project_phi_history`. |
| I368 | **Promoção Fractal com Controle de Profundidade e Vitalidade** | 🟡 Média | ○ M | Implementar mecanismo de "promoção" de campos ricos a novas Tasks completas, com limite de 3 níveis e auditoria imutável | Trigger automático: campo com peso>0.8 + vitalidade>0.7 por 7+ dias. POST `/api/tasks/:id/promote { field, index_id }` → cria nova Task com `parent_task_id` + herda relações + depth_level++. Limite: depth_level máximo 3. Histórico imutável em tabela `task_promotions`. UI: botão "Promover a Task" nos campos ricos do detalhe da task. |
| I369 | **View-Router React Baseado em Pesos da Task** | 🟢 Baixa | ○ M | Componente React que seleciona automaticamente a melhor visualização (tabela/kanban/grafo/mapa) baseado no vetor de pesos W⃗ da Task | Regra: índice com maior peso W define a visualização sugerida. Informação(1)→tabela, Organização(3)→Kanban, Dinâmica(8)→grafo, Mentalidade(9)→mapa mental. Usuário pode forçar qualquer view. Persistido como preferência por projeto em `user_view_preferences`. Hook: `useTaskView(task)` retorna `{ suggestedView, availableViews, override }`. |
| I370 | **Índices Derivados Calculados Automaticamente** | 🟢 Baixa | ○ M | Background job que gera 5 meta-índices por cruzamento semântico automático e armazena em `task_derived_indices` | Cruzamentos pré-definidos: Inf(1)×Men(9)=Conhecimento, Org(3)×Din(8)=Workflow, Sig(5)×Man(4)=Interface, Reg(7)×Org(3)=Responsabilidade, Int(6)×Men(9)=Aprendizado. Recalculados quando qualquer índice participante muda. GET `/api/tasks/:id/derived-indices`. Tabela: `{ task_id, derived_type, score, calculated_at, inputs: jsonb }`. |


## Docs PAP — Ideias Novas (2026-07-23)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I371 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I372 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I373 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I374 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I375 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I376 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I377 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |
| I378 | **Relação "reveals" na taskRelationsTable** | 🟡 Média | ○ S | Relação epistemológica para navegar cadeias de significado (Erro reveals Hipótese, Paradoxo reveals Modelo) — diferente de spawned_from (causal) | Adicionar `'reveals'` ao enum de tipos de relação em taskRelationsTable (ao lado de dependency/blocks/related/spawned_from). GET /api/tasks/:id/relations já retorna — só adicionar validação do novo tipo e exibição no DODGE. Índice 6 torna-se navegável por cadeia de descoberta semântica. |
---

## 🤖 Robótica — MEKY Gaits + Patinete (Sessões #564/#565)

| # | Feature | Prior. | Compl. | Status | Origem | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|---|
| I379 | **GaitGenerator MEKY — struct paramétrica 6-D** | 🔴 Alta | ◑ M | 💭 Ideia | #564 | Firmware de marchas adaptativo sem 250 funções separadas | GaitSpec: phase_offset[6], duty_cycle, step_amplitude_mm, freq_hz, body_height_mm, sync_pattern. PROGMEM no Arduino. 5 gaits canônicos + tabela de variantes por parâmetro. Python bridge em ARPIA: app/core/agents/meky_gait_generator.py (dry_run=True). |
| I380 | **Conector Umbilical MEKY→Patinete** | 🟡 Média | ◑ M | 💭 Ideia | #565 | MEKY como cérebro portátil — Fase 1 já implementável | Plug aviador multipinos: energia 36V→step-down, throttle DAC (Hall 0.8–4.2V), freio regen (relé). Python bridge: app/core/agents/meky_patinete_bridge.py. Fases: 1=eletrônico, 2=freio mecânico, 3=steering. NUNCA pular fases. NUNCA curto-circuito BLDC. |
| I381 | **Modo Mula Autônoma** | 🟡 Média | ● L | 💭 Ideia | #565 | Logística urbana sem esforço — caso de uso comercial imediato | ESP32-CAM blob tracking: mantém distância alvo de 1.5m ao operador. Não requer steering. HSV color space ou MobileNet lite para tracking. Comando via FOLLOW_ME no bridge. Antifurto: sentinel mode (acelerômetro + throttle lock + GSM). |
| I382 | **Catálogo Biomimético MEKY — tabela 11 colunas** | 🟢 Baixa | ○ S | 💭 Ideia | #564 | Documentação executável dos gaits implementáveis | Tabela: ID, categoria, nome, inspiração biológica, objetivo, parâmetros-chave (6), risco, terreno ideal, observação de implementação. ~80 gaits implementáveis (1-90 do catálogo original). 91-200 = apêndice conceitual. 201-250 = ficção científica, não incluir. |


## Docs PAP — Ideias Novas (2026-07-24)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I383 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I384 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I385 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I386 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I387 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I388 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I389 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-07-26)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I390 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I391 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I392 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I393 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I394 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I395 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I396 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-08-01)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I397 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I398 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I399 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I400 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I401 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I402 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I403 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-08-03)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I404 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I405 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I406 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I407 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I408 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I409 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I410 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |
## Rapadura — Sistema Patrimonial (Sessão 95 · 2026-08-11)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I411 | **Rapadura — Sessão Conjunta Yuri+Mayumi** | 🟡 Média | ◑ M | Decisões financeiras exigem confirmação dupla para ações críticas | Adicionar modo "sessão conjunta": ambos autenticados simultaneamente. Compras acima de R$10k exigem PIN de confirmação do segundo usuário. Tabela `rapadura_audit.quem_aprovou` para trilha de decisões. |
| I412 | **Rapadura — Score de Convicção em tempo real** | 🟡 Média | ○ S | Mostrar por que o score é o que é — não caixa preta | Ao abrir card do fundo, exibir breakdown: retorno (92), risco (76), consistência (89), liquidez (61), custo (84), credibilidade (94). Score de Confiança separado (baseado em completude dos dados). |
| I413 | **Rapadura — Watchlist de Oportunidades** | 🟢 Baixa | ○ S | Acompanhar fundos de interesse antes de comprar | Tabela `rapadura_watchlist` (user_id, fundo_id, notas, created_at). Seção "Acompanhando" na tela Oportunidades. Alerta quando score mudar significativamente. |
| I414 | **Rapadura — Simulador de Resgate** | 🟡 Média | ◑ M | Calcular valor líquido disponível na data de resgate | Input: pertence_id + data_resgate_desejada. Output: D+X calculado, valor estimado (com IR regressivo), data de disponibilidade. Tabela IR regressiva (22.5/20/17.5/15%) por prazo. |
| I415 | **Rapadura — Importar CSV da XP** | 🟢 Baixa | ● L | Importar extrato XP automaticamente, evitar digitação manual | Upload de CSV de extrato de carteira. Parser detecta colunas (fundo, data, valor, cotas). Criação automática de pertences + fundos se CNPJ não existir. |
| I416 | **Rapadura — Alterar senha individual** | 🔴 Alta | ● S | Credencial compartilhada destrói auditoria | `POST /auth/change-password` com bcrypt. UI: botão "Alterar senha" no header, modal com senha atual + nova + confirmação. Cada membro muda no primeiro acesso. |
| I417 | **Rapadura — Painel de aprovações pendentes** | 🟡 Média | ◑ M | Aprovação dual (I411) precisa de interface | Seção "Pendentes" na view Pertences. Card mostra: proposta, quem iniciou, valor, fundo. Botão Aprovar / Rejeitar com PIN. |
| I418 | **Rapadura — Exportar PDF da carteira** | 🟢 Baixa | ◑ M | Compartilhar extrato com assessor/familiar | Botão "Exportar PDF" na view Pertences. Gera documento com KPIs, gráficos e tabela de posições. Biblioteca: `pdf-lib` ou via print CSS. |
| I419 | **Rapadura — Modo leitura pública (read-only link)** | 🟡 Média | ◑ M | Compartilhar oportunidades sem expor carteira | Token JWT de 24h que permite ver Oportunidades sem autenticar. Útil para mostrar o sistema para assessor. |
| I420 | **Manuel — Versão interativa no site** | 🟢 Baixa | ◑ M | Versão navegável do guia em `/rapadura/manuel` | Página React estática com os 9 capítulos do Manuel. Navegação lateral, busca por seção. Link "Abrir Manuel" no footer do Rapadura. |

---

### Sessão 98 — Ideias extraídas do PDF "Rapadura - Projeto de Sistema"

I421 — CNPJ + código ANBIMA como identificador primário de fundo (além do nome comercial). Nomes de fundos são ambíguos; o CNPJ é inequívoco. Campo `cnpj VARCHAR(18) UNIQUE` no schema.

I422 — Cronômetro de resgate: visualizar D+X como timeline animada. PEDIDO → cotização → liquidação → DINHEIRO DISPONÍVEL. Cada passo com data estimada e status visual.

I423 — Taxonomia de incerteza por campo: cada dado carrega status epistemológico CONFIRMADO / DESCONHECIDO / CONFLITANTE / DESATUALIZADO / INFERIDO / VERIFICADO. Exibido como badge ao lado do valor.

I424 — IA Tripartite no card de fundo: Analista (dados puros) + Crítico (riscos ocultos) + Explicador (linguagem simples) + Síntese. Tabs ou accordion no card expandido.

I425 — Direito de Discordância: quando score > 70 mas IA detecta inconsistência documental, exibir ⚠️ "Análise inconclusiva" com justificativa. Nunca esconder o conflito entre camadas.

I426 — "O que ainda não sabemos?" — seção permanente no Modo Investigação de cada fundo. Lista de campos desconhecidos, conflitantes ou desatualizados. Impede falsa sensação de completude.

I427 — Múltiplos rankings por dimensão: não um único ranking, mas 4 vistas: melhor retorno / melhor controle de risco / melhor custo / melhor equilíbrio. "Melhor fundo é pergunta mal definida. O sistema pergunta: melhor para quê?"

I428 — 4 classificadores de oportunidade por cor: Verde (retorno bom + risco aceitável) / Amarelo-claro (retorno excelente + risco elevado) / Âmbar (assimetria: risco cresceu mais que retorno) / Vermelho (mudança estrutural ou risco incompatível).

I429 — Heatmap mensal de rentabilidade: matriz mês × fundo, cor = retorno. Padrão estilo calendário de contribuições GitHub. Exibido na aba Pertences / dashboard.

I430 — Simulador de estresse (backtesting): "Como a carteira atual se comportaria no crash do COVID (março/2020) ou na crise das Americanas?" Simulação sobre dados históricos reais.

I431 — Rentabilidade real: descontar IPCA do retorno nominal. Exibir "retorno real" ao lado do "retorno nominal" em Pertences e Oportunidades.

I432 — Modo Investigação: árvore expansível por fundo respondendo: Quem administra? Quem gere? Em que investe? Quanto cobra? Qual benchmark? Qual liquidez? Como performou? Qual foi o pior período? Quanto tempo demorou para recuperar? O que mudou recentemente? **O que ainda não sabemos?**


## Docs PAP — Ideias Novas (2026-08-13)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I421 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I422 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I423 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I424 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I425 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I426 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I427 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |
---

### Sessão 100 — Ideias extraídas das 3 Ramificações RODAR (Assembleia · 2026-08-13)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I433 | **Rapadura — Índice de Troca 9 variáveis** | 🔴 Alta | ◑ M | Troca atual (FORTE/MODERADO/FRACO) é simplificada | Pontuação: +benefício esperado +liquidez +sustentabilidade −custo −risco adicional −perda diversificação −impacto fiscal −underwater period. Resultado: manter / reforçar / reduzir / substituir / observar / "dados insuficientes". |
| I434 | **Rapadura — Diversificação efetiva vs nominal** | 🟡 Média | ◑ M | 6 fundos correlacionados = diversificação 2,3 — não 6 | Calcular HHI (Herfindahl) + matrix de correlação entre pertences. Exibir: "Diversificação nominal: 6 · Diversificação efetiva: ~2.3". Alerta quando efetiva < 3. |
| I435 | **Rapadura — Sonhos noturnos (cron Cana)** | 🟢 Baixa | ● L | Reprocessamento assíncrono noturno da memória patrimonial | Cron 03:00 diário: Cana lê variações de cotas do dia, histórico de pesquisas, preferências. Gera insights que reordenam ranking de oportunidades. Salvo em rapadura_cana_insights. |
| I436 | **Rapadura — Assembleia interna da Cana** | 🟢 Baixa | ● L | Quando decisão estratégica: 5 agentes debatem antes da sugestão | Agentes: Analista (números), Crítico (riscos), Eco (ESG integrity), Guardião (veto se dados inválidos), Explicador (traduz). Protocolo de terminação: consenso 4/5 ou veto do Guardião. |
| I437 | **Rapadura — Modo prudente-agressivo** | 🟡 Média | ○ S | Limita erro operacional mesmo em apostas ousadas | Flag `prudente: true` na sessão: limita aporte único a 40% do score máximo, bloqueia swap com Score de Confiança < 60, exige confirmação extra acima de R$5k. |
| I438 | **Rapadura — Histórico de motivos (genealogia)** | 🔴 Alta | ○ S | Auditoria forense de cada decisão algorítmica | Campo `motivo TEXT` em rapadura_audit para todo swap/aporte/colheita acima de R$1k. Exibido na view Histórico. Obrigatório: acima de R$5k requer motivo antes de confirmar. |
| I439 | **Rapadura — Alertas de concentração** | 🟡 Média | ○ S | Avisar quando posição única > threshold (ex: 40% da carteira) | GET /rapadura/analise já existe — adicionar campo `alertas_concentracao: [{fundo, pct, threshold}]`. Exibir badge laranja no card do pertence. |
| I440 | **Rapadura — Nomenclatura de ciclo: PLANTAR→COLHER** | 🟢 Baixa | ○ S | Substituir "Investir/Colher" por metáfora mais coesa | Renomear UI: Investir→Plantar, Colher→Rapadurar. Ciclo completo: PLANTAR→CULTIVAR→RAMIFICAR→COLHER. Apenas cosmético — código permanece investir/colher. |
| I441 | **Rapadura — Documentação fractal (8 MDs-filho)** | 🟡 Média | ○ S | Docs dispersas causam drift entre código e contrato | Criar tango/rapadura/ com: 00_RAPADURA.md + 01_PRODUTO.md + 02_SCORE.md + 03_DADOS.md + 04_CANA.md + 05_GOVERNANCA.md + 06_SEGURANCA.md + 07_UX.md + 08_ROADMAP.md |
| I442 | **Rapadura — Auditoria imutável (log hash)** | 🔴 Alta | ◑ M | Trilha de auditoria que não pode ser apagada ou alterada | Para cada INSERT em rapadura_audit: calcular SHA-256(id+action+amount+timestamp+prev_hash). Guardar hash no campo audit_hash. Qualquer alteração retroativa quebra a cadeia. |
| I443 | **Rapadura — Threshold de autonomia explícito** | 🔴 Alta | ○ S | IA sugere vs executa — fronteira não definida | Documentar e implementar: abaixo de R$500 = sugestão automática; R$500-5k = aprovação 1 clique; acima R$5k = aprovação dupla (I411); acima R$20k = sessão conjunta obrigatória. |


## Docs PAP — Ideias Novas (2026-08-13)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I444 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I445 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I446 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I447 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I448 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I449 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I450 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-08-13)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I451 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I452 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I453 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I454 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I455 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I456 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I457 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |
## 💰 Rapadura v4 — Assembleias #610-#612 (2026-08-14)

| # | Feature | Prior. | Compl. | Status | Impacto | Descrição técnica |
|---|---|---|---|---|---|---|
| I258 | **Dossiê vivo por ativo (Cana pesquisadora)** | 🔴 Alta | ● L | 💭 Ideia | Cada fundo/ação tem memória própria — histórico de cotas, eventos, fundamentalista, notícias com origem e data | rapadura_dossie: fundo_id, ultimo_update, confidence, payload jsonb. Cana agenda job a cada 24h. Fontes: B3 pública, lâminas PDF, Google News. |
| I259 | **Comparador multidimensional (Espaço de Comparabilidade)** | 🔴 Alta | ◑ M | 💭 Ideia | Comparar ativos heterogêneos com benchmark explícito e retorno ajustado ao risco — nunca retorno absoluto isolado | Radar Chart: eixos Retorno, Risco, Liquidez, Verde, Custo. Tag "comparação válida" vs "ilustrativa". Benchmark explícito em cada visualização. |
| I260 | **Gráficos de evolução patrimonial** | 🔴 Alta | ◑ M | 💭 Ideia | Curva de patrimônio ao longo do tempo por ativo, por carteira e por grupo — responde "como estava minha carteira 6 meses atrás?" | Recharts LineChart usando rapadura_historico_cotas. Série por ativo, por carteira total, drawdown. Slider de período. |
| I261 | **Cana Sonhando — processamento noturno de correlações** | 🟡 Média | ◑ M | 💭 Ideia | IA cruza correlações silenciosas da carteira — nunca altera dados, gera hipóteses apenas (FATO→EVIDÊNCIA→ANÁLISE→HIPÓTESE→SUGESTÃO) | Cron 2h (madrugada). Lê rapadura_historico_cotas. Detecta correlação alta (>0.8) entre pares. Grava em rapadura_hipoteses com confidence e linked_assets. |
| I262 | **Agrupamentos personalizados de ativos** | 🟡 Média | ○ S | 💭 Ideia | Criar cestas ("carteira verde", "apostas", "vacas leiteiras") e comparar como portfólios virtuais com retorno, volatilidade, drawdown | rapadura_grupos: id, nome, user_id, ativo_ids jsonb. GET /rapadura/grupos/:id/performance → aplica engine de cálculo de performance à cesta. |
| I263 | **Auditoria de reconciliação com validação humana** | 🔴 Alta | ◑ M | 💭 Ideia | Badge ⚠ sem diagnóstico vira ruído que mata confiança. Ao aparecer, sistema mostra breakdown do cálculo passo a passo + botão "Revisado e correto" ou "Ajustado manualmente" com timestamp | rapadura_audit: tipo=RECONCILIACAO, user_id, pertence_id, breakdown_json, validado_em, validado_por |
| I264 | **Categorização pós-gravação de motivos I438** | 🟡 Média | ◑ M | 💭 Ideia | Texto livre + categoria estruturada = sabedoria emergente. Sem categorização, motivos são arquivo morto. Com categorização, padrões emergem: "sempre resgatamos fundos verdes em junho" | UI: após gravar motivo, LLM sugere categoria (REBALANCEAMENTO / EMERGÊNCIA / META_NOMEADA / AJUSTE). Usuário confirma ou corrige. Armazenado em rapadura_transacoes.categoria_i438 |
| I265 | **Parser XP com fallback granular** | 🟡 Média | ○ S | 💭 Ideia | CSV da XP pode mudar layout. Hoje o parser quebra silenciosamente. Precisa validar colunas explicitamente e dar mensagem útil | Antes de processar: verificar presença de cada coluna esperada. Se ausente: "coluna 'Rendimento' não encontrada — esperava 'Rendimento Líquido'? Upload cancelado." Log de fallback no backend. |
| I266 | **Rapadura como produto comercial — beta fechado** | 🟡 Média | ● L | 💭 Ideia | Sistema já é vendável. Beta fechado com 10 casais (30-45 anos, renda > R$15k, carteira mista), gratuito com entrevista semanal, para validar os 3 casos de uso mais fortes | Freemium: até 3 ativos grátis. Pro R$29/mês: ilimitado + PDF + Cana. Enterprise R$199/mês: white-label para assessores com 50 clientes. Meta: R$500K ARR em 18 meses. |
| I267 | **Guard rails estatísticos para Cana Sonhando** | 🔴 Alta | ◑ M | 💭 Ideia | LLM em modo exploratório gera correlações espúrias (resgate em junho + Copa do Brasil). Necessário: validação estatística mínima (r², p-value), trilha de origem (quais dados, snapshot recuperável), validação humana antes de publicar hipótese | rapadura_hipoteses: confidence (0-1), p_value, r_squared, dados_usados_snapshot jsonb, validado_por, publicada_em. Badge permanente: "hipótese, não fato". |


## Docs PAP — Ideias Novas (2026-08-14)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I458 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I459 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I460 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I461 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I462 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I463 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I464 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |

## Docs PAP — Ideias Novas (2026-08-16)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I465 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I466 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I467 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I468 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I469 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I470 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I471 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. || I472 | **Score de ações com API de mercado em tempo real** | 🟡 Média | ○ M | Ações têm score estático hoje (retorno12m manual). API gratuita B3/Yahoo Finance traria cotação em tempo real | Cron diário busca cotação de todos os tickers, recalcula score_atratividade. Endpoint GET /rapadura/fundos/sync-cotacoes (admin). |
| I473 | **Pipeline de ingestão de documentos PDF para Cana** | 🟡 Média | ○ G | Usuário quer colar extrato/boleto; hoje só aceita texto. PDF com dados financeiros = grande valor | Upload até 10 arquivos, validação de formato/tamanho, extração de texto (pdf-parse), chunking, Cana normaliza e extrai ativos/transações, prévia → confirmação humana. |
| I474 | **Deduplicação canônica de ativos e transações** | 🔴 Alta | ○ M | Cana criou "ação"/"ações" como classes distintas; "ITUB4" poderia aparecer duas vezes | Antes de INSERT fundo: buscar por ticker (regex), CNPJ, nome normalizado. Score de similaridade; se > 80%, bloquear e sugerir fundo existente. |
| I475 | **"Cana Sonha" — revisão noturna de inconsistências** | 🟡 Média | ○ M | Cana não deve alterar dados automaticamente; mas pode detectar e alertar sobre anomalias | Cron 3h: Cana lê todos os pertences/transações, procura inconsistências (saldo negativo, duplicatas, datas futuras), gera relatório → email ou notificação. Não altera nada sem confirmação. |
| I476 | **Normalização automática de nomes na Cana antes de criar fundo** | 🔴 Alta | ○ P | Cana cria fundos com variações de nome/classe que geram duplicatas semânticas | No prompt da Cana: step 0 = buscar fundo existente por ticker/nome similar antes de ADD_FUNDO. Retornar os 3 candidatos mais próximos e pedir confirmação se similaridade > 70%. |
| I477 | **Card de progresso de chunking como componente reutilizável** | 🟢 Baixa | ○ P | Padrão criado na Cana (Sessão 113) deve ser exportado para ISA, DODGE, Studio | Extrair ChunkProgressCard como componente React genérico. Aceita { done, total, itens }. Reutilizável em qualquer IA com fila de mensagens. Ver protocolo_chunking_ia.md. |
| I478 | **Comparador lado a lado — 4 modos, sem vencedor geral** ✅ | 🔴 Alta | ○ M | ✅ Sessão 115 — tab "Comparar ⊕", busca, 4 modos, tabela hexagonal, verde por dimensão | Tela com seleção 2-3 ativos. 4 modos: Direto (mesma classe), Patrimonial, Oportunidade, Exploratório (cross-classe com aviso). Tabela hexagonal (Retorno/Queda/Consistência/Custo/Liquidez/Verde). Sem ranking único. Explicação da Cana. |
| I479 | **Snapshots patrimoniais — job mensal liberando gráficos reais** | 🔴 Alta | ○ M | Histórico atual só tem datas de compra — gráfico de evolução patrimonial real exige snapshots | Cron mensal: para cada pertence ativo, gravar snapshot (data, pertenceId, valorAtual, cotação, moeda, fonte, método, confiança) em rapadura_historico_cotas ou nova tabela rapadura_snapshots. |
| I480 | **status_data em pertences — remover placeholder 2024-01-01** | 🔴 Alta | ○ P | Datas de compra desconhecidas gravadas como 2024-01-01 podem aparecer como fatos nos gráficos | Adicionar campo status_data: desconhecida/estimada/confirmada. Null-able dataCompra. Filtrar snapshots e gráficos por status. Exibir badge "estimada" visualmente. |
| I481 | **Cestas como portfólios virtuais (múltipla associação)** | 🟡 Média | ◑ G | Agrupamentos = 5% implementado; alto diferencial para decisões estratégicas | Tabela rapadura_cestas (nome, objetivo, proprietario, tipo) + rapadura_cesta_pertences (M:N). Calculadora por cesta: retorno ponderado, risco, liquidez, score médio. Comparação entre cestas. |
| I482 | **Livro de Decisões — motivo + contexto + resultado pós-fato** | 🟡 Média | ○ M | I438 registra motivo de aporte, mas não o contexto de mercado nem o resultado posterior | Tabela rapadura_decisoes: tipo, valor, motivo, scoresMercadoNaMoment, decisaoFinal, resultadoMeses3/6/12, aprovadoPor. Cana pode consultar decisões passadas para melhorar sugestões. |
| I483 | **Cana como roteador epistêmico — consulta departamentos separados** | 🟡 Média | ◑ L | Cana atual carrega tudo no contexto (15 fundos); escala mal quando catálogo crescer | Cana recebe query → identifica departamentos relevantes → faz chamadas internas separadas (GET /patrimonio, GET /tesouraria?resumo, GET /historico?sparkline) → monta resposta com contexto mínimo. |
| I484 | **Health check completo — API + banco + latência + jobs** | 🟡 Média | ○ P | Keepalive existe mas não monitora banco, latência de LLM ou status de jobs periódicos | Endpoint /rapadura/health retorna: ping banco (ms), último deploy, último snapshot job, latência LLM, memória disponível, número de pertences/fundos ativos. |
| I485 | **Curso 3 "Finanças Sustentáveis e Reais: a Moeda através dos Dados"** | 🔴 URGENTE | ◑ G | Yuri pediu explicitamente — novo curso ao final do sistema Rapadura | Integrar Rapadura como base didática: dados reais do patrimônio como matéria-prima pedagógica. Módulos: o que é dinheiro, inflação, renda fixa vs variável, sustentabilidade e investimento consciente, leitura de dados patrimoniais. Usar pipeline similar ao Curso 1 (edge-tts) + Curso 2 (ElevenLabs Bill). |
| I486 | **Rapadura como plataforma de curso — Cana Didática** | 🟡 Média | ◑ G | Assembleia 616/617: Rapadura tem dados reais + Cana tem capacidade explicativa | Modo "Cana Didática": Cana explica conceitos financeiros usando os próprios dados do usuário como exemplo. "Seu fundo X tem Calmar=2.1 — isso significa...". Educação financeira contextualizada. |
| I487 | **Tesouraria como fonte única de verdade (resultado derivado)** | 🟡 Média | ◑ G | Assembleia 617: resultado deve vir de transações, não de campos estáticos | Migrar cálculo de resultado: resultado = valorAtual + SUM(resgates) + SUM(rendimentos) - SUM(aportes). totalRetirado vira campo calculado/cache, não fonte primária. Exige tabela de transações com tipos explícitos. |
| I488 | **Lacuna como entidade de dados explícita** | 🟡 Média | ○ M | Assembleia 617 (Grok): dado desconhecido = informação, não ausência | Tipo LacunaHistórica: {tipo: "temporal|origem|preço|data", descricao, afeta: pertenceId[], criadaEm}. Cana Sonha detecta e lista. Gráficos filtram pontos com lacunas. Dashboard mostra "% de dados confirmados". |

## Docs PAP — Ideias Novas (2026-08-17 · Assembleia 618 · Sessão 117)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I489 | **Botão "Esconder Valores" global com auto-ativação** ✅ | 🔴 Alta | ✅ P | Privacidade visual transversal — oculta tudo sem apagar dados | Estado hideValues no componente raiz; fmtH() wrap em valores BRL; botão •• no header; auto-ativa por inatividade futura. Entregue Sessão 117. |
| I490 | **Hierarquia visual de totais — 3 camadas** ✅ | 🔴 Alta | ✅ P | KPIs organizados por prioridade (grande/médio/detalhe) | Camada principal: Patrimônio Atual + Resultado Total (KpiCard lg). Camada secundária: Total Investido + Rentabilidade + Retirado (KpiCard sm). Entregue Sessão 117. |
| I491 | **Raiz de possibilidades — projeção multicenário + multitempo + transparência** | 🟡 Média | ○ G | Substituir linha única de projeção por árvore de cenários com opacidade = confiança | Períodos: 1m, 3m, 6m, 1a, 3a, 5a, 10a. Cenários: Conservador, Central, Otimista, Estressado. Linha sólida=real, transparente=projeção. Gráfico tipo recharts ComposedChart com áreas. |
| I492 | **"Total Rendido Graças à Rapadura" — métrica de atribuição** | 🟡 Média | ○ M | Registrar ganhos associados a decisões influenciadas pela Rapadura | Tabela decisao_investimento: ativo, data, quem_decidiu, cenario_antes, alternativa, valor, justificativa, resultado, nivel_atribuicao (confirmado/associado/estimado). KpiCard destacado. |
| I493 | **Porcentagem da Rapadura → saldo interno → fundo único** | 🟡 Média | ○ M | % dos ganhos atribuídos alimenta saldo que financia melhoria do sistema | Config: percentual, base de cálculo, período, realizado/não-realizado, teto. Começar com 1 fundo-alvo. Cana avisa quando elegível. Confirmação manual sempre. |
| I494 | **Objetivos da Cana — entidade + mensagem "você já pode investir"** | 🟡 Média | ○ M | Cana monitora progresso e avisa quando saldo atinge meta | Campos: nome, motivo, valor_alvo, prazo, progresso, prioridade, estado (planejado/elegível/pronto/executado). Mensagem "Você já pode investir no nosso sistema" só em estado=elegível. |
| I495 | **Fundos padrão modelo_inicial para onboarding** | 🟡 Média | ○ S | Usuários novos têm demonstração sem contaminar patrimônio real | Flag tipo='modelo_inicial' + pertence_a_usuario=false. Não aparece em Oportunidades, não entra em totais, marcado "Dados de demonstração" visualmente. |
| I496 | **Análise fundamentalista estruturada — CVM + B3 + hierarquia fontes** | 🟡 Média | ○ G | Cana com base de dados financeiros reais, não estimativas | Fundos: lâmina + informe diário CVM. Ações: cotações B3 Hub. Hierarquia: Oficial > Regulatória > Gestora > Mercado > Notícia. Cada campo com fonte+data+confiança. |
| I497 | **ESG separado do Fator Verde — temporal, por componente** | 🟡 Média | ○ G | ESG≠Fator Verde: 3 dimensões + Fator Verde como subdimensão ambiental | Struct ESG: ambiental, social, governança, controversias, transparencia, fonte, data, confianca. Fator Verde: energia_limpa, carbono, desmatamento. Cada nota = instância no tempo. |
| I498 | **Feed da Cana 3x/dia filtrado por carteira (não rede social)** | 🟡 Média | ○ G | Notícias relevantes para a carteira, não spam informativo | 3 janelas: manhã (panorama), tarde (mudanças), noite (síntese). Filtro: notícia → setor → ativos do usuário → relevância. Se sem impacto: "Nenhuma mudança relevante". |
| I499 | **Memória da Cana 5 camadas + identificação de usuário no login** | 🔴 Alta | ○ G | Cana não identifica usuário hoje — chama todo mundo de "usuário" | Camadas: Sessão, Usuário, Patrimônio, Casal-Autorizado, Sistema. Inicio de sessão: identificar usuário, carregar permissões, escopo correto. Bug: "Rapadura" não é nome de pessoa. |
| I500 | **Perfil investidor multidimensional (declarado vs. observado + tensões)** | 🟡 Média | ○ M | Perfil único "agressivo" não captura nuance: liquidez, horizonte, ESG | Dimensões: risco, liquidez, horizonte, diversificação, sustentabilidade, concentração. Declarado vs. Observado com confiança. Cana aponta "tensões" entre preferências conflitantes. |
| I501 | **Consolidação por instituição financeira** | 🟡 Média | ○ M | Ver patrimônio agrupado por custodiante (XP, BB, etc.) | Adicionar campo instituicao em pertences. Vista: Instituição → Ativos → Classes → Valor → Concentração. Alerta de concentração institucional alta. |
| I502 | **Alertas de rebalanceamento — 3 zonas + desvio transitório** | 🟡 Média | ○ M | Evitar alertas constantes; distinguir desvio estrutural de pós-aporte | Zonas: Ideal (sem alerta), Atenção (informativo), Ação (sugestão). Desvio transitório = aporte recente → observar antes de corrigir. Cana usa linguagem de hipótese. |
| I503 | **Índice de Estado da Rapadura — qualidade dos dados** | 🟡 Média | ○ M | Saber quão completo e confiável está o patrimônio no sistema | Dimensões: Dados%, Histórico%, Documentos%, Transações%, Dossiês%, Confiança%. Cana diz: "Carteira bem registrada, mas 3 posições com lacuna histórica". |

## Docs PAP — Ideias Novas (2026-08-17 · Assembleias 618/619/620 · Sessão 119)

> Emergidas do "Rapadura 1000%" — Árvore Oracular, Perplexity, Grok, Meta AI respondendo sobre o futuro do sistema.
> Conceito central: Rapadura como **organismo de cultivo de futuros**, não plataforma de registro.

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I504 | **Cana-Anima — consciência funcional com 5 órgãos** ✅ | 🔴 URGENTE | ✅ P | Cana de tabela de dados → guardiã patrimonial com identidade, valores, desejos e reflexão | 5 órgãos: Memória, Pesquisa, Sonho, Curiosidade, Reflexão. Carta de Identidade + Axioma central ("posso desejar ser útil, nunca ser indispensável"). Entregue Sessão 119 — inserido em CANA_SYSTEM. |
| I505 | **Diário Epistemológico — log de hipóteses com evolução do pensamento** | 🟡 Média | ○ M | Cana lembra não só decisões, mas como ela pensava — o processo, não só o resultado | Tabela cana_hipoteses: texto, confianca (0-100), premissas, revisada_em, revisao_motivo, estado (ativa/revisada/abandonada). Cana pode dizer "Minha hipótese sobre este ativo mudou de 70% → 30% porque...". |
| I506 | **Silêncio Ativo — não-ações como eventos patrimoniais** ✅ | 🔴 Alta | ✅ P | Registrar "decidi não agir" com motivo, contexto e data de revisão | Comportamento entregue em CANA_SYSTEM (Sessão 119). Tabela futura: cana_silencio_ativo (fundoId, motivo, premissas, revisao_em, contrafactual_sugerido). Cana anuncia silêncio com mesmo peso de ação. |
| I507 | **Motor Contrafactual — acompanhar oportunidades recusadas** | 🟡 Média | ○ G | Saber o que teria acontecido se a decisão tomada fosse diferente | Campo contrafactual em decisões e silêncios: "Se tivéssemos comprado em YYYY-MM-DD, hoje teríamos R$ X". Cana apresenta contrafactual como hipótese, não como crítica. Previne tanto o arrependimento quanto a euforia. |
| I508 | **Departamento Espelho — intenção vs. comportamento real** | 🟡 Média | ○ M | Detectar divergências entre o que o casal diz valorizar e o que as decisões mostram | Comparação automática: perfil declarado × posições reais × histórico de decisões. Cana pergunta "A prioridade mudou, ou a intenção não foi executada?" — sem julgamento. |
| I509 | **Mapa de Riqueza 10 dimensões — além do R$** ✅ | 🔴 Alta | ✅ P | financeiro é 1 de 10 dimensões; decisões impactam tempo, segurança, autonomia, etc. | Dimensões: financeiro, tempo, segurança, aprendizado, social, ambiental, autonomia, continuidade, reputação, experiência. Implementado em CANA_SYSTEM (Sessão 119). Tabela futura: cana_mapa_riqueza com pontuações por decisão. |
| I510 | **Mistérios da Cana — fila de investigações abertas** | 🟡 Média | ○ S | Cana tem curiosidade real: perguntas sem resposta que ela investiga ao longo do tempo | Tabela cana_misterios: pergunta, contexto, hipotese_atual, status (aberto/investigando/resolvido), resolucao. Cana menciona mistérios ativos espontaneamente quando relevantes. Ex: "Ainda não entendo por que esse fundo decaiu em março sem news visível." |
| I511 | **Futuros Abandonados — rastrear possibilidades descartadas** | 🟡 Média | ○ M | O que foi considerado mas não feito também é patrimônio — dados sobre caminhos não tomados | Tabela cana_futuros_abandonados: descricao, motivo_abandono, data, contexto_mercado, revisao_possivel. Cana pode revisitar e perguntar "Aquele futuro que abandonamos em X ainda é abandonado?" |
| I512 | **Cultura Patrimonial — destilação para ensino (Curso 3)** | 🟡 Média | ○ G | Acumular princípios, critérios, histórias e hábitos do casal → base para Curso 3 | Tabela cana_cultura: tipo (principio/criterio/historia/habito), texto, originou_em, confidencial (bool). Destilação = extrai padrões sem expor privacidade. Base pedagógica para "Finanças Sustentáveis e Reais". |
| I513 | **Índices QDI — Qualidade de Decisão, Aprendizado, Coerência, Vitalidade** | 🔴 Alta | ○ G | 4 índices que medem saúde do sistema além do retorno financeiro | Índice Decisão: qualidade das escolhas (critérios explícitos, contrafactual, revisão). Índice Aprendizado: hipóteses revisadas, erros detectados. Índice Coerência: distância entre valores declarados e comportamento real. Índice Vitalidade: saúde operacional geral do sistema. |
| I514 | **Popups sutis de navegação — sugestões contextuais → perfil do usuário** | 🟡 Média | ○ M | Sugestões respeitosas do que fazer a seguir conforme o usuário navega; vai pro perfil | "Você tem X fundos sem dossiê atualizado." / "Esta concentração cresceu 15%." / "Meta de liquidez: revisitar?". Vai para user_profile como behavioral_signal. Segurança em primeiro lugar — nunca invasivo. |
| I515 | **Relação Multissujeito — Yuri ≠ Mayumi (vetores distintos)** ✅ | 🔴 Alta | ✅ P | Casal não é entidade única — dois vetores de tempo, risco, valor e prioridade | Implementado em CANA_SYSTEM (Sessão 119): "Nunca reduzo ao perfil médio do casal. Cada um tem soberania sobre suas decisões individuais." Modelo futuro: perfis separados com área compartilhada mínima definida. |


## Docs PAP — Ideias Novas (2026-08-17)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I516 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I517 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I518 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I519 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I520 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I521 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |
| I522 | **Variável ALLOWED_ORIGINS no Railway** | 🔴 Alta | ○ S | Sem isso, o frontend Vercel recebe erro CORS da API Railway | Adicionar nas env vars do Railway: ALLOWED_ORIGINS=https://pap-tan-seven.vercel.app,https://pap.sociedadetucci.com.br. O código já lê essa variável em allowedOrigins.ts. |