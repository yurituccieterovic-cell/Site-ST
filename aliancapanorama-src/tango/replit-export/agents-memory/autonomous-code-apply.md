---
name: Autonomous code-apply guardrails
description: Regras pra qualquer cron/agente que aplica mudanças de código sem revisão humana neste repo.
---

# Regra
Qualquer fluxo que aplique edições de código geradas por IA sem revisão humana DEVE ter duas gates independentes:
1. **Teto de custo** (proxy pra "tamanho da mudança"): se cost ≥ ceiling, força revisão manual.
2. **Lista de paths críticos**: se qualquer arquivo proposto bate prefixo crítico, força revisão manual independente do custo.

Paths críticos neste repo: `artifacts/api-server/src/middlewares/`, `routes/auth.ts`, `routes/auth-app.ts`, `routes/checkout.ts`, `routes/webhooks.ts`, `lib/billing-detector.ts`, `lib/arvore-coder.ts`, `lib/arvore-arquiteto-mission.ts` (recursivo!), `lib/db/schema/`.

**Why:** Sonnet 4.5 é capaz de "consertar" middleware de auth em diff pequeno (cost < R$0.50) e abrir vulnerabilidade silenciosa. O code review pegou isso: gate de custo sozinho não basta. Schema/billing/auth tem que ir pra olho humano sempre.

**How to apply:** Sempre que adicionar um novo cron de auto-apply ou expandir o escopo do existente (`arvore-arquiteto-mission.ts`), revisitar `CRITICAL_PATH_PREFIXES` e adicionar caminhos novos sensíveis. Recursivo: o próprio arquivo do cron entra na lista pra ele não se reescrever silencioso.

# Árvore programadora nunca pode devolver resposta muda
A proposer (`arvore-coder.ts`, Sonnet tool-use) tem um modo de falha silencioso: o modelo gasta TODAS as iterações LENDO o repo (exploração) e nunca chega a `write_file`/`finish`, caindo num fallback mudo tipo "Nenhuma edição proposta" — o usuário acha que "o arquiteto não funciona". Causas: teto de iterações baixo demais pra tarefas que exigem ler vários arquivos antes de escrever, e pedido em forma de PERGUNTA ou multi-mudança que o tool (feito pra UMA mudança) não digere.

**Regra:** o teto de iterações deve ser generoso — o disjuntor real de custo é o budget de TOKENS (input/output caps), não o nº de passos. E TODO caminho de saída tem que produzir um resumo verdadeiro: nudge perto do teto mandando parar de explorar e propor-ou-explicar; capturar o texto livre quando o modelo responde sem tools; nunca dizer "edições parciais" quando edits=0. Prompt deve mandar SEMPRE chamar finish() e, se for pergunta/multi-mudança, escolher a ÚNICA mudança mais valiosa ou responder sem edição.

# Idempotência de prompt estático
Cron com prompt fixo que vasculha o mesmo codebase tende a convergir nas mesmas propostas semana após semana. Injetar memória das últimas N propostas no prompt como "JÁ PROPOSTO — não repita" é barato e resolve. Implementado via `getRecentSummaries(5)` filtrando por `createdBy`.

**Why:** Sem memória, gasta token toda semana propondo a mesma refatoração que Yuri já rejeitou ou que já foi aplicada e revertida. Estado da rejeição vive na cabeça do Yuri, não no DB — mas o summary fica.
