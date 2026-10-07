---
name: Produção usa banco separado — semear no boot, não via script de dev
description: Por que contas/dados criados por scripts locais não aparecem no app publicado e como semear produção corretamente.
---

# Banco de produção é separado do de desenvolvimento

Dados inseridos no banco de **desenvolvimento** (via `pnpm` scripts que usam o
`DATABASE_URL` local, ou via `executeSql` environment "development") **NÃO**
aparecem no app **publicado**. A produção tem um banco próprio. Sintoma clássico:
conta/recurso funciona em dev (curl local 200) mas dá "credenciais inválidas" /
"não encontrado" no domínio `.replit.app` publicado.

`executeSql` com `environment:"production"` é **somente leitura** — serve pra
diagnosticar ("a linha existe em prod?"), não pra inserir.

**Why:** dev e prod são bancos distintos neste projeto; o schema é migrado no
publish, mas os **dados** não são copiados.

**How to apply:** pra garantir uma linha/conta em produção, semeie no **boot do
servidor** (padrão `ensure*AppUser` chamado em `index.ts` `bootstrap()`), que roda
toda vez que a produção sobe num republish. Use upsert idempotente. Para seed com
senha previsível (ex.: conta de convidado anunciada publicamente) o segredo fixo é
aceitável; para contas privilegiadas, exija um secret de bootstrap (sem fallback
hardcoded) pra não virar backdoor. Depois de adicionar/alterar o seed, **é
obrigatório republicar** — a mudança só toca a produção no próximo deploy.
