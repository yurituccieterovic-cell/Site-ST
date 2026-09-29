#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gerar_videos_curso3.py — Curso 3: Respirar com o Planeta
Converte cursos/curso3-ecorrespiracao.md → MP4 via premiere_maker.py
Voz: pt-BR-FranciscaNeural (edge-tts, gratuita)
"""
import re, os, json, sys, subprocess, tempfile
from pathlib import Path

SRC     = "/root/Site-ST/aliancapanorama-src"
MD_PATH = f"{SRC}/cursos/curso3-ecorrespiracao.md"
OUT_DIR = f"{SRC}/cursos/videos-curso3"
SCRIPT  = f"{SRC}/scripts/premiere_maker.py"
PYTHON  = "/tmp/venv-video/bin/python3"
VOICE   = "pt-BR-FranciscaNeural"


def limpar_texto(text: str) -> str:
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'`(.*?)`', r'\1', text)
    text = re.sub(r'^[-*]\s+', '', text, flags=re.M)
    text = re.sub(r'[→←↑↓]', ' ', text)
    # subscripts: CO₂ H₂O → narração amigável
    text = text.replace('CO₂', 'C O 2').replace('H₂O', 'H 2 O').replace('O₂', 'O 2')
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def get_audio_duration(mp3_path: str) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", mp3_path],
        capture_output=True, text=True
    )
    try:
        return float(r.stdout.strip())
    except Exception:
        return 30.0


def gerar_tts(texto: str, out_path: str) -> float:
    r = subprocess.run(
        ["edge-tts", "--voice", VOICE, "--text", texto, "--write-media", out_path],
        capture_output=True
    )
    if r.returncode != 0:
        print(f"  ⚠️  TTS falhou: {r.stderr.decode()[:120]}")
        # fallback: arquivo silêncio
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
             "-t", "5", out_path],
            capture_output=True
        )
        return 5.0
    return get_audio_duration(out_path)


def parse_episodios(md_path: str) -> list:
    text = Path(md_path).read_text(encoding="utf-8")

    ep_pattern = re.compile(r'^## EPISÓDIO (\d+) — (.+?)$', re.M)
    ep_matches = list(ep_pattern.finditer(text))

    episodios = []
    for j, m in enumerate(ep_matches):
        ep_num   = int(m.group(1))
        ep_title = m.group(2).strip()

        start    = m.end()
        end      = ep_matches[j+1].start() if j+1 < len(ep_matches) else len(text)
        ep_text  = text[start:end]

        # Cortar seções de metadados (## Notas, ## Status, etc.) que não são ## EPISÓDIO
        meta_cut = re.search(r'\n## (?!EPISÓDIO)', ep_text)
        if meta_cut:
            ep_text = ep_text[:meta_cut.start()]

        subtitle_m = re.search(r'^\*(.+?)\*$', ep_text.strip(), re.M)
        subtitle   = subtitle_m.group(1).strip() if subtitle_m else ""

        cena_pattern = re.compile(r'^### CENA (\d+) — (.+?)$', re.M)
        cena_matches = list(cena_pattern.finditer(ep_text))

        cenas = []
        for k, cm in enumerate(cena_matches):
            cena_num   = int(cm.group(1))
            cena_title = cm.group(2).strip()

            c_start   = cm.end()
            c_end     = cena_matches[k+1].start() if k+1 < len(cena_matches) else len(ep_text)
            cena_text = ep_text[c_start:c_end].strip()
            cena_text = re.sub(r'^---+\s*$', '', cena_text, flags=re.M).strip()

            cenas.append({"num": cena_num, "title": cena_title, "text": cena_text})

        episodios.append({"num": ep_num, "title": ep_title, "subtitle": subtitle, "cenas": cenas})

    return episodios


def punch_line(texto: str) -> str:
    """Extrai a frase mais impactante do texto (curta, forte, normalmente no final)."""
    sentences = re.split(r'(?<=[.!?])\s+', texto)
    # Filtra: não-lista, 25-110 chars, preferencialmente final
    candidates = [s for s in sentences
                  if not s.startswith('-') and 25 <= len(s) <= 110]
    if not candidates:
        return sentences[0][:100] if sentences else texto[:100]
    # Prefere a última frase candidata (tende a ser o "mic drop")
    return candidates[-1]


def build_slides(ep: dict, tts_dir: str) -> list:
    slides = []

    # Slide de abertura
    intro_narr = (
        f"Curso 3: Respirar com o Planeta. "
        f"Episódio {ep['num']}: {ep['title']}. "
        f"{ep.get('subtitle', '')}".strip()
    )
    intro_mp3 = os.path.join(tts_dir, "intro.mp3")
    intro_dur = gerar_tts(intro_narr, intro_mp3)
    print(f"  🎙 Abertura ({intro_dur:.1f}s)")

    slides.append({
        "titulo":    f"Episódio {ep['num']}",
        "subtitulo": ep["title"],
        "texto":     ep.get("subtitle", ""),
        "naracao":   intro_narr,
        "duracao":   round(intro_dur + 0.3, 1),
        "layout":    "centralizado",
        "logo":      True
    })

    for cena in ep["cenas"]:
        naracao = limpar_texto(cena["text"])

        tts_mp3 = os.path.join(tts_dir, f"cena{cena['num']}.mp3")
        dur     = gerar_tts(naracao, tts_mp3)
        print(f"  🎙 Cena {cena['num']}: {cena['title']} ({dur:.1f}s)")

        display = punch_line(naracao)

        slides.append({
            "titulo":    cena["title"],
            "subtitulo": f"Ep {ep['num']} · Cena {cena['num']}",
            "texto":     display,
            "naracao":   naracao,
            "duracao":   round(dur + 0.3, 1),
            "layout":    "centralizado",
        })

    return slides


def gerar_episodio(ep: dict, out_dir: str) -> bool:
    ep_num  = ep["num"]
    slug    = f"ep{ep_num:02d}"
    out_mp4 = os.path.join(out_dir, f"curso3_{slug}.mp4")
    out_json = os.path.join(out_dir, f"curso3_{slug}.json")

    print(f"\n{'='*62}")
    print(f"  EP {ep_num}: {ep['title']}")
    print(f"{'='*62}")

    with tempfile.TemporaryDirectory() as tts_dir:
        slides = build_slides(ep, tts_dir)

    # JSON permanente (fora do tempdir)
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    Path(out_json).write_text(json.dumps(slides, ensure_ascii=False, indent=2))
    print(f"\n  📄 JSON: {out_json} ({len(slides)} slides)")

    total_s = sum(s["duracao"] for s in slides)
    print(f"  ⏱  Duração prevista: {total_s:.0f}s ({total_s/60:.1f}min)")

    cmd = [PYTHON, SCRIPT, out_json, out_mp4, "--tts", "pt-BR", "--layout", "escuro", "--motion", "zoom"]
    print(f"\n  ▶ premiere_maker...")
    r = subprocess.run(cmd)

    if r.returncode == 0 and Path(out_mp4).exists():
        size_mb = Path(out_mp4).stat().st_size / 1_048_576
        print(f"\n  ✅ {out_mp4} ({size_mb:.1f} MB)")
        return True
    else:
        print(f"\n  ❌ Falhou (ep {ep_num})")
        return False


def main():
    # Permite passar números de episódios: python3 gerar... 1 2
    ep_filter = [int(x) for x in sys.argv[1:]] if len(sys.argv) > 1 else []

    Path(OUT_DIR).mkdir(parents=True, exist_ok=True)

    episodios = parse_episodios(MD_PATH)
    if ep_filter:
        episodios = [e for e in episodios if e["num"] in ep_filter]

    print(f"Curso 3 — {len(episodios)} episódio(s) para gerar")
    print(f"Saída: {OUT_DIR}\n")

    ok = err = 0
    for ep in episodios:
        if gerar_episodio(ep, OUT_DIR):
            ok += 1
        else:
            err += 1

    print(f"\n{'='*62}")
    print(f"✅ Concluído: {ok} OK · {err} falhas")
    print(f"Vídeos em: {OUT_DIR}")


if __name__ == "__main__":
    main()
