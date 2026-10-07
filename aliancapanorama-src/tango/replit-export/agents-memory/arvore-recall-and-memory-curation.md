---
name: Recall rápido e curadoria de memória da Árvore
description: Por que o recall precisa de índice trgm e por que a poda da memória só cura se o "peso" for vivo.
---

# Recall por substring precisa de índice trigram
O recall da Árvore busca por `ILIKE '%termo%'` em `arvore_chat.content`. O wildcard no
início impede índice B-tree, então sem índice cada recall faz varredura sequencial — ok
com poucas linhas, degrada conforme a timeline cresce.

**Regra:** manter o índice GIN `pg_trgm` em `arvore_chat.content` (criado via ALTER
idempotente no boot, padrão do projeto). Qualquer nova busca por substring em coluna
grande deve assumir trgm GIN, não B-tree.

# Poda de arvore_memoria só é curadoria se o "peso" for vivo
A poda capa em 200 entradas ordenando por `peso DESC, created_at DESC`. Se `peso` ficar
morto em 1 (duplicatas descartadas em silêncio), a poda vira só "mantém as 200 mais
recentes" e joga fora lições antigas importantes — a memória "vira lixeira".

**Regra:** lição recorrente (mesmo `tema+licao` numa nova destilação) deve REFORÇAR a
existente (`peso = peso + 1`), não ser descartada. Assim a poda preserva sinal recorrente
e descarta ruído de uma vez só.
**Why:** Yuri pediu "limpeza automática" — o cap já existia, o que faltava era o ranking
funcionar. Reforço por recorrência é o que transforma cap em curadoria real.
