# MANUEL — Guia Completo do Rapadura
### Sistema de Inteligência Patrimonial · Yuri & Mayumi Eterovic
*Sessão 97 · 2026-08-11 · Criado por Cláudio Coach*

---

## 1. O que é o Rapadura

O **Rapadura** é um sistema privado de inteligência para tomada de decisão sobre investimentos. Não é um banco, não é uma corretora. É uma **câmara de deliberação** — um lugar onde os dados chegam brutos, o algoritmo os pondera, e a decisão permanece humana.

O nome vem de uma ideia simples: doce, artesanal, sem refinamento excessivo. Honesto como o material que representa.

**Três camadas:**
- **Dado** — o que existe (retorno histórico, custo, liquidez, credibilidade da fonte)
- **Cálculo** — o que o sistema infere (Score de Atratividade, Score de Confiança)
- **Decisão** — o que você e Mayumi decidem (registrar em Pertences, mudar posição, esperar)

A separação entre essas camadas é intencional. O Rapadura nunca decide por você. Ele organiza o campo para que a decisão seja mais consciente.

**Acesso:** `https://site-st.vercel.app/aliancapanorama/rapadura`

---

## 2. Como Acessar

### URL
```
https://site-st.vercel.app/aliancapanorama/rapadura
```

### Login
O Rapadura usa um chat com IA. Ao entrar, você verá uma conversa. Basta escrever seu nome.

Exemplo:
```
Você: Yuri
Sistema: Olá, Yuri! Qual é a sua senha?
Você: (sua senha)
Sistema: Bem-vindo ao Rapadura.
```

### Credenciais iniciais
| Membro | Senha inicial | Papel |
|--------|--------------|-------|
| Yuri | `rapadura@yuri2026` | Administrador |
| Mayumi | `rapadura@mayumi2026` | Administrador |
| André, Lisange, Gisele, Mauro, Beatriz, Clara, Bruno, Fred, Piti | `rapadura@membro2026` | Membro |

**Importante:** Troque sua senha assim que acessar pela primeira vez. No header, clique em "senha".

### Alterar senha
Após fazer login, no canto superior direito do header aparece o link "senha". Clique para abrir o modal de alteração. Você precisará informar a senha atual e a nova senha (mínimo 8 caracteres).

---

## 3. Oportunidades — Como Ler o Ranking

A aba **Oportunidades** exibe todos os fundos cadastrados, ordenados pelo Score de Atratividade (do maior para o menor).

### O que você vê em cada card

```
[95]  Nome do Fundo                          R$ 2.847/ano
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      ATRATIVIDADE ████████████████░░░░  82
      CONFIANÇA    ████████████░░░░░░░░  61
```

- **Número do rank** — posição no ranking (1 = mais atrativo)
- **Score de Atratividade** — 0 a 100, calculado automaticamente
- **Score de Confiança** — 0 a 100, mede quão completos estão os dados
- **Custo anual estimado** — taxa de administração × valor investido médio do grupo

### Cores dos scores
| Cor | Significado |
|----|-------------|
| Dourado | Score ≥ 70 — oportunidade forte |
| Âmbar | Score 45–69 — oportunidade moderada |
| Vermelho escuro | Score < 45 — cuidado |

### Expandir o card
Clique em qualquer card para ver o detalhamento das 6 dimensões do score.

### Administradores (Yuri/Mayumi)
Na aba Oportunidades, administradores veem botões de editar e excluir cada fundo. Para adicionar novos fundos, use a aba **Gerenciar**.

---

## 4. Pertences — Sua Carteira Pessoal

A aba **Pertences** é individual. Cada membro registra seus próprios investimentos — o que comprou, quando, e quanto.

### O que fica registrado
- Nome do fundo
- Valor investido (R$)
- Data de entrada
- Valor atual (para cálculo de rentabilidade)

### KPIs no topo
```
TOTAL INVESTIDO    TOTAL ATUAL    RESULTADO    RENTABILIDADE
R$ 50.000          R$ 53.200      +R$ 3.200    +6,4%
```

### Gráficos
- **Evolução patrimonial** — linha do tempo de seus investimentos
- **Distribuição** — pizza com proporção de cada fundo na carteira

### Adicionar / Editar / Excluir
Use o botão "+ Novo Pertence" para registrar. Clique no ícone de edição ou exclusão em cada item. Exclusões são suaves (soft delete) — os dados não somem, apenas ficam arquivados.

---

## 5. O Motor de Score — Explicação Didática

O Score de Atratividade usa **6 dimensões**, cada uma com um peso diferente:

### Dimensões e Pesos

| Dimensão | Peso | O que mede |
|----------|------|-----------|
| Retorno Ajustado | 30% | Retorno anualizado + bônus por Sharpe/Sortino acima da média |
| Drawdown | 25% | Queda máxima histórica — quanto menor, melhor |
| Consistência | 15% | Estabilidade dos retornos (desvio padrão) |
| Custo | 15% | Taxa de administração + performance — quanto menor, melhor |
| Liquidez | 10% | Prazo de resgate — D+0 pontua 100, D+90 pontua menos |
| Credibilidade | 5% | Qualidade da fonte dos dados (CVM/B3 = máximo) |

### Como o score é calculado

Cada dimensão é normalizada para 0–100 e multiplicada pelo peso. A soma é o Score de Atratividade.

Exemplo simplificado:
```
Retorno Ajustado:  80 × 0,30 = 24,0
Drawdown:          70 × 0,25 = 17,5
Consistência:      60 × 0,15 =  9,0
Custo:             90 × 0,15 = 13,5
Liquidez:         100 × 0,10 = 10,0
Credibilidade:    100 × 0,05 =  5,0
                           ─────────
Score Total:                   79,0
```

### Score de Confiança
Mede a completude dos dados. Se todos os 7 campos estiverem preenchidos, a confiança é 100%. Campos em branco reduzem a confiança. Um fundo com score 90 mas confiança 30% deve ser tratado com cautela.

---

## 6. Segurança — O que Fica Registrado

O Rapadura mantém um **audit log** de todas as ações sensíveis:

- Login / logout
- Criação, edição e exclusão de fundos e pertences
- Tentativas de mudança de senha (sucesso e falha)
- Acessos admin

Os logs incluem: usuário, ação, timestamp, IP de origem.

**O que isso garante:**
- Nunca há dúvida sobre quem fez o quê
- Se algo mudar sem autorização, há rastro
- A separação de papéis (admin × membro) impede que membros alterem fundos

**Senhas:** armazenadas com bcrypt 12 rounds — nunca em texto puro, nem nos logs.

**Sessão:** independente do sistema PAP — seu login no Rapadura não interfere com outras partes da plataforma.

---

## 7. Guia para Mayumi — Passo a Passo

Este é o guia mais simples, para quem está usando o Rapadura pela primeira vez.

### Passo 1 — Entrar
Abra o navegador e acesse:
```
https://site-st.vercel.app/aliancapanorama/rapadura
```

### Passo 2 — Conversar com a IA
A tela mostra um chat. Escreva seu nome: **Mayumi**. Depois, quando a IA pedir a senha, escreva a senha que você recebeu. Simples assim.

### Passo 3 — Ver as Oportunidades
Você estará na aba "Oportunidades". Aqui estão todos os fundos que Yuri e você podem investir. O número no canto de cada card é a nota do fundo (0 a 100). Quanto maior, mais atrativo.

### Passo 4 — Clicar para saber mais
Clique em qualquer fundo para ver os detalhes: retorno, segurança, custo, liquidez. Cada barra horizontal é uma dimensão diferente.

### Passo 5 — Registrar seus investimentos
Clique na aba "Pertences". Aqui você registra o que você tem investido. Clique em "+ Novo Pertence", escolha o fundo, coloque o valor e a data. Pronto.

### Passo 6 — Trocar a senha
No canto superior direito, clique em "senha". Coloque a senha atual, depois sua nova senha. Escolha algo que só você saiba.

### Passo 7 — Sair
Clique em "sair" no canto superior direito.

---

## 8. Futuro do Sistema

O Rapadura está na versão 1. O que vem a seguir:

### Aprovações conjuntas (I411)
Para decisões acima de um certo valor, o sistema pedirá aprovação de Yuri **e** Mayumi. Nenhum dos dois poderá agir sozinho em movimentos grandes.

### Painel de aprovações
Interface visual para ver movimentos pendentes de aprovação, histórico de decisões conjuntas.

### Importar CSV da XP
Upload direto do extrato da XP Investimentos para popular o Pertences automaticamente.

### Simulador de resgate
Calcular o impacto de resgatar um fundo: imposto de renda, IOF, perda de posição no ranking.

### Exportar PDF
Relatório completo da carteira para guardar ou compartilhar com consultor.

### Sessão conjunta
Yuri e Mayumi conectados ao mesmo tempo, com cursor compartilhado, para decisões em tempo real.

### Página /rapadura/manuel
Versão interativa deste guia dentro da plataforma, com exemplos animados.

---

## 9. Glossário

**Alfa (α):** Retorno acima do benchmark (CDI ou Ibovespa). Alfa positivo = o gestor entregou mais do que o mercado sozinho.

**Benchmark:** Referência de comparação. No Brasil, fundos de renda fixa usam o CDI; fundos de ações usam o Ibovespa.

**CDI (Certificado de Depósito Interbancário):** Taxa básica do mercado financeiro entre bancos. Referência principal para renda fixa.

**Consistência:** Regularidade dos retornos. Um fundo que entrega 10% todos os anos é mais consistente (e menos arriscado) do que um que entrega -5% e +25% alternados.

**Confiança (Score):** No Rapadura, mede quão completos estão os dados de um fundo. 100% = todos os campos preenchidos.

**Custo total:** Taxa de administração + taxa de performance. Pago anualmente, proporcional ao valor investido.

**D+0, D+1, D+30, D+90:** Prazo de liquidez. D+0 = você resgata e recebe hoje. D+90 = você espera 90 dias. Quanto maior o D, menor a liquidez.

**Drawdown:** Maior queda acumulada desde um pico histórico. Um drawdown de -30% significa que o fundo chegou a valer 30% menos do que seu topo anterior.

**High-Water Mark:** O maior valor histórico que o fundo já atingiu. A taxa de performance só é cobrada quando o fundo supera esse valor.

**Liquidez:** Facilidade e velocidade de transformar o investimento em dinheiro.

**Retorno anualizado:** Retorno ajustado para um período de 12 meses, independente de quanto tempo você mediu.

**Score de Atratividade:** Nota de 0 a 100 calculada automaticamente pelo Rapadura com base em 6 dimensões. Resume a qualidade de um fundo em um número.

**Sharpe:** Relação entre o retorno excedente (acima do CDI) e o risco assumido (volatilidade). Sharpe > 1 = bom. Sharpe > 2 = excelente.

**Softdelete:** Exclusão suave. O dado não some — fica arquivado e pode ser recuperado.

**Sortino:** Versão do Sharpe que penaliza apenas a volatilidade negativa. Mais preciso para avaliar o risco real de perda.

**Taxa de administração:** Percentual anual cobrado pela gestora pelo serviço de gerir o fundo. Descontado diretamente da cota.

**Taxa de performance:** Cobrada quando o fundo supera seu benchmark. Geralmente 20% do que exceder o CDI.

**Volatilidade:** Variação dos retornos ao longo do tempo. Alta volatilidade = mais oscilação, mais risco.

---

*Com amor — para Mayumi, de Yuri.*

---

*Cláudio Coach · Sessão 97 · 2026-08-11*
*`tango/MANUEL.md` — documento permanente, atualizar a cada nova versão do Rapadura*
