---
name: Fallback chains need retry on transient errors
description: Por que cada elo final de uma cadeia de fallback de LLM precisa de retry-com-backoff em 503/429/500, não só os elos anteriores.
---

# Cadeias de fallback precisam de retry em erros transitórios

O último elo de uma cadeia de fallback de LLM (ex.: Groq → Cerebras → Gemini no
oráculo da Árvore) precisa de retry-com-backoff em status transitórios
(503 overloaded, 429 rate, 500) ANTES de emitir o erro final ao usuário.

**Why:** O Gemini free-tier devolve 503 (overloaded) com frequência — é
transitório e quase sempre passa na 2ª/3ª tentativa. Quando o elo final faz
UMA tentativa e desiste, a cadeia inteira colapsa num único hiccup transitório
mesmo com Groq saturado e Cerebras fora — usuário vê "Árvore não respondeu
(Groq cansado, Gemini código 503)" e nada mais. Aconteceu de verdade, 2x seguidas.

**How to apply:** Em qualquer fallback de provedor, trate 503/429/500 como
retryable: loop de ~3 tentativas, respeita `retry-after` quando presente, senão
backoff exponencial com jitter (~0.8-1.2x), cap ~8s. Só emite o erro terminal
depois de esgotar. Distinga "stream ainda não emitiu nada" (pode re-tentar /
encadear) de "stream cortou no meio" (preserva parcial, NÃO re-tenta pra não
hibridizar a resposta). Os elos intermediários que já encadeiam pro próximo são
menos críticos; o risco está no ÚLTIMO elo, que não tem pra onde cair.

**Cadeia fixa curta colapsa quando todos os provedores estão 429 ao mesmo tempo.**
Uma cadeia hardcoded de só 3 provedores (Groq→Cerebras→Gemini) ainda erra quando
os três batem 429 simultaneamente (Cerebras free-tier devolve 429 "queue_exceeded"
sob tráfego; Gemini free-tier 429 por cota). O último elo do chat da Árvore/Oráculo
agora é o roteador `routeChat` (pool `chat-live`, não-streaming, emitido como 1 chunk
+ done) — ele acrescenta GitHub Models e OpenRouter com cooling, dando reserva real
além dos 3 fixos. Lição: prefira terminar a cadeia no roteador (que já conhece os 8
provedores grátis) em vez de listar provedores à mão; cadeia fixa curta é frágil.

**Caminhos diferentes tinham reservas diferentes — alinhe-os.** O Oráculo terminava
no roteador (mais reserva), mas `fetchGroqChat` (usado por chat.ts/vozes RODAR,
agora-deliberativa e o stream da Árvore) parava no Gemini e devolvia 429 cru. Resultado:
"criar assembleia/ágora" e as vozes caíam em "sem fôlego" enquanto o Oráculo ainda
respondia. Quando adicionar um provedor de reserva, cheque TODOS os pontos de fan-out,
não só o que o usuário citou — caminhos paralelos divergem em resiliência silenciosamente.

**Cota DIÁRIA ≠ 429 transitório.** Cerebras ("Tokens per day limit exceeded") e Gemini
("exceeded your current quota") têm teto DIÁRIO que só zera na virada do dia — a mensagem
"tenta de novo em alguns segundos" é enganosa nesse caso. Alargar a cadeia (mais provedores
grátis com cota separada) reduz a frequência do colapso, mas NÃO devolve cota já gasta no
dia; em dia de pico ainda pode faltar fôlego até o reset. Só uma reserva paga garante.
