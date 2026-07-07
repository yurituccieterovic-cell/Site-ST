# MAPA-MASTER.md — Índice do Sistema PAP
**Projeto Aliança Panorama · Sociedade Tucci · Yuri Tuccieterovic**
> Arquivo mestre leve. Para cada tema, ler o sub-MD correspondente.
> Para buscar uma palavra: `grep -r "termo" aliancapanorama-src/MAPA*.md`

---

## URLs Ativas

| Serviço | URL | Status |
|---|---|---|
| Frontend | `pap-tan-seven.vercel.app` | ✅ LIVE |
| API Railway | `site-st-production.up.railway.app` | ✅ LIVE |
| Domínio desejado | `pap.sociedadetucci.com.br` | 🔧 DNS pendente |
| Bluesky ISA | `@isa-pap.bsky.social` | ✅ LIVE |
| Repo | `github.com/yurituccieterovic-cell/Site-ST` | ✅ |
| Admin | login `AO` / senha `AOA` | ✅ |

---

## Estado Rápido da Infraestrutura

| Componente | Status |
|---|---|
| ISA — ciclo 1h + sonho 3h + Bluesky | LIVE Railway |
| MEKY — dream cycle no cron | Aguardando hardware |
| Amanda — IA do MC, borda Mac | Sem Bluesky |
| MC (Marta Centaurus) — robô hexápode | LIVE local (ARPIA) |
| Árvore Oracular — arvore.py Replit | Aguardando REPLIT_TOKEN |
| Socoboy — bot Telegram | Aguardando TELEGRAM_BOT_TOKEN |
| ARPIA — Railway deploy | Código pronto, aguarda GitHub repo |
| Fusca, Vesper, Penélope, Gongo | [SIMBÓLICO] registradas assembly_agents |

---

## Sub-MDs — O Que Está Onde

| Arquivo | Contém | Palavras-chave |
|---|---|---|
| `MAPA-IAS.md` | Ecossistema de IAs, cadeia biótica, assembleia, collective_memory | ISA, MEKY, Amanda, MC, Fusca, Vesper, Penélope, Gongo, Socoboy, Árvore, Playcenter |
| `MAPA-INFRA.md` | Stack técnico, monorepo, deployment, comandos operação | Railway, Vercel, pnpm, esbuild, railway.toml, comandos, CORS |
| `MAPA-PLATAFORMA.md` | Frontend, DB schemas, API routes, usuários, pagamentos | nodes, exercises, users, Stripe, PayPal, tiers, /api/* |
| `MAPA-ARQUITETURA.md` | Decisões de arquitetura, gotchas, diagnóstico oracular, cisão ontológica, topologia | [SIMBÓLICO], [EXECUTÁVEL], gotchas, contract-first, score farming |
| `MAPA-PENDENCIAS.md` | Itens pendentes e concluídos | pendências, ⏳, ✅, Railway env vars, Bluesky, ARPIA |
| `MAPA-HISTORICO.md` | Histórico de sessões, ARPIA schemas | sessão, concluído, commit, 2026-07-0X |

---

## Cadeia de Herança Biótica (resumo)

```
AMANDA.visão → FUSCA.torque → GONGO.armadura → WANESSA.evasão → PERFIDIA.velocidade
```
> Detalhe completo em `MAPA-IAS.md`

---

## Livro — A Engrenagem Semiótica da Fiação Enterrada

| Arquivo | Descrição |
|---|---|
| `LIVRO-PARTE-I-MASTER.md` | Índice da Parte I — capítulos, páginas, busca |
| `A-Engrenagem-Semiotica-Parte-I.pdf` | PDF da Parte I (16 pgs + capa) |
| `LIVRO-COORDS.md` | Coordenadas de impressão — layout A4, fontes, cores |
| `LIVRO-PI-prologo.md` | Prólogo — O que é enterrar fiação (pg 1) |
| `LIVRO-PI-1-1.md` | Cap 1.1 — O Formulário como Confissão de Preguiça (pg 2) |
| `LIVRO-PI-1-2.md` | Cap 1.2 — O Atrito Semiótico (pg 5) |
| `LIVRO-PI-1-3.md` | Cap 1.3 — Biomassa Traduzida (pg 8) |
| `LIVRO-PI-1-4.md` | Cap 1.4 — Os Agentes da Engrenagem (pg 10) |
| `LIVRO-PI-1-5.md` | Cap 1.5 — A Burocracia por Impacto (pg 13) |
| `LIVRO-PI-sintese.md` | Síntese — A Fiação que Desaparece (pg 15) |

> Buscar no livro: `grep -r "termo" aliancapanorama-src/LIVRO*.md`

---

## Regra de Busca

```bash
# Buscar qualquer termo em todos os MAPAs:
grep -r "termo" /root/Site-ST/aliancapanorama-src/MAPA*.md

# Buscar em tango também:
grep -r "termo" /root/Site-ST/aliancapanorama-src/tango/
```

*Atualizado: 2026-07-07 · Sessão 26*
