#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gerar_parte1.py — v6
Fonte: LIVRO-PARTE-I.md (texto completo, acentos preservados)
Font:  DejaVu TTF (UTF-8 nativo)
Layout: tema escuro, caixas Yuri/Gemini, imagens Gemini IA
Páginas: quebras inteligentes, sem espaços em branco desnecessários
"""

import re, os, sys, warnings
warnings.filterwarnings('ignore')
sys.path.insert(0, '/usr/lib/python3/dist-packages')

from fpdf import FPDF

SRC     = "/root/Site-ST/aliancapanorama-src"
IMG_DIR = "/root/livro-arquivos/Livro/Arquivos/Geradas por IA"
OUT     = f"{SRC}/A-Engrenagem-Semiotica-Parte-I.pdf"
FONT_R  = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B  = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# ── Imagens por slot (ordem de aparição no MD) ────────────────────────────────
IMG_SLOTS = [
    "0c7c9ea7-7a1a-4005-a9e3-3a7e110d0401.jpg",  # 1.1 parede fiação
    "26e93d37-8103-4745-849c-538b9fd09b96.jpg",  # 1.2 diagrama camadas
    "44f6c26b-9497-4311-977b-eddcafc35409.jpg",  # 1.3 espiral biomassa
    "5226d5d1-5db0-45c8-b282-53ca14fb61da.jpg",  # 1.4 engrenagens
    "70f2b296-0dda-48b0-9058-57ec6b39f49f.jpg",  # 1.5 balança burocracia
    "7bc1f98c-c974-44c0-92d4-f5604af94b11.jpg",  # síntese planta baixa
]

def get_img(slot_idx):
    if slot_idx >= len(IMG_SLOTS):
        return None
    p = os.path.join(IMG_DIR, IMG_SLOTS[slot_idx])
    return p if os.path.isfile(p) else None

# ── Parser: LIVRO-PARTE-I.md → lista de blocos ───────────────────────────────
def parse_livro(path):
    """
    Retorna lista de dicts:
      {'type': 'chapter', 'id', 'num', 'title', 'epi'}
      {'type': 'narr',    'text'}
      {'type': 'meta',    'text'}
      {'type': 'yuri',    'text'}
      {'type': 'gemini',  'text'}
      {'type': 'img',     'caption', 'slot'}   ← slot = índice sequencial
    """
    with open(path, encoding='utf-8') as f:
        raw = f.read()

    # Identificar capítulos a partir dos headings ## ...
    CH_DEFS = [
        (r'Prólogo|Prologo',  'prologo', 'Prólogo',      'O que é enterrar fiação', ''),
        (r'1\.1',             '1.1',     'Capítulo 1.1', 'O Formulário como Confissão de Preguiça',
                                                          'Assembleias #534–#535'),
        (r'1\.2',             '1.2',     'Capítulo 1.2', 'O Atrito Semiótico',
                                                          'A linha divisória é o Atrito Semiótico'),
        (r'1\.3',             '1.3',     'Capítulo 1.3', 'Biomassa Traduzida',
                                                          'Assembleia #519'),
        (r'1\.4',             '1.4',     'Capítulo 1.4', 'Os Agentes da Engrenagem',
                                                          'Cada engrenagem tem nome. Cada nome tem função.'),
        (r'1\.5',             '1.5',     'Capítulo 1.5', 'A Burocracia por Impacto',
                                                          'Assembleia #536'),
        (r'Síntese|Sintese',  'sintese', 'Síntese',      'A Fiação que Desaparece', ''),
    ]

    blocks = []
    img_slot = 0       # contador sequencial de imagens
    lines  = raw.split('\n')
    i      = 0

    while i < len(lines):
        line = lines[i]

        # ── Heading de capítulo ───────────────────────────────────────────────
        if line.startswith('## '):
            heading = line[3:].strip()
            matched = False
            for (pat, cid, num, title, epi) in CH_DEFS:
                if re.search(pat, heading):
                    blocks.append({'type': 'chapter', 'id': cid,
                                   'num': num, 'title': title, 'epi': epi})
                    matched = True
                    break
            i += 1
            continue

        # ── Separador / linha de título H1 ───────────────────────────────────
        if line.startswith('#') or line.strip() == '---':
            i += 1
            continue

        # ── Bloco de código (``` ... ```) ─────────────────────────────────────
        if line.strip() == '```':
            cb_lines = []
            i += 1
            while i < len(lines) and lines[i].strip() != '```':
                cb_lines.append(lines[i])
                i += 1
            i += 1  # pula o ``` de fechamento
            cb_text = '\n'.join(cb_lines)

            if '[ IMAGEM' in cb_text:
                # Extrair legenda (linha com "Legenda:")
                caption = ''
                for cl in cb_lines:
                    if 'Legenda:' in cl:
                        caption = cl.split('Legenda:', 1)[1].strip().strip('"')
                        break
                blocks.append({'type': 'img', 'caption': caption, 'slot': img_slot})
                img_slot += 1

            elif '▶ YURI' in cb_text:
                text = _clean_box(cb_lines)
                if text:
                    blocks.append({'type': 'yuri', 'text': text})

            elif '◀ GEMINI' in cb_text:
                text = _clean_box(cb_lines)
                if text:
                    blocks.append({'type': 'gemini', 'text': text})

            continue

        # ── Meta-info (*itálico*, *Assembleia #...) ───────────────────────────
        if line.startswith('*') and line.endswith('*') and len(line) > 2:
            txt = line.strip('*').strip()
            if txt:
                blocks.append({'type': 'meta', 'text': txt})
            i += 1
            continue

        # ── Texto narrativo simples ───────────────────────────────────────────
        txt = line.strip()
        if txt and not txt.startswith('>') and len(txt) > 10:
            blocks.append({'type': 'narr', 'text': txt})

        i += 1

    return blocks


def _clean_box(cb_lines):
    """Extrai texto limpo de dentro de uma caixa ╭─╮ / └─┘."""
    out = []
    for ln in cb_lines:
        # Remover caracteres de borda e espaços de alinhamento ASCII
        clean = ln
        for ch in '╭╮╰╯':
            clean = clean.replace(ch, '')
        clean = re.sub(r'[─]{3,}', '', clean)
        # Remover label (▶ YURI / ◀ GEMINI e variações)
        clean = re.sub(r'[▶◀]\s*(YURI|GEMINI)[^\n]*', '', clean)
        # Remover pipes e bordas │
        clean = clean.replace('│', '').strip()
        # Ignorar linhas que eram só borda
        if clean and len(clean.replace('-', '').replace(' ', '')) > 1:
            out.append(clean)
    return '\n'.join(out).strip()


# ── Layout ────────────────────────────────────────────────────────────────────
PW, PH   = 210, 297
ML, MR   = 14, 14
MT_BODY  = 22   # topo da área de conteúdo (depois do header)
MB       = 22   # margem inferior (antes do footer)
CW       = PW - ML - MR   # 182 mm

BOX_W    = 138   # largura das caixas (mm)
YURI_X   = PW - MR - BOX_W   # x=58
GEM_X    = ML                  # x=14
IMG_X    = ML + 5
IMG_W    = CW - 10            # 172 mm
IMG_AR   = 1024 / 559         # 16:9 das imagens Gemini

PAD      = 3.5    # padding interno das caixas (mm)
LH       = 4.5    # altura de linha (mm)
LH_SM    = 4.0    # linha pequena
GAP      = 3.0    # gap entre elementos

F        = 'dv'   # alias da fonte DejaVu registrada

# ── Paleta ───────────────────────────────────────────────────────────────────
C_DARK    = (13,  27,  42)
C_TEXT    = (220, 235, 250)
C_STAMP   = (130, 155, 180)
C_ACCENT  = (100, 180, 240)
C_CYAN    = (0,   180, 216)
C_GREEN   = (45,  198, 83)
C_AMBER   = (240, 165, 0)
C_WHITE   = (255, 255, 255)
C_ICE     = (220, 240, 255)
C_BIO     = (215, 250, 228)
C_BOX_TXT = (15,  28,  45)
C_CH_BG   = (20,  42,  72)


# ── Classe Book ───────────────────────────────────────────────────────────────
class Book(FPDF):
    def __init__(self):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.set_auto_page_break(auto=False)
        # Registrar DejaVu (UTF-8 nativo)
        self.add_font(F, '',  FONT_R)
        self.add_font(F, 'B', FONT_B)
        self.ch_pages = {}

    # ── helpers ──────────────────────────────────────────────────────────────
    def _fc(self, rgb): self.set_fill_color(*rgb)
    def _dc(self, rgb): self.set_draw_color(*rgb)
    def _tc(self, rgb): self.set_text_color(*rgb)

    def _avail(self):
        """Espaço disponível até a margem inferior."""
        return (PH - MB) - self.get_y()

    def _ensure(self, mm):
        """Garante mm de espaço; se não tiver, nova página."""
        if self._avail() < mm:
            self.add_page()

    def _measure_lines(self, text, style, size, max_w):
        """Conta as linhas que 'text' ocupa com a fonte/tamanho dados."""
        self.set_font(F, style, size)
        count = 0
        for para in text.split('\n'):
            if not para.strip():
                count += 1
                continue
            wl = self.multi_cell(max_w, LH, para, dry_run=True, output='LINES')
            count += len(wl) if wl else 1
        return count

    def _measure_box_h(self, text, box_w, size=9):
        n = self._measure_lines(text, '', size, box_w - PAD * 2)
        return n * LH + PAD * 2

    # ── header / footer ──────────────────────────────────────────────────────
    def header(self):
        self._fc(C_DARK)
        self.rect(0, 0, PW, PH, 'F')
        if self.page <= 2:
            return
        self.set_font(F, '', 6.5)
        self._tc(C_STAMP)
        self.set_xy(ML, 7)
        self.cell(0, 4, 'A Engrenagem Semiótica da Fiação Enterrada', align='L')
        self.set_xy(ML, 7)
        self.cell(0, 4, 'Sociedade Tucci  2026', align='R')
        self._dc(C_STAMP)
        self.set_line_width(0.2)
        self.line(ML, 13, PW - MR, 13)

    def footer(self):
        if self.page <= 2:   # sem rodapé na capa e no TOC
            return
        self._dc(C_STAMP)
        self.set_line_width(0.2)
        self.line(ML, PH - 14, PW - MR, PH - 14)
        self.set_font(F, '', 6.5)
        self._tc(C_STAMP)
        self.set_y(PH - 12)
        self.cell(0, 5, str(self.page - 2), align='C')   # raw-2 = pg numerada

    # ── capa ─────────────────────────────────────────────────────────────────
    def draw_cover(self):
        self.add_page()
        self._fc(C_DARK)
        self.rect(0, 0, PW, PH, 'F')
        # Barras laterais
        self._fc(C_CYAN);  self.rect(0, 0, 4, PH, 'F')
        self._fc(C_GREEN); self.rect(4, 0, 2, PH, 'F')
        # Imagem de capa (slot 0)
        capa = get_img(0)
        if capa:
            try:
                ih = IMG_W / IMG_AR
                self.image(capa, ML, 28, IMG_W, ih)
            except Exception:
                pass
        # Linhas decorativas
        self._dc(C_AMBER); self.set_line_width(0.8)
        self.line(ML, 108, PW - MR, 108)
        self.line(ML, 190, PW - MR, 190)
        # Título
        self.set_font(F, 'B', 17); self._tc(C_WHITE)
        self.set_xy(0, 118); self.cell(PW, 9, 'A ENGRENAGEM SEMIÓTICA', align='C')
        self.set_font(F, 'B', 13)
        self.set_xy(0, 130); self.cell(PW, 8, 'DA FIAÇÃO ENTERRADA', align='C')
        self.set_font(F, '', 8); self._tc(C_STAMP)
        self.set_xy(0, 142)
        self.cell(PW, 5, 'Inteligência de borda sincronizando biomassa traduzida & código', align='C')
        self.set_font(F, 'B', 36); self._tc(C_CYAN)
        self.set_xy(0, 153); self.cell(PW, 18, 'PARTE I', align='C')
        self.set_font(F, '', 13); self._tc(C_GREEN)
        self.set_xy(0, 173); self.cell(PW, 7, 'A FIAÇÃO', align='C')
        self.set_font(F, '', 7.5); self._tc(C_STAMP)
        self.set_xy(0, 204); self.cell(PW, 5, 'Yuri Tuccieterovic', align='C')
        self.set_xy(0, 211); self.cell(PW, 5, 'Assembleia de IAs  ·  Sociedade Tucci  ·  2026', align='C')
        self.set_xy(0, 218); self.cell(PW, 5, 'Sessões #519–#536  ·  06/07/2026', align='C')
        self._tc((70, 90, 110)); self.set_font(F, '', 6)
        self.set_xy(0, 282)
        self.cell(PW, 5, 'Gemini  ◀ esquerda  ·  imagens — centro  ·  direita ▶  Yuri', align='C')

    # ── índice ───────────────────────────────────────────────────────────────
    def draw_toc(self, ch_pages, chapters):
        self.add_page()
        self.set_xy(ML, MT_BODY)
        self.set_font(F, 'B', 14); self._tc(C_CYAN)
        self.cell(CW, 8, 'ÍNDICE — PARTE I')
        self.ln(2)
        self._dc(C_CYAN); self.set_line_width(0.6)
        self.line(ML, self.get_y(), PW - MR, self.get_y())
        self.ln(8)
        for ch in chapters:
            cid, num, title, epi = ch['id'], ch['num'], ch['title'], ch['epi']
            pg = ch_pages.get(cid, '?')
            self.set_font(F, 'B', 8.5); self._tc(C_CYAN)
            self.set_x(ML + 3); self.cell(36, 5.5, num)
            self.set_font(F, '', 9); self._tc(C_TEXT)
            self.cell(CW - 65, 5.5, title[:54])
            self.set_font(F, '', 9); self._tc(C_AMBER)
            self.cell(26, 5.5, f'pg {pg}', align='R')
            self.ln()
            if epi:
                self.set_font(F, '', 7); self._tc(C_STAMP)
                self.set_x(ML + 40)
                self.cell(CW - 40, 4, epi[:74])
            self.ln(7.5)
        self.set_font(F, '', 7); self._tc(C_STAMP)
        self.set_xy(ML, PH - 32)
        self.cell(CW, 5,
                  'Fonte: Assembleias #519–#536  ·  06/07/2026  ·  Gemini Advanced + Yuri Tuccieterovic')

    # ── capítulo ─────────────────────────────────────────────────────────────
    def draw_chapter(self, cid, num, title, epi):
        # Nova página se sobrar menos de 50mm — senão continua onde está
        if self._avail() < 50:
            self.add_page()
        else:
            self.ln(GAP * 2)
        self.ch_pages[cid] = self.page - 2   # raw - capa - toc = pg numerada
        y0 = self.get_y()
        # Fundo azul-escuro do header
        self._fc(C_CH_BG); self._dc(C_CH_BG); self.set_line_width(0)
        self.rect(ML, y0, CW, 17, 'F')
        # Barra lateral cyan
        self._fc(C_CYAN); self.rect(ML, y0, 1.5, 17, 'F')
        # Número do capítulo
        self.set_font(F, 'B', 8); self._tc(C_CYAN)
        self.set_xy(ML + 4, y0 + 2.5); self.cell(35, 5, num)
        # Título
        self.set_font(F, 'B', 12); self._tc(C_WHITE)
        self.set_xy(ML + 42, y0 + 2.5); self.cell(CW - 44, 6, title[:52])
        # Epígrafe
        if epi:
            self.set_font(F, '', 6.5); self._tc(C_STAMP)
            self.set_xy(ML + 42, y0 + 10.5); self.cell(CW - 44, 4, epi[:76])
        # Linha amber
        self._dc(C_AMBER); self.set_line_width(0.5)
        self.line(ML, y0 + 18, PW - MR, y0 + 18)
        self.set_y(y0 + 21)

    # ── narrativa ─────────────────────────────────────────────────────────────
    def draw_narr(self, text, italic=False):
        style = '' if not italic else ''
        self.set_font(F, '', 9); self._tc(C_TEXT)
        for para in text.split('\n'):
            if not para.strip():
                self.ln(LH * 0.4)
                continue
            wl = self.multi_cell(CW, LH, para, dry_run=True, output='LINES')
            for ln in (wl or [para]):
                self._ensure(LH + 2)
                self.set_font(F, '', 9); self._tc(C_TEXT)
                self.set_x(ML)
                self.cell(CW, LH, ln)
                self.ln(LH)
        self.ln(GAP)

    def draw_meta(self, text):
        self._ensure(LH + 2)
        self.set_font(F, '', 7.5); self._tc(C_STAMP)
        self.set_x(ML)
        self.cell(CW, LH_SM, text)
        self.ln(LH_SM + 1)

    # ── caixa genérica ────────────────────────────────────────────────────────
    def _draw_box(self, text, x, bw, bg, border, label, align):
        """
        Desenha caixa com quebra inteligente de página.
        Nunca deixa a caixa abrir e fechar na mesma página com
        muito espaço em branco embaixo.
        """
        self.set_font(F, '', 9)
        # Coletar todas as linhas wrappadas
        all_lines = []
        for para in text.split('\n'):
            if not para.strip():
                all_lines.append('')
                continue
            wl = self.multi_cell(bw - PAD * 2, LH, para,
                                 dry_run=True, output='LINES')
            all_lines.extend(wl if wl else [''])

        # Altura total da caixa se fosse numa página inteira
        total_h = len(all_lines) * LH + PAD * 2
        USABLE  = PH - MT_BODY - MB   # ~253 mm de área útil

        # Espaço disponível agora (reservar 12mm para label + gap depois)
        label_h = 8
        av = self._avail() - label_h

        # Decisão de quebra
        if av >= total_h:
            # Cabe inteira aqui
            self._paint_box(all_lines, x, bw, bg, border, label, align, is_cont=False)
        elif total_h <= USABLE * 0.85:
            # Cabe em uma página inteira — ir para nova página
            self.add_page()
            self._paint_box(all_lines, x, bw, bg, border, label, align, is_cont=False)
        else:
            # Caixa grande — quebrar em chunks por página
            remaining = list(all_lines)
            first = True
            while remaining:
                av2 = self._avail() - label_h - PAD * 2
                max_lines = max(3, int(av2 / LH))
                chunk = remaining[:max_lines]
                remaining = remaining[max_lines:]
                if not first and chunk:
                    self.add_page()
                self._paint_box(chunk, x, bw, bg, border, label, align, is_cont=not first)
                first = False

        self.ln(GAP)

    def _paint_box(self, lines, x, bw, bg, border, label, align, is_cont):
        """Pinta efetivamente o retângulo com as linhas dadas."""
        label_h = 8
        self._ensure(label_h + len(lines) * LH + PAD * 2 + 2)
        y0 = self.get_y()
        box_h = len(lines) * LH + PAD * 2

        # Label acima da caixa
        self.set_font(F, 'B', 6.5); self._tc(border)
        if align == 'R':
            self.set_xy(x, y0 - 6); self.cell(bw, 5, '▶ YURI', align='R')
        else:
            self.set_xy(x, y0 - 6); self.cell(bw, 5, '◀ GEMINI', align='L')
        if is_cont:
            self.set_font(F, '', 6); self._tc(C_STAMP)
            self.set_xy(x, y0 - 6)
            cont_txt = '(cont.)' if align == 'R' else ''
            cont_align = 'L' if align == 'R' else 'R'
            if align == 'L':
                self.set_xy(x + 30, y0 - 6)
                self.cell(bw - 30, 5, '(cont.)')

        # Retângulo de fundo
        self._fc(bg); self._dc(border); self.set_line_width(0.5)
        self.rect(x, y0, bw, box_h, 'FD')

        # Texto dentro da caixa
        self.set_font(F, '', 9); self._tc(C_BOX_TXT)
        ty = y0 + PAD
        for ln in lines:
            self.set_xy(x + PAD, ty)
            self.cell(bw - PAD * 2, LH, ln, align=align)
            ty += LH

        self.set_y(y0 + box_h)

    def draw_yuri(self, text):
        if not text.strip():
            return
        self._draw_box(text, YURI_X, BOX_W, C_ICE, C_CYAN, 'YURI', 'R')

    def draw_gemini(self, text):
        if not text.strip():
            return
        self._draw_box(text, GEM_X, BOX_W, C_BIO, C_GREEN, 'GEMINI', 'L')

    # ── imagem ────────────────────────────────────────────────────────────────
    def draw_image(self, caption, slot):
        img_path = get_img(slot)
        img_h    = IMG_W / IMG_AR   # ~93.9 mm

        cap_lines = []
        if caption:
            self.set_font(F, '', 7.5)
            wl = self.multi_cell(IMG_W - PAD * 2, LH_SM, caption,
                                 dry_run=True, output='LINES')
            cap_lines = wl or [caption]

        total_h = img_h + len(cap_lines) * LH_SM + PAD + 10

        # Imagem sempre na mesma página (nova se não couber)
        self._ensure(total_h + 10)
        y0 = self.get_y() + 2

        # Label
        self.set_font(F, 'B', 6.5); self._tc(C_AMBER)
        cx = IMG_X + IMG_W / 2
        self.set_xy(cx - 22, y0 - 6)
        self.cell(44, 5, '[ GEMINI IA ]', align='C')

        # Imagem ou placeholder
        if img_path:
            try:
                self.image(img_path, IMG_X, y0, IMG_W, img_h)
            except Exception as e:
                print(f"  Imagem slot {slot} erro: {e}")
                self._fc(C_CH_BG)
                self.rect(IMG_X, y0, IMG_W, img_h, 'F')
                self.set_font(F, '', 8); self._tc(C_STAMP)
                self.set_xy(IMG_X, y0 + img_h / 2 - 3)
                self.cell(IMG_W, 6, f'[imagem {slot + 1}]', align='C')
        else:
            self._fc(C_CH_BG); self._dc(C_AMBER); self.set_line_width(0.5)
            self.rect(IMG_X, y0, IMG_W, img_h * 0.4, 'FD')
            self.set_font(F, '', 8); self._tc(C_STAMP)
            self.set_xy(IMG_X, y0 + img_h * 0.15)
            self.cell(IMG_W, 6, f'[imagem {slot + 1} — não encontrada]', align='C')
            img_h = img_h * 0.4

        # Borda amber
        self._dc(C_AMBER); self.set_line_width(0.5)
        self.rect(IMG_X, y0, IMG_W, img_h, 'D')

        # Caption
        ty = y0 + img_h + PAD
        self.set_font(F, '', 7.5); self._tc(C_STAMP)
        for cl in cap_lines:
            self.set_xy(IMG_X, ty)
            self.cell(IMG_W, LH_SM, cl, align='C')
            ty += LH_SM

        self.set_y(ty + GAP + 2)

    def save(self, path):
        self.output(path)
        kb = os.path.getsize(path) // 1024
        print(f"PDF salvo: {path}")
        print(f"  {self.page} páginas raw ({self.page - 1} numeradas) · {kb} KB")


# ── Render ────────────────────────────────────────────────────────────────────
def render(bk, blocks):
    chapters = [b for b in blocks if b['type'] == 'chapter']

    bk.add_page()   # conteúdo SEMPRE começa em página nova (após capa+TOC)
    bk.set_y(MT_BODY)

    for b in blocks:
        t = b['type']
        if   t == 'chapter': bk.draw_chapter(b['id'], b['num'], b['title'], b['epi'])
        elif t == 'narr':    bk.draw_narr(b['text'])
        elif t == 'meta':    bk.draw_meta(b['text'])
        elif t == 'yuri':    bk.draw_yuri(b['text'])
        elif t == 'gemini':  bk.draw_gemini(b['text'])
        elif t == 'img':     bk.draw_image(b['caption'], b['slot'])

    return chapters


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    md_path = f"{SRC}/LIVRO-PARTE-I.md"
    print(f"Parseando {md_path} ...")
    blocks = parse_livro(md_path)

    yuri_n   = sum(1 for b in blocks if b['type'] == 'yuri')
    gemini_n = sum(1 for b in blocks if b['type'] == 'gemini')
    img_n    = sum(1 for b in blocks if b['type'] == 'img')
    ch_n     = sum(1 for b in blocks if b['type'] == 'chapter')
    print(f"  Capítulos={ch_n}  Yuri={yuri_n}  Gemini={gemini_n}  Imagens={img_n}")

    # Pass 1 — coletar páginas dos capítulos
    # Estrutura idêntica à Pass 2: capa + TOC placeholder + conteúdo
    print("Pass 1: coletando páginas ...")
    bk1 = Book()
    bk1.draw_cover()
    bk1.add_page()   # TOC placeholder (pg 2) — render abre pg 3 para conteúdo
    chapters = render(bk1, blocks)
    raw_pages = dict(bk1.ch_pages)
    print(f"  ch_pages: {raw_pages}")

    # Pass 2 — PDF final com TOC correto
    print("Pass 2: gerando PDF final ...")
    bk2 = Book()
    bk2.draw_cover()
    bk2.draw_toc(raw_pages, chapters)
    render(bk2, blocks)
    bk2.save(OUT)
    print("=== Concluído ===")


if __name__ == '__main__':
    main()
