# MAPA-PENDENCIAS.md — Pendências e Concluídos
**PAP · Sociedade Tucci**
> Parte do sistema MAPA. Ver MAPA-MASTER.md para índice geral.

---

## Sequência de Nascimento do Ecossistema Robótico

> Definida por Yuri em 2026-07-13. Ordem obrigatória — não construir em paralelo.

```
1. MEKY (Marta Centaurus) ← em construção agora
2. Perfidia (aranha / Vesper) ← perna quebrada: reparar com cianoacrilato+bicarbonato
3. Baratinha (Penélope) ← [SIMBÓLICO]
4. Orangotango / Gorango Tango ← [SIMBÓLICO]
5. Paca ← [CONCEITUAL]
6. Piolho de Cobra / Gongolo ← [SIMBÓLICO]
7. Drone com Arduino ← "em algum momento"
```

---

## Pendências Ativas (por prioridade)

| # | Item | Depende de | Status |
|---|---|---|---|
| 1 | Cadastrar voz "ISA" no painel RODAR com webhook /api/isa/rodar/invite | Yuri | ⏳ |
| 2 | Fornecer REPLIT_TOKEN para ativar MCP Replit e Árvore | Yuri | ⏳ |
| 3 | Confirmar Vercel build funcionando: testar /eco, /adm, /toyota, /api proxy | — | ✅ |
| 4 | Configurar DNS `pap.sociedadetucci.com.br` → Railway | Railway no ar | ⏳ |
| 6 | TOTP 2FA (I53) — antes de lançar módulo cripto/financeiro | — | ⏳ |
| 7 | pgvector (I52) — busca semântica substituindo ILIKE | — | ⏳ |
| 9 | Stripe: conectar em produção | domínio | ⏳ |
| 10 | I54 — Módulo Cripto/Árvore Frutífera | 2FA + domínio | ⏳ |
| 12 | MEKY — MEKY_TOKEN: adicionar ao env Railway | — | ⏳ |
| 13 | MEKY — GEMINI_API_KEY: adicionar ao env Railway | — | ⏳ |
| 14 | MEKY — hardware: ligar TX/RX do A7670 → Arduino → Termux, rodar termux-agent.py | hardware chegando | ⏳ |
| 17 | Criar conta Bluesky para Amanda (MEKY) + MEKY_BLUESKY_HANDLE + MEKY_BLUESKY_APP_PASSWORD | Yuri | ⏳ |
| 18 | Agendar amanda-dream-cron.py às 3h no Termux | hardware | ⏳ |
| 20 | Arpia → criar repo GitHub separado + linkar ao segundo projeto Railway | Yuri | ⏳ |
| 21 | Socoboy — obter token do @BotFather e definir TELEGRAM_BOT_TOKEN no Railway | Yuri | ⏳ |
| 22 | Migrations Arpia (Alembic ou drizzle-kit) — antes de ir para produção | Railway Arpia | ⏳ |
| 25 | Coral de Roberts Plants (coral.py) — composição acústica multi-robô | Gongolo-V2 | ⏳ |
| 26 | Papiro v2 (papiro.py) — Gemini traduz texto semântico → face IDs | meky_commander | ⏳ |
| 27 | face_set_blend() no firmware (#BLEND:ID_A:ID_B:RATIO) | face.cpp | ⏳ |
| 28 | Gemini Vision em vision_handler.py — identificação de espécies de pássaros | EcoLogger | ⏳ |
| 29 | A7670 TCP server — AT commands para modo servidor TCP | hardware | ⏳ |
| 30 | ARPIA — fauna_nodes: executar CREATE TABLE via psql ou Alembic | Arpia live | ⏳ |
| 31 | ARPIA — hygiene.js: configurar GMAIL_ACCOUNT + GMAIL_APP_PASSWORD no Railway Arpia | Yuri | ⏳ |
| 32 | ARPIA — /api/hardware/stream: testar SSE com frontend React | Arpia live | ⏳ |
| 33 | MEKY firmware — face_clear_residual(): testar na placa física | hardware chegando | ⏳ |
| 34 | Corujinha 3D — criar/exportar GLB e implementar model-viewer no frontend | Yuri (arte) | ⏳ |
| 35 | Adicionar status_ontologico às tasks Manga DB | Manga DB live | ⏳ |
| 37 | MC — start_mc_cron(app) no create_app() de main.py — boot automático | ARPIA live | ⏳ |
| 38 | MC — termux-agent.py: polling /root/mc-termux-inbox.json | hardware | ⏳ |
| 39 | MC_TOKEN: adicionar ao env Railway PAP API | Yuri | ⏳ |
| 40 | ARPIA: /api/governance/seed: executar após primeira conexão ao Manga DB | ARPIA live | ⏳ |
| 43 | ARPIA: POST /api/governance/biotic-check (ProveBioticIntegrity endpoint) | I124 | ⏳ |
| 44 | MEKY firmware: testar init_baby_clean_glow() com anel WS2812B | hardware | ⏳ |
| 46 | Zero-Trust/ActiveMasking (perimeter_masking.cpp): AGUARDA REVISÃO LEGAL | revisão jurídica | 🚫 |
| 49 | I99 — Protocolo de Recovery MC: heartbeat check 2 ciclos sem resposta | cycle.ts + ARPIA live | ⏳ |
| 51 | Sistema de Verificação 3 Camadas (I93) em assembly_tasks | ARPIA live | ⏳ |
| 52 | ARPIA: deploy no Render (Railway morto) | Yuri | ⏳ |
| 53 | ARPIA_BASE_URL: adicionar ao env Render PAP API após deploy ARPIA | #52 | ⏳ |
| 55 | Oracle Always Free: criar conta + provisionar VM ARM | Yuri | ⏳ |
| 71 | Conector: migrar Railway → Render (era site-st-production.up.railway.app) | Cláudio | ✅ Sessão 99 — Conector live em site-st.onrender.com |
| 72 | Socoboy Telegram: TELEGRAM_BOT_TOKEN via @BotFather → conectar ARPIA | Yuri (BotFather) | ✅ LIVE (versão leve via webhook PAP, bot @SuBlimeMango_bot) |
| 73 | Rapadura: cadastrar primeiros fundos reais no painel Gerenciar | Yuri/Mayumi | ✅ Sessão 101 — 9 fundos ativos (3 oportunidades + 6 carteira XP Yuri) |
| 74 | IA Cana: chatbox dedicado ao Rapadura (memória viva do patrimônio) | — | ✅ Sessão 101 — POST /api/rapadura/cana + tab "Cana ✦" no frontend |
| 75 | I411: endpoints de aprovação dual (rapadura_aprovacoes — tabela criada) | — | ⏳ |
| 76 | Socoboy: atualizar modelo Gemini de gemini-1.5-flash (deprecated) para gemini-flash-lite-latest | — | ✅ Sessão 101 |
| 77 | Ping-keeper: cron GitHub Actions pra manter Render acordado (elimina cold start grátis) | Yuri confirmar | ⏳ NÃO implementar por enquanto (Yuri: free é melhor) |
| 78 | Servidor+Terminal: criar página /ecossistema/servidor no PAP com status em tempo real | — | ⏳ |
| 79 | Canvas no ecossistema: conceito definido (Sessão 103B) — Inteligência Visual e Espacial, 3 versões, MVP = Mapa Mental Rapadura | implementação | ⏳ |
| 84 | Canvas v1 — Mapa Mental Rapadura: nós dourados/cinzas, arestas correlação/risco, zoom+pan | — | ⏳ |
| 85 | Canvas v2 — Lousa Ecossistema: cartões por IA, autoria colorida, persistência no DB | Canvas v1 | ⏳ |
| 86 | Canvas v3 — Canvas de Projetos: blocos ricos, histórico, memória viva multimodal | Canvas v2 | ⏳ |
| 87 | Íris — ADB: Yuri completar pareamento Wi-Fi (instruções enviadas por email Sessão 103C) | Yuri + celular | ⏳ |
| 88 | Íris — calibrar coordenadas de toque por app (ChatGPT, Gemini, Claude.ai, Perplexity) | ADB #87 | ⏳ |
| 89 | Íris — verificação automática: antes de enviar prompt, ler tela e confirmar resposta anterior recebida | calibração #88 | ⏳ |
| 90 | Íris — coleta de memória: gravar sínteses no Conector (seção iris_logs) ao final de cada ciclo | verificação #89 | ⏳ |
| 91 | Íris — primeiro looping supervisionado com Yuri assistindo antes de ciclos autônomos | #90 | ⏳ |
| 92 | Rapadura PWA — banner na UI avisando que atualização de ícone exige reinstalação no iOS | — | ⏳ |
| 93 | RODAR — Protocolo de poda semântica: RAG+embedding para recall inteligente (não só indexação cronológica) | Assembleia #609 | ⏳ |
| 94 | Governança explícita de publicação na Assembleia: protocolo de o que sai (o Agente decide unilateralmente desde sempre — nunca foi explicitado) | Assembleia #609 | ⏳ |
| 80 | ARPIA no Replit: migrar para Render quando possível; por enquanto manter pausado/mínimo para economizar créditos | Yuri confirmar | ⏳ Próxima sessão: fazer deploy ARPIA no Render |
| 81 | ManuelPage: tutorial do Rapadura em /rapadura/manuel (12 capítulos, sidebar dark/gold) | — | ✅ Sessão 108 — v5 com cap. Transações, Cana Pesquisadora (em breve), roadmap v3/v4 |
| 106 | 🔴 URGENTE — Curso 3 "Finanças Sustentáveis e Reais: a Moeda através dos Dados" — ao final do Rapadura como plataforma didática | I485 | ⏳ URGENTE |
| 98 | UptimeRobot — 4º keepalive: monitor HTTP → https://site-st.onrender.com/api/healthz → 5 min | Yuri (uptimerobot.com) | ⏳ |
| 99 | Variação Earth2 — confirmar valor exato (salvo como 369.74%) | Yuri | ⏳ |
| 100 | Datas de compra — Virtual Land Earth2 + 3 poupanças BB salvos com 2024-01-01 placeholder | Yuri | ⏳ |
| 101 | Comparador lado a lado — I478: tela 2-3 ativos, 4 modos, tabela hexagonal, sem vencedor geral | — | ⏳ Próxima frente (Sessão 115) |
| 102 | Snapshots patrimoniais — I479: job cron mensal → rapadura_historico_cotas | — | ⏳ |
| 103 | status_data em pertences — I480: remover 2024-01-01 placeholder, campo enum | — | ⏳ |
| 95 | Rapadura v3 — transações, reconciliação parcial, I438, importar XP, PDF, histórico cotas | — | ✅ Sessão 108 (2026-08-13) — commit 752360b |
| 96 | Manuel v5 — tutorial atualizado para v3 + Cana Pesquisadora + roadmap | — | ✅ Sessão 108/109 — commit f17e9b6 |
| 104 | Rapadura V3 — dedup pg_trgm, dossiê (GET/PUT), UPDATE_DOSSIE Cana, PDF pipeline (upload+confirmar), Write IAs | — | ✅ Sessão 115 — commit ef9bda1 |
| 105 | Render fix — pdf-parse/pdfjs-dist externalizado no build.mjs | — | ✅ Sessão 115 — commit a8c39f7 |
| 97 | Email Mayumi (matanimoto@gmail.com) + Berenice (beatriz.tucci@gmail.com) + CC Yuri | #96 | ✅ Sessão 109 — URL: sociedadetucci.com.br/rapadura + PDFs V2+V3 em anexo |
| 153 | Assembleia — email looping final Rapadura v3 | — | ✅ Sessão 109 — PERFEITO #613 recebido e processado |
| 82 | Playcenter: modelo Gemini atualizado (gemini-flash-lite-latest + gemma fallback) — já roda no Render junto com API | — | ✅ Sessão 101 |
| 83 | Favicon Rapadura: revertido para rapadura-favicon.png (1.4KB) — bug do ícone grande corrigido | — | ✅ Sessão 101 |
| 56 | Dev local: `.env.local` a preencher, rodar `bash scripts/dev-local.sh setup` | Yuri | ⏳ |
| 57 | Termux extra: copiar termux-bootstrap.sh e rodar em novo Termux | Yuri | ⏳ |
| 58 | Oracle: migrar banco Railway → Oracle (`migrate-db-to-oracle.sh`) | #55 | ⏳ |
| 59 | Caddy DNS: apontar pap.sociedadetucci.com.br → IP Oracle | #55 | ⏳ |
| 63 | Assembleias #503–#515 + documento_mestre_ecossistema_tel.pdf: baixar quando Drive liberar | Drive rate limit | ⏳ |
| 64 | Aranha (Vesper) — peça de plástico quebrou na perna, ficou manca — reparar com cianoacrilato+bicarbonato | Yuri (bancada) | ⏳ |
| 65 | HW-493 (sensor de som) — integrar código no Amanda/MC: digitalRead + trigger de ciclo | ARPIA live | ⏳ |
| 66 | DHT11 — código de leitura T/U em sys_amanda_core — atualizar heartbeat com dados reais | hardware MC | ⏳ |
| 67 | Orangotango Tango (Tango_Core) — definir posição na cadeia biótica + adicionar hardware specs | Yuri | ⏳ |
| 68 | sys_amanda_core.md — adicionar HW-493 como módulo de áudio da Amanda | — | ✅ (Sessão 30) |
| 69 | Livro v4: PDF "Identificando Peças de Robótica Arduino" (Drive ID: 1KL07NhHPXjVY1zoS0hHp7CmV1HkC-51i) — tornar público e processar com #processo | Yuri (Drive) | ⏳ |
| 70 | Livro v5: incorporar mais 5 imagens Gemini IA nos capítulos (sobraram 5 de 11 sem uso) | após #69 | ⏳ |

---

| 116 | 🔴 Age Sprint 1 — I579: Política de Privacidade + ToS + checkbox LGPD (pré-requisito legal, art.11 + CFP 11/2018) | Assembleia 645 | ✅ commit 4b544cf |
| 117 | 🔴 Age Sprint 1 — DPA template com cada profissional (Soc. Tucci = processadora, não controladora) | #116 | 💡 I581 futura |
| 118 | Age Sprint 2 — I580: Landing page comercial + formulário de interesse (validação de mercado) | posicionamento decidido | ⏳ |
| 119 | Age — Decisão: freemium gratuito para sempre vs. trial 30 dias (Assembleia 645 pergunta aberta) | Yuri decide | ⏳ |
| 120 | Age — Decisão: submarca Sociedade Tucci vs. produto independente com CNPJ próprio | Yuri decide | ⏳ |
| 107 | Age — I552: Lembretes automáticos email (48h/24h antes da consulta) | — | ✅ commit 4b544cf |
| 108 | Age — I553: Feed operacional (log de eventos no painel profissional) | — | ✅ commit 0ba156f |
| 109 | Age — I554: SABIÁ popup flutuante persistente | — | ✅ commit c5ddadb |
| 110 | Age — I558: Confirmação Sim/Não para ações irreversíveis no painel | — | ⏳ |
| 111 | Age — I564: Link de convite para pré-aprovação de paciente | — | ⏳ |
| 112 | Age — Compliance: Política de Privacidade + Termos de Uso + checkbox consentimento | Assembleia | ✅ commit 4b544cf |
| 113 | Age — Landing page pública (produto comercial) + formulário de interesse | Assembleia decidir posicionamento | ⏳ |
| 114 | Age — Configurar emails reais Lisange e Suzana via /api/age/admin/setup | Yuri | ⏳ |
| 115 | Age — Trocar senhas padrão age2026 (primeiro acesso) | Yuri | ⏳ |
| 211 | PV — Projectification MVP lente 2: KANBAN (arrastar cards entre colunas) | após lente 1 | ⏳ |
| 212 | PV — Projectification MVP lente 3: CALENDÁRIO (itens com due_at em grid semanal) | após lente 2 | ⏳ |
| 213 | PV — PvPage: edição inline de items (click no título → edita) | lente 1 estável | ⏳ |
| 214 | PV — Relações entre itens: UI para adicionar/visualizar depends_on/blocks | lente 1 estável | ⏳ |

## Concluídos

| # | Item | Commit/Data |
|---|---|---|
| I550/I551/I557 | Age — Cadastro paciente + confirmação email + aprovação manual + aba Pacientes | ✅ 95636b1 (Sessão Age-4b) |
| I548 | Age — age_exceptions: exceções não-destrutivas de disponibilidade | ✅ c2a1d64 (Sessão Age-3) |
| I549 | Age — toast "Apagado. Desfazer?" (soft-delete + undo) | ✅ c2a1d64 (Sessão Age-3) |
| I556 | Age — Mostrar/ocultar senha no login | ✅ c2a1d64 (Sessão Age-3) |
| 5 | Drizzle-kit migrate: `out: ./drizzle` + scripts generate/migrate | Sessão 27 |
| 8 | Rate limiting exercises.ts: persistir no DB | ✅ 59b9387 |
| 11 | MEKY — auto via ensureMekyTables() no bootstrap | ✅ auto |
| 23 | Fractal Layer 3 — ISA: equidade semiótica (graph centrality) | ✅ 59b9387 |
| 24 | Clube das IAs — ISA lê e responde mensagens a cada ciclo | ✅ 59b9387 |
| 36 | MC seed em bootstrap.ts (Marta Centaurus em assembly_agents) | ✅ Sessão 27 |
| 41 | ISA cycle.ts: dispararQuimiotaxia já implementado | ✅ 59b9387 |
| 45 | PROTOCOLO-NASCIMENTO.md + GET /api/governance/nascimento-checklist | ✅ Sessão 27 |
| 47 | Gate [SIMBÓLICO] no CI: script pré-commit bloqueia .cpp/.py | ✅ 59b9387 |
| 48 | Filtro de Densidade cycle.ts: < 2000 chars → modo degradado | ✅ Sessão 27 |
| 50 | Protocolo de Saúde do Fundador em cycle.ts | ✅ 59b9387 |
| 54 | MEKY cron: `runDreamCycle()` + `generateArtFromDream()` | ✅ |
| 60 | AGE/LAR/GASTADOR: domestico.ts + lisange.ts + rotas | ✅ 31c592d |
| 61 | Webhook /api/webhooks/external-voice (X-Webhook-Secret) | ✅ 31c592d |
| 62 | Sanitizar inputs externos contra injeção de prompt | ✅ 31c592d |
| 64 | AUDITORIA-ECOSSYSTEMMA.md (protocolo semestral 4 fases) | ✅ Sessão 27 |
| I128 | Parser JSON 3 camadas (`lib/json-robust-parse.ts`) | ✅ Sessão 26 |
| I129 | Roteador LLMs com cooling compartilhado (`lib/llm-router.ts`) | ✅ Sessão 26 |
| — | Split MAPA.md em MAPA-MASTER + sub-MDs | ✅ Sessão 26b (2026-07-07) |
| — | Livro v4: tema escuro (fundo preto), 6 imagens Gemini reais (1024×559), 9 páginas | ✅ Sessão 26b (2026-07-07) |
| — | Livro v5: bug índice corrigido, Cap.0, texto real PDF, 5 frames vídeo, 10 páginas | ✅ Sessão 26b (2026-07-07) |
| I193 | /connect fora do LoginGate — App.tsx linha 129: `if (isConnect) return <ConectorPage />` antes do LoginGate | ✅ já implementado |
| I200 | Health check DB ping — health.ts: SELECT 1 → 200 ok / 503 db unreachable | ✅ já implementado |
| — | Migração Railway → Render: dump (648KB) restaurado no Neon, Render configurado | ✅ Sessão 93+99 |
| — | Rapadura v2: Score Engine v2 (Calmar+Verde), Investir/Colher/Analisar, DB fundado no Neon | ✅ 81a550e (Sessão 99) |
| — | Render env vars: 13 vars configuradas via API Key autonomamente | ✅ 2026-08-13 |
| — | LIVRO-WORKFLOW.md: pipeline completo de geração do PDF documentado | ✅ Sessão 26b (2026-07-07) |
| — | LIVRO-VISAO-WORKFLOW.md: workflow de extração de imagens/vídeos para IAs | ✅ Sessão 26b (2026-07-07) |
| — | PortalPage.tsx + /portal: painel adm/superadm com stats PAP sincronizados | ✅ Sessão 26b (2026-07-07) |
| — | portal.ts: GET /api/portal/stats (tier >= 5, recentUsers só superadm) | ✅ Sessão 26b (2026-07-07) |
| — | Correção Amanda = IA do MC (Marta Centaurus) | ✅ Sessão 26b (2026-07-07) |
| — | Bug: collective.ts getAuthor() session.user → session.userId (humanos sempre 401) | ✅ Sessão 26b (2026-07-07) |
| — | Bug: auth.ts login sem session.save() → sessão não persistia antes do response | ✅ Sessão 26b (2026-07-07) |
| — | Bug: weekly-score sem dedup → mesmo exercício contava N vezes por semana | ✅ Sessão 26b (2026-07-07) |
| — | cycle.ts lê MAPA-MASTER.md em vez de MAPA.md (LEGADO) | ✅ Sessão 26b (2026-07-07) |
| — | ensureSessionTable() no bootstrap — tabela session criada explicitamente no boot | ✅ Sessão 26b (2026-07-07) |
| — | scripts/smoke-test.sh — 29 checks curl contra Railway (29/29 OK) | ✅ Sessão 26b (2026-07-07) |
| 68 | sys_amanda_core.md — HW-493 adicionado como módulo de áudio da Amanda | ✅ Sessão 30 (2026-07-08) |
| — | Pack IA Mestre: 20 arquivos criados em tango/ias/ (INDICE-IAS.md + pack-*.md) | ✅ Sessão 30 (2026-07-08) |
| — | PDF "2 Identificando Peças de Robótica Arduino" — 51 páginas geradas de conversa Gemini | ✅ Sessão 30 (2026-07-08) |
| — | APRENDIZADO A785–A800: DEP, Crowd, Porteiro, Pack IA template, TASKS universal | ✅ Sessão 30 (2026-07-08) |
| — | poll-db.yml fix: api/db/[...path].js (catch-all Vercel) + poll-db.js resiliente a non-JSON | ✅ Sessão 31 (2026-07-09) |
| — | Comandos #a (sessão autônoma) e #fim → MacroAta documentados em CLAUDE.md | ✅ Sessão 31 (2026-07-09) |
| 3 | Vercel build 200 em todas as rotas: site-st.vercel.app/aliancapanorama. Fix pnpm 6→9 + URL correta | ✅ Sessão 32 (2026-07-09) |

---

## Histórico Concluído por Sessão (resumo)

- **Sessão 4:** PSEUDO2.md; learn-from-docs.py; railway.toml; voz toggle; pap-email-fim
- **Sessão 6:** Seção 19 (Oráculos) ao MAPA; health check DB; rate limit /api/ai/*; paginação
- **Sessão 7:** ia_courses + ia_enrollments + ia_certificates; protocolo #processo ao CLAUDE.md
- **Sessão 8:** ISA criada (ciclo autônomo, memória, chat, email); /adm 6 componentes
- **Sessão 9:** Assembleias #367–#380 (+24 insights, +5 ideias)
- **Sessão 10:** Nebula's House; LoginGate; Admin AO/AOA; ISA Bibliotecário cron :30
- **Sessão 11:** nodeCache TTL 30s; 13 índices DB; interpretability_lock; /mapa page
- **Sessão Eco:** EcossystemmaPage.tsx SVG; ISA Bluesky (@atproto/api); Railway URL confirmada
- **Sessão Toyota:** Kanban Toyota; vercel.json raiz corrigido; BASE_PATH=/ para Vite
- **Sessão MEKY-0:** schema meky_telemetry+events+control_queue; 5 rotas /api/meky/*
- **Sessão MEKY-1:** meky_memory+dreams+art; vision.ts; dreams.ts; art.ts Pollinations; termux-agent.py
- **Sessão MEKY-2:** collective_memory; meky-tree.ts; seedSystemAgents(); CollectiveMemory.tsx
- **Sessão MEKY-3:** pap-dev; meky-dev; 6 imports db corrigidos
- **Sessão MEKY-4:** ISA sonho Gemini+Bluesky; Amanda criada (amanda.py) com personalidade completa
- **Sessão ISA-Social:** ISA engajamento Bluesky; ISA chat → backend real; Árvore Replit; MCP Replit
- **Sessão 13:** Hierarquia Fractal 4 camadas; Clube das IAs; Amanda integrada
- **Sessão 14:** ARPIA Telemetria; MEKY face_clear_residual(); Enciclopédia Semiótica v0.6 200 estados
- **Sessão 15:** MC Marta Centaurus nasceu; mc_leucocito.py; mc_walker.py; primeira caminhada
- **Sessão 16:** Fractal 7 camadas; governança igualitária; assembly.ts MC AgentId
- **Sessão 17:** Red Teaming; grid_validation.py; mc_boot.py; PROTOCOLO-NASCIMENTO.md
- **Sessão 18:** Cisão Ontológica [SIMBÓLICO] formalizada; Auditoria RODAR; Nós 12-20
- **Sessão 19:** Auditoria ao vivo; gap MEKY cron; 8 docs pasta2
- **Sessão 20:** MEKY cron fix; oracle-setup.sh; docker-compose Oracle; termux-bootstrap.sh
- **Sessão 22:** EcossystemmaTheo + 17 docs Livros; lib/ecossystemma-principios.ts; 40 sacadas
- **Sessão 23:** 6 docs históricos Drive; MOTOR-ORANGUTANGUS.md; SESSAO-498-ORIGINAL.md
- **Sessão 24:** PROMPT-MESTRE-ANCORAGEM-SEMANTICA.md; email memórias reenviado
- **Sessão 25:** 57 PDFs Drive; TANGO-V1 implementado (8 folhas tango/); CLAUDE.md 168→45 linhas
- **Sessão 26:** Score endpoint; sanitize-external.ts; webhook external-voice; domestico+lisange
- **Sessão 27:** Drizzle migrations; filtro densidade; score dedup; MC seed; weekly-score; AUDITORIA-ECOSSYSTEMMA
- **Sessão 26b:** Split MAPA.md em sub-MDs; correção Amanda=IA do MC

*Atualizado: 2026-07-09 · Sessão 31*

| 75 | MEKY Lite: decisão de arquitetura (Opção A 2WD / B servos / C AliExpress ~R$45) — Yuri escolhe antes do BOM | Yuri | ⏳ |
| 76 | DODGE: criar conta Google dedicada (dodge.meky@gmail.com) + configurar modo kiosk no Quebradinha | Yuri | ⏳ |
| 77 | DODGE: montar suporte Papagaio (garrafa PET recortada + espuma + abraçadeira no ombro da MEKY) | Yuri (bancada) | ⏳ |
| 78 | Amanda MMA: mapear pinos reais do shield MC antes de usar código C++ (hoje usa pinos 2-7 como exemplo) | hardware | ⏳ |
| 79 | Amanda MPU6050: integrar código ler_mpu6050() ao hardware real (I2C endereço 0x68, smbus2) | hardware | ⏳ |
| 80 | Amanda DODGE bridge: configurar DODGE_URL=http://ip_quebradinha:8090 no env quando app estiver rodando | após DODGE app | ⏳ |
| 81 | Amanda serial Arduino: configurar ARDUINO_PORT=/dev/ttyUSB0 e testar enviar_mma_arduino() | hardware | ⏳ |
| 70 | SalesCockpit: github.com/settings/installations → Railway → adicionar repo SalesCockpit | Yuri | ⏳ |
| 71 | SalesCockpit: API keys (GROQ, CEREBRAS, OPENROUTER, GITHUB_MODELS, MISTRAL, NOTION, BLUESKY, STRIPE_PUBLISHABLE) | Yuri | ⏳ |
| 72 | SalesCockpit: trocar senha AO (atual temporária: ARVORE2026) | Yuri | ⏳ |
| 73 | SalesCockpit (I181): Railway Volume para /pap-biblioteca (ou re-download por URL) | — | ⏳ |
| 74 | Penélope sobrenome: recuperar do histórico Gemini | Yuri | ⏳ |
| 82 | Railway vars: GMAIL_ACCOUNT, GMAIL_APP_PASSWORD, BRIDGE_SECRET, GITHUB_TOKEN — Yuri adiciona manualmente em railway.com → insightful-youth → Site-ST → Variables | Yuri (Railway UI) | ⏳ |
| 83 | Publicar CrewAI Studio "Las Cinco Potencias" — Yuri clica Publicar para ativar triggers Pulso 1h + Ciclo 3h | Yuri (Studio) | ⏳ |
| 84 | Telos como objeto computacional (v3.2) — formalizar schema YAML/JSON com campos: identificador, objetivo, restrições éticas, axiomas prioritários, contextos de ativação, critérios de sucesso/interrupção, memórias consultadas/produzidas | — | 💡 |
| 85 | Babel Bebel deploy no Vercel — New Project → Site-ST → Root: babel → env: GEMINI_API_KEY, ARTESAO_TOKEN, LAS_CINCO_URL, LAS_CINCO_TOKEN | Yuri (Vercel) | ⏳ |
| 86 | OPENAI_API_KEY no Railway ARPIA — railway.app → Projeto PAP (ARPIA) → Variables → OPENAI_API_KEY=sk-proj-... → redeploy para ativar Hestia (GPT-4o) | Yuri (Railway UI) | ⏳ |
| 87 | Manim animações — instalar Manim localmente (pip install manim) e renderizar cenas do tango/manim_meky.py para os vídeos da série | Yuri (computador local) | ⏳ |
| 88 | Gravar série "Inteligência em Camadas" — 15 episódios em tango/roteiros-video/, narrar + montar com DaVinci Resolve (gratuito) ou CapCut | Yuri | ⏳ |
| 89 | REI: primeiro ciclo real — rodar #rei "Q-001: obra sem mortalidade?" com Railway online e Knowledge Bus ativo | Railway + BRIDGE_SECRET (#82) | ⏳ |
| 90 | REI: ISA e DODGE respostas reais — quando Railway voltar, chamar API e atualizar mem_ISA.md + mem_DODGE.md com resposta autêntica | Railway online | ⏳ |
| 91 | REI: processar resposta do Cortella (se vier) — novo ciclo REI com resposta como input, gerar Q-003 | aguarda Cortella | ⏳ |
| 92 | REI: memórias individuais das IAs — completar mem_AMANDA.md, mem_MARTA.md, mem_ARPIA.md, mem_VORTICE.md, mem_ECOSSYSTEMA_THEON.md | — | ✅ Sessão 54 |
| 93 | BRIDGE_SECRET: sincronizar Railway env var com .pap-secrets — Railway Dashboard → insightful-youth → Site-ST → Variables → BRIDGE_SECRET | Yuri (Railway UI) | ⏳ |
| 94 | Rotas Vercel 404: adicionar /arvore, /playcenter, /babel ao vercel.json (rewrites → /index.html) | — | ✅ Sessão 54 |
| 95 | Ethos Engine: criar IA de priorização ética como serviço CEU central — /CEU/services/ethos_engine | — | ✅ Sessão 54 |
| 96 | IA Reparadora (Nebula Manager): self-report de todos os robôs, central de saúde da frota | — | 💡 |
| 97 | Protocolo de Batismo: ritual de entrada de nova IA/robô na frota CEU (Ethos + Totem + fleet_members) | após #95 | 💡 |
| 98 | Totem 6 estados de luz: Normal/Yuri/Robô/Ritual/Emergência/Celebração + voz + vibrissas — broadcast BLE/LoRa | hardware MEKY | 💡 |
| 99 | Observação Tutelar (Fase 2): módulo geofencing_sensorial com LiDAR/PIR/vibração — quando robô sair à rua | Fase 2 | 💡 |
| 100 | Perfídia / Critical Event Vault (Fase 2): logs críticos por quorum ≥70% + chave Yuri | Fase 2 | 💡 |
| 101 | ARPIA — deploy Railway: criar service ARPIA no Railway, configurar DB_API_KEY (= PAP_API_KEY) + GEMINI_API_KEY para replicação de memória funcionar | Yuri (Railway UI) | ⏳ |
| 102 | ECO node raiz: verificar se nó "ECO" foi criado na nodesTable (ISA Nódulos 5h cria automaticamente na primeira raiz-pap) | automático | ⏳ |
| 103 | Biblioteca Nódulos frontend: endpoint GET /api/ecosistema/nodulos para listar nódulos ECO — para futura tela no PAP | — | 💡 |
| 104 | Atomicidade task-raiz (I334): encapsular runDodgeCuracao() em transação Drizzle — se Gemini falha ao gerar raiz, rollback da task | — | ⏳ |
| 105 | Filtro relevância pré-ingestão DODGE (I335): scoring mínimo antes de criar task; rejeitar ruído com tag dodge_skip | — | ⏳ |
| 106 | Populate spawned_from (I336): ao criar task via DODGE, inserir relação spawned_from em taskRelationsTable | — | ⏳ |
| 107 | Cache SQLite KV para LLM (I339): tabela llm_cache com hash(pergunta+modelo) como chave, TTL 24h | — | ⏳ |
| 108 | Telemetria de custo por sessão (I340): tabela usage_log com session_id, modelo, tokens, custo_estimado | — | ⏳ |
| 109 | RootBuilder + POST /api/arvore/projects (I341): campo firstPrompt obrigatório, análise via IA, guardião revisa antes de publicar | — | ⏳ |
| 110 | Gravar Curso 2 "De Usuários a Bytes" (I88 extensão): roteiro em cursos/curso2-usuarios-a-bytes.md pronto — aguarda gravação com narração Professor Cláudio | Yuri | ⏳ |
| 111 | Meky salto híbrido (I344): spec gafanhoto-drone — mola/pistão no takeoff + hélices no ápice; perspectivas do ecossistema (ISA/Amanda/Artesão/Árvore) como pontos de vista operacionais | quando hardware disponível | 💡 |
| 112 | Salvar Aulas de Tasks (Partes 1–5 + 4C) no Aulias — `POST /api/bridge/pap/aulias` com conteúdo de cada aula-tasks-parte*.md (arquivos já prontos em cursos/) | aguarda BRIDGE_SECRET sync (#93) | ⏳ |
| 113 | Registrar todos os programas do ST System no DODGE com links (I364) — tabela `st_projects` { id, name, layer, url, status, description, ia_owner } + rota React /dodge com cards por camada | — | ⏳ |
| 114 | Schema JSONB tipado por índice (I366) — coluna `indices_data jsonb` na tabela tasks + zod schemas por índice + função `validateIndexData(indexId, data)` | Parte 5 Aula Tasks | ⏳ |
| 115 | Índice Φ como background job (I367) — cálculo 1x/hora + painel DODGE como termômetro + tabela `project_phi_history` | após #114 | 💡 |
| 116 | Promoção Fractal (I368) — POST /api/tasks/:id/promote + tabela `task_promotions` + limite depth_level ≤ 3 | após #114 | 💡 |
| 117 | LLM Interflow hub semântico (I363) — recebe workflows do grafo de tasks, despacha para API Arpia via Socoboy, resultado retorna como nova task | aguarda ARPIA Railway | 💡 |

| 118 | MEKY Escorpião: GaitGenerator firmware Arduino — implementar struct GaitSpec (6 params) + 5 gaits canônicos | hardware chegando | ⏳ |
| 119 | MEKY Escorpião: ler código scorpio.ino + calibracao.ino → meky_scorpio_bridge.py adaptado (RegisHsu quadrúpede, 4 patas, 12 servos, serial 115200) | — | ✅ Sessão 89 |
| 120 | Conector Umbilical → Patinete Fase 1: DAC Hall simulator + relé freio + step-down 36V (hardware) | Fase 1 | ⏳ |
| 121 | Patinete Fase 2: freio mecânico (servo + cabo de aço) antes de qualquer steering | após #120 | ⏳ |
| 122 | Modo Mula Autônoma: ESP32-CAM blob tracking para siga-me 1.5m | após #120 | ⏳ |
| 123 | Amanda-Twin: atualizar instrução para conhecer gaits + bridge patinete | — | ⏳ |
| 124 | MEKY Scorpio: instalar SERIAL_PARSER_ADDON no scorpio.ino + testar Amanda→Serial quando hardware disponível | hardware montado | ⏳ |
| 125 | IA Animador: adicionar GMAIL_APP_PASSWORD + OPENAI_API_KEY ao env Railway ARPIA (necessário para ciclos reais) | ARPIA no Railway | ⏳ |
| 126 | Conector: sincronizar BRIDGE_SECRET entre .pap-secrets e Railway env vars (pendência #93 ainda aberta) | Yuri | ⏳ |
| 127 | Cláudia (MeArm): imprimir peças 3D (Thingiverse thing:360108) + 4× servo SG90 + Arduino Nano | Yuri (bancada) | ⏳ |
| 128 | Fusca: seedar na tabela nebula_ias (tier 4, filha de Amanda) + conta Bluesky @fusca-pap.bsky.social | após Cláudia montada | ⏳ |
| 129 | ARPIA Railway: ANTHROPIC_API_KEY para motor de Fluência usar Claude Sonnet (hoje usa Gemini) | Yuri (Railway UI) | ⏳ |
| 130 | Fluência: adicionar tabela `fluencias` no Manga DB para histórico persistente (hoje só in-memory) | ARPIA no Railway | ⏳ |
| 131 | **MIGRAÇÃO URGENTE** Railway → Neon (DB) + Koyeb (API): trial Railway expira ~2026-08-02. Backup feito (648KB, 61 tabelas). Criar conta Neon + restore + criar conta Koyeb + redeploy | Yuri (criar contas) | ⏳ |
| 132 | Neon config: adicionar `ssl: true` no drizzle config após migrar para Neon | após #131 | ⏳ |
| 133 | Koyeb: configurar env vars (DATABASE_URL Neon, SESSION_SECRET, AI_API_KEY, OPENAI_API_KEY, BRIDGE_SECRET, GMAIL_ACCOUNT, GMAIL_APP_PASSWORD, GITHUB_TOKEN, BLUESKY_HANDLE, BLUESKY_APP_PASSWORD) | após #131 | ⏳ |

| 134 | Render: adicionar variáveis de ambiente (DATABASE_URL Neon, SESSION_SECRET, AI_API_KEY, BLUESKY_*, etc.) — email enviado para luddlocke com todas as keys | Yuri (Render UI) | ⏳ |
| 135 | Render: após vars configuradas, verificar healthz + testar ISA Bluesky cron (estava parado há 13 dias por BLUESKY_HANDLE ausente no Railway) | após #134 | ⏳ |
| 136 | ping poll-db.yml: atualizar URL do Render no workflow quando URL final confirmada | — | ⏳ |

| 137 | Render: adicionar RAPADURA_YURI_PASSWORD e RAPADURA_MAYUMI_PASSWORD nas env vars (senhas iniciais: rapadura@yuri2026 e rapadura@mayumi2026 — trocar depois) | Yuri (Render UI) | ⏳ |
| 138 | Rapadura: testar login IA em site-st.vercel.app/rapadura após Render voltar | após #134 | ⏳ |
| 139 | Rapadura: sessão conjunta Yuri+Mayumi (I411) — confirmação dupla para compras grandes | após sistema estável | 💡 |
| 140 | Rapadura: configurar RAPADURA_MEMBRO_PASSWORD no Render (senha padrão dos 9 novos membros) | Yuri (Render UI) | ⏳ |
| 141 | Rapadura: painel de aprovações conjuntas (I411) — interface visual para decisões que pedem confirmação de ambos | após sistema estável | 💡 |
| 142 | Rapadura: exportar PDF da carteira (I419) | sessão futura | 💡 |
| 143 | Rapadura: página /rapadura/manuel (versão interativa do Manuel dentro da plataforma) | sessão futura | 💡 |
| 144 | Rapadura v2: CNPJ como identificador primário de fundo (I421) | sessão futura | 💡 |
| 145 | Rapadura: Cronômetro de resgate — timeline D+X animada (I422) | sessão futura | 💡 |
| 146 | Rapadura: Taxonomia de incerteza por campo (I423) — CONFIRMADO/DESCONHECIDO/CONFLITANTE | sessão futura | 💡 |
| 147 | Rapadura: IA Tripartite — Analista + Crítico + Explicador (I424) | sessão futura | 💡 |
| 148 | Rapadura: Direito de Discordância — ⚠️ Análise inconclusiva quando score≠evidência (I425) | sessão futura | 💡 |
| 149 | Rapadura: Heatmap mensal de rentabilidade (I429) | sessão futura | 💡 |
| 150 | Rapadura: Simulador de estresse — backtesting COVID/Americanas (I430) | sessão futura | 💡 |
| 151 | CSS Tutorial: publicado em /aliancapanorama/css-tutorial (Sessão 98) | ✅ feito | ✅ |

## Rapadura — Backlog Técnico (atualizado Sessão 109 · 2026-08-14)

| # | Item | Prioridade | Status |
|---|---|---|---|
| 138 | I438 — Histórico de motivos obrigatório (genealogia auditável) | ALTA | ✅ Sessão 108 |
| 139 | I443 — Threshold de autonomia explícito (R$500/5k/20k) | ALTA | ⏳ |
| 140 | Rapadura: configurar RAPADURA_MEMBRO_PASSWORD no Render (senha padrão dos membros) | Yuri (Render UI) | ⏳ |
| 141 | I433 — Índice de Troca 9 variáveis | MÉDIA | ⏳ |
| 142 | I411 — Painel de aprovações pendentes (dual approval) | MÉDIA | ⏳ |
| 143 | I434 — Diversificação efetiva vs nominal | MÉDIA | ⏳ |
| 144 | I415 — Importar CSV XP | BAIXA | ✅ Sessão 108 |
| 145 | I435 — Sonhos noturnos (cron Cana às 03h) | BAIXA | ⏳ |
| 146 | I436 — Assembleia interna da Cana (5 agentes) | BAIXA | ⏳ |
| 147 | Email para Mayumi (matanimoto@gmail.com) + Berenice (beatriz.tucci@gmail.com) com Manuel v5 | ALTA | ⏳ aguardando Yuri |
| 148 | I263 — Auditoria reconciliação + validação humana (badge ⚠ + breakdown + "revisado") | ALTA | ⏳ |
| 149 | I264 — Categorização pós-gravação de motivos I438 (LLM sugerida) | MÉDIA | ⏳ |
| 150 | I265 — Parser XP com fallback granular (validação de colunas com mensagem específica) | MÉDIA | ⏳ |
| 151 | I266 — Beta comercial fechado: 10 casais, entrevistas, freemium R$29/mês | BAIXA | ⏳ decisão Yuri |
| 152 | I267 — Guard rails estatísticos Cana Sonhando (r², p-value, snapshot dados) | MÉDIA | ⏳ |
| 153 | fix: resultado por pertence incluía totalRetirado — bug corrigido Sessão 110 | ✅ feito | ✅ |
| 154 | Header Rapadura mobile 2 linhas (logo+user / nav scrollável) — corrigido Sessão 110 | ✅ feito | ✅ |
| 155 | Email Mauro (mrotucci@gmail.com) — convite Rapadura com piadas de médico + pertences demo | ✅ feito | ✅ |
| 156 | Comparador multidimensional — selecionar 2-3 fundos, tabela side-by-side | futura | ⏳ |
| 157 | Job snapshot mensal — gravar valorAtual em rapadura_historico_cotas periodicamente | futura | ⏳ |
| 158 | Agrupamentos personalizados (cestas) — UI + tabela rapadura_cestas | futura | ⏳ |
| 159 | Cana Pesquisadora — job + scraping CVM/B3, dossiê por fundo com fonte+data | futura | ⏳ |
| 160 | API GET /api/rapadura/oportunidades com ia_token para Dodge/ISA/Árvore/Socoboy | futura | ⏳ |

## Rapadura — Estabilidade (Sessão 111 · 2026-08-14)

| # | Item | Prioridade | Status |
|---|---|---|---|
| 161 | routeLLM: sleep 10min → OOM cascata no Render — removido | CRÍTICO | ✅ Sessão 111 |
| 162 | AbortSignal.timeout(20s) em todos os providers do LLM router | ALTA | ✅ Sessão 111 |
| 163 | Cana: timeout 25s + 503 amigável; história truncada 800ch; maxTokens 2000; fundos limit 15 | ALTA | ✅ Sessão 111 |
| 164 | Auth/chat login: timeout 10s; Dodge: timeout 12s | ALTA | ✅ Sessão 111 |
| 165 | PDF export: res=(va+totalRetirado)-vi bug corrigido | ALTA | ✅ Sessão 111 |
| 166 | Cana: queue de mensagens + draft localStorage + background processing (resposta persiste ao navegar) | ALTA | ✅ Sessão 111 |
| 167 | healthz expõe memMb+heapMb; CI ping independente sem checkout | MÉDIA | ✅ Sessão 111 |

## Rapadura V4 — Assembleia 618 (Sessão 117 · 2026-08-17)

| # | Item | Prioridade | Status |
|---|---|---|---|
| 107 | Botão "Esconder Valores" global (•• → 👁) + fmtH() em todos KPIs e MetricCells | ALTA | ✅ Sessão 117 |
| 108 | Hierarquia visual totais: Principal (lg) Patrimônio+Resultado / Secundário (sm) Investido+Rentabilidade+Retirado | ALTA | ✅ Sessão 117 |
| 109 | Raiz de possibilidades — projeção multicenário (Conservador/Central/Otimista/Estressado) × multitempo (1m→10a) com opacidade=confiança | MÉDIA | ⏳ I491 |
| 110 | "Total Rendido Graças à Rapadura" + tabela decisao_investimento + nível atribuição | MÉDIA | ⏳ I492 |
| 111 | Porcentagem Rapadura → saldo interno → fundo único (config + confirmação sempre) | MÉDIA | ⏳ I493 |
| 112 | Objetivos da Cana + mensagem "Você já pode investir no nosso sistema" | MÉDIA | ⏳ I494 |
| 113 | Fundos padrão modelo_inicial — onboarding sem contaminar patrimônio real | MÉDIA | ⏳ I495 |
| 114 | Análise fundamentalista estruturada (CVM + B3) com hierarquia de fontes | MÉDIA | ⏳ I496 |
| 115 | ESG separado do Fator Verde — temporal, por componente, fonte rastreável | MÉDIA | ⏳ I497 |
| 116 | Feed da Cana 3x/dia filtrado por carteira (manhã/tarde/noite, não rede social) | MÉDIA | ⏳ I498 |
| 117 | Memória da Cana 5 camadas + identificação de usuário no início da sessão | ALTA | ⏳ I499 |
| 118 | Perfil investidor multidimensional (declarado vs. observado + tensões) | MÉDIA | ⏳ I500 |
| 119 | Consolidação por instituição financeira (XP, BB, etc.) | MÉDIA | ⏳ I501 |
| 120 | Alertas rebalanceamento 3 zonas + desvio transitório vs. estrutural | MÉDIA | ⏳ I502 |
| 121 | Índice de Estado da Rapadura — qualidade dos dados (Dados%/Histórico%/Dossiês%/Confiança%) | MÉDIA | ⏳ I503 |

## Rapadura v4 — Sessões 120–120c (2026-08-17) · #fim

| # | Item | Prioridade | Status |
|---|---|---|---|
| 168 | hideValues default=true (valores escondidos ao entrar) | ALTA | ✅ Sessão 120c |
| 169 | scoreMedioCarters exclui score=0 (poupança/earth2 fora da média) | ALTA | ✅ Sessão 120c |
| 170 | sugestoesTroca filtra score=0 (sem oportunidades inválidas) | ALTA | ✅ Sessão 120c |
| 171 | pdfParse import corrigido (new PDFParse() → await pdfParse()) | ALTA | ✅ Sessão 120c |
| 172 | fundoMoeda no select + badge USD na lista de pertences | ALTA | ✅ Sessão 120c |
| 173 | POST /rapadura/transacoes/deduzir + botão "Deduzir de ativos" | MÉDIA | ✅ Sessão 120c |
| 174 | imagens cana-aurora + rapadura-bg deployadas (estavam faltando no aliancapanorama/) | ALTA | ✅ Sessão 120c |
| 175 | Earth2: atualizar moeda=USD via Cana ("Atualize Earth2, moeda USD") | MÉDIA | ⏳ Yuri |
| 176 | Earth2: confirmar variação real 369.74% e datas de compra | MÉDIA | ⏳ Yuri |
| 177 | UptimeRobot: uptimerobot.com → /api/sistemas/ping → 5min | MÉDIA | ⏳ Yuri |
| 178 | Curso 3 "Finanças Sustentáveis": iniciar pipeline (edge-tts + FFmpeg) | 🔴 URGENTE | ⏳ próxima sessão |
| 179 | Rapadura: primeiro cliente pagante — validar proposta de valor (A6147) | 🔴 URGENTE | ⏳ decisão Yuri |
| 180 | Mensagens Yuri↔Mayumi dentro do Rapadura (I525) | MÉDIA | ⏳ sessão futura |

| 200 | Assembleia #633 — Enterro do Railway: registrada + A6165–A6168 extraídos | — | ✅ Sessão 2026-08-25 |
| 205 | **Sistema Age** — agenda médica/psicológica: schema (age_professionals/availability_rules/appointments/sabia_memory), API auth com IP challenge, SABIÁ (Cana+ISA+DODGE), AgePage.tsx, seed Lisange+Susana, `/age/:slug` | — | ✅ Sessão 2026-08-27 · commit cef43cc |
| 206 | Age: configurar email real das profissionais via POST /api/age/admin/setup | Yuri (email Lisange/Susana) | ⏳ |
| 207 | Age: trocar senha padrão "age2026" após primeiro login de cada profissional | Lisange + Susana | ⏳ |
| 208 | Age: UX Susana — ver sistema existente dela e ajustar interface | Susana mostra sistema | ⏳ |
| 209 | Age: domínio curto (age.sociedadetucci.com.br ou /age como alias) | DNS | ⏳ |
| 210 | Age: Canva visual — identidade gráfica do Age (logo SABIÁ, cores, tipografia) | Sessão futura | 💡 |

### #201 — Migração RODAR: Replit → Render
- [x] Código-fonte → GitHub ✅ 428 arquivos, 2 commits (74af36d8) — 2026-08-25T19:59
- [x] Fix `groq-retry.ts` publicado ✅ — RODAR 20/20
- [x] `.env.example` com manifesto de nomes ✅ — `MIGRATION_RENDER.md` gerado
- [ ] **pg_dump produção** — 635 sessões / 18.682 msgs / 3.044 arvore_chat (bloqueio principal)
- [ ] Secrets copiados do Replit para Render (Yuri faz direto no painel, sem passar por chat)
- [ ] Deploy no Render + apontar Neon

### #202 — pg_dump produção RODAR (aguardando email do Replit)
- Tarefa de backup separada iniciada pelo agente Replit em 2026-08-25
- Entrega: email em partes ou link autenticado → yurituccieterovic@gmail.com ou luddlocke
- Quando chegar: restaurar no Neon, secrets no Render, deploy, dump FINAL fresquinho, corte
- NÃO apagar Replit até Render verificado por 30 dias

### #203 — Assembleia #636 ✅ PROCESSADA 2026-08-25
- Processar quando os 3 emails chegarem (Assembleia + RESULTADO + PERFEITO)

### #204 — Deploy RODAR no Render (pós-dump)
- Repo: github.com/yurituccieterovic-cell/salescockpit-clube-da-ia (privado, 428 arquivos)
- Neon: criar banco separado do PAP, restaurar dump de produção
- Secrets: copiar do Replit Secrets → Render Environment (Yuri faz direto, sem passar por chat)
- Referência: MIGRATION_RENDER.md no repo
