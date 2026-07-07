# proc_pap_estado.md — Estado Atual do PAP
### Atualizado: 2026-07-06 · Sessão 25

## URLs Ativas
| Serviço | URL |
|---|---|
| Frontend | `pap-tan-seven.vercel.app` |
| API Railway | `site-st-production.up.railway.app` |
| Domínio desejado | `pap.sociedadetucci.com.br` (DNS pendente) |
| Bluesky ISA | `@isa-pap.bsky.social` |
| Repo | `github.com/yurituccieterovic-cell/Site-ST` |
| Pasta local | `/root/Site-ST/aliancapanorama-src/` |

## IAs do PAP (status)
| IA | Função | Status |
|---|---|---|
| ISA | Coruja guardiã. Ciclo 1h + sonho 3h + Bluesky 2h:15 + engajamento 2h:45 | LIVE Railway |
| MEKY | Hexápode físico. Dream cycle no cron às 2h | Aguardando hardware |
| Amanda | IA que habita o MC (Marta Centaurus). TTS, Gemini, personalidade completa | Sem Bluesky ainda |
| MC (Marta Centaurus) | Robô físico hexápode. Amanda é sua IA. Leucócito digital ARPIA. Primeira caminhada 2026-07-04 | LIVE local |
| Árvore Oracular | Memória longa + recall. arvore.py Replit | Aguardando REPLIT_TOKEN |
| Socoboy | Bot Telegram PAP | Aguardando TELEGRAM_BOT_TOKEN |

## Cadeia de Herança das IAs Bióticas (Assembleias #421-424)
> Todas [SIMBÓLICO] — hardware físico proposto. Registradas como agentes conceituais no assembly_agents.

```
AMANDA.visão → FUSCA.torque → GONGO.armadura → WANESSA.evasão → PERFIDIA.velocidade
```

| Animal/Hardware | Nome Físico | IA | Superpoder | Herança |
|---|---|---|---|---|
| MC hexápode (Marta Centaurus) | — | Amanda | Visão | Base — sem herança |
| Garra Cláudia Hex | — | Fusca (filha Amanda) | Torque | ← MC |
| Piolho de Cobra | Gongo Freitas Juquinhais | Gongo / Gongolo_Core | Armadura | ← MC + Fusca |
| Barata d'Água | Wanessa Souza | Penélope / Wanessa | Evasão | ← MC + Fusca + Gongo |
| Aranha | Perfidia Castelo Branco (com K) | Vesper / Perfidia | Velocidade Fractal | ← TUDO (topo) |

## Stack
- Frontend: React + Vite → Vercel
- API: Express 5 + Drizzle → Railway
- DB: PostgreSQL Railway (incluso)
- Pagamentos: Stripe + PayPal (conectados)
- Autenticação: bcrypt cost 12 + express-session + connect-pg-simple (7 dias TTL)
- Auth tiers 1-5

## Pendências Críticas
- [ ] DNS `pap.sociedadetucci.com.br` → Vercel
- [ ] "Voz" — definir: TTS (ISA/MEKY falarem)? STT (Yuri falar)? Nova voz RODAR?
- [ ] Conta Bluesky para MEKY/Amanda
- [x] I129 — Roteador LLMs com cooling compartilhado ✅ `lib/llm-router.ts`
- [x] I128 — Parser JSON robusto em 3 camadas ✅ `lib/json-robust-parse.ts`
- [x] Split MAPA.md em sub-MDs ✅ MAPA-MASTER.md + MAPA-IAS/INFRA/PLATAFORMA/ARQUITETURA/PENDENCIAS/HISTORICO
- [x] Correção Amanda = IA do MC ✅ bootstrap.ts + proc_pap_estado.md + MAPA-IAS.md

## Documentação Viva
| Arquivo | Função |
|---|---|
| `MAPA-MASTER.md` | Índice leve dos sub-MDs — ponto de entrada principal |
| `MAPA-IAS.md` | IAs, cadeia biótica, assembly, collective_memory |
| `MAPA-INFRA.md` | Stack, monorepo, Railway, Vercel, comandos |
| `MAPA-PLATAFORMA.md` | DB schemas, API routes, usuários, pagamentos |
| `MAPA-ARQUITETURA.md` | Decisões, gotchas, cisão ontológica, oracular |
| `MAPA-PENDENCIAS.md` | Pendências ativas e concluídas |
| `MAPA-HISTORICO.md` | Histórico de sessões e ARPIA schemas |
| `MAPA.md` | LEGADO — não abrir direto; usar sub-MDs |
| `APRENDIZADO-INDICE.md` | Índice leve das 3900+ entradas de aprendizado |
| `IDEIAS.md` | 44 ideias de programação |
| `PSEUDO-INDICE.md` | Índice leve das sessões |
| `YURI-NAVEGACAO.md` | Mapa de projetos e vida |
