---
name: topic-leakage-via-jornal
description: assembleia_sessions.topic é exposto publicamente via /api/jornal/publico — nunca inclua material privado nele.
---

# Vazamento via topic da Assembleia

`assembleia_sessions.topic` é gravado pelo `/rodar/stream` e usado pelo Secretário pra escrever `jornal_entries`, que `/api/jornal/publico` (sem auth) expõe pro mundo.

**Regra:** qualquer material privado adicional injetado nas vozes do RODAR (contexto de projeto da biblioteca, instruções AO-only, dados de CRM, etc.) deve ser prependado ao `prompt` SOMENTE depois de salvar `assembleia.topic = cleanPrompt`. Nunca antes.

**Why:** o pipeline RODAR → Editorial → Ágora → Secretário propaga `topic` longo caminho até o público. Misturar contexto privado com prompt do user vaza tudo de uma vez via mostra pública.

**How to apply:** ao adicionar qualquer "prepend ao prompt" no `/rodar/stream` ou `/rodar/prepare`, manter cópia limpa em `cleanTopic` (capturada antes dos prepends) e usar essa variável no `INSERT INTO assembleia_sessions`. Anexos da própria msg do user são fronteira aceitável (escolha consciente da sessão); biblioteca persistente / contexto de sistema não são.
