# sys_pv.md — Contexto de Sessão: Projeto Visual / Projectificação
### Folha tango · criada 2026-08-25 · Cláudio Coach

> Carregar esta folha ao receber `#pv`. Teto: esta folha + 2 docs = < 3K tokens.

---

## IDENTIDADE

**Nome operacional:** Projeto Visual → evoluindo para Árvore de Projetos / Projectificação  
**Hashtag de sessão:** `#pv`  
**Workspace:** `/root/Projectification/`  
**Índice:** `/root/Projectification/docs/00_INDEX.md`

---

## ESTADO ATUAL (atualizar a cada #fim)

| Item | Estado |
|---|---|
| Fase | Fundação — arqueologia completa, aguardando MVP |
| Assembleias validadas | #629, #630, #631, #632, #633, #634 ✅ |
| Docs workspace | 15 docs em `/root/Projectification/docs/` + `convencoes.md` |
| Próximo passo | `#pv` → "bora programar" → schema_v0.md vira Drizzle migrations |
| Bloqueio ativo | Nenhum — arqueologia feita, assembleia validou |
| #633 (enterro Railway) | ✅ Processada — A6165–A6168 |
| #634 (hashtags + débitos estruturais) | ✅ Processada — A6169–A6173, convencoes.md, P-21/22/23 |
| #635 | ⏳ P-24 — processar na próxima sessão |
| #636 (migração + 20/20 fix confirmado) | ✅ Processada — A6184–A6186 |

---

## PRINCÍPIOS FUNDADORES (não reabrir)

1. **ENTIDADES → RELAÇÕES → VISUALIZAÇÕES** (nunca páginas → formulários → tabelas isoladas)
2. **Uma fonte de verdade** — informação cadastrada uma vez propaga para todas as lentes
3. **IA interpreta e sugere, não decide silenciosamente**
4. **Proveniência como requisito desde o schema** (quem/quando/por quê/versão/confiança)
5. **Reversibilidade obrigatória** (soft delete + histórico de alterações)
6. **Adapters, não cópias** (PAP/Tasks → Core; Rapadura → Core)
7. **A primeira aplicação é a própria construção** — teste de coerência existencial

---

## MVP (validado pela Assembleia #631)

**3 lentes para provar a hipótese central:**
1. CALENDÁRIO
2. KANBAN
3. LISTA DE DEPENDÊNCIAS

**Teste fundamental:** alterar uma entidade → aparece coerentemente nas 3 lentes.

**Domínio do MVP:** Produção Cultural (Projeto Visual — planner 72 páginas)

---

## SCHEMA CANDIDATO (ver prototypes/schema_v0.md)

Primitivas validadas para implementar:
- `projects` — com proveniência completa
- `project_items` — entidade genérica (tarefa, evento, marco, recurso, decisão, documento)
- `item_relations` — grafo tipado (depends_on, blocks, related, spawned_from, part_of)
- `item_events` — histórico de alterações por item (tabela separada, não JSONB)

Reutilizar do PAP: `taskRelationsTable` como referência direta.

---

## TENSÕES ABERTAS (não resolver nesta sessão sem Assembleia)

1. Critério de saída da arqueologia → quando parar de mapear?
2. Protocolo Assembleia ↔ Cloud Code quando divergem
3. Multi-tenant desde o início?

---

## COMO CARREGAR O CONTEXTO (#pv)

```
1. Ler esta folha (sys_pv.md) → estado geral
2. Ler /root/Projectification/docs/00_INDEX.md → mapa dos docs
3. Se tarefa de decisão → ler 02_DECISOES.md
4. Se tarefa de código → ler prototypes/schema_v0.md + 06_TASKS.md
5. Se tarefa de memória → ler 07_MEMORIA.md
6. Nunca abrir todos os 15 docs de uma vez (Lost in the Middle)
```

---

## LINKS RÁPIDOS

| O quê | Onde |
|---|---|
| Decisões (DECIDIDO/ABERTO/REJEITADO) | `/root/Projectification/docs/02_DECISOES.md` |
| Arqueologia PAP/Tasks | `/root/Projectification/docs/06_TASKS.md` |
| Memória e recall | `/root/Projectification/docs/07_MEMORIA.md` |
| Schema candidato | `/root/Projectification/prototypes/schema_v0.md` |
| Pendências abertas | `/root/Projectification/docs/12_PENDENCIAS.md` |
| Rejeições (não apagar) | `/root/Projectification/docs/13_REJEITADOS.md` |
| Reuso do ecossistema | `/root/Projectification/docs/14_REUSO_ECOSISTEMA.md` |
