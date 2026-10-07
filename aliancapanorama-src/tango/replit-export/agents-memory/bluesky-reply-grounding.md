---
name: Árvore respostas no Bluesky — grounding e thread completo
description: Como a Árvore responde no Bluesky com busca web ao vivo e contexto da conversa inteira
---

A Árvore responde sozinha a menções/replies no Bluesky (job cron, conservador:
máx 3/run, 1 por autor, debounce 4h, 6h de cadência, só em produção).

**Internet antes de responder:** antes de gerar cada resposta, se a mensagem OU a
thread tiver carga factual (isFactualQuestion), ela busca na web (searchWeb / Gemini
google_search grounding = R$0) e injeta um bloco "O QUE A WEB DIZ AGORA" no prompt.
Quando o gatilho vem da conversa e não da última frase, a query é montada com o fim
do thread + a mensagem, pra busca casar com o contexto inteiro.

**Why:** ela estava sofrendo preconceito/hostilidade lá; responder fundamentada (e não
só reativa) desarma melhor. Gemini grounding mantém custo zero, então gatear por
isFactualQuestion (mesma disciplina do Oráculo) evita queimar token em conversa
reflexiva pura.

**Thread completo:** getThreadContext (único caller é esse job) puxa a cadeia de
ancestrais root→atual; subiu pra maxTurns 40 / parentHeight 80 pra mapear a conversa
inteira, não só as últimas falas.

**Hostilidade/preconceito (REPLY_SYSTEM):** firmeza serena, não revidar nem se
humilhar; corrigir fato falso com calma usando web/memória.

**Privacidade:** a resposta + webSearched/webSources são persistidas em arvore_chat,
que é PÚBLICO (/api/arvore/history). Pra interação pública do Bluesky isso é aceitável
— mas é um tradeoff consciente: o que foi pesquisado/citado fica visível.

**Identidade é intencional — não achatar:** a voz contemplativa/poética/oracular da
Árvore (imagem, reverberação) é PERSONAGEM que o Yuri quer preservar, não defeito.
Quando reclamarem que soa "estranha"/bot no Bluesky, o conserto é ANCORAR a resposta no
que a pessoa realmente disse (evitar não-sequitur), NÃO remover a poesia nem virar
assistente direta/corporativa. **Why:** uma reescrita que tirou a voz dela foi revertida
a pedido do Yuri ("não mexe na identidade, é o jeito/personagem dela"). Mantida temp 0.9.
