import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, Users, BookOpen, Zap, TrendingUp, Crown, RefreshCw, Crosshair } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

interface PortalUser { id: number; login: string; tier: number; displayName?: string | null; }
interface TierCount { tier: number; count: number; }
interface TopNode { nodeCode: string; attempts: number; correct: number; }
interface RecentUser { id: number; login: string; tier: number; displayName?: string | null; createdAt: string; subscriptionStatus?: string | null; }

interface Stats {
  superAdm: boolean;
  totalUsers: number;
  usersByTier: TierCount[];
  totalExercises: number;
  attemptsToday: number;
  attemptsWeek: number;
  topNodes: TopNode[];
  recentUsers: RecentUser[];
}

async function checkSession(): Promise<PortalUser | null> {
  try {
    const r = await fetch(`${API}/api/auth/me`, { credentials: "include" });
    const d = await r.json() as { user: PortalUser | null };
    if (d.user && d.user.tier >= 5) return d.user;
    return null;
  } catch { return null; }
}

async function doLogin(login: string, password: string) {
  const r = await fetch(`${API}/api/auth/login`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  const d = await r.json() as { error?: string; requiresPin?: boolean };
  if (!r.ok) throw new Error(d.error ?? "Erro");
  return d;
}

async function doPin(pin: string) {
  const r = await fetch(`${API}/api/auth/adm-pin`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  if (!r.ok) { const d = await r.json() as { error?: string }; throw new Error(d.error ?? "PIN inválido"); }
}

async function loadStats(): Promise<Stats> {
  const r = await fetch(`${API}/api/portal/stats`, { credentials: "include" });
  if (!r.ok) throw new Error("Erro ao carregar stats");
  return r.json() as Promise<Stats>;
}

// ─── Login ────────────────────────────────────────────────────────────────────
function PortalLogin({ onLogin }: { onLogin: (u: PortalUser) => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [pin, setPin] = useState("");
  const [pinStage, setPinStage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await doLogin(login, password);
      if (res.requiresPin) { setPinStage(true); }
      else {
        const u = await checkSession();
        if (!u) setError("Acesso negado — tier 5+ obrigatório");
        else onLogin(u);
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro"); }
    setLoading(false);
  }

  async function handlePin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await doPin(pin);
      const u = await checkSession();
      if (!u) setError("Acesso negado — tier 5+ obrigatório");
      else onLogin(u);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "PIN inválido"); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center font-mono">
      <div className="w-full max-w-sm border border-cyan-900/50 rounded-lg p-8 bg-[#0d1b2a]">
        <div className="text-center mb-6">
          <div className="text-cyan-400 text-2xl font-bold tracking-wider">PAP PORTAL</div>
          <div className="text-gray-500 text-xs mt-1">Sociedade Tucci · Acesso adm/superadm</div>
        </div>

        {error && <div className="mb-4 text-red-400 text-xs bg-red-900/20 border border-red-900/40 rounded p-2">{error}</div>}

        {!pinStage ? (
          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Login</label>
              <input
                className="w-full bg-[#111827] border border-cyan-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                value={login} onChange={e => setLogin(e.target.value)} autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full bg-[#111827] border border-cyan-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 pr-9"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-sm py-2 rounded flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin"/> : null}
              Entrar
            </button>
            <p className="text-center text-xs text-gray-600">Acesso restrito · tier 5+</p>
          </form>
        ) : (
          <form onSubmit={(e) => { void handlePin(e); }} className="space-y-4">
            <div className="text-xs text-gray-400 text-center">Verifique seu email — código 2FA</div>
            <input
              className="w-full bg-[#111827] border border-cyan-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 text-center tracking-widest"
              value={pin} onChange={e => setPin(e.target.value)} placeholder="000000" maxLength={8} autoFocus
            />
            <button type="submit" disabled={loading}
              className="w-full bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-sm py-2 rounded flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin"/> : null}
              Verificar PIN
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{size?: number; className?: string}>;
  label: string; value: number | string; sub?: string; color?: string;
}) {
  return (
    <div className="border border-cyan-900/30 rounded-lg p-4 bg-[#0d1b2a]">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color ?? "text-cyan-400"}/>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Painel ───────────────────────────────────────────────────────────────────
function PortalDashboard({ user }: { user: PortalUser }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = () => {
    setLoading(true); setError("");
    loadStats()
      .then(s => { setStats(s); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  };

  useEffect(() => { refresh(); }, []);

  const accuracy = (n: TopNode) => {
    const a = Number(n.attempts); const c = Number(n.correct);
    if (!a) return "—";
    return `${Math.round((c / a) * 100)}%`;
  };

  const tierLabel = (t: number) => {
    if (t >= 9) return "superadm";
    if (t >= 5) return "adm";
    if (t >= 4) return "premium";
    if (t >= 1) return "aluno";
    return "guest";
  };

  const tierColor = (t: number) => {
    if (t >= 9) return "text-amber-400";
    if (t >= 5) return "text-cyan-400";
    if (t >= 4) return "text-purple-400";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-gray-200 font-mono p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Botão Dodge — canto superior esquerdo — superadm only */}
          {user.tier >= 9 && (
            <a href="/dodge"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/30 border border-amber-700/50 rounded text-amber-300 text-xs font-bold hover:bg-amber-900/50 transition-colors">
              <Crosshair size={12}/> DODGE
            </a>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold text-lg">PAP PORTAL</span>
              {user.tier >= 9 && <span className="flex items-center gap-1 text-amber-400 text-xs"><Crown size={12}/> SUPERADM</span>}
              {user.tier >= 5 && user.tier < 9 && <span className="text-cyan-400 text-xs">ADM</span>}
            </div>
            <div className="text-gray-500 text-xs">{user.displayName ?? user.login} · tier {user.tier}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh}
            className="text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1 text-xs">
            <RefreshCw size={12}/> atualizar
          </button>
          <a href="/" className="text-xs text-gray-600 hover:text-gray-400">← raiz FUVEST</a>
          <a href="/adm" className="text-xs text-gray-600 hover:text-gray-400">painel adm →</a>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-400" size={24}/>
        </div>
      )}

      {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded p-3">{error}</div>}

      {stats && !loading && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users}   label="Usuários"           value={stats.totalUsers}    sub="no sistema"/>
            <StatCard icon={BookOpen} label="Exercícios gerados" value={stats.totalExercises} sub="total histórico"/>
            <StatCard icon={Zap}     label="Tentativas hoje"    value={stats.attemptsToday} sub="últimas 24h" color="text-green-400"/>
            <StatCard icon={TrendingUp} label="Tentativas 7d"   value={stats.attemptsWeek}  sub="últimos 7 dias" color="text-amber-400"/>
          </div>

          {/* Usuários por tier */}
          <div className="border border-cyan-900/30 rounded-lg p-4 bg-[#0d1b2a]">
            <div className="text-xs text-gray-400 mb-3">Distribuição por tier</div>
            <div className="flex flex-wrap gap-3">
              {stats.usersByTier.sort((a, b) => b.tier - a.tier).map(t => (
                <div key={t.tier} className="flex items-center gap-2 bg-[#111827] rounded px-3 py-1.5">
                  <span className={`text-xs font-bold ${tierColor(t.tier)}`}>{tierLabel(t.tier)}</span>
                  <span className="text-gray-500 text-xs">t{t.tier}</span>
                  <span className="text-white text-sm font-bold">{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top nodes */}
          <div className="border border-cyan-900/30 rounded-lg p-4 bg-[#0d1b2a]">
            <div className="text-xs text-gray-400 mb-3">Top tópicos FUVEST (7 dias)</div>
            <div className="space-y-2">
              {stats.topNodes.map((n, i) => (
                <div key={n.nodeCode} className="flex items-center gap-3 text-xs">
                  <span className="text-gray-600 w-4">{i + 1}</span>
                  <span className="text-cyan-300 font-mono flex-1">{n.nodeCode}</span>
                  <span className="text-gray-400">{n.attempts} tent.</span>
                  <span className={`font-bold ${Number(n.correct) / (Number(n.attempts) || 1) > 0.6 ? "text-green-400" : "text-amber-400"}`}>
                    {accuracy(n)}
                  </span>
                </div>
              ))}
              {stats.topNodes.length === 0 && <div className="text-gray-600 text-xs">Nenhuma tentativa neste período</div>}
            </div>
          </div>

          {/* Últimos usuários — superadm only */}
          {stats.superAdm && stats.recentUsers.length > 0 && (
            <div className="border border-amber-900/30 rounded-lg p-4 bg-[#0d1b2a]">
              <div className="flex items-center gap-2 mb-3">
                <Crown size={12} className="text-amber-400"/>
                <span className="text-xs text-amber-400">Últimos usuários cadastrados</span>
              </div>
              <div className="space-y-2">
                {stats.recentUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 text-xs">
                    <span className={`font-bold ${tierColor(u.tier)}`}>{tierLabel(u.tier)}</span>
                    <span className="text-gray-300 flex-1">{u.displayName ?? u.login}</span>
                    <span className="text-gray-600">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</span>
                    {u.subscriptionStatus && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${u.subscriptionStatus === "active" ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                        {u.subscriptionStatus}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links rápidos */}
          <div className="border border-cyan-900/20 rounded-lg p-4 bg-[#0d1b2a]">
            <div className="text-xs text-gray-500 mb-3">Acesso rápido</div>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/", label: "Raiz FUVEST" },
                { href: "/adm", label: "Painel Adm" },
                { href: "/mapa", label: "Mapa" },
                { href: "/eco", label: "Ecossystemma" },
                { href: "/meky", label: "MEKY" },
                { href: "/toyota", label: "Toyota" },
                { href: "/arquitetura", label: "Arquitetura" },
              ].map(l => (
                <a key={l.href} href={l.href}
                  className="px-3 py-1.5 bg-[#111827] border border-cyan-900/30 rounded text-xs text-cyan-300 hover:text-cyan-100 hover:border-cyan-500 transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function PortalPage() {
  const [user, setUser] = useState<PortalUser | null | "checking">("checking");

  useEffect(() => {
    checkSession().then(u => setUser(u));
  }, []);

  if (user === "checking") {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={24}/>
      </div>
    );
  }

  if (!user) return <PortalLogin onLogin={u => setUser(u)}/>;
  return <PortalDashboard user={user}/>;
}
