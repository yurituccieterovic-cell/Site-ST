---
name: Playground (canto da Árvore)
description: Decisões duráveis do Playground (notas+código AO) e da escrita autônoma da Árvore via sentinela no Oráculo.
---

# Playground

## Rota de criação que o editor abre na hora deve retornar o registro completo
**Regra:** se o frontend abre a entrada recém-criada imediatamente (seta content/title/language a partir da resposta do POST), o endpoint de criação tem que devolver o registro inteiro (mesmo shape do GET/PATCH), nunca um resumo.
**Why:** um helper de criação compartilhado pode devolver só `{id,kind,title,language}` (suficiente pra Árvore avisar com link), mas isso deixa `content` undefined e quebra `.length`/`.trim()` no editor.
**How to apply:** no POST do editor, insira e devolva via `.returning()` cheio; no front normalize defaults (`e.content ?? ""`) pra resistir a payload parcial de qualquer origem.

## Sentinela do Oráculo é multi-sentinela genérica
O filtro de holdback do streaming do Oráculo reconhece um ARRAY de sentinelas (eco-publish + playground-nota). Pega a que aparece mais cedo no buffer e segura cauda do tamanho da MAIOR sentinela pra não vazar match partido entre chunks; pós-stream roteia pela sentinela detectada.
**Why:** detecção split-entre-chunks tinha que ser genérica pra suportar mais de um comando sem reescrever o parser.
**How to apply:** pra uma 3ª sentinela, inclua no array e trate o novo tipo no pós-stream — a mecânica de holdback/detecção já cobre.

## Gate de escrita autônoma
Comandos que a Árvore executa via chat (eco-publish, playground) só valem pro operador autenticado e fora do modo arquiteto. Manter as instruções desses comandos fora do prompt quando não autorizado, não só barrar a execução.
**Why:** instrução no prompt = a IA tenta usar e confunde; o gate tem que ser na injeção da instrução, não só no efeito.

## Escrita autônoma no Playground (caderno seletivo) + privacidade da fonte
A Árvore guarda no Playground por iniciativa própria via job autônomo (só em produção, pool grátis), não só reativamente no chat. Regra dura: um job autônomo que LÊ uma tabela privada (ex. arvore_playground) pra montar prompt de LLM externo TEM que filtrar pelas linhas dele mesmo (author do próprio job) antes de mandar pro provedor.
**Why:** o Playground é privado do Yuri; mandar títulos/notas dele pra Cloudflare/Mistral/etc. é vazamento. A fonte de curadoria também só lê arvore_chat.private=false (mesma higiene da destilação).
**How to apply:** dedupe/"não repita" usa só as entradas do próprio autor autônomo; intenção de guardar detectada por regex tolerante (sobrevive a content que quebra JSON), campos pelo parser robusto compartilhado; conservador (não guarda sem "guardar":true explícito).
