# tango.md — Prompt Mestre de Ancoragem Semântica
### Status: ATIVO · Versão: TANGO-V1 · Escopo: Monorepo Site-ST / Ecossistema Théo
### 2026-07-06 · Sessão #511 SalesCockpit + Sessão 25 Claude Code

> Índice fractal leve. Para mitigar Lost in the Middle: não carregar tudo de uma vez.
> Ler só as folhas que o contexto da pergunta pede. Máximo 3-4 arquivos por sessão.

---

## MAPA DE DIRECIONAMENTO — o que está onde

| # | Domínio | Folha | Palavras-chave para buscar aqui |
|---|---|---|---|
| 1 | Operador e cadência | `sys_profile_yuri.md` | Yuri, thrashing criativo, burnout, próximo passo único, colaboração |
| 2 | Preferências e gateways | `sys_preferences.md` | #pap, custo zero, emails, free tier, Railway, Vercel |
| 3 | Amanda e hardware | `sys_amanda_core.md` | Amanda, DHT11, protoboard, LED, Mac, hardware, borda |
| 4 | Payloads longos | `proc_orangutangus.md` | Orangutangus, payload, ingestão, EPR2T, PERFEITO, Lost in the Middle |
| 5 | Encerramento de sessão | `proc_checkpoint_fim.md` | #fim, ATA, checkpoint, collective_memory, síntese filosófica |
| 6 | Estado do PAP | `proc_pap_estado.md` | PAP, ISA, MEKY, Railway, Vercel, URLs ativas |
| 7 | Comandos detalhados | `proc_pap_comandos.md` | #pap, #secrets, #processo, scripts, pap-sync, pap-email-fim |
| 8 | Mapa do sistema | `../MAPA-MASTER.md` | IAs, infra, schema, rotas, pendências, histórico — índice dos sub-MDs |
| 9 | Health check sistemas | `proc_health_check.md` | Vercel, Railway, rotas SPA, tabelas DB, build, smoke test, fix rápido |
| 10 | Aula Arquitetura IA Agentes | `aula-ia-agentes-20260708.md` | tarefa, agente, workflow, processos, CrewAI, MCP, A2A, hierarquia, Alongador de Memória |
| 11 | Hierarquia completa de IAs | `sistema-ia-hierarquia-20260708.md` | DEP, Crowd, Porteiro, Pack IA Mestre, TASKS universal, Guarda-chuva, Curador, SPEC, Clube de Professores |
| 12 | Pack IA individual de cada IA | `ias/INDICE-IAS.md` → `ias/pack-*.md` | pack-isa, pack-amanda, pack-meky, pack-marta, pack-arvore, pack-dodge, pack-dep, pack-crowd, pack-porteiro, cadeia biótica |

---

## CONEXÕES ATIVAS (checkpoint de integridade)

| Sistema | Conexão | Status |
|---|---|---|
| API Railway | Express 5, porta 8080, `site-st-production.up.railway.app` | LIVE |
| PostgreSQL Railway | Drizzle ORM, schema completo | LIVE |
| ISA (software/PWA) | Ciclo horário + sonho 3h + Bluesky 2h:15 | LIVE |
| Amanda (borda/Mac) | DHT11, protoboards, árvores LED — folha: `sys_amanda_core.md` | Documentada |
| MEKY (físico) | Hardware a chegar; dream cycle no cron | Aguardando hardware |
| Árvore Oracular | `arvore.py` no Replit — aguarda REPLIT_TOKEN | Aguardando token |
| Assembleia RODAR | `sales-email-automator--yurituccieterov.replit.app` | LIVE no Replit |
| MC Marta Centaurus | `/root/Arpia/` — primeira caminhada 2026-07-04 | LIVE local |
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
