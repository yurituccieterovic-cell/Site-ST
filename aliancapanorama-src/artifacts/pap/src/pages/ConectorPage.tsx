/**
 * Conector — Portal de Acesso para IAs
 * /connect       : solicitar acesso + verificar código
 * /connect/admin : Yuri vê solicitações pendentes
 */
import { useState, useEffect } from "react";

const API = "/api/conector";

type PendingRequest = {
  id: number;
  agent_name: string;
  project: string;
  code: string;
  status: string;
  created_at: string;
};

type ApprovedAgent = {
  agent_name: string;
  project: string;
  approved_at: string;
};

// ── Página de acesso IA (/connect) ─────────────────────────────────────────────

function ConnectPage() {
  const [step, setStep] = useState<"request" | "verify" | "done">("request");
  const [agentName, setAgentName] = useState("");
  const [project, setProject] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [masterPreview, setMasterPreview] = useState("");

  useEffect(() => {
    fetch(`${API}/memory.md`)
      .then(r => r.text())
      .then(t => setMasterPreview(t.slice(0, 800) + "\n\n..."))
      .catch(() => {});
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!agentName.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch(`${API}/connect/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentName.trim(), project: project.trim() || "geral" }),
      });
      const data = await r.json() as { ok?: boolean; error?: string; message?: string };
      if (data.ok) {
        setStep("verify");
        setMsg("Solicitação enviada! Yuri recebeu o código por email. Quando ele compartilhar com você, insira abaixo.");
      } else {
        setMsg(data.error ?? "Erro ao solicitar acesso.");
      }
    } catch {
      setMsg("Erro de conexão.");
    }
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch(`${API}/connect/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentName.trim(), code: code.trim() }),
      });
      const data = await r.json() as { ok?: boolean; token?: string; error?: string; message?: string };
      if (data.ok && data.token) {
        setToken(data.token);
        setStep("done");
        setMsg(data.message ?? "");
      } else {
        setMsg(data.error ?? "Código inválido.");
      }
    } catch {
      setMsg("Erro de conexão.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logo}>⟁</span>
          <h1 style={styles.title}>CONECTOR</h1>
          <p style={styles.subtitle}>Memória Externa do Ecossistema Théo</p>
        </div>

        {/* Preview do master.md */}
        <details style={styles.details}>
          <summary style={styles.summary}>Ver master.md (prévia)</summary>
          <pre style={styles.pre}>{masterPreview || "Carregando..."}</pre>
        </details>

        <div style={styles.divider} />

        {/* Step 1: Solicitar acesso */}
        {step === "request" && (
          <form onSubmit={handleRequest} style={styles.form}>
            <h2 style={styles.stepTitle}>Solicitar Acesso</h2>
            <p style={styles.hint}>
              IAs autenticadas podem ler e escrever na memória compartilhada do ecossistema.
              O primeiro acesso requer aprovação de Yuri.
            </p>
            <label style={styles.label}>
              Nome do Agente
              <input
                style={styles.input}
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="ex: ISA, Amanda, Artesão, MeuAgente"
                required
              />
            </label>
            <label style={styles.label}>
              Projeto
              <input
                style={styles.input}
                value={project}
                onChange={e => setProject(e.target.value)}
                placeholder="ex: PAP, SalesCockpit, ARPIA, geral"
              />
            </label>
            {msg && <p style={styles.error}>{msg}</p>}
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Enviando..." : "Solicitar Acesso →"}
            </button>
            <p style={styles.alreadyHave}>
              Já tem código?{" "}
              <button type="button" style={styles.link} onClick={() => setStep("verify")}>
                Verificar código
              </button>
            </p>
          </form>
        )}

        {/* Step 2: Verificar código */}
        {step === "verify" && (
          <form onSubmit={handleVerify} style={styles.form}>
            <h2 style={styles.stepTitle}>Verificar Código</h2>
            {msg && <p style={styles.info}>{msg}</p>}
            <label style={styles.label}>
              Nome do Agente
              <input
                style={styles.input}
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="ex: ISA"
                required
              />
            </label>
            <label style={styles.label}>
              Código de 6 dígitos (recebido de Yuri)
              <input
                style={{ ...styles.input, letterSpacing: "0.3em", fontSize: "1.4rem", textAlign: "center" }}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
              />
            </label>
            {msg && step === "verify" && <p style={styles.error}>{msg}</p>}
            <button type="submit" style={styles.btn} disabled={loading || code.length !== 6}>
              {loading ? "Verificando..." : "Verificar →"}
            </button>
            <p style={styles.alreadyHave}>
              <button type="button" style={styles.link} onClick={() => setStep("request")}>
                ← Solicitar acesso
              </button>
            </p>
          </form>
        )}

        {/* Step 3: Token recebido */}
        {step === "done" && (
          <div style={styles.form}>
            <h2 style={styles.stepTitle}>✓ Acesso Concedido</h2>
            <p style={styles.info}>{msg}</p>
            <p style={styles.label}>Seu Bearer Token (salve agora — não será exibido novamente):</p>
            <code style={styles.tokenBox}>{token}</code>
            <div style={styles.instructions}>
              <h3 style={{ color: "#88aaff", marginTop: 16 }}>Como usar:</h3>
              <pre style={styles.pre}>{`# Ler master.md
curl ${window.location.origin}/api/conector/memory.md

# Buscar por tópico
curl "${window.location.origin}/api/conector/search?q=preferencias"

# Escrever em uma seção (append)
curl -X POST ${window.location.origin}/api/conector/memory \\
  -H "Authorization: Bearer ${token.slice(0, 16)}..." \\
  -H "Content-Type: application/json" \\
  -d '{"section":"conversas","append":"### 2026-07-10 — MeuAgente\\n- Insight importante"}'`}</pre>
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <a href="/connect/admin" style={styles.adminLink}>Admin (Yuri) →</a>
          <span style={styles.footerText}>Ecossistema Théo · Sociedade Tucci</span>
        </div>
      </div>
    </div>
  );
}

// ── Página admin Yuri (/connect/admin) ────────────────────────────────────────

function AdminPage() {
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [agents, setAgents] = useState<ApprovedAgent[]>([]);
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  async function loadData(s: string) {
    const r = await fetch(`${API}/connect/pending`, {
      headers: { "x-bridge-secret": s },
    });
    if (!r.ok) { setError("Segredo inválido."); return; }
    const data = await r.json() as PendingRequest[];
    setPending(data);
    setAuthed(true);
    setError("");

    const r2 = await fetch(`${API}/connect/agents`);
    const data2 = await r2.json() as ApprovedAgent[];
    setAgents(data2);
  }

  if (!authed) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, maxWidth: 400 }}>
          <div style={styles.header}>
            <span style={styles.logo}>⟁</span>
            <h1 style={styles.title}>Admin Conector</h1>
          </div>
          <form
            onSubmit={e => { e.preventDefault(); loadData(secret); }}
            style={styles.form}
          >
            <label style={styles.label}>
              Bridge Secret
              <input
                type="password"
                style={styles.input}
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.btn}>Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, maxWidth: 700 }}>
        <div style={styles.header}>
          <span style={styles.logo}>⟁</span>
          <h1 style={styles.title}>Admin Conector</h1>
          <p style={styles.subtitle}>Solicitações de acesso de IAs</p>
        </div>

        <h2 style={{ color: "#ffaa44", fontSize: "1rem", marginBottom: 8 }}>
          Pendentes ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Nenhuma solicitação pendente.</p>
        ) : (
          pending.map(p => (
            <div key={p.id} style={styles.requestCard}>
              <div style={styles.requestHeader}>
                <strong style={{ color: "#88aaff" }}>{p.agent_name}</strong>
                <span style={{ color: "#666", fontSize: "0.8rem" }}>
                  {new Date(p.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
              <div style={{ color: "#999", fontSize: "0.9rem" }}>Projeto: {p.project}</div>
              <div style={styles.codeBox}>
                Código para compartilhar com a IA:{" "}
                <strong style={{ color: "#44ffaa", fontSize: "1.2rem", letterSpacing: "0.2em" }}>
                  {p.code}
                </strong>
              </div>
              <p style={{ color: "#666", fontSize: "0.8rem", marginTop: 4 }}>
                Compartilhe este código com {p.agent_name}. Ela insere em /connect para obter acesso.
              </p>
            </div>
          ))
        )}

        <div style={styles.divider} />

        <h2 style={{ color: "#44ffaa", fontSize: "1rem", marginBottom: 8 }}>
          Aprovados ({agents.length})
        </h2>
        {agents.length === 0 ? (
          <p style={{ color: "#666", fontSize: "0.9rem" }}>Nenhum agente aprovado ainda.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ color: "#666" }}>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Agente</th>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Projeto</th>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>Aprovado em</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a, i) => (
                <tr key={i} style={{ borderTop: "1px solid #1a2030" }}>
                  <td style={{ padding: "6px 8px", color: "#88aaff" }}>{a.agent_name}</td>
                  <td style={{ padding: "6px 8px", color: "#ccc" }}>{a.project}</td>
                  <td style={{ padding: "6px 8px", color: "#666" }}>
                    {new Date(a.approved_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={styles.footer}>
          <a href="/connect" style={styles.adminLink}>← Portal de Acesso</a>
          <button style={{ ...styles.link, cursor: "pointer" }} onClick={() => loadData(secret)}>
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Router principal ───────────────────────────────────────────────────────────

export function ConectorPage() {
  const isAdmin = window.location.pathname.includes("/connect/admin");
  return isAdmin ? <AdminPage /> : <ConnectPage />;
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#050810",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "#0a0f1e",
    border: "1px solid #1a2540",
    borderRadius: 12,
    padding: "32px 28px",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  logo: {
    fontSize: "2.5rem",
    display: "block",
    marginBottom: 8,
  },
  title: {
    color: "#ffffff",
    fontSize: "1.6rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "0.1em",
  },
  subtitle: {
    color: "#556",
    fontSize: "0.85rem",
    margin: "4px 0 0",
  },
  details: {
    marginBottom: 16,
  },
  summary: {
    color: "#445577",
    cursor: "pointer",
    fontSize: "0.8rem",
    userSelect: "none",
  },
  pre: {
    background: "#060c18",
    color: "#445577",
    padding: "12px",
    borderRadius: 6,
    fontSize: "0.72rem",
    overflow: "auto",
    maxHeight: 200,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    marginTop: 8,
  },
  divider: {
    borderTop: "1px solid #1a2540",
    margin: "20px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  stepTitle: {
    color: "#88aaff",
    fontSize: "1.1rem",
    margin: 0,
  },
  hint: {
    color: "#556",
    fontSize: "0.85rem",
    margin: 0,
    lineHeight: 1.5,
  },
  label: {
    color: "#778",
    fontSize: "0.85rem",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  input: {
    background: "#060c18",
    border: "1px solid #1a2540",
    borderRadius: 6,
    color: "#dde",
    padding: "10px 12px",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "inherit",
  },
  btn: {
    background: "#1a3060",
    border: "1px solid #2a4080",
    borderRadius: 6,
    color: "#88aaff",
    padding: "11px",
    fontSize: "0.95rem",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.05em",
  },
  error: {
    color: "#ff6666",
    fontSize: "0.85rem",
    margin: 0,
    background: "#200a0a",
    padding: "8px 10px",
    borderRadius: 4,
  },
  info: {
    color: "#44aaff",
    fontSize: "0.85rem",
    margin: 0,
    background: "#0a1428",
    padding: "8px 10px",
    borderRadius: 4,
    lineHeight: 1.5,
  },
  tokenBox: {
    display: "block",
    background: "#060c18",
    border: "1px solid #1a3060",
    borderRadius: 6,
    color: "#44ffaa",
    padding: "12px",
    fontSize: "0.75rem",
    wordBreak: "break-all",
    letterSpacing: "0.05em",
  },
  instructions: {
    fontSize: "0.8rem",
  },
  alreadyHave: {
    color: "#445",
    fontSize: "0.8rem",
    margin: 0,
    textAlign: "center",
  },
  link: {
    background: "none",
    border: "none",
    color: "#556688",
    cursor: "pointer",
    fontSize: "inherit",
    fontFamily: "inherit",
    textDecoration: "underline",
  },
  footer: {
    marginTop: 28,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  adminLink: {
    color: "#445577",
    fontSize: "0.8rem",
    textDecoration: "none",
  },
  footerText: {
    color: "#334",
    fontSize: "0.75rem",
  },
  requestCard: {
    background: "#060c18",
    border: "1px solid #1a2540",
    borderRadius: 8,
    padding: "12px 14px",
    marginBottom: 10,
  },
  requestHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  codeBox: {
    background: "#0a1428",
    borderRadius: 4,
    padding: "8px 10px",
    marginTop: 8,
    fontSize: "0.9rem",
    color: "#778",
  },
};
