import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// ─── Login Gate MYYM ──────────────────────────────────────────────────────────

function JasmimLogin({ onSuccess }: { onSuccess: () => void }) {
  const [loginVal, setLoginVal] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!loginVal.trim() || !senha.trim() || loading) return;
    setLoading(true);
    setErro("");
    try {
      const r = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ login: loginVal.trim(), password: senha }),
      });
      if (r.ok) {
        onSuccess();
      } else {
        const d = await r.json().catch(() => ({}));
        setErro(d.error ?? "Login ou senha incorretos.");
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0f1a", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif", padding: 24,
    }}>
      <div style={{ width: "min(360px, 100%)", textAlign: "center" }}>
        {/* Esquilo-voador animado — patagium (membrana lateral real) */}
        <div style={{ width: 96, height: 96, margin: "0 auto 20px", position: "relative" }}>
          <style>{`
            @keyframes jmGlide {
              0%,100% { transform: translateY(0) rotate(-3deg); }
              50% { transform: translateY(-14px) rotate(3deg); }
            }
            @keyframes jmMembrane {
              0%,100% { d: path("M18,54 Q10,42 18,30 L38,40 L42,62 Z"); }
              50%      { d: path("M18,54 Q8,44 18,30 L38,40 L42,64 Z"); }
            }
            @keyframes jmMembraneR {
              0%,100% { d: path("M78,54 Q86,42 78,30 L58,40 L54,62 Z"); }
              50%      { d: path("M78,54 Q88,44 78,30 L58,40 L54,64 Z"); }
            }
            @keyframes jmTailWag {
              0%,100% { transform: rotate(-6deg); transform-origin: 58px 52px; }
              50%      { transform: rotate(10deg); transform-origin: 58px 52px; }
            }
            .jm-sq    { animation: jmGlide 2.6s ease-in-out infinite; }
            .jm-mem-l { animation: jmMembrane 2.6s ease-in-out infinite; }
            .jm-mem-r { animation: jmMembraneR 2.6s ease-in-out infinite; }
            .jm-tail  { animation: jmTailWag 2.6s ease-in-out infinite; }
          `}</style>
          <svg className="jm-sq" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ width: 96, height: 96 }}>
            <defs>
              <radialGradient id="jmGlow2" cx="50%" cy="55%" r="50%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <ellipse cx="48" cy="54" r="36" fill="url(#jmGlow2)" opacity="1"/>
            {/* patagium esquerdo — membrana braço→perna */}
            <path className="jm-mem-l" d="M18,54 Q10,42 18,30 L38,40 L42,62 Z" fill="#c2700a" opacity="0.82"/>
            {/* patagium direito */}
            <path className="jm-mem-r" d="M78,54 Q86,42 78,30 L58,40 L54,62 Z" fill="#c2700a" opacity="0.82"/>
            {/* cauda fofa */}
            <ellipse className="jm-tail" cx="62" cy="58" rx="14" ry="8" fill="#92400e" transform="rotate(25 62 58)"/>
            <ellipse className="jm-tail" cx="64" cy="55" rx="11" ry="6" fill="#d97706" transform="rotate(25 64 55)"/>
            {/* corpo */}
            <ellipse cx="48" cy="54" rx="16" ry="14" fill="#d97706"/>
            {/* braços estendidos */}
            <ellipse cx="26" cy="40" rx="9" ry="4" fill="#d97706" transform="rotate(-35 26 40)"/>
            <ellipse cx="70" cy="40" rx="9" ry="4" fill="#d97706" transform="rotate(35 70 40)"/>
            {/* orelha esq — pequena e arredondada */}
            <ellipse cx="37" cy="26" rx="5" ry="6" fill="#d97706" transform="rotate(-10 37 26)"/>
            <ellipse cx="37" cy="27" rx="3" ry="4" fill="#fbbf24" transform="rotate(-10 37 27)"/>
            {/* orelha dir */}
            <ellipse cx="59" cy="26" rx="5" ry="6" fill="#d97706" transform="rotate(10 59 26)"/>
            <ellipse cx="59" cy="27" rx="3" ry="4" fill="#fbbf24" transform="rotate(10 59 27)"/>
            {/* cabeça */}
            <circle cx="48" cy="36" r="13" fill="#d97706"/>
            {/* olhos grandes — característica do esquilo-voador */}
            <ellipse cx="43" cy="35" rx="4" ry="4.5" fill="#1a1a2e"/>
            <ellipse cx="53" cy="35" rx="4" ry="4.5" fill="#1a1a2e"/>
            <circle cx="44" cy="33.5" r="1.5" fill="white"/>
            <circle cx="54" cy="33.5" r="1.5" fill="white"/>
            {/* narizinho */}
            <ellipse cx="48" cy="40" rx="2.5" ry="1.8" fill="#92400e"/>
            {/* bochechas */}
            <circle cx="38" cy="39" r="4" fill="#f59e0b" opacity="0.35"/>
            <circle cx="58" cy="39" r="4" fill="#f59e0b" opacity="0.35"/>
          </svg>
        </div>
        <h1 style={{ color: "#e8e8e8", fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>
          Jasmim-Manga
        </h1>
        <p style={{ color: "#888", fontSize: 13, margin: "0 0 28px" }}>
          espaço da Mayumi · ecossistema Théo
        </p>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="login"
            value={loginVal}
            onChange={e => setLoginVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && entrar()}
            autoComplete="username"
            style={{
              background: "#1a1a2e", border: "1px solid #333", borderRadius: 10,
              color: "#e8e8e8", padding: "12px 16px", fontSize: 14, outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#a78bfa")}
            onBlur={e => (e.target.style.borderColor = "#333")}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showSenha ? "text" : "password"}
              placeholder="senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === "Enter" && entrar()}
              autoComplete="current-password"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#1a1a2e", border: "1px solid #333", borderRadius: 10,
                color: "#e8e8e8", padding: "12px 44px 12px 16px", fontSize: 14, outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#a78bfa")}
              onBlur={e => (e.target.style.borderColor = "#333")}
            />
            <button
              type="button"
              onClick={() => setShowSenha(s => !s)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "#666", fontSize: 16, lineHeight: 1, padding: 4,
              }}
              tabIndex={-1}
              title={showSenha ? "Ocultar senha" : "Mostrar senha"}
            >{showSenha ? "🙈" : "👁️"}</button>
          </div>
          {erro && (
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{erro}</p>
          )}
          <button
            onClick={entrar}
            disabled={loading || !loginVal.trim() || !senha.trim()}
            style={{
              background: loading ? "#333" : "linear-gradient(135deg, #f59e0b, #a78bfa)",
              border: "none", borderRadius: 10, padding: "13px",
              color: "#111", fontWeight: 800, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s", opacity: (!loginVal.trim() || !senha.trim()) ? 0.5 : 1,
            }}
          >
            {loading ? "Entrando…" : "Entrar no Jasmim-Manga →"}
          </button>
        </div>

        <p style={{ color: "#555", fontSize: 11, marginTop: 20 }}>
          acesso restrito · use as mesmas credenciais do portal
        </p>
      </div>
    </div>
  );
}

export function JasmimGate() {
  const [estado, setEstado] = useState<"verificando" | "ok" | "login">("verificando");

  useEffect(() => {
    fetch(`${API}/api/auth/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setEstado(d?.user ? "ok" : "login"))
      .catch(() => setEstado("login"));
  }, []);

  if (estado === "verificando") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0f0f1a",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 32, animation: "floatLogin 1.5s ease-in-out infinite" }}>🐿️</div>
      </div>
    );
  }

  if (estado === "login") {
    return <JasmimLogin onSuccess={() => setEstado("ok")} />;
  }

  return <JasmimMangaPage />;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Projeto = "age" | "rapadura" | "pv" | "isca" | "sonhos" | "crowd" | "theo" | "bni" | "jasmim";

type Post = {
  id: string;
  tipo: "auto" | "nota" | "pergunta" | "myym";
  projeto: Projeto;
  setor?: string;
  autor: string;
  conteudo: string;
  ts: string;
};

type CarrinhoItem = { id: string; conteudo: string; ts: string };

const PROJETOS: Record<Projeto, { nome: string; cor: string; emoji: string; setores: string[]; secreto?: boolean; pvBridge?: boolean }> = {
  age:      { nome: "Age",      cor: "#2dd4bf", emoji: "🏥", setores: ["Agenda & Pacientes", "Documentos & Prontuários", "Financeiro & Sabiá"] },
  rapadura: { nome: "Rapadura", cor: "#f59e0b", emoji: "🍬", setores: ["Governança & IA", "Ativos & Infraestrutura", "Score & Metas"] },
  pv:       { nome: "PV",       cor: "#a78bfa", emoji: "🎨", setores: ["UI/UX & Mobile", "Identidade & Avatares", "Design de Sistemas"], pvBridge: true },
  isca:     { nome: "ISCA",     cor: "#60a5fa", emoji: "🧠", setores: ["Inara · Interpretação", "Suindara · Síntese", "Clio · Curadoria", "Arara · Análise"] },
  sonhos:   { nome: "Sonhos",   cor: "#f472b6", emoji: "🌙", setores: ["Intuições", "Registros", "Não-linear"] },
  crowd:    { nome: "CROWD",    cor: "#34d399", emoji: "🌐", setores: ["Rede Social", "Profissionais", "Conexões"] },
  theo:     { nome: "Théo",     cor: "#fbbf24", emoji: "🌳", setores: ["Ecossistema", "Assembleias", "Orchestração"] },
  bni:      { nome: "BNI",      cor: "#94a3b8", emoji: "🔒", setores: ["Forças Ocultas", "Rede Estratégica", "Sábias"], secreto: true },
  jasmim:   { nome: "Jasmim",  cor: "#c2700a", emoji: "🐿️", setores: ["Identidade", "Funcionalidades", "MYYM", "Histórico"] },
};

// ─── Avatar MYYM (esquilo voador CSS) ─────────────────────────────────────────

function MyymAvatar({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed", bottom: 24, right: 20,
        width: 64, height: 64, borderRadius: "50%",
        background: "linear-gradient(135deg, #1a1a2e, #2a1a0e)",
        border: "2px solid #f59e0b88", cursor: "pointer", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
      }}
      title="Falar com MYYM"
    >
      <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ width: 44, height: 44 }}>
        <defs>
          <style>{`
            @keyframes jmAvFloat { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-8px) rotate(2deg); } }
            @keyframes jmAvMemL  { 0%,100% { transform:scaleX(1) skewY(0deg); } 50% { transform:scaleX(1.18) skewY(-6deg); } }
            @keyframes jmAvMemR  { 0%,100% { transform:scaleX(1) skewY(0deg); } 50% { transform:scaleX(1.18) skewY(6deg); } }
            @keyframes jmAvTail  { 0%,100% { transform:rotate(-6deg); } 50% { transform:rotate(14deg); } }
            @keyframes jmAvBlink { 0%,90%,100% { scaleY:1; } 93%,97% { scaleY:0.1; } }
            .jm-av-body { animation: jmAvFloat 2.2s ease-in-out infinite; }
            .jm-av-ml   { animation: jmAvMemL  2.2s ease-in-out infinite; transform-origin: 38px 46px; }
            .jm-av-mr   { animation: jmAvMemR  2.2s ease-in-out infinite; transform-origin: 58px 46px; }
            .jm-av-tail { animation: jmAvTail  2.2s ease-in-out infinite; transform-origin: 58px 52px; }
          `}</style>
        </defs>
        {/* membranas (fora do grupo principal para animação independente) */}
        <path className="jm-av-ml" d="M18,54 Q8,40 18,28 L38,40 L42,62 Z" fill="#c2700a" opacity="0.85"/>
        <path className="jm-av-mr" d="M78,54 Q88,40 78,28 L58,40 L54,62 Z" fill="#c2700a" opacity="0.85"/>
        <g className="jm-av-body">
          {/* cauda */}
          <ellipse className="jm-av-tail" cx="63" cy="57" rx="15" ry="8" fill="#92400e" transform="rotate(25 63 57)"/>
          <ellipse className="jm-av-tail" cx="65" cy="54" rx="11" ry="6" fill="#d97706" transform="rotate(25 65 54)"/>
          {/* corpo */}
          <ellipse cx="48" cy="54" rx="16" ry="14" fill="#d97706"/>
          {/* braços */}
          <ellipse cx="26" cy="40" rx="9" ry="4" fill="#d97706" transform="rotate(-35 26 40)"/>
          <ellipse cx="70" cy="40" rx="9" ry="4" fill="#d97706" transform="rotate(35 70 40)"/>
          {/* orelhas */}
          <ellipse cx="37" cy="26" rx="5" ry="6" fill="#d97706" transform="rotate(-10 37 26)"/>
          <ellipse cx="37" cy="27" rx="3" ry="4" fill="#fbbf24" transform="rotate(-10 37 27)"/>
          <ellipse cx="59" cy="26" rx="5" ry="6" fill="#d97706" transform="rotate(10 59 26)"/>
          <ellipse cx="59" cy="27" rx="3" ry="4" fill="#fbbf24" transform="rotate(10 59 27)"/>
          {/* cabeça */}
          <circle cx="48" cy="36" r="13" fill="#d97706"/>
          {/* olhos */}
          <ellipse cx="43" cy="35" rx="4" ry="4.5" fill="#1a1a2e"/>
          <ellipse cx="53" cy="35" rx="4" ry="4.5" fill="#1a1a2e"/>
          <circle cx="44" cy="33.5" r="1.5" fill="white"/>
          <circle cx="54" cy="33.5" r="1.5" fill="white"/>
          {/* nariz */}
          <ellipse cx="48" cy="40" rx="2.5" ry="1.8" fill="#92400e"/>
          {/* bochechas */}
          <circle cx="38" cy="39" r="4" fill="#f59e0b" opacity="0.4"/>
          <circle cx="58" cy="39" r="4" fill="#f59e0b" opacity="0.4"/>
        </g>
      </svg>
    </button>
  );
}

// ─── Chatbox MYYM ─────────────────────────────────────────────────────────────

function MyymChat({ onClose, setor }: { onClose: () => void; setor?: string | null }) {
  const subiaLabel = setor && setor !== "Histórico" && setor !== "BNI" ? ` · ${setor.split(" · ")[0]}` : "";
  const saudacao = { role: "myym" as const, texto: `Oi. Sou a MYYM${subiaLabel ? ` (operando como ${setor?.split(" · ")[0]})` : ""} — a parte que pensa enquanto você faz.\n\nComo você quer que eu te chame?` };
  const [msgs, setMsgs] = useState<{ role: "myym" | "user"; texto: string }[]>([saudacao]);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Mensagens da sessão atual (após o primeiro envio do usuário)
  const primeiroUserIdx = msgs.findIndex(m => m.role === "user");
  const historico = primeiroUserIdx > 0 ? msgs.slice(0, primeiroUserIdx) : [];
  const sessaoAtual = primeiroUserIdx > 0 ? msgs.slice(primeiroUserIdx) : msgs;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function enviar() {
    if (!input.trim() || loading) return;
    const texto = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", texto }]);
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/jasmim/myym/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: texto, historico: msgs, setor: setor ?? undefined }),
      });
      const d = await r.json();
      setMsgs(m => [...m, { role: "myym", texto: d.resposta ?? "…" }]);
    } catch {
      setMsgs(m => [...m, { role: "myym", texto: "Perdi a conexão por um instante. Tenta de novo?" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", bottom: 90, right: 16,
      width: "min(360px, 94vw)", maxHeight: "60vh",
      background: "#1a1a2e", border: "1px solid #333",
      borderRadius: 16, display: "flex", flexDirection: "column",
      zIndex: 99, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 14 }}>🐿️ MYYM</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Conversa anterior colapsada */}
        {historico.length > 0 && (
          <div>
            <button
              onClick={() => setHistoricoAberto(h => !h)}
              style={{
                background: "none", border: "1px solid #333", borderRadius: 8,
                color: "#666", fontSize: 11, padding: "4px 10px", cursor: "pointer", width: "100%",
              }}
            >{historicoAberto ? "▲ ocultar conversa anterior" : `▼ ver conversa anterior (${historico.length} mensagens)`}</button>
            {historicoAberto && historico.map((m, i) => (
              <div key={`h${i}`} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "#a78bfa11" : "#f59e0b08",
                border: `1px solid ${m.role === "user" ? "#a78bfa22" : "#f59e0b22"}`,
                borderRadius: 12, padding: "8px 12px", maxWidth: "85%", opacity: 0.6,
                color: "#e8e8e8", fontSize: 12, lineHeight: 1.4, whiteSpace: "pre-wrap", marginTop: 6,
              }}>{m.texto}</div>
            ))}
          </div>
        )}
        {sessaoAtual.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "#a78bfa22" : "#f59e0b11",
            border: `1px solid ${m.role === "user" ? "#a78bfa44" : "#f59e0b33"}`,
            borderRadius: 12, padding: "8px 12px", maxWidth: "85%",
            color: "#e8e8e8", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap",
          }}>
            {m.texto}
          </div>
        ))}
        {loading && <div style={{ color: "#f59e0b88", fontSize: 12, alignSelf: "flex-start" }}>MYYM está pensando…</div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "8px 12px", borderTop: "1px solid #333", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()}
          placeholder="Fale com a MYYM…"
          style={{
            flex: 1, background: "#111", border: "1px solid #333", borderRadius: 8,
            color: "#e8e8e8", padding: "8px 12px", fontSize: 13, outline: "none",
          }}
        />
        <button onClick={enviar} disabled={loading} style={{
          background: "#f59e0b", border: "none", borderRadius: 8,
          padding: "8px 14px", color: "#111", fontWeight: 700, cursor: "pointer", fontSize: 13,
        }}>→</button>
      </div>
    </div>
  );
}

// ─── Carrinho de Ideias ────────────────────────────────────────────────────────

function Carrinho({ items, onRemover, onEnviar }: {
  items: CarrinhoItem[];
  onRemover: (id: string) => void;
  onEnviar: () => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [status, setStatus] = useState<"idle" | "enviando" | "enviado">("idle");

  async function handleEnviar() {
    setStatus("enviando");
    try {
      await onEnviar();
      setStatus("enviado");
      setTimeout(() => { setStatus("idle"); setAberto(false); }, 2000);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div style={{ position: "fixed", bottom: 24, left: 16, zIndex: 98 }}>
      <button
        onClick={() => setAberto(a => !a)}
        style={{
          background: items.length > 0 ? "#2dd4bf" : "#333",
          border: "none", borderRadius: 28, padding: "10px 18px",
          color: "#111", fontWeight: 700, cursor: "pointer", fontSize: 13,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          transition: "background 0.2s",
        }}
      >
        🧺 {items.length > 0 ? `${items.length} ideia${items.length > 1 ? "s" : ""}` : "Carrinho"}
      </button>
      {aberto && (
        <div style={{
          position: "absolute", bottom: 48, left: 0,
          width: "min(320px, 90vw)", background: "#1a1a2e",
          border: "1px solid #333", borderRadius: 12,
          padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <p style={{ color: "#888", fontSize: 12, margin: "0 0 12px" }}>
            {items.length === 0 ? "Carrinho vazio — adicione notas no feed." : "Suas ideias salvas:"}
          </p>
          {items.map(item => (
            <div key={item.id} style={{
              background: "#111", borderRadius: 8, padding: "8px 12px",
              marginBottom: 8, color: "#e8e8e8", fontSize: 13, position: "relative",
            }}>
              {item.conteudo}
              <button onClick={() => onRemover(item.id)} style={{
                position: "absolute", top: 4, right: 6,
                background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 16,
              }}>×</button>
            </div>
          ))}
          {items.length > 0 && (
            <button
              onClick={handleEnviar}
              disabled={status !== "idle"}
              style={{
                width: "100%", marginTop: 8,
                background: status === "enviado" ? "#34d399" : status === "enviando" ? "#555" : "#2dd4bf",
                border: "none", borderRadius: 8, padding: "10px",
                color: "#111", fontWeight: 700, cursor: status === "idle" ? "pointer" : "default",
                fontSize: 13, transition: "background 0.3s",
              }}
            >
              {status === "enviado" ? "Enviado ✓" : status === "enviando" ? "Enviando…" : "Enviar email / Responder brainstorm →"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, prevPost, onAddCarrinho }: { post: Post; prevPost?: Post; onAddCarrinho: (texto: string) => void }) {
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState("");
  const [copiado, setCopiado] = useState(false);
  const proj = PROJETOS[post.projeto];

  const corTipo: Record<Post["tipo"], string> = {
    auto:     "#444",
    nota:     "#2dd4bf22",
    pergunta: "#f59e0b22",
    myym:     "#a78bfa22",
  };

  function copiar() {
    let texto = post.conteudo;
    if (post.tipo === "myym" && prevPost?.tipo === "pergunta") {
      texto = `Pergunta: ${prevPost.conteudo}\n\nResposta: ${post.conteudo}`;
    }
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    });
  }

  return (
    <div style={{
      background: corTipo[post.tipo],
      border: `1px solid ${post.tipo === "nota" ? "#2dd4bf44" : post.tipo === "pergunta" ? "#f59e0b44" : post.tipo === "myym" ? "#a78bfa44" : "#2a2a2a"}`,
      borderRadius: 12, padding: "12px 16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: proj.cor, fontWeight: 700 }}>
          {proj.nome}{post.setor ? ` · ${post.setor}` : ""}
        </span>
        <span style={{ fontSize: 11, color: "#666" }}>
          {post.autor} · {new Date(post.ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <p style={{ color: "#e8e8e8", margin: 0, fontSize: 14, lineHeight: 1.5, userSelect: "text" }}>{post.conteudo}</p>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={() => setEditando(e => !e)} style={{
          background: "none", border: "1px solid #333", borderRadius: 6,
          color: "#888", fontSize: 11, padding: "3px 10px", cursor: "pointer",
        }}>+ nota</button>
        <button onClick={() => onAddCarrinho(post.conteudo)} style={{
          background: "none", border: "1px solid #333", borderRadius: 6,
          color: "#888", fontSize: 11, padding: "3px 10px", cursor: "pointer",
        }}>🧺</button>
        <button onClick={copiar} style={{
          background: "none", border: "1px solid #333", borderRadius: 6,
          color: copiado ? "#2dd4bf" : "#888", fontSize: 11, padding: "3px 10px", cursor: "pointer",
          transition: "color 0.2s",
        }}>{copiado ? "✓ copiado" : "📋"}</button>
      </div>
      {editando && (
        <div style={{ marginTop: 10 }}>
          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Sua nota aqui…"
            rows={2}
            style={{
              width: "100%", background: "#111", border: "1px solid #2dd4bf44",
              borderRadius: 8, color: "#e8e8e8", padding: "8px 12px",
              fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={() => { onAddCarrinho(nota); setNota(""); setEditando(false); }} style={{
              background: "#2dd4bf", border: "none", borderRadius: 6,
              color: "#111", fontSize: 12, padding: "5px 14px", cursor: "pointer", fontWeight: 700,
            }}>Salvar no carrinho</button>
            <button onClick={() => setEditando(false)} style={{
              background: "none", border: "1px solid #333", borderRadius: 6,
              color: "#888", fontSize: 12, padding: "5px 10px", cursor: "pointer",
            }}>cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Formulário nova nota ─────────────────────────────────────────────────────

function NovaNota({ projeto, setor, onSalva, autor = "usuário" }: { projeto: Projeto; setor?: string | null; onSalva: () => void; autor?: string }) {
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<"nota" | "pergunta">("nota");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!texto.trim() || salvando) return;
    setSalvando(true);
    try {
      await fetch(`${API}/api/jasmim/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projeto, setor: setor ?? undefined, tipo, autor: autor || "usuário", conteudo: texto.trim() }),
      });
      // Se é pergunta, pede resposta à MYYM e posta automaticamente
      if (tipo === "pergunta") {
        const r = await fetch(`${API}/api/jasmim/myym/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensagem: texto.trim(), historico: [], setor: setor ?? undefined }),
        }).then(r => r.json()).catch(() => null);
        if (r?.resposta) {
          await fetch(`${API}/api/jasmim/posts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projeto, setor: setor ?? undefined, tipo: "myym", autor: "MYYM", conteudo: r.resposta }),
          });
        }
      }
      setTexto("");
      onSalva();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{
      background: "#1a1a2e",
      border: `1px solid ${tipo === "pergunta" ? "#f59e0b44" : "#2dd4bf44"}`,
      borderRadius: 12, padding: "12px 16px", marginBottom: 16,
    }}>
      {/* Selector nota / pergunta */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {(["nota", "pergunta"] as const).map(t => (
          <button key={t} onClick={() => setTipo(t)} style={{
            background: tipo === t ? (t === "pergunta" ? "#f59e0b" : "#2dd4bf") : "transparent",
            border: `1px solid ${t === "pergunta" ? "#f59e0b66" : "#2dd4bf66"}`,
            borderRadius: 16, padding: "3px 12px", fontSize: 11, fontWeight: tipo === t ? 700 : 400,
            color: tipo === t ? "#111" : "#888", cursor: "pointer",
          }}>
            {t === "nota" ? "📝 nota" : "❓ pergunta → MYYM"}
          </button>
        ))}
      </div>
      <textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        onKeyDown={e => e.key === "Enter" && e.metaKey && salvar()}
        placeholder={tipo === "pergunta" ? "Pergunta para a MYYM…" : "Nova nota para o feed…"}
        rows={2}
        style={{
          width: "100%", background: "transparent", border: "none",
          color: "#e8e8e8", fontSize: 14, resize: "vertical",
          outline: "none", fontFamily: "system-ui, sans-serif", boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button
          onClick={salvar}
          disabled={salvando || !texto.trim()}
          style={{
            background: texto.trim() ? (tipo === "pergunta" ? "#f59e0b" : "#2dd4bf") : "#333",
            border: "none", borderRadius: 8, padding: "6px 16px",
            color: "#111", fontWeight: 700, fontSize: 12,
            cursor: texto.trim() ? "pointer" : "not-allowed", transition: "background 0.2s",
          }}
        >{salvando ? (tipo === "pergunta" ? "perguntando…" : "salvando…") : (tipo === "pergunta" ? "Perguntar à MYYM →" : "Postar nota")}</button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function JasmimMangaPage() {
  const [projetoAtivo, setProjetoAtivo] = useState<Projeto>("age");
  const [setorAtivo, setSetorAtivo] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [myymAberto, setMyymAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userTier, setUserTier] = useState<number>(0);
  // Histórico Assembleias Replit
  type Assembleia = { id: number; topic: string; status: string; createdAt: string; createdBy: string; metaAnalysis?: string | null };
  const [assembleias, setAssembleias] = useState<Assembleia[]>([]);
  const [assembleiaLoading, setAssembleiaLoading] = useState(false);
  const [assembleiaSearch, setAssembleiaSearch] = useState("");
  const [assembleiaTotal, setAssembleiaTotal] = useState(0);
  const [assembleiaPage, setAssembleiaPage] = useState(1);

  useEffect(() => {
    fetch(`${API}/api/auth/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user) {
          setUserName(d.user.displayName ?? d.user.login ?? "");
          setUserTier(d.user.tier ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  const proj = PROJETOS[projetoAtivo];
  const projetosVisiveis = (Object.entries(PROJETOS) as [Projeto, typeof PROJETOS.age][])
    .filter(([, p]) => !p.secreto || userTier >= 4);

  function carregarFeed(setor?: string | null) {
    setLoading(true);
    const s = setor !== undefined ? setor : setorAtivo;
    const url = `${API}/api/jasmim/feed?projeto=${projetoAtivo}${s ? `&setor=${encodeURIComponent(s)}` : ""}`;
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(d => setPosts(d?.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { setSetorAtivo(null); }, [projetoAtivo]);
  useEffect(() => { carregarFeed(setorAtivo); }, [projetoAtivo, setorAtivo]);
  useEffect(() => { setAssembleias([]); setAssembleiaPage(1); }, [setorAtivo]);

  useEffect(() => {
    if (projetoAtivo !== "jasmim" || setorAtivo !== "Histórico") return;
    setAssembleiaLoading(true);
    const q = assembleiaSearch ? `&q=${encodeURIComponent(assembleiaSearch)}` : "";
    fetch(`${API}/api/jasmim/assembleias?page=${assembleiaPage}&limit=50${q}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const nova = d?.assembleias ?? [];
        setAssembleias(prev => assembleiaPage === 1 ? nova : [...prev, ...nova]);
        setAssembleiaTotal(d?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setAssembleiaLoading(false));
  }, [projetoAtivo, setorAtivo, assembleiaPage, assembleiaSearch]);

  function addCarrinho(texto: string) {
    if (!texto.trim()) return;
    setCarrinho(c => [...c, { id: Date.now().toString(), conteudo: texto, ts: new Date().toISOString() }]);
  }

  function removerCarrinho(id: string) {
    setCarrinho(c => c.filter(i => i.id !== id));
  }

  async function enviarBrainstorm() {
    if (carrinho.length === 0) return;
    const corpo = carrinho.map(i => `- ${i.conteudo}`).join("\n");
    const r = await fetch(`${API}/api/jasmim/carrinho/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itens: carrinho, corpo }),
    });
    if (!r.ok) throw new Error("Falha ao enviar");
    setCarrinho([]);
  }

  return (
    <div style={{
      minHeight: "100vh", color: "#e8e8e8",
      fontFamily: "system-ui, sans-serif", paddingBottom: 120,
      background: "#0f0f1a",
      backgroundImage: `radial-gradient(ellipse at 15% 25%, rgba(194,112,10,0.08) 0%, transparent 45%), radial-gradient(ellipse at 85% 75%, rgba(167,139,250,0.05) 0%, transparent 45%), repeating-linear-gradient(135deg, transparent, transparent 30px, rgba(255,255,255,0.012) 30px, rgba(255,255,255,0.012) 31px), repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.008) 20px, rgba(255,255,255,0.008) 21px)`,
    }}>
      {/* Header */}
      <div style={{
        background: "#1a1a2e", borderBottom: "1px solid #222",
        padding: "16px 20px", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
              <span style={{ color: proj.cor }}>{proj.emoji} </span>
              <span style={{ color: proj.cor }}>Jasmim</span>
              <span style={{ color: "#444" }}>-</span>
              <span style={{ color: "#e8e8e8" }}>Manga</span>
            </h1>
            {userName && (
              <span style={{ color: "#666", fontSize: 12 }}>
                {userName.split(" ")[0]} ·{" "}
                <button onClick={() => fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" }).then(() => location.reload())}
                  style={{ background: "none", border: "none", color: "#555", fontSize: 12, cursor: "pointer", padding: 0 }}>
                  sair
                </button>
              </span>
            )}
          </div>
          {/* Seletor de projetos */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
            {projetosVisiveis.map(([key, p]) => (
              <button
                key={key}
                onClick={() => setProjetoAtivo(key)}
                style={{
                  background: projetoAtivo === key ? p.cor : "transparent",
                  border: `1px solid ${projetoAtivo === key ? p.cor : p.secreto ? "#333" : "#333"}`,
                  borderRadius: 20, padding: "5px 14px",
                  color: projetoAtivo === key ? "#111" : p.secreto ? "#555" : "#888",
                  fontWeight: projetoAtivo === key ? 700 : 400,
                  cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0,
                }}
              >{p.emoji} {p.nome}</button>
            ))}
          </div>
          {/* Setores */}
          <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
            <span
              key="__todos"
              onClick={() => setSetorAtivo(null)}
              style={{
                background: setorAtivo === null ? proj.cor : `${proj.cor}18`,
                border: `1px solid ${proj.cor}66`,
                borderRadius: 10, padding: "3px 10px", fontSize: 11,
                color: setorAtivo === null ? "#111" : proj.cor,
                whiteSpace: "nowrap", cursor: "pointer", fontWeight: setorAtivo === null ? 700 : 400,
              }}>Todos</span>
            {proj.setores.map(s => (
              <span key={s}
                onClick={() => setSetorAtivo(s === setorAtivo ? null : s)}
                style={{
                  background: s === setorAtivo ? proj.cor : `${proj.cor}18`,
                  border: `1px solid ${proj.cor}${s === setorAtivo ? "ff" : "44"}`,
                  borderRadius: 10, padding: "3px 10px", fontSize: 11,
                  color: s === setorAtivo ? "#111" : proj.cor,
                  whiteSpace: "nowrap", cursor: "pointer", fontWeight: s === setorAtivo ? 700 : 400,
                }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        {proj.pvBridge && (
          <div style={{
            background: "#a78bfa11", border: "1px solid #a78bfa44",
            borderRadius: 12, padding: "10px 16px", marginBottom: 12,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "#a78bfa", fontSize: 13 }}>🔗 Projeto Visual — workspace de design</span>
            <a
              href="/aliancapanorama/pv"
              style={{
                background: "#a78bfa", color: "#111", borderRadius: 8,
                padding: "4px 12px", fontSize: 12, fontWeight: 700,
                textDecoration: "none",
              }}
            >Abrir PV →</a>
          </div>
        )}
        {projetoAtivo === "theo" && (
          <div style={{ background: "#fbbf2411", border: "1px solid #fbbf2444", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <p style={{ color: "#fbbf24", fontWeight: 700, margin: "0 0 8px", fontSize: 13 }}>🌳 Ecossistema Théo — sistemas ativos</p>
            {[
              ["🏥 Age", "/aliancapanorama/age/lisange"],
              ["🍬 Rapadura", "/aliancapanorama/rapadura"],
              ["🎨 PV", "/aliancapanorama/pv"],
              ["🏙️ CEU / CROWD", "/aliancapanorama/ceu"],
              ["🤖 Studio / Artesão", "/aliancapanorama/studio"],
            ].map(([label, href]) => (
              <a key={href} href={href} style={{
                display: "inline-block", marginRight: 8, marginBottom: 4,
                background: "#fbbf2422", border: "1px solid #fbbf2444",
                borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#fbbf24", textDecoration: "none",
              }}>{label}</a>
            ))}
          </div>
        )}
        {projetoAtivo === "isca" && (
          <div style={{ background: "#60a5fa11", border: "1px solid #60a5fa44", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <p style={{ color: "#60a5fa", fontWeight: 700, margin: "0 0 8px", fontSize: 13 }}>🧠 ISCA — motor modular da MYYM</p>
            {[
              ["🌊 Inara", "Interpretação", "lê o que está por baixo"],
              ["🦉 Suindara", "Síntese", "condensa na escuridão"],
              ["📚 Clio", "Curadoria", "guarda o que importa"],
              ["🦜 Arara", "Análise", "vê de longe, colorida e assertiva"],
            ].map(([emoji_nome, funcao, desc]) => (
              <div key={funcao} style={{ background: "#60a5fa0a", borderRadius: 8, padding: "6px 10px", marginBottom: 6 }}>
                <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: 13 }}>{emoji_nome}</span>
                <span style={{ color: "#888", fontSize: 12 }}> · {funcao} — {desc}</span>
              </div>
            ))}
          </div>
        )}
        {/* Painel contextual: Age — Documentos & Prontuários */}
        {projetoAtivo === "age" && setorAtivo === "Documentos & Prontuários" && (
          <div style={{ background: "#2dd4bf11", border: "1px solid #2dd4bf44", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <p style={{ color: "#2dd4bf", fontWeight: 700, margin: "0 0 8px", fontSize: 13 }}>📄 Prontuários & Documentos — acesso rápido</p>
            {[
              ["Lisange (Médica)", "/aliancapanorama/age/lisange"],
              ["Suzana (Psicóloga)", "/aliancapanorama/age/susana"],
              ["Painel Gestora", "/aliancapanorama/age/gestora"],
            ].map(([label, href]) => (
              <a key={href} href={href} style={{
                display: "inline-block", marginRight: 8, marginBottom: 4,
                background: "#2dd4bf22", border: "1px solid #2dd4bf44",
                borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#2dd4bf", textDecoration: "none",
              }}>{label}</a>
            ))}
            <p style={{ color: "#64748b", fontSize: 12, margin: "8px 0 0" }}>
              Notas neste setor ficam visíveis apenas para a equipe Age.
            </p>
          </div>
        )}
        {/* Painel contextual: Age — Financeiro & Sabiá */}
        {projetoAtivo === "age" && setorAtivo === "Financeiro & Sabiá" && (
          <div style={{ background: "#2dd4bf11", border: "1px solid #2dd4bf44", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <p style={{ color: "#2dd4bf", fontWeight: 700, margin: "0 0 8px", fontSize: 13 }}>💰 Financeiro & SABIÁ</p>
            {[
              ["Config Pagamentos — Lisange", "/aliancapanorama/age/lisange?adm=1"],
              ["Config Pagamentos — Suzana", "/aliancapanorama/age/susana?adm=1"],
              ["Painel Gestora (receita)", "/aliancapanorama/age/gestora"],
            ].map(([label, href]) => (
              <a key={href} href={href} style={{
                display: "inline-block", marginRight: 8, marginBottom: 4,
                background: "#2dd4bf22", border: "1px solid #2dd4bf44",
                borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#2dd4bf", textDecoration: "none",
              }}>{label}</a>
            ))}
            <p style={{ color: "#64748b", fontSize: 12, margin: "8px 0 0" }}>
              SABIÁ — IA de acolhimento Age. Registre aqui decisões financeiras e configurações da IA.
            </p>
          </div>
        )}
        {/* Painel: Jasmim — Histórico (Assembleias Replit) */}
        {projetoAtivo === "jasmim" && setorAtivo === "Histórico" && (
          <div style={{ background: "#c2700a11", border: "1px solid #c2700a44", borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <p style={{ color: "#c2700a", fontWeight: 700, margin: "0 0 10px", fontSize: 13 }}>📜 Histórico — Assembleias Replit ({assembleiaTotal} no total)</p>
            <input
              type="text" placeholder="Buscar assembleia…"
              value={assembleiaSearch}
              onChange={e => { setAssembleiaSearch(e.target.value); setAssembleiaPage(1); setAssembleias([]); }}
              style={{ width: "100%", background: "#1a1008", border: "1px solid #c2700a44", borderRadius: 8, color: "#e2e8f0", padding: "7px 10px", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}
            />
            {assembleiaLoading && <div style={{ color: "#64748b", fontSize: 13 }}>Carregando…</div>}
            {!assembleiaLoading && assembleias.map(a => (
              <div key={a.id} style={{ borderBottom: "1px solid #c2700a22", paddingBottom: 8, marginBottom: 8 }}>
                <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>#{a.id} — {a.topic.slice(0, 80)}{a.topic.length > 80 ? "…" : ""}</div>
                <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : ""} · {a.createdBy ?? "—"} · {a.status}
                </div>
                {a.metaAnalysis && (
                  <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3, fontStyle: "italic" }}>{a.metaAnalysis.slice(0, 100)}…</div>
                )}
              </div>
            ))}
            {!assembleiaLoading && assembleias.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 13 }}>Nenhuma assembleia encontrada.</div>
            )}
            {assembleias.length > 0 && (
              <div style={{ color: "#64748b", fontSize: 11, marginBottom: 6 }}>
                Mostrando {assembleias.length} de {assembleiaTotal}
              </div>
            )}
            {assembleias.length < assembleiaTotal && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
                <button
                  onClick={() => setAssembleiaPage(p => p + 1)}
                  disabled={assembleiaLoading}
                  style={{ background: "#1a1008", border: "1px solid #c2700a66", borderRadius: 6, color: "#c2700a", padding: "6px 18px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  {assembleiaLoading ? "Carregando…" : `↓ Carregar mais (${assembleiaTotal - assembleias.length} restantes)`}
                </button>
                {assembleiaTotal - assembleias.length > 50 && (
                  <button
                    onClick={() => { setAssembleiaPage(1); fetch(`${API}/api/jasmim/assembleias?page=1&limit=200${assembleiaSearch ? `&q=${encodeURIComponent(assembleiaSearch)}` : ""}`).then(r => r.json()).then(d => { setAssembleias(d?.assembleias ?? []); setAssembleiaTotal(d?.total ?? 0); }); }}
                    style={{ background: "#1a1008", border: "1px solid #c2700a33", borderRadius: 6, color: "#92400e", padding: "6px 14px", cursor: "pointer", fontSize: 11 }}
                  >
                    Carregar todas
                  </button>
                )}
              </div>
            )}
            {assembleiaLoading && assembleias.length > 0 && (
              <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 8 }}>Carregando mais…</div>
            )}
          </div>
        )}
        <NovaNota projeto={projetoAtivo} setor={setorAtivo} onSalva={() => carregarFeed()} autor={userName || "usuário"} />
        {loading && <p style={{ color: "#666", textAlign: "center" }}>carregando feed…</p>}
        {!loading && posts.length === 0 && (
          <p style={{ color: "#666", textAlign: "center", marginTop: 32 }}>
            Nenhuma atualização ainda para {proj.nome}{setorAtivo ? ` · ${setorAtivo}` : ""}.<br/>
            <span style={{ fontSize: 12, color: "#555" }}>Use o campo acima para adicionar a primeira nota.</span>
          </p>
        )}
        {posts.map((post, idx) => (
          <PostCard key={post.id} post={post} prevPost={idx > 0 ? posts[idx - 1] : undefined} onAddCarrinho={addCarrinho} />
        ))}
      </div>

      {/* Carrinho */}
      <Carrinho items={carrinho} onRemover={removerCarrinho} onEnviar={enviarBrainstorm} />

      {/* MYYM */}
      {myymAberto && <MyymChat onClose={() => setMyymAberto(false)} setor={setorAtivo} />}
      <MyymAvatar onClick={() => setMyymAberto(m => !m)} />
    </div>
  );
}
