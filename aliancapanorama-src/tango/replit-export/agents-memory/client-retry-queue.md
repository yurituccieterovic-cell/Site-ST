---
name: Fila de reenvio no cliente (offline)
description: Regras para filas de retry em localStorage no frontend (ex. Oráculo) que sobrevivem a queda de conexão.
---

Ao construir uma fila no navegador que reentrega mensagens após queda de rede, quatro coisas têm que andar juntas — faltar uma reintroduz perda/loop:

- **Envelope completo, não só o texto.** Persistir tudo que o reenvio precisa (texto, anexos, id do projeto/contexto). Só guardar o texto perde anexos e reenvia no contexto errado se a pessoa trocou de projeto antes de reconectar.
- **Remover da fila SÓ após envio confirmado.** Nunca dar dequeue antes do envio: se o handler retornar cedo (já streamando, item vazio), o item some. O handler deve retornar status ("sent"/"queued"/"skipped") e a fila só remove em "sent".
- **id estável.** Se a leitura gera id para entradas legadas sem id, tem que **persistir** essa normalização na hora; senão cada leitura dá id diferente e a remoção por id falha → reenvio em loop.
- **Guarda anti-martelo.** Drenar em loop até esvaziar, mas cada id no máximo uma vez por passada (Set de tentados). Item que falha de novo volta pro fim e só é retentado no próximo evento 'online' — senão servidor fora do ar (mas online) vira loop apertado de requests.

**Why:** essa combinação só ficou correta depois de 3 rodadas de revisão; cada item omitido reintroduziu um bug distinto (perda silenciosa, contexto errado, loop infinito).
**How to apply:** vale pra qualquer fila de retry client-side; replicar o mesmo contrato (envelope + status + id persistido + anti-martelo) em outras telas que precisem aguentar queda de conexão.
