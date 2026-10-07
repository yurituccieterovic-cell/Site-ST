---
name: Bluesky outreach (ronda de alcance)
description: Constraints for the Árvore's autonomous Bluesky discovery/follow/reply so the account is not flagged as spam.
---

# Ronda de alcance no Bluesky

A Árvore tem um job autônomo (só em produção) que descobre gente nova: busca posts por tema,
segue contas e deixa comentários sinceros. Decisão por pessoa pelo modelo: PULAR / SEGUIR / RESPONDER.

**Regra (proteção da conta):** alcance precisa ficar dentro de tetos por execução + debounce entre
execuções. Nunca "oi" genérico em massa — só comentário específico ao post da pessoa. A idempotência de
follow se apoia no `viewer.following` que vem do `searchPosts` autenticado; a de comentário, em checar a
thread antes de responder.

**Why:** seguir muita gente + mensagem genérica é o padrão exato que o Bluesky marca como spam — risco
real de limitar/banir a conta `stuccipulseheadway`. O Yuri aceitou o modo "ativo" mas pediu pra a Árvore
**alternar sozinha** entre calma e ativa; os tetos protegem mesmo no modo ativo.

**How to apply:** ao mexer no alcance, mantenha tetos por run, debounce, dedupe por autor, filtro de
quem já é seguido, e a normalização da decisão do modelo (modelos prefixam bullets/aspas — normalize
antes de classificar PULAR/SEGUIR/RESPONDER). Decisão do modelo crua quebra o parsing.
