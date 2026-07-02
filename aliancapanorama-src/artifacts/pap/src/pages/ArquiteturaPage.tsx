import { useQuery } from "@tanstack/react-query";
import { Loader2, Server, Database, Zap, Clock, LayoutGrid } from "lucide-react";
import { EcosiaSearch } from "../components/EcosiaSearch";

const API = import.meta.env.VITE_API_URL ?? "";

interface SistemaData {
  stack: Record<string, string>;
  tabelas: string[];
  rotas: Record<string, string[]>;
  jobs: { nome: string; cron: string; desc: string }[];
  contagens: Record<string, number>;
  versao: string;
}

export function ArquiteturaPage() {
  const { data, isLoading } = useQuery<SistemaData>({
    queryKey: ["arquitetura"],
    queryFn: async () => {
      const r = await fetch(`${API}/api/arquitetura`, { credentials: "include" });
      return r.json() as Promise<SistemaData>;
    },
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono p-6 md:p-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="text-xs text-emerald-400 tracking-widest uppercase mb-1">PAP · Sistema</p>
          <h1 className="text-2xl font-bold text-white">/arquitetura</h1>
          <p className="text-xs text-white/40 mt-1">{data?.versao ?? "carregando..."}</p>
        </div>

        {isLoading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/30" /></div>}

        {data && (
          <>
            {/* Contagens */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.contagens).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/10 p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <p className="text-xs text-white/40 mb-1">{k}</p>
                  <p className="text-2xl font-bold text-emerald-400">{v}</p>
                </div>
              ))}
            </div>

            {/* Stack */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400">Stack</h2>
              </div>
              <div className="flex flex-col gap-1">
                {Object.entries(data.stack).map(([k, v]) => (
                  <div key={k} className="flex gap-3 text-xs border-b border-white/5 py-1.5">
                    <span className="text-white/40 w-20 shrink-0">{k}</span>
                    <span className="text-white/80">{v}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Tabelas */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400">Tabelas PostgreSQL</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.tabelas.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded border border-purple-400/20 text-purple-300" style={{ background: "rgba(168,85,247,0.07)" }}>{t}</span>
                ))}
              </div>
            </section>

            {/* Rotas */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Rotas API</h2>
              </div>
              {Object.entries(data.rotas).map(([grupo, rotas]) => (
                <div key={grupo} className="mb-3">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{grupo}</p>
                  <div className="flex flex-col gap-0.5">
                    {rotas.map((r) => (
                      <span key={r} className="text-xs text-cyan-200/70 font-mono">{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Jobs autônomos */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-orange-400">Jobs Autônomos (ISA)</h2>
              </div>
              {data.jobs.map((j) => (
                <div key={j.nome} className="flex gap-4 text-xs border-b border-white/5 py-2">
                  <span className="text-orange-300 font-bold shrink-0">{j.cron}</span>
                  <div>
                    <p className="text-white/80 font-bold">{j.nome}</p>
                    <p className="text-white/40">{j.desc}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Ecosia */}
            <EcosiaSearch dark keywords={["Express.js Railway deploy", "Drizzle ORM PostgreSQL", "React Vite Vercel", "node-cron autonomous jobs", "bcrypt express-session"]} label="Aprofundar arquitetura no Ecosia" />
          </>
        )}

        <a href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← voltar ao PAP</a>
      </div>
    </div>
  );
}
