#!/usr/bin/env python3
"""Gera A-Engrenagem-Semiotica-Parte-I.pdf a partir dos arquivos LIVRO-PI-*.md"""

import os, re, textwrap
from fpdf import FPDF

def sanitize(text):
    """Remove/substitui caracteres fora do latin-1"""
    replacements = {
        '–': '-', '—': '--', '‘': "'", '’': "'",
        '“': '"', '”': '"', '…': '...', '·': '.',
        'é': 'e', 'ã': 'a', 'õ': 'o', 'ç': 'c',
        'á': 'a', 'ê': 'e', 'ó': 'o', 'ú': 'u',
        'í': 'i', 'ô': 'o', 'â': 'a', 'ò': 'o',
        'à': 'a', 'ü': 'u', 'ö': 'o', 'ä': 'a',
        'ñ': 'n', 'É': 'E', 'Ã': 'A', 'Ç': 'C',
        'Á': 'A', 'Ê': 'E', 'Ó': 'O', 'Ú': 'U',
        'Í': 'I', 'Ô': 'O', 'Â': 'A', 'À': 'A',
        'Ü': 'U', 'Ö': 'O', 'Ä': 'A', 'Ñ': 'N',
        '«': '<<', '»': '>>', '°': 'o', '´': "'",
        '→': '->', '←': '<-', '•': '*', '▶': '>',
        '◀': '<', '✓': 'OK',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    return text.encode('latin-1', errors='replace').decode('latin-1')

SRC = "/root/Site-ST/aliancapanorama-src"
IMG_DIR = "/root/livro-arquivos/Livro/Arquivos/Geradas por IA"
OUT = f"{SRC}/A-Engrenagem-Semiotica-Parte-I.pdf"

# ── Paleta ────────────────────────────────────────────────────────────────────
C_DARK      = (13,  27,  42)   # fundo
C_TEXT      = (220, 235, 250)  # texto principal
C_TEXT_BOX  = (15,  28,  45)   # texto dentro das caixas
C_ICE       = (220, 240, 255)  # fundo box Yuri
C_CYAN      = (80,  180, 210)  # borda box Yuri
C_BIO       = (215, 250, 228)  # fundo box Gemini
C_GREEN     = (80,  180, 120)  # borda box Gemini
C_ACCENT    = (100, 180, 240)  # títulos

# ── Imagens por capítulo ──────────────────────────────────────────────────────
CHAPTER_IMGS = {
    "prologo":  "0c7c9ea7-7a1a-4005-a9e3-3a7e110d0401.jpg",
    "1-1":      "26e93d37-8103-4745-849c-538b9fd09b96.jpg",
    "1-2":      "44f6c26b-9497-4311-977b-eddcafc35409.jpg",
    "1-3":      "5226d5d1-5db0-45c8-b282-53ca14fb61da.jpg",
    "1-4":      "70f2b296-0dda-48b0-9058-57ec6b39f49f.jpg",
    "1-5":      "7bc1f98c-c974-44c0-92d4-f5604af94b11.jpg",
    "sintese":  None,
}

CHAPTER_ORDER = [
    ("prologo", f"{SRC}/LIVRO-PI-prologo.md"),
    ("1-1",     f"{SRC}/LIVRO-PI-1-1.md"),
    ("1-2",     f"{SRC}/LIVRO-PI-1-2.md"),
    ("1-3",     f"{SRC}/LIVRO-PI-1-3.md"),
    ("1-4",     f"{SRC}/LIVRO-PI-1-4.md"),
    ("1-5",     f"{SRC}/LIVRO-PI-1-5.md"),
    ("sintese", f"{SRC}/LIVRO-PI-sintese.md"),
]

# ── Parser de MD ──────────────────────────────────────────────────────────────
def parse_chapter(path):
    """Retorna lista de blocos: {'type': 'title'|'meta'|'yuri'|'gemini'|'img', 'text': str}"""
    with open(path, encoding="utf-8") as f:
        raw = f.read()

    lines = raw.split("\n")
    blocks = []
    i = 0
    while i < len(lines):
        line = lines[i]

        # Título (# Capitulo...)
        if line.startswith("# "):
            blocks.append({"type": "title", "text": line[2:].strip()})
            i += 1
            continue

        # Meta linha (> Parte I..., *Assembleias..*)
        if (line.startswith("> Parte") or
                (line.startswith("*") and not line.startswith("**")) or
                line.startswith("*A linha")):
            t = line.lstrip("> ").strip("*").strip()
            if t:
                blocks.append({"type": "meta", "text": t})
            i += 1
            continue

        # Bloco YURI (> **YURI:** ...)
        if "> **YURI:**" in line or (line.startswith("> **YURI") and "**" in line):
            collected = []
            while i < len(lines):
                l = lines[i]
                if l.startswith("> ") or (collected and l.strip().endswith("|")):
                    text = re.sub(r"\> \*\*YURI:\*\*\s*", "", l)
                    text = text.rstrip("|").strip()
                    if text:
                        collected.append(text)
                    i += 1
                elif not l.strip() and collected:
                    break
                else:
                    break
            if collected:
                blocks.append({"type": "yuri", "text": " ".join(collected)})
            continue

        # Bloco GEMINI (**GEMINI:** ...)
        if line.startswith("**GEMINI:**"):
            collected = []
            while i < len(lines):
                l = lines[i]
                if l.startswith("**GEMINI:**") or l.endswith("|") or (collected and l.strip().endswith("|")):
                    text = re.sub(r"^\*\*GEMINI:\*\*\s*", "", l)
                    text = text.rstrip("|").strip()
                    if text:
                        collected.append(text)
                    i += 1
                elif not l.strip() and collected:
                    break
                else:
                    break
            if collected:
                blocks.append({"type": "gemini", "text": " ".join(collected)})
            continue

        # Imagem (> **[IMAGEM]**)
        if "[IMAGEM]" in line:
            # captura legenda
            legenda = ""
            if i + 1 < len(lines) and "Legenda" in lines[i + 1]:
                legenda = lines[i + 1].lstrip("> ").replace("Legenda:", "").strip()
                i += 2
            else:
                i += 1
            blocks.append({"type": "img", "text": legenda})
            continue

        i += 1

    return blocks

# ── Classe PDF ────────────────────────────────────────────────────────────────
class Livro(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(auto=True, margin=20)
        self.set_margins(14, 18, 14)
        self._page_num = 0

    def header(self):
        self.set_fill_color(*C_DARK)
        self.rect(0, 0, 210, 297, "F")

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-12)
            self.set_font("Helvetica", "", 8)
            self.set_text_color(*C_TEXT)
            self.cell(0, 5, f"{self.page_no() - 1}", align="C")

    def draw_cover(self):
        self.add_page()
        self.set_fill_color(*C_DARK)
        self.rect(0, 0, 210, 297, "F")

        # Faixa superior
        self.set_fill_color(*C_ACCENT)
        self.rect(0, 80, 210, 3, "F")

        # Título
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(*C_ACCENT)
        self.set_xy(14, 90)
        self.multi_cell(182, 10, "A Engrenagem Semiótica", align="L")

        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*C_TEXT)
        self.set_xy(14, 112)
        self.multi_cell(182, 8, "da Fiacao Enterrada", align="L")

        # Parte I
        self.set_font("Helvetica", "I", 14)
        self.set_text_color(*C_GREEN)
        self.set_xy(14, 128)
        self.cell(182, 8, "Parte I . A Fiacao", align="L")

        # Faixa inferior
        self.set_fill_color(*C_CYAN)
        self.rect(0, 200, 210, 2, "F")

        # Rodapé capa
        self.set_font("Helvetica", "", 10)
        self.set_text_color(120, 140, 160)
        self.set_xy(14, 210)
        self.cell(182, 7, "Yuri Tuccieterovic . Assembleia de IAs . Sociedade Tucci . 2026", align="L")
        self.set_xy(14, 218)
        self.cell(182, 7, "Sessoes RODAR . Assembleias #519-#536", align="L")

    def chapter_title(self, text):
        text = sanitize(text)
        self.ln(4)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(*C_ACCENT)
        self.set_fill_color(*C_CYAN)
        self.rect(14, self.get_y(), 182, 0.5, "F")
        self.ln(2)
        self.set_xy(14, self.get_y())
        self.multi_cell(182, 7, text, align="L")
        self.ln(2)

    def meta_line(self, text):
        text = sanitize(text)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(140, 170, 200)
        self.set_xy(14, self.get_y())
        self.multi_cell(182, 5, text, align="L")
        self.ln(1)

    def yuri_box(self, text):
        """Caixa Yuri -- alinhada a direita"""
        text = sanitize(text)
        BOX_W = 138
        BOX_X = 58
        PAD = 4
        self.set_font("Helvetica", "", 10)
        # calcular altura necessária
        lines_needed = self.get_string_width(text) / (BOX_W - PAD*2) * 1.3 + 1
        h_est = max(int(lines_needed) * 5 + PAD*2, 12)

        if self.get_y() + h_est > 270:
            self.add_page()

        y0 = self.get_y()
        # Fundo
        self.set_fill_color(*C_ICE)
        self.set_draw_color(*C_CYAN)
        self.set_line_width(0.5)
        # Usamos multi_cell para medir, depois desenhamos
        self.set_xy(BOX_X, y0 + PAD)
        self.set_text_color(*C_TEXT_BOX)
        self.set_font("Helvetica", "", 10)
        # Medir altura real
        start_y = self.get_y()
        self.set_xy(BOX_X + PAD, y0 + PAD)
        self.multi_cell(BOX_W - PAD*2, 5, text)
        end_y = self.get_y()
        real_h = end_y - y0 + PAD

        # Desenhar retângulo em volta
        self.rect(BOX_X, y0, BOX_W, real_h, "FD")
        # Re-escrever texto sobre o fundo
        self.set_xy(BOX_X + PAD, y0 + PAD)
        self.set_text_color(*C_TEXT_BOX)
        self.multi_cell(BOX_W - PAD*2, 5, text)

        # Label YURI
        self.set_font("Helvetica", "B", 7)
        self.set_text_color(*C_CYAN)
        self.set_xy(BOX_X, y0 - 4)
        self.cell(BOX_W, 4, "> YURI", align="R")

        self.set_y(y0 + real_h + 2)
        self.ln(1)

    def gemini_box(self, text):
        """Caixa Gemini -- alinhada a esquerda"""
        text = sanitize(text)
        BOX_W = 138
        BOX_X = 14
        PAD = 4

        self.set_font("Helvetica", "", 10)
        if self.get_y() + 20 > 270:
            self.add_page()

        y0 = self.get_y()

        # Escrever texto primeiro para medir
        self.set_fill_color(*C_BIO)
        self.set_draw_color(*C_GREEN)
        self.set_line_width(0.5)
        self.set_xy(BOX_X + PAD, y0 + PAD)
        self.set_text_color(*C_TEXT_BOX)
        self.multi_cell(BOX_W - PAD*2, 5, text)
        end_y = self.get_y()
        real_h = end_y - y0 + PAD

        self.rect(BOX_X, y0, BOX_W, real_h, "FD")
        self.set_xy(BOX_X + PAD, y0 + PAD)
        self.set_text_color(*C_TEXT_BOX)
        self.multi_cell(BOX_W - PAD*2, 5, text)

        # Label GEMINI
        self.set_font("Helvetica", "B", 7)
        self.set_text_color(*C_GREEN)
        self.set_xy(BOX_X, y0 - 4)
        self.cell(BOX_W, 4, "< GEMINI", align="L")

        self.set_y(y0 + real_h + 2)
        self.ln(1)

    def insert_image(self, img_path, legenda=""):
        IMG_W = 172
        IMG_H = 96  # ~16:9
        IMG_X = 19

        if self.get_y() + IMG_H + 10 > 270:
            self.add_page()

        y0 = self.get_y() + 3
        if os.path.exists(img_path):
            try:
                self.image(img_path, x=IMG_X, y=y0, w=IMG_W)
                self.set_y(y0 + IMG_H + 2)
            except Exception:
                self.set_y(y0 + 5)
        else:
            # placeholder
            self.set_fill_color(30, 50, 70)
            self.rect(IMG_X, y0, IMG_W, IMG_H * 0.5, "F")
            self.set_y(y0 + IMG_H * 0.5 + 2)

        if legenda:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(120, 160, 190)
            self.set_xy(IMG_X, self.get_y())
            self.cell(IMG_W, 4, legenda, align="C")
            self.ln(3)
        else:
            self.ln(2)

# ── Geração ───────────────────────────────────────────────────────────────────
def build():
    pdf = Livro()
    pdf.draw_cover()

    # TOC simples
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(*C_ACCENT)
    pdf.set_xy(14, 30)
    pdf.cell(182, 8, "Indice - Parte I: A Fiacao", align="L")
    pdf.ln(4)

    toc = [
        ("Prologo", "O que e enterrar fiacao"),
        ("Cap. 1.1", "O Formulario como Confissao de Preguica"),
        ("Cap. 1.2", "O Atrito Semiotico"),
        ("Cap. 1.3", "Biomassa Traduzida"),
        ("Cap. 1.4", "Os Agentes da Engrenagem"),
        ("Cap. 1.5", "A Burocracia por Impacto"),
        ("Sintese", "A Fiacao que Desaparece"),
    ]
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(*C_TEXT)
    for label, title in toc:
        pdf.set_xy(14, pdf.get_y())
        pdf.set_text_color(*C_CYAN)
        pdf.cell(28, 7, label)
        pdf.set_text_color(*C_TEXT)
        pdf.cell(154, 7, title)
        pdf.ln()

    # Capítulos
    img_idx = 0
    for chap_key, md_path in CHAPTER_ORDER:
        pdf.add_page()
        blocks = parse_chapter(md_path)
        img_path = None
        if CHAPTER_IMGS.get(chap_key):
            img_path = os.path.join(IMG_DIR, CHAPTER_IMGS[chap_key])

        img_inserted = False
        for block in blocks:
            t = block["type"]
            txt = block["text"]

            if t == "title":
                pdf.chapter_title(txt)
            elif t == "meta":
                pdf.meta_line(txt)
            elif t == "yuri":
                pdf.yuri_box(txt)
            elif t == "gemini":
                pdf.gemini_box(txt)
                # inserir imagem após primeiro bloco Gemini se disponível
                if not img_inserted and img_path:
                    pdf.insert_image(img_path)
                    img_inserted = True
            elif t == "img":
                if not img_inserted and img_path:
                    pdf.insert_image(img_path, txt)
                    img_inserted = True

        # inserir imagem no final do capítulo se ainda não inserida
        if not img_inserted and img_path:
            pdf.insert_image(img_path)

    pdf.output(OUT)
    size = os.path.getsize(OUT)
    print(f"PDF gerado: {OUT}")
    print(f"Tamanho: {size/1024:.0f} KB | Paginas: {pdf.page}")

if __name__ == "__main__":
    build()
