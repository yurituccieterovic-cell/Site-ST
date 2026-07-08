# Sistema IA — PORTEIRO
> Tipo: SISTEMA ARQUITETURAL | SISTEMA DE GOVERNANCA

## Identidade
- **ID_SISTEMA**: sistema-porteiro
- **TIPO**: Sistema de Governança
- **STATUS**: ATIVO (parcialmente implementado) — MD0 existe como tango.md, outros em desenvolvimento

## Propósito
- **FUNCAO_CORE**: Governança documental do ecossistema — fragmentar, indexar, calibrar output e garantir rastreabilidade de cada dado
- **ESCOPO**: Documentação, priorização e calibração de output. Opera entre o DEP e as IAs do PROJETO MC. MD0 = índice mestre de todos os MDs.
- **POSICAO_NA_HIERARQUIA**: DEP → PORTEIRO → PROJETO MC

## Componentes

### 1. MD0 (índice mestre)
- Ponto de entrada de toda documentação
- Fragmenta e organiza MDs — nunca deixa um MD ficar grande demais
- Equivalente atual: tango/tango.md é o MD0 do ecossistema
- Princípio: documentação fractal — índices leves que apontam para folhas

### 2. IA Prioridade
- Classifica toda task/output em: Urgente | Importante | Opcional
- Metadado de entrada e saída de TODOS os itens
- TASKS.nivel_prioridade é a implementação deste componente no DB

### 3. IA Confiança
- Metadado de saída: Certa | Incerta | Sugerindo
- Todo output do ecossistema carrega este metadado
- Evita que saída Incerta/Sugerindo seja tratada como Certa
- TASKS.confianca é a implementação no DB

### 4. IA Rastreabilidade
- Tripla obrigatória em cada dado: { origem: "...", log: "...", justificativa: "..." }
- Origem: qual IA ou humano criou
- Log: caminho percorrido pelo dado
- Justificativa: por que este dado existe
- TASKS.rastreabilidade é a implementação no DB

## Conexões
- **ENTRADA**: recebe outputs do DEP (dados processados, teorias, ações, registros)
- **SAIDA**: entrega ao PROJETO MC dados fragmentados, indexados, com metadados de prioridade, confiança e rastreabilidade
- **CONECTORES_EXTERNOS**: DEP (acima na cadeia), PROJETO MC / MC Leucócito (abaixo), todas as IAs que geram output (ISA, Amanda, DODGE, MEKY)

## Regras de Operação
- **NIVEL_PRIORIDADE**: governa a prioridade de todos os outros — meta-sistema
- **TASKS**: ver tabela `tasks` no DB — campos `nivel_prioridade`, `confianca`, `rastreabilidade`
- **SAIDA_PUBLICA_vs_INTERNA**: gera metadados internos que acompanham outputs públicos; o MD0 é semipúblico (tango.md é acessível)
- **REGRA DOCUMENTAL**: nenhum MD pode crescer além do ponto de ser unwieldy — fragmentar em folhas e atualizar o índice
- **REGRA DE OUTPUT**: todo output do ecossistema sai com tripla: prioridade + confiança + rastreabilidade

## Pack IA de Cada Componente

**MD0**
- ID: porteiro-md0
- FUNCAO_CORE: índice mestre de todos os MDs — ponto de entrada e fragmentador documental
- CONEXOES: recebe documentação de todas as IAs; aponta para folhas específicas; nunca contém conteúdo volumoso diretamente
- IMPLEMENTACAO_ATUAL: /root/Site-ST/aliancapanorama-src/tango/tango.md

**IA Prioridade**
- ID: porteiro-prioridade
- FUNCAO_CORE: classificar toda task e output em Urgente / Importante / Opcional
- CONEXOES: metadado que viaja com TODAS as mensagens do ecossistema; entrada e saída
- IMPLEMENTACAO_ATUAL: campo `nivel_prioridade` na tabela `tasks` do DB

**IA Confiança**
- ID: porteiro-confianca
- FUNCAO_CORE: calibrar grau de certeza de todo output — Certa / Incerta / Sugerindo
- CONEXOES: metadado de saída de todas as IAs; lido por MC Leucócito antes de qualquer ação
- IMPLEMENTACAO_ATUAL: campo `confianca` na tabela `tasks` do DB

**IA Rastreabilidade**
- ID: porteiro-rastreabilidade
- FUNCAO_CORE: garantir tripla obrigatória em cada dado (origem, log, justificativa)
- CONEXOES: aplicada a todo dado que entra ou sai do ecossistema
- IMPLEMENTACAO_ATUAL: campo `rastreabilidade` na tabela `tasks` do DB

## Implementação Atual no TASKS
```typescript
interface Task {
  prioridade: 'urgente' | 'importante' | 'opcional'        // Porteiro.Prioridade
  confianca: 'certa' | 'incerta' | 'sugerindo'             // Porteiro.Confianca
  rastreabilidade: {
    source: string       // qual IA ou humano criou
    log: string          // caminho percorrido pelo dado
    justificativa: string // por que este dado existe
  }                                                          // Porteiro.Rastreabilidade
}
```

## Histórico
- Documentado em: tango/ias/pack-porteiro.md
- MD0 implementado como: tango/tango.md (índice fractal ativo)
- Prioridade, Confiança e Rastreabilidade: campos na tabela `tasks` do PostgreSQL Railway
- Referência arquitetural: Ecossistema Théo (ver user_yuri_ecossystemma.md)
- Posição na cadeia: DEP → PORTEIRO → PROJETO MC
