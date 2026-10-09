import { useState, useEffect, useCallback } from "react";
import { RefreshCw, CheckCircle2, GitCommit, Zap } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";
const GITHUB_REPO = "yurituccieterovic-cell/Site-ST";

const PASSOS = [
  { n: 1, emoji: "📥", label: "Extrair", desc: "Gmail: assembleias + docs novos. Script sync-assembleias.py" },
  { n: 2, emoji: "📚", label: "Aprendizados", desc: "APRENDIZADO.md — formato | #NNN | categoria | descrição |" },
  { n: 3, emoji: "💡", label: "Ideias", desc: "IDEIAS.md — ### I[N]: título, prioridade, complexidade" },
  { n: 4, emoji: "🗺️", label: "MAPA", desc: "MAPA-PENDENCIAS.md — schema DB, rotas API, pendências, gotchas" },
  { n: 5, emoji: "📝", label: "PSEUDO", desc: "PSEUDO.md — decisões, debates, tensões, contexto de Yuri" },
  { n: 6, emoji: "⚙️", label: "Código", desc: "aliancapanorama-src/ — implementar o que foi decidido" },
  { n: 7, emoji: "📐", label: "PSEUDO2", desc: "PSEUDO2.md — pseudocódigo APÓS implementação (só se lógica mudou)" },
  { n: 8, emoji: "🚀", label: "Deploy", desc: "git push → Render auto-deploya. Migrations via bootstrap ou psql" },
  { n: 9, emoji: "📡", label: "Registros", desc: "ATA em /tmp/pap-ata.md → Conector → collective_memory" },
];

interface Commit {
  sha: string;
  message: string;
  date: string;
  author: string;
}

interface HealthStatus {
  status: string;
  db?: string;
  uptime?: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export function AdmPipeline() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [hRes, cRes] = await Promise.allSettled([
        fetch(`${API}/api/healthz`).then(r => r.json() as Promise<HealthStatus>),
        fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=8`)
          .then(r => r.json() as Promise<{ sha: string; commit: { message: string; committer: { date: string }; author: { name: string } } }[]>),
      ]);
      if (hRes.status === "fulfilled") setHealth(hRes.value);
      if (cRes.status === "fulfilled" && Array.isArray(cRes.value)) {
        setCommits(cRes.value.map(c => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message.split("\n")[0],
          date: c.commit.committer.date,
          author: c.commit.author.name,
        })));
      }
    } catch { /* ignore */ }
    setLoading(false);
    setRefreshing(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => { void load(); }, [load]);

  const isOk = health?.status === "ok" && (health?.db === "ok" || !health?.db);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="text-orange-500" size={20} />
            Pipeline #processo
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            9 passos · última atualização {timeAgo(lastRefresh.toISOString())}
          </p>
        </div>
        <button onClick={() => { void load(); }}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda: 9 passos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Passos do pipeline</span>
            </div>
            <div className="divide-y divide-gray-100">
              {PASSOS.map((p) => (
                <div key={p.n} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center text-xs font-bold text-orange-600 mt-0.5">
                    {p.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{p.emoji}</span>
                      <span className="font-semibold text-sm text-gray-800">{p.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 bg-blue-50 border-t border-blue-100">
              <p className="text-xs text-blue-600">
                <strong>Atalhos:</strong> só código → começar no passo 4 · só docs → parar no 5 · passo 9 <em>sempre</em> obrigatório
              </p>
            </div>
          </div>
        </div>

        {/* Coluna direita: health + commits */}
        <div className="space-y-4">
          {/* Health */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Saúde do sistema</span>
            </div>
            <div className="px-4 py-3">
              {loading ? (
                <div className="h-8 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isOk ? "bg-green-400" : "bg-red-400"}`} />
                  <span className={`text-sm font-semibold ${isOk ? "text-green-700" : "text-red-600"}`}>
                    {isOk ? "Sistema online" : "Verificar sistema"}
                  </span>
                </div>
              )}
              {health && (
                <div className="mt-2 space-y-1">
                  {Object.entries(health).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs text-gray-500">
                      <span>{k}</span>
                      <span className={String(v) === "ok" ? "text-green-600 font-medium" : "text-gray-700"}>
                        {k === "uptime" ? `${Math.floor(Number(v) / 60)}min` : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Commits */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <GitCommit size={13} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Commits recentes</span>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <div className="h-3 bg-gray-100 rounded animate-pulse mb-1.5" />
                    <div className="h-2.5 w-1/2 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))
              ) : commits.length === 0 ? (
                <div className="px-4 py-4 text-xs text-gray-400 text-center">Nenhum commit carregado</div>
              ) : (
                commits.map((c) => (
                  <div key={c.sha} className="px-4 py-2.5">
                    <div className="flex items-start gap-2">
                      <code className="text-xs text-orange-500 font-mono flex-shrink-0 mt-0.5">{c.sha}</code>
                      <p className="text-xs text-gray-700 leading-snug break-words min-w-0">
                        {c.message.length > 70 ? c.message.slice(0, 70) + "…" : c.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                      <CheckCircle2 size={10} />
                      <span>{timeAgo(c.date)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
