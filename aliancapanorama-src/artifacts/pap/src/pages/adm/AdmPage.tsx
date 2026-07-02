import { useState, useEffect } from "react";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import { AdmEventos } from "./AdmEventos";
import { AdmRelacoes } from "./AdmRelacoes";
import { AdmTipos } from "./AdmTipos";
import { AdmCatalogos } from "./AdmCatalogos";
import { AdmUsuarios } from "./AdmUsuarios";
import { IsaChat } from "./IsaChat";

const API = import.meta.env.VITE_API_URL ?? "";

type AdmTab = "eventos" | "relacoes" | "tipos" | "catalogos" | "usuarios";

const TABS: { id: AdmTab; label: string; emoji: string }[] = [
  { id: "eventos", label: "Eventos", emoji: "⚡" },
  { id: "relacoes", label: "Relações", emoji: "🔗" },
  { id: "tipos", label: "Tipos", emoji: "🏷️" },
  { id: "catalogos", label: "Catálogos", emoji: "📚" },
  { id: "usuarios", label: "Usuários", emoji: "👥" },
];

interface AdminUser { id: number; login: string; tier: number; displayName?: string | null; }

async function checkAdmSession(): Promise<AdminUser | null> {
  try {
    const r = await fetch(`${API}/api/auth/me`, { credentials: "include" });
    const d = await r.json() as { user: AdminUser | null };
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
  if (!r.ok) { const d = await r.json() as { error?: string }; throw new Error(d.error ?? "Erro"); }
}

// ─── Login Adm ────────────────────────────────────────────────────────────────
function AdmLogin({ onLogin }: { onLogin: (u: AdminUser) => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await doLogin(login, password);
      const user = await checkAdmSession();
      if (!user) { setError("Acesso negado. Apenas administradores."); }
      else onLogin(user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🦉</div>
          <h1 className="text-xl font-bold text-gray-900">PAP · Administração</h1>
          <p className="text-xs text-gray-400 mt-1">Acesso restrito — tier 5+</p>
        </div>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Login</label>
            <input type="text" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="login" required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Senha</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#F97316] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Página principal Adm ─────────────────────────────────────────────────────
export function AdmPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdmTab>("eventos");
  const [isaOpen, setIsaOpen] = useState(false);

  useEffect(() => {
    checkAdmSession().then((u) => { setAdminUser(u); setChecking(false); });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!adminUser) return <AdmLogin onLogin={(u) => setAdminUser(u)} />;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦉</span>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">PAP — Administração</h1>
            <p className="text-xs text-gray-500">
              Projeto Aliança Panorama · Sociedade Tucci
              <span className="ml-2 text-orange-500 font-medium">· {adminUser.displayName ?? adminUser.login}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsaOpen(!isaOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <span>🦉</span>
          <span>Falar com ISA</span>
          {isaOpen && <span className="w-2 h-2 bg-green-400 rounded-full" />}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E5E7EB] px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-120px)]">
        <div className={`flex-1 overflow-auto transition-all ${isaOpen ? "pr-0" : ""}`}>
          {activeTab === "eventos" && <AdmEventos />}
          {activeTab === "relacoes" && <AdmRelacoes />}
          {activeTab === "tipos" && <AdmTipos />}
          {activeTab === "catalogos" && <AdmCatalogos />}
          {activeTab === "usuarios" && <AdmUsuarios />}
        </div>
        {isaOpen && (
          <div className="w-96 border-l border-[#E5E7EB] bg-white flex-shrink-0">
            <IsaChat onClose={() => setIsaOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
