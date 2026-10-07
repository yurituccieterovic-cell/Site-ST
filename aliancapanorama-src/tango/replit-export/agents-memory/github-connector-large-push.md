---
name: GitHub push de snapshot via connector
description: Como publicar um repositório grande e sanitizado usando a conexão GitHub sem expor o token
---

Para um snapshot com centenas de arquivos e binários, não faça centenas de
`proxyFetch` concorrentes dentro do CodeExecution durável. O replay pode falhar
com erro interno de serialização depois de já registrar parte das chamadas.

**Why:** o conector funcionou para leituras e pequenas escritas, mas uploads de
blobs binários em massa falharam repetidamente no replay. Um script temporário no
workspace usando `@replit/connectors-sdk` concluiu o mesmo fluxo sem revelar token.
A versão mostrada na documentação injetada também pode não existir no registro;
confirme a versão disponível antes de instalar.

**How to apply:** use o SDK só durante a operação, remova dependência e script no
fim, e nunca leia credenciais. Em repositório GitHub totalmente vazio, a Git Data
API pode responder 409 ao criar blobs ou ler refs; inicialize `main` com um README
pela Contents API, então envie binários como blobs, textos via `content` na tree,
crie commit com o commit inicial como parent e atualize a ref. Para migração,
exclua dumps, exports, `.agents`, uploads brutos e arquivos de secrets; publique
um `.env.example` somente com nomes.