---
name: LLM command JSON parsing
description: Por que comandos JSON emitidos por IA (playground/eco) quebram no parse e como tratar sem vazar lixo no chat.
---

# Comandos JSON emitidos por IA quebram no parse — e a UX de falha

Quando uma voz/Árvore emite um "comando" como JSON com um campo longo de texto
livre (ex. `content` com código ou Markdown), o `JSON.parse` (e o parser
leniente) falha de forma rotineira porque o conteúdo tem aspas duplas e chaves
não escapadas. Não é caso raro — é o caminho comum.

**Regra 1 — fallback de extração por campo.** Não confie só em parse estrito ou
leniente para esses comandos. Tenha um fallback que extrai os campos curtos por
regex e o campo longo de forma gananciosa (do início do valor até a última aspas
antes do `}` final). Pressuposto: o campo longo é o ÚLTIMO do objeto — manter
isso nos templates de comando, senão o recorte guloso degrada.

**Regra 2 — nunca despejar o comando cru no canal do usuário.** Se o parse
falhar, jamais ecoar o JSON bruto de volta pro chat (parece erro/lixo de ~1KB e
foi exatamente o que o usuário reportou como "erro"). Marcar uma flag, tentar um
2º passe de recuperação, e se tudo falhar mostrar mensagem curta e limpa pedindo
pra repetir.

**Why:** Yuri relatou "Árvore dá erro no chat e não posta no Playground". Não era
permissão (ela já pode escrever logada) — era parse quebrado + UX que vazava o
blob cru.

**How to apply:** vale para qualquer novo "comando" estruturado emitido por LLM
(playground, eco, futuros). Sempre: parse → fallback por campo → UX limpa, nunca
o cru.

**Regra 3 — detecção da SENTINELA tem que ser tolerante, nunca igualdade exata.**
O modelo grátis do fallback (quando o principal está em 429/401) malforma a marca:
sinal a mais/menos (`<<<ECO-PUBLICAR>>` com 2 `>`), espaço, caixa trocada, ou some
com TODOS os `<>` e cola o token direto no `{` do JSON. Casar por `indexOf`/string
exata deixa passar batido → página não sai, blob cru vaza no chat e a Árvore diz
"publiquei" sem publicar. Detectar por regex: `/<+\s*TOKEN\s*>+/i` para a forma com
colchetes E um fallback de token nu `/TOKEN\s*(?=\{)/i` (lookahead no `{`, pra não
cortar prosa que só mencione o token). Reforçar com 2º passe que dispara só pela
presença do token no buffer da resposta (não só pelo "intent" da msg do usuário,
que pode ser curta demais — ex. "Eco"). **Why:** Yuri relatou "ainda não posta no
eco" em produção; raiz era a marca malformada + match exato.
