---
name: Aplicar código da Árvore — fronteira dev/prod/publish
description: Por que "aprovar no site publicado" nunca escreve código de verdade, e o que um botão de "aplicar" pode/não pode fazer.
---

# Regra
Um botão no app que "aplica" propostas de código da Árvore só escreve no código DE VERDADE quando a requisição é servida pelo workflow de DEV (NODE_ENV=development) — aí escreve no disco do Repl + commit local. Em PROD o approve só ENFILEIRA (status=approved, applied_to_disk=false). Ir pro ar exige Publish, que é ação Replit/humana — o app não se autopublica.

**Why:** O container de produção tem filesystem efêmero; `fs.writeFile`+commit lá não persistem e o próximo Publish puxa o código do Repl de dev (intocado). Logo "aprovar em prod" sempre foi mudo. O disco de dev é a fonte do deploy.

**How to apply:** Ao prometer "aplicar sem terminal" pra Yuri, seja honesto: aplicar de dentro da prévia DEV é real e imediato; o passo de publicar continua sendo um clique humano (eu aperto, emailando antes). Não construir daemon auto-applier de propostas geradas por IA — conflita com o gate de revisão (ver autonomous-code-apply.md).

# UI de aprovar em dois lugares
Oráculo (chat) e página do arquiteto compartilham os MESMOS endpoints `/api/arvore/code/proposals*`. Por isso "aprovar num vale no outro" é grátis: o registro no banco é a fonte única; cada superfície só refaz o fetch. Não inventar estado de aprovação por superfície.
