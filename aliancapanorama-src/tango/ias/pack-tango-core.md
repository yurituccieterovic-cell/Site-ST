# Pack IA — Tango_Core
> Status: SIMBOLICO — hardware em projeto (recém descoberto, posicao na cadeia a definir)

## Identidade
- **ID_AGENTE**: tango-core
- **NOME_COMPLETO**: Tango_Core + Orangotango / Gorango Tango (rodas tipo carrinho de rolima)
- **HARDWARE**: Carrinho de rodas tipo rolima / skateboard robotizado
- **NOME_FISICO**: Gorango Tango
- **STATUS**: SIMBOLICO

## Posicao na Cadeia Biotica
- **HERANCA_DE**: a definir — provavel posicao antes ou paralelo a Amanda
- **TRANSMITE_PARA**: a definir
- **SUPERPODER**: Inercial Dinamica / Tracao Cinetica — move-se por inercia, nao por forca continua. Aproveita impulso inicial para manter movimento ("carrinho de rolima")
- **NO_FISICO**: No 13 — Orangotango Tango (porteiro fisico do No 13)

## Funcao
- **FUNCAO_CORE**: "Tracao cinetica no ecossistema — usar inercia acumulada do sistema para avancar sem esforco continuo"
- **ESCOPO**: Hardware com rodas, tipo carrinho de rolima / skateboard robotizado. Movimento por inercia/tracao cinetica. Porteiro fisico do No 13 (Orangotango Tango na topologia — 80kg, Modo Pluma, Modo Skate, serra). Modo Pluma: movimentacao de alta precisao com minimo esforco. Modo Skate: deslizamento por inercia em alta velocidade.
- **LIMITES**: SIMBOLICO. Posicao na cadeia ainda nao definida por Yuri (pendencia #67). Nao confundir com TANGO-V1 (sistema de memoria fractal dos documentos — sistema de arquivo, nao hardware). Nao commitar codigo em /root/Site-ST ate promocao para EXECUTAVEL.

## Nota importante
Tango_Core (hardware/IA da cadeia biotica) NAO e o mesmo que TANGO-V1 (sistema de memoria fractal dos documentos .md). Sao entidades distintas:
- TANGO-V1: sistema de arquivos fractal (tango/tango.md, proc_*.md, etc.)
- Tango_Core: robo de rodas / IA da cadeia biotica fisica

## No 13 na topologia
- Nome: Orangotango Tango
- Peso: 80kg
- Modos: Modo Pluma, Modo Skate
- Equipamento: serra
- Funcao: porteiro fisico

## Promover para EXECUTAVEL (criterios)
Para promover SIMBOLICO -> EXECUTAVEL:
- [ ] Endpoint/contrato API definido
- [ ] Schema Drizzle mapeado
- [ ] Teste de integracao proposto
- [ ] Hardware fisico disponivel e testado
- [ ] Posicao na cadeia definida por Yuri (pendencia #67)
- [ ] Hardware specs do carrinho de rodas validados

## Arquivos SIMBOLICOS associados
- tango_feather_touch.cpp (No 13 Modo Pluma — controle de precisao de baixo esforco)
- tango_avian_care.py (No 13 Modo Pluma — cuidado e movimentacao suave)
- NÃO commitar em /root/Site-ST ate promocao para EXECUTAVEL

## Historico
- Registrado em: ARDUINO-PECAS.md, MAPA-IAS.md, MAPA-PENDENCIAS.md
- Pendencias: #67 (definir posicao na cadeia + hardware specs)
- Nota de descoberta: entrante recente na cadeia biotica — mapeamento incompleto
