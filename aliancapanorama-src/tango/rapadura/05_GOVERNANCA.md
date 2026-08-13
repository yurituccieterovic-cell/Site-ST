# 05_GOVERNANCA.md — Governança e Autonomia
### Rapadura · Sessão 100 · 2026-08-13

---

## Threshold de Autonomia (I443)

| Valor | Regime | Implementado? |
|-------|--------|--------------|
| < R$ 500 | Sugestão automática — 1 clique | ✅ (Investir/Colher) |
| R$ 500 – R$ 5k | Aprovação com 1 clique + log obrigatório | ⏳ log sem motivo ainda |
| > R$ 5k | Aprovação dupla I411 (Yuri + Mayumi) | ⏳ tabela criada, endpoints não |
| > R$ 20k | Sessão conjunta obrigatória | ⏳ backlog |

## I411 — Protocolo de Aprovação Dual

Tabela `rapadura_aprovacoes` existe no Neon com:
- tipo, status (PENDENTE/APROVADO/REJEITADO)
- solicitanteId, aprovadorId
- token único por aprovação
- payload JSON com os detalhes da operação
- expiresAt (aprovação expira após 24h)

**Endpoints a criar:**
- `POST /rapadura/aprovacoes` — criar solicitação
- `GET /rapadura/aprovacoes/pendentes` — listar para aprovador
- `POST /rapadura/aprovacoes/:id/aprovar` — aprovar com PIN
- `POST /rapadura/aprovacoes/:id/rejeitar`

## Histórico de Motivos (I438)

Para toda operação > R$ 1k: campo `motivo TEXT` obrigatório em rapadura_audit.
Para operações > R$ 5k: UI exige preenchimento antes de confirmar.

Genealogia auditável: cada decisão algorítmica tem:
- quem sugeriu (IA Cana vs algoritmo)
- quem aprovou (Yuri, Mayumi, ou ambos)
- motivo registrado
- timestamp e IP

## Autonomia Progressiva

```
Nível 0: Sistema apresenta dados. Usuário decide tudo.
Nível 1: Sistema sugere, exibe pros/contra. Usuário aprova.
Nível 2: Sistema propõe carteira completa. Usuário aprova como um todo. [ATUAL]
Nível 3: Aprovação rápida (1 clique) para operações dentro de thresholds.
Nível 4: Automação limitada — operações pré-autorizadas em limites rígidos.
Nível 5: Hipótese futura — requer integração bancária autorizada + revisão legal.
```

Cada nível superior exige que o inferior tenha sido **interpretado pela assembleia**, não apenas executado.

## Raiz Afetiva (implementado)

Saldo mínimo inviolável em fundos favoritos. Campo `raizPct` no endpoint colher.
Padrão: 10% do valorInvestido. Configurável por Yuri.

Não é bug — é variável explícita. O mercado não perdoa nostalgia, mas o sistema
reconhece que patrimônio não é apenas ticker: é história, vínculo, memória compartilhada.

---
*Guardião: Yuri · Última atualização: 2026-08-13 · Sessão 100*
