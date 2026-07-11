# Metassemiótica do Ecossistema Tucci
### Origem: Aulas de Workflow — Yuri Tuccieterovic, 2026-07-11
### Aplicar sempre: ao descrever ações no sistema, explicitar a cadeia semiótica completa.

## Princípio Central

Toda ação é um signo operável.
Dados são significantes — representações, não objetos.

## A Cadeia Semiótica

```
Dado (significante)
  → Pensamento (lógica / interpretação)
    → Representação (signo gerado / output)
      → Ação (signo em ato / execução)
        → Memória (signo persistido / contexto futuro)
```

**Sem memória, a ação é um signo órfão** — sem passado, sem réplica, sem evolução.
**Com memória, a ação vira história do sistema.**

## Pirâmide da Ação (Ontologia Tucci)

| Nível | Conceito | Função no Sistema |
|-------|----------|-------------------|
| Meta-Nível | **Diretrizes** | Ethos, preferências, manifesto — o que limita e orienta |
| Estratégico | **Objetivo** | Para onde ir (o "por quê") |
| Tático | **Tarefa** | O que precisa ser feito |
| Operacional | **Ação + Ferramenta** | A execução concreta |
| Cognitivo | **Dados + Pensamento** | Interpretação da realidade |
| Ontológico | **Memória** | A persistência do signo (o que somos) |

## Protocolo de Registro de Ação

Cada task/ação do ecossistema deve declarar:

```
1. dados_lidos       — significante de entrada (o que foi observado)
2. ferramenta_usada  — instrumento da ação
3. objetivo_atendido — qual diretriz ou objetivo foi servido
4. representacao     — output semiótico gerado
5. consequencia      — o que mudou no sistema após a ação
6. memoria_gravada   — o que foi persistido (Conector / /api/memories)
```

## Mapeamento para IAs (padrão de comportamento)

```
Receber dados
  → Interpretar segundo diretrizes
    → Recuperar memória relevante
      → Escolher ferramenta
        → Executar tarefa
          → Registrar consequência
```

## Mapeamento para CrewAI

| Conceito Yuri | CrewAI |
|---------------|--------|
| Diretrizes | backstory + regras do agente |
| Objetivo | goal |
| Tarefa | task description |
| Ferramenta | tools |
| Memória | BabelMemoryTool / PAPMemoryTool |
| Dados (entrada) | inputs {intention} {handle} |
| Representação | expected_output |
| Consequência | contexto da próxima task |

## Metafórmula

> "Toda ação é um signo operável; toda tarefa é uma ação orientada por objetivo; toda inteligência útil preserva memória, interpreta dados e escolhe ferramentas conforme diretrizes."

## Aplicação ao JSON de /api/memories

```json
{
  "content": "descrição da ação",
  "tags": "semiotica,acao,ciclo",
  "source": "agente-responsavel",
  "metadata": {
    "dados_lidos": "...",
    "ferramenta_usada": "...",
    "objetivo_atendido": "...",
    "representacao": "...",
    "consequencia": "...",
    "ciclo": "observacao | decisao | execucao | feedback"
  }
}
```
