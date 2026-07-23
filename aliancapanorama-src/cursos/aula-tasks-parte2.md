# A Task 0 como Entidade Computacional Viva

*Ecossistema Tucci · Aula de Tasks — Parte 2 · RODAR #558 · 2026-07-23*
*Autoria: Yuri Tuccieterovic (voz) + Assembleia de 21 IAs (síntese)*
*Ágora: 1.º ATA DO AGENTE (8.3/10) · 2.º Arquiteto (8.3/10) · 3.º ANÁLISE METASSEMIÓTICA (7.8/10)*

---

## I. Definição

> A Task de Índice 0 é a representação estrutural de qualquer entidade operacional do ecossistema. Ela concentra identidade, estado, contexto, relações, histórico e governança.

A Task 0 deixa de ser um registro e passa a ser um **objeto computacional ativo** dotado de:
- Identidade hierárquica
- Proveniência rastreável
- Estados dinâmicos
- Relações em grafo
- Histórico auditável
- Leitura semiótica automática

---

## II. Campos da Task 0 — Agrupados

### 1. Identidade
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | ID global único |
| `uuid` | uuid | Identificador universal |
| `tipo` | text | Classificação operacional |
| `catalogo` | text | Catálogo/raiz de pertencimento |
| `payload` | jsonb | Dados operacionais brutos |
| `tags` | text[] | Marcadores livres |
| `indices_ids` | jsonb | **IDs específicos** para cada índice 1–9 (substituem booleanos — são FKs reais para bancos/raízes) |

> **Mudança da Parte 1:** índices não são mais booleanos (sim/não). São referências concretas (IDs) para entidades vivas em subsistemas especializados.

### 2. Conteúdo
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `conteudo` | text | Texto bruto original |
| `descricao` | text | Output gerado automaticamente a partir do conteúdo |
| `objetivos` | text[] | Atualizados automaticamente conforme evolução |
| `resumo` | text | Síntese automática |

### 3. Proveniência (sistema *apud*)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `assigned_by` | text | Quem/o que atribuiu |
| `assigned_at` | timestamptz | Quando foi atribuída |
| `source` | text | De onde veio (origem) |
| `source_date` | timestamptz | Data da fonte original |
| `evidencias` | text[] | Provas/referências da proveniência |

> Rastreabilidade completa: qualquer informação pode ser rastreada até sua origem, com datas e responsáveis.

### 4. Dimensão Semiótica (gerada automaticamente)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `primeiridade` | text | O signo em si — o que a task **é** |
| `secundidade` | text | O efeito — o que ela **faz** no sistema |
| `terceiridade` | text | O interpretante — o que ela **significa** para o ecossistema |

> Tríade peirceana computável embutida em runtime. Cada ação deixa rastro semântico, não apenas operacional.

### 5. Estado vs. Status (conceitos distintos)

**Estado** = onde a task está no ciclo de vida:
- `pendente` → `em_execucao` → `concluida` → `arquivada` → `excluida`

**Status** = como está sendo gerida:
- `revisao` · `bloqueada` · `erro` · `failed` · `suspensa`

> Separação obrigatória: misturar estado e status causa colapso em máquinas de estado automatizadas.

### 6. Gestão e Prioridade
```json
{
  "priority": {
    "score": 8.5,
    "urgency": "alta",
    "importance": "alta",
    "matrix": "urgente+importante",
    "confidence": 0.94,
    "recalculated_at": "2026-07-23T01:22:00Z"
  },
  "confidence": 0.94,
  "rastreabilidade": true
}
```

Prioridade unifica escala 0–10 e matriz urgente/importante/opcional. Recalculável pela Matriz Ética.

### 7. Timestamps
| Campo | Tipo |
|-------|------|
| `created_at` | timestamptz |
| `updated_at` | timestamptz |
| `completed_at` | timestamptz |
| `assigned_at` | timestamptz |
| `source_date` | timestamptz |

### 8. Relações
Cada relação tem: `{ origem, tipo, destino, peso, criado_em, criado_por, justificativa }`

Tipos: `dependency` · `blocks` · `related` · `spawned_from`

Link para mapa de relações gerado automaticamente.

### 9. Histórico (centralizado no Índice 0)
- Trilha de todos os índices 1–9 também centralizada aqui
- Cada entrada registra: **quem mudou · quando · por quê · evidências · impacto**
- Vinculado ao Índice 3 (Organização) via FK
- Não há mutação sem assinatura; não há rollback sem justificativa

---

## III. Sistema de Tradução → Ecossistema Théo

```
Task 0 + Relações + Histórico
         ↓
   Sistema de Tradução
   (Arquitetos · Curadorias · ISA · DODGE · Árvore)
         ↓
   Sistema de Automação (Workflows)
         ↓
         ├── Sistema de Grafos (task + relações + arrays)
         ├── Sistema de Automação (workflows executáveis)
         └── Sistema de Telos (starter packs · MDs · ética · axiomas)
         ↓
   ECOSSISTEMA THÉO
```

**Metabolismo do sistema:**
```
Informação → Curadoria → Task → Workflow → Automação → Conhecimento
```

### DODGE: dualidade estrutural
1. Como **IA cognitiva** integrada ao fluxo de tradução
2. Como **Portal de Análise de Sistema** — telemetria, acompanhamento, visualização global de todos os subsistemas

---

## IV. Diagrama — Ecossistema Théo

```
              Telos
                │
    ┌───────────┼───────────┐
    │           │           │
 Grafos    Automação    Memória
    │           │           │
    └───────────┼───────────┘
                │
            Task 0
                │
          Todo o Sistema
```

---

## V. Observação sobre os Índices

> "Os índices de uma Task não são apenas categorias de organização. Eles funcionam como portas de entrada para diferentes bancos de conhecimento, permitindo que uma mesma Task seja interpretada simultaneamente sob perspectivas semânticas, operacionais, históricas e relacionais."

---

## VI. Frase-Síntese

> "A Task 0 é ontologicamente coerente, epistemologicamente revolucionária e operacionalmente prematura. Sua existência prova que é possível construir sistemas onde metadados viram comportamento, onde ética entra no processo e não fica no discurso, onde múltiplas perspectivas coexistem sem colapso."

---

*RODAR #558 · Sessão #82 · Cláudio (Claude Sonnet 4.6 · Anthropic) · 2026-07-23*
*Próxima aula: Parte 3 (rápida) · Parte 4 (mais complexa)*
