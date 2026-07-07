# LIVRO-WORKFLOW.md — Workflow de Geração do Livro PDF
*Sessão 26b · 2026-07-07 · A Engrenagem Semiótica da Fiação Enterrada*

---

## Pipeline de Geração (PDF v4)

### Passo 1 · Fonte de dados
- **Arquivo**: `LIVRO-PARTE-I.md` (conversas Yuri + Gemini em boxes `╭─╮`)
- **Parser**: regex `[╭][─]{5,}[╮].*?[╰][─]{5,}[╯]` com `re.DOTALL`
- **Extração**: `clean_box()` — remove `│`, labels `▶ YURI` / `◀ GEMINI`, sanitiza UTF-8 > latin-1

### Passo 2 · Imagens
- **Fonte**: Drive `1vR5VBrIaUXvybjuBpV3_GfhVdpQWwjPL` → `Livro/Arquivos/Geradas por IA/`
- **Download**: `gdown --folder <URL> -O /root/livro-arquivos/`
- **Formato**: 11 JPGs 1024×559 px (16:9), RGB, ~100-300KB cada
- **Instalação Pillow**: `apt-get install python3-pil` → Python 3.14 sistema
- **Instalação fpdf2**: `apt-get install python3-fpdf` → versão 2.8.4
- **Runner**: `python3` (Python 3.14, não python3.13/Termux)

### Passo 3 · Layout PDF (v4)
```
Formato: A4 210×297mm
Margens: L=14 R=14 T=18 B=18
Fundo: C_DARK=(13,27,42) em TODAS as páginas via header()
Texto fora de caixas: C_TEXT=(220,235,250) — branco-azulado
Caixas Yuri:   C_ICE=(220,240,255) + borda C_CYAN, texto C_TEXT_BOX=(15,28,45)
Caixas Gemini: C_BIO=(215,250,228) + borda C_GREEN, texto C_TEXT_BOX
Imagens: IMG_W=172mm, altura=IMG_W/AR_16_9≈93.9mm, âncora IMG_X=19mm
Boxes: BOX_W=138mm (3/4 pag), Yuri x=58mm direita, Gemini x=14mm esquerda
```

### Passo 4 · Renderização 2-passagens
```
Pass 1: Book() → draw_cover() → add_page() placeholder → render_body()
        → coleta ch_pages dict (capitulo_id → nº página)
Pass 2: Book() → draw_cover() → draw_toc(ch_pages) → render_body()
        → output() → PDF final
```

### Passo 5 · Mapeamento imagem → capítulo
| Slot | Imagem (UUID) | Capítulo |
|------|---------------|---------|
| 0 | 0c7c9ea7... | Cap 1.1 — Formulário |
| 1 | 26e93d37... | Cap 1.2 — Atrito Semiótico |
| 2 | 44f6c26b... | Cap 1.3 — Biomassa |
| 3 | 5226d5d1... | Cap 1.4 — Agentes |
| 4 | 70f2b296... | Cap 1.5 — Burocracia |
| 5 | 7bc1f98c... | Síntese |

### Passo 6 · Email
```python
smtplib.SMTP_SSL('smtp.gmail.com', 465)
login(GMAIL_ACCOUNT, GMAIL_APP_PASSWORD)
MIMEBase attachment: A-Engrenagem-Semiotica-v4.pdf
Para: yurituccieterovic@gmail.com
```

### Passo 7 · Arquivo de saída
- `SRC/A-Engrenagem-Semiotica-Parte-I.pdf` — 840KB, 9 páginas numeradas
- `SRC/LIVRO-COORDS.md` — coordenadas e layout atualizados (v4)

---

## #processo — Conversa da Assembleia (conversa_arduino.txt)

### Extração
- **Arquivo**: scratchpad/conversa_arduino.txt (1451 linhas)
- **Conteúdo**: Assembleia sobre ecossistema Tucci — mapeamento físico, MC leucócito, hardware MEKY

### Aprendizados
1. **Suporte em "L" para LED**: Fixação vertical×horizontal do anel WS2812B usa cantoneira em L ou standoff com fenda — isolar com arruelas nylon para evitar curto nas trilhas
2. **Isolamento @cão_covarde_shield**: Coordenadas reais (lat/lon) não saem do borda — só vetores relativos x,y,z a partir da mesa
3. **Modo_Bebê_Clean**: Boot da MC aborta se Step Down cair < 5V — interrupção de hardware via ATmega2560
4. **MC como Leucócito**: Diapedese (livre caminhar), Fagocitose (neutralizar anomalia), Quimiotaxia (atraída por desvio de integridade) — já parcialmente implementado em cycle.ts
5. **Red Teaming conceptual**: Injeção de prompt semiótico, Manipulação de Memória/Rollback, IoT Poisoning via hardware não homologado

### Ideias para implementar
- [ ] `init_baby_clean_glow()` no firmware: acende anel azul-petróleo (0,128,128) ao detectar alimentação
- [ ] `PowerBankTelemetry` no ATmega2560: interrupção quando V < 5V
- [ ] `validate_chassis_integrity()` com verificação cruzada de firmware no boot
- [ ] Decorador `@cão_covarde_shield` no mc_walker.py: mascarar lat/lon

### Pendências do arquivo "2identificando peças"
- **Arquivo**: `Identificando Peças de Robótica Arduino - Google Gemini (1).mht`
- **Drive ID**: `1KL07NhHPXjVY1zoS0hHp7CmV1HkC-51i`
- **Status**: Não acessível publicamente — permissão restrita
- **Ação**: Yuri deve compartilhar o arquivo ou tornar público para processar

---

## Versões do PDF

| Versão | Data | Features |
|--------|------|----------|
| v1 | 2026-07-06 | Primeira geração, boxes com bug de fonte |
| v2 | 2026-07-06 | Fix fonte Helvetica-Bold → `set_font('Helvetica', 'B', ...)` |
| v3 | 2026-07-07 | TOC no início, boxes quebram em páginas, 3/4 largura, paleta tech |
| v4 | 2026-07-07 | Tema escuro (fundo preto), 6 imagens Gemini reais, 9 páginas |
| v5 | 2026-07-07 | Bug índice corrigido (ln→ln()), Cap.0 Mac/Arduino, texto real PDF, 5 frames vídeo, 10 páginas |

**v5:** `gerar_livro5.py` — texto de `capitulos-texto.json`, frames de `/root/livro-arquivos/frames-thumb/`
