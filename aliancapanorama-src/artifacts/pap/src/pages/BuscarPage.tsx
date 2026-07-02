import { useState } from "react";
import { Search, Loader2, BookOpen, Brain } from "lucide-react";
import { EcosiaSearch } from "../components/EcosiaSearch";

const API = import.meta.env.VITE_API_URL ?? "";

interface BuscarResult {
  nos: { code: string; title: string; subtitle: string | null }[];
  memorias: { id: number; context: string; content: string; createdAt: string }[];
  total: number;
}

export function BuscarPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<BuscarResult | null>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/buscar?q=${encodeURIComponent(term)}`, { credentials: "include" });
      setResult(await r.json() as BuscarResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono p-6 md:p-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <div>
          <p className="text-xs text-emerald-400 tracking-widest uppercase mb-1">PAP · Sistema</p>
          <h1 className="text-2xl font-bold">/buscar</h1>
          <p className="text-xs text-white/40 mt-1">Busca em nós de conteúdo e memória ISA</p>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-white/15" style={{ background: "rgba(255,255,255,0.05)" }}>
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void doSearch(q); }}
              placeholder="ex: biologia, ISA ciclo, assembleia..."
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/25"
            />
          </div>
          <button
            onClick={() => void doSearch(q)}
            disabled={loading || !q.trim()}
            className="px-5 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-colors"
            style={{ background: "hsl(162 82% 42%)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
          </button>
        </div>

        {/* Resultados */}
        {result && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/30">{result.total} resultado{result.total !== 1 ? "s" : ""}</p>

            {result.nos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Nós de Conteúdo</p>
                </div>
                {result.nos.map((n) => (
                  <a
                    key={n.code}
                    href={`/no/${n.code}`}
                    className="flex flex-col px-3 py-2.5 rounded-lg border border-white/8 mb-1.5 hover:border-primary/40 transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <span className="text-xs text-primary/60 font-mono">{n.code}</span>
                    <span className="text-sm font-bold text-white">{n.title}</span>
                    {n.subtitle && <span className="text-xs text-white/40">{n.subtitle}</span>}
                  </a>
                ))}
              </section>
            )}

            {result.memorias.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-3.5 h-3.5 text-orange-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Memória ISA</p>
                </div>
                {result.memorias.map((m) => (
                  <div key={m.id} className="px-3 py-2.5 rounded-lg border border-white/8 mb-1.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex gap-2 mb-1">
                      <span className="text-[10px] text-orange-400/60">{m.context}</span>
                      <span className="text-[10px] text-white/25">{new Date(m.createdAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed line-clamp-3">{m.content}</p>
                  </div>
                ))}
              </section>
            )}

            {result.total === 0 && (
              <p className="text-sm text-white/30 text-center py-8">Nenhum resultado. Tente buscar no Ecosia:</p>
            )}
          </div>
        )}

        {/* Ecosia como complemento */}
        <EcosiaSearch
          dark
          keywords={q ? [q, `${q} FUVEST`, `${q} vestibular`] : ["busca de conteúdo FUVEST", "tópicos vestibular medicina", "PAP plataforma estudo"]}
          label={result?.total === 0 ? "Buscar no Ecosia" : "Buscar também no Ecosia"}
        />

        <a href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← voltar ao PAP</a>
      </div>
    </div>
  );
}
