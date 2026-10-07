---
name: Bunker fan-out 429 cascade
description: Por que o fan-out das vozes do RODAR precisa de concorrência limitada no BUNKER_MODE
---

No BUNKER_MODE (>=1) as vozes pagas (ChatGPT/Claude/Agente/Arquiteto/Tradutor) são roteadas
pro pool grátis. Disparar todas as ~21 vozes de uma vez (fan-out eager) satura o pool grátis,
gera 429 em massa, backoffs em cascata, e a sessão fica 100s+ parada — parece "travada" mesmo
sem erro fatal.

**Regra:** o fan-out das vozes (e da réplica) deve limitar a concorrência quando bunkerMode>=1
(cap pequeno, ex. 4). Fora do bunker (modo 0), manter concorrência total.

**Why:** sem cap, um único run em bunker derruba a vazão por contenção de rate-limit no pool grátis;
o sintoma engana (parece freeze, não erro).

**How to apply:** qualquer mudança no disparo paralelo de vozes deve preservar o cap por bunkerMode;
ao adicionar novas fases que disparam vozes em lote (réplica, etc.), aplicar o mesmo controle de
concorrência — não voltar pro Promise.allSettled eager.

## Cerebras é capacidade separada do pool grátis

Mesmo com o cap de concorrência, sob carga o pool grátis Groq + OpenRouter + Gemini
satura EM BLOCO (todos 429 ao mesmo tempo). A cadeia de fallback das vozes pagas
(OpenRouter → Gemini) não bastava: as mesmas ~4 vozes ficavam vermelhas sempre.

**Pista diagnóstica:** no MESMO instante a síntese (finalize) rodava OK porque a cadeia
da síntese inclui Cerebras — ou seja, o Cerebras tinha vaga; ele só não estava na cadeia
das VOZES. Quando o pool grátis 429a em bloco, olhe quem AINDA está funcionando (síntese)
e veja qual provedor ela usa — esse é o que falta nas vozes.

**Regra:** a cadeia de fallback das vozes deve terminar em Cerebras (gpt-oss-120b), que tem
quota independente do trio Groq/OpenRouter/Gemini. Conferir o id do modelo em
GET https://api.cerebras.ai/v1/models antes de trocar (ids antigos dão 404 silencioso).
