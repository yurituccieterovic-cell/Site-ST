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

## Regra de Busca

```bash
# Buscar qualquer termo em todos os MAPAs:
grep -r "termo" /root/Site-ST/aliancapanorama-src/MAPA*.md

# Buscar em tango também:
grep -r "termo" /root/Site-ST/aliancapanorama-src/tango/
```

*Atualizado: 2026-07-07 · Sessão 26*
