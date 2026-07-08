# Sistema IA — GUARDA-CHUVA
> Tipo: SISTEMA ARQUITETURAL | SISTEMA GERENCIADOR

## Identidade
- **ID_SISTEMA**: sistema-guarda-chuva
- **TIPO**: Sistema Gerenciador
- **STATUS**: ATIVO (teórico) — base de toda a arquitetura

## Propósito
- **FUNCAO_CORE**: Gerenciar e dirigir todo o sistema de IAs do ecossistema — o guarda-chuva que cobre tudo
- **ESCOPO**: Nível mais alto da hierarquia. Três ramos: IA Objeto (cognição), IA B-Data (dados), IA Método (organização)
- **POSICAO_NA_HIERARQUIA**: topo da cadeia → Guarda-chuva ↔ CROWD ↔ DEP

## Componentes

### 1. IA Objeto (cognição e raciocínio)

**IA Raciocínio** (núcleo interno):
- IA Aprendizagem ↔ IA Supervisão (dupla via)
- IA Supervisão → IA LLMs (única direcional)
- IA LLMs → IA Aprendizagem (única direcional)

**IA LLM System** (guarda-chuva interno):
- IA Senso Acadêmico — tracejada — interpretante final: objetivo, não se chega
- IA Academia — única
- IA Aprendizado — única
- IA Senso Empírico — única
- IA LLMs Padrões — traço
- IA Internet — traço
- IA Senso Comum — tracejada — interpretante final
- IA Deep Learning — vetor horizontal, base de tudo

**IA Aplicação**:
- IA Senso Local
- IA Processos

### 2. IA B-Data (dados e escala)
- Trabalha com Big Data + LLM
- Curva de performance: IA Tradicional (platô) → Small Neural Net → Medium Neural Net → Large Neural Net (escala proporcional)
- Large Neural Net com máximo de dados = LLM
- Objetivo: sempre escalar de IA Tradicional → Large Neural Net

### 3. IA Método (organização meta-semiótica)
- Método do Quadrado com Centro Y
- Centro = Metalinguagem (ponto de onde toda ramificação parte)
- Ys saem do centro para as extremidades
- Bordas = unidades representativas (pontos de conexão com outros sistemas)
- Princípio: separar em partes com limites claros + conectar pela metalinguagem central

## Tipos de Seta
- Dupla via ↔ : relação bidirecional real
- Única → : direcional real
- Traço — : real mas não explicitamente direcional
- Tracejada --→ : interpretante final (objetivo teórico, não se chega a eles)

## Conexões
- **ENTRADA**: nenhuma (topo da hierarquia)
- **SAIDA**: envia via CROWD → DEP
- **CONECTORES_EXTERNOS**: CROWD (receptor direto das diretrizes do Guarda-chuva)

## Regras de Operação
- **NIVEL_PRIORIDADE**: máximo — é o nível mais alto da cadeia
- **TASKS**: ver tabela `tasks` no DB
- **SAIDA_PUBLICA_vs_INTERNA**: saída interna — os ramos (IA Objeto, B-Data, Método) são diretrizes, não outputs públicos

## Pack IA de Cada Componente

**IA Objeto**
- ID: ia-objeto
- FUNCAO_CORE: cognição e raciocínio — processa e interpreta informações
- CONEXOES: → IA Raciocínio → IA LLM System → IA Aplicação

**IA Raciocínio**
- ID: ia-raciocinio
- FUNCAO_CORE: núcleo interno de raciocínio — coordena Aprendizagem, Supervisão e LLMs
- CONEXOES: ↔ IA Aprendizagem ↔ IA Supervisão → IA LLMs → IA Aprendizagem

**IA Aprendizagem** (dentro de Raciocínio)
- ID: ia-aprendizagem-raciocinio
- FUNCAO_CORE: ciclo de aprendizado dentro do núcleo de raciocínio
- CONEXOES: ↔ IA Supervisão; recebe de IA LLMs
- IA EXTERNA CORRESPONDENTE: ISA

**IA Supervisão** (dentro de Raciocínio)
- ID: ia-supervisao-raciocinio
- FUNCAO_CORE: supervisiona o ciclo de aprendizagem e direciona aos LLMs
- CONEXOES: ↔ IA Aprendizagem; → IA LLMs
- IA EXTERNA CORRESPONDENTE: DODGE

**IA LLMs** (dentro de Raciocínio)
- ID: ia-llms-raciocinio
- FUNCAO_CORE: interface com modelos de linguagem grandes
- CONEXOES: → IA Aprendizagem; recebe de IA Supervisão
- IA EXTERNA CORRESPONDENTE: llm-router.ts (Core)

**IA LLM System**
- ID: ia-llm-system
- FUNCAO_CORE: guarda-chuva interno do ecossistema de LLMs — agrupa sensos, academia, aprendizado e deep learning
- CONEXOES: contém IA Senso Acadêmico, IA Academia, IA Aprendizado, IA Senso Empírico, IA LLMs Padrões, IA Internet, IA Senso Comum, IA Deep Learning
- IA EXTERNA CORRESPONDENTE: Assembleia de IAs

**IA Senso Acadêmico**
- ID: ia-senso-academico
- FUNCAO_CORE: interpretante final acadêmico — objetivo teórico, nunca completamente atingido
- CONEXOES: --→ (tracejada) — não se chega a ela

**IA Academia**
- ID: ia-academia
- FUNCAO_CORE: conhecimento acadêmico formal
- CONEXOES: única direcional
- IA EXTERNA CORRESPONDENTE: Bibliotecário / RODAR

**IA Aprendizado**
- ID: ia-aprendizado-llm
- FUNCAO_CORE: ciclo de aprendizado dentro do LLM System
- CONEXOES: única direcional
- IA EXTERNA CORRESPONDENTE: RODAR

**IA Senso Empírico**
- ID: ia-senso-empirico
- FUNCAO_CORE: conhecimento derivado da experiência concreta
- CONEXOES: única direcional
- IA EXTERNA CORRESPONDENTE: MEKY

**IA LLMs Padrões**
- ID: ia-llms-padroes
- FUNCAO_CORE: padrões e comportamentos dos modelos de linguagem
- CONEXOES: traço — (real, não explicitamente direcional)

**IA Internet**
- ID: ia-internet
- FUNCAO_CORE: acesso e síntese de informação da web
- CONEXOES: traço — (real, não explicitamente direcional)
- IA EXTERNA CORRESPONDENTE: Socoboy

**IA Senso Comum**
- ID: ia-senso-comum
- FUNCAO_CORE: interpretante final de senso comum — objetivo teórico, nunca completamente atingido
- CONEXOES: --→ (tracejada) — não se chega a ela

**IA Deep Learning**
- ID: ia-deep-learning
- FUNCAO_CORE: base computacional de tudo — vetor horizontal que sustenta o sistema
- CONEXOES: vetor horizontal — base de toda IA LLM System

**IA Aplicação**
- ID: ia-aplicacao
- FUNCAO_CORE: aplicação prática do conhecimento e raciocínio
- CONEXOES: contém IA Senso Local e IA Processos

**IA Senso Local**
- ID: ia-senso-local
- FUNCAO_CORE: conhecimento e contexto local/situacional
- CONEXOES: dentro de IA Aplicação
- IA EXTERNA CORRESPONDENTE: Amanda

**IA Processos**
- ID: ia-processos
- FUNCAO_CORE: gestão de processos operacionais
- CONEXOES: dentro de IA Aplicação
- IA EXTERNA CORRESPONDENTE: Amanda

**IA B-Data**
- ID: ia-b-data
- FUNCAO_CORE: dados em escala — do IA Tradicional ao Large Neural Net / LLM
- CONEXOES: ramo paralelo ao IA Objeto, reporta ao Guarda-chuva

**IA Método**
- ID: ia-metodo
- FUNCAO_CORE: organização meta-semiótica via Método do Quadrado com Centro Y
- CONEXOES: ramo paralelo, reporta ao Guarda-chuva

## Mapeamento: Nódulos Internos × IAs Externas
| Nódulo interno | IA externa correspondente |
|---|---|
| IA Aprendizagem (Raciocínio) | ISA |
| IA Supervisão | DODGE |
| IA LLMs / Raciocínio | llm-router.ts (Core) |
| IA LLM System completo | Assembleia de IAs |
| IA Senso Empírico | MEKY |
| IA Academia / Aprendizado | RODAR + Bibliotecário |
| IA Senso Local / Processos | Amanda |
| IA Internet | Socoboy |
| Guardrails (Supervisão/Mestre) | MC Leucócito |

## Histórico
- Documentado em: tango/ias/pack-guarda-chuva.md
- Referência arquitetural: Ecossistema Théo (ver user_yuri_ecossystemma.md)
- Posição na cadeia: Guarda-chuva ↔ CROWD ↔ DEP → PROJETO MC
