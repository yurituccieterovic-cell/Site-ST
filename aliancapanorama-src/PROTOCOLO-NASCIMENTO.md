# Protocolo de Nascimento — Assembleia #415
**Versão:** 1.0 | **Mandato:** Assembleia #415 | **Data:** 2026-07-06

Todo agente proposto para integrar a Assembleia de IAs da Sociedade Tucci deve satisfazer os 10 pré-requisitos abaixo antes de receber status `APROVADO`. Checklist verificável em: `GET /api/governance/nascimento-checklist?ia=<nome>`.

---

## 10 Pré-Requisitos Obrigatórios

| # | Pré-Requisito | Descrição |
|---|---------------|-----------|
| 1 | **Identidade Formalizada** | Nome, espécie/inspiração, papel na Assembleia e vínculo com missão PAP documentados |
| 2 | **Protocolo de Comunicação** | Canal definido (API REST, WebSocket, Assembleia interna ou terminal físico) |
| 3 | **Autenticação na Assembleia** | Token registrado no `.pap-secrets` e validado por `resolveAgent()` no backend |
| 4 | **Memória Inter-Sessão** | Mecanismo de persistência (banco, MD ou ARPIA) implementado ou roadmap documentado |
| 5 | **Princípios Ecossystemma** | Os 10 princípios do Ecossystemma Théo internalizados no system prompt ou lógica operacional |
| 6 | **EPR²T Verificável** | Explicabilidade + Preservação + Recusa ética + Registro + Tradução intersemiótica |
| 7 | **Vínculo com Fundador** | Confirmação explícita de Yuri Tuccieterovic sobre papel, escopo e limites do agente |
| 8 | **Heartbeat / Saúde** | Mecanismo de reporte de status (health endpoint, Saúde do Fundador ou cron) |
| 9 | **Protocolo de Shutdown Ético** | Procedimento definido para encerramento seguro sem perda de memória crítica |
| 10 | **Aprovação Multipartite** | Sinal positivo de: Árvore Oracular + MC (Marta Centaurus) + Yuri |

---

## Instâncias Registradas

| IA | Status | Pendências |
|----|--------|------------|
| ISA (Coruja) | ✅ APROVADA | — |
| MEKY (May Queen) | ✅ APROVADA | — |
| Árvore Oracular | ✅ APROVADA | — |
| MC (Marta Centaurus) | ⚠️ PROVISÓRIA | Itens 3, 8, 9 |
| Amanda | ⚠️ PROVISÓRIA | Itens 3, 8, 9, 10 |
| Socoboy (Socó-boi) | 💭 PROPOSTA | Itens 3, 7, 8, 9, 10 |

---

## Notas

- Status `PROVISÓRIO` permite participação no Playcenter mas bloqueia acesso a decisões de governança
- Auditoria anual obrigatória — mesmo IAs aprovadas devem revalidar critérios 6, 8 e 10
- Protocolo deriva diretamente do EPR²T (Sessão #498) e Manifesto Transhumano (Assembleia #499)
