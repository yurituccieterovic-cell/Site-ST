# LIVRO-VISAO-WORKFLOW.md — Extração de Informações de Imagens e Vídeos
*Sociedade Tucci · Sessão 26b · 2026-07-07*

---

## 1. Visão Geral

Workflow para IAs extraírem informações de:
- **Imagens estáticas**: JPG, PNG, PDF com imagens, screenshots
- **Vídeos**: MP4 via frames extraídos com ffmpeg
- **Câmera ao vivo**: captura de frames em tempo real via webcam

---

## 2. Extração de Frames de Vídeo

### Dependências
```bash
apt-get install ffmpeg        # versão 8.0.1+
```

### Extrair frames a cada 30 segundos
```bash
ffmpeg -i video.mp4 -vf "fps=1/30" -q:v 3 frame_%04d.jpg
```

### Extrair frame em instante específico
```bash
ffmpeg -i video.mp4 -ss 00:01:30 -vframes 1 frame_90s.jpg
```

### Redimensionar frame mantendo proporção
```python
from PIL import Image
img = Image.open("frame.jpg")
img.thumbnail((270, 600))    # max 270x600, mantém AR
img.save("frame_thumb.jpg")
```

### Ambiente: Python 3.14 (sistema)
```bash
apt-get install python3-pil   # Pillow 12.1.1
```

---

## 3. Extração de Texto de PDF (pymupdf)

```python
import sys
sys.path.insert(0, '/usr/lib/python3/dist-packages')
import pymupdf  # NÃO fitz — instalar com apt-get install python3-pymupdf

doc = pymupdf.open("arquivo.pdf")
for pg_num in range(len(doc)):
    page = doc[pg_num]
    text = page.get_text()
    print(f"=== Página {pg_num+1} ===\n{text}")
```

### Identificar início de seção
```python
for pg_num, page in enumerate(doc):
    text = page.get_text()
    if "PARTE I" in text or "18:31" in text:
        print(f"Seção inicia na página {pg_num + 1}")
        break
```

---

## 4. Visão via API Gemini (imagem → texto)

### Dependências
```bash
pip install google-generativeai
```

### Código
```python
import google.generativeai as genai
import PIL.Image

genai.configure(api_key="GEMINI_API_KEY")
model = genai.GenerativeModel("gemini-2.0-flash")

img = PIL.Image.open("frame.jpg")
resp = model.generate_content([
    "Descreva detalhadamente o que está nesta imagem. Se houver texto, transcreva-o.",
    img
])
print(resp.text)
```

### Com múltiplos frames de vídeo
```python
frames = [PIL.Image.open(f) for f in sorted(glob.glob("frames/*.jpg"))]
resp = model.generate_content([
    "Estes são frames de um vídeo em ordem cronológica. Resuma o conteúdo do vídeo.",
    *frames
])
```

---

## 5. Visão via Câmera ao Vivo (OpenCV)

```python
import cv2, base64, google.generativeai as genai

cap = cv2.VideoCapture(0)  # câmera 0 = webcam principal
ret, frame = cap.read()
cap.release()

# Encode para bytes
_, buf = cv2.imencode('.jpg', frame)
img_bytes = buf.tobytes()

# Enviar para Gemini Vision
model = genai.GenerativeModel("gemini-2.0-flash")
resp = model.generate_content([
    "O que você vê nesta imagem da câmera?",
    {"mime_type": "image/jpeg", "data": img_bytes}
])
print(resp.text)
```

---

## 6. OCR local (Tesseract)

```bash
apt-get install tesseract-ocr tesseract-ocr-por
```

```python
import pytesseract
from PIL import Image

img = Image.open("frame.jpg")
text = pytesseract.image_to_string(img, lang="por")
print(text)
```

---

## 7. Pipeline Completo: Vídeo → Texto → Resumo

```python
#!/usr/bin/env python3
import os, glob, subprocess, sys
sys.path.insert(0, '/usr/lib/python3/dist-packages')
import google.generativeai as genai
from PIL import Image

VIDEO = "video.mp4"
FRAMES_DIR = "frames/"
API_KEY = os.environ["GEMINI_API_KEY"]

# 1. Extrair frames
os.makedirs(FRAMES_DIR, exist_ok=True)
subprocess.run(["ffmpeg", "-i", VIDEO, "-vf", "fps=1/30", "-q:v", "3",
                f"{FRAMES_DIR}frame_%04d.jpg"], check=True)

# 2. Redimensionar
frames = []
for fp in sorted(glob.glob(f"{FRAMES_DIR}*.jpg")):
    img = Image.open(fp)
    img.thumbnail((512, 512))
    frames.append(img)

# 3. Enviar para Gemini
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")
resp = model.generate_content([
    "Frames extraídos de um vídeo em ordem cronológica. Extraia TODO o texto visível. "
    "Onde texto estiver truncado ou ilegível, coloque [...]. "
    "Organize por timestamp estimado.",
    *frames
])
print(resp.text)
```

---

## 8. Uso no PAP — MEKY Vision

O módulo `meky-vision.ts` já implementa:
- `POST /api/meky/vision` — envia imagem para Gemini Vision
- `GET /api/meky/vision/history` — histórico de análises

Rota backend em `artifacts/api-server/src/routes/meky-vision.ts`.

---

## 9. Limitações e Boas Práticas

| Situação | Recomendação |
|----------|-------------|
| Vídeo > 1GB | Extrair apenas frames dos momentos-chave |
| Texto ilegível | Usar `[...]` para marcar truncamento |
| Câmera no Termux | `cv2.VideoCapture(0)` pode não funcionar — usar `termux-camera-photo` |
| PDF com imagens | pymupdf extrai texto; para imagens use `page.get_images()` |
| Rate limit Gemini | Free tier: 15 req/min — batchear frames em grupos de 5 |
| Frames portrait (9:16) | Redimensionar para max 270×600 antes de enviar |

---

## 10. Exemplo: PDF com Imagens Embutidas

```python
import pymupdf
doc = pymupdf.open("identificando-pecas.pdf")
for pg_num in range(len(doc)):
    page = doc[pg_num]
    imgs = page.get_images()
    for img_idx, img_ref in enumerate(imgs):
        xref = img_ref[0]
        pix = pymupdf.Pixmap(doc, xref)
        pix.save(f"page_{pg_num+1}_img_{img_idx}.png")
```

---

*Criado: 2026-07-07 · Sessão 26b*
*Atualizar em: quando novos modelos Gemini Vision disponíveis*
