# Workflow de Funções — Teoria da Ação do Ecossistema Tucci
### Origem: Yuri Tucci Eterovic, 2026-07-11 (aquecimento filosófico)

## 1. A Teoria

**Função** tem dois significados que se unem:
- Funcionalidade — a utilidade de algo, o *o quê* serve
- Execução — um ato, um código, um acontecimento

A fusão: **função = ato útil**. Isso é utilitarismo operacional.

**Ação** é a função em ato — a subversão de uma observação.

> Observação → Entendimento → Planejamento → Ação

Mas ação não é só execução. Ela tem dimensão cósmica:

| Atributo | Descrição |
|----------|-----------|
| Espaço | Onde ocorre no ecossistema (código, físico, social) |
| Tempo | Quando acontece |
| Autor | Quem ou o que autorizou (agente, Yuri, sistema) |
| Objetivo | O porquê utilitário |
| Causa | O que motivou a ação |
| Consequência | O rastro que fica no mundo |
| Perspectiva | O ponto de vista do ator |
| Signo | Como pode ser lido intersemioticamente |

O resultado de uma ação pode ser traduzido em número (intersemiótica) — não é o fim, é a representação.

---

## 2. Workflow Operacional de Funções

### Ciclo completo

```
Observação → Interpretação → Decisão → Execução → Documentação → Feedback → Correção
```

### Aplicado ao Ecossistema Tucci

```
1. Localização   — Onde isso ocorre? (código, físico, social)
2. Intenção      — Qual o objetivo utilitário desta ação?
3. Execução      — A função em código ou ato
4. Assinatura    — Quem autorizou? (Babel Bebel / Yuri)
5. Memória       — Registro no Conector (consequência + perspectiva)
6. Réplica       — Feedback do sistema ou do usuário
7. Tréplica      — Correção ou validação do ciclo
```

### Mapeamento CrewAI (Artesão)

| Conceito Yuri | Equivalente CrewAI |
|---------------|-------------------|
| Função (capacidade) | Agente + ferramentas |
| Ação (execução) | Task |
| Localização cósmica | Contexto da task |
| Autor | Agent role |
| Documentação/memória | BabelMemoryTool / Conector |
| Feedback/réplica | Output de uma task alimenta a próxima |

---

## 3. Schema de Ação (JSON para /api/memories)

O campo `metadata` do `/api/memories` segue este template filosófico:

```json
{
  "espaco": "codigo | fisico | social | ecossistema",
  "autor": "yuri | babel-bebel | artesao | sistema",
  "objetivo": "breve descrição do propósito utilitário",
  "causa": "o que motivou esta ação",
  "consequencia": "o que muda no sistema após esta ação",
  "perspectiva": "ponto de vista do ator",
  "ciclo": "observacao | decisao | execucao | feedback"
}
```

Exemplo de uso:
```bash
curl -X POST https://site-st-production.up.railway.app/api/memories \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Widget Dodge adicionado à home da Sociedade Tucci",
    "tags": "dodge,home,sociedade,acao",
    "source": "claudio",
    "metadata": {
      "espaco": "codigo",
      "autor": "claudio",
      "objetivo": "criar interface conversacional pública da Sociedade",
      "causa": "Yuri pediu Dodge como recepcionista do sistema",
      "consequencia": "visitantes podem falar com o ecossistema via home",
      "ciclo": "execucao"
    }
  }'
```

---

## 4. Fluxo do Ecossistema (Artesão montou no Studio)

```
Governance
   └── Babel Bebel (orquestra o ciclo)
          └── Dodge (atende visitante da Sociedade)
                 └── Síntese Final (Atena fecha o ciclo com tudo)
```

**Dodge no site**: widget flutuante (`/aliancapanorama/dodge`) na home da Sociedade Tucci.
**Dodge no CrewAI**: task "Atender Visitante" com ExaSearchTool + leitura de site.

---

## 5. Para Usar

- Aula de workflows: transformar rascunhos brutos em protocolos desta estrutura
- Cada ação relevante do ecossistema pode ser registrada em `/api/memories` com o schema acima
- O Conector acumula as ações como "Histórico de Ações" do ecossistema

*Documentado por Cláudio a partir de Yuri + Artesão (CrewAI) + Perplexity + Gemini.*
