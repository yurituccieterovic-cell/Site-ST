# PAP — Ideias de Programação

> Derivadas de APRENDIZADO.md. Atualizar ao `#fim`.

> **31 ideias** geradas em 2026-07-02


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

## Docs PAP — Ideias Novas (2026-07-02)

| # | Feature | Prior. | Compl. | Impacto | Descrição técnica |
|---|---|---|---|---|---|
| I38 | **Audit Log de /api/ai/*** | 🔴 Alta | ○ S | Rastrear todas as chamadas externas à API de agentes | Middleware em ai.ts que loga X-Api-Key parcial, endpoint, IP e timestamp em tabela ai_audit_log. Detecta abuso antes que vire custo. |
| I39 | **Connection Pool Tuning para Neon** | 🟡 Média | ○ S | Neon tem limite de conexões no free tier; pool mal configurado causa erros em pico | Configurar pg.Pool com max: 5 (Neon free: 10 conexões). Adicionar pool.on("error") para log. Considerar pgBouncer externo se ultrapassar. |
| I40 | **Migration System (drizzle-kit migrate)** | 🔴 Alta | ◑ M | push --force em produção pode apagar dados; migrations versionadas são seguras | Trocar drizzle-kit push por drizzle-kit generate + migrate. Criar pasta migrations/. Adicionar no Railway: step de migração no start command antes do node. |
| I41 | **Score Histórico por Semana** | 🟡 Média | ○ S | Permite mostrar evolução de XP semana a semana no heatmap | View ou query: SUM(node_code.length * 10) de exercise_attempts agrupado por semana ISO. Endpoint GET /api/progress/weekly-score. Gráfico de linha no menu. |
| I42 | **Paginação em /api/ai/nodes e /exercises** | 🟡 Média | ○ S | Com 57+ nós e centenas de exercícios, retornar tudo de uma vez é ineficiente | Query params: ?limit=50&offset=0. Resposta: { data: [...], total, limit, offset }. Não quebra clientes existentes (default limit alto). |
| I43 | **Health Check com DB Ping** | 🔴 Alta | ○ S | Railway usa /health para saber se o serviço está saudável; hoje retorna OK mesmo com DB morto | GET /health: faz SELECT 1 no pool. Se OK → 200 { status: "ok", db: "ok" }. Se falhar → 503 { status: "error", db: "unreachable" }. Railway reinicia automaticamente no 503. |