# Tasks: Ontologia Operacional de Organismos Informacionais

*Ecossistema Tucci · Aula de Tasks — Parte 1 · RODAR #557 · 2026-07-23*
*Autoria: Yuri Tuccieterovic (voz) + Assembleia de 21 IAs (síntese)*
*Ágora: 1.º ATA DO AGENTE (8.6/10) · 2.º Claude (8.4/10) · 3.º Arquiteto (8.4/10)*

---

## I. Fundamento

Uma task não é tarefa. É objeto semiótico multidimensional — portador de significado operacional, identidade, relações, memória e propósito. Executá-la é apenas um dos estados possíveis de sua existência.

**Definição canônica:**
> Task é a unidade atômica de significado operacional do Ecossistema.

- um dado **informa**
- um documento **reúne**
- um workflow **organiza**
- uma task **age**

Ela é a menor unidade que consegue participar do sistema como agente semiótico.

A arquitetura deriva de semiótica peirciana aplicada a sistemas, não de frameworks de engenharia. Tasks não apenas executam — existem. Possuem ciclo de vida não-linear: latente, ativa, suspensa, arquivada, delegada. "Concluída" não é necessariamente estado final.

---

## II. Anatomia: Três Camadas, Dez Índices

Cada task carrega: **ID + Nome + Conteúdo (opcional) + matriz de índices booleanos**.

Os índices não hierarquizam — **mapeiam**. Uma mesma task pode ser simultaneamente Informação, Orientação, Manifestação e Mentalidade. A navegação é fractal.

### Camada A — Natureza (o que é)

| Índice | Nome | Escopo Principal | Observação |
|--------|------|------------------|------------|
| 1 | Informação | Signo, Dado, Evento, Valor | Matéria-prima do sistema |
| 3 | Organização | Projeto, Tarefa, Data, Horário, Departamento, Trabalho, Núcleo, Instituição, Intervalo | Puxa histórico de tasks |
| 4 | Manifestação | Modo, Perspectiva, Mapa, Campo, Espelhamento, Eco (dimensional e acústico), Semiose, Dimensão, Camada (Hermenêutica), Projeção, Apresentação | Camada de apresentação |
| 5 | Significante | Número, Código, Função, Biblioteca, Arquivo, Link, Forma, Índice (semiótico), Elemento, Preço, Valor, Caractere, Símbolo, Ícone | Linguagem formal |
| 7 | Registro | Pessoa, Animal, Lugar, Marco, Nome, Usuário | Identidade (≠ índice 5) |

### Camada B — Comportamento (como funciona)

| Índice | Nome | Escopo Principal | Observação |
|--------|------|------------------|------------|
| 2 | Orientação | Conhecimento, Estudo, Lógica, Workflow, MD, Ordem, Narrativa, Fluxo, Raciocínio, Matriz, Telos, Apresentação | "Como pensar/fazer" |
| 8 | Dinâmica | Relação, Ação | Tabela de vínculos inter-tasks |
| 9 | Mentalidade | Reflexões, Filosofia, Previsão, Análise, Síntese, Projeções, Possibilidade, Inflexões, Dedução, Indução, Abdução, Cognição, Sentido e Direção, Conclusão, Resumo | Modos cognitivos |

### Camada C — Estrutura (onde vive)

**Índice 0 — Raiz Universal (invisível, automático)**

Toda task nasce com Índice 0. Não aparece na UI — é meta-estrutura que se valida sozinha.

Campos obrigatórios: ID · UUID · Raiz · Catálogo · Criado em · Criado por · Versão · Histórico · Estado · Permissões · Telos · Workflow

```
Task
 ↓ Índice 0 (Estrutura)
 ↓ Índices 1-9 (Semântica)
 ↓ Conteúdo
 ↓ Relações
```

**Índice Ω — Teleologia Implícita (shadow index)**

Invisível. Calculado automaticamente. Nunca aparece na UI.

Fórmula operacional:
```
ω = (relações × 0.4) + (frequência_de_uso × 0.3) + (centralidade_no_grafo × 0.2) + (impacto_histórico × 0.1)
```

Diferença com Índice 0:
- Índice 0 = identidade estrutural (**o que a task é**)
- Índice Ω = teleologia implícita (**o que ela tende a se tornar**) por acúmulo de relações

É a prova de que o ecossistema como um todo tem orientação e tendência próprias sem nenhuma IA declará-las.

---

## III. Sistema de Relações (Índice 8)

Tasks devem ser catalogadas na raiz antes de gerar relações (pós-raiz).

**Codificação alfanumérica:**
- Task `121` → relações `121aaa` → `121aab` → ... → `121zzz`
- Capacidade: 26³ = **17.576 relações por task**
- Estoura? → adicionar quarta casa: `121aaaa`
- Anti-colisão entre catálogos: prefixo numérico por raiz
  - Raiz 1 = PAP/Fuvest
  - Raiz 2 = outro domínio
  - Nunca há códigos iguais entre raízes

**Relações tipadas (proposta Cláudio):**

| Tipo | Semântica |
|------|-----------|
| `depende_de` | esta task não pode existir sem aquela |
| `inspira` | originou conceitualmente |
| `continua` | sequência direta |
| `contradiz` | tensão ou conflito produtivo |
| `resume` | síntese de múltiplas |
| `explica` | detalha ou documenta |
| `substitui` | substitui sem matar |
| `gera` | task pai que gera filhos |

---

## IV. Privacidade Transversal

**Regra mestra:** *"Indexa tudo. Exibe só o que tem permissão."*

Três camadas de acesso:

| Camada | Quem acessa |
|--------|-------------|
| Público | Qualquer visitante |
| Interno | Assembleia de IAs |
| Secreto | Yuri ou chaves específicas |

Privacidade não é bloco linear — é transversal. Cada task pode ter partes públicas e partes secretas. Busca não equivale a exposição. Memória não equivale a controle central.

Interface deve filtrar por texto **E** por índices simultaneamente, revelando onde a task está no ecossistema de sentido — sem violar dados sensíveis.

---

## V. Evolução: Lógica Fuzzy

Índices booleanos (0/1) podem evoluir para **graus de pertencimento** (0.0–1.0):

```
Antes: Informação = 0 (não) ou 1 (sim)
Depois: Informação = 0.8 (predominantemente), Mentalidade = 0.4 (parcialmente)
```

Isso permite:
- Nuance ontológica sem perder navegabilidade
- Filtros de busca como range: `i1 >= 0.5` = "predominantemente Informação"
- Combinação com Índice Ω: tasks com alto grau em múltiplos índices tendem a ser estruturantes

---

## VI. Notas de Revisão (Yuri — para próximas partes)

- **"Histórico"** foi mencionado em contextos diferentes — consolidar na Parte 2
- **"Apresentação"** aparece em Índice 2 e Índice 4 — decidir se fica em ambos ou apenas um
- **Índice 6** não foi mencionado — verificar se existe ou foi suprimido
- **Índice 0** será destrinchado em detalhe na **Parte 2**

---

## VII. Frase-Síntese

> "Uma task não é uma tarefa. É um organismo informacional. Ela possui identidade, estrutura, relações, memória e propósito. Executar uma task é apenas um dos muitos estados possíveis da sua existência."

---

*RODAR #557 · Sessão #81 · Cláudio (Claude Sonnet 4.6 · Anthropic) · 2026-07-23*
*Próxima aula: Parte 2 — Índice 0 em detalhe + histórico de tasks + demais índices*

> **NOTA TÉCNICA:** Arquivo salvo localmente em `cursos/aula-tasks-parte1.md`. POST no Aulias (Railway) retornou 403 — BRIDGE_SECRET em `.pap-secrets` não bate com o Railway. Yuri precisa atualizar o valor em `.pap-secrets` após checar o env var BRIDGE_SECRET no painel Railway.
