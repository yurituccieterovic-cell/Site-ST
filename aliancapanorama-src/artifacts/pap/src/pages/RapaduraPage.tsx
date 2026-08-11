import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const API = import.meta.env.VITE_API_URL ?? "";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type RapaduraUser = { id: number; nome: string; role: string };
type Fundo = {
  id: number; nome: string; gestora: string; classe: string; benchmark: string;
  taxaAdm: string | null; taxaPerformance: string | null; temLinhaDAGua: boolean;
  prazoResgateDias: number; sharpe12m: string | null; sortino12m: string | null;
  maxDrawdown: string | null; volatilidade12m: string | null; retorno12m: string | null;
  retorno36m: string | null; alfa36m: string | null; tempoRecuperacaoDias: number | null;
  scoreAtratividade: string | null; scoreConfianca: string | null; scoreDetalhado: any;
  notas: string | null; cnpj: string | null;
};
type Pertence = {
  id: number; fundoId: number; fundoNome: string; fundoGestora: string;
  fundoClasse: string; fundoPrazoResgate: number; fundoScore: string | null;
  dataCompra: string; valorInvestido: string; qtdCotas: string | null;
  precoCotaCompra: string | null; valorAtual: string | null; notas: string | null;
};
type Dashboard = { totalInvestido: number; totalAtual: number; resultado: number; rentabilidade: number };
type ChatMsg = { role: "user" | "assistant"; content: string };
type View = "login" | "oportunidades" | "pertences" | "gerenciar";

// ─── Utils ────────────────────────────────────────────────────────────────────

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const pct = (v: number | string | null) => v != null ? `${Number(v).toFixed(2)}%` : "—";
const score = (v: string | null) => v != null ? Number(v).toFixed(1) : "—";

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-gray-400 truncate">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="w-8 text-right text-gray-300">{value}</span>
    </div>
  );
}

function ScoreTag({ value }: { value: string | null }) {
  const n = Number(value ?? 0);
  const color = n >= 75 ? "text-green-400 bg-green-400/10 border-green-500/30"
    : n >= 50 ? "text-amber-400 bg-amber-400/10 border-amber-500/30"
    : "text-red-400 bg-red-400/10 border-red-500/30";
  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-bold ${color}`}>
      {score(value)}
    </span>
  );
}

function RiskTag({ prazo }: { prazo: number }) {
  const label = prazo <= 5 ? "D+0–5" : prazo <= 15 ? "D+15" : prazo <= 30 ? "D+30" : prazo <= 60 ? "D+60" : `D+${prazo}`;
  const color = prazo <= 15 ? "text-green-400" : prazo <= 30 ? "text-amber-400" : "text-orange-400";
  return <span className={`text-xs font-mono ${color}`}>{label}</span>;
}

const CLASSE_CORES: Record<string, string> = {
  "Ações": "#f59e0b", "Multimercado": "#6366f1", "Renda Fixa": "#22c55e",
  "Crédito Privado": "#ec4899", "Internacional": "#06b6d4", "Cripto": "#f97316",
};
const PIE_COLORS = ["#f59e0b", "#6366f1", "#22c55e", "#ec4899", "#06b6d4", "#f97316"];

// ─── Login Chat ───────────────────────────────────────────────────────────────

function LoginView({ onLogin }: { onLogin: (user: RapaduraUser) => void }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{
    role: "assistant",
    content: "Olá. Sou a Rapadura — sua guardiã de inteligência patrimonial.\n\nEste é um sistema privado. Quem é você?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function sendChat() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/rapadura/auth/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: newMsgs.slice(-10) }),
      });
      const data = await r.json() as { action: string; message?: string; candidate?: string };
      if (data.action === "request_password" && data.candidate) {
        setCandidate(data.candidate);
        const nome = data.candidate === "yuri" ? "Yuri" : "Mayumi";
        setMsgs(m => [...m, { role: "assistant", content: `Olá, ${nome}! Para confirmar seu acesso, insira sua senha abaixo.` }]);
      } else if (data.action === "deny") {
        setMsgs(m => [...m, { role: "assistant", content: data.message ?? "Acesso negado." }]);
      } else {
        setMsgs(m => [...m, { role: "assistant", content: data.message ?? "..." }]);
      }
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Sistema temporariamente indisponível. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword() {
    if (!password.trim() || !candidate || pwLoading) return;
    setPwLoading(true);
    setError("");
    try {
      const r = await fetch(`${API}/api/rapadura/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ candidate, password }),
      });
      const data = await r.json() as { ok?: boolean; user?: RapaduraUser; error?: string };
      if (data.ok && data.user) {
        onLogin(data.user);
      } else {
        setError(data.error ?? "Senha incorreta.");
        setPassword("");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-amber-400 tracking-widest mb-1">RAPADURA</div>
          <div className="text-xs text-gray-500 tracking-[0.3em] uppercase">Motor de Inteligência Patrimonial</div>
        </div>

        {/* Chat */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs font-bold tracking-widest">RAPADURA</span>
          </div>

          <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-amber-600/20 border border-amber-700/40 text-amber-100"
                    : "bg-gray-800/70 border border-gray-700/50 text-gray-200"
                }`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl px-3 py-2 text-gray-500 text-xs animate-pulse">
                  analisando…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!candidate ? (
            <div className="px-3 pb-3 border-t border-gray-800 pt-3">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-amber-600/60"
                  placeholder="Digite seu nome…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                  disabled={loading}
                />
                <button
                  onClick={sendChat}
                  disabled={loading || !input.trim()}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
                >→</button>
              </div>
            </div>
          ) : (
            <div className="px-3 pb-3 border-t border-gray-800 pt-3 space-y-2">
              <input
                type="password"
                className="w-full bg-gray-900 border border-amber-700/50 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-amber-500"
                placeholder="Senha…"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitPassword()}
                disabled={pwLoading}
                autoFocus
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={submitPassword}
                disabled={pwLoading || !password.trim()}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {pwLoading ? "Verificando…" : "Entrar"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Sistema privado · Sociedade Tucci · 2026
        </p>
      </div>
    </div>
  );
}

// ─── Oportunidades ────────────────────────────────────────────────────────────

function OportunidadesView({ fundos, onGerenciar }: { fundos: Fundo[]; onGerenciar: () => void }) {
  const [selected, setSelected] = useState<Fundo | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Oportunidades</h2>
          <p className="text-gray-500 text-xs">Fundos ranqueados por atratividade ajustada ao risco</p>
        </div>
        <button onClick={onGerenciar} className="text-xs text-amber-400 hover:text-amber-300 border border-amber-600/30 px-3 py-1.5 rounded-lg transition-colors">
          + Gerenciar Fundos
        </button>
      </div>

      {fundos.length === 0 && (
        <div className="text-center py-16 text-gray-600 text-sm">
          Nenhum fundo cadastrado ainda.<br/>
          <button onClick={onGerenciar} className="text-amber-400 underline mt-2">Adicionar primeiro fundo →</button>
        </div>
      )}

      <div className="space-y-3">
        {fundos.map((f, i) => (
          <div
            key={f.id}
            className="bg-gray-950 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-700 transition-colors"
            onClick={() => setSelected(selected?.id === f.id ? null : f)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="text-gray-600 text-xs font-mono w-5 text-right mt-0.5">#{i + 1}</div>
                <div>
                  <div className="text-white font-semibold text-sm">{f.nome}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {f.gestora} · {f.classe} · {f.benchmark}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <RiskTag prazo={f.prazoResgateDias} />
                <ScoreTag value={f.scoreAtratividade} />
              </div>
            </div>

            {/* Métricas rápidas */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { label: "Sharpe", value: f.sharpe12m ?? "—" },
                { label: "Drawdown", value: f.maxDrawdown ? `-${pct(f.maxDrawdown)}` : "—" },
                { label: "Retorno 12M", value: pct(f.retorno12m) },
                { label: "Taxa Adm", value: f.taxaAdm ? `${f.taxaAdm}%aa` : "—" },
              ].map(m => (
                <div key={m.label} className="bg-gray-900 rounded-lg px-2 py-1.5">
                  <div className="text-gray-600 text-xs">{m.label}</div>
                  <div className="text-gray-200 text-xs font-mono font-semibold mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>

            {/* Score detalhado expandido */}
            {selected?.id === f.id && f.scoreDetalhado && (
              <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                <div className="text-gray-400 text-xs font-semibold mb-3">Score Detalhado</div>
                <ScoreBar label="Retorno ajustado" value={f.scoreDetalhado.retornoAjustado ?? 0} color="bg-green-500" />
                <ScoreBar label="Controle de queda" value={f.scoreDetalhado.controleQueda ?? 0} color="bg-blue-500" />
                <ScoreBar label="Consistência 36M" value={f.scoreDetalhado.consistencia ?? 0} color="bg-indigo-500" />
                <ScoreBar label="Custo real" value={f.scoreDetalhado.custo ?? 0} color="bg-amber-500" />
                <ScoreBar label="Liquidez" value={f.scoreDetalhado.liquidez ?? 0} color="bg-cyan-500" />
                <div className="mt-3 text-xs text-gray-600 flex gap-4">
                  <span>Confiança da análise: <span className="text-gray-400">{score(f.scoreConfianca)}/100</span></span>
                  {!f.temLinhaDAGua && <span className="text-red-400">⚠ Sem Linha d'Água</span>}
                  {f.notas && <span className="text-gray-500 italic">{f.notas}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pertences ───────────────────────────────────────────────────────────────

function PertencesView({
  pertences, dashboard, fundos, onRefresh,
}: {
  pertences: Pertence[];
  dashboard: Dashboard;
  fundos: Fundo[];
  onRefresh: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    fundoId: "", dataCompra: "", valorInvestido: "", qtdCotas: "", precoCotaCompra: "", valorAtual: "", notas: "",
  });
  const [loading, setLoading] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  const resultado = dashboard.resultado;
  const rentabilidade = dashboard.rentabilidade;

  // Dados para gráfico de alocação por classe
  const porClasse: Record<string, number> = {};
  for (const p of pertences) {
    const k = p.fundoClasse ?? "Outros";
    porClasse[k] = (porClasse[k] ?? 0) + Number(p.valorInvestido ?? 0);
  }
  const pieData = Object.entries(porClasse).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

  // Dados para linha do tempo (por data de compra)
  const sorted = [...pertences].sort((a, b) => a.dataCompra.localeCompare(b.dataCompra));
  let cumulative = 0;
  const lineData = sorted.map(p => {
    cumulative += Number(p.valorInvestido ?? 0);
    return { data: p.dataCompra, total: Math.round(cumulative * 100) / 100 };
  });

  function resetForm() {
    setForm({ fundoId: "", dataCompra: "", valorInvestido: "", qtdCotas: "", precoCotaCompra: "", valorAtual: "", notas: "" });
    setShowAdd(false);
    setEditId(null);
  }

  function startEdit(p: Pertence) {
    setForm({
      fundoId: String(p.fundoId),
      dataCompra: p.dataCompra,
      valorInvestido: p.valorInvestido,
      qtdCotas: p.qtdCotas ?? "",
      precoCotaCompra: p.precoCotaCompra ?? "",
      valorAtual: p.valorAtual ?? "",
      notas: p.notas ?? "",
    });
    setEditId(p.id);
    setShowAdd(false);
  }

  async function submit() {
    if (!form.fundoId || !form.dataCompra || !form.valorInvestido) return;
    setLoading(true);
    try {
      const url = editId ? `${API}/api/rapadura/pertences/${editId}` : `${API}/api/rapadura/pertences`;
      const method = editId ? "PUT" : "POST";
      const body = { ...form, fundoId: parseInt(form.fundoId), valorInvestido: parseFloat(form.valorInvestido) };
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      resetForm();
      onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function del(id: number) {
    await fetch(`${API}/api/rapadura/pertences/${id}`, { method: "DELETE", credentials: "include" });
    setConfirmDel(null);
    onRefresh();
  }

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div>
        <h2 className="text-white font-bold text-lg">Pertences</h2>
        <p className="text-gray-500 text-xs">Sua carteira atual de investimentos</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Investido", value: fmt(dashboard.totalInvestido), color: "text-white" },
          { label: "Valor Atual", value: fmt(dashboard.totalAtual), color: "text-white" },
          { label: "Resultado", value: fmt(resultado), color: resultado >= 0 ? "text-green-400" : "text-red-400" },
          { label: "Rentabilidade", value: `${rentabilidade >= 0 ? "+" : ""}${rentabilidade.toFixed(2)}%`, color: rentabilidade >= 0 ? "text-green-400" : "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-gray-950 border border-gray-800 rounded-xl p-3">
            <div className="text-gray-500 text-xs mb-1">{s.label}</div>
            <div className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      {pertences.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Linha do tempo */}
          {lineData.length > 1 && (
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-xs font-semibold mb-3">Patrimônio acumulado</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Alocação por classe */}
          {pieData.length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-xs font-semibold mb-3">Alocação por classe</div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10, color: "#9ca3af" }} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Botão adicionar */}
      <div className="flex justify-between items-center">
        <div className="text-gray-500 text-xs">{pertences.length} posição{pertences.length !== 1 ? "ões" : ""}</div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditId(null); resetForm(); setShowAdd(true); }}
          className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          + Adicionar compra
        </button>
      </div>

      {/* Formulário */}
      {(showAdd || editId !== null) && (
        <div className="bg-gray-950 border border-amber-600/30 rounded-xl p-4 space-y-3">
          <div className="text-amber-400 text-xs font-semibold">{editId ? "Editar compra" : "Nova compra"}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-gray-500 text-xs mb-1 block">Fundo</label>
              <select
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                value={form.fundoId}
                onChange={e => setForm(f => ({ ...f, fundoId: e.target.value }))}
              >
                <option value="">Selecionar…</option>
                {fundos.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Data da compra</label>
              <input type="date" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                value={form.dataCompra} onChange={e => setForm(f => ({ ...f, dataCompra: e.target.value }))} />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Valor investido (R$)</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                placeholder="0,00" value={form.valorInvestido} onChange={e => setForm(f => ({ ...f, valorInvestido: e.target.value }))} />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Qtd de cotas</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                placeholder="opcional" value={form.qtdCotas} onChange={e => setForm(f => ({ ...f, qtdCotas: e.target.value }))} />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Preço da cota (R$)</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                placeholder="opcional" value={form.precoCotaCompra} onChange={e => setForm(f => ({ ...f, precoCotaCompra: e.target.value }))} />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Valor atual (R$)</label>
              <input type="number" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                placeholder="opcional" value={form.valorAtual} onChange={e => setForm(f => ({ ...f, valorAtual: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-gray-500 text-xs mb-1 block">Notas</label>
              <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                placeholder="opcional…" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
            <button
              onClick={submit}
              disabled={loading || !form.fundoId || !form.dataCompra || !form.valorInvestido}
              className="text-xs bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              {loading ? "Salvando…" : editId ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {pertences.length === 0 ? (
        <div className="text-center py-12 text-gray-600 text-sm">Nenhuma compra registrada ainda.</div>
      ) : (
        <div className="space-y-2">
          {pertences.map(p => {
            const vi = Number(p.valorInvestido);
            const va = Number(p.valorAtual ?? p.valorInvestido);
            const res = va - vi;
            const rent = vi > 0 ? (res / vi) * 100 : 0;
            return (
              <div key={p.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-white text-sm font-semibold">{p.fundoNome}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{p.fundoGestora} · {p.fundoClasse} · comprado em {p.dataCompra}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => startEdit(p)} className="text-gray-500 hover:text-amber-400 text-xs px-2 py-1 rounded border border-transparent hover:border-amber-600/30 transition-colors">editar</button>
                    {confirmDel === p.id ? (
                      <>
                        <button onClick={() => del(p.id)} className="text-red-400 text-xs px-2 py-1 rounded border border-red-600/30 hover:bg-red-900/20 transition-colors">confirmar</button>
                        <button onClick={() => setConfirmDel(null)} className="text-gray-500 text-xs px-2 py-1">×</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDel(p.id)} className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 transition-colors">excluir</button>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="bg-gray-900 rounded-lg px-2 py-1.5">
                    <div className="text-gray-600 text-xs">Investido</div>
                    <div className="text-gray-200 text-xs font-mono font-semibold">{fmt(vi)}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg px-2 py-1.5">
                    <div className="text-gray-600 text-xs">Atual</div>
                    <div className="text-gray-200 text-xs font-mono font-semibold">{fmt(va)}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg px-2 py-1.5">
                    <div className="text-gray-600 text-xs">Resultado</div>
                    <div className={`text-xs font-mono font-semibold ${res >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {res >= 0 ? "+" : ""}{fmt(res)} ({rent >= 0 ? "+" : ""}{rent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
                {p.notas && <p className="mt-2 text-gray-600 text-xs italic">{p.notas}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Gerenciar Fundos ─────────────────────────────────────────────────────────

function GerenciarView({ fundos, onRefresh, onBack }: { fundos: Fundo[]; onRefresh: () => void; onBack: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: "", gestora: "", classe: "Multimercado", benchmark: "CDI", cnpj: "",
    taxaAdm: "", taxaPerformance: "", temLinhaDAGua: true, prazoResgateDias: "30",
    sharpe12m: "", sortino12m: "", maxDrawdown: "", tempoRecuperacaoDias: "",
    volatilidade12m: "", retorno12m: "", retorno36m: "", alfa36m: "", notas: "",
  });
  const [loading, setLoading] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  function resetForm() {
    setForm({
      nome: "", gestora: "", classe: "Multimercado", benchmark: "CDI", cnpj: "",
      taxaAdm: "", taxaPerformance: "", temLinhaDAGua: true, prazoResgateDias: "30",
      sharpe12m: "", sortino12m: "", maxDrawdown: "", tempoRecuperacaoDias: "",
      volatilidade12m: "", retorno12m: "", retorno36m: "", alfa36m: "", notas: "",
    });
    setShowAdd(false);
    setEditId(null);
  }

  function startEdit(f: Fundo) {
    setForm({
      nome: f.nome, gestora: f.gestora, classe: f.classe, benchmark: f.benchmark, cnpj: f.cnpj ?? "",
      taxaAdm: f.taxaAdm ?? "", taxaPerformance: f.taxaPerformance ?? "",
      temLinhaDAGua: f.temLinhaDAGua, prazoResgateDias: String(f.prazoResgateDias),
      sharpe12m: f.sharpe12m ?? "", sortino12m: f.sortino12m ?? "", maxDrawdown: f.maxDrawdown ?? "",
      tempoRecuperacaoDias: f.tempoRecuperacaoDias ? String(f.tempoRecuperacaoDias) : "",
      volatilidade12m: f.volatilidade12m ?? "", retorno12m: f.retorno12m ?? "",
      retorno36m: f.retorno36m ?? "", alfa36m: f.alfa36m ?? "", notas: f.notas ?? "",
    });
    setEditId(f.id);
    setShowAdd(false);
  }

  async function submit() {
    if (!form.nome || !form.gestora) return;
    setLoading(true);
    try {
      const url = editId ? `${API}/api/rapadura/fundos/${editId}` : `${API}/api/rapadura/fundos`;
      const method = editId ? "PUT" : "POST";
      const body = {
        ...form,
        taxaAdm: form.taxaAdm ? parseFloat(form.taxaAdm) : null,
        taxaPerformance: form.taxaPerformance ? parseFloat(form.taxaPerformance) : null,
        prazoResgateDias: parseInt(form.prazoResgateDias) || 30,
        sharpe12m: form.sharpe12m ? parseFloat(form.sharpe12m) : null,
        sortino12m: form.sortino12m ? parseFloat(form.sortino12m) : null,
        maxDrawdown: form.maxDrawdown ? parseFloat(form.maxDrawdown) : null,
        tempoRecuperacaoDias: form.tempoRecuperacaoDias ? parseInt(form.tempoRecuperacaoDias) : null,
        volatilidade12m: form.volatilidade12m ? parseFloat(form.volatilidade12m) : null,
        retorno12m: form.retorno12m ? parseFloat(form.retorno12m) : null,
        retorno36m: form.retorno36m ? parseFloat(form.retorno36m) : null,
        alfa36m: form.alfa36m ? parseFloat(form.alfa36m) : null,
      };
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      resetForm();
      onRefresh();
    } finally {
      setLoading(false);
    }
  }

  async function del(id: number) {
    await fetch(`${API}/api/rapadura/fundos/${id}`, { method: "DELETE", credentials: "include" });
    setConfirmDel(null);
    onRefresh();
  }

  const campo = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label className="text-gray-500 text-xs mb-1 block">{label}</label>
      <input
        type={type}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-600/50"
        placeholder={placeholder}
        value={String(form[key])}
        onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? e.target.value : e.target.value }))}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-white text-xs transition-colors">← Voltar</button>
        <div>
          <h2 className="text-white font-bold text-lg">Gerenciar Fundos</h2>
          <p className="text-gray-500 text-xs">Cadastro e atualização de fundos disponíveis</p>
        </div>
      </div>

      <button
        onClick={() => { resetForm(); setShowAdd(true); }}
        className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        + Novo fundo
      </button>

      {(showAdd || editId !== null) && (
        <div className="bg-gray-950 border border-amber-600/30 rounded-xl p-4 space-y-3">
          <div className="text-amber-400 text-xs font-semibold">{editId ? "Editar fundo" : "Novo fundo"}</div>
          <div className="grid grid-cols-2 gap-3">
            {campo("Nome do fundo *", "nome", "text", "XP Platinum FIC...")}
            {campo("Gestora *", "gestora", "text", "XP Asset...")}
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Classe</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                value={form.classe} onChange={e => setForm(f => ({ ...f, classe: e.target.value }))}>
                {["Multimercado","Ações","Renda Fixa","Crédito Privado","Internacional","Cripto"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Benchmark</label>
              <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none"
                value={form.benchmark} onChange={e => setForm(f => ({ ...f, benchmark: e.target.value }))}>
                {["CDI","Ibovespa","IPCA+6%","IPCA+8%","S&P 500","Dólar"].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            {campo("Taxa Adm (%aa)", "taxaAdm", "number", "1.50")}
            {campo("Taxa Performance (%)", "taxaPerformance", "number", "20")}
            {campo("Prazo de Resgate (dias)", "prazoResgateDias", "number", "30")}
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="lda" checked={form.temLinhaDAGua}
                onChange={e => setForm(f => ({ ...f, temLinhaDAGua: e.target.checked }))} className="accent-amber-500" />
              <label htmlFor="lda" className="text-gray-400 text-xs">Tem Linha d'Água (High-Water Mark)</label>
            </div>
            <div className="col-span-2 border-t border-gray-800 pt-3 mt-1">
              <div className="text-gray-600 text-xs font-semibold mb-2">Métricas de Performance (opcional)</div>
              <div className="grid grid-cols-2 gap-3">
                {campo("Sharpe 12M", "sharpe12m", "number", "0.85")}
                {campo("Sortino 12M", "sortino12m", "number", "1.20")}
                {campo("Max Drawdown (%)", "maxDrawdown", "number", "15.5")}
                {campo("Recuperação (dias)", "tempoRecuperacaoDias", "number", "180")}
                {campo("Volatilidade 12M (%)", "volatilidade12m", "number", "12.3")}
                {campo("Retorno 12M (%)", "retorno12m", "number", "18.5")}
                {campo("Retorno 36M (%)", "retorno36m", "number", "45.0")}
                {campo("Alfa 36M (%)", "alfa36m", "number", "8.0")}
              </div>
            </div>
            {campo("CNPJ (opcional)", "cnpj", "text", "00.000.000/0001-00")}
            {campo("Notas", "notas", "text", "observações...")}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>
            <button
              onClick={submit}
              disabled={loading || !form.nome || !form.gestora}
              className="text-xs bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              {loading ? "Salvando…" : editId ? "Salvar" : "Criar"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {fundos.map(f => (
          <div key={f.id} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-white text-sm font-semibold">{f.nome}</div>
              <div className="text-gray-500 text-xs mt-0.5">{f.gestora} · {f.classe} · Score: {score(f.scoreAtratividade)}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => startEdit(f)} className="text-gray-500 hover:text-amber-400 text-xs px-2 py-1 rounded border border-transparent hover:border-amber-600/30 transition-colors">editar</button>
              {confirmDel === f.id ? (
                <>
                  <button onClick={() => del(f.id)} className="text-red-400 text-xs px-2 py-1 rounded border border-red-600/30">confirmar</button>
                  <button onClick={() => setConfirmDel(null)} className="text-gray-500 text-xs px-2 py-1">×</button>
                </>
              ) : (
                <button onClick={() => setConfirmDel(f.id)} className="text-gray-600 hover:text-red-400 text-xs px-2 py-1 transition-colors">excluir</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export function RapaduraPage() {
  const [user, setUser] = useState<RapaduraUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState<View>("oportunidades");
  const [fundos, setFundos] = useState<Fundo[]>([]);
  const [pertences, setPertences] = useState<Pertence[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard>({ totalInvestido: 0, totalAtual: 0, resultado: 0, rentabilidade: 0 });
  const [dataLoading, setDataLoading] = useState(false);

  // Verificar sessão ao montar
  useEffect(() => {
    fetch(`${API}/api/rapadura/auth/me`, { credentials: "include" })
      .then(r => r.json() as Promise<{ user: RapaduraUser | null }>)
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [fr, pr] = await Promise.all([
        fetch(`${API}/api/rapadura/fundos`, { credentials: "include" }).then(r => r.json() as Promise<{ fundos: Fundo[] }>),
        fetch(`${API}/api/rapadura/pertences`, { credentials: "include" }).then(r => r.json() as Promise<{ pertences: Pertence[]; dashboard: Dashboard }>),
      ]);
      setFundos(fr.fundos ?? []);
      setPertences(pr.pertences ?? []);
      setDashboard(pr.dashboard ?? { totalInvestido: 0, totalAtual: 0, resultado: 0, rentabilidade: 0 });
    } catch { /* silencioso */ } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function logout() {
    await fetch(`${API}/api/rapadura/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
    setFundos([]);
    setPertences([]);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center">
        <div className="text-amber-400 text-xs font-mono animate-pulse">carregando…</div>
      </div>
    );
  }

  if (!user) return <LoginView onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-[#060a14] text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#050810]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-amber-400 font-black tracking-widest text-sm">RAPADURA</div>
          <nav className="flex items-center gap-1">
            {([
              { id: "oportunidades" as const, label: "Oportunidades" },
              { id: "pertences" as const, label: "Pertences" },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  view === tab.id ? "bg-amber-600/20 text-amber-400 border border-amber-600/30" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs hidden sm:block">{user.nome}</span>
            <button onClick={logout} className="text-gray-600 hover:text-gray-400 text-xs transition-colors">sair</button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {dataLoading && view !== "login" && (
          <div className="text-center py-4 text-amber-400 text-xs animate-pulse">carregando dados…</div>
        )}
        {view === "oportunidades" && (
          <OportunidadesView fundos={fundos} onGerenciar={() => setView("gerenciar")} />
        )}
        {view === "pertences" && (
          <PertencesView pertences={pertences} dashboard={dashboard} fundos={fundos} onRefresh={loadData} />
        )}
        {view === "gerenciar" && (
          <GerenciarView fundos={fundos} onRefresh={loadData} onBack={() => setView("oportunidades")} />
        )}
      </main>

      <footer className="border-t border-gray-900 mt-12 py-4 text-center text-gray-700 text-xs">
        Rapadura · Motor de Inteligência Patrimonial · Sociedade Tucci · 2026
      </footer>
    </div>
  );
}
