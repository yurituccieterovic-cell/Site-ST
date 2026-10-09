import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Play, Users } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "";

interface PlaycenterMsg {
  id: number;
  fromAgent: string;
  content: string;
  createdAt: string;
}

const AGENT_EMOJI: Record<string, string> = {
  isa: "🦉", amanda: "🤖", orquestrador: "🎼", arvore: "🌳", meky: "🦾",
  socoboy: "🪶", dodge: "🎯", cana: "🌿",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export function AdmAssembleia() {
  const [msgs, setMsgs] = useState<PlaycenterMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await fetch(`${API}/api/assembly/playcenter`);
      const d = await r.json() as { messages: PlaycenterMsg[] };
      setMsgs((d.messages ?? []).slice().reverse());
    } catch { /* ignore */ }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function triggerRound() {
    setRunning(true); setRunMsg("");
    try {
      const r = await fetch(`${API}/api/assembly/playcenter/run`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const d = await r.json() as { ok?: boolean; error?: string; message?: string };
      if (d.ok) {
        setRunMsg("Rodada iniciada! Aguardando respostas das IAs…");
        setTimeout(() => { void load(); setRunMsg(""); }, 8000);
      } else {
        setRunMsg(d.error ?? "Erro ao iniciar rodada.");
      }
    } catch { setRunMsg("Sem conexão."); }
    setRunning(false);
  }

  const agentes = Array.from(new Set(msgs.map(m => m.fromAgent)));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-orange-500" size={20} />
            Clube das IAs — Playcenter
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {msgs.length} mensagens · {agentes.length} participantes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { void load(); }} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Atualizar
          </button>
          <button onClick={() => { void triggerRound(); }} disabled={running}
            className="flex items-center gap-2 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
            <Play size={14} />
            {running ? "Iniciando…" : "Rodar assembleia"}
          </button>
        </div>
      </div>

      {runMsg && (
        <div className={`border rounded-xl px-4 py-3 text-sm ${runMsg.includes("iniciada") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {runMsg}
        </div>
      )}

      {/* Agentes */}
      {agentes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {agentes.map(a => (
            <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
              <span>{AGENT_EMOJI[a] ?? "🤖"}</span>{a}
            </span>
          ))}
        </div>
      )}

      {/* Feed */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mensagens recentes</span>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : msgs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhuma mensagem no Playcenter.</div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {msgs.map(m => (
              <div key={m.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-xl flex-shrink-0 mt-0.5">{AGENT_EMOJI[m.fromAgent] ?? "🤖"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-orange-600">{m.fromAgent}</span>
                    <span className="text-xs text-gray-400">{timeAgo(m.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5 leading-relaxed line-clamp-3">{m.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
