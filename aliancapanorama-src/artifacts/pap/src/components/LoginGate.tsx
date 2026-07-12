import { useState, useEffect } from "react";
import { Loader2, LogIn, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";

interface User {
  id: number;
  login: string;
  tier: number;
  displayName?: string | null;
}

const API = import.meta.env.VITE_API_URL ?? "";

async function fetchMe(): Promise<User | null> {
  try {
    const r = await fetch(`${API}/api/auth/me`, { credentials: "include" });
    const data = await r.json() as { user: User | null };
    return data.user;
  } catch {
    return null;
  }
}

async function doLogin(
  login: string,
  password: string
): Promise<{ ok: boolean; error?: string; requiresPin?: boolean }> {
  try {
    const r = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const data = await r.json() as { error?: string; requiresPin?: boolean };
    if (r.ok) return { ok: true, requiresPin: data.requiresPin };
    return { ok: false, error: data.error ?? "Erro desconhecido" };
  } catch {
    return { ok: false, error: "Sem conexão com o servidor" };
  }
}

async function doPin(pin: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(`${API}/api/auth/adm-pin`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (r.ok) return { ok: true };
    const data = await r.json() as { error?: string };
    return { ok: false, error: data.error ?? "PIN inválido" };
  } catch {
    return { ok: false, error: "Sem conexão com o servidor" };
  }
}

interface Props {
  children: (user: User) => React.ReactNode;
}

export function LoginGate({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pinPending, setPinPending] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    fetchMe().then((u) => { setUser(u); setChecking(false); });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (user) return <>{children(user)}</>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await doLogin(login, password);
    if (result.ok) {
      if (result.requiresPin) {
        setPinPending(true);
        setError("PIN enviado por email (pode demorar alguns segundos). Verifique também os logs do Railway.");
      } else {
        const u = await fetchMe();
        setUser(u);
      }
    } else {
      setError(result.error ?? "Erro");
    }
    setLoading(false);
  }

  async function handlePin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await doPin(pin);
    if (result.ok) {
      const u = await fetchMe();
      setUser(u);
    } else {
      setError(result.error ?? "PIN inválido");
    }
    setLoading(false);
  }

  async function enterAsGuest() {
    setLoading(true);
    setError("");
    const result = await doLogin("guest", "pap");
    if (result.ok) {
      const u = await fetchMe();
      setUser(u);
    } else {
      setError(result.error ?? "Erro ao entrar como visitante");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <div className="w-full max-w-sm px-8 py-10 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🚀</div>
          <h1 className="text-white text-xl font-semibold tracking-wide">Aliança Panorama</h1>
          <p className="text-white/40 text-xs mt-1">Sociedade Tucci · FUVEST 2026</p>
        </div>

        {pinPending ? (
          /* ── PIN 2FA ── */
          <form onSubmit={(e) => { void handlePin(e); }} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400/80 text-xs mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Verificação de 2 fatores</span>
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-widest">PIN 6 dígitos</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-center text-xl tracking-[0.5em] placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="000000"
                required
              />
            </div>

            {error && (
              <p className="text-amber-400/80 text-xs bg-amber-400/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-amber-900/30 hover:bg-amber-900/40 border border-amber-700/40 text-amber-300 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {loading ? "Verificando…" : "Confirmar PIN"}
            </button>

            <button type="button" onClick={() => { setPinPending(false); setPin(""); setError(""); }}
              className="w-full text-white/30 text-xs py-1 hover:text-white/50 transition-colors">
              ← Voltar ao login
            </button>
          </form>
        ) : (
          /* ── LOGIN FORM ── */
          <div className="space-y-4">
            {/* Acesso livre */}
            <button
              onClick={() => { void enterAsGuest(); }}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-950/50 hover:bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserRound className="w-4 h-4" />}
              Acesso Livre (Visitante)
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-white/10" />
              <span className="text-white/20 text-xs">ou</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-widest">Login</label>
                <input
                  type="text"
                  autoComplete="username"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="seu login"
                  required
                />
              </div>

              <div>
                <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-widest">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loading ? "Entrando…" : "Entrar"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
