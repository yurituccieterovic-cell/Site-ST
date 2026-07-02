import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Edit2, Check, X, BookOpen, Star, Zap } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

interface NebulaIa {
  id: number; name: string; description: string | null;
  capabilities: string[]; tier: number; status: string;
  origem: string; principios: string[]; createdAt: string;
}
interface BibliotecaDoc {
  id: number; titulo: string; url: string | null; tipo: string;
  origem: string; tamanhoBytes: number | null; resumo: string | null;
  tags: string[]; createdAt: string;
}
interface Aulia {
  id: number; titulo: string; descricao: string | null;
  publico: string; conteudo: string | null; ordem: number; ativa: boolean; createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  ativa: "text-emerald-600 bg-emerald-50",
  em_treinamento: "text-blue-600 bg-blue-50",
  aposentada: "text-gray-500 bg-gray-100",
  em_pausa: "text-orange-600 bg-orange-50",
};

async function apiFetch(path: string, opts?: RequestInit) {
  const r = await fetch(`${API}${path}`, { credentials: "include", ...opts });
  if (!r.ok) { const d = await r.json() as { error?: string }; throw new Error(d.error ?? `HTTP ${r.status}`); }
  return r.json();
}

type NebulaTab = "ias" | "biblioteca" | "aulias";

export function AdmNebula() {
  const [tab, setTab] = useState<NebulaTab>("ias");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🌌</span>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Nebula's House</h2>
          <p className="text-xs text-gray-400">Escola de IAs · Biblioteca · Aulias</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {([
          { id: "ias", label: "IAs da Escola", icon: "🤖" },
          { id: "biblioteca", label: "Biblioteca", icon: "📖" },
          { id: "aulias", label: "Aulias", icon: "🎓" },
        ] as { id: NebulaTab; label: string; icon: string }[]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === "ias" && <IasView />}
      {tab === "biblioteca" && <BibliotecaView />}
      {tab === "aulias" && <AuliasView />}
    </div>
  );
}

/* ─── IAs View ─────────────────────────────────────────────────────────────── */
function IasView() {
  const qc = useQueryClient();
  const [newForm, setNewForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", tier: 0, status: "ativa", capabilities: "", principios: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["nebula-ias"],
    queryFn: () => apiFetch("/api/nebula/ias") as Promise<{ ias: NebulaIa[] }>,
  });

  const create = useMutation({
    mutationFn: () => apiFetch("/api/nebula/ias", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        capabilities: form.capabilities.split(",").map((s) => s.trim()).filter(Boolean),
        principios: form.principios.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["nebula-ias"] }); setNewForm(false); },
  });

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/nebula/ias/${id}`, { method: "DELETE" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["nebula-ias"] }),
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setNewForm(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" /> Nova IA
        </button>
      </div>

      {newForm && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-purple-800 mb-4">Registrar nova IA na escola</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">Nome*</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Luna, Gemini, Grok" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Status</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ativa">Ativa</option>
                <option value="em_treinamento">Em treinamento</option>
                <option value="em_pausa">Em pausa</option>
                <option value="aposentada">Aposentada</option>
              </select></div>
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Descrição</label>
              <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="O que essa IA faz?" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Capacidades (vírgula)</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.capabilities} onChange={(e) => setForm({ ...form, capabilities: e.target.value })} placeholder="chat, análise, código" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Princípios (vírgula)</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.principios} onChange={(e) => setForm({ ...form, principios: e.target.value })} placeholder="nao_dominancia, cooperacao" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => void create.mutate()} disabled={create.isPending} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50">
              {create.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Registrar
            </button>
            <button onClick={() => setNewForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div> : (
        <div className="grid gap-3">
          {data?.ias?.map((ia) => (
            <div key={ia.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">🤖</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{ia.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ia.status] ?? "text-gray-500 bg-gray-100"}`}>{ia.status.replace("_", " ")}</span>
                  <span className="text-xs text-gray-400">tier {ia.tier}</span>
                </div>
                {ia.description && <p className="text-sm text-gray-500 mt-0.5">{ia.description}</p>}
                {ia.capabilities.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {ia.capabilities.map((c) => (
                      <span key={c} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => { if (confirm(`Remover ${ia.name}?`)) void del.mutate(ia.id); }} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {!data?.ias?.length && <p className="text-center text-gray-400 py-8 text-sm">Nenhuma IA registrada ainda</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Biblioteca View ────────────────────────────────────────────────────────── */
function BibliotecaView() {
  const qc = useQueryClient();
  const [newForm, setNewForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", url: "", tipo: "pdf", resumo: "", tags: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["nebula-biblioteca"],
    queryFn: () => apiFetch("/api/nebula/biblioteca") as Promise<{ docs: BibliotecaDoc[] }>,
  });

  const create = useMutation({
    mutationFn: () => apiFetch("/api/nebula/biblioteca", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean) }),
    }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["nebula-biblioteca"] }); setNewForm(false); },
  });

  const del = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/nebula/biblioteca/${id}`, { method: "DELETE" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["nebula-biblioteca"] }),
  });

  const TYPE_ICONS: Record<string, string> = { pdf: "📄", html: "🌐", txt: "📝", epub: "📚" };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">Documentos baixados pelo ISA Bibliotecário e adicionados manualmente</p>
        <button onClick={() => setNewForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {newForm && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Título*</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Nome do documento" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">URL</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Tipo</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="pdf">PDF</option><option value="html">HTML</option><option value="txt">TXT</option><option value="epub">EPUB</option>
              </select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Tags (vírgula)</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="assembleia, ética, IA" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Resumo</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.resumo} onChange={(e) => setForm({ ...form, resumo: e.target.value })} placeholder="Breve descrição" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => void create.mutate()} disabled={create.isPending} className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50">
              {create.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Adicionar
            </button>
            <button onClick={() => setNewForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"><X className="w-3 h-3" /></button>
          </div>
        </div>
      )}

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Documento</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Origem</th>
              <th className="px-4 py-3" />
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data?.docs?.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{TYPE_ICONS[doc.tipo] ?? "📄"}</span>
                      <div>
                        <div className="font-medium text-gray-800">{doc.titulo}</div>
                        {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-xs">{doc.url}</a>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {doc.tags.map((t) => <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{doc.origem}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { if (confirm("Remover?")) void del.mutate(doc.id); }} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {!data?.docs?.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Biblioteca vazia — ISA Bibliotecário popula automaticamente a cada hora</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Aulias View ────────────────────────────────────────────────────────────── */
function AuliasView() {
  const qc = useQueryClient();
  const [newForm, setNewForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ titulo: "", descricao: "", publico: "ias", conteudo: "", ordem: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["nebula-aulias"],
    queryFn: () => apiFetch("/api/nebula/aulias") as Promise<{ aulias: Aulia[] }>,
  });

  const create = useMutation({
    mutationFn: () => apiFetch("/api/nebula/aulias", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["nebula-aulias"] }); setNewForm(false); },
  });

  const toggle = useMutation({
    mutationFn: ({ id, ativa }: { id: number; ativa: boolean }) =>
      apiFetch(`/api/nebula/aulias/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ativa }) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["nebula-aulias"] }),
  });

  const PUBLICO_LABELS: Record<string, string> = { ias: "🤖 IAs", alunos: "🧑‍🎓 Alunos", todos: "🌍 Todos" };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setNewForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Nova Aulia
        </button>
      </div>

      {newForm && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-500 mb-1">Título*</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título da aula" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Público</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.publico} onChange={(e) => setForm({ ...form, publico: e.target.value })}>
                <option value="ias">IAs</option><option value="alunos">Alunos</option><option value="todos">Todos</option>
              </select></div>
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Descrição</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="O que esta aula ensina?" /></div>
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Conteúdo (markdown)</label>
              <textarea rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono" value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} placeholder="# Aula&#10;&#10;Conteúdo em markdown..." /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Ordem</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => void create.mutate()} disabled={create.isPending} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
              {create.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Criar
            </button>
            <button onClick={() => setNewForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"><X className="w-3 h-3" /></button>
          </div>
        </div>
      )}

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div> : (
        <div className="grid gap-3">
          {data?.aulias?.map((a) => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">🎓</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{a.titulo}</div>
                  <div className="text-xs text-gray-400 flex gap-2 mt-0.5">
                    <span>{PUBLICO_LABELS[a.publico] ?? a.publico}</span>
                    <span>· ordem {a.ordem}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.conteudo && (
                    <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className="text-xs text-blue-500 hover:underline">
                      {expandedId === a.id ? "fechar" : "ver conteúdo"}
                    </button>
                  )}
                  <button onClick={() => void toggle.mutate({ id: a.id, ativa: !a.ativa })}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${a.ativa ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                    {a.ativa ? "ativa" : "inativa"}
                  </button>
                </div>
              </div>
              {expandedId === a.id && a.conteudo && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{a.conteudo}</pre>
                </div>
              )}
            </div>
          ))}
          {!data?.aulias?.length && <p className="text-center text-gray-400 py-8 text-sm">Nenhuma aulia criada ainda</p>}
        </div>
      )}
    </div>
  );
}
