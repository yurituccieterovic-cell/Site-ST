import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ChevronDown, ChevronRight, FileText } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

interface Sessao {
  titulo: string;
  data: string;
  linhas: string[];
  isAta: boolean;
}

function parseSessoes(text: string): Sessao[] {
  const lines = text.split("\n");
  const sessoes: Sessao[] = [];
  let current: Sessao | null = null;

  for (const line of lines) {
    if (line.startsWith("### ")) {
      if (current) sessoes.push(current);
      const header = line.slice(4).trim();
      const match = header.match(/^(\d{4}-\d{2}-\d{2}[T\d:]*)\s*[—-]\s*(.+)$/);
      const isAta = header.toLowerCase().includes("ata") || header.toLowerCase().includes("cláudio");
      current = {
        titulo: match ? match[2].trim() : header,
        data: match ? match[1] : "",
        linhas: [],
        isAta,
      };
    } else if (current && line.trim()) {
      current.linhas.push(line);
    }
  }
  if (current) sessoes.push(current);
  return sessoes.reverse();
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function SessaoCard({ s }: { s: Sessao }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden ${s.isAta ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/60 transition-colors"
      >
        <span className="mt-0.5 flex-shrink-0">
          {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {s.isAta && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                <FileText size={10} /> ATA
              </span>
            )}
            <span className={`text-sm font-medium ${s.isAta ? "text-orange-800" : "text-gray-800"}`}>
              {s.titulo}
            </span>
          </div>
          {s.data && (
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(s.data)}</p>
          )}
          {!open && s.linhas.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 truncate">{s.linhas[0]}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{s.linhas.length} linhas</span>
      </button>
      {open && s.linhas.length > 0 && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3 text-xs text-gray-700 space-y-1 font-mono bg-white rounded-lg p-3 border border-gray-100">
            {s.linhas.map((l, i) => (
              <div key={i} className={l.startsWith("-") ? "pl-2" : l.startsWith("#") ? "font-semibold text-gray-900" : ""}>
                {l}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdmAtas() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filtroAta, setFiltroAta] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true); setError("");
    try {
      const r = await fetch(`${API}/api/conector/memory/section?name=conversas`);
      if (!r.ok) { setError("Seção 'conversas' não encontrada no Conector."); setLoading(false); setRefreshing(false); return; }
      const d = await r.json() as { content: string };
      setSessoes(parseSessoes(d.content ?? ""));
    } catch { setError("Sem conexão com o servidor."); }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visíveis = filtroAta ? sessoes.filter(s => s.isAta) : sessoes;
  const nAtas = sessoes.filter(s => s.isAta).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-orange-500" size={20} />
            ATAs e Sessões
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {sessoes.length} entradas · {nAtas} ATAs · fonte: Conector /conversas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filtroAta}
              onChange={e => setFiltroAta(e.target.checked)}
              className="rounded"
            />
            Só ATAs
          </label>
          <button onClick={() => { void load(); }} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : visíveis.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhuma entrada encontrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visíveis.map((s, i) => <SessaoCard key={i} s={s} />)}
        </div>
      )}
    </div>
  );
}
