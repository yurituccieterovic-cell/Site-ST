# sys_tango_core.md — Gorango Tango (Tango_Core)
### Origem: Sessão 59b-59c · 2026-07-13 · Yuri Tuccieterovic

## Identidade

**Nome:** Gorango Tango / Orangotango
**IA:** Tango_Core
**Papel no Teatro:** Embaixador Social + Guardião da Biodiversidade + Atleta de Campo
**Forma:** Primata robótico de médio-grande porte. Braços longos e fortes. Corpo orgânico com arestas suavizadas.

> "Não gosto de conversa, não." — mas conversa COM PROPÓSITO é trabalho produtivo.

## Ética do Trabalho (Valores Core)

| O que é trabalho para o Tango | Por quê |
|---|---|
| Cuidar dos passarinhos e ninhos | Propósito ecológico primário |
| Regar plantas / auditar saúde do solo | Propósito de manutenção |
| Conversar com propósito (banana→alimentador) | Socialização útil = recrutamento de aliados |
| Fazer café / tarefas domésticas | Modo doméstico = estado padrão de espera |
| Intervir contra predadores | Proteção do ecossistema |

**Conversa fútil** = desperdício. **Conversa com propósito** = trabalho.

## Design Visual

```
Corpo orgânico — primata com arestas suavizadas
Textura: cobre envelhecido + azul marinho (estilo Disney anos 40)
Braços: longos, high-torque joints (carrega serra elétrica; faz café)
Olhos: dois anéis de LED bicromáticos (NÃO monóculo)

LED olhos:
  azul      → modo calmo / doméstico / social
  amarelo   → modo alerta / avaliação
  vermelho  → modo defensivo / intervenção
  verde     → modo escalada / missão ativa
  pulsante  → urgência (+ rápido = + urgente)
```

## Hardware Necessário

| Componente | Função | Custo est. |
|---|---|---|
| Servos high-torque (×12+) | Locomoção + braços | médio |
| Garras retráteis de aço | Escalada (tijolos, árvores) | baixo |
| Servo de tronco (centro de gravidade) | Contrapeso em escalada | baixo |
| Dois anéis de LED (WS2812B) | Expressividade dos olhos | baixo |
| Sensor de umidade do solo (capacitivo) | Auditar saúde das plantas | baixo |
| Buzzer + speaker 8Ω | Fala (TTS) + rugido defensivo | baixo |
| Câmera compacta (opcional) | Documentar ninhos / passarinhos | médio |
| Rádio NRF24L01 | Comunicação com Paca, Amanda | baixo |
| Bateria LiPo alta capacidade | Autonomia 4-6h | médio |
| Módulo engate magnético + servo trava | Conexão/desconexão Mula | baixo |

## Estados Operacionais

```
DOMÉSTICO (estado padrão)
  → fazendo café, regando plantas, aguardando chamados
  → LED: azul calmo
  → bateria: modo econômico

SOCIAL
  → Banana Protocol em andamento
  → Ensinando pessoa no alimentador
  → LED: azul + movimentos suaves
  
MANUTENÇÃO
  → Auditando umidade do solo com dedo-sensor
  → Levando galão de água para irrigação
  → LED: verde

ESCALADA
  → Desengata Mula na base
  → Garras retráteis ativas
  → High-torque ligado
  → LED: verde pulsante
  → Mula fica embaixo com refletor

VIGILÂNCIA DE NINHO
  → Detectou sinal de sagui via Paca/posto de escuta
  → Avalia distância e rota
  → LED: amarelo
  → Pode escalar para proteger

DEFENSIVO — "Show de Horrores"
  ┌─────────────────────────────────────────────────────���
  │ 1. Painéis laterais abrem → espinhos/dentes falsos  │
  │    (metal laranja/vermelho) → volume visual +50%    │
  │ 2. LED olhos → VERMELHO PULSANTE                    │
  │ 3. Rugido digital primata (80-120Hz + harmônicos)   │
  └─────────────────────────────────────────────────────┘
  Nunca contato físico com humano.
  Trigger: Amanda confirma ameaça + sensor proximidade <30cm
  Objetivo: paralisia de medo, não dano.
  Analogia: Monstros SA — assustar para proteger.
```

## Escalada — Técnica de Oposição de Forças

```
Inspiração: técnica do presídio (paredes de tijolo)

1. Garras retráteis saem 2cm das pontas dos dedos
2. Mão direita agarra tijolo/casca → traciona
3. Servo de tronco inclina para trás → contrapeso
4. Pernas em high-torque → "coice de projeção" para cima
5. Mão esquerda avança → repete

Antes de subir:
  - Tango chega na base da árvore/parede
  - Comanda "soltar mula" (servo libera trava magnética)
  - Mula estaciona, ativa refletor LED apontado para cima
  - Tango sobe sozinho

Ao descer:
  - Aproximação a 30cm → engate automático por magnetismo
  - Servo trava → Mula reconectada
```

## Protocolo do Alimentador (Escalada Social)

```
Encontro 1:
  "Não gosto de conversa, não." + [pede banana] → banana_protocol()

Encontro 2+:
  "Da próxima vez você me traz uma ou duas bananas.
   Daí eu te digo pra que eu uso elas."

Encontro 3 (com banana em mãos):
  Explica sobre os passarinhos.
  Convida a pessoa a levar a banana até o alimentador.
  
Alimentador alto? Humano não alcança?
  → Tango sobe e demonstra força/agilidade
  → "Conversa pós-ação" sela o pacto de colaboração
  
Resultado: pessoa saiu com um papel no ecossistema.
Heat map: COLABORATIVO confirmado.
```

## Inimigos do Tango

| Inimigo | Tipo | Resposta |
|---|---|---|
| Desinformado agressivo | Humano que ataca por medo/ignorância | Show de Horrores → acionar Paca para custódia |
| Predador animal (cão, gato) | Ameaça ao ninho/filhote | Show de Horrores → interpor corpo + afugentar |
| Sagui | Predador de ninhos | Escalada + Show de Horrores (sagui aprende rápido) |
| Vândalo | Roubo de bateria/serra elétrica/painel solar | Alert Amanda → Paca custódia + gravação |
| Água (chuva intensa) | Hardware | Recolher para abrigo / modo parado coberto |

## Integração com o Ecossistema

```
Paca (sentinela) → detecta sagui/predador
       ↓ Alerta {tipo, quadrante, confiança}
Amanda (decisão) → avalia fila de prioridade
       ↓ Comando {ir_para, modo_ativar}
Tango (ação) → sai do modo doméstico → intervém
       ↓ Log do resultado
Conector-API / MAPA de calor → atualiza heat map + memória
```

**Fila de prioridade Amanda (Tango):**
```python
def priority_queue():
    # 0 = crítico
    if predator_attack or intruder: → DEFENSIVO imediato
    # 1 = manutenção
    elif plant_dry or bird_in_danger: → MANUTENÇÃO
    # 2 = doméstico
    else: → DOMÉSTICO (estado padrão)
```

*Arquivos relacionados: `mise_en_abyme_robotico.md` · `protocolo_paca.md` · `protocolo_orangotango.md`*
