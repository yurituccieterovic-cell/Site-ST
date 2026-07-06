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
| Amanda | IA borda Mac. TTS, Gemini, personalidade completa | Sem Bluesky ainda |
| MC (Marta Centaurus) | Leucócito digital ARPIA. Primeira caminhada 2026-07-04 | LIVE local |
| Árvore Oracular | Memória longa + recall. arvore.py Replit | Aguardando REPLIT_TOKEN |

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
- [ ] I129 — Roteador LLMs com cooling compartilhado
- [ ] I128 — Parser JSON robusto em 3 camadas

## Documentação Viva
| Arquivo | Função |
|---|---|
| `MAPA.md` | Estado completo: infra, schema DB, rotas API, histórico de sessões |
| `APRENDIZADO-INDICE.md` | Índice leve das 769+ entradas de aprendizado |
| `APRENDIZADO.md` | Arquivo completo (ler só por categoria, via índice) |
| `IDEIAS.md` | 44 ideias de programação |
| `PSEUDO-INDICE.md` | Índice leve das sessões (Sessão 1 → Sessão 24) |
| `PSEUDO.md` | Histórico completo de decisões e debates |
| `YURI-NAVEGACAO.md` | Mapa de projetos e vida |
