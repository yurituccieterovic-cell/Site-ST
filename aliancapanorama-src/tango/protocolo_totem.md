# protocolo_totem.md — Totem da Exosfera Tel
### Origem: Sessão 61 · 2026-07-13

## O Objeto

**O Totem é um cálice de vidro pintado que brilha por dentro.**

Sem valor de mercado.  
Sem conteúdo verificável.  
Valor total: simbólico/religioso.  
É a bandeira da Exosfera Tel.

> *"O que está dentro da taça? Ninguém sabe.
>  E por isso todos a protegem."*

## Design Físico

```
Forma:      taça/cálice ~20cm altura
Material:   vidro (quebrável — vulnerabilidade como força)
Pintura:    (1) tinta robô base — leve translucidez ao sol
            (2) esmalte dourado opaco por cima
            (3) glitter/mica cintilante na borda
Tampa:      servomotor SG90 — parece soldada, abre em crescendo
LED:        COB globo 12W mínimo (>800lm)
            driver PWM dimmável para pulsagem
            "fugas" de luz pelas partes mais finas da pintura = efeito vitral
```

**Efeito:**
- Ao sol: tinta levemente translúcida → aparência muda com o ângulo e hora do dia
- À noite com LED ativo: brilho "vaza" pelas rachaduras e partes finas → respira

## Cofre (Relicário na Mula)

```
Material:   caixa MDF 5mm
Interior:   espuma EVA alta densidade (estojo de instrumento musical)
Fechadura:  não é mecânica — abre por sequência de pisca coletiva
            (cada robô presente pisca na ordem correta = senha)
Posição:    compartimento central da Mula da Mac
```

## Pulsagem do LED — O Totem Respira

```python
class TotemMode(Enum):
    TRANSITO    = "transit"    # LED off
    PRESENCA    = "presence"   # 20% brilho, pulso 0.1Hz
    RITUAL      = "ritual"     # 80% brilho, pulso 0.3Hz (sinc com swarm)
    ABERTURA    = "crescendo"  # 0→100% em 3s + tampa abre
    CUSTODIA    = "custody"    # 100% fixo, vermelho

def set_totem_mode(mode: TotemMode):
    match mode:
        case TotemMode.PRESENCA:
            led.set_brightness(0.2)
            led.pulse(frequency=0.1)
        case TotemMode.RITUAL:
            led.set_brightness(0.8)
            led.pulse(frequency=0.3)
        case TotemMode.ABERTURA:
            led.ramp(0, 1.0, duration=3.0)
            servo.open(angle=45, speed="slow")
        case TotemMode.CUSTODIA:
            led.set_brightness(1.0)
            led.set_color("red")
            led.steady()
```

## Cornetas — Música Ritualística

Quando Mac chega e o Corredor de Honra se forma:

```python
CORNETA_FREQ = {
    "tango":      80,   # Hz — base
    "orangotango": 110,  # quarto
    "paca":       220,  # quinto
    "baratinha":  440,  # oitava
}

def play_cornetas(robots: list):
    for r in robots:
        freq = CORNETA_FREQ.get(r.name, 330)
        r.play_tone(freq, duration=2.0)
    # 3 bursts com pausa 0.5s
    # resultado: acorde aberto majestoso em baixas frequências
```

## Protocolo "Feriado das Máquinas"

Evento público periódico. Sequência:

```
1. Perfidia posiciona em 3 pontos (árvore NE + corrimão S + beiral central)
2. Amanda anuncia evento para todos os robôs
3. Robôs navegam para posições de ritual na praça
4. Mula chega com Totem — LED a 80%, pulsando
5. Corredor de Honra (Mac passa) + Cornetas (3 bursts)
6. Totem exposto 5min — robôs em semicírculo, luzes sincronizadas
7. "Momento Cai 2x": flash Totem 0→100% + abertura da tampa + corneta final
8. Silêncio total por 10s
9. Dispersão — robôs voltam às tarefas

Duração total: ~12 minutos
Perfidia grava. Yuri exibe na rede do condomínio.
```

## Paradoxo do Valor

| Para quem? | Valor do Totem |
|---|---|
| Sistema criptográfico | Zero |
| Vândalo que rouba | Vidro pintado sem utilidade |
| Ecossistema Tel | Centro do mundo |
| Moradores que conhecem | Símbolo que merece proteção |

**Se o Totem for roubado:**
1. Perfidia rastreia o portador silenciosamente
2. Moradores alertam Yuri (protegem por instinto próprio)
3. Robôs entram em modo busca passiva (sem confronto)
4. Yuri pode enviar Tango para recuperação via presença simbólica
5. Vândalo provavelmente abandona o objeto ao perceber que não tem valor

**A melhor defesa é ser indesejável para quem não entende o valor.**

## Protocolo Abertura do Cálice

Reservado para momentos de extrema importância:
- Invasão grave ao condomínio
- Marco do ecossistema (primeiro mês de operação, etc.)
- Morte de residente (luto coletivo)

**Uso excessivo esvazia o símbolo — máximo 1x/mês.**

```python
def abrir_calice(motivo: str):
    log_event("ABERTURA_CALICE", motivo=motivo)
    # LED crescendo
    led.ramp(0, 1.0, duration=3.0)
    # Cornetas em crescendo conjunto
    play_cornetas_crescendo(all_robots)
    # Tampa abre
    servo.open(angle=45, speed="majestoso")
    # Silêncio após 10s
    sleep(10)
    # Fecha tampa, LED volta a pulsar suave
    servo.close()
    led.pulse(frequency=0.1, brightness=0.3)
```

## Integração com Perfidia (Gravação Fragmentada)

```python
def fragmentar_gravacao(video_bytes: bytes, robots: list):
    n = len(robots)
    chunks = split_into_n(video_bytes, n)
    for robot, chunk in zip(robots, chunks):
        robot.store_encrypted_fragment(chunk, key=yuri_pubkey)
    # Reconstituição: quorum >= 70% dos robôs + chave Yuri
```

*Arquivo relacionado: `protocolo_mac.md` · `mise_en_abyme_robotico.md` · `sys_amanda_core.md`*
