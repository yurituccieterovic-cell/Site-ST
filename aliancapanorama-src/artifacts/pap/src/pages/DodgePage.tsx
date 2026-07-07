import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight, ChevronDown, Plus, Trash2, Edit3, Move,
  FileText, Loader2, Check, X, ArrowLeft, Crown, Eye,
  LayoutGrid, Book
} from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

interface Node {
  code: string; title: string; abbreviation: string | null;
  subtitle: string | null; content: string | null;
  parentCode: string | null; level: number; sortOrder: number;
}
interface MD { name: string; desc: string; }
type View = "tree" | "mds";

// ─── API helpers ──────────────────────────────────────────────────────────────
async function fetchTree(): Promise<Node[]> {
  const r = await fetch(`${API}/api/dodge/tree`, { credentials: "include" });
  if (!r.ok) throw new Error("Sem acesso à árvore");
  const d = await r.json() as { nodes: Node[] };
  return d.nodes;
}
async function fetchMDs(): Promise<MD[]> {
  const r = await fetch(`${API}/api/dodge/mds`, { credentials: "include" });
  const d = await r.json() as { mds: MD[] };
  return d.mds;
}
async function apiPatch(code: string, data: Partial<Node>) {
  const r = await fetch(`${API}/api/dodge/nodes/${code}`, {
    method: "PATCH", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) { const e = await r.json() as { error?: string }; throw new Error(e.error ?? "Erro"); }
}
async function apiCreate(data: Partial<Node> & { code: string; title: string }) {
  const r = await fetch(`${API}/api/dodge/nodes`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) { const e = await r.json() as { error?: string }; throw new Error(e.error ?? "Erro"); }
}
async function apiDelete(code: string) {
  const r = await fetch(`${API}/api/dodge/nodes/${code}`, {
    method: "DELETE", credentials: "include",
  });
  if (!r.ok) { const e = await r.json() as { error?: string }; throw new Error(e.error ?? "Erro"); }
  return r.json() as Promise<{ deleted: number }>;
}
async function apiMove(code: string, newParentCode: string | null) {
  const r = await fetch(`${API}/api/dodge/nodes/${code}/move`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newParentCode }),
  });
  if (!r.ok) { const e = await r.json() as { error?: string }; throw new Error(e.error ?? "Erro"); }
  return r.json() as Promise<{ subtreeSize: number }>;
}

// ─── Node Editor ──────────────────────────────────────────────────────────────
function NodeEditor({ node, superAdm, onSave, onClose }: {
  node: Node; superAdm: boolean;
  onSave: (code: string, data: Partial<Node>) => Promise<void>;
  onClose: () => void;
}) {
  const [title,   setTitle]   = useState(node.title);
  const [abbr,    setAbbr]    = useState(node.abbreviation ?? "");
  const [sub,     setSub]     = useState(node.subtitle ?? "");
  const [content, setContent] = useState(node.content ?? "");
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  async function save() {
    setLoading(true); setErr("");
    try {
      const data: Partial<Node> = { title, content };
      if (superAdm) { data.abbreviation = abbr; data.subtitle = sub; }
      await onSave(node.code, data);
      onClose();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Erro"); }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-[#0d1b2a] border border-cyan-900/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-cyan-400 font-bold text-sm">Editar nódulo · <span className="text-amber-400">{node.code}</span></div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={16}/></button>
        </div>

        {err && <div className="mb-3 text-red-400 text-xs bg-red-900/20 rounded p-2">{err}</div>}

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Título</label>
            <input className="w-full bg-[#111827] border border-cyan-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
              value={title} onChange={e => setTitle(e.target.value)}/>
          </div>
          {superAdm && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Abreviação</label>
                <input className="w-full bg-[#111827] border border-cyan-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                  value={abbr} onChange={e => setAbbr(e.target.value)}/>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Subtítulo</label>
                <input className="w-full bg-[#111827] border border-cyan-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500"
                  value={sub} onChange={e => setSub(e.target.value)}/>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Conteúdo</label>
            <textarea className="w-full bg-[#111827] border border-cyan-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 h-40 resize-y"
              value={content} onChange={e => setContent(e.target.value)}/>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}
            className="px-4 py-2 text-xs text-gray-400 hover:text-gray-200 border border-gray-700 rounded">
            Cancelar
          </button>
          <button onClick={() => { void save(); }} disabled={loading}
            className="px-4 py-2 text-xs bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white rounded flex items-center gap-1">
            {loading ? <Loader2 size={12} className="animate-spin"/> : <Check size={12}/>}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Node Modal ────────────────────────────────────────────────────────
function CreateModal({ parentCode, parentTitle, onCreate, onClose }: {
  parentCode: string | null; parentTitle: string;
  onCreate: (data: Partial<Node> & { code: string; title: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [code,  setCode]  = useState("");
  const [title, setTitle] = useState("");
  const [abbr,  setAbbr]  = useState("");
  const [sub,   setSub]   = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setLoading(true); setErr("");
    try {
      await onCreate({ code, title, abbreviation: abbr, subtitle: sub, parentCode });
      onClose();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Erro"); }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-[#0d1b2a] border border-green-900/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-green-400 font-bold text-sm">Novo nódulo em <span className="text-cyan-400">{parentTitle}</span></div>
          <button onClick={onClose}><X size={16} className="text-gray-500"/></button>
        </div>
        {err && <div className="mb-3 text-red-400 text-xs bg-red-900/20 rounded p-2">{err}</div>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Código</label>
              <input className="w-full bg-[#111827] border border-green-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500"
                value={code} onChange={e => setCode(e.target.value)} placeholder="ex: 135"/>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Abreviação</label>
              <input className="w-full bg-[#111827] border border-green-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500"
                value={abbr} onChange={e => setAbbr(e.target.value)} placeholder="ex: Eco"/>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Título</label>
            <input className="w-full bg-[#111827] border border-green-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500"
              value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do nódulo"/>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Subtítulo</label>
            <input className="w-full bg-[#111827] border border-green-900/40 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-green-500"
              value={sub} onChange={e => setSub(e.target.value)} placeholder="Subtítulo opcional"/>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-xs text-gray-400 border border-gray-700 rounded">Cancelar</button>
          <button onClick={() => { void submit(); }} disabled={loading || !code || !title}
            className="px-4 py-2 text-xs bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white rounded flex items-center gap-1">
            {loading ? <Loader2 size={12} className="animate-spin"/> : <Plus size={12}/>}
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tree Node Row ────────────────────────────────────────────────────────────
function NodeRow({ node, nodes, superAdm, depth, expanded, onToggle, onEdit, onCreate, onDelete, onMoveStart, moveSource }: {
  node: Node; nodes: Node[]; superAdm: boolean; depth: number;
  expanded: Set<string>; onToggle: (code: string) => void;
  onEdit: (n: Node) => void; onCreate: (parentCode: string) => void;
  onDelete: (n: Node) => void; onMoveStart: (n: Node) => void;
  moveSource: Node | null;
}) {
  const children = nodes.filter(n => n.parentCode === node.code).sort((a, b) => a.sortOrder - b.sortOrder);
  const isExpanded = expanded.has(node.code);
  const isMoveSource = moveSource?.code === node.code;

  return (
    <div>
      <div className={`flex items-center gap-1 group py-0.5 rounded px-1 ${isMoveSource ? "bg-amber-900/30 border border-amber-700/50" : "hover:bg-[#111827]"}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}>
        {/* Expand */}
        <button onClick={() => onToggle(node.code)}
          className="w-4 h-4 flex items-center justify-center text-gray-600 hover:text-cyan-400 flex-shrink-0">
          {children.length > 0 ? (isExpanded ? <ChevronDown size={12}/> : <ChevronRight size={12}/>) : <span className="w-3"/>}
        </button>
        {/* Code */}
        <span className="text-amber-400 text-xs font-mono w-12 flex-shrink-0">{node.code}</span>
        {/* Title */}
        <span className="text-gray-200 text-xs flex-1 truncate">{node.title}</span>
        {/* Abbr */}
        {node.abbreviation && <span className="text-gray-500 text-xs">{node.abbreviation}</span>}
        {/* Actions — show on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(node)}
            className="w-5 h-5 flex items-center justify-center text-cyan-600 hover:text-cyan-400" title="Editar">
            <Edit3 size={11}/>
          </button>
          {superAdm && (
            <>
              <button onClick={() => onCreate(node.code)}
                className="w-5 h-5 flex items-center justify-center text-green-600 hover:text-green-400" title="Adicionar filho">
                <Plus size={11}/>
              </button>
              <button onClick={() => onMoveStart(node)}
                className="w-5 h-5 flex items-center justify-center text-amber-600 hover:text-amber-400" title="Mover">
                <Move size={11}/>
              </button>
              <button onClick={() => onDelete(node)}
                className="w-5 h-5 flex items-center justify-center text-red-700 hover:text-red-400" title="Apagar (com sub-árvore)">
                <Trash2 size={11}/>
              </button>
            </>
          )}
        </div>
      </div>
      {isExpanded && children.map(child => (
        <NodeRow key={child.code} node={child} nodes={nodes} superAdm={superAdm}
          depth={depth + 1} expanded={expanded} onToggle={onToggle}
          onEdit={onEdit} onCreate={onCreate} onDelete={onDelete}
          onMoveStart={onMoveStart} moveSource={moveSource}/>
      ))}
    </div>
  );
}

// ─── Dodge Page ───────────────────────────────────────────────────────────────
export function DodgePage({ superAdm }: { superAdm: boolean }) {
  const [nodes,     setNodes]     = useState<Node[]>([]);
  const [mds,       setMds]       = useState<MD[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set(["0", "1"]));
  const [editing,   setEditing]   = useState<Node | null>(null);
  const [creating,  setCreating]  = useState<{ code: string; title: string } | null>(null);
  const [moveSource, setMoveSource] = useState<Node | null>(null);
  const [view,      setView]      = useState<View>("tree");
  const [toast,     setToast]     = useState("");
  const [err,       setErr]       = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const [ns, ms] = await Promise.all([fetchTree(), fetchMDs()]);
      setNodes(ns); setMds(ms);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Erro ao carregar"); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  function toggle(code: string) {
    setExpanded(prev => { const s = new Set(prev); s.has(code) ? s.delete(code) : s.add(code); return s; });
  }

  async function handleSave(code: string, data: Partial<Node>) {
    await apiPatch(code, data);
    setNodes(prev => prev.map(n => n.code === code ? { ...n, ...data } : n));
    showToast(`Nódulo ${code} atualizado`);
  }

  async function handleCreate(data: Partial<Node> & { code: string; title: string }) {
    await apiCreate(data);
    await load();
    showToast(`Nódulo ${data.code} criado`);
  }

  async function handleDelete(node: Node) {
    if (!confirm(`Apagar "${node.title}" (${node.code}) e toda a sub-árvore? Esta ação é irreversível.`)) return;
    const result = await apiDelete(node.code);
    setNodes(prev => {
      const deleted = new Set<string>();
      const queue = [node.code];
      while (queue.length > 0) {
        const code = queue.shift()!; deleted.add(code);
        prev.forEach(n => { if (n.parentCode === code) queue.push(n.code); });
      }
      return prev.filter(n => !deleted.has(n.code));
    });
    showToast(`${result.deleted} nódulos apagados`);
  }

  async function handleMoveTo(target: Node | null) {
    if (!moveSource) return;
    const targetCode = target?.code ?? null;
    const targetTitle = target?.title ?? "raiz";
    if (!confirm(`Mover "${moveSource.title}" (${moveSource.code}) para "${targetTitle}"?`)) {
      setMoveSource(null); return;
    }
    const result = await apiMove(moveSource.code, targetCode);
    await load();
    setMoveSource(null);
    showToast(`Movido com sub-árvore de ${result.subtreeSize} nódulos para ${targetTitle}`);
  }

  const roots = nodes.filter(n => !n.parentCode).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-gray-200 font-mono flex flex-col">
      {/* Header */}
      <div className="border-b border-cyan-900/30 px-4 py-3 flex items-center justify-between bg-[#0d1b2a]">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">DODGE</span>
          {superAdm && <span className="flex items-center gap-1 text-amber-400 text-xs"><Crown size={11}/> SUPERADM</span>}
          <span className="text-gray-600 text-xs">editor de raízes · {nodes.length} nódulos</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView("tree")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${view === "tree" ? "bg-cyan-900/40 text-cyan-300" : "text-gray-500 hover:text-gray-300"}`}>
            <LayoutGrid size={11}/> Árvore
          </button>
          <button onClick={() => setView("mds")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${view === "mds" ? "bg-cyan-900/40 text-cyan-300" : "text-gray-500 hover:text-gray-300"}`}>
            <Book size={11}/> MDs
          </button>
          <a href="/portal" className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 ml-2">
            <ArrowLeft size={11}/> Portal
          </a>
          <a href="/" className="text-xs text-gray-600 hover:text-gray-400">PAP</a>
          <a href="/adm" className="text-xs text-gray-600 hover:text-gray-400">Adm</a>
        </div>
      </div>

      {/* Move banner */}
      {moveSource && (
        <div className="bg-amber-900/30 border-b border-amber-700/40 px-4 py-2 text-xs text-amber-300 flex items-center gap-3">
          <Move size={12}/>
          <span>Movendo: <strong>{moveSource.title}</strong> ({moveSource.code})</span>
          <span className="text-gray-400">Clique no nódulo destino, ou:</span>
          <button onClick={() => { void handleMoveTo(null); }}
            className="px-2 py-0.5 bg-amber-800 hover:bg-amber-700 rounded text-xs">Mover para raiz</button>
          <button onClick={() => setMoveSource(null)}
            className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-400">Cancelar</button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-cyan-900 border border-cyan-600 text-cyan-100 text-xs px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">
        {loading && <div className="flex items-center gap-2 text-gray-500 text-xs"><Loader2 size={14} className="animate-spin"/> Carregando...</div>}
        {err && <div className="text-red-400 text-xs bg-red-900/20 rounded p-3">{err}</div>}

        {/* Árvore */}
        {!loading && view === "tree" && (
          <div>
            {superAdm && (
              <button onClick={() => setCreating({ code: "", title: "raiz" })}
                className="flex items-center gap-1 mb-4 text-xs text-green-400 hover:text-green-300 border border-green-900/40 rounded px-3 py-1.5">
                <Plus size={12}/> Nova raiz
              </button>
            )}
            <div className="space-y-0.5">
              {roots.map(root => (
                <div key={root.code}>
                  {moveSource && moveSource.code !== root.code && (
                    <button onClick={() => { void handleMoveTo(root); }}
                      className="w-full text-left text-xs text-amber-500 hover:text-amber-300 bg-amber-900/10 rounded px-2 py-0.5 mb-0.5">
                      → Mover para aqui ({root.code})
                    </button>
                  )}
                  <NodeRow node={root} nodes={nodes} superAdm={superAdm} depth={0}
                    expanded={expanded} onToggle={toggle}
                    onEdit={n => setEditing(n)}
                    onCreate={code => { const n = nodes.find(x => x.code === code); if (n) setCreating({ code, title: n.title }); }}
                    onDelete={n => { void handleDelete(n); }}
                    onMoveStart={n => setMoveSource(n)}
                    moveSource={moveSource}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MDs */}
        {!loading && view === "mds" && (
          <div>
            <div className="text-xs text-gray-500 mb-4">Arquivos .md do sistema — abrir no editor externo ou usar /dodge diretamente</div>
            <div className="space-y-2">
              {mds.map(md => (
                <div key={md.name} className="flex items-center gap-3 p-3 bg-[#0d1b2a] border border-cyan-900/20 rounded hover:border-cyan-900/50">
                  <FileText size={13} className="text-cyan-600 flex-shrink-0"/>
                  <div className="flex-1">
                    <div className="text-xs text-cyan-300 font-mono">{md.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{md.desc}</div>
                  </div>
                  <a href={`https://github.com/yurituccieterovic-cell/Site-ST/blob/main/aliancapanorama-src/${md.name}`}
                    target="_blank" rel="noreferrer"
                    className="text-xs text-gray-600 hover:text-cyan-400 flex items-center gap-1">
                    <Eye size={11}/> GitHub
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editing && (
        <NodeEditor node={editing} superAdm={superAdm}
          onSave={handleSave} onClose={() => setEditing(null)}/>
      )}
      {creating && (
        <CreateModal
          parentCode={creating.code || null}
          parentTitle={creating.title}
          onCreate={handleCreate}
          onClose={() => setCreating(null)}/>
      )}
    </div>
  );
}
