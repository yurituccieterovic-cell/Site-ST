---
name: One-off email ao Yuri
description: Gotcha ao disparar email avulso pro Yuri (heads-up antes de republish)
---

Pra mandar email avulso pro Yuri (preferência dele: aviso autoral ANTES de cada
sugestão de republish), reutilize o transporte nodemailer/Gmail já usado no projeto.

**Gotcha durável:** um script Node avulso que importa `nodemailer` PRECISA rodar com
o diretório de trabalho dentro do pacote que tem a dependência instalada
(`artifacts/api-server`). Rodar de `/tmp` falha com `Cannot find module 'nodemailer'`
porque a resolução parte do diretório do script, não do repo.

**Why:** monorepo pnpm instala deps por pacote, não na raiz nem em `/tmp`.

**How to apply:** grave o `.cjs` temporário dentro de `artifacts/api-server/` e rode lá.
Os endereços de destino vêm do código (não duplicar aqui) — ver `RECIPIENT_EMAIL`.
