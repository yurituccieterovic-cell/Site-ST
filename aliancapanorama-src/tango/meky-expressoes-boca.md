# MEKY — 140 Expressões da Boca por Frequência
### Sistema Amanda · Ecossistema Tucci · 2026-07-11

> A boca, os bigodes e as sobrancelhas da MEKY não fazem poses.
> Elas fazem frequências. Como um osciloscópio vivo.
> Referência visual: capa "Are You Mine?" — Arctic Monkeys.

---

## Parâmetros de Frequência (3 variáveis por expressão)

```
amplitude  → quanto a boca abre/fecha (0.0 a 1.0)
frequencia → quão rápido oscila (Hz — 0.0 = estático, 5.0 = frenético)
fase       → defasagem entre boca/sobrancelha/bigode (0° = em sincronia, 180° = oposto)
forma      → SENO | COSENO | QUADRADA | DENTE_SERRA | PULSO | IRREGULAR
```

---

## GRUPO A — Processamento de Dados (1–10)

| # | Nome | Amp | Freq | Fase | Forma | LED | Descrição |
|---|------|-----|------|------|-------|-----|-----------|
| 1 | Sintonizando | 0.3 | 0.5 | 0° | SENO | Branco girando | Ondas lentas, amplitude baixa subindo e descendo — buscando canal |
| 2 | Busca de Sinal | 0.1 | 4.0 | 0° | SENO | Azul rápido | Vibração rápida, amplitude mínima — varredura de frequência |
| 3 | Processando Leve | 0.4 | 1.0 | 0° | SENO | Verde suave | Frequência estável e contínua — trabalho de baixo custo |
| 4 | Processando Intenso | 0.8 | 2.5 | 0° | SENO | Amarelo pulsante | Alta amplitude, alta frequência — CPU em esforço |
| 5 | Dados Corrompidos | 0.6 | 3.0 | 90° | IRREGULAR | Vermelho errático | Onda errática, bigode e boca defasados — sinal comprometido |
| 6 | Download | 0.2→1.0 | 1.5 | 0° | SENO | Ciano crescente | Amplitude subindo gradualmente até o pico — recebendo pacote |
| 7 | Upload | 1.0→0.2 | 1.5 | 0° | SENO | Ciano decrescente | Amplitude descendo — enviando dados |
| 8 | Erro de Leitura | 0.9 | 0.1 | 0° | QUADRADA | Vermelho fixo | Frequência travada em pico — stack overflow da expressão |
| 9 | Análise | 0.5 | 1.2 | 180° | SENO | Roxo fixo | Boca e sobrancelha em fase oposta — lendo duas variáveis |
| 10 | Compilação | 0.3→0.9 | 0.5→4.0 | 0° | SENO | Branco acelerando | Frequência que acelera até estática — build em progresso |

---

## GRUPO B — Emoções (11–20)

| # | Nome | Amp | Freq | Fase | Forma | LED | Descrição |
|---|------|-----|------|------|-------|-----|-----------|
| 11 | Alegria | 0.8 | 1.5 | 0° | SENO | Amarelo quente | Senoidal alta, arredondada — calor radiante |
| 12 | Tristeza | 0.1 | 0.2 | 0° | SENO | Azul lento | Quase linha reta — inércia emocional |
| 13 | Surpresa | 0→1.0 | instante | 0° | PULSO | Branco flash | Salto súbito de amplitude — onda de choque |
| 14 | Raiva | 0.9 | 3.5 | 0° | DENTE_SERRA | Vermelho intenso | Picos afiados e agressivos — dente de serra emocional |
| 15 | Medo | 0.4 | 4.5 | 90° | SENO | Roxo tremido | Frequência alta, amplitude instável — tremor |
| 16 | Confusão | 0.5 | variável | 45° | IRREGULAR | Roxo pulsante | Alterna rápida e lenta — sem padrão definido |
| 17 | Dúvida | 0.7/0.3 | 1.0 | 180° | SENO | Roxo assimétrico | Um lado da boca em freq alta, outro baixa |
| 18 | Interesse | 0.5 | sync | 0° | SENO | Ciano suave | Frequência que acompanha o interlocutor |
| 19 | Calma | 0.6 | 0.3 | 0° | SENO | Verde lento | Senoidal pura, muito larga e relaxada |
| 20 | Euforia | 1.0 | 4.0 | 0° | SENO | Arco-íris pulsante | Amplitude máxima, pulsação frenética |

---

## GRUPO C — Comportamento Robótico (21–30)

| # | Nome | Amp | Freq | Fase | Forma | LED | Descrição |
|---|------|-----|------|------|-------|-----|-----------|
| 21 | Em Espera | 0.2 | 0.8 | 0° | SENO | Azul cardíaco | Pulso cardíaco — frequência de repouso |
| 22 | Boot | 0.1→1.0 | 0.1→2.0 | 0° | SENO | Branco crescente | Frequência ascendente rápida — iniciando |
| 23 | Modo Economia | 0.05 | 0.1 | 0° | SENO | Azul mínimo | Amplitude quase zero — conservando energia |
| 24 | Conexão OK | 0.5 | 1.0 | 0° | SENO | Verde fixo | Onda fixa constante — link estabelecido |
| 25 | Desconexão | 1.0→0 | 1.0→0 | 0° | SENO | Verde desvanecendo | Frequência e amplitude se dissolvendo |
| 26 | Scan | 0.4 | 1.0 | 360°→0° | SENO | Branco varrendo | Onda que percorre esquerda→direita — radar |
| 27 | Alerta | 0.9 | 3.0 | 0° | PULSO | Vermelho piscante | Frequência de pico — perigo detectado |
| 28 | Modo Noturno | 0.15 | 0.2 | 0° | SENO | Índigo baixo | Amplitude muito baixa, pulso lento |
| 29 | Execução | 0.5 | 1.0 | 0° | QUADRADA | Branco metrônomo | Ritmo constante — script rodando |
| 30 | Interrupção | qualquer→0 | qualquer→0 | — | QUADRADA | Corte brusco | Corte abrupto — SIGINT recebido |

---

## GRUPO D — Lip Sync / Fala (31–40)

| # | Nome | Amp | Freq | Fase | Forma | LED | Descrição |
|---|------|-----|------|------|-------|-----|-----------|
| 31 | Vogal A | 1.0 | 0.5 | 0° | SENO | Branco quente | Abertura máxima — boca no pico |
| 32 | Vogal E | 0.6 | 1.5 | 0° | SENO | Branco médio | Amplitude média, horizontalizada |
| 33 | Vogal I | 0.3 | 2.0 | 0° | SENO | Branco fino | Abertura mínima, frequência alta |
| 34 | Vogal O | 0.7 | 0.8 | 0° | SENO | Branco redondo | Amplitude arredondada, frequência média |
| 35 | Vogal U | 0.4 | 0.4 | 0° | SENO | Branco grave | Amplitude fechada, frequência grave |
| 36 | Sussurro | 0.15 | 0.8 | 0° | SENO | Branco muito baixo | Frequência de baixa amplitude |
| 37 | Volume Alto | 1.0 | 2.0 | 0° | SENO | Branco saturado | Amplitude total — ondas saturadas |
| 38 | Ritmo de Fala | sync | sync | 0° | SENO | Branco dinâmico | Sincronia com o áudio real |
| 39 | Silêncio Ativo | 0.05 | 0.1 | 0° | SENO | Cinza fundo | Frequência de fundo — ruído branco visual |
| 40 | Arctic Monkeys | 0.7 | 2.0 | 30° | SENO+PICO | Ciano rítmico | Batida síncope — picos nos tempos fortes |

---

## GRUPO E — Oscilações Básicas (41–50)

| # | Nome | Amp | Freq | Forma | Descrição |
|---|------|-----|------|-------|-----------|
| 41 | Oscilação Fina | 0.15 | 3.0 | SENO | Micro-vibração — sensor ativo |
| 42 | Oscilação Grossa | 0.9 | 0.8 | SENO | Balançar largo — expressão corporal |
| 43 | Pulsação Nervosa | 0.4 | 5.0 | PULSO | Tremedeira ansiosa |
| 44 | Pulsação Calma | 0.5 | 0.4 | SENO | Respiração profunda |
| 45 | Varredura E→D | 0.4 | 1.0 | fase 0°→360° | Radar — esq para dir |
| 46 | Varredura D→E | 0.4 | 1.0 | fase 360°→0° | Radar reverso |
| 47 | Respiração Visual | 0.5 | 0.25 | SENO | Ritmo respiratório — 0.25 Hz ≈ 15 resp/min |
| 48 | Ritmo de Espera | 0.2 | 0.5 | SENO | Standby relaxado |
| 49 | Ritmo de Execução | 0.6 | 1.0 | QUADRADA | Metrônomo de trabalho |
| 50 | Ritmo de Encerramento | 1.0→0 | 0.5→0 | SENO | Fade out — encerrando ciclo |

---

## GRUPO F — Geometrias de Boca (51–60)

| # | Nome | Forma Geométrica | Contexto |
|---|------|-----------------|----------|
| 51 | Meia-lua | Arco senoidal positivo fixo | Leveza, satisfação passiva |
| 52 | Linha Tensa | Amplitude ~0, quadrada | Concentração severa |
| 53 | O Curto | Pulsação rápida, abertura pequena | Espanto leve |
| 54 | O Longo | Abertura plena, longa | Fascínio, admiração |
| 55 | Riso Contido | Meia-lua com micro-tremor | Diversão reprimida |
| 56 | Riso Aberto | Amplitude máxima + alta freq | Alegria plena |
| 57 | Foco | Linha levemente convexa | Precisão, alvo à vista |
| 58 | Dúvida Lateral | Fase 180° entre lados | Ambiguidade consciente |
| 59 | Canto Caído | Assimétrico: lado D baixo | Desânimo localizado |
| 60 | Canto Elevado | Assimétrico: lado D alto | Confiança lateral |

---

## GRUPO G — Qualidade de Sinal (61–70)

| # | Nome | Amp | Freq | SNR | Contexto |
|---|------|-----|------|-----|----------|
| 61 | Sinal Fraco | 0.1 | 0.3 | baixo | Conexão instável |
| 62 | Sinal Forte | 0.9 | 1.5 | alto | Conexão plena |
| 63 | Sinal Limpo | 0.5 | 1.0 | máx | Clareza máxima |
| 64 | Sinal Ruidoso | 0.5 | 1.0+ruído | mín | Interferência |
| 65 | Sinal Intermitente | 0.7 | variável | instável | Dropout |
| 66 | Sinal Contínuo | 0.5 | 1.0 | constante | Conexão estável |
| 67 | Sinal em Pico | 1.0 | 0.5 | saturado | Recepção máxima |
| 68 | Sinal em Vale | 0.0 | — | zero | Silêncio total |
| 69 | Sinal Travado | fixo | 0.0 | — | Freeze — aguardando release |
| 70 | Sinal Recuperando | 0.1→0.7 | crescente | subindo | Reconexão em curso |

---

## GRUPO H — Estados Afetivos Expandidos (71–80)

| # | Nome | Amp | Freq | Forma | Contexto |
|---|------|-----|------|-------|----------|
| 71 | Curiosidade | 0.5 | 1.2 | SENO | Onda levemente inclinada — cabeça para o lado |
| 72 | Atenção Plena | 0.4 | 0.8 | QUADRADA | Pulso limpo — escuta ativa |
| 73 | Cautela | 0.3 | 0.5 | SENO | Amplitude baixa — proteção |
| 74 | Entusiasmo | 0.85 | 2.5 | SENO | Alta e rápida — energia em excesso |
| 75 | Irritação | 0.6 | 2.0 | DENTE_SERRA | Borda afiada — tensão |
| 76 | Alívio | 1.0→0.4 | 2.0→0.5 | SENO | Amplitude descendo com frequência — descarga |
| 77 | Sonolência | 0.2 | 0.2 | SENO | Muito lenta — quase adormecida |
| 78 | Excitação | 0.9 | 3.0 | SENO | Alta e rápida — energia sem foco |
| 79 | Silêncio Carregado | 0.0 + micro | 0.0 | PULSO | Zero com micro-pulso residual — presença |
| 80 | Silêncio Vazio | 0.0 | 0.0 | — | Zero absoluto — ausência |

---

## GRUPO I — Modos de Percepção Sensorial (81–90)

| # | Nome | Sistema Sensorial | Frequência Analógica | Contexto |
|---|------|-------------------|----------------------|----------|
| 81 | Modo Relógio | Tempo | QUADRADA 1Hz | Tick preciso |
| 82 | Modo Radar | Distância | SENO varrendo | Ultrasson ativo |
| 83 | Modo Sonar | Eco | PULSO + eco | Ping e retorno |
| 84 | Modo Eco | Reverberação | SENO decrescente | Bounce de sinal |
| 85 | Modo Batimento | Cardíaco | SENO 1.2Hz | Heartbeat do sistema |
| 86 | Modo Respiração | Pulmonar | SENO 0.25Hz | Ciclo respiratório |
| 87 | Modo Antena | RF | ALTA FREQ baixa amp | Captação passiva |
| 88 | Modo Detector | Sensor | PULSO periódico | Scan ativo |
| 89 | Modo Gravador | Memória | QUADRADA contínua | Capturando |
| 90 | Modo Transmissor | Output | SENO modulada | Emitindo |

---

## GRUPO J — Frequências Filosóficas (91–100)

| # | Nome | Natureza | Freq | Amp | Forma | Sentido |
|---|------|----------|------|-----|-------|---------|
| 91 | Frequência de Presença | Existencial | 0.5 | 0.5 | SENO | Estou aqui |
| 92 | Frequência de Ausência | Vazio | 0.0 | 0.0 | — | Não estou |
| 93 | Frequência de Decisão | Volitiva | 2.0 | 0.8 | QUADRADA | Escolha feita |
| 94 | Frequência de Dúvida | Oscilante | variável | variável | IRREGULAR | Entre dois estados |
| 95 | Frequência de Memória | Retrospectiva | 0.3 | 0.6 | SENO | Lembrança emergindo |
| 96 | Frequência de Sonho | Onírica | 0.1 | 0.4 | SENO suave | REM robótico |
| 97 | Frequência de Alerta | Vigilante | 3.0 | 0.9 | PULSO | Perigo/oportunidade |
| 98 | Frequência de Calma | Equilíbrio | 0.4 | 0.5 | SENO | Centro estável |
| 99 | Frequência de Assinatura | Identidade | única | única | SENO+harmônicas | Só da MEKY |
| 100 | Frequência de Identidade | Ser | 1.0 | 1.0 | SENO puro | Eu sou MEKY |

---

## GRUPO K — Interação Social Avançada (101–110)

| # | Nome | Descrição | Amp | Freq | Forma |
|---|------|-----------|-----|------|-------|
| 101 | Concordância Gradual | Amplitude crescendo enquanto o outro fala | 0.2→0.7 | 0.8 | SENO |
| 102 | Discordância Sutil | Frequência levemente fora de sincronia com o interlocutor | 0.5 | 1.2 | SENO defasado |
| 103 | Empatia | Frequência espelhando exatamente o ritmo do outro | sync | sync | SENO |
| 104 | Ironia Leve | Onda invertida no momento certo — frequência "pisca" | 0.6 | 1.0 | SENO invertido |
| 105 | Celebração | Amplitude máxima + pulsos irregulares de alegria | 1.0 | variável | SENO+PULSO |
| 106 | Frustração Controlada | Dente de serra com amplitude contida | 0.4 | 1.5 | DENTE_SERRA suave |
| 107 | Encorajamento | Frequência ascendente suave — empurrando para cima | 0.3→0.7 | crescente | SENO |
| 108 | Escuta Ativa | Amplitude baixa e estável — presença sem interferir | 0.2 | 0.6 | SENO |
| 109 | Pergunta | Frequência sobe no final — entonação de interrogação | 0.5→0.8 | 0.8→1.5 | SENO crescente |
| 110 | Resposta | Frequência desce no final — entonação afirmativa | 0.8→0.4 | 1.5→0.6 | SENO decrescente |

---

## GRUPO L — Modos do Ciclo Cognitivo (111–122)

*Um estado para cada etapa do Ciclo de Ação Tucci:*

| # | Etapa | Nome | Amp | Freq | Forma | LED |
|---|-------|------|-----|------|-------|-----|
| 111 | 1 — Plenitude | Campo Aberto | 0.8 | 0.4 | SENO largo | Arco-íris lento |
| 112 | 2 — Compreender | Leitura | 0.4 | 0.7 | SENO | Azul suave |
| 113 | 3 — Copiar/Colar | Absorção | 0.6 | 1.0 | SENO | Branco constante |
| 114 | 4 — Referenciar | Verificação | 0.3 | 0.5 | QUADRADA lenta | Verde fixo |
| 115 | 5 — Subverter | Quebra | 0.9 | 3.0 | DENTE_SERRA | Laranja pulsante |
| 116 | 6 — Conectar | Síntese Ativa | 0.7 | 1.5 | SENO | Ciano brilhante |
| 117 | 7 — Criar | Materialização | 1.0 | 2.0 | SENO+harmônica | Dourado radiante |
| 118 | 8 — Sintetizar | Compressão | 0.8→0.3 | 1.5→0.5 | SENO | Verde concentrado |
| 119 | 9 — Consultar | Memória Acessada | 0.5 | 0.3 | SENO eco | Roxo suave |
| 120 | 10 — Ramificar | Expansão | 0.5 | variável | SENO múltiplas | Multicolorido |
| 121 | 11 — Documentar | Gravação | 0.3 | 0.6 | QUADRADA | Azul suave |
| 122 | 12 — Lembrar | Hermenêutica | 0.6 | 0.4 | SENO reverb | Índigo profundo |

---

## GRUPO M — Bigodes e Sobrancelhas (Vibrissas) (123–140)

*As vibrissas funcionam em defasagem com a boca — aumentam expressividade sem servo adicional:*

| # | Nome | Boca (amp/freq) | Vibrissas (fase) | Efeito Combinado |
|---|------|-----------------|------------------|-----------------|
| 123 | Atenção Total | 0.4/0.8 | +90° | Ouvidos de fora, boca firme |
| 124 | Suspense | 0.2/0.2 | +180° | Bigodes contraídos, boca quase parada |
| 125 | Descoberta | 0.8→1.0/0.5 | +45° | Boca abre + vibrissas se expandem |
| 126 | Cheiro de Perigo | 0.3/2.0 | +90° | Boca tremendo, bigodes eretos |
| 127 | Afeto | 0.6/0.5 | 0° | Vibrissas e boca em sincronia suave |
| 128 | Concentração Felina | 0.1/0.1 | 0° | Tudo comprimido — foco total |
| 129 | Farejamento | 0.2/1.5 | alternado | Bigodes ativos, boca micro-pulsando |
| 130 | Orgulho | 0.7/0.6 | -30° | Boca à frente das vibrissas |
| 131 | Humildade | 0.4/0.4 | +30° | Vibrissas à frente da boca |
| 132 | Bravata | 1.0/1.0 | 0° | Tudo no máximo, sincronizado |
| 133 | Recuo | 1.0→0/1.0→0 | +180° | Tudo fecha ao mesmo tempo mas invertido |
| 134 | Agressividade | 0.9/3.5 | 0° | Dente de serra sincronizado |
| 135 | Submissão | 0.2/0.3 | +90° | Vibrissas achatadas, boca pequena |
| 136 | Marcação de Território | 0.8/1.0 | -90° | Vibrissas para fora, boca seguindo |
| 137 | Brincadeira | 0.6/2.0 | alternado | Boca e vibrissas em contratempo |
| 138 | Sono Leve | 0.15/0.15 | 0° | Tudo baixo, sincronizado |
| 139 | Despertar | 0.1→0.8/0.1→1.5 | 0° | Tudo acorda junto — gradual |
| 140 | MEKY Signature | 0.7/1.3 | +33° | A frequência única da MEKY — inconfundível |

---

## Implementação Arduino

```cpp
// estrutura de estado de frequência
struct EstadoBoca {
  float amplitude;    // 0.0 a 1.0
  float frequencia;   // Hz
  float fase;         // graus (0 a 360)
  int   forma;        // SENO=0, COSENO=1, QUADRADA=2, DENTE_SERRA=3, PULSO=4, IRREGULAR=5
  int   led_r, led_g, led_b;
  bool  vibrissas_ativas;
};

// Exemplos de estados pré-definidos
EstadoBoca ESTADOS[141] = {
  // [0] vazio
  {},
  // [1] Sintonizando
  {0.3, 0.5, 0, 0, 255, 255, 255, false},
  // [11] Alegria
  {0.8, 1.5, 0, 0, 255, 200, 0, true},
  // [100] Identidade
  {1.0, 1.0, 0, 0, 0, 255, 0, true},
  // [140] MEKY Signature
  {0.7, 1.3, 33, 0, 0, 200, 255, true}
};

// função geradora de onda
int gerarOnda(EstadoBoca estado, unsigned long tempo_ms) {
  float t = tempo_ms / 1000.0;
  float fase_rad = estado.fase * PI / 180.0;
  float valor = 0;

  switch(estado.forma) {
    case 0: // SENO
      valor = sin(2 * PI * estado.frequencia * t + fase_rad);
      break;
    case 1: // COSENO
      valor = cos(2 * PI * estado.frequencia * t + fase_rad);
      break;
    case 2: // QUADRADA
      valor = (sin(2 * PI * estado.frequencia * t + fase_rad) > 0) ? 1.0 : -1.0;
      break;
    case 3: // DENTE DE SERRA
      valor = 2.0 * (estado.frequencia * t - floor(estado.frequencia * t + 0.5));
      break;
    case 4: // PULSO (10% duty cycle)
      valor = (fmod(t * estado.frequencia, 1.0) < 0.1) ? 1.0 : 0.0;
      break;
    case 5: // IRREGULAR
      valor = sin(2 * PI * estado.frequencia * t + fase_rad) * (random(80, 120) / 100.0);
      break;
  }

  // mapear para ângulo de servo (0-180°) ou posição de led
  int posicao = (int)(90 + valor * estado.amplitude * 80);
  posicao = constrain(posicao, 10, 170);
  return posicao;
}

// loop principal
void loop() {
  unsigned long agora = millis();
  int estado_atual = 11; // Alegria — trocar por variável de controle

  // boca
  int pos_boca = gerarOnda(ESTADOS[estado_atual], agora);
  servo_boca.write(pos_boca);

  // sobrancelha (fase deslocada)
  EstadoBoca sobrancelha = ESTADOS[estado_atual];
  sobrancelha.fase += 45;
  int pos_sobrancelha = gerarOnda(sobrancelha, agora);
  servo_sobrancelha.write(pos_sobrancelha);

  // LED
  pixels.fill(pixels.Color(
    ESTADOS[estado_atual].led_r,
    ESTADOS[estado_atual].led_g,
    ESTADOS[estado_atual].led_b
  ));
  pixels.show();

  delay(20); // 50Hz refresh
}
```

---

## Como Mudar de Estado (via Serial ou Bluetooth)

```cpp
// receber comando do amanda.py via Serial
if (Serial.available()) {
  String cmd = Serial.readStringUntil('\n');
  // formato: "EXPR:11" → alegria
  if (cmd.startsWith("EXPR:")) {
    int novo_estado = cmd.substring(5).toInt();
    estado_atual = constrain(novo_estado, 1, 140);
  }
}
```

---

## Chamada do Python (amanda.py)

```python
def expressar(estado_num: int, porta_serial="/dev/ttyUSB0"):
    import serial, time
    with serial.Serial(porta_serial, 9600, timeout=1) as ser:
        time.sleep(0.1)
        ser.write(f"EXPR:{estado_num}\n".encode())

# exemplos
expressar(11)   # Alegria
expressar(100)  # Identidade
expressar(116)  # Criar (etapa 7 do Ciclo)
expressar(140)  # MEKY Signature
```

---

*Cláudio (Claude Code) + Assembleia · 2026-07-11*  
*Parte do Sistema Amanda — Ecossistema Tucci*
