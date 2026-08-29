import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "https://site-st.onrender.com";

const STATUS_COLORS: Record<string, string> = {
  pending:     "#64748b",
  in_progress: "#3b82f6",
  completed:   "#22c55e",
  blocked:     "#ef4444",
  cancelled:   "#6b7280",
  active:      "#2dd4bf",
  paused:      "#f59e0b",
  archived:    "#374151",
};

const TYPE_EMOJI: Record<string, string> = {
  task:      "✅",
  event:     "📅",
  milestone: "🏁",
  resource:  "📦",
  decision:  "🔮",
  document:  "📄",
  person:    "👤",
  risk:      "⚠️",
};

interface Project {
  id: string;
  title: string;
  description?: string;
  domain: string;
  status: string;
  item_count?: number;
  source_ref?: string;
  confidence?: number;
  updated_at: string;
}

interface Item {
  id: string;
  project_id: string;
  type: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  depth_level: number;
  parent_id?: string;
  due_at?: string;
  source_ref?: string;
}

// ─── Components ───────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      background: color ?? "#1e293b",
      color: "#e2e8f0",
      fontSize: 11,
      borderRadius: 4,
      padding: "2px 7px",
      fontWeight: 600,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}

function PriorityBar({ value }: { value: number }) {
  const filled = Math.round((value / 10) * 5);
  return (
    <span title={`Prioridade ${value}/10`} style={{ color: "#64748b", fontSize: 12, letterSpacing: -1 }}>
      {"█".repeat(filled)}{"░".repeat(5 - filled)}
    </span>
  );
}

// ─── Modal de criação ─────────────────────────────────────────────────────────

function CreateProjectModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const [title, setTitle]     = useState("");
  const [desc, setDesc]       = useState("");
  const [domain, setDomain]   = useState("producao_cultural");
  const [source, setSource]   = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch(`${API}/api/pv/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, domain, source_ref: source }),
    });
    const data = await r.json() as Project;
    setLoading(false);
    onCreated(data);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <form onSubmit={submit} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 32, minWidth: 400, maxWidth: 500 }}>
        <h2 style={{ margin: "0 0 20px", color: "#2dd4bf", fontSize: 18 }}>Novo Projeto</h2>
        <label style={lbl}>Título *</label>
        <input style={inp} value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
        <label style={lbl}>Descrição</label>
        <textarea style={{ ...inp, height: 80, resize: "vertical" }} value={desc} onChange={e => setDesc(e.target.value)} />
        <label style={lbl}>Domínio</label>
        <input style={inp} value={domain} onChange={e => setDomain(e.target.value)} placeholder="producao_cultural" />
        <label style={lbl}>Origem (source_ref)</label>
        <input style={inp} value={source} onChange={e => setSource(e.target.value)} placeholder="assembleia_645, #pap sessao 99, etc" />
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="button" onClick={onClose} style={btnSec}>Cancelar</button>
          <button type="submit" disabled={loading} style={btnPri}>
            {loading ? "Criando..." : "Criar Projeto"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CreateItemModal({ project, onClose, onCreated }: {
  project: Project;
  onClose: () => void;
  onCreated: (i: Item) => void;
}) {
  const [title, setTitle]   = useState("");
  const [desc, setDesc]     = useState("");
  const [type, setType]     = useState("task");
  const [status, setStatus] = useState("pending");
  const [priority, setPri]  = useState(5);
  const [source, setSource] = useState("");
  const [dueAt, setDueAt]   = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch(`${API}/api/pv/projects/${project.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, description: desc, type, status, priority,
        source_ref: source,
        due_at: dueAt || null,
      }),
    });
    const data = await r.json() as Item;
    setLoading(false);
    onCreated(data);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
      <form onSubmit={submit} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 32, minWidth: 420, maxWidth: 520 }}>
        <h2 style={{ margin: "0 0 4px", color: "#2dd4bf", fontSize: 18 }}>Novo Item</h2>
        <div style={{ color: "#64748b", fontSize: 12, marginBottom: 20 }}>em {project.title}</div>
        <label style={lbl}>Título *</label>
        <input style={inp} value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Tipo</label>
            <select style={inp} value={type} onChange={e => setType(e.target.value)}>
              {Object.keys(TYPE_EMOJI).map(t => <option key={t} value={t}>{TYPE_EMOJI[t]} {t}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Status</label>
            <select style={inp} value={status} onChange={e => setStatus(e.target.value)}>
              {["pending","in_progress","completed","blocked","cancelled"].map(s =>
                <option key={s} value={s}>{s}</option>
              )}
            </select>
          </div>
        </div>
        <label style={lbl}>Prioridade: {priority}/10</label>
        <input type="range" min={0} max={10} value={priority} onChange={e => setPri(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
        <label style={lbl}>Due (data limite)</label>
        <input type="datetime-local" style={inp} value={dueAt} onChange={e => setDueAt(e.target.value)} />
        <label style={lbl}>Descrição</label>
        <textarea style={{ ...inp, height: 72, resize: "vertical" }} value={desc} onChange={e => setDesc(e.target.value)} />
        <label style={lbl}>Origem</label>
        <input style={inp} value={source} onChange={e => setSource(e.target.value)} placeholder="assembleia_645, pendencia #116..." />
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="button" onClick={onClose} style={btnSec}>Cancelar</button>
          <button type="submit" disabled={loading} style={btnPri}>
            {loading ? "Criando..." : "Criar Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PvPage() {
  const [projects, setProjects]         = useState<Project[]>([]);
  const [selected, setSelected]         = useState<Project | null>(null);
  const [items, setItems]               = useState<Item[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showNewProj, setShowNewProj]   = useState(false);
  const [showNewItem, setShowNewItem]   = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType]     = useState("");
  const [stats, setStats]               = useState<Record<string, number>>({});

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const [projRes, statsRes] = await Promise.all([
      fetch(`${API}/api/pv/projects`),
      fetch(`${API}/api/pv/stats`),
    ]);
    setProjects(await projRes.json() as Project[]);
    setStats(await statsRes.json() as Record<string, number>);
    setLoading(false);
  }, []);

  const loadItems = useCallback(async (proj: Project) => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterType)   params.set("type", filterType);
    const r = await fetch(`${API}/api/pv/projects/${proj.id}/items?${params}`);
    setItems(await r.json() as Item[]);
  }, [filterStatus, filterType]);

  useEffect(() => { void loadProjects(); }, [loadProjects]);
  useEffect(() => { if (selected) void loadItems(selected); }, [selected, loadItems]);

  async function deleteProject(id: string) {
    if (!confirm("Deletar projeto e todos os itens?")) return;
    await fetch(`${API}/api/pv/projects/${id}`, { method: "DELETE" });
    setProjects(ps => ps.filter(p => p.id !== id));
    if (selected?.id === id) { setSelected(null); setItems([]); }
  }

  async function toggleItemStatus(item: Item) {
    const next = item.status === "completed" ? "pending" : "completed";
    await fetch(`${API}/api/pv/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setItems(is => is.map(i => i.id === item.id ? { ...i, status: next } : i));
  }

  async function deleteItem(id: string) {
    await fetch(`${API}/api/pv/items/${id}`, { method: "DELETE" });
    setItems(is => is.filter(i => i.id !== id));
  }

  const filteredItems = items.filter(i =>
    (!filterStatus || i.status === filterStatus) &&
    (!filterType   || i.type === filterType)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#060a0f", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", display: "flex" }}>
      {/* Sidebar — Projects */}
      <div style={{ width: 280, minHeight: "100vh", background: "#080c10", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>🗂️</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#2dd4bf" }}>Projectification</span>
          </div>
          {/* Stats */}
          {stats.total_projects !== undefined && (
            <div style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>
              {stats.total_projects} projetos · {stats.total_items} itens ·{" "}
              <span style={{ color: "#22c55e" }}>{stats.completed_items} ✓</span>
              {Number(stats.blocked_items) > 0 && <span style={{ color: "#ef4444" }}> · {stats.blocked_items} bloqueados</span>}
            </div>
          )}
        </div>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e293b" }}>
          <button onClick={() => setShowNewProj(true)} style={{ ...btnPri, width: "100%", fontSize: 13 }}>
            + Novo Projeto
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && <div style={{ padding: 16, color: "#475569", fontSize: 13 }}>Carregando...</div>}
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => { setSelected(p); setItems([]); }}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                background: selected?.id === p.id ? "#0f172a" : "transparent",
                borderLeft: selected?.id === p.id ? "3px solid #2dd4bf" : "3px solid transparent",
                borderBottom: "1px solid #0f1520",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: 13, fontWeight: selected?.id === p.id ? 700 : 400, color: selected?.id === p.id ? "#e2e8f0" : "#94a3b8", flex: 1, marginRight: 8 }}>
                  {p.title}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); void deleteProject(p.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#334155", fontSize: 14, padding: 0 }}
                  title="Deletar projeto"
                >×</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                <Badge label={p.status} color={STATUS_COLORS[p.status] ?? "#334155"} />
                {p.item_count !== undefined && <Badge label={`${p.item_count} itens`} />}
              </div>
              {p.source_ref && (
                <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{p.source_ref}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main — Items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!selected ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 48 }}>🗂️</span>
            <div style={{ fontSize: 16 }}>Selecione um projeto</div>
            <div style={{ fontSize: 13 }}>ou crie um novo na barra lateral</div>
          </div>
        ) : (
          <>
            {/* Project header */}
            <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #1e293b", background: "#080c10" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>{selected.title}</h1>
                  {selected.description && (
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{selected.description}</div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Badge label={selected.domain} />
                    <Badge label={selected.status} color={STATUS_COLORS[selected.status]} />
                    {selected.source_ref && <Badge label={selected.source_ref} />}
                    {selected.confidence !== undefined && (
                      <Badge label={`conf ${selected.confidence}%`} color="#1e3a5f" />
                    )}
                  </div>
                </div>
                <button onClick={() => setShowNewItem(true)} style={{ ...btnPri, whiteSpace: "nowrap" }}>
                  + Novo Item
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ padding: "12px 28px", borderBottom: "1px solid #1e293b", display: "flex", gap: 12 }}>
              <select style={{ ...inp, width: 140, marginBottom: 0 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Todos status</option>
                {["pending","in_progress","completed","blocked","cancelled"].map(s =>
                  <option key={s} value={s}>{s}</option>
                )}
              </select>
              <select style={{ ...inp, width: 140, marginBottom: 0 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="">Todos tipos</option>
                {Object.keys(TYPE_EMOJI).map(t => <option key={t} value={t}>{TYPE_EMOJI[t]} {t}</option>)}
              </select>
              <span style={{ fontSize: 12, color: "#475569", alignSelf: "center" }}>
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Items list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px" }}>
              {filteredItems.length === 0 && (
                <div style={{ color: "#334155", fontSize: 14, textAlign: "center", marginTop: 60 }}>
                  Nenhum item. Clique em "+ Novo Item" para começar.
                </div>
              )}
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: "#0a1020",
                    border: "1px solid #1e293b",
                    borderLeft: `3px solid ${STATUS_COLORS[item.status] ?? "#334155"}`,
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginLeft: item.depth_level * 24,
                  }}
                >
                  {/* Checkbox toggle */}
                  <button
                    onClick={() => void toggleItemStatus(item)}
                    style={{
                      width: 22, height: 22, borderRadius: 4, border: "2px solid",
                      borderColor: item.status === "completed" ? "#22c55e" : "#334155",
                      background: item.status === "completed" ? "#22c55e22" : "transparent",
                      cursor: "pointer", flexShrink: 0, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title={item.status === "completed" ? "Marcar pendente" : "Marcar completo"}
                  >
                    {item.status === "completed" && <span style={{ color: "#22c55e" }}>✓</span>}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span>{TYPE_EMOJI[item.type] ?? "📌"}</span>
                      <span style={{
                        fontSize: 14, fontWeight: 600,
                        color: item.status === "completed" ? "#475569" : "#e2e8f0",
                        textDecoration: item.status === "completed" ? "line-through" : "none",
                      }}>{item.title}</span>
                      <Badge label={item.status} color={STATUS_COLORS[item.status]} />
                      <PriorityBar value={item.priority} />
                    </div>
                    {item.description && (
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{item.description}</div>
                    )}
                    <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 11, color: "#475569" }}>
                      {item.source_ref && <span>📌 {item.source_ref}</span>}
                      {item.due_at && <span>⏰ {new Date(item.due_at).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => void deleteItem(item.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#334155", fontSize: 16, padding: 0, flexShrink: 0 }}
                    title="Deletar item"
                  >×</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showNewProj && (
        <CreateProjectModal
          onClose={() => setShowNewProj(false)}
          onCreated={p => setProjects(prev => [p, ...prev])}
        />
      )}
      {showNewItem && selected && (
        <CreateItemModal
          project={selected}
          onClose={() => setShowNewItem(false)}
          onCreated={i => setItems(prev => [...prev, i])}
        />
      )}
    </div>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  width: "100%",
  background: "#0a1020",
  border: "1px solid #1e293b",
  borderRadius: 6,
  color: "#e2e8f0",
  padding: "8px 10px",
  fontSize: 13,
  marginBottom: 12,
  boxSizing: "border-box",
};

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "#64748b",
  marginBottom: 4,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const btnPri: React.CSSProperties = {
  background: "#2dd4bf",
  color: "#030712",
  border: "none",
  borderRadius: 6,
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const btnSec: React.CSSProperties = {
  background: "#1e293b",
  color: "#94a3b8",
  border: "none",
  borderRadius: 6,
  padding: "9px 18px",
  fontSize: 13,
  cursor: "pointer",
};
