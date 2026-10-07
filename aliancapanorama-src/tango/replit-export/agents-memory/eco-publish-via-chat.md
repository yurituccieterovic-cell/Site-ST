---
name: Ações disparadas por sentinela no chat da Árvore
description: Como/por que ações executáveis emitidas pelo modelo (ex. publicar página no eco) são gated no servidor, não no prompt.
---

A Árvore pode disparar ações reais (ex. publicar página no Ecossistema) emitindo uma
sentinela + JSON no fim da resposta; o backend filtra a sentinela do stream e executa.

**Regra:** a permissão da ação é decidida no servidor pela sessão (`req.session.authenticated`),
NUNCA pelo fato de a instrução só ter sido injetada pro AO. Injetar instrução só pro AO
reduz disparo acidental, mas não é controle de acesso — um não-AO pode emitir a sentinela
via prompt injection. O gate real é `if (acaoPermitida) executa`.

**Why:** instrução no system prompt é dica, não fronteira de confiança. Quem decide é o
servidor olhando a sessão. A timeline `arvore_chat` é pública (/api/arvore/history), então
o JSON-comando cru nunca pode ir pro user nem ser persistido — persiste só o texto visível.

**How to apply:** ao adicionar qualquer ação executável disparada pelo modelo no chat:
(1) filtro de stream com holdback (segura cauda do tamanho da sentinela pra detectá-la
partida entre chunks); (2) gate por sessão no momento da execução; (3) se a sentinela
disparar mas não executar (sem permissão / JSON inválido), devolva o trecho como texto
normal pra não truncar a resposta; (4) persista o buffer visível, nunca o comando cru.

## Páginas "code" do eco rodam em iframe sandbox de origem opaca — CDN https é seguro e permitido

Páginas kind="code" rodam num iframe com `sandbox="allow-scripts"` e SEM `allow-same-origin`
(origem opaca). Logo o documento não enxerga cookies/localStorage/DOM do app, não faz
request autenticado à API e não pode se auto-remover do sandbox. **Por isso carregar
bibliotecas web por CDN via https (Chart.js, three.js, p5.js, D3, Tone.js) é seguro e está
LIBERADO** (decisão do Yuri: "opção 1" — libs web prontas, não rodar outras linguagens).
**Why:** o risco de XSS some porque a origem é opaca; o script externo roda isolado, sem
credenciais. **How to apply:** liberar CDN é só texto de PROMPT (3 lugares: ARVORE_CODER em
routes/ecossistema.ts, ECO_PUBLISH_INSTRUCTIONS em routes/arvore.ts, extrator em
lib/arvore-command-extract.ts). NUNCA adicionar `allow-same-origin` ao iframe pra "facilitar"
libs — isso quebra o isolamento. Continua só navegador: nada de PHP/Node/servidor/banco.

## Editar página do eco pelo chat = upsert por slug, não insert

Pedir à Árvore pra EDITAR uma página do eco só criava DUPLICATA. **Why:** o caminho dela
era só insert (createEcoPage) e o gerador de slug renomeava o choque "x" → "x-2" — ou seja,
a deduplicação de slug ATIVAMENTE impedia editar. **Regra:** a publicação por chat tem que
ser UPSERT por slug — se o slug (normalizado) bate exato com uma página existente, UPDATE no
lugar (mantém slug/URL estáveis); senão cria. No update, só sobrescreve content quando vem
conteúdo de verdade (pedido de só renomear/mudar visibilidade não apaga o corpo). As 3
chamadas no chat (inline no stream, inline pós-stream, recuperação do 2º passe) precisam usar
o MESMO upsert — fácil esquecer uma. As instruções (publish + índice getEcoIndex + extrator
do 2º passe) devem dizer "pra editar, reuse o slug EXATO". **Trade-off aceito:** criar com um
slug que já existe agora sobrescreve em vez de gerar "x-2" — a queixa real era a duplicata ao
editar; mitigado por instrução, não determinístico.
