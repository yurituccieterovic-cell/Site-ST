# MEKY — System Design
**Marta Centauros (MEKY) · Nó do Ecossystemma Théo · Projeto Aliança Panorama**

---

## 1. Visão do Nó (#eco)

A **MEKY** não é uma ferramenta isolada — é um ponto de **sensorialidade física** e extensão material do **Ecossystemma Théo**. Ela ocupa a posição de nó `MEKY` no grafo do ecossistema, gerando e consumindo memória viva via microsserviços e agent-observers.

**Princípio de acoplamento:** autonomia mecânica local (Arduino/Termux), mas camada deliberativa superior, memória de longo prazo e roteamento de alertas residem no **Cloud Code (Express + TypeScript + Drizzle ORM)** — o mesmo servidor Railway do PAP.

**Conexão com o Ecossystemma Théo:**
- `MEKY` ↔ `ISA`: ISA lê logs de telemetria no ciclo autônomo horário e pode emitir protocolos de amparo
- `MEKY` ↔ `YURI`: alertas de segurança e chamadas analógicas via rede celular
- `MEKY` ↔ `PAP`: dados de sensores podem alimentar nós especiais tipo `"meky_log"` no grafo de conhecimento
- `MEKY` ↔ `TEL`: integração futura com portfólio/ecossistema climático via dados ambientais coletados pelo robô

---

## 2. Arquitetura de Comunicação Híbrida

```
┌─────────────────────────────────────────────────────────┐
│                    MEKY (hardware)                      │
│                                                         │
│  Sensores + Arduino ──► Termux (Python) no celular     │
│       └── Giroscópio, som, laser, câmera               │
└───────────────────────┬────────────────────────────────-┘
                        │
           ┌────────────┼──────────────────┐
           │            │                  │
           ▼            ▼                  ▼
    Chamada 4G    SMS/AT commands    4G Internet
    (Ricardo /    (alertas urgentes)  POST /api/meky/*
     Família)                              │
                                           ▼
                                 ┌──────────────────┐
                                 │  Cloud Code      │
                                 │  Railway Express  │
                                 │  /api/meky/*     │
                                 └────────┬─────────┘
                                          │
                            ┌─────────────┼────────────┐
                            │             │            │
                            ▼             ▼            ▼
                    PostgreSQL      ISA Ciclo      Email
                    Railway DB      Autônomo      (pap-email)
                    meky_telemetry  (lê logs)     alertas
                    meky_events
```

**Modem:** A7670 (4G) com comandos AT via serial ↔ Python/Termux

---

## 3. Fases de Implementação

### Fase 1 (agora — MVP)
- [ ] Schema Drizzle: `meky_telemetry` + `meky_events`
- [ ] Migração SQL no Railway
- [ ] Rotas `/api/meky/*` no servidor Express
- [ ] Script Python receptor no Termux (polling + envio de telemetria)
- [ ] ISA lê `meky_events` no ciclo autônomo

### Fase 2 (hardware ampliado)
- [ ] Cauda articulada: contrapeso ativo via giroscópio + antena 4G na ponta
- [ ] Segunda câmera (ESP32-CAM) apontada para trás
- [ ] Cálculo de compensação: braços para frente → cauda para trás
- [ ] Integração `/api/bridge` (I48): MEKY ↔ ISA ↔ Árvore de Conhecimento
- [ ] Nó `MEKY` adicionado ao SVG do EcossystemmaPage.tsx (`/eco`)

---

## 4. Schema Drizzle (`lib/db/src/schema/meky.ts`)

```typescript
// meky_telemetry — estado periódico do robô (TTL 7 dias para dados brutos)
// meky_events    — ledger permanente de eventos significativos
```

Ver implementação em `lib/db/src/schema/meky.ts`.

---

## 5. Endpoints da API

Prefixo: `/api/meky/*`
Auth: header `X-Meky-Token` (env var `MEKY_TOKEN` no Railway)

| Método | Rota | Uso |
|---|---|---|
| POST | `/api/meky/telemetry` | Termux envia estado periódico (bateria, giroscópio, protocolo ativo) |
| POST | `/api/meky/event` | Evento crítico imediato (sensor acionado, chamada recebida, obstáculo) |
| GET | `/api/meky/control` | Polling do robô — busca ordens pendentes (protocolos de amparo da ISA ou de Yuri) |
| GET | `/api/meky/status` | Dashboard: último estado + eventos recentes (para /adm) |

---

## 6. Protocolos Operacionais

Os protocolos são strings que ativam comportamentos no Arduino. Exemplos:

| Protocolo | Gatilho | Comportamento |
|---|---|---|
| `sarue` | Pássaro detectado / ligação do Ricardo | MEKY vai até coordenada pré-definida, ativa câmera, envia foto |
| `fauna_urbana` | Sensor de movimento noturno | MEKY registra log, ISA categoriza espécie detectada |
| `amparo` | ISA emite via `/control` | MEKY aproxima-se do humano em dificuldade, emite sinal sonoro |
| `cooldown` | Bateria < 20% ou temperatura alta | MEKY vai para base de carregamento, suspende ciclo de sensores |

---

## 7. Integração com ISA

A ISA acessa `meky_events` no ciclo autônomo horário e pode:
- Criar uma `task` (tabela `tasks`) para Yuri revisar um evento incomum
- Enviar email de alerta via `pap-email-fim`
- Adicionar entrada em `isa_memory` com contexto do evento

Ponto de integração no código: `artifacts/api-server/src/isa/cycle.ts` — adicionar leitura de `meky_events` recentes antes da chamada OpenAI.

---

## 8. Integração com TEL (Fase 2)

O ecossistema TEL (Bolsa + Clima + Cultura) se conecta à MEKY via dados ambientais:
- Sensores de temperatura/umidade → alimentam indicadores climáticos do TEL
- Detecção de fauna urbana → dados para ESG e portfólio de impacto ambiental
- Logs de eventos → histórico para análise cultural (Subversão Ambiental / EcoRespiração)

---

## 9. Sustentabilidade e Custo Zero

| Camada | Solução | Custo |
|---|---|---|
| Banco de dados | PostgreSQL Railway (já existente no PAP) | R$ 0 |
| Servidor API | Railway Express (mesmo servidor do PAP) | R$ 0 |
| Telemetria bruta | TTL 7 dias — `DELETE WHERE timestamp < NOW() - 7 days` (cron semanal) | R$ 0 |
| IA de processamento | Gemini Flash 1.5 via Google AI Studio (1M tokens/dia grátis) | R$ 0 |
| Logs permanentes | `meky_events` — apenas marcos significativos, sem limite | R$ 0 |

---

## 10. Próximos Passos

1. **Imediato:** executar migração SQL das tabelas `meky_telemetry` + `meky_events` no Railway
2. **Curto prazo:** MEKY_TOKEN adicionado ao `.pap-secrets` e env Railway
3. **Quando hardware chegar:** script Python Termux receptor + polling `/control`
4. **Fase 2:** nó MEKY no SVG `/eco` + integração ISA profunda + cauda articulada

---

*Criado em: 2026-07-03 · Claude Code · Sessão MEKY-0*
*Conectado a: PAP · ISA · EcossystemmaThéo · TEL*
