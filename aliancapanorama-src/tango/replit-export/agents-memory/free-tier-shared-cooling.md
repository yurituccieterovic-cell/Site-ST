---
name: Cooling compartilhado entre os caminhos de fetch grátis
description: Por que groq-retry e oraculo precisam ler/alimentar o MESMO sinal de cooling do roteador, e quem pode ABRIR o disjuntor.
---

# Disjuntor único para a cadeia grátis

## Reserva do chat durante exaustão das vozes

Manter uma alternativa de chat fora da cadeia de fan-out das assembleias.
**Why:** em 2026-09-30, Groq e as reservas usuais estavam limitados enquanto Cloudflare ainda respondia, mas não era elegível para o chat. Acrescentá-lo também às vozes eliminaria essa separação de carga.
**How to apply:** não expandir a reserva do Oráculo para todas as vozes automaticamente; ela compartilha cota com tarefas de fundo, portanto não é capacidade garantida nem ilimitada.

O `llm-router` tem cooling por provedor, mas só o `routeChat` o consultava. Os caminhos de fetch PRÓPRIOS (vozes do RODAR via `groq-retry`, e o streaming do Oráculo) ignoravam esse estado. **Consequência:** numa queda TOTAL e simultânea da cadeia grátis (groq/cerebras/gemini/openrouter/mistral todos em 429 ao mesmo tempo — acontece em dia de pico), cada voz redescobria a queda do zero: ~22s de retry no Groq + 4 fallbacks sequenciais, todos 429. Com fan-out de ~21 vozes isso vira tempestade de 429 auto-amplificada e o RODAR "trava" entregando só 2-3 respostas.

**Regra:** todo caminho de fetch grátis deve (a) LER o cooling antes de tentar (pular provedor frio) e (b) ALIMENTAR o cooling (reportar falha/sucesso). Assim a 1ª voz mapeia a queda e as demais falham rápido com abstenção honesta, em vez de martelar.

**Quem pode ABRIR o disjuntor:** só um sinal de queda SUSTENTADA. O `groq-retry` abre depois de esgotar os 4 retries (5 tentativas). O Oráculo, que faz só 1 retry (2 tentativas), NÃO pode abrir — sinal fraco demais. **Why:** o cooling de "rate-limit" dura 10min; se um caminho de sinal fraco abrir o disjuntor num burst transitório, ele força o RODAR inteiro pro fallback por 10min sem necessidade. O Oráculo só LÊ o cooling e reporta SUCESSO; não o abre.

**How to apply:** ao criar um novo caminho de chamada a provedor grátis fora do `routeChat`, importe `providerAvailable` / `reportProviderFailure` / `reportProviderSuccess` do `llm-router` e siga a mesma disciplina. Só abra cooling em exaustão real, nunca em falha de 1-2 tentativas. Estado é in-memory por processo (Node single-thread, `setCooling` monotônico via max()) — sem race crítica; só TOCTOU benigno na 1ª onda concorrente.

## A disciplina "queda sustentada" tem que estar DENTRO do setCooling, não só nos callers

A regra acima ("só sinal sustentado abre o disjuntor") era seguida pelos callers (groq-retry faz N retries antes de reportar; oráculo só reporta sucesso), MAS o próprio `setCooling` do `routeChat` abria o disjuntor longo de 10min no PRIMEIRO 429 de qualquer provedor. **Sintoma em prod:** Yuri manda poucas mensagens, cada request do oráculo passa pelo pool chat-live, cada 429 transitório esfria o provedor por 10min; em 2-3 mensagens TODOS (groq/gemini/openrouter/cerebras) ficam frios por 10min → oráculo dá "sem fôlego" (sem resposta = parece "não acessa memória") e o eco-coder (pool coder compartilha openrouter/groq/gemini) dá 503 "não conseguiu escrever". Três sintomas, uma raiz. **Regra:** o cooling de rate-limit (429) tem que ESCALAR por falhas CONSECUTIVAS no estado do provedor — `consecFails` (zera em `markSuccess`): sinal fraco (consecFails < 4) = cooling curto (30s, deixa o transitório limpar); queda sustentada (>=4 sem sucesso no meio) = disjuntor longo (10min). Erros permanentes (dead/unauthorized 60min, server-error 2min) seguem flat — não são transitórios. **Why:** um 429 isolado é a regra no free-tier, não exceção; penalizar 10min por um é o que fazia a Árvore parecer "sem fôlego de novo" toda hora. **How to apply:** nunca aplicar cooling longo de rate-limit numa única falha; o escalonamento mora no `setCooling` (núcleo), não só na disciplina dos callers — senão o próprio routeChat fura a regra.
