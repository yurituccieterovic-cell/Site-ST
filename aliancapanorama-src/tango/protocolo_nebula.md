# protocolo_nebula.md — Nébula Eletrônica
### Origem: Sessão 62 · 2026-07-13

## Conceito

**A Nébula é a fábrica-mãe do ecossistema.**

Não é depósito. É célula de montagem compacta que produz,
repara, atualiza e recicla os robôs da Exosfera Tel.

> *"Nada se perde. Tudo se transforma na Nébula."*

## Localização

Casa de Yuri = coração do sistema.

```
[Casa Yuri]
  ├── QG (Amanda, Conector, logs)
  ├── Nébula (impressora 3D + braço robótico + estoque)
  ├── Hangar (Falcão + escotilha no telhado)
  └── Carregadores (frota terrestre em standby)

[Condomínio]
  ├── Bases-ninho nas árvores (recarga distribuída)
  ├── Postos de Escuta PVC (bioacústica)
  └── Pontos de Observação (extremidades, zona verde)
```

## Padrão Tel — Modularidade

Toda a frota compartilha as mesmas peças base:

| Componente | Frota Felina | Tango/Paca | Falcão |
|---|---|---|---|
| Motor | N20 6V | N20 6V / MG996R | Brushless 1104 |
| Bateria | 18650 × 2 | 18650 × 4 | LiPo 450mAh |
| MCU | ESP32 | ESP32 / RPi Zero | ESP32 + F405 |
| Rádio | NRF24L01 | NRF24L01 / LoRa | LoRa |
| Chassis | PLA+ impresso | PLA+ impresso | Carbono/PLA |

## Ciclo de Vida dos Robôs

```
NASCIMENTO
  Nébula imprime chassis + monta peças
  Boot: carrega personalidade (Paca_v1, Tango_v2, etc.)
  Teste de campo: 24h supervisionado
       ↓
OPERAÇÃO
  Serviço normal no condomínio
  Retorna à base para recarga (bases-ninho ou QG)
  Amanda monitora saúde: bateria, erros, desgaste
       ↓
MANUTENÇÃO
  Retorno à Nébula para troca de peça desgastada
  Peça velha: reciclada ou reaproveitada em outro robô
       ↓
APOSENTADORIA
  Chassis desmontado → PLA reciclado → novo filamento
  Eletrônica: doada para robô mais novo como upgrade
  "Memória" do robô: transferida para o sucessor
```

## DNA de Personalidade (Boot)

Cada robô nasce com um perfil de personalidade pré-instalado:

```python
PERSONALIDADES = {
    "paca":       {"paranoia": 0.9, "velocidade": 0.8, "zoeira": 0.1},
    "tango":      {"paranoia": 0.1, "velocidade": 0.5, "zoeira": 0.6},
    "orangotango":{"paranoia": 0.2, "velocidade": 0.3, "zoeira": 0.9},
    "felino":     {"paranoia": 0.7, "velocidade": 0.9, "zoeira": 0.0},
    "falcao":     {"paranoia": 0.5, "velocidade": 1.0, "zoeira": 0.2},
}

def boot_robot(tipo: str, serial: int) -> RobotConfig:
    base = PERSONALIDADES[tipo]
    return RobotConfig(
        id=f"{tipo}_{serial:03d}",
        personalidade=base,
        zona_primaria=assign_zone(tipo),
        walkie_id=None  # atribuído se tiver dono humano
    )
```

## Escalonamento por Demanda

```python
def nebula_decide_producao(stats: CondominioStats) -> list[str]:
    fila = []
    if stats.gatos_sem_acompanhante > 2:
        fila.append("felino")
    if stats.incidents_last_week > 3:
        fila.append("paca")
    if stats.aves_predadas_last_month > 5:
        fila.append("falcao")
    if stats.walkie_requests_sem_resposta > 0:
        fila.append("tango")
    return fila
```

## Walkie-talkie — Produção e Distribuição

Hardware simples produzido pela própria Nébula:

```
ESP32-C3 + LoRa SX1276 + speaker 8Ω + mic eletreto + botão PTT
Custo: ~R$45/unidade
```

**Protocolo:**
1. Vizinho aperta PTT, fala
2. Whisper (local) transcreve
3. Amanda roteia para robô responsável
4. Robô responde em voz (XTTS-v2 local)

**Personalização:** sticker com nome do usuário + nome do robô parceiro.
O vizinho não é vigiado — é usuário. Faz toda a diferença.

## Bases-Ninho nas Árvores

```
Caixa PVC cinza 10×8×6cm
  → colada em galho com abraçadeira (não fere a árvore)
  → bateria LiPo 3000mAh + carregador solar MPPT
  → conector XT30 pogo pin (robô pousa sem plugar)
  → painel solar flexível 5W no tronco, lado sul
  → SEM câmera, SEM microfone (só energia)

Secretas porque:
  - não roubadas (o que não é visto não é cobiçado)
  - não vandalizadas
  - ético: servem apenas aos próprios robôs
```

*Arquivo relacionado: `protocolo_falcao.md` · `mise_en_abyme_robotico.md` · `sys_amanda_core.md`*
