import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

const COLUMNS = [
  {
    id: "pending" as const,
    label: "A Fazer",
    sub: "Peças aguardando entrada na linha",
    icon: "📦",
    bg: "bg-slate-900",
    border: "border-slate-700",
    headerBg: "bg-slate-800",
    badge: "bg-slate-600",
    empty: "Fila vazia — sem itens aguardando",
  },
  {
    id: "running" as const,
    label: "Em Produção",
    sub: "Montagem ativa na linha",
    icon: "⚙️",
    bg: "bg-amber-950/40",
    border: "border-amber-700",
    headerBg: "bg-amber-900/60",
    badge: "bg-amber-600",
    empty: "Linha parada — nenhum item em processo",
  },
  {
    id: "completed" as const,
    label: "Feitas",
    sub: "Aprovadas no controle de qualidade",
    icon: "✅",
    bg: "bg-emerald-950/40",
    border: "border-emerald-700",
    headerBg: "bg-emerald-900/60",
    badge: "bg-emerald-600",
    empty: "Nenhum item entregue ainda",
  },
] as const;

type ColumnId = "pending" | "running" | "completed";

interface Task {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  priority: number;
  assignedToAgent?: string | null;
  createdBy?: string;
  createdAt?: string;
}

const NEXT: Record<ColumnId, string> = {
  pending: "running",
  running: "completed",
  completed: "pending",
};
const PREV: Record<ColumnId, string | null> = {
  pending: null,
  running: "pending",
  completed: "running",
};

function toCol(status: string): ColumnId {
  if (status === "running") return "running";
  if (status === "completed" || status === "failed" || status === "skipped") return "completed";
  return "pending";
}

function prio(p: number) {
  if (p >= 8) return { text: "ALTA", cls: "bg-red-800 text-red-100" };
  if (p >= 5) return { text: "MÉDIA", cls: "bg-amber-800 text-amber-100" };
  return { text: "BAIXA", cls: "bg-slate-700 text-slate-300" };
}

interface FormState {
  title: string;
  description: string;
  priority: number;
  assignedToAgent: string;
  type: string;
  status: ColumnId;
}

const BLANK: FormState = {
  title: "",
  description: "",
  priority: 5,
  assignedToAgent: "",
  type: "general",
  status: "pending",
};

export function ToyotaPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState<number | null>(null);
  const [addTo, setAddTo] = useState<ColumnId | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, r, c] = await Promise.all([
        fetch(`${API}/api/tasks?status=pending&limit=200`, { credentials: "include" }).then((x) => x.json()),
        fetch(`${API}/api/tasks?status=running&limit=200`, { credentials: "include" }).then((x) => x.json()),
        fetch(`${API}/api/tasks?status=completed&limit=50`, { credentials: "include" }).then((x) => x.json()),
      ]);
      setTasks([...(p.data ?? []), ...(r.data ?? []), ...(c.data ?? [])]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const move = async (task: Task, dir: "fwd" | "bck") => {
    const col = toCol(task.status);
    const next = dir === "fwd" ? NEXT[col] : PREV[col];
    if (!next) return;
    setMoving(task.id);
    try {
      await fetch(`${API}/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      void load();
    } finally {
      setMoving(null);
    }
  };

  const openAdd = (col: ColumnId) => {
    setForm({ ...BLANK, status: col });
    setAddTo(col);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
          assignedToAgent: form.assignedToAgent.trim() || null,
          type: form.type,
          status: form.status,
        }),
      });
      setAddTo(null);
      void load();
    } finally {
      setSubmitting(false);
    }
  };

  const colTasks = (id: ColumnId) =>
    tasks.filter((t) => toCol(t.status) === id).sort((a, b) => b.priority - a.priority);

  const total = tasks.length;
  const done = tasks.filter((t) => toCol(t.status) === "completed").length;
  const inProd = tasks.filter((t) => toCol(t.status) === "running").length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono">
      {/* Top bar */}
      <div className="border-b border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            🏭 <span>Linha de Montagem Toyota</span>
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {total} tasks · {inProd} em produção · {done} entregues
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); void load(); }}
          className="text-xs text-slate-600 hover:text-slate-300 transition-colors px-3 py-1.5 border border-slate-800 rounded-lg"
        >
          ↺ Refresh
        </button>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-slate-600 text-sm">
          carregando linha de montagem...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 p-4 md:p-6 h-[calc(100vh-80px)]">
          {COLUMNS.map((col) => {
            const items = colTasks(col.id);
            return (
              <div
                key={col.id}
                className={`flex flex-col rounded-xl border ${col.border} ${col.bg} overflow-hidden`}
              >
                {/* Column header */}
                <div className={`${col.headerBg} px-4 py-3 flex items-center justify-between flex-shrink-0`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{col.icon}</span>
                      <span className="font-bold text-sm tracking-widest uppercase text-white">
                        {col.label}
                      </span>
                      <span className={`${col.badge} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                        {items.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{col.sub}</p>
                  </div>
                  <button
                    onClick={() => openAdd(col.id)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-base transition-colors flex-shrink-0"
                    title={`Adicionar task em ${col.label}`}
                  >
                    +
                  </button>
                </div>

                {/* Cards scroll area */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                  {items.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-slate-700 text-xs text-center px-4">{col.empty}</p>
                    </div>
                  )}

                  {items.map((task) => {
                    const isMoving = moving === task.id;
                    const p = prio(task.priority ?? 5);
                    const taskCol = toCol(task.status);
                    return (
                      <div
                        key={task.id}
                        className={`bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col gap-2 transition-all duration-200 ${
                          isMoving ? "opacity-30 scale-95" : "hover:border-slate-600"
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-100 leading-snug">
                            {task.title}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${p.cls}`}>
                            {p.text}
                          </span>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Tags row */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">
                            {task.type}
                          </span>
                          {task.assignedToAgent && (
                            <span className="text-[9px] text-amber-500 bg-amber-950/50 px-1.5 py-0.5 rounded">
                              → {task.assignedToAgent}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-700 ml-auto">#{task.id}</span>
                        </div>

                        {/* Action row */}
                        <div className="flex gap-1.5 pt-1 border-t border-slate-800">
                          {PREV[taskCol] && (
                            <button
                              disabled={isMoving}
                              onClick={() => void move(task, "bck")}
                              className="flex-1 text-[10px] py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              ← Voltar
                            </button>
                          )}
                          <button
                            disabled={isMoving}
                            onClick={() => void move(task, "fwd")}
                            className={`flex-1 text-[10px] py-1 rounded font-semibold transition-colors ${
                              taskCol === "completed"
                                ? "bg-slate-800 hover:bg-slate-700 text-slate-500"
                                : "bg-blue-900 hover:bg-blue-800 text-blue-100"
                            }`}
                          >
                            {taskCol === "completed" ? "↩ Reabrir" : "Avançar →"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add task modal */}
      {addTo !== null && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setAddTo(null); }}
        >
          <form
            onSubmit={(e) => { void submit(e); }}
            className="bg-slate-950 border border-slate-700 rounded-xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white text-sm">
                Nova Task em{" "}
                <span className="text-amber-400">
                  {COLUMNS.find((c) => c.id === addTo)?.label}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => setAddTo(null)}
                className="text-slate-500 hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <input
              autoFocus
              required
              placeholder="Título *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-600"
            />

            <textarea
              placeholder="Descrição (opcional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 resize-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wider">
                  Prioridade: {form.priority}
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wider">
                  Agente
                </label>
                <input
                  placeholder="isa / admin"
                  value={form.assignedToAgent}
                  onChange={(e) => setForm((f) => ({ ...f, assignedToAgent: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-600"
            >
              <option value="general">general</option>
              <option value="course_progress">course_progress</option>
              <option value="ai_query">ai_query</option>
              <option value="assembly_request">assembly_request</option>
              <option value="webhook_event">webhook_event</option>
              <option value="isa_suggestion">isa_suggestion</option>
            </select>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAddTo(null)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-sm text-white font-bold transition-colors disabled:opacity-40"
              >
                {submitting ? "Criando..." : "Criar Task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
