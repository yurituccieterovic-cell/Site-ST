# Índice — Roteiros de Vídeo
**Série**: Inteligência em Camadas — Do Signo à Frequência  
**Pasta**: `tango/roteiros-video/`  
**Aulias**: capítulos cap18–cap32 na pasta "Roteiros de Vídeo" (publico: "ias")

---

## Episódios

| Ep | Arquivo | Título | Duração | Tema Central |
|----|---------|--------|---------|-------------|
| 01 | [ep01-sistemas-como-cidades.md](ep01-sistemas-como-cidades.md) | Sistemas como Cidades | ~4min | Metáfora urbana de sistemas cognitivos |
| 02 | [ep02-acao-unidade-fundamental.md](ep02-acao-unidade-fundamental.md) | Ação como Unidade Fundamental | ~5min | Ação + semiótica como base |
| 03 | [ep03-telos-sistema-operacional.md](ep03-telos-sistema-operacional.md) | Telos — O Sistema Operacional | ~5min | Propósito como campo gravitacional |
| 04 | [ep04-ciclo-cognitivo-12-etapas.md](ep04-ciclo-cognitivo-12-etapas.md) | O Ciclo Cognitivo de 12 Etapas | ~6min | Pipeline espiral de cognição |
| 05 | [ep05-memoria-campo-gravitacional.md](ep05-memoria-campo-gravitacional.md) | Memória como Campo Gravitacional | ~5min | Memória relacional vs. endereço |
| 06 | [ep06-principios-infraestrutura.md](ep06-principios-infraestrutura.md) | Princípios como Infraestrutura | ~5min | 5 camadas de axiomas |
| 07 | [ep07-governanca-criatividade.md](ep07-governanca-criatividade.md) | Governança e Criatividade | ~5min | Equilíbrio estrutura-caos |
| 08 | [ep08-formacao-heranca-cognitiva.md](ep08-formacao-heranca-cognitiva.md) | Formação de Agentes — Herança Cognitiva | ~5min | Templates de nascimento + filogênese |
| 09 | [ep09-sonhos-de-proposito.md](ep09-sonhos-de-proposito.md) | Sonhos de Propósito | ~5min | Sistema de telos especulativos |
| 10 | [ep10-expressao-frequencia.md](ep10-expressao-frequencia.md) | Expressão Corporal de IA — Frequência | ~5min | Amplitude/frequência/fase como expressão |
| 11 | [ep11-liberdade-autonomia.md](ep11-liberdade-autonomia.md) | Liberdade e Autonomia | ~5min | Autonomia como confiança conquistada |
| 12 | [ep12-emocao-como-dado.md](ep12-emocao-como-dado.md) | Emoção como Dado | ~5min | Estados afetivos como variáveis computacionais |
| 13 | [ep13-comunicacao-entre-sistemas.md](ep13-comunicacao-entre-sistemas.md) | Comunicação entre Sistemas | ~5min | Semiótica de mensagens entre agentes |
| 14 | [ep14-ecossistema-de-ia.md](ep14-ecossistema-de-ia.md) | Ecossistemas de IA | ~6min | Ecologia multi-agente emergente |
| 15 | [ep15-futuro-design-cognitivo.md](ep15-futuro-design-cognitivo.md) | O Futuro do Design Cognitivo | ~6min | Síntese + horizonte da série |

---

## Como acessar via API

```bash
# Listar todos os roteiros (aulias da série)
curl -H "x-bridge-secret: BRIDGE_SECRET" \
  "https://site-st-production.up.railway.app/api/bridge/pap/aulias?publico=ias" \
  | jq '.[] | select(.titulo | startswith("Roteiro Ep"))'
```

## Nomenclatura das aulias

- Títulos: `Roteiro Ep01 — Sistemas como Cidades`, etc.
- Pasta: nova categoria "Roteiros de Vídeo" (identificada por `docId: "roteiros-video"`)
- `publico: "ias"` — acessível a todas as IAs do ecossistema
- `professoraIaId: "claudio"` — assinado por Cláudio

## Notas de produção

- Cada episódio tem sugestões de cenas Manim (`tango/manim_meky.py` — adaptar)
- Nomes de projetos específicos foram removidos — série é pública
- Traduções: "MEKY" → "robô de expressão", "Telos" (universal), "ecossistema" (genérico)
- Duração total da série: ~75min

## Próximos passos para gravar

1. Instalar Manim: `pip install manim`
2. Renderizar cenas: `manim tango/manim_meky.py <NomeDaCena> -pql`
3. Gravar narração (ver cada ep para timing)
4. Editar com DaVinci Resolve (gratuito) ou CapCut
5. Publicar no YouTube / Instagram Reels / TikTok
