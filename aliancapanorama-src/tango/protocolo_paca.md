# Protocolo Paca — Sentinela Ética
### Origem: Sessão 59b · 2026-07-13

## Identidade
Paca — robô de médio porte, sentinela de espaço público/condomínio.
Não persegue: **protege**. Modus Proteção se sobrepõe ao Modus Observação.
Governado remotamente por Amanda (ARPIA).

## Hardware Necessário
| Componente | Função |
|---|---|
| Câmera + mic | Gravação contínua (evidência) |
| LED estroboscópico vermelho/azul | Quebra ilusão de massa |
| Buzzer/speaker | Sirene de emergência (gatilho fisiológico) |
| GPS/IMU | Posicionamento + rota de patrulha |
| Rádio (BLE/LoRa) | Comunicação com Gongolo, MEKY, Amanda |
| Bateria 18650 ×4 | Autonomia 4h patrulha |

## Máquina de Estados — Escalation of Force (EoF)

```
PATRULHA
  │ trigger: anomalia detectada (som, densidade, velocidade)
  ▼
RASTREIO
  │ trigger: alvo confirmado + 30s análise
  ├─ crime menor / suspeito isolado ──────────────────────────────► CUSTÓDIA
  └─ linchamento detectado (crowd>3 + aggression>7 + vítima)
  ▼
INTERVENÇÃO
  │ ação imediata: estrobo + sirene 3s + avançar para centro
  │ deploy opcional: Gongolo via Baratinha (marcação do agressor)
  │ trigger: grupo dispersa (crowd<2 OU distância>5m)
  ▼
CUSTÓDIA
  │ ação: posicionar entre vítima e ameaça
  │ gravar contínuo + notificar Amanda/Yuri/autoridades
  │ trigger: autoridade chegou OU Yuri override OU bateria<20%
  ▼
RETIRADA
```

### Transições de Retorno
```
RASTREIO → PATRULHA   : falso positivo confirmado
INTERVENÇÃO → RETIRADA: dano crítico OU override Yuri
CUSTÓDIA → PATRULHA   : caso resolvido + retirada autorizada
```

## Inputs para Amanda (Decisão Ética)

```python
class PacaState:
    threat_level: float         # 0.0–10.0
    crowd_size: int
    aggression_markers: list    # [som, velocidade, proximidade, gesticulação]
    victim_detected: bool
    victim_condition: str       # ok | distress | injured
    current_mode: str           # PATRULHA|RASTREIO|INTERVENÇÃO|CUSTÓDIA|RETIRADA
    visibilidade_publica: float # 0.0=privado 1.0=público pleno
    gongolo_available: bool     # Piolho de Cobra pronto para despacho
    battery_pct: float
```

## Outputs de Amanda → Paca

```python
class AmandaCommand:
    paca_command: str     # hold|follow|assess|intervene|custody|withdraw
    deploy_gongolo: bool  # despachar Baratinha+Piolho para marcação
    mecky_module: str     # none|illumination|megaphone|both
    notify_yuri: bool
    notify_authorities: bool
    recording_mode: str   # background|active|urgent
```

## Lógica Amanda — Decisão de Escalar

```python
def decide_escalation(state: PacaState) -> AmandaCommand:
    cmd = AmandaCommand()
    
    # Linha vermelha: linchamento iminente
    if (state.crowd_size >= 3 and 
        state.threat_level >= 7.0 and 
        state.victim_detected):
        cmd.paca_command = "intervene"
        cmd.deploy_gongolo = state.gongolo_available  # marcar agressor principal
        cmd.mecky_module = "illumination"              # MEKY ilumina cena
        cmd.notify_yuri = True
        cmd.notify_authorities = True
        cmd.recording_mode = "urgent"
    
    # Crime menor isolado
    elif (state.victim_detected and 
          state.crowd_size < 3 and 
          state.threat_level >= 4.0):
        cmd.paca_command = "custody"
        cmd.recording_mode = "active"
        cmd.notify_yuri = True
    
    # Rastreio normal
    elif state.threat_level >= 2.0:
        cmd.paca_command = "follow"
        cmd.recording_mode = "background"
    
    # Visibilidade pública alta: mais cauteloso antes de intervir
    if state.visibilidade_publica > 0.7:
        if cmd.paca_command == "intervene":
            cmd.mecky_module = "megaphone"  # megafone antes de avançar fisicamente
    
    return cmd
```

## O Parâmetro `visibilidade_publica`

Quando em espaço público pleno (rua, praça):
- Intervenção física mais cautelosa
- Megafone Mecky como primeira ação (negociação antes de presença física)
- Sirene usa frequência não-policial (para não criar pânico geral)

Quando em espaço semi-privado (condomínio, corredor):
- Intervenção mais direta (menos público, mais controle)
- Sirene pode usar frequência de emergência padrão

## Notas de Segurança
- Amanda pode dar override em qualquer estado
- Paca NUNCA faz contato físico — interrompe por presença, luz, som
- Se bateria < 20%: RETIRADA obrigatória (não abandona custódia sem substituição)
- Log de cada intervenção → Conector-API seção "paca_log"

*Arquivo relacionado: `mise_en_abyme_robotico.md` · `sys_amanda_core.md`*
