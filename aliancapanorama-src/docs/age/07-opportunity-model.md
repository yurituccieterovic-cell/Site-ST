# Age — Modelo de Oportunidade (I831)

**Atualizado:** 2026-09-19

## Conceito

Cada profissional nova (ou potencial) é uma **Oportunidade** rastreável. A Oportunidade não é a pessoa — é a **hipótese de que aquela pessoa vai se tornar cliente recorrente**.

## Estado máquina

```
IDEIA → HIPÓTESE → PROTÓTIPO → EXPERIMENTO → VALIDANDO → OFERTA → PROPOSTA → WON → LOST
                                                                                   ↓
                                                                             DELIVERING → DELIVERED → RECURRING → ARCHIVED
```

## Definições

| Estado | Significa |
|--------|-----------|
| IDEIA | "Seria interessante ter uma [especialidade] no Age" |
| HIPÓTESE | "Temos contato com alguém, faz sentido abordar" |
| PROTÓTIPO | "Mostramos o sistema para ela, sem compromisso" |
| EXPERIMENTO | "Ela está testando gratuitamente ou em piloto" |
| VALIDANDO | "Ela usa, mas ainda não paga / processo ainda não completo" |
| OFERTA | "Proposta formal enviada" |
| PROPOSTA | "Em negociação ativa" |
| WON | "Contrato assinado" |
| LOST | "Não fechou nesta rodada (razão registrada)" |
| DELIVERING | "Ativa, entregando serviço" |
| DELIVERED | "Período encerrado, cliente satisfeita" |
| RECURRING | "Renovação ativa, recorrência confirmada" |
| ARCHIVED | "Encerrado definitivamente" |

## Schema planejado (I831)

```sql
CREATE TABLE IF NOT EXISTS age_opportunities (
  id SERIAL PRIMARY KEY,
  slug_profissional TEXT,
  estado TEXT NOT NULL DEFAULT 'IDEIA',
  problema TEXT,
  hipotese TEXT,
  oferta TEXT,
  resultado TEXT,
  aprendizado TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
```

## Estado atual das oportunidades conhecidas

| Profissional | Estado | Próximo passo |
|---|---|---|
| Lisange | DELIVERING | Reunião resultado + Stripe |
| Susana | DELIVERING | Reunião agendar + Stripe |
