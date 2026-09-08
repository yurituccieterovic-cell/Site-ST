import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// ─── Login Gate MYYM ──────────────────────────────────────────────────────────

function JasmimLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha.trim() || loading) return;
    setLoading(true);
    setErro("");
    try {
      const r = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });
      if (r.ok) {
        onSuccess();
      } else {
        const d = await r.json().catch(() => ({}));
        setErro(d.error ?? "Email ou senha incorretos.");
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
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, margin: "0 auto 20px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f59e0b, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, animation: "floatLogin 3s ease-in-out infinite",
          boxShadow: "0 0 30px rgba(167,139,250,0.3)",
        }}>
          🐿️
          <style>{`
            @keyframes floatLogin {
              0%,100% { transform: translateY(0) rotate(-5deg); }
              50% { transform: translateY(-10px) rotate(5deg); }
            }
          `}</style>
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
            type="email"
            placeholder="seu email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && entrar()}
            autoComplete="email"
            style={{
              background: "#1a1a2e", border: "1px solid #333", borderRadius: 10,
              color: "#e8e8e8", padding: "12px 16px", fontSize: 14, outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#a78bfa")}
            onBlur={e => (e.target.style.borderColor = "#333")}
          />
          <input
            type="password"
            placeholder="senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === "Enter" && entrar()}
            autoComplete="current-password"
            style={{
              background: "#1a1a2e", border: "1px solid #333", borderRadius: 10,
              color: "#e8e8e8", padding: "12px 16px", fontSize: 14, outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#a78bfa")}
            onBlur={e => (e.target.style.borderColor = "#333")}
          />
          {erro && (
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{erro}</p>
          )}
          <button
            onClick={entrar}
            disabled={loading || !email.trim() || !senha.trim()}
            style={{
              background: loading ? "#333" : "linear-gradient(135deg, #f59e0b, #a78bfa)",
              border: "none", borderRadius: 10, padding: "13px",
              color: "#111", fontWeight: 800, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s", opacity: (!email.trim() || !senha.trim()) ? 0.5 : 1,
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

type Projeto = "age" | "rapadura" | "pv";

type Post = {
  id: string;
  tipo: "auto" | "nota" | "myym";
  projeto: Projeto;
  setor?: string;
  autor: string;
  conteudo: string;
  ts: string;
};

type CarrinhoItem = { id: string; conteudo: string; ts: string };

const PROJETOS: Record<Projeto, { nome: string; cor: string; setores: string[] }> = {
  age:      { nome: "Age",      cor: "#2dd4bf", setores: ["Agenda & Pacientes", "Documentos & Prontuários", "Financeiro & Sabiá"] },
  rapadura: { nome: "Rapadura", cor: "#f59e0b", setores: ["Governança & IA", "Rede BNI & Conexões", "Ativos & Infraestrutura"] },
  pv:       { nome: "PV",       cor: "#a78bfa", setores: ["UI/UX & Mobile", "Identidade & Avatares CSS", "Design de Sistemas"] },
};

// ─── Avatar MYYM (esquilo voador CSS) ─────────────────────────────────────────

function MyymAvatar({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed", bottom: 24, right: 20,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #f59e0b, #a78bfa)",
        border: "none", cursor: "pointer", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        animation: "float 3s ease-in-out infinite",
      }}
      title="Falar com MYYM"
    >
      🐿️
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50%       { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </button>
  );
}

// ─── Chatbox MYYM ─────────────────────────────────────────────────────────────

function MyymChat({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<{ role: "myym" | "user"; texto: string }[]>([
    { role: "myym", texto: "Oi. Sou a MYYM — a parte que pensa enquanto você faz.\n\nComo você quer que eu te chame?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ mensagem: texto, historico: msgs }),
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
        {msgs.map((m, i) => (
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
  onEnviar: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div style={{ position: "fixed", bottom: 24, left: 16, zIndex: 98 }}>
      <button
        onClick={() => setAberto(a => !a)}
        style={{
          background: items.length > 0 ? "#2dd4bf" : "#333",
          border: "none", borderRadius: 28, padding: "10px 18px",
          color: "#111", fontWeight: 700, cursor: "pointer", fontSize: 13,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
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
            <button onClick={onEnviar} style={{
              width: "100%", marginTop: 8, background: "#2dd4bf",
              border: "none", borderRadius: 8, padding: "10px",
              color: "#111", fontWeight: 700, cursor: "pointer", fontSize: 13,
            }}>
              Enviar email / Responder brainstorm →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onAddCarrinho }: { post: Post; onAddCarrinho: (texto: string) => void }) {
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState("");
  const proj = PROJETOS[post.projeto];

  const corTipo: Record<Post["tipo"], string> = {
    auto:  "#444",
    nota:  "#2dd4bf22",
    myym:  "#f59e0b11",
  };

  return (
    <div style={{
      background: corTipo[post.tipo],
      border: `1px solid ${post.tipo === "nota" ? "#2dd4bf44" : post.tipo === "myym" ? "#f59e0b33" : "#2a2a2a"}`,
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
      <p style={{ color: "#e8e8e8", margin: 0, fontSize: 14, lineHeight: 1.5 }}>{post.conteudo}</p>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={() => setEditando(e => !e)} style={{
          background: "none", border: "1px solid #333", borderRadius: 6,
          color: "#888", fontSize: 11, padding: "3px 10px", cursor: "pointer",
        }}>+ nota</button>
        <button onClick={() => onAddCarrinho(post.conteudo)} style={{
          background: "none", border: "1px solid #333", borderRadius: 6,
          color: "#888", fontSize: 11, padding: "3px 10px", cursor: "pointer",
        }}>🧺</button>
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

function NovaNota({ projeto, onSalva }: { projeto: Projeto; onSalva: () => void }) {
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!texto.trim() || salvando) return;
    setSalvando(true);
    try {
      await fetch(`${API}/api/jasmim/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projeto, tipo: "nota", autor: "Mayumi", conteudo: texto.trim() }),
      });
      setTexto("");
      onSalva();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{
      background: "#1a1a2e", border: "1px solid #2dd4bf44",
      borderRadius: 12, padding: "12px 16px", marginBottom: 16,
    }}>
      <textarea
        value={texto}
        onChange={e => setTexto(e.target.value)}
        placeholder="Nova nota para o feed…"
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
            background: texto.trim() ? "#2dd4bf" : "#333",
            border: "none", borderRadius: 8, padding: "6px 16px",
            color: "#111", fontWeight: 700, fontSize: 12,
            cursor: texto.trim() ? "pointer" : "not-allowed", transition: "background 0.2s",
          }}
        >{salvando ? "salvando…" : "Postar nota"}</button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function JasmimMangaPage() {
  const [projetoAtivo, setProjetoAtivo] = useState<Projeto>("age");
  const [posts, setPosts] = useState<Post[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [myymAberto, setMyymAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  const proj = PROJETOS[projetoAtivo];

  function carregarFeed() {
    setLoading(true);
    fetch(`${API}/api/jasmim/feed?projeto=${projetoAtivo}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setPosts(d?.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { carregarFeed(); }, [projetoAtivo]);

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
    await fetch(`${API}/api/jasmim/carrinho/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itens: carrinho, corpo }),
    });
    setCarrinho([]);
    alert("Enviado para o brainstorm! ✅");
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0f1a", color: "#e8e8e8",
      fontFamily: "system-ui, sans-serif", paddingBottom: 120,
    }}>
      {/* Header */}
      <div style={{
        background: "#1a1a2e", borderBottom: "1px solid #222",
        padding: "16px 20px", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: proj.cor }}>Jasmim</span>
            <span style={{ color: "#444" }}>-</span>
            <span style={{ color: "#e8e8e8" }}>Manga</span>
          </h1>
          {/* Seletor de projetos */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
            {(Object.entries(PROJETOS) as [Projeto, typeof PROJETOS.age][]).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setProjetoAtivo(key)}
                style={{
                  background: projetoAtivo === key ? p.cor : "transparent",
                  border: `1px solid ${projetoAtivo === key ? p.cor : "#333"}`,
                  borderRadius: 20, padding: "5px 14px", color: projetoAtivo === key ? "#111" : "#888",
                  fontWeight: projetoAtivo === key ? 700 : 400,
                  cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", flexShrink: 0,
                }}
              >{p.nome}</button>
            ))}
          </div>
          {/* Setores */}
          <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
            {proj.setores.map(s => (
              <span key={s} style={{
                background: `${proj.cor}18`, border: `1px solid ${proj.cor}44`,
                borderRadius: 10, padding: "3px 10px", fontSize: 11, color: proj.cor, whiteSpace: "nowrap",
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        <NovaNota projeto={projetoAtivo} onSalva={carregarFeed} />
        {loading && <p style={{ color: "#666", textAlign: "center" }}>carregando feed…</p>}
        {!loading && posts.length === 0 && (
          <p style={{ color: "#666", textAlign: "center", marginTop: 32 }}>
            Nenhuma atualização ainda para {proj.nome}.<br/>
            <span style={{ fontSize: 12, color: "#555" }}>Use o campo acima para adicionar a primeira nota.</span>
          </p>
        )}
        {posts.map(post => (
          <PostCard key={post.id} post={post} onAddCarrinho={addCarrinho} />
        ))}
      </div>

      {/* Carrinho */}
      <Carrinho items={carrinho} onRemover={removerCarrinho} onEnviar={enviarBrainstorm} />

      {/* MYYM */}
      {myymAberto && <MyymChat onClose={() => setMyymAberto(false)} />}
      <MyymAvatar onClick={() => setMyymAberto(m => !m)} />
    </div>
  );
}
