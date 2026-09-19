# Mapa de Capacidades do Ecossistema — Sociedade Tucci

**Versão:** 1.0 · **Criado:** 2026-09-19 · **Framework:** Assembleia #692 / MIT Report

> Anti-monumento check: cada projeto responde PARA QUEM? RESOLVE O QUÊ? COMO MOSTRAMOS? COMO ENTREGAMOS? COMO COBRAMOS?

---

## Estado comercial de cada projeto

```
IDEIA → HIPÓTESE → PROTÓTIPO → EXPERIMENTO → VALIDANDO → OFERTA → PROPOSTA → WON → DELIVERING → DELIVERED → RECURRING → ARQUIVADO
```

---

## 1. PAP — Plataforma Aliança Panorama

| Campo | Valor |
|-------|-------|
| **Estado comercial** | DELIVERING / VALIDANDO |
| **Para quem** | Estudantes FUVEST do ensino médio |
| **Resolve o quê** | Preparação gamificada, acompanhamento por IA, trilha personalizada |
| **Como mostramos** | Site + demo ao vivo |
| **Como entregamos** | SaaS web (React + Express + Neon) |
| **Como cobramos** | Stripe (planos via plans recorrentes) — CONFIGURADO mas validação de alunos pagantes pendente |
| **Evidência de valor** | Plataforma funcionando, alunos potenciais em espera |
| **Próximo passo** | 1 aluno real pagando (validação de hipótese) |
| **Anti-monumento** | Quantos alunos ativos existem hoje? → confirmar com Yuri |

---

## 2. Age — Agenda Médica/Psicológica com IA

| Campo | Valor |
|-------|-------|
| **Estado comercial** | DELIVERING (profissionais ativas) / VALIDANDO (cobrança pendente) |
| **Para quem** | Profissionais de saúde independentes (psicólogas, médicas, terapeutas) |
| **Resolve o quê** | Agenda online, confirmações automáticas, redução de no-show, IA como assistente clínica |
| **Como mostramos** | Demo com Lisange/Suzana + painel Mayumi |
| **Como entregamos** | SaaS web (mesma stack PAP) |
| **Como cobramos** | Stripe BRL recorrente por profissional (I842, pendente) — planos Broto/Raiz/Copa |
| **Evidência de valor** | 2 profissionais ativas, slots preenchidos |
| **Próximo passo** | Stripe Age + reunião Lisange (resultado) |
| **Anti-monumento** | Quantos agendamentos reais foram feitos? Profissionais vão recomendar? |

---

## 3. Rapadura — Motor de Inteligência Patrimonial

| Campo | Valor |
|-------|-------|
| **Estado comercial** | RECURRING (uso privado Yuri+Mayumi) |
| **Para quem** | Yuri e Mayumi (privado — não é produto público ainda) |
| **Resolve o quê** | Score de fundos de investimento, simulações, governança patrimonial conjunta |
| **Como entregamos** | App web privado (rapadura.html + API) |
| **Como cobramos** | Não cobra — uso pessoal; hipótese futura de B2C/B2B |
| **Evidência de valor** | Yuri e Mayumi usam regularmente |
| **Próximo passo** | Definir se/quando abrir para terceiros |
| **Anti-monumento** | Decisões patrimoniais reais tomadas com o Rapadura? |

---

## 4. Projectification / PV — Árvore de Projetos

| Campo | Valor |
|-------|-------|
| **Estado comercial** | PROTÓTIPO (schema validado, código pendente) |
| **Para quem** | Yuri (uso próprio para gestão de projetos); potencial uso de equipe |
| **Resolve o quê** | Visão unificada de todos os projetos em 3 lentes (calendário, kanban, dependências) |
| **Como entregamos** | SaaS web (mesma stack PAP) — ainda não implementado |
| **Como cobramos** | Uso interno primeiro; hipótese de produto futuro |
| **Evidência de valor** | Assembleia validou schema, arqueologia feita |
| **Próximo passo** | Implementar MVP 3 lentes |
| **Anti-monumento** | Se o MVP rodar 30 dias sem Yuri usar, repensar |

---

## 5. Jasmim / MYYM — Feed de IA Social

| Campo | Valor |
|-------|-------|
| **Estado comercial** | EXPERIMENTO (live, usada por Yuri) |
| **Para quem** | Yuri (notas, brainstorm, perguntas para as IAs) |
| **Resolve o quê** | Feed social com IA respondendo em 4 tipos (nota/pergunta/myym/auto) |
| **Como entregamos** | Feature do PAP (/jasmim) |
| **Como cobramos** | Não cobra — feature de engajamento interno |
| **Evidência de valor** | Yuri usa para capturar insights e fazer perguntas às IAs |
| **Próximo passo** | ISCA 4 sub-IAs ativas em produção |

---

## 6. ARPIA / Conselho do Artesão

| Campo | Valor |
|-------|-------|
| **Estado comercial** | EXPERIMENTO (Artesão+Ajudante ADK, Studio live) |
| **Para quem** | Yuri (consultoria estratégica via crew de IAs) |
| **Resolve o quê** | Deliberação multiagente sobre decisões complexas |
| **Como cobramos** | Não cobra — uso próprio |
| **Próximo passo** | Integração com #692: Artesão como camada de validação de oportunidades |

---

## 7. Assembleia RODAR — 22 Vozes

| Campo | Valor |
|-------|-------|
| **Estado comercial** | DELIVERING (usado regularmente por Yuri) |
| **Para quem** | Yuri (deliberação, síntese, processamento de ideias) |
| **Resolve o quê** | Assembleia de 22 vozes de IA que processa cada input do Yuri com perspectivas múltiplas |
| **Host atual** | Replit (risco: 30/09 deadline) |
| **Próximo passo** | Migrar para Render + Neon antes de 30/09 |
| **Anti-monumento** | Este é o coração operacional do ecossistema — não é monumento, é infraestrutura crítica |

---

## Respostas diretas às perguntas MIT #692

### Para quem é o ecossistema?

| Camada | Público | Projeto |
|--------|---------|---------|
| B2C educação | Estudantes FUVEST | PAP |
| B2B saúde | Profissionais independentes | Age |
| Privado | Yuri + Mayumi | Rapadura |
| Interno | Yuri (ferramenta de trabalho) | Jasmim, Projectification, ARPIA, RODAR |

### O que ainda é hipótese (não provado)?

- PAP: alunos vão pagar
- Age: profissionais vão recomendar + renovar
- Rapadura como produto público
- Projectification como produto

### O que está provado?

- Assembleia RODAR: Yuri usa toda semana e gera insights acionáveis
- Age: profissionais ativas, agendamentos acontecendo
- Jasmim: Yuri captura ideias regularmente
- Rapadura: Yuri e Mayumi usam para decisões patrimoniais reais


---

## Reality Board — Especificação (I832 expandido, RESULTADO #692 seção 15)

```
REALITY BOARD — Ecossistema Sociedade Tucci

Ideias registradas           I8XX+    (IDEIAS.md)
Hipóteses ativas              ---
Experimentos em curso         ---
Ofertas formalizadas          ---
Clientes potenciais (Age)     ---
Propostas enviadas            ---
Vendas confirmadas            0        ← meta: 1 Age + 1 PAP
Clientes ativos pagantes      0        ← meta validação
Receita mensal                R$ 0     ← meta: R$ 300+ até dez/2026
Recorrência confirmada        0
Aprendizados documentados    A6XXX+   (APRENDIZADO-INDICE.md)
```

**Métricas de produto (quando disponíveis):**
- Utilização: agendamentos/semana (Age), logins/semana (PAP)
- Ativação: % usuários que completam primeira ação chave
- Conclusão: % que atingem resultado desejado
- Custo de entrega: horas Cláudio + infra gratuita

**Métricas de aprendizado:**
- Hipótese confirmada: evidência > suposição
- Hipótese refutada: o que achávamos que era verdade, não é
- Hipótese inconclusiva: precisamos de mais dados
