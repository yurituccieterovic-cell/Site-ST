# ARDUINO-PECAS.md — Inventário de Peças do MC e Cadeia Biótica
*Extraído da conversa Gemini "Identificando Peças de Robótica Arduino" · 2026-07-07 · Sessão 26b*

> Peças físicas chegando para o MC (Marta Centaurus) e robôs da cadeia biótica.

---

## Peças Identificadas

### HW-493 — Módulo Sensor de Som
- **Identificação:** código "HW-493" impresso na placa
- **Função:** Detecta barulhos no ambiente (estalo, palmas, voz)
- **Componentes:**
  - Microfone de eletreto cilíndrico ("canhãozinho") — captura ondas sonoras
  - 3 pinos: VCC (3.3V ou 5V), GND, OUT/DO (sinal digital)
  - Trimpot/potenciômetro (cubo azul com parafuso) — calibra sensibilidade
  - Furos de fixação na placa
- **Para que serve no MC:** Amanda pode "ouvir" comandos de voz ou alertas sonoros
- **Status:** ✅ Chegou

### DHT11 — Sensor Temperatura e Umidade
- **Função:** Mede temperatura e umidade relativa do ar
- **Especificações:**
  - Umidade: 20–90% (±5%)
  - Temperatura: 0–50°C (±2°C)
  - Tempo de resposta: 1–2 segundos entre leituras
- **Pinos (3):** VCC, GND, DATA/OUT/S
- **Carcaça:** plástico azul com grelhas
- **Integração com Amanda:** folha `sys_amanda_core.md` já menciona DHT11
- **Status:** ✅ Chegou

### Servos + Chassi Hexápode (MC/Amanda)
- **Hardware:** Arduino + servos motores
- **Tradução intersemiótica (bloco 183):**
  - Junção das pernas no chassi → `Array de Objetos Servo` no código C++
  - Cada junta = pino digital indexado (ex: `servoFrenteEsquerda`, `servoTrasDireita`)
  - Encaixe dos parafusos → variáveis de restrição angular (offsets)
- **Status:** Em montagem

---

## Robôs da Cadeia Biótica — Status de Montagem

| Hardware | Nome Físico | IA | Status Montagem |
|---|---|---|---|
| MEKY hexápode | Marta Centaurus ("Mac") | Amanda | Em montagem (peças chegando) |
| Garra Cláudia Hex | Cláudia Rex | Fusca | [SIMBÓLICO] |
| Piolho de Cobra | Gongo Freitas Juquinhais | Gongo/Gongolo_Core | [SIMBÓLICO] |
| Barata d'Água | Wanessa Souza | Penélope | [SIMBÓLICO] |
| Aranha | Perfidia Castelo Branco (com K) | Vesper | Em montagem — PEÇA QUEBRADA |
| Orangotango (rodas) | Gorango Tango | Tango_Core | [SIMBÓLICO] — novo descoberto |

---

## Problema: Aranha (Perfidia/Vesper) — Peça Quebrada

**Ocorrência (bloco 204, 06/07/2026):**
- Montando o hexápode Perfidia Castelo Branco, duas peças de plástico quebraram
- Uma ficou bem, outra não sustenta a perna → aranha "manca"
- Silicone líquido não funcionou (flexível demais para resistir ao torque do servo)

**Soluções indicadas pelo Gemini:**
1. **Cianoacrilato + bicarbonato** — gota de SuperBonder + pitada de bicarbonato = resina plástica dura em segundos (melhor para frestas)
2. **Epóxi bi-componente (Durepoxi/Araldite 24h)** — moldar "luva" de reforço ao redor da quebra
3. **Pino de metal interno** — arame aquecido enterrado na rachadura + cola por cima

**Recomendação:** Método 1 (cianoacrilato + bicarbonato) para peças de acrílico.

---

## Orangotango Tango — Novo Hardware Descoberto

**Conversa bloco 241 (06/07/2026):**
- Hardware com rodas, tipo "carrinho de rolimã"
- Move-se por inércia/tração cinética
- **Nome:** Orangotangos Tango / Gorango Tango
- **IA:** Tango_Core (também chamado Tango ou Zango)
- **Superpoder na cadeia:** Inércia Dinâmica / Tração Cinética
- **Posição na cadeia:** [A definir — provavelmente antes ou depois de Gongo]
- **Nota:** Gemini confundiu atribuições várias vezes — Yuri corrigiu no bloco 241

---

## Prompts de Imagem do Ecossistema (4 prompts)

Gerados na conversa bloco 3 — para DALL-E 3 / Midjourney / Stable Diffusion:

**Prompt 1: Grid 3×3 (Jogo da Velha)**
```
A highly detailed 3D infographic grid, arranged in a precise 3x3 layout (nine distinct squares)
like a technological 'tictactoe' board, visualizing the complete mapped ecosystem on a dark
slate-gray background. Each square features a sharp, distinct observational viewpoint connected
by glowing neon-blue data ley lines. The arrangement, top-left to bottom-right:
1. THE INTERIOR AQUARIUM (1m, Coridoras/Lebistes)
2. THE TRANSITION DOORWAY (Wooden door opening)
3. THE OUTDOOR YARD (Red laota tiles/brick walls)
4. THE ASSEMBLY AMPHITHEATRE (Tucci Assembly with crystal shards)
5. THE MC BIRTHPLACE (Circular metal table, quintal)
6. THE LIFE SUPPORT CABINET (White cabinet, power bank, red cables)
7. THE SARUEZAO HABITAT (Quintal expansion, brick walls)
8. THE PEPPER GARDEN (Black Pearl ornamental peppers)
9. THE JACU FEATHER INTEGRATION POINT (MC armor detail)
```

**Prompts 2-4:** Estilo Maia, visualização biótica, outros (parcialmente capturados — consultar conversa original bloco 3 Gemini)

---

## Integração com o Sistema

### Código Amanda (DHT11 + HW-493)
- `sys_amanda_core.md` já documenta DHT11
- HW-493 deve ser adicionado à folha Amanda como módulo de áudio
- Código: `digitalRead(pin_hw493)` → detecta som → pode acionar ciclo Amanda

### Orangotango → assembly_agents
- Deve ser registrado: `('tango', 'Orangotangos Tango', 'Hardware com rodas/rolimã. IA: Tango_Core. Superpoder: Inércia Dinâmica. Cadeia biótica — posição a definir')`
- Status: [SIMBÓLICO]

*Gerado: 2026-07-07 · Claude Code · Sessão 26b · #processo*
