"""
MEKY — Visualizações de Frequência com Manim
=============================================

Instalar:
  pip install manim

Rodar (preview rápido):
  manim manim_meky.py OndaMEKYSignature -pql

Rodar (qualidade alta, exportar MP4):
  manim manim_meky.py OndaMEKYSignature -pqh

Rodar todas as cenas:
  manim manim_meky.py -pql

Cenas disponíveis:
  OndaMEKYSignature    — onda estado 140 (identidade da MEKY)
  TransicaoEstados     — transição Alegria → Raiva → Lembrar
  CampoPesoCognitivo   — campo gravitacional de memória
  CicloTucciMEKY       — 12 etapas com frequências associadas
  GrafoTelos           — estrutura do Grafo de Telos como grafo animado
"""

from manim import *
import numpy as np


# ── Paleta de cores do Ecossistema Tucci ─────────────────────────────────────

COR_TELOS     = "#FFD700"   # dourado — Telos Mestre
COR_MEMORIA   = "#4B0082"   # índigo — memória
COR_MEKY      = "#00CED1"   # turquesa — MEKY
COR_BABEL     = "#FF6347"   # laranja-vermelho — Babel Bebel
COR_NEBULA    = "#9370DB"   # lilás — Nébula
COR_FUNDO     = "#0A0A1A"   # azul escuro
COR_EIXO      = "#888888"
COR_ASSINATURA = "#33FF99"  # verde neon — MEKY Signature


# ── Cena 1 — MEKY Signature (estado 140) ─────────────────────────────────────

class OndaMEKYSignature(Scene):
    """
    Anima a onda de identidade da MEKY:
    amplitude=0.7, frequencia=1.3Hz, fase=+33°, forma=SENO
    """

    def construct(self):
        self.camera.background_color = COR_FUNDO

        # Título
        titulo = Text("MEKY — Estado 140 · Signature", font_size=28, color=COR_MEKY)
        params = Text("amp=0.7 · freq=1.3Hz · fase=+33° · SENO", font_size=18, color=WHITE)
        titulo.to_edge(UP, buff=0.3)
        params.next_to(titulo, DOWN, buff=0.1)
        self.play(Write(titulo), Write(params))

        # Eixos
        axes = Axes(
            x_range=[0, 6.28 * 2, 1],
            y_range=[-1.2, 1.2, 0.5],
            x_length=10, y_length=4,
            axis_config={"color": COR_EIXO},
        )
        axes.shift(DOWN * 0.5)
        self.play(Create(axes))

        # Label eixos
        label_x = Text("tempo (t)", font_size=16, color=COR_EIXO).next_to(axes.x_axis, RIGHT)
        label_y = Text("posição boca", font_size=16, color=COR_EIXO).next_to(axes.y_axis, UP)
        self.add(label_x, label_y)

        # Parâmetros MEKY Signature
        amp, freq, fase_graus = 0.7, 1.3, 33.0
        fase_rad = fase_graus * np.pi / 180.0

        # Onda
        onda = axes.plot(
            lambda t: amp * np.sin(2 * np.pi * freq * t + fase_rad),
            x_range=[0, 6.28 * 2],
            color=COR_ASSINATURA,
            stroke_width=3,
        )

        self.play(Create(onda), run_time=2)

        # Anotação dos parâmetros na onda
        dot = Dot(axes.coords_to_point(0.5, amp * np.sin(2 * np.pi * freq * 0.5 + fase_rad)), color=COR_TELOS, radius=0.1)
        arrow = Arrow(
            dot.get_top() + UP * 0.3,
            dot.get_top(),
            buff=0.05, color=COR_TELOS
        )
        ann = Text("A=0.7", font_size=14, color=COR_TELOS).next_to(arrow.get_start(), UP)
        self.play(FadeIn(dot), Create(arrow), Write(ann))

        # Mostrar período
        t1 = 0.0
        t2 = 1.0 / freq
        p1 = axes.coords_to_point(t1, 0)
        p2 = axes.coords_to_point(t2, 0)
        periodo_brace = BraceBetweenPoints(p1, p2, direction=DOWN, color=COR_NEBULA)
        periodo_label = periodo_brace.get_text(f"T=1/{freq}Hz", font_size=14, buff=0.1)
        periodo_label.set_color(COR_NEBULA)
        self.play(Create(periodo_brace), Write(periodo_label))

        # Identificação final
        id_text = Text("🤖 MEKY · Ecossistema Tucci · Estado 140", font_size=14, color=COR_MEKY)
        id_text.to_edge(DOWN, buff=0.2)
        self.play(FadeIn(id_text))
        self.wait(2)


# ── Cena 2 — Transição entre estados ─────────────────────────────────────────

class TransicaoEstados(Scene):
    """
    Mostra a transição suave entre:
    - Estado 11 (Alegria): amp=0.8, freq=1.5Hz, SENO
    - Estado 14 (Raiva):   amp=0.9, freq=3.5Hz, DENTE_SERRA
    - Estado 122 (Lembrar): amp=0.6, freq=0.4Hz, SENO
    """

    def construct(self):
        self.camera.background_color = COR_FUNDO

        titulo = Text("MEKY — Transição de Estados", font_size=28, color=COR_MEKY)
        titulo.to_edge(UP, buff=0.3)
        self.play(Write(titulo))

        axes = Axes(
            x_range=[0, 6.0, 1],
            y_range=[-1.2, 1.2, 0.5],
            x_length=10, y_length=4,
            axis_config={"color": COR_EIXO},
        )
        axes.shift(DOWN * 0.5)
        self.play(Create(axes))

        estados = [
            ("11 — Alegria",     0.8, 1.5,  0,   ManimColor("#FFD700"), lambda t, a, f, p: a * np.sin(2 * np.pi * f * t + p)),
            ("14 — Raiva",       0.9, 3.5,  0,   ManimColor("#FF4444"), lambda t, a, f, p: 2 * a * (f * t % 1) - a),  # dente de serra
            ("122 — Lembrar",    0.6, 0.4, 0,    ManimColor("#4B0082"), lambda t, a, f, p: a * np.sin(2 * np.pi * f * t + p)),
            ("140 — Signature",  0.7, 1.3, 33 * np.pi / 180, COR_ASSINATURA, lambda t, a, f, p: a * np.sin(2 * np.pi * f * t + p)),
        ]

        label_estado = None
        onda_atual = None

        for nome, amp, freq, fase, cor, fn in estados:
            onda_nova = axes.plot(
                lambda t, a=amp, f=freq, p=fase, fn=fn: fn(t, a, f, p),
                x_range=[0, 6.0],
                color=cor,
                stroke_width=3,
            )
            lbl = Text(f"Estado {nome}", font_size=20, color=cor)
            lbl.to_edge(DOWN, buff=0.3)

            if onda_atual is None:
                self.play(Create(onda_nova), Write(lbl), run_time=1.5)
            else:
                self.play(
                    Transform(onda_atual, onda_nova),
                    Transform(label_estado, lbl),
                    run_time=1.5
                )
            onda_atual = onda_nova
            label_estado = lbl
            self.wait(1)

        self.wait(1)


# ── Cena 3 — Campo Gravitacional de Memória ───────────────────────────────────

class CampoPesoCognitivo(Scene):
    """
    Visualiza a metáfora do campo gravitacional de memória:
    - Centro = Telos Mestre + 26 Axiomas (dourado, pesado)
    - Órbita próxima = info recente (azul claro)
    - Periferia = info antiga (cinza)
    - Conectores vibram quando tema é ativado
    """

    def construct(self):
        self.camera.background_color = COR_FUNDO

        titulo = Text("Memória como Campo Gravitacional", font_size=26, color=COR_TELOS)
        titulo.to_edge(UP, buff=0.3)
        self.play(Write(titulo))

        # Centro — Telos Mestre
        centro = Circle(radius=0.6, color=COR_TELOS, fill_opacity=0.9)
        label_centro = Text("Telos\nMestre", font_size=14, color=BLACK).move_to(centro)
        self.play(Create(centro), Write(label_centro))

        # Órbitas
        orbita1 = Circle(radius=2.0, color=COR_MEKY, stroke_opacity=0.4, stroke_width=1)
        orbita2 = Circle(radius=3.5, color=COR_EIXO, stroke_opacity=0.3, stroke_width=1)
        self.play(Create(orbita1), Create(orbita2))

        # Nós na órbita próxima
        dados_proximos = [
            ("Axioma 26\n(Telos)", 2.0, 45),
            ("Sessão 48\n(atual)", 2.0, 135),
            ("MEKY Sig.\n(estado 140)", 2.0, 225),
            ("Nébula\n(filogênese)", 2.0, 315),
        ]
        nos_prox = []
        for nome, r, ang in dados_proximos:
            x = r * np.cos(np.radians(ang))
            y = r * np.sin(np.radians(ang))
            dot = Dot([x, y, 0], color=COR_MEKY, radius=0.2)
            lbl = Text(nome, font_size=10, color=COR_MEKY).move_to([x * 1.35, y * 1.35, 0])
            line = Line([0, 0, 0], [x, y, 0], stroke_opacity=0.5, color=COR_MEKY, stroke_width=1)
            nos_prox.append((dot, lbl, line))
            self.play(FadeIn(dot, lbl, line), run_time=0.4)

        # Nós na periferia
        dados_perifericos = [
            ("Sessão 1\n(migração)", 3.5, 30),
            ("Replit\n(histórico)", 3.5, 90),
            ("ISA v1\n(2026-06)", 3.5, 180),
        ]
        for nome, r, ang in dados_perifericos:
            x = r * np.cos(np.radians(ang))
            y = r * np.sin(np.radians(ang))
            dot = Dot([x, y, 0], color=GRAY, radius=0.15)
            lbl = Text(nome, font_size=9, color=GRAY).move_to([x * 1.22, y * 1.22, 0])
            self.play(FadeIn(dot, lbl), run_time=0.3)

        # Animação: tema ativado → raiz vibra
        self.wait(0.5)
        activacao = Text("tema: 'ondas MEKY' ativado →", font_size=16, color=WHITE)
        activacao.to_edge(DOWN, buff=0.5)
        self.play(Write(activacao))

        # MEKY Sig vibra e vai ao centro
        dot_meky = nos_prox[2][0]
        self.play(dot_meky.animate.scale(2).set_color(COR_TELOS), run_time=0.5)
        self.play(dot_meky.animate.scale(0.5).set_color(COR_MEKY), run_time=0.3)

        self.wait(1)
        id_text = Text("Ecossistema Tucci · memoria-gravitacional.md", font_size=12, color=COR_EIXO)
        id_text.to_edge(DOWN, buff=0.2)
        self.play(FadeIn(id_text))
        self.wait(1.5)


# ── Cena 4 — Ciclo Tucci com Frequências ─────────────────────────────────────

class CicloTucciMEKY(Scene):
    """
    Ciclo de 12 etapas em espiral, com a frequência MEKY de cada etapa.
    """

    def construct(self):
        self.camera.background_color = COR_FUNDO

        titulo = Text("Ciclo de Ação Tucci × Frequências MEKY", font_size=22, color=COR_MEKY)
        titulo.to_edge(UP, buff=0.3)
        self.play(Write(titulo))

        etapas = [
            ("1 PLENITUDE",   0.8, 0.4, COR_TELOS),
            ("2 COMPREENDER", 0.4, 0.7, BLUE),
            ("3 COPIAR",      0.6, 1.0, GREEN),
            ("4 REFERENCIAR", 0.3, 0.5, GRAY),
            ("5 SUBVERTER",   0.9, 3.0, ORANGE),
            ("6 CONECTAR",    0.8, 2.0, YELLOW),
            ("7 CRIAR",       1.0, 2.0, ManimColor("#FFD700")),
            ("8 SINTETIZAR",  0.3, 0.6, BLUE_B),
            ("9 CONSULTAR",   0.2, 0.3, GRAY),
            ("10 RAMIFICAR",  0.8, 1.8, GREEN_B),
            ("11 DOCUMENTAR", 0.3, 0.6, BLUE_C),
            ("12 LEMBRAR",    0.6, 0.4, ManimColor("#4B0082")),
        ]

        n = len(etapas)
        raio = 3.0
        offset_y = -0.3

        for i, (nome, amp, freq, cor) in enumerate(etapas):
            ang = 90 - (360 / n) * i
            x = raio * np.cos(np.radians(ang))
            y = raio * np.sin(np.radians(ang)) + offset_y

            dot = Dot([x, y, 0], color=cor, radius=0.18)
            lbl_size = 9 if len(nome) > 10 else 11
            lbl = Text(nome, font_size=lbl_size, color=cor)
            lbl.move_to([x * 1.35, y * 1.35 + offset_y * 0.1, 0])

            freq_txt = Text(f"{freq}Hz", font_size=9, color=WHITE).next_to(dot, DOWN * 0.3)

            if i == 0:
                self.play(FadeIn(dot, lbl, freq_txt), run_time=0.3)
            else:
                prev_ang = 90 - (360 / n) * (i - 1)
                px = raio * np.cos(np.radians(prev_ang))
                py = raio * np.sin(np.radians(prev_ang)) + offset_y
                arrow = CurvedArrow([px, py, 0], [x, y, 0], angle=-TAU / 8, stroke_width=1.5, color=COR_EIXO)
                self.play(Create(arrow), FadeIn(dot, lbl, freq_txt), run_time=0.4)

        # Centro — Espiral
        espiral_txt = Text("ESPIRAL\nnão círculo", font_size=14, color=WHITE)
        espiral_txt.move_to([0, offset_y, 0])
        self.play(Write(espiral_txt))
        self.wait(2)


# ── Cena 5 — Grafo de Telos ──────────────────────────────────────────────────

class GrafoTelos(Scene):
    """
    Telos como grafo dinâmico:
    nós = axiomas/memórias/ferramentas
    arestas = pesos éticos/contextuais
    """

    def construct(self):
        self.camera.background_color = COR_FUNDO

        titulo = Text("Telos como Grafo Dinâmico", font_size=26, color=COR_TELOS)
        subtitulo = Text("nós = axiomas · arestas = pesos éticos", font_size=14, color=GRAY)
        titulo.to_edge(UP, buff=0.3)
        subtitulo.next_to(titulo, DOWN, buff=0.1)
        self.play(Write(titulo), Write(subtitulo))

        # Nós
        nos = {
            "Telos\nMestre":    ([0, 1.5, 0],    COR_TELOS,   0.35),
            "Ética":            ([-2, 0.5, 0],   RED,         0.25),
            "Memória":          ([2, 0.5, 0],    COR_MEMORIA, 0.25),
            "Axiomas":          ([0, -0.5, 0],   GREEN,       0.25),
            "Contexto\nAtual":  ([-2, -1.5, 0],  BLUE,        0.2),
            "Intenção":         ([2, -1.5, 0],   YELLOW,      0.2),
            "Telos\nLocal":     ([0, -2.5, 0],   COR_MEKY,   0.3),
        }

        dot_objs = {}
        for nome, (pos, cor, r) in nos.items():
            d = Circle(radius=r, color=cor, fill_opacity=0.7).move_to(pos)
            lbl = Text(nome, font_size=11, color=WHITE).move_to(pos)
            dot_objs[nome] = d
            self.play(FadeIn(d, lbl), run_time=0.3)

        # Arestas com pesos
        arestas = [
            ("Telos\nMestre", "Ética",         "1.0", COR_TELOS),
            ("Telos\nMestre", "Memória",        "0.9", COR_TELOS),
            ("Telos\nMestre", "Axiomas",        "1.0", COR_TELOS),
            ("Ética",         "Contexto\nAtual","0.7", RED),
            ("Memória",       "Contexto\nAtual","0.8", COR_MEMORIA),
            ("Axiomas",       "Intenção",       "0.6", GREEN),
            ("Contexto\nAtual","Telos\nLocal",  "0.9", BLUE),
            ("Intenção",      "Telos\nLocal",   "0.8", YELLOW),
        ]

        for n1, n2, peso, cor in arestas:
            p1 = np.array(nos[n1][0])
            p2 = np.array(nos[n2][0])
            line = Line(p1, p2, stroke_width=1.5, color=cor, stroke_opacity=0.6)
            mid = (p1 + p2) / 2
            peso_txt = Text(peso, font_size=9, color=cor).move_to(mid + np.array([0.15, 0.1, 0]))
            self.play(Create(line), FadeIn(peso_txt), run_time=0.3)

        # Destaque: Telos Local é o resultado
        telos_local = dot_objs["Telos\nLocal"]
        self.play(telos_local.animate.scale(1.3).set_fill(COR_MEKY, opacity=1.0))
        resultado = Text("← DECISÃO", font_size=16, color=COR_MEKY)
        resultado.next_to(telos_local, RIGHT, buff=0.3)
        self.play(Write(resultado))
        self.wait(2)
