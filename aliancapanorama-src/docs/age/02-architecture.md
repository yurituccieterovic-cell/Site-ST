# Age — Arquitetura Técnica

**Atualizado:** 2026-09-19

## Stack

- **Frontend:** React + Vite → Vercel (site-st.vercel.app)
- **Backend:** Express 5 + Drizzle → Render (site-st.onrender.com)
- **Banco:** PostgreSQL → Neon (sa-east-1)
- **Autenticação:** IP Challenge (comparação IP do profissional vs IP de acesso)
- **Email:** nodemailer via Gmail (luddlocke@gmail.com)

## Tabelas no Neon

```sql
age_professionals  — slug, nome, email, cor, senha_hash, ip_autorizado
age_appointments   — id, slug_profissional, paciente, horario, tipo, status
age_bloqueios      — id, slug_profissional, inicio, fim, motivo
age_mensalidades   — (planejado) para tracking de cobrança Stripe
```

## Rotas API

```
GET  /api/age/:slug              — perfil + disponibilidade pública
POST /api/age/:slug/agendar      — criar agendamento (público)
GET  /api/age/:slug/painel       — view privada do profissional (IP auth)
POST /api/age/:slug/bloquear     — bloquear horário (IP auth)
GET  /api/age/admin              — painel Mayumi (BRIDGE_SECRET auth)
```

## Limitações de rate

- 20 req / 15 min por IP nas rotas públicas de agendamento
- Sem rate limiting nas rotas de painel (IP check já filtra)
