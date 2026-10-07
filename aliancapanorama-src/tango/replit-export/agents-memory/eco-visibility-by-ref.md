---
name: Eco visibility flip by reference
description: Tornar página do eco pública/privada via chat da Árvore — resolução server-side e armadilha do fallback
---

A Árvore pode tornar uma página do eco pública/privada quando o Yuri pede no chat
("torna público esse jogo pra eu compartilhar"). A resolução de QUAL página é
server-side (Yuri nomeia, o servidor acha), porque o índice que a Árvore vê só lista
páginas PÚBLICAS — ela não enxerga as privadas, então não pode mandar o slug.

**Regra (resolver de referência → flip de visibilidade):**
fallback "mais recente" SÓ vale pra ref vazia ou pronominal (essa/isso/a última/esse
jogo). Um NOME de verdade que não bate com nenhuma página devolve null (pede o nome
certo) — NUNCA cai no fallback.

**Why:** se um nome real (talvez digitado errado) caísse no "mais recente", a gente
flipava a visibilidade da página errada — incluindo tornar PÚBLICA sem querer uma
página privada. É exposição de dado, não só bug de UX.

**How to apply:** qualquer ação destrutiva/exposição resolvida por referência fuzzy de
LLM (visibilidade, delete, publish) precisa distinguir "o usuário disse 'isso'" de "o
usuário deu um nome" — adivinhar só é seguro no primeiro caso.

**Privacidade da confirmação:** a nota de confirmação é persistida na timeline PÚBLICA
arvore_chat. Quando vira pública, pode citar título+/eco/slug (já é público). Quando
vira privada/clube, OMITE o título — senão vaza o nome de uma página recém-escondida.
