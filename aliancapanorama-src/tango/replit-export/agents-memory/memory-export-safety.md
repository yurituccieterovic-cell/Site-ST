---
name: Exportação segura de memória
description: Fronteiras duráveis para exportar memória privada sem carregar credenciais ou depender de uma única instância.
---

# Exportação segura de memória

**Regra:** uma exportação de memória deve partir de uma lista branca explícita de fontes, separar classificações, ler tudo no mesmo snapshot e sanitizar tanto nomes de campos quanto valores arbitrários. Antes de classificar campos sensíveis, normalize camelCase, snake_case e kebab-case para a mesma forma. Links de download privados devem ser assinados, ter expiração curta e não depender de estado em memória de um processo.

**Why:** excluir tabelas de autenticação/pagamento não basta — chats e arquivos enviados podem conter credenciais dentro de texto ou JSON. E um token guardado só em memória falha quando POST e GET chegam a instâncias diferentes ou quando há reinício entre eles.

**How to apply:** em qualquer novo backup/export privado, use snapshot read-only consistente, lista branca de colunas/fontes, varredura de campos e padrões de valores, manifesto de redações/tamanhos/checksums, temporários fora da raiz pública e URL assinada com validade curta. Cópias locais nunca entram em `attached_assets`, metadata de outputs ou Git; mantenha-as em caminho ignorado e com acesso restrito.