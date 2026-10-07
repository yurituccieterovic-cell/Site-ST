---
name: STT mobile duplication
description: Por que o ditado por voz duplicava a fala no celular e como montar a transcrição certo
---

# Ditado por voz duplicava a fala (Chrome mobile)

O Web Speech API no Chrome mobile reenvia/reindexa resultados já finais. Duas
camadas de problema, ambas com a mesma cara (a frase aparece repetida; quando
vira prompt, a Árvore responde "Não sei" por causa do lixo repetido):

1. **Reset de `resultIndex`**: acumular com `+=` a partir de `e.resultIndex`
   duplica. Corrigido remontando a sessão atual do índice 0 (idempotente).
2. **Reemissão de finais na MESMA sessão contínua**: com `continuous=true`, o
   Android reanexa/reemite resultados já finais, então até a remontação soma
   duplicado. A remontação sozinha NÃO resolve este caso.

**Regra atual (resolve os dois):**
- Sessões curtas: `continuous=false`, `interimResults=true`.
- A cada `onresult`, remontar a sessão atual do zero e mostrar `seed + final + interim`.
- No `onend`, FIXAR o `final` da sessão no `seed` (separado por espaço) e zerar o
  final da sessão; se o usuário ainda quer ditar (`keepAlive`), abrir uma NOVA
  sessão e dar `start()`. Assim cada sessão só traz palavras novas → nada repete.
- `no-speech`/`aborted` durante `keepAlive` são normais entre frases: ignorar (o
  `onend` reabre). Erros reais derrubam o `keepAlive`.
- `stop()` zera `keepAlive` antes do `stop()` nativo pra não reabrir.

**Why:** o modo contínuo é instável no celular; sessões curtas + commit-no-fim
dão ditado contínuo de verdade sem perder nem duplicar. Desktop também funciona
(só reabre mais vezes, sem efeito visível).

**How to apply:** vale pra qualquer leitor de `SpeechRecognition`. Nunca confie
em `continuous=true` pra mobile; guarde o seed separado do reconhecimento.
