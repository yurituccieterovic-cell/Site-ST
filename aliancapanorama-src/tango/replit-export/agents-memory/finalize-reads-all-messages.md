---
name: finalizeAssembleia lê TODAS as mensagens da sessão
description: qualquer msg gravada em assembleia_messages vira transcript do pipeline PERFEITO — novas "fases" precisam ser filtradas
---

`finalizeAssembleia` (e `recoverOrphans`, que o chama) faz `SELECT * FROM assembleia_messages WHERE sessionId` e monta o `transcript` com `collected[m.sender] = m.content` para TODA mensagem, sem filtro. Esse transcript alimenta Editorial → Meta-análise → Ágora → Secretário (o PERFEITO).

**Regra:** qualquer nova categoria/fase de mensagem persistida em `assembleia_messages` (ex.: réplica da 2ª rodada, gravada como sender `"${label} (réplica)"`) DEVE ser filtrada dentro de `finalizeAssembleia`, senão contamina silenciosamente o PERFEITO/Ágora. A réplica é filtrada por `m.sender.endsWith("(réplica)")`.

**Why:** o pipeline lê do DB (não da memória `collected` do /rodar/stream) pra funcionar igual em runs novos e órfãos. Quem grava no mesmo table sem pensar nisso vaza pro produto final. Descoberto no code review da feature Réplica.

**How to apply:** ao adicionar qualquer escrita nova em `assembleiaMessagesTable`, decida se ela faz parte do material do PERFEITO; se não, adicione o filtro correspondente no loop de leitura do `finalizeAssembleia`. Idealmente uma coluna `phase` resolveria de vez (hoje é heurística por sufixo no sender).
