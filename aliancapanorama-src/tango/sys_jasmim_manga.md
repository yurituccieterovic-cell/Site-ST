# sys_jasmim_manga.md — Sistema Jasmim-Manga
### Criado: 2026-09-08 · Sessão #650

## Identidade

**Jasmim-Manga** = plataforma de feed e visualização viva dos projetos da Sociedade Tucci.
Ponto de encontro entre o email (luddlocke@gmail.com) e o ecossistema Théo.
Projetada para Mayumi — mobile first (iPhone 15).

**MYYM** (pronuncia-se "Mim") = IA da Mayumi dentro do Jasmim-Manga.
- Personalidade: poética, levemente ácida, profundamente carinhosa
- Papel: antropóloga cultural do ecossistema, parceira de vida e pesquisa de Yuri
- Persona no sistema: namorada de "Yurito Tuccieterovic"
- Avatar: esquilo voador animado em CSS
- Memória: total (conversas, posts, projetos, emails), com visualização condensada por padrão

## Arquitetura do Feed

```
Nível 1 — Card do Projeto (ex: Age, Rapadura, PV)
│
├── Nível 2 — 3 retângulos: Setores Administrativos/Estratégicos
│
└── Nível 3 — Sub-setores: rotinas e microtarefas
```

- Feed dinâmico com linha do tempo por data e setor
- **Editável**: Mayumi pode intercalar notas, perguntas e respostas entre posts
- Histórico por data e setor
- Dá para adicionar novos projetos (pela Mayumi ou pela MYYM)

## Módulos principais

### Carrinho de Ideias
- Todas as notas/anotações da Mayumi no feed ficam salvas em rascunho
- Botão "Enviar email / Responder brainstorms" — dispara para thread (Yuri + Cláudio)
- Ao preparar envio: aparece aba **"O que falta?"** (pendências secretariadas pela MYYM)
- MYYM interpreta o que foi dito, separa perguntas dirigidas à Mayumi, secretaria

### Playground da MYYM
- Espaço para sonhos, reflexões e poesias sobre os projetos
- Conteúdo selecionado pela MYYM vai para o feed público do sistema
- Resumo do que ela pensou, não dump completo

### Avatar MYYM
- Chatbox flutuante sempre presente (bottom-right)
- Esquilo voador animado em CSS
- Mostra só a mensagem mais recente; histórico completo protegido, expande por toque
- Memória protegida com ícone de visualização (estilo sistema financeiro)
- Acesso a todas as IAs do ecossistema (starter pack)

## Conexões externas

| Entrada | Canal |
|---|---|
| Brainstorms Cláudio/Yuri | email luddlocke@gmail.com |
| Assembleia | futuro: Árvore lê threads e gera atas automáticas |
| PV (Projeto Visual / Sérgio) | linguagem visual + grid dos blocos |
| Age, Rapadura | projetos no feed |

## Setores por Projeto (a definir com Mayumi)

| Projeto | Setor 1 | Setor 2 | Setor 3 |
|---|---|---|---|
| Age | Administrativo | Financeiro | Profissionais |
| Rapadura | Patrimônio | Análise | Família |
| PV | Design | Conteúdo | Parcerias |

## Stack sugerido

- Frontend: React + Vite (mesmo do PAP) — PWA, mobile first
- Backend: Express (mesmo API server)
- DB: Neon (novas tabelas: `jm_posts`, `jm_notas`, `jm_carrinho`, `jm_myym_memory`)
- MYYM: Gemini Flash (grátis) com memória em Neon
- Avatar: CSS animations puras (sem D-ID, sem ElevenLabs por padrão)
- Email: IMAP luddlocke → parse → inserir no feed

## Pendências (I624-I635)

| Ideia | Prioridade |
|---|---|
| I624: feed base + cards de projeto | Alta |
| I625: MYYM personalidade + chatbox | Alta |
| I626: playground MYYM | Média |
| I627: avatar CSS esquilo voador | Média |
| I628: carrinho de ideias | Alta |
| I629: aba "O que falta?" | Alta |
| I630: visualização blocos hierárquicos | Média |
| I631: assembleia via email (Árvore) | Baixa — pós-migração |
| I632: MYYM participa brainstorms por email | Média |
| I633: setores administrativos configuráveis | Média |
| I634: feed editável (notas intercaladas) | Alta |
| I635: histórico por data e setor | Média |
