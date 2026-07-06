# PAP — Ideias de Programação

> Derivadas de APRENDIZADO.md. Atualizar ao `#fim`.

> **44 ideias** — 31 de assembleias + 6 de docs (MAPA/PSEUDO/PSEUDO2) + 7 das Raízes do Projeto (I128-I134)


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