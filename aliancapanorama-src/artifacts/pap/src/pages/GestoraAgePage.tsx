import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Paciente = { id: number; nome: string; email: string; telefone?: string; created_at: string };
type Agendamento = { id: number; patient_nome: string; data_hora: string; status: string; canal: string };
type Profissional = {
  id: number; slug: string; nome: string; cor: string; tipo: string;
  pacientesPendentes: Paciente[];
  agendaHoje: Agendamento[];
  totalPacientes: number;
};

// ─── Login ────────────────────────────────────────────────────────────────────

function GestoraLogin({ onSuccess }: { onSuccess: (nome: string) => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha.trim() || loading) return;
    setLoading(true); setErro("");
    try {
      const r = await fetch(`${API}/api/age/gestora/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), senha }),
      });
      const d = await r.json();
      if (r.ok) onSuccess(d.nome);
      else setErro(d.error ?? "Email ou senha incorretos.");
    } catch { setErro("Sem conexão. Tente de novo."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080c10", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24,
    }}>
      <div style={{ width: "min(360px, 100%)", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
        <h1 style={{ color: "#2dd4bf", fontWeight: 800, fontSize: 22, margin: "0 0 4px" }}>Painel Gestora</h1>
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 28px" }}>Age — Sociedade Tucci</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email" placeholder="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && entrar()}
            style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 10, color: "#e8e8e8", padding: "12px 16px", fontSize: 14, outline: "none" }}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showSenha ? "text" : "password"} placeholder="senha" value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === "Enter" && entrar()}
              style={{ width: "100%", boxSizing: "border-box", background: "#1a1a2e", border: "1px solid #333", borderRadius: 10, color: "#e8e8e8", padding: "12px 44px 12px 16px", fontSize: 14, outline: "none" }}
            />
            <button type="button" onClick={() => setShowSenha(s => !s)} tabIndex={-1}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: 16 }}>
              {showSenha ? "🙈" : "👁️"}
            </button>
          </div>
          {erro && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{erro}</p>}
          <button onClick={entrar} disabled={loading || !email.trim() || !senha.trim()}
            style={{ background: loading ? "#333" : "linear-gradient(135deg, #2dd4bf, #0ea5e9)", border: "none", borderRadius: 10, padding: 13, color: "#111", fontWeight: 800, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Entrando…" : "Entrar →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card Profissional ────────────────────────────────────────────────────────

function ProfCard({ prof, onAprovar, onRecusar, aprovando }: {
  prof: Profissional;
  onAprovar: (pacId: number) => void;
  onRecusar: (pacId: number) => void;
  aprovando: number | null;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: "#111827", border: `1px solid ${prof.cor}33`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${prof.cor}22`, border: `2px solid ${prof.cor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: prof.cor, fontWeight: 800 }}>
            {prof.nome[0]}
          </div>
          <div>
            <div style={{ color: prof.cor, fontWeight: 700, fontSize: 16 }}>{prof.nome}</div>
            <div style={{ color: "#666", fontSize: 12, textTransform: "capitalize" }}>{prof.tipo}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
          <div>
            <div style={{ color: "#e8e8e8", fontWeight: 700, fontSize: 18 }}>{prof.totalPacientes}</div>
            <div style={{ color: "#666", fontSize: 10 }}>pacientes</div>
          </div>
          <div>
            <div style={{ color: prof.pacientesPendentes.length > 0 ? "#f59e0b" : "#666", fontWeight: 700, fontSize: 18 }}>{prof.pacientesPendentes.length}</div>
            <div style={{ color: "#666", fontSize: 10 }}>pendentes</div>
          </div>
          <div>
            <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 18 }}>{prof.agendaHoje.length}</div>
            <div style={{ color: "#666", fontSize: 10 }}>hoje</div>
          </div>
        </div>
      </div>

      {/* Pacientes pendentes */}
      {prof.pacientesPendentes.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: `1px solid #333`, borderRadius: 8, color: "#f59e0b", fontSize: 12, padding: "6px 12px", cursor: "pointer", marginBottom: 8, width: "100%", textAlign: "left" }}>
            {expanded ? "▲" : "▼"} Aprovações pendentes ({prof.pacientesPendentes.length})
          </button>
          {expanded && prof.pacientesPendentes.map(pac => (
            <div key={pac.id} style={{ background: "#0f172a", borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ color: "#e8e8e8", fontWeight: 600, fontSize: 14 }}>{pac.nome}</div>
                <div style={{ color: "#666", fontSize: 11 }}>{pac.email}{pac.telefone ? ` · ${pac.telefone}` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => onAprovar(pac.id)}
                  disabled={aprovando === pac.id}
                  style={{ background: "#16a34a", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {aprovando === pac.id ? "…" : "Aprovar"}
                </button>
                <button
                  onClick={() => onRecusar(pac.id)}
                  disabled={aprovando === pac.id}
                  style={{ background: "#991b1b", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agenda hoje */}
      {prof.agendaHoje.length > 0 && (
        <div>
          <div style={{ color: "#666", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Agenda hoje</div>
          {prof.agendaHoje.map(ag => (
            <div key={ag.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #1f2937" }}>
              <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums", width: 40 }}>
                {new Date(ag.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span style={{ color: "#e8e8e8", fontSize: 13, flex: 1 }}>{ag.patient_nome ?? "Disponível"}</span>
              <span style={{ color: "#888", fontSize: 11 }}>{ag.canal}</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: ag.status === "confirmado" ? "#16a34a22" : "#f59e0b22", color: ag.status === "confirmado" ? "#34d399" : "#f59e0b" }}>
                {ag.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {prof.pacientesPendentes.length === 0 && prof.agendaHoje.length === 0 && (
        <p style={{ color: "#444", fontSize: 13, textAlign: "center", margin: 0 }}>Sem pendências ou agenda hoje.</p>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function GestoraDashboard({ nome, onLogout }: { nome: string; onLogout: () => void }) {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [aprovando, setAprovando] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/age/gestora/dashboard`, { credentials: "include" });
      const d = await r.json();
      if (r.ok) setProfissionais(d.profissionais);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function atualizarStatus(pacId: number, status: "aprovado" | "recusado") {
    setAprovando(pacId);
    try {
      await fetch(`${API}/api/age/gestora/pacientes/${pacId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      await load();
    } finally { setAprovando(null); }
  }

  const totalPendentes = profissionais.reduce((s, p) => s + p.pacientesPendentes.length, 0);

  return (
    <div style={{
      minHeight: "100vh", background: "#080c10",
      backgroundImage: "radial-gradient(ellipse at 15% 25%, rgba(45,212,191,0.06) 0%, transparent 50%), radial-gradient(ellipse at 85% 75%, rgba(14,165,233,0.04) 0%, transparent 50%)",
      color: "#e8e8e8", fontFamily: "system-ui, sans-serif", paddingBottom: 60,
    }}>
      {/* Header */}
      <div style={{ background: "#111827", borderBottom: "1px solid #1f2937", padding: "16px 20px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#2dd4bf" }}>🌸 Painel Gestora</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Age — {nome}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {totalPendentes > 0 && (
              <span style={{ background: "#f59e0b", color: "#111", borderRadius: 20, padding: "2px 10px", fontWeight: 800, fontSize: 12 }}>
                {totalPendentes} pendente{totalPendentes > 1 ? "s" : ""}
              </span>
            )}
            <button onClick={load} style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, padding: "6px 12px", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>↻</button>
            <button onClick={onLogout} style={{ background: "none", border: "1px solid #333", borderRadius: 8, padding: "6px 12px", color: "#666", fontSize: 12, cursor: "pointer" }}>Sair</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#666", padding: 40 }}>Carregando…</div>
        ) : (
          profissionais.map(prof => (
            <ProfCard
              key={prof.id} prof={prof} aprovando={aprovando}
              onAprovar={id => atualizarStatus(id, "aprovado")}
              onRecusar={id => atualizarStatus(id, "recusado")}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Gate ─────────────────────────────────────────────────────────────────────

export default function GestoraAgePage() {
  const [estado, setEstado] = useState<"verificando" | "login" | "ok">("verificando");
  const [nome, setNome] = useState("");

  useEffect(() => {
    fetch(`${API}/api/age/gestora/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.nome) { setNome(d.nome); setEstado("ok"); }
        else setEstado("login");
      })
      .catch(() => setEstado("login"));
  }, []);

  async function logout() {
    await fetch(`${API}/api/age/gestora/logout`, { method: "POST", credentials: "include" });
    setEstado("login");
  }

  if (estado === "verificando") {
    return (
      <div style={{ minHeight: "100vh", background: "#080c10", display: "flex", alignItems: "center", justifyContent: "center", color: "#2dd4bf", fontFamily: "system-ui, sans-serif" }}>
        Verificando acesso…
      </div>
    );
  }

  if (estado === "login") {
    return <GestoraLogin onSuccess={n => { setNome(n); setEstado("ok"); }} />;
  }

  return <GestoraDashboard nome={nome} onLogout={logout} />;
}
