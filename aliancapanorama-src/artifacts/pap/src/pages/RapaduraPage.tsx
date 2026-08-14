import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const API  = import.meta.env.VITE_API_URL ?? "";
const BASE = import.meta.env.BASE_URL ?? "/aliancapanorama/";
const LOGO = `${BASE}rapadura-icon.png`;
const HERO = `${BASE}rapadura-hero.jpg`;

// ─── Types ───────────────────────────────────────────────────────────────────

type RapaduraUser = { id: number; nome: string; role: string };
type Fundo = {
  id: number; nome: string; gestora: string; classe: string; benchmark: string;
  taxaAdm: string | null; taxaPerformance: string | null; temLinhaDAGua: boolean;
  prazoResgateDias: number; sharpe12m: string | null; sortino12m: string | null;
  maxDrawdown: string | null; volatilidade12m: string | null; retorno12m: string | null;
  retorno36m: string | null; alfa36m: string | null; tempoRecuperacaoDias: number | null;
  scoreAtratividade: string | null; scoreConfianca: string | null; scoreDetalhado: any;
  notas: string | null; cnpj: string | null;
  fatorVerde: number | null; confiancaVerde: number | null; scoreVerde: string | null;
  calmarRatio: string | null; valorMinAplicacao: string | null;
};
type Pertence = {
  id: number; fundoId: number; fundoNome: string; fundoGestora: string;
  fundoClasse: string; fundoPrazoResgate: number; fundoScore: string | null;
  dataCompra: string; valorInvestido: string; qtdCotas: string | null;
  precoCotaCompra: string | null; valorAtual: string | null; notas: string | null;
  // v3
  statusReconciliacao: string | null; totalRetirado: string | null;
};
type Dashboard = {
  totalInvestido: number; totalAtual: number; totalRetirado: number;
  resultado: number; rentabilidade: number;
};
type Transacao = {
  id: number; tipo: string; valor: string; qtdCotas: string | null;
  dataTransacao: string; motivoI438: string | null; status: string; origem: string;
  notas: string | null; pertenceId: number | null; fundoId: number; fundoNome: string;
};
type ChatMsg = { role: "user" | "assistant"; content: string };
type View = "oportunidades" | "pertences" | "transacoes" | "gerenciar" | "analisar" | "cana";
type XpPreviewItem = { data: string; descricao: string; valor: number; tipo: string; motivoI438?: string };

type AlocacaoItem = {
  fundoId: number; nome: string; gestora: string;
  scoreAtratividade: string | null; scoreConfianca: string | null; scoreVerde: string | null;
  percentual: number; valor: number; valorMin: number;
};
type ColheitaItem = {
  pertenceId: number; fundoId: number; fundoNome: string; fundoGestora: string;
  fundoScore: string | null; prazoResgateDias: number;
  valorAtual: number; valorResgatar: number; valorRestante: number; raizPreservada: number;
};
type InvestirResult = { alocacao: AlocacaoItem[]; valorTotal: number; totalAlocado: number; mensagem?: string };
type ColherResult = { colheita: ColheitaItem[]; valorDesejado: number; totalResgatado: number; totalDisponivel: number; naoAtendido: number; raizPct: number };
type AnalisarResult = {
  carteira: { quantidadeFundos: number; scoreMedio: number; totalInvestido: number };
  oportunidadesForaCerteira: Fundo[];
  sugestoesTroca: Array<{
    emCarteira: { fundoId: number; nome: string; score: string | null; valorInvestido: string };
    sugerido: { fundoId: number; nome: string; score: string | null };
    ganhoScore: number; indiceTroca: string;
  }>;
};

// ─── Utils ────────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const pct = (v: number | string | null) =>
  v != null ? `${Number(v).toFixed(2)}%` : "—";
const numFmt = (v: string | null) =>
  v != null ? Number(v).toFixed(2) : "—";

// ─── Design system helpers ────────────────────────────────────────────────────

function ScoreRuler({ value }: { value: number }) {
  const pct = Math.min(Math.max(value, 0), 100);
  const color = value >= 70 ? "#c8963b" : value >= 45 ? "#8a6b30" : "#7a3535";
  return (
    <div style={{ position: "relative", height: 3, background: "#141b26", marginTop: 6 }}>
      <div
        style={{ position: "absolute", inset: "0 auto 0 0", width: `${pct}%`, background: color, transition: "width .5s ease" }}
      />
      {[25, 50, 75].map(t => (
        <div key={t} style={{ position: "absolute", left: `${t}%`, top: -2, width: 1, height: 7, background: "#0d1220" }} />
      ))}
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "#c8963b" : value >= 45 ? "#8a6b30" : "#7a3535";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#5a5650" }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: "monospace", color, fontWeight: 700 }}>{Math.round(value)}</span>
      </div>
      <ScoreRuler value={value} />
    </div>
  );
}

function ScoreBadge({ value }: { value: string | null }) {
  const n = Number(value ?? 0);
  const color = n >= 70 ? "#c8963b" : n >= 45 ? "#8a6b30" : "#7a3535";
  const bg = n >= 70 ? "rgba(200,150,59,0.10)" : n >= 45 ? "rgba(138,107,48,0.10)" : "rgba(122,53,53,0.10)";
  return (
    <span style={{
      fontFamily: "monospace", fontWeight: 700, fontSize: 13, color,
      background: bg, padding: "3px 8px", border: `1px solid ${color}40`,
      letterSpacing: "0.02em",
    }}>
      {n.toFixed(1)}
    </span>
  );
}

function LiquidBadge({ dias }: { dias: number }) {
  const color = dias <= 15 ? "#3f7254" : dias <= 30 ? "#8a6b30" : "#7a3535";
  const label = dias <= 0 ? "D+0" : `D+${dias}`;
  return (
    <span style={{ fontSize: 10, fontFamily: "monospace", color, letterSpacing: "0.05em" }}>{label}</span>
  );
}

function VerdeBadge({ fatorVerde, confiancaVerde }: { fatorVerde: number | null; confiancaVerde: number | null }) {
  if (fatorVerde == null) return null;
  const score = confiancaVerde != null ? Math.round((fatorVerde * confiancaVerde) / 100) : fatorVerde;
  const color = score >= 60 ? "#3f7254" : score >= 30 ? "#6a7a40" : "#4a4a30";
  return (
    <span title={`Fator Verde: ${fatorVerde}/100 · Confiança: ${confiancaVerde ?? "??"}/100`} style={{
      fontSize: 9, fontFamily: "monospace", color,
      background: `${color}18`, padding: "2px 6px",
      border: `1px solid ${color}40`, letterSpacing: "0.04em",
    }}>
      🌿 {score}
    </span>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "8px 10px", borderTop: "1px solid #0f1520" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontFamily: "monospace", color: "#c5c0b8", fontWeight: 600, letterSpacing: "-0.01em" }}>
        {value}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      padding: "14px 16px",
      background: "#09101a",
      borderTop: "2px solid #c8963b",
    }}>
      <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4a4540", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 700, color: color ?? "#ddd8d0", letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────

function Field({
  label, type = "text", value, onChange, placeholder, disabled,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5650", marginBottom: 5 }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "#07090e",
          border: `1px solid ${focused ? "#5a4020" : "#141b26"}`,
          color: "#c5c0b8", fontSize: 12, padding: "8px 10px",
          outline: "none", fontFamily: "inherit",
          transition: "border-color .15s",
        }}
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5650", marginBottom: 5 }}>
        {label}
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "#07090e", border: "1px solid #141b26",
          color: "#c5c0b8", fontSize: 12, padding: "8px 10px",
          outline: "none", fontFamily: "inherit",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const PIE_COLORS = ["#c8963b", "#3f7254", "#4a6a9b", "#9b5f4a", "#6a4a9b", "#4a9b7f"];

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function LoginView({ onLogin }: { onLogin: (user: RapaduraUser) => void }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{
    role: "assistant",
    content: "Sistema privado de inteligência patrimonial.\n\nQuem é você?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidate, setCandidate] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

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
        setMsgs(m => [...m, {
          role: "assistant",
          content: `${data.candidate}. Por favor, insira sua senha abaixo.`,
        }]);
      } else if (data.action === "deny") {
        setMsgs(m => [...m, { role: "assistant", content: data.message ?? "Acesso negado." }]);
      } else {
        setMsgs(m => [...m, { role: "assistant", content: data.message ?? "..." }]);
      }
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Sistema indisponível. Tente novamente." }]);
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
        setError(data.error ?? "Credencial incorreta.");
        setPassword("");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#040507",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "24px 16px",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <img
          src={LOGO}
          alt="Rapadura R"
          style={{ width: 90, height: 90, objectFit: "contain", marginBottom: 10 }}
        />
        <div style={{
          fontSize: 32, fontWeight: 300, letterSpacing: "0.35em",
          color: "#c8963b", lineHeight: 1, paddingRight: "0.35em",
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}>
          Rapadura
        </div>
        <div style={{
          fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "#3d4a5e", marginTop: 8,
        }}>
          Yuri &amp; Mayumi Investment Hub
        </div>
      </div>

      {/* Chat container */}
      <div style={{
        width: "100%", maxWidth: 420,
        border: "1px solid #141b26", background: "#07090e",
      }}>
        {/* Top bar */}
        <div style={{
          padding: "10px 14px", borderBottom: "1px solid #0f1520",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8963b" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8963b" }}>
            RAPADURA
          </span>
        </div>

        {/* Messages */}
        <div style={{ height: 240, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "85%", padding: "8px 12px",
                background: m.role === "user" ? "rgba(200,150,59,0.08)" : "#0c1018",
                border: `1px solid ${m.role === "user" ? "rgba(200,150,59,0.2)" : "#141b26"}`,
                fontSize: 12, lineHeight: 1.6, color: m.role === "user" ? "#c5c0b8" : "#9a9590",
                whiteSpace: "pre-wrap",
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "8px 12px", background: "#0c1018", border: "1px solid #141b26",
                fontSize: 11, color: "#3d4a5e",
              }}>
                processando…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        {!candidate ? (
          <div style={{ padding: "10px 12px", borderTop: "1px solid #0f1520", display: "flex", gap: 8 }}>
            <input
              style={{
                flex: 1, background: "#040507", border: "1px solid #141b26",
                color: "#c5c0b8", fontSize: 12, padding: "8px 10px",
                outline: "none", fontFamily: "inherit",
              }}
              placeholder="Seu nome…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
              disabled={loading}
              onFocus={e => { e.target.style.borderColor = "#5a4020"; }}
              onBlur={e => { e.target.style.borderColor = "#141b26"; }}
            />
            <button
              onClick={sendChat}
              disabled={loading || !input.trim()}
              style={{
                padding: "8px 14px", background: loading || !input.trim() ? "#1a1f2a" : "#c8963b",
                color: loading || !input.trim() ? "#3d4a5e" : "#040507",
                fontSize: 12, fontWeight: 700, border: "none",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: "0.05em",
                transition: "all .15s",
              }}
            >
              →
            </button>
          </div>
        ) : (
          <div style={{ padding: "10px 12px", borderTop: "1px solid #0f1520", display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="password"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#040507", border: "1px solid #5a4020",
                color: "#c5c0b8", fontSize: 12, padding: "8px 10px",
                outline: "none", fontFamily: "inherit",
              }}
              placeholder="Senha…"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitPassword()}
              disabled={pwLoading}
              autoFocus
            />
            {error && (
              <div style={{ fontSize: 11, color: "#9a4040", letterSpacing: "0.02em" }}>{error}</div>
            )}
            <button
              onClick={submitPassword}
              disabled={pwLoading || !password.trim()}
              style={{
                padding: "9px 14px",
                background: pwLoading || !password.trim() ? "#1a1f2a" : "#c8963b",
                color: pwLoading || !password.trim() ? "#3d4a5e" : "#040507",
                fontSize: 11, fontWeight: 700, border: "none",
                cursor: pwLoading || !password.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              {pwLoading ? "Verificando…" : "Entrar"}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 28, fontSize: 9, letterSpacing: "0.2em", color: "#1c2030", textTransform: "uppercase" }}>
        Sistema privado · Sociedade Tucci · 2026
      </div>
    </div>
  );
}

// ─── OPORTUNIDADES ────────────────────────────────────────────────────────────

function OportunidadesView({
  fundos, isAdmin, onGerenciar,
}: {
  fundos: Fundo[];
  isAdmin: boolean;
  onGerenciar: () => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #0f1520",
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 5 }}>
            Inteligência patrimonial
          </div>
          <div style={{ fontSize: 22, fontWeight: 300, color: "#ddd8d0", letterSpacing: "-0.01em" }}>
            Oportunidades
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={onGerenciar}
            style={{
              fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#5a5650", border: "1px solid #1a2030", background: "transparent",
              padding: "7px 12px", cursor: "pointer", fontFamily: "inherit",
              transition: "color .15s, border-color .15s",
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.color = "#c8963b";
              (e.target as HTMLElement).style.borderColor = "#5a4020";
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.color = "#5a5650";
              (e.target as HTMLElement).style.borderColor = "#1a2030";
            }}
          >
            + Gerenciar fundos
          </button>
        )}
      </div>

      {fundos.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 0", color: "#3d4a5e", fontSize: 13 }}>
          {isAdmin
            ? <>Nenhum fundo cadastrado.<br /><button onClick={onGerenciar} style={{ marginTop: 12, color: "#c8963b", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>Adicionar primeiro →</button></>
            : "Nenhum fundo disponível no momento."
          }
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {fundos.map((f, i) => {
          const open = expanded === f.id;
          const atrat = Number(f.scoreAtratividade ?? 0);
          return (
            <div
              key={f.id}
              style={{
                background: "#09101a",
                borderLeft: `2px solid ${atrat >= 70 ? "#c8963b" : atrat >= 45 ? "#5a4020" : "#3a2020"}`,
                cursor: "pointer",
                transition: "background .15s",
              }}
              onClick={() => setExpanded(open ? null : f.id)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#0b1320"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#09101a"; }}
            >
              {/* Card principal */}
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <span style={{
                        fontSize: 10, fontFamily: "monospace", color: "#2a3545",
                        letterSpacing: "0.05em", minWidth: 20,
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{
                        fontSize: 13, fontWeight: 600, color: "#ddd8d0",
                        letterSpacing: "0.01em", overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {f.nome}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 10, color: "#3d4a5e", marginTop: 4, marginLeft: 30,
                      letterSpacing: "0.04em",
                    }}>
                      {f.gestora} · {f.classe} · {f.benchmark}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <VerdeBadge fatorVerde={f.fatorVerde} confiancaVerde={f.confiancaVerde} />
                    <LiquidBadge dias={f.prazoResgateDias} />
                    <ScoreBadge value={f.scoreAtratividade} />
                    <span style={{ fontSize: 10, color: "#2a3545" }}>{open ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Métricas rápidas */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                  marginTop: 14, marginLeft: 30, gap: 1,
                }}>
                  <MetricCell label="Sharpe" value={numFmt(f.sharpe12m)} />
                  <MetricCell label="Drawdown" value={f.maxDrawdown ? `-${pct(f.maxDrawdown)}` : "—"} />
                  <MetricCell label="Retorno 12M" value={pct(f.retorno12m)} />
                  <MetricCell label="Taxa adm" value={f.taxaAdm ? `${f.taxaAdm}%aa` : "—"} />
                </div>
              </div>

              {/* Score detalhado expandido */}
              {open && f.scoreDetalhado && (
                <div style={{
                  padding: "16px 18px 18px 48px",
                  borderTop: "1px solid #0f1520",
                  background: "#070d14",
                }}>
                  <div style={{
                    fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "#3d4a5e", marginBottom: 16,
                  }}>
                    Score Detalhado
                  </div>
                  <ScoreRow label="Retorno ajustado ao risco" value={f.scoreDetalhado.retornoAjustado ?? 0} />
                  <ScoreRow label="Controle de queda" value={f.scoreDetalhado.controleQueda ?? 0} />
                  <ScoreRow label="Consistência 36M" value={f.scoreDetalhado.consistencia ?? 0} />
                  <ScoreRow label="Custo real" value={f.scoreDetalhado.custo ?? 0} />
                  <ScoreRow label="Liquidez" value={f.scoreDetalhado.liquidez ?? 0} />
                  {f.scoreDetalhado.fatorVerde != null && (
                    <ScoreRow label="Fator Verde 🌿" value={f.scoreDetalhado.fatorVerde} />
                  )}

                  <div style={{
                    marginTop: 12, paddingTop: 12, borderTop: "1px solid #0f1520",
                    display: "flex", gap: 20, flexWrap: "wrap",
                  }}>
                    <span style={{ fontSize: 10, color: "#3d4a5e" }}>
                      Confiança:{" "}
                      <span style={{ color: "#8a7a6a", fontFamily: "monospace" }}>
                        {Number(f.scoreConfianca ?? 0).toFixed(1)}/100
                      </span>
                    </span>
                    {f.calmarRatio && (
                      <span style={{ fontSize: 10, color: "#3d4a5e" }}>
                        Calmar:{" "}
                        <span style={{ color: "#8a7a6a", fontFamily: "monospace" }}>{f.calmarRatio}</span>
                      </span>
                    )}
                    {f.valorMinAplicacao && (
                      <span style={{ fontSize: 10, color: "#3d4a5e" }}>
                        Mín:{" "}
                        <span style={{ color: "#8a7a6a", fontFamily: "monospace" }}>
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(f.valorMinAplicacao))}
                        </span>
                      </span>
                    )}
                    {!f.temLinhaDAGua && (
                      <span style={{ fontSize: 10, color: "#7a5050" }}>⚠ Sem High-Water Mark</span>
                    )}
                    {f.cnpj && (
                      <span style={{ fontSize: 10, color: "#2a3545", fontFamily: "monospace" }}>
                        CNPJ {f.cnpj}
                      </span>
                    )}
                  </div>
                  {f.notas && (
                    <div style={{ marginTop: 10, fontSize: 11, color: "#3d4a5e", fontStyle: "italic" }}>
                      {f.notas}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PERTENCES ────────────────────────────────────────────────────────────────

function PertencesView({
  pertences, dashboard, fundos, onRefresh,
}: {
  pertences: Pertence[];
  dashboard: Dashboard;
  fundos: Fundo[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    fundoId: "", dataCompra: "", valorInvestido: "",
    qtdCotas: "", precoCotaCompra: "", valorAtual: "", notas: "", motivoI438: "",
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [showInvestir, setShowInvestir] = useState(false);
  const [showColher, setShowColher] = useState(false);
  const [showImportar, setShowImportar] = useState(false);

  const resultado = dashboard.resultado;
  const rentabilidade = dashboard.rentabilidade;

  // Gráfico de patrimônio
  const sorted = [...pertences].sort((a, b) => a.dataCompra.localeCompare(b.dataCompra));
  let cum = 0;
  const lineData = sorted.map(p => {
    cum += Number(p.valorInvestido ?? 0);
    return { data: p.dataCompra.slice(5), total: Math.round(cum * 100) / 100 };
  });

  // Gráfico de pizza
  const byClasse: Record<string, number> = {};
  for (const p of pertences) {
    const k = p.fundoClasse ?? "Outros";
    byClasse[k] = (byClasse[k] ?? 0) + Number(p.valorInvestido ?? 0);
  }
  const pieData = Object.entries(byClasse).map(([name, value]) => ({ name, value: Math.round(value) }));

  function reset() {
    setForm({ fundoId: "", dataCompra: "", valorInvestido: "", qtdCotas: "", precoCotaCompra: "", valorAtual: "", notas: "", motivoI438: "" });
    setShowForm(false);
    setEditId(null);
  }

  function startEdit(p: Pertence) {
    setForm({
      fundoId: String(p.fundoId), dataCompra: p.dataCompra,
      valorInvestido: p.valorInvestido, qtdCotas: p.qtdCotas ?? "",
      precoCotaCompra: p.precoCotaCompra ?? "", valorAtual: p.valorAtual ?? "", notas: p.notas ?? "",
      motivoI438: "",
    });
    setEditId(p.id);
    setShowForm(false);
  }

  async function submit() {
    if (!form.fundoId || !form.dataCompra || !form.valorInvestido) return;
    const valorNum = parseFloat(form.valorInvestido);
    if (valorNum >= 1000 && !form.motivoI438.trim()) {
      alert("Operação acima de R$1.000: preencha o campo 'Por que estou fazendo isso?' (I438).");
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `${API}/api/rapadura/pertences/${editId}` : `${API}/api/rapadura/pertences`;
      await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          fundoId: parseInt(form.fundoId),
          valorInvestido: valorNum,
          motivoI438: form.motivoI438 || undefined,
        }),
      });
      reset();
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function del(id: number) {
    await fetch(`${API}/api/rapadura/pertences/${id}`, { method: "DELETE", credentials: "include" });
    setConfirmDel(null);
    onRefresh();
  }

  const f = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      {/* Modais */}
      {showInvestir && <InvestirModal onClose={() => setShowInvestir(false)} />}
      {showColher && <ColherModal onClose={() => setShowColher(false)} />}
      {showImportar && <ImportarXPModal fundos={fundos} onClose={() => { setShowImportar(false); onRefresh(); }} />}

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #0f1520",
        flexWrap: "wrap", gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 5 }}>
            Carteira
          </div>
          <div style={{ fontSize: 22, fontWeight: 300, color: "#ddd8d0", letterSpacing: "-0.01em" }}>
            Pertences
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => window.open(`${API}/api/rapadura/relatorio/pdf`, "_blank")}
            style={{
              fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#4a6a9b", border: "1px solid #2a3a5a", background: "rgba(74,106,155,0.06)",
              padding: "7px 12px", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            PDF ↓
          </button>
          <button
            onClick={() => setShowImportar(true)}
            style={{
              fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#6a7a40", border: "1px solid #3a4a20", background: "rgba(106,122,64,0.06)",
              padding: "7px 12px", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Importar XP
          </button>
          <button
            onClick={() => setShowColher(true)}
            style={{
              fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#3f7254", border: "1px solid #2a4a38", background: "rgba(63,114,84,0.06)",
              padding: "7px 12px", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Colher →
          </button>
          <button
            onClick={() => setShowInvestir(true)}
            style={{
              fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#c8963b", border: "1px solid #5a4020", background: "rgba(200,150,59,0.06)",
              padding: "7px 12px", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Investir +
          </button>
          <button
            onClick={() => { reset(); setShowForm(true); }}
            style={{
              fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: "#5a5650", border: "1px solid #1a2030", background: "transparent",
              padding: "7px 12px", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Compra
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, marginBottom: dashboard.totalRetirado > 0 ? 8 : 24 }}>
        <KpiCard label="Total investido" value={fmt(dashboard.totalInvestido)} />
        <KpiCard label="Valor atual" value={fmt(dashboard.totalAtual)} />
        <KpiCard
          label="Resultado total"
          value={`${resultado >= 0 ? "+" : ""}${fmt(resultado)}`}
          color={resultado >= 0 ? "#3f7254" : "#7a3535"}
        />
        <KpiCard
          label="Rentabilidade"
          value={`${rentabilidade >= 0 ? "+" : ""}${rentabilidade.toFixed(2)}%`}
          color={rentabilidade >= 0 ? "#3f7254" : "#7a3535"}
        />
      </div>
      {dashboard.totalRetirado > 0 && (
        <div style={{
          background: "#09101a", padding: "10px 14px", marginBottom: 24,
          borderLeft: "2px solid #5a4020", display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a4020" }}>Já retirado</span>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "#8a6b30" }}>{fmt(dashboard.totalRetirado)}</span>
          <span style={{ fontSize: 10, color: "#3d4a5e" }}>incluído no resultado total</span>
        </div>
      )}

      {/* Gráficos */}
      {pertences.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 24 }}>
          {lineData.length > 1 && (
            <div style={{ background: "#09101a", padding: "14px 16px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 12 }}>
                Patrimônio acumulado
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0f1520" />
                  <XAxis dataKey="data" tick={{ fontSize: 9, fill: "#3d4a5e" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#3d4a5e" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: number) => [fmt(v), ""]}
                    contentStyle={{ background: "#07090e", border: "1px solid #141b26", borderRadius: 0, fontSize: 11 }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#c8963b" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {pieData.length > 0 && (
            <div style={{ background: "#09101a", padding: "14px 16px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 12 }}>
                Alocação por classe
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [fmt(v), ""]}
                    contentStyle={{ background: "#07090e", border: "1px solid #141b26", borderRadius: 0, fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 4 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 6, height: 6, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span style={{ fontSize: 9, color: "#5a5650", letterSpacing: "0.06em" }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulário */}
      {(showForm || editId !== null) && (
        <div style={{
          background: "#07090e", border: "1px solid #1a2a10",
          padding: "18px 18px", marginBottom: 20,
        }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#4a7040", marginBottom: 16,
          }}>
            {editId ? "Editar posição" : "Nova posição"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5650", marginBottom: 5 }}>
                Fundo
              </div>
              <select
                value={form.fundoId}
                onChange={e => f("fundoId")(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#040507", border: "1px solid #141b26",
                  color: "#c5c0b8", fontSize: 12, padding: "8px 10px",
                  outline: "none", fontFamily: "inherit",
                }}
              >
                <option value="">Selecionar fundo…</option>
                {fundos.map(fnd => <option key={fnd.id} value={fnd.id}>{fnd.nome}</option>)}
              </select>
            </div>
            <Field label="Data da compra" type="date" value={form.dataCompra} onChange={f("dataCompra")} />
            <Field label="Valor investido (R$)" type="number" value={form.valorInvestido} onChange={f("valorInvestido")} placeholder="0,00" />
            <Field label="Qtd de cotas" type="number" value={form.qtdCotas} onChange={f("qtdCotas")} placeholder="opcional" />
            <Field label="Preço da cota (R$)" type="number" value={form.precoCotaCompra} onChange={f("precoCotaCompra")} placeholder="opcional" />
            <Field label="Valor atual (R$)" type="number" value={form.valorAtual} onChange={f("valorAtual")} placeholder="opcional" />
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Notas" value={form.notas} onChange={f("notas")} placeholder="opcional…" />
            </div>
            {parseFloat(form.valorInvestido || "0") >= 1000 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <Field
                  label="Por que estou fazendo isso? (obrigatório acima de R$1.000)"
                  value={form.motivoI438}
                  onChange={f("motivoI438")}
                  placeholder="Justificativa da operação — I438"
                />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button
              onClick={reset}
              style={{
                padding: "8px 14px", background: "transparent", border: "1px solid #1a2030",
                color: "#5a5650", fontSize: 10, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "0.1em", textTransform: "uppercase",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={saving || !form.fundoId || !form.dataCompra || !form.valorInvestido}
              style={{
                padding: "8px 16px",
                background: saving || !form.fundoId ? "#1a2030" : "#c8963b",
                color: saving || !form.fundoId ? "#3d4a5e" : "#040507",
                fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "0.1em", textTransform: "uppercase",
                opacity: saving || !form.fundoId || !form.dataCompra || !form.valorInvestido ? 0.5 : 1,
              }}
            >
              {saving ? "Salvando…" : editId ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de posições */}
      {pertences.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#3d4a5e", fontSize: 12 }}>
          Nenhuma posição registrada.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {pertences.map(p => {
            const vi = Number(p.valorInvestido);
            const va = Number(p.valorAtual ?? p.valorInvestido);
            const retirado = Number(p.totalRetirado ?? 0);
            const res = (va + retirado) - vi;
            const rent = vi > 0 ? (res / vi) * 100 : 0;
            const isEdit = editId === p.id;
            return (
              <div
                key={p.id}
                style={{
                  background: isEdit ? "#07090e" : "#09101a",
                  borderLeft: `2px solid ${isEdit ? "#c8963b" : "#141b26"}`,
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#ddd8d0" }}>{p.fundoNome}</span>
                      {p.statusReconciliacao === "RECONCILIACAO_PENDENTE" && (
                        <span style={{
                          fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase",
                          color: "#c8963b", border: "1px solid #5a402040",
                          background: "rgba(200,150,59,0.08)", padding: "2px 6px",
                        }}>
                          ⚠ parcial pendente
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "#3d4a5e", marginTop: 3, letterSpacing: "0.04em" }}>
                      {p.fundoGestora} · {p.fundoClasse} · {p.dataCompra}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => isEdit ? reset() : startEdit(p)}
                      style={{
                        fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                        color: isEdit ? "#c8963b" : "#3d4a5e",
                        background: "transparent", border: "none", cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {isEdit ? "cancelar" : "editar"}
                    </button>
                    {confirmDel === p.id ? (
                      <>
                        <button
                          onClick={() => del(p.id)}
                          style={{
                            fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                            color: "#9a4040", border: "1px solid #7a303030",
                            background: "transparent", padding: "3px 8px", cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDel(null)}
                          style={{ fontSize: 11, color: "#3d4a5e", background: "none", border: "none", cursor: "pointer" }}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDel(p.id)}
                        style={{
                          fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                          color: "#3d4a5e", background: "transparent", border: "none",
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                        onMouseEnter={e => { (e.target as HTMLElement).style.color = "#7a3535"; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.color = "#3d4a5e"; }}
                      >
                        excluir
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, marginTop: 10 }}>
                  <MetricCell label="Investido" value={fmt(vi)} />
                  <MetricCell label="Atual" value={fmt(va)} />
                  <MetricCell
                    label="Resultado"
                    value={`${res >= 0 ? "+" : ""}${fmt(res)} (${rent >= 0 ? "+" : ""}${rent.toFixed(2)}%)`}
                  />
                </div>
                {isEdit && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Field label="Data da compra" type="date" value={form.dataCompra} onChange={f("dataCompra")} />
                      <Field label="Valor investido (R$)" type="number" value={form.valorInvestido} onChange={f("valorInvestido")} />
                      <Field label="Qtd de cotas" type="number" value={form.qtdCotas} onChange={f("qtdCotas")} />
                      <Field label="Valor atual (R$)" type="number" value={form.valorAtual} onChange={f("valorAtual")} />
                      <div style={{ gridColumn: "1 / -1" }}>
                        <Field label="Notas" value={form.notas} onChange={f("notas")} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                      <button onClick={reset} style={{ padding: "7px 12px", background: "transparent", border: "1px solid #1a2030", color: "#5a5650", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
                      <button
                        onClick={submit}
                        disabled={saving}
                        style={{ padding: "7px 14px", background: "#c8963b", color: "#040507", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        {saving ? "…" : "Salvar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── GERENCIAR FUNDOS (admin only) ────────────────────────────────────────────

function GerenciarView({ fundos, onRefresh, onBack }: { fundos: Fundo[]; onRefresh: () => void; onBack: () => void }) {
  const blank = {
    nome: "", gestora: "", classe: "Multimercado", benchmark: "CDI", cnpj: "",
    taxaAdm: "", taxaPerformance: "", temLinhaDAGua: true, prazoResgateDias: "30",
    sharpe12m: "", sortino12m: "", maxDrawdown: "", tempoRecuperacaoDias: "",
    volatilidade12m: "", retorno12m: "", retorno36m: "", alfa36m: "",
    fatorVerde: "", confiancaVerde: "", valorMinAplicacao: "", notas: "",
  };
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  function reset() { setForm(blank); setShowForm(false); setEditId(null); }

  function startEdit(fnd: Fundo) {
    setForm({
      nome: fnd.nome, gestora: fnd.gestora, classe: fnd.classe, benchmark: fnd.benchmark, cnpj: fnd.cnpj ?? "",
      taxaAdm: fnd.taxaAdm ?? "", taxaPerformance: fnd.taxaPerformance ?? "",
      temLinhaDAGua: fnd.temLinhaDAGua, prazoResgateDias: String(fnd.prazoResgateDias),
      sharpe12m: fnd.sharpe12m ?? "", sortino12m: fnd.sortino12m ?? "", maxDrawdown: fnd.maxDrawdown ?? "",
      tempoRecuperacaoDias: fnd.tempoRecuperacaoDias ? String(fnd.tempoRecuperacaoDias) : "",
      volatilidade12m: fnd.volatilidade12m ?? "", retorno12m: fnd.retorno12m ?? "",
      retorno36m: fnd.retorno36m ?? "", alfa36m: fnd.alfa36m ?? "",
      fatorVerde: fnd.fatorVerde != null ? String(fnd.fatorVerde) : "",
      confiancaVerde: fnd.confiancaVerde != null ? String(fnd.confiancaVerde) : "",
      valorMinAplicacao: fnd.valorMinAplicacao ?? "",
      notas: fnd.notas ?? "",
    });
    setEditId(fnd.id);
    setShowForm(false);
  }

  async function submit() {
    if (!form.nome || !form.gestora) return;
    setSaving(true);
    try {
      const url = editId ? `${API}/api/rapadura/fundos/${editId}` : `${API}/api/rapadura/fundos`;
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
        fatorVerde: form.fatorVerde ? parseInt(form.fatorVerde) : null,
        confiancaVerde: form.confiancaVerde ? parseInt(form.confiancaVerde) : null,
        valorMinAplicacao: form.valorMinAplicacao ? parseFloat(form.valorMinAplicacao) : null,
      };
      await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      reset();
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function del(id: number) {
    await fetch(`${API}/api/rapadura/fundos/${id}`, { method: "DELETE", credentials: "include" });
    setConfirmDel(null);
    onRefresh();
  }

  const inp = (label: string, key: keyof typeof form, type = "text", ph = "") => (
    <Field key={key} label={label} type={type} value={String(form[key])} onChange={v => setForm(f => ({ ...f, [key]: v }))} placeholder={ph} />
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #0f1520" }}>
        <button
          onClick={onBack}
          style={{ fontSize: 10, color: "#3d4a5e", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.08em" }}
        >
          ← voltar
        </button>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 3 }}>Administração</div>
          <div style={{ fontSize: 22, fontWeight: 300, color: "#ddd8d0" }}>Gerenciar Fundos</div>
        </div>
      </div>

      <button
        onClick={() => { reset(); setShowForm(true); }}
        style={{
          fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
          color: "#c8963b", border: "1px solid #5a4020", background: "rgba(200,150,59,0.06)",
          padding: "7px 12px", cursor: "pointer", fontFamily: "inherit", marginBottom: 20,
        }}
      >
        + Novo fundo
      </button>

      {(showForm || editId !== null) && (
        <div style={{ background: "#07090e", border: "1px solid #1a2030", padding: "18px", marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8963b", marginBottom: 16 }}>
            {editId ? "Editar fundo" : "Novo fundo"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {inp("Nome do fundo *", "nome", "text", "XP Platinum FIC…")}
            {inp("Gestora *", "gestora", "text", "XP Asset…")}
            <SelectField label="Classe" value={form.classe} onChange={v => setForm(f => ({ ...f, classe: v }))} options={["Multimercado", "Ação", "Ações", "Renda Variável", "Renda Fixa", "Pós Fixado", "Pré Fixado", "Crédito Privado", "FII", "Internacional", "Cripto"]} />
            <SelectField label="Benchmark" value={form.benchmark} onChange={v => setForm(f => ({ ...f, benchmark: v }))} options={["CDI", "Ibovespa", "IPCA+6%", "IPCA+8%", "S&P 500", "Dólar"]} />
            {inp("Taxa Adm (%aa)", "taxaAdm", "number", "1.50")}
            {inp("Taxa Performance (%)", "taxaPerformance", "number", "20")}
            {inp("Prazo resgate (dias)", "prazoResgateDias", "number", "30")}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 20 }}>
              <input
                type="checkbox"
                id="lda"
                checked={form.temLinhaDAGua}
                onChange={e => setForm(f => ({ ...f, temLinhaDAGua: e.target.checked }))}
                style={{ accentColor: "#c8963b" }}
              />
              <label htmlFor="lda" style={{ fontSize: 10, color: "#7a746c", letterSpacing: "0.06em" }}>Tem High-Water Mark</label>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #0f1520" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 12 }}>
              Métricas de performance
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {inp("Sharpe 12M", "sharpe12m", "number", "0.85")}
              {inp("Sortino 12M", "sortino12m", "number", "1.20")}
              {inp("Max Drawdown (%)", "maxDrawdown", "number", "15.5")}
              {inp("Recuperação (dias)", "tempoRecuperacaoDias", "number", "180")}
              {inp("Volatilidade 12M (%)", "volatilidade12m", "number", "12.3")}
              {inp("Retorno 12M (%)", "retorno12m", "number", "18.5")}
              {inp("Retorno 36M (%)", "retorno36m", "number", "45.0")}
              {inp("Alfa 36M (%)", "alfa36m", "number", "8.0")}
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #0f1520" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 12 }}>
              Sustentabilidade (opcional)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {inp("Fator Verde (0-100)", "fatorVerde", "number", "75")}
              {inp("Confiança Verde (0-100)", "confiancaVerde", "number", "80")}
              {inp("Valor mínimo (R$)", "valorMinAplicacao", "number", "500")}
            </div>
            <div style={{ fontSize: 10, color: "#3d4a5e", marginTop: 6, fontStyle: "italic" }}>
              Score Verde = Fator × Confiança ÷ 100 (anti-greenwashing)
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            {inp("CNPJ", "cnpj", "text", "00.000.000/0001-00")}
            {inp("Notas", "notas", "text", "observações…")}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={reset} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #1a2030", color: "#5a5650", fontSize: 10, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.1em" }}>
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={saving || !form.nome || !form.gestora}
              style={{
                padding: "8px 18px", background: saving || !form.nome ? "#1a2030" : "#c8963b",
                color: saving || !form.nome ? "#3d4a5e" : "#040507",
                fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "0.1em", textTransform: "uppercase",
                opacity: saving || !form.nome || !form.gestora ? 0.5 : 1,
              }}
            >
              {saving ? "Salvando…" : editId ? "Salvar" : "Criar"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {fundos.map(fnd => (
          <div
            key={fnd.id}
            style={{
              background: editId === fnd.id ? "#07090e" : "#09101a",
              borderLeft: `2px solid ${editId === fnd.id ? "#c8963b" : "#141b26"}`,
              padding: "12px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd8d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {fnd.nome}
              </div>
              <div style={{ fontSize: 10, color: "#3d4a5e", marginTop: 2, letterSpacing: "0.04em" }}>
                {fnd.gestora} · {fnd.classe} · Score {Number(fnd.scoreAtratividade ?? 0).toFixed(1)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => editId === fnd.id ? reset() : startEdit(fnd)} style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: editId === fnd.id ? "#c8963b" : "#3d4a5e", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {editId === fnd.id ? "cancelar" : "editar"}
              </button>
              {confirmDel === fnd.id ? (
                <>
                  <button onClick={() => del(fnd.id)} style={{ fontSize: 9, color: "#9a4040", border: "1px solid #5a303030", background: "none", padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>confirmar</button>
                  <button onClick={() => setConfirmDel(null)} style={{ fontSize: 11, color: "#3d4a5e", background: "none", border: "none", cursor: "pointer" }}>×</button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDel(fnd.id)}
                  style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3d4a5e", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = "#7a3535"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = "#3d4a5e"; }}
                >
                  excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MODAL INVESTIR ──────────────────────────────────────────────────────────

function InvestirModal({ onClose }: { onClose: () => void }) {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestirResult | null>(null);
  const [error, setError] = useState("");

  async function simular() {
    const v = parseFloat(valor.replace(",", "."));
    if (!v || v <= 0) { setError("Informe um valor válido."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch(`${API}/api/rapadura/investir`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ valorTotal: v }),
      });
      const d = await r.json() as InvestirResult;
      setResult(d);
    } catch { setError("Erro de conexão."); }
    finally { setLoading(false); }
  }

  const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#07090e", border: "1px solid #1a2030", padding: 28, width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8963b" }}>Investir na Rapadura</div>
            <div style={{ fontSize: 12, color: "#5a5650", marginTop: 3 }}>Alocação inteligente por score</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 18, color: "#3d4a5e", background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input
            type="number"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="Valor total a investir (R$)"
            onKeyDown={e => e.key === "Enter" && simular()}
            style={{ flex: 1, background: "#040507", border: "1px solid #141b26", color: "#c5c0b8", fontSize: 14, padding: "10px 12px", outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={simular}
            disabled={loading}
            style={{ padding: "10px 20px", background: loading ? "#1a2030" : "#c8963b", color: loading ? "#3d4a5e" : "#040507", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em" }}
          >
            {loading ? "…" : "Simular"}
          </button>
        </div>

        {error && <div style={{ fontSize: 11, color: "#9a4040", marginBottom: 12 }}>{error}</div>}

        {result && (
          <div>
            {result.mensagem && <div style={{ fontSize: 11, color: "#5a5650", marginBottom: 12 }}>{result.mensagem}</div>}
            {result.alocacao.length > 0 && (
              <>
                <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 10 }}>
                  Distribuição sugerida — {fmtBRL(result.totalAlocado)}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {result.alocacao.map(a => (
                    <div key={a.fundoId} style={{ background: "#090f18", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#ddd8d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nome}</div>
                        <div style={{ fontSize: 10, color: "#3d4a5e", marginTop: 2 }}>{a.gestora} · Score {Number(a.scoreAtratividade ?? 0).toFixed(0)}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#c8963b" }}>{fmtBRL(a.valor)}</div>
                        <div style={{ fontSize: 10, color: "#5a5650" }}>{a.percentual.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 10, color: "#3d4a5e", fontStyle: "italic" }}>
                  Simulação orientativa. Verifique disponibilidade e liquidez antes de executar na XP.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL COLHER ─────────────────────────────────────────────────────────────

function ColherModal({ onClose }: { onClose: () => void }) {
  const [valor, setValor] = useState("");
  const [raiz, setRaiz] = useState("10");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ColherResult | null>(null);
  const [error, setError] = useState("");

  async function simular() {
    const v = parseFloat(valor.replace(",", "."));
    if (!v || v <= 0) { setError("Informe um valor de resgate."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch(`${API}/api/rapadura/colher`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ valorDesejado: v, raizMinima: parseFloat(raiz) || 10 }),
      });
      const d = await r.json() as ColherResult;
      setResult(d);
    } catch { setError("Erro de conexão."); }
    finally { setLoading(false); }
  }

  const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#07090e", border: "1px solid #1a2030", padding: 28, width: "100%", maxWidth: 500 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#3f7254" }}>Colher Rapadura</div>
            <div style={{ fontSize: 12, color: "#5a5650", marginTop: 3 }}>Resgate com raiz mínima preservada</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 18, color: "#3d4a5e", background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 16 }}>
          <input
            type="number"
            value={valor}
            onChange={e => setValor(e.target.value)}
            placeholder="Valor a resgatar (R$)"
            onKeyDown={e => e.key === "Enter" && simular()}
            style={{ background: "#040507", border: "1px solid #141b26", color: "#c5c0b8", fontSize: 14, padding: "10px 12px", outline: "none", fontFamily: "inherit" }}
          />
          <div>
            <div style={{ fontSize: 9, color: "#3d4a5e", marginBottom: 4, letterSpacing: "0.1em" }}>RAIZ MÍNIMA (%)</div>
            <input
              type="number"
              value={raiz}
              onChange={e => setRaiz(e.target.value)}
              min={0} max={50}
              style={{ width: "100%", boxSizing: "border-box", background: "#040507", border: "1px solid #141b26", color: "#c5c0b8", fontSize: 12, padding: "10px 10px", outline: "none", fontFamily: "inherit" }}
            />
          </div>
        </div>

        <button
          onClick={simular}
          disabled={loading}
          style={{ width: "100%", padding: "10px", background: loading ? "#1a2030" : "#3f7254", color: loading ? "#3d4a5e" : "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.08em", marginBottom: 16 }}
        >
          {loading ? "Calculando…" : "Simular colheita"}
        </button>

        {error && <div style={{ fontSize: 11, color: "#9a4040", marginBottom: 12 }}>{error}</div>}

        {result && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 14 }}>
              {[
                ["Desejado", fmtBRL(result.valorDesejado)],
                ["Resgatável", fmtBRL(result.totalResgatado)],
                ["Não atendido", fmtBRL(result.naoAtendido)],
              ].map(([l, v]) => (
                <div key={l} style={{ background: "#090f18", padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: "#3d4a5e", letterSpacing: "0.12em", textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontSize: 12, fontFamily: "monospace", color: "#c5c0b8", fontWeight: 600, marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>
            {result.colheita.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {result.colheita.map(c => (
                  <div key={c.pertenceId} style={{ background: "#090f18", padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#ddd8d0" }}>{c.fundoNome}</span>
                      <span style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#3f7254" }}>{fmtBRL(c.valorResgatar)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, color: "#3d4a5e" }}>
                      <span>Atual: {fmtBRL(c.valorAtual)}</span>
                      <span>Restante: {fmtBRL(c.valorRestante)}</span>
                      <span>Raiz: {fmtBRL(c.raizPreservada)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 10, color: "#3d4a5e", fontStyle: "italic" }}>
              Simulação orientativa. A raiz ({result.raizPct}% do investido) é preservada em cada fundo.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANALISAR ────────────────────────────────────────────────────────────────

function AnalisarView() {
  const [data, setData] = useState<AnalisarResult | null>(null);
  const [loading, setLoading] = useState(true);
  const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  useEffect(() => {
    fetch(`${API}/api/rapadura/analise`, { credentials: "include" })
      .then(r => r.json() as Promise<AnalisarResult>)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "48px 0", color: "#3d4a5e", fontSize: 12 }}>Analisando carteira…</div>;
  if (!data) return <div style={{ textAlign: "center", padding: "48px 0", color: "#3d4a5e" }}>Erro ao carregar análise.</div>;

  return (
    <div>
      <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #0f1520" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 5 }}>Inteligência</div>
        <div style={{ fontSize: 22, fontWeight: 300, color: "#ddd8d0" }}>Pertences × Oportunidades</div>
      </div>

      {/* KPIs da carteira */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, marginBottom: 28 }}>
        <div style={{ background: "#09101a", padding: "14px 16px", borderTop: "2px solid #c8963b" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#4a4540" }}>Score médio carteira</div>
          <div style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 700, color: "#c8963b", marginTop: 6 }}>{data.carteira.scoreMedio}</div>
        </div>
        <div style={{ background: "#09101a", padding: "14px 16px", borderTop: "2px solid #1a2a40" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#4a4540" }}>Fundos na carteira</div>
          <div style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 700, color: "#ddd8d0", marginTop: 6 }}>{data.carteira.quantidadeFundos}</div>
        </div>
        <div style={{ background: "#09101a", padding: "14px 16px", borderTop: "2px solid #1a2a40" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#4a4540" }}>Total investido</div>
          <div style={{ fontSize: 18, fontFamily: "monospace", fontWeight: 700, color: "#ddd8d0", marginTop: 6 }}>{fmtBRL(data.carteira.totalInvestido)}</div>
        </div>
      </div>

      {/* Sugestões de troca */}
      {data.sugestoesTroca.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 12 }}>
            Sugestões de Troca
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.sugestoesTroca.map((s, i) => (
              <div key={i} style={{ background: "#09101a", padding: "14px 16px", borderLeft: `2px solid ${s.indiceTroca === "FORTE" ? "#c8963b" : "#3d4a5e"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, color: "#7a3535" }}>← {s.emCarteira.nome}</span>
                    <span style={{ fontSize: 10, color: "#3d4a5e", display: "block", marginTop: 2 }}>Score {Number(s.emCarteira.score ?? 0).toFixed(0)} · {fmtBRL(Number(s.emCarteira.valorInvestido))}</span>
                  </div>
                  <div style={{ textAlign: "center", padding: "0 8px" }}>
                    <div style={{ fontSize: 10, color: "#c8963b" }}>+{s.ganhoScore} pts</div>
                    <div style={{ fontSize: 9, color: "#3d4a5e", letterSpacing: "0.08em" }}>{s.indiceTroca}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <span style={{ fontSize: 11, color: "#3f7254" }}>→ {s.sugerido.nome}</span>
                    <span style={{ fontSize: 10, color: "#3d4a5e", display: "block", marginTop: 2 }}>Score {Number(s.sugerido.score ?? 0).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Oportunidades fora da carteira */}
      {data.oportunidadesForaCerteira.length > 0 && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 12 }}>
            Oportunidades Não Exploradas (score {data.carteira.scoreMedio + 15}+)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {data.oportunidadesForaCerteira.map(f => (
              <div key={f.id} style={{ background: "#09101a", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#ddd8d0" }}>{f.nome}</div>
                  <div style={{ fontSize: 10, color: "#3d4a5e", marginTop: 2 }}>{f.gestora} · {f.classe}</div>
                </div>
                <ScoreBadge value={f.scoreAtratividade} />
              </div>
            ))}
          </div>
        </div>
      )}

      {data.sugestoesTroca.length === 0 && data.oportunidadesForaCerteira.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#3d4a5e", fontSize: 13 }}>
          Sua carteira está bem posicionada — nenhuma melhoria clara identificada.
        </div>
      )}
    </div>
  );
}

// ─── IA CANA ─────────────────────────────────────────────────────────────────

const CANA_ACAO_COLOR: Record<string, string> = {
  ADD_FUNDO: "#3f7254", EDIT_FUNDO: "#8a6b30", DELETE_FUNDO: "#7a3535",
  ADD_PERTENCE: "#3f7254", EDIT_PERTENCE: "#8a6b30", DELETE_PERTENCE: "#7a3535",
  QUERY: "#4a6a9b", CHAT: "#3d4a5e",
};

function CanaView({ onRefresh }: { onRefresh: () => void }) {
  const [history, setHistory] = useState<ChatMsg[]>([{
    role: "assistant",
    content: "Olá! Sou a Cana, sua assistente patrimonial.\n\nPosso adicionar, editar ou remover fundos por linguagem natural.\n\nExemplo: \"Adicione Fundo 24 Horas FIRF RL — mínimo R$100, retorno 14.27% em 12M, D+0\"",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ acao: string; executado: boolean; itens?: any[] } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    const newHistory: ChatMsg[] = [...history, { role: "user", content: msg }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);
    setLastResult(null);
    try {
      const r = await fetch(`${API}/api/rapadura/cana`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: msg, history: history.slice(-6) }),
        signal: AbortSignal.timeout(30000),
      });
      const d = await r.json() as { acao?: string; resposta?: string; executado?: boolean; itens?: any[]; error?: string };
      setHistory(h => [...h, { role: "assistant", content: d.resposta ?? d.error ?? "Erro ao processar." }]);
      if (d.acao && d.acao !== "CHAT" && d.acao !== "QUERY") {
        setLastResult({ acao: d.acao, executado: !!d.executado, itens: d.itens });
        if (d.executado) onRefresh();
      }
    } catch {
      setHistory(h => [...h, { role: "assistant", content: "Erro de conexão." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #0f1520" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 5 }}>
          Inteligência Patrimonial
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 300, color: "#ddd8d0", letterSpacing: "-0.01em" }}>IA Cana</div>
          <span style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#3d4a5e" }}>
            linguagem natural → operações
          </span>
        </div>
      </div>

      <div style={{ background: "#07090e", border: "1px solid #141b26", marginBottom: 16 }}>
        {/* Messages */}
        <div style={{ height: 380, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {history.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "88%", padding: "10px 14px",
                background: m.role === "user" ? "rgba(200,150,59,0.07)" : "#0c1018",
                border: `1px solid ${m.role === "user" ? "rgba(200,150,59,0.18)" : "#141b26"}`,
                fontSize: 12, lineHeight: 1.65, color: m.role === "user" ? "#c5c0b8" : "#9a9590",
                whiteSpace: "pre-wrap",
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "8px 12px", background: "#0c1018", border: "1px solid #141b26", fontSize: 11, color: "#3d4a5e" }}>
                processando…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Action badge */}
        {lastResult && (
          <div style={{
            padding: "8px 14px", borderTop: "1px solid #0f1520",
            display: "flex", alignItems: "center", gap: 10,
            background: lastResult.executado ? "rgba(63,114,84,0.05)" : "rgba(122,53,53,0.05)",
          }}>
            <span style={{
              fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
              color: CANA_ACAO_COLOR[lastResult.acao] ?? "#5a5650",
              border: `1px solid ${(CANA_ACAO_COLOR[lastResult.acao] ?? "#5a5650")}40`,
              padding: "2px 8px",
            }}>
              {lastResult.acao}
            </span>
            <span style={{ fontSize: 10, color: lastResult.executado ? "#3f7254" : "#7a3535" }}>
              {lastResult.executado
                ? `✓ executado (${lastResult.itens?.length ?? 1} item${(lastResult.itens?.length ?? 1) > 1 ? "s" : ""})`
                : "⚠ não executado"}
            </span>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "10px 12px", borderTop: "1px solid #0f1520", display: "flex", gap: 8 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Descreva a operação em linguagem natural… (Enter envia, Shift+Enter nova linha)"
            disabled={loading}
            rows={3}
            style={{
              flex: 1, background: "#040507", border: "1px solid #141b26",
              color: "#c5c0b8", fontSize: 12, padding: "8px 10px",
              outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.5,
            }}
            onFocus={e => { e.target.style.borderColor = "#5a4020"; }}
            onBlur={e => { e.target.style.borderColor = "#141b26"; }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              padding: "8px 16px", alignSelf: "flex-end",
              background: loading || !input.trim() ? "#1a1f2a" : "#c8963b",
              color: loading || !input.trim() ? "#3d4a5e" : "#040507",
              fontSize: 12, fontWeight: 700, border: "none",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              fontFamily: "inherit", letterSpacing: "0.05em",
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Tips */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
        {([
          ["Adicionar", "\"Fundo XYZ, retorno 14.5% em 12M, mínimo R$500, D+1, renda fixa\""],
          ["Editar", "\"Atualize o Kinea: retorno agora é 14.1%, D+2\""],
          ["Remover", "\"Remove o Indie FIA da lista de oportunidades\""],
        ] as const).map(([title, ex]) => (
          <div key={title} style={{ background: "#09101a", padding: "12px 14px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 6 }}>
              {title}
            </div>
            <div style={{ fontSize: 11, color: "#5a5650", fontStyle: "italic", lineHeight: 1.5 }}>{ex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── IMPORTAR XP ──────────────────────────────────────────────────────────────

function ImportarXPModal({ fundos, onClose }: { fundos: Fundo[]; onClose: () => void }) {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [csvTexto, setCsvTexto] = useState("");
  const [fundoId, setFundoId] = useState("");
  const [preview, setPreview] = useState<XpPreviewItem[]>([]);
  const [motivos, setMotivos] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCsvTexto(ev.target?.result as string ?? "");
    reader.readAsText(file, "UTF-8");
  }

  async function processar() {
    if (!csvTexto.trim() || !fundoId) { setError("Cole o CSV e selecione o fundo."); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/api/rapadura/importar-xp`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ csvTexto }),
      });
      const d = await r.json() as { preview?: XpPreviewItem[]; error?: string };
      if (!d.preview) { setError(d.error ?? "Erro ao processar CSV."); return; }
      setPreview(d.preview);
      setStep("preview");
    } catch { setError("Erro de conexão."); }
    finally { setLoading(false); }
  }

  async function confirmar() {
    const itensFinal = preview.map((it, i) => ({ ...it, motivoI438: motivos[i] ?? "" }));
    const semMotivo = itensFinal.filter(it => Math.abs(it.valor) >= 1000 && !it.motivoI438.trim());
    if (semMotivo.length > 0) { setError(`${semMotivo.length} item(ns) acima de R$1.000 precisam de justificativa (I438).`); return; }
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/api/rapadura/importar-xp/confirmar`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ itens: itensFinal, fundoId: parseInt(fundoId) }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (d.ok) setStep("done");
      else setError(d.error ?? "Erro ao confirmar.");
    } catch { setError("Erro de conexão."); }
    finally { setLoading(false); }
  }

  const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  const TIPO_COLOR: Record<string, string> = {
    COMPRA: "#3f7254", RESGATE_PARCIAL: "#c8963b", RESGATE_TOTAL: "#9a4040",
    DIVIDENDO: "#4a6a9b", AJUSTE: "#3d4a5e",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#07090e", border: "1px solid #1a2030", padding: 28, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6a7a40" }}>Importar Extrato XP</div>
            <div style={{ fontSize: 12, color: "#5a5650", marginTop: 3 }}>
              {step === "upload" ? "Upload ou cole o CSV" : step === "preview" ? `${preview.length} linhas — revise antes de confirmar` : "Importado com sucesso"}
            </div>
          </div>
          <button onClick={onClose} style={{ fontSize: 18, color: "#3d4a5e", background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>

        {step === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5650", marginBottom: 5 }}>Fundo (obrigatório)</div>
              <select value={fundoId} onChange={e => setFundoId(e.target.value)}
                style={{ width: "100%", background: "#040507", border: "1px solid #141b26", color: "#c5c0b8", fontSize: 12, padding: "8px 10px", outline: "none", fontFamily: "inherit" }}>
                <option value="">Selecione o fundo…</option>
                {fundos.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5650", marginBottom: 4 }}>Upload CSV</div>
              <input type="file" accept=".csv,.txt" onChange={handleFile} style={{ color: "#5a5650", fontSize: 11 }} />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5650", marginBottom: 4 }}>ou cole o conteúdo</div>
              <textarea
                value={csvTexto} onChange={e => setCsvTexto(e.target.value)}
                placeholder={"Data;Histórico;Valor\n01/08/2026;Aplicação Fundo XP;-5000.00"}
                rows={6}
                style={{ width: "100%", boxSizing: "border-box", background: "#040507", border: "1px solid #141b26", color: "#c5c0b8", fontSize: 11, padding: "8px 10px", outline: "none", fontFamily: "monospace", resize: "vertical" }}
              />
            </div>
            {error && <div style={{ fontSize: 11, color: "#9a4040" }}>{error}</div>}
            <button onClick={processar} disabled={loading || !csvTexto.trim() || !fundoId}
              style={{ padding: "10px", background: !csvTexto.trim() || !fundoId ? "#1a2030" : "#6a7a40", color: "#ddd8d0", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", opacity: !csvTexto.trim() || !fundoId ? 0.5 : 1 }}>
              {loading ? "Processando…" : "Processar CSV →"}
            </button>
          </div>
        )}

        {step === "preview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 380, overflowY: "auto" }}>
              {preview.map((it, i) => (
                <div key={i} style={{ background: "#09101a", padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: TIPO_COLOR[it.tipo] ?? "#5a5650", marginRight: 8 }}>{it.tipo}</span>
                      <span style={{ fontSize: 11, color: "#c5c0b8" }}>{it.descricao.slice(0, 36)}</span>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: it.valor >= 0 ? "#3f7254" : "#9a4040" }}>
                      {it.valor >= 0 ? "+" : ""}{fmtBRL(it.valor)}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "#3d4a5e", marginTop: 3 }}>{it.data}</div>
                  {Math.abs(it.valor) >= 1000 && (
                    <input type="text" placeholder="Por que estou fazendo isso? (I438 — obrigatório)"
                      value={motivos[i] ?? ""} onChange={e => setMotivos(m => ({ ...m, [i]: e.target.value }))}
                      style={{ marginTop: 6, width: "100%", boxSizing: "border-box", background: "#040507", border: "1px solid #5a4020", color: "#c5c0b8", fontSize: 11, padding: "5px 8px", outline: "none", fontFamily: "inherit" }} />
                  )}
                </div>
              ))}
            </div>
            {error && <div style={{ fontSize: 11, color: "#9a4040" }}>{error}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep("upload")} style={{ padding: "9px 16px", background: "transparent", border: "1px solid #1a2030", color: "#5a5650", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>← Voltar</button>
              <button onClick={confirmar} disabled={loading}
                style={{ flex: 1, padding: "9px", background: loading ? "#1a2030" : "#6a7a40", color: "#ddd8d0", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {loading ? "Gravando…" : `Confirmar ${preview.length} transações →`}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 32, color: "#3f7254", marginBottom: 14 }}>✓</div>
            <div style={{ fontSize: 14, color: "#3f7254" }}>{preview.length} transações importadas.</div>
            <button onClick={onClose} style={{ marginTop: 20, padding: "9px 24px", background: "#6a7a40", color: "#ddd8d0", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TRANSAÇÕES ───────────────────────────────────────────────────────────────

function TransacoesView({ fundos }: { fundos: Fundo[] }) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fundoId: "", tipo: "COMPRA", valor: "",
    qtdCotas: "", dataTransacao: new Date().toISOString().slice(0, 10), motivoI438: "", notas: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const TIPOS = ["COMPRA", "RESGATE_PARCIAL", "RESGATE_TOTAL", "DIVIDENDO", "AJUSTE"];
  const TIPO_COLOR: Record<string, string> = {
    COMPRA: "#3f7254", RESGATE_PARCIAL: "#c8963b", RESGATE_TOTAL: "#9a4040",
    DIVIDENDO: "#4a6a9b", AJUSTE: "#3d4a5e",
  };
  const fmtBRL = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  useEffect(() => {
    fetch(`${API}/api/rapadura/transacoes`, { credentials: "include" })
      .then(r => r.json() as Promise<{ transacoes: Transacao[] }>)
      .then(d => setTransacoes(d.transacoes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ff = (k: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  async function salvar() {
    if (!form.fundoId || !form.tipo || !form.valor || !form.dataTransacao) {
      setError("Fundo, tipo, valor e data são obrigatórios."); return;
    }
    const valorNum = parseFloat(form.valor);
    if (Math.abs(valorNum) >= 1000 && !form.motivoI438.trim()) {
      setError("Operação acima de R$1.000 exige justificativa (I438)."); return;
    }
    setSaving(true); setError("");
    try {
      const r = await fetch(`${API}/api/rapadura/transacoes`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({
          fundoId: parseInt(form.fundoId), tipo: form.tipo, valor: valorNum,
          qtdCotas: form.qtdCotas ? parseFloat(form.qtdCotas) : undefined,
          dataTransacao: form.dataTransacao,
          motivoI438: form.motivoI438 || undefined,
          notas: form.notas || undefined,
        }),
      });
      const d = await r.json() as { transacao?: Transacao; error?: string };
      if (d.error) { setError(d.error); return; }
      if (d.transacao) setTransacoes(ts => [d.transacao!, ...ts]);
      setForm({ fundoId: "", tipo: "COMPRA", valor: "", qtdCotas: "", dataTransacao: new Date().toISOString().slice(0, 10), motivoI438: "", notas: "" });
      setShowForm(false);
    } catch { setError("Erro de conexão."); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #0f1520" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 5 }}>Histórico</div>
          <div style={{ fontSize: 22, fontWeight: 300, color: "#ddd8d0" }}>Transações</div>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c8963b", border: "1px solid #5a4020", background: "rgba(200,150,59,0.06)", padding: "7px 12px", cursor: "pointer", fontFamily: "inherit" }}>
          + Nova transação
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#07090e", border: "1px solid #1a2030", padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8963b", marginBottom: 14 }}>Registrar Movimentação</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5650", marginBottom: 4 }}>Fundo</div>
              <select value={form.fundoId} onChange={e => ff("fundoId")(e.target.value)}
                style={{ width: "100%", background: "#040507", border: "1px solid #141b26", color: "#c5c0b8", fontSize: 12, padding: "8px 10px", outline: "none", fontFamily: "inherit" }}>
                <option value="">Selecione…</option>
                {fundos.map(fn => <option key={fn.id} value={fn.id}>{fn.nome}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5650", marginBottom: 4 }}>Tipo</div>
              <select value={form.tipo} onChange={e => ff("tipo")(e.target.value)}
                style={{ width: "100%", background: "#040507", border: "1px solid #141b26", color: "#c5c0b8", fontSize: 12, padding: "8px 10px", outline: "none", fontFamily: "inherit" }}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Field label="Data" type="date" value={form.dataTransacao} onChange={ff("dataTransacao")} />
            <Field label="Valor (R$)" type="number" value={form.valor} onChange={ff("valor")} placeholder="ex: -5000 ou 1200" />
            <Field label="Qtd cotas (opcional)" type="number" value={form.qtdCotas} onChange={ff("qtdCotas")} />
            <Field label="Notas (opcional)" value={form.notas} onChange={ff("notas")} />
            {Math.abs(parseFloat(form.valor || "0")) >= 1000 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Por que estou fazendo isso? (I438 — obrigatório)" value={form.motivoI438} onChange={ff("motivoI438")} placeholder="Justificativa da operação" />
              </div>
            )}
          </div>
          {error && <div style={{ fontSize: 11, color: "#9a4040", marginTop: 10 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => { setShowForm(false); setError(""); }}
              style={{ padding: "8px 14px", background: "transparent", border: "1px solid #1a2030", color: "#5a5650", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button onClick={salvar} disabled={saving}
              style={{ padding: "8px 18px", background: saving ? "#1a2030" : "#c8963b", color: saving ? "#3d4a5e" : "#040507", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {saving ? "Salvando…" : "Registrar"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#3d4a5e" }}>Carregando…</div>
      ) : transacoes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#3d4a5e", fontSize: 12 }}>Nenhuma transação registrada.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {transacoes.map(t => {
            const valor = Number(t.valor);
            return (
              <div key={t.id} style={{ background: "#09101a", padding: "12px 16px", borderLeft: `2px solid ${(TIPO_COLOR[t.tipo] ?? "#3d4a5e")}50` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: TIPO_COLOR[t.tipo] ?? "#5a5650", border: `1px solid ${(TIPO_COLOR[t.tipo] ?? "#5a5650")}40`, padding: "2px 6px" }}>
                        {t.tipo}
                      </span>
                      <span style={{ fontSize: 12, color: "#ddd8d0", fontWeight: 600 }}>{t.fundoNome}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#3d4a5e", marginTop: 3 }}>
                      {t.dataTransacao} · {t.origem}
                      {t.notas && <> · <em>{t.notas.slice(0, 40)}</em></>}
                    </div>
                    {t.motivoI438 && (
                      <div style={{ fontSize: 10, color: "#8a6b30", marginTop: 3, fontStyle: "italic" }}>
                        ↳ {t.motivoI438}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: valor >= 0 ? "#3f7254" : "#9a4040" }}>
                      {valor >= 0 ? "+" : ""}{fmtBRL(valor)}
                    </div>
                    <div style={{ fontSize: 9, color: "#3d4a5e", marginTop: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {t.status}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

// ─── MOBILE HOOK ─────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mob, setMob] = useState(() => typeof window !== "undefined" && window.innerWidth < 600);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 599px)");
    const h = (e: MediaQueryListEvent) => setMob(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mob;
}

// ─── ALTERAR SENHA ────────────────────────────────────────────────────────────

function ChangePwModal({ onClose }: { onClose: () => void }) {
  const [cur, setCur] = useState("");
  const [novo, setNovo] = useState("");
  const [conf, setConf] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit() {
    if (novo !== conf) { setMsg({ ok: false, text: "As senhas não coincidem." }); return; }
    if (novo.length < 8) { setMsg({ ok: false, text: "Nova senha: mínimo 8 caracteres." }); return; }
    setLoading(true); setMsg(null);
    try {
      const r = await fetch(`${API}/api/rapadura/auth/change-password`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ currentPassword: cur, newPassword: novo }),
      });
      const d = await r.json() as { ok?: boolean; error?: string };
      if (d.ok) { setMsg({ ok: true, text: "Senha alterada com sucesso." }); setCur(""); setNovo(""); setConf(""); }
      else setMsg({ ok: false, text: d.error ?? "Erro ao alterar senha." });
    } catch { setMsg({ ok: false, text: "Erro de conexão." }); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#07090e", border: "1px solid #1a2030", padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8963b" }}>
            Alterar senha
          </div>
          <button onClick={onClose} style={{ fontSize: 16, color: "#3d4a5e", background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Senha atual" type="password" value={cur} onChange={setCur} />
          <Field label="Nova senha (mín. 8 caracteres)" type="password" value={novo} onChange={setNovo} />
          <Field label="Confirmar nova senha" type="password" value={conf} onChange={setConf} />
        </div>
        {msg && (
          <div style={{ marginTop: 10, fontSize: 11, color: msg.ok ? "#3f7254" : "#9a4040", letterSpacing: "0.02em" }}>
            {msg.text}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: "8px 12px", background: "transparent", border: "1px solid #1a2030", color: "#5a5650", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button
            onClick={submit}
            disabled={loading || !cur || !novo || !conf}
            style={{ padding: "8px 16px", background: loading ? "#1a2030" : "#c8963b", color: loading ? "#3d4a5e" : "#040507", fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", opacity: !cur || !novo || !conf ? 0.5 : 1 }}
          >
            {loading ? "Alterando…" : "Alterar senha"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RapaduraPage() {
  const [user, setUser] = useState<RapaduraUser | null>(null);
  const [checking, setChecking] = useState(true);

  // Troca favicon, título e meta PWA enquanto no Rapadura
  useEffect(() => {
    const prev = document.title;
    document.title = "Rapadura · Inteligência Patrimonial";

    // favicon
    let favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const prevFavicon = favicon?.href;
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/png";
      document.head.appendChild(favicon);
    }
    favicon.href = `${BASE}rapadura-favicon.png`;

    // manifest PWA
    let manifest = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    const prevManifest = manifest?.href;
    if (!manifest) {
      manifest = document.createElement("link");
      manifest.rel = "manifest";
      document.head.appendChild(manifest);
    }
    manifest.href = `${BASE}rapadura-manifest.json`;

    // apple-touch-icon (iOS "Adicionar à tela inicial")
    let apple = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    const prevApple = apple?.href;
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      document.head.appendChild(apple);
    }
    apple.href = `${BASE}rapadura-icon-512.png`;

    // meta tags iOS PWA
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name='${name}']`);
      const prev = el?.content;
      if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
      el.content = content;
      return prev;
    };
    const prevTitle = setMeta("apple-mobile-web-app-title", "Rapadura");
    const prevCapable = setMeta("apple-mobile-web-app-capable", "yes");
    const prevStatus = setMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
    const prevTheme = setMeta("theme-color", "#c8963b");

    return () => {
      document.title = prev;
      if (favicon && prevFavicon) favicon.href = prevFavicon;
      if (manifest && prevManifest) manifest.href = prevManifest;
      if (apple && prevApple) apple.href = prevApple;
      setMeta("apple-mobile-web-app-title", prevTitle ?? "PAP");
      setMeta("apple-mobile-web-app-capable", prevCapable ?? "");
      setMeta("apple-mobile-web-app-status-bar-style", prevStatus ?? "");
      setMeta("theme-color", prevTheme ?? "#c8a050");
    };
  }, []);
  const [view, setView] = useState<View>("oportunidades");
  const [fundos, setFundos] = useState<Fundo[]>([]);
  const [pertences, setPertences] = useState<Pertence[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard>({ totalInvestido: 0, totalAtual: 0, resultado: 0, rentabilidade: 0 });
  const [dataLoading, setDataLoading] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);

  const isAdmin = user?.role === "yuri" || user?.role === "mayumi";
  const isMobile = useIsMobile();

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
      <div style={{ minHeight: "100vh", background: "#040507", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2a3545" }}>
          carregando
        </div>
      </div>
    );
  }

  if (!user) return <LoginView onLogin={u => { setUser(u); }} />;

  const TABS: { id: View; label: string; adminOnly?: boolean }[] = [
    { id: "oportunidades", label: "Oportunidades" },
    { id: "pertences", label: "Pertences" },
    { id: "transacoes", label: "Transações" },
    { id: "analisar", label: "Analisar" },
    { id: "cana", label: "Cana ✦", adminOnly: true },
    { id: "gerenciar", label: "Gerenciar", adminOnly: true },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#040507",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      color: "#ddd8d0",
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid #0f1520",
        background: "rgba(4,5,7,0.95)",
        backdropFilter: "blur(8px)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        {/* ── Linha 1: Logo + User ── */}
        <div style={{
          maxWidth: 820, margin: "0 auto", padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: isMobile ? 40 : 44,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <img src={LOGO} alt="R" style={{ width: 22, height: 22, objectFit: "contain" }} />
            <span style={{
              fontSize: isMobile ? 12 : 13, fontWeight: 300, letterSpacing: "0.2em",
              color: "#c8963b", fontFamily: "'Georgia', 'Times New Roman', serif",
            }}>
              Rapadura
            </span>
          </div>

          {/* Desktop nav — inline na linha 1 */}
          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", height: "100%", overflow: "hidden" }}>
              {TABS.filter(t => !t.adminOnly || isAdmin).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  style={{
                    height: "100%", padding: "0 14px", whiteSpace: "nowrap",
                    background: "transparent", border: "none",
                    fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: view === tab.id ? "#c8963b" : "#3d4a5e",
                    cursor: "pointer",
                    borderBottom: view === tab.id ? "1px solid #c8963b" : "1px solid transparent",
                    fontFamily: "inherit", transition: "color .15s, border-color .15s",
                  }}
                  onMouseEnter={e => { if (view !== tab.id) (e.currentTarget as HTMLElement).style.color = "#7a746c"; }}
                  onMouseLeave={e => { if (view !== tab.id) (e.currentTarget as HTMLElement).style.color = "#3d4a5e"; }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          )}

          {/* User actions */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10, flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: "#3d4a5e", letterSpacing: "0.08em" }}>{user.nome}</span>
            {!isMobile && (
              <>
                <a
                  href="/rapadura/manuel"
                  title="Guia do sistema"
                  style={{
                    fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "#2a3545", textDecoration: "none", cursor: "pointer",
                    fontFamily: "inherit", transition: "color .15s",
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = "#c8963b"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = "#2a3545"; }}
                >
                  guia
                </a>
                <button
                  onClick={() => setShowChangePw(true)}
                  title="Alterar senha"
                  style={{
                    fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "#2a3545", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", transition: "color .15s",
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = "#c8963b"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = "#2a3545"; }}
                >
                  senha
                </button>
              </>
            )}
            <button
              onClick={logout}
              style={{
                fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#2a3545", background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", transition: "color .15s",
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = "#7a3535"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = "#2a3545"; }}
            >
              sair
            </button>
          </div>
        </div>

        {/* ── Linha 2 (mobile only): Nav + guia + senha ── */}
        {isMobile && (
          <nav style={{
            borderTop: "1px solid #0f1520",
            display: "flex", overflowX: "auto",
            scrollbarWidth: "none",
          }}>
            {TABS.filter(t => !t.adminOnly || isAdmin).map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  flex: "none", padding: "0 13px", height: 36, whiteSpace: "nowrap",
                  background: "transparent", border: "none",
                  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: view === tab.id ? "#c8963b" : "#3d4a5e",
                  cursor: "pointer",
                  borderBottom: view === tab.id ? "2px solid #c8963b" : "2px solid transparent",
                  fontFamily: "inherit",
                }}
              >
                {tab.label}
              </button>
            ))}
            {/* Separador */}
            <div style={{ flex: "none", width: 1, background: "#141b26", margin: "8px 4px" }} />
            <a
              href="/rapadura/manuel"
              style={{
                flex: "none", padding: "0 12px", height: 36, whiteSpace: "nowrap",
                display: "flex", alignItems: "center",
                fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#2a3545", textDecoration: "none", fontFamily: "inherit",
              }}
            >
              guia
            </a>
            <button
              onClick={() => setShowChangePw(true)}
              style={{
                flex: "none", padding: "0 12px", height: 36, whiteSpace: "nowrap",
                background: "transparent", border: "none",
                fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#2a3545", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              senha
            </button>
          </nav>
        )}
      </header>

      {/* Modal alterar senha */}
      {showChangePw && <ChangePwModal onClose={() => setShowChangePw(false)} />}

      {/* Loader */}
      {dataLoading && (
        <div style={{ textAlign: "center", padding: "10px 0", fontSize: 9, letterSpacing: "0.2em", color: "#2a3545", textTransform: "uppercase" }}>
          atualizando…
        </div>
      )}

      {/* Content */}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
        {view === "oportunidades" && (
          <OportunidadesView fundos={fundos} isAdmin={isAdmin} onGerenciar={() => setView("gerenciar")} />
        )}
        {view === "pertences" && (
          <PertencesView pertences={pertences} dashboard={dashboard} fundos={fundos} onRefresh={loadData} />
        )}
        {view === "transacoes" && (
          <TransacoesView fundos={fundos} />
        )}
        {view === "analisar" && (
          <AnalisarView />
        )}
        {view === "cana" && isAdmin && (
          <CanaView onRefresh={loadData} />
        )}
        {view === "cana" && !isAdmin && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#3d4a5e" }}>Acesso restrito.</div>
        )}
        {view === "gerenciar" && isAdmin && (
          <GerenciarView fundos={fundos} onRefresh={loadData} onBack={() => setView("oportunidades")} />
        )}
        {view === "gerenciar" && !isAdmin && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#3d4a5e" }}>Acesso restrito.</div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #0f1520",
        padding: "16px 20px",
        textAlign: "center",
        fontSize: 9,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#1c2030",
      }}>
        Rapadura · Motor de Inteligência Patrimonial · Sociedade Tucci · 2026
      </footer>
    </div>
  );
}
