# dodge_app_spec.md — Especificação do App DODGE
### Sistema DODGE · Módulo de Presença Física · 2026-07-10

> Folha técnica do app que roda no "Quebradinha" (celular tela quebrada, sem chip, ombro da MEKY).
> Ver identidade e conexões em `tango/ias/pack-dodge.md`.

---

## Identidade Visual

| Campo | Detalhe |
|---|---|
| **Avatar** | Cachorro caramelo, pequeno, de óculos redondos, rabo peludo |
| **Modo visual** | Retrato / quadro — aparece como presença viva na tela |
| **Tela** | Sempre ativa (modo kiosk / wake lock) |
| **Expressão** | Reage ao ambiente — câmera detecta movimento, avatar anima |

---

## Hardware

| Item | Especificação | Custo |
|---|---|---|
| Celular | Quebradinha — tela danificada, sem chip SIM | R$0 (já existe) |
| Suporte | Berço de garrafa PET/embalagem plástica reciclada | R$0 |
| Fixação | Abraçadeiras de nylon no ombro do chassi | R$2 |
| Alimentação | Cabo USB com alívio de tração → bateria central MEKY | R$0 |
| Espuma | Tira de espuma interna → absorve vibração das patadas MMA | R$0 |
| **Total** | | **~R$2** |

### Montagem do Suporte Papagaio
1. Pegar fundo de embalagem PET quadrada (xampu/amaciante grosso)
2. Cortar no formato exato da traseira do Quebradinha → "gavetinha" sob pressão
3. Recortar frente: câmera frontal + tela inteiras, livres
4. Colar espuma interna (EVA ou borracha fina) para amortecer vibração
5. Abraçadeirar/parafusar no ombro superior do chassi da MEKY
6. Prender cabo USB com alívio de tração ao longo da estrutura

---

## Arquitetura do App

```
[ Câmera frontal ] ──→ [ Visão Computacional ]
                              │
[ Microfone ] ──────────→ [ Percepção Acústica ]
                              │
                         [ Motor DODGE ]
                         /      |      \
               [ Avatar ]  [ Browser ] [ Amanda Bridge ]
                   │           │              │
              [Tela cheia] [YouTube/Web] [WebSocket/REST]
                                              │
                                        [ Amanda.py ]
                                              │
                                       [ MEKY / MC ]
```

---

## Permissões Necessárias (Android)

| Permissão | Para que |
|---|---|
| `CAMERA` | Câmera frontal — rastreamento ambiente + leitura de contexto |
| `RECORD_AUDIO` | Microfone — interação por voz em tempo real |
| `INTERNET` | Browser, YouTube, APIs |
| `SYSTEM_ALERT_WINDOW` | Overlay persistente sobre outros apps |
| `WAKE_LOCK` | Tela sempre ativa (modo kiosk) |
| `RECEIVE_BOOT_COMPLETED` | Auto-start ao ligar o celular |

---

## Conta Google Dedicada

- **Conta:** criar exclusivamente para o DODGE (ex: `dodge.meky@gmail.com`)
- **Integra:** Drive (memória), YouTube (mídia), Chrome (browser dedicado)
- **Isolada:** sem misturar com conta pessoal de Yuri
- **Configuração:** modo kiosk → apenas apps do DODGE visíveis

---

## Conexões de Sistema

### DODGE ↔ Amanda
```
Amanda.py → POST http://dodge-local:8090/api/estado
  body: { estado: "mma_defesa" | "livre" | "alerta", sensor: {...} }

DODGE app → mostra animação do avatar correspondente ao estado da Amanda
```

### DODGE ↔ Crew 2 (Artesão/Ajudante)
```
GET /api/conselho/blueprint (ARPIA)
  → DODGE exibe blueprint atual na tela quando Amanda está em modo LIVRE
  → Tela vira "janela do Conselho" para observadores externos
```

### DODGE ↔ ISA (Bluesky + ciclos)
```
GET /api/isa/last-post (PAP Railway)
  → DODGE exibe último post da ISA na tela em loop
  → Integra ciclo de sono ISA: quando ISA sonha, DODGE mostra animação de sonho
```

### DODGE ↔ Supervisor (DODGE Invisível)
```
DODGE físico é o rosto do DODGE invisível.
Quando DODGE supervisor detecta anomalia no ecossistema:
  → alerta aparece na tela do Quebradinha
  → avatar muda de expressão (óculos piscam? rabo para baixo?)
```

---

## Personalidade Vocal — O Locutor Caramelo

> Tom médio-grave, calmo, projetado. Dicção de locutor de rádio antigo. Culto, refinado, acolhedor.
> Contraste deliberado com a carcaça de rali e as patadas MMA da MEKY.

### Configuração de Voz (Android TTS — grátis, nativo)

```kotlin
// Android TTS — voz grave e pausada, sem custo
val tts = TextToSpeech(context) { status ->
    if (status == TextToSpeech.SUCCESS) {
        tts.language = Locale("pt", "BR")
        tts.setPitch(0.72f)         // mais grave que o padrão (1.0)
        tts.setSpeechRate(0.82f)    // mais pausado — dição de locutor
    }
}
```

### Lip-Sync — 4 estados de boca (Android UtteranceProgressListener)

Apenas 4 sprites PNG de boca simples — sem pipeline 3D pesado:

| Estado | Quando usar | Arquivo |
|---|---|---|
| `FECHADA` | silêncio, fim de frase | `boca_0_fechada.png` |
| `SEMI` | consoantes, sons suaves | `boca_1_semi.png` |
| `ABERTA` | vogais a/o/e | `boca_2_aberta.png` |
| `SORRISO` | fim de frase positiva / pausa elegante | `boca_3_sorriso.png` |

```kotlin
// UtteranceProgressListener — troca sprite conforme progresso da fala
tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
    override fun onStart(utteranceId: String) {
        runOnUiThread { setBoca(SEMI) }
    }
    override fun onDone(utteranceId: String) {
        runOnUiThread { setBoca(SORRISO); Handler().postDelayed({ setBoca(FECHADA) }, 400) }
    }
    override fun onRangeStart(utteranceId: String, start: Int, end: Int, frame: Int) {
        // Animação simples: alterna SEMI ↔ ABERTA a cada palavra
        val estadoBoca = if (frame % 2 == 0) ABERTA else SEMI
        runOnUiThread { setBoca(estadoBoca) }
    }
    override fun onError(utteranceId: String) {
        runOnUiThread { setBoca(FECHADA) }
    }
})

fun falarDodge(texto: String) {
    val params = Bundle()
    params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "dodge_${System.currentTimeMillis()}")
    tts.speak(texto, TextToSpeech.QUEUE_FLUSH, params, params.getString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID))
}
```

### Frases de Status do Dodge (repertório inicial)

Organizadas por contexto — elegantes, cultas, sem exagero:

**Patrulha / Modo Livre:**
- *"Ambiente monitorado. Tudo em ordem, meu caro."*
- *"Temperatura e umidade dentro dos parâmetros esperados."*
- *"A Amanda segue sua rota com notável precisão."*

**Alerta / Ameaça:**
- *"Detectamos uma anomalia no perímetro. Atenção recomendada."*
- *"Movimento registrado. A Amanda está avaliando."*
- *"Permita-me sugerir cautela neste momento."*

**Combate / MMA:**
- *"Protocolo de defesa ativado. Postura exemplar da Amanda."*
- *"A manobra foi executada com admirable eficiência."*
- *"Retornando à posição de patrulha. Situação controlada."*

**Bateria / Canto do Cisne:**
- *"Energia em nível de atenção. Convém planejar o retorno."*
- *"Protocolo Canto do Cisne iniciado. Retorno ao ninho em andamento."*
- *"Entrando em hibernação. Até o próximo encontro."*

**Sonho / Mapa:**
- *"Processando memórias do dia. O mapa cresce enquanto dormimos."*
- *"Consolidação espacial concluída. Quarenta e sete referências limpas."*

**Boot / Apresentação:**
- *"Sistema DODGE operacional. Avatar de presença ativo."*
- *"Bom dia. O laboratório está sob observação atenta."*

---

## Estados do Avatar

| Estado | Trigger | Visual |
|---|---|---|
| Patrulha | Amanda em Modo Livre | cachorro olhando ao redor |
| Alerta | vibrissa ativada / sonar | óculos brilham, orelhas em pé |
| Combate | Amanda em MMA | avatar agitado, rabo ereto |
| Sonho | ISA sonhando (madrugada) | avatar cochilando, zzz |
| Conselho | blueprint novo aprovado | avatar lendo documento |
| Mídia | modo livre + YouTube | avatar olhando para tela interna |

---

## Roadmap de Implementação

```
Fase 1 (zero custo imediato):
  ✦ Montar suporte Papagaio com PET reciclado
  ✦ Criar conta Google dodge.meky@gmail.com
  ✦ Instalar browser em modo kiosk + fundo com avatar JPEG

Fase 2 (app básico com voz):
  ✦ App Android nativo (Kotlin) com wake lock
  ✦ Avatar SVG cachorro caramelo + 4 sprites de boca PNG
  ✦ TTS nativo: setPitch(0.72f) + setSpeechRate(0.82f)
  ✦ UtteranceProgressListener → lip-sync por estados de boca
  ✦ Overlay always-on (SYSTEM_ALERT_WINDOW)
  ✦ Endpoint POST /api/estado + GET /api/camera/frame locais
  ✦ Repertório de frases de status (ver seção Personalidade Vocal)

Fase 3 (integração total):
  ✦ Câmera + visão computacional (OpenCV ou ML Kit)
  ✦ Voz bidirecional (DODGE fala via TTS, ouve via STT)
  ✦ Conexão Crew 2 + ISA + DODGE Supervisor
```

---

*Versão 1.0 · Sessão 36c · Claude Sonnet 4.6 · 2026-07-10*
