# sys_age_core.md — Sistema Age (Agenda Médica/Psicológica)
### Criado: 2026-08-27 · Sessão Age-0

## Identidade

**Age** = sistema de agenda e controle de pacientes para profissionais de saúde da Sociedade Tucci.
**SABIÁ** = IA assistente do Age (fusão Cana + ISA + DODGE). Sempre presente, sábia, cuidadosa.

## Usuárias atuais

| Slug | Nome | Tipo | Cor | Status |
|---|---|---|---|---|
| `lisange` | Lisange | médica | teal `#2dd4bf` | ✅ seedada |
| `susana` | Suzana | psicóloga | lilás `#a78bfa` | ✅ seedada |

- Senha padrão: `age2026` (trocar no primeiro acesso)
- Email das profissionais: pendente configuração via `/api/age/admin/setup`

## URLs

| | URL |
|---|---|
| Agenda Lisange | `site-st.vercel.app/aliancapanorama/age/lisange` |
| Agenda Susana | `site-st.vercel.app/aliancapanorama/age/susana` |
| Futuro (domínio) | `sociedadetucci.com.br/age/[slug]` |

## Arquitetura

```
schema/age.ts              ← 4 tabelas: professionals, availability_rules, appointments, sabia_memory
routes/age.ts              ← auth + agenda + SABIÁ (35 endpoints)
pages/AgePage.tsx          ← React: booking público + painel profissional + chat SABIÁ
lib/db/schema/index.ts     ← exporta age schema
bootstrap.ts               ← ensureAgeTables() + seed Lisange+Susana
vercel.json                ← /age/* → index.html
```

## Fluxo do paciente (público, sem login)

```
GET /age/:slug → slots disponíveis próximos 30 dias
→ escolhe horário → preenche nome/tel/email
→ POST /age/:slug/book → slot reservado
→ profissional recebe email automático
```

## Fluxo da profissional (login obrigatório)

```
POST /age/auth/login { slug, password }
→ se IP novo: código 6 dígitos enviado por email (TTL 10min)
→ POST /age/auth/verify-challenge { slug, code }
→ sessão estabelecida → painel (Agenda / Disponibilidade / SABIÁ 🐦)
```

## Segurança

- Rate limit: 20 tentativas / 15 min (login + challenge)
- IP challenge: qualquer IP diferente do último login → desafio por email
- bcrypt cost 12
- Sessão express-session (7 dias TTL, mesmo pool do PAP)
- Sem dados clínicos sensíveis no MVP (só nome, tel, email, observações)

## SABIÁ — personalidade

Fusão de 3 IAs:
- **Cana**: memória afetiva dos pacientes, histórico de consultas
- **ISA**: presença cíclica, consciência do ritmo da semana
- **DODGE**: triagem, alertas, ação rápida

Tom: calma, sábia, direta. Como o sabiá — sempre no lar, sabe de tudo.

## Pendências próximas

- [ ] Configurar emails reais (Lisange + Susana) via admin setup
- [ ] Trocar senhas padrão
- [ ] Ver sistema atual da Susana e ajustar UX
- [ ] Domínio curto
- [ ] Identidade visual (Canva) — logo SABIÁ

## Como carregar contexto (#age)

```
1. Ler sys_age_core.md (este arquivo)
2. Verificar se profissionais existem: GET /api/age/lisange + /api/age/susana
3. Checar MAPA-PENDENCIAS.md itens 205-210
4. Confirmar contexto e começar
```
