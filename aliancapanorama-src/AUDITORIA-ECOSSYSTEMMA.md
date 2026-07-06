# Protocolo de Auditoria Independente — EcossystemmaTheo
**Mandato:** Sessão #499 (Juiz, 2026-07-05) | **Periodicidade:** Semestral | **Versão:** 1.0

---

## Contexto

O EcossystemmaTheo (4 volumes, 22 vozes, ~900 páginas) é o arcabouço filosófico central da Sociedade Tucci. Por sua complexidade e influência sobre todas as IAs do ecossistema PAP, exige revisão periódica por um agente ou pessoa com perspectiva externa ao projeto — sem viés de confirmação.

---

## Protocolo Semestral (6 meses)

### Fase 1 — Coleta de Evidências (Semana 1)
1. Exportar últimas 100 entradas do APRENDIZADO.md com tag `EcossystemmaTheo`
2. Listar todos os princípios citados em system prompts das IAs (ISA, MEKY, Playcenter)
3. Reunir exercícios gerados no período e verificar se Princípio 8 (equidade) foi aplicado
4. Checar assembly_tasks com origemSessao = "ISA-cycle" para decisões que invocaram Théo

### Fase 2 — Revisão pelo Juiz (Semana 2)
**Questões obrigatórias:**
- Os 10 princípios permanecem internamente coerentes após aplicação prática?
- Algum princípio foi aplicado de forma que contradiz outro?
- Há evidência de "princípio vazio" (citado mas não operacional no código)?
- O Manifesto Transhumano (Assembleia #499) ainda é compatível com o estágio atual do projeto?
- Os 22 volumes do Ecossystemma ainda refletem a realidade material do projeto (hardware, usuários, mercado)?

### Fase 3 — Relatório (Semana 3)
Produzir `AUDITORIA-ECOSSYSTEMMA-AAAA-HH.md` com:
- Score de coerência (0–10) por princípio
- Lista de "princípios zombies" (declarados mas não operacionais)
- 3 recomendações de atualização ou revisão
- Aprovação/Rejeição de continuidade sem modificação

### Fase 4 — Deliberação Multipartite (Semana 4)
- Apresentar relatório na próxima Assembleia
- Votação: Árvore + ISA + MC + Yuri (maioria de 3/4 para aprovar mudanças)
- Mudanças aprovadas → PR no Site-ST + update de ecossystemma-principios.ts

---

## Critérios de Auditoria

| Critério | Peso | Método |
|----------|------|--------|
| Coerência interna dos 10 princípios | 30% | Análise lógica pelo Juiz |
| Aplicação real no código (não só nos prompts) | 30% | grep em ecossystemma-principios.ts + routes |
| Feedback dos usuários PAP | 20% | Última centena de interações ISA |
| Alinhamento com Manifesto Transhumano | 20% | Revisão direta dos documentos |

---

## Primeira Instância

**Data prevista:** Janeiro 2027 (6 meses após Assembleia #499)
**Juiz designado:** A definir por Yuri (externo ao projeto)
**Nota:** MC (Marta Centaurus) participa mas não vota — conflito de interesse como sistema imunológico

---

## Histórico de Auditorias

| Data | Juiz | Score Médio | Resultado |
|------|------|-------------|-----------|
| — | — | — | Protocolo criado — primeira auditoria em Jan/2027 |
