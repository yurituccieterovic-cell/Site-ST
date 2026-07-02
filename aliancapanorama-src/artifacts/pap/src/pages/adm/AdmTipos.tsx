import { useState, useEffect } from "react";

interface EventType {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

const API = "/api";

const PRESET_COLORS = ["#F97316", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#6B7280", "#EF4444"];

export function AdmTipos() {
  const [types, setTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#F97316", icon: "" });

  const fetchTypes = async () => {
    setLoading(true);
    const r = await fetch(`${API}/tasks/event-types`);
    const data = await r.json() as EventType[];
    setTypes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTypes(); }, []);

  const createType = async () => {
    if (!form.name) return;
    await fetch(`${API}/tasks/event-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", description: "", color: "#F97316", icon: "" });
    setShowNew(false);
    fetchTypes();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Tipos de Evento</h2>
          <p className="text-sm text-gray-500">{types.length} tipos registrados</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-orange-600"
        >
          + Novo Tipo
        </button>
      </div>

      {showNew && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-6 shadow-sm">
          <h3 className="font-medium mb-3">Novo Tipo de Evento</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Nome *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Ícone (emoji)"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
            <input
              className="col-span-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Descrição"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-2">Cor</p>
              <div className="flex gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={createType} className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm">
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {types.map((type) => (
            <div
              key={type.id}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                {type.icon && <span className="text-xl">{type.icon}</span>}
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: type.color ?? "#9CA3AF" }}
                />
                <span className="font-medium text-sm">{type.name}</span>
              </div>
              {type.description && (
                <p className="text-xs text-gray-500">{type.description}</p>
              )}
            </div>
          ))}
          {types.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              Nenhum tipo registrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}
