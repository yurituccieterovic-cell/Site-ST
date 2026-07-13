# protocolo_falcao.md — Falcão + Frota Felina + Geofencing Ético
### Origem: Sessão 62 · 2026-07-13

## O Falcão

**Drone aéreo do ecossistema Tel.**  
Predador que observa, guardião que age.

```
Tipo:       quadricóptero compacto
Diagonal:   ~30cm
MCU:        ESP32 + F405 (controle de voo)
Câmeras:    térmica (diagnóstico animal) + RGB (ID geral)
Rádio:      LoRa (longo alcance ao condomínio)
Autonomia:  ~20min voo ativo
Recarga:    escotilha no telhado da casa de Yuri (QG)
```

### A Escotilha (Estilo Jurassic Park)

```
Telhado da casa → escotilha de roletes ou pneumática
  → abre automaticamente por comando de Amanda
  → Falcão decola verticalmente, ganha altitude
  → Falcão retorna ao pouso na mesma escotilha
  → fecha automaticamente

Modo SILENT:   rotores lentos, <40dB — missão furtiva
Modo PRESENCE: "clique de asa metálica" ao sair — anuncia saída
               usado de dia, quando presença é bem-vinda
```

### Missões do Falcão

| Missão | Trigger | Modo | Ação |
|---|---|---|---|
| Reconhecimento Jacu | bioacústica posta | SILENT | sobrevoo, confirma, retorna |
| Gato machucado (rua) | alerta walkie/Paca | SILENT | câmera térmica, avalia lesão |
| Intruso em zona vermelha | sensor perímetro | PRESENCE | aproxima visível, filma |
| Gato seu saiu do condomínio | GPS coleira | PRESENCE | escolta aéreo de retorno |
| Falcão de Emergência | comando Yuri | PRESENCE | sai rápido, anuncia presença |

## Frota Felina

**Robôs que acompanham gatos em passeios.**

O gato mais imprevisível → se funciona para ele, funciona para humanos.

```
Dimensão:   compacto (não assusta gato — menor que a cabeça dele)
Rodas:      omni para terreno urbano (calçada, pedra, raiz)
Garras:     retráteis para escalada de muro (emergência)
Hélice:     dobrável, ativa apenas para "salto" sobre obstáculo ou
            perseguição em área de risco sem rota terrestre
Câmera:     frontal AI local para detecção de veículos
Ultrassônico: 20-60kHz para "freio de emergência"
```

### Freio de Emergência (só gatos/animais ouvem)

```python
def emergency_brake(situation: str) -> None:
    if situation == "carro_detectado" and gato_velocidade > 0.5:
        play_ultrasonic(freq=25_000, duration=0.3)
        # gato "congela" por ~1s
        # janela para carro passar ou gato reorientar
        log_event("freio_emergencia", gato_id, timestamp)
```

### Comportamentos Proibidos (Frota Felina)

- Não persegue o gato quando ele está em zona segura
- Não emite sons humanos (confunde gato, cria dependência)
- Não bloqueia o gato — apenas influencia por presença lateral
- Não entra em propriedade privada seguindo o gato

## Observador de Extremidade

**Modelo: "senhor que observa crianças na praça."**

```python
class ModoObservacao(Enum):
    STANDBY    = "standby"    # motor off, só PIR ativo
    VIGILANCIA = "vigilancia" # câmera low-res ativa, posição estática
    INTERACAO  = "interacao"  # movimento lento para extremidade de área

def aceno_do_senhor(morador_detectado: bool) -> None:
    if morador_detectado:
        led.pulse(count=1, brightness=0.15)
        # "bom dia" não verbal
        # não segue, não fala, não registra face
```

**Posicionamento:**
- Sempre ponto elevado ou sombra (invisível ao chão)
- Extremidade do jardim, não centro
- Modo baixa potência até anomalia detectada

## Geofencing Ético

```python
class GeofenceZone(Enum):
    VERDE    = "green"   # área pública — operação plena
    AMARELA  = "yellow"  # entrada de casas — câmera HD off
    VERMELHA = "red"     # privado — parar + pedir autorização

COMPORTAMENTO_POR_ZONA = {
    GeofenceZone.VERDE: {
        "velocidade": 1.0,
        "camera_hd": True,
        "microfone": True,
        "can_follow": True,
    },
    GeofenceZone.AMARELA: {
        "velocidade": 0.5,
        "camera_hd": False,   # só radar de movimento
        "microfone": False,
        "can_follow": False,
    },
    GeofenceZone.VERMELHA: {
        "velocidade": 0.0,    # para completamente
        "camera_hd": False,
        "microfone": False,
        "can_follow": False,
        "pede_autorizacao": True,
    },
}

def solicitar_entrada_zona_vermelha() -> bool:
    speak("Sistema Tel detectou anomalia. Autoriza verificação?")
    response = wait_for_response(timeout=30)
    return response == "sim"
```

### Triangulação de Perímetro (Zona Vermelha)

Sem câmera interna. Sensores nas bordas:

```python
# Tabela geofence_events
# {extremidade, timestamp, direcao: "entrada"|"saida"}

def inferir_intruso(eventos: list) -> str:
    entradas = [e for e in eventos if e["direcao"] == "entrada"]
    saidas   = [e for e in eventos if e["direcao"] == "saida"]
    
    if len(entradas) > len(saidas):
        tempo = now() - entradas[-1]["timestamp"]
        if tempo > 600:  # 10min sem saída detectada
            return "aviso_walkie"  # notifica vizinho (se autorizou)
    return "normal"
```

## Protocolo Gato Machucado

```
1. DETECÇÃO
   Walkie-talkie vizinho OU Paca ativa → "gato machucado, rua X"

2. RECONHECIMENTO (Falcão)
   Falcão decola em modo SILENT
   Câmera térmica: avalia tamanho da lesão, mobilidade, pulso
   Transmite imagem para Yuri + Amanda

3. CAMPO (Tango)
   Tango chega ao local
   Mantém distância de 1.5m (não assusta o animal)
   Mula: deposita água + ração a 50cm do gato
   Forma barreira passiva entre gato e tráfego

4. GUARDA
   Tango permanece em modo VIGILÂNCIA enquanto Yuri decide
   Falcão: órbita acima em baixa altitude
   Nenhum robô toca o animal

5. RESOLUÇÃO
   Yuri chega OU veterinário chamado
   Robôs recuam, mantêm perímetro apenas
```

*Arquivo relacionado: `protocolo_nebula.md` · `protocolo_mac.md` · `sys_amanda_core.md` · `mise_en_abyme_robotico.md`*
