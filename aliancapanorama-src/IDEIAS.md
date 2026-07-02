# PAP — Ideias de Programação

> Derivadas de APRENDIZADO.md. Atualizar ao `#fim`.

> **37 ideias** — 31 de assembleias + 6 de docs (MAPA/PSEUDO/PSEUDO2)


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

### I49: interpretability_lock / Modo Acosmos 💭 Idéia
**Prioridade:** Média | **Complexidade:** Pequena
Flag booleana `interpretability_lock` na tabela `isa_memory`. Quando true: conteúdo não aparece em recalls públicos, não é indexado em vector store, não aparece em /api/isa/memory.md.
Alternativa ao "Secretus/Acosmus" — estado de invisibilidade voluntária sem deleção.
Derivada de: Assembleia #372.

### I50: /arquitetura + /buscar + /mapa (Arquitetura Visível) 💭 Idéia
**Prioridade:** Alta | **Complexidade:** Média
Rota GET /arquitetura: expõe schemas Drizzle, lista de rotas comentadas, estado da ISA, versão do sistema.
Comando /buscar [tema]: mostra o que a IA recuperou da memória ANTES de responder (recall visível).
Página /mapa: diagrama de projetos/features/tabelas/jobs autônomos (React + D3 ou Mermaid).
Tag #manutenção: sessões que alteram infra geram categoria "Evolução do Sistema" na memória.
Derivada de: Assembleias #377, #378, #380.

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
