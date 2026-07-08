#!/usr/bin/env python3
"""
gerar_2identificando.py — Gera PDF da conversa Gemini "2Identificando Peças de Robótica Arduino"
Fonte: /root/livro-arquivos/identificando-pecas.pdf (HTML salvo do Gemini)
"""
from html.parser import HTMLParser
from fpdf import FPDF
import re, os, textwrap

SRC_HTML = "/root/livro-arquivos/identificando-pecas.pdf"
OUT      = "/root/Site-ST/aliancapanorama-src/2-Identificando-Pecas-Arduino.pdf"
FONT_R   = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B   = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Layout
PW, PH   = 210, 297      # A4 mm
ML, MR   = 18, 18
MT, MB   = 22, 22
TW       = PW - ML - MR  # 174mm
USABLE   = PH - MT - MB  # 253mm

# ─── PARSER ─────────────────────────────────────────────────────────────────

class GeminiParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lines = []
        self.skip = False
        self.skip_tags = {'script','style','head','noscript','svg','path','g','circle','rect','polyline'}

    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.skip = True

    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.skip = False

    def handle_data(self, data):
        if self.skip:
            return
        s = data.strip()
        if len(s) > 2:
            self.lines.append(s)

def extract_conversation(html_path):
    with open(html_path, 'r', errors='replace') as f:
        html = f.read()
    p = GeminiParser()
    p.feed(html)
    lines = p.lines

    exchanges = []
    i = 0
    while i < len(lines):
        if lines[i] == 'Você disse':
            # Collect user text until next marker
            j = i + 1
            user_parts = []
            while j < len(lines) and lines[j] not in ('Você disse', 'O Gemini disse'):
                user_parts.append(lines[j])
                j += 1
            user_text = ' '.join(user_parts[:3])  # first 3 lines = prompt
            # Now collect gemini response
            if j < len(lines) and lines[j] == 'O Gemini disse':
                j += 1
                gem_parts = []
                while j < len(lines) and lines[j] not in ('Você disse', 'O Gemini disse'):
                    gem_parts.append(lines[j])
                    j += 1
                gem_text = '\n'.join(gem_parts)
                if len(user_text.strip()) > 10 and len(gem_text.strip()) > 20:
                    exchanges.append({'yuri': user_text.strip(), 'gemini': gem_text.strip()})
            i = j
        else:
            i += 1
    return exchanges

# ─── CLEAN TEXT ─────────────────────────────────────────────────────────────

def clean(t):
    t = re.sub(r'\s+', ' ', t)
    # Remove emoji-like chars that break fpdf
    t = t.encode('ascii','replace').decode('ascii')
    t = t.replace('?','').replace('*','')
    t = t.strip()
    return t

# ─── PDF CLASS ──────────────────────────────────────────────────────────────

class Livro(FPDF):
    def __init__(self):
        super().__init__('P','mm','A4')
        self.add_font('R', '', FONT_R, uni=True)
        self.add_font('B', 'B', FONT_B, uni=True)
        self.set_auto_page_break(False)
        self.set_margins(ML, MT, MR)

    def header(self):
        pass

    def footer(self):
        if self.page <= 2:
            return
        self.set_y(-12)
        self.set_font('R', '', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 5, str(self.page - 2), align='C')
        self.set_text_color(0, 0, 0)

    def y_left(self):
        return PH - MB - self.get_y()

    def add_rule(self, color=(200,200,200)):
        self.set_draw_color(*color)
        self.line(ML, self.get_y(), PW - MR, self.get_y())
        self.ln(3)

    def write_block(self, label, text, font_size=9.5, box_color=(240,245,255),
                    border_color=(100,130,200), label_color=(50,80,180)):
        """Draws a labelled box. Returns height used."""
        self.set_font('B', 'B', 8)
        lines = []
        for para in text.split('\n'):
            para = clean(para.strip())
            if not para:
                continue
            wrapped = textwrap.wrap(para, width=85)
            lines.extend(wrapped)
            if len(lines) > 120:
                break

        if not lines:
            return 0

        lh = 4.5
        label_h = 6
        pad = 3
        box_h = label_h + pad + len(lines)*lh + pad

        # Check space
        if self.y_left() < box_h + 8:
            self.add_page()
            self.set_y(MT)

        x, y = ML, self.get_y()

        # Box background
        self.set_fill_color(*box_color)
        self.set_draw_color(*border_color)
        self.rect(x, y, TW, box_h, 'FD')

        # Left border accent
        self.set_fill_color(*border_color)
        self.rect(x, y, 2.5, box_h, 'F')

        # Label
        self.set_xy(x + 4, y + 1.5)
        self.set_font('B', 'B', 8)
        self.set_text_color(*label_color)
        self.cell(TW - 8, label_h - 1.5, label, ln=0)

        # Body
        self.set_font('R', '', font_size)
        self.set_text_color(30, 30, 30)
        ty = y + label_h + pad
        for line in lines:
            self.set_xy(x + 4, ty)
            self.cell(TW - 8, lh, line, ln=0)
            ty += lh

        self.set_xy(ML, y + box_h + 3)
        return box_h + 3

# ─── CAPA ───────────────────────────────────────────────────────────────────

def draw_capa(bk):
    bk.add_page()
    bk.set_y(60)
    bk.set_font('B','B',22)
    bk.set_text_color(30,60,120)
    bk.multi_cell(TW, 10, '2 Identificando Pecas de Robotica Arduino', align='C')
    bk.ln(6)
    bk.set_font('R','',13)
    bk.set_text_color(80,80,80)
    bk.multi_cell(TW, 7, 'Conversa Gemini - Yuri Tuccieterovic', align='C')
    bk.ln(4)
    bk.set_font('R','',11)
    bk.multi_cell(TW, 6, 'Projeto MEKY - Ecossistema Tucci', align='C')
    bk.ln(6)
    bk.set_font('R','',9)
    bk.set_text_color(120,120,120)
    bk.multi_cell(TW, 5, '2026 - Sociedade Tucci', align='C')

# ─── TOC ────────────────────────────────────────────────────────────────────

SECTION_KEYWORDS = [
    ('Leucocito Digital', ['leucocito','leucocyte','mc ','marta centaurus']),
    ('Identificando Pecas', ['peca','identificando','anel de led','modulo','servo','arduino','exapode','hexapode']),
    ('Projeto Ben Johnson', ['ben johnson','velocidade','aranha','gaited','sprint']),
    ('Seguranca e Red Teaming', ['red teaming','seguranca','firewall','injecao','vulnerabilidade']),
    ('LED e Hardware', ['led','ws2812','smd','tensao','protoboard','solda']),
    ('Taxonomia de IAs', ['ia de nodulo','ia vadia','vagante','taxonomia','classificacao de ia']),
    ('Sistemas e Arquitetura', ['sistema','workflow','arquitetura','ecossistema','pack']),
]

def detect_section(text):
    tl = text.lower()
    for name, kws in SECTION_KEYWORDS:
        for kw in kws:
            if kw in tl:
                return name
    return 'Geral'

def draw_toc(bk, sections):
    bk.add_page()
    bk.set_y(MT)
    bk.set_font('B','B',16)
    bk.set_text_color(30,60,120)
    bk.cell(TW, 10, 'Indice', ln=True, align='C')
    bk.ln(4)
    seen = {}
    for sec, pg in sections:
        if sec not in seen:
            seen[sec] = pg
    bk.set_font('R','',10)
    bk.set_text_color(50,50,50)
    for sec, pg in seen.items():
        bk.cell(TW - 20, 7, sec)
        bk.cell(20, 7, str(pg), align='R', ln=True)

# ─── MAIN ───────────────────────────────────────────────────────────────────

def main():
    print("Extraindo conversa do HTML...")
    exchanges = extract_conversation(SRC_HTML)
    print(f"  {len(exchanges)} trocas extraidas")

    # Group by section
    grouped = {}
    order = []
    for ex in exchanges:
        sec = detect_section(ex['yuri'] + ' ' + ex['gemini'][:200])
        if sec not in grouped:
            grouped[sec] = []
            order.append(sec)
        grouped[sec].append(ex)

    print(f"  {len(grouped)} secoes detectadas")

    # ── PASS 1: collect section page numbers
    bk1 = Livro()
    draw_capa(bk1)
    bk1.add_page()  # TOC placeholder
    section_pages = []
    for sec in order:
        section_pages.append((sec, bk1.page - 1))
        bk1.set_y(MT)
        bk1.set_font('B','B',14)
        bk1.cell(TW, 8, clean(sec), ln=True)
        bk1.ln(3)
        count = 0
        for ex in grouped[sec]:
            yuri_text = clean(ex['yuri'])
            gem_text  = clean(ex['gemini'][:600])
            if len(yuri_text) < 8:
                continue
            bk1.write_block('YURI', yuri_text,
                             box_color=(245,255,245), border_color=(80,150,80), label_color=(40,110,40))
            bk1.write_block('GEMINI', gem_text,
                             box_color=(240,245,255), border_color=(80,100,200), label_color=(40,60,180))
            count += 1
            if count >= 30:  # limit per section for readability
                break

    # ── PASS 2: real PDF
    print("Gerando PDF...")
    bk = Livro()
    draw_capa(bk)
    draw_toc(bk, section_pages)

    for sec in order:
        bk.add_page()
        bk.set_y(MT)
        bk.set_font('B','B',14)
        bk.set_text_color(30,60,120)
        bk.cell(TW, 8, clean(sec), ln=True)
        bk.set_text_color(0,0,0)
        bk.ln(3)
        bk.add_rule()
        count = 0
        for ex in grouped[sec]:
            yuri_text = clean(ex['yuri'])
            gem_text  = clean(ex['gemini'][:600])
            if len(yuri_text) < 8:
                continue
            bk.write_block('▶ YURI', yuri_text,
                             box_color=(245,255,245), border_color=(80,150,80), label_color=(40,110,40))
            bk.write_block('◀ GEMINI', gem_text,
                             box_color=(240,245,255), border_color=(80,100,200), label_color=(40,60,180))
            count += 1
            if count >= 30:
                break

    bk.output(OUT)
    size = os.path.getsize(OUT)
    print(f"PDF gerado: {OUT}")
    print(f"Tamanho: {size//1024} KB, {bk.page} paginas")

if __name__ == '__main__':
    main()
