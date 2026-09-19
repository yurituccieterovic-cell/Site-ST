# Age — Mapa de Reuso (o que já existe no ecossistema)

**Atualizado:** 2026-09-19

## Infraestrutura compartilhada com PAP

| Recurso | Onde | Como o Age usa |
|---------|------|----------------|
| Neon PostgreSQL | neondb_owner@ep-late-pond... | Schema separado, mesma instância |
| Render API server | site-st.onrender.com | Mesmo processo Express; rotas /api/age/* |
| Vercel Frontend | site-st.vercel.app | Mesma build; páginas /age/* |
| BRIDGE_SECRET | .pap-secrets | Autenticação do painel Mayumi |
| nodemailer Gmail | luddlocke@gmail.com | Confirmações + notificações |
| Stripe (PAP) | stripe.ts | NÃO reusa — Age precisa produto BRL separado |

## O que o Age tem de próprio

- Tabelas age_* (não compartilha com PAP)
- IP auth (PAP não usa)
- SABIÁ 🐦 (IA exclusiva do Age)
- Cores por profissional (design system Age)
