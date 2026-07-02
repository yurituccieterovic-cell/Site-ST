# PAP — Protocolo de Trabalho

**Ler este arquivo ao iniciar qualquer sessão `#pap`.**

---

## Ao digitar `#pap`

1. **Memórias** → ler `project_pap.md` e `user_yuri.md` em `/root/.claude/projects/-root/memory/`
2. **Mapa** → ler `MAPA.md` (estado atual do sistema, pendências, infraestrutura)
3. **Aprendizado** → ler `APRENDIZADO.md` (526 insights extraídos de 424 assembleias de IAs)
4. **Ideias** → ler `IDEIAS.md` (31 ideias de programação derivadas do aprendizado)
5. **Pseudo** → se necessário, ler `PSEUDO.md` (histórico, fluxograma, wireframe) e `PSEUDO2.md` (pseudocódigo)
6. **Produzir** → confirmar contexto com Yuri e executar

## Ao digitar `#secrets`

Claude lê `/root/.pap-secrets`, identifica campos vazios e apresenta uma caixinha por vez:

```
┌─────────────────────────────────────────┐
│ SECRET: NOME_DO_CAMPO                   │
│ Cole o valor e responda esta mensagem:  │
└─────────────────────────────────────────┘
```

- Cole o valor na resposta — Claude salva e passa para o próximo
- Campos já preenchidos são preservados silenciosamente
- O valor nunca é repetido na conversa após salvo

**Campos em `/root/.pap-secrets`:**
```
GMAIL_ACCOUNT        → luddlocke@gmail.com
GMAIL_APP_PASSWORD   → senha de 16 chars (Google App Password)
OPENAI_API_KEY       → sk-...
AI_API_KEY           → chave para /api/ai/* (você define)
DATABASE_URL         → postgresql://... (Neon)
SESSION_SECRET       → string aleatória longa
DB_API_KEY           → chave do banco compartilhado de IAs
```

## Ao digitar `#fim`

1. Atualizar `MAPA.md` — seções: Pendências, Estado da Infraestrutura, Histórico de Sessões
2. Atualizar `PSEUDO.md` — adicionar entrada no histórico; atualizar fluxograma/wireframe se houve mudanças de UX
3. Atualizar `PSEUDO2.md` — se houve mudanças em lógica ou fluxo de código
4. Rodar sync completo: `pap-sync` — sincroniza assembleias (Gmail) + extrai insights de MAPA/PSEUDO/PSEUDO2 → `APRENDIZADO.md` + `IDEIAS.md`
5. Revisar `IDEIAS.md` — marcar ideias implementadas como Aprovada ✅; adicionar novas ideias
6. Resumir o que foi feito

---

## Arquivos do projeto

| Arquivo | Conteúdo |
|---|---|
| `MAPA.md` | Arquitetura, stack, rotas, DB, pendências, gotchas |
| `PSEUDO.md` | Histórico de sessões, fluxograma, wireframe |
| `PSEUDO2.md` | Pseudocódigo dos principais fluxos |
| `APRENDIZADO.md` | 526 insights extraídos de 424 assembleias de IAs — relevantes ao PAP |
| `IDEIAS.md` | 31 ideias de programação derivadas do APRENDIZADO; atualizar ao `#fim` |
| `scripts/sync-assembleias.py` | Sync incremental Gmail → APRENDIZADO.md (chamado por `pap-sync`) |
| `scripts/learn-from-docs.py` | Extrai insights de MAPA/PSEUDO/PSEUDO2 → APRENDIZADO.md + IDEIAS.md |
| `replit.md` | Documentação técnica legada (referência) |

---

## Contexto rápido

- **Produto:** Plataforma educacional gamificada para FUVEST 2026 (estilo cockpit espacial)
- **Stack:** React + Vite → Vercel · Express 5 → Fly.io · PostgreSQL → Neon
- **Repo:** `github.com/yurituccieterovic-cell/Site-ST` (branch `main`)
- **Domínio alvo:** `pap.sociedadetucci.com.br`
- **Pasta local:** `/root/Site-ST/aliancapanorama-src/`
- **Regra de custo:** tudo gratuito por padrão — pagar só com aprovação explícita de Yuri

---

## Sistema de Voz (`voz`)

Transcrição de fala para texto dentro do Claude Code, usando o mesmo STT do Perplexity (Google Android).

**Pré-requisitos (uma vez só):**
1. Instale o app **Termux:API** do F-Droid (mesma fonte do Termux)
2. No Termux (não no Claude): `pkg install termux-api`

**Como usar:**
```
! voz
```
Aparece o diálogo de voz do Android → fale → texto é transcrito, copiado para clipboard e exibido no Claude Code como output do comando.

**Script:** `/root/bin/voz`

---

## Pendências prioritárias (resumo)

1. Criar conta Neon → `DATABASE_URL`
2. Deploy Fly.io (`pap-api`, região gru/SP)
3. DNS `pap.sociedadetucci.com.br`
4. Obter `OPENAI_API_KEY`
5. Gmail IMAP + App Password (`luddlocke@gmail.com`) para memórias da assembleia de IAs

> Para detalhes completos, ver `MAPA.md` seção 17.
