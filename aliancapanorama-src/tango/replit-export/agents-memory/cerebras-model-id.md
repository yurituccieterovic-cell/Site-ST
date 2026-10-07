---
name: Catálogo de modelos dos provedores gratuitos
description: Modelos podem desaparecer do catálogo da conta; como detectar e desviar sem derrubar o RODAR
---

# Cerebras free-tier model

Usar o model id que a conta TEM acesso no momento. Conferir sempre antes de fixar:
`curl -s https://api.cerebras.ai/v1/models -H "Authorization: Bearer $CEREBRAS_API_KEY"`.

Histórico de ids que a conta perdeu acesso (cada um passou a dar 404
`model_not_found` / "does not exist or you do not have access"):
`qwen-3-235b-a22b-instruct-2507` → `llama-3.3-70b`. Atual (jun/2026): `gpt-oss-120b`
(a conta também expõe `zai-glm-4.7`).

**Why:** quando o model id morre, TODA chamada Cerebras falha na hora. Isso derruba
em silêncio: BUNKER Mode 2 (síntese), o fallback Groq→Cerebras (groq-retry) e o
fallback da Árvore (oráculo). Se o reserva seguinte também estiver indisponível
(ex.: Gemini com cota 429), a fase volta vazia e parece "travar" — foi exatamente
o sintoma "IAs travando no Bunker 2".

**How to apply:** ao adicionar/editar uma chamada Cerebras, confirmar o id no
endpoint /models antes. Locais que hardcodam o id: `lib/groq-retry.ts`,
`lib/bunker-mode.ts`, `lib/llm-router.ts` (MODELS.cerebras), `routes/oraculo.ts`.
Reserva de síntese do bunker agora vai por cascata multi-provedor (routeChat pool
"batch"), não mais só Gemini — então um provedor fora não derruba o pipeline.

## Provedor morto em pool de baixa latência

Um provedor PERMANENTEMENTE morto (token sem escopo → 401; model id/endpoint
deprecado → 404/410) não deve ficar num pool sensível a latência na frente do
degrau confiável. Sintoma: sob tempestada de 429 o caminho gasta um round-trip
inútil no morto antes de chegar no Gemini, e o cooling curto (default ~60s) faz o
410 ser re-tentado em loop a cada minuto (poluição de log + contenção).

**Why:** GitHub Models (401) estava no pool `chat-live` na frente do Gemini, e
Cloudflare (410, model id deprecado) era classificado como erro genérico → só 60s
de cooling → re-tentativa a cada minuto. Isso degradava o chat da Árvore (Oráculo)
durante saturação.

**How to apply:** (1) tirar provedor sabidamente morto do pool quente (o `chat-live`
prioriza Groq→Gemini direto); (2) em `llm-router.ts`, 401/403/404/410 entram em
cooling LONGO (classe `unauthorized`/`forbidden`/`dead` = 60min), não no default
curto — falha permanente de config não é transitória. Quando o token/id for
corrigido, o cooldown expira sozinho e o provedor volta.

## Groq com chave válida e modelo removido

O endpoint `/models` do Groq pode continuar respondendo 200 e autenticando a chave
mesmo quando um model id antes disponível desaparece. Nesse caso, a chamada de chat
retorna 404 `model_not_found`; tratar apenas 429 deixa todas as vozes que compartilham
o helper morrerem juntas.

**Why:** em agosto de 2026, `llama-3.3-70b-versatile` saiu do catálogo acessível à
conta. A última assembleia antes da correção teve 13 das 20 vozes principais com
HTTP 404, enquanto o Gemini permanecia saudável.

**How to apply:** conferir o catálogo real antes de fixar um modelo; no helper
compartilhado, 401/403/404 devem marcar o provedor como indisponível e cair
imediatamente no Gemini (ou na reserva saudável), preservando prompt e persona.
