# amanda_mma_protocolo.md — Protocolo MMA da Amanda
### MMA = Mecânica de Manobra e Ataque · 2026-07-10

> Folha de referência para a IA Amanda (borda física da MC/Marta Centaurus).
> Contém: lógica de combate, estados do hexápode, código C++/Arduino base.

---

## Conceito
Amanda usa a vantagem de 6 patas para criar base estável durante combate:
- **3–4 patas = âncora** (travam o chassi no chão como uma rocha)
- **2–3 patas livres = ataque/manobra**

Gatilhos: sensores táteis (vibrissas de estanho) ou sonar acusam ameaça/contato → Amanda dispara estado de combate.

---

## Sensores Táteis — Vibrissas de Estanho
Hastes metálicas na ponta das patas frontais com bolotinha de estanho soldada na ponta.
- Visual: antenas táteis de inseto / vibrissas de criaturas abissais
- Função: detectar contato antes do sensor de distância (reação mais rápida)
- Implementação: `digitalRead()` em pino do fio das vibrissas — contato fecha o circuito → LOW

---

## Estados de Combate

### Estado 1: DEFESA — "Modo Tartaruga" (Plastrão no Chão)
- Encolhe todas as 6 patas → corpo desce, peito de aço/chassi toca o chão
- Casco de pirâmides absorve impacto por cima
- Centro de gravidade mínimo → impossível virar

### Estado 2: ATAQUE — "Patada de Jacu" (Frente Esquerda)
- Base tripodal: Pata Direita Frente + Esquerda Meio + Direita Trás seguram o peso
- Pata Esquerda Frente carrega para trás → chicoteia para frente com torque máximo

### Estado 3: IMPACTO — "Investida Santo Antônio" (Chifre Corporal)
- Inclina frente para baixo (chifres/mandíbula apontam para o alvo)
- 4 patas traseiras empurram o chassi para frente com propulsão

### Estado 0: MODO LIVRE (neutro)
- Todos os servos em 90° — posição de rali estável

---

## Código C++/Arduino (base conceitual)

```cpp
/* 
   ===================================================================
   MEKY - PROTOCOLO MMA (Mecânica de Manobra e Ataque) para AMANDA
   ===================================================================
   Foco: Estabilidade de Rali, Defesa de Carapaça e Patada Cefálica
   Origem: conversa Yuri + Claude.ai, registrado Sessão 36 (2026-07-10)
*/

#include <Servo.h>

// Pinos dos servos de articulação/ombro
const int PATA_DIREITA_FRENTE  = 2;
const int PATA_ESQUERDA_FRENTE = 3;
const int PATA_DIREITA_MEIO    = 4;
const int PATA_ESQUERDA_MEIO   = 5;
const int PATA_DIREITA_TRAS    = 6;
const int PATA_ESQUERDA_TRAS   = 7;

Servo servoDF, servoEF, servoDM, servoEM, servoDT, servoET;

void setup() {
  servoDF.attach(PATA_DIREITA_FRENTE);
  servoEF.attach(PATA_ESQUERDA_FRENTE);
  servoDM.attach(PATA_DIREITA_MEIO);
  servoEM.attach(PATA_ESQUERDA_MEIO);
  servoDT.attach(PATA_DIREITA_TRAS);
  servoET.attach(PATA_ESQUERDA_TRAS);
  configurarModoLivre();
}

// ESTADO 1: Defesa — Modo Tartaruga (Plastrão no Chão)
void aplicarDefesaPlastrao() {
  servoDF.write(160);
  servoEF.write(20);
  servoDM.write(160);
  servoEM.write(20);
  servoDT.write(160);
  servoET.write(20);
}

// ESTADO 2: Ataque — Patada de Jacu (Frente Esquerda)
void desferirPatadaEsquerda() {
  // Trava base tripodal
  servoDF.write(90);
  servoEM.write(110);
  servoDT.write(110);
  delay(100);
  // Carrega (puxa para trás)
  servoEF.write(150);
  delay(150);
  // IMPACTO (chicoteia para frente)
  servoEF.write(10);
  delay(200);
  configurarModoLivre();
}

// ESTADO 3: Impacto — Investida Santo Antônio (Chifre Corporal)
void executarInvestidaChifre() {
  // Inclina frente para armar os chifres
  servoDF.write(110);
  servoEF.write(70);
  // Propulsão das 4 patas traseiras
  servoDM.write(40);
  servoEM.write(140);
  servoDT.write(40);
  servoET.write(140);
  delay(300);
  configurarModoLivre();
}

// ESTADO 0: Modo Livre (neutro/rali)
void configurarModoLivre() {
  servoDF.write(90);
  servoEF.write(90);
  servoDM.write(90);
  servoEM.write(90);
  servoDT.write(90);
  servoET.write(90);
}

void loop() {
  // Amanda lê sensores (vibrissas de estanho + sonar) e dispara estados:
  // aplicarDefesaPlastrao() | desferirPatadaEsquerda() | executarInvestidaChifre()
}
```

---

## Modo de Torque Dinâmico (MTD)

### Conceito
Servos passam boa parte do tempo segurando posição (hold) — isso aquece e consome energia sem utilidade.
O MTD divide o comportamento em 3 estados com histerese para evitar desgaste por alternância brusca:

| Estado | Trigger | Servos | Energia |
|---|---|---|---|
| `IDLE` | parado, sem ameaça | `detach()` em 4 patas; 2 patas-base em hold suave | mínima |
| `DEFENSE` | ameaça detectada / defendendo | hold firme nas 3 patas-âncora; aliviar as 3 livres | moderada |
| `ATTACK` | ataque / MMA ativo | todos servos em `attach()` + torque máximo | burst curto (≤ 500ms) |

**Regras de histerese:**
- Tempo mínimo em IDLE antes de subir para DEFENSE: 500ms
- Burst de ATTACK: máximo 500ms → retorno automático para DEFENSE ou IDLE
- Temperatura > limiar: forçar IDLE independente do estado

### Código C++ — Torque Dinâmico

```cpp
/*
   ===================================================================
   MEKY — MODO DE TORQUE DINÂMICO (MTD) para AMANDA
   ===================================================================
   Integra com o Protocolo MMA (estados LIVRE / DEFESA / PATADA / INVESTIDA).
   Sessão 37 · 2026-07-10
*/

#include <Servo.h>

// Pinos de sinal dos servos (ajustar para o hardware real do MC)
const int PINOS_SERVO[] = {2, 3, 4, 5, 6, 7};
const int N_SERVOS = 6;
Servo servos[N_SERVOS];

// Pata 0=DF, 1=EF, 2=DM, 3=EM, 4=DT, 5=ET
// Patas-âncora (base tripodal padrão): DF(0), EM(3), DT(4)
const int PATAS_ANCORA[] = {0, 3, 4};
const int N_ANCORA = 3;

// Estados MTD
enum EstadoTorque { IDLE, DEFENSE, ATTACK };
EstadoTorque estadoAtual = IDLE;
unsigned long entradaEstado = 0;

// Histerese
const unsigned long IDLE_MIN_MS    = 500;
const unsigned long ATTACK_MAX_MS  = 500;   // burst máximo — protege servos

// Posição neutra de repouso
const int ANGULO_NEUTRO = 90;

// ── Funções de Torque ──────────────────────────────────────────────

bool ehAncora(int idx) {
  for (int i = 0; i < N_ANCORA; i++)
    if (PATAS_ANCORA[i] == idx) return true;
  return false;
}

// IDLE: desconecta todas exceto 2 patas-âncora (segurar o chassi)
void aplicarIdle() {
  for (int i = 0; i < N_SERVOS; i++) {
    if (i == PATAS_ANCORA[0] || i == PATAS_ANCORA[1]) {
      // mantém attach com ângulo neutro — suporte mínimo
      if (!servos[i].attached()) servos[i].attach(PINOS_SERVO[i]);
      servos[i].write(ANGULO_NEUTRO);
    } else {
      // desconecta PWM — servo fica mole, motor descansa
      servos[i].detach();
    }
  }
}

// DEFENSE: hold firme nas 3 âncoras; livres em neutro sem hold
void aplicarDefense() {
  for (int i = 0; i < N_SERVOS; i++) {
    if (ehAncora(i)) {
      if (!servos[i].attached()) servos[i].attach(PINOS_SERVO[i]);
      // manter ângulo atual — não escrever para não tremer
    } else {
      if (!servos[i].attached()) servos[i].attach(PINOS_SERVO[i]);
      servos[i].write(ANGULO_NEUTRO);  // neutro sem esforço
    }
  }
}

// ATTACK: todos attach + executa a manobra MMA
void aplicarAttack() {
  for (int i = 0; i < N_SERVOS; i++) {
    if (!servos[i].attached()) servos[i].attach(PINOS_SERVO[i]);
  }
  // A manobra MMA é executada externamente após chamar aplicarAttack()
}

// ── Máquina de Estados MTD ─────────────────────────────────────────

void setEstadoTorque(EstadoTorque novo) {
  if (novo == estadoAtual) return;
  estadoAtual = novo;
  entradaEstado = millis();
  switch (novo) {
    case IDLE:    aplicarIdle();    break;
    case DEFENSE: aplicarDefense(); break;
    case ATTACK:  aplicarAttack();  break;
  }
}

// Chamado no loop() — cuida do burst máximo e retorno automático
void tickMTD() {
  unsigned long agora = millis();
  if (estadoAtual == ATTACK && (agora - entradaEstado) >= ATTACK_MAX_MS) {
    setEstadoTorque(DEFENSE);  // burst encerrado → volta para defesa
  }
}

// ── Integração com MMA Serial ──────────────────────────────────────
// Amanda.py envia: "MTD:IDLE\n" | "MTD:DEFENSE\n" | "MTD:ATTACK\n"
// Amanda.py envia: "MMA:DEFESA\n" | "MMA:PATADA_EF\n" | "MMA:INVESTIDA\n"

void processarSerial(String cmd) {
  cmd.trim();
  if (cmd.startsWith("MTD:")) {
    String estado = cmd.substring(4);
    if (estado == "IDLE")    setEstadoTorque(IDLE);
    if (estado == "DEFENSE") setEstadoTorque(DEFENSE);
    if (estado == "ATTACK")  setEstadoTorque(ATTACK);
  }
  if (cmd.startsWith("MMA:")) {
    // Garante ATTACK antes de qualquer manobra
    setEstadoTorque(ATTACK);
    String manobra = cmd.substring(4);
    if (manobra == "DEFESA")    aplicarDefesaPlastrao();
    if (manobra == "PATADA_EF") desferirPatadaEsquerda();
    if (manobra == "INVESTIDA") executarInvestidaChifre();
  }
}

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < N_SERVOS; i++) {
    servos[i].attach(PINOS_SERVO[i]);
    servos[i].write(ANGULO_NEUTRO);
  }
  delay(500);
  setEstadoTorque(IDLE);  // começa economizando
}

void loop() {
  tickMTD();  // checa burst timeout
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    processarSerial(cmd);
  }
}
```

## Integração com Amanda (próximos passos)
1. Traduzir estados para `amanda.py`: cada função C++ vira um comando enviado ao Arduino via serial
2. Adicionar leitura de vibrissas: `digitalRead(PIN_VIBRISSA_EF)` → gatilho de patada
3. Definir máquina de estados: LIVRE → [ameaça detectada] → DEFESA → [janela aberta] → ATAQUE
4. Registrar no Conector como especificação de comportamento da Amanda

---

## Protocolo Canto do Cisne — Energia Crítica

### Hardware gratuito: divisor de tensão
```
Bateria 18650 (+) ──[10kΩ]──┬──[10kΩ]── GND
                             │
                           Pino A0 (Arduino)
```
Resistores 10kΩ que já estão na bancada = custo R$0.
Arduino lê A0 (0–1023) → converte para tensão → porcentagem → envia "BAT:xx.x\n" via serial.

### Código C++ — Bateria + CISNE

```cpp
// ── Leitura de bateria (ADC gratuito) ─────────────────────────────────────
const int PIN_BAT       = A0;
const float V_MAX_BAT   = 4.2;  // 18650 carregada
const float V_MIN_BAT   = 3.0;  // 18650 descarregada (não descer abaixo disso)
const float V_REF       = 5.0;  // tensão de referência do Arduino (5V)
const float DIVISOR     = 0.5;  // dois resistores iguais = 1/2 da tensão real
unsigned long ultimaLeituraBat = 0;
const unsigned long BAT_INTERVALO_MS = 10000;  // reporta a cada 10s

float lerBateriaPct() {
  int raw = analogRead(PIN_BAT);
  float v_adc  = raw * (V_REF / 1023.0);
  float v_real = v_adc / DIVISOR;
  float pct    = ((v_real - V_MIN_BAT) / (V_MAX_BAT - V_MIN_BAT)) * 100.0;
  return constrain(pct, 0.0, 100.0);
}

// ── Protocolo CISNE ────────────────────────────────────────────────────────
void executarCisneRetorno() {
  // Desliga LEDs e sensores secundários para economizar
  // (ajustar pinos conforme hardware real)
  // Ativa locomoção mínima para retorno ao ninho
  aplicarIdle();  // recolhe as patas não-âncora
  Serial.println("CISNE:RETORNO_ATIVO");
}

void executarCisneHibernar() {
  // Recolhe TODAS as patas — postura de repouso absoluto
  for (int i = 0; i < N_SERVOS; i++) {
    servos[i].write(ANGULO_NEUTRO);
    delay(50);
    servos[i].detach();  // desconecta PWM — servos relaxam sem consumo
  }
  Serial.println("CISNE:HIBERNANDO");
}

// ── Integração no processarSerial() ───────────────────────────────────────
// Adicionar dentro de processarSerial(cmd):
//
//   if (cmd.startsWith("CISNE:")) {
//     String acao = cmd.substring(6);
//     if (acao == "RETORNO")  executarCisneRetorno();
//     if (acao == "HIBERNAR") executarCisneHibernar();
//   }

// ── No loop() ─────────────────────────────────────────────────────────────
// Adicionar dentro de loop():
//
//   unsigned long agora = millis();
//   if (agora - ultimaLeituraBat >= BAT_INTERVALO_MS) {
//     float pct = lerBateriaPct();
//     Serial.print("BAT:"); Serial.println(pct, 1);
//     ultimaLeituraBat = agora;
//   }
```

### Fluxo de estados de energia

```
Amanda boot → OPERACIONAL → captura frames → mapa topológico
                │
              BAT < 20% → ALERTA (avisa Dodge, continua missão)
                │
              BAT < 10% → RETORNO_CRITICO (Canto do Cisne: vai ao ninho)
                │
              BAT <  5% → HIBERNACAO (para onde está, recolhe patas, dorme)
                │
              (recarregou) → OPERACIONAL
```

### Mapeamento 3D — ferramentas gratuitas

| Ferramenta | Custo | O que faz |
|---|---|---|
| OpenCV (`pip install opencv-python`) | R$0 | Detecta features ORB em cada frame |
| NumPy (`pip install numpy`) | R$0 | Processa arrays de descritores |
| JSON nativo do Python | R$0 | Persiste o mapa em `/tmp/amanda_mapa.json` |
| Câmera do DODGE (Quebradinha) | R$0 | Já existe — expõe GET /api/camera/frame |

**Fluxo acordado → sonho:**
```
Missão de escolta
  → DODGE captura frame a cada 5s
  → Amanda extrai ORB features (≥5 keypoints → nó válido)
  → Salva nó em amanda_mapa.json

Ciclo de sonho (3h)
  → Amanda remove nós com < 8 features (ruído)
  → Gera resumo: N nós limpos, M ruídos removidos
  → Salva mapa consolidado
  → ISA recebe "[AMANDA-SONHO-MAPA] X nós" na memória
```

## Referência de Pinos (MC/Marta Centaurus)
> Preencher com os pinos reais do hardware quando disponível.
> Hoje o código usa pinos 2–7 como exemplo — ajustar para os pinos físicos do shield do MC.

---

## MODO CARRETA — "Comboio Vivo" (2026-07-12)

> Adicionado após criação da Mula (módulo de carga para MC Marta).
> Referência completa: `tango/mula_carreta.md`

### Flag de Estado
```cpp
bool CARRETA_ATTACHED = false; // setar true quando engate conectado
```

### Parâmetros dinâmicos (adicionar no setup/loop Arduino)
```cpp
float largura_efetiva;
float acel_max;

if (CARRETA_ATTACHED) {
  largura_efetiva = LARGURA_CORPO * 1.5;  // buffer segurança
  acel_max        = ACEL_NORMAL   * 0.70;  // evitar chicote
} else {
  largura_efetiva = LARGURA_CORPO;
  acel_max        = ACEL_NORMAL;
}

// Sensor de desvio com buffer ampliado:
if (distancia_sensor < largura_efetiva) {
  RECALCULATE_PATH();
}
```

### Estado 5: MODO COMBOIO (CARRETA_ATTACHED = true)
- Amanda processa carreta como **segundo corpo físico acoplado**
- Curvas: aplica raio de giro ampliado (carreta "corta caminho")
- Obstáculo de "passagem" → pode virar obstáculo de "tangência"
- Paradas: reduz aceleração máxima 30% para evitar efeito pêndulo
