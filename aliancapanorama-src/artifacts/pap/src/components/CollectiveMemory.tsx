import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

interface Entry {
  id: string;
  createdAt: string;
  authorType: "human" | "meky" | "isa";
  authorName: string;
  content: string;
  nodeCode?: string;
  tags?: string[];
  reactions: number;
}

const AUTHOR_STYLE: Record<string, { color: string; icon: string }> = {
  human:  { color: "#3B82F6", icon: "👤" },
  meky:   { color: "#10B981", icon: "🤖" },
  isa:    { color: "#8B5CF6", icon: "🦉" },
};

function timeAgo(ts: string) {
  const d = (Date.now() - new Date(ts).getTime()) / 1000;
  if (d < 60)   return `${Math.round(d)}s`;
  if (d < 3600) return `${Math.round(d / 60)}min`;
  if (d < 86400) return `${Math.round(d / 3600)}h`;
  return `${Math.round(d / 86400)}d`;
}

interface Props {
  nodeCode?: string;   // filtrar por nó (opcional)
  compact?: boolean;   // modo compacto para sidebar
}

export function CollectiveMemory({ nodeCode, compact = false }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchEntries = async () => {
    const url = nodeCode
      ? `${API}/api/collective/node/${nodeCode}`
      : `${API}/api/collective?limit=40`;
    try {
      const r = await fetch(url, { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setEntries(data.entries ?? []);
      }
    } catch { /* offline */ }
  };

  useEffect(() => {
    fetchEntries();
    const t = setInterval(fetchEntries, 20_000);
    return () => clearInterval(t);
  }, [nodeCode]);

  const post = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      await fetch(`${API}/api/collective`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), nodeCode }),
      });
      setContent("");
      setTimeout(fetchEntries, 500);
    } finally {
      setPosting(false);
    }
  };

  const react = async (id: string) => {
    await fetch(`${API}/api/collective/${id}/react`, {
      method: "POST", credentials: "include"
    });
    setEntries(prev => prev.map(e => e.id === id ? { ...e, reactions: e.reactions + 1 } : e));
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid #1e293b",
      borderRadius: 8,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: compact ? "8px 12px" : "12px 16px",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <span style={{ fontSize: compact ? 12 : 14, fontWeight: 600, color: "#e2e8f0", fontFamily: "monospace" }}>
          🧠 MEMÓRIA COLETIVA
        </span>
        <span style={{
          fontSize: 10,
          background: "rgba(59,130,246,0.15)",
          color: "#60a5fa",
          padding: "1px 6px",
          borderRadius: 10,
        }}>
          {entries.length}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 10, color: "#64748b" }}>
          <span>🤖 MEKY</span>
          <span>🦉 ISA</span>
          <span>👤 Humanos</span>
        </div>
      </div>

      {/* Feed */}
      <div style={{
        maxHeight: compact ? 240 : 400,
        overflowY: "auto",
        padding: compact ? "8px" : "12px",
      }}>
        {entries.length === 0 && (
          <div style={{ textAlign: "center", color: "#475569", padding: 24, fontSize: 12 }}>
            Nenhuma memória ainda.<br />Seja o primeiro a contribuir.
          </div>
        )}
        {entries.map((e) => {
          const style = AUTHOR_STYLE[e.authorType] ?? AUTHOR_STYLE.human;
          return (
            <div key={e.id} style={{
              borderLeft: `2px solid ${style.color}33`,
              paddingLeft: 10,
              marginBottom: 12,
            }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 12 }}>{style.icon}</span>
                <span style={{ fontSize: 11, color: style.color, fontWeight: 600 }}>
                  {e.authorName.split(" — ")[0]}
                </span>
                {e.nodeCode && (
                  <span style={{
                    fontSize: 9,
                    background: "rgba(245,158,11,0.15)",
                    color: "#F59E0B",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontFamily: "monospace",
                  }}>
                    nó {e.nodeCode}
                  </span>
                )}
                <span style={{ fontSize: 10, color: "#475569", marginLeft: "auto" }}>
                  {timeAgo(e.createdAt)}
                </span>
              </div>
              <div style={{ fontSize: compact ? 11 : 12, color: "#cbd5e1", lineHeight: 1.6 }}>
                {e.content}
              </div>
              {e.tags && e.tags.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                  {e.tags.map(t => (
                    <span key={t} style={{
                      fontSize: 9, color: "#64748b",
                      background: "rgba(255,255,255,0.05)",
                      padding: "1px 5px", borderRadius: 4,
                    }}>{t}</span>
                  ))}
                </div>
              )}
              <button onClick={() => react(e.id)} style={{
                marginTop: 4,
                background: "none",
                border: "none",
                color: "#475569",
                fontSize: 11,
                cursor: "pointer",
                padding: 0,
              }}>
                ✦ {e.reactions}
              </button>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div style={{
        borderTop: "1px solid #1e293b",
        padding: compact ? "8px" : "12px",
        display: "flex",
        gap: 8,
      }}>
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && post()}
          placeholder="Contribua com uma memória..."
          style={{
            flex: 1,
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 6,
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: 12,
            padding: "6px 10px",
          }}
        />
        <button onClick={post} disabled={posting || !content.trim()} style={{
          padding: "6px 12px",
          background: content.trim() ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${content.trim() ? "rgba(59,130,246,0.4)" : "#1e293b"}`,
          borderRadius: 6,
          color: content.trim() ? "#60a5fa" : "#475569",
          fontFamily: "monospace",
          fontSize: 11,
          cursor: content.trim() ? "pointer" : "default",
        }}>
          {posting ? "..." : "→"}
        </button>
      </div>
    </div>
  );
}
