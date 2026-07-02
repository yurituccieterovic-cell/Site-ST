import { useState, useEffect } from "react";

interface Relation {
  id: number;
  taskId: number;
  relatedTaskId: number;
  relationType: string;
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
}

const API = "/api";

const RELATION_TYPES = ["depends_on", "blocks", "related_to", "duplicates", "child_of"];

export function AdmRelacoes() {
  const [relations, setRelations] = useState<Relation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ taskId: "", relatedTaskId: "", relationType: "depends_on" });
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const fetchTasks = async () => {
    const r = await fetch(`${API}/tasks?limit=100`);
    const data = await r.json() as { data: Task[] };
    setTasks(data.data ?? []);
    setLoading(false);
  };

  const fetchRelations = async (taskId: number) => {
    setLoading(true);
    const r = await fetch(`${API}/tasks/${taskId}/relations`);
    const data = await r.json() as Relation[];
    setRelations(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  useEffect(() => {
    if (selectedTaskId) fetchRelations(selectedTaskId);
    else setRelations([]);
  }, [selectedTaskId]);

  const createRelation = async () => {
    if (!form.taskId || !form.relatedTaskId) return;
    await fetch(`${API}/tasks/${form.taskId}/relations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relatedTaskId: parseInt(form.relatedTaskId), relationType: form.relationType }),
    });
    setShowNew(false);
    setForm({ taskId: "", relatedTaskId: "", relationType: "depends_on" });
    if (selectedTaskId) fetchRelations(selectedTaskId);
  };

  const taskTitle = (id: number) => tasks.find((t) => t.id === id)?.title ?? `#${id}`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Relações entre Tasks</h2>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-orange-600"
        >
          + Nova Relação
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm min-w-48"
          value={selectedTaskId ?? ""}
          onChange={(e) => setSelectedTaskId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Filtrar por task...</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>#{t.id} {t.title}</option>
          ))}
        </select>
        {selectedTaskId && (
          <button
            onClick={() => setSelectedTaskId(null)}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
          >
            Limpar
          </button>
        )}
      </div>

      {showNew && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-medium mb-3">Nova Relação</h3>
          <div className="grid grid-cols-3 gap-3">
            <select
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              value={form.taskId}
              onChange={(e) => setForm({ ...form, taskId: e.target.value })}
            >
              <option value="">Task origem *</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>#{t.id} {t.title.slice(0, 30)}</option>
              ))}
            </select>
            <select
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              value={form.relationType}
              onChange={(e) => setForm({ ...form, relationType: e.target.value })}
            >
              {RELATION_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              value={form.relatedTaskId}
              onChange={(e) => setForm({ ...form, relatedTaskId: e.target.value })}
            >
              <option value="">Task destino *</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>#{t.id} {t.title.slice(0, 30)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={createRelation} className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm">
              Criar
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {!selectedTaskId && (
            <div className="text-center py-12 text-gray-400">Selecione uma task para ver suas relações</div>
          )}
          {selectedTaskId && relations.length === 0 && (
            <div className="text-center py-12 text-gray-400">Nenhuma relação encontrada para esta task</div>
          )}
          {relations.map((rel) => (
            <div
              key={rel.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex items-center gap-4"
            >
              <span className="text-sm font-medium text-gray-700">
                #{rel.taskId} {taskTitle(rel.taskId)}
              </span>
              <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-mono">
                {rel.relationType}
              </span>
              <span className="text-sm font-medium text-gray-700">
                #{rel.relatedTaskId} {taskTitle(rel.relatedTaskId)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
