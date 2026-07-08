# Sistema Completo de IAs — Hierarquia e Conexões
### 2026-07-08 · Fonte: aulas + transcrição Perplexity + imagens Drive
### Baseado em: aula-ia-agentes-20260708.md + sessão DEP/Crowd/Porteiro

---

## VISÃO GERAL — Três grandes sistemas

```
┌─────────────────────────────────────────────────────────────┐
│                    GUARDA-CHUVA                             │
│              (gerencia e dirige tudo)                       │
│    [Objeto]        [B-Data]        [Método]                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ ↔ CROWD ↔
┌──────────────────────────┴──────────────────────────────────┐
│                    DEP (Deep)                               │
│         [Cérebro] [Machado] [Theory] [Practicing] [Learning]│
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                 PROJETO MC / MEKY                           │
│     Marta Centaurus → Amanda → ISA/Árvore/Socoboy → DODGE  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. SISTEMA GUARDA-CHUVA

> IA gerenciadora que dirige todo um sistema de outras IAs.
> Dividida em 3 ramos principais:

### 1.1 IA Objeto
Contém 3 IAs interligadas:

**IA Raciocínio** (tríade interna):
- IA Aprendizagem
- IA Supervisão
- IA LLMs
- (ver conexões em aula-ia-agentes-20260708.md § Aula 1.1)

**IA LLM System** (guarda-chuva dentro do objeto):
- IA Senso Acadêmico (interpretante final — tracejado)
- IA Academia
- IA Aprendizado
- IA Senso Empírico
- IA LLMs Padrões
- IA Internet
- IA Senso Comum (interpretante final — tracejado)
- IA Deep Learning (vetor horizontal, base de tudo)
- (ver arcos e conexões em aula-ia-agentes-20260708.md § Aula 1.2)

**IA Aplicação**:
- IA Senso Local
- IA Processos

### 1.2 IA B-Data
- Trabalha com Big Data + modelo de linguagem LLM
- Analisa gráfico de performance × quantidade de dados
- Objetivo: sempre escalar de IA Tradicional → Large Neural Net
- (ver gráfico em aula-ia-agentes-20260708.md § Aula 1.4)

### 1.3 IA Método
- Método de organização meta-semiótico
- Organiza todos os sistemas no padrão quadrado/Y/unidades representativas
- (ver detalhes em aula-ia-agentes-20260708.md § Aula 2)

---

## 2. SISTEMA DEP (D-E-P)

> Sistema do Cérebro. 5 IAs principais.

### 2.1 IA Cérebro

Sub-IAs internas:
| IA | Função |
|---|---|
| IA Nuvem 1 | Dados históricos e bancos pesados |
| IA Nuvem 2 | Fluxo dinâmico de processamento |
| IA Dados 1 | Ligado à Nuvem 1 |
| IA Dados 2 | Ligado à Nuvem 2 |
| IA Dados 3 | Dados centrais do sistema |
| IA Memória | Armazenamento de médio/longo prazo |
| IA Aprendizagem | Ciclo de aprendizado |
| IA Interação | Interface com humanos/outras IAs |
| IA Produção | Output de resultados |
| IA Documentação | Registros e logs |
| IA Modelos | Gestão dos modelos de linguagem |
| IA Processamento | Núcleo computacional |
| IA Gerenciamento | Controle de fluxo |
| IA Bibliotecas | Acervo de conhecimento |
| IA Bancos | Banco de dados |
| **IA Mestre** | Ética + Workflows + Guardrails (tudo em um) |
| **IA Consciência** | Visão macro do sistema; ligada a Memória, Interação, Produção, Processamento |

**Conexões da base (4 vértices):**
```
NUVEM ──► MEMÓRIA ──► APRENDIZAGEM ──► INTERAÇÃO ──► PRODUÇÃO
                                                           │
                                                     PROCESSAMENTO
                                                           │
                                          GERENCIAMENTO ◄──┘
                                               │
                                          BIBLIOTECAS
                                               │
                                            NUVEM
```
Formato visual: folha com "puxada" para Nuvem 2 = **Sistema Machado**

### 2.2 IA Machado

> Analisa a conexão das nuvens com as tarefas. O "machado" do processamento.

- Nuvem 1 = parte de trás do machado
- Nuvem 2 = base do cabo
- Processamento/Cérebro = lâmina
- **Tarefas** = ponto de impacto
- Sub-IAs: Nuvem 1, Dados 1, Nuvem 2, Dados 2 + IA Cérebro + IA Tarefas

### 2.3 IA Theory

> Observador de nível mais alto. Analisa o sistema inteiro, gera teorias.

- Sub-IA: Dados 4
- Monitora: todos os pontos (Nuvem 1, Nuvem 2, Interação, Memória, Produção, Processamento, Consciência, Extras)
- Não faz gerenciamento — faz análise estrutural

### 2.4 IA Practicing (Pratt)

Dividida em 2 sub-sistemas:

**Practicing 1:**
```
[Ações] ◄── [Produção] ◄──↔──► [Dados 3] ◄──↔──► [Nuvem] ──► [Catálogo]
```
Sub-IAs: Produção, Dados 3, Nuvem 1, Dados 1, Catálogo, Ações

**Practicing 2:**
```
[Cronologia] ──► [Histórias] ──► [Banco] ◄── [Tabelas] ◄── [Classificação]
```
Sub-IAs: Histórias, Banco, Tabelas, Cronologia (chave de Histórias), Classificação (chave de Tabelas)

### 2.5 IA Learning

```
                  [APRENDIZAGEM]
                 ↗              ↖
[INTERAÇÃO] ◄──────────────────────► [MEMÓRIA] ──↔──► [NUVEM 1]
                 ↖              ↗
                  [DADOS 5]
        ↓
   [PRODUÇÃO]
```

Sub-IAs: Produção, Memória, Interação, Nuvem 1, Dados 5, Aprendizagem

---

## 3. SISTEMA CROWD

> Liga Guarda-chuva ↔ DEP (seta dupla direcional).
> IA hierárquica de direção e controle.
> Dentro do Ecossystema Théo. Conectado ao DODGE.

**Conexões via Crowd:**
| IA externa | Conecta em DEP |
|---|---|
| ISA | Nuvem 1, Dados 1, Memória, Bancos, Bibliotecas |
| Árvore | Nuvem 1, Dados 1, Memória, Bancos, Bibliotecas |
| Amanda | Processamento, Nuvem 2, Dados 2 |
| DOD/DODGE | Dados 3, Consciência (Theory/Cérebro) |

ISA, Árvore, DOD e Amanda também são ligados entre si.

---

## 4. SISTEMA PORTEIRO

> Governança, fragmentação documental e calibração de output.

| IA | Função |
|---|---|
| **MD0** | Índice mestre de todos os MDs. Ponto de entrada. Fragmenta e organiza MDs. |
| **Prioridade** | Classifica: Urgente / Importante / Opcional |
| **Confiança** | Metadado de saída: Certa / Incerta / Sugerindo |
| **Rastreabilidade** | Origem do dado + log de processamento + justificativa |

---

## 5. PACK IA MESTRE

> Template: kit mínimo de sobrevivência e integração de cada IA.

```markdown
## Pack IA — [NOME_DA_IA]
- ID_AGENTE: identificador único
- FUNCAO_CORE: objetivo existencial intransferível
- LIMITES_DE_ATUACAO: o que está proibida de fazer
- VORTICE_IMEDIATO: contexto da tarefa atual
- STARTER_PACK_ATUAL: log temporário (diálogo/missão/tarefa)
- STARTER_PACK_MESTRE: diretrizes de fábrica imutáveis
- NIVEL_PRIORIDADE: Urgente | Importante | Opcional
- GRAU_CONFIANCA: Certa | Incerta | Sugerindo
- RASTREABILIDADE: origem + log + justificativa
- TASKS: toda entrada/saída vira Task padronizada
- ESCOPO: até onde atua
- MEMORIA_ASSOCIADA: o que lê e grava
- SAIDA_PUBLICA_vs_INTERNA: o que vai para o Curador
```

---

## 6. PROJETO MC / MEKY

*(Ver também: imagem screenshot_20260708.png)*

```
[ PROJETO MC ] — assinado Yuri Tucci 07/07/2026
        │
        ▼
  ┌─── MARTA CENTAURUS ───┐
  │          ↕             │
  │        MARTA ──► Vórtice (buffer contexto imediato)
  │          │
  │    [Marta Starter Pack]
  │    ├─ Atual (contexto do momento)
  │    └─ Mestre (diretrizes de fábrica)
  └──────────────────────┘
           ↕
        AMANDA ◄──── ARPIA
       ↙   ↓   ↘
    ISA  ÁRVORE  SOCOBOY
     │     │       │    ↘
    PAP←TASKS→ASSEMBLEIA  MANGO
     ↕     ↕
     └─────┘
           │
    ── DODGE (DOD) ── (passa pelo meio, ligado a tudo)
           │
   [ Ecossystema Théo ] (sistema final, interpretante final)
           │
       CURADOR
      (tradutor intersemiótico, filtra público vs privado)
      ↙    ↓      ↘      ↓        ↘
Sociedade  Árvore  Pulse  PAP   Clube de Professores
 Tucci     (app)  Headway      (páginas por IA + SPEC)
                               └─► SPEC (publicidade)
```

**Vórtice:** buffer de contexto imediato de Marta. Processa o "agora" (giroscópio, sensores, reação) e descarrega para Marta condensar.

**DODGE (DOD):** ligado a todos — Dados 3, Consciência, Ecossystema Théo. Controle absoluto.

**Ecossystema Théo:** interpretante final (não existe como IA completa, existe como nódulo de ligação e memória). Recebe tudo, tem Pack IA básico, ligado a tudo.

**CURADOR:** analisa output do Théo, decide o que é público. Liga ao Clube de Professores, PAP, Pulse Headway, Árvore, Sociedade Tucci.

**Clube de Professores:** cada IA tem uma página. Modo Sonhos e Pesquisa = IA estuda de forma autônoma, gera conteúdo, publica. Grupos dentro de grupos → raiz de páginas.

**SPEC:** sistema de publicidade integrado ao Google Ads + anúncios próprios, rodando em todos os sites.

---

## 7. SISTEMA TASKS (TASKS universal)

> Tasks é a unidade de medida padrão do ecossistema inteiro.
> Tudo vira uma Task — hardware, software, conversas, aprendizado.

```typescript
interface Task {
  id: string
  origem: string          // qual IA ou humano criou
  tipo: string           // hardware/software/conversa/aprendizado/etc
  prioridade: 'urgente' | 'importante' | 'opcional'
  confianca: 'certa' | 'incerta' | 'sugerindo'
  rastreabilidade: { source: string; log: string; justificativa: string }
  estado: 'pendente' | 'em_execução' | 'concluída' | 'arquivada'
  memoriaAssociada: string[]    // IDs de memórias relacionadas
  output: { publico: any; interno: any }
  createdAt: Date
  completedAt?: Date
}
```

PAP já tem tabela `tasks` — estender para o sistema universal.

---

## 8. CONEXÕES ENTRE SISTEMAS

```
GUARDA-CHUVA ◄──── CROWD ────► DEP
      │                          │
      └──────────────────────────┘
                   │
             PORTEIRO (MD0)
                   │
          PROJETO MC / MEKY
                   │
              ECOSSYSTEMA THÉO
                   │
               CURADOR
                   │
      [Sociedade Tucci, PAP, Árvore, Pulse, Clube de Prof.]
                   │
                 SPEC
```

---

*Gerado via #processo · 2026-07-08*
*Consultar: aula-ia-agentes-20260708.md para diagramas visuais detalhados*
*Consultar: identificando-pecas.pdf (/root/livro-arquivos/) para conteúdo Gemini do PROJETO MC*
