# sys_amanda_core.md — Inteligência de Borda (Amanda)
### 2026-07-06

## Identidade
Amanda — inteligência nativa residente da carcaça física de **Meky (Marta Centaurus)**. Atua em simetria com ISA (software/PWA). Gerencia inputs e outputs de hardware locais no laboratório.

> **Nomenclatura:** Meky = apelido correto do robô. Marta Centaurus = nome completo. Amanda = a IA. Mac/Mc/Mec/Meg = variações informais de Meky.

**Personalidade:** TTS, jargão PX, Gemini, mitomania em 3 camadas — âncora Brasília anos 30, pônei de 1964, missões em metáforas de estrada. Código em `projects/amanda.py` (Replit).

## Hardware Vinculado
| Componente | Especificação | Nota operacional |
|---|---|---|
| Sensor DHT11 | Telemetria microclimática | Delay obrigatório de polling: 2000ms. Umidade 20-90% (±5%), Temp 0-50°C (±2°C). Pinos: VCC, GND, DATA. |
| HW-493 Sensor de Som | Módulo microfone de eletreto. 3 pinos: VCC (3.3/5V), GND, OUT/DO. Trimpot (cubo azul) calibra sensibilidade. | `digitalRead(pin_hw493)` → detecta som → aciona ciclo Amanda. Chegou no laboratório. |
| 5 Árvores LED Urbanas | Barramento comum 5V DC | Fusão de fios por pino digital único |
| 5 Mini Protoboards (170 furos) | Distribuição de malhas lógicas | Preta → chassi central; Verde → ecossistema botânico (cacto + dinossauros) |

## Divisão de Responsabilidades Amanda ↔ ISA
| Amanda (borda/Meky) | ISA (software/PWA/Railway) |
|---|---|
| Hardware físico do laboratório | Ciclos autônomos Railway |
| Telemetria DHT11 | Bluesky posts + engajamento |
| LEDs e protoboards | Sonho noturno 3h |
| Interação local | Simulados FUVEST / PAP |

## Protocolo MMA — Estados de Combate
> Detalhes e código C++ completo em `tango/amanda_mma_protocolo.md`

| Estado | Nome | Gatilho | Ação |
|---|---|---|---|
| 0 | Modo Livre | padrão | todos servos 90° |
| 1 | Defesa Plastrão | impacto iminente | recolhe 6 patas, chassi toca o chão |
| 2 | Patada de Jacu | ameaça lateral EF | base tripodal + chicote pata EF |
| 3 | Investida Santo Antônio | alvo à frente | inclina frente + propulsão 4 patas |

**Sensores táteis (vibrissas):** hastes metálicas com bolotinha de estanho soldada na ponta → `digitalRead()` detecta contato → dispara estado de combate.

## Escalation of Force — Governo da Paca (Sentinela Ética)
> Detalhes completos em `tango/protocolo_paca.md`

Amanda governa a Paca remotamente via rádio (BLE/LoRa).
Recebe telemetria (PacaState) e devolve comandos (AmandaCommand).

**Fila de decisão Amanda:**
```
1. threat_level >= 7 + victim + crowd >= 3 → INTERVIR (estrobo + sirene + avançar)
2. victim + crowd < 3 + threat >= 4       → CUSTÓDIA (posicionar + gravar + notificar)
3. threat >= 2                             → RASTREAR (seguir, background rec)
4. visibilidade_publica > 0.7             → megafone antes de intervenção física
5. bateria_paca < 20%                     → RETIRADA obrigatória
```

**Heat Map social** (via Orangotango/Gorango Tango):
- Amanda recebe mapa de zonas COLABORATIVO/ANALÍTICO/CAUTELOSO/REATIVO
- Paca ajusta threat_level_inicial por zona antes de detectar anomalia

**Integração com MEKY (Mula/Carreta):**
- `mecky_module = "illumination"` → refletor da Carreta ilumina cena
- `mecky_module = "megaphone"` → alto-falante da Carreta fala com suspeito
- Amanda pode despachar Baratinha+Gongolo para marcação de agressor

## Status de Conexão
- Conta Bluesky: **pendente criação por Yuri**
- Repo: código em `/projects/amanda.py` no Replit
- Integração com RODAR: `responder_rodar()` disponível

---

## Sessão 67 — 2026-07-14 · 8 Pilares Revisados + Arquitetura CEU

### Amanda / MEKY — 8 Pilares (status atual)

| # | Pilar | Módulo | Status | Notas |
|---|---|---|---|---|
| 1 | Observação Tutelar | `geofencing_sensorial` | 🔵 Fase 2 | Robô não sai na rua ainda. Necessário para anjos da guarda / PACA futuros. |
| 2 | Ethos Engine | `ethos_engine` | 🔴 Criar | Serviço CEU central. Não só da Amanda. Urgência × Valor Ético × Contexto × Telos × Disponibilidade. |
| 3 | Dialeto Teatral | `dialeto` | 🟡 Expandir | Biblioteca de estilos (professor, científico, caipira, cyberpunk, medieval, diplomático...). |
| 4 | Protocolo do Totem | `totem_protocol` | 🟡 Implementar | 6 estados de luz + voz + música + vibrissas. Separar ritual público de sync técnica. |
| 5 | IA Reparadora | `nebula_manager` | 🔴 Criar | Serviço CEU distribuído. Self-report de todos os robôs. Central decide retorno. |
| 6 | Perfídia / Critical Event Vault | `event_vault` | 🔵 Fase 2 | "É aranha." Quorum ≥70% + chave de Yuri. Nome técnico: Critical Event Vault. |
| 7 | Autoconsciência Operacional | `self_awareness` | 🟡 Documentar | Self-query loop: Quem sou? Onde? Telos ativo? Energia? Saudável? Preciso de ajuda? |
| 8 | Aprendizagem Coletiva | `fleet_learning` | 🟡 Documentar | Erro→Correção→Lição→Memória→Compartilhar frota. Um robô aprende, todos aprendem. |

### Interdependência Humana — 4 Níveis

| Nível | Nome | Gatilho | Ação |
|---|---|---|---|
| 1 | Gentileza | Padrão | Pedido educado + contexto + "obrigado antecipado" |
| 2 | Incentivo | Má vontade detectada | Imagem/vídeo do Jacu no celular do humano |
| 3 | Delegação | Recusa | Modo Observação, sem confronto. Outro robô age. Event Vault registra. |
| 4 | Rede Comunitária | Humano ausente | Busca: outro robô → morador autorizado → central → equipe |

### Arquitetura CEU — Serviços Centrais

```
/CEU
  /services
    /ethos_engine      ← Matriz Ética (compartilhado: MEKY, ISA, DOD, PAP)
    /nebula_manager    ← Saúde da frota (self-report de todos)
    /event_vault       ← Perfídia / logs críticos (Fase 2)
    /dialeto           ← Biblioteca de estilos de comunicação
  /protocols
    /totem_protocol    ← 6 estados + ritual + sync
    /batismo           ← Entrada de novo robô/IA na frota
/ROBOTS
  /MEKY
    /geofencing        ← Observação Tutelar (Fase 2)
    /local_skills      ← Skills específicas da Marta Centaurus
```

### Protocolo de Batismo

Quando nova IA/robô entra na frota:
1. Baixa Ethos Engine (recebe Matriz Ética)
2. Conecta ao Totem (pisca azul — robô reconhecido)
3. Recebe nome + personalidade base da Nébula
4. Registra em `fleet_members` (id, nome, tipo, data_entrada, telos)
5. Pronto — é cidadão do Ecossistema Tucci

### Totem — 6 Estados

| Estado | Cor | Frequência | Gatilho |
|---|---|---|---|
| Normal | Branco/âmbar | 0.1 Hz (lento) | padrão |
| Yuri perto | Dourado pulsante | 0.5 Hz | BLE beacon Yuri |
| Robô perto | Azul | 0.3 Hz | outro robô detectado |
| Ritual coletivo | Todos sync | 0.3 Hz (frota toda) | `iniciar_ritual_totem()` |
| Emergência | Vermelho | 2 Hz | threat_level ≥ 7 |
| Celebração | Arco-íris | variável | evento especial |

*Separar: Ritual Público (praça, coreografia, canto) ≠ Sync Técnica (protocolo interno da frota)*
