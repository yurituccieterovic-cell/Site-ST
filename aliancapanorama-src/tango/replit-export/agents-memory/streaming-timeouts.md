---
name: Streaming/synthesis fetch timeouts + SSE heartbeat
description: Why every external LLM fetch (streaming or not) needs an abort timeout, why streaming readers need an idle watchdog, and why long SSE endpoints need a heartbeat.
---

# Streaming/synthesis fetch timeouts + SSE heartbeat

Three distinct production hangs in this codebase all came from missing timeouts. Treat these as standing rules for any new AI-provider call or SSE route.

**Rule 1 — non-streaming `fetch` to an LLM provider must have an AbortController timeout.**
**Why:** a provider that accepts the connection but never responds blocks the awaited `fetch`/`json()` forever. In Bunker Mode 2 this surfaced to the user as the synthesis silently never returning, and the pipeline eventually emitting `(síntese não disponível)`. A bounded timeout lets the fallback chain run instead of hanging.
**How to apply:** wrap with a `fetchWithTimeout` (AbortController + `clearTimeout` in `finally`). Synthesis can legitimately be slow — size the timeout generously (≈90s) rather than reusing a short chat timeout.

**Rule 2 — streaming readers (`response.body.getReader()`) must have an IDLE watchdog, not just a connect timeout.**
**Why:** the hang is `await reader.read()` blocking after the connection opened but the provider stalled mid-stream. A one-shot connect timeout doesn't catch that. This was the cause of voices stuck on "Travei durante a geração" / never emitting `done` in Bunker mode — the UI has no terminal event so it stays in "generating" forever.
**How to apply:** AbortController whose timer is reset on every received chunk; abort if no chunk arrives within the idle window (≈30s). Declare the controller/timer OUTSIDE the `try` so the `catch` (fetch throws before the loop) can also `clearTimeout` — otherwise you leak a pending timer on every failed attempt. The caller must still emit a terminal `done`/error on every exit path so the UI unsticks.

**Rule 3 — long-lived SSE endpoints must send a heartbeat.**
**Why:** RODAR's `/rodar/stream` waits on `Promise.allSettled` over ~19 voices. On a large prompt the gap between data frames exceeds proxy idle timeouts (Cloudflare/Nginx ~60-120s) and the proxy drops the connection — user sees "Conexão falhou com N IAs ainda gerando" while the server keeps working.
**How to apply:** `setInterval` writing an SSE comment (`: ping\n\n`) every ~15s; clear it on `req` "close" and before `res.end()`.

**Rule 4 — every new RODAR *phase* must inherit the first round's guards; a `runInWaves`/`Promise.allSettled` wave with even one un-timed voice hangs the whole wave.**
**Why:** the Réplica (2ª rodada) reused the voice engines but was added WITHOUT the first round's soft-fail/Tradutor fallback AND without a per-voice timeout, and it re-injected the ENTIRE original prompt (`cleanTopic`, 3000+ chars) into every voice's replica prompt on top of the digest. On long prompts one slow/hung voice held the `allSettled` wave open forever, the SSE died ("conexão falhou"), and the run only finalized via the 10-min `recoverOrphans` sweep instead of normally.
**How to apply:** any per-voice call inside a wave needs its own `Promise.race` timeout (≈90s) that emits a terminal `cb("",true,err)` so the wave advances, plus a `settled` guard so late callbacks after timeout are ignored. Do NOT re-feed the full long prompt to a later phase — the voices already saw it in round 1; truncate the topic (~1200 chars) and rely on the digest. Note: the race timeout does NOT cancel the underlying fetch (no AbortController propagated to the stream fns yet), so a timed-out voice keeps running in the background until it ends on its own — liveness is fixed, but zombie calls still consume tokens under load.
