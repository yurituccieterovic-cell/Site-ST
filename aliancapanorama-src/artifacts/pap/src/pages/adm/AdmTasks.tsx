import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, Plus, ChevronDown, ChevronRight } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

type TaskStatus = "pending" | "running" | "completed" | "failed" | "skipped";
type TaskType = "general" | "course_progress" | "ai_query" | "assembly_request" | "webhook_event" | "isa_suggestion";

interface Task {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  priority: number;
  assignedToAgent?: string | null;
  origemSessao?: string | null;
  indicesData?: Record<string, unknown> | null;
  createdAt: string;
  completedAt?: string | null;
}

interface Stats {
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
  avgPriority: number;
}

const INDICES = ["Informação","Orientação","Organização","Manifestação","Significante","Interferência","Registro","Dinâmica","Mentalidade"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "pendente", running: "em andamento", completed: "concluída", failed: "falhou", skipped: "ignorada",
};

const PRIORITY_COLOR = (p: number) => p >= 8 ? "text-red-600 font-bold" : p >= 5 ? "text-orange-500 font-semibold" : "text-gray-400";

function Phi({ data }: { data?: Record<string, unknown> | null }) {
  if (!data) return <span className="text-gray-300 text-xs">Φ —</span>;
  const phi = (data["0"] as any)?.phi as number | undefined;
  if (phi === undefined) return <span className="text-gray-300 text-xs">Φ —</span>;
  const color = phi >= 0.7 ? "text-green-600" : phi >= 0.4 ? "text-yellow-600" : "text-red-500";
  return <span className={`text-xs font-mono font-semibold ${color}`}>Φ {phi.toFixed(2)}</span>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function AdmTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"" | TaskStatus>("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", type: "general", priority: 5, assignedToAgent: "", origemSessao: "" });
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(0);
  const PER_PAGE = 30;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PER_PAGE), offset: String(page * PER_PAGE) });
      if (filter) params.set("status", filter);
      const [tr, sr] = await Promise.all([
        fetch(`${API}/api/tasks?${params}`, { credentials: "include" }),
        fetch(`${API}/api/tasks/stats`, { credentials: "include" }),
      ]);
      if (tr.ok) { const d = await tr.json() as { data: Task[]; total: number }; setTasks(d.data); setTotal(d.total); }
      if (sr.ok) { const d = await sr.json() as Stats; setStats(d); }
    } finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { void load(); }, [load]);

  async function createTask() {
    if (!newTask.title.trim()) return;
    setCreating(true);
    try {
      const r = await fetch(`${API}/api/tasks`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTask, priority: Number(newTask.priority) }),
      });
      if (r.ok) {
        setShowCreate(false);
        setNewTask({ title: "", description: "", type: "general", priority: 5, assignedToAgent: "", origemSessao: "" });
        await load();
      }
    } finally { setCreating(false); }
  }

  async function updateStatus(id: number, status: string) {
    await fetch(`${API}/api/tasks/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setTasks(t => t.map(x => x.id === id ? { ...x, status } : x));
  }

  const statusCounts: Record<string, number> = {};
  stats?.byStatus.forEach(s => { statusCounts[s.status] = s.count; });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tarefas</h2>
          <p className="text-xs text-gray-500 mt-0.5">{total} total · 9 índices ontológicos · Φ coerência</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          <button onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#F97316] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-3 h-3" /> Nova tarefa
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          {(["pending","running","completed","failed","skipped"] as TaskStatus[]).map(s => (
            <button key={s} onClick={() => { setFilter(f => f === s ? "" : s); setPage(0); }}
              className={`text-center p-3 rounded-xl border transition-all ${filter === s ? "border-[#F97316] bg-orange-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <div className="text-xl font-bold text-gray-800">{statusCounts[s] ?? 0}</div>
              <div className="text-xs text-gray-500 mt-0.5">{STATUS_LABELS[s]}</div>
            </button>
          ))}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-5 space-y-3">
          <h3 className="text-sm font-semibold text-orange-800">Nova tarefa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={newTask.title} onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))}
              placeholder="Título *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <div className="flex gap-2">
              <select value={newTask.type} onChange={e => setNewTask(n => ({ ...n, type: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {(["general","course_progress","ai_query","assembly_request","webhook_event","isa_suggestion"] as TaskType[]).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select value={newTask.priority} onChange={e => setNewTask(n => ({ ...n, priority: Number(e.target.value) }))}
                className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none">
                {[1,2,3,4,5,6,7,8,9,10].map(p => <option key={p} value={p}>P{p}</option>)}
              </select>
            </div>
            <input value={newTask.assignedToAgent} onChange={e => setNewTask(n => ({ ...n, assignedToAgent: e.target.value }))}
              placeholder="Agente (isa, dodge, etc.)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <input value={newTask.origemSessao} onChange={e => setNewTask(n => ({ ...n, origemSessao: e.target.value }))}
              placeholder="Sessão origem (#203)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <textarea value={newTask.description} onChange={e => setNewTask(n => ({ ...n, description: e.target.value }))}
            placeholder="Descrição (opcional)" rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800">Cancelar</button>
            <button onClick={() => void createTask()} disabled={creating || !newTask.title.trim()}
              className="px-4 py-1.5 text-xs bg-[#F97316] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium">
              {creating ? "Criando…" : "Criar"}
            </button>
          </div>
        </div>
      )}

      {/* Task list */}
      {loading && tasks.length === 0 ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Nenhuma tarefa encontrada.</div>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
              <button className="w-full text-left px-4 py-3 flex items-center gap-3" onClick={() => setExpanded(e => e === t.id ? null : t.id)}>
                <span className="text-gray-300 flex-shrink-0">{expanded === t.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                <span className="text-gray-400 text-xs font-mono w-8 flex-shrink-0">#{t.id}</span>
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{t.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[t.status] ?? "bg-gray-100 text-gray-500"}`}>{STATUS_LABELS[t.status] ?? t.status}</span>
                <span className={`text-xs flex-shrink-0 ${PRIORITY_COLOR(t.priority)}`}>P{t.priority}</span>
                <Phi data={t.indicesData} />
                <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">{fmtDate(t.createdAt)}</span>
              </button>
              {expanded === t.id && (
                <div className="border-t border-gray-50 px-4 py-4 bg-gray-50/50 space-y-4">
                  {/* Meta */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-gray-400">Tipo</span><div className="font-medium text-gray-700 mt-0.5">{t.type}</div></div>
                    <div><span className="text-gray-400">Agente</span><div className="font-medium text-gray-700 mt-0.5">{t.assignedToAgent || "—"}</div></div>
                    <div><span className="text-gray-400">Sessão</span><div className="font-medium text-gray-700 mt-0.5">{t.origemSessao || "—"}</div></div>
                    <div><span className="text-gray-400">Concluída</span><div className="font-medium text-gray-700 mt-0.5">{t.completedAt ? fmtDate(t.completedAt) : "—"}</div></div>
                  </div>
                  {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
                  {/* Índices */}
                  {t.indicesData && Object.keys(t.indicesData).length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">9 Índices Ontológicos</div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {INDICES.map((name, i) => {
                          const idx = t.indicesData?.[String(i + 1)] as any;
                          const phi0 = t.indicesData?.["0"] as any;
                          if (i === 0) return (
                            <div key="phi" className="col-span-3 sm:col-span-5 text-xs text-center bg-orange-50 border border-orange-100 rounded-lg py-2 font-semibold text-orange-700">
                              Φ coerência: {(phi0?.phi ?? 0).toFixed(3)}
                            </div>
                          );
                          return (
                            <div key={i} className="bg-white border border-gray-100 rounded-lg px-2 py-2 text-center">
                              <div className="text-xs text-gray-400">{i}. {name}</div>
                              <div className="text-xs font-medium text-gray-600 mt-0.5 truncate">{idx ? JSON.stringify(idx).slice(0,30) : "—"}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Ações */}
                  <div className="flex gap-2 flex-wrap">
                    {t.status === "pending" && (
                      <button onClick={() => void updateStatus(t.id, "running")} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">▶ Iniciar</button>
                    )}
                    {(t.status === "pending" || t.status === "running") && (
                      <button onClick={() => void updateStatus(t.id, "completed")} className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">✓ Concluir</button>
                    )}
                    {t.status !== "failed" && t.status !== "completed" && (
                      <button onClick={() => void updateStatus(t.id, "failed")} className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">✗ Falhou</button>
                    )}
                    {t.status !== "skipped" && (
                      <button onClick={() => void updateStatus(t.id, "skipped")} className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">— Ignorar</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {total > PER_PAGE && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">
            ← Anterior
          </button>
          <span className="text-xs text-gray-400">{page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, total)} de {total}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PER_PAGE >= total}
            className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50">
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
