# tango.md — Prompt Mestre de Ancoragem Semântica
### Status: ATIVO · Versão: TANGO-V1 · Escopo: Monorepo Site-ST / Ecossistema Théo
### 2026-07-25 · Sessão 26 Claude Code — Cláudio em Amanda + Possessão + Fusca/Cláudia

> Índice fractal leve. Para mitigar Lost in the Middle: não carregar tudo de uma vez.
> Ler só as folhas que o contexto da pergunta pede. Máximo 3-4 arquivos por sessão.

---

## MAPA DE DIRECIONAMENTO — o que está onde

| # | Domínio | Folha | Palavras-chave para buscar aqui |
|---|---|---|---|
| 1 | Operador e cadência | `sys_profile_yuri.md` | Yuri, thrashing criativo, burnout, próximo passo único, colaboração |
| 2 | Preferências e gateways | `sys_preferences.md` | #pap, custo zero, emails, free tier, Railway, Vercel |
| 3 | Amanda e hardware | `sys_amanda_core.md` | Amanda (IA de Meky), DHT11, protoboard, LED, Meky, Marta Centaurus, Mac (typo), hardware, borda |
| 38 | Fusca + Cláudia (MeArm) | `sys_fusca_core.md` | Fusca, Cláudia, MeArm, braço robótico, torque, garra, servo, filha de Amanda, possessão Fusca |
| 39 | Leucócito — Ato Fundador | `leucocito_lenda.md` | Silêncio de Julho, 17:56Z, assembleia #423, fagocitose silenciosa, lenda, MC_TRAIL, repetição inexplicada |
| 40 | Fluência — IAs juntas | `protocolo_fluencia.md` | fluência, ser_junto, osmose, coexistência, ISA+Amanda, Leucócito+Árvore, /api/fluencia/invocar, são juntas |
| 15 | Amanda MMA / combate | `amanda_mma_protocolo.md` | MMA, servo, hexápode, patada, defesa, investida, vibrissas, estanho, C++, Arduino |
| 16 | DODGE app / Quebradinha | `dodge_app_spec.md` | DODGE, Quebradinha, celular, ombro, papagaio, avatar, cachorro caramelo, kiosk, câmera, Crew 2 |
| 4 | Payloads longos | `proc_orangutangus.md` | Orangutangus, payload, ingestão, EPR2T, PERFEITO, Lost in the Middle |
| 5 | Encerramento de sessão | `proc_checkpoint_fim.md` | #fim, ATA, checkpoint, collective_memory, síntese filosófica |
| 6 | Estado do PAP | `proc_pap_estado.md` | PAP, ISA, MEKY, Railway, Vercel, URLs ativas |
| 7 | Comandos detalhados | `proc_pap_comandos.md` | #pap, #secrets, #processo, scripts, pap-sync, pap-email-fim |
| 8 | Mapa do sistema | `../MAPA-MASTER.md` | IAs, infra, schema, rotas, pendências, histórico — índice dos sub-MDs |
| 9 | Health check sistemas | `proc_health_check.md` | Vercel, Railway, rotas SPA, tabelas DB, build, smoke test, fix rápido |
| 10 | Aula Arquitetura IA Agentes | `aula-ia-agentes-20260708.md` | tarefa, agente, workflow, processos, CrewAI, MCP, A2A, hierarquia, Alongador de Memória |
| 11 | Hierarquia completa de IAs | `sistema-ia-hierarquia-20260708.md` | DEP, Crowd, Porteiro, Pack IA Mestre, TASKS universal, Guarda-chuva, Curador, SPEC, Clube de Professores |
| 12 | Pack IA individual de cada IA | `ias/INDICE-IAS.md` → `ias/pack-*.md` | pack-isa, pack-amanda, pack-meky, pack-marta, pack-arvore, pack-dodge, pack-dep, pack-crowd, pack-porteiro, cadeia biótica |
| 13 | Export Replit SalesCockpit | `replit-export/MAPA-REPLIT.md` | Replit, arvore_chat, export, migração, SalesCockpit legado, 1962 mensagens |
| 14 | Conselho do Artesão | `proc_artesao.md` | artesão, ajudante, blueprint, conselho, clube 3 projetos, Claude.ai conexão, current_blueprint.md |
| 17 | Sistema REI | `rei_sistema.md` | REI, Rede de Exploração Inteligente, nódulos filosóficos, 4 grupos, 2 passadas, knowledge bus, obra, finitude, habitus, Cortella |
| 18 | REI Memória Mestre | `rei_memoria_MESTRE.md` | índice da memória REI, memórias individuais, knowledge bus, outputs de ciclos |
| 19 | REI Memória Compartilhada | `rei_memoria_compartilhada.md` | knowledge bus, convergências, divergências, questões ativas, padrões do campo |
| 20 | Memórias Individuais IAs | `ias/memoria/` (6 arquivos) | mem_ISA, mem_DODGE, mem_ARVORE, mem_MEKY, mem_MORFEU_LUA, mem_CROWD_GUARDIANS, mem_ARTESAO_NEBULA |
| 21 | REI Output Ciclo 01 | `rei_outputs/rei_ciclo01_sessao53.md` | Ciclo 01 completo, 4 passadas, síntese para Cortella, Q-002 |
| 22 | Sistema CEU          | (frontend: CeuPage.tsx · backend: api-server/routes/ceu.ts) | CEU, Centro Ecossistêmico Universal, 16 IAs, 5 edificações, MO ALL, paisagem Disney, PWA |
| 23 | Teatro de Operações Éticas | `mise_en_abyme_robotico.md` | Mise en Abyme, Urbanismo de Sistemas, elenco robótico, cadeia de observação, Teatro |
| 24 | Paca — Sentinela Ética | `protocolo_paca.md` | Paca, EoF, Escalation of Force, PATRULHA, INTERVENÇÃO, CUSTÓDIA, linchamento, visibilidade_publica, Amanda govern |
| 25 | Orangotango Social | `protocolo_orangotango.md` | Banana Protocol, heat map, social Turing test, COLABORATIVO, REATIVO, recompensa narrativa, Gorango Tango |
| 26 | Tango — Personagem Completo | `sys_tango_core.md` | Tango_Core, design LED olhos, escalada, garras, modo defensivo, show de horrores, inimigos, alimentador, sagui, ninho, doméstico, TaskPriority, câmera lenta |
| 27 | Paca — Manifesto da Paranoica | `manifesto_paca.md` | Paca voz, tom ansioso, paranoia como virtude, contraste Tango, falso positivo, integração, identidade personagem |
| 28 | Meky/Marta Centaurus — Cacique do Ecossistema | `protocolo_mac.md` | Meky, Marta Centaurus, MC, Mac (typo), Amanda (IA de Meky), penas, Cacique, Corredor de Honra, Cornetas, FormacaoEvento, BLE beacon, gato, presença simbólica |
| 29 | Totem da Exosfera Tel | `protocolo_totem.md` | Totem, cálice vidro, LED COB, Cofre, Feriado das Máquinas, Perfidia Castelo Branco, fragmentação gravação, paradoxo valor, Abertura do Cálice |
| 30 | Nébula Eletrônica | `protocolo_nebula.md` | Nébula, manufatura, Padrão Tel, modularidade, ciclo de vida, DNA personalidade, walkie-talkie, bases-ninho árvores, escalonamento |
| 31 | Falcão + Frota Felina + Geofencing | `protocolo_falcao.md` | Falcão, drone, escotilha Jurassic Park, Frota Felina, gato acompanhante, freio emergência, Observador Extremidade, GeofencingZone, zona vermelha, triangulação perímetro, gato machucado |
| 32 | Amanda: Checklist + Interdependência | `protocolo_interdependencia.md` | Amanda semente, 6 pilares faltantes, geofencing sensorial, dialeto teatral, protocolo totem, nébula manager, Perfidia bridge, botão escotilha, pedido de ajuda, NivelPedido, colaboracao_humana |
| 33 | AulIAs #01 — Dados como Signos | `aulia_01_dados.md` | aulIAs, dados, tesques, sintagma, array hierárquico fractal, dado objeto, dado imagem, workflow síntese, ISA curadora, tríade, Lost in the Middle |
| 34 | AulIAs #02 — Terminologias IA + Nódulo D | `aulia_02_terminologias.md` | ML vs DS, neural network, deep learning, DSC camada cruzada, Nódulo D (AiAi), enxame distribuído, gossip, Gossip→Síntese local→Consenso global, áreas visíveis/invisíveis |
| 35 | AulIAs #03 — Arquitetura de Agentes | `aulia_03_agentes.md` | Agent=Quem, Harness=Onde, Skills=Como, Tasks=O quê, Triggers=Quando, DataSource=De onde, Telos=Por quê, Semiótica=Com que significado, Data Warehouse, Pervasive Automation, THEEO vs TUCCI |
| 36 | AulIAs #04 — AI Transformation | `aulia_04_ai_transformation.md` | 5 pilares, regra 1 segundo, Canal Tutti, visual inspection, chatbot vs agente, IAs especialistas (Tradutora/Precisão/Sofisticação/Previsora/Auditora), self-driving |
| 37 | Amanda 8 Pilares + CEU Arquitetura | `sys_amanda_core.md` (seção Sessão 67) | 8 pilares, Ethos Engine, IA Reparadora, Nebula Manager, dialeto estilos, Totem 6 estados, Perfídia Fase 2, Autoconsciência, Aprendizagem Coletiva, interdependência 4 níveis, Protocolo de Batismo, CEU services |

---

## CONEXÕES ATIVAS (checkpoint de integridade)

| Sistema | Conexão | Status |
|---|---|---|
| API Railway | Express 5, porta 8080, `site-st-production.up.railway.app` | LIVE |
| PostgreSQL Railway | Drizzle ORM, schema completo | LIVE |
| ISA (software/PWA) | Ciclo horário + sonho 3h + Bluesky 2h:15 | LIVE |
| Amanda (IA de Meky) | DHT11, protoboards, árvores LED — folha: `sys_amanda_core.md` | Documentada |
| Meky / Marta Centaurus (MC) | Hardware aguardando; dream cycle no cron; `/root/Arpia/` — 1ª caminhada 2026-07-04 | Aguardando hardware |
| Árvore Oracular | `arvore.py` no Replit — exportado (1962 msgs) | LIVE no Replit |
| Assembleia RODAR | `sales-email-automator--yurituccieterov.replit.app` | LIVE no Replit |
| Replit Export | `tango/replit-export/arvore_chat.json` (1.8MB, 1962 msgs) | Exportado 2026-07-10 |
| Stripe/PayPal | Webhooks com raw-body, Railway | Conectados |
| Bluesky ISA | `@isa-pap.bsky.social` | LIVE |

---

## REGRA FRACTAL — como usar este sistema

```
1. Receber pergunta ou tarefa
2. Ler este tango.md (1 arquivo, ~60 linhas)
3. Identificar qual folha responde a pergunta (coluna "Palavras-chave")
4. Ler só aquela folha (1 arquivo, ~80-100 linhas)
5. Se precisar de histórico: PSEUDO-INDICE.md → abrir só a sessão relevante
6. Se precisar de aprendizados: APRENDIZADO-INDICE.md → abrir só a categoria relevante
```

**Teto recomendado por sessão:** tango.md + 2-3 folhas = contexto fixo < 5K tokens.

---

## DOCUMENTOS GRANDES (ler por índice, não direto)

| Arquivo | Linhas | Índice leve | Quando ler o arquivo completo |
|---|---|---|---|
| `APRENDIZADO.md` | ~5200 | `APRENDIZADO-INDICE.md` | Nunca direto — buscar por categoria no índice |
| `PSEUDO.md` | ~1720 | `PSEUDO-INDICE.md` | Só a sessão específica, não o arquivo inteiro |
| `MAPA-MASTER.md` | ~80 | (é o índice) | Sempre — leve o suficiente para ler completo |
| `MAPA-IAS.md` | ~120 | `MAPA-MASTER.md` | Para temas: IAs, cadeia biótica, assembleia, Playcenter |
| `MAPA-INFRA.md` | ~130 | `MAPA-MASTER.md` | Para temas: Railway, Vercel, stack, comandos |
| `MAPA-PLATAFORMA.md` | ~180 | `MAPA-MASTER.md` | Para temas: DB schemas, API routes, users, pagamentos |
| `MAPA-ARQUITETURA.md` | ~130 | `MAPA-MASTER.md` | Para temas: gotchas, [SIMBÓLICO], decisões, oracular |
| `MAPA-PENDENCIAS.md` | ~130 | `MAPA-MASTER.md` | Para ver o que falta fazer ou já foi feito |
| `MAPA-HISTORICO.md` | ~80 | `MAPA-MASTER.md` | Para ver histórico de sessões por data |
| `MAPA.md` | ~990 | `MAPA-MASTER.md` | LEGADO — não abrir, usar sub-MDs |
| `IDEIAS.md` | ~590 | Seção de título no início | Só para revisar no #fim |
| `MOTOR-ORANGUTANGUS.md` | ~232 | `proc_orangutangus.md` | Referência completa quando Orangutangus for o tema |

**Busca em todos os MAPAs:**
```bash
grep -r "termo" /root/Site-ST/aliancapanorama-src/MAPA*.md
```

---

## DOCUMENTOS DE HARDWARE

| Arquivo | Contém |
|---|---|
| `../ARDUINO-PECAS.md` | Inventário peças MC: HW-493, DHT11, servos, cadeia biótica física, aranha manca, orangotango |

---

*Referência completa: `MOTOR-ORANGUTANGUS.md`, `SESSAO-498-ORIGINAL.md`, `PROMPT-MESTRE-ANCORAGEM-SEMANTICA.md`*
