# rapadura_manuel_stub.md — Para o Manuel (guia completo do Rapadura)
### Criado na Sessão 95 — 2026-08-11 — aguardando Assembleia antes de completar

---

## O que já existe (Sessão 95)

### Sistema construído
- Rota: `site-st.vercel.app/rapadura`
- 4 tabelas DB: `rapadura_users`, `rapadura_fundos`, `rapadura_pertences`, `rapadura_audit`
- Auth: chat IA (routeLLM/Gemini) + bcrypt, sessão independente da PAP
- Score de Atratividade (0–100): 6 dimensões (retorno, queda, consistência, custo, liquidez, credibilidade)
- Score de Confiança: completude dos dados (7 campos = 100%)
- Views: Login chat, Oportunidades (ranking), Pertences (carteira + gráficos), Gerenciar Fundos
- CRUD completo de fundos e pertences (soft delete)
- Audit log em toda ação sensível

### Usuários
- Yuri → senha inicial: `rapadura@yuri2026`
- Mayumi → senha inicial: `rapadura@mayumi2026`

### Pendência crítica antes de qualquer acesso
Render env vars (lista completa em PSEUDO.md Sessão 95 e no email enviado para yurituccieterovic@gmail.com)

### Commit
`3544c21` — feat: Rapadura — motor de inteligência patrimonial (Sessão 95)

---

## O que a Assembleia trouxe (Sessão 96 — 2026-08-13)

Assembleia de 5 IAs (Perplexity, Gemini Flash, Árvore Oracular/Llama 3.3, Claude Haiku, Claude Sonnet):

### Score Engine v2 (implementado)
- **Calmar Ratio** incorporado ao retorno ajustado ao risco como 4ª sub-métrica
- **Fator Verde** como 7ª dimensão do score (5%): produto (fatorVerde × confiancaVerde) / 100 — anti-greenwashing
- **Score de Confiança** ampliado para 8 campos (adicionado retorno12m)
- Redistribuição: quando fatorVerde ausente, 5% vai para retornoAjustado (30%→35%)

### Features v2 (implementado)
- **Investir na Rapadura**: POST /rapadura/investir — aloca valorTotal entre top-5 fundos por score² proporcional, respeitando valorMinAplicacao
- **Colher Rapadura**: POST /rapadura/colher — resgata por ordem crescente de score, preservando raiz mínima (% do investido) em cada fundo
- **Analisar** (nova tab): GET /rapadura/analise — compara carteira vs oportunidades, sugere trocas com indiceTroca (FORTE/MODERADO/FRACO)
- **VerdeBadge** 🌿 nos cards de oportunidade
- Campos de sustentabilidade no form de gerenciar

### DB
- Banco Neon criado do zero (Sessão 95 nunca fez push ao Neon — Railway estava morto)
- Usuários: Yuri (id=1), Mayumi (id=2) com hashes bcrypt
- Nova tabela: `rapadura_aprovacoes` (protocolo I411 — backlog)
- Novos campos em `rapadura_fundos`: calmar_ratio, fator_verde, confianca_verde, score_verde, valor_min_aplicacao

---

## Manuel — guia completo a criar

### Estrutura prevista (rascunho)
1. **O que é o Rapadura** — propósito, filosofia (separação dado/cálculo/interpretação/decisão)
2. **Como acessar** — URL, login com IA, senhas
3. **Oportunidades** — como ler o score, o que significa cada dimensão, como adicionar fundos
4. **Pertences** — como registrar compras, ler os gráficos, editar/excluir
5. **Score Engine** — explicação didática de cada métrica (Sharpe, Sortino, Drawdown, Alfa, etc.)
6. **Segurança** — por que é confiável, o que fica registrado
7. **Guia para Mayumi** — passo a passo em linguagem acessível
8. **Futuro do sistema** — sessão conjunta, simulador de resgate, importar CSV XP
9. **Glossário** — Sharpe, Sortino, Drawdown, High-Water Mark, CDI, Alfa, etc.

*Arquivo final: `tango/MANUEL.md` ou página React `/rapadura/manuel`*

---

*Stub criado por Cláudio Coach · Sessão 95 · 2026-08-11*
