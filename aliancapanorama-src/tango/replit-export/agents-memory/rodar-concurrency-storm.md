---
name: RODAR free-tier 429 storm
description: por que vozes do RODAR estouravam o tempo e por que a cura é limitar concorrência, não mexer em retries
---

Quando muitas vozes do RODAR estouram o tempo / a sessão é abortada perto dos 300s, suspeite de saturação de rate-limit do provedor grátis (Groq free-tier), não de retry/timeout faltando.

**Regra:** fan-out de vozes precisa de teto de concorrência mesmo no modo normal. Disparar todas as ~18-20 vozes de uma vez, com a maioria pinada no mesmo provedor grátis, estoura o limite por minuto → 429 em cascata → backoffs de 10-15s empilhados × várias tentativas → fallback (cerebras/mistral) também estoura quota → o conjunto passa do orçamento de tempo.

**Why:** o problema é a AMPLITUDE do disparo simultâneo, que transforma um limite normal de RPM numa tempestade. **Multiplicador chave:** ~TODAS as vozes entram Groq-first (fetchGroqChat) e, quando o Groq cai, despejam na MESMA cadeia de reserva (Cerebras→Mistral→Gemini→OpenRouter) — então a carga toda bate num provedor de cada vez, e o teto de concorrência precisa limitar tanto o burst inicial QUANTO o spillover na cadeia grátis.

**Nuance sobre retries (correção de uma lição antiga):** "mais retry só piora" vale pra ADICIONAR retries. Mas retry DEMAIS contra um provedor em esgotamento SUSTENTADO (não burst) também atrapalha: cada voz da 1ª onda fica moendo o backoff inteiro (ex. 4 retries ≈ 22s) contra um Groq que não vai voltar antes de cair pro fallback — e como elas começam juntas, são N vozes grindando em paralelo (é o "travou" que o usuário vê) e o acúmulo empurra a sessão pro corte de ~300s ("não responderam"). Menos retries (ex. 4→2) faz a 1ª voz disparar o cooling do Groq cedo, e as ondas seguintes pulam direto pro provedor de pé. Persona é preservada no fallback porque o system message vai junto no body.

**How to apply:** (1) mantenha teto de concorrência no fan-out (`runWithConcurrency`) também no Modo 0 — nunca `voiceFns.length`; dimensione pra caber na cota por-minuto da cadeia de RESERVA, não só do Groq. (2) Mantenha o retry do provedor primário curto (poucas tentativas) pra falhar rápido quando a queda é sustentada — o disjuntor (cooling em llm-router) é que protege as ondas seguintes, não o grind. (3) Se o tempo ainda incomodar em pico, prefira semáforo POR-PROVEDOR (Groq separado da reserva) a subir o teto global. Sintoma colateral: ações interativas não-LLM (ex. criar página no Eco) ficam instáveis enquanto a tempestade dura.
