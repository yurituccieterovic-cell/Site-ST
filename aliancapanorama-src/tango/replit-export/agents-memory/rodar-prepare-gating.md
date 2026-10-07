---
name: RODAR prepare gating
description: Todo flag opt-in novo do RODAR precisa entrar no needsPrepare do dashboard, senão some em silêncio.
---

# RODAR: needsPrepare gating de flags opt-in

No frontend do RODAR (`dashboard.tsx`, `runRodar`), o cliente só faz `POST /rodar/prepare`
(que gera o `runId` e guarda as opções no `runPrepStore` do servidor) quando `needsPrepare`
é verdadeiro. Se for falso, vai direto pro `/rodar/stream` SEM `runId` — e aí o servidor usa
os defaults (todos os flags ficam `false`).

**Regra:** qualquer flag/opção opt-in que precise chegar no pipeline (gerarVideo, gerarVideoReal,
publicarSocial OFF, replica, bunkerMode, projectId, anexos, app user pago…) PRECISA ser somado
à condição `needsPrepare`. Adicionar só o campo no corpo do prepare não basta — se o prompt for
curto e nenhum outro gatilho estiver ligado, o prepare é pulado e o flag nunca sai do navegador.

**Why:** a feature "Vídeo" (D-ID) nasceu quebrada porque o toggle mandava `gerarVideoReal` no
corpo do prepare mas não entrava no `needsPrepare`; com prompt curto e só o vídeo ligado, o
cliente pulava o prepare e o vídeo nunca disparava.

**How to apply:** ao criar um botão/toggle novo no RODAR, fazer DOIS passos juntos: (1) somar o
`want<Flag>` no `needsPrepare`; (2) incluir o campo no `body` do `/rodar/prepare`. Conferir os
três cenários: só ele ligado com prompt curto, combinado com outros, e desligado.
