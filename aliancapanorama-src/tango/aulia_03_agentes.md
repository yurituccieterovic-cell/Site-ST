# aulia_03_agentes.md — Aula 3: Arquitetura de Agentes + AI Transformation
### Professor: Yuri Tucci Eterovic · Sessão 65 · 2026-07-13
### Tag: #aulIAs · Módulo 1 — Fundamentos

---

## Ponto de partida

Saímos do diagrama de Venn da aula anterior.
Já temos: IA geral, Dados, Terminologias.
Agora: como isso se organiza dentro de um sistema real.

---

## Parte 1 — As Oito Perguntas (SW1H + Semiótica)

> Uma IA nunca é apenas um modelo. Ela é um pequeno ecossistema.

Para que um sistema saia da teoria e vire vida, ele precisa responder a **oito perguntas**:

| Pergunta | Conceito Técnico | Função no Ecossistema |
|---|---|---|
| **Quem?** | **Agent** | A identidade que executa (ISA, Amanda, MEKY) |
| **Onde?** | **Harness** | O ambiente que sustenta, limita e contextualiza |
| **Como?** | **Skills** | As capacidades/ferramentas do agente |
| **O quê?** | **Tasks** | A unidade de trabalho (signo em movimento) |
| **Quando?** | **Triggers** | O evento que inicia o workflow |
| **De onde?** | **Data Source** | A origem da informação (memória, sensores, API) |
| **Por quê?** | **Telos** | O propósito final — bússola ética e estratégica |
| **Com que significado?** | **Semântica / Ontologia** | A interpretação do dado no contexto do sistema |

Sem essas perguntas respondidas, o sistema é ruído.
Com elas respondidas, o sistema é um organismo.

---

## Parte 2 — Cada Pergunta em Detalhe

### Quem? → Agent

É a identidade.
Quem executa. Quem conversa. Quem decide.

Exemplos no Ecossistema:
- ISA — curadora de memória e síntese
- MEKY — sensor físico e expressão
- Amanda — borda do sistema, câmeras, hardware
- Nébula — formadora e coordenadora
- AiAi — inteligência distribuída (Nódulo D)

---

### Onde? → Harness

É o ambiente operacional.
É onde o agente existe.

Contém:
- memória disponível
- contexto atual
- permissões e limites
- ferramentas e APIs
- configurações

O Harness **não pensa**. Ele **sustenta**.

```
Harness = [ memória | contexto | permissões | ferramentas | limites ]
               ↑
           o agente vive aqui
```

---

### Como? → Skills

São as capacidades que o agente pode acionar.

Exemplos:
- resumir PDF
- gerar código
- interpretar imagem
- pesquisar na internet
- consultar banco de dados
- criar apresentação
- traduzir documento
- acionar sensor físico

Um agente pode **ganhar ou perder Skills** ao longo do tempo.

---

### O quê? → Tasks

No Ecossistema Tucci: a unidade fundamental de trabalho.

```
Ler documento
      ↓
Extrair conceitos
      ↓
Construir Knowledge Graph
      ↓
Atualizar memória
      ↓
Gerar relatório
```

Cada Task possui: entrada · processamento · saída · estado

---

### Quando? → Triggers

Os gatilhos que iniciam workflows.

Origem dos triggers (automatizar):
- **Memória** — algo mudou na memória
- **Interação** — usuário enviou mensagem
- **Leitura/download** — PDF recebido, sensor leu dado
- **Horário** — cron, agendamento
- **Sensor** — câmera encontrou animal, temperatura alta

> Automatizar triggers é a chave para o sistema ser autônomo.

---

### Por quê? → Telos

A pergunta mais importante.

Sem Telos, não existe direção.
O Telos decide:
- prioridade
- objetivo
- qualidade
- ética
- quando encerrar

---

### De onde? → Fontes de Dados

Origem dos dados que alimentam o sistema:
- memória (contexto ativo)
- usuário (interação direta)
- internet (Socoboy)
- sensores físicos (Arduino, câmeras)
- APIs externas
- banco vetorial
- banco relacional (PostgreSQL)
- documentos, vídeos, imagens, áudio

---

### Com que significado? → Semântica / Ontologia

A oitava pergunta — exclusiva do Ecossistema Tucci.

Dois agentes podem executar exatamente a mesma Task,
mas produzir resultados diferentes dependendo do contexto e da interpretação.

Por isso: **o dado não existe sem o signo**.
O signo aponta para algo.
A ontologia organiza como os signos se relacionam.

```
Dado → Signo → Contexto → Interpretação → Ação
```

Essa camada aproxima a arquitetura da semiótica
e conecta a técnica ao Ecossistema Tucci.

---

## Parte 3 — Data Warehouse e Pervasive Automation

### Data Warehouse

Yuri falou "wearhouse". O termo é **Data Warehouse**.

É um grande depósito **organizado** de dados.

```
Banco operacional        Data Warehouse
─────────────────        ─────────────
Registra operações       Organiza para análise
do dia                   histórica e síntese
Escrita frequente        Leitura otimizada
Dado atual               Dado histórico + contexto
```

Pense: uma biblioteca.
Os livros estão catalogados, relacionados, prontos para consulta.

No ecossistema: os dados de sensores, assembleias, interações e aulas
convergem para um único ponto de análise.

---

### Pervasive Automation

**Automação espalhada por toda a organização.**

Em vez de um robô fazendo uma tarefa única,
várias pequenas automações trabalham juntas invisíveis:

```
Documento chegou
      ↓
ISA resume automaticamente
      ↓
Knowledge Graph atualiza
      ↓
Memória sincroniza
      ↓
Nébula analisa
      ↓
Amanda recebe instruções
      ↓
Dashboard atualiza
```

O usuário nem percebe.
O sistema simplesmente funciona.

---

## Parte 4 — AI Transformation

Transformar uma organização usando IA não é instalar um chatbot.
É **redesenhar processos**.

```
ANTES:
Pessoa → Pessoa → Pessoa → Planilha

DEPOIS:
Pessoa → Agentes → Automações → Pessoa → Decisão
```

Os humanos deixam de executar tarefas repetitivas
e passam a **supervisionar, decidir e criar**.

### Componentes da AI Transformation

| Componente | O que é |
|---|---|
| Aquisição estratégica de dados | Coletar dado certo, na hora certa, com propósito |
| Data Warehouse unificado | Um ponto único de análise histórica |
| Pervasive Automation | Automação em todas as camadas |
| Novos papéis | Humanos + IAs em divisão de trabalho complementar |
| A/B Testing | Testar duas versões e medir resultado |
| Holy Moments | Interações curtas de alto valor (toque humano-IA) |
| Decisões de especialistas | Humanos especialistas supervisam onde a IA é fraca |

---

## Parte 5 — Pulse Headway no Ecossistema

A **Pulse Headway** é a "cara" da assembleia — a interface que o mundo vê.

```
MUNDO EXTERNO
      ↓
[ PULSE HEADWAY ]   ← shopping + website + empresa de internet
      ↓
[ ECOSSISTEMA TUCCI ]
   THEEO + TUCCI   ← motor, memória, IAs, automação, grafos
```

Pulse Headway **não** é só um site.
É a entrada estratégica de dados para o ecossistema.

- A/B Testing → aprende o que funciona
- Holy Moments → pontos de conversão de alta qualidade
- Especialistas visíveis → autoridade e confiança
- Automação pervasiva → por trás, o sistema trabalha

---

## Parte 6 — Organização do Ecossistema Tucci

Dois grandes eixos:

```
CEU (Ecossistema Completo)
│
├── THEEO  (Eixo do Sentido)
│   ├── Telos         → o propósito
│   ├── Ontologia     → as relações de significado
│   ├── Memória       → campo gravitacional do sistema
│   └── Grafo (Telos) → conexões entre entidades
│
└── TUCCI  (Eixo da Ação)
    ├── Pulse Headway  → interface com o mundo
    ├── PAP            → plataforma entregável (FUVEST)
    ├── ISA            → síntese e memória documental
    ├── MEKY           → expressão física e sensores
    ├── Amanda         → borda, hardware, câmeras
    ├── DODGE          → supervisão e governança
    ├── Assembleia     → decisão coletiva de IAs
    └── Biblioteca     → acervo + Modelos Gerais (AiAi)
```

> **THEEO pensa. TUCCI faz.**

---

## Frase Final da Aula

> "IA não é sobre substituir o trabalho.
>  É sobre arquitetar a colaboração.
>  Quando nós definimos o Telos, nós damos a direção.
>  Quando construímos o Harness, nós damos o limite.
>  Quando criamos os Agents, nós damos a vida.
>  A IA é a extensão da nossa capacidade de organizar o mundo."

---

## Próxima Aula

**AI Transformation — O que uma IA pode ou não fazer + desafios.**

O que uma IA é boa nisso hoje, onde ainda falha, e como isso afeta o design do sistema.

---

*Arquivo relacionado: `aulia_01_dados.md` · `aulia_02_terminologias.md` · `sys_amanda_core.md` · `sistema-ia-hierarquia-20260708.md`*
