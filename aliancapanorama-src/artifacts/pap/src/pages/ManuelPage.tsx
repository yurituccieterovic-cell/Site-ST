import { useState, useEffect } from "react";

const BASE = import.meta.env.BASE_URL ?? "/aliancapanorama/";
const LOGO = `${BASE}rapadura-icon.png`;

const CHAPTERS = [
  { id: "o-que-e",        label: "1. O que é o Rapadura" },
  { id: "como-acessar",   label: "2. Como Acessar" },
  { id: "oportunidades",  label: "3. Oportunidades" },
  { id: "pertences",      label: "4. Pertences" },
  { id: "analisar",       label: "5. Analisar" },
  { id: "cana",           label: "6. IA Cana" },
  { id: "gerenciar",      label: "7. Gerenciar" },
  { id: "mayumi",         label: "8. Para Mayumi" },
  { id: "berenice",       label: "9. Para Berenice" },
  { id: "futuro",         label: "10. Futuro" },
  { id: "glossario",      label: "11. Glossário" },
];

function NavSidebar({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  return (
    <nav className="flex flex-col gap-1 min-w-[220px]">
      {CHAPTERS.map(ch => (
        <button
          key={ch.id}
          onClick={() => onChange(ch.id)}
          className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            active === ch.id
              ? "bg-amber-700/30 text-amber-300 border border-amber-700/50"
              : "text-gray-400 hover:text-amber-200 hover:bg-white/5"
          }`}
        >
          {ch.label}
        </button>
      ))}
      <div className="mt-4 border-t border-white/10 pt-4">
        <a
          href="/rapadura"
          className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500 hover:text-amber-300 transition-colors rounded-lg hover:bg-white/5"
        >
          ← Abrir o Rapadura
        </a>
      </div>
    </nav>
  );
}

function Table({ rows }: { rows: string[][] }) {
  const [head, ...body] = rows;
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-amber-700/40">
            {head.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-amber-400 font-semibold text-xs uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-gray-300 text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-black/60 border border-white/10 rounded-lg p-4 text-sm text-amber-200 font-mono overflow-x-auto my-3 whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

function ScoreColor({ label, desc, color }: { label: string; desc: string; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-16 h-7 rounded flex items-center justify-center text-xs font-bold text-white shadow ${color}`}>
        {label}
      </div>
      <span className="text-gray-300 text-sm">{desc}</span>
    </div>
  );
}

type StepProps = { n: string; title: string; children: React.ReactNode };
function Step({ n, title, children }: StepProps) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-900/60 border border-amber-700/50 text-amber-300 flex items-center justify-center text-sm font-bold">
        {n}
      </div>
      <div>
        <div className="text-white font-semibold text-sm mb-1">{title}</div>
        <div className="text-gray-400 text-sm">{children}</div>
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon: string; children: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
      <span>{icon}</span> {children}
    </div>
  );
}

// ─── Chapters ────────────────────────────────────────────────────────────────

function ChOQueE() {
  return (
    <div>
      <p className="text-gray-300 leading-relaxed mb-4">
        O <span className="text-amber-300 font-semibold">Rapadura</span> é um sistema privado de inteligência para tomada de decisão sobre investimentos.
        Não é um banco, não é uma corretora. É uma <strong className="text-white">câmara de deliberação</strong> — um lugar onde os dados chegam brutos,
        o algoritmo os pondera, e a decisão permanece humana.
      </p>
      <p className="text-gray-500 text-sm italic mb-6">
        O nome vem de uma ideia simples: doce, artesanal, sem refinamento excessivo. Honesto como o material que representa.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Dado", icon: "📊", desc: "O que existe — retorno histórico, custo, liquidez, credibilidade da fonte" },
          { label: "Cálculo", icon: "🧮", desc: "O que o sistema infere — Score de Atratividade, Score de Confiança" },
          { label: "Decisão", icon: "🎯", desc: "O que você e Mayumi decidem — registrar, mudar posição, esperar" },
        ].map(layer => (
          <div key={layer.label} className="bg-black/40 border border-white/10 rounded-xl p-4">
            <div className="text-2xl mb-2">{layer.icon}</div>
            <div className="text-amber-300 font-semibold text-sm mb-1">{layer.label}</div>
            <div className="text-gray-400 text-xs leading-relaxed">{layer.desc}</div>
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-sm">
        A separação entre essas camadas é intencional. O Rapadura nunca decide por você. Ele organiza o campo para que a decisão seja mais consciente.
      </p>
      <div className="mt-4 bg-amber-900/20 border border-amber-700/30 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="text-amber-400">🔗</span>
        <span className="text-amber-200 text-sm font-mono">sociedadetucci.com.br/rapadura</span>
      </div>
    </div>
  );
}

function ChComoAcessar() {
  return (
    <div>
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg px-4 py-3 mb-6">
        <div className="text-gray-400 text-xs mb-1">URL</div>
        <div className="text-amber-200 text-sm font-mono">sociedadetucci.com.br/rapadura</div>
      </div>

      <h3 className="text-white font-semibold mb-3">Login</h3>
      <p className="text-gray-400 text-sm mb-3">Ao entrar, você verá uma conversa com a IA. Basta escrever seu nome.</p>
      <Code>{`Você: Mayumi
Sistema: Mayumi. Por favor, insira sua senha abaixo.
[campo de senha aparece]`}</Code>

      <h3 className="text-white font-semibold mt-6 mb-3">Credenciais iniciais</h3>
      <Table rows={[
        ["Membro", "Senha inicial", "Papel"],
        ["Yuri", "rapadura@yuri2026", "Administrador"],
        ["Mayumi", "rapadura@mayumi2026", "Administrador"],
        ["Demais membros", "rapadura@membro2026", "Membro"],
      ]} />

      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg px-4 py-3 mt-4 flex items-start gap-3">
        <span className="text-blue-400 mt-0.5">ℹ</span>
        <span className="text-gray-300 text-sm">Troque sua senha ao acessar pela primeira vez. No header, clique em "senha".</span>
      </div>
    </div>
  );
}

function ChOportunidades() {
  return (
    <div>
      <p className="text-gray-300 text-sm mb-4">
        A aba <span className="text-amber-300 font-semibold">Oportunidades</span> exibe todos os fundos cadastrados, ordenados pelo Score de Atratividade.
        O sistema hoje conta com <strong className="text-white">9 fundos</strong> — incluindo os 6 da carteira real de Yuri na XP.
      </p>

      <h3 className="text-white font-semibold mt-5 mb-3">O que você vê em cada card</h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: "⭐", label: "Score de Atratividade", desc: "0–100, calculado automaticamente" },
          { icon: "🔍", label: "Score de Confiança", desc: "Quão completos estão os dados" },
          { icon: "⏱", label: "Prazo de resgate", desc: "D+0, D+1, D+31…" },
          { icon: "🌿", label: "Fator Verde", desc: "Responsabilidade ambiental (quando presente)" },
        ].map(item => (
          <div key={item.label} className="bg-black/30 border border-white/10 rounded-lg p-3">
            <div className="text-lg mb-1">{item.icon}</div>
            <div className="text-amber-200 text-xs font-semibold mb-0.5">{item.label}</div>
            <div className="text-gray-500 text-xs">{item.desc}</div>
          </div>
        ))}
      </div>

      <h3 className="text-white font-semibold mb-3">Cores dos scores</h3>
      <div className="bg-black/30 border border-white/10 rounded-lg p-4 mb-5">
        <ScoreColor label="70+" desc="Score ≥ 70 — oportunidade forte" color="bg-amber-700" />
        <ScoreColor label="45–69" desc="Score 45–69 — oportunidade moderada" color="bg-yellow-700" />
        <ScoreColor label="< 45" desc="Score < 45 — atenção" color="bg-red-900" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-300">
        <span className="text-amber-300">💡 Dica:</span> Clique em qualquer card para ver o detalhamento das 7 dimensões do score.
      </div>
    </div>
  );
}

function ChPertences() {
  return (
    <div>
      <p className="text-gray-300 text-sm mb-4">
        A aba <span className="text-amber-300 font-semibold">Pertences</span> é individual. Cada membro registra seus próprios investimentos.
      </p>

      <h3 className="text-white font-semibold mb-3">Dashboard no topo</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total investido", value: "R$ 2.276,75", color: "text-gray-300" },
          { label: "Valor atual", value: "R$ 2.585,20", color: "text-white" },
          { label: "Resultado", value: "+R$ 308,45", color: "text-green-400" },
          { label: "Rentabilidade", value: "+13,55%", color: "text-amber-300" },
        ].map(item => (
          <div key={item.label} className="bg-black/40 border border-white/10 rounded-xl p-3 text-center">
            <div className="text-gray-500 text-xs mb-1">{item.label}</div>
            <div className={`font-bold text-sm ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <h3 className="text-white font-semibold mb-3">Gráficos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className="bg-black/30 border border-white/10 rounded-lg p-3">
          <div className="text-amber-200 text-xs font-semibold mb-1">📈 Patrimônio acumulado</div>
          <div className="text-gray-500 text-xs">Evolução do total investido ao longo do tempo</div>
        </div>
        <div className="bg-black/30 border border-white/10 rounded-lg p-3">
          <div className="text-amber-200 text-xs font-semibold mb-1">🥧 Alocação por classe</div>
          <div className="text-gray-500 text-xs">Gráfico de pizza por tipo de fundo</div>
        </div>
      </div>

      <h3 className="text-white font-semibold mb-3">Ações</h3>
      <div className="space-y-3">
        {[
          { label: "+ Compra", desc: "Registrar uma posição. Selecione o fundo, data e valor investido." },
          { label: "Investir +", desc: "Simula como distribuir um valor novo. Sugere alocação automática pelos scores, respeitando o valor mínimo." },
          { label: "Colher →", desc: "Simula um resgate parcial. Sugere quais posições resgatar primeiro (menor score), preservando raiz mínima (10%)." },
        ].map(action => (
          <div key={action.label} className="flex gap-3 items-start bg-black/20 border border-white/8 rounded-lg p-3">
            <span className="bg-amber-700/30 border border-amber-700/50 text-amber-300 text-xs font-bold px-2 py-1 rounded font-mono whitespace-nowrap">{action.label}</span>
            <span className="text-gray-400 text-sm">{action.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChAnalisar() {
  return (
    <div>
      <p className="text-gray-300 text-sm mb-4">
        A aba <span className="text-amber-300 font-semibold">Analisar</span> cruza o que você tem com o que o sistema oferece.
      </p>

      <h3 className="text-white font-semibold mb-3">Score médio da carteira</h3>
      <p className="text-gray-400 text-sm mb-5">
        O número principal: a nota média dos seus fundos. Quanto maior, melhor posicionada está sua carteira.
      </p>

      <h3 className="text-white font-semibold mb-3">Sugestões de Troca</h3>
      <p className="text-gray-400 text-sm mb-3">
        O sistema identifica fundos em carteira com score baixo e sugere alternativas de maior qualidade:
      </p>
      <div className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-xs text-gray-300 mb-5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-red-400 font-semibold">← Fundo atual</div>
            <div className="text-gray-500">Score 35 · valor investido</div>
          </div>
          <div className="text-gray-600">→</div>
          <div className="flex-1">
            <div className="text-green-400 font-semibold">Alternativa →</div>
            <div className="text-gray-500">Score 44 · +9 pts · MODERADO</div>
          </div>
        </div>
      </div>

      <h3 className="text-white font-semibold mb-3">Oportunidades não exploradas</h3>
      <p className="text-gray-400 text-sm">
        Fundos disponíveis com score acima do seu score médio + 15 pontos — que você ainda não tem na carteira.
      </p>
    </div>
  );
}

function ChCana() {
  return (
    <div>
      <p className="text-gray-300 text-sm mb-4">
        A aba <span className="text-amber-300 font-semibold">Cana ✦</span> (visível apenas para Yuri e Mayumi) é onde o sistema aprende com você.
      </p>
      <p className="text-gray-400 text-sm mb-4">
        Em vez de preencher formulários, você escreve em linguagem natural:
      </p>
      <Code>{`"Adicione o Fundo 24 Horas FIRF RL — mínimo R$100, retorno
14,27% em 12 meses, resgate D+0, renda fixa."`}</Code>
      <p className="text-gray-400 text-sm mb-5">
        A Cana lê, extrai as informações e cadastra automaticamente.
      </p>

      <h3 className="text-white font-semibold mb-3">O que a Cana consegue fazer</h3>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          { icon: "➕", label: "Adicionar fundos", desc: "A partir de textos do app XP, da B3, de qualquer fonte" },
          { icon: "✏️", label: "Editar fundos", desc: "\"Atualize o Kinea: o retorno agora é 14,1%\"" },
          { icon: "🗑️", label: "Remover fundos", desc: "\"Tira o Tavola das oportunidades por enquanto\"" },
          { icon: "💬", label: "Responder perguntas", desc: "Sobre os fundos cadastrados" },
        ].map(item => (
          <div key={item.label} className="bg-black/30 border border-white/10 rounded-lg p-3">
            <div className="text-lg mb-1">{item.icon}</div>
            <div className="text-amber-200 text-xs font-semibold mb-0.5">{item.label}</div>
            <div className="text-gray-500 text-xs">{item.desc}</div>
          </div>
        ))}
      </div>

      <h3 className="text-white font-semibold mb-3">Como usar</h3>
      <Step n="1" title="Abra a aba Cana ✦">Disponível somente para administradores (Yuri e Mayumi).</Step>
      <Step n="2" title="Escreva o que quiser">Pode ser um texto colado do app da XP, uma instrução, uma pergunta.</Step>
      <Step n="3" title="Pressione Enter">Shift+Enter para nova linha sem enviar.</Step>
      <Step n="4" title="A Cana responde">E executa a operação automaticamente.</Step>
    </div>
  );
}

function ChGerenciar() {
  return (
    <div>
      <p className="text-gray-300 text-sm mb-4">
        A aba <span className="text-amber-300 font-semibold">Gerenciar</span> permite cadastrar, editar e excluir fundos manualmente — com todos os campos disponíveis.
      </p>
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 text-sm text-gray-300">
        <span className="text-amber-300 font-semibold">💡 Recomendação:</span> A forma mais prática de adicionar fundos hoje é pela{" "}
        <span className="text-amber-300">Cana ✦</span>. O formulário manual fica como alternativa para edições precisas com todos os campos de pontuação.
      </div>
    </div>
  );
}

function ChMayumi() {
  return (
    <div>
      <p className="text-gray-400 text-sm mb-5">Se é a primeira vez que você acessa o Rapadura:</p>
      <Step n="1" title="Entrar">
        <span className="font-mono text-amber-200">sociedadetucci.com.br/rapadura</span>
      </Step>
      <Step n="2" title="Fazer login">
        Escreva <strong className="text-white">Mayumi</strong>. Quando pedir senha: <span className="font-mono text-amber-200">rapadura@mayumi2026</span>
      </Step>
      <Step n="3" title="Ver as Oportunidades">
        Os fundos ordenados por nota. O número no canto de cada card é a nota (0–100).
      </Step>
      <Step n="4" title="Ver a carteira de Yuri">
        Clique em <strong className="text-white">Pertences</strong>. São os 6 fundos de Yuri e o resultado atual.
      </Step>
      <Step n="5" title="Ver a análise">
        Clique em <strong className="text-white">Analisar</strong>. O sistema cruza a carteira com as oportunidades e sugere trocas.
      </Step>
      <Step n="6" title="Registrar seus investimentos">
        Se você também tem investimentos, clique em <strong className="text-white">+ Compra</strong>, escolha o fundo e coloque o valor.
      </Step>
      <Step n="7" title="Trocar a senha">
        No canto superior direito, clique em <strong className="text-white">"senha"</strong>. Escolha algo que só você saiba.
      </Step>
      <div className="mt-6 text-center text-gray-500 text-xs italic">Com amor — para Mayumi, de Yuri.</div>
    </div>
  );
}

function ChBerenice() {
  return (
    <div>
      <p className="text-gray-400 text-sm mb-5">
        O Rapadura é um sistema privado de investimentos da família Tucci. Como membro, você pode consultar os fundos disponíveis e acompanhar seus próprios investimentos.
      </p>
      <Step n="1" title="Entrar">
        <span className="font-mono text-amber-200">sociedadetucci.com.br/rapadura</span>
      </Step>
      <Step n="2" title="Fazer login">
        Escreva <strong className="text-white">Beatriz</strong>. Quando pedir senha:{" "}
        <span className="font-mono text-amber-200">rapadura@membro2026</span>
      </Step>
      <Step n="3" title="Trocar a senha">
        No canto superior, clique em <strong className="text-white">"senha"</strong>. Escolha algo que só você saiba.
      </Step>
      <Step n="4" title="Ver as Oportunidades">
        Fundos ordenados por nota (Score de Atratividade). Clique em qualquer card para entender cada dimensão.
      </Step>
      <Step n="5" title="Registrar investimentos">
        Se você tem investimentos para acompanhar: clique em <strong className="text-white">Pertences</strong> → <strong className="text-white">"+ Compra"</strong> → escolha o fundo, data e valor.
      </Step>
      <Step n="6" title="Analisar sua carteira">
        Clique em <strong className="text-white">Analisar</strong> para cruzar seus fundos com as oportunidades do sistema.
      </Step>
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 text-sm text-gray-300 mt-4">
        <span className="text-amber-300 font-semibold">ℹ️ Acesso de membro:</span>{" "}
        As abas <strong className="text-white">Cana ✦</strong> e <strong className="text-white">Gerenciar</strong> são exclusivas de Yuri e Mayumi.
      </div>
    </div>
  );
}

function ChFuturo() {
  const items = [
    { id: "I411", label: "Aprovações conjuntas", desc: "Para movimentos acima de R$500, o sistema pedirá aprovação de Yuri e Mayumi.", status: "⏳" },
    { id: "I438", label: "Histórico de motivos", desc: "Toda operação acima de R$1.000 vai exigir um campo 'Por que estou fazendo isso?'.", status: "⏳" },
    { id: "",     label: "Importar dados da XP", desc: "Upload direto do extrato para popular o Pertences automaticamente.", status: "⏳" },
    { id: "",     label: "Relatório PDF", desc: "Exportar a carteira completa em PDF.", status: "⏳" },
    { id: "",     label: "Sessão conjunta", desc: "Yuri e Mayumi conectados ao mesmo tempo para decisões em tempo real.", status: "⏳" },
  ];
  return (
    <div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 items-start bg-black/30 border border-white/10 rounded-lg p-4">
            <span className="text-lg">{item.status}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">{item.label}</span>
                {item.id && <Badge color="bg-gray-800 text-gray-400 border border-white/10">{item.id}</Badge>}
              </div>
              <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChGlossario() {
  const terms = [
    { term: "Alfa (α)", def: "Retorno acima do benchmark. Alfa positivo = o gestor entregou mais do que o mercado sozinho." },
    { term: "Benchmark", def: "Referência de comparação. Renda fixa → CDI. Ações → Ibovespa." },
    { term: "Calmar Ratio", def: "Retorno dividido pelo maior drawdown. Mede eficiência sob risco real." },
    { term: "CDI", def: "Taxa básica do mercado financeiro. Referência principal para renda fixa." },
    { term: "Consistência", def: "Regularidade dos retornos ao longo do tempo." },
    { term: "D+0, D+1, D+31, D+45", def: "Prazo de liquidez. D+0 = você resgata hoje. Quanto maior o D, menos líquido." },
    { term: "Drawdown", def: "Maior queda acumulada desde um pico histórico." },
    { term: "Fator Verde", def: "Nota de responsabilidade ambiental (0–100). Multiplicado pela Confiança Verde para evitar greenwashing." },
    { term: "High-Water Mark", def: "O maior valor histórico do fundo. A taxa de performance só é cobrada acima desse valor." },
    { term: "Score de Atratividade", def: "Nota 0–100 com base em 7 dimensões: retorno ajustado ao risco, controle de queda, consistência, custo, liquidez, confiança da fonte, fator verde." },
    { term: "Score de Confiança", def: "Quão completos estão os dados de um fundo. 100 = todos os campos preenchidos." },
    { term: "Sharpe", def: "Retorno excedente dividido pela volatilidade. Sharpe > 1 = bom. > 2 = excelente." },
    { term: "Sortino", def: "Versão do Sharpe que penaliza só a volatilidade negativa." },
    { term: "Taxa de administração", def: "Percentual anual cobrado pela gestora. Descontado diretamente da cota." },
    { term: "Volatilidade", def: "Variação dos retornos ao longo do tempo." },
  ];
  return (
    <div className="divide-y divide-white/5">
      {terms.map(({ term, def }) => (
        <div key={term} className="py-3">
          <dt className="text-amber-300 font-semibold text-sm mb-0.5">{term}</dt>
          <dd className="text-gray-400 text-sm">{def}</dd>
        </div>
      ))}
    </div>
  );
}

const CHAPTER_CONTENT: Record<string, React.ReactNode> = {
  "o-que-e":       <ChOQueE />,
  "como-acessar":  <ChComoAcessar />,
  "oportunidades": <ChOportunidades />,
  "pertences":     <ChPertences />,
  "analisar":      <ChAnalisar />,
  "cana":          <ChCana />,
  "gerenciar":     <ChGerenciar />,
  "mayumi":        <ChMayumi />,
  "berenice":      <ChBerenice />,
  "futuro":        <ChFuturo />,
  "glossario":     <ChGlossario />,
};

export function ManuelPage() {
  const [active, setActive] = useState("o-que-e");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Manuel · Rapadura";

    // favicon
    let favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!favicon) { favicon = document.createElement("link"); favicon.rel = "icon"; document.head.appendChild(favicon); }
    favicon.type = "image/png";
    favicon.href = `${BASE}rapadura-favicon.png`;

    // manifest
    let manifest = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    if (!manifest) { manifest = document.createElement("link"); manifest.rel = "manifest"; document.head.appendChild(manifest); }
    manifest.href = `${BASE}rapadura-manifest.json`;

    // apple-touch-icon
    let apple = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!apple) { apple = document.createElement("link"); apple.rel = "apple-touch-icon"; document.head.appendChild(apple); }
    apple.href = `${BASE}rapadura-icon-512.png`;

    // meta iOS
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name='${name}']`);
      if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("apple-mobile-web-app-title", "Rapadura");
    setMeta("apple-mobile-web-app-capable", "yes");
    setMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
    setMeta("theme-color", "#c8963b");
  }, []);

  const chapter = CHAPTERS.find(c => c.id === active);

  return (
    <div className="min-h-screen bg-[#0e0a06] text-white font-sans">
      {/* Header */}
      <header className="bg-[#120d07] border-b border-amber-900/30 px-4 md:px-8 py-3 flex items-center gap-3 sticky top-0 z-40">
        <img src={LOGO} alt="Rapadura" className="w-7 h-7 rounded object-contain" />
        <div>
          <div className="text-amber-300 font-bold text-sm leading-tight">Manuel</div>
          <div className="text-gray-500 text-xs">Guia do Rapadura · v4</div>
        </div>
        <div className="flex-1" />
        <a href="/rapadura" className="text-xs text-gray-500 hover:text-amber-300 transition-colors hidden md:block">
          Abrir o Rapadura →
        </a>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden p-2 text-gray-400 hover:text-amber-300 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70" onClick={() => setMenuOpen(false)}>
          <div className="bg-[#120d07] border-r border-amber-900/30 w-72 min-h-full p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-amber-300 font-bold text-sm">Capítulos</div>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-amber-300">✕</button>
            </div>
            <NavSidebar active={active} onChange={id => { setActive(id); setMenuOpen(false); }} />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-5xl mx-auto flex gap-0 md:gap-8 px-4 md:px-8 py-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0 sticky top-20 self-start">
          <NavSidebar active={active} onChange={setActive} />
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
            <span>Manuel</span>
            <span>›</span>
            <span className="text-amber-400">{chapter?.label}</span>
          </div>
          <h1 className="text-2xl font-bold text-amber-200 mb-6">{chapter?.label}</h1>

          <div className="bg-[#120d07] border border-amber-900/20 rounded-2xl p-5 md:p-7">
            {CHAPTER_CONTENT[active]}
          </div>

          {/* Prev/Next */}
          <div className="flex justify-between mt-6">
            {CHAPTERS.findIndex(c => c.id === active) > 0 ? (
              <button
                onClick={() => setActive(CHAPTERS[CHAPTERS.findIndex(c => c.id === active) - 1].id)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-amber-300 transition-colors"
              >
                ← {CHAPTERS[CHAPTERS.findIndex(c => c.id === active) - 1].label}
              </button>
            ) : <div />}
            {CHAPTERS.findIndex(c => c.id === active) < CHAPTERS.length - 1 ? (
              <button
                onClick={() => setActive(CHAPTERS[CHAPTERS.findIndex(c => c.id === active) + 1].id)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-amber-300 transition-colors"
              >
                {CHAPTERS[CHAPTERS.findIndex(c => c.id === active) + 1].label} →
              </button>
            ) : <div />}
          </div>

          <div className="mt-10 text-center text-gray-700 text-xs">
            Rapadura · Sistema de Inteligência Patrimonial · Sociedade Tucci<br />
            v3 · Sessão 101 · 2026-08-13 · Cláudio Coach
          </div>
        </main>
      </div>
    </div>
  );
}
