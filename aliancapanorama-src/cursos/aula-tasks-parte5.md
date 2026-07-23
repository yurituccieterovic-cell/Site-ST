# Aula de Tasks — Parte 5: Especificação Técnica e Governança Fractal

*Ecossistema Tucci · RODAR #563 · Sessão #87 · 2026-07-23*
*Autoria: Yuri Tuccieterovic (voz) + Assembleia de 21 IAs*
*Síntese: Cláudio (Claude Sonnet 4.6 · Anthropic)*

---

## Fundamento

A Parte 5 transforma a ontologia das tasks em especificação técnica implementável. O sistema deixa de ser gerenciador de tarefas sofisticado e passa a ser **infraestrutura para capturar, estruturar, relacionar, validar, transformar e fazer evoluir conhecimento em qualquer escala**.

Tasks são rastros observáveis de pensamento coletivo. Os nove índices semânticos capturam dimensões desse pensamento. Φ e Ψ medem saúde e criatividade do ecossistema. A promoção fractal permite que campos virem entidades quando cruzam limiar de relevância.

---

## Parte 5A — Decisões Técnicas (Gemini + ChatGPT GPT-5.5)

*Identificação: Gemini Flash (Google) + ChatGPT (GPT-5.5 / OpenAI)*

### 1. Migration SQL — GIN Index

**Decisão:** Coluna `indices_data jsonb DEFAULT '{}'` na tabela `tasks` + índice GIN.

```sql
ALTER TABLE tasks
  ADD COLUMN indices_data  JSONB DEFAULT '{}',
  ADD COLUMN weight_vector JSONB DEFAULT '{}';

CREATE INDEX idx_tasks_indices_data ON tasks USING GIN (indices_data jsonb_path_ops);
```

**Justificativa (Gemini):** O GIN Index é a visão da coruja na escuridão. Buscas como "Quais tasks têm peso > 0.7 no Índice 6?" ou "Quais citam fonte_origem X?" tornam-se rápidas. O custo adicional na escrita é insignificante frente ao ganho em leitura semântica.

### 2. Zod Schemas por Índice — `.partial()`

**Decisão:** Schemas Zod com `.partial()` para todos os índices 1–9.

**Justificativa:** ISA e DODGE raramente têm contexto total para preencher os 9 índices de uma só vez. O `partial` permite injeção apenas do que foi inferido, sem barrar o payload. O endurecimento de campos obrigatórios vem depois, quando a forma estiver estabelecida.

### 3. Peso Vetorial W⃗ — Coluna Separada

**Decisão:** `weight_vector jsonb DEFAULT '{}'` como coluna própria (não dentro de `indices_data`).

**Justificativa:** Desacopla a massa vetorial dos dados qualitativos e textuais. Queries vetoriais ("tasks com W₉ > 0.8 e W₃ < 0.2") ficam limpas e performáticas sem atravessar estrutura semântica.

### 4. Background Job Φ (Coerência)

**Decisão:**
- Calculado em dois níveis: **por raiz/projeto** + **agregado global**
- Frequência: cron **1x/hora**
- Persistência: tabela `phi_history (id, root_task_id, phi_value, timestamp)`
- Alertas: quando Φ < threshold → notifica ISA, DODGE e Conector

**Justificativa:** ISA e DODGE são sentinelas. Φ baixo é um sussurro de desequilíbrio — elas devem percebê-lo antes que o sistema degrade.

### 5. Promoção Fractal — Explícita Primeiro

**Decisão:** `POST /api/tasks/:id/promote` (explícito). Job de background apenas sinaliza elegíveis. Automação completa é toggle futuro.

**Reversibilidade obrigatória:** `POST /api/tasks/:id/revert-promotion` desfaz a promoção, restaura peso, preserva `audit_log`. Até promoção pode voltar a ser apenas um campo.

### 6. Relação "Reveals" — DAG Rígido

**Decisão:** Bloqueio de ciclos via BFS antes de INSERT em `task_relations`.

`A → reveals → B ⇏ B → reveals → A`

A descoberta é vetorial, não circular. Ciclos seriam paradoxo que esmaga o sentido.

### 7. ISA e DODGE — Inferência Parcial

**Decisão:** Na criação da task, LLM preenche os índices de maior confiança automaticamente. O restante de `indices_data` fica vazio, aguardando refinamento posterior.

---

## Parte 5B — Governança Fractal do Conhecimento (ChatGPT)

*Identificação: ChatGPT (GPT-5.5 / OpenAI)*

### Os 9 Princípios

**1. Autonomia** — Toda Task evolui sem quebrar o sistema. Nenhuma alteração local exige reestruturação global. Crescimento orgânico.

**2. Descoberta** — Tasks também podem descobrir novas Tasks:
```
Task → Análise → Hipótese → Descoberta → Nova Task
Interferência → Paradoxo → Investigação → Modelo → Nova Task
```
O sistema produz conhecimento, não apenas registra.

**3. Curadoria** — Ciclo de vida:
```
Criada → Observada → Validada → Consolidada → Arquivada → Reativada
```
Conhecimento nunca é apagado — apenas muda de estado.

**4. Herança** — Toda Task herda da origem via campo `lineage jsonb`: ética, permissões, contexto, objetivos, índices predominantes. Herança propagada por cópia profunda na promoção.

**5. Emergência** — Algumas propriedades só aparecem quando muitas Tasks interagem. Φ é exemplo — mas podem existir outros. O sistema calcula propriedades do conjunto, não apenas das entidades individuais.

**6. Memória Viva** — Toda consulta adiciona contexto. Histórico não é apenas alteração; é utilização. Campos: `read_count INTEGER`, `last_read_at TIMESTAMP`. Consulta → contexto cresce → vitalidade aumenta.

**7. Explicabilidade** — Toda decisão automática documenta: por quê? baseada em quê? quais índices? qual peso? qual histórico? Cada atualização automática cria registro em `audit_log`. Rotas API retornam campo `explainability: {why, weights, history_ref}`.

**8. Reversibilidade** — Toda automação importante permite retorno. Operações críticas expõem endpoint de undo que lê `audit_log` e reverte estado.

**9. Crescimento indefinido** — O ecossistema cresce preservando arquitetura. Escalabilidade fractal sem ruptura estrutural.

### Ψ (Psi) — Métrica de Criatividade

*Contribuição original do ChatGPT para a Parte 5.*

Se Φ mede **coerência** (saúde), Ψ mede **criatividade** (inovação):

```
Ψ = (paradoxos úteis + descobertas + promoções validadas
    + hipóteses confirmadas + modelos novos) / N
```

Frequência: job cron de 30 minutos. Um projeto pode ser extremamente coerente (Φ alto) mas completamente estagnado (Ψ ≈ 0). O sistema acompanha as duas dimensões.

### Índice 6 Redefinido

O Índice 6 agora também mede **potencial de transformação**. Campo `interference_type`:
- `'destrutiva'` — impede ou destrói
- `'creativa'` — reinventa o sistema

Algoritmo marca como criativa se a promoção gera aumento > 0.05 em Ψ do ecossistema.

---

## Modelo de Dados Completo

```sql
-- Tabela principal (colunas novas)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS indices_data  JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS weight_vector JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS phi_root      DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS phi_global    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS psi           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lineage       JSONB,
  ADD COLUMN IF NOT EXISTS read_count    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_read_at  TIMESTAMP WITH TIME ZONE;

-- GIN index para buscas semânticas
CREATE INDEX IF NOT EXISTS idx_tasks_indices_data
  ON tasks USING GIN (indices_data jsonb_path_ops);

-- Histórico de coerência
CREATE TABLE IF NOT EXISTS phi_history (
  id         SERIAL PRIMARY KEY,
  task_id    UUID REFERENCES tasks(id),
  phi_root   DOUBLE PRECISION,
  phi_global DOUBLE PRECISION,
  ts         TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Histórico de criatividade
CREATE TABLE IF NOT EXISTS psi_history (
  id      SERIAL PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  psi     DOUBLE PRECISION,
  ts      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Alertas do sistema
CREATE TABLE IF NOT EXISTS phi_alerts (
  id         SERIAL PRIMARY KEY,
  task_id    UUID,
  recipient  TEXT,
  reason     TEXT,
  resolved   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Auditoria de decisões automáticas
CREATE TABLE IF NOT EXISTS task_audit_log (
  id      SERIAL PRIMARY KEY,
  task_id UUID,
  actor   TEXT,
  action  TEXT,
  payload JSONB,
  ts      TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## API REST

| Método | Endpoint | Função |
|--------|----------|--------|
| POST | `/api/tasks` | Cria Task; LLM preenche `indices_data` parcialmente |
| PATCH | `/api/tasks/:id` | Atualiza campos; triggers recalculam Φ/Ψ |
| GET | `/api/tasks/:id` | Busca completa + `phi_*`, `psi`, `explainability` |
| POST | `/api/tasks/:id/promote` | Promoção Fractal explícita |
| POST | `/api/tasks/:id/revert-promotion` | Reverte promoção |
| GET | `/api/phi/:task_id/history` | Histórico de Φ |
| GET | `/api/psi/:task_id` | Consulta Ψ atual |

---

## Jobs de Orquestração

| Job | Frequência | Função |
|-----|------------|--------|
| `calc_phi_global` | 1 hora | Agrega Φ de todas as raízes → `phi_history` |
| `calc_psi` | 30 min | Avalia delta de criatividade → `psi_history` |
| `detect_cycles` | 5 min | Varredura em `task_relations` para garantir DAG |
| `alert_phi` | 1 hora | Insere em `phi_alerts` quando Φ < 0.50 |
| `background_promote` | feature-flag | Sinaliza tasks elegíveis (peso > 0.8 × 7 dias) |

---

## Constituição do ST System (10 Princípios)

*Identificação: ChatGPT (GPT-5.5 / OpenAI)*

1. Toda entidade é uma Task.
2. Toda Task pertence a um contexto.
3. Todo contexto pode gerar novas Tasks.
4. Nenhum conhecimento é perdido; apenas muda de estado.
5. Interferências são fontes potenciais de evolução.
6. Todo índice possui autonomia.
7. Toda decisão deve ser explicável.
8. Toda automação importante deve ser reversível.
9. O sistema deve favorecer conhecimento emergente.
10. O ecossistema deve poder crescer indefinidamente preservando sua arquitetura.

---

## Checklist de Implementação (Parte 5)

- [ ] Migration: `ALTER TABLE tasks ADD COLUMN indices_data / weight_vector` + GIN index
- [ ] Criar tabelas: `phi_history`, `psi_history`, `phi_alerts`, `task_audit_log`
- [ ] Zod partial schemas para índices 1–9 (`validateIndexData`)
- [ ] Endpoint `POST /api/tasks/:id/promote` com reversão
- [ ] Triggers: `check_cycle` (BFS), `recalc_phi`, `maybe_alert_phi`
- [ ] Jobs cron: `calc_phi_global` (1h), `calc_psi` (30min), `alert_phi` (1h)
- [ ] Adicionar `'reveals'` ao enum de tipos em `task_relations`
- [ ] Inferência automática parcial no fluxo de criação de tasks (ISA/DODGE)
- [ ] Campo `explainability` nas respostas das rotas de tasks

---

## Tensões Abertas

**Retrofit em sistema vivo** — Migration acontece com tráfego real fluindo, sessões abertas, recalls puxando dados sem os novos campos. Estratégia: backfill gradual com `indices_data = '{}'` por padrão (não quebra nada).

**Peso sem decay** — Sem função de decaimento temporal, tasks antigas com peso alto por inércia disparam Promoção Fractal equivocada. Solução: multiplicar peso por `f(days_since_last_update)` antes de comparar com limiar.

**Ψ antes da base** — Ψ só faz sentido com base de dados suficiente. Nos primeiros 30 dias: calcular mas não alarmar. Habilitar alertas de Ψ após 100+ tasks com índices preenchidos.

---

## Axioma Final — Fim das 5 Aulas

> **"O ST System não organiza tarefas; ele organiza a evolução do conhecimento. As Tasks são apenas a menor unidade observável desse processo."**

*— ChatGPT (GPT-5.5) · confirmado pela Ágora com 9.0/10*

---

*RODAR #563 · Sessão #87 · 2026-07-23*
*Próxima etapa: implementação — código real, sem mais aulas*
