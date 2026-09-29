# Workflow — Série "Inteligência em Camadas"

*Referência para geração de cursos futuros. Atualizar a cada novo curso.*

---

## Curso 1 — "Do Signo à Frequência"

**Episódios:** 15 + ep16 (bibliografia crítica) · ~75min total  
**Stack:** edge-tts + pollinations.ai + ffmpeg  
**Voz:** `pt-BR-AntonioNeural` (Microsoft, gratuita, ilimitada)  
**Imagens:** 1280×720 (episódios) · 1080×1080 (trailer 30s quadrado)  
**Custo:** R$0  
**Roteiros:** `tango/roteiros-video/adaptados/ep01-ep15.md`  
**Nomes adaptados para público:** MEKY→"robô de expressão corporal", Babel Bebel→"hub central de governança", Telos→mantido

---

## Curso 2 — "De Usuários a Bytes"

**Episódios:** Ep00–Ep12 (13) + intro 42s · autoria coletiva 8 IAs  
**Stack:** ElevenLabs SDK v2.59 + pollinations.ai + ffmpeg + Pillow  
**Voz:** Bill · `pqHfZKP75CvOlQylNhV4` · age: old (ÚNICA com `age: old` na conta)  
**Modelo:** `eleven_multilingual_v2`  
**Imagens:** 1280×720 · Poster: Pillow 1080×1080  
**Custo:** ElevenLabs Starter · ~26.379/69.577 chars usados  
**Ordem de envio:** reversa — Ep12→Ep00→Intro  
**Roteiro:** `cursos/curso2-usuarios-a-bytes.md`  
**Mídias sociais:** `cursos/curso2-midias-sociais.md`  
**Instagram:** só poster 1080×1080 (NÃO vídeo) — decisão Yuri S152

---

## Curso 3 — "Respirar com o Planeta"

**Episódios:** 8 · ~3 min cada · eco-respiração (ecologia como linguagem de sistemas vivos)  
**Stack:** edge-tts + PremiereMovieMaker v2 (Pillow + ffmpeg) — **100% gratuito**  
**Voz:** `pt-BR-FranciscaNeural` (Microsoft, gratuita, ilimitada)  
**Resolução:** 1280×720 · ~13 MB por episódio  
**Roteiro:** `cursos/curso3-ecorrespiracao.md`  
**Script gerador:** `scripts/gerar_videos_curso3.py`  
**Saída:** `cursos/videos-curso3/curso3_epNN.mp4`

**Temas visuais por bloco:**
- Eps 1–3: `escuro` (âmbar/cinza — tech pesado, pegada de carbono)
- Eps 4–6: `verde` (verde-neon — regeneração, ciclos, comunidade)
- Eps 7–8: `ocean` (azul-ciano — IA ecológica, síntese)

**Animação:** `--motion full` em todos  
- 3 keyframes por slide: kf_bg → kf_title → kf_full  
- Blend por `Image.blend()` — sem re-render Pillow por frame  
- Primeiros 35% do slide: fade sequencial fundo → título → texto  
- Restante: Ken Burns zoom 100→106%

**Estilo de texto:** `punch_line()` — última frase candidata 25–110 chars, não-lista

**Estilo narrativo:** Crash Course — narração direta, frases curtas, energia alta (eps 4–8)

**Status:** Eps 1–3 gerados (v3) · Eps 4–8 em geração (2026-09-29)

---

## Propagandas / Bumpers

**Formato base:** 5s · 1920×1080 · `--transicao none --motion zoom`  
**Script:** `scripts/gerar_bumpers.py`  
**Saída:** `cursos/bumpers/`

| Produto | Arquivo | Frase aprovada (#719) | Fonte | Tema |
|---|---|---|---|---|
| Sociedade Tucci | `bumper_st.mp4` | "Inteligência não nasce pronta. Ela se cultiva." | premiere_maker | ocean |
| PAP | `veed_pap.mp4` | "Vestibular virou jogo. Você topa?" | VEED overlay gamificação | sunset |
| Calculus | `veed_calculus.mp4` | "Matemática com alma. E penas." | VEED mascote Ábaco+Arara | claro |
| Age | `bumper_age.mp4` | "Agendar consultas pode ser humano." | premiere_maker | escuro |

**VEED usado:** PAP ~40cr · Calculus ~80cr · 9:16 Reels para ambos ~30cr cada  
**VEED cancelado** após bumpers — créditos restantes usados estrategicamente

---

## PremiereMovieMaker v2 — Temas disponíveis

| Tema | Fundo | Título | Uso |
|---|---|---|---|
| `escuro` | `#0a0d14` | `#f59e0b` âmbar | Curso 3 eps 1-3, Age |
| `claro` | `#f8fafc` | `#1e293b` | Calculus base |
| `ocean` | `#0c1a2e` | `#38bdf8` ciano | ST, Curso 3 eps 7-8 |
| `sunset` | `#1a0a14` | `#fb923c` laranja | PAP |
| `rosa` | `#1a0a14` | `#f472b6` pink | a definir |
| `verde` | `#071a0e` | `#4ade80` verde | Curso 3 eps 4-6 |

---

## Pipeline geral (todos os cursos)

```
Roteiro MD (## EPISÓDIO N / ### CENA N)
  ↓ parse_episodios() — corta em ## que NÃO é EPISÓDIO (evita metadados)
  ↓ limpar_texto() — remove markdown, setas, CO₂→"C O 2"
  ↓ gerar_tts() — edge-tts edge-tts + ffprobe mede duração real
  ↓ punch_line() — extrai frase display (última candidata 25-110 chars)
  ↓ build_slides() — monta JSON com duracao real + 0.3s de respiro
  ↓ premiere_maker.py --motion full --layout tema
      ↓ TTS interno (segunda passagem, sync preciso)
      ↓ _build_slide_image() × 3 keyframes
      ↓ gerar_frames_slide(): blend phases + Ken Burns por frame
      ↓ ffmpeg concat → MP4 final
  ↓ email SMTP_SSL individual (~13MB por envio)
```

---

## Gotchas — não repetir esses erros

| # | Problema | Solução |
|---|---|---|
| 1 | `client.generate()` não existe no ElevenLabs v2.59 | `client.text_to_speech.convert(voice_id, text, model_id, output_format)` |
| 2 | SMTP "Server not connected" em sessões longas | `with smtplib.SMTP_SSL(...) as server:` — nova conexão por email |
| 3 | Intro cortado (23s em vez de 42s) | Threshold `> 20` filtrava linhas curtas; usar `> 4` |
| 4 | pollinations.ai timeout | 3 tentativas; fallback `ffmpeg color=0x080820` |
| 5 | `pip install` global falha no Python 3.14+ Debian | Virtualenv em `/tmp/venv-video/` |
| 6 | Pillow vs. pollinations para texto | Pillow renderiza texto; pollinations distorce |
| 7 | Cena 7 com 84s (capturava "Notas de Produção") | `meta_cut = re.search(r'\n## (?!EPISÓDIO)', ep_text)` para cortar metadados |
| 8 | Texto cortado com "..." nos slides | `punch_line()` em vez de `sentences[:3]` — extrai última frase forte |
| 9 | Email timeout ao enviar 3 vídeos juntos (~42MB) | Enviar individualmente com timeout=180000ms por email |
| 10 | TTS dupla geração (gerar_videos + premiere_maker) | Intencional — gerar_videos mede duração real; premiere re-gera em sync preciso |

---

## Decisões de design

- **Voz Curso 3:** `pt-BR-FranciscaNeural` — neutra, clara, grátis
- **Voz Professor Cláudio:** Bill (ElevenLabs, grave, idoso) → cursos com narrador técnico
- **Narrador neutro:** `pt-BR-AntonioNeural` → quando não precisa de voz envelhecida
- **Poster quadrado:** 1080×1080 Pillow (NÃO pollinations — distorce texto)
- **Motion full:** padrão para Curso 3 em diante; `zoom` para bumpers/conteúdo curto
- **Curso 2 Instagram:** só poster, não vídeo (decisão Yuri 2026-09-29)

---

## Próximo curso — checklist inicial

- [ ] Definir episódios e estrutura `## EPISÓDIO N / ### CENA N`
- [ ] Criar `cursoN-nome.md`
- [ ] Escolher voz: Bill (pago) · FranciscaNeural (grátis feminino) · AntonioNeural (grátis masculino)
- [ ] Escolher temas por bloco temático
- [ ] Escolher estilo: didático denso (Cursos 1-2) ou Crash Course (Curso 3 eps 4-8)
- [ ] Rodar: `python3 scripts/gerar_videos_curso3.py N` (substituir base)
- [ ] Enviar por email individual (timeout=180s por envio)
- [ ] Verificar saldo ElevenLabs se usar Bill: `GET /v1/user/subscription`
