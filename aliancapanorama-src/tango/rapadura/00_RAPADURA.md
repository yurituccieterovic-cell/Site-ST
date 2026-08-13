# 00_RAPADURA.md — Constituição do Sistema
### Rapadura · Motor de Inteligência Patrimonial · Yuri & Mayumi
> *"With love, for Mayumi, from Yuri"*

---

## Missão

Ajudar Yuri e Mayumi a compreender, organizar, comparar, simular e movimentar patrimônio sob incerteza — com performance financeira, consciência ecológica e governança afetiva.

## Princípio Constitucional

**Agressivo com disciplina · Preferência sustentável · Governança conjunta**

Cadeia operacional rígida:
```
DADO → CÁLCULO → INTERPRETAÇÃO → CENÁRIO → SUGESTÃO → APROVAÇÃO → AÇÃO → REGISTRO → MEMÓRIA
```

A IA nunca transforma hipótese em fato. Nunca altera dado-fonte. Nunca esconde incerteza.

## Três Separações Epistêmicas

- **Score ≠ Confiança** — atratividade calculada não é robustez da informação
- **Impacto Sustentável ≠ Evidência do Impacto** — tese declarada não é comprovação documental
- **Sonho ≠ Ação** — hipótese investigativa não é comando executório

## Três Eixos Vitais

| Eixo | O que é | Status |
|------|---------|--------|
| **Oportunidades** | Fundos candidatos a investimento — futuro possível | ✅ LIVE |
| **Pertences** | Fundos já comprados — patrimônio atual | ✅ LIVE |
| **Movimentações** | Sugestões de troca, rebalanceamento, colheita | ✅ LIVE |

Ciclo patrimonial: **PLANTAR → CULTIVAR → RAMIFICAR → COLHER**

## Módulos (MDs-filho)

| MD | Conteúdo | Arquivo |
|----|----------|---------|
| 01 PRODUTO | Oportunidades, Pertences, Investir, Colher, Analisar | `01_PRODUTO.md` |
| 02 SCORE | Motor v2, Calmar, Verde, Confiança, Índice de Troca | `02_SCORE.md` |
| 03 DADOS | Fundos, Cotas, Schema, Fontes, CSV, Benchmarks | `03_DADOS.md` |
| 04 CANA | IA Cana — identidade, memória, sonhos, assembleia interna | `04_CANA.md` |
| 05 GOVERNANÇA | Sessão individual/conjunta, aprovações, I411, autonomia | `05_GOVERNANCA.md` |
| 06 SEGURANÇA | Autenticação, MFA, LGPD, audit trail imutável | `06_SEGURANCA.md` |
| 07 UX | Login, dashboard, fluxos, modais, onboarding | `07_UX.md` |
| 08 ROADMAP | Agora, Semi-automático, Autônomo | `08_ROADMAP.md` |

## Estado Atual (2026-08-13)

```
Stack:  React/Vite → Vercel / Express 5 → Render / PostgreSQL → Neon
URL:    site-st.vercel.app/aliancapanorama/rapadura
API:    site-st.onrender.com/api/rapadura/*
DB:     ep-late-pond-acean4b0.sa-east-1.aws.neon.tech (5 tabelas v2)
```

**Implementado:**
- Score Engine v2 (Calmar Ratio + Fator Verde + Score de Confiança 8 campos)
- POST /rapadura/investir (alocação quadrática top-5)
- POST /rapadura/colher (resgate por pior score, raiz mínima)
- GET /rapadura/analise (Pertences × Oportunidades, sugestões FORTE/MODERADO/FRACO)
- Frontend: VerdeBadge, InvestirModal, ColherModal, AnalisarView
- Usuários: Yuri (id=1, role=yuri) · Mayumi (id=2, role=mayumi)
- rapadura_aprovacoes (tabela I411 — endpoints: backlog)

**Pendente (backlog priorizado):**
1. I438 — Histórico de motivos obrigatório (genealogia auditável)
2. I443 — Threshold de autonomia explícito (R$500/5k/20k)
3. I433 — Índice de Troca 9 variáveis
4. I442 — Audit trail com hash SHA-256
5. I417 — Painel de aprovações pendentes (I411 endpoints)
6. I434 — Diversificação efetiva vs nominal
7. I415 — Importar CSV XP
8. I414 — Simulador de estresse (crash COVID)
9. I430 — Simulador de estresse (backtesting)
10. I435 — Sonhos noturnos (cron Cana)
11. I436 — Assembleia interna da Cana (5 agentes)

## Threshold de Autonomia (I443 — a definir)

| Valor | Regime |
|-------|--------|
| < R$ 500 | Sugestão automática — 1 clique para confirmar |
| R$ 500 – R$ 5k | Aprovação com 1 clique (log obrigatório) |
| > R$ 5k | Aprovação dupla I411 (Yuri + Mayumi) |
| > R$ 20k | Sessão conjunta obrigatória (ambos autenticados) |

## Senhas Iniciais

| Usuário | Senha inicial |
|---------|--------------|
| Yuri | `rapadura@yuri2026` |
| Mayumi | `rapadura@mayumi2026` |

*Trocar após primeiro acesso (I416 — a implementar)*

---
*Guardião: Yuri · Última atualização: 2026-08-13 · Sessão 100*
