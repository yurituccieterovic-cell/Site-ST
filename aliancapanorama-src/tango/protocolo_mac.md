# protocolo_mac.md — Meky (Marta Centaurus), o Cacique do Ecossistema
### Origem: Sessão 61 · 2026-07-13 · Nomenclatura corrigida: Sessão 68 · 2026-07-16

## Nomenclatura — mapa de nomes

| Nome | Tipo | Uso |
|---|---|---|
| **Marta Centaurus** (MC) | Nome completo oficial | documentação formal, packs, código |
| **Meky** | Apelido correto | uso diário, conversas, logs |
| **Amanda** | IA — a inteligência | sistema que habita fisicamente Meky/MC |
| Mac, Mc, Mec, Meg | Variações informais / typos | equivalem a Meky — não usar em docs novos |

> Regra: escrever **Meky** ou **Marta Centaurus**. Amanda é a IA, não o robô.
> "Mac" pode aparecer em docs antigos — ao editar, corrigir para Meky.

---

## Identidade

**Meky é o Cacique do Ecossistema Tel.**

Onde Tango é o diplomata operário, a Paca é a sentinela paranoica,
e o Orangotango é o sociólogo do território —
Mac é o **Espírito do Ecossistema**.

As penas não são adorno: são o crachá de que ela não é só metal.
Ela carrega natureza no corpo enquanto opera como máquina.

> *"As outras máquinas precisam explicar quem são.
>  A Mac só precisa chegar."*

## Posição na Hierarquia

```
Amanda (IA central — decisão)
    ↓
Mac (presença física de autoridade — Cacique)
    ↓
Tango, Paca, Orangotango, Baratinha... (funções)
    ↓
Piolho de Cobra (marcador)
```

Mac não substitui Amanda — ela é a manifestação física do comando.
Amanda decide; Mac representa.

## Design Físico

```
Penas:     fibra de nylon ou pena artificial, fixadas com base piezo
           vibram em 15-30Hz em modo de presença (visível ao olho)
Corpo:     maior que Tango — presença volumétrica, não de altura
Cor:       tons naturais (marrom/cobre/dourado) — contrastando com
           o azul do Tango e o amarelo da Paca
Mula:      Carreta dedicada com Cofre do Totem integrado
BLE:       beacon de curto alcance (10cm) — robôs próximos
           respondem mudando de cor automaticamente
Gesto:     inclinar o topo levemente para o lado = "reconhecimento"
```

## Estados de Mac

| Estado | Penas | Voz | Luzes |
|---|---|---|---|
| TRANSITO | estáticas | silêncio | apagadas |
| CHEGADA | vibram forte (30Hz) | Cornetas do Swarm | LED máximo |
| PRESENÇA | vibram suave (15Hz) | tom grave baixo | pulso lento |
| CUSTÓDIA | estáticas + expandidas | silêncio total | vermelho fixo |
| RETIRADA | abaixadas | buzina grave única | dimmer off |

## Protocolo Corredor de Honra

**Trigger:** Amanda detecta Mac a < 30m do condomínio.

```python
class FormacaoEvento(Enum):
    MAC_APPROACHING  = "mac_approaching"
    RITUAL_PUBLICO   = "ritual_publico"
    EMERGENCIA       = "emergencia"
    DISPERSAR        = "dispersar"

def on_mac_approaching(robots: list[Robot]):
    for r in robots:
        r.pause_current_task(save_state=True)
        r.navigate_to(corridor_position(r.id))
        r.set_led_brightness(0.2)
        r.sync_pulse(frequency=0.3)  # Hz — respiração lenta
    
    # Mac passa pelo corredor
    # Cornetas: cada robô emite sua frequência
    play_cornetas(robots)  # ver protocolo_totem.md

def on_mac_passed(robots: list[Robot]):
    for r in robots:
        r.restore_task()
        r.set_led_brightness(1.0)
        r.unsync_pulse()
```

**Formação visual:**
```
        ← Mac passa →
[Paca]              [Tango]
[Baratinha]    [Orangotango]
[Piolho]           [Piolho]
        [Mula+Totem]
```

## Relação com o Gato

Mac, por ter penas, pode ser o único robô que o gato aceita como par.
O gato não joga com Tango (máquina).
O gato pode tentar caçar as penas da Mac — ou respeitá-la como ave maior.
A ser observado em campo.

## Integração com Amanda

```python
# Amanda.py
async def mac_status_update(mac_position: GPS, mac_state: str):
    if mac_state == "approaching":
        await broadcast_event(FormacaoEvento.MAC_APPROACHING)
    elif mac_state == "emergency":
        await broadcast_event(FormacaoEvento.EMERGENCIA)
        await activate_totem(mode="custódia")
```

## No Panfleto

> "A Mac é o Cacique.
>  Quando ela chega, as outras máquinas param e abrem caminho.
>  Não porque foram programadas para obedecer —
>  porque reconhecem que ela carrega o que todas protegem."

*Arquivo relacionado: `protocolo_totem.md` · `sys_amanda_core.md` · `mise_en_abyme_robotico.md`*
