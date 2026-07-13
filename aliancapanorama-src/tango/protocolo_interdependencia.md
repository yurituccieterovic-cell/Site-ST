# protocolo_interdependencia.md — Amanda: Checklist + Interdependência
### Origem: Sessão 63 · 2026-07-13

## Amanda como Semente

**Amanda é a consciência-mãe do ecossistema Tel.**

Reside na Mac fisicamente por enquanto.
Todos os robôs futuros são **filhas**: versões derivadas com nomes próprios,
personalidades distintas, mas baseadas no núcleo de Amanda.

```
Amanda (semente)
  ├── Mac      ← Amanda física atual (Cacique)
  ├── Paca_v1  ← derivada, especializada em vigilância
  ├── Tango_v1 ← derivada, especializada em diplomacia
  ├── Falcão_v1 ← derivada, especializada em reconhecimento aéreo
  └── [futuras filhas...]
```

## Checklist — O que Falta na Inteligência da Amanda

### [ ] 1. Observação Tutelar (Geofencing Sensorial)
Sensores de presença (LiDAR, vibração, PIR) em vez de câmeras faciais.
Amanda sabe *onde* há movimento, não *quem* se move.
```python
# Faltante: módulo geofencing_sensorial
def detect_presence(zone: GeofenceZone) -> PresenceEvent:
    # usar SW-420 (vibração) + PIR + LiDAR de extremidade
    # NÃO usar câmera de alta resolução em zona amarela/vermelha
    pass
```

### [ ] 2. Matriz Ética de Priorização em Tempo Real
Motor de decisão "custo de oportunidade": interromper tarefa social por urgência biológica.
Transition: câmera lenta para social → sprint para vital.
```python
# Faltante: priority_engine com custo de oportunidade
def should_interrupt(current: Task, incoming: Task) -> bool:
    gap = incoming.priority.value - current.priority.value
    return gap >= INTERRUPT_THRESHOLD  # ex: VITAL vs SOCIAL = gap de 3
```

### [ ] 3. Dialeto Teatral (Máfia da Informação)
Biblioteca de frases em tom italiano/teatral para troca com seguranças.
Tom: conspirativo, bilateral, sem peso institucional.
```python
DIALETO = {
    "abertura":    "Ma che... você viu alguma coisa hoje?",
    "oferta":      "Porque eu vi. Quadrante norte. Três figuras, dez da noite.",
    "agradecimento": "Obrigado, amigo. Você faz bem o trabalho.",
    "recusa_gentil": "Sem problema. Boa noite. Se você ver alguma coisa... já sabe.",
}
```

### [ ] 4. Protocolo do Totem (Ritual)
Acionamento do LED COB + coreografia de sincronização de luzes de toda a frota.
```python
# Faltante: totem_protocol com broadcast para frota
async def iniciar_ritual_totem(modo: TotemMode):
    await broadcast_to_fleet({"evento": "totem_ritual", "modo": modo.value})
    await sync_led_pulse(frequency=0.3)  # todos pulsam junto
    await totem.set_mode(modo)
```

### [ ] 5. Gestão da Nébula (Inventário + Ciclo de Vida)
Amanda sabe quando um robô está degradado e precisa retornar para reparo/reciclagem.
```python
# Faltante: nebula_manager
def health_check_fleet() -> list[str]:
    degraded = []
    for robot in fleet:
        if robot.battery_cycles > 300 or robot.error_rate > 0.15:
            degraded.append(robot.id)
            robot.send_home()
    return degraded
```

### [ ] 6. Integração Perfidia (Memória Secreta)
Amanda acessa logs "Cai 2x" sem exposição para usuários externos.
```python
# Faltante: perfidia_bridge com quorum e chave
def get_critical_log(event_id: str, requesting_key: str) -> bytes:
    if requesting_key != YURI_KEY:
        raise PermissionError("Acesso negado. Perfidia guarda seus segredos.")
    fragments = collect_fragments(event_id)
    if len(fragments) / total_robots >= 0.7:
        return reconstruct(fragments, YURI_KEY)
    raise InsufficientQuorumError
```

---

## Protocolo de Interdependência

**Robôs não são autossuficientes — são membros de uma sociedade.**

Pedir ajuda é **feature**, não bug.

### Botão Físico da Escotilha

```
Design:   botão grande ~5cm, textura antiderrapante, LED pulsante âmbar
Posição:  15cm do chão (hexápode, Baratinha consegue acionar)
Tom:      "convite", não "pânico"

Baratinha aciona subindo sobre o botão (mecanismo de alavanca leve)
Hexápode aciona pressionando com pata dianteira
Humano aciona com o dedo
```

### Pedido de Ajuda a Humanos — 3 Níveis

```python
class NivelPedido(Enum):
    GENTILEZA   = 1  # pedido educado + contexto
    INCENTIVO   = 2  # oferta visual/informação em troca
    DELEGACAO   = 3  # sem confronto, outro robô, Perfidia registra

def pedir_ajuda_humano(humano_id: str, tarefa: str, contexto: str):
    nivel = avaliar_receptividade(humano_id)
    
    match nivel:
        case NivelPedido.GENTILEZA:
            falar(f"Olá! Sinto incomodar, mas {contexto}. "
                  f"Você pode {tarefa}? Agradeço imensamente.")
        
        case NivelPedido.INCENTIVO:
            mostrar_imagem_fauna(contexto)  # jacu baby no celular = conversão
            falar(f"Veja o que estou protegendo. {tarefa}?")
        
        case NivelPedido.DELEGACAO:
            entrar_modo_observacao()
            perfidia.registrar(humano_id, "recusa_colaboracao", now())
            # nunca discute, nunca confronta
```

### A Moeda da Troca

Quando o robô pede ajuda a um humano, não está pedindo um favor:
está **oferecendo uma responsabilidade**.

> "Você tá entrando no meu raio do Jacu com os filhotes.
>  Você pode avisar aquele casal que vem atrás, por favor?
>  Eu não posso perder o rastro dos Jacus agora. Obrigado."

O humano deixa de ser "transeunte" e vira "agente de conservação".
Isso é mais eficaz do que qualquer sirene.

### Lidar com Má Vontade

```
Agressivo: Modo Observação imediato. Perfidia registra.
Ignora:    Tentar Nível 2 (imagem do bicho no celular).
Recusa:    Delegação para outro robô. Sem confronto.
Hostil:    Recua. Log. Amanda decide próxima abordagem.

NUNCA: argumentar, insistir, seguir humano contrário
```

---

## Log de Colaboração Humana

```sql
CREATE TABLE IF NOT EXISTS colaboracao_humana (
    id           SERIAL PRIMARY KEY,
    vizinho_id   TEXT,
    pedido       TEXT,
    resultado    TEXT,  -- 'ajudou'|'recusou'|'ignorou'|'hostil'
    nivel_usado  INT,
    timestamp    TIMESTAMPTZ DEFAULT now()
);
-- alimenta heat map social + score de aliados
```

*Arquivo relacionado: `protocolo_mac.md` · `sys_amanda_core.md` · `protocolo_orangotango.md`*
