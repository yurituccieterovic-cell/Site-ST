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

## Integração com Amanda (próximos passos)
1. Traduzir estados para `amanda.py`: cada função C++ vira um comando enviado ao Arduino via serial
2. Adicionar leitura de vibrissas: `digitalRead(PIN_VIBRISSA_EF)` → gatilho de patada
3. Definir máquina de estados: LIVRE → [ameaça detectada] → DEFESA → [janela aberta] → ATAQUE
4. Registrar no Conector como especificação de comportamento da Amanda

---

## Referência de Pinos (MC/Marta Centaurus)
> Preencher com os pinos reais do hardware quando disponível.
> Hoje o código usa pinos 2–7 como exemplo — ajustar para os pinos físicos do shield do MC.
