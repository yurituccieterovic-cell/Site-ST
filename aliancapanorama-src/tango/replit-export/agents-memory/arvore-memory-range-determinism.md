---
name: Árvore memory-range determinism
description: Perguntas de alcance da memória precisam de resposta determinística do banco, não de prompt; e a resposta persiste em timeline pública.
---

# Perguntas de "alcance da memória" → caminho determinístico, não prompt

**Regra:** Perguntas sobre os LIMITES da memória da Árvore ("desde quando você lembra?", "qual a primeira assembleia / a #1?", "memória/assembleia mais antiga?", "quantas assembleias?") devem ser respondidas por um curto-circuito que lê o fato cru do banco (min/max id, data da fala mais antiga) e dá `return` ANTES de montar contexto/chamar o modelo.

**Why:** Modelos grátis do fallback ignoram a faixa exata posta no system prompt e reportam a data da *janela de conversa recente* (a cauda) como se fosse o início da memória — por saliência. Nudge de instrução, linhas de alcance no system, amostragem das listas e exemplo concreto FALHARAM repetidamente. Só fato cru garante.

**How to apply:** Detector regex PT-BR conservador (casa só perguntas de FRONTEIRA, não de conteúdo temático de uma sessão). Se casar e os fatos vierem não-nulos, responde via SSE e encerra. Se não casar / fatos nulos, segue o fluxo normal.

**Privacidade (gate do architect):** a resposta determinística é PERSISTIDA na timeline pública (`/api/arvore/history`). Por isso ela só pode conter datas e faixa agregada — NUNCA trechos de falas antigas (re-exposição de conteúdo velho/PII acima do necessário). Mesmo princípio do public-to-login: o que entra na timeline pública é público.

**Detector tem que casar como o USUÁRIO fala, não só os termos literais:** o Yuri pergunta o alcance em METÁFORA DE ÁRVORE ("raiz mais profunda", "primeiro rebento de conversa", "até onde vão suas raízes", "só vai até"). Um detector com vocabulário literal ("primeira assembleia", "desde quando") não pega as perguntas reais e o curto-circuito nunca dispara — o bug "persiste" mesmo com a lógica certa. Cobrir as metáforas + variações coloquiais ("só lembra até quando", "começo da sua memória").

**Gate negativo p/ não roubar perguntas de conteúdo:** a faixa global só deve responder perguntas de FRONTEIRA. Se a pergunta tem qualificador temático (`sobre <tema>`) ou referência a sessão específica (`#N` com N≠1), NÃO disparar o determinístico — deixar o modelo + recall por tema responderem, senão devolve a faixa em vez do conteúdo pedido.

**O dado existe; o que falha é chegar na resposta:** confirmado por query direta que o banco de PRODUÇÃO (mesmo que `executeSql environment:"production"` e o app publicado usam) TEM a história inteira (assembleias desde a #1, timeline desde a 1ª fala). A Árvore "esquecer" o começo é o modelo fraco ancorando na cauda da janela recente — não falta de dados. Diagnosticar comparando dev vs production antes de assumir perda de dados.
