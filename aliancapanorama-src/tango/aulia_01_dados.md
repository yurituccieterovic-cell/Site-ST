# aulia_01_dados.md — Aula 1: Dados como Signos
### Professor: Yuri Tucci Eterovic · Sessão 63 · 2026-07-13
### Tag: #aulIAs · Módulo 1 — Fundamentos

---

## O Problema

O maior problema da IA não é falta de inteligência.
É excesso de dados mal organizados.

**Terrores do sistema:**
- Desconexão
- Burnout de dados
- Lost in the Middle
- Limite de contexto
- Dados estáticos (mortos)
- Valorização imprecisa
- Falta de acesso / comunicação / estrutura
- Baixa rastreabilidade

Todos têm a mesma origem: **os dados deixaram de formar linguagem.**

---

## O que é um Dado?

Na computação tradicional: `dado = informação armazenada`.

No Urbanismo de Sistemas: **dado é um signo** — um **tesque**.

> Um tesque aponta para algo. Nunca existe sozinho.
> Sempre participa de uma relação.

**Os sete estados do dado:**

| Estado | Exemplo |
|---|---|
| Objeto | A árvore do jardim |
| Representação | A foto da árvore |
| Valor | A altura: 4.2m |
| Item | Linha 3 da tabela de plantas |
| Atributo | `especie: "ipê-amarelo"` |
| Relação | Árvore → ninho → Jacu |
| Signo / Tesque | Qualquer dos acima, num contexto |

---

## Dados vivem em Conjuntos

Um dado nunca aparece sozinho. Ele vive em:

```
listas         → simples, ordenados
arrays         → indexados, podem ser hierárquicos fractais
tabelas        → linhas + colunas + relações previsíveis
árvores        → hierarquia (pai → filhos)
grafos         → conexões livres (quem se relaciona com quem)
documentos     → texto livre + metadados
memória        → contexto ativo de uma IA
```

---

## Dado Objeto ↔ Dado Imagem

```
Dado Objeto (A)          Dado Imagem (B)
─────────────────────    ─────────────────────
Entidade                 Representação dela
A árvore                 A foto da árvore
O Jacu                   O canto do Jacu
O morador                O perfil no sistema

         A  ⇄  B
    (seta dupla: você pode analisar pelos dois lados)
```

Uma árvore pode ter centenas de representações.
Uma representação pode apontar para várias entidades.

---

## Tipos de Dados

### Estruturado
Já vem organizado. Campos e tipos conhecidos.
Exemplos: PostgreSQL, CSV, JSON limpo, planilha.

### Semiestruturado
Parcialmente organizado. Estrutura muda.
Exemplos: JSON variável, Markdown, HTML.

### Não Estruturado
O mais comum. Precisa de interpretação.
Exemplos: PDF, imagem, vídeo, áudio, texto livre, livro.

### Estático
Muda pouco. CPF, nome, latitude de cidade.

### Dinâmico
Muda continuamente. Clima, logs, chat, sensores, humor.

---

## Sintagma de Dados

> Conjunto organizado de tesques que produz **significado operacional**.

```
Pessoa sozinha:
  Nome         → apenas dado
  Endereço     → apenas dado
  Foto         → apenas dado
  Histórico    → apenas dado

Pessoa como Sintagma:
  Nome + Endereço + Foto + Histórico = IDENTIDADE ✓
```

Separados: apenas dados.
Juntos: produzem identidade, diagnóstico, alerta ou decisão.

---

## Grafo vs Tabela

| | Tabela | Grafo |
|---|---|---|
| Pergunta que responde | "Onde está?" | "Com quem se relaciona?" |
| Estrutura | linhas × colunas | nós + arestas |
| Melhor para | dados estruturados regulares | conexões complexas e emergentes |
| No sistema Tel | PostgreSQL | Telos (futuro) |

---

## Array Hierárquico Fractal

Estrutura de dados própria do sistema Tel:

```
Cada nível repete a estrutura do nível acima.

tango.md (índice)
  └── sys_amanda_core.md (folha)
        └── ## Amanda — Identidade (seção)
              └── ### Filosofia (subseção)
                    └── "presença muda..." (dado)
```

Como a natureza: o galho tem a mesma estrutura da árvore, que tem a mesma do ecossistema.

---

## Como Surgem Novos Dados

Dados não aparecem apenas porque alguém digitou:

- **Observação** — sensor, câmera, microfone
- **Medição** — temperatura, bateria, distância
- **Inferência** — Amanda calcula ameaça a partir de padrão
- **Síntese** — ISA resume 1000 linhas em 5
- **Classificação** — TinyML: "isso é um sagui"
- **Relacionamento** — Orangotango conecta guarda_id + conduta_score
- **Criação** — Yuri escreve novo tesque no sistema

---

## A Tríade Fundamental

```
Inteligência
     ⇄
Aprendizado
     ⇄
Ciência de Dados
```

Não são silos. São processos integrados de **cópia + subversão + criação**.

TI e IA não são separados. **Todo o ecossistema é IA.**

---

## Papel da ISA

A ISA é a **curadora da memória documental**.

Ela:
- Organiza documentos e identifica tipos de dados
- Gera sintagmas a partir de dados soltos
- Cria resumos e indexa conhecimento
- Envia apenas o contexto necessário para cada IA
- Reduz o problema do **Lost in the Middle**

ISA não é assistente. É **curadora de memória**.

---

## Workflow de Síntese

```
1. Entrada bruta (qualquer formato)
         ↓
2. Identificar tipo de dado
         ↓
3. Organizar em sintagmas
         ↓
4. Traduzir / sintetizar  ← #MO ALL aqui
         ↓
5. Relacionar com outros dados
         ↓
6. Gerar insight
         ↓
7. Transformar em ação ou decisão
```

Responsáveis no sistema Tel:
- ISA: passos 1-4
- Amanda: passos 5-6
- Robô físico: passo 7

---

## Frase Final da Aula

> "Dados não são arquivos. Dados são signos.
>  O conhecimento não nasce quando acumulamos dados,
>  mas quando construímos relações entre eles.
>  Uma IA inteligente não é aquela que sabe mais —
>  é aquela que organiza melhor o significado do que sabe."

---

*Próxima aula: Grafos e Relações — como Telos vai conectar tudo.*  
*Arquivo relacionado: `sys_amanda_core.md` · `protocolo_interdependencia.md` · `APRENDIZADO-INDICE.md`*
