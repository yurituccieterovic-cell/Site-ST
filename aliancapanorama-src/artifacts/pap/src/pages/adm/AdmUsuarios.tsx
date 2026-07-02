import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus, Trash2, Edit2, Check, X } from "lucide-react";
import { EcosiaSearch } from "../../components/EcosiaSearch";

const API = import.meta.env.VITE_API_URL ?? "";

interface UserRow {
  id: number;
  login: string;
  tier: number;
  displayName: string | null;
  userCode: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
}

const TIER_LABELS = ["Visitante", "Aluno I", "Aluno II", "Aluno III", "Aluno IV", "Dev/Admin"];
const TIER_COLORS = ["text-gray-400", "text-blue-500", "text-cyan-500", "text-yellow-500", "text-orange-500", "text-red-500"];

async function apiFetch(path: string, opts?: RequestInit) {
  const r = await fetch(`${API}${path}`, { credentials: "include", ...opts });
  if (!r.ok) {
    const d = await r.json() as { error?: string };
    throw new Error(d.error ?? `HTTP ${r.status}`);
  }
  return r.json();
}

export function AdmUsuarios() {
  const qc = useQueryClient();
  const [newForm, setNewForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ login: "", password: "", tier: 1, displayName: "" });
  const [editForm, setEditForm] = useState({ tier: 0, displayName: "", password: "" });
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch("/api/admin/users") as Promise<{ users: UserRow[] }>,
  });

  const createUser = useMutation({
    mutationFn: () =>
      apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin-users"] }); setNewForm(false); setForm({ login: "", password: "", tier: 1, displayName: "" }); setError(""); },
    onError: (e: Error) => setError(e.message),
  });

  const updateUser = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: editForm.tier,
          ...(editForm.displayName ? { displayName: editForm.displayName } : {}),
          ...(editForm.password ? { password: editForm.password } : {}),
        }),
      }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin-users"] }); setEditId(null); },
    onError: (e: Error) => setError(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Usuários</h2>
        <button
          onClick={() => { setNewForm(true); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Novo usuário
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Formulário novo usuário */}
      {newForm && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-orange-800 mb-4">Novo usuário</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Login*</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} placeholder="login" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Senha*</label>
              <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nome</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Nome para exibição" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tier</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.tier} onChange={(e) => setForm({ ...form, tier: parseInt(e.target.value) })}>
                {TIER_LABELS.map((l, i) => <option key={i} value={i}>{i} — {l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { void createUser.mutate(); }} disabled={createUser.isPending} className="flex items-center gap-1 px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50">
              {createUser.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Criar
            </button>
            <button onClick={() => { setNewForm(false); setError(""); }} className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
              <X className="w-3 h-3" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Login</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Criado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.users?.map((u) =>
                editId === u.id ? (
                  <tr key={u.id} className="bg-orange-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{u.login}</td>
                    <td className="px-4 py-3">
                      <input className="border border-gray-200 rounded px-2 py-1 text-sm w-full" value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} placeholder="Nome" />
                    </td>
                    <td className="px-4 py-3">
                      <select className="border border-gray-200 rounded px-2 py-1 text-sm" value={editForm.tier} onChange={(e) => setEditForm({ ...editForm, tier: parseInt(e.target.value) })}>
                        {TIER_LABELS.map((l, i) => <option key={i} value={i}>{i} — {l}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="password" className="border border-gray-200 rounded px-2 py-1 text-sm w-28" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Nova senha" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => void updateUser.mutate(u.id)} className="text-emerald-600 hover:text-emerald-700"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{u.login}</td>
                    <td className="px-4 py-3 text-gray-500">{u.displayName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${TIER_COLORS[u.tier] ?? ""}`}>{u.tier} — {TIER_LABELS[u.tier] ?? "?"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setEditId(u.id); setEditForm({ tier: u.tier, displayName: u.displayName ?? "", password: "" }); setError(""); }} className="text-gray-400 hover:text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm(`Excluir ${u.login}?`)) void deleteUser.mutate(u.id); }} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )
              )}
              {!data?.users?.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Nenhum usuário cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <EcosiaSearch
          dark={false}
          compact
          label="Gestão de usuários"
          keywords={["autenticação JWT bcrypt", "sistema de tiers acesso", "RBAC plataforma educacional", "gestão usuários plataforma"]}
        />
      </div>
    </div>
  );
}
