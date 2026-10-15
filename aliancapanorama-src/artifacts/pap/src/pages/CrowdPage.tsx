/**
 * CrowdPage — /crowd
 * Portal do parceiro externo (Piti). Login próprio, relatórios do sistema, troca de senha e email.
 */
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

interface CrowdUser {
  id: number;
  username: string;
  displayName: string;
  email: string | null;
  role: string;
}

interface Reports {
  api?: { status: string; timestamp: string };
  playcenter?: { status: string; totalMsgs: number; ultimaMensagem: { agente: string; preview: string; em: string } | null };
  leucocito?: { status: string; run_at?: string; passed?: number; failed?: number; summary?: string };
  ias_ativas_48h?: number;
}

// ── Login ────────────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (user: CrowdUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/crowd/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });
      const d = await r.json() as { ok?: boolean; displayName?: string; email?: string; role?: string; error?: string };
      if (!r.ok || !d.ok) { setErro(d.error ?? "Credenciais inválidas"); return; }
      onLogin({ id: 0, username: username.trim().toLowerCase(), displayName: d.displayName ?? username, email: d.email ?? null, role: d.role ?? "parceiro" });
    } catch {
      setErro("Sem conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-black tracking-tight text-white mb-1">CROWD</div>
          <div className="text-gray-500 text-xs tracking-widest uppercase">Sociedade Tucci · Portal do Parceiro</div>
        </div>
        <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Usuário</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-600 transition-colors"
              placeholder="seu usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1 font-medium">Senha</label>
            <input
              type="password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-cyan-600 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          {erro && <p className="text-red-400 text-xs">{erro}</p>}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Relatórios ───────────────────────────────────────────────────────────────

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
  );
}

function hora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function ReportsPanel({ reports, loading }: { reports: Reports | null; loading: boolean }) {
  if (loading) return <p className="text-gray-500 text-sm animate-pulse">Carregando relatório…</p>;
  if (!reports) return <p className="text-gray-500 text-sm">Não foi possível carregar o relatório.</p>;

  const apiOk = reports.api?.status === "online";
  const pcOk = reports.playcenter?.status === "ativo";
  const leuOk = reports.leucocito?.status === "ok";
  const leuAtencao = reports.leucocito?.status === "atencao";

  return (
    <div className="space-y-3">
      {/* API */}
      <div className="flex items-center justify-between bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusDot ok={apiOk} />
          <span className="text-sm text-white font-medium">API Principal</span>
        </div>
        <span className="text-xs text-gray-400">{apiOk ? "Online" : "Offline"}</span>
      </div>

      {/* Playcenter */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusDot ok={pcOk} />
            <span className="text-sm text-white font-medium">Clube das IAs</span>
          </div>
          <span className="text-xs text-gray-400">{reports.playcenter?.totalMsgs ?? 0} mensagens · {reports.ias_ativas_48h ?? 0} IAs ativas</span>
        </div>
        {reports.playcenter?.ultimaMensagem && (
          <div className="text-xs text-gray-500 truncate">
            <span className="text-cyan-400">{reports.playcenter.ultimaMensagem.agente}</span>
            {" · "}{reports.playcenter.ultimaMensagem.preview}
            <span className="ml-2 text-gray-600">{hora(reports.playcenter.ultimaMensagem.em)}</span>
          </div>
        )}
      </div>

      {/* Leucócito */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <StatusDot ok={leuOk} />
            <span className="text-sm text-white font-medium">Diagnóstico do Sistema</span>
          </div>
          {reports.leucocito?.run_at && (
            <span className="text-xs text-gray-400">{hora(reports.leucocito.run_at)}</span>
          )}
        </div>
        {reports.leucocito?.passed !== undefined && (
          <div className="text-xs text-gray-500">
            <span className="text-green-400">{reports.leucocito.passed} passou</span>
            {(reports.leucocito.failed ?? 0) > 0 && (
              <span className="text-red-400 ml-2">{reports.leucocito.failed} falhou</span>
            )}
            {leuAtencao && <span className="text-yellow-400 ml-2">· atenção</span>}
          </div>
        )}
        {reports.leucocito?.status === "nunca_executado" && (
          <p className="text-xs text-gray-600">Diagnóstico ainda não executado</p>
        )}
      </div>
    </div>
  );
}

// ── Configurações ────────────────────────────────────────────────────────────

function ConfigPanel({ user, onUpdate }: { user: CrowdUser; onUpdate: (u: Partial<CrowdUser>) => void }) {
  const [tab, setTab] = useState<"senha" | "email">("senha");
  const [current, setCurrent] = useState("");
  const [nova, setNova] = useState("");
  const [email, setEmail] = useState(user.email ?? "");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setMsg(""); setLoading(true);
    try {
      const r = await fetch(`${API}/api/crowd/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: current, newPassword: nova }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (!r.ok) { setErro(d.error ?? "Erro ao trocar senha"); return; }
      setMsg("Senha alterada com sucesso!"); setCurrent(""); setNova("");
    } catch { setErro("Sem conexão"); }
    finally { setLoading(false); }
  }

  async function updateEmail(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); setMsg(""); setLoading(true);
    try {
      const r = await fetch(`${API}/api/crowd/update-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const d = await r.json() as { ok?: boolean; email?: string; error?: string };
      if (!r.ok) { setErro(d.error ?? "Erro ao salvar email"); return; }
      setMsg("Email salvo!"); onUpdate({ email: d.email ?? email });
    } catch { setErro("Sem conexão"); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex gap-2 mb-5">
        <button onClick={() => { setTab("senha"); setMsg(""); setErro(""); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === "senha" ? "bg-cyan-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
          Trocar senha
        </button>
        <button onClick={() => { setTab("email"); setMsg(""); setErro(""); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === "email" ? "bg-cyan-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
          {user.email ? "Alterar email" : "Adicionar email"}
        </button>
      </div>

      {tab === "senha" && (
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" placeholder="Senha atual" value={current} onChange={e => setCurrent(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-600" />
          <input type="password" placeholder="Nova senha (mín. 6 caracteres)" value={nova} onChange={e => setNova(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-600" />
          <button type="submit" disabled={loading || !current || !nova}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
            {loading ? "Salvando…" : "Trocar senha"}
          </button>
        </form>
      )}

      {tab === "email" && (
        <form onSubmit={updateEmail} className="space-y-3">
          <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-600" />
          <button type="submit" disabled={loading || !email}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
            {loading ? "Salvando…" : "Salvar email"}
          </button>
        </form>
      )}

      {msg && <p className="mt-3 text-green-400 text-xs">{msg}</p>}
      {erro && <p className="mt-3 text-red-400 text-xs">{erro}</p>}
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ user, onLogout }: { user: CrowdUser; onLogout: () => void }) {
  const [reports, setReports] = useState<Reports | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    fetch(`${API}/api/crowd/reports`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setReports(d as Reports))
      .catch(() => setReports(null))
      .finally(() => setLoadingReports(false));
  }, []);

  async function logout() {
    await fetch(`${API}/api/crowd/logout`, { method: "POST", credentials: "include" });
    onLogout();
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xl font-black text-white tracking-tight">CROWD</div>
            <div className="text-gray-500 text-xs">Olá, {currentUser.displayName}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowConfig(v => !v)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors">
              {showConfig ? "← Voltar" : "Configurações"}
            </button>
            <button onClick={logout}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-lg transition-colors">
              Sair
            </button>
          </div>
        </div>

        {showConfig ? (
          <ConfigPanel user={currentUser} onUpdate={u => setCurrentUser(prev => ({ ...prev, ...u }))} />
        ) : (
          <>
            <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Status do Sistema</h2>
            <ReportsPanel reports={reports} loading={loadingReports} />
            <p className="text-gray-700 text-xs mt-6 text-center">
              Sociedade Tucci · sociedadetucci.com.br
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Entry Point ───────────────────────────────────────────────────────────────

export function CrowdPage() {
  const [user, setUser] = useState<CrowdUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/crowd/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.id) setUser(d as CrowdUser); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 text-sm animate-pulse">CROWD…</div>
      </div>
    );
  }

  if (!user) return <LoginForm onLogin={setUser} />;
  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
