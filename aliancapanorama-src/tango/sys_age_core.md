# sys_age_core.md — Sistema Age (Agenda Médica/Psicológica)
### Criado: 2026-08-27 · Sessão Age-0

## Identidade

**Age** = sistema de agenda e controle de pacientes para profissionais de saúde da Sociedade Tucci.
**SABIÁ** = IA assistente do Age (fusão Cana + ISA + DODGE). Sempre presente, sábia, cuidadosa.
**Mayumi Tanimoto** = gestora administrativa do Age (confirmado 2026-09-08). Cuida de pacientes, pagamentos, suporte às profissionais e faturamento. Remuneração: % do faturamento mensal.

## Usuárias atuais

| Slug | Nome | Tipo | Cor | Status |
|---|---|---|---|---|
| `lisange` | Lisange | psicóloga | teal `#2dd4bf` | ✅ seedada · 72 slots ativos · email: lisange.usp@gmail.com |
| `susana` | Suzana | médica | lilás `#a78bfa` | ✅ seedada · 195 slots ativos (online seg-sex) · email: vitamind@ginsbergeye.com |

- Senha padrão: `age2026` (trocar no primeiro acesso)
- Emails configurados via SQL direto Neon em 2026-09-10 (S122b)

## Equipe

| Pessoa | Papel | Status |
|---|---|---|
| Yuri Tuccieterovic | fundador / arquiteto | ativo |
| Mayumi Tanimoto | gestora administrativa | ✅ confirmada 2026-09-08 |
| Lisange | profissional médica | ativa |
| Suzana | profissional psicóloga | ativa |

## URLs

| | URL |
|---|---|
| Agenda Lisange | `site-st.vercel.app/aliancapanorama/age/lisange` |
| Agenda Susana | `site-st.vercel.app/aliancapanorama/age/susana` |
| Futuro (domínio) | `sociedadetucci.com.br/age/[slug]` |

## Arquitetura

```
schema/age.ts              ← 6 tabelas: professionals, availability_rules, appointments, sabia_memory, patients, exceptions
routes/age.ts              ← auth + agenda + exceções + SABIÁ (40+ endpoints)
pages/AgePage.tsx          ← React: booking público + painel profissional + chat SABIÁ
lib/db/schema/index.ts     ← exporta age schema
bootstrap.ts               ← ensureAgeTables() + seed Lisange+Susana
vercel.json                ← /age/* → index.html
public/age-logo.png        ← logo oficial (calendário teal/azul petróleo, fundo transparente)
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
- [x] Identidade visual — logo Age: `public/age-logo.png` ✅ 2026-08-27
- [x] I550+I551+I557: Cadastro paciente + confirmação email + aba Pacientes ✅ 2026-08-27
- [x] Fase 2 — Cancelamento + reagendamento por token ✅ 2026-08-29 (commit 4be1723)
- [x] Fase 3 — Área do paciente com login ✅ 2026-08-29 (commit 9c0471d)
- [ ] I552: Confirmações e lembretes automáticos por email (48h/24h) — Fase 6
- [ ] I553: Feed Age operacional (log de eventos)
- [ ] I554: SABIÁ popup flutuante persistente
- [ ] I558: Confirmação Sim/Não para ações irreversíveis
- [ ] I564: Link de convite para pré-aprovação de paciente
- [ ] Compliance LGPD: Política de Privacidade + ToS + checkbox consentimento (necessário antes de vender)
- [ ] Landing page comercial + formulário de interesse (aguarda decisão Assembleia sobre posicionamento)
- [ ] Fase 4 — Documentos (anamnese, contratos, anexos)
- [ ] Fase 5 — Pagamentos no agendamento (Stripe/PayPal)
- [ ] Fase 6 — Emails completos (lembretes 48h/24h + retorno)
- [ ] Fase 7 — PWA + Google Agenda
- [ ] I719: Painel Mayumi (gestora) — rota /age/admin, visão unificada das duas profissionais, aprovações e ações de gestão (próxima funcionalidade, Rodada 7)
- [ ] I720: Aprovação automática de pacientes — pré-requisitos configuráveis; quando cumpridos → APROVADO automático (proposta Mayumi, Rodada 7)
- [ ] I721: PWA iOS — meta tags apple-mobile-web-app em todas as páginas (Yuri mandou print do iOS, pendente)
- [ ] I722: Fix Jasmim — pergunta antes da resposta da IA (bug confirmado Yuri)
- [ ] I723: Fix Jasmim — copiar pergunta+resposta não funciona (bug confirmado Mayumi)
- [ ] Decisão pagamento: modelo A (paga na reserva) / B (paga após aprovação) / C (profissional escolhe) — Mayumi decide

## Equipe atualizada (2026-09-09)

| Pessoa | Papel | Status |
|---|---|---|
| Yuri Tuccieterovic | fundador / arquiteto | ativo |
| Mayumi Tanimoto | gestora administrativa | ✅ confirmada 2026-09-08, iniciando |
| Lisange | profissional médica | ativa (senha: age2026 — trocar) |
| Suzana | profissional psicóloga | ativa (senha: age2026 — trocar) |

## Como carregar contexto (#age)

```
1. Ler sys_age_core.md (este arquivo)
2. Verificar se profissionais existem: GET /api/age/lisange + /api/age/susana
3. Checar MAPA-PENDENCIAS.md itens 205-210
4. Confirmar contexto e começar
```
