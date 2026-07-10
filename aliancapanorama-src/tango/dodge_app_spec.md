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

Fase 2 (app básico):
  ✦ App Android simples: WebView + wake lock
  ✦ Avatar SVG animado do cachorro caramelo
  ✦ Endpoint local que Amanda.py chama para atualizar estado

Fase 3 (integração total):
  ✦ Câmera + visão computacional (OpenCV ou ML Kit)
  ✦ Voz bidirecional (DODGE fala via TTS, ouve via STT)
  ✦ Conexão Crew 2 + ISA + DODGE Supervisor
```

---

*Versão 1.0 · Sessão 36c · Claude Sonnet 4.6 · 2026-07-10*
