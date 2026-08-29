import { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
type Exception = { id: number; data: string; tipo: string; horaInicio?: string | null; horaFim?: string | null; descricao?: string | null };
type Patient = { id: number; nome: string; email: string; telefone?: string | null; status: string; observacoesPro?: string | null; createdAt: string };
type View = "agenda" | "pacientes" | "disponibilidade" | "sabia" | "feed";
type FeedItem = {
  tipo: "appointment" | "patient";
  id: string;
  titulo: string;
  status: string;
  canal?: string | null;
  data_evento?: string | null;
  ts: string;
  email?: string;
  lembrete48h_sent?: boolean;
  lembrete24h_sent?: boolean;
};
type Mode = "public" | "professional";
type AuthStep = "login" | "challenge" | "done";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const PATIENT_STATUS_LABEL: Record<string, string> = {
  email_pendente: "Email pendente", pendente_aprovacao: "Aguardando aprovação",
  aprovado: "Aprovado", recusado: "Recusado", suspenso: "Suspenso",
};
const PATIENT_STATUS_COLOR: Record<string, string> = {
  email_pendente: "#94a3b8", pendente_aprovacao: "#facc15",
  aprovado: "#4ade80", recusado: "#f87171", suspenso: "#fb923c",
};
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
  const [bookLgpd, setBookLgpd] = useState(false);
  const [bookDone, setBookDone] = useState(false);
  const [bookError, setBookError] = useState("");

  // Professional state
  const [view, setView] = useState<View>("agenda");
  const [appts, setAppts] = useState<Appt[]>([]);
  const [rules, setRules] = useState<AvailRule[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientFilter, setPatientFilter] = useState("todos");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appt | null>(null);
  const [apptNotes, setApptNotes] = useState("");
  const [undoRule, setUndoRule] = useState<{ id: number; label: string; timerId: ReturnType<typeof setTimeout> } | null>(null);

  // Patient registration (public)
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ nome: "", email: "", telefone: "" });
  const [regLgpd, setRegLgpd] = useState(false);
  const [regDone, setRegDone] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Email confirmation (via ?confirm= query param)
  const [confirmStatus, setConfirmStatus] = useState<"loading" | "ok" | "error" | null>(null);
  const [confirmMsg, setConfirmMsg] = useState("");

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
  // Exception form
  const [excForm, setExcForm] = useState({ data: "", tipo: "bloqueio", horaInicio: "", horaFim: "", descricao: "" });

  // Feed operacional
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  // SABIÁ popup flutuante
  const [sabiaOpen, setSabiaOpen] = useState(false);

  // Auth form
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  const loadAppts = useCallback(async () => {
    if (mode !== "professional") return;
    const de = new Date().toISOString().slice(0, 10);
    const ate = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    try {
      const r = await fetch(`${API}/api/age/${slug}/appointments?de=${de}&ate=${ate}`, { credentials: "include" });
      const data = await r.json() as Appt[];
      setAppts(data);
    } catch { /* silencia falha de rede */ }
  }, [mode, slug]);

  const loadRules = useCallback(() => {
    if (mode !== "professional") return;
    fetch(`${API}/api/age/${slug}/availability`, { credentials: "include" })
      .then(r => r.json()).then(setRules).catch(() => {});
  }, [mode, slug]);

  const loadExceptions = useCallback(() => {
    if (mode !== "professional") return;
    fetch(`${API}/api/age/${slug}/exceptions`, { credentials: "include" })
      .then(r => r.json()).then(setExceptions).catch(() => {});
  }, [mode, slug]);

  const loadPatients = useCallback(() => {
    if (mode !== "professional") return;
    fetch(`${API}/api/age/${slug}/patients?status=todos`, { credentials: "include" })
      .then(r => r.json()).then(setPatients).catch(() => {});
  }, [mode, slug]);

  const loadFeed = useCallback(async () => {
    if (mode !== "professional") return;
    setFeedLoading(true);
    try {
      const r = await fetch(`${API}/api/age/${slug}/feed?limit=60`, { credentials: "include" });
      if (r.ok) setFeedItems(await r.json() as FeedItem[]);
    } catch { /* silencia */ }
    setFeedLoading(false);
  }, [mode, slug]);

  useEffect(() => {
    if (mode === "professional" && authStep === "done") {
      loadAppts(); loadRules(); loadExceptions(); loadPatients(); loadFeed();
    }
  }, [mode, authStep, loadAppts, loadRules, loadExceptions, loadPatients, loadFeed]);

  // Confirmar email via ?confirm= na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("confirm");
    if (!token || !slug) return;
    setConfirmStatus("loading");
    fetch(`${API}/api/age/${slug}/confirm-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then((d: { ok?: boolean; message?: string; error?: string }) => {
        if (d.ok) { setConfirmStatus("ok"); setConfirmMsg(d.message ?? "Email confirmado!"); }
        else       { setConfirmStatus("error"); setConfirmMsg(d.error ?? "Link inválido."); }
        // Limpar query param sem recarregar
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(() => { setConfirmStatus("error"); setConfirmMsg("Sem conexão."); });
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

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
        body: JSON.stringify({ ...bookForm, dataHora: selectedSlot.dataHora, lgpdConsent: bookLgpd }),
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
    if (selectedAppt?.id === id) setSelectedAppt(null);
    await loadAppts();
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

  async function removeRule(id: number, label: string) {
    await fetch(`${API}/api/age/${slug}/availability/${id}`, {
      method: "DELETE", credentials: "include",
    });
    if (undoRule) clearTimeout(undoRule.timerId);
    const timerId = setTimeout(() => { setUndoRule(null); loadRules(); }, 5000);
    setUndoRule({ id, label, timerId });
  }

  async function restoreRule(id: number) {
    if (undoRule) clearTimeout(undoRule.timerId);
    setUndoRule(null);
    await fetch(`${API}/api/age/${slug}/availability/${id}`, {
      method: "PATCH", credentials: "include",
    });
    loadRules();
  }

  async function addException(e: React.FormEvent) {
    e.preventDefault();
    if (!excForm.data) return;
    await fetch(`${API}/api/age/${slug}/exceptions`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: excForm.data,
        tipo: excForm.tipo,
        horaInicio: excForm.horaInicio || null,
        horaFim: excForm.horaFim || null,
        descricao: excForm.descricao || null,
      }),
    });
    setExcForm({ data: "", tipo: "bloqueio", horaInicio: "", horaFim: "", descricao: "" });
    loadExceptions();
    loadSlots();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regForm.nome || !regForm.email) return;
    setRegLoading(true); setRegError("");
    try {
      const r = await fetch(`${API}/api/age/${slug}/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...regForm, lgpdConsent: regLgpd }),
      });
      const d = await r.json() as { ok?: boolean; message?: string; error?: string };
      if (d.ok) { setRegDone(true); }
      else setRegError(d.error ?? "Erro no cadastro.");
    } catch { setRegError("Sem conexão. Tente novamente."); }
    setRegLoading(false);
  }

  async function updatePatient(id: number, patch: Record<string, string>) {
    await fetch(`${API}/api/age/${slug}/patients/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (selectedPatient?.id === id) setSelectedPatient(null);
    loadPatients();
  }

  async function removeException(id: number) {
    await fetch(`${API}/api/age/${slug}/exceptions/${id}`, {
      method: "DELETE", credentials: "include",
    });
    loadExceptions();
    loadSlots();
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
              <div style={{ position: "relative", marginBottom: 12 }}>
                <input
                  type={showPassword ? "text" : "password"} placeholder="Senha" value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}44`, borderRadius: 8, padding: "10px 40px 10px 14px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
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
          {/* Consentimento LGPD */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={bookLgpd} onChange={e => setBookLgpd(e.target.checked)}
              style={{ marginTop: 2, accentColor: color, flexShrink: 0 }} />
            <span style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>
              Li e aceito a{" "}
              <a href={`/aliancapanorama/age/privacidade`} target="_blank" rel="noopener noreferrer"
                style={{ color, textDecoration: "underline" }}>Política de Privacidade</a>{" "}
              e os{" "}
              <a href={`/aliancapanorama/age/termos`} target="_blank" rel="noopener noreferrer"
                style={{ color, textDecoration: "underline" }}>Termos de Uso</a>{" "}
              do Age. Meus dados serão usados exclusivamente para gestão da consulta.
            </span>
          </label>
          {bookError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 12 }}>{bookError}</div>}
          <button type="submit" disabled={!bookForm.nome || !bookLgpd}
            style={{ width: "100%", background: bookLgpd ? color : "#334155", color: bookLgpd ? "#080c10" : "#64748b", border: "none", borderRadius: 8, padding: "12px 0", fontWeight: 700, fontSize: 15, cursor: (bookForm.nome && bookLgpd) ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
            Confirmar agendamento
          </button>
        </form>
      </div>
    );

    return (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Horários disponíveis</h2>
        {Object.keys(grouped).length === 0 && (
          <div style={{ color: "#64748b", fontSize: 14, textAlign: "center", padding: "2rem", lineHeight: 1.7 }}>
            Nenhum horário disponível no momento.<br />
            <span style={{ fontSize: 12 }}>Entre em contato para verificar disponibilidade.</span>
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

        {/* Registro como paciente */}
        <div style={{ borderTop: "1px solid #1e293b", marginTop: 16, paddingTop: 16 }}>
          {!showRegister ? (
            <button onClick={() => setShowRegister(true)}
              style={{ width: "100%", background: "transparent", border: `1px solid ${color}33`, borderRadius: 8, color: "#64748b", padding: "10px 0", cursor: "pointer", fontSize: 13 }}>
              Registrar-se como paciente de {prof.nome}
            </button>
          ) : regDone ? (
            <div style={{ background: "#052e16", border: "1px solid #4ade8055", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ color: "#4ade80", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Cadastro enviado!</div>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Verifique seu email para confirmar. Após a confirmação, {prof.nome} receberá uma notificação.</div>
            </div>
          ) : (
            <div style={{ background: "#0f1318", border: `1px solid ${color}22`, borderRadius: 12, padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ color, fontSize: 13, fontWeight: 600 }}>Cadastro de paciente</div>
                <button onClick={() => setShowRegister(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              <form onSubmit={handleRegister}>
                {[
                  { label: "Nome completo *", key: "nome", type: "text", placeholder: "Seu nome" },
                  { label: "Email *", key: "email", type: "email", placeholder: "seu@email.com" },
                  { label: "Telefone / WhatsApp", key: "telefone", type: "tel", placeholder: "(11) 99999-9999" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 10 }}>
                    <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 3 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} required={f.key !== "telefone"}
                      value={(regForm as any)[f.key]} onChange={e => setRegForm(rf => ({ ...rf, [f.key]: e.target.value }))}
                      style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 8, padding: "9px 12px", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                {/* Consentimento LGPD */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={regLgpd} onChange={e => setRegLgpd(e.target.checked)}
                    style={{ marginTop: 2, accentColor: color, flexShrink: 0 }} />
                  <span style={{ color: "#94a3b8", fontSize: 11, lineHeight: 1.5 }}>
                    Li e aceito a{" "}
                    <a href="/aliancapanorama/age/privacidade" target="_blank" rel="noopener noreferrer"
                      style={{ color, textDecoration: "underline" }}>Política de Privacidade</a>{" "}
                    e os{" "}
                    <a href="/aliancapanorama/age/termos" target="_blank" rel="noopener noreferrer"
                      style={{ color, textDecoration: "underline" }}>Termos de Uso</a>. Autorizo o uso dos meus dados para gestão do vínculo clínico.
                  </span>
                </label>
                {regError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 10 }}>{regError}</div>}
                <button type="submit" disabled={regLoading || !regForm.nome || !regForm.email || !regLgpd}
                  style={{ width: "100%", background: regLgpd ? color : "#334155", color: regLgpd ? "#080c10" : "#64748b", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: (regForm.nome && regForm.email && regLgpd) ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
                  {regLoading ? "Enviando…" : "Solicitar cadastro"}
                </button>
              </form>
            </div>
          )}
        </div>
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

  function PacientesView() {
    const filtered = patients.filter(p =>
      patientFilter === "todos" ? true : p.status === patientFilter
    );
    const color = prof?.cor ?? "#2dd4bf";

    const statusLabels: Record<string, string> = {
      email_pendente:      "Email pendente",
      pendente_aprovacao:  "Aguardando aprovação",
      aprovado:            "Aprovado",
      recusado:            "Recusado",
      suspenso:            "Suspenso",
    };
    const statusColors: Record<string, string> = {
      email_pendente:      "#94a3b8",
      pendente_aprovacao:  "#f59e0b",
      aprovado:            "#4ade80",
      recusado:            "#f87171",
      suspenso:            "#f97316",
    };

    return (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Pacientes</h2>

        {/* Filtro de status */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {["todos","pendente_aprovacao","aprovado","recusado","suspenso","email_pendente"].map(f => (
            <button key={f} onClick={() => setPatientFilter(f)}
              style={{ background: patientFilter === f ? color : "#1a2030", border: `1px solid ${color}33`, borderRadius: 20, color: patientFilter === f ? "#080c10" : "#94a3b8", padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              {f === "todos" ? "Todos" : (statusLabels[f] ?? f)}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ color: "#475569", textAlign: "center", padding: "32px 0" }}>Nenhum paciente nesta categoria.</div>
        )}

        {filtered.map(p => (
          <div key={p.id}
            style={{ background: "#0f1318", border: `1px solid ${color}22`, borderRadius: 12, padding: "12px 16px", marginBottom: 10, cursor: "pointer" }}
            onClick={() => setSelectedPatient(selectedPatient?.id === p.id ? null : p)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{p.nome}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{p.email}{p.telefone ? ` · ${p.telefone}` : ""}</div>
              </div>
              <span style={{ background: (statusColors[p.status] ?? "#64748b") + "22", color: statusColors[p.status] ?? "#64748b", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                {statusLabels[p.status] ?? p.status}
              </span>
            </div>

            {/* Painel expandido */}
            {selectedPatient?.id === p.id && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${color}22`, paddingTop: 12 }}>
                <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>
                  Cadastrado em {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                </div>
                <textarea
                  placeholder="Observações internas (não visíveis ao paciente)"
                  value={p.observacoesPro ?? ""}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setSelectedPatient({ ...p, observacoesPro: e.target.value })}
                  onBlur={() => updatePatient(p.id, { observacoesPro: selectedPatient.observacoesPro ?? "" })}
                  rows={2}
                  style={{ width: "100%", background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 8, padding: "8px 10px", color: "#e2e8f0", fontSize: 12, resize: "vertical", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {p.status === "pendente_aprovacao" && (
                    <>
                      <button onClick={e => { e.stopPropagation(); updatePatient(p.id, { status: "aprovado" }); }}
                        style={{ background: "#052e16", border: "1px solid #4ade8055", borderRadius: 8, color: "#4ade80", padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                        ✓ Aprovar
                      </button>
                      <button onClick={e => { e.stopPropagation(); updatePatient(p.id, { status: "recusado" }); }}
                        style={{ background: "#1f0a0a", border: "1px solid #f8717155", borderRadius: 8, color: "#f87171", padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                        ✕ Recusar
                      </button>
                    </>
                  )}
                  {p.status === "aprovado" && (
                    <button onClick={e => { e.stopPropagation(); updatePatient(p.id, { status: "suspenso" }); }}
                      style={{ background: "#1c1005", border: "1px solid #f9731655", borderRadius: 8, color: "#f97316", padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                      Suspender
                    </button>
                  )}
                  {(p.status === "recusado" || p.status === "suspenso") && (
                    <button onClick={e => { e.stopPropagation(); updatePatient(p.id, { status: "aprovado" }); }}
                      style={{ background: "#052e16", border: "1px solid #4ade8055", borderRadius: 8, color: "#4ade80", padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                      Reativar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function DisponibilidadeView() {
    return (
      <div style={{ padding: "1rem" }}>
        <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Horários disponíveis</h2>

        {/* Toast Desfazer */}
        {undoRule && (
          <div style={{ background: "#1a2030", border: `1px solid ${color}55`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Apagado.</span>
            <button onClick={() => restoreRule(undoRule.id)}
              style={{ background: color, border: "none", borderRadius: 6, color: "#080c10", padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              Desfazer
            </button>
          </div>
        )}

        {/* Regras recorrentes */}
        <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Regras semanais</div>
        {rules.length === 0 && <div style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Nenhuma regra configurada.</div>}
        {rules.map(r => (
          <div key={r.id} style={{ background: "#0f1318", border: `1px solid ${color}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color, fontWeight: 600, fontSize: 14 }}>{DIAS[r.diaSemana]} · {r.horaInicio}–{r.horaFim}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>{r.duracaoMin}min + {r.intervaloMin}min intervalo · {r.canal}</div>
            </div>
            <button onClick={() => removeRule(r.id, `${DIAS[r.diaSemana]} ${r.horaInicio}–${r.horaFim}`)}
              style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        ))}

        {/* Exceções */}
        <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginTop: 20, marginBottom: 8 }}>Exceções</div>
        {exceptions.length === 0 && <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>Nenhuma exceção.</div>}
        {exceptions.map(e => (
          <div key={e.id} style={{ background: "#0f1318", border: "1px solid #f87171aa", borderRadius: 10, padding: "8px 14px", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#f87171", fontWeight: 600, fontSize: 13 }}>{e.data} · {e.tipo}</div>
              {e.horaInicio ? (
                <div style={{ color: "#64748b", fontSize: 11 }}>{e.horaInicio}–{e.horaFim}</div>
              ) : (
                <div style={{ color: "#64748b", fontSize: 11 }}>dia inteiro</div>
              )}
              {e.descricao && <div style={{ color: "#475569", fontSize: 11 }}>{e.descricao}</div>}
            </div>
            <button onClick={() => removeException(e.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        ))}

        {/* Adicionar exceção */}
        <div style={{ background: "#0f1318", border: "1px solid #f8717122", borderRadius: 12, padding: "1rem", marginTop: 8, marginBottom: 16 }}>
          <div style={{ color: "#f87171", fontSize: 13, fontWeight: 600, marginBottom: 10 }}>+ Nova exceção</div>
          <form onSubmit={addException}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Data</label>
                <input type="date" required value={excForm.data} onChange={e => setExcForm(f => ({ ...f, data: e.target.value }))}
                  style={{ width: "100%", background: "#1a2030", border: "1px solid #f8717133", borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Tipo</label>
                <select value={excForm.tipo} onChange={e => setExcForm(f => ({ ...f, tipo: e.target.value }))}
                  style={{ width: "100%", background: "#1a2030", border: "1px solid #f8717133", borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }}>
                  {["bloqueio", "ferias", "feriado", "encaixe", "outro"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Descrição (opcional)</label>
                <input type="text" placeholder="ex: reunião" value={excForm.descricao} onChange={e => setExcForm(f => ({ ...f, descricao: e.target.value }))}
                  style={{ width: "100%", background: "#1a2030", border: "1px solid #f8717133", borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Início (vazio = dia inteiro)</label>
                <input type="time" value={excForm.horaInicio} onChange={e => setExcForm(f => ({ ...f, horaInicio: e.target.value }))}
                  style={{ width: "100%", background: "#1a2030", border: "1px solid #f8717133", borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }} />
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, display: "block", marginBottom: 4 }}>Fim</label>
                <input type="time" value={excForm.horaFim} onChange={e => setExcForm(f => ({ ...f, horaFim: e.target.value }))}
                  style={{ width: "100%", background: "#1a2030", border: "1px solid #f8717133", borderRadius: 6, color: "#e2e8f0", padding: "8px 10px", fontSize: 13 }} />
              </div>
            </div>
            <button type="submit" style={{ width: "100%", background: "#f87171", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Bloquear data
            </button>
          </form>
        </div>

        {/* Adicionar regra recorrente */}
        <div style={{ background: "#0f1318", border: `1px solid ${color}22`, borderRadius: 12, padding: "1rem" }}>
          <div style={{ color, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>+ Nova regra semanal</div>
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

  function FeedView() {
    const FEED_ICON: Record<string, string> = {
      appointment: "📅",
      patient: "👤",
    };
    const FEED_TIPO_LABEL: Record<string, string> = {
      appointment: "Consulta",
      patient: "Paciente",
    };
    const APPT_STATUS_LABEL: Record<string, string> = {
      disponivel: "Disponível", reservado: "Reservado", confirmado: "Confirmado",
      realizado: "Realizado", cancelado: "Cancelado", faltou: "Faltou", remarcado: "Remarcado",
    };
    const APPT_STATUS_COLOR: Record<string, string> = {
      disponivel: "#2dd4bf", reservado: "#facc15", confirmado: "#4ade80",
      realizado: "#94a3b8", cancelado: "#f87171", faltou: "#fb923c", remarcado: "#a78bfa",
    };
    const PAT_STATUS_COLOR: Record<string, string> = {
      email_pendente: "#94a3b8", pendente_aprovacao: "#facc15",
      aprovado: "#4ade80", recusado: "#f87171", suspenso: "#fb923c",
    };
    const PAT_STATUS_LABEL: Record<string, string> = {
      email_pendente: "Email pendente", pendente_aprovacao: "Aguardando aprovação",
      aprovado: "Aprovado", recusado: "Recusado", suspenso: "Suspenso",
    };

    function timeAgo(ts: string) {
      const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
      if (diff < 60)    return "agora";
      if (diff < 3600)  return `${Math.floor(diff/60)}min atrás`;
      if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
      return `${Math.floor(diff/86400)}d atrás`;
    }

    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>Feed — Atividade recente</h2>
          <button onClick={loadFeed} disabled={feedLoading}
            style={{ background: "none", border: `1px solid ${color}44`, borderRadius: 6, color, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>
            {feedLoading ? "..." : "Atualizar"}
          </button>
        </div>

        {feedLoading && feedItems.length === 0 && (
          <div style={{ color: "#475569", fontSize: 14 }}>Carregando feed...</div>
        )}
        {!feedLoading && feedItems.length === 0 && (
          <div style={{ color: "#475569", fontSize: 14 }}>Nenhuma atividade recente.</div>
        )}

        {feedItems.map((item, i) => {
          const isAppt = item.tipo === "appointment";
          const statusColor = isAppt
            ? (APPT_STATUS_COLOR[item.status] ?? "#64748b")
            : (PAT_STATUS_COLOR[item.status] ?? "#64748b");
          const statusLabel = isAppt
            ? (APPT_STATUS_LABEL[item.status] ?? item.status)
            : (PAT_STATUS_LABEL[item.status] ?? item.status);

          return (
            <div key={`${item.tipo}-${item.id}-${i}`} style={{
              background: "#0f1318",
              border: `1px solid ${statusColor}33`,
              borderLeft: `3px solid ${statusColor}`,
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 8,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{FEED_ICON[item.tipo]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.titulo}
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", flexShrink: 0 }}>{timeAgo(item.ts)}</div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{FEED_TIPO_LABEL[item.tipo]}</span>
                  <span style={{ fontSize: 11, color: statusColor, fontWeight: 700, background: statusColor + "22", borderRadius: 4, padding: "1px 6px" }}>
                    {statusLabel}
                  </span>
                  {isAppt && item.canal && (
                    <span style={{ fontSize: 11, color: "#64748b" }}>{item.canal}</span>
                  )}
                  {isAppt && item.data_evento && (
                    <span style={{ fontSize: 11, color: "#475569" }}>
                      {fmtDate(item.data_evento, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
                {isAppt && (item.lembrete48h_sent || item.lembrete24h_sent) && (
                  <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
                    {item.lembrete48h_sent && (
                      <span style={{ fontSize: 10, color: "#4ade80", background: "#052e16", borderRadius: 4, padding: "1px 6px" }}>✓ 48h</span>
                    )}
                    {item.lembrete24h_sent && (
                      <span style={{ fontSize: 10, color: "#4ade80", background: "#052e16", borderRadius: 4, padding: "1px 6px" }}>✓ 24h</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function SabiaView() {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
        {/* Disclaimer CFP/LGPD — obrigatório */}
        <div style={{ background: "#0c1a12", border: "1px solid #4ade8033", borderRadius: 8, margin: "0.75rem 1rem 0", padding: "8px 12px", fontSize: 11, color: "#6b8f6b", lineHeight: 1.5 }}>
          🐦 <strong>SABIÁ é assistente de agenda</strong>, não substituta de avaliação clínica. Não emite laudos nem toma decisões sobre pacientes. Conforme CFP Resolução 11/2018.
        </div>
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
            <img src="/aliancapanorama/age-logo.png" alt="Age" style={{ width: 32, height: 32, objectFit: "contain" }} />
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
            {([["agenda", "Agenda"], ["pacientes", "Pacientes"], ["disponibilidade", "Regras"], ["feed", "Feed 📋"], ["sabia", "SABIÁ 🐦"]] as [View, string][]).map(([v, label]) => (
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
        {/* Banner de confirmação de email */}
        {confirmStatus && (
          <div style={{ margin: "1rem", padding: "12px 16px", borderRadius: 10, background: confirmStatus === "ok" ? "#052e16" : "#1c0a0a", border: `1px solid ${confirmStatus === "ok" ? "#4ade80" : "#f87171"}55` }}>
            <span style={{ color: confirmStatus === "ok" ? "#4ade80" : "#f87171", fontSize: 14 }}>
              {confirmStatus === "loading" ? "Confirmando…" : confirmMsg}
            </span>
          </div>
        )}

        {mode === "public" || authStep !== "done" ? (
          <>
            {prof.bio && (
              <div style={{ padding: "1rem 1rem 0" }}>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{prof.bio}</p>
              </div>
            )}
            {PublicView()}
          </>
        ) : (
          <>
            {view === "agenda"          && AgendaView()}
            {view === "pacientes"       && PacientesView()}
            {view === "disponibilidade" && DisponibilidadeView()}
            {view === "feed"            && FeedView()}
            {view === "sabia"           && SabiaView()}
          </>
        )}
      </div>

      {/* Login modal */}
      {(mode as string) === "login" && authStep !== "done" && LoginModal()}

      {/* SABIÁ popup flutuante (profissional logada, fora da aba SABIÁ) */}
      {mode === "professional" && authStep === "done" && view !== "sabia" && (
        <>
          {/* Botão flutuante */}
          <button
            onClick={() => setSabiaOpen(o => !o)}
            title={sabiaOpen ? "Fechar SABIÁ" : "Abrir SABIÁ"}
            style={{
              position: "fixed", bottom: 20, right: 20, zIndex: 1000,
              width: 52, height: 52, borderRadius: "50%",
              background: sabiaOpen ? "#1e293b" : color,
              border: `2px solid ${color}`,
              color: sabiaOpen ? color : "#080c10",
              fontSize: 22, cursor: "pointer",
              boxShadow: `0 4px 20px ${color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            {sabiaOpen ? "✕" : "🐦"}
          </button>

          {/* Painel do chat */}
          {sabiaOpen && (
            <div style={{
              position: "fixed", bottom: 84, right: 20, zIndex: 999,
              width: 340, maxWidth: "calc(100vw - 40px)",
              height: 440, maxHeight: "70vh",
              background: "#0a0f16",
              border: `1px solid ${color}44`,
              borderRadius: 16,
              display: "flex", flexDirection: "column",
              boxShadow: `0 8px 32px ${color}22`,
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🐦</span>
                <span style={{ color, fontWeight: 700, fontSize: 13 }}>SABIÁ</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 10, color: "#475569" }}>assistente de agenda</span>
              </div>

              {/* Disclaimer */}
              <div style={{ padding: "6px 12px", background: "#0c1a12", borderBottom: "1px solid #1e293b33", fontSize: 10, color: "#4a6b4a", lineHeight: 1.4 }}>
                Suporte operacional apenas. Não substitui avaliação clínica. CFP 11/2018.
              </div>

              {/* Mensagens */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    {m.role === "assistant" && <span style={{ marginRight: 6, fontSize: 14, alignSelf: "flex-end" }}>🐦</span>}
                    <div style={{
                      maxWidth: "82%", borderRadius: 10, padding: "7px 10px", fontSize: 12, lineHeight: 1.5,
                      background: m.role === "user" ? colorDark : "#1a2030",
                      border: `1px solid ${m.role === "user" ? color + "44" : "#ffffff18"}`,
                      color: m.role === "user" ? color : "#e2e8f0",
                    }}>{m.content}</div>
                  </div>
                ))}
                {sabiaLoading && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <span style={{ marginRight: 6, fontSize: 14 }}>🐦</span>
                    <div style={{ background: "#1a2030", border: "1px solid #ffffff18", borderRadius: 10, padding: "7px 10px", color: "#64748b", fontSize: 12 }}>
                      <span style={{ animation: "pulse 1s infinite" }}>pensando…</span>
                    </div>
                  </div>
                )}
                <div ref={msgBottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendSabia} style={{ padding: "8px 12px", borderTop: "1px solid #1e293b", display: "flex", gap: 6 }}>
                <input
                  value={sabiaInput}
                  onChange={e => setSabiaInput(e.target.value)}
                  placeholder="Pergunte à SABIÁ…"
                  disabled={sabiaLoading}
                  style={{ flex: 1, background: "#1a2030", border: `1px solid ${color}33`, borderRadius: 8, color: "#e2e8f0", padding: "7px 10px", fontSize: 12 }}
                />
                <button type="submit" disabled={sabiaLoading || !sabiaInput.trim()}
                  style={{ background: color, border: "none", borderRadius: 8, color: "#080c10", padding: "7px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                  →
                </button>
              </form>
            </div>
          )}
        </>
      )}

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
