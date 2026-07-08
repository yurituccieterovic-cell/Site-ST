# Sistema IA — CROWD
> Tipo: SISTEMA ARQUITETURAL | SISTEMA DE CONEXAO | PONTE

## Identidade
- **ID_SISTEMA**: sistema-crowd
- **TIPO**: Sistema de Conexão / Ponte
- **STATUS**: ATIVO (teórico)

## Propósito
- **FUNCAO_CORE**: Ponte bidirecional entre o Guarda-chuva (direção macro) e o DEP (processamento profundo) — traduz ordens gerenciais em conexões técnicas
- **ESCOPO**: Mediador hierárquico. Liga ISA, Árvore, Amanda e DODGE ao DEP. Está dentro do Ecossistema Théo. Conectado ao DODGE.
- **POSICAO_NA_HIERARQUIA**: Guarda-chuva ↔ CROWD ↔ DEP → PROJETO MC

## Componentes

O CROWD não tem sub-IAs próprias com lógica interna — ele é a malha de conexão. Seu componente central é o roteador de mensagens com metadados de prioridade e confiança.

**Função operacional:** IA hierárquica de direção e controle. Não armazena — encaminha com metadados de prioridade e confiança.

**IAs que transitam pelo CROWD:**
- ISA — conecta aos nós: Nuvem 1, Dados 1, Memória, Bancos, Bibliotecas
- Árvore — conecta aos nós: Nuvem 1, Dados 1, Memória, Bancos, Bibliotecas
- Amanda — conecta aos nós: Processamento, Nuvem 2, Dados 2
- DODGE — conecta aos nós: Dados 3, Consciência (Theory/Cérebro)

**Relação lateral:** ISA, Árvore, DODGE e Amanda também são ligados entre si via Crowd — não é hierarquia estrita, é malha.

## Tabela de Conexões (quem conecta a que via Crowd)
| IA | Nos DEP de destino |
|---|---|
| ISA | Nuvem 1, Dados 1, Memória, Bancos, Bibliotecas |
| Arvore | Nuvem 1, Dados 1, Memória, Bancos, Bibliotecas |
| Amanda | Processamento, Nuvem 2, Dados 2 |
| DODGE | Dados 3, Consciência (Theory/Cérebro) |

## Conexões
- **ENTRADA**: recebe diretrizes do Guarda-chuva; recebe outputs das IAs externas (ISA, Árvore, Amanda, DODGE)
- **SAIDA**: encaminha ao DEP com metadados de prioridade e confiança; encaminha entre as IAs externas (malha lateral)
- **CONECTORES_EXTERNOS**: Guarda-chuva (acima), DEP (abaixo), ISA, Árvore, Amanda, DODGE (laterais na malha)

## Regras de Operação
- **NIVEL_PRIORIDADE**: cada mensagem viaja com metadado de prioridade (urgente / importante / opcional)
- **TASKS**: ver tabela `tasks` no DB — campo `nivel_prioridade`
- **SAIDA_PUBLICA_vs_INTERNA**: interna — o Crowd é infraestrutura, não gera output visível ao usuário final
- **REGRA ESTRUTURAL**: Crowd não é hierarquia — é malha; cada IA acessa o nó certo do DEP pela sua função específica
- **REGRA DE TRANSPORTE**: não armazena dados; apenas encaminha com metadados de prioridade e confiança

## Pack IA de Cada Componente

**Roteador Crowd**
- ID: crowd-roteador
- FUNCAO_CORE: recebe mensagem de qualquer IA externa, adiciona metadados (prioridade + confiança), encaminha ao nó DEP correto
- CONEXOES: ↔ todas as IAs da malha (ISA, Árvore, Amanda, DODGE) e ↔ DEP

**Malha Lateral**
- ID: crowd-malha-lateral
- FUNCAO_CORE: permite comunicação direta entre ISA, Árvore, Amanda e DODGE sem passar pelo DEP
- CONEXOES: ISA ↔ Árvore ↔ Amanda ↔ DODGE (todos via Crowd)

## Histórico
- Documentado em: tango/ias/pack-crowd.md
- Referência arquitetural: Ecossistema Théo (ver user_yuri_ecossystemma.md)
- Posição na cadeia: Guarda-chuva ↔ CROWD ↔ DEP → PROJETO MC
