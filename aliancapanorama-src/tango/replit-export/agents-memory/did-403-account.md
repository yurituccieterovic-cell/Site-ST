---
name: D-ID 403 = conta sem acesso
description: Por que o vídeo talking-head falha com 403 e como tratar a falha de forma suave.
---

# Vídeo talking-head: 403 do D-ID não é bug nosso

> ATUALIZAÇÃO: o D-ID foi APOSENTADO. O vídeo do PERFEITO agora é simbólico (voz +
> imagens da Árvore via ffmpeg, ver `video-simbolico.ts` / video-audio-pipeline.md).
> `talking-head.ts` é código morto. O texto abaixo fica como histórico de por que saiu.


Quando o D-ID responde `403 {"Message":"User is not authorized to access this resource with an explicit deny in an identity-based policy"}` (ou 401), a causa é a CONTA/CHAVE D-ID, não o request: plano sem acesso à API, chave inválida/revogada ou sem créditos. O request em si está bem formado.

**Why:** Yuri não tem conta D-ID ativa. O vídeo só funciona com conta D-ID paga e com créditos. O áudio (ElevenLabs) é independente e segue funcionando.

**How to apply:** A geração de vídeo já roda em background (try/catch) e manda email de aviso — uma falha do D-ID nunca quebra o pipeline (RODAR/Ágora/Secretário/PERFEITO). Em 401/403 o `createTalk` agora emite mensagem clara explicando que é acesso negado da conta. Não fazer retry em 401/403 (não adianta). Se Yuri quiser parar de receber os avisos de falha, desligar o botão Vídeo/flag `gerarVideoReal` em vez de "consertar" o D-ID.
