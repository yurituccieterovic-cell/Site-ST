import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

type Prof = {
  id: number; slug: string; nome: string; tipo: string;
  registro?: string; especialidade?: string; bio?: string; cor: string;
};
type Slot = { dataHora: string; duracaoMin: number; canal: string };
type Appt = {
  id: number; patientNome?: string; patientTelefone?: string; patientEmail?: string;
  dataHora: string; duracaoMin: number; status: string; canal: string; observacoes?: string;
};
type AvailRule = {
  id: number; diaSemana: number; horaInicio: string; horaFim: string;
  duracaoMin: number; intervaloMin: number; canal: string;
};
type ChatMsg = { role: "user" | "assistant"; content: string };
type View = "agenda" | "pacientes" | "disponibilidade" | "sabia";
type Mode = "public" | "professional";
type AuthStep = "login" | "challenge" | "done";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível", reservado: "Reservado", confirmado: "Confirmado",
  realizado: "Realizado", cancelado: "Cancelado", faltou: "Faltou", remarcado: "Remarcado",
};
const STATUS_COLOR: Record<string, string> = {
  disponivel: "#2dd4bf", reservado: "#facc15", confirmado: "#4ade80",
  realizado: "#94a3b8", cancelado: "#f87171", faltou: "#fb923c", remarcado: "#a78bfa",
};

function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", ...opts });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}
function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });
}

// ─── Component principal ──────────────────────────────────────────────────────

export function AgePage() {
  const slug = window.location.pathname.split("/age/")[1]?.split("/")[0] ?? "";

  const [prof, setProf] = useState<Prof | null>(null);
  const [mode, setMode] = useState<Mode>("public");
  const [authStep, setAuthStep] = useState<AuthStep>("login");
  const [authNome, setAuthNome] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Public booking state
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookForm, setBookForm] = useState({ nome: "", telefone: "", email: "", canal: "presencial" });
  const [bookDone, setBookDone] = useState(false);
  const [bookError, setBookError] = useState("");

  // Professional state
  const [view, setView] = useState<View>("agenda");
  const [appts, setAppts] = useState<Appt[]>([]);
  const [rules, setRules] = useState<AvailRule[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appt | null>(null);
  const [apptNotes, setApptNotes] = useState("");

  // SABIÁ chat
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "assistant", content: "Olá! Sou a SABIÁ, sua assistente de agenda. Pode perguntar sobre sua semana, seus pacientes ou pedir sugestões. 🐦" }
  ]);
  const [sabiaInput, setSabiaInput] = useState("");
  const [sabiaLoading, setSabiaLoading] = useState(false);
  const [sabiaSessionId, setSabiaSessionId] = useState("");
  const msgBottomRef = useRef<HTMLDivElement>(null);

  // New rule form
  const [ruleForm, setRuleForm] = useState({ diaSemana: 1, horaInicio: "09:00", horaFim: "18:00", duracaoMin: 50, intervaloMin: 10, canal: "presencial" });

  // Auth form
  const [authPassword, setAuthPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Fetch profissional pública
  useEffect(() => {
    if (!slug) { setError("Profissional não especificada."); setLoading(false); return; }
    fetch(`${API}/api/age/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject("not found"))
      .then((p: Prof) => { setProf(p); setLoading(false); })
      .catch(() => { setError("Profissional não encontrada."); setLoading(false); });
  }, [slug]);

  // Verificar se já está logado
  useEffect(() => {
    fetch(`${API}/api/age/auth/me`, { credentials: "include" })
      .then(r => r.json())
      .then((d: { authenticated: boolean; nome?: string; slug?: string }) => {
        if (d.authenticated && d.slug === slug) {
          setMode("professional");
          setAuthStep("done");
          setAuthNome(d.nome ?? "");
        }
      })
      .catch(() => {});
  }, [slug]);

  // Carregar slots públicos
  const loadSlots = useCallback(() => {
    if (!slug) return;
    const de = new Date().toISOString().slice(0, 10);
    const ate = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    fetch(`${API}/api/age/${slug}/slots?de=${de}&ate=${ate}`)
      .then(r => r.json())
      .then(setSlots)
      .catch(() => {});
  }, [slug]);

  useEffect(() => { if (!loading) loadSlots(); }, [loading, loadSlots]);

  // Carregar agenda (professional)
  const loadAppts = useCallback(() => {
    if (mode !== "professional") return;
    const de = new Date().toISOString().slice(0, 10);
    const ate = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    fetch(`${API}/api/age/${slug}/appointments?de=${de}&ate=${ate}`, { credentials: "include" })
      .then(r => r.json()).then(setAppts).catch(() => {});
  }, [mode, slug]);

  const loadRules = useCallback(() => {
    if (mode !== "professional") return;
    fetch(`${API}/api/age/${slug}/availability`, { credentials: "include" })
      .then(r => r.json()).then(setRules).catch(() => {});
  }, [mode, slug]);

  useEffect(() => {
    if (mode === "professional" && authStep === "done") {
      loadAppts(); loadRules();
    }
  }, [mode, authStep, loadAppts, loadRules]);

  useEffect(() => {
    msgBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // ─── Auth handlers ──────────────────────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true); setAuthError("");
    try {
      const r = await fetch(`${API}/api/age/auth/login`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password: authPassword }),
      });
      const d = await r.json() as { ok?: boolean; challenge?: boolean; message?: string; nome?: string; slug?: string; error?: string };
      if (d.challenge) {
        setAuthStep("challenge");
        setAuthError(d.message ?? "Código enviado ao seu email.");
      } else if (d.ok) {
        setMode("professional"); setAuthStep("done"); setAuthNome(d.nome ?? "");
      } else {
        setAuthError(d.error ?? "Erro ao fazer login.");
      }
    } catch { setAuthError("Sem conexão. Tente novamente."); }
    setAuthLoading(false);
  }

  async function handleChallenge(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true); setAuthError("");
    try {
      const r = await fetch(`${API}/api/age/auth/verify-challenge`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, code: authCode }),
      });
      const d = await r.json() as { ok?: boolean; nome?: string; error?: string };
      if (d.ok) { setMode("professional"); setAuthStep("done"); setAuthNome(d.nome ?? ""); }
      else setAuthError(d.error ?? "Código incorreto.");
    } catch { setAuthError("Sem conexão. Tente novamente."); }
    setAuthLoading(false);
  }

  async function handleLogout() {
    await fetch(`${API}/api/age/auth/logout`, { method: "POST", credentials: "include" });
    setMode("public"); setAuthStep("login"); setAuthPassword(""); setAuthNome("");
  }

  // ─── Booking ────────────────────────────────────────────────────────────────

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot || !bookForm.nome) return;
    setBookError("");
    try {
      const r = await fetch(`${API}/api/age/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bookForm, dataHora: selectedSlot.dataHora }),
      });
      const d = await r.json() as { id?: number; error?: string };
      if (d.id) { setBookDone(true); loadSlots(); }
      else setBookError(d.error ?? "Erro ao marcar consulta.");
    } catch { setBookError("Sem conexão. Tente novamente."); }
  }

  // ─── Professional actions ───────────────────────────────────────────────────

  async function updateAppt(id: number, patch: Record<string, string>) {
    await fetch(`${API}/api/age/${slug}/appointments/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    loadAppts();
    if (selectedAppt?.id === id) setSelectedAppt(null);
  }

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`${API}/api/age/${slug}/availability`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ruleForm),
    });
    loadRules();
  }

  async function removeRule(id: number) {
    await fetch(`${API}/api/age/${slug}/availability/${id}`, {
      method: "DELETE", credentials: "include",
    });
    loadRules();
  }

  // ─── SABIÁ ──────────────────────────────────────────────────────────────────

  async function sendSabia(e: React.FormEvent) {
    e.preventDefault();
    if (!sabiaInput.trim() || sabiaLoading) return;
    const userMsg = sabiaInput.trim(); setSabiaInput("");
    setMsgs(m => [...m, { role: "user", content: userMsg }]);
    setSabiaLoading(true);
    try {
      const r = await fetch(`${API}/api/age/${slug}/sabia`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId: sabiaSessionId }),
      });
      const d = await r.json() as { reply?: string; sessionId?: string };
      setMsgs(m => [...m, { role: "assistant", content: d.reply ?? "Não consegui responder agora." }]);
      if (d.sessionId) setSabiaSessionId(d.sessionId);
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Sem conexão no momento." }]);
    }
    setSabiaLoading(false);
  }

  // ─── Render helpers ──────────────────────────────────────────────────────────

  const color = prof?.cor ?? "#2dd4bf";
  const colorDark = color + "33";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080c10", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#2dd4bf", fontSize: 14 }}>Carregando…</div>
    </div>
  );

  if (error || !prof) return (
    <div style={{ minHeight: "100vh", background: "#080c10", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#f87171", fontSize: 14 }}>{error || "Profissional não encontrada."}</div>
    </div>
  );

  // ─── LOGIN MODAL ─────────────────────────────────────────────────────────────

  function LoginModal() {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#0f1318", border: `1px solid ${color}44`, borderRadius: 16, padding: "2rem", width: 340, maxWidth: "90vw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <span style={{ fontSize: 28 }}>🐦</span>
            <div>
              <div style={{ color, fontWeight: 700, fontSize: 16 }}>SABIÁ</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>Acesso profissional — {prof.nome}</div>
            </div>
          </div>

          {authStep === "login" ? (
            <form onSubmit={handleLogin}>
              <input
                type="password" placeholder="Senha" value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}44`, borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
              />
              {authError && <div style={{ color: "#2dd4bf", fontSize: 12, marginBottom: 12 }}>{authError}</div>}
              <button type="submit" disabled={authLoading || !authPassword}
                style={{ width: "100%", background: authLoading ? "#1a2030" : color, color: "#080c10", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 14, cursor: authLoading ? "not-allowed" : "pointer" }}>
                {authLoading ? "Verificando…" : "Entrar"}
              </button>
              <button type="button" onClick={() => setMode("public")} style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", color: "#64748b", fontSize: 12, cursor: "pointer", padding: "6px 0" }}>
                Cancelar
              </button>
            </form>
          ) : (
            <form onSubmit={handleChallenge}>
              <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>
                Novo dispositivo detectado. Um código de 6 dígitos foi enviado para o seu email.
              </div>
              <input
                type="text" placeholder="Código de verificação" value={authCode} maxLength={6}
                onChange={e => setAuthCode(e.target.value.replace(/\D/g, ""))}
                style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}44`, borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, marginBottom: 12, boxSizing: "border-box", letterSpacing: 4, textAlign: "center" }}
              />
              {authError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>{authError}</div>}
              <button type="submit" disabled={authLoading || authCode.length < 6}
                style={{ width: "100%", background: authLoading ? "#1a2030" : color, color: "#080c10", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 14, cursor: authLoading ? "not-allowed" : "pointer" }}>
                {authLoading ? "Verificando…" : "Confirmar"}
              </button>
              <button type="button" onClick={() => setAuthStep("login")} style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", color: "#64748b", fontSize: 12, cursor: "pointer" }}>
                Voltar
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ─── PUBLIC BOOKING ───────────────────────────────────────────────────────────

  function PublicView() {
    // Agrupar slots por data
    const grouped = slots.reduce<Record<string, Slot[]>>((acc, s) => {
      const day = new Date(s.dataHora).toISOString().slice(0, 10);
      (acc[day] ??= []).push(s);
      return acc;
    }, {});

    if (bookDone) return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🐦</div>
        <div style={{ color: color, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Consulta marcada!</div>
        <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
          {selectedSlot && fmtDate(selectedSlot.dataHora, { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
        </div>
        <div style={{ color: "#64748b", fontSize: 13 }}>
          Você receberá uma confirmação em breve. Obrigado!
        </div>
        <button onClick={() => { setBookDone(false); setSelectedSlot(null); setBookForm({ nome: "", telefone: "", email: "", canal: "presencial" }); }}
          style={{ marginTop: 24, background: colorDark, border: `1px solid ${color}55`, borderRadius: 8, color, padding: "8px 24px", cursor: "pointer", fontSize: 14 }}>
          Marcar outro horário
        </button>
      </div>
    );

    if (selectedSlot) return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <button onClick={() => setSelectedSlot(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", marginBottom: 16, fontSize: 13 }}>
          ← Voltar
        </button>
        <div style={{ background: colorDark, border: `1px solid ${color}44`, borderRadius: 12, padding: "1rem", marginBottom: 20 }}>
          <div style={{ color, fontWeight: 700 }}>{fmtDate(selectedSlot.dataHora, { weekday: "long", day: "2-digit", month: "long" })}</div>
          <div style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700 }}>{fmtTime(selectedSlot.dataHora)}</div>
          <div style={{ color: "#94a3b8", fontSize: 12 }}>{selectedSlot.duracaoMin} minutos · {selectedSlot.canal}</div>
        </div>
        <form onSubmit={handleBook}>
          {[
            { label: "Seu nome *", key: "nome", type: "text", placeholder: "Nome completo" },
            { label: "Telefone / WhatsApp", key: "telefone", type: "tel", placeholder: "(11) 99999-9999" },
            { label: "Email", key: "email", type: "email", placeholder: "seu@email.com" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} required={f.key === "nome"}
                value={(bookForm as any)[f.key]} onChange={e => setBookForm(bf => ({ ...bf, [f.key]: e.target.value }))}
                style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          ))}
          {bookError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>{bookError}</div>}
          <button type="submit" disabled={!bookForm.nome}
            style={{ width: "100%", background: color, color: "#080c10", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 700, fontSize: 15, cursor: bookForm.nome ? "pointer" : "not-allowed" }}>
            Confirmar agendamento
          </button>
        </form>
      </div>
    );

    return (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Horários disponíveis</h2>
        {Object.keys(grouped).length === 0 && (
          <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "2rem" }}>
            Nenhum horário disponível nos próximos 30 dias.
          </div>
        )}
        {Object.entries(grouped).map(([day, daySlots]) => (
          <div key={day} style={{ marginBottom: 20 }}>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              {fmtDay(day + "T12:00:00")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {daySlots.map((s, i) => (
                <button key={i} onClick={() => setSelectedSlot(s)}
                  style={{ background: colorDark, border: `1px solid ${color}55`, borderRadius: 8, color, padding: "8px 14px", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "background 0.15s" }}>
                  {fmtTime(s.dataHora)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── PROFESSIONAL VIEWS ───────────────────────────────────────────────────────

  function AgendaView() {
    // Agrupar por data
    const grouped = appts.reduce<Record<string, Appt[]>>((acc, a) => {
      const day = new Date(a.dataHora).toISOString().slice(0, 10);
      (acc[day] ??= []).push(a);
      return acc;
    }, {});

    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>Agenda — próximos 30 dias</h2>
          <button onClick={loadAppts} style={{ background: "none", border: `1px solid ${color}44`, borderRadius: 6, color, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>
            Atualizar
          </button>
        </div>
        {appts.length === 0 && <div style={{ color: "#64748b", fontSize: 14 }}>Nenhum agendamento.</div>}
        {Object.entries(grouped).map(([day, dayAppts]) => (
          <div key={day} style={{ marginBottom: 20 }}>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              {fmtDay(day + "T12:00:00")}
            </div>
            {dayAppts.map(a => (
              <div key={a.id} onClick={() => { setSelectedAppt(a); setApptNotes(a.observacoes ?? ""); }}
                style={{ background: "#0f1318", border: `1px solid ${(STATUS_COLOR[a.status] ?? color) + "55"}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[a.status] ?? color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{fmtTime(a.dataHora)} — {a.patientNome ?? "Paciente"}</div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{STATUS_LABEL[a.status] ?? a.status} · {a.duracaoMin}min · {a.canal}</div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Modal de agendamento */}
        {selectedAppt && (
          <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ background: "#0f1318", border: `1px solid ${color}44`, borderRadius: 16, padding: "1.5rem", width: 380, maxWidth: "100%", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16 }}>{selectedAppt.patientNome ?? "Paciente"}</div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>{fmtDate(selectedAppt.dataHora, { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <button onClick={() => setSelectedAppt(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {["confirmado", "realizado", "cancelado", "faltou", "remarcado"].map(s => (
                  <button key={s} onClick={() => updateAppt(selectedAppt.id, { status: s })}
                    style={{ background: selectedAppt.status === s ? STATUS_COLOR[s] + "33" : "#1a2030", border: `1px solid ${STATUS_COLOR[s] ?? color}55`, borderRadius: 6, color: STATUS_COLOR[s] ?? "#e2e8f0", padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>

              {selectedAppt.patientTelefone && (
                <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>📱 {selectedAppt.patientTelefone}</div>
              )}
              {selectedAppt.patientEmail && (
                <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>✉️ {selectedAppt.patientEmail}</div>
              )}

              <textarea value={apptNotes} onChange={e => setApptNotes(e.target.value)} placeholder="Observações…" rows={3}
                style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 8, color: "#e2e8f0", fontSize: 13, padding: "8px 12px", boxSizing: "border-box", resize: "vertical", marginBottom: 10 }}
              />
              <button onClick={() => updateAppt(selectedAppt.id, { observacoes: apptNotes })}
                style={{ width: "100%", background: colorDark, border: `1px solid ${color}44`, borderRadius: 8, color, padding: "8px 0", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Salvar observações
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function DisponibilidadeView() {
    return (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Horários disponíveis</h2>

        {/* Regras existentes */}
        {rules.length === 0 && <div style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Nenhuma regra configurada.</div>}
        {rules.map(r => (
          <div key={r.id} style={{ background: "#0f1318", border: `1px solid ${color}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color, fontWeight: 600, fontSize: 14 }}>{DIAS[r.diaSemana]} · {r.horaInicio}–{r.horaFim}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>{r.duracaoMin}min + {r.intervaloMin}min intervalo · {r.canal}</div>
            </div>
            <button onClick={() => removeRule(r.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        ))}

        {/* Adicionar regra */}
        <div style={{ background: "#0f1318", border: `1px solid ${color}22`, borderRadius: 12, padding: "1rem", marginTop: 16 }}>
          <div style={{ color, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>+ Nova regra</div>
          <form onSubmit={addRule}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Dia da semana</label>
                <select value={ruleForm.diaSemana} onChange={e => setRuleForm(f => ({ ...f, diaSemana: Number(e.target.value) }))}
                  style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }}>
                  {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Canal</label>
                <select value={ruleForm.canal} onChange={e => setRuleForm(f => ({ ...f, canal: e.target.value }))}
                  style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }}>
                  {["presencial", "online", "ambos"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Início</label>
                <input type="time" value={ruleForm.horaInicio} onChange={e => setRuleForm(f => ({ ...f, horaInicio: e.target.value }))}
                  style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Fim</label>
                <input type="time" value={ruleForm.horaFim} onChange={e => setRuleForm(f => ({ ...f, horaFim: e.target.value }))}
                  style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Duração (min)</label>
                <input type="number" value={ruleForm.duracaoMin} min={15} max={180} onChange={e => setRuleForm(f => ({ ...f, duracaoMin: Number(e.target.value) }))}
                  style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Intervalo (min)</label>
                <input type="number" value={ruleForm.intervaloMin} min={0} max={60} onChange={e => setRuleForm(f => ({ ...f, intervaloMin: Number(e.target.value) }))}
                  style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }} />
              </div>
            </div>
            <button type="submit" style={{ width: "100%", background: color, color: "#080c10", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Adicionar regra
            </button>
          </form>
        </div>
      </div>
    );
  }

  function SabiaView() {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: 12 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && <span style={{ marginRight: 8, fontSize: 18 }}>🐦</span>}
              <div style={{
                maxWidth: "80%", borderRadius: 12, padding: "10px 14px", fontSize: 13, lineHeight: 1.5,
                background: m.role === "user" ? colorDark : "#1a2030",
                border: `1px solid ${m.role === "user" ? color + "55" : "#ffffff22"}`,
                color: m.role === "user" ? color : "#e2e8f0",
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {sabiaLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <span style={{ marginRight: 8, fontSize: 18 }}>🐦</span>
              <div style={{ background: "#1a2030", border: "1px solid #ffffff22", borderRadius: 12, padding: "10px 14px", color: "#64748b", fontSize: 13 }}>
                <span style={{ animation: "pulse 1s infinite" }}>SABIÁ está pensando…</span>
              </div>
            </div>
          )}
          <div ref={msgBottomRef} />
        </div>
        <form onSubmit={sendSabia} style={{ padding: "0.75rem 1rem", borderTop: "1px solid #1e293b", display: "flex", gap: 8 }}>
          <input value={sabiaInput} onChange={e => setSabiaInput(e.target.value)} placeholder="Pergunte à SABIÁ…"
            style={{ flex: 1, background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14 }} />
          <button type="submit" disabled={!sabiaInput.trim() || sabiaLoading}
            style={{ background: color, border: "none", borderRadius: 8, padding: "0 16px", color: "#080c10", fontWeight: 700, cursor: "pointer", fontSize: 18 }}>
            ↑
          </button>
        </form>
      </div>
    );
  }

  // ─── LAYOUT ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0a0f16", borderBottom: "1px solid #1e293b", padding: "0 1rem" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🐦</span>
            <div>
              <div style={{ color, fontWeight: 700, fontSize: 15 }}>{prof.nome}</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>{prof.tipo}{prof.registro ? ` · ${prof.registro}` : ""}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {mode === "professional" ? (
              <>
                <span style={{ color: "#64748b", fontSize: 12 }}>{authNome}</span>
                <button onClick={handleLogout} style={{ background: "#1a2030", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>
                  Sair
                </button>
              </>
            ) : (
              <button onClick={() => setMode("login" as any)}
                style={{ background: colorDark, border: `1px solid ${color}44`, borderRadius: 6, color, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nav (professional only) */}
      {mode === "professional" && authStep === "done" && (
        <div style={{ background: "#0a0f16", borderBottom: "1px solid #1e293b" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex" }}>
            {([["agenda", "Agenda"], ["disponibilidade", "Disponibilidade"], ["sabia", "SABIÁ 🐦"]] as [View, string][]).map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "10px 16px", background: "none", border: "none", borderBottom: view === v ? `2px solid ${color}` : "2px solid transparent", color: view === v ? color : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: view === v ? 700 : 400 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {mode === "public" || authStep !== "done" ? (
          <>
            {prof.bio && (
              <div style={{ padding: "1rem 1rem 0" }}>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{prof.bio}</p>
              </div>
            )}
            <PublicView />
          </>
        ) : (
          <>
            {view === "agenda"          && <AgendaView />}
            {view === "disponibilidade" && <DisponibilidadeView />}
            {view === "sabia"           && <SabiaView />}
          </>
        )}
      </div>

      {/* Login modal */}
      {(mode as string) === "login" && authStep !== "done" && <LoginModal />}

      <style>{`
        * { box-sizing: border-box; }
        input, select, textarea, button { outline: none; font-family: inherit; }
        input:focus, select:focus, textarea:focus { border-color: ${color} !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f16; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
      `}</style>
    </div>
  );
}
