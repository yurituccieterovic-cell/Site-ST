# Aula — Arquitetura de IA Agentes
### 2026-07-08 · Transcrição Perplexity + Síntese

---

## Princípio Central

> **"Foco na tarefa, não no agente."**

O que importa é a resolução do problema e o fluxo do processo. As IAs (agentes) são apenas os motores intercambiáveis que executam essas frentes.

---

## 1. O Órgão dos Processos

```
  ┌───────────────┐                       ┌───────────────┐
  │    TAREFA     │                       │    AGENTE     │
  └───────┬───────┘                       └───────┬───────┘
          │ (Demanda)                             │ (Execução)
          ▼                                       ▼
    [ OBJETIVOS ]                           [ FERRAMENTAS ]
          │                                       │
          └───────────► ┌───────────────┐ ◄───────┘
                        │   WORKFLOW    │  ← O ÓRGÃO CENTRAL
                        └───────┬───────┘
                                │
                                ▼
                          [ PROCESSOS ]  ← O AUGE DO ENCONTRO
```

- Veia **Objetivos**: conecta Tarefa → Processos (o que precisa ser feito)
- Veia **Ferramentas**: conecta Agente → Processos (os instrumentos para fazer)
- **Workflow** = o órgão que abriga e bombeia tudo

---

## 2. Passo a Passo de Desenvolvimento

1. **Objetivos Definidos** — o norte
2. **Coleta e Recebimento de Informações** — ingestão de dados brutos
3. **Tipo de Agente Ideal** — seleção de perfil
4. **Integração Agente ── Outros Sistemas** — acoplamento
5. **Monitore e Otimize** — avaliação contínua
6. **Segurança e Privacidade de Dados** — proteção e governança

**Infraestrutura de suporte (em paralelo):**
Modelo · Ferramentas · Sistema de Memória · Guardrails · Sistema Login · Observabilidade

---

## 3. Protocolos e Tipos de IA

| Protocolo | Função |
|---|---|
| **Agent to Agent Protocol** | Comunicação direta entre IAs |
| **MCP Protocol** | Ferramentas — canais universais para dados/hardware |

| Tipo | Definição |
|---|---|
| **ANI** | Inteligência Artificial Narrow — faz uma tarefa específica |
| **Generativa** | Cria conteúdos com base em padrões |
| **AGI** | Máquina que aprende, pensa e aplica — interpretante final dos laboratórios |

---

## 4. Hierarquia de Agentes (As "Bolas")

```
┌─────────────────────────────── AGENTE HIERÁRQUICO (delega objetivos) ───────┐
│                                                                              │
│  ┌─── Reflexivo Baseado em Modelo ─────┐   ┌─── Utility-Based (eficiência) ─┐  │
│  │  ┌─── Reflexivo Simples ────┐       │   │  ┌─── Goal-Based (objetivos) ─┐ │  │
│  │  │   (reação rápida)        │       │   │  │   (cumprir a missão)       │ │  │
│  │  └──────────────────────────┘       │   │  └────────────────────────────┘ │  │
│  │   + mapa e histórico recente        │   │   + escolhe caminho mais vantaj.│  │
│  └─────────────────────────────────────┘   └────────────────────────────────┘  │
│                   ↑                                       ↑                     │
│             ESCOLA DAS TAREFAS                    ESCOLA DOS OBJETIVOS          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. O Grande Grafo de Workflows

```
      [ MEMÓRIA ] ──────────────────────────────────► [ WORKFLOWS ]
           │                                               │
      (↔ dupla via)                                  (→ único)
           │                                               ▼
           ↓                                         ┌─────────────┐
     ┌─────────────┐     ┌────────────┐              │  OBJETIVOS  │
     │ FERRAMENTAS │◄────┤ GUARDRAILS │◄───────┐     └──────┬──────┘
     └──────┬──────┘     └─────┬──────┘        │            │ (→ único)
            │ (→ direita)      │                │            ▼
            ▼                  │                │     ┌─────────────┐
     ┌─────────────┐           │                │     │   TAREFAS   │
     │   FUNÇÕES   │           │                │     └──────┬──────┘
     └──────┬──────┘           │                │            │ (→)
            │                  ▼                │            ▼
            └──────────► [VALIDAÇÃO] ◄──── [PROCESSOS] ◄────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
         [SISTÊMICA]      [EMPÍRICA]      [OPERAÇÃO]
          (padrão)      (meio-termo)      (uso humano)
               └──────(↔)──────┘──────(↔)──────┘
```

---

## 6. Método de Gestão de Conhecimento (PDF + MD → Workflow)

```
[PDF externo] ──┐
                ├──► [Leitura com Diretrizes]
[MD interno]  ──┘            │
                             ▼
                   [Identificar Padrões]
                             │
                             ▼
                   [Atribuir Peso/Valor]
                             │
               ┌─────────────┴─────────────┐
               ▼                           ▼
       [Alto Peso Lógico]         [Alto Valor Histórico]
               │                           │
               ▼                           ▼
        → WORKFLOW.md                → MEMÓRIA
    (texto vira comportamento)    (banco de dados/contexto)
```

**Estrutura de arquivos:**
```
workflows.md          ← Mestre: princípios + índice
workflow1_...md       ← Casos específicos
workflow2_...md
workflow3_...md
```

**Regra:** Workflow = Lógica. Mudar o MD muda o comportamento real do sistema.

---

## 7. Processamento Multimodal ("A Partitura")

```
[Áudio Bruto] → [Transformada de Fourier] → [Espectrograma = "Partitura"] → [IA Analítica]
[Vídeo/Câmera] → [Frames] → [Visão Computacional (expressões)] ──────────────────────┘
                                                                          ↓
                                                                 [Ação do Ecossistema]
```

---

## 8. Alongador de Memória

Agente de digestão: transforma memória de curto prazo (dados brutos) em memória de longo prazo (MDs limpos).

```
[Memória Curto Prazo] → [ALONGADOR] → [Memória Longo Prazo]
  "Yuri tossiu às 18h"   (filtra/resume)  "Yuri prefere canteiro norte"
```

Análogo a: ISA `isa_memory` → índice fractal (`summary` + `full_content`).

---

## 9. CrewAI — Orquestração

Três papéis no pipeline:
1. **Agente Ingestor** — lê PDF/MD com diretrizes
2. **Agente Perfilador** — calcula peso e valor de cada bloco
3. **Agente Engenheiro de Workflows** — escreve lógica em MDs

---

## Referências externas mencionadas

- **CrewAI** — framework de orquestração multi-agente
- **Coursera "IA para Todos" (Andrew Ng)** — base conceitual
- RAG Dinâmico com Orquestração Hierárquica

---

*Fonte: Transcrição Perplexity — Sessão de aula 2026-07-08*
*Registrado via #processo por Claude Code*
