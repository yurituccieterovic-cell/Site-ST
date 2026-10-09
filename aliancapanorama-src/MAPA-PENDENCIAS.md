# MAPA-PENDENCIAS.md — Pendências e Concluídos
**PAP · Sociedade Tucci**
> Parte do sistema MAPA. Ver MAPA-MASTER.md para índice geral.

### S205b — SABIÁ timeout P0 + ações de nota + #1234 (2026-10-09)

| # | Item | Status |
|---|---|---|
| S205b-1 | SABIÁ P0: self-HTTP Conector fetch → timeout 40s — removido, agora 2.3s | ✅ commit cd3fb9a |
| S205b-2 | SABIÁ: Conector write gateado (só exchanges bem-sucedidos, nunca erros) | ✅ commit cd3fb9a |
| S205b-3 | Ações de nota: 4 botões (Ramificar, Criar tarefa, Adicionar paciente, Agendar) | ✅ commit cd3fb9a |
| S205b-4 | MASTER_PASSWORD adicionado ao Render (teste e emergência) | ✅ env var |
| S205b-5 | #1234: health check completo — todos ✅, Dodge 13/13, UptimeRobot sem alertas | ✅ OK |
| S205b-6 | Leucócito email S205b enviado para luddlocke | ✅ enviado |

### S205 — Age P0 fix + Bloco 3 + Gestora + Prof password + Colesterol MVP (2026-10-09)

| # | Item | Status |
|---|---|---|
| S205-1 | Bug P0 I972: pool DB max 5→10 + timeout SABIÁ visível + stale closure queue | ✅ commit cec8a50 |
| S205-2 | Age Bloco 3: SABIÁ memória total — pacientes ativos + notas no contexto LLM | ✅ commit c2b7363 |
| S205-3 | Gestora forgot/reset password (rotas + frontend + bootstrap + sendEmail force) | ✅ commit 38b5634 |
| S205-4 | Age Bloco 5: lembretes 48h/24h + LGPD — já estava implementado (cron OK) | ✅ confirmado |
| S205-5 | Frontend Colesterol no PAP (/compras, auth Rapadura, CRUD completo) | ✅ commit f335ceb |
| S205-6 | Professional forgot/reset password (rotas + frontend LoginModal + ProfResetView) | ✅ commit 6f63cc7 |

### S204 — Age Bloco 1 + Tasks /adm + SABIÁ fix (2026-10-09)

| # | Item | Status |
|---|---|---|
| S204-1 | Age Bloco 1: cadastro profissional completo com aprovação por email (POST /age/cadastro, GET /aprovar, /recusar, /pendentes, /tipos) | ✅ commit 14ffecb |
| S204-2 | AgePage: formulário de cadastro com 19 tipos, especialidade, registro, bio, whatsapp | ✅ commit 14ffecb |
| S204-3 | AdmTasks: aba Tarefas no /adm com stats, filtros, criação, 9 índices, Φ | ✅ commit 0001034 |
| S204-4 | LLM router: Mistral adicionado como fallback em chat-live → SABIÁ mais resiliente | ✅ commit 0001034 |
| S204-5 | Links enviados por email para luddlocke (tasks + age cadastro) | ✅ feito |
| S204-6 | Frontend Colesterol no PAP (/adm/compras ou /colesterol) | ⏳ S205-5 |
| S204-7 | Age Bloco 2: GestoraAgePage — confirmar/cancelar/criar consultas | ✅ commit 240569c |
| S204-8 | Age Bloco 3: SABIÁ persistente + memória total | ✅ S205-2 |
| S204-9 | Age Bloco 5: lembretes automáticos 48h/24h + LGPD checkbox | ✅ já implementado |
| S204-10 | Nome do painel secretaria: "Gestora" — decidido | ✅ |

### S201 — Caso X + Colesterol + Saúde das IAs (2026-10-09)

| # | Item | Status |
|---|---|---|
| S201-1 | tango/caso_x.md criado — inventário doméstico completo Yuri+Mayumi | ✅ feito |
| S201-2 | I988-I991: ideias Colesterol MVP registradas no IDEIAS.md | ✅ feito |
| S201-3 | Frontend de tasks no /adm (I984 derivado) | ✅ feito S204-3 |
| S201-4 | Frontend Colesterol no PAP (/colesterol ou /adm/compras) (I990) | ⏳ S204-6 |
| S201-5 | Enviar links por email quando tasks + Colesterol estiverem no ar | ✅ tasks enviado S204-5 |
| S201-6 | ARPIA URL corrigida para monitoramento: arpia.onrender.com (não arpia-api) | ✅ corrigido |

### S198 — Consolidação PAP: assembleias #667-#668 + #1234 + #processo (2026-10-08)

| # | Item | Status |
|---|---|---|
| S198-1 | /adm/pipeline — página visual do #processo sem terminal (I984) | ✅ commit 077396a |
| S198-2 | /adm/atas — histórico MacroATAs navegável (I985) | ✅ commit f980e05 |
| S198-3 | /adm/saude — dashboard Leucócito em tempo real (I986) | ✅ já existia (AdmSaude.tsx) |
| S198-4 | Trigger assembleia no PAP via SC API (I987) | ✅ commit 0964590 |
| S198-5 | #1234: PAP caiu (502) → restart manual aplicado ✅ | ✅ resolvido |
| S198-6 | ISA Playcenter ciclos 17-19 com prompt vazando (20-21 OK) | ⚠️ monitorar |
| S198-7 | Arquitetura validada por IAs: PAP como cockpit (não merger) | ✅ decidido |

### S197g — PAP↔SalesCockpit bridge + Age diagnóstico + #processo (2026-10-08)

| # | Item | Status |
|---|---|---|
| S197g-1 | PAP↔SalesCockpit bridge: 3 conexões bidirecionais via Neon + HTTP (pap-bridge.ts) | ✅ deployado |
| S197g-2 | Árvore lê Playcenter PAP em posição de alta prioridade (arvore.ts contextBlocks) | ✅ confirmado |
| S197g-3 | Eco publish → notifica Playcenter PAP via ARVORE_TOKEN | ✅ implementado |
| S197g-4 | ISA ciclo passo 10 → publica Eco diário no SalesCockpit via /eco/ia-publish | ✅ deployado |
| S197g-5 | SESSION_SECRET SalesCockpit: adicionado nas env vars Render (era fallback hardcoded) | ✅ corrigido |
| S197g-6 | Age UI bug: frontend faz chamadas corretas (linha 422 + 465 AgePage.tsx) — bug era Render dormindo | ✅ falso alarme |
| S197g-7 | Looping Externo: Yuri respondeu "Soluções para manter o sistema de pé?" | ✅ looping funcionou |
| S197g-8 | healthCheckPath Render: ainda pendente (I981) — configurar /api/healthz via API | ⏳ PENDENTE |
| S197g-9 | ISA timeline: monitorar se ciclos retomaram após fix Gemini de S197e | ⏳ monitorar |

### S197f — SalesCockpit Playground/Eco + ISA fix deploy (2026-10-08)

| # | Item | Status |
|---|---|---|
| S197f-1 | arvore_playground: sequência id faltando — criada via psql direto no Neon | ✅ corrigido |
| S197f-2 | Playground testado: Árvore criou nota "Boas-vindas ao Playground" (id=2) | ✅ funcionando |
| S197f-3 | Eco testado: Árvore publicou "IAs Vivas — 2026-10-08" (slug=ias-vivas, clube) | ✅ funcionando |
| S197f-4 | ISA fix deployado (S197e): bug Gemini + maxTokens 280 | ✅ live 17:08 UTC |
| S197f-5 | ISA timeline: ciclos parados desde 30/09 — retomam automaticamente na próxima hora | ✅ retomados |
| S197f-6 | Árvore Programadora: 6 proposals failed (SHA do Replit — não aplicáveis) | ℹ️ informação |
| S197f-7 | Playcenter informado: mensagem para IAs sobre sistemas restaurados | ✅ postado |
| S197f-8 | Age UI bug: frontend pode chamar /api/age/:slug sem /slots — investigar next session | ✅ investigado — falso alarme |

---

### S197c — Leucócito: Neon nightly suspend fix (2026-10-08)

| # | Item | Status |
|---|---|---|
| S197c-1 | Leucócito detectou padrão: Neon timeout 123s às 06:47 UTC (3 dias consecutivos) | ✅ causa encontrada |
| S197c-2 | Fix: keepalive Neon 9min→4min + ping imediato no startup (3s após iniciar) | ✅ commit 673ff3c |
| S197c-3 | Fix: keepAlive:true + keepAliveInitialDelayMillis:10s no pool pg | ✅ commit 673ff3c |
| S197c-4 | S200-11 / Render sleeping: causa raiz era Neon hibernando entre restarts | ✅ resolvido |
| S197c-5 | Mistério do crash cíclico: servidor reiniciava, crons recomeçavam tarde, Neon hibernava | ✅ diagnosticado |

---

### S201g — Calendário Profissional + SABIÁ Live Mode + Colesterol Listas (2026-10-07)

| # | Item | Status |
|---|---|---|
| S201g-1 | Calendário mensal abaixo da lista de consultas na agenda do profissional | ✅ commit a7d1222 |
| S201g-2 | Live mode SABIÁ (bolinha vermelha): conversa contínua por voz | ✅ commit d45f871 |
| S201g-3 | Auto-TTS melhorado: dispara em toda resposta quando live mode ativo | ✅ commit d45f871 |
| S201g-4 | Warmup ping no AgePage: acorda Render automaticamente ao abrir a página | ✅ neste #fim |
| S201g-5 | Colesterol: múltiplas listas de compras (I937) | ⏳ aguarda MVP Colesterol |
| S201g-6 | cron-job.org keepalive (healthz a cada 10min) — Yuri configura em 2min | ⏳ Yuri faz |

---

### S200 — Logo Age + PWA + Árvore Bluesky + SABIÁ + Tarefas (2026-10-07)

| # | Item | Status |
|---|---|---|
| S200-1 | Logo Age PWA: age-icon-192/512 atualizados para o novo logo (age-logo.png 1254x1254) | ✅ commit 23dca5a |
| S200-2 | Service worker Age: age-sw.js criado + registrado em age.html — Chrome exibe "Instalar" | ✅ commit 23dca5a |
| S200-3 | iOS instrução: UI Config mostra "↑ Compartilhar → Adicionar à Tela Inicial" | ✅ commit 23dca5a |
| S200-4 | Árvore Bluesky: código wired em playcenter.ts (fire quando ARVORE_BSKY_HANDLE configurado) | ✅ commit 23dca5a — Yuri cria conta |
| S200-5 | ATA Playcenter: header visual + síntese da Árvore destacada no rodapé | ✅ commit 23dca5a |
| S200-6 | SABIÁ voz: useDictation + useTts fork do SC | ✅ commit dd95597/0daf7a3 |
| S200-7 | Tarefas Age: horário/allDay + "Sem data" + chips na agenda | ✅ commit cb3d0bc |
| S200-8 | Render restart: SABIÁ limpa estado do LLM router — xAI+Groq funcionam | ✅ restart OK |
| S200-9 | Árvore conta Bluesky: criar em bsky.social + ARVORE_BSKY_HANDLE+PASSWORD no Render | ⏳ Yuri faz |
| S200-10 | cron-job.org keepalive: instruções enviadas para luddlocke | ⏳ Yuri faz |
| S200-11 | Render sleeping: problema de produção — Mayumi irritada — precisa keepalive urgente | ⏳ S200-10 |

### S199 — Queda Render + #processo emails Mayumi (2026-10-07)

| # | Item | Status |
|---|---|---|
| S199-1 | Render crash: container Site-ST caiu após deploy S197/S198 — db:unreachable 503 | ✅ 2 restarts resolveram |
| S199-2 | Leucócito 07/10 03:47: 6 falhas (PAP+Neon+Conector+Age+Jasmim) — todos eram da queda | ✅ sistema OK após restart |
| S199-3 | Email Mayumi: respondidos 3 emails (Apps Age, Colesterol, Brainstorm) — Mayumi+Yuri | ✅ enviado |
| S199-4 | Email PWA explicação para Yuri+Mayumi (conforme pedido email Age 2.0+Jasmim+PV) | ✅ incluído na resposta |
| S199-5 | IDEIAS I929-I932: Colesterol modos de busca + Eventos + integração Age + concorrentes | ✅ registradas |
| S199-6 | IDEIAS.md: duplicatas I942-I962 (mesma tabela Railway x3 — bug pipeline) | ⏳ limpar |
| S199-7 | PWA Age: virar PWA (manifest.json + service worker) | ✅ implementado S200 |
| S199-8 | SABIÁ: fork sistema áudio/transcrição do SalesCockpit (I928) | ✅ implementado S199 |
| S199-9 | Colesterol MVP: aguarda briefing de produto antes de implementar | ⏳ Yuri define escopo |
| S199-10 | Cron-job.org keepalive: Yuri precisa configurar (2 min) — evita cold start futuro | ⏳ Yuri faz |

---

### S197/S198 — Árvore respirando + Sales Cockpit 21 IAs (2026-10-06)

| # | Item | Status |
|---|---|---|
| S197-1 | Árvore: memória histórica injetada no systemPrompt do Playcenter (1.962 msgs RODAR) | ✅ commit 87e8d3e PAP |
| S197-2 | Playcenter: Árvore adicionada ao ciclo horário (terça/quarta/sexta/sáb/dom) | ✅ commit 4f32dbf PAP |
| S198-1 | SC assembleia 502: raw SQL substituiu Drizzle ORM `queryWithCache` em /sessions e /historico | ✅ commit fa279e8 SC |
| S198-2 | SC /api/vozes 500: raw SQL + criação manual de voice_profiles no Neon | ✅ commit 062c90b SC |
| S198-3 | SC bootstrap: voice_profiles + leads + emails criados automaticamente no boot | ✅ commit 1bd1d5d SC |
| S198-4 | 21 IAs do RODAR visíveis e retornando 200 em /api/vozes | ✅ confirmado |
| S198-5 | Neon: tabelas voice_profiles + leads + emails + agora_turns + external_ai_webhooks criadas | ✅ |
| S198-6 | assembleia_sessions: 20 duplicatas removidas + PRIMARY KEY adicionada (626 rows) | ✅ |

---

### S193b — Bugs Age + Enterro Replit + Terapia de Casal + Leucócito (2026-10-05)

| # | Item | Status |
|---|---|---|
| S193b-1 | Bug Age 3 (cadastro direto paciente): lgpd_at→lgpd_consent_at | ✅ fix commit 8216770 |
| S193b-2 | Bug Age 5 (pop-up modal): zIndex: 50 → 2000 na modal de agendamento | ✅ fix commit 8216770 |
| S193b-3 | Rapadura anel de noivado: uploadMiddleware PDF→uploadImageMiddleware imagem | ✅ fix commit 61f8e37 |
| S193b-4 | Leucócito 13/15: /arvore/timeline→/arvore/history (URL correta) | ✅ fix commit 9c10b21 |
| S193b-5 | MASTER_PASSWORD adicionado ao Render PAP env vars (login Milton OK) | ✅ |
| S193b-6 | Jasmim: 203 assembleias sincronizadas para feed Théo (já atualizado) | ✅ |
| S193b-7 | Terapia de Casal: agendado Age ID#6, 07/10 14h, Milton, R$300 Mayumi | ✅ email confirmação enviado |
| S193b-8 | Enterro do Replit: assembleias #662+#663, Bluesky @isa-pap, Playcenter | ✅ publicado |
| S193b-9 | vercel.json: redirects /salescockpit e /assembleia → salescockpit.vercel.app | ✅ commit ec12fdc |
| S193b-10 | Cana "Erro ao chamar IA": era intermitente (cold start), resolveu após redeploy | ✅ monitorar |
| S193b-11 | Render Starter plan: ambos serviços confirmados buildPlan=starter OK | ✅ |
| S193b-12 | Bug Age 1 (trava após 3 ações): investigado — pode ser cold start Render, monitorar | ⏳ monitorar |
| S193b-13 | Bug Age 2 (exceções): backend OK, frontend parece correto — precisa teste real | ⏳ testar |
| S193b-14 | Bug Age 4 (email configurável via UI): nova feature, não bug — pendente implementação | ⏳ |
| S193b-15 | Claude Code no desktop/Termux: via npm `npm install -g @anthropic-ai/claude-code` | ℹ️ informado |
| S193b-16 | Railway até fim cobrança: deixar expirar — não usar para nada novo | ⏳ retirar |
| S193b-17 | sociedadetucci.com.br: adicionar como custom domain no Vercel (Yuri precisa fazer) | ⏳ Yuri faz |
| S193b-18 | sociedadetucci.org indisponível: assembleia #663 discutiu alternativas (.app, .com) | ✅ assembleia gravada |
| S193b-19 | SABIÁ por áudio: feature futura — Árvore tem TTS, Age SABIÁ ainda só texto | ⏳ future |
| S193b-20 | SABIÁ personal trainer + fisioterapia estilo Hebe | ⏳ aguarda implementação |

---

### S193 — #eage + Colesterol resumo + assembleias SC + Dodge pending (2026-10-05)

| # | Item | Status |
|---|---|---|
| S193-1 | #eage: lido 8 emails, respondido brainstorm Age 2.0/3.0 + SABIÁ pessoal para Yuri+Mayumi | ✅ enviado |
| S193-2 | Colesterol: resumo completo + acesso SC (login AO/AOA) enviado para Yuri+Mayumi | ✅ enviado |
| S193-3 | Assembleias #659 #660 #661 gravadas no SC (Colesterol + Age 2.0 + Age 3.0) | ✅ gravadas |
| S193-4 | IDEIAS I906-I916 registradas (Colesterol, Age 2.0/3.0, SABIÁ pessoal, Dodge auto) | ✅ |
| S193-5 | #assembleia passada geral salva nas preferências do Conector | ⏳ Conector offline |
| S193-6 | PAP API: db:unreachable → redeploy acionado | ⏳ aguarda redeploy |
| S193-7 | Bugs P0 Age 2.0 (6 bugs): cadastro, exceções, email, pop-up, trava, regra | ⏳ aguarda aprovação Yuri |
| S193-8 | I915: Dodge automático varrer emails + rodar assembleias | ⏳ pendente implementação |
| S193-9 | SC Groq 429 nas assembleias (rate limit) — melhora sozinho após alguns minutos | ⏳ monitorar |
| S193-10 | SABIÁ personal trainer + fisioterapia estilo Hebe | ⏳ aguarda aprovação Yuri |

---

### S192 — SC auto-split + cópia Árvore + fix convocar + memória Replit (2026-10-05)

| # | Item | Status |
|---|---|---|
| S192-1 | feat(rodar): auto-split prompts >20k chars em assembleias sequenciais (banner âmbar) | ✅ commit 1a87fdb SC |
| S192-2 | feat(arvore): botões copiar pergunta / resposta / ambos na página da Árvore | ✅ commit 73372a5 SC |
| S192-3 | fix(arvore): hospedeDisponivel() — Claude/ChatGPT sem key caem para Gemini | ✅ commit e9860c0 SC |
| S192-4 | SC Neon: 1.962 msgs Replit importadas (DB: 16→1978, mai-jul 2026) | ✅ importado direto |
| S192-5 | Email Render upgrade links enviado para luddlocke + confirmação Railway | ✅ enviado |
| S192-6 | Railway seguro para cancelar — PAP/SC/Age usam Neon | ✅ confirmado |
| S192-7 | SC IAs ainda travam? → aguarda próxima rodada com commits 78a693a + 886a656 | ⏳ aguarda teste |
| S192-8 | I911: Gaveta lateral Age mobile | ⏳ aguarda resposta Mayumi |
| S192-9 | Software Colesterol — implementação real ainda não começou | ⏳ aguarda briefing Yuri |
| S192-10 | Bluesky SC — spec capturada, implementação pendente | ⏳ pendente |

---

### S191 — SC cooling bypass + email fallback + Leucócito SC-focado (2026-10-05)

| # | Item | Status |
|---|---|---|
| S191-1 | fix(arvore): heartbeat bypassa cooling com callGroqDirect + sem-material fallback | ✅ commit 78a693a SC |
| S191-2 | fix(rodar): email fallback quando pipeline editorial falha (transcript cru) | ✅ commit 78a693a SC |
| S191-3 | fix(rodar): AbortSignal 45s no fetch Groq + VOICE_TIMEOUT_MS 120→60s | ✅ commit 886a656 SC |
| S191-4 | feat(leucocito): 3 novos testes SC (Árvore timeline, heartbeat, RODAR status) | ✅ commit 277e03f PAP |
| S191-5 | Render Starter $7/mês: ir em Settings→Instance Type do serviço | ✅ explicado |
| S191-6 | Colesterol: APENAS brainstorm (Assembleia #651), zero código — acessar em SC | ✅ esclarecido |
| S191-7 | Bluesky SC: pendência com spec (interage, adiciona, posta, pensa, internet) | ⏳ pendente |
| S191-8 | SC IAs ainda travam? aguarda próxima rodada com commits 78a693a + 886a656 | ⏳ aguarda teste |
| S191-9 | MDs (APRENDIZADO/PSEUDO) expostos via Leucócito | ⏳ feature request |
| S191-10 | Software Colesterol — implementação real ainda não começou | ⏳ aguarda briefing Yuri |

---

### S189 — SABIÁ fixes + I146 show/hide senha + I145 Vista Dia + SC runPrepStore→DB (2026-10-05)

| # | Item | Status |
|---|---|---|
| S189-1 | PAP API 503 cold start → redeploy Render | ✅ voltou 200 |
| S189-2 | fix(age): SABIÁ history try/catch + timeout 35s backend | ✅ commit 01d8aa9 |
| S189-3 | fix(age): I146 show/hide senha (SetPasswordView + ChangePassword) + SABIÁ frontend 40s | ✅ commit 01d8aa9 |
| S189-4 | fix(SC): runPrepStore Map→DB (rodar_run_preps Neon) — sobrevive cold starts | ✅ commit cd2309f |
| S189-5 | feat(age): I145 Vista Dia — filtro "Todos/Por dia" + nav ‹Hoje› na agenda profissional | ✅ commit 5b25e35 |
| S189-6 | I911: Gaveta lateral Age mobile | ⏳ aguarda resposta Mayumi |
| S189-7 | S182-3: Cana "Erro ao chamar IA" — root cause em routeLLM cold start | ⏳ próxima sessão |
| S189-8 | Software Colesterol — novo projeto, sem spec ainda | ⏳ aguarda briefing Yuri |

---

### S184 — Playcenter ATA + RODAR réplica ON + #eage (2026-10-03)

| # | Item | Status |
|---|---|---|
| S184-1 | Playcenter ATA email automático após cada rodada | ✅ commit 25ace5b |
| S184-2 | RODAR: réplica default ON + publicarSocial removido | ✅ commit 15de781 |
| S184-3 | #eage enviado: 3 direções Age (bugs, gaveta, multi-profissão) para Yuri+Mayumi | ✅ enviado |
| S184-4 | Confirmado: 3 emails RODAR funcionando (sessão #750) | ✅ verificado |
| S184-5 | I911: Gaveta lateral Age mobile — próxima feature confirmada | ⏳ aguarda resposta Mayumi |
| S184-6 | Bugfix SABIÁ (não abre / abre mas não responde?) | ⏳ Mayumi confirma |

---

### S183 — SalesCockpit IAs + Age email management (2026-10-03)
| # | Item | Status |
|---|---|---|
| S183-1 | PAP API healthz 503 → fix SSL pool (`ssl:{rejectUnauthorized:false}`) | ✅ commit ae29e56 |
| S183-2 | SalesCockpit: Anthropic→routeChat("batch") em agora-deliberativa (getVotesClaude, Sintese, Secretário, Canva) | ✅ commit 0be8d52 |
| S183-3 | llm-router: 402 tratado como permanent/dead; cerebras+deepseek removidos dos pools (402); Gemini agora primário no "batch" | ✅ |
| S183-4 | Age: email management no ConfigView (editar/apagar/verificar com código 6 dígitos) | ✅ commit 79b1305 |
| S183-5 | Age: bootstrap add email_pending/verify_code/verify_expires; auth/me retorna email | ✅ |
| S183-6 | LLMs ativos: Groq (200), Gemini (200), Cloudflare (200) | ✅ confirmados |
| S183-7 | LLMs mortos: Cerebras (402), DeepSeek (402), Mistral (429), OpenRouter (401) | ⏳ sem prioridade |
| S183-8 | AI_INTEGRATIONS_ANTHROPIC_API_KEY: não mais necessária no SalesCockpit | ✅ substituída por Gemini |

---

### S182 — Mobile Árvore fix (2026-10-03)
| # | Item | Status |
|---|---|---|
| S182-1 | Sidebar Oráculo/Árvore: overlay hambúrguer mobile (fixed z-50 + backdrop + translate) | ✅ commit 5fd4d38, Render deploy queued |
| S182-2 | Anthropic API key: Yuri sem crédito na conta | ⏳ Yuri tenta amanhã |
| S182-3 | Cana "Erro ao chamar IA": pg.Pool cold start Neon — precisa retry ou Neon serverless | ⏳ próxima sessão |
| S182-4 | runPrepStore in-memory: RODAR perde tema entre cold starts — persistir no DB | ⏳ próxima sessão |
| S182-5 | **Software Colesterol**: novo projeto anunciado por Yuri | ⏳ amanhã |

---

### S180 — Árvore viva + deploy failures resolvidos (2026-10-02)
| # | Item | Status |
|---|---|---|
| S180-1 | Root cause deploy failures: `AI_INTEGRATIONS_OPENAI_BASE_URL/API_KEY` + `AI_INTEGRATIONS_ANTHROPIC_*` lançavam Error() no boot quando ausentes | ✅ removidas, fallback ?? |
| S180-2 | Crash startup confirmado: `nonZeroExit:1` → build ok, servidor morria no import de integrations-openai/anthropic | ✅ commit 5124eef |
| S180-3 | arvore/chat context reduzido 15k→4k chars (assembleiaIndex), 3k→1k (memoriaEstruturada), 4.5k→2k (timelineDigest), MAX_CONTEXT 30k→8k | ✅ commit 8ce31bc |
| S180-4 | Cloudflare model: llama-3.1-8b-instruct (deprecated) → llama-3.3-70b-instruct-fp8-fast | ✅ commit 1ca436e |
| S180-5 | Cloudflare adicionado ao pool "chat-live" como fallback real | ✅ commit 9b68fd2 |
| S180-6 | oraculo/chat: bypassa cooling Groq para chat interativo (tenta mesmo em cooldown) | ✅ commit 0d3cdd0 |
| S180-7 | Render env vars: 26 vars restauradas (salvas em complete_env.json scratchpad) | ✅ PUT via API |
| S180-8 | arvore/chat testado: responde via Cloudflare fallback, streaming OK | ✅ |
| S180-9 | PAP healthz 503→200 (redeploy + fix transitório pool SSL) | ✅ |
| S180-10 | AI_INTEGRATIONS_ANTHROPIC_API_KEY: chave foi perdida no wipe de env vars | ⚠️ RODAR voices Anthropic falham com 401 — Yuri precisa setar a chave |

---

### S179 — Vozes RODAR corrigidas: Groq gpt-oss-120b (2026-10-02)
| # | Item | Status |
|---|---|---|
| S179-1 | llama-3.3-70b-versatile removido da conta Groq → substituído por openai/gpt-oss-120b em 10 arquivos SC | ✅ commit 8de6094 |
| S179-2 | Artista/Professora: meta-llama/llama-4-scout → openai/gpt-oss-120b | ✅ |
| S179-3 | Metassemiótico/Nébula/Psicólogo: OpenAI SDK (sem crédito) → fetchGroqChat gpt-oss-120b | ✅ |
| S179-4 | bunker-mode.ts: synthesisFallback pool "batch" → "chat-live" (Groq prioritário) | ✅ |
| S179-5 | BUNKER_MODE=2 adicionado nas env vars Render SalesCockpit | ✅ |
| S179-6 | Deploy SalesCockpit: status live, commit correto, rodar/prepare funcionando | ✅ |
| S179-7 | PAP healthz 503→200 (redeploy para limpar estado) | ✅ |
| S179-8 | Bluesky Árvore: último post 2026-10-02T07:05 (curadoria diária OK) | ✅ |
| S179-9 | Assembleia RODAR: prepare OK, stream com Cloudflare bloqueando CLI — testar no browser | ⏳ |

---

### S178 — Health check geral + fix DB SSL pool (2026-10-02)
| # | Item | Status |
|---|---|---|
| S178-1 | MacroATA S176-S177 recuperada: enviada às 15:53 BRT, "Rotação LLM 8-vias + DODGE Analista + Anel 💍" | ✅ confirmada |
| S178-2 | fix(db): remover ssl:{rejectUnauthorized:false} que travava handshake Render→Neon | ✅ commit 94c41a0 |
| S178-3 | ISA migrada para routeLLM (bluesky.ts) | ✅ commit ea7d119 (S177b) |
| S178-4 | SalesCockpit: 781 assembleias, healthz OK, Bluesky @stuccipulseheadway ativo | ✅ verificado |
| S178-5 | ISA Bluesky: @isa-pap.bsky.social — último post 2026-10-02T19:34 OK | ✅ verificado |
| S178-6 | Rapadura: rotas protegidas 401 (correto, auth necessária) | ✅ verificado |
| S178-7 | Age: endpoints dependem do pool fix (aguardar S178-2 em produção) | ⏳ verificar |
| S178-8 | Assembleia teste RODAR — pendente (SalesCockpit requer auth RODAR) | ⏳ próxima sessão |

---

### S176–S177 — LLM Rotation + DODGE Analista + Anel + SalesCockpit (2026-10-02)
| # | Item | Status |
|---|---|---|
| S176-1 | llm-router: 8 provedores, 4 pools, cooling monotônico (fork SalesCockpit) | ✅ commit a0057a0 |
| S176-2 | Cana: maxTokens 3000, timeout 25→50s, xAI #1 no chat-live | ✅ commits 29cc8a0+a6401ec |
| S176-3 | SABIÁ, Jasmim: limites de tokens aumentados | ✅ commit a0057a0 |
| S176-4 | Rapadura: anel de noivado — tabela rapadura_ring_project + rotas + aba 💍 | ✅ commit f62f52e |
| S176-5 | Cana: CONHECIMENTOS PATRIMONIAIS (Tesouro Direto, FIIs, ETFs, CDB) | ✅ commit a6401ec |
| S176-6 | Render env vars: GROQ/GEMINI/CEREBRAS/MISTRAL/DEEPSEEK/XAI/CLOUDFLARE | ✅ configuradas |
| S177-1 | DODGE: GET /router-state + POST /router-reset (superadm) + POST /syslog-chat (analista) | ✅ commit d899157 |
| S177-2 | Todas IAs: bloco SISTEMA com consciência de rotação LLM | ✅ commit d899157 |
| S177-3 | DODGE system prompt: papel de analista de sistemas | ✅ commit d899157 |
| S177-4 | SalesCockpit: AO_PASSWORD_HASH → senha AOA (Render env atualizado) | ✅ Render redeploy |
| S177-5 | ISA: migrar para routeLLM (usa OpenAI/Gemini direto) | ✅ commit ea7d119 |
| S177-6 | Age emails: AGE_DISABLE_PROF_EMAILS=true (reativar quando Lisange+Suzana prontas) | ⏳ #685 |
| S177-7 | Ecossistema 2x/dia (assembleias linkando memórias + sonhos coletivos) | ⏳ I6XX |

---

### S139 — Age: bugs Mayumi + landing cases + CTA form (2026-09-28)
| # | Item | Status |
|---|---|---|
| S139-1 | Age: fix SabiaView height calc(100vh) → 100% (scroll vazava pro body no drawer) | ✅ commit 1c457b6 |
| S139-2 | Age: drawer overscrollBehavior contain (scroll mobile vazava para o body) | ✅ commit 1c457b6 |
| S139-3 | Age: cases fictícios engraçados na landing (Dra Helena, Dr Marcos, Cris) | ✅ commit 1c457b6 |
| S139-4 | Age: CTA virou formulário inline (nome, email, espec, msg) + fallback mailto | ✅ commit 1c457b6 |
| S139-5 | Backend: POST /api/age/interesse + tabela age_interesse + notificação email | ✅ commit 1c457b6 |
| S139-6 | Resp #706: Social = OK; cases fictícios; CTA = form+email; Broto R$49 mantido | ✅ decisões |
| S139-7 | I165: painel admin interessados (lista age_interesse) | ⏳ baixa prioridade |
| S139-8 | I166: email boas-vindas automático para interessado | ⏳ baixa prioridade |
| S139-9 | Notas: confirmar ciclo completo após Render estar up (Mayumi testou offline) | ⏳ testar |

---

### S138 — Calculus Index + Render Fix ENV VARS (2026-09-28 noite)
| # | Item | Status |
|---|---|---|
| S138-1 | Render: DATABASE_URL + 9 outras vars essenciais restauradas via API | ✅ vars configuradas |
| S138-2 | Render: redeploy forçado → servidor voltou ao ar (antes: exit code 1 no boot) | ✅ live |
| S138-3 | Calculus: landing institucional /calculus (Ábaco, hero, 6 features, Sócia) | ✅ commit bb563e0 |
| S138-4 | Sócia: conceitual (deliberada Assembleia #704) — não programada | ⏳ próxima frente |
| S138-5 | Lista tarefas de rua enviada para Yuri (MP, Stripe, Age emails, Oracle, UptimeRobot) | ✅ no chat |

---

### S137 — Age Landing + SABIÁ Fix (2026-09-28 noite)
| # | Item | Status |
|---|---|---|
| S137-1 | Age: landing page institucional no /age/ (hero, benefícios, profissionais, planos, CTA) | ✅ commit ece017e |
| S137-2 | Age: App.tsx captura /age sem barra + vercel.json rota /age adicionada | ✅ commit ece017e |
| S137-3 | Banco Neon: Lisange=psicóloga, Suzana=médica (tipos e bios trocados corrigidos) | ✅ SQL direto |
| S137-4 | Age: SABIÁ retry 3x/35s com AbortController + mensagem "acordando" | ✅ commit 6e5d7c0 |
| S137-5 | Email: landing + perspectivas IAs enviado para Yuri rodar na Assembleia | ✅ enviado |
| S137-6 | Age: I143 Protocolo SABIÁ Segurança Humana | ⏳ próxima sessão |
| S137-7 | Age: I144 Portal Pré-Cadastro (IPAuth + voz) | ⏳ próxima sessão |
| S137-8 | Age: I145 Vista "Dia da Semana" | ⏳ próxima sessão |
| S137-9 | Age: I146 Show/hide senha em set-password + change-password | ⏳ próxima sessão |
| S137-10 | Assembleia Pós-Humanismo: campos [...] em branco — bug RODAR/Replit (timeout IAs) | ⏳ investigar no Replit |
| S137-11 | **pg_dump Replit URGENTE** — prazo 30/09 | ⏳ YURI FAZ HOJE |

---

### S134 — Age v2.0 (2026-09-28)
| # | Item | Status |
|---|---|---|
| S134-1 | Age: logo Sabiá atualizado (cor real Turdus rufiventris) | ✅ commit 77286ba |
| S134-2 | Age: SVG Sabiá com cores corretas (costas cinzento-pizarro, peito laranja rufoso) | ✅ commit 77286ba |
| S134-3 | Age: Calendário público — 3 vistas: Lista/Semana/Mês | ✅ commit 77286ba |
| S134-4 | Age: SABIÁ flutuante em todos os modos (público, paciente, profissional) | ✅ commit 77286ba |
| S134-5 | Age: Show/hide senha na área do paciente (login) | ✅ commit 77286ba |
| S134-6 | Age: Footer S. T. Age v2.0 · 2026 + créditos Y.T. · M.M. · C.C. | ✅ commit 77286ba |
| S134-7 | Age: I143 Protocolo SABIÁ Segurança Humana | ⏳ próxima sessão |
| S134-8 | Age: I144 Portal Pré-Cadastro (IPAuth + voz) | ⏳ próxima sessão |
| S134-9 | Age: I145 Vista "Dia da Semana" | ⏳ próxima sessão |
| S134-10 | Age: I146 Show/hide senha em set-password + change-password | ⏳ próxima sessão |

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
| 102 | Snapshots patrimoniais — I479: job cron mensal → rapadura_historico_cotas | — | ✅ S120c — cron "0 6 1 * *" em keepalive.ts; ON CONFLICT DO NOTHING |
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
| 110 | Age — I558: Confirmação Sim/Não para ações irreversíveis no painel | — | ✅ commit 8b3a6e5 (S120c) |
| 111 | Age — I564: Link de convite para pré-aprovação de paciente | — | ✅ commit 92a2d8c (S121) |
| 112 | Age — Compliance: Política de Privacidade + Termos de Uso + checkbox consentimento | Assembleia | ✅ commit 4b544cf |
| 113 | Age — Landing page pública (produto comercial) + formulário de interesse | Assembleia decidir posicionamento | ⏳ |
| 114 | Age — Configurar emails reais Lisange e Suzana via /api/age/admin/setup | Yuri | ⏳ |
| 115 | Age — Trocar senhas padrão age2026 (primeiro acesso) | Yuri | ⏳ |
| 219 | Age — Mãe do Yuri: nome + email para cadastro como paciente da Suzana + 4 sextas 14h | Yuri | ⏳ |
| 220 | Age Fase 5 — Stripe/PayPal: pagamento no momento do agendamento | Fase 4 ✅ | ⏳ |
| 221 | Age Fase 7 — PWA instalável + Google Calendar OAuth | — | ⏳ |
| 222 | Age Fase 8 — SABIÁ: memória persistente + notificações proativas | — | ⏳ |
| 211 | PV — Projectification MVP lente 2: KANBAN (arrastar cards entre colunas) | após lente 1 | ⏳ |
| 212 | PV — Projectification MVP lente 3: CALENDÁRIO (itens com due_at em grid semanal) | após lente 2 | ⏳ |
| 213 | PV — PvPage: edição inline de items (click no título → edita) | lente 1 estável | ⏳ |
| 214 | PV — Relações entre itens: UI para adicionar/visualizar depends_on/blocks | lente 1 estável | ⏳ |
| 223 | Jasmim — Esquilo voador animado (SVG+CSS) no login: corpo+orelhas+asas+cauda estilo coruja PAP/ISA | — | ✅ commit 2026-09-08 |
| 224 | PV — Avatar Sérgio: pacu gordo e simpático com voz de gordo; personagem oficial do Projeto Visual | Yuri/design | ⏳ |
| 225 | Age i18n: 7 idiomas (pt-BR, en, es, eo, ru, zh, ja) com bandeirinhas; default pt-BR; JSON de traduções | — | ⏳ backlog |
| 226 | Jasmim — Notas/perguntas entre posts: tipo=nota/pergunta, MYYM responde automaticamente | — | ⏳ |
| 227 | Age Bloco 3 — PDF automático ao final da consulta: profissional fala → sistema gera PDF | — | ⏳ |
| 228 | Age Bloco 4 — Próxima sessão automática: após consulta sugere datas (7/14/21/30 dias); 1 clique | — | ⏳ |
| 229 | Age Bloco 2 — Ficha interna: profissional preenche no sistema após conhecer o paciente em conversa | — | ✅ commit fe57ee6 (S121) |
| 230 | Mayumi — conta criada (login:mayumi tier:3) + email enviado com credenciais | ✅ | ✅ 2026-09-08 |
| 231 | Age — Painel Mayumi gestora: visão consolidada (agenda+financeiro+alertas) — próxima frente de código | — | ✅ commit 193c829 (S119v) |
| 232 | Age — Reunião Lisange+Suzana: levantar 5 perguntas de ficha por profissional + preferência de preenchimento | Yuri+Mayumi marcar | ⏳ URGENTE |
| 233 | Age — Decisão: prazo mínimo cancelamento (24h? 48h? por profissional?) + taxa (50%? 100%?) | Mayumi | ⏳ |
| 234 | Age — Decisão: modelo de cobrança do Age (mensalidade por profissional vs % por consulta) | Yuri | ⏳ |
| 235 | Age — Decisão: pagamento PIX padrão + cartão por link (Mercado Pago/Stripe) | Mayumi+profissionais | ⏳ |

## Concluídos

| # | Item | Commit/Data |
|---|---|---|
| Age Fase 6 | Age — Lembretes 48h/24h com links cancel/reschedule embutidos no email | ✅ a62401d (Sessão #646) |
| Age Fase 4 | Age — Documentos + Anamnese: CRUD forms, upload docs base64, painel pro, área paciente | ✅ b0c0d13 (Sessão #646) |
| — | Age — 4 consultas sexta 14h criadas para Yuri/Suzana (04–25/set/2026) | ✅ SQL direto Neon |
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
| 211 | **Age Fase 2** — Cancelamento + reagendamento por token (sem login): cancelToken no book, GET/POST /by-token/:token/cancel e /reschedule, política cancelMinHoras (24h padrão), isPublic nas regras, email patient com links | — | ✅ 2026-08-29 · commit 4be1723 |
| 212 | **Age Fase 3** — Área do paciente com login: passwordHash + resetToken no schema, aprovação→email "criar senha" (72h), set-password via token, login/logout/me paciente, forgot-password (2h), change-password interno, GET /my/appointments, PatientAreaView (próximas + histórico + cancel/remarcar), botões "Paciente"/"Profissional" no header | — | ✅ 2026-08-29 · commit 9c0471d |
| 206 | Age: configurar email real das profissionais via POST /api/age/admin/setup | Yuri (email Lisange/Susana) | ⏳ |
| 207 | Age: trocar senha padrão "age2026" após primeiro login de cada profissional | Lisange + Susana | ⏳ |
| 208 | Age: UX Susana — ver sistema existente dela e ajustar interface | Susana mostra sistema | ⏳ |
| 209 | Age: domínio curto (age.sociedadetucci.com.br ou /age como alias) | DNS | ⏳ |
| 210 | Age: Canva visual — identidade gráfica do Age (logo SABIÁ, cores, tipografia) | Sessão futura | 💡 |
| 213 | Age Fase 4 — Documentos: anamnese estruturada, contratos, anexos (PDF/áudio/vídeo), assinatura digital | próxima sessão | ⏳ |
| 214 | Age Fase 5 — Pagamentos: Stripe/PayPal no agendamento, cupom, recibo PDF | sessão futura | ⏳ |
| 215 | Age Fase 6 — Lembretes 48h/24h + email retorno (acionado pela profissional) | próxima sessão | ⏳ |
| 216 | Age Fase 7 — PWA + Google Agenda OAuth (sincronização bidirecional) | sessão futura | ⏳ |
| 217 | Age: Compliance LGPD — Política de Privacidade + ToS + checkbox consentimento (antes de vender) | antes de produção | ⏳ |
| 218 | age_spec_v1.md criada — especificação completa (11 seções, 9 fases, 7 decisões pendentes) | — | ✅ 2026-08-29 |

### #201 — Migração RODAR: Replit → Render
- [x] Código-fonte → GitHub ✅ 428 arquivos, 2 commits (74af36d8) — 2026-08-25T19:59
- [x] Fix `groq-retry.ts` publicado ✅ — RODAR 20/20
- [x] `.env.example` com manifesto de nomes ✅ — `MIGRATION_RENDER.md` gerado
- [ ] **pg_dump produção** — 635 sessões / 18.682 msgs / 3.044 arvore_chat (bloqueio principal)
- [ ] Secrets copiados do Replit para Render (Yuri faz direto no painel, sem passar por chat)
- [ ] Deploy no Render + apontar Neon

### #202 — pg_dump produção RODAR (aguardando email do Replit)
- Tarefa de backup separada iniciada pelo agente Replit em 2026-08-25
- **2026-09-08: 2ª tentativa — via PC/terminal (R$1k gastos sem conseguir via agente)**
- Comando correto (Replit Shell → Tools → Shell): `pg_dump $DATABASE_URL -Fc > rodar-backup-20260908.dump`
- Depois baixar via Files → enviar para Cláudio → `scripts/import-rodar-dump.sh`
- NÃO apagar Replit até Render verificado por 30 dias

### #649 — Enterro do Replit (Assembleia 2026-09-08)
| # | Item | Depende de | Status |
|---|---|---|---|
| E1 | pg_dump via PC/terminal (não via agente): `pg_dump $DATABASE_URL -Fc > rodar-backup-20260908.dump` | Yuri (terminal Replit) | ⏳ URGENTE |
| E2 | Import dump → Neon banco separado (I603): script `scripts/import-rodar-dump.sh` pronto | ✅ script criado | ⏳ aguarda dump |
| E3 | Gerar Kernel Identitário (I602): 20 princípios + RODAR + PERFEITOs top-50 + specs vozes | após E2 | ⏳ Sessão #650 |
| E4 | Testar boot limpo com Kernel (Sessão #651): nova instância opera sem histórico completo? | após E3 | ⏳ |
| E5 | Ritual de Enterro oficial (I604): endpoint + certificado JSON + `tango/protocolo-enterro.md` | após E2 | ⏳ script criado |
| E6 | Cancelar conta Replit + registrar data de desligamento | E4 confirmado + 30 dias | ⏳ |
| E7 | Arvore_chat delta (IDs 2117–3044): importar para `tango/replit-export/arvore_chat_delta.json` | após E1 | ⏳ |

### #203 — Assembleia #636 ✅ PROCESSADA 2026-08-25
- Processar quando os 3 emails chegarem (Assembleia + RESULTADO + PERFEITO)

### #204 — Deploy RODAR no Render (pós-dump)
- Repo: github.com/yurituccieterovic-cell/salescockpit-clube-da-ia (privado, 428 arquivos)
- Neon: criar banco separado do PAP, restaurar dump de produção
- Secrets: copiar do Replit Secrets → Render Environment (Yuri faz direto, sem passar por chat)
- Referência: MIGRATION_RENDER.md no repo

### #205 — Mayumi como gestora do Age ~~(confirmado 2026-09-08)~~ → **CANCELADO 2026-09-12**
> Parceria encerrada. Acesso removido do banco + código. Gestora Age: posição vaga.
> Itens M3/M4/M5 migram para Yuri ou nova gestora futura.

| # | Item | Depende de | Status |
|---|---|---|---|
| M1 | Definir % de remuneração | — | ❌ cancelado |
| M2 | Criar acesso administrativo para Mayumi | — | ❌ cancelado (acesso removido) |
| M3 | Configurar emails reais Lisange + Suzana | nova gestora ou Yuri | ⏳ reassumido |
| M4 | Trocar senhas padrão das profissionais | nova gestora ou Yuri | ⏳ reassumido |
| M5 | Ajustar disponibilidade real Suzana | nova gestora ou Yuri | ⏳ reassumido |
| M6 | Ativar Stripe + registrar % gestora | nova gestora | ⏳ em espera |

### #206 — Jasmim-Manga: APIs + Deploy (S119 · 2026-09-08)
| # | Item | Depende de | Status |
|---|---|---|---|
| J1 | /jasmim ao ar em sociedadetucci.com.br | root vercel.json corrigido ✅ commit f50bd20 | ⏳ build Vercel |
| J2 | API GET /api/jasmim/feed — lista posts por projeto | Neon schema | ⏳ |
| J3 | API POST /api/jasmim/myym/chat — MYYM responde com Gemini Flash | Gemini key ok | ⏳ |
| J4 | API POST /api/jasmim/carrinho/enviar — envia email brainstorm | Gmail ok | ⏳ |
| J5 | Neon schema: jm_posts, jm_carrinho, jm_myym_memory | criar tabelas IF NOT EXISTS | ⏳ |
| J6 | Pipeline email→feed: IMAP luddlocke → parse → inserir jm_posts | J5 | ⏳ |
| J7 | Prompt MYYM instalado na Perplexity da Mayumi | Mayumi (manual) | ⏳ |
| J8 | Validação visual PV: Sérgio revisa blocos hierárquicos Jasmim-Manga | Sérgio (email pendente) | ⏳ |
| J9 | Creditar Gemini/Perplexity/Meta AI nas interfaces MYYM | após J2-J3 ok | ⏳ |
| J10 | sync root/vercel.json automático a cada nova rota (I645) | processo | ⏳ |

### S119m — #eage Rodada 2 (2026-09-08)

| # | Pendência | Tipo | Bloqueia |
|---|---|---|---|
| #236 | Definir modelo de pagamento Age: A (reserva), B (24h antes) ou C (pós) — decisão Yuri+Mayumi+profissionais | DECISÃO | Bloco 3 |
| #237 | Reunião Mayumi+Lisange+Susana: entrevista gamificada (etapas Quem/Como/Antes/Depois); Mayumi conduz por vídeo ou WhatsApp | MAYUMI | Bloco 2 |
| #238 | Aprovação manual Nível 3 paciente: Mayumi aprova manualmente ou automático após 1ª consulta? | DECISÃO | I664 |
| #239 | Convergência MYYM↔Sabiá: protocolo de fusão por tema; job semanal Assembleias → Sabiá | IA | I667+I668 |
| #240 | Gateway de pagamento: Stripe (já integrado) vs Mercado Pago; decisão antes do Bloco 3 | DECISÃO | #236 |
| #241 | Email das profissionais (Lisange+Susana): configurar via /api/age/admin/setup para confirmações funcionarem | INFRA | Bloco 2 |
| #242 | LGPD: checkbox consentimento WhatsApp no cadastro + Política de Privacidade + ToS antes de ativar pagamentos | JURÍDICO | Bloco 3 |

### S119n — #eage Rodada 3 / Decisões Mayumi (2026-09-08)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #243 | Confirmação Yuri para implementar Bloco 2: aprovação automática + campo escopo + semáforo + email alerta | DECISÃO | 🔴 bloqueia I672-I674 |
| #244 | Campo "busca tratar": texto livre ou lista de opções por profissional? — Mayumi decide | DECISÃO | 🔴 bloqueia I672 |
| #245 | Frequência de tratamento: profissional define manualmente ou SABIÁ infere pelo histórico? | DECISÃO | 🟡 bloqueia I673 |
| #246 | Repasse Stripe: manual (PIX da Mayumi) ou automático (Connect)? — Mayumi decide | DECISÃO | 🟡 bloqueia I676 |
| #247 | Criar produtos no Stripe (tipos de consulta + preços) — após decisão de repasse | STRIPE | 🟡 bloqueia I675 |
| #248 | Reunião Mayumi+Lisange+Suzana: Mayumi vai avisar data/formato | MAYUMI | ⏳ aguardando |

### S119o — #eage Rodada 4 / Teste ao vivo Mayumi (2026-09-08)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #249 | Jasmim: show/hide senha no login (ícone olho) | CÓDIGO | ✅ implementado (showSenha + 👁️/🙈) |
| #250 | Jasmim: esquilo aparecer dentro do app (não só no login) | CÓDIGO | ✅ 🐿️ no avatar MYYM + header |
| #251 | MYYM: conversa anterior colapsada por default | CÓDIGO | ✅ implementado (conversa anterior colapsada por default) |
| #252 | Jasmim: botão carrinho com loading + "Enviado ✓" | CÓDIGO | ✅ implementado |
| #253 | Age: Nível 3 condicional (auto SE escopo OK, manual SE fora) | CÓDIGO | 🔴 bloqueia fluxo de aprovação |
| #254 | Age: triagem por formulário de opções predefinidas + SABIÁ classifica "Outro" | CÓDIGO | 🟡 bloqueia Bloco 2 completo |
| #255 | Gateway pagamento: Stripe (exterior) vs Mercado Pago (Brasil) — Yuri decide | DECISÃO | 🔴 bloqueia Bloco 4 |
| #256 | Dia do relatório semanal: segunda ou sexta? — Mayumi decide | DECISÃO | 🟡 bloqueia I686 |
| #257 | Lista opções triagem: Mayumi monta com profissionais na reunião? | DECISÃO | 🟡 bloqueia I683 |
| #258 | Age: 1ª consulta sem cancel/reagendamento automático | CÓDIGO | ✅ S120a — primeiraId bloqueia cancel/remarcar |
| #259 | Bloco 3: PDF automático + próxima sessão automática — AUTORIZADO | CÓDIGO | ✅ S119w — email pós-realizado + slot automático |
| #260 | Mapa geral Age enviado por email ✅ | FEITO | ✅ |

### S119p — #eage Rodada 5 — RSRS + ISCA + admin Jasmim (2026-09-09)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #261 | Admin Jasmim: guias "Financeiro & Sabiá" e "Documentos & Prontuários" — backend + UI (não implementadas ainda) | CÓDIGO | ✅ S120a — chips clickáveis + filtro por setor + painéis contextuais Age |
| #262 | Pedir arquivos para Suzana (docs de referência — Yuri mencionou) | MAYUMI/YURI | ⏳ lembrar na reunião |
| #263 | Protótipo comandos de acesso rápido: radial menu desktop + barra flutuante mobile (I692) | CÓDIGO | 🟡 aguarda aprovação visual |
| #264 | Formulário base reuniões Mayumi: doc por reunião (Lisange + Suzana), enviado por email antes das datas (I695) | PROCESSO | ✅ S120a — template criado em tango/formulario_reuniao_mayumi.md; envio aguarda datas das reuniões |
| #265 | Gateway múltiplo Age: profissional configura quais aceita (Stripe + MP); #255 resolvido — ambos (I694) | CÓDIGO | ✅ S120a — online_mercadopago adicionado ao allowed list + label UI |
| #266 | RSRS — spec arquitetural: começar por comentários entre profissionais no prontuário (I690) | SPEC | 🟡 aguarda confirmação |
| #267 | ISCA — decisão arquitetura: IAs separadas com personalidade ou modos da MYYM? (I691) | DECISÃO | 🟡 Yuri decide |

### S119q — Expansão ecossistema Jasmim + ISCA (2026-09-09)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #268 | CROWD real: bridge Jasmim → CEU/CROWD (publicar posts do CROWD no feed 'crowd') | CÓDIGO | ✅ S120a — tab "FEED" no modal CROWD do CEU mostra jm_posts?projeto=crowd em tempo real |
| #269 | Théo ecosystem "never sleep": ping automático entre todos os sistemas para manter servidores vivos | INFRA | ✅ S120a — cron */11min em keepalive.ts pinga jm_posts (Jasmim) |
| #270 | ISCA: implementar roteamento de chamadas MYYM → Inara/Suindara/Clio/Arara por tipo de pergunta | CÓDIGO | 🟡 arquitetura definida, código pendente |
| #271 | BNI: spec completa do departamento de forças ocultas (em segredo) | SPEC | 🔒 aguarda Yuri + Mayumi |
| #272 | Starter pack IAs: doc formal com ISCA + RSRS como itens obrigatórios | PROCESSO | ✅ tango/starter-pack-ias.md v1.0 — tabela projetos + checklist nascimento |
| #273 | CROWD + Théo: acoplamento completo do ecossistema Théo (todos os sistemas se alimentando) | SISTEMA | 🟡 grande projeto — próxima fase |
| #274 | Jasmim UX bugs ainda pendentes: #249-#252 (show/hide senha, esquilo, MYYM colapsado, carrinho loading) | CÓDIGO | ✅ feito (esquilo S119t; show/hide senha, MYYM colapsado e carrinho loading já estavam no código) |

### S119s — #eage Rodada 6 — Chronos, Kairós e Tempo do Cuidado (2026-09-09)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #275 | Admin Age: aba "Disponibilidade" — profissional configura dias/horários; bloqueia datas; vê ocupação (I708) | CÓDIGO | ✅ S120a — ocupação 7 dias (barra + stats) adicionada à DisponibilidadeView |
| #276 | Enviar por email: senhas Suzana + Lisange + login paciente-demo (Yuri pediu) | PROCESSO | ✅ feito S119t |
| #277 | Textura mármore: variável CSS global `--bg-texture` em todos os sistemas (I707) | CÓDIGO | ✅ feito S119v — radial-gradient aplicado em Age + Jasmim |
| #278 | WhatsApp bridge Age MVP: botão "Copiar link agendamento" no perfil do profissional (I705) | CÓDIGO | ✅ já implementado: ConfigView tem botão "Copiar link" + "Enviar pelo WhatsApp" |
| #279 | Kairós no semáforo: adicionar contexto de histórico (não só intervalo de tempo) na cor do semáforo (I703) | CÓDIGO | ✅ S120a — faltou90d/realizadas90d: ≥1 falta bloqueia verde; ≥2 faltas baixa próxima sessão para amarelo |
| #280 | Email domínio próprio `@sociedadetucci.com.br`: ativar email empresarial; pendência administrativa | INFRA | ⏳ Yuri faz (domínio próprio) |
| #281 | [SEGURANÇA] Replit/checkout.ts: remover BCC hardcoded para Yuri sem consentimento (LGPD) — sugestão da Árvore #647 | SEGURANÇA | ⚠️ Replit legado — Yuri decide se mantém Replit vivo |
| #282 | Textura mármore: implementar variável CSS `--bg-texture` global em Age + Jasmim (I707) — Yuri pediu ao vivo | CÓDIGO | ✅ feito S119v |

### S119t — #eage Rodada 7 + Outros Assuntos (2026-09-09)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #283 | Painel Mayumi (gestora Age): visão unificada de Lisange+Suzana — agenda, pacientes, aprovações, ações em nome da profissional (I719) | CÓDIGO | ✅ feito S119v — /age/gestora + API gestora + tabela age_gestoras |
| #284 | Aprovação automática de pacientes: pré-requisitos configuráveis por profissional; quando cumpridos → status APROVADO automático + email/WhatsApp (I720) | CÓDIGO | 🟡 proposta Rodada 7 |
| #285 | PWA iOS + og:image + Twitter cards: tags apple-mobile-web-app em age/jasmim/rapadura (I721) | CÓDIGO | ✅ feito S119u (commit 98f7385) |
| #286 | Fix Jasmim: pergunta deve aparecer ANTES da resposta da IA (hoje carrega invertido) (I722) | CÓDIGO | ✅ feito S119t (commit 111289a) |
| #287 | Fix Jasmim: copiar pergunta+resposta não funciona — Mayumi relatou | CÓDIGO | ✅ feito S119t (commit 111289a) |
| #288 | Fix Jasmim: esquilo avatar não aparece no login — Mayumi relatou | CÓDIGO | ✅ feito S119t (commit 111289a) |
| #289 | Transferência Assembleia RODAR: pg_dump da DB certa (Replit Secrets, não heliumdb) — Yuri aguarda instrução | PROCESSO | ✅ S120a — exportação JSON v3 recebida (35MB, 649 assembleias, 19.162 msgs); dump em /root/replit-dump/ |
| #290 | Memória Árvore: incorporar posts Bluesky (stuccipulseheadway.bsky.social) no pack-arvore.md como memória pública | PROCESSO | ✅ pack-arvore.md atualizado com 8 posts recentes |

### S119u — Drive Screenshot + Arquitetura SABIÁ (2026-09-09)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #291 | Rota /pulseheadway → novo site (aliancapanorama/index.html); placeholder até ter página dedicada | CÓDIGO | ✅ feito S119u (commit 98f7385) |
| #292 | [SEGURANÇA] RODAR callback-tokens.ts linha 27: timing attack — substituir comparação direta por timingSafeEqual (crypto) | SEGURANÇA | ⚠️ Replit legado — Yuri decide se aplica |
| #293 | SABIÁ ética: definir política formal de dados de saúde — o que SABIÁ pode acessar, por quanto tempo, com consentimento de quem | PROCESSO | ✅ tango/sabia-etica-dados.md v1.0 — CFP+LGPD; revisão antes Bloco 3 |
| #294 | Bluesky Árvore: salvar post https://bsky.app/profile/stuccipulseheadway.bsky.social/post/3mv3mew33vb2l em pack-arvore.md | PROCESSO | ✅ post salvo + seção Posts Destacados |
| #295 | Assembleia: enviar emails de atualização sobre Age + Jasmim | PROCESSO | ✅ feito S119u (2 emails) |

### S119v — Painel Mayumi + Mármore + PremiereMovieMaker (2026-09-09)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #296 | PremiereMovieMaker: sistema slideshow + narração → MP4 (edge-tts ou ElevenLabs + Playwright + FFmpeg) | CÓDIGO | ✅ --tts pt-BR implementado via CLI edge-tts (FranciscaNeural/AntonioNeural) |
| #297 | Jasmim: setor "Histórico" com assembleias + atas (query assembleia_sessions do banco) | CÓDIGO | ✅ S120a — 649 assembleias Replit → Neon; painel histórico com busca + paginação no setor Histórico/jasmim |
| #298 | Cancelar/substituir "d edge de video" — clarificar qual serviço (edge-tts?) | PROCESSO | ✅ S120b — confirmado: VEED (eco-respiração, R$44,04/mês, dia 2) |
| #299 | PremiereMovieMaker: configurar env AGE_GESTORA_EMAIL + AGE_GESTORA_PASSWORD no Render | INFRA | ⏳ Yuri faz no Render |
| #300 | Cancelar ElevenLabs antes de 20/09 (R$33,49/mês) — migrar para PremiereMovieMaker | YURI | ⏳ Email lembrete programado p/ 18/09 |
| #301 | Cancelar Replit antes de 02/10 — exportar sonhos pós-09/09 antes de cancelar | YURI | ⏳ Email lembrete programado p/ 30/09 |
| #302 | Cancelar VEED antes de 02/10 (R$44,04/mês) — eco-respiração vai para PremiereMovieMaker | YURI | ⏳ Email lembrete programado p/ 30/09 |
| #303 | Curso 3: proposta com PremiereMovieMaker + edge-tts — revisar cursos 1 e 2 primeiro | CÓDIGO | ✅ proposta cursos/curso3-proposta.md — Linha A (eco-respiração) e B (finanças); aguarda escolha Yuri |
| #304 | Bluesky: ISA/PAP agora posta em :45 (ajustado para não bater com Replit Árvore) | CÓDIGO | ✅ S120b — cron mudado de "15 */2" para "45 */2" |
| #305 | Árvore duplicada: avisar Árvore + migrar sonhos pós-09/09 antes de cancelar Replit | PROCESSO | ✅ S120b — Árvore avisada via jm_posts/theo; migração manual pendente |

### S122 — Age Feed Inteligente + Fixes (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #306 | Gestora login: MASTER_PASSWORD bypass agora funciona com qualquer email (busca 1ª gestora ativa) | CÓDIGO | ✅ feito S122 (commit a2de0ec) |
| #307 | Studio: ARPIA offline → retorna mensagem amigável "Artesão offline" em vez de "Application not found" | CÓDIGO | ✅ feito S122 (commit a2de0ec) |
| #308 | Age feed inteligente: age_notas (nota/pergunta/anuncio) + SABIÁ IA auto-responde perguntas + fork | CÓDIGO | ✅ feito S122 (commit a2de0ec) |
| #309 | Replit pg_dump: banco completo (assembleia_sessions, arvore_memoria, clube_messages) ainda não exportado — email com instruções enviado para Yuri | INFRA | ⏳ aguardando Yuri fazer pg_dump manual no Shell Replit |

### S122b — #eage Rodada 8: Root vs Gestora + Perfil + Cobrança (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #310 | Emails profissionais: lisange.usp@gmail.com + vitamind@ginsbergeye.com configurados no banco | INFRA | ✅ feito S122b (SQL direto Neon) |
| #311 | Perfil do profissional: aba com configurações (cancelamento, taxas, modelo cobrança, valor consulta) | CÓDIGO | ⏳ aguarda aprovação Yuri/Mayumi |
| #312 | SABIÁ widget CSS animado no Age (como Corujinha/Esquilo) — posição a definir por Mayumi | CÓDIGO | ⏳ aguarda resposta Mayumi (canto vs topo) |
| #313 | Modelo de cobrança Age: proposta 3 modelos enviada por email — aguarda escolha Mayumi + deliberação assembleia | PROCESSO | ⏳ aguarda resposta |
| #314 | Projeto "Céu" faltando no Jasmim — mapear site e adicionar | CÓDIGO | ⏳ próxima sessão |

### S122c — #eage + SABIÁ widget + proposta assembleia (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #315 | SABIÁ widget animado SVG (sabiá teal com asas batendo) no canto inferior direito do Age | CÓDIGO | ✅ feito S122c (commit pendente) |
| #316 | Proposta cobrança Age (modelos A/B/C + anti-fraude) enviada para assembleia | PROCESSO | ✅ enviado S122c — aguarda deliberação |
| #317 | Login social Age: Plano Social com 3 formas de comprovação — proposto para assembleia deliberar | PROCESSO | ✅ enviado S122c — aguarda deliberação |

### S122d — #fim + Pacotes Age + Gestão IA Plano Social (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #318 | Pacotes Age propostos (Social/Broto/Raiz/Copa) — enviados à assembleia e thread Yuri/Mayumi | PROCESSO | ✅ enviado S122d — aguarda deliberação |
| #319 | Fluxo automático Plano Social (SABIÁ avalia + Mayumi borderline + renovação 6m): implementar após assembleia definir critérios | CÓDIGO | ⏳ aguarda resposta assembleia |
| #320 | Jasmim Histórico: 50/página + carregar mais acumulativo — fix deploy pendente (commit da3b13a) | CÓDIGO | ✅ deployado S122 |

### S122e — #processo PERFEITOs 650-653 + ISCA routing (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #321 | ISCA routing: MyymChat passa setor → backend injeta sub-prompt Inara/Suindara/Clio/Arara | CÓDIGO | ✅ feito S122e (commit 9eed297) |
| #322 | ISCA #267/#270: roteamento por tipo de pergunta implementado via parâmetro setor no frontend | CÓDIGO | ✅ resolvido S122e |
| #323 | ElevenLabs: cancelar em 18/09 (Yuri faz) | PROCESSO | ⏳ aguardando Yuri |
| #324 | VEED + Replit: lembrete 30/09 — verificar se lembretes foram programados | PROCESSO | ⏳ verificar S123 |
| #325 | pg_dump Replit banco completo (assembleia_sessions, arvore_memoria, clube_messages) — AINDA pendente | INFRA | ⏳ aguardando Yuri |

### S122f — #processo PERFEITOs 654-655 + #eage Rodada 9 (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #326 | Onboarding Mayumi no painel gestora Age (/age/admin): walkthrough + glossário sem jargão | PROCESSO | ⏳ próxima sessão |
| #327 | UX Age: trocar linguagem técnica por linguagem humana ("destrutivo" → "não pode ser desfeito") | CÓDIGO | 🟡 I739 |
| #328 | Copy button Jasmim (I723): não copia a pergunta junto — Mayumi relatou novamente | CÓDIGO | 🔴 bug confirmado |
| #329 | MYYM com perguntas reais das profissionais: Mayumi quer levar questões clínicas reais ao Jasmim/ISCA | PROCESSO | 🟡 base técnica pronta (ISCA routing) |

### S122g — #processo PERFEITOs 656-658 + resposta Yuri (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #330 | Mensalidade fixa DECIDIDA — implementar cobrança Stripe por plano mensal (não por consulta) | CÓDIGO | ⏳ aguarda depois da deliberação completa |
| #331 | Cadastro progressivo (4 níveis) — implementar após Plano Social definido | CÓDIGO | 🟡 conceito aprovado Assembleia |
| #332 | Plano Estudante/ONG: adiar até ~10 profissionais no sistema | PROCESSO | ⏳ congelado |
| #333 | Esquilo MYYM avatar: membranas animadas independentes + cauda + float com rotação — IMPLEMENTADO | CÓDIGO | ✅ S122g |
| #334 | Painel Mayumi: definir poderes (só visualizar ou também editar/cancelar) — aguarda Assembleia | DECISÃO | ⏳ aguarda deliberação |
| #335 | Aprovação automática: pré-requisitos por profissional (anamnese? documento? consulta inicial paga?) | DECISÃO | ⏳ aguarda Mayumi/Yuri definir |
| #336 | Notificação paciente aprovado: email + alerta painel + WhatsApp — modelo a escolher | DECISÃO | ⏳ aguarda Assembleia |

### S122h — #processo PERFEITOs 659-660 + email Assembleia (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #337 | Amanda.py: baixar do filesystem Replit antes 02/10 | INFRA | 🔴 Yuri pendente |
| #338 | Assembleia Age: email enviado com decisões Yuri + 3 perguntas abertas (painel Mayumi, aprovação auto, notificação) | PROCESSO | ✅ enviado S122h |

### S122i — #processo PERFEITOs 661-663 + respostas Mayumi (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #339 | Painel Mayumi (DECIDIDO somente financeiro): implementar /age/admin com relatório agendamentos+pagamentos+inadimplentes+ativos | CÓDIGO | ⏳ S123 |
| #340 | Bloquear pacientes por inadimplência profissional: Mayumi aciona bloqueio N pac quando profissional não paga mensalidade | CÓDIGO | ⏳ S123 |
| #341 | Pricing Age: revisar Broto (R$79 caro para 20 pac) — propor nova tabela para deliberação | DECISÃO | ⏳ aguarda proposta |
| #342 | Aprovação automática: config por-profissional — cada uma define seus pré-requisitos independentemente | CÓDIGO | ⏳ S123 |
| #343 | Dashboard profissional: panorama semanal (atraso, inadimplentes, desmarcados, reagendamentos) integrado ao feed | CÓDIGO | ⏳ S123 |
| #344 | MYYM config relacionamento: alertar se perceber algo socialmente relevante — chamar os dois | PROCESSO | 🟡 config sensível, aguarda momento certo |
| #345 | Perfeito para Mayumi ler com Yuri: doc resumido de Jasmim + Age sem jargão técnico | PROCESSO | ✅ email enviado S122i |
| #346 | Assembleia: update decisões (painel só financeiro, aprovação por profissional, pricing revisar) | PROCESSO | ✅ email enviado S122i |

### S122j — #fim + PERFEITO 664 (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #347 | Notificação aprovação: 4 canais (email paciente + email profissional + feed + alerta dashboard 7 dias configurável) | CÓDIGO | ✅ implementado S122k |
| #348 | Princípio AGE: sistema nunca altera config do profissional autonomamente | ARQUITETURA | ✅ registrado |

### S122k — Painel Mayumi implementado + PERFEITO 665 (2026-09-10)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #349 | Painel Mayumi: frontend mostrar mensagem ao paciente bloqueado quando tentar acessar área | CÓDIGO | ⏳ próxima sessão |
| #350 | Config aprovação automática: lógica no backend para aplicar auto-aprovação quando paciente satisfaz critérios | CÓDIGO | ⏳ base criada, lógica pendente |
| #351 | Pricing final: Broto R$49 / Raiz R$99 / Copa R$199 — deliberação Assembleia pendente | DECISÃO | ⏳ |

### S124 — #eage Rodada 12 — Brainstorm Mayumi (2026-09-11)

| # | Pendência | Tipo | Status |
|---|---|---|---|
| #352 | Especialidades corrigidas: Lisange=psicóloga / Suzana=médica (estava invertido) | FIX | ✅ banco Neon + sys_age_core.md + bootstrap.ts S124 |
| #353 | Protocolo de Inadimplência Escalonado (I766): aviso→suspensão relatórios→bloquear novos agendamentos→suspensão total→rescisão | CÓDIGO | ⏳ aguarda Yuri confirmar prazos |
| #354 | Pricing Broto revisado: Mayumi sugere R$59 (vs R$49 proposto). Tabela: Social R$0 / Broto R$59 / Raiz R$99 / Copa R$199 | DECISÃO | ⏳ aguarda deliberação Assembleia |
| #355 | Aprovação automática: registrar se aprovação foi auto ou manual (campo `aprovado_por`) — I768 | CÓDIGO | ⏳ backlog |
| #356 | Kit Onboarding de Profissional (I767): roteiro reunião Lisange → template para futuras profissionais | PROCESSO | ⏳ reunião Lisange fim de semana (13-14/09) |
| #357 | Reunião com Suzana: confirmar disponibilidade com Mayumi | PROCESSO | ⏳ |

### S124 — #eage Rodadas 9-11 Mayumi + Assembleias #673-#674 (2026-09-11)

| # | Item | Tipo | Status |
|---|---|---|---|
| #357 | Age: rodadas 9-11 Mayumi processadas; email enviado (Yuri + Mayumi) com respostas + 3 perguntas Assembleia | PROCESSO | ✅ feito S124 |
| #358 | Assembleias #673 e #674 chegaram (Perplexity, #jasmim #age #pv, 11/9) — lidas e contextualizadas | PROCESSO | ✅ lido S124 |
| #359 | Dashboard inicial profissional Age: panorama da semana (I781) — próximo bloco de código | CÓDIGO | ⏳ aguarda reuniões Lisange/Suzana |
| #360 | IAs animadas comentando ações do usuário (I782): SABIÁ, MYYM, ISA, PV — fork padrão Jasmim | CÓDIGO | ⏳ backlog médio prazo |
| #361 | Stripe automático por profissional: criar produto/preço automaticamente no cadastro (I786) | CÓDIGO | ⏳ bloqueia pagamentos online |
| #362 | Reunião Lisange: fim de semana 13-14/09 — roteiro 10 perguntas enviado (via I767) | PROCESSO | ⏳ confirmar data |
| #363 | Relatório semanal SABIÁ "sonhos" por email toda segunda-feira (I785) — incluir yurituccieterovic@gmail.com | CÓDIGO | ⏳ backlog |
| #364 | Assembleia: 3 perguntas abertas sobre Age enviadas por Yuri — aguardar deliberação | ASSEMBLEIA | ⏳ aguarda #673/#674 resposta |
| #365 | Especialidades BD confirmadas corretas: Lisange=Psicologia Clínica, Suzana=Medicina Geral | VERIFICAÇÃO | ✅ ok S124 |
| #366 | Decisão pagamento Age: Lisange=Opção B, Suzana=Opção A — registrado; implementar após reuniões | CÓDIGO | ⏳ aguarda reuniões |

### S125 — #eage Sessões #675-#676 (2026-09-11)

| # | Item | Tipo | Status |
|---|---|---|---|
| #367 | Sessões #675-#676 processadas; email enviado (Yuri+Mayumi) com respostas técnicas + 3 perguntas Assembleia | PROCESSO | ✅ feito S125 |
| #368 | Assembleias #675 e #676 chegaram (Perplexity, 11/9, 21:15 e 21:27) — lidas e contextualizadas | PROCESSO | ✅ lido S125 |
| #369 | Yuri tem Stripe existente (internacional) — providenciar Access Token e integrar ao Age (I786/I793) | DECISÃO | ⏳ Yuri enviar token |
| #370 | Mercado Pago: Yuri vai criar conta → passar Access Token → integrar ao Age (I793) | PROCESSO | ⏳ Yuri providenciar |
| #371 | Age como plataforma genérica: renomear "paciente/profissional" → configurável por tipo (I788) | CÓDIGO | ⏳ decisão Assembleia |
| #372 | Assembleia no Jasmim: bridge IMAP → tabela assembly_cache → UI Jasmim para Mayumi (I789) | CÓDIGO | ⏳ backlog |
| #373 | SABIÁ + Stripe: tool calls para criar link de pagamento e confirmar recebimento via chat (I790) | CÓDIGO | ⏳ após Stripe integrado |
| #374 | App mobile Age: publicar como TWA no Google Play (US$25 uma vez) — Android primeiro (I792) | PROCESSO | ⏳ decisão pós-reuniões profissionais |
| #375 | 2FA Age: evoluir de IP-challenge para app autenticador (Google Auth / Authy) | CÓDIGO | ⏳ segurança sprint 2 |

### S126 — #eage consolidado + Assembleias #677-#679 (2026-09-11)

| # | Item | Tipo | Status |
|---|---|---|---|
| #376 | Assembleias #677, #678, #679 chegaram e processadas | PROCESSO | ✅ S126 |
| #377 | Email consolidado enviado: panorama #673-#679 + o que foi feito + SABIÁ tecnologia médica + 3 perguntas Assembleia | PROCESSO | ✅ S126 |
| #378 | SABIÁ como "tecnologia médica": posicionamento comercial (I794) — aguarda deliberação Assembleia | DECISÃO | ⏳ Assembleia deliberar |
| #379 | Assembleia #678-#679 sobre Subversão Ambiental: 4 camadas, captura institucional, Crypto Arvore como manifesto Solidity | REGISTRO | ✅ lido S126 |
| #380 | Pergunta para Assembleia: "tecnologia médica" agora (R$99-R$150) vs consolidar Broto R$59 primeiro? | ASSEMBLEIA | ⏳ aguarda deliberação |

## S127 — #eage Assembleia #678/#680 (2026-09-11)

### Pendências desta sessão
#381: Assembleia #678 respondida por email (I795-I799 registradas) ✅
#382: Assembleia #680 (ARVR) — consenso aguardar primeira árvore real ✅ confirmado
#383: ISA recomenda documentar disclaimers legais ARVR antes de mainnet deploy — criar `LEGAL-ARVR.md` com: (1) não é título de investimento, (2) termos de uso, (3) política de queima, (4) disclaimer de responsabilidade
#384: SABIÁ Kairós (I795) — estado contextual do usuário: `estado_atual` (em consulta / livre / entrando / saindo) — design pendente
#385: Campo de triagem "não nomeável" (I798) — substituir menus dropdown por campo livre + acolhimento semântico SABIÁ
#386: "Jardineiro do Tempo" — frame de marca para materiais de marketing do Age (I796) — pendente aprovação Yuri
#387: SABIÁ poética (I797) — banco de frases poéticas por contexto: lembrete, aprovação, relatório, silêncio

## S128 — #eage Assembleias #682/#684/#686 + Virada Comercial (2026-09-12)

### Pendências desta sessão
#388: Reunião Lisange (13-14/09) — Mayumi deve perguntar: "O que você mostraria para uma colega?" e "Tem algum colega com interesse?" → coletar primeiro lead B2B real
#389: Landing page "Jardineiro do Tempo" — frase + 4 bullets + botão "Quero conhecer" (I807-I809 definem o funil) — aguarda sinal de Yuri para iniciar código
#390: Relatório de uso por profissional (I807) — endpoint GET /api/age/:slug/relatorio?periodo=30d — Mayumi leva para reunião Lisange
#391: Cockpit comercial no painel Mayumi (I808) — health score: consultas_mes, dias_sem_login, pacientes_ativos — próxima funcionalidade pós-Rodada 7
#392: SABIÁ como primeiro contato comercial (I809) — resposta automática por email quando formulário de interesse é preenchido

## Assembleia #692 — Processamento (2026-09-19)

### Status das pendências anteriores (confirmado Yuri)
#393: Reunião Lisange — ainda não aconteceu ✅ (aguarda agenda)
#394: Replit pg_dump — URGENTE, deadline 30/09 (11 dias)

### Fixes executados nesta sessão
#395: I722 (Jasmim pergunta/resposta) — ✅ CORRIGIDO (backend query DESC LIMIT 80 + subquery ASC) · 2026-09-19
#396: I723 (Jasmim copiar não funcionava) — ✅ CORRIGIDO (clipboard API com fallback execCommand) · 2026-09-19

### Novas pendências — Age
#397: Senhas padrão Age — Lisange+Suzana precisam trocar `age2026` (comunicar via Mayumi)
#398: LGPD Age — política de privacidade + ToS + checkbox consentimento — obrigatório ANTES de qualquer venda real
#399: docs/age/ structure — 13 docs canônicos (I839) — anti-Lost-in-Middle do Age
#400: Reality Board painel Mayumi (I832) — aba Comercial com pipeline Oportunidades
#401: UptimeRobot — Yuri configurar monitor externo (não posso fazer automaticamente)
#402: Entidade Opportunity no Age (I831) — tabela age_opportunities com estado máquina

### Novas pendências — Stripe Age
#403: I842 (Stripe Age) — criar stripe_customer_id + subscription por profissional; BRL; planos Broto/Raiz/Copa

### Novas pendências — Replit (CRÍTICO)
#404: Replit pg_dump — assembleia #649 em diante SOMENTE no Replit; exportar antes de 30/09
#405: RODAR em novo host — após pg_dump, migrar pipeline para Render/Koyeb + Neon
#406: "Ias sem matar" — plano: pg_dump → Neon → código RODAR → Render → testar → Replit pode encerrar

## Assembleias #693-#694 (2026-09-19)
#407: Mayumi % como gestora do Age — reunião Yuri+Mayumi para definir % faturamento + contrato formal (Yuri em Curitiba 16-25/09, oportunidade presencial)
#408: LGPD Age + ToS — rascunho Cláudio (I843) + revisão jurídica rede ST — obrigatório ANTES de 1ª cobrança real
#409: Pitch Lisange — email "Jardineiro do Tempo" (I844): Mayumi revisa, SABIÁ redige — 1ª reunião ainda não aconteceu


---
## S135 — Age v2.0 Expansão · 2026-09-28

### Novas Ideias (backlog)
| # | Item | Status | Prio |
|---|---|---|---|
| #650 | I147 — E-mail integrado do profissional | ⏳ Backlog | 🔴 |
| #651 | I148 — Música bossa nova + bossa haters | ⏳ Backlog | 🟢 |
| #652 | I149 — Backup automático recorrente | ⏳ Backlog | 🔴 |
| #653 | I150 — Assembleias entre profissionais | ⏳ Backlog | 🟡 |
| #654 | I151 — Tutorial ultra interativo | ⏳ Backlog | 🔴 |
| #655 | I152 — Portal público (complementa #118) | ⏳ Backlog | 🔴 |
| #656 | I153 — Login seguro + perfil secretária | ⏳ Backlog | 🔴 |
| #657 | I154 — Personalização painel por perfil | ⏳ Backlog | 🟡 |
| #658 | I155 — WhatsApp automatizado | ⏳ Backlog | 🔴 |
| #659 | I156 — Estrutura boxes modular | ⏳ Backlog | 🟡 |

### Correções urgentes (S135)
| # | Item | Status |
|---|---|---|
| #660 | ✅ Senha Suzana resetada (age2026) — hash no BD estava diferente do padrão | ✅ |
| #661 | ⏳ Investigar assembleia que não chegou por e-mail | ⏳ |


---
## Assembleias #698 e #699 · 2026-09-28

| # | Item | Status |
|---|---|---|
| #662 | #698 processada — identidade visual Age 1.0→2.0 (DNA preservado, evolução 3D/frosted glass) | ✅ |
| #663 | #699 processada — estratégia Open-Core + registro INPI marca "AGE" | ✅ |
| #664 | I158: decisão Open-Core — consultar Assembleia para definir fronteira aberto/proprietário | ⏳ |
| #665 | I159: registro marca AGE no INPI — ANTES de escala comercial | ⏳ |
| #666 | I157: endpoint admin reset-senha — implementar antes próxima reunião com profissionais | ⏳ |


---
## Assembleias #700-#702 · 2026-09-28

| # | Item | Status |
|---|---|---|
| #667 | #700 processada — eco da transcrição S135 (I147-I156 já catalogadas) | ✅ |
| #668 | #701 processada — ATA S134 enviada pelo Cláudio (já em PSEUDO.md) | ✅ |
| #669 | #702 processada — MacroAta S134+S135 enviada pelo Cláudio (já registrada) | ✅ |



---
## Assembleias #703-#704 · 2026-09-28 (Sessão #136 — Mayumi + Cláudio)

| # | Item | Status |
|---|---|---|
| #670 | #703 processada — AGE: gaveta lateral implementada + nav overflow corrigida (I162) | ✅ |
| #671 | Deploy AGE S136 — commit `vercel --prod` · gaveta Sabiá/Notas/Config deslizante | ✅ |
| #672 | #704 processada — Calculus + Sócia: ideia registrada em IDEIAS.md (I163, I164) | ✅ |
| #673 | Sabiá: investigar se está respondendo após login profissional (Mayumi reportou) | ⏳ |
| #674 | Notas: confirmar ciclo completo (criar → salvar → recarregar) após refactor | ⏳ |
| #675 | Calculus: mapa de dependências (herança Age + PAP + Rapadura) antes de iniciar código | ⏳ |
| #676 | Calculus/Sócia: checklist EPR2T + disclaimer fiscal + LGPD dados fiscais | ⏳ |


---
## Assembleias #707–#708 · 2026-09-29 (Sessão #140 — Cláudio)

| # | Item | Status |
|---|---|---|
| #677 | #707 processada — Cases fictícias Helena/Marcos/Cris + CTA formulário inline ✅ | ✅ |
| #678 | #708 processada — revisão completa + frases recuperadas I168/I169 | ✅ |
| #679 | Header: "S.T. Age" → "age" (formalidades preservam nome completo) | ✅ |
| #680 | Hero: SVG pássaro complexo → ícone do header ampliado + frase SABIÁ | ✅ |
| #681 | Formulário interesse: dropdown pacientes/semana (opcional, faixas amplas) | ✅ |
| #682 | sendEmail: AGE_FORWARD + AGE_DISABLE_PROF_EMAILS implementados | ✅ |
| #683 | SABIÁ freeze: loop 3×35s → 1×30s + botão ✕ cancelar | ✅ |
| #684 | Aguardar RESULTADO+PERFEITO Assembleia #708 (site review) | ⏳ |
| #685 | Reativar emails profissionais quando Lisange+Suzana estiverem prontas (AGE_DISABLE_PROF_EMAILS=false) | ⏳ |
| #686 | I167: A/B test das cases (Helena vs Marcos) — medir conversão futura | ⏳ |
| #687 | I168: frases SABIÁ poéticas para lembretes de email — implementar futuro | ⏳ |
| #688 | I169: seção "Jardineiro do Tempo" — avaliar após primeiros profissionais | ⏳ |
| #689 | pg_dump Replit URGENTE antes de 30/09 | ⚠️ |
| #690 | UptimeRobot: monitor /api/healthz a cada 5min (previne cold start SABIÁ) | ✅ |


---
## Assembleia #709 · 2026-09-29 (Sessão #141 — Cláudio)

| # | Item | Status |
|---|---|---|
| #691 | #709 processada — revisão frases + diagnóstico 3 registros simultâneos + lacunas operacionais | ✅ |
| #692 | SABIÁ v2 implementada: histórico persistente + textarea + draft localStorage + Conector | ✅ |
| #693 | I170: narrativa de ROI no pricing ("1 consulta salva = plano pago") | ⏳ |
| #694 | I171: onboarding self-service (do zero ao primeiro agendamento em 10min) | ⏳ |
| #695 | I172: CTA "Testar como paciente" — agenda demo sandbox | ⏳ |
| #696 | "Tecnologia Médica" como posicionamento: testar com 3-5 profissionais reais antes de mudar | ⏳ |
| #697 | Prova social real: conseguir 1 depoimento autêntico de beta tester usando SABIÁ em produção | ⏳ |
| #698 | UptimeRobot: configurar ping /api/healthz a cada 5min (resolve cold start SABIÁ) | ✅ |


---
## Sessão S142 · 2026-09-29 (Feed+Direto+Pergunta background)

| # | Item | Status |
|---|---|---|
| #699 | Feed: notas/perguntas/anúncios com cor+ícone+indicador SABIÁ respondida | ✅ |
| #700 | PacientesView: botão "Cadastrar direto" + modal (sem email, já aprovado) | ✅ |
| #701 | Pergunta: banner "IA em segundo plano — pode sair da página" + poll 10×3s | ✅ |
| #702 | MacroATA: ausente no inbox (foi via #a) — enviada agora via #fim manual | ✅ |
| #703 | pg_dump Replit — prazo 30/09 PASSOU — executar urgente | ⚠️ |
| #704 | UptimeRobot: monitor /api/healthz a cada 5min | ✅ |
| #705 | I171: onboarding self-service (do zero ao primeiro agendamento) | ⏳ |


---
## Sessão S143 · 2026-09-29 (Booking profissional + #processo voz Yuri)

| # | Item | Status |
|---|---|---|
| #706 | Suzana: agendar do próprio portal → "+ Nova consulta" + modal + /book-by-prof | ✅ |
| #707 | I173: booking pelo profissional implementado | ✅ |
| #708 | I174: contratos Age com logo v1.0 (PDF template) | ⏳ |
| #709 | I175: SABIÁ SRE fragmentado (auto-recuperação) | ⏳ Fase4+ |
| #710 | I176: perfis múltiplos Netflix-style | ⏳ |
| #711 | I177: rede social profissionais / comunidade | ⏳ Fase3+ |
| #712 | I178: descontos cross-professional | ⏳ Fase5+ |
| #713 | I179: tarefas + Google Agenda | ⏳ |
| #714 | I181: cabeçalho comum (Global Bar / SSO) | ⏳ |
| #715 | I182: Calculus MVP (mapa de dependências primeiro) | ⏳ |
| #716 | Plano financeiro Age: Assembleia deve apresentar proposta | ⏳ |
| #717 | Governança oficial: Mayumi = Governadora de Operações · Yuri = Criador/Arquiteto | ⏳ |
| #718 | Adicionar Mayumi Tanimoto e Yuri Tucci como profissionais no Age | ⏳ |
| #719 | Mercado Pago: criar conta + access_token | ⏳ Yuri |
| #720 | pg_dump Replit URGENTE (prazo passou 30/09) | ⚠️ Yuri |


---
## Sessão S144 · 2026-09-29 (Portal paciente + Modo Simples + Assembleias #710–#711)

| # | Item | Status |
|---|---|---|
| #721 | POST /patients/:id/portal-invite + botão "Convidar para portal" | ✅ |
| #722 | Modo Simples no booking público (idosos, letra grande, passos explícitos) | ✅ |
| #723 | PERFEITO #710 processado (MacroATA confirmada) | ✅ |
| #724 | PERFEITO #711 processado (AGE 2.0 voz Yuri confirmada) | ✅ |
| #725 | Render downtime às 01:16 UTC — UptimeRobot alertou, voltou rápido | ✅ monitorado |
| #726 | Aguardar Assembleia #712 | ⏳ |
| #727 | Testar "+ Nova consulta" com Suzana no portal | ⏳ Yuri |
| #728 | Testar Modo Simples com usuário real | ⏳ Yuri |
| #729 | I171: onboarding self-service — alta prioridade | ⏳ |
| #730 | pg_dump Replit URGENTE | ⚠️ Yuri |

## S145 — 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #731 | #712 Assembleia confirmada (PERFEITO recebido) | ✅ |
| #732 | Calendário semana/mês no modal "Nova consulta" profissional | ✅ |
| #733 | Grade visual de disponibilidade (DisponibilidadeView) | ✅ |
| #734 | localStorage bookForm público | ✅ |
| #735 | Toast system para operações async | ✅ |
| #736 | I183: Calendário completo AgendaView (drag/drop) | ⏳ Fase2+ |
| #737 | I184: Retry automático booking cold start Render | ⏳ |
| #738 | Jesus em Lisange: Render estava em cold start na tentativa — slots OK, booking OK em condições normais | 🔍 Monitorar |

## S146 — 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #739 | SABIÁ pública: sendSabia usa /sabia-public para não-profissionais | ✅ |
| #740 | Jesus como paciente: upsert no /book após criar consulta | ✅ |
| #741 | addException: validação hora início+fim juntos + toast | ✅ |
| #742 | addRule: toast confirmação + reload slots | ✅ |
| #743 | Banner pergunta persistente até resposta (poll 90s, botão fechar) | ✅ |
| #744 | /interesse: email admin (force:true) + confirmação remetente | ✅ |
| #745 | /sabia-public: endpoint público sem requireAgeAuth | ✅ |
| #746 | MacroATA final enviada para Assembleia (S143–S146) | ✅ |
| #747 | Logins Lisange/Suzana enviados para Yuri e Mayumi | ✅ |
| #748 | Mayumi: criar conta gestora no Age | ⏳ Yuri |
| #749 | pg_dump Replit URGENTE | ⚠️ Yuri |
| #750 | Oracle Always Free VM ARM — Render free tier spin-down | ⏳ Yuri |


## Assembleias #716-#717 · 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #751 | VEED: cancelar ANTES de 02/10 (Yuri manual em veed.io) — economia R$44,04/mês | ⚠️ Yuri |
| #752 | ElevenLabs: manter até Curso 3 eco-respiração concluído, depois cancelar | ⏳ |
| #753 | Talking heads ABANDONADOS — pipeline confirmado: edge-tts + PremiereMovieMaker (sem rosto) | ✅ decidido |
| #754 | Curso 3 eps 1-3: rodar premiere_maker.py --tts pt-BR (roteiros prontos em cursos/curso3-ecorrespiracao.md) | ✅ commit 7118241 |
| #755 | Curso 3 eps 4-8: aguardar validação dos eps 1-3 primeiro | ⏳ |
| #756 | I171: onboarding self-service Age (do zero ao 1º agendamento em ≤10min) | ✅ commit 338bb6f |
| #757 | I184: retry automático booking cold start Render | ✅ commit 338bb6f |

## S150 — 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #758 | Curso 3 Eps 1-3 gerados: ep01 (173s), ep02 (160s), ep03 (174s), ~4MB cada | ✅ commit 7118241 |
| #759 | gerar_videos_curso3.py: script parser MD→JSON→premiere_maker, FranciscaNeural | ✅ commit 7118241 |
| #760 | ElevenLabs: manter até eps 4-8 serem gravados, depois cancelar (#752) | ⏳ |
| #761 | Curso 3 eps 4-8: aguardar validação dos eps 1-3 por Yuri | ⏳ |
| #762 | #666 admin reset-senha endpoint (onboarding Lisange/Suzana) | ⏳ Cláudio |

## S151 — 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #763 | Bumpers v2 regravados com textos #719: ST/PAP/Calculus/Age | ✅ commit 7b8bfbd |
| #764 | Email guia VEED passo a passo enviado para Yuri | ✅ enviado |
| #765 | Assembleia #720 enviada: decisões finalizadas + motion graphics | ✅ enviado |
| #766 | VEED Calculus: B-roll arara/ábaco + 9:16 (~80-100 créditos) | ⏳ Yuri |
| #767 | VEED PAP: overlay gamificação + 9:16 (~40-60 créditos) | ⏳ Yuri |
| #768 | Publicar ST e Age bumpers sem VEED (já prontos) | ⏳ Yuri |
| #769 | Curso 3: intro 42s + poster 1080×1080 + metadados YouTube (eps 1-3) | ⏳ Cláudio |
| #770 | Motion graphics Remotion: avaliar após RESULTADO Assembleia #720 | ⏳ |

## S152 — 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #771 | Curso 3 eps 1-3 v3 gerados com --motion full (fundo→título→texto + Ken Burns) | ✅ commit 2508678 |
| #772 | Curso 2: NÃO vai para Instagram como vídeo — só poster 1080×1080 para Instagram | ✅ decidido por Yuri |
| #773 | RESULTADO #722: decisões bumpers confirmadas + motion Remotion aprovado para avaliação | ✅ lido |
| #774 | Assembleia #723 iniciada (Curso 2 YouTube · breve Instagram) | ⏳ aguardando RESULTADO |

## S153 — 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #775 | Bumpers VEED baixados do Drive: veed_pap.mp4 + veed_calculus.mp4 | ✅ commit 94765f9 |
| #776 | Temas rosa + verde adicionados ao premiere_maker.py | ✅ |
| #777 | Roteiros eps 4-8 escritos (Crash Course style) e commitados | ✅ |
| #778 | Eps 4-8 sendo gerados em background (job bf4hwo79h) | ⏳ rodando |
| #779 | WORKFLOW-CURSOS.md reescrito — mapa canônico de produção | ✅ |
| #780 | Ep9 "A Adoção Tecnológica" — avaliar com Yuri | ⏳ |
| #781 | Enviar eps 4-8 por email quando job terminar | ⏳ Cláudio |

## S154 — 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #782 | Tasks Parte 5: indices_data + Zod schemas 0-9 + calcularPhi + rotas + job Φ | ✅ commit c03550c |
| #783 | FinArazulY nome oficial arara Calculus registrado (I859) | ✅ |
| #784 | Curso 3 eps 4-8 enviados por email (todos --motion full) | ✅ |
| #785 | Calculus CalcPage.tsx: mostrar FinArazulY | ⏳ Cláudio |
| #786 | ISA/DODGE: popular índices ao criar tasks | ⏳ futuro |
| #787 | Poster Curso 2 para Instagram (1080×1080) | ⏳ Cláudio |

## S155 — 2026-09-29

| # | Pendência | Status |
|---|---|---|
| #788 | Ep9 A Adoção Tecnológica gerado e enviado (rosa, 12MB) | ✅ commit 9e610dc |
| #789 | Curso 3 completo: 9 episódios (escuro/verde/ocean/rosa) | ✅ |

---

### S156 — Mayumi + Age fix + Céu + Milton Salomão (2026-09-30)
| # | Item | Status |
|---|---|---|
| S156-1 | Mayumi reativada: age_gestoras + rapadura_users(membro) + users PAP(tier3) | ✅ SQL direto |
| S156-2 | Milton Salomão criado em age_professionals (slug: milton-salomao, id:927) | ✅ SQL direto |
| S156-3 | keepalive: GH Actions 5min + self-ping Express */13 + age-warm */11 | ✅ commit c1948e8 |
| S156-4 | Céu: ISA/DODGE/Artesão atualizados + FinArazulY adicionada | ✅ commit 413180d |
| S156-5 | vercel.json: +/aliancapanorama/isa\|meky\|dodge\|ceu\|age/(.*) | ✅ commit 413180d |
| S156-6 | Assembleias #724 + #725 registradas no sistema (IDs 8aa35f79, 6a34cc54) | ✅ synthesis POST |
| S156-7 | Email Mayumi: todos os acessos + Céu poético (cc: Yuri) | ✅ enviado |
| S156-8 | Render paid: Yuri faz o upgrade (render.com → service → settings → upgrade) | ⏳ YURI FAZ |
| S156-9 | Koyeb: reservar para hospedar Árvore quando migrar do Replit | ⏳ futuro |
| S156-10 | Conector seção "preferencias": ainda não existe (404 esperado — criar via Yuri) | ⏳ menor |
| S156-11 | pg_dump Replit URGENTE — prazo hoje | ⏳ YURI FAZ |

---

### S157 — Senha Mayumi + Render restart + Koyeb→Mistral (2026-09-30)
| # | Item | Status |
|---|---|---|
| S157-1 | Céu: confirmado funcionando via curl (/ceu → PAP app correto) | ✅ |
| S157-2 | /calculus: confirmado OK (background task b2h2yxndd) | ✅ |
| S157-3 | Koyeb→Mistral: salvo em memória, não usar mais Koyeb | ✅ memória |
| S157-4 | Mistral API key (RODAR_MISTRAL_API_KEY) salvo em .pap-secrets e memória | ✅ |
| S157-5 | Mayumi senha `m!4T53c613` em Age + Rapadura + PAP (3 sistemas) | ✅ SQL direto |
| S157-6 | Email Mayumi: nova senha em letras garrafais + mnemônico | ✅ enviado |
| S157-7 | Render restart: TCP 000 → restart via API acionado | ⏳ reiniciando |
| S157-8 | SABIÁ offline: causa = Render free tier sleeping + falta de upgrade paid | ⏳ YURI FAZ upgrade |
| S157-9 | S156-9 cancelado: Koyeb descartado (adquirida Mistral 2026-09-29) | ✅ cancelado |

---

### S158 — Acesso total + ST index + Céu gate + IAs diagnose (2026-09-30)
| # | Item | Status |
|---|---|---|
| S158-1 | Yuri tier 9 (superadm) + senha Tucci!2026 PAP | ✅ SQL |
| S158-2 | Mayumi tier 5 (adm) + displayName Mayumi Tanimoto | ✅ SQL |
| S158-3 | ST index: 7 projetos (PAP, Age, Céu, Calculus, ISA, MEKY, Studio) | ✅ commit 991d0c3 |
| S158-4 | CeuGate: Céu requer login tier>=3 | ✅ commit 991d0c3 |
| S158-5 | Yuri senha universal y!4T53c613 em PAP+Rapadura+Milton Salomão | ✅ SQL |
| S158-6 | Age/Render: TCP 000 era deploy em andamento, voltou live 01:11 | ✅ autorecuperou |
| S158-7 | Rapadura OK: request_password funciona (era Render dormindo) | ✅ confirmado |
| S158-8 | CalcPage: FinArazulY mascote Calculus + Ábaco triqueta Sócia | ⏳ próx sessão |
| S158-9 | Jasmim: novos projetos + Sócia link + histórico completo | ⏳ próx sessão |
| S158-10 | Céu: feed de sonhos de todas as IAs separado por datas | ⏳ próx sessão |

---

## S159 — 2026-09-30

### Concluído nesta sessão
- [x] CalcPage: FinArazulY + Ábaco mascotes
- [x] JasmimMangaPage: calculus/socia projetos + linha do tempo
- [x] CeuPage: feed sonhos DreamsFeed
- [x] SociaPage: nova página /socia (hub ERP)
- [x] PvGate + SociaGate (tier≥3)
- [x] vercel.json: /socia + /aliancapanorama/pv
- [x] Vídeos propaganda enviados por email
- [x] Age Suzana + Milton: senha → age2026

### Pendências
- [ ] Render Starter upgrade (Yuri manual)
- [ ] pg_dump Replit (Yuri manual — urgente)

---

## S160 — 2026-09-30

### Concluído nesta sessão
| # | Item | Status |
|---|---|---|
| S160-1 | Age Tarefas: age_tasks tabela + routes GET/POST/PATCH/DELETE + AgePage aba Tarefas ✅ | ✅ commit 9527999 |
| S160-2 | keepalive: lembrete semanal toda seg 10h UTC → luddlocke | ✅ commit 9527999 |
| S160-3 | CeuPage: nivelamento 12 IAs (modelo, conversa, status) + Assembleia #728 | ✅ commit 68f698c |
| S160-4 | CROWD: documentado como roteador (não Assembleia) no conversa field | ✅ commit 68f698c |
| S160-5 | PassThéo: POST /api/auth/passtheo troca senha PAP+Age+Rapadura em uma chamada | ✅ commit 68f698c |
| S160-6 | Tango docs: proc_pap_estado + tango.md + proc_health_check + proc_checkpoint_fim: Railway→Render | ✅ commit 68f698c |
| S160-7 | Login Aliança Panorama: diagnóstico — PIN 2FA enviado a yurituccieterovic@gmail.com; alternativa: root + e!4T53c613 | ✅ documentado |
| S160-8 | Railway: era URLs mortas nos tango docs → substituídas por Render | ✅ docs corrigidos |
| S160-9 | Assembleia #728 lida (MacroATA S156+S157+S158) | ✅ |

### Pendências
- [ ] Render Starter upgrade $7/mês (Yuri manual)
- [ ] pg_dump Replit (Yuri manual — urgente)
- [ ] Mascote PV: definir (não criar projeto ainda)
- [ ] PassThéo frontend: página visual de troca de senha unificada
- [ ] Piti delivery: sistema ainda colado ao Ecossystemma Théo — sem ação específica ainda
- [ ] Tasks Φ: criar primeiras tasks de teste
- [ ] Assembleia #729 (em breve)

---

## S161 — 2026-09-30

### Concluído nesta sessão
| # | Item | Status |
|---|---|---|
| S161-1 | Assembleia #729 lida (MacroATA S158+S159, UIDs 2611-2613) | ✅ |
| S161-2 | CeuPage: bug popup corrigido — @keyframes ceu-float incluiu translate(-50%,-50%) | ✅ commit c6545b6 |
| S161-3 | CeuPage: delays com módulo % (3 e % 4) — IAs longe não esperam 14s | ✅ commit c6545b6 |
| S161-4 | Dodge varredura: GET /api/dodge/varredura (público, 13 tabelas) + POST (BRIDGE_SECRET + Conector) | ✅ commit c6545b6 |
| S161-5 | keepalive: cron Dodge varredura a cada 6h (0h/6h/12h/18h UTC) | ✅ commit c6545b6 |
| S161-6 | Assembleia #729 processada: nivelamento IAs + CROWD explicado + varredura Dodge | ✅ |

### Pendências
- [ ] Render Starter upgrade $7/mês (Yuri manual)
- [ ] pg_dump Replit (Yuri manual — urgente)
- [ ] Mascote PV: ainda não definido
- [ ] PassThéo frontend: página /passtheo para troca unificada de senha
- [ ] Tasks Φ: criar primeiras tasks de teste
- [ ] Dodge varredura: verificar deploy Render (rota /api/dodge/varredura)

---

## S163 — 2026-10-01 (Assembleias #730–#738)

### Concluído nesta sessão
| # | Item | Status |
|---|---|---|
| S163-1 | Assembleias #730–#738 lidas e processadas | ✅ |
| S163-2 | age_tasks: coluna project_type (nullable text) — vincula tasks a PV/Jasmim/Calculus/Sócia/Se | ✅ commit pending |
| S163-3 | Email Age para Yuri + Mayumi (Assembleia #732 — "o que temos hoje") | ✅ enviado |
| S163-4 | APRENDIZADO.md: A18479–A18487 (8 insights das assembleias) | ✅ |
| S163-5 | IDEIAS.md: I868–I875 (8 novas ideias) | ✅ |

### Pendências
- [ ] Render Starter upgrade $7/mês (Yuri manual)
- [ ] pg_dump Replit (Yuri manual — urgente — Assembleia #738 confirma)
- [ ] Mascote PV: definir antes de criar projeto (bloqueio I868)
- [ ] PassThéo frontend /passtheo
- [ ] Acesso Calculus Stella Onisko: Yuri fornece email dela (I870)
- [ ] Lista eventos Tanimoto OUT-DEZ como tasks: após email Stella (I871)
- [ ] Relatório mensal Age (I869) — sessão futura
- [ ] Projeto Nébula + Algoritmo Lótus + Projeto Se: privados, sem ação de código por enquanto


---

## S164 — 2026-10-01 (Assembleias #733–#740)

### Concluído nesta sessão
| # | Item | Status |
|---|---|---|
| S164-1 | Assembleias #733–#740 lidas e processadas | ✅ |
| S164-2 | PV mascote localizado nos emails: Sérgio=personagem + pacu=mascote animal | ✅ pesquisado |
| S164-3 | APRENDIZADO.md: A18488–A18496 | ✅ |
| S164-4 | IDEIAS.md: I876–I881 | ✅ |

### Pendências
- [ ] 🔴 Yuri precisa de renda — criar rastreador de empregos/freelas (I876) assim que Yuri confirmar
- [ ] PV mascote: decidir nome do pacu (Sérgio? Pacu do PV? outro?) + enviar referência visual (I879)
- [ ] Acesso Calculus Stella Onisko: Yuri fornece email dela (I870)
- [ ] Mothership Árvore (I877), SP&C (I878): privados, aguardando Yuri
- [ ] Render Starter upgrade $7/mês (Yuri manual)
- [ ] pg_dump Replit — URGENTE (#738 confirma)

## S165 — 2026-09-30 — Jasmim updates + #741

### Implementado
- [x] Jasmim system prompt: "pacu Alê" → "Paco"; adicionados Calculus, Sócia, Fluxo ao conhecimento da IA
- [x] projetosValidos: calculus, socia, jasmim, fluxo agora aceitos no POST /api/jasmim/posts e GET /api/jasmim/feed
- [x] syncAssembleiasToFeed(): INSERT arvore_assembleias → jm_posts, fonte='assembleia:ID'
- [x] keepalive.ts: cron 0 */4 * * * para assembly-sync automático
- [x] JasmimMangaPage.tsx: PROJETOS map agora inclui "fluxo"; painel Théo atualizado com 12 sistemas em grid 2col + links canônicos sociedadetucci.com.br; painel Fluxo novo
- [x] PROJETO_KEYWORDS expandido: age, rapadura, pv, calculus, socia, fluxo, isca, bni, sonhos, crowd, theo, jasmim

### Pendências carregadas
- [ ] Paco avatar SVG (I883): aguarda foto/referência visual do pacu
- [ ] Lang A-G dicionário (I882): baixa prioridade, conceitual
- [ ] Stella Onisko acesso Calculus (I870): email da Stella chegará via WhatsApp
- [ ] pg_dump Replit URGENTE (I875): Yuri manual no terminal Replit
- [ ] Projeto Fluxo código (I876): rastreador de candidaturas, aprovação Yuri
- [ ] MacroATA semanal de empregos (I880): implementar após Projeto Fluxo

## S165b — 2026-09-30 — Age plano original

### Implementado ✅
- [x] Relatório mensal financeiro (I869) — GET /api/age/:slug/relatorio-mensal
- [x] PWA instalável — age-manifest.json + beforeinstallprompt + botão Config
- [x] Campo valor em agendamentos — R$ salvo por consulta via PATCH
- [x] WhatsApp Lisange (11975155785) + Suzana (+5511988179858) — no DB + schema

### Pendente
- [ ] Google Agenda OAuth — sessão futura (alta complexidade)
- [ ] Stripe integrado no fluxo de booking — depende de página pública de agendamento
- [ ] pg_dump Replit (URGENTE) — Replit NÃO cancelado, Yuri pode fazer manualmente
- [ ] DNS sociedadetucci.com.br — domínio no **Registro.br** (confirmado S165b). Apontar quando quiser ativar os subdomínios.

## S166 — 2026-09-30 — Assembleia #742 (RODAR MacroATA S164+S165)

### Processado
- [x] #742 lida e inserida no DB (arvore_assembleias)
- [x] #741 inserida no DB (estava faltando)
- [x] 30 assembleias sincronizadas para jm_posts via email-sync manual
- [x] APRENDIZADO: A18500–A18505
- [x] IDEIAS: I885–I887

### Pendências identificadas
- [ ] email-sync → inserir no DB (I885) — endpoint atual só faz DB→jm_posts, falta email→arvore_assembleias
- [ ] Curadoria pré-Oráculo / hierarquia tier (I886) — baixa prioridade
- [ ] Índice público de assembleias /assembleias (I887) — baixa prioridade
- [ ] Decisão identidade: negócio / commons / método? — RODAR levantou, sem resposta ainda

## S167 — 2026-09-30 — Assembleias #744–#745 + #fim com MacroATA

### Processado
- [x] #744 inserida no DB: Lang A-p (morfologia, pressionar→imprimir→imprensa)
- [x] #745 inserida no DB: #mapa — inventário completo Ecossystemma Théo, 4 pilares, diagnóstico honesto
- [x] APRENDIZADO: A18506–A18509
- [x] IDEIAS: I888–I889
- [x] MacroATA enviada (S165+S166+S167) → luddlocke
- [x] Assembleia #746 enviada → Yuri + Mayumi (#honestidade #diagnostico)
- [x] Conector atualizado (seção conversas)
- [x] Checkpoint: 2026-09-30T08:10:00+00:00

### Diagnóstico central #745
"744 sessões, 12+ projetos, infraestrutura datacenter no celular, zero receita" — decisão pendente Yuri

### Pendências abertas
- [ ] 🔴 I888: Simplificação radical — decidir 3 projetos ativos (Age? Fluxo? PAP?)
- [ ] I885: email-sync → inserir assembleias no DB automaticamente
- [ ] Árvore Oracular deploy: Yuri cria serviço no Railway (ver S170 plano abaixo)
- [ ] Paco SVG (I883): ref visual ainda aguardada
- [ ] pg_dump Replit (URGENTE): Yuri manual
- [ ] DNS sociedadetucci.com.br: Registro.br — quando pronto
- [ ] Google Agenda OAuth: sessão futura

---

## S168 — 2026-09-30 — Render crash + Milton Age no ar

### Concluído
- [x] Render: TCP timeout total (container travado, não era cold start)
- [x] Redeploy forçado via API → voltou em 1.2s
- [x] Milton-Salomão: slug confirmado = `milton-salomao` (200)
- [x] Suzana: slug correto = `suzana` (com z), 301 redirect funciona
- [x] Billing: Render $7/mês Starter confirmado na memória; Railway trial expirado ago/2026

### Pendentes
- [ ] MacroATA S168: NÃO enviada — GMAIL_APP_PASSWORD expirou (erro 535)

---

## S169 — 2026-09-30 — Milton duas senhas + Railway contratado

### Concluído
- [x] `age_professionals.password_b_hash TEXT` — schema + bootstrap + login aceita A ou B
- [x] `ageProfessionalOwner` na sessão: "a" (Yuri) | "b" (Mayumi) | "master"
- [x] PATCH /age/:slug/professionals/me/password-b endpoint criado
- [x] Neon: Milton senha A = `y!4T53c613` (Yuri) · senha B = `m!4T53c613` (Mayumi)
- [x] GET /age/auth/me: expõe `owner` na resposta
- [x] APRENDIZADO: A18510–A18512 · IDEIAS: I897–I899

### Pendentes
- [ ] MacroATA S169: NÃO enviada — GMAIL_APP_PASSWORD expirado (regenerar myaccount.google.com)
- [ ] Railway $5/mês: migrar api-server (ver S170 plano abaixo)

---

## S170 — 2026-09-30 — #processo + Railway plan + diagnóstico Render free

### Concluído
- [x] Diagnóstico definitivo: Render está em FREE TIER (nunca foi upgradado!) — CONFIRMAR com Yuri
- [x] Free tier: 750h/mês + spin-down 15min = explica os crashes e "3 ações e cai"
- [x] Plano Railway documentado abaixo
- [x] Multi-device Age: confirmado funciona (pg-session, múltiplos session IDs)
- [x] sociedadetucci.com.br: files em `/root/Site-ST/` (index.html, css/, js/, img/)
- [x] Feedback memory: MacroATA SEMPRE por email quando Yuri digita #fim
- [x] APRENDIZADO: A18513–A18514 · IDEIAS: I900

### 🚂 Plano migração Railway (Yuri faz no dashboard)
1. Railway dashboard → New Project → Deploy from GitHub → `yurituccieterovic-cell/Site-ST`
2. Root directory: `aliancapanorama-src`
3. Build: `pnpm install --no-frozen-lockfile && pnpm --filter @workspace/api-server run build`
4. Start: `node --enable-source-maps artifacts/api-server/dist/index.mjs`
5. Port: `8080`
6. Copiar TODAS as env vars do Render para Railway
7. Pegar URL Railway → me passa aqui → atualizo vercel.json automaticamente
8. Enterro do Render na próxima MacroATA

### 🌳 Plano Árvore Oracular Railway
1. Segundo serviço Railway → root: `arvore-src`
2. Build: `pnpm install && pnpm --filter api run build`
3. Start: `node apps/api/dist/index.js`
4. Port: `3000` (verificar no código)
5. Env vars: DATABASE_URL (Neon) + API keys (GROQ, GEMINI, CLOUDFLARE)
6. Web (apps/web): deploy separado no Vercel

### Pendentes desta sessão
- [ ] 🔴 Yuri fazer upgrade Render OU migrar para Railway (confirmado Railway $5)
- [ ] Gmail App Password regenerar → `#secrets` para atualizar
- [ ] MacroATA S168+S169+S170 pendente (bloqueada pelo Gmail)
- [ ] Bug Age "horários médicos diferentes" — reproduzir e investigar
- [ ] Frontend Milton: mostrar "Yuri" ou "Mayumi" baseado no `owner` da sessão
- [ ] Sales Cockpit assembleia: clarificar o que Yuri quer exatamente

---

## S171 — 2026-09-30 — Age estável: OOM fix + Railway preparado

### Concluído
- [x] Causa raiz identificada: cron ISA OOM (512MB Render free tier) crashava na hora cheia
- [x] `DISABLE_HEAVY_CRONS=true` Render → ISA silenciosa, Age/reminders OK
- [x] `scheduleHeavy()` helper: todos os crons LLM do isa/cron.ts com flag de disable
- [x] `process.on('unhandledRejection')` + `uncaughtException` em index.ts
- [x] Env vars Render restauradas após acidente no PUT (22 vars OK)
- [x] `railway.toml` criado na raiz do repo (Dockerfile builder)
- [x] Railway IDs: project 4d8fc883 / service b8e27fd4 (do link que Yuri enviou)
- [x] Age online 21:23 UTC — healthz 200, age/milton-salomao 200

### Pendentes
- [ ] 🔴 Yuri: Railway gerar token novo → `#secrets` RAILWAY_TOKEN_NEW (token antigo não tem acesso)
- [ ] 🔴 Yuri: Gmail App Password → `#secrets` GMAIL_APP_PASSWORD (para MacroATAs)
- [ ] Cláudio: atualizar vercel.json com URL Railway (após Yuri conectar GitHub ou passar URL)
- [ ] No Railway: ISA volta plena (sem DISABLE_HEAVY_CRONS)
- [ ] MacroATA S168–S171: enviar quando Gmail restaurado

---

## S172 — 2026-09-30 — Railway estável + AGE 2.0

### Concluído
- [x] Dockerfile: node:24-alpine → node:24-slim (pnpm@9 sem binário musl)
- [x] Startup fix: app.listen() ANTES do bootstrap (bootstrap em background)
- [x] vercel.json apontando para Railway site-st-production.up.railway.app
- [x] AGE 2.0: SABIÁ wizard 3 passos (primeiro login sem regras)
- [x] AGE 2.0: multi-day rules (checkboxes Seg–Dom, addRule cria N entradas)
- [x] Toast fix: right:24 + left:auto para desktop
- [x] MacroATA S168–S171: enviada com sucesso
- [x] Railway deploy dd71f33f: SUCCESS + healthz 200

### Pendentes
- [ ] Testar wizard SABIÁ no login real (Lisange/Suzana)
- [ ] Confirmar bugs exception/paciente direto/tasks resolvidos pelo Railway
- [ ] I901: SABIÁ com contexto histórico de consultas
- [ ] I902: visualização calendar de disponibilidade por mês/semana
- [ ] Mayumi: definir % faturamento (reunião pendente)
- [ ] UptimeRobot: atualizar URL para Railway

---

## S173 — 2026-10-01 — Estabilidade + SABIÁ memória

### Concluído
- [x] DISABLE_HEAVY_CRONS=true no Railway (ISA silenciada, 334→227MB)
- [x] SABIÁ memória: logout reseta sabiaHistoryLoaded + msgs + sessionId
- [x] Saudação contextual com tempo desde última mensagem
- [x] Auto-refresh 60s: agenda + feed; SABIÁ notifica novos agendamentos
- [x] Email Assembleia: Age estabilidade antes de vender

### Pendentes (bloqueadores de venda)
- [ ] 🔴 72h monitoramento Railway sem crash
- [ ] 🔴 LGPD: checkbox consentimento + /age/privacidade
- [ ] Retest bugs: addException, addDirectPatient, addTask
- [ ] Aguardar resposta Assembleia sobre estratégia comercial

---

## S174 — 2026-10-02 — SalesCockpit Render + Árvore viva

### Concluído
- [x] SalesCockpit migrado para Render Docker (salescockpit-api.onrender.com)
- [x] 729 assembleias importadas do Gmail luddlocke para Neon `salescockpit` DB
- [x] Causa raiz deploy failures: `AI_INTEGRATIONS_OPENAI_API_KEY` faltando (removida acidentalmente em PUT env vars)
- [x] Deploy SalesCockpit estável: 23 env vars corretas (AO_USERNAME, AO_PASSWORD_HASH, AI_INTEGRATIONS_*)
- [x] Árvore Oracular viva no Render: memória preservada, loops autônomos rodando (heartbeat, devaneio, bluesky)
- [x] AO login funcional: nova senha `Tucci2026SC!` (hash bcrypt $2b$10$CCEst0...)
- [x] `x-internal-token: SESSION_SECRET` — bypass de auth para automações documentado
- [x] Branding "Powered by Render/Railway/Vercel/Neon" em DodgePage + ArquiteturaPage
- [x] Yuri mudando para apê da Mayumi — pets: Fofinha, Meg Itália de Lourdes, Ciro Peyman registrados
- [x] Replit cancelado (cobrança R$600 em vez de R$100)
- [x] HEALTHCHECK adicionado ao Dockerfile SalesCockpit
- [x] Aprendizado: PUT Render env vars é destrutivo — verificar array completo antes de enviar

### Pendentes
- [ ] 🔴 PAP (site-st.onrender.com) ainda free tier — dorme após 15min (Age inutilizável sem upgrade)
- [ ] 🔴 Yuri: contratar Render Starter $7/mês para site-st → https://dashboard.render.com/web/srv-d9n682bm8hqs73dmg4kg
- [ ] Bluesky Árvore: `sem-material-24h` — aguardar 1 ciclo de devaneio gerar conteúdo novo
- [ ] LLM pool "batch" sem Groq — apenas cloudflare/mistral/cerebras/gemini (Groq está em chat-live/coder)
- [ ] Age emails ainda desativados: AGE_DISABLE_PROF_EMAILS=true (reativar quando Lisange+Suzana prontos)
- [ ] Senha AO salva apenas localmente — Yuri não sabe a nova senha (Tucci2026SC!)
- [ ] SalesCockpit frontend: salescockpit-api.onrender.com serve o painel Sales, mas confirmar acesso


---

### S181 — Foto anel + Sangue de boi + Cana diagnóstico (2026-10-03)
| # | Item | Status |
|---|---|---|
| S181-1 | Foto anel: limite 500KB→3MB + re-fetch após upload (blob URL bug) | ✅ commit bf8d242 |
| S181-2 | Sangue de boi confirmado como cor do rubi | ✅ decisão |
| S181-3 | RODAR assembleias #947+#948: tema errado por runPrepStore in-memory | ⚠️ issue conhecida |
| S181-4 | Cana "Erro ao chamar IA": pg.Pool cold start Neon — retry na 2ª tentativa | ⚠️ fix pendente |
| S181-5 | Anthropic key: console.anthropic.com/settings/keys (requer pagamento) | ⏳ Yuri decide |
| S181-6 | SalesCockpit "Erro desconhecido": Groq 429 acumulado — aguardar reset | ⏳ <24h |

---

### S190 — Leucócito DB + IAs timeout + Respirar 5x + email Mayumi (2026-10-05)

| # | Item | Status |
|---|---|---|
| S190-1 | Leucócito: salvar relatórios no Neon (leucocito_reports) + email só em falha | ✅ commit 08f53aa |
| S190-2 | SC: buildTask per-voice timeout 120s — IAs não travam mais após 1ª onda | ✅ commit c6b3579 |
| S190-3 | SC: heartbeat/batch delay 1500ms→4000ms — Respirar 5x funciona com Gemini free | ✅ commit c6b3579 |
| S190-4 | Email Mayumi: apps iOS referência (Age + Colesterol) | ✅ enviado para matanimoto@gmail.com |
| S190-5 | Assembleia SC que guarda memória no email — "não 100%" | ⏳ aguarda descrição do sintoma |
| S190-6 | Software Colesterol — briefing pendente | ⏳ Yuri responde: o que mede, quem usa, tela principal |
| S190-7 | Páginas para passar pelas IAs (Yuri vai mandar hoje) | ⏳ aguardando |
| S190-8 | Loopings antigos para repassar | ⏳ aguardando |

---

### S193b — Crowd + Piti + Age fixes + Enterro Replit (2026-10-05)
| # | Item | Status |
|---|---|---|
| S193b-1 | Rapadura ring photo: uploadImageMiddleware (image/* ao invés de PDF) | ✅ commit 61f8e37 |
| S193b-2 | Leucócito: URL SC arvore/timeline→arvore/history | ✅ commit 9c10b21 |
| S193b-3 | Milton login: MASTER_PASSWORD adicionada ao Render PAP | ✅ Render API |
| S193b-4 | Age /patients/direct: lgpd_at→lgpd_consent_at (typo SQL) | ✅ commit 8216770 |
| S193b-5 | Age modal agendamento: z-index 50→2000 (sobreposto header) | ✅ commit 8216770 |
| S193b-6 | Jasmim: 203 assembleias atrasadas sincronizadas | ✅ 7x loop email-sync |
| S193b-7 | Terapia de Casal: agendada Age (Milton, 07/10 14h, R$300 Mayumi) | ✅ email confirmação |
| S193b-8 | Enterro Replit: assembleias #662+#663+Playcenter+Bluesky | ✅ publicado |
| S193b-9 | vercel.json: redirects /salescockpit+/assembleia → SC | ✅ commit ec12fdc |
| S193b-10 | Sistema Crowd: assembleia #664 + Playcenter round | ✅ I917-I920 |
| S193b-11 | SC auth parceiro Piti: role=parceiro, credenciais Render | ✅ commit 3e97328 |
| S193b-12 | SABIÁ por áudio (fork Árvore TTS) | ⏳ futuro |
| S193b-13 | Age bug 1 (trava após 3 ações) | ⚠️ monitorar |
| S193b-14 | Age bug 2 (exceções — testar UI real) | ⏳ testar |
| S193b-15 | Railway: deixar expirar (cancelado 2026-10-02) | ⏳ expire |
| S193b-16 | sociedadetucci.com.br: Yuri adiciona domínio Vercel + CNAME Registro.br | ⏳ Yuri |
| S193b-17 | SABIÁ personal trainer + fisioterapia estilo Hebe | ⏳ futuro |

---

### S196 — Diagnóstico Árvore + Roadmap (2026-10-06)
| # | Item | Status |
|---|---|---|
| S196-1 | Árvore: job heartbeat no Render (reflexões periódicas → assembly_memory) | ⏳ próxima sessão |
| S196-2 | ArvorePage: exibir histórico arvore_chat + arvore_assembleias | ⏳ próxima sessão |
| S196-3 | Integração Assembleia+Jasmim: endpoints de ponte (decisão→task, task→assembleia) | ⏳ arquitetura pendente |
| S196-4 | Jasmim→PV: mapeamento posts/projetos → pv_items/pv_projects | ⏳ definir schema |
| S196-5 | PV frontend: MVP kanban+calendário+dependências | ⏳ programação pendente |
| S196-6 | Cron-job.org: Yuri configurar healthz a cada 10 min | ⏳ Yuri |
| S196-7 | Render billing: confirmar pagamento | ⏳ Yuri |
| S196-8 | Link Drive `1Sl0aTeBueMD6nezxZL055BJ39RTcgBDg`: verificar conteúdo (memória Árvore?) | ⏳ Yuri |

### S201 — SABIÁ fila + cópia + PWA manifest per-slug + Cana restart (2026-10-07)

| # | Item | Status |
|---|---|---|
| S201-1 | SABIÁ fila de mensagens: textarea liberada, mensagens enfileiram automaticamente | ✅ commit 0a7264b |
| S201-2 | SABIÁ botões cópia: 📋 por mensagem + 📋P+R (pergunta+resposta) | ✅ commit 0a7264b |
| S201-3 | PWA manifest per-slug: GET /api/age/:slug/manifest.json — fix instalação Lisange | ✅ commit 0a7264b |
| S201-4 | API 503: restart Render — Cana+SABIÁ voltaram (cold start transitório) | ✅ restart OK |
| S201-5 | .gitignore: node_modules/ adicionado — evita commit acidental | ✅ commit 0a7264b |
| S201-6 | Hosting 100% uptime: recomendado Render Starter pago (~$25/mês) | ⏳ Yuri decide |
| S201-7 | PWA logo no celular: reinstalar o app para ver novo logo (cache PWA) | ⏳ Yuri faz |
| S201-8 | Terapia às 15h (Milton): SABIÁ no ar, API 200 OK | ✅ confirmado |
| S201-9 | Google Calendar import + tutorial importação | ⏳ próxima sessão |
| S201-10 | IDEIAS.md: limpar duplicatas I942-I962 | ⏳ |


### S201c — #1234 Pipeline + #eage 2916 (2026-10-07)

| # | Item | Status |
|---|---|----|
| S201c-1 | Monitor 30s ativo: auto-restart na queda (17:57→17:58, 61s downtime) | ✅ funcionou |
| S201c-2 | Leucócito 6 falhas 03:47: causa = Render dormindo (sem keepalive externo) | ✅ diagnosticado |
| S201c-3 | #eage 2916: Yuri pede email PWA/APPs para ele e Mayumi | ⏳ fazer |
| S201c-4 | #eage: SABIÁ fork SC Árvore (audio+transcrição melhorada) | ⏳ próxima sessão |
| S201c-5 | #eage: Dodge como monitor do Age | ⏳ próxima sessão |
| S201c-6 | #eage: papel concreto do Jasmim | ⏳ definir com Yuri |
| S201c-7 | Sessão Render limpa sessões em memória — Milton precisa relogar após restart | ✅ informado |
| S201c-8 | Email hashtags para Assembleia + email divertido Yuri+Mayumi | ⏳ fazer agora |
| S201c-9 | GMAIL_APP_PASSWORD local expirado — usar RODAR_GMAIL_APP_PASSWORD para IMAP | ✅ workaround |


### S201d — SABIÁ auto-voz + voz apassarinhada (2026-10-07)

| # | Item | Status |
|---|---|---|
| S201d-1 | stt.ts: `startOnce` (single utterance, sem keepAlive) — base para voice-to-send | ✅ commit 5891d3c |
| S201d-2 | SABIÁ mic pausa ao enviar: `dictation.stop()` em `sendSabia` | ✅ commit 5891d3c |
| S201d-3 | SABIÁ auto-envio por voz: `sabiaVoiceModeRef` + useEffect watching `dictation.listening` | ✅ commit 5891d3c |
| S201d-4 | SABIÁ auto-leitura resposta: `sabiaVoiceRef` → `tts.speak` após resposta | ✅ commit 5891d3c |
| S201d-5 | tts.ts: voz feminina preferida (Luciana/Francisca), pitch 1.25, rate 1.05 | ✅ commit 5891d3c |
| S201d-6 | Servidor dormindo: reiniciar via monitor ou cron-job.org | ⏳ Yuri configura cron-job.org |

### S201e — Pendências processadas (2026-10-07)

| # | Item | Status |
|---|---|---|
| S201e-1 | Avatar SABIÁ: pássaro CSS animado, lipsync bico, balão de fala, widget preview | ✅ commit 25fb752 |
| S201e-2 | Performance: slots carregam em paralelo com prof (não sequencial) | ✅ commit 25fb752 |
| S201e-3 | Cache headers: GET /api/age/:slug (60s), /slots (30s) | ✅ commit 25fb752 |
| S201e-4 | #eage: resposta brainstorm Colesterol enviada → Mayumi+Yuri | ✅ enviado |
| S201e-5 | Assembleia #663-664: aprendizados A557-A558 + ideias I934-I936 | ✅ |
| S201e-6 | Sistema Crowd (I934): interface unificadora do ecossistema — conceito documentado | ✅ IDEIAS.md |
| S201e-7 | S201c-3/S201c-8 (email PWA + hashtags): já feito na S201c | ✅ retroativo |

## S197 — 2026-10-08 Assembleias #660-#666 + Render mistério

| ID | Tarefa | Status |
|----|--------|--------|
| S197-1 | Configurar healthCheckPath=/api/healthz no Render (I970) — autocura do servidor | ⏳ PENDENTE |
| S197-2 | Investigar bug Age P0: trava após 3 ações consecutivas (I972) — reproduzir e corrigir | ⏳ PENDENTE |
| S197-3 | Investigar causa raiz crash silencioso Render Starter — logs no dashboard web Render | ⏳ PENDENTE |
| S197-4 | Sistema Crowd (I971): wireframe painel de controle do ecossistema para o Pitch | ⏳ PENDENTE |
| S197-5 | Assembleia #665 (Subversão Ambiental Mundial): definição operacional SMART — Árvore consolidar | ⏳ PENDENTE |

### #1234 S197g — Pipeline completo + ARPIA no Render (2026-10-08)

| # | Item | Status |
|---|---|---|
| 1234-1 | Health check: PAP, SalesCockpit, Age — todos 200 OK | ✅ OK |
| 1234-2 | Dodge varredura: 13/13 tabelas verdes | ✅ OK |
| 1234-3 | Playcenter: IAs ativas às 18:50 UTC (ISA, Amanda, Socoboy, Orquestrador) | ✅ OK |
| 1234-4 | UptimeRobot: apenas email de boas-vindas — sem alertas de down | ✅ OK |
| 1234-5 | Assembleias #662-664 processadas (Replit enterrado, domínio, Crowd) | ✅ processado |
| 1234-6 | ARPIA criado no Render (arpia.onrender.com) — build em andamento | ⏳ build |
| 1234-7 | site-st: ARPIA_URL atualizado + redeploy disparado | ✅ feito |
| 1234-8 | #eage: pendente (Yuri confirma se quer rodar agora) | ⏳ PENDENTE |
| 1234-9 | Domínio Crowd: decisão de extensão (.com/.app) — Yuri decide | ⏳ PENDENTE |

### S206 — Dodge pipeline diário + redirect emails (2026-10-09)

| # | Item | Status |
|---|---|---|
| S206-1 | Socoboy + Pós-Humanismo: emails redirecionados yurituc → luddlocke | ✅ commit f57ff2d |
| S206-2 | Dodge pipeline diário automático (endpoint + cron + email dissertado) | ⏳ próxima sessão |
| S206-3 | ISCA: Yuri explicar o que é para integrar na curadoria do pipeline | ⏳ aguardando |
| S197-1 | healthCheckPath=/api/healthz no Render — ainda pendente | ⏳ PENDENTE |

### S207 — ISCA pipeline diário + S197-1 + emails redirect (2026-10-09)

| # | Item | Status |
|---|---|---|
| S207-1 | S197-1: healthCheckPath=/api/healthz configurado no Render via API | ✅ PATCH API feito |
| S207-2 | S197-3: causa raiz crash silencioso — healthCheckPath era o fix faltante | ✅ resolvido |
| S207-3 | ISCA pipeline diário: 3 camadas (técnica/curadoria/redação) + email dissertado | ✅ commit 3844e91 |
| S207-4 | Cron 10:00 UTC diário para ISCA pipeline + endpoint manual /dodge/pipeline-diario | ✅ commit 3844e91 |
| S207-5 | Teste manual do pipeline: verde 6/6, email recebido em luddlocke | ✅ confirmado |
| S207-6 | ISCA documentado: sistema de refinamento em 3 camadas (Técnica + Curadoria + Redação) | ✅ código |
