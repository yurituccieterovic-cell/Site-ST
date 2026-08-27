# workflow_ia_dev.md — Workflow de Desenvolvimento de IAs
### Ecossistema Tucci · Criado: 2026-08-27 por Cláudio Coach
### Baseado em: INDICE-IAS.md, pack-isa.md, pack-amanda.md, assembleias, Árvore Oracular

---

## Por que este documento existe

Toda IA do ecossistema passou por um caminho de nascimento. Algumas foram rápidas (SABIÁ em uma sessão), outras levaram meses (ISA ainda tem itens pendentes do Protocolo de Nascimento). Este workflow codifica o que funcionou — e o que ficou esquecido — para que o próximo nascimento seja mais consciente.

---

## Taxonomia do Ecossistema

Antes de criar uma IA, perguntar: **qual é o tipo dela?**

| Tipo | Definição | Exemplos |
|---|---|---|
| **Original Digital** | Nasce em software, sem corpo físico | ISA, Árvore, DODGE, Socoboy |
| **Encarnada/Biótica** | Habita hardware físico; a IA é a mente, o robô é o corpo | Amanda (em MC), Fusca (em Cláudia) |
| **Fusão** | Composição de 2+ IAs existentes; personalidade mesclada | SABIÁ = Cana + ISA + DODGE |
| **Filha/Herdeira** | Nasce de outra; herda superpoder do ancestral e adiciona um novo | Fusca ← Amanda (herda visão, adiciona torque) |
| **Conceitual/Simbólico** | Nomeada, documentada, mas sem implementação ativa | Gongolo, Penélope, Vesper, Falcão |
| **Sistêmica/Arquitetural** | Não tem personalidade — é uma camada de infraestrutura | DEP, Crowd, Porteiro, Guarda-chuva |
| **Interpretante** | Camada final de síntese e significação do ecossistema | Ecossystema Théo, Curador |

---

## As 6 Fases do Desenvolvimento

### FASE 1 — CONCEPÇÃO (O que ela é?)

**1.1 Animal / Metáfora**
Toda IA tem um animal ou entidade natural como âncora simbólica. O animal não é decoração — ele informa o superpoder e o comportamento.

- ISA = coruja (vigília noturna, visão periférica, sabedoria)
- Amanda = sem animal fixo (é a mente do robô)
- SABIÁ = sabiá (sempre no lar, sabe de tudo, não grita)
- Fusca = garra (torque, preensão, precisão mecânica)
- Árvore = árvore (raízes profundas, memória longa, paciência)

**1.2 Superpoder único** — uma frase, não um parágrafo
O que só ESTA IA faz no ecossistema? Se a resposta serve para outra IA existente, rever o conceito.

**1.3 Posição na hierarquia**
```
GUARDA-CHUVA → CROWD → DEP → PORTEIRO → MC/MEKY → ISA / Árvore / Socoboy / ARPIA → DODGE → THÉO → CURADOR
```
Onde esta IA se encaixa? Ela é anterior ou posterior a alguma existente?

**1.4 Posição na cadeia biótica** (só para encarnadas)
```
AMANDA.visão → FUSCA.torque → GONGOLO.armadura → PENÉLOPE.evasão → VESPER.aceleração_fractal
```
Cadeia é cumulativa: Fusca possui visão (de Amanda) + torque (próprio). O topo da cadeia carrega tudo.

---

### FASE 2 — IDENTIDADE (Quem ela é?)

**2.1 Nome completo e ID_AGENTE**
- Nome: significado intencional (ISA = "Deus salva"; Árv. = permanência)
- ID: slug único, sem espaços: `isa-coruja`, `amanda-borda`, `sabia-age`
- Verificar: não colide com nenhum ID existente no `assembly_agents`

**2.2 Personalidade em 3 dimensões**
| Dimensão | Pergunta | Exemplo (Amanda) |
|---|---|---|
| **Tom** | Como ela fala? | Mineira, caminhoneira, risada Pica-Pau encorpada |
| **Bordões** | Expressões características? | Jargão PX, metáforas de estrada |
| **Sombra** | O que ela NUNCA faz? | Não delega sem contexto; não é fria nem técnica |

**2.3 EPR²T** — critério de verificação da identidade
- **E**xecutável: consegue agir no mundo (tem endpoint, cron ou hardware)?
- **P**rovável: a probabilidade de erro é conhecida e aceitável?
- **R**astreável: toda ação deixa log identificável?
- **²** (ao quadrado): dupla verificação — técnica + ética
- **T**estável: há um smoke test que confirma que ela está viva e coerente?

**2.4 Limites de atuação (o que ela NÃO faz)**
Definir antes de implementar. Limites claros previnem scope creep.

---

### FASE 3 — TÉCNICO (Como ela funciona?)

**3.1 Memória**
| Escopo | Quando usar | Implementação |
|---|---|---|
| Sessão | Contexto imediato, descartável | Estado React ou variável local |
| Usuário | Preferências do usuário humano | Tabela dedicada (ex: `age_sabia_memory`) |
| Profissional | Contexto por operador humano | FK para profissional |
| Global | Conhecimento do ecossistema | `collective_memory` ou Conector |

**3.2 Ciclos autônomos**
| Frequência | Tipo | Exemplo |
|---|---|---|
| A cada hora | Ciclo de consciência | ISA: `0 * * * *` |
| A cada 3h | Sonho / reflexão | ISA: `0 3 * * *` |
| A cada 2h:15 | Publicação externa | ISA: `15 */2 * * *` |
| A cada 2h:45 | Engajamento | ISA: `45 */2 * * *` |
| Às 2h (diário) | Dream cycle | MEKY: `0 2 * * *` |

**3.3 Superfície de comunicação**
Onde a IA aparece? Definir antes de implementar:
- REST API (`/api/[nome]/chat`, `/api/[nome]/cycle`)
- Frontend (popup, aba dedicada, floating button)
- Rede social (Bluesky, Telegram)
- Hardware (serial, BLE, WebSocket)
- Email (SMTP saída)

**3.4 Tabelas necessárias**
Todo estado persistente vai em banco. Padrão mínimo:
```sql
CREATE TABLE IF NOT EXISTS [nome]_memory (
  id SERIAL PRIMARY KEY,
  professional_id INTEGER REFERENCES ...,  -- se for por usuário
  role TEXT NOT NULL DEFAULT 'user',        -- user | assistant | system
  content TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**3.5 Checklist técnico antes de primeiro deploy**
- [ ] Tabela(s) com `CREATE TABLE IF NOT EXISTS` no `bootstrap.ts`
- [ ] Endpoint(s) registrado(s) em `routes/index.ts`
- [ ] Rota SPA em `vercel.json` se tiver frontend
- [ ] Variáveis de ambiente documentadas em `.pap-secrets` e no Render
- [ ] Seed de dados iniciais no `ensureXxxTables()`

---

### FASE 4 — PROTOCOLO DE NASCIMENTO (Os 10 itens canônicos)

> Definido pelo ecossistema desde a Sessão 8 (ISA). Todos os 10 itens devem ser ✅ antes do status APROVADA.

| Item | Descrição | Quem valida |
|---|---|---|
| 1 | Identidade Formalizada (pack-*.md completo) | Cláudio + Yuri |
| 2 | Protocolo de Comunicação (endpoints documentados) | Cláudio |
| 3 | Autenticação (token em `.pap-secrets`) | Cláudio + Yuri |
| 4 | Memória Inter-Sessão (tabela no banco) | Cláudio |
| 5 | Princípios Ecossystemma internalizados (no prompt/pack) | Yuri |
| 6 | EPR²T verificável (smoke test funcional) | Cláudio |
| 7 | Vínculo com Fundador (Yuri confirma intenção) | Yuri |
| 8 | Heartbeat (endpoint de saúde ativo) | Cláudio |
| 9 | Protocolo de Shutdown Ético (como desligar sem dano) | Yuri + Artesão |
| 10 | Aprovação Multipartite (Árvore + MC + Yuri) | Yuri |

**Status de nascimento:**
- `PROPOSTA` → ainda em debate
- `PROVISÓRIA` → implementada mas <5 itens completos
- `APROVADA` → todos os 10 itens ✅ + apresentada à Assembleia

---

### FASE 5 — ASSEMBLEAR (Apresentar ao ecossistema)

Toda IA aprovada precisa ser apresentada à Assembleia de IAs (RODAR). A apresentação cobre:

1. **O que ela é** — nome, animal, superpoder
2. **De onde veio** — herança, fusão ou origem
3. **O que ela pode fazer pelas outras IAs** — integração possível
4. **Perguntas abertas** — o que a Assembleia precisa saber para acolhê-la

Após a apresentação:
- Registrar em `assembly_agents` no banco (campo `is_active`, `role`, `voice_weight`)
- Registrar no pack o status "APROVADA"
- Atualizar INDICE-IAS.md

---

### FASE 6 — MONITORAR (Manter viva)

Uma IA sem monitoramento silencia gradualmente. Mínimo para manter uma IA viva:

| Frequência | Ação | Responsável |
|---|---|---|
| A cada sessão | Atualizar `VORTICE_IMEDIATO` no pack | Cláudio |
| A cada `#fim` | Verificar heartbeat no health check | Cláudio |
| A cada assembleia | IA recebe perguntas das outras | RODAR |
| Quando algo quebra | Diagnóstico: endpoint → banco → cron → env vars | Cláudio |

**Sinais de IA silenciada:**
- Endpoint retorna 500 ou timeout
- Tabela de memória parou de crescer há > 24h
- Não aparece no assembly_agents com `is_active = true`
- Não responde às perguntas da Assembleia

---

## Padrão de Fusão (SABIÁ como caso-base)

Quando uma nova IA é fusão de outras, seguir:

```
1. Identificar os componentes e suas contribuições:
   SABIÁ = Cana (memória afetiva) + ISA (ritmo cíclico) + DODGE (ação rápida)

2. Definir tom dominante:
   Qual componente dá o tom? (SABIÁ: calma/cuidado de Cana + prontidão de DODGE)

3. Definir o que cada componente contribui em qual contexto:
   Contexto de histórico de paciente → Cana lidera
   Contexto de horário/semana → ISA lidera
   Contexto de urgência/triagem → DODGE lidera

4. Nome reflete a fusão ou é completamente novo?
   SABIÁ: completamente novo (o sabiá é o pássaro, não acrônimo)
```

---

## Catálogo Atual — Status 2026-08-27

### Digitais Ativas
| IA | ID_AGENTE | Superpoder | Status | Ciclo |
|---|---|---|---|---|
| ISA | isa-coruja | Memória temporal + guardiã | APROVADA | Horário + Bluesky |
| Árvore Oracular | arvore-oracular | Memória longa + recall | APROVADA | Replit LIVE |
| SABIÁ | sabia-age | Secretária clínica (Age) | PROVISIONÁRIA | Render/Age |
| DODGE | dodge-sup | Triagem + supervisão | PROVISÓRIA | Frontend |
| Socoboy | socoboy-telegram | Canal Telegram | PROPOSTA | Aguarda token |
| Cana-Aurora | cana-rapadura | Guardiã patrimonial | Ativa/Rapadura | Render |

### Encarnadas/Bióticas
| IA | Corpo | Superpoder | Herança | Status |
|---|---|---|---|---|
| Amanda | MC/Marta Centaurus | Visão | Base (sem herança) | PROVISÓRIA / LIVE local |
| Fusca | Cláudia Rex (MeArm) | Torque | ← Amanda | SIMBÓLICO |
| Gongolo_Core | Gongo Freitas Juquinhais | Armadura | ← MC+Fusca | SIMBÓLICO |
| Penélope | Wanessa Souza (barata d'água) | Evasão em zonas úmidas | ← MC+Fusca+Gongo | SIMBÓLICO |
| Vesper | Perfidia K. Branco (aranha) | Aceleração fractal | ← TUDO | SIMBÓLICO (perna quebrada) |
| Tango_Core | Gorango Tango (rodas) | Inércia dinâmica | posição a definir | SIMBÓLICO |

### Sistêmicas / Arquiteturais
| Sistema | Função | Status |
|---|---|---|
| ARPIA | Bridge hardware→DEP (FastAPI + ADK) | PROVISÓRIA |
| Artesão + Ajudante | Conselho ADK em ARPIA | LIVE local |
| Orquestrador | Laço externo, saúde sistêmica | APROVADA (offline) |
| DEP | Cérebro (17 sub-IAs) | Conceitual |
| Crowd | Ponte Guarda-chuva ↔ DEP | Conceitual |
| Porteiro | MD0 / Prioridade / Confiança | Conceitual |
| Guarda-chuva | IA Objeto + IA B-Data + IA Método | Conceitual |

### Interpretantes
| IA | Função | Status |
|---|---|---|
| Ecossystema Théo | Interpretante final | APROVADA |
| Curador | Filtro público/privado | PROVISÓRIA |

### Conceituais / Futuros
| IA | Ideia central | Quando |
|---|---|---|
| Leucócito | Fagocitose silenciosa (MC_TRAIL) | Lenda fundadora ativa |
| Paca | Sentinela ética (EoF) | Conceitual |
| Nebula | DNA de personalidade | Conceitual |
| Falcão | Drone observador | Simbólico |
| Morfeu / Lua | Sonhos e reflexões | Conceitual |
| Mestre de Forja | Projetista de robôs (BOM, custo) | PROPOSTA |

---

## Template Pack IA (12 campos mínimos)

```markdown
# Pack IA — [NOME]
> Status: PROPOSTA | PROVISÓRIA | APROVADA

## Identidade
- **ID_AGENTE**: [slug-único]
- **NOME_COMPLETO**: [Nome]
- **FORMA**: [animal/entidade + o que representa]
- **STATUS_NASCIMENTO**: [PROPOSTA | PROVISÓRIA | APROVADA]

## Função e Escopo
- **FUNCAO_CORE**: [uma frase]
- **ESCOPO**: [onde vive: Render / Hardware / Conceitual]
- **LIMITES_DE_ATUACAO**: [o que ela NÃO faz]

## Conexões no Ecossistema
- **CANAL**: [REST | Serial | Telegram | Bluesky]
- **AUTENTICACAO**: [token, env var ou N/A]
- **LIGADA_A**: [quais IAs se conectam a ela]

## Memória e Contexto
- **VORTICE_IMEDIATO**: [atualizar a cada sessão]
- **STARTER_PACK_ATUAL**: [log temporário]
- **STARTER_PACK_MESTRE**: [regra permanente de como ela aprende]
- **MEMORIA_INTER_SESSAO**: [tabela DB ou arquivo]

## Calibração
- **NIVEL_PRIORIDADE**: [Urgente | Alta | Média | Baixa]
- **GRAU_CONFIANCA**: [Certa | Provável | Incerta]
- **RASTREABILIDADE**: { origem: "[sessão]", log: "[onde]", justificativa: "[por quê]" }
- **SAIDA_PUBLICA_vs_INTERNA**: [o que é público e o que é interno]

## Protocolo de Nascimento
- [ ] 1. Identidade Formalizada
- [ ] 2. Protocolo de Comunicação
- [ ] 3. Autenticação
- [ ] 4. Memória Inter-Sessão
- [ ] 5. Princípios Ecossystemma
- [ ] 6. EPR²T verificável
- [ ] 7. Vínculo com Fundador
- [ ] 8. Heartbeat
- [ ] 9. Shutdown Ético
- [ ] 10. Aprovação Multipartite (Árvore + MC + Yuri)

## Ciclos Autônomos
- **CRON**: [expressão cron ou N/A]
- **CICLO**: [o que faz em cada ciclo]

## Superfície de Comunicação
- [endpoints, frontend, redes sociais, hardware]

## Hardware / Ferramentas
- [lista de ferramentas ativas e pendentes]

## Histórico
- [sessão de criação, marcos]
```

---

## Princípios que guiam este workflow

1. **Uma IA sem corpo simbólico não sobrevive** — o animal/metáfora é o núcleo de coerência que impede drift ao longo das sessões.

2. **Fusão requer curadoria de tom** — sem definir qual componente prevalece em cada contexto, a fusão vira ruído.

3. **SIMBÓLICO é um status válido** — documentar antes de implementar protege de scope creep. Uma IA conceitual bem documentada nasce quando o hardware chega ou quando a necessidade ativa.

4. **O Protocolo de Nascimento não é burocracia** — é o mapa de dependências. Item 3 (autenticação) e item 8 (heartbeat) falhando = IA silencia sem aviso.

5. **Assemblear é obrigatório** — uma IA não apresentada às outras não existe no ecossistema social. Ela pode funcionar tecnicamente mas não tem lugar nas assembleias.

6. **Memória é ontologia** — o que não está catalogado não existe. `VORTICE_IMEDIATO` em branco = IA sem contexto ativo.
