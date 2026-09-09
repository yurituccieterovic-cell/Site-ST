# SABIÁ — Política de Dados de Saúde
*Versão 1.0 · 2026-09-09 · #293 · Referência: CFP 11/2018, LGPD (Lei 13.709/2018)*

---

## O que SABIÁ pode acessar

### ✅ Dados PERMITIDOS
| Dado | Justificativa | Retenção |
|------|--------------|----------|
| Histórico de consultas (data, duração, status) | Continuidade do cuidado | Indefinido (arquivo clínico) |
| Preferências de comunicação (dia, horário preferido) | UX personalizada | Indefinido |
| Forma de pagamento escolhida pelo paciente | Operacional | Até última consulta + 5 anos |
| Semáforo de frequência (verde/amarelo/vermelho) | Alerta de cuidado | Calculado em tempo real, não armazenado |
| Contagem de faltas (faltou90d) | Contexto clínico — aprovado pelo profissional | Calculado, não separado |
| Memória de preferências (sabia_memory) | Personalização da IA | Até solicitação de exclusão |

### ❌ Dados VEDADOS
| Dado | Razão |
|------|-------|
| Diagnósticos clínicos | Exclusividade do prontuário profissional (CFP 11/2018 art. 5) |
| Medicações prescritas | Exclusividade médica / CRM |
| Conteúdo das sessões (o que foi falado) | Sigilo profissional absoluto |
| Dados biométricos | Não coletados pelo sistema |
| Dados de terceiros mencionados pelo paciente | LGPD art. 7 — sem consentimento de terceiros |
| Cruzamento de dados entre profissionais | Compartilhamento entre profissionais vedado sem consentimento |

---

## Por quanto tempo

| Tipo de dado | Retenção |
|-------------|---------|
| Preferências SABIÁ (sabia_memory) | Indefinido + direito de exclusão a qualquer momento |
| Histórico de consultas | Mínimo 20 anos (CFM 1.821/2007 para registros de saúde) |
| Dados de pagamento | 5 anos após última transação (lei fiscal) |
| Logs de acesso ao sistema | 6 meses |
| Semáforo calculado | Não armazenado — calculado ao carregar a tela |

---

## Com consentimento de quem

| Situação | Consentimento necessário |
|----------|------------------------|
| SABIÁ acessa histórico de consultas | Consentimento no cadastro (checkbox LGPD) |
| SABIÁ aprende preferências do paciente | Consentimento explícito + opção de opt-out |
| SABIÁ envia mensagem pro paciente | Consentimento WhatsApp (checkbox LGPD #242) |
| Profissional vê memória SABIÁ do paciente | Implícito (relação terapêutica) |
| Sistema exporta dados para relatório | Consentimento explícito do paciente |

---

## Limites da IA

SABIÁ NÃO pode:
- Inferir diagnóstico a partir de padrões de frequência
- Compartilhar dados entre diferentes profissionais sem consentimento explícito
- Armazenar transcrições de conversas entre paciente e profissional
- Fazer recomendações terapêuticas (apenas logísticas e de agendamento)
- Usar dados de um paciente para treinar modelos fora do ecossistema

---

## Direitos do paciente

O paciente pode a qualquer momento:
1. **Ver** o que a SABIÁ tem registrado sobre ele (endpoint futuro: GET /age/:slug/me/sabia)
2. **Excluir** memórias da SABIÁ (endpoint futuro: DELETE /age/:slug/me/sabia)
3. **Opt-out** de personalização mantendo acesso ao agendamento
4. **Exportar** seus dados (LGPD art. 18)

---

## Responsabilidade

- **Responsável técnico:** Sociedade Tucci (controlador de dados)
- **Responsável pelo uso clínico:** profissional de saúde (Lisange / Suzana / futuros)
- **DPO (Data Protection Officer):** a definir — recomendado antes de ativar Bloco 3
- **Contato para exercício de direitos:** a definir (email @sociedadetucci.com.br — #280)

---

## Referências
- CFP nº 11/2018 — Código de Ética do Psicólogo
- LGPD — Lei 13.709/2018 (especialmente arts. 7, 11, 16, 18)
- CFM 1.821/2007 — guarda de prontuários médicos
- Assembleia #638 — decisão: SABIÁ armazena só preferências admin, não padrões comportamentais

---

*#293 · Política SABIÁ · Sociedade Tucci · 2026-09-09*
*Revisão obrigatória antes de ativar pagamentos (Bloco 3) ou atender pacientes em larga escala.*
