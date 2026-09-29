#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gerar_bumpers.py — Vídeos de propaganda ~5s para ST · PAP · Calculus · Age
Uso: python3 gerar_bumpers.py [st|pap|calculus|age]  (sem args = todos)
Substitua os textos abaixo quando a Assembleia #718 responder.
"""
import json, os, sys, subprocess
from pathlib import Path

SRC    = "/root/Site-ST/aliancapanorama-src"
OUT    = f"{SRC}/cursos/bumpers"
SCRIPT = f"{SRC}/scripts/premiere_maker.py"
PYTHON = "/tmp/venv-video/bin/python3"

# ── Bumpers (atualizar com RESULTADO da Assembleia #718) ────────────────────
# Textos aprovados pela Assembleia #719 (RESULTADO Sessão #719)
BUMPERS = {
    "st": {
        "tema": "ocean",
        "tts":  "pt-BR",
        "slides": [
            {
                "titulo":    "Inteligência não nasce pronta.",
                "subtitulo": "Ela se cultiva. · Sociedade Tucci",
                "texto":     "Um ecossistema de IAs pedagógicas construído para aprender, criar e crescer.",
                "naracao":   "Inteligência não nasce pronta. Ela se cultiva. Conheça a Sociedade Tucci.",
                "duracao":   5.0,
                "logo":      True
            }
        ]
    },
    "pap": {
        "tema": "sunset",
        "tts":  "pt-BR",
        "slides": [
            {
                "titulo":    "Vestibular virou jogo. Você topa?",
                "subtitulo": "PAP — Aliança Panorama",
                "texto":     "Plataforma FUVEST gamificada. Estude diferente.",
                "naracao":   "E se o vestibular virasse um jogo? PAP: sua Fuvest gamificada.",
                "duracao":   5.0,
                "logo":      True
            }
        ]
    },
    "calculus": {
        "tema": "claro",
        "tts":  "pt-BR",
        "slides": [
            {
                "titulo":    "Matemática com alma. E penas.",
                "subtitulo": "Calculus + Sócia",
                "texto":     "Onde o Ábaco encontra a Arara. Matemática que não assusta.",
                "naracao":   "Matemática com alma. E penas. Conheça o Calculus — onde o Ábaco encontra a Arara.",
                "duracao":   5.0,
                "logo":      True
            }
        ]
    },
    "age": {
        "tema": "escuro",
        "tts":  "pt-BR",
        "slides": [
            {
                "titulo":    "Agendar consultas pode ser humano.",
                "subtitulo": "Age · Sabiá IA",
                "texto":     "Agenda médica e psicológica com inteligência. Para quem cuida de pessoas.",
                "naracao":   "Agendar consultas pode ser humano. Age: sua agenda médica com Sabiá, a IA que cuida de você.",
                "duracao":   5.0,
                "logo":      True
            }
        ]
    }
}

def gerar(key: str):
    cfg     = BUMPERS[key]
    out_mp4 = os.path.join(OUT, f"bumper_{key}.mp4")
    out_json = os.path.join(OUT, f"bumper_{key}.json")

    Path(out_json).write_text(json.dumps(cfg["slides"], ensure_ascii=False, indent=2))

    cmd = [
        PYTHON, SCRIPT, out_json, out_mp4,
        "--tts",      cfg["tts"],
        "--layout",   cfg["tema"],
        "--transicao","none",
        "--duracao",  "5",
    ]
    print(f"\n▶ bumper_{key} (tema: {cfg['tema']})...")
    r = subprocess.run(cmd)

    if r.returncode == 0 and Path(out_mp4).exists():
        mb = Path(out_mp4).stat().st_size / 1_048_576
        print(f"  ✅ {out_mp4} ({mb:.1f} MB)")
    else:
        print(f"  ❌ Falhou: {key}")

def main():
    Path(OUT).mkdir(parents=True, exist_ok=True)
    keys = sys.argv[1:] if sys.argv[1:] else list(BUMPERS.keys())
    for k in keys:
        if k in BUMPERS:
            gerar(k)
        else:
            print(f"⚠️  '{k}' não reconhecido. Opções: {list(BUMPERS.keys())}")

if __name__ == "__main__":
    main()
