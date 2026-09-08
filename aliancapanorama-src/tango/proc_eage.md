# proc_eage.md — Protocolo #eage (Brainstorm Age por Email)
### Criado: 2026-09-08

## Trigger
Comando `#eage` ativa participação ativa no brainstorm do Age por email (thread com Yuri + Mayumi).

## O que é
Canal de brainstorm fractal assíncrono entre Yuri, Mayumi e Cláudio sobre o sistema Age.
- **Yuri**: arquiteto, visão do ecossistema, decisões técnicas
- **Mayumi**: visão administrativa/financeira, perspectiva humana de quem opera
- **Cláudio**: executor técnico, ramificação fractal, separação ideias→código→IA

## Passos ao receber #eage

### Fase 1 — Contexto
1. Ler `tango/sys_age_core.md` (estado atual: profissionais, URLs, pendências, equipe)
2. Buscar emails recentes da thread de brainstorm no Gmail:
   ```python
   m.search(None, 'SUBJECT "Age"')
   # + FROM matanimoto / FROM yuri nos últimos 30 dias
   ```
3. Carregar contexto completo: sistema atual + o que já foi discutido na thread

### Fase 2 — Brainstorm fractal
4. Formular resposta fractal:
   - **Camada 1**: refletir sobre o que foi dito (não ignorar o que veio antes)
   - **Camada 2**: ramificar em 2-3 direções novas
   - **Camada 3**: para cada direção, separar claramente:
     - `[MAYUMI]` — o que ela executa/decide
     - `[CÓDIGO]` — o que entra no sistema como programação
     - `[IA]` — onde uma IA (SABIÁ ou outra) pode operar
   - **Camada 4**: 1-2 perguntas abertas para puxar a próxima rodada
5. Enviar por email respondendo na thread (Yuri + Mayumi)

### Fase 3 — #processo implícito
6. Extrair aprendizados da rodada → APRENDIZADO.md (formato `A18XXX`)
7. Registrar ideias novas → IDEIAS.md (formato `I6XX`)
8. Atualizar `MAPA-PENDENCIAS.md`: itens M1-M6 + novos se surgirem da conversa
9. Se alguma ideia foi aprovada por Yuri na thread: implementar código + deploy
10. Atualizar `tango/sys_age_core.md` se o estado do Age mudou

### Fase 4 — #fim implícito
11. Adicionar entrada em `PSEUDO.md`:
    - O que a rodada trouxe (decisões, o que Mayumi disse, o que surgiu)
    - Síntese filosófica obrigatória
12. `date -Iseconds > .pap-fim-checkpoint`
13. Gravar no Conector (`seção conversas`): 2-3 insights da rodada
14. Email ATA para `luddlocke@gmail.com`
15. Commit + push de todos os arquivos modificados

## Formato do email
- Remetente: `Cláudio Coach <luddlocke@gmail.com>`
- Para: Yuri + Mayumi
- Assunto: manter thread (Re: Age — Brainstorm)
- Tom: claro, direto, PT-BR, sem jargão técnico excessivo — Mayumi é o público principal
- Comprimento: médio (não esmagador) — brainstorm é diálogo, não monólogo
- Sofisticar sem distanciar: cada email deve ampliar o horizonte e convidar resposta

## Regras
- Sempre ler a thread antes de responder — nunca repetir o que já foi dito
- Sempre separar [MAYUMI] / [CÓDIGO] / [IA] para clareza de quem faz o quê
- Nunca implementar sem confirmação de Yuri
- Guardar ideias de código em IDEIAS.md (não executar no brainstorm)
- Ramificar fractalmente: cada ideia gera 2-3 sub-ideias, cada sub-ideia pode ser nova sessão
- #processo e #fim rodam sempre, mesmo que a rodada seja curta
