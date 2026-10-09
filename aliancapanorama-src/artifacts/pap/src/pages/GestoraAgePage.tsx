import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Paciente = { id: number; nome: string; email: string; telefone?: string; created_at: string };
type Agendamento = { id: number; patient_nome: string; patient_id?: number | null; data_hora: string; status: string; canal: string; observacao?: string | null };
type Mensalidade = { mes: string; pago: boolean; pagoAt: string | null; valorReais: number | null };
type Profissional = {
  id: number; slug: string; nome: string; cor: string; tipo: string; email: string | null;
  pacientesPendentes: Paciente[];
  agendaHoje: Agendamento[];
  totalPacientes: number;
  agendamentosRealizados: number;
  inadimplentes: number;
  alertasAtivos: number;
  mensalidadeAtual: Mensalidade;
};

// ─── Login ────────────────────────────────────────────────────────────────────

function GestoraLogin({ onSuccess, resetToken }: { onSuccess: (nome: string) => void; resetToken?: string }) {
  const [mode, setMode] = useState<"login" | "forgot" | "reset">(resetToken ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novaSenha2, setNovaSenha2] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = { background: "#1a1a2e", border: "1px solid #333", borderRadius: 10, color: "#e8e8e8", padding: "12px 16px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const };
  const btnStyle = (disabled: boolean) => ({ background: disabled ? "#333" : "linear-gradient(135deg, #2dd4bf, #0ea5e9)", border: "none", borderRadius: 10, padding: 13, color: "#111", fontWeight: 800, fontSize: 14, cursor: disabled ? "not-allowed" as const : "pointer" as const });

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

  async function enviarReset() {
    if (!email.trim() || loading) return;
    setLoading(true); setErro("");
    try {
      await fetch(`${API}/api/age/gestora/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setMsg("Se o email estiver cadastrado, você receberá um link em instantes.");
    } catch { setErro("Sem conexão. Tente de novo."); }
    finally { setLoading(false); }
  }

  async function redefinirSenha() {
    if (novaSenha !== novaSenha2) { setErro("As senhas não conferem."); return; }
    if (novaSenha.length < 6) { setErro("Senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true); setErro("");
    try {
      const r = await fetch(`${API}/api/age/gestora/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, senha: novaSenha }),
      });
      const d = await r.json() as { ok?: boolean; nome?: string; error?: string };
      if (r.ok) setMsg(`Senha redefinida! Olá ${d.nome}. Pode entrar agora.`);
      else setErro(d.error ?? "Erro ao redefinir senha.");
    } catch { setErro("Sem conexão. Tente de novo."); }
    finally { setLoading(false); }
  }

  const containerStyle = { minHeight: "100vh", background: "#080c10", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 };
  const cardStyle = { width: "min(360px, 100%)", textAlign: "center" as const };

  if (mode === "forgot") return (
    <div style={containerStyle}><div style={cardStyle}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
      <h1 style={{ color: "#2dd4bf", fontWeight: 800, fontSize: 22, margin: "0 0 4px" }}>Recuperar Acesso</h1>
      <p style={{ color: "#666", fontSize: 13, margin: "0 0 28px" }}>Enviaremos um link de redefinição</p>
      {msg ? <p style={{ color: "#2dd4bf", fontSize: 14, background: "#0d2b2b", borderRadius: 10, padding: "12px 16px", margin: "0 0 16px" }}>{msg}</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" placeholder="seu email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && enviarReset()} style={inputStyle} />
          {erro && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{erro}</p>}
          <button onClick={enviarReset} disabled={loading || !email.trim()} style={btnStyle(loading || !email.trim())}>
            {loading ? "Enviando…" : "Enviar link →"}
          </button>
        </div>
      )}
      <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginTop: 16 }}>← Voltar ao login</button>
    </div></div>
  );

  if (mode === "reset") return (
    <div style={containerStyle}><div style={cardStyle}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔑</div>
      <h1 style={{ color: "#2dd4bf", fontWeight: 800, fontSize: 22, margin: "0 0 4px" }}>Nova Senha</h1>
      <p style={{ color: "#666", fontSize: 13, margin: "0 0 28px" }}>Painel Gestora — Age</p>
      {msg ? <p style={{ color: "#2dd4bf", fontSize: 14, background: "#0d2b2b", borderRadius: 10, padding: "12px 16px", margin: "0 0 16px" }}>{msg}</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" placeholder="nova senha (mín. 6 caracteres)" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="confirmar senha" value={novaSenha2} onChange={e => setNovaSenha2(e.target.value)} onKeyDown={e => e.key === "Enter" && redefinirSenha()} style={inputStyle} />
          {erro && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{erro}</p>}
          <button onClick={redefinirSenha} disabled={loading || !novaSenha.trim()} style={btnStyle(loading || !novaSenha.trim())}>
            {loading ? "Salvando…" : "Salvar nova senha →"}
          </button>
        </div>
      )}
    </div></div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
        <h1 style={{ color: "#2dd4bf", fontWeight: 800, fontSize: 22, margin: "0 0 4px" }}>Painel Gestora</h1>
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 28px" }}>Age — Sociedade Tucci</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && entrar()} style={inputStyle} />
          <div style={{ position: "relative" }}>
            <input type={showSenha ? "text" : "password"} placeholder="senha" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && entrar()}
              style={{ ...inputStyle, paddingRight: 44 }} />
            <button type="button" onClick={() => setShowSenha(s => !s)} tabIndex={-1}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: 16 }}>
              {showSenha ? "🙈" : "👁️"}
            </button>
          </div>
          {erro && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{erro}</p>}
          <button onClick={entrar} disabled={loading || !email.trim() || !senha.trim()} style={btnStyle(loading || !email.trim() || !senha.trim())}>
            {loading ? "Entrando…" : "Entrar →"}
          </button>
          <button onClick={() => setMode("forgot")} style={{ background: "none", border: "none", color: "#666", fontSize: 12, cursor: "pointer", marginTop: 4 }}>
            Esqueci minha senha
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Bloquear ───────────────────────────────────────────────────────────

function BloquearModal({ prof, onClose, onDone }: {
  prof: Profissional;
  onClose: () => void;
  onDone: () => void;
}) {
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const maxBloq = prof.totalPacientes;

  async function confirmar() {
    setLoading(true); setErro("");
    try {
      const r = await fetch(`${API}/api/age/gestora/profissionais/${prof.id}/bloquear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantidade }),
      });
      const d = await r.json();
      if (r.ok) { onDone(); onClose(); }
      else setErro(d.error ?? "Erro ao bloquear.");
    } catch { setErro("Sem conexão."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: 16, padding: 28, width: "min(380px, 100%)", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ fontSize: 28, textAlign: "center", marginBottom: 12 }}>🔒</div>
        <h3 style={{ color: "#f87171", textAlign: "center", margin: "0 0 8px", fontWeight: 800, fontSize: 17 }}>Bloquear pacientes</h3>
        <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", margin: "0 0 20px", lineHeight: 1.5 }}>
          Bloqueia acesso de <strong style={{ color: "#e8e8e8" }}>N pacientes</strong> de <span style={{ color: prof.cor }}>{prof.nome}</span> por inadimplência de mensalidade.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 16 }}>
          <button
            onClick={() => setQuantidade(q => Math.max(1, q - 1))}
            style={{ width: 36, height: 36, borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#e8e8e8", fontSize: 18, cursor: "pointer" }}>
            −
          </button>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#f87171", minWidth: 40, textAlign: "center" }}>{quantidade}</span>
          <button
            onClick={() => setQuantidade(q => Math.min(maxBloq, q + 1))}
            style={{ width: 36, height: 36, borderRadius: 8, background: "#1f2937", border: "1px solid #374151", color: "#e8e8e8", fontSize: 18, cursor: "pointer" }}>
            +
          </button>
        </div>
        <p style={{ color: "#666", fontSize: 12, textAlign: "center", margin: "0 0 20px" }}>
          {maxBloq} paciente{maxBloq !== 1 ? "s" : ""} ativo{maxBloq !== 1 ? "s" : ""} disponíve{maxBloq !== 1 ? "is" : "l"}
        </p>
        {erro && <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", margin: "0 0 12px" }}>{erro}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "none", border: "1px solid #374151", borderRadius: 10, padding: 12, color: "#9ca3af", fontSize: 14, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={confirmar} disabled={loading}
            style={{ flex: 1, background: loading ? "#333" : "#991b1b", border: "none", borderRadius: 10, padding: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Bloqueando…" : `Bloquear ${quantidade}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card Profissional ────────────────────────────────────────────────────────

function ProfCard({ prof, onAprovar, onRecusar, aprovando, onRefresh }: {
  prof: Profissional;
  onAprovar: (pacId: number) => void;
  onRecusar: (pacId: number) => void;
  aprovando: number | null;
  onRefresh: () => void;
}) {
  const [aba, setAba] = useState<"pacientes" | "agenda" | "financeiro">("pacientes");
  const [showBloquear, setShowBloquear] = useState(false);

  // Agenda expandida: range + agendamentos carregados dinamicamente
  const todayStr = new Date().toISOString().slice(0, 10);
  const [agendaRange, setAgendaRange] = useState<"hoje" | "semana" | "14dias">("hoje");
  const [agendaItems, setAgendaItems] = useState<Agendamento[]>(prof.agendaHoje);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [atualizandoAppt, setAtualizandoAppt] = useState<number | null>(null);

  // Modal nova consulta
  const [showNovaConsulta, setShowNovaConsulta] = useState(false);
  const [novaForm, setNovaForm] = useState({ patientNome: "", dataHora: "", canal: "presencial", observacao: "" });
  const [novaLoading, setNovaLoading] = useState(false);
  const [novaErro, setNovaErro] = useState("");

  async function carregarAgenda(range: "hoje" | "semana" | "14dias") {
    setAgendaRange(range);
    setAgendaLoading(true);
    try {
      const dias = range === "hoje" ? 1 : range === "semana" ? 7 : 14;
      const toDate = new Date(); toDate.setDate(toDate.getDate() + dias);
      const to = toDate.toISOString().slice(0, 10);
      const r = await fetch(`${API}/api/age/gestora/profissionais/${prof.id}/agenda?from=${todayStr}&to=${to}`, { credentials: "include" });
      if (r.ok) { const d = await r.json() as { appointments: Agendamento[] }; setAgendaItems(d.appointments); }
    } finally { setAgendaLoading(false); }
  }

  async function mudarStatusAppt(id: number, status: string) {
    setAtualizandoAppt(id);
    try {
      await fetch(`${API}/api/age/gestora/appointments/${id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setAgendaItems(items => items.map(a => a.id === id ? { ...a, status } : a));
    } finally { setAtualizandoAppt(null); }
  }

  async function criarConsulta() {
    if (!novaForm.patientNome.trim() || !novaForm.dataHora) { setNovaErro("Nome e data/hora são obrigatórios"); return; }
    setNovaLoading(true); setNovaErro("");
    try {
      const r = await fetch(`${API}/api/age/gestora/profissionais/${prof.id}/appointments`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaForm),
      });
      const d = await r.json() as { id?: number; error?: string };
      if (r.ok) {
        setShowNovaConsulta(false);
        setNovaForm({ patientNome: "", dataHora: "", canal: "presencial", observacao: "" });
        await carregarAgenda(agendaRange);
      } else { setNovaErro(d.error ?? "Erro ao criar consulta"); }
    } catch { setNovaErro("Sem conexão. Tente novamente."); }
    finally { setNovaLoading(false); }
  }
  const [togglingMens, setTogglingMens] = useState(false);
  const [pendExpanded, setPendExpanded] = useState(false);

  async function toggleMensalidade() {
    setTogglingMens(true);
    const novoPago = !prof.mensalidadeAtual.pago;
    try {
      await fetch(`${API}/api/age/gestora/profissionais/${prof.id}/mensalidade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pago: novoPago }),
      });
      onRefresh();
    } finally { setTogglingMens(false); }
  }

  async function desbloquear() {
    await fetch(`${API}/api/age/gestora/profissionais/${prof.id}/desbloquear`, {
      method: "POST", credentials: "include",
    });
    onRefresh();
  }

  const mesFormatado = prof.mensalidadeAtual.mes
    ? new Date(prof.mensalidadeAtual.mes + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "-";

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
        {/* Stats rápidas */}
        <div style={{ display: "flex", gap: 14, textAlign: "center" }}>
          <div>
            <div style={{ color: "#e8e8e8", fontWeight: 700, fontSize: 18 }}>{prof.totalPacientes}</div>
            <div style={{ color: "#666", fontSize: 10 }}>ativos</div>
          </div>
          <div>
            <div style={{ color: prof.pacientesPendentes.length > 0 ? "#f59e0b" : "#666", fontWeight: 700, fontSize: 18 }}>{prof.pacientesPendentes.length}</div>
            <div style={{ color: "#666", fontSize: 10 }}>pendentes</div>
          </div>
          <div>
            <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 18 }}>{prof.agendamentosRealizados}</div>
            <div style={{ color: "#666", fontSize: 10 }}>realizados</div>
          </div>
          {prof.inadimplentes > 0 && (
            <div>
              <div style={{ color: "#f87171", fontWeight: 700, fontSize: 18 }}>{prof.inadimplentes}</div>
              <div style={{ color: "#666", fontSize: 10 }}>bloqueados</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "#0f172a", borderRadius: 10, padding: 4 }}>
        {(["pacientes", "agenda", "financeiro"] as const).map(t => (
          <button key={t} onClick={() => setAba(t)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: aba === t ? "#1f2937" : "transparent",
              color: aba === t ? (t === "financeiro" ? "#fbbf24" : prof.cor) : "#666",
            }}>
            {t === "pacientes" ? `Pacientes${prof.pacientesPendentes.length > 0 ? ` (${prof.pacientesPendentes.length})` : ""}` : t === "agenda" ? "Agenda" : "Financeiro"}
          </button>
        ))}
      </div>

      {/* Aba Pacientes */}
      {aba === "pacientes" && (
        <div>
          {prof.pacientesPendentes.length === 0 ? (
            <p style={{ color: "#444", fontSize: 13, textAlign: "center", margin: "8px 0" }}>Nenhuma aprovação pendente.</p>
          ) : (
            <>
              <button onClick={() => setPendExpanded(e => !e)}
                style={{ background: "none", border: "1px solid #333", borderRadius: 8, color: "#f59e0b", fontSize: 12, padding: "6px 12px", cursor: "pointer", marginBottom: 8, width: "100%", textAlign: "left" }}>
                {pendExpanded ? "▲" : "▼"} Aprovações pendentes ({prof.pacientesPendentes.length})
              </button>
              {pendExpanded && prof.pacientesPendentes.map(pac => (
                <div key={pac.id} style={{ background: "#0f172a", borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ color: "#e8e8e8", fontWeight: 600, fontSize: 14 }}>{pac.nome}</div>
                    <div style={{ color: "#666", fontSize: 11 }}>{pac.email}{pac.telefone ? ` · ${pac.telefone}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => onAprovar(pac.id)} disabled={aprovando === pac.id}
                      style={{ background: "#16a34a", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {aprovando === pac.id ? "…" : "Aprovar"}
                    </button>
                    <button onClick={() => onRecusar(pac.id)} disabled={aprovando === pac.id}
                      style={{ background: "#991b1b", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Aba Agenda */}
      {aba === "agenda" && (
        <div>
          {/* Range + Nova consulta */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 4, flex: 1 }}>
              {(["hoje", "semana", "14dias"] as const).map(r => (
                <button key={r} onClick={() => carregarAgenda(r)}
                  style={{ flex: 1, padding: "5px 0", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                    background: agendaRange === r ? "#1f2937" : "transparent",
                    color: agendaRange === r ? prof.cor : "#555" }}>
                  {r === "hoje" ? "Hoje" : r === "semana" ? "7 dias" : "14 dias"}
                </button>
              ))}
            </div>
            <button onClick={() => setShowNovaConsulta(true)}
              style={{ background: prof.cor + "22", border: `1px solid ${prof.cor}44`, borderRadius: 8, padding: "5px 12px", color: prof.cor, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              + Consulta
            </button>
          </div>

          {/* Modal nova consulta */}
          {showNovaConsulta && (
            <div style={{ background: "#0f172a", border: "1px solid #374151", borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ color: "#e8e8e8", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Nova consulta</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={novaForm.patientNome} onChange={e => setNovaForm(f => ({ ...f, patientNome: e.target.value }))}
                  placeholder="Nome do paciente *"
                  style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#e8e8e8", padding: "8px 12px", fontSize: 13, outline: "none" }} />
                <input type="datetime-local" value={novaForm.dataHora} onChange={e => setNovaForm(f => ({ ...f, dataHora: e.target.value }))}
                  style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#e8e8e8", padding: "8px 12px", fontSize: 13, outline: "none" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  {["presencial", "online", "telefone"].map(c => (
                    <button key={c} onClick={() => setNovaForm(f => ({ ...f, canal: c }))}
                      style={{ flex: 1, padding: "6px 0", borderRadius: 7, border: `1px solid ${novaForm.canal === c ? prof.cor : "#333"}`, background: novaForm.canal === c ? prof.cor + "22" : "transparent", color: novaForm.canal === c ? prof.cor : "#666", fontSize: 11, cursor: "pointer" }}>
                      {c}
                    </button>
                  ))}
                </div>
                <input value={novaForm.observacao} onChange={e => setNovaForm(f => ({ ...f, observacao: e.target.value }))}
                  placeholder="Observação (opcional)"
                  style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#e8e8e8", padding: "8px 12px", fontSize: 13, outline: "none" }} />
                {novaErro && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{novaErro}</p>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setShowNovaConsulta(false); setNovaErro(""); }}
                    style={{ flex: 1, background: "none", border: "1px solid #374151", borderRadius: 8, padding: 9, color: "#666", fontSize: 12, cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={() => void criarConsulta()} disabled={novaLoading}
                    style={{ flex: 1, background: novaLoading ? "#333" : prof.cor, border: "none", borderRadius: 8, padding: 9, color: "#111", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {novaLoading ? "Criando…" : "Agendar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de agendamentos */}
          {agendaLoading ? (
            <p style={{ color: "#444", fontSize: 12, textAlign: "center" }}>Carregando…</p>
          ) : agendaItems.length === 0 ? (
            <p style={{ color: "#444", fontSize: 13, textAlign: "center", margin: "8px 0" }}>Nenhuma consulta no período.</p>
          ) : agendaItems.map(ag => {
            const dt = new Date(ag.data_hora);
            const diaStr = dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
            const hrStr = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const isCancelado = ag.status === "cancelado";
            return (
              <div key={ag.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #1f2937", opacity: isCancelado ? 0.5 : 1 }}>
                <div style={{ width: 70, flexShrink: 0 }}>
                  <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: 12 }}>{hrStr}</div>
                  <div style={{ color: "#555", fontSize: 10 }}>{diaStr}</div>
                </div>
                <span style={{ color: "#e8e8e8", fontSize: 13, flex: 1, textDecoration: isCancelado ? "line-through" : "none" }}>{ag.patient_nome ?? "—"}</span>
                <span style={{ color: "#888", fontSize: 10, flexShrink: 0 }}>{ag.canal}</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, flexShrink: 0,
                  background: ag.status === "confirmado" ? "#16a34a22" : ag.status === "cancelado" ? "#37141422" : "#f59e0b22",
                  color: ag.status === "confirmado" ? "#34d399" : ag.status === "cancelado" ? "#666" : "#f59e0b" }}>
                  {ag.status}
                </span>
                {!isCancelado && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {ag.status !== "confirmado" && (
                      <button onClick={() => void mudarStatusAppt(ag.id, "confirmado")} disabled={atualizandoAppt === ag.id}
                        style={{ background: "#16a34a22", border: "1px solid #16a34a44", borderRadius: 6, padding: "3px 8px", color: "#34d399", fontSize: 10, cursor: "pointer" }}>
                        {atualizandoAppt === ag.id ? "…" : "✓"}
                      </button>
                    )}
                    <button onClick={() => void mudarStatusAppt(ag.id, "cancelado")} disabled={atualizandoAppt === ag.id}
                      style={{ background: "#991b1b22", border: "1px solid #991b1b44", borderRadius: 6, padding: "3px 8px", color: "#f87171", fontSize: 10, cursor: "pointer" }}>
                      {atualizandoAppt === ag.id ? "…" : "✗"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Aba Financeiro */}
      {aba === "financeiro" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mensalidade */}
          <div style={{ background: "#0f172a", borderRadius: 12, padding: 16 }}>
            <div style={{ color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Mensalidade — {mesFormatado}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  fontSize: 20, fontWeight: 800,
                  color: prof.mensalidadeAtual.pago ? "#34d399" : "#f87171",
                }}>
                  {prof.mensalidadeAtual.pago ? "✓ Pago" : "✗ Não pago"}
                </div>
                {prof.mensalidadeAtual.pagoAt && (
                  <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>
                    em {new Date(prof.mensalidadeAtual.pagoAt).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
              <button onClick={toggleMensalidade} disabled={togglingMens}
                style={{
                  background: prof.mensalidadeAtual.pago ? "#1f2937" : "linear-gradient(135deg, #16a34a, #15803d)",
                  border: "none", borderRadius: 10, padding: "10px 16px",
                  color: prof.mensalidadeAtual.pago ? "#666" : "#fff",
                  fontSize: 13, fontWeight: 700, cursor: togglingMens ? "not-allowed" : "pointer",
                }}>
                {togglingMens ? "…" : prof.mensalidadeAtual.pago ? "Marcar não pago" : "Registrar pagamento"}
              </button>
            </div>
          </div>

          {/* Resumo pacientes */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: "#0f172a", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ color: "#34d399", fontWeight: 800, fontSize: 22 }}>{prof.totalPacientes}</div>
              <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>pacientes ativos</div>
            </div>
            <div style={{ flex: 1, background: "#0f172a", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ color: "#60a5fa", fontWeight: 800, fontSize: 22 }}>{prof.agendamentosRealizados}</div>
              <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>consultas (30d)</div>
            </div>
            <div style={{ flex: 1, background: "#0f172a", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ color: prof.inadimplentes > 0 ? "#f87171" : "#666", fontWeight: 800, fontSize: 22 }}>{prof.inadimplentes}</div>
              <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>bloqueados</div>
            </div>
          </div>

          {/* Ações de bloqueio */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowBloquear(true)}
              disabled={prof.totalPacientes === 0}
              style={{
                flex: 1, background: prof.totalPacientes === 0 ? "#1f2937" : "#450a0a",
                border: `1px solid ${prof.totalPacientes === 0 ? "#374151" : "#991b1b"}`,
                borderRadius: 10, padding: "10px 14px", color: prof.totalPacientes === 0 ? "#444" : "#f87171",
                fontSize: 13, fontWeight: 700, cursor: prof.totalPacientes === 0 ? "not-allowed" : "pointer",
              }}>
              🔒 Bloquear pacientes
            </button>
            {prof.inadimplentes > 0 && (
              <button onClick={desbloquear}
                style={{ flex: 1, background: "#052e16", border: "1px solid #16a34a", borderRadius: 10, padding: "10px 14px", color: "#34d399", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                🔓 Desbloquear todos
              </button>
            )}
          </div>

          {!prof.mensalidadeAtual.pago && prof.totalPacientes > 0 && (
            <div style={{ background: "#450a0a33", border: "1px solid #991b1b44", borderRadius: 10, padding: 12 }}>
              <p style={{ color: "#f87171", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                ⚠️ Mensalidade de {mesFormatado} não registrada. Use "Bloquear pacientes" como alavanca de cobrança se necessário.
              </p>
            </div>
          )}
        </div>
      )}

      {showBloquear && (
        <BloquearModal
          prof={prof}
          onClose={() => setShowBloquear(false)}
          onDone={onRefresh}
        />
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
  const totalBloqueados = profissionais.reduce((s, p) => s + p.inadimplentes, 0);
  const inadimplentes = profissionais.filter(p => !p.mensalidadeAtual.pago);

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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {totalPendentes > 0 && (
              <span style={{ background: "#f59e0b", color: "#111", borderRadius: 20, padding: "2px 10px", fontWeight: 800, fontSize: 12 }}>
                {totalPendentes} pendente{totalPendentes > 1 ? "s" : ""}
              </span>
            )}
            {inadimplentes.length > 0 && (
              <span style={{ background: "#991b1b", color: "#fca5a5", borderRadius: 20, padding: "2px 10px", fontWeight: 800, fontSize: 12 }}>
                {inadimplentes.length} sem mensalidade
              </span>
            )}
            {totalBloqueados > 0 && (
              <span style={{ background: "#1f2937", color: "#f87171", borderRadius: 20, padding: "2px 10px", fontWeight: 700, fontSize: 12, border: "1px solid #991b1b" }}>
                {totalBloqueados} bloq.
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
              onRefresh={load}
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

  // Detectar token de reset na URL (?reset=TOKEN)
  const resetToken = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("reset") ?? undefined
    : undefined;

  useEffect(() => {
    if (resetToken) { setEstado("login"); return; }
    fetch(`${API}/api/age/gestora/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.nome) { setNome(d.nome); setEstado("ok"); }
        else setEstado("login");
      })
      .catch(() => setEstado("login"));
  }, [resetToken]);

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
    return <GestoraLogin onSuccess={n => { setNome(n); setEstado("ok"); }} resetToken={resetToken} />;
  }

  return <GestoraDashboard nome={nome} onLogout={logout} />;
}
