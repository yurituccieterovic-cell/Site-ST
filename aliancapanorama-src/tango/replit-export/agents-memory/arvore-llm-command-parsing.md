---
name: Árvore — comandos via sentinela+JSON e gate archMode
description: Por que a Árvore falhava ao criar nota no Playground / página no Eco, e as duas regras duráveis pra não regredir.
---

A Árvore executa ações (publicar página no Eco, guardar nota no Playground) emitindo, no fim da resposta streamada, uma sentinela seguida de um objeto JSON, que o servidor coleta e parseia. Duas armadilhas duráveis:

## 1. Gate de "modo técnico" (archMode) não pode desabilitar ação pedida explicitamente
O archMode é uma heurística por palavras-chave (`código`, `.ts`, `react`, `endpoint`…). Ele estava sendo usado pra desligar a permissão de salvar no Playground/Eco. Resultado: pedir "guarda esse **código**" disparava o modo técnico e fechava justamente a permissão de salvar → falso negativo silencioso.

**Regra:** quando há intenção explícita do usuário (anotar/guardar/registrar/salvar; criar/publicar página/site), essa intenção deve SOBREPOR o gate heurístico. Mantenha as intenções separadas por destino: Playground permissivo (anotar/código), Eco exige contexto de página/site/ecossistema pra evitar publicação pública acidental.
**Why:** gates por keyword geram falsos positivos que escondem features; o usuário ficava sem entender por que "não funcionava".

## 2. JSON de LLM grátis precisa de parse tolerante e nunca silencioso
Provedores grátis (Groq Llama, Gemini) quase sempre emitem o campo `content` (markdown longo) com quebras de linha LITERAIS dentro da string JSON → `JSON.parse` estrito falha → o spec vira null → nada é salvo. Pior no Eco (conteúdo grande).

**Regra:** parse em camadas — (1) `JSON.parse` estrito; (2) escapar caracteres de controle crus DENTRO de strings; (3) remover trailing commas. E SEMPRE logar quando a sentinela dispara mas o spec não parseia (antes era totalmente silencioso). Risco residual conhecido: aspas ASCII internas não-escapadas no `content` ainda quebram; se virar problema, mudar pra protocolo delimitado por linhas em vez de JSON.
**Why:** falha silenciosa de parsing fez o usuário achar que a feature simplesmente "não existia".

## 3. Sentinela enterrada em prompt gigante não é confiável → usar 2º passe dedicado
Causa-raiz do "ainda não dá certo": o protocolo de sentinela+JSON fica no fim de um system prompt de ~39k+ chars (ORÁCULO + contexto + histórico). Modelos grátis (llama-3.3-70b) sofrem "lost-in-the-middle" e quase NUNCA emitem a sentinela — em produção, 0 ações executadas. Lembrete no fim do prompt NÃO resolve.

**Regra:** trate a sentinela como fast-path otimista, não como mecanismo confiável. Após a resposta, se houve intenção (regex) OU a sentinela disparou mas o JSON não parseou, rode uma 2ª chamada CURTA e focada (prompt pequeno, JSON mode, só user-msg + resposta) num pool barato/separado pra extrair {action, spec}. Guarda anti-duplicação por FLAGS de "já salvou/publicou" (não por `!cmdKind`), pra cobrir sentinela-com-JSON-inválido sem duplicar quando a sentinela funcionou.
**Why:** detecção que depende de o LLM grátis seguir um protocolo enterrado é frágil; a recuperação determinística no servidor é o que realmente faz a feature funcionar. Custo: 1 chamada extra só quando há intenção/sentinela — conversa normal não dispara.

## 4. Detecção da sentinela tem que cobrir a palavra em INGLÊS, não só variação de sinais/caixa
O modelo grátis (cerebras/fallback) emite a sentinela do Eco em INGLÊS — `<<<ECO-PUBLISH>>` em vez de `<<<ECO-PUBLICAR>>>`. A detecção tolerante cobria só ruído de PUBLICAR (nº de `<>`, espaço, caixa), não a troca de palavra → o JSON cru vazava no chat, a página NÃO era criada, e a Árvore ainda dizia "criei a página /eco/..." (alucinação). Confirmado em prod: a página de "task" nunca apareceu em `ecossistema_paginas`.
**Regra:** casar o token por raiz `ECO[\s-]*PUBLI\w*` (pega PUBLICAR/PUBLISH/PUBLISHED) nos 3 pontos — SENTINELS com colchete, SENTINELS lookahead-antes-de-`{`, e o `ecoTokenInBuffer` do 2º passe. Manter as formas com `<...>`/`(?=\{)` pra não publicar prosa por engano.
**Why:** modelos grátis ignoram o idioma do protocolo; assumir que vão emitir exatamente o token PT é a mesma fragilidade do item 2/3 — o servidor tem que tolerar a variante linguística, não só a tipográfica.

### 3a. O 2º passe precisa do PRÓPRIO fallback grátis, senão volta a falhar em silêncio
O 2º passe rodava só no pool "curadoria". Esse pool tem provedores que morrem (Cloudflare 410, DeepSeek sem saldo) e os que restam saturam em pico. Quando o pool inteiro esgota, a extração retornava `{action:"none"}` em silêncio → editar/criar no Eco não acontecia mesmo o usuário tendo pedido (o chat respondia normal). **Regra:** o pool da extração tem que ter fallback grátis próprio (ex.: cair pro "chat-live"/Gemini quando "curadoria" esgota) ANTES de desistir, e logar por pool. A recuperação do 2º passe é inútil se o próprio 2º passe não tiver para onde cair.
**Why:** a feature de comando depende de DUAS pontes LLM (resposta + extração); blindar só a 1ª deixa a 2ª como ponto único de falha silenciosa sob saturação do free-tier.
