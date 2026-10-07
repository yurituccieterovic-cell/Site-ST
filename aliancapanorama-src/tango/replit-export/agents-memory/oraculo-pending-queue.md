---
name: Oráculo fila de envios
description: Como o Oráculo trata mensagens enviadas enquanto a Árvore ainda responde (streaming) ou quando a conexão cai.
---

A fila de pendências do Oráculo (`enqueuePending`/`deliver`) cobre dois casos, não só queda de conexão:

- **Envio durante streaming**: um envio normal feito enquanto `streaming` é verdadeiro NÃO pode retornar "skipped" (isso descartava a mensagem). Ele é enfileirado e respondido depois.
- **Queda de conexão**: o catch enfileira e mantém a mensagem do usuário + nota de erro visíveis; reentrega ao voltar.

**Como aplicar:** o loop `deliver` só roda fora do streaming (checa `streamingRef.current` e quebra se estiver pensando). Para drenar a fila ao fim de cada resposta, exponha `deliver` num ref e dispare-o num effect em `[streaming]` quando vira false (pequeno atraso pra o estado assentar). Replays durante streaming devem retornar "skipped" (esperam a próxima passada do loop). `deliveringRef` evita reentrância/corrida.

**Why:** sem o ramo de enfileiramento, qualquer mensagem digitada enquanto a Árvore pensava sumia silenciosamente; o usuário perdia o que escreveu.

**Armadilha da UI (lição):** a fila já existia, mas o textarea e o botão de enviar ficavam `disabled={streaming}` e o aviso de status era renderizado só com `!streaming && status` — ou seja, o usuário NUNCA conseguia disparar um envio enquanto a Árvore respondia, e mesmo que conseguisse não via feedback. Para "mandar enquanto ela responde": libere textarea+botão (e anexo) durante o streaming. Use um estado de aviso SEPARADO (`queuedNote`) pro "guardei…", NÃO reaproveite `status` — `status` é usado pelas fases do próprio stream (buscando-web/lendo-código), então sobrescreveria/seria sobrescrito. Limpe `queuedNote` no effect de `[streaming]` quando vira false.
