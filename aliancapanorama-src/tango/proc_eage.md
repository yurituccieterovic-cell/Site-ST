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

1. Ler `tango/sys_age_core.md` (estado atual: profissionais, URLs, pendências, equipe)
2. Buscar emails recentes da thread de brainstorm no Gmail:
   ```python
   m.search(None, 'SUBJECT "Age"')
   # + FROM matanimoto / FROM yuri nos últimos 30 dias
   ```
3. Carregar contexto completo: sistema atual + o que já foi discutido na thread
4. Formular resposta fractal:
   - **Camada 1**: refletir sobre o que foi dito (não ignorar o que veio antes)
   - **Camada 2**: ramificar em 2-3 direções novas
   - **Camada 3**: para cada direção, separar claramente:
     - `[MAYUMI]` — o que ela executa/decide
     - `[CÓDIGO]` — o que entra no sistema como programação
     - `[IA]` — onde uma IA (SABIÁ ou outra) pode operar
   - **Camada 4**: 1-2 perguntas abertas para puxar a próxima rodada
5. Enviar por email respondendo na thread (Reply-To: Yuri + Mayumi)
6. Registrar ideias novas com prefixo `I6XX` em IDEIAS.md

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
