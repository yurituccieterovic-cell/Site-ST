import { useState, useEffect } from "react";

interface CatalogEntry {
  id: string;
  tipo: string;
  titulo: string;
  descricao?: string | null;
  tags?: string[] | null;
  reutilizavel: boolean;
  acesso: string;
  sessaoOrigem?: string | null;
  createdAt: string;
}

const API = "/api";

const TIPOS = ["código", "prompt", "conteúdo", "certificado", "recurso", "integração", "política", "comunidade"];
const TIPO_COLORS: Record<string, string> = {
  "código": "bg-blue-50 text-blue-700",
  "prompt": "bg-purple-50 text-purple-700",
  "conteúdo": "bg-green-50 text-green-700",
  "certificado": "bg-yellow-50 text-yellow-700",
  "recurso": "bg-orange-50 text-orange-700",
  "integração": "bg-teal-50 text-teal-700",
  "política": "bg-red-50 text-red-700",
  "comunidade": "bg-pink-50 text-pink-700",
};

export function AdmCatalogos() {
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    tipo: "código",
    titulo: "",
    descricao: "",
    tags: "",
    reutilizavel: true,
    acesso: "admin",
  });

  const fetchEntries = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (filterTipo) params.set("tipo", filterTipo);
    const r = await fetch(`${API}/catalog?${params}`);
    const data = await r.json() as { data: CatalogEntry[] };
    setEntries(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [filterTipo]);

  const createEntry = async () => {
    if (!form.titulo) return;
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    await fetch(`${API}/catalog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags }),
    });
    setForm({ tipo: "código", titulo: "", descricao: "", tags: "", reutilizavel: true, acesso: "admin" });
    setShowNew(false);
    fetchEntries();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Catálogo Central</h2>
          <p className="text-sm text-gray-500">{entries.length} entradas</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm"
          >
            <option value="">Todos os tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-orange-600"
          >
            + Nova Entrada
          </button>
        </div>
      </div>

      {showNew && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-medium mb-3">Nova Entrada no Catálogo</h3>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              value={form.acesso}
              onChange={(e) => setForm({ ...form, acesso: e.target.value })}
            >
              {["admin", "premium", "public"].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <input
              className="col-span-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Título *"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
            <textarea
              className="col-span-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Descrição"
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
            <input
              className="col-span-2 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              placeholder="Tags (separadas por vírgula)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm col-span-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.reutilizavel}
                onChange={(e) => setForm({ ...form, reutilizavel: e.target.checked })}
              />
              Reutilizável
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={createEntry} className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm">
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${TIPO_COLORS[entry.tipo] ?? "bg-gray-100"}`}
                >
                  {entry.tipo}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1">{entry.titulo}</p>
                  {entry.descricao && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{entry.descricao}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {entry.tags?.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {entry.acesso}
                    </span>
                    {entry.reutilizavel && (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                        reutilizável
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              Nenhuma entrada no catálogo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
