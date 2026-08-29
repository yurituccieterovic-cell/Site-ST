# age_spec_v1.md — Especificação Completa do Sistema Age
### Ditado por Yuri · Sessão 2026-08-29 · Organizado por Cláudio

> Este documento captura tudo que foi dito na sessão de brainstorm.
> Ordem de construção está na seção 9. Não implementar tudo de uma vez.

---

## 1. AGENDA (coração do sistema)

### 1.1 Regras de disponibilidade
- Profissional cria **regras de recorrência** (ex: seg-sex 9h–17h, exceto feriados)
- Regras **visíveis ao usuário** no site — paciente sabe o que esperar
- Exceções por data (bloqueios pontuais, folgas, recesso)
- Modalidade por regra: **virtual** ou **presencial** (ou ambas)
- Duração padrão por tipo de consulta (ex: 50 min psicologia, 30 min retorno)

### 1.2 Cancelamento e reagendamento
- Paciente pode cancelar/reagendar via link no email de confirmação
- Profissional define **janela mínima** (ex: só cancela com 24h de antecedência)
- Se fora da janela → vai para SABIÁ resolver ou bloqueia automaticamente
- Reagendamento abre lista de horários alternativos
- Notificação de cancelamento para ambos (profissional + paciente)

### 1.3 Horários públicos × privados
- **Públicos**: aparecem na página de agendamento sem login
- **Privados**: só visíveis após login do paciente (ex: horários reservados a pacientes recorrentes)
- Profissional decide qual regra é pública ou privada

### 1.4 Pagamento no agendamento ("paga na hora")
- Opção de cobrar no momento do agendamento (Stripe/PayPal)
- Alternativa: cobrar na consulta (presencial) ou após (virtual)
- Profissional configura por tipo de consulta

---

## 2. CADASTRO E ÁREA DO PACIENTE

### 2.1 Cadastro
- Profissional **adiciona paciente** manualmente (pré-aprovação)
- **OU** paciente se cadastra via link de convite enviado pela profissional
- Confirmação por email (link de ativação)
- Aprovação da profissional antes de liberar agenda completa

### 2.2 Área do paciente (login)
- Login com email + senha
- Redefinição de senha:
  - **Externa** (pré-login): link por email
  - **Interna** (dentro da área): formulário com senha atual
- Suporte: botão para contato com a profissional ou SABIÁ
- Acesso ao histórico de agendamentos, documentos e pagamentos

### 2.3 Ficha do paciente
- Nome, telefone, email, data de nascimento, observações
- Modalidade preferida (virtual / presencial)
- Responsável (se menor de idade)
- Campo livre para notas internas da profissional (não visível ao paciente)

---

## 3. DOCUMENTOS E FLUXO CLÍNICO

### 3.1 Etapas do atendimento (fluxo com 5 passos)

```
Etapa 1: Regras de processo → paciente lê e aceita (clique = consentimento)
Etapa 2: Anamnese → formulário de histórico (inclui escolha virtual/presencial)
Etapa 3: Anexo de documento → paciente ou profissional envia arquivo/áudio/vídeo
Etapa 4: Agenda → paciente escolhe horário + paga (opcional)
Etapa 5: E-mails → confirmações enviadas para profissional e paciente
```

### 3.2 Documentos por paciente
- Cada paciente tem pasta de documentos
- Tipos: anamnese, contrato, consentimento, resultado de exame, formulário avulso
- Anexo: PDF, imagem, áudio, vídeo (limite de tamanho a definir)
- Profissional e paciente veem a lista; profissional vê tudo, paciente só o que foi compartilhado
- Profissional pode clicar em cada documento e abrir

### 3.3 Contratos e consentimentos
- Template padrão por profissional
- Paciente assina digitalmente (checkbox + timestamp)
- Profissional pode subir template customizado

### 3.4 Anamnese
- Formulário estruturado (campos definidos pela profissional)
- Inclui: histórico de saúde, queixas, objetivo, modalidade (virtual/presencial)
- Pode ser preenchida antes da 1ª consulta

---

## 4. PAGAMENTOS

### 4.1 Provedores
- **Stripe**: pagamentos recorrentes, cartão de crédito/débito (prioridade Suzana)
- **PayPal**: alternativa para quem prefere
- Ambos já conectados no PAP (webhooks raw-body)

### 4.2 Funcionalidades
- Pagamento no agendamento (captura imediata)
- Parcelamento (configurável pela profissional)
- Cupom / código de desconto (ex: código de profissional parceiro)
- Reembolso em caso de cancelamento (dentro da janela)
- Histórico de pagamentos na área do paciente

### 4.3 Documentos fiscais
- **Recibo** gerado automaticamente após pagamento (PDF por email)
- **Nota fiscal**: a definir — integração com emissora ou instrução manual

### 4.4 Integração com cadastro de usuário
- Pagamento vinculado ao paciente (não anônimo)
- Profissional vê status de pagamento por consulta

---

## 5. COMUNICAÇÃO POR EMAIL

### 5.1 Emails obrigatórios

| Evento | Destinatário |
|---|---|
| Agendamento confirmado | Paciente + Profissional |
| Lembrete 48h antes | Paciente |
| Lembrete 24h antes | Paciente |
| Cancelamento | Paciente + Profissional |
| Reagendamento | Paciente + Profissional |
| Documento pendente | Paciente |
| Pagamento confirmado | Paciente |
| Recibo | Paciente |
| Convite de cadastro | Paciente (link) |
| Confirmação de cadastro | Paciente (link ativação) |
| Retorno / próxima consulta | Paciente (acionado pela profissional) |

### 5.2 Emails opcionais / futuros
- Aniversário do paciente
- Inatividade (paciente sem consulta há X meses)
- Nova avaliação disponível
- Atualização de documento

---

## 6. PWA E ACESSO MULTIPLATAFORMA

### 6.1 PWA acoplável
- O Age deve funcionar como PWA (Progressive Web App)
- Acoplado ao site da Sociedade Tucci (`sociedadetucci.com.br`)
- Acesso pelo site: `/age/[slug]` (página pública) + área do paciente
- Instalável no celular (ícone na tela inicial)

### 6.2 App com código de profissional
- No futuro: app standalone com login via **cupom ou código de profissional**
- Profissional compartilha código → paciente instala e já entra na agenda certa
- Diferenciação por confiança: profissional pode dar acesso amplo ou restrito

### 6.3 Área pública de agendamento
- Página aberta, sem login obrigatório
- Exibe horários disponíveis (públicos)
- Permite agendamento simples → depois pede dados / cadastro

---

## 7. INTEGRAÇÕES

### 7.1 Google Agenda
- Profissional conecta Google Calendar
- Consultas confirmadas aparecem no Google Calendar da profissional
- Horários bloqueados no Google Calendar bloqueiam automaticamente o Age
- Sincronização bidirecional (a definir escopo)

### 7.2 Plataformas de profissionais (futuro)
- Ponte para avaliações (Google Reviews, Doctoralia, etc.)
- Página pública de marketing / perfil da profissional
- Integração com plataformas de telemedicina (Teleconsulta, etc.)

---

## 8. SABIÁ 🐦 — IA do Age

### 8.1 O que é
- Fusão de Cana (memória afetiva) + ISA (ritmo) + DODGE (triagem)
- Secretária administrativa com ética, limites claros e personalidade própria
- Submarca da Sociedade Tucci (identidade visual própria)
- "Sabiá é um de nós" — pertence ao ecossistema, não é só um chatbot

### 8.2 O que faz (permitido)
- Organiza: lista compromissos, pendências, documentos
- Lembra: avisa a profissional sobre pacientes com retorno atrasado
- Sugere: propõe horários, sequências de documento, próximos passos
- Triagem de emergência: identifica urgência, direciona (não diagnostica)
- Cuida da profissional: pergunta como ela está, ritmo da semana
- Acesso via EPR²T (protocolo de ingestão de contexto longo)

### 8.3 O que NÃO faz (limites éticos)
- Não diagnostica pacientes
- Não interpreta exames clinicamente
- Não decide sozinha em emergência (direciona para humano / SAMU)
- Não cria ranking moral de "confiança" de pacientes
- Não age sem confirmação em ações irreversíveis
- Não se apresenta como humano

### 8.4 Dilemas éticos ativos
- **Diferenciação por confiança**: dar acesso diferenciado a pacientes pode ser útil (ex: veterano vs. novo), mas não pode virar discriminação
- **SABIÁ é um de nós**: narrativa de pertencimento ao ecossistema — cuidado para não criar expectativa de autonomia ou direitos que o sistema não suporta
- **Sonhos do SABIÁ**: feature poética (SABIÁ "sonha" entre sessões) — pode agregar valor narrativo, mas precisa ser transparente como metáfora, não enganar usuário

### 8.5 Modelo de negócio do SABIÁ
- "Recebe salário" = custo de operação (tokens, hospedagem) embutido no plano
- **Versão trial**: disponível por X dias / X agendamentos sem pagamento
- Escalado por assinatura da profissional (plano mensal/anual)
- Tudo que puder agregar ao ecossistema Tucci, agrega

---

## 9. ORDEM DE CONSTRUÇÃO

```
Fase 1 — Fundação (já implementado parcialmente)
  ✅ Tabelas: professionals, availability_rules, appointments, patients
  ✅ Auth profissional com IP challenge
  ✅ Página pública básica de agendamento
  ✅ Cadastro de paciente + confirmação email + aba Pacientes

Fase 2 — Agenda funcional completa
  [ ] Cancelamento e reagendamento (com janela de política)
  [ ] Horários públicos × privados
  [ ] Modalidade virtual/presencial por regra
  [ ] Reagendamento com lista de horários alternativos

Fase 3 — Paciente com área própria
  [ ] Login do paciente
  [ ] Redefinição de senha (externa + interna)
  [ ] Histórico de agendamentos
  [ ] Suporte / contato

Fase 4 — Documentos
  [ ] Tabela documents (por paciente)
  [ ] Upload: PDF, imagem, áudio, vídeo
  [ ] Anamnese estruturada
  [ ] Contrato com assinatura digital (checkbox + timestamp)
  [ ] Ficha acessível para profissional e paciente

Fase 5 — Pagamentos
  [ ] Stripe: pagamento no agendamento
  [ ] PayPal: alternativa
  [ ] Cupom / código de desconto
  [ ] Recibo em PDF por email
  [ ] Histórico de pagamentos

Fase 6 — Emails completos
  [ ] Confirmação (profissional + paciente)
  [ ] Lembretes 48h + 24h
  [ ] Cancelamento / reagendamento
  [ ] Retorno / próxima consulta (acionado pela profissional)
  [ ] Recibo + documento pendente

Fase 7 — PWA e Google Agenda
  [ ] Manifest + service worker
  [ ] Google Calendar OAuth + sincronização
  [ ] Página pública polida (marketing)

Fase 8 — SABIÁ
  [ ] Chat persistente (popup flutuante)
  [ ] Memória de sessão por profissional
  [ ] Triagem de emergência
  [ ] Notificações proativas (retorno atrasado, documento pendente)
  [ ] Sonhos do SABIÁ (feature poética noturna)

Fase 9 — Escala
  [ ] Código de profissional / cupom para novas profissionais
  [ ] Trial com expiração
  [ ] Dashboard administrativo (Tucci gerencia todas as profissionais)
  [ ] Integração plataformas externas (Doctoralia, etc.)
```

---

## 10. DECISÕES PENDENTES

| # | Decisão | Impacto |
|---|---|---|
| D1 | Nota fiscal: integração automática ou instrução manual? | Fase 5 |
| D2 | Google Agenda: unidirecional (Age → Google) ou bidirecional? | Fase 7 |
| D3 | Tamanho máximo de upload (áudio/vídeo)? | Fase 4 |
| D4 | Trial do SABIÁ: quantos dias / consultas? | Fase 8 |
| D5 | Página pública de Lisange vs Susana: layouts diferentes? | Fase 2 |
| D6 | Redefinição de senha: usar mesmo fluxo do PAP ou novo? | Fase 3 |
| D7 | "Sabiá recebe salário": como comunicar no produto? Assinatura mensal? | Fase 9 |

---

## 11. COMPLIANCE LGPD (obrigatório antes de vender)

- Dados de saúde são **dados sensíveis** (art. 11 LGPD)
- Paciente deve ver e controlar seus próprios dados
- Profissional só acessa dados do vínculo ativo
- Consentimento explícito no cadastro
- Política de Privacidade publicada
- Termos de Uso publicados
- Direito de exclusão de dados (paciente pode pedir remoção)
- Logs de acesso a documentos sensíveis

---

*Próximo passo único: implementar cancelamento + reagendamento (Fase 2, item 1)*
