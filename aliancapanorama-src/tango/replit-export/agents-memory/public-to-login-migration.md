---
name: Tornar superfície pública privada (atrás de login)
description: Ao mover um endpoint/página antes pública pra dentro do login, gate as DUAS camadas E vire o Cache-Control.
---

Quando uma rota antes 100% pública passa a exigir login:

1. **Gate as duas camadas.** Só envolver a rota do frontend em ProtectedRoute deixa a API ainda aberta (qualquer um chama o endpoint direto). Só gatear a API deixa a tela tentando carregar e quebrando. Faça os dois.
2. **Vire o Cache-Control de `public` para `private, no-store`.** Conteúdo agora autenticado marcado como `public, max-age=N` pode ficar retido em cache compartilhado/intermediário e vazar pra quem não devia. Fácil de esquecer em endpoints irmãos (ex.: a listagem E o PDF) — confira todos os handlers do arquivo, não só o que você lembrou.
3. **Confirme que nenhuma outra superfície pública depende do endpoint** antes de trancar (grep no frontend pelos consumidores).

**Why:** review pegou um PDF autenticado ainda com `Cache-Control: public` depois de eu já ter trancado a listagem — vazamento residual silencioso.
**How to apply:** vale pra qualquer pedido "tira isso do público / põe atrás de login". No SalesCockpit, endpoints `/jornal/publico*` mantêm o nome "publico" por compat mas hoje exigem `req.session.authenticated`.
