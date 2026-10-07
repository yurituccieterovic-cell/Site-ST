---
name: RODAR em segundo plano — sinal de "run comprometido" no SSE
description: Como o cliente decide se um erro de SSE é falha real ou continuação em background
---

O RODAR roda no servidor via SSE (`/rodar/stream`). Node não aborta o handler quando o
cliente fecha a página: uma vez aberto o stream, a sessão segue até `finalizeAssembleia`
mandar o email (e `recoverOrphans` pega sessões live esquecidas). Então fechar a página
NÃO deve virar "Conexão falhou".

**Regra durável:** o sinal confiável de "run já comprometido no servidor" no cliente é
`EventSource.onopen`, não o 1º frame de dados. O 200 do SSE (`flushHeaders`) só acontece
DEPOIS dos checks de crédito/runId no servidor; rejeições (402/403) voltam não-200 e o
`onopen` nunca dispara. Logo `onopen` distingue com precisão falha-real (antes de abrir)
de continuação-em-background (depois de abrir).

**Why:** marcar "started" só no 1º frame (ex.: assembleiaId) deixa uma janela em que a
conexão cai entre abrir o stream e o frame chegar → falso "Conexão falhou" com o run
seguindo em background.

**How to apply:** no handler do SSE do cliente, setar a flag local `runStarted=true` em
`onopen` (e manter no frame inicial como reforço); no `onerror`, se `runStarted` mostrar
mensagem calma ("continua em segundo plano, resultado chega por email"), senão erro real.
Servidor: `res.write`/`res.end` em try/catch pra desconexão não interromper o pipeline.
