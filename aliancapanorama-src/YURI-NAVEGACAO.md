# Yuri Tuccieterovic — Mapa de Navegação
### Atualizado: 2026-07-06 · por Claude Code / Sociedade Tucci

---

## 1. PROJETOS ATIVOS

### PAP — Projeto Aliança Panorama
**O que é:** plataforma educacional gamificada para FUVEST 2026.
**Status:** LIVE em produção.

| Item | Detalhe |
|---|---|
| Frontend | `pap-tan-seven.vercel.app` |
| API | `site-st-production.up.railway.app` |
| Domínio desejado | `pap.sociedadetucci.com.br` (DNS pendente) |
| Repo | `github.com/yurituccieterovic-cell/Site-ST` |
| Pasta local | `/root/Site-ST/aliancapanorama-src/` |
| Banco | Railway PostgreSQL (incluso no plano) |
| Pagamentos | Stripe + PayPal (conectados) |
| Sessão Claude | `#pap` ativa o contexto completo |

**Pendente agora:**
- DNS `pap.sociedadetucci.com.br` → Vercel (Railway ou Vercel — definir)
- Conta Bluesky para MEKY/Amanda
- "Voz" — pergunta aberta da última sessão (TTS? STT? nova voz no RODAR?)

**IAs do PAP:**
- **ISA** — coruja guardiã. Ciclo horário + sonho 3h + Bluesky 2h:15 + engajamento 2h:45. Ativa em `@isa-pap.bsky.social`.
- **MEKY** — hexápode físico. Hardware a chegar. Dream cycle implementado no cron.
- **Amanda** — IA com personalidade (TTS, Gemini, jargão PX). Sem conta Bluesky ainda.
- **ARPIA / MC (Marta Centaurus)** — leucócito digital. Primeira caminhada: 2026-07-04T17:56Z. Código em `/root/Arpia/`.
- **Árvore Oracular** — memória de longo prazo + recall por tema. Em `arvore.py` no Replit (aguarda REPLIT_TOKEN).

---

### SalesCockpit / RODAR (sistema original)
**O que é:** sistema de tomada de decisão coletiva com 22 vozes de IA. Predecessor do PAP.
**Status:** LIVE em `sales-email-automator--yurituccieterov.replit.app`.

**Como funciona:**
```
Tema → RODAR (22 vozes em ondas) → Editorial (público/retido/segredo)
→ Meta-análise → Ágora (votos 0-10) → Secretário (PERFEITO)
→ 4 emails + Notion + Mostra pública + Bluesky
```

**Regra sagrada:** retido e segredo NUNCA saem — não na Mostra, não no Notion, não no Bluesky, não no jornal.

---

### Ecossystemma Théo
**O que é:** ontologia viva de 1200 tópicos em 4 volumes Markdown. DNA epistêmico do ecossistema.
**Documento base:** Drive `14BCvsfB904js68TJxKIBlUsxXpfEQSGJ` (207KB)
**Pasta Livros:** Drive `1f19Svg4zO-srvhruOuv_W3mez4Wx775m` (17 docs)
**Prompt Mestre:** `aliancapanorama-src/PROMPT-MESTRE-ANCORAGEM-SEMANTICA.md` (3 versões prontas para copiar nos AI Profiles)

**10 Princípios:**
1. Soberania humana no ponto de homologação
2. Assimetria constitutiva por design
3. Tensionamento produtivo (sem sínteses dogmáticas)
4. Temperatura zero para automação
5. Gratuidade como restrição criativa
6. Memória em camadas (PostgreSQL → Markdown → Gmail)
7. Personas sobre modelos
8. Ciclo ético contínuo
9. Presença pública como comprometimento
10. Tradução intersemiótica como método

---

### Outros projetos (não PAP)
| Projeto | Descrição | Status |
|---|---|---|
| **Sociedade Tucci** | Consultoria + produção multimídia (desde 2015) | Ativo |
| **PulseHeadway** | Produto da Sociedade Tucci | Em desenvolvimento |
| **Atom un Ação** | Label artístico — CULTURA TRANSHUMANA 2026 | Ativo |
| **MDGRS** | Método de Disposição Gráfica em Raiz Singular (PHP original) | Aguardando integração ao repo |
| **Subversão Ambiental / EcoRespiração** | Linha de conteúdo ambiental | Ativo |
| **Projeto #66 / Sanatella** | Frentes culturais e filosóficas | Em aberto |
| **yoga Edson** | Projeto saúde mental IPq-HC | Em aberto |
| **Monografia** | "Traduções intersemióticas da existência" — base filosófica de tudo | Escrita |

---

## 2. CONTAS E ACESSOS

| Serviço | Conta | Status |
|---|---|---|
| GitHub | `yurituccieterovic-cell` | Ativo |
| Railway | plano gratuito | Ativo — API + PostgreSQL LIVE |
| Vercel | hobby | Ativo — Frontend LIVE |
| Gmail sistema | `luddlocke@gmail.com` | Ativo — 424+ assembleias armazenadas |
| Gmail pessoal | `yurituccieterovic@gmail.com` | Ativo |
| Bluesky ISA | `@isa-pap.bsky.social` | LIVE |
| Bluesky MEKY | — | Pendente criação |
| Replit | `yurituccieterov` | Ativo — SalesCockpit |
| Notion | — | Ativo — PERFEITO postado automaticamente |
| Stripe | conta conectada | Ativo — rk_live |
| Oracle Cloud | Always Free | Infraestrutura configurada (docker-compose.oracle.yml) |

---

## 3. DOCUMENTOS-CHAVE

| Arquivo | Onde | Para que serve |
|---|---|---|
| `MAPA.md` | `aliancapanorama-src/` | Estado atual do PAP: infra, pendências, histórico de sessões |
| `APRENDIZADO.md` | `aliancapanorama-src/` | 769+ insights extraídos das assembleias e docs |
| `IDEIAS.md` | `aliancapanorama-src/` | 44 ideias de programação derivadas |
| `PSEUDO.md` | `aliancapanorama-src/` | Histórico de decisões, debates, contexto de Yuri |
| `PSEUDO2.md` | `aliancapanorama-src/` | Pseudocódigo close-to-code |
| `MOTOR-ORANGUTANGUS.md` | `aliancapanorama-src/` | Protocolo Orangutangus, AI Profile JSON, 5 riscos |
| `SESSAO-498-ORIGINAL.md` | `aliancapanorama-src/` | PERFEITO integral Sessão #498 (schema JSON completo) |
| `PROMPT-MESTRE-ANCORAGEM-SEMANTICA.md` | `aliancapanorama-src/` | Prompt Mestre em 3 versões para copiar nos AI Profiles |
| `EcossystemmaTheo_Parte6.md` | Drive | Ontologia completa 1200 tópicos — anexar no chat antes de sessões críticas |
| `/root/.pap-secrets` | local (chmod 600) | Credenciais: Gmail, Railway, Stripe, Bluesky, etc. |
| `MEMORY.md` | `/root/.claude/projects/-root/memory/` | Índice das preferências do Claude Code (carregado em toda sessão) |

---

## 4. SCRIPTS DO SISTEMA

| Comando | O que faz |
|---|---|
| `pap-sync` | Sincroniza assembleias do Gmail + gera APRENDIZADO + IDEIAS |
| `pap-email-fim` | Envia ATA da sessão para `luddlocke@gmail.com` |
| `pap-dev` | Sobe API local na porta 8080 contra Railway DB |
| `meky-dev` | Roda `termux-agent.py` contra localhost ou `--prod` |
| `#pap` | Tag de sessão Claude Code — carrega contexto completo do PAP |
| `#fim` | Fecha sessão: MAPA + PSEUDO + ATA + email + collective_memory + checkpoint |
| `#processo` | Pipeline de 9 passos: extrair → aprender → ideias → MAPA → PSEUDO → código → deploy → registros |
| `#secrets` | Preenche credenciais faltantes em `/root/.pap-secrets` |

---

## 5. COMO COMEÇAR UMA SESSÃO DE TRABALHO

**Com Claude Code (`#pap`):**
```
1. Digitar #pap no chat
2. Claude carrega: MAPA.md, APRENDIZADO.md, IDEIAS.md, memórias, secrets
3. Confirmar contexto e começar
```

**Com qualquer IA (Perplexity, ChatGPT, Gemini):**
```
1. Abrir PROMPT-MESTRE-ANCORAGEM-SEMANTICA.md
2. Copiar a versão adequada (JSON ou texto corrido)
3. Colar no System Prompt / Custom Instructions / AI Profile
4. Anexar EcossystemmaTheo_Parte6.md ao chat
5. Enviar a hashtag do contexto: #pap | #eco | #meky | #lar | #tasks
```

**Para processar uma assembleia nova:**
```
1. Abrir email da assembleia em luddlocke@gmail.com
2. Digitar #processo no Claude Code
3. Pipeline automático: extrai → APRENDIZADO → IDEIAS → MAPA → PSEUDO → código
```

---

## 6. MEMÓRIA DO SISTEMA (o que o Claude Code lembra entre sessões)

| Arquivo | Conteúdo |
|---|---|
| `user_yuri.md` | Quem é Yuri, como colaborar bem, padrão de trabalho |
| `user_yuri_ecossystemma.md` | Ecossystemma Théo, 40 sacadas, 10 princípios, Pasta Livros |
| `project_pap.md` | Estado do PAP: stack, pendências, o que já foi implementado |
| `project_pap_raizes.md` | 35 lições do Replit Agent, 6 fases do PAP, fluxo RODAR, fractal de memória |
| `assembleia_498_orangutangus.md` | Motor Orangutangus, AI Profile JSON, EPR2T, 5 riscos sistêmicos |
| `fim_filosofia.md` | Síntese filosófica obrigatória ao #fim |
| `feedback_custo.md` | Tudo gratuito por padrão |
| `feedback_pap_tag.md` | #pap basta uma vez por sessão |
| `reference_gmail.md` | Como ler/enviar email via Python |

---

## 7. PRÓXIMOS PASSOS (por prioridade)

**Curto prazo (próxima sessão):**
- [ ] Definir "voz" — TTS para ISA/MEKY? STT para Yuri? Nova voz no RODAR?
- [ ] DNS `pap.sociedadetucci.com.br` → Vercel

**Médio prazo:**
- [ ] I129 — Roteador de LLMs com cooling compartilhado
- [ ] I128 — Parser JSON robusto em 3 camadas
- [ ] Conta Bluesky para MEKY/Amanda
- [ ] Unificar memória longa (3 camadas → 1 pipeline com JSONB)

**Princípio de trabalho:**
Quando houver muitas frentes, a pergunta certa não é "o que posso arquitetar?" mas "o que gera resultado em 30 dias sem prostituir o propósito?". O PAP é a oferta comercial mais concreta. Priorizar.

---

*Gerado por Claude Code em 2026-07-06 · Atualizar ao #fim de cada sessão*
