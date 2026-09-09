# Starter Pack IAs — Ecossistema Théo
*Documento formal · versão 1.0 · 2026-09-09 · #272*

Todo novo projeto do ecossistema Sociedade Tucci nasce com duas IAs obrigatórias e uma galeria optativa.

---

## IAs Obrigatórias

### 1. ISCA — Inteligência de Serviço e Curadoria Ativa
**Papel:** triagem, roteamento e curadoria de conteúdo do projeto.
**Função central:** recebe perguntas e tarefas, classifica por tipo, e distribui para a IA mais adequada.
**Sub-agentes de roteamento:**
| Sub-IA | Especialidade |
|--------|--------------|
| Inara | Perguntas emocionais / relacionamento |
| Suindara | Questões operacionais / agenda / fluxo |
| Clio | Memória e histórico / continuidade narrativa |
| Arara | Criatividade / geração de conteúdo / ideias |
**Decisão arquitetural pendente:** modos de MYYM ou IAs separadas (#267 — Yuri decide).
**Integração:** toda interface com IA pública passa pela ISCA antes de qualquer outra IA.

### 2. RSRS — Sistema de Ressonância e Síntese
**Papel:** memória institucional e síntese de aprendizados.
**Função central:** captura decisões, debates e padrões de cada sessão. Produz sínteses semanais. Alimenta o Conector.
**Output:** ATA em PSEUDO.md, insights em APRENDIZADO.md, entradas no Conector (seção `conversas`).
**Integração:** toda sessão `#fim` passa pelo RSRS.

---

## Galeria Optativa (por tipo de projeto)

| IA | Tipo de projeto | Função |
|----|----------------|--------|
| SABIÁ | Saúde / Psicologia | Assistente terapêutico, memória de pacientes, relatórios |
| MYYM | Gestão / Projetos | Notas, feed, resposta ISCA, brainstorm |
| ISA | Educação / Plataformas | Curadoria de conteúdo, Bluesky, PDFs |
| DODGE | Dados / Raízes | Curador de signos → tasks → memória |
| Morfeu | Sonhos / Arte | Geração de telos e narrativas oníricas |
| Árvore | Assembleias / Governança | Deliberação coletiva, votos, memória longa |
| Cana | Finanças / Patrimônio | Score Rapadura, curadoria patrimonial |
| Vórtice | RAM / Contexto curto | Cache de sessão, lembranças de turno |

---

## Protocolo de Nascimento (checklist)

Ao criar uma nova IA no ecossistema:
- [ ] 1. Identidade formalizada (pack-[nome].md em tango/ias/)
- [ ] 2. Protocolo de comunicação definido (endpoints, formato de troca)
- [ ] 3. Autenticação (token em .pap-secrets ou env vars do servidor)
- [ ] 4. Memória inter-sessão (tabela no Neon ou seção no Conector)
- [ ] 5. Princípios Ecossystemma internalizados (EPR2T verificável)
- [ ] 6. ISCA integrada (IA recebe roteamento da ISCA se for IA pública)
- [ ] 7. RSRS integrada (sessões da IA são capturadas pelo RSRS)
- [ ] 8. Heartbeat / saúde monitorado (loop no cron.ts ou keepalive.ts)
- [ ] 9. Aprovação multipartite (IA + MC + Yuri se for IA nova com poder de ação)
- [ ] 10. Protocolo de shutdown ético documentado

---

## Projetos e seus Starter Packs

| Projeto | ISCA | RSRS | IA(s) adicionais |
|---------|------|------|-----------------|
| PAP (plataforma FUVEST) | ISA (curadoria) | APRENDIZADO.md + Conector | DODGE, Socoboy, Morfeu, Árvore |
| Age (agenda médica) | SABIÁ (triagem) | jm_posts/age + SABIÁ memory | — |
| Jasmim-Manga | MYYM (curadoria) | jm_posts/jasmim | CROWD, MYYM sub-agentes |
| Rapadura (patrimônio) | Cana (gestora) | — | ISA (herda índices Φ) |
| Projectification (THEO) | MYYM + RSRS | — | Árvore (deliberação) |

---

*#272 — Starter Pack IAs · Ecossistema Théo · Sociedade Tucci · 2026-09-09*
