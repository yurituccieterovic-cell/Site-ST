---
name: Enviar emails de aviso operacional ad-hoc
description: Como mandar email avulso (aviso ao Yuri antes de republish) sem rota HTTP
---

Para enviar um email avulso (ex.: aviso operacional ao Yuri antes de sugerir republish),
NÃO dá pra importar `nodemailer` do sandbox code_execution (root) nem de um script em `/tmp`:
o pnpm usa node_modules symlinkado por pacote, então a resolução falha (ERR_MODULE_NOT_FOUND).

**Como aplicar:** escreva um `.mjs` temporário DENTRO de `artifacts/api-server/` e rode com
`node ./arquivo.mjs` a partir desse diretório (apaga depois). Aí o nodemailer resolve.
Credenciais via `process.env.GMAIL_USER` / `GMAIL_APP_PASSWORD`, transport `service:"gmail"`.
Destinatário do aviso operacional e o email autoral estão em `replit.md` (User Preferences) — use o operacional pro aviso, não o autoral.
