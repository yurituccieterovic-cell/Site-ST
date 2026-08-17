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

---

## Pipeline geral (ambos os cursos)

```
Roteiro MD
  ↓ parse por bloco ## CENA
  ↓ extrair NARRAÇÃO
  ↓ limpar_texto() — remove markdown, código, setas
  ↓ TTS (edge-tts ou ElevenLabs)
  ↓ imagem pollinations.ai (dark tech, seed por episódio+cena)
  ↓ ffmpeg: -loop 1 imagem + áudio → clip MP4
  ↓ ffmpeg concat → episódio final
  ↓ email SMTP_SSL (nova conexão por envio, 3 retries)
```

**Cortes dinâmicos — intro/trailer:**
- Split por linha (`\n`) dentro de cada CENA
- Threshold mínimo: **4 chars** (NÃO 20 — cortaria linhas punch como "IA. Banco. RAM.")
- Episódios regulares: 1 narração por CENA (5–6 clips/ep)

---

## Gotchas — não repetir esses erros

| # | Problema | Solução |
|---|---|---|
| 1 | `client.generate()` não existe no ElevenLabs v2.59 | Usar `client.text_to_speech.convert(voice_id, text, model_id, output_format)` |
| 2 | SMTP "Server not connected" em sessões longas | `with smtplib.SMTP_SSL(...) as server:` — nova conexão por email |
| 3 | Intro cortado (23s em vez de 42s) | Threshold `> 20` filtrava linhas curtas; usar `> 4` |
| 4 | pollinations.ai timeout | 3 tentativas; fallback `ffmpeg color=0x080820` |
| 5 | `pip install` global falha no Python 3.14+ Debian | Virtualenv em `/tmp/venv-video/` |
| 6 | Pillow vs. pollinations para texto | Pillow renderiza texto corretamente; pollinations distorce |

---

## Decisões de design

- **Dark-neon:** fundo `#08082` azul-noite, acentos ciano `#00B4FF`, dourado `#FFC83C`
- **Poster quadrado:** 1080×1080 (Instagram) com pirâmide + tabela de autorias + colchetes decorativos
- **Voz do Professor Cláudio:** Bill (grave, idoso) → padrão para cursos com narrador técnico-pedagógico
- **Narrador neutro:** edge-tts pt-BR-AntonioNeural → usar quando não precisa de voz envelhecida

---

## Próximo curso — checklist inicial

- [ ] Definir episódios e estrutura `## CENA`
- [ ] Criar `cursoN-nome.md` e `cursoN-midias-sociais.md`
- [ ] Escolher voz: Bill (pago, idoso) ou AntonioNeural (grátis)
- [ ] Verificar saldo ElevenLabs se usar Bill: `GET /v1/user/subscription`
- [ ] Copiar script `gerar_videos_curso2.py` como base
- [ ] Ajustar threshold intro para `> 4` chars desde o início
- [ ] Testar SMTP com `with smtplib.SMTP_SSL(...)` por envio
