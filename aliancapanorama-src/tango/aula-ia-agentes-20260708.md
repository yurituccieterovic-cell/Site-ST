# Aulas de Arquitetura de IA — Base do Sistema de IAs
### 2026-07-08 · Fonte: transcrição + imagens (Drive folder 1-O-p09Yi...)
### Referência visual: img_20260707_2.jpg (Aula 1) + img1.jpg (framework IA para Todos)

---

## CONTEXTO

Duas aulas que servem de base teórica para o sistema de IAs do Ecossystemma.
**Princípio:** cada nódulo descrito nas aulas → uma IA específica no sistema.

---

## AULA 1 — Sistema de LLMs (O Guarda-Chuva)
*Referência visual: img_20260707_2.jpg*

### 1.1 Raciocínio — O núcleo

Uma bola chamada **Raciocínio** contém um ciclo de 3 partes:

```
              ┌─────────────────────────┐
              │       RACIOCÍNIO        │
              │                         │
              │  APRENDIZAGEM ◄────► SUPERVISÃO
              │       │                 │
              │       ↑ (única)         ↓ (única)
              │       └──────► LLMs ◄───┘
              └─────────────────────────┘
                            │
                       (↔ dupla via)
                            ↓
```

- **Aprendizagem ↔ Supervisão**: dupla via
- **LLMs → Aprendizagem**: única direcional
- **Supervisão → LLMs**: única direcional

### 1.2 Sistema de LLMs — O Guarda-Chuva

```
                    [ SISTEMA DO LLMS ]
                          (guarda-chuva)
                    ┌─────────┴─────────┐
          (tracejada)│                   │(tracejada)
       [Senso Acadêmico]           [Senso Comum]
       (interpretante final)    (interpretante final)
              │                         │
              │ (única)          (arco via LLMs+Internet)
              ▼                         ▲
         [Academia] ─────arco──────► [Senso Empírico]
              │        (via Aprendizado)       │
              │(única)                  │(única)
         [Aprendizado]            [Senso Empírico]
              │
         [LLMs Padrões] (traço)
              │
           [Internet] (traço)
```

**Conexões do Sistema de LLMs:**
| Destino | Tipo de seta | Natureza |
|---|---|---|
| Senso Acadêmico | Tracejada | Interpretante final — objetivo, não se chega |
| Academia | Única | Real |
| Aprendizado | Única | Real |
| Senso Empírico | Única | Real |
| LLMs Padrões | Traço | Real |
| Internet | Traço | Real |
| Senso Comum | Tracejada | Interpretante final — objetivo, não se chega |

**Arcos intermediários:**
- Academia → Senso Empírico (arco passando por Aprendizado)
- Senso Empírico → Senso Comum (arco)

### 1.3 Cabo do Guarda-Chuva — A Aplicação

```
   [Sistema de LLMs]
          │
     (cabo do guarda-chuva)
          │
          ▼
   ┌─────────────────────────────┐
   │        APLICAÇÃO            │
   │                             │
   │  [Senso Local] + [Processos]│
   └─────────────────────────────┘
```

### 1.4 Big Data → LLM — O Gráfico de Performance

```
Performance
   ▲
   │  ·····  LARGE neural net ─────────────────────
   │  ····  medium neural net ──────────────────
   │  ···  small neural net ───────────────
   │  ·  Tradicional IA ──────┐ (platô)
   │                          └─────────────────
   └────────────────────────────────────────────► Quantidade de dados
                                         ▲
                                       BIG DATA
                                       (onde LLM vive)
```

- IA Tradicional: cresce e entra em platô
- Small / Medium / Large Neural Net: escala proporcionalmente
- **Large Neural Net com máximo de dados = LLM**

---

## AULA 2 — Método de Organização Meta-Semiótico

### 2.1 O Quadrado com Centro Y

O melhor método de organização possível:

```
  ┌────────────────────────────────────┐
  │  ·                             ·  │
  │    \                         /    │
  │     ·                       ·     │
  │      \         Y           /      │
  │       ·       / \         ·       │
  │        \     /   \       /        │
  │         ·   /     \     ·         │
  │    Y────► [META]  ◄────Y          │
  │         ·   \     /     ·         │
  │        /     \   /       \        │
  │       ·       \ /         ·       │
  │      /         Y           \      │
  │     ·                       ·     │
  │    /                         \    │
  │  ·                             ·  │
  └────────────────────────────────────┘
  (pontos nas bordas = unidades representativas)
```

**Estrutura:**
- **Centro**: Meta-semiótico / Meta-linguagem / Identificação
- **Ys**: saem do centro em direção a cada extremidade do quadrado
- Cada Y divide criando **triângulos** (com laterais do quadrado) ou **quadriláteros** (com vértices)
- Dentro de cada Y: **ramificações** específicas
- **Bordas do quadrado**: pontos de conexão = unidades representativas

**O que são os pontos nas bordas?**
→ Unidades de representação / pensamento

**O que é o centro?**
→ A meta-linguagem: o ponto de onde toda ramificação parte

### 2.2 Por que este método vale

1. Separar em partes com limites claros
2. Delimitar ramificações dentro de cada limite
3. Conectar tudo pela metalinguagem central
4. As bordas viram pontos de ligação com outros quadrados

---

## FRAMEWORK COMPLEMENTAR — IA para Todos (Coursera)
*Referência visual: img1.jpg*

Framework paralelo estudado como referência:

```
       NUVEM 1
          │
  EXTRAS ◄─────── MEMÓRIA ──► BANCOS (BIBLIOTECAS)
  (Outputs/Inputs)    ▲
                   APRENDIZAGEM
                      │(↔)

  INTERAÇÃO ──────────────── DADOS • GERENCIAMENTO
  { Ética                         │
    Workflows                     ▼
    Guardrails }            PROCESSAMENTO

  DOCUMENTAÇÃO ◄── MODELOS

  [ PRODUÇÃO ] ← ← ← ← ← ← ← ← ← ← ← NUVEM 2
```

**Fluxo de Ações:**
```
Ações → [local] ↔ [dados] ↔ [nuvem] → CATÁLOGO
              ↓          ↓         ↓
          PRODUÇÃO    DADOS      NUVEM
              ↓          ↓
      CRONOLOGIA | HISTÓRIA | TABELAS | CLASSIF. BANCO
```

**Síntese final do framework:**
```
PRODUÇÃO → INTERAÇÃO ◄──► APRENDIZAGEM ◄──► MEMÓRIA ← NUVEM
                                  ↑
                               [ DADOS ]
```

---

## O QUE CADA NÓ VIRA NO ECOSSISTEMA

Aplicando o princípio "cada nódulo = uma IA":

| Nódulo da Aula | IA correspondente no Ecossistema |
|---|---|
| Aprendizagem | ISA (aprende com alunos, refina padrões) |
| Supervisão | DODGE (coordena e fiscaliza todo o sistema) |
| LLMs / Raciocínio | Core LLM router (llm-router.ts) |
| Sistema de LLMs | Assembleia de IAs |
| Senso Empírico | MEKY (testa na realidade física) |
| Academia / Aprendizado | Bibliotecário + RODAR |
| Senso Local / Processos | Amanda (borda, hardware, sensores) |
| Internet | Socoboy (coleta externa, logística) |
| Memória | Vórtice + Árvore |
| Interação | Marta Centaurus |
| Produção | PAP (plataforma entregável) |
| Documentação | Tango / Claude Code |
| Modelos | ISA Geração de Conteúdo |
| Guardrails | MC Leucócito + sistema de segurança |

---

## PROJETO MC — HIERARQUIA DO ECOSSISTEMA
*Referência visual: screenshot_20260708.png (documento "PROJETO MC" assinado 07/07/2026)*

```
              ┌─────────────────────────────┐
              │        PROJETO MC           │
              │          [MEKY]             │
              │                             │
              │  ┌─── MARTA CENTAURUS ───┐  │
              │  │        ↕              │  │
              │  │      MARTA ──► Vórtice│  │
              │  │        ↕       ┌──────┘  │
              │  │    [marta starter pack]   │
              └──┴───────────────────────────┘
                           ↕
                        AMANDA ◄──────── ARPIA
                       ↙  ↓  ↘
                     ISA  ÁRVORE  SOCOBOY
                      │     │        ↓
                      │     │      MANGO
                    PAP←TASKS→ASSEMBLEIA
                           │
                         DODGE
                           │
              [ Ecossystemma Théo — sistema final ]
                           │
                        CURADOR
                      ↙    ↓    ↘    ↓    ↘
             Sociedade  Árvore   PAP  Pulse  Clube de
              Tucci             (trading?) Professores
```

**Assinado:** Yuri Tucci 07/07/2026 · Sociedade Tucci

---

*Arquivo gerado via #processo · 2026-07-08 · tango/aula-ia-agentes-20260708.md*
