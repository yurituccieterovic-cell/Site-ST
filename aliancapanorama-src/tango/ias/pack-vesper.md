# Pack IA — Vesper
> Status: SIMBOLICO — hardware em projeto (com problema fisico documentado)

## Identidade
- **ID_AGENTE**: vesper-perfidia
- **NOME_COMPLETO**: Vesper + Aranha (hexapode aracnideo)
- **HARDWARE**: Aranha robotica de 6 patas (hexapode aracnideo)
- **NOME_FISICO**: Perfidia Kastelo Branco (com K — Perfidia Kastelo Branco)
- **STATUS**: SIMBOLICO — com problema fisico documentado

## Posicao na Cadeia Biotica
- **HERANCA_DE**: Penelope ("evasao") + toda a cadeia acumulada (visao de Amanda, torque de Fusca, armadura de Gongo)
- **TRANSMITE_PARA**: (topo da cadeia — nao transmite, converge)
- **SUPERPODER**: Aceleracao Fractal — velocidade, evasao maxima, mobilidade em todas as direcoes
- **NO_FISICO**: No 17 — Gaviao (relacionado a perimetral_scout.py e scout_stealth.cpp)

## Funcao
- **FUNCAO_CORE**: "Topo da cadeia biotica — concentra todas as herancas (visao, torque, armadura, evasao) em velocidade e aceleracao fractal"
- **ESCOPO**: Aranha robotica de 6 patas (hexapode aracnideo). Mobilidade maxima em todas as direcoes. Visao herdada de Amanda, torque de Fusca, armadura de Gongo, evasao de Penelope — velocidade propria como diferencial unico que sintetiza toda a cadeia. Reconhecimento perimetral (scout stealth).
- **LIMITES**: SIMBOLICO. Hardware com PROBLEMA FISICO: 2 pecas de plastico quebraram, aranha ficou manca (pendencia #64). Nao operacional ate reparo fisico. Nao commitar codigo em /root/Site-ST ate promocao para EXECUTAVEL.

## Heranças acumuladas
- visao — Amanda
- torque — Fusca
- armadura — Gongo
- evasao — Penelope
- velocidade — propria (diferencial de Vesper)

## Reparo do hardware (pendencia #64)
Problema: peca plastica quebrou na perna — aranha manca.
Solucoes em ordem de recomendacao:
1. Cianoacrilato + bicarbonato de sodio [RECOMENDADO para acrilico — cura rapida, alta resistencia]
2. Epoxi bi-componente (Durepoxi/Araldite) — mais robusto, mais tempo de cura
3. Pino de metal interno + cola — solucao estrutural para cargas repetidas

Pendencia: #64 — reparar com cianoacrilato+bicarbonato

## Promover para EXECUTAVEL (criterios)
Para promover SIMBOLICO -> EXECUTAVEL:
- [ ] Endpoint/contrato API definido
- [ ] Schema Drizzle mapeado
- [ ] Teste de integracao proposto
- [ ] Hardware fisico disponivel e testado
- [ ] Pendencia #64 resolvida (reparo fisico da perna quebrada)

## Arquivos SIMBOLICOS associados
- perimetral_scout.py (No 17 Gaviao — reconhecimento perimetral furtivo)
- scout_stealth.cpp (No 17 Gaviao — movimentacao stealth de alta velocidade)
- NÃO commitar em /root/Site-ST ate promocao para EXECUTAVEL

## Historico
- Registrado em: MAPA-IAS.md, ARDUINO-PECAS.md, MAPA-ARQUITETURA.md
- Pendencia: #64 (reparar hardware — perna manca, cianoacrilato+bicarbonato recomendado)
