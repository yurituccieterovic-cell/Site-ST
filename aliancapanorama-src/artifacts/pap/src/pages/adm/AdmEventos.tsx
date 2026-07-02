import { useState, useEffect } from "react";

interface Task {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  priority: number;
  assignedToAgent?: string | null;
  createdBy: string;
  origemSessao?: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#9CA3AF] text-white",
  running: "bg-[#3B82F6] text-white",
  completed: "bg-[#10B981] text-white",
  failed: "bg-[#EF4444] text-white",
  skipped: "bg-[#F97316] text-white",
};

const API = "/api";

export function AdmEventos() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", type: "general", priority: 5 });

  const fetchTasks = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (filterStatus) params.set("status", filterStatus);
    const r = await fetch(`${API}/tasks?${params}`);
    const data = await r.json() as { data: Task[]; total: number };
    setTasks(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [filterStatus]);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTasks();
  };

  const createTask = async () => {
    if (!newTask.title) return;
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, createdBy: "admin" }),
    });
    setNewTask({ title: "", description: "", type: "general", priority: 5 });
    setShowNew(false);
    fetchTasks();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Eventos / Tasks</h2>
          <p className="text-sm text-gray-500">{total} total</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm"
          >
            <option value="">Todos os status</option>
            {["pending", "running", "completed", "failed", "skipped"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          >
            + Nova Task
          </button>
        </div>
      </div>

      {showNew && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-medium mb-3">Nova Task</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="col-span-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Título *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              className="col-span-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Descrição"
              rows={2}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <select
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
            >
              {["general", "course_progress", "ai_query", "assembly_request", "isa_suggestion"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              max={10}
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Prioridade (0-10)"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={createTask}
              className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium"
            >
              Criar
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">#{task.id} {task.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status] ?? "bg-gray-100"}`}>
                      {task.status}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{task.type}</span>
                    <span className="text-xs text-gray-400">P{task.priority}</span>
                    {task.assignedToAgent && (
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                        {task.assignedToAgent}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-gray-500 truncate">{task.description}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {task.status === "pending" && (
                    <button
                      onClick={() => updateStatus(task.id, "running")}
                      className="px-2 py-1 bg-[#3B82F6] text-white text-xs rounded"
                    >
                      Iniciar
                    </button>
                  )}
                  {task.status === "running" && (
                    <button
                      onClick={() => updateStatus(task.id, "completed")}
                      className="px-2 py-1 bg-[#10B981] text-white text-xs rounded"
                    >
                      Concluir
                    </button>
                  )}
                  {(task.status === "pending" || task.status === "running") && (
                    <button
                      onClick={() => updateStatus(task.id, "skipped")}
                      className="px-2 py-1 bg-[#F97316] text-white text-xs rounded"
                    >
                      Pular
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">Nenhuma task encontrada</div>
          )}
        </div>
      )}
    </div>
  );
}
