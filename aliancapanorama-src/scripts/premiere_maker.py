#!/usr/bin/env python3
"""
PremiereMovieMaker v2 — Sociedade Tucci
Slides JSON → MP4 com animações, transições, TTS e layouts profissionais.

Uso: python3 premiere_maker.py entrada.json saida.mp4 [opções]

Opções:
  --fps 24            FPS (default 24)
  --duracao 5         Duração padrão por slide (seg)
  --tts pt-BR         Narração automática (pt-BR, pt-BR-m, en-US)
  --audio path.mp3    Áudio externo
  --transicao fade    Transição entre slides: fade (default) | none
  --layout escuro     Tema: escuro (default) | claro | ocean | sunset

Campos do slide JSON:
  titulo, texto, subtitulo, naracao, duracao, imagem, logo: bool
  cor_fundo, cor_titulo, cor_texto, cor_subtitulo (override de tema)
  layout: "default" | "centralizado" | "splitdir" (imagem à esquerda)

Dependências: Pillow, ffmpeg, edge-tts (opcional)
"""

import sys, json, os, subprocess, shutil, textwrap, argparse, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ─── Config ──────────────────────────────────────────────────────────────────

FONT_BOLD   = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_NORMAL = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO   = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
W, H = 1280, 720
LOGO_TEXT = "Sociedade Tucci"
FADE_SEC  = 0.45   # duração do fade-in em segundos

TEMAS = {
    "escuro":  {"bg": "#0a0d14", "titulo": "#f59e0b", "texto": "#e8e8e8", "sub": "#94a3b8", "acento": "#f59e0b"},
    "claro":   {"bg": "#f8fafc", "titulo": "#1e293b", "texto": "#334155", "sub": "#64748b", "acento": "#3b82f6"},
    "ocean":   {"bg": "#0c1a2e", "titulo": "#38bdf8", "texto": "#e0f2fe", "sub": "#7dd3fc", "acento": "#0ea5e9"},
    "sunset":  {"bg": "#1a0a14", "titulo": "#fb923c", "texto": "#fde8d0", "sub": "#fdba74", "acento": "#f97316"},
}

# ─── Helpers ─────────────────────────────────────────────────────────────────

def cor(hex_str: str) -> tuple:
    h = hex_str.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def draw_multiline(draw, text: str, x: int, y: int, font, fill, max_width: int,
                   line_spacing: int = 10, align: str = "left") -> int:
    wrapped = []
    for line in text.split("\n"):
        wrapped.extend(textwrap.wrap(line, width=max(10, max_width // max(1, font.size // 2 + 1))) or [""])
    for line in wrapped:
        if align == "center":
            bbox = draw.textbbox((0, 0), line, font=font)
            x_off = x + (max_width - (bbox[2] - bbox[0])) // 2
        else:
            x_off = x
        draw.text((x_off, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x_off, y), line, font=font)
        y += (bbox[3] - bbox[1]) + line_spacing
    return y

def gradient_bg(img: Image.Image, bg: tuple, acento: tuple, estilo: str = "diagonal"):
    """Aplica gradiente rico sobre o fundo."""
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        if estilo == "diagonal":
            r = int(bg[0] + (acento[0] - bg[0]) * t * 0.15)
            g = int(bg[1] + (acento[1] - bg[1]) * t * 0.08)
            b = int(bg[2] + (acento[2] - bg[2]) * t * 0.10)
        else:
            r = int(bg[0] * (1 - t * 0.2))
            g = int(bg[1] * (1 - t * 0.2))
            b = int(bg[2] * (1 - t * 0.2))
        draw.line([(0, y), (W, y)], fill=(max(0,min(255,r)), max(0,min(255,g)), max(0,min(255,b))))

def draw_progress_bar(draw, idx: int, total: int, acento: tuple, y_pos: int = H - 8):
    """Barra de progresso fina no rodapé."""
    pct = (idx + 1) / max(1, total)
    bar_w = int(W * pct)
    draw.rectangle([(0, y_pos), (W, H)], fill=(0, 0, 0))
    draw.rectangle([(0, y_pos), (bar_w, H)], fill=(*acento, 180))

def rounded_rect(draw, xy, radius: int, fill):
    """Retângulo com bordas arredondadas."""
    x0, y0, x1, y1 = xy
    r = radius
    draw.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
    draw.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
    draw.ellipse([x0, y0, x0 + 2*r, y0 + 2*r], fill=fill)
    draw.ellipse([x1 - 2*r, y0, x1, y0 + 2*r], fill=fill)
    draw.ellipse([x0, y1 - 2*r, x0 + 2*r, y1], fill=fill)
    draw.ellipse([x1 - 2*r, y1 - 2*r, x1, y1], fill=fill)

# ─── Renderizar slide base ────────────────────────────────────────────────────

def render_slide(slide: dict, idx: int, total: int, tmp_dir: str, tema: dict) -> str:
    # Cores: slide pode sobrescrever tema
    bg_hex      = slide.get("cor_fundo",     tema["bg"])
    titulo_hex  = slide.get("cor_titulo",    tema["titulo"])
    texto_hex   = slide.get("cor_texto",     tema["texto"])
    sub_hex     = slide.get("cor_subtitulo", tema["sub"])
    acento_rgb  = cor(titulo_hex)
    bg_rgb      = cor(bg_hex)

    titulo    = slide.get("titulo", "")
    texto     = slide.get("texto", "")
    subtitulo = slide.get("subtitulo", "")
    tem_logo  = slide.get("logo", True)
    layout    = slide.get("layout", "default")

    img = Image.new("RGB", (W, H), color=bg_rgb)
    gradient_bg(img, bg_rgb, acento_rgb)
    draw = ImageDraw.ImageDraw(img)

    # ── Decoração de fundo: pontos sutis ──
    for xi in range(0, W, 60):
        for yi in range(0, H, 60):
            r_val = int(bg_rgb[0] * 1.4)
            g_val = int(bg_rgb[1] * 1.4)
            b_val = int(bg_rgb[2] * 1.4)
            draw.ellipse([(xi - 1, yi - 1), (xi + 1, yi + 1)],
                         fill=(min(255, r_val), min(255, g_val), min(255, b_val)))

    # ── Layout centralizado ──
    if layout == "centralizado":
        area_x = 80
        area_w = W - 160
        y = H // 4

        if subtitulo:
            f_sub = load_font(FONT_NORMAL, 20)
            draw_multiline(draw, subtitulo.upper(), area_x, y, f_sub, cor(sub_hex), area_w, align="center")
            y += 36

        if titulo:
            f_sz = 64 if len(titulo) < 30 else 52 if len(titulo) < 50 else 40
            f_titulo = load_font(FONT_BOLD, f_sz)
            y = draw_multiline(draw, titulo, area_x, y, f_titulo, cor(titulo_hex), area_w, 8, "center")
            y += 16

        # Linha horizontal centrada
        if titulo and texto:
            line_w = 100
            mid = W // 2
            draw.line([(mid - line_w // 2, y), (mid + line_w // 2, y)], fill=acento_rgb, width=3)
            y += 20

        if texto:
            f_texto = load_font(FONT_NORMAL, 26)
            draw_multiline(draw, texto, area_x, y, f_texto, cor(texto_hex), area_w, 10, "center")

    # ── Layout split (imagem à esquerda) ──
    elif layout == "splitdir" and slide.get("imagem") and os.path.exists(slide["imagem"]):
        try:
            thumb = Image.open(slide["imagem"]).convert("RGBA")
            img_w = W // 2 - 40
            img_h = H - 80
            thumb.thumbnail((img_w, img_h))
            ix = 20
            iy = (H - thumb.height) // 2
            img.paste(thumb, (ix, iy), thumb if thumb.mode == "RGBA" else None)
        except Exception:
            pass

        area_x = W // 2 + 20
        area_w = W // 2 - 60
        y = 100
        if subtitulo:
            f_sub = load_font(FONT_NORMAL, 18)
            draw.text((area_x, y), subtitulo.upper(), font=f_sub, fill=cor(sub_hex))
            y += 32
        if titulo:
            f_sz = 44 if len(titulo) < 40 else 34
            f_titulo = load_font(FONT_BOLD, f_sz)
            y = draw_multiline(draw, titulo, area_x, y, f_titulo, cor(titulo_hex), area_w, 6)
            y += 16
        if titulo and texto:
            draw.line([(area_x, y), (area_x + 60, y)], fill=acento_rgb, width=3)
            y += 16
        if texto:
            f_texto = load_font(FONT_NORMAL, 24)
            draw_multiline(draw, texto, area_x, y, f_texto, cor(texto_hex), area_w, 9)

    # ── Layout padrão (barra lateral) ──
    else:
        # Barra lateral esquerda com gradiente
        for xi in range(10):
            opacity = int(200 * (1 - xi / 10))
            draw.line([(55 + xi, 70), (55 + xi, H - 70)], fill=(*acento_rgb, opacity))

        area_x = 90
        area_w = W - 140
        y = 90

        if subtitulo:
            f_sub = load_font(FONT_NORMAL, 20)
            draw.text((area_x, y), subtitulo.upper(), font=f_sub, fill=cor(sub_hex))
            y += 34

        if titulo:
            f_sz = 58 if len(titulo) < 35 else 46 if len(titulo) < 55 else 36
            f_titulo = load_font(FONT_BOLD, f_sz)
            # Sombra sutil
            draw_multiline(draw, titulo, area_x + 2, y + 2, f_titulo,
                          (0, 0, 0), area_w, 8)
            y = draw_multiline(draw, titulo, area_x, y, f_titulo, cor(titulo_hex), area_w, 8)
            y += 20

        if titulo and texto:
            draw.line([(area_x, y), (area_x + 90, y)], fill=acento_rgb, width=3)
            y += 18

        if texto:
            f_texto = load_font(FONT_NORMAL, 28)
            draw_multiline(draw, texto, area_x, y, f_texto, cor(texto_hex), area_w, 11)

        # Imagem no canto direito (layout default com imagem)
        imagem_path = slide.get("imagem")
        if layout != "splitdir" and imagem_path and os.path.exists(imagem_path):
            try:
                thumb = Image.open(imagem_path).convert("RGBA")
                thumb.thumbnail((340, 280))
                img.paste(thumb, (W - thumb.width - 30, (H - thumb.height) // 2),
                          thumb if thumb.mode == "RGBA" else None)
            except Exception:
                pass

    # Logo ST
    if tem_logo:
        f_logo = load_font(FONT_MONO, 16)
        draw.text((W - 210, H - 30), LOGO_TEXT, font=f_logo, fill=(*cor(sub_hex), 140))

    # Barra de progresso no rodapé
    draw_progress_bar(draw, idx, total, acento_rgb)

    # Número do slide (canto inferior esquerdo)
    f_num = load_font(FONT_MONO, 14)
    draw.text((10, H - 26), f"{idx + 1}/{total}", font=f_num, fill=(*acento_rgb, 120))

    path = os.path.join(tmp_dir, f"slide_{idx:04d}.png")
    img.save(path, quality=95)
    return path

# ─── Fade-in frame por frame ─────────────────────────────────────────────────

def gerar_frames_slide(slide_img: Image.Image, fps: int, duracao: float,
                       tmp_dir: str, slide_idx: int, fade_sec: float = FADE_SEC) -> list[str]:
    """
    Gera frames com fade-in inicial.
    Retorna lista de caminhos de frames.
    """
    total_frames = max(4, int(duracao * fps))
    fade_frames  = min(int(fade_sec * fps), total_frames // 2)
    black = Image.new("RGB", slide_img.size, (0, 0, 0))

    frames = []
    for f in range(total_frames):
        if f < fade_frames:
            alpha = f / fade_frames           # 0.0 → 1.0
            frame = Image.blend(black, slide_img, alpha)
        else:
            frame = slide_img

        fpath = os.path.join(tmp_dir, f"f_{slide_idx:04d}_{f:06d}.jpg")
        frame.save(fpath, "JPEG", quality=88)
        frames.append(fpath)
    return frames

# ─── TTS ─────────────────────────────────────────────────────────────────────

TTS_VOICES = {
    "pt-BR":   "pt-BR-FranciscaNeural",
    "pt-BR-m": "pt-BR-AntonioNeural",
    "en-US":   "en-US-JennyNeural",
}

def gerar_audio_tts(slides: list, tmp_dir: str, voz_key: str = "pt-BR") -> str | None:
    if not shutil.which("edge-tts"):
        print("⚠️  edge-tts CLI não encontrado. Pulando narração.")
        return None

    voz = TTS_VOICES.get(voz_key, TTS_VOICES["pt-BR"])
    partes = []
    for i, slide in enumerate(slides):
        texto_narrado = slide.get("naracao") or slide.get("texto") or slide.get("titulo") or ""
        if not texto_narrado.strip():
            continue
        dest = os.path.join(tmp_dir, f"tts_{i:04d}.mp3")
        r = subprocess.run(
            ["edge-tts", "--voice", voz, "--text", texto_narrado, "--write-media", dest],
            capture_output=True,
        )
        if r.returncode != 0:
            print(f"  ⚠️  TTS slide {i} falhou")
            continue
        partes.append(dest)
        print(f"  🎙 TTS [{i+1}/{len(slides)}] {texto_narrado[:55]}...")

    if not partes:
        return None

    lista = os.path.join(tmp_dir, "tts_concat.txt")
    Path(lista).write_text("\n".join(f"file '{p}'" for p in partes))
    saida_tts = os.path.join(tmp_dir, "naracao.mp3")
    r = subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", saida_tts],
        capture_output=True,
    )
    if r.returncode != 0:
        return None
    size_kb = Path(saida_tts).stat().st_size // 1024
    print(f"✅ Narração TTS gerada ({size_kb} KB)")
    return saida_tts

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="PremiereMovieMaker v2 — Sociedade Tucci")
    ap.add_argument("entrada",    help="JSON com lista de slides")
    ap.add_argument("saida",      help="Arquivo de saída .mp4")
    ap.add_argument("--fps",      type=int,   default=24,      help="FPS (default 24)")
    ap.add_argument("--duracao",  type=float, default=5.0,     help="Duração padrão de cada slide em seg (default 5)")
    ap.add_argument("--tts",      default=None, metavar="VOZ",
                    help="Narração edge-tts: pt-BR | pt-BR-m | en-US")
    ap.add_argument("--audio",    default=None, help="Arquivo de áudio externo (MP3/WAV)")
    ap.add_argument("--transicao",default="fade",choices=["fade","none"],
                    help="Transição entre slides: fade (default) | none")
    ap.add_argument("--layout",   default="escuro",choices=list(TEMAS.keys()),
                    help="Tema visual: escuro | claro | ocean | sunset")
    args = ap.parse_args()

    slides = json.loads(Path(args.entrada).read_text())
    if not isinstance(slides, list) or not slides:
        print("ERRO: JSON deve ser lista não-vazia de slides.", file=sys.stderr)
        sys.exit(1)

    tema = TEMAS[args.layout]

    tmp_dir = "/tmp/premiere_maker_tmp"
    shutil.rmtree(tmp_dir, ignore_errors=True)
    os.makedirs(tmp_dir)

    # TTS
    audio_final = args.audio
    if args.tts is not None:
        voz_key = args.tts if args.tts else "pt-BR"
        print(f"\n🎙 Gerando narração TTS ({TTS_VOICES.get(voz_key, voz_key)})...")
        audio_tts = gerar_audio_tts(slides, tmp_dir, voz_key)
        if audio_tts:
            audio_final = audio_tts

    # Renderizar slides e gerar frames
    print(f"\nRenderizando {len(slides)} slides (tema: {args.layout}, transição: {args.transicao})...")
    all_frames: list[str] = []
    fade_on = args.transicao == "fade"

    for i, slide in enumerate(slides):
        slide_img = Image.open(
            render_slide(slide, i, len(slides), tmp_dir, tema)
        ).convert("RGB")

        dur = slide.get("duracao", args.duracao)
        frames = gerar_frames_slide(
            slide_img, args.fps, dur, tmp_dir, i,
            fade_sec=FADE_SEC if fade_on else 0
        )
        all_frames.extend(frames)
        print(f"  [{i+1}/{len(slides)}] {slide.get('titulo','slide')[:40]} "
              f"({len(frames)} frames, {dur:.1f}s)")

    # Escrever lista de frames para FFmpeg
    frame_list = os.path.join(tmp_dir, "frames.txt")
    Path(frame_list).write_text(
        "\n".join(f"file '{f}'\nduration {1/args.fps:.6f}" for f in all_frames)
    )

    # FFmpeg: frames → MP4
    print(f"\nMontando vídeo ({len(all_frames)} frames a {args.fps} fps)...")
    cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", frame_list]
    if audio_final and os.path.exists(audio_final):
        cmd += ["-i", audio_final]
    cmd += [
        "-vf", f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2",
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-r", str(args.fps),
    ]
    if audio_final and os.path.exists(audio_final):
        cmd += ["-c:a", "aac", "-b:a", "192k", "-shortest"]
    cmd.append(args.saida)

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("ERRO FFmpeg:", result.stderr[-3000:], file=sys.stderr)
        sys.exit(1)

    shutil.rmtree(tmp_dir, ignore_errors=True)
    size_mb = Path(args.saida).stat().st_size / 1_048_576
    total_dur = sum(s.get("duracao", args.duracao) for s in slides)
    print(f"\n✅ Vídeo gerado: {args.saida}")
    print(f"   Duração: {total_dur:.0f}s | Tamanho: {size_mb:.1f} MB | "
          f"FPS: {args.fps} | Tema: {args.layout}")


if __name__ == "__main__":
    main()
