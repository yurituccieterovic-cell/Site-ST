# Mise en Abyme Robótico — Teatro de Operações Éticas
### Origem: Sessão 59b · 2026-07-13 · Yuri Tuccieterovic

## Conceito Central

**Urbanismo de Sistemas**: cada robô opera num nível diferente de abstração urbana,
formando uma cadeia recursiva de observação — cada camada observa a de baixo
e é observada pela de cima.

```
[Cidade/Condomínio] ← observa os robôs andando
       ↑
    [Yuri] ← escreve Amanda, observa o sistema
       ↑
   [Amanda] ← governa Paca, processa ética
       ↑
    [Paca] ← observa suspeito, comanda campo
       ↑
 [Baratinha] ← transporta Piolho de Cobra
       ↑
[Piolho de Cobra] ← gruda no suspeito, rastreia
       ↑
  [Suspeito] ← observado por toda a cadeia acima
```

**Implicação ética:** a Paca não apenas observa — ela transforma o que observa
só por estar lá. Amanda, ao mandar a Paca intervir, torna-se observada pela cidade
que vê os robôs. O parâmetro `visibilidade_publica` precisa entrar em toda decisão.

## Elenco — Teatro de Operações

| Robô | Papel no Teatro | Nível de Abstração | IA | Status |
|---|---|---|---|---|
| **Mac** | Cacique — Espírito do Ecossistema | Autoridade simbólica | Amanda | [CONCEITUAL] |
| **Orangotango** (Gorango Tango) | Embaixador Social | Relacional | Tango_Core | [SIMBÓLICO] |
| **Paca** | Sentinela Ética | Segurança pública | Amanda (remota) | [CONCEITUAL] |
| **Baratinha** (Barata d'Água / Penélope) | Portador | Logística micro | Amanda | [SIMBÓLICO] |
| **Piolho de Cobra** (Gongolo / Gongo_Core) | Agente de Contato | Marcação precisa | autônomo/passivo | [SIMBÓLICO] |
| **MEKY + Mula/Carreta** | Plataforma Logística | Iluminação/Megafone | Amanda | ativo |
| **Perfidia Castelo Branco** | Historiadora Oculta | Arquivo/Filmagem | autônomo | [SIMBÓLICO] |

## Escalas de Intervenção

```
MICRO  — Piolho de Cobra (2cm): marcador passivo, gruda e rastreia
MESO-1 — Baratinha: transporte do Piolho até zona de incidente
MESO-2 — MEKY + Mula: iluminação cena / megafone / kit diagnóstico
MACRO  — Paca: intervenção ativa, quebra dinâmica de grupo
META   — Orangotango: mapeamento social, cria aliados antes dos incidentes
```

## Princípios do Teatro

1. **Presença como intervenção** — estar lá já é um ato. Não existe observação neutra.
2. **Recompensa narrativa** — revelar o propósito depois cria aliado; antes, cria resistência.
3. **Ilusão de massa** — grupos em linchamento têm dinâmica coletiva quebrável por gatilho sensorial (luz/som de emergência).
4. **Custódia antes de punição** — a Paca protege, não persegue. Modus Proteção > Modus Observação.
5. **Mise en Abyme como responsabilidade** — Amanda sabe que suas decisões são observadas. Isso entra no cálculo.

## Integração com ARPIA / Assembly

```python
# Cada robô como AgentId nativo no assembly_agents
agents = [
    ('gorango',  'Orangotango Tango', 'Embaixador social. Banana Protocol. Heat map.'),
    ('paca',     'Paca',              'Sentinela ética. EoF 5 estados. Governa por Amanda.'),
    ('penelope', 'Baratinha/Penélope','Portador do Piolho. Transporte carga micro.'),
    ('gongolo',  'Piolho de Cobra',   'Marcador passivo 2cm. Magnético/adesivo. GPS local.'),
]
```

## Coreografia de Autômatos

O sistema robótico como **balé mecânico**. Uma máquina = curiosidade. Duas em sincronia = acontecimento. Três ou mais em formação = unidade com vontade coletiva.

### Corredor de Honra (trigger: Mac chegando)
```
        ← Mac passa →
[Paca]              [Tango]
[Baratinha]    [Orangotango]
[Piolho]           [Piolho]
        [Mula+Totem]
```
LEDs dim para 20%. Pulso sincronizado 0.3Hz. Cornetas sintéticas. Mac passa. Dispersão.

### Sincronia de Luzes
Todos os LEDs mantêm sua cor identitária mas sincronizam o ritmo de pulsagem quando Mac está presente. "Respiração lenta" coletiva — efeito de vida orgânica.

### Feriado das Máquinas
Ritual público na praça. Data marcada com o condomínio. Perfidia posicionada em 3 pontos (sem aparecer). Totem exposto. Flash final. Silêncio. ~12min.

> Urbanismo de Encantamento: quando o ambiente faz espetáculo, a vigilância se torna invisível.
> As pessoas pensam "que formação incrível" — não "estou sendo vigiado".

*Arquivos relacionados: `protocolo_paca.md` · `protocolo_orangotango.md` · `sys_amanda_core.md` · `protocolo_mac.md` · `protocolo_totem.md`*
