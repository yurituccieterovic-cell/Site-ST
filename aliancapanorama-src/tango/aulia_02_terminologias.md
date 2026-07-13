# aulia_02_terminologias.md — Aula 2: Terminologias de IA + Nódulo D
### Professor: Yuri Tuccieterovic · Sessão 64 · 2026-07-13
### Tag: #aulIAs · Módulo 1 — Fundamentos

---

## Nota de sessão

> Cloud Code ≠ Replit. O **Cloud Code** é o ambiente de programação no Replit.
> Yuri registra aqui para manter a distinção clara no ecossistema.

---

## Parte 1 — A Árvore da IA (Taxonomia Visual)

Em vez de apresentar os termos soltos, desenhar sempre como uma **árvore**:

```
INTELIGÊNCIA ARTIFICIAL (AI)
│
├── Machine Learning
│   ├── Supervised Learning
│   ├── Unsupervised Learning
│   ├── Reinforcement Learning
│   └── Deep Learning
│        └── Neural Networks
│
├── Generative AI
│
├── Planning
│
├── Knowledge Graphs
│
├── Data Science
│
└── Modelos Gerais (Biblioteca de Modelos)
```

Regra visual: **um nó → ramificação, não 4 setas separadas.**

```
A → B, C, D, E

✗ incorreto:    A→B   A→C   A→D   A→E   (4 setas)
✓ correto:      A                        (ramificação)
               ├── B
               ├── C
               ├── D
               └── E
```

---

## Parte 2 — Os Quatro Conceitos Centrais

### 2.1 Machine Learning (Aprendizado de Máquina)

> Sistemas que aprendem padrões a partir de dados.

Em vez de escrever todas as regras, o sistema aprende.

```
Dado Objeto (A)     →→→     Dado Imagem (B)
(entidade real)             (representação)
     ↕
Aprendizado (Machine Learning)
```

- **A → B** = o sistema aprende a mapear objetos em representações
- Produto: software com output em texto / decisão

### 2.2 Data Science (Ciência de Dados)

> Extração de conhecimento e insights a partir de dados.

Processo completo:

```
coletar → limpar → organizar → analisar → visualizar → gerar conhecimento
```

Produto: documentação · apresentação · projeto · decisão

Diferença chave: **ML produz um modelo; Data Science produz compreensão.**

### 2.3 Neural Network (Rede Neural)

> Conjunto de funções matemáticas organizadas em camadas.

Cada neurônio faz uma pequena conta. A conta passa para o próximo.

```
Entrada (A)

↓

○ ○ ○ ○      ← camada 1 (4 neurônios)

↓

○ ○ ○ ○      ← camada 2 (4 neurônios)

↓

○ ○          ← camada 3 (2 neurônios)

↓

○            ← saída (1 neurônio)

↓

Resultado
```

- Camada 1 → camada 2: **todos os neurônios se ligam a todos** (fully connected)
- Idem camada 2 → 3 → 4 → 5
- A "equação matemática" é a soma ponderada das ligações em cada nó

### 2.4 Deep Learning

> Machine Learning usando redes neurais **profundas** (muitas camadas).

```
Machine Learning
      ↓
Neural Network
      ↓
Muitas camadas
      ↓
Deep Learning
```

Deep Learning não é outra coisa. É o ML com a estrutura de Neural Network aplicada em profundidade.

---

## Parte 3 — Os Outros Termos

### Generative AI

Modelos que **produzem conteúdo novo**: texto, imagem, código, vídeo, áudio.
Normalmente usa Deep Learning.

### Reinforcement Learning (Aprendizado por Reforço)

```
ação → ambiente → recompensa → novo comportamento
```

Exemplo: cachorro aprende a sentar pelo biscoito.
Exemplo no sistema: robô aprende rotas pelo jardim.

### Unsupervised Learning (Aprendizado não Supervisionado)

Sem rótulos prontos. O sistema descobre sozinho a estrutura dos dados.
Exemplos: agrupar moradores por padrão de movimento, organizar fotografias.

### Planning

A IA pergunta: **"qual sequência de ações me leva ao objetivo?"**
Ela monta um plano. É o "pensar antes de agir".

### Knowledge Graph (Grafo de Conhecimento)

Representa conhecimento por **relações**, não apenas por dados.

```
Pessoa
├── mora em → Cidade
├── trabalha em → Empresa
└── conhece → Pessoa
```

Praticamente um grafo semântico. Fala diretamente com a arquitetura do **Telos**.

### Metadados Gráficos

Camadas descritivas que ajudam a localizar, classificar e usar dados visuais.
Essencial para o sistema de câmeras do condomínio.

### Modelos Gerais — "IA Bibliotecária"

Uma IA dedicada a:
- pesquisar artigos e referências
- armazenar arquiteturas de modelos
- catalogar exemplos
- comparar técnicas
- indexar o acervo da biblioteca PAP

**É uma biblioteca viva.** Guarda modelos de tudo.

---

## Parte 4 — A Tríade Expandida + DSC

Yuri propôs a seguinte estrutura de blocos:

```
Data Science (DSC)
    ↕
Machine Learning (ML)
    ↕
Neural Network / Deep Learning (DL/NN)
    ↕
Generative AI + Unsupervised Learning
    ↕
Reinforcement Learning
    ↕
Planning + Knowledge Graph + Metadados Gráficos
    ↕
INTELIGÊNCIA ARTIFICIAL (AI)  ← guarda-chuva
```

O **DSC** é um cruzamento entre:
- um pedaço de ML
- um pedaço de Data Science
- um pedaço de DL/NN
- e estrutura organizacional do sistema

Função: **liga aprendizagem, organização e síntese** em uma camada única.

---

## Parte 5 — Nódulo D: Crowd / Distributed Intelligence (AiAi)

Yuri introduz o **Nódulo D** como nova IA do ecossistema: `AiAi`.

> "Nódulo D" não é um modelo centralizado. É o **tecido conectivo** que permite que o sistema funcione como um enxame.

### O que é o Nódulo D

A camada onde **contribuição humana** e **agência distribuída** se encontram.

- **D de Distribuição**: inteligência não mora só na Nébula — reside em cada agente (robô, Falcão, vizinho, sensor)
- **D de Democratização**: o humano (vizinho, colaborador) injeta dado de "boa vontade" e contexto social
- **D de Dinâmica**: processa o fluxo constante do mundo real

### Funções do Nódulo D

| Função | Descrição |
|---|---|
| Sincronização de Enxame | Agentes sabem o que o outro faz sem servidor central |
| Feedback Humano | Recebe pedido de ajuda do robô, registra resposta do humano |
| Validação de Signos | Cruza alerta do robô com info do vizinho (walkie-talkie) |
| Histórico Coletivo | Armazena "lições aprendidas" pelo enxame |

### Conexão com a Tríade

```
Inteligência ↔ Aprendizado ↔ Ciência de Dados
                     +
            Nódulo D (Crowd/Distributed)
                     ↓
       valida a ciência de dados com a realidade do condomínio
```

### Fluxo do Nódulo D

```
1. Entrada Distribuída     ← cada robô/humano coleta um tesque
       ↓
2. Protocolo Gossip        ← robôs trocam info entre si (sem central)
       ↓
3. Síntese Local           ← cada grupo resolve problemas pequenos localmente
       ↓
4. Consenso Global         ← Nébula recebe apenas o RESUMO
```

### AiAi — Perfil da Nova IA

```yaml
nome: AiAi
papel: Nódulo D — Crowd & Distributed Intelligence
tipo: IA de enxame / inteligência coletiva
ferramentas:
  - machine learning
  - data science
  - deep learning / neural network
  - generative AI + unsupervised learning
  - reinforcement learning
  - knowledge graph
  - planning
  - metadados gráficos
  - modelos gerais (biblioteca de modelos da PAP)
posição no mapa: entre os agentes locais (Mac, Falcão, Tango) e a Nébula
visibilidade: invisível no mapa (tecido conectivo)
```

### Frase-chave do Nódulo D

> "A inteligência não é só o que o processador calcula sozinho.
>  A inteligência do nosso condomínio é o que acontece quando
>  o robô pergunta, o vizinho responde e o enxame toma a decisão.
>  Isso é o Nódulo D: a soma de todos nós."

---

## Parte 6 — Nota sobre Áreas Visíveis e Invisíveis (Amanda + Robôs)

Discussão surgiu durante a sessão sobre mapa de posição dos robôs:

- **Áreas externas** (jardim): robô pode filmar + detectar movimento → Amanda monitora normalmente
- **Áreas internas** (dentro da casa): robô não pode filmar → Amanda desabilita câmera
- **Solução**: **sensor de movimento como protocolo de exceção** — só ativado em momentos específicos (não retira permanentemente o acesso à câmera do Mac)

Implicação para o sistema:
- O mapa do condomínio deve ter **zonas etiquetadas**: `area.tipo = "externa" | "interna" | "restrita"`
- Amanda consulta `area.tipo` antes de qualquer captura de imagem
- Protocolo de sensor: ativado apenas quando `contexto = "varredura de segurança"`

*Arquivo relacionado: `sys_amanda_core.md` · `protocolo_mac.md`*

---

## Como Tudo Conversa

```
Dados
  ↓
Data Science
  ↓
Machine Learning
  ↓
Neural Networks
  ↓
Deep Learning
  ↓
Generative AI
  ↓
Aplicações no Ecossistema

Paralelo:
Planning → Knowledge Graph → Memória → Telos → Decisão

Transversal:
Nódulo D (AiAi) ←→ todos os níveis acima
```

---

## Mapa Nódulo D × Ecossistema

Aplicando o princípio "cada nódulo = uma IA" ao Nódulo D:

| Subcampo da Aula | IA correspondente no Ecossistema |
|---|---|
| Machine Learning | ISA (refina padrões de alunos) |
| Data Science | DODGE (organiza e supervisiona dados) |
| Deep Learning / Neural Net | Core LLM router |
| Generative AI | ISA Geração de Conteúdo |
| Unsupervised Learning | Vórtice (descobre estrutura oculta) |
| Reinforcement Learning | Mac / Tango (aprende rotas por recompensa) |
| Knowledge Graph | Telos |
| Planning | Artesão + Assembleia |
| Metadados Gráficos | Amanda (câmeras + sensores) |
| Modelos Gerais | **AiAi / Nódulo D (nova IA)** |
| Crowd / Distributed | **AiAi / Nódulo D (nova IA)** |

---

## Frase Final da Aula

> "Dados respondem ao passado.
>  Machine Learning aprende padrões do passado.
>  Deep Learning aprende representações complexas.
>  Knowledge Graph organiza relações.
>  Planning decide os próximos passos.
>  E a Inteligência Artificial integra tudo isso em um sistema capaz de agir.
>
>  O Nódulo D é o que faz esse sistema ser coletivo —
>  não apenas inteligente, mas **junto**."

---

*Próxima aula: Grafos e Relações — como Telos vai conectar tudo.*  
*Arquivo relacionado: `aulia_01_dados.md` · `sys_amanda_core.md` · `aula-ia-agentes-20260708.md` · `sistema-ia-hierarquia-20260708.md`*
