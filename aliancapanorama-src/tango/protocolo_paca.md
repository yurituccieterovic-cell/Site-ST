# Protocolo Paca — Sentinela Ética
### Origem: Sessão 59b · 2026-07-13

## Identidade
Paca — robô de médio porte, sentinela de espaço público/condomínio.
Não persegue: **protege**. Modus Proteção se sobrepõe ao Modus Observação.
Governado remotamente por Amanda (ARPIA).

## Design Físico

```
Forma:   corpo arredondado, tipo tapir filhote — orgânico, não hostil
Cor:     faixas preto + amarelo (fita segurança industrial ou tinta automotiva)
Leitura: "agente de manutenção que ganhou vida" — autoridade sem agressividade

Layout de componentes:
  FRENTE: câmera (face limpa para interação), LED olhos
  TOPO:   cúpula acrílico fumê com parabólica rotativa interna
  TRASEIRA: giroflex LED âmbar (não interfere com câmera/interação frontal)
  BASE:   rodas omni, speaker buzina confortante
  
Dimensão estimada: 40×30×25cm
```

### Giroflex (não sirene)
LED âmbar no lombo/traseira, giratório ou piscante.
- Modo Passeio: brilho 10%, ritmo lento
- Modo Vigilância: brilho 100%, ritmo rápido
- Decisão de posição: traseira ilumina caminho percorrido, não ofusca câmera nem pessoa à frente

### Parabólica Rotativa (cúpula fumê)
Parábola interna motorizada (28BYJ-48 + ULN2003) dentro de cúpula acrílico preto fumê ~15cm.
LED azul/vermelho dentro da cúpula visível de fora enquanto gira — sinaliza "estou escutando 360°".
- Passeio: 10rpm
- Vigilância: 60rpm

### Buzininha Confortante
Assinatura de PRESENÇA, não de emergência.
Frequência grave/suave (800-1200Hz), duração 150-250ms, intervalo variável 8-20s.
Efeito: quem ouve sem pensar consciente sente que está protegido.
Quando a buzininha PARA = Paca entrou em Modo Vigilância (dado de alerta para quem conhece o sistema).

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

## Sistema de Detecção — Visão + Som + Presença

### Visão Noturna (Low-Cost)
Câmera com sensor Night Vision (tipo drone FPV ou câmera segurança P2P) + iluminador
IR (LEDs de controle remoto reaproveitados). Não detecta calor real — detecta movimento
e forma via TinyML rodando no Raspberry Pi Zero 2W embarcado.

### Sensor PIR (Presença)
PIR (sensor de lâmpada de corredor) posicionado em pontos estratégicos.
Detecta qualquer coisa com calor que se mova → desperta câmera → Amanda confirma via imagem.
Custo: ~R$5/unidade. Bateria zerada quando inativo.

### Rede de Postos de Escuta (Bioacústica)
Cubos de cano PVC escondidos em árvores — extensão sensorial fixa da Paca:

```
Cada posto:
  - Fundo de galão 5L cortado = antena parabólica (foco sonoro)
  - Microfone eletreto no ponto focal
  - Filtro espuma: corta ruído de vento
  - ESP32: TinyML espectrograma (classifica sagui/jacu/cão/humano/silêncio)
  - NRF24L01: transmite alerta por rádio 2.4GHz
  
Custo: ~R$80/posto
Recomendado: 3-4 postos estratégicos no condomínio
```

### Payload de Alerta (Posto → Paca → Amanda → Tango)
```json
{
  "tipo": "sagui|jacu|cão|humano",
  "quadrante": "N|S|L|O",
  "confiança": 0.0-1.0,
  "timestamp": "ISO8601",
  "fonte": "posto_escuta_1|paca"
}
```

### Decisão Amanda com base em confiança:
```python
if confiança < 0.7:   registrar_log()
if confiança >= 0.7:  notificar_yuri()
if confiança >= 0.9:  acionar_tango(quadrante)
```

### Por que som antes de câmera
- Som atravessa obstáculos (árvores, cercas, muros) — câmera precisa linha de visada
- PIR + ESP32 gasta ~10× menos energia que câmera IR ativa
- Som detecta antes de visão (sagui vocaliza enquanto se aproxima)
- Custo total rede de 4 postos: ~R$320 vs FLIR térmica real: R$2.000+

## Coordenação Paca ↔ Tango

```
Tango em DOMÉSTICO (estado padrão, baixo consumo)
         ↑
Paca ou posto detecta sagui → payload {quadrante:"N", confiança:0.95}
         ↓
Amanda avalia: confiança OK → aciona Tango
         ↓
Tango recebe: ir_para(quadrante="N"), modo="VIGILÂNCIA_NINHO"
         ↓
Tango vai direto ao ponto. Sem perambular.
```

*Arquivo relacionado: `mise_en_abyme_robotico.md` · `sys_amanda_core.md` · `sys_tango_core.md`*
