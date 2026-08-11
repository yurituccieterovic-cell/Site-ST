import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const API = import.meta.env.VITE_API_URL ?? "";

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
};
type Pertence = {
  id: number; fundoId: number; fundoNome: string; fundoGestora: string;
  fundoClasse: string; fundoPrazoResgate: number; fundoScore: string | null;
  dataCompra: string; valorInvestido: string; qtdCotas: string | null;
  precoCotaCompra: string | null; valorAtual: string | null; notas: string | null;
};
type Dashboard = { totalInvestido: number; totalAtual: number; resultado: number; rentabilidade: number };
type ChatMsg = { role: "user" | "assistant"; content: string };
type View = "oportunidades" | "pertences" | "gerenciar";

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
      {/* Wordmark */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          fontSize: 42, fontWeight: 200, letterSpacing: "0.55em",
          color: "#c8963b", lineHeight: 1, paddingRight: "0.55em",
        }}>
          RAPADURA
        </div>
        <div style={{
          fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "#3d4a5e", marginTop: 10,
        }}>
          Motor de Inteligência Patrimonial
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
    qtdCotas: "", precoCotaCompra: "", valorAtual: "", notas: "",
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

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
    setForm({ fundoId: "", dataCompra: "", valorInvestido: "", qtdCotas: "", precoCotaCompra: "", valorAtual: "", notas: "" });
    setShowForm(false);
    setEditId(null);
  }

  function startEdit(p: Pertence) {
    setForm({
      fundoId: String(p.fundoId), dataCompra: p.dataCompra,
      valorInvestido: p.valorInvestido, qtdCotas: p.qtdCotas ?? "",
      precoCotaCompra: p.precoCotaCompra ?? "", valorAtual: p.valorAtual ?? "", notas: p.notas ?? "",
    });
    setEditId(p.id);
    setShowForm(false);
  }

  async function submit() {
    if (!form.fundoId || !form.dataCompra || !form.valorInvestido) return;
    setSaving(true);
    try {
      const url = editId ? `${API}/api/rapadura/pertences/${editId}` : `${API}/api/rapadura/pertences`;
      await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, fundoId: parseInt(form.fundoId), valorInvestido: parseFloat(form.valorInvestido) }),
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
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #0f1520",
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#3d4a5e", marginBottom: 5 }}>
            Carteira
          </div>
          <div style={{ fontSize: 22, fontWeight: 300, color: "#ddd8d0", letterSpacing: "-0.01em" }}>
            Pertences
          </div>
        </div>
        <button
          onClick={() => { reset(); setShowForm(true); }}
          style={{
            fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#c8963b", border: "1px solid #5a4020", background: "rgba(200,150,59,0.06)",
            padding: "7px 12px", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + Adicionar compra
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, marginBottom: 24 }}>
        <KpiCard label="Total investido" value={fmt(dashboard.totalInvestido)} />
        <KpiCard label="Valor atual" value={fmt(dashboard.totalAtual)} />
        <KpiCard
          label="Resultado"
          value={`${resultado >= 0 ? "+" : ""}${fmt(resultado)}`}
          color={resultado >= 0 ? "#3f7254" : "#7a3535"}
        />
        <KpiCard
          label="Rentabilidade"
          value={`${rentabilidade >= 0 ? "+" : ""}${rentabilidade.toFixed(2)}%`}
          color={rentabilidade >= 0 ? "#3f7254" : "#7a3535"}
        />
      </div>

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
            const res = va - vi;
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
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd8d0" }}>{p.fundoNome}</div>
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
    volatilidade12m: "", retorno12m: "", retorno36m: "", alfa36m: "", notas: "",
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
      retorno36m: fnd.retorno36m ?? "", alfa36m: fnd.alfa36m ?? "", notas: fnd.notas ?? "",
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
            <SelectField label="Classe" value={form.classe} onChange={v => setForm(f => ({ ...f, classe: v }))} options={["Multimercado", "Ações", "Renda Fixa", "Crédito Privado", "Internacional", "Cripto"]} />
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function RapaduraPage() {
  const [user, setUser] = useState<RapaduraUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState<View>("oportunidades");
  const [fundos, setFundos] = useState<Fundo[]>([]);
  const [pertences, setPertences] = useState<Pertence[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard>({ totalInvestido: 0, totalAtual: 0, resultado: 0, rentabilidade: 0 });
  const [dataLoading, setDataLoading] = useState(false);

  const isAdmin = user?.role === "yuri" || user?.role === "mayumi";

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
        <div style={{
          maxWidth: 820, margin: "0 auto", padding: "0 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 44,
        }}>
          {/* Logo */}
          <div style={{
            fontSize: 11, fontWeight: 300, letterSpacing: "0.45em",
            color: "#c8963b", textTransform: "uppercase",
          }}>
            RAPADURA
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", height: "100%" }}>
            {TABS.filter(t => !t.adminOnly || isAdmin).map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  height: "100%", padding: "0 14px",
                  background: "transparent", border: "none",
                  fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: view === tab.id ? "#c8963b" : "#3d4a5e",
                  cursor: "pointer",
                  borderBottom: view === tab.id ? "1px solid #c8963b" : "1px solid transparent",
                  fontFamily: "inherit",
                  transition: "color .15s, border-color .15s",
                }}
                onMouseEnter={e => { if (view !== tab.id) (e.currentTarget as HTMLElement).style.color = "#7a746c"; }}
                onMouseLeave={e => { if (view !== tab.id) (e.currentTarget as HTMLElement).style.color = "#3d4a5e"; }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 9, letterSpacing: "0.12em", color: "#2a3545", display: "none" }}
              className="sm:block">
              {user.nome}
            </span>
            <span style={{ fontSize: 10, color: "#3d4a5e", letterSpacing: "0.08em" }}>{user.nome}</span>
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
      </header>

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
