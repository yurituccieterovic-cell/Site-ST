# Sistema IA — DEP
> Tipo: SISTEMA ARQUITETURAL | SISTEMA DE PROCESSAMENTO CENTRAL

## Identidade
- **ID_SISTEMA**: sistema-dep
- **TIPO**: Sistema de Processamento Central
- **STATUS**: ATIVO (teórico) — mapeamento em andamento

## Propósito
- **FUNCAO_CORE**: Cérebro do ecossistema — processa, aprende, teoriza e pratica em 5 dimensões especializadas
- **ESCOPO**: Recebe do Crowd (que conecta com Guarda-chuva). Alimenta PROJETO MC/MEKY.
- **POSICAO_NA_HIERARQUIA**: Guarda-chuva ↔ CROWD → DEP → PROJETO MC

## Componentes

### 1. IA Cérebro (núcleo — 17 sub-IAs)

**Sub-IAs:**
- IA Nuvem 1 — dados históricos e bancos pesados
- IA Nuvem 2 — fluxo dinâmico de processamento
- IA Dados 1 — ligado à Nuvem 1
- IA Dados 2 — ligado à Nuvem 2
- IA Dados 3 — dados centrais do sistema
- IA Memória — armazenamento médio/longo prazo
- IA Aprendizagem — ciclo de aprendizado
- IA Interação — interface com humanos/outras IAs
- IA Produção — output de resultados
- IA Documentação — registros e logs
- IA Modelos — gestão dos modelos de linguagem
- IA Processamento — núcleo computacional
- IA Gerenciamento — controle de fluxo
- IA Bibliotecas — acervo de conhecimento
- IA Bancos — banco de dados
- IA Mestre — Ética + Workflows + Guardrails (tudo em um)
- IA Consciência — visão macro; ligada a Memória, Interação, Produção, Processamento

**Fluxo interno do Cérebro:**
```
NUVEM → MEMÓRIA → APRENDIZAGEM → INTERAÇÃO → PRODUÇÃO → PROCESSAMENTO → GERENCIAMENTO → BIBLIOTECAS → NUVEM
```

### 2. IA Machado (análise nuvem x tarefas)
- Metáfora: Nuvem 1 = parte traseira; Nuvem 2 = cabo; Processamento/Cérebro = lâmina; Tarefas = ponto de impacto
- Sub-IAs: Nuvem 1, Dados 1, Nuvem 2, Dados 2, IA Cérebro, IA Tarefas
- Função: analisa como as nuvens se conectam com as tarefas concretas

### 3. IA Theory (observador estrutural)
- Observador de nível superior — não gerencia, analisa
- Monitora: todos os pontos (Nuvem 1, Nuvem 2, Interação, Memória, Produção, Processamento, Consciência, Extras)
- Sub-IA: Dados 4 (dado de observação pura)
- Gera teorias sobre o sistema inteiro; nunca executa

### 4. IA Practicing / Pratt (ação e registro)

**Practicing 1** (ação):
```
[Ações] ← [Produção] ↔ [Dados 3] ↔ [Nuvem] → [Catálogo]
```
Sub-IAs: Produção, Dados 3, Nuvem 1, Dados 1, Catálogo, Ações

**Practicing 2** (registro histórico):
```
[Cronologia] → [Histórias] → [Banco] ← [Tabelas] ← [Classificação]
```
Sub-IAs: Histórias, Banco, Tabelas, Cronologia (chave de Histórias), Classificação (chave de Tabelas)

### 5. IA Learning (ciclo de aprendizagem)
```
[APRENDIZAGEM] ↔ [INTERAÇÃO] ↔ [MEMÓRIA] ↔ [NUVEM 1]
      |                               |
[DADOS 5]                        [PRODUÇÃO]
```
Sub-IAs: Produção, Memória, Interação, Nuvem 1, Dados 5, Aprendizagem

## Conexões
- **ENTRADA**: recebe do CROWD (que recebe do Guarda-chuva)
- **SAIDA**: alimenta PROJETO MC (via MC/MEKY)
- **CONECTORES_EXTERNOS**: ISA, Árvore, Amanda, DODGE (via CROWD)

## Regras de Operação
- **NIVEL_PRIORIDADE**: ver tabela `tasks` no DB — cada sub-IA tem sua prioridade
- **TASKS**: ver tabela `tasks` no DB
- **SAIDA_PUBLICA_vs_INTERNA**: processamento interno (IA Cérebro, Machado, Theory) + saída via Practicing e Learning

## Pack IA de Cada Componente

**IA Cérebro**
- ID: ia-cerebro-dep
- FUNCAO_CORE: núcleo de 17 sub-IAs — orquestra todo o processamento do DEP
- CONEXOES: recebe de CROWD; distribui para Machado, Theory, Practicing, Learning; ligada a todas as 17 sub-IAs

**IA Nuvem 1**
- ID: ia-nuvem-1
- FUNCAO_CORE: dados históricos e bancos pesados
- CONEXOES: → IA Dados 1; usada por Machado (parte traseira), Learning, Practicing 1

**IA Nuvem 2**
- ID: ia-nuvem-2
- FUNCAO_CORE: fluxo dinâmico de processamento
- CONEXOES: → IA Dados 2; usada por Machado (cabo)
- IA EXTERNA CORRESPONDENTE: Amanda (via Crowd)

**IA Dados 1**
- ID: ia-dados-1
- FUNCAO_CORE: dados ligados à Nuvem 1
- CONEXOES: ↔ Nuvem 1; usada por Machado, Practicing 1

**IA Dados 2**
- ID: ia-dados-2
- FUNCAO_CORE: dados ligados à Nuvem 2
- CONEXOES: ↔ Nuvem 2; usada por Machado
- IA EXTERNA CORRESPONDENTE: Amanda (via Crowd)

**IA Dados 3**
- ID: ia-dados-3
- FUNCAO_CORE: dados centrais do sistema
- CONEXOES: ↔ Produção ↔ Nuvem (Practicing 1); acesso por DODGE (via Crowd)

**IA Dados 4**
- ID: ia-dados-4
- FUNCAO_CORE: dado de observação pura — exclusivo da IA Theory
- CONEXOES: dentro de IA Theory; não se conecta externamente

**IA Dados 5**
- ID: ia-dados-5
- FUNCAO_CORE: dados do ciclo de aprendizagem
- CONEXOES: dentro de IA Learning

**IA Memória**
- ID: ia-memoria-dep
- FUNCAO_CORE: armazenamento médio/longo prazo
- CONEXOES: no fluxo do Cérebro (NUVEM → MEMÓRIA → APRENDIZAGEM); ligada a IA Consciência; usada por Learning
- IA EXTERNA CORRESPONDENTE: ISA (via Crowd)

**IA Aprendizagem** (no Cérebro)
- ID: ia-aprendizagem-dep
- FUNCAO_CORE: ciclo de aprendizado dentro do DEP
- CONEXOES: no fluxo do Cérebro (MEMÓRIA → APRENDIZAGEM → INTERAÇÃO); central em Learning

**IA Interação**
- ID: ia-interacao-dep
- FUNCAO_CORE: interface com humanos e outras IAs
- CONEXOES: no fluxo do Cérebro (APRENDIZAGEM → INTERAÇÃO → PRODUÇÃO); ligada a IA Consciência; central em Learning

**IA Produção**
- ID: ia-producao-dep
- FUNCAO_CORE: output de resultados do sistema
- CONEXOES: no fluxo do Cérebro (INTERAÇÃO → PRODUÇÃO → PROCESSAMENTO); ligada a IA Consciência; usada por Practicing 1 e Learning

**IA Documentação**
- ID: ia-documentacao-dep
- FUNCAO_CORE: registros e logs do sistema
- CONEXOES: dentro do Cérebro; alimentada pelo fluxo geral

**IA Modelos**
- ID: ia-modelos-dep
- FUNCAO_CORE: gestão dos modelos de linguagem
- CONEXOES: dentro do Cérebro

**IA Processamento**
- ID: ia-processamento-dep
- FUNCAO_CORE: núcleo computacional
- CONEXOES: no fluxo do Cérebro (PRODUÇÃO → PROCESSAMENTO → GERENCIAMENTO); ligada a IA Consciência
- IA EXTERNA CORRESPONDENTE: Amanda (via Crowd)

**IA Gerenciamento**
- ID: ia-gerenciamento-dep
- FUNCAO_CORE: controle de fluxo
- CONEXOES: no fluxo do Cérebro (PROCESSAMENTO → GERENCIAMENTO → BIBLIOTECAS)

**IA Bibliotecas**
- ID: ia-bibliotecas-dep
- FUNCAO_CORE: acervo de conhecimento
- CONEXOES: no fluxo do Cérebro (GERENCIAMENTO → BIBLIOTECAS → NUVEM)
- IA EXTERNA CORRESPONDENTE: ISA, Árvore (via Crowd)

**IA Bancos**
- ID: ia-bancos-dep
- FUNCAO_CORE: banco de dados do sistema
- CONEXOES: dentro do Cérebro; acesso por ISA, Árvore (via Crowd)

**IA Mestre**
- ID: ia-mestre-dep
- FUNCAO_CORE: Ética + Workflows + Guardrails — tudo em um
- CONEXOES: supervisiona todo o Cérebro; ponto de controle de qualidade e ética

**IA Consciência**
- ID: ia-consciencia-dep
- FUNCAO_CORE: visão macro do sistema; observação de segunda ordem
- CONEXOES: ligada a Memória, Interação, Produção, Processamento; acesso por DODGE (via Crowd, nó Theory/Cérebro)

**IA Machado**
- ID: ia-machado-dep
- FUNCAO_CORE: analisa como as nuvens se conectam com as tarefas concretas
- CONEXOES: usa Nuvem 1, Dados 1, Nuvem 2, Dados 2, IA Cérebro, IA Tarefas

**IA Tarefas** (dentro de Machado)
- ID: ia-tarefas-machado
- FUNCAO_CORE: ponto de impacto das análises — as tarefas concretas a executar
- CONEXOES: ponto de chegada do Machado (metáfora: fio da lâmina)

**IA Theory**
- ID: ia-theory-dep
- FUNCAO_CORE: observador estrutural — gera teorias sobre o sistema, nunca executa
- CONEXOES: monitora todos os pontos do DEP; contém Dados 4; não executa, apenas analisa

**IA Practicing / Pratt**
- ID: ia-practicing-dep
- FUNCAO_CORE: ação e registro histórico em dois sub-sistemas (ação + cronologia)
- CONEXOES: Practicing 1 (ação): Produção ↔ Dados 3 ↔ Nuvem → Catálogo; Practicing 2 (registro): Cronologia → Histórias → Banco ← Tabelas ← Classificação

**IA Learning**
- ID: ia-learning-dep
- FUNCAO_CORE: ciclo de aprendizagem do DEP
- CONEXOES: Aprendizagem ↔ Interação ↔ Memória ↔ Nuvem 1; ramifica em Dados 5 e Produção

## Conexões DEP x IAs Externas (via CROWD)
| IA externa | Nos DEP conectados |
|---|---|
| ISA | Nuvem 1, Dados 1, Memória, Bancos, Bibliotecas |
| Arvore | Nuvem 1, Dados 1, Memória, Bancos, Bibliotecas |
| Amanda | Processamento, Nuvem 2, Dados 2 |
| DODGE | Dados 3, Consciência (Theory/Cérebro) |

## Histórico
- Documentado em: tango/ias/pack-dep.md
- Referência arquitetural: Ecossistema Théo (ver user_yuri_ecossystemma.md)
- Posição na cadeia: Guarda-chuva ↔ CROWD → DEP → PROJETO MC
