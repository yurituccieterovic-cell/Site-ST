---
name: Gemini entende vídeo do YouTube por fileUri
description: Como injetar resumo de vídeo YouTube no contexto (RODAR/Oráculo) via Gemini, e limites do free-tier
---

Gemini (REST v1beta, `models/gemini-2.5-flash:generateContent`) aceita um vídeo do
YouTube diretamente como `fileData.fileUri` (camelCase) junto de um `text` — sem baixar
o vídeo, sem transcrição própria. Ele "assiste" (amostra frames ~1fps + áudio) e resume.

**Why:** dá ao RODAR e ao Oráculo entendimento real de vídeo a custo ~R$0, sem infra de
download/transcrição.

**How to apply:**
- O resumo entra SÓ no `prompt` das vozes / `contextBlocks` do Oráculo, nunca no
  `cleanTopic`/`topic` salvo (senão vaza pro jornal público — mesma regra dos links).
- Free-tier tem teto baixo (ex.: ~20 req/dia em generate_content do gemini-2.5-flash).
  503 ("high demand") e 429 ("quota exceeded") são transitórios/cota, NÃO bug — o helper
  precisa ser não-fatal (retorna null/"" e loga warn), nunca derrubar a sessão.
- Um 429/503 já significa que o formato foi aceito (400 = request malformado). Não
  martelar retry: gasta a cota diária compartilhada que o app usa.
- Limite fan-out (ex.: máx 2 vídeos/run) pra caber na cota.
