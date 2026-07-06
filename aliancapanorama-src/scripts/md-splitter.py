#!/usr/bin/env python3
"""
md-splitter.py — Divide MDs grandes automaticamente.

Quando um arquivo .md ultrapassa MAX_LINES linhas:
  1. Move o excesso para ARQUIVO-parte-N.md
  2. Cria/atualiza ARQUIVO-MASTER.md com links para todas as partes

Uso:
  python3 md-splitter.py ARQUIVO.md [--max-lines 2000]
  python3 md-splitter.py --check-all   # verifica todos os MDs do repo
"""

import sys
import os
import re
import argparse
from pathlib import Path
from datetime import datetime

DEFAULT_MAX_LINES = 2000
MD_ROOT = Path(__file__).parent.parent


def split_md(path: Path, max_lines: int = DEFAULT_MAX_LINES) -> bool:
    """Divide path se > max_lines. Retorna True se dividiu."""
    lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    if len(lines) <= max_lines:
        return False

    stem = path.stem  # ex: "APRENDIZADO"
    suffix = path.suffix  # ".md"
    parent = path.parent

    # Determinar qual parte esta é (se já tem "-parte-N" no nome, pula)
    if re.search(r"-parte-\d+$", stem):
        return False

    # Descobrir próxima parte disponível
    part_num = 2
    while (parent / f"{stem}-parte-{part_num}{suffix}").exists():
        part_num += 1

    # Split: mantém primeiras max_lines no original, resto vai para nova parte
    original_content = "".join(lines[:max_lines])
    overflow_content = "".join(lines[max_lines:])

    new_part_path = parent / f"{stem}-parte-{part_num}{suffix}"

    # Cabeçalho para a nova parte
    header = f"# {stem} — Parte {part_num}\n> Continuação automática de `{path.name}`. Gerado em {datetime.now().strftime('%Y-%m-%d')}.\n\n"

    path.write_text(original_content, encoding="utf-8")
    new_part_path.write_text(header + overflow_content, encoding="utf-8")

    print(f"[md-splitter] {path.name} → {new_part_path.name} ({len(lines) - max_lines} linhas movidas)")

    # Atualizar master MD
    _update_master(path, part_num, max_lines)
    return True


def _update_master(original: Path, latest_part: int, max_lines: int) -> None:
    stem = original.stem
    suffix = original.suffix
    parent = original.parent
    master_path = parent / f"{stem}-MASTER{suffix}"

    parts = [(1, original)]
    for n in range(2, latest_part + 1):
        p = parent / f"{stem}-parte-{n}{suffix}"
        if p.exists():
            parts.append((n, p))

    lines_info = [f"| Parte {n} | [{p.name}]({p.name}) | {len(p.read_text().splitlines())} linhas |" for n, p in parts]

    master_content = f"""# {stem} — Master Index
> Gerado automaticamente pelo md-splitter. Atualizado em {datetime.now().strftime('%Y-%m-%d %H:%M')}.
> Cada parte tem ~{max_lines} linhas. Ler pela ordem das partes.

## Partes

| # | Arquivo | Tamanho |
|---|---------|---------|
{"".join(l + chr(10) for l in lines_info)}
## Navegação rápida

Para buscar conteúdo específico, use o índice de cada parte ou `grep` no diretório.
"""
    master_path.write_text(master_content, encoding="utf-8")
    print(f"[md-splitter] Master atualizado: {master_path.name}")


def check_all(max_lines: int = DEFAULT_MAX_LINES) -> None:
    """Verifica todos os MDs do repo e divide os grandes."""
    targets = [
        MD_ROOT / "APRENDIZADO.md",
        MD_ROOT / "PSEUDO.md",
        MD_ROOT / "MAPA.md",
        MD_ROOT / "IDEIAS.md",
    ]
    for p in targets:
        if p.exists():
            split_md(p, max_lines)
        else:
            print(f"[md-splitter] não encontrado: {p}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Divide MDs grandes automaticamente")
    parser.add_argument("file", nargs="?", help="Arquivo .md a verificar")
    parser.add_argument("--max-lines", type=int, default=DEFAULT_MAX_LINES)
    parser.add_argument("--check-all", action="store_true", help="Verifica todos os MDs do repo")
    args = parser.parse_args()

    if args.check_all:
        check_all(args.max_lines)
    elif args.file:
        p = Path(args.file)
        if not p.exists():
            print(f"Arquivo não encontrado: {p}")
            sys.exit(1)
        split = split_md(p, args.max_lines)
        if not split:
            print(f"[md-splitter] {p.name} OK ({len(p.read_text().splitlines())} linhas ≤ {args.max_lines})")
    else:
        parser.print_help()
