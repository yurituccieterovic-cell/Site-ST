import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

type Item = {
  id: number; nome: string; categoria: string; quantidade: string | null;
  status: string; recorrente: boolean; carrinho: string | null; notas: string | null;
  criado_por: string | null; preco_ref: string | null;
  created_at: string; comprado_em: string | null;
};

const CATEGORIAS_PAD = ["geral", "alimentos", "limpeza", "higiene", "pet", "farmácia", "papelaria", "eletrônicos", "casa", "roupa"];

function badge(status: string) {
  if (status === "comprado") return "✅";
  if (status === "cancelado") return "🗑️";
  return "🛒";
}

export default function ColesterolPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [meta, setMeta] = useState<{ carrinhos: string[]; categorias: string[] }>({ carrinhos: [], categorias: [] });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Filtros
  const [filterStatus, setFilterStatus] = useState<"pendente" | "comprado" | "">("pendente");
  const [filterCat, setFilterCat] = useState("");
  const [filterCarrinho, setFilterCarrinho] = useState("");

  // Formulário novo item
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", categoria: "geral", quantidade: "1", carrinho: "geral", recorrente: false, notas: "", preco_ref: "" });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  // Ação em item
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterCat) params.set("categoria", filterCat);
      if (filterCarrinho) params.set("carrinho", filterCarrinho);
      const r = await fetch(`${API}/api/colesterol/items?${params}`, { credentials: "include" });
      if (r.status === 401) { setAuthError(true); setLoading(false); return; }
      const d = await r.json() as { items: Item[] };
      setItems(d.items ?? []);
      setAuthError(false);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filterStatus, filterCat, filterCarrinho]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    fetch(`${API}/api/colesterol/meta`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMeta(d as typeof meta); })
      .catch(() => {});
  }, [items.length]);

  async function addItem() {
    if (!form.nome.trim()) { setFormErr("Nome obrigatório"); return; }
    setSaving(true); setFormErr("");
    try {
      const r = await fetch(`${API}/api/colesterol/items`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, preco_ref: form.preco_ref ? parseFloat(form.preco_ref) : null }),
      });
      if (r.ok) {
        setForm({ nome: "", categoria: "geral", quantidade: "1", carrinho: "geral", recorrente: false, notas: "", preco_ref: "" });
        setShowForm(false);
        await load();
      } else {
        const d = await r.json() as { error?: string };
        setFormErr(d.error ?? "Erro ao adicionar");
      }
    } catch { setFormErr("Sem conexão"); }
    setSaving(false);
  }

  async function toggle(item: Item) {
    setUpdating(item.id);
    const newStatus = item.status === "comprado" ? "pendente" : "comprado";
    try {
      await fetch(`${API}/api/colesterol/items/${item.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
    } catch { /* ignore */ }
    setUpdating(null);
  }

  async function remove(id: number) {
    setUpdating(id);
    try {
      await fetch(`${API}/api/colesterol/items/${id}`, { method: "DELETE", credentials: "include" });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch { /* ignore */ }
    setUpdating(null);
  }

  if (authError) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white font-sans p-8 text-center">
      <div>
        <div className="text-5xl mb-4">🫀</div>
        <h1 className="text-xl font-bold mb-2">Colesterol</h1>
        <p className="text-gray-400 mb-4">Lista de compras — Yuri & Mayumi</p>
        <p className="text-sm text-orange-400">Faça login no <a href="/aliancapanorama/rapadura" className="underline">Rapadura</a> primeiro.</p>
      </div>
    </div>
  );

  const pendentes = items.filter(i => i.status === "pendente").length;
  const comprados = items.filter(i => i.status === "comprado").length;

  const todosCarrinhos = Array.from(new Set(["geral", ...meta.carrinhos]));
  const todasCats = Array.from(new Set([...CATEGORIAS_PAD, ...meta.categorias]));

  const chip = (active: boolean) =>
    `px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${active ? "bg-orange-500 border-orange-500 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500"}`;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">🫀 Colesterol</h1>
            <p className="text-xs text-gray-500">{pendentes} pendentes · {comprados} comprados</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
            + Item
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Formulário novo item */}
        {showForm && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 space-y-3">
            <h2 className="font-semibold text-sm text-gray-300">Novo item</h2>
            <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Nome do item*" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Categoria</label>
                <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {todasCats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Quantidade</label>
                <input value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))}
                  placeholder="ex: 2 kg, 1 cx" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Carrinho</label>
                <input value={form.carrinho} onChange={e => setForm(f => ({ ...f, carrinho: e.target.value }))}
                  placeholder="ex: geral, churrasco" list="carrinhos-list"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                <datalist id="carrinhos-list">{todosCarrinhos.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Preço ref. (R$)</label>
                <input type="number" step="0.01" value={form.preco_ref} onChange={e => setForm(f => ({ ...f, preco_ref: e.target.value }))}
                  placeholder="0,00" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <input value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              placeholder="Notas (opcional)" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none" />
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input type="checkbox" checked={form.recorrente} onChange={e => setForm(f => ({ ...f, recorrente: e.target.checked }))}
                className="rounded" />
              Item recorrente
            </label>
            {formErr && <p className="text-red-400 text-xs">{formErr}</p>}
            <div className="flex gap-2">
              <button onClick={addItem} disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-xl transition-colors">
                {saving ? "Salvando…" : "Adicionar"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterStatus("pendente")} className={chip(filterStatus === "pendente")}>🛒 Pendentes</button>
            <button onClick={() => setFilterStatus("comprado")} className={chip(filterStatus === "comprado")}>✅ Comprados</button>
            <button onClick={() => setFilterStatus("")} className={chip(filterStatus === "")}>Todos</button>
          </div>
          {todosCarrinhos.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFilterCarrinho("")} className={chip(!filterCarrinho)}>Todos carrinhos</button>
              {todosCarrinhos.map(c => (
                <button key={c} onClick={() => setFilterCarrinho(c === filterCarrinho ? "" : c)} className={chip(filterCarrinho === c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center text-gray-500 py-8 text-sm">Carregando…</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            {filterStatus === "pendente" ? "Tudo comprado! 🎉" : "Nenhum item encontrado."}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id}
                className={`bg-gray-900 rounded-xl border px-4 py-3 flex items-center gap-3 transition-opacity ${item.status === "comprado" ? "opacity-60 border-gray-800" : "border-gray-800 hover:border-gray-700"}`}>
                {/* Toggle */}
                <button onClick={() => toggle(item)} disabled={updating === item.id}
                  className="text-xl shrink-0 hover:scale-110 transition-transform disabled:opacity-50">
                  {updating === item.id ? "⏳" : badge(item.status)}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${item.status === "comprado" ? "line-through text-gray-500" : "text-white"}`}>
                    {item.nome}
                    {item.recorrente && <span className="ml-1 text-xs text-blue-400">↻</span>}
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-1 mt-0.5">
                    {item.quantidade && item.quantidade !== "1" && <span>{item.quantidade}</span>}
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded">{item.categoria}</span>
                    {item.carrinho && item.carrinho !== "geral" && <span className="bg-gray-800 px-1.5 py-0.5 rounded">🛒 {item.carrinho}</span>}
                    {item.preco_ref && <span className="text-green-400">R$ {parseFloat(item.preco_ref).toFixed(2)}</span>}
                    {item.criado_por && <span className="text-gray-600">{item.criado_por}</span>}
                  </div>
                  {item.notas && <p className="text-xs text-gray-600 mt-1 italic">{item.notas}</p>}
                </div>

                {/* Excluir */}
                <button onClick={() => remove(item.id)} disabled={updating === item.id}
                  className="text-gray-600 hover:text-red-400 text-sm disabled:opacity-30 shrink-0">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Total comprados com preço */}
        {filterStatus === "comprado" && items.some(i => i.preco_ref) && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-3 text-sm text-right">
            <span className="text-gray-400">Total compras com preço: </span>
            <span className="font-bold text-green-400">
              R$ {items.filter(i => i.preco_ref).reduce((acc, i) => acc + parseFloat(i.preco_ref ?? "0"), 0).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
