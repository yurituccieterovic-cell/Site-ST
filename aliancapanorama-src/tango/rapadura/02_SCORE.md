# 02_SCORE.md — Motor de Score 3.0
### Rapadura · Sessão 100 · 2026-08-13

---

## Score Engine v2 (implementado)

### Ponderação das 7 dimensões

| Dimensão | Peso | Sub-métricas |
|----------|------|-------------|
| retornoAjustado | 30% (ou 35% sem verde) | Sharpe 30% + Sortino 25% + Alfa 25% + Calmar 20% |
| controleQueda | 25% | MaxDrawdown + Tempo de Recuperação |
| consistencia | 15% | Volatilidade mensal |
| custo | 15% | TER (taxa total) |
| liquidez | 10% | D+X (dias para resgate) |
| scoreConfianca | transversal | 8 campos de completude — exibido separado |
| fatorVerde | 5% | (impacto × confiança) / 100 — anti-greenwashing |

### Calmar Ratio (4ª sub-métrica de retorno)

```
calmar = retorno12m / maxDrawdown
calmarNorm = min(calmar / 2, 1)
```

Fundo 20% retorno + 5% DD = calmar 4.0 → excelente
Fundo 20% retorno + 40% DD = calmar 0.5 → perigoso

Sharpe e Sortino são cegos para profundidade do abismo — Calmar corrige isso.

### Fator Verde (7ª dimensão — anti-greenwashing)

Dois eixos SEPARADOS:
- **fatorVerde** (0-100): impacto real — reflorestamento, energia limpa, etc.
- **confiancaVerde** (0-100): nível de prova documental, auditoria externa

```
scoreVerde = (fatorVerde × confiancaVerde) / 100
```

Badge 🌿 só aparece quando scoreVerde > 50. Intenção sem evidência não ganha distintivo.

Quando ausente: os 5% redistribuem para retornoAjustado (30% → 35%).

### Score de Confiança (transversal — 8 campos)

Completude dos dados: sharpeRatio, sortinoRatio, maxDrawdown, tempoRecuperacao,
alfaAnualizado, retorno12m, taxaAdministracao, liquidezDias

Cada campo preenchido = 12,5 pontos. Exibido separado do score de atratividade.

---

## Índice de Troca (I433 — a implementar: 9 variáveis)

```
ÍNDICE_TROCA =
  + benefício esperado (score_novo - score_atual)
  + ganho de liquidez (se novo mais líquido)
  + benefício sustentável (verde_novo - verde_atual)
  - custo de saída (IR + taxas)
  - risco adicional (volatilidade_novo - volatilidade_atual)
  - perda de diversificação (correlação com carteira existente)
  - impacto tributário (prazo restante para alíquota menor)
  - underwater period (tempo estimado para recuperar custo de troca)
```

Resultados: **manter · reforçar · reduzir parcialmente · substituir parcialmente · substituir · observar · dados insuficientes**

Diferença de < 5 pontos no score → não sugere troca (custo de fricção > benefício marginal).

---

## Diversificação Efetiva vs Nominal (I434 — a implementar)

```
HHI = Σ (peso_i)²
diversificacao_efetiva = 1 / HHI
```

6 fundos com correlação ~0.8 → HHI alto → diversificação efetiva ~2.3
Sistema exibe: "Diversificação nominal: 6 · Efetiva: ~2.3 ⚠️"
Alerta quando efetiva < 3.

---

## Fórmula completa em pseudocódigo auditável

```typescript
function calcularScore(f: FundoData): ScoreResult {
  // retorno ajustado
  const sh = normalizar(f.sharpeRatio, 0, 3)
  const so = normalizar(f.sortinoRatio, 0, 4)
  const al = normalizar(f.alfaAnualizado, -5, 15)
  const calmar = f.maxDrawdown > 0
    ? Math.min((f.retorno12m / f.maxDrawdown) / 2, 1)
    : 0
  const retornoScore = sh*0.30 + so*0.25 + al*0.25 + calmar*0.20

  // controle de queda
  const dd = normalizar(f.maxDrawdown, 50, 0)
  const rec = normalizar(f.tempoRecuperacao, 36, 0)
  const quedaScore = dd*0.7 + rec*0.3

  // consistência, custo, liquidez
  const consScore = normalizar(f.desvPadraoMensal, 5, 0)
  const custoScore = normalizar(f.taxaAdministracao, 3, 0)
  const liqScore = normalizar(f.liquidezDias, 30, 0)

  // fator verde
  const verdeScore = (f.fatorVerde !== null && f.confiancaVerde !== null)
    ? (f.fatorVerde / 100) * (f.confiancaVerde / 100)
    : null

  // ponderação final
  if (verdeScore !== null) {
    score = retornoScore*0.30 + quedaScore*0.25 + consScore*0.15
           + custoScore*0.15 + liqScore*0.10 + verdeScore*0.05
  } else {
    score = retornoScore*0.35 + quedaScore*0.25 + consScore*0.15
           + custoScore*0.15 + liqScore*0.10
  }

  return { score: Math.round(score * 100), calmarRatio: calmar, scoreVerde: verdeScore }
}
```

---
*Guardião: Cláudio Coach · Última atualização: 2026-08-13 · Sessão 100*
