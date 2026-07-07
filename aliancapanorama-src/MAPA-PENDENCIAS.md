# MAPA-PENDENCIAS.md — Pendências e Concluídos
**PAP · Sociedade Tucci**
> Parte do sistema MAPA. Ver MAPA-MASTER.md para índice geral.

---

## Pendências Ativas (por prioridade)

| # | Item | Depende de | Status |
|---|---|---|---|
| 1 | Cadastrar voz "ISA" no painel RODAR com webhook /api/isa/rodar/invite | Yuri | ⏳ |
| 2 | Fornecer REPLIT_TOKEN para ativar MCP Replit e Árvore | Yuri | ⏳ |
| 3 | Confirmar Vercel build funcionando: testar /eco, /adm, /toyota, /api proxy | — | ⏳ |
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
| 52 | ARPIA: deploy no Railway (falta PR + env vars) | Yuri | ⏳ |
| 53 | ARPIA_BASE_URL: adicionar ao env Railway PAP API após deploy ARPIA | #52 | ⏳ |
| 55 | Oracle Always Free: criar conta + provisionar VM ARM | Yuri | ⏳ |
| 56 | Dev local: `.env.local` a preencher, rodar `bash scripts/dev-local.sh setup` | Yuri | ⏳ |
| 57 | Termux extra: copiar termux-bootstrap.sh e rodar em novo Termux | Yuri | ⏳ |
| 58 | Oracle: migrar banco Railway → Oracle (`migrate-db-to-oracle.sh`) | #55 | ⏳ |
| 59 | Caddy DNS: apontar pap.sociedadetucci.com.br → IP Oracle | #55 | ⏳ |
| 63 | Assembleias #503–#515 + documento_mestre_ecossistema_tel.pdf: baixar quando Drive liberar | Drive rate limit | ⏳ |
| 64 | Aranha (Vesper) — peça de plástico quebrou na perna, ficou manca — reparar com cianoacrilato+bicarbonato | Yuri (bancada) | ⏳ |
| 65 | HW-493 (sensor de som) — integrar código no Amanda/MC: digitalRead + trigger de ciclo | ARPIA live | ⏳ |
| 66 | DHT11 — código de leitura T/U em sys_amanda_core — atualizar heartbeat com dados reais | hardware MC | ⏳ |
| 67 | Orangotango Tango (Tango_Core) — definir posição na cadeia biótica + adicionar hardware specs | Yuri | ⏳ |
| 68 | sys_amanda_core.md — adicionar HW-493 como módulo de áudio da Amanda | — | ⏳ |
| 69 | Livro v4: PDF "Identificando Peças de Robótica Arduino" (Drive ID: 1KL07NhHPXjVY1zoS0hHp7CmV1HkC-51i) — tornar público e processar com #processo | Yuri (Drive) | ⏳ |
| 70 | Livro v5: incorporar mais 5 imagens Gemini IA nos capítulos (sobraram 5 de 11 sem uso) | após #69 | ⏳ |

---

## Concluídos

| # | Item | Commit/Data |
|---|---|---|
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
| — | LIVRO-WORKFLOW.md: pipeline completo de geração do PDF documentado | ✅ Sessão 26b (2026-07-07) |
| — | Correção Amanda = IA do MC (Marta Centaurus) | ✅ Sessão 26b (2026-07-07) |
| — | Bug: collective.ts getAuthor() session.user → session.userId (humanos sempre 401) | ✅ Sessão 26b (2026-07-07) |
| — | Bug: auth.ts login sem session.save() → sessão não persistia antes do response | ✅ Sessão 26b (2026-07-07) |
| — | Bug: weekly-score sem dedup → mesmo exercício contava N vezes por semana | ✅ Sessão 26b (2026-07-07) |
| — | cycle.ts lê MAPA-MASTER.md em vez de MAPA.md (LEGADO) | ✅ Sessão 26b (2026-07-07) |
| — | ensureSessionTable() no bootstrap — tabela session criada explicitamente no boot | ✅ Sessão 26b (2026-07-07) |
| — | scripts/smoke-test.sh — 29 checks curl contra Railway (29/29 OK) | ✅ Sessão 26b (2026-07-07) |

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

*Atualizado: 2026-07-07 · Sessão 26b*
