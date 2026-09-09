#!/usr/bin/env python3
"""
PremiereMovieMaker — Sociedade Tucci
Gera vídeos MP4 a partir de slides JSON.
Uso: python3 premiere_maker.py entrada.json saida.mp4 [--fps 24] [--duracao 5]

Formato de entrada.json:
[
  {
    "titulo": "Título do slide",
    "texto": "Corpo do texto (aceita \\n)",
    "subtitulo": "Subtítulo opcional",
    "cor_fundo": "#0f0f1a",
    "cor_titulo": "#f59e0b",
    "cor_texto": "#e8e8e8",
    "duracao": 5,           // segundos (opcional, usa default se omitido)
    "imagem": "path.png",   // opcional — exibida à direita
    "logo": true            // se true, exibe logo ST no canto
  }
]

Dependências: Pillow, ffmpeg
"""

import sys, json, os, subprocess, shutil, textwrap, argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ─── Config ──────────────────────────────────────────────────────────────────

FONT_BOLD   = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_NORMAL = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO   = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
W, H = 1280, 720
LOGO_TEXT = "Sociedade Tucci"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def cor(hex_str: str) -> tuple:
    h = hex_str.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def draw_multiline(draw: ImageDraw.ImageDraw, text: str, x: int, y: int,
                   font, fill, max_width: int, line_spacing: int = 10) -> int:
    """Desenha texto com quebra automática. Retorna Y final."""
    wrapped = []
    for line in text.split("\n"):
        wrapped.extend(textwrap.wrap(line, width=max(10, max_width // (font.size // 2 + 1))) or [""])
    for line in wrapped:
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font)
        y += (bbox[3] - bbox[1]) + line_spacing
    return y

# ─── Renderizar slide ─────────────────────────────────────────────────────────

def render_slide(slide: dict, idx: int, tmp_dir: str) -> str:
    bg        = cor(slide.get("cor_fundo", "#0f0f1a"))
    cor_titulo = cor(slide.get("cor_titulo", "#f59e0b"))
    cor_texto  = cor(slide.get("cor_texto",  "#e8e8e8"))
    cor_sub    = cor(slide.get("cor_subtitulo", "#94a3b8"))
    titulo     = slide.get("titulo", "")
    texto      = slide.get("texto", "")
    subtitulo  = slide.get("subtitulo", "")
    tem_logo   = slide.get("logo", True)

    img  = Image.new("RGB", (W, H), color=bg)
    draw = ImageDraw.ImageDraw(img)

    # Gradiente sutil no topo
    for i in range(H // 4):
        alpha = int(30 * (1 - i / (H / 4)))
        r = min(255, bg[0] + alpha)
        g = min(255, bg[1] + alpha // 2)
        b = min(255, bg[2] + alpha // 2)
        draw.line([(0, i), (W, i)], fill=(r, g, b))

    # Barra lateral esquerda colorida
    barra_cor = cor_titulo
    for xi in range(8):
        alpha = 180 - xi * 20
        draw.line([(60 + xi, 80), (60 + xi, H - 80)], fill=(*barra_cor, alpha))

    # Área de conteúdo
    area_x = 100
    area_max_w = W - 160

    y = 100

    # Subtítulo (antes do título)
    if subtitulo:
        f_sub = load_font(FONT_NORMAL, 22)
        draw.text((area_x, y), subtitulo.upper(), font=f_sub, fill=cor_sub)
        y += 38

    # Título
    if titulo:
        f_titulo_size = 56 if len(titulo) < 40 else 44 if len(titulo) < 60 else 36
        f_titulo = load_font(FONT_BOLD, f_titulo_size)
        y = draw_multiline(draw, titulo, area_x, y, f_titulo, cor_titulo, area_max_w, 8)
        y += 24

    # Linha separadora
    if titulo and texto:
        draw.line([(area_x, y), (area_x + 80, y)], fill=cor_titulo, width=3)
        y += 20

    # Texto corpo
    if texto:
        f_texto = load_font(FONT_NORMAL, 28)
        y = draw_multiline(draw, texto, area_x, y, f_texto, cor_texto, area_max_w, 10)

    # Logo ST
    if tem_logo:
        f_logo = load_font(FONT_MONO, 18)
        draw.text((W - 220, H - 50), LOGO_TEXT, font=f_logo, fill=(*cor_sub, 160))

    # Imagem opcional (canto direito, se a área for estreita)
    imagem_path = slide.get("imagem")
    if imagem_path and os.path.exists(imagem_path):
        try:
            thumb = Image.open(imagem_path).convert("RGBA")
            thumb.thumbnail((340, 300))
            img.paste(thumb, (W - thumb.width - 40, (H - thumb.height) // 2),
                      thumb if thumb.mode == "RGBA" else None)
        except Exception:
            pass

    path = os.path.join(tmp_dir, f"slide_{idx:04d}.png")
    img.save(path)
    return path

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="PremiereMovieMaker — Sociedade Tucci")
    ap.add_argument("entrada", help="JSON com lista de slides")
    ap.add_argument("saida",   help="Arquivo de saída .mp4")
    ap.add_argument("--fps",     type=int, default=24, help="FPS do vídeo (default 24)")
    ap.add_argument("--duracao", type=float, default=5.0, help="Duração padrão de cada slide em segundos (default 5)")
    ap.add_argument("--audio",   default=None, help="Arquivo de áudio para narração (MP3/WAV)")
    args = ap.parse_args()

    slides = json.loads(Path(args.entrada).read_text())
    if not isinstance(slides, list) or not slides:
        print("ERRO: JSON deve ser uma lista não-vazia de slides.", file=sys.stderr)
        sys.exit(1)

    tmp_dir = "/tmp/premiere_maker_tmp"
    shutil.rmtree(tmp_dir, ignore_errors=True)
    os.makedirs(tmp_dir)

    print(f"Renderizando {len(slides)} slides...")
    concat_lines = []
    for i, slide in enumerate(slides):
        path = render_slide(slide, i, tmp_dir)
        dur  = slide.get("duracao", args.duracao)
        # Repetir frame FPS×dur vezes usando FFmpeg concat
        n_frames = max(1, int(dur * args.fps))
        for f in range(n_frames):
            frame_path = os.path.join(tmp_dir, f"frame_{i:04d}_{f:06d}.png")
            os.symlink(path, frame_path)
        concat_lines.append(f"file '{path}'\nduration {dur}")
        print(f"  [{i+1}/{len(slides)}] {slide.get('titulo','slide')[:40]}")

    # Escrever concat list
    concat_file = os.path.join(tmp_dir, "concat.txt")
    Path(concat_file).write_text("\n".join(concat_lines))

    # FFmpeg: concat → MP4
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", concat_file,
        "-vf", f"scale={W}:{H}",
        "-c:v", "libx264", "-preset", "fast", "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-r", str(args.fps),
    ]
    if args.audio and os.path.exists(args.audio):
        cmd += ["-i", args.audio, "-c:a", "aac", "-shortest"]
    cmd.append(args.saida)

    print(f"\nMontando vídeo: {args.saida}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("ERRO FFmpeg:", result.stderr[-2000:], file=sys.stderr)
        sys.exit(1)

    shutil.rmtree(tmp_dir, ignore_errors=True)
    size_mb = Path(args.saida).stat().st_size / 1_048_576
    print(f"✅ Vídeo gerado: {args.saida} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
