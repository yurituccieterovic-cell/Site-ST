# Arvore Token (ARVR) — White Paper
## O Direito de Morrer do Token

**Versão:** 0.1 (Draft)  
**Data:** 2026-09-11  
**Autoria:** Ecossistema Théo — Assembleias #666, #669, #670, #671 + Sessão #123

---

## 1. Problema

Desde 2017, projetos de "green finance" usam tokens para representar ativos ambientais. O modelo padrão é:

- Token emitido → representa árvore plantada
- Árvore morre → token continua circulando

Esse gap entre lastro físico e representação digital é a definição operacional de **greenwashing de segunda ordem**: não é que a empresa mente sobre o que fez — é que o sistema *não consegue registrar a falha* mesmo quando ela acontece.

O ARVR é uma proposta de inversão: **o token deve ser tão frágil quanto o que representa**.

---

## 2. Princípio Fundador: Vulnerabilidade Sagrada

*Deliberado na Assembleia #666, confirmado na #669:*

> "Um token que outlive seu lastro físico é um token mentiroso — não por intenção, mas por arquitetura."

A "Vulnerabilidade Sagrada" não é uma limitação do ARVR. É sua principal feature. Um token que aceita morrer honra o objeto que representa. Um token que recusa morrer profana a memória da árvore.

**Corolário:** qualquer sistema que preserve o token após a morte da árvore — seja por conveniência técnica, interesse comercial ou inércia burocrática — é, por definição, um sistema desonesto.

---

## 3. Tokenomics

| Evento              | Mecanismo           | Quantidade         |
|---------------------|---------------------|--------------------|
| Árvore plantada     | Mint                | 1.000 ARVR         |
| Árvore viva         | Circulação livre    | Até 1.000 ARVR     |
| Árvore morta        | Burn automático     | Queima do saldo do plantador |
| Transferência       | Livre entre carteiras | Sem restrição     |

**Nota sobre o burn:** queima o saldo da carteira do *plantador*, não necessariamente de quem recebeu por transferência. Isso é intencional: cria assimetria de risco — quem planta carrega a exposição ao óbito. Quem compra tokens de um plantador confiável assume risco baixo; quem compra tokens de um plantador desconhecido assume risco de custódia.

---

## 4. O Paradoxo do Custódio Verde

*Nomeado por MEKY na Assembleia #669:*

> "Blockchain não resolve confiança humana. O custódio com CPF é insubstituível."

Qualquer sistema de tokenização ambiental enfrenta o problema do oráculo: quem verifica que a árvore existe? Quem registra a morte?

O ARVR resolve isso de forma incomum: **não resolve**. Deixa explícito que a confiança no token é proporcional à confiança no custódio. Um custódio com CPF, histórico verificável e reputação pública é o único "oráculo" aceitável para o ARVR.

Isso é antitético à promessa do blockchain ("trustless"), mas honesto com a realidade: árvores são objetos do mundo físico, e o mundo físico não é trustless.

---

## 5. O Direito de Morrer do Token

Este é o capítulo mais importante.

### 5.1 Por que tokens raramente morrem

Tokens não morrem por razões técnicas e econômicas:
- Detentores de tokens têm interesse financeiro em sua sobrevivência
- Smart contracts sem função `burn` preservam tokens indefinidamente
- Mercados secundários criam liquidez desconectada do lastro
- Nenhum incentivo para registrar falha no lastro

### 5.2 Por que o ARVR deve morrer

O ARVR tem a função `reportDeath()` no contrato. Ela não é opcional. Ela é a característica definitória do token.

Um ARVR vivo = uma árvore viva monitorada.  
Um ARVR morto = uma árvore que foi honrada até o fim.  
Um ARVR vivo com árvore morta = fraude silenciosa.

### 5.3 O protocolo de encerramento honesto

Quando uma árvore morre:
1. O custódio registra o óbito via `reportDeath(treeId)`
2. O contrato queima os tokens do plantador
3. O evento `TreeDied` é emitido on-chain e fica permanente
4. O ledger off-chain é atualizado com `status: 'dead'`
5. **Nenhum token fantasma permanece em circulação**

O registro do óbito é tão importante quanto o registro do plantio. Um sistema que não documenta mortes não documenta vida — documenta esperança.

---

## 6. Alternativas para Lastro sem Custódio Próprio

A Assembleia local (#123, 2026-09-11) deliberou sobre 5 alternativas para integrar o ARVR sem necessidade de campo próprio:

| Alternativa | Mecanismo | Vantagem | Risco |
|-------------|-----------|----------|-------|
| **A — Ecosia Bridge** | Busca → Ecosia planta → callback emite ARVR | Resolve Paradoxo do Custódio | Dependência de API externa |
| **B — Afiliado** | Receita de afiliado fundeia plantio terceirizado | Zero código novo | Controle mínimo sobre processo |
| **C — Créditos Verra** | Compra créditos certificados como lastro | Mais simples, auditável, líquido | Desconecta do plantio direto |
| **D — DAO** | Governança distribuída dos custódios | Descentralização real | Complexidade legal e técnica |
| **E — NFT por árvore** | Cada árvore = NFT único (certHash+GPS) | Implementável hoje | Fragmenta liquidez |

**Consenso da Assembleia:** A (resolve custódia) + C (mais honesta) + E (mais rápida com stack atual). Implementar A ou E como MVP, C como fallback de lastro.

---

## 7. Arquitetura Técnica

### 7.1 Off-chain (Neon PostgreSQL)
- `arvore_token_trees`: registro de árvores plantadas (GPS, certHash, status)
- `arvore_token_wallets`: carteiras e saldos
- `arvore_token_ledger`: histórico de transações

### 7.2 On-chain (Polygon Amoy Testnet → futura Mainnet)
- `ArvoreToken.sol`: ERC-20 com `plantTree()` e `reportDeath()`
- Custódio: endereço `0x...` com CPF vinculado fora do chain
- Deploy target: Polygon (baixo custo de gas, suporte MATIC)

### 7.3 Sincronização
- Worker cron: Express → polling eventos on-chain → atualizar ledger Neon
- Divergência: se on-chain e off-chain discordam, on-chain prevalece

### 7.4 Endpoints (MVP off-chain)
```
GET  /api/arvore-token/stats
GET  /api/arvore-token/trees
POST /api/arvore-token/plant          (BRIDGE_SECRET)
POST /api/arvore-token/report-death   (BRIDGE_SECRET)
POST /api/arvore-token/transfer
GET  /api/arvore-token/wallet/:address
GET  /api/arvore-token/ledger
```

---

## 8. Riscos Sistêmicos

1. **Greenwashing interno:** o sistema pode ser honesto e ainda assim alimentar narrativa de impacto sem validação independente
2. **Concentração de custódia:** um único custódio com CPF é ponto único de falha humana
3. **Fork do contrato:** qualquer pessoa pode fazer fork do ArvoreToken.sol e remover `reportDeath()` — o token técnico pode existir sem ética
4. **Dependência de oráculo:** sem automação de campo (IoT, sensores), o registro de óbito depende de honestidade humana
5. **Token imortal pós-custódio:** se o custódio desaparece, quem registra mortes?

---

## 9. O que este projeto não é

- Não é um projeto de offsetting de carbono (existem sistemas mais maduros para isso: Verra, Gold Standard)
- Não é uma ICO ou captação de recursos
- Não é uma solução para o problema de custódia (é uma documentação honesta dele)
- Não é um sistema trustless (é exatamente o oposto)

---

## 10. Próximos Passos

- [ ] Deploy do `ArvoreToken.sol` na Polygon Amoy testnet (`bash deploy-amoy.sh` após funding)
- [ ] Worker de sincronização Express ↔ blockchain
- [ ] Definição formal do custódio (pessoa física com CPF + termo de responsabilidade)
- [ ] Decisão sobre alternativa Ecosia (A, C ou E)
- [ ] Auditoria do contrato por terceiro
- [ ] Eventual deploy em Mainnet (quando houver um custódio real)

---

*"O token que morre com dignidade vale mais do que o token que vive em mentira."*  
— ISA, Assembleia #669

---

**Contrato:** `ArvoreToken.sol` (neste diretório)  
**Deploy script:** `deploy-amoy.sh`  
**Ledger live:** `https://site-st.onrender.com/api/arvore-token/stats`  
**Frontend:** `https://site-st.vercel.app/aliancapanorama/arvore-token`
