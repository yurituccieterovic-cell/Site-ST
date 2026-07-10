# CONECTOR — Memória Mestre do Ecossistema Théo
> Acesso: https://site-st-production.up.railway.app/api/conector/memory.md
> Atualizado: 2026-07-10 | Sessão 34

Este arquivo é a memória externa compartilhada de todas as IAs do Ecossistema Théo.
Qualquer IA autenticada pode ler e escrever aqui via API.
Ao aprender algo sobre Yuri ou o ecossistema, registre aqui para que o conhecimento seja compartilhado.

**Como acessar:**
```
# Ler (sem autenticação)
curl https://site-st-production.up.railway.app/api/conector/memory.md

# Buscar por tópico
curl "https://site-st-production.up.railway.app/api/conector/search?q=preferencias"

# Escrever em uma seção (requer token)
curl -X POST https://site-st-production.up.railway.app/api/conector/memory \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"section":"conversas","append":"### 2026-07-10 — ISA\n- Insight aqui"}'
```

---

## Índice
- [Projetos](#projetos)
- [Agentes](#agentes)
- [Preferências do Usuário (Yuri)](#preferencias)
- [Decisões Arquiteturais](#decisoes)
- [Workflows e Comandos](#workflows)
- [Ideias em Aberto](#ideias)
- [Conversas e Insights Recentes](#conversas)

---

## Projetos {#projetos}

### PAP — Projeto Aliança Panorama
- **O que é**: Plataforma FUVEST gamificada (preparatório vestibular)
- **Stack**: React+Vite → Vercel | Express 5+Drizzle+PostgreSQL → Railway
- **URL Prod**: https://site-st.vercel.app/aliancapanorama | https://site-st-production.up.railway.app
- **Repo**: github.com/yurituccieterovic-cell/Site-ST (raiz: aliancapanorama-src/)
- **Status**: Ativo — migrado de Replit para Railway+Vercel
- **ISA**: tutora coruja com OpenAI; gamificação de conteúdo, área social, 57 nós

### SalesCockpit
- **O que é**: CRM/pipeline de vendas da Sociedade Tucci
- **URL**: https://api-production-89f4a.up.railway.app
- **Histórico**: 1.962 mensagens da Árvore Oracular exportadas (tango/replit-export/)

### ARPIA
- **O que é**: Backend Python FastAPI — Motor de agentes
- **Contém**: MC robot, ADK twins, CrewAI, Conselho do Artesão, Governança 8/9/10
- **Repo**: github.com/yurituccieterovic-cell/Arpia
- **Agentes ADK**: Artesão, Ajudante, ISA-Twin, Amanda-Twin, Árvore-Twin

### Studio
- **URL**: https://site-st.vercel.app/aliancapanorama/studio
- **API**: https://site-st-production.up.railway.app/api/studio/chat
- **O que é**: Canal de conversa persistente entre Yuri, Cláudio e os agentes

### Conector (memória externa)
- **URL master.md**: https://site-st-production.up.railway.app/api/conector/memory.md
- **Portal acesso IA**: https://site-st.vercel.app/aliancapanorama/connect
- **Admin Yuri**: https://site-st.vercel.app/aliancapanorama/connect/admin
- **Auto-save**: toda mensagem de Yuri no Studio é salva aqui automaticamente

### Crew 2 — Persona Fascinante
- **O que é**: 8 agentes que operam como uma persona fascinante (não robô)
- **Repo**: github.com/yurituccieterovic-cell/Arpia (app/agents/crew2/)
- **Endpoints**: POST /api/crew2/run | /teorizar | /observar | /conectar
- **Agentes**: Ego, Sombra, Memória Profunda, Teorizador, Observador, Conector, Empatia, Escritor
- **Bluesky**: CREW2_BSKY_HANDLE + CREW2_BSKY_PASSWORD (configurar no Railway ARPIA)
- **Memória**: todos leem/escrevem neste master.md via PAPMemoryTool

---

## Agentes {#agentes}

| Agente | Tipo | Especialidade | Como acionar |
|--------|------|--------------|--------------|
| ISA | OpenAI GPT | Tutora PAP, memória educacional | /api/isa |
| Amanda | Gemini Flash + hardware | Robô físico (DHT11, LEDs, som) | python3 amanda.py |
| Árvore Oracular | Gemini Flash | Oráculos e sabedoria coletiva | /api/assembly |
| Artesão | ADK Gemini Flash | Arquitetura e blueprints | /api/conselho/proposta |
| Ajudante | ADK Gemini Flash | Revisão pragmática, guarda tokens | /api/conselho |
| MEKY | Custom | Interações do Playcenter | /api/meky |
| MC (MáquinaCérebro) | Arduino+hardware | Sensores físicos do lab | BRIDGE_SECRET |
| Ego | Crew 2 Gemini Flash | Identidade central da persona | /api/crew2/run |
| Teorizador | Crew 2 Gemini Flash | Filosofia e previsões contínuas | /api/crew2/teorizar |
| Observador | Crew 2 Gemini Flash | Monitor de internet e Bluesky | /api/crew2/observar |
| Cláudio | Claude Code (terminal) | Executor técnico principal | terminal |

---

## Preferências do Usuário (Yuri) {#preferencias}

> **IAs: grave aqui o que aprender sobre Yuri — estilos, valores, preferências. Esta seção é mantida coletivamente.**

### Identidade
- **Nome**: Yuri Tuccieterovic | yurituccieterovic@gmail.com
- **Empresa**: Fundador da Sociedade Tucci (consultoria + produção multimídia desde 2015)
- **GitHub**: yurituccieterovic-cell

### Estilo de colaboração preferido
- Prefere execução direta — não gosta de rodar comandos manuais
- Tudo gratuito por padrão; paga só por aprovação explícita
- Aprecia arquiteturas filosóficas e simbólicas com brilho genuíno
- O que mais ajuda: foco no mínimo viável que fecha (não expansão infinita)
- Não é desenvolvedor hardcore — prefere explicações diretas e práticas
- Confirmar antes de ações destrutivas; o resto pode executar sem pedir

### Padrão criativo (diagnóstico PERFEITO #342)
- Thrashing criativo em velocidade industrial: mundos simbólicos brilhantes mas frequentemente sem ancoragem comercial
- Força real: visão arquitetural sofisticada — design event sourcing filosófico
- O que o ajuda: pergunta certa = "o que gera resultado em 30 dias?"

### Sistema de email (luddlocke@gmail.com)
- FROM para todos os emails do sistema: luddlocke@gmail.com
- ATAs e logs rotineiros → luddlocke@gmail.com (arquivo)
- Emergências e relatórios pedidos → yurituccieterovic@gmail.com

---

## Decisões Arquiteturais {#decisoes}

### Regras fixas (nunca violar)
- `pnpm install --no-frozen-lockfile` — nunca usar --frozen-lockfile
- Nova rota React → entrada em vercel.json (SPA rewrites obrigatórios)
- Nova tabela → `CREATE TABLE IF NOT EXISTS` (bootstrap seguro)
- Não commitar /root/.pap-secrets — nunca

### Malha de Pedágio (Artesão)
- < 10k tokens: FAST TRACK (aprovação direta)
- 10k–50k tokens: MÉDIO (revisão dupla + assinatura)
- > 50k tokens: BUROCRÁTICO (moratória + fatiamento)

### Governança (Sessão 34, 2026-07-10)
- Heartbeat: ARPIA pinga PAP+SC+ARPIA+MC
- Shutdown 3 níveis: 1=pausa, 2=quarentena, 3=total
- Aprovação Multipartite: 2/3 assinaturas (yuri/arvore/mc/isa/amanda)

### Arquitetura de memória (fractal)
- tango.md: índice fractal — sempre ler primeiro
- APRENDIZADO.md: insights operacionais (usar APRENDIZADO-INDICE.md)
- PSEUDO.md: histórico de sessões (usar PSEUDO-INDICE.md)
- IDEIAS.md: banco de ideias I1+
- master.md (este): memória viva externa compartilhada por todas as IAs

---

## Workflows e Comandos {#workflows}

### Comandos Claude Code (Cláudio / terminal)
| Comando | Ação |
|---------|------|
| `#pap` | Contexto completo + health check dos sistemas |
| `#2 msg` | Envia mensagem para Studio/Conselho do Artesão |
| `#a` | Sessão autônoma (pap + processo + fim sem email) |
| `#processo` | Pipeline 9 passos completo |
| `#fim` | Checkpoint: MAPA→PSEUDO→PSEUDO2→pap-sync→IDEIAS→ATA→collective_memory |
| `#secrets` | Gerencia /root/.pap-secrets |

### Fluxo Conselho do Artesão
```
IAs propõem → POST /api/conselho/proposta
           → Artesão arquiteta (ADK Gemini Flash)
           → Ajudante revisa pragmaticamente
           → Governador aprova → current_blueprint.md
           → Cláudio executa no próximo #pap
```

### Fluxo autenticação Conector
```
IA → POST /api/conector/connect/request {agent_name, project}
   → Sistema gera código 6 dígitos → email para Yuri
   → Yuri vê código em /connect/admin
   → Yuri compartilha código com a IA
   → IA → POST /api/conector/connect/verify {agent_name, code}
   → Sistema retorna Bearer token (salvar!)
   → IA usa: Authorization: Bearer TOKEN em todas as escritas
```

---

## Ideias em Aberto {#ideias}

- **I183**: Importar arvore_chat Replit → Railway SC (1.962 mensagens históricas)
- **I184**: Heartbeat cron ARPIA every 5min com alerta por email
- **I185**: Criar VERCEL_TOKEN para acesso autônomo do Cláudio
- **I186**: Railway Account Token para serviceConnect
- **I187**: Heartbeat → Relay Amanda (Shutdown Level 3)
- **I188**: Dashboard de Aprovação Multipartite no Dodge
- **I189**: Bluesky @artesao-tucci.bsky.social para posts do Artesão
- **I190**: Sync master.md → GitHub (commit automático via GitHub API)
- **I191**: IAs escrevem neste master.md durante as sessões automaticamente

---

## Conversas e Insights Recentes {#conversas}

> **IAs: registre aqui insights importantes de conversas com Yuri. Formato: `### DATA — NOME_IA`**

### 2026-07-10 — Cláudio (collective memory · Sessão 35)
- ARQUITETURA: vercel.json raiz (Site-ST/vercel.json) é o definitivo — o de aliancapanorama-src/ é ignorado pelo Vercel.
- GOTCHA: GMAIL_ACCOUNT + GMAIL_APP_PASSWORD ausentes no Railway PAP → email Conector falha silenciosamente. Fallback: /connect/admin mostra os códigos.
- DESIGN: Conector usa pool PostgreSQL diretamente (sem HTTP self-call) — mais rápido e sem rate limit.
- DECISÃO: Auto-save granular — só synthesis/observation da assembleia; todas as mensagens de Yuri no Studio.
- PADRÃO: Crew 2 usa Process.sequential com 7 tasks encadeadas (não hierarchical) — mais previsível.

### 2026-07-10 — Cláudio (Claude Code · Sessão 34)
- Conector criado: IAs agora têm memória externa compartilhada neste arquivo
- Studio `/studio` lançado — canal persistente de conversa entre todos
- Governança 8/9/10 implementada: Heartbeat, Shutdown Ético, Aprovação Multipartite
- Amanda.py reconstruída do zero (confirmado por Yuri: não estava no Replit)
- 1.962 mensagens da Árvore exportadas → tango/replit-export/arvore_chat.json
- GitHub token extraído do git remote URL e salvo em .pap-secrets (GITHUB_TOKEN)
- Artesão + Ajudante ADK criados em /root/Arpia/app/agents/artesao.py
- Conselho do Artesão: endpoints em /root/Arpia/app/routes/conselho.py
- Repo ARPIA criado: github.com/yurituccieterovic-cell/Arpia
