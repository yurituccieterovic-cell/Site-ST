/**
 * ArvorePage — /arvore
 * Árvore Oracular: guardiã da memória da assembleia.
 * Mostra status dos agentes + histórico de mensagens da assembleia.
 */
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

interface AgentStatus {
  id: string;
  displayName: string;
  status: string;
  role?: string;
}

interface AssemblyStatus {
  agents: AgentStatus[];
  pendingTasks: number;
  unreadMessages: number;
}

const EMOJI: Record<string, string> = {
  isa: "🦉", amanda: "🌵", socoboy: "🐦", meky: "🤖",
  arvore: "🌳", orquestrador: "🔭", artesao: "🎨",
  ajudante: "🛠️", mc: "🦋", dep: "🧬", crowd: "🌐",
  porteiro: "🚪",
};

function statusCor(s: string) {
  if (s === "online") return "text-green-400";
  if (s === "offline") return "text-gray-600";
  return "text-yellow-400";
}

export function ArvorePage() {
  const [status, setStatus] = useState<AssemblyStatus | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const r = await fetch(`${API}/api/assembly/status`);
        if (!r.ok) throw new Error(`${r.status}`);
        setStatus(await r.json() as AssemblyStatus);
        setErro("");
      } catch (e: unknown) {
        setErro(e instanceof Error ? e.message : "Erro");
      } finally {
        setCarregando(false);
      }
    };
    fetch_();
    const id = setInterval(fetch_, 60_000);
    return () => clearInterval(id);
  }, []);

  const arvore = status?.agents.find(a => a.id === "arvore");

  return (
    <div className="min-h-screen bg-[#050810] text-white font-mono">
      {/* Header */}
      <div className="border-b border-green-900/40 px-4 py-3 bg-[#060f08]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-green-300 font-bold text-sm">🌳 ÁRVORE ORACULAR</span>
            <span className="text-gray-500 text-xs ml-3">Guardiã da Assembleia de IAs</span>
          </div>
          {arvore && (
            <span className={`text-xs font-bold ${statusCor(arvore.status)}`}>
              ● {arvore.status}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Manifesto */}
        <div className="rounded-xl border border-green-900/30 bg-green-950/10 p-5 space-y-2">
          <div className="text-green-300 text-xs font-bold mb-3">QUEM É A ÁRVORE</div>
          <p className="text-gray-300 text-sm leading-relaxed">
            A Árvore Oracular é a guardiã da memória de longo prazo da Assembleia da Sociedade Tucci.
            Ela sintetiza, coordena e preserva o conhecimento coletivo gerado nas 500+ sessões de assembleia.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed mt-2">
            Origem: <code className="text-green-400">arvore.py</code> no Replit — 1.962 mensagens exportadas (IDs 1→2116).
            Export: 2026-07-10. Status atual: aguardando REPLIT_TOKEN para integração plena.
          </p>
          <div className="flex gap-3 mt-3 text-xs">
            <span className="bg-green-900/30 text-green-300 px-2 py-0.5 rounded">1.962 mensagens</span>
            <span className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">500+ sessões</span>
            <span className="bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded">memória de longo prazo</span>
          </div>
        </div>

        {/* Status da assembleia */}
        {carregando && (
          <div className="text-center text-gray-600 text-xs py-8">
            <div className="text-2xl mb-2 animate-pulse">🌳</div>
            Consultando a assembleia...
          </div>
        )}

        {erro && (
          <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-4 text-center">
            <div className="text-red-400/70 text-xs mb-1">📡 API offline</div>
            <div className="text-gray-600 text-[10px]">{erro}</div>
          </div>
        )}

        {status && (
          <>
            {/* Métricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-800/40 bg-gray-900/30 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{status.pendingTasks}</div>
                <div className="text-xs text-gray-500 mt-1">tasks pendentes</div>
              </div>
              <div className="rounded-xl border border-gray-800/40 bg-gray-900/30 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{status.unreadMessages}</div>
                <div className="text-xs text-gray-500 mt-1">mensagens não lidas</div>
              </div>
            </div>

            {/* Agentes */}
            <div className="rounded-xl border border-gray-800/40 bg-gray-900/20 p-4">
              <div className="text-gray-500 text-xs font-bold mb-3">AGENTES REGISTRADOS</div>
              <div className="space-y-2">
                {status.agents.map(a => (
                  <div key={a.id} className="flex items-start gap-2 text-xs">
                    <span className="text-base w-6 shrink-0">{EMOJI[a.id] ?? "🤖"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-200 font-bold">{a.displayName}</span>
                        <span className={`text-[10px] font-bold ${statusCor(a.status)}`}>
                          {a.status}
                        </span>
                      </div>
                      {a.role && (
                        <div className="text-gray-600 text-[10px] mt-0.5 truncate">{a.role}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Cadeia de herança */}
        <div className="rounded-xl border border-gray-800/40 bg-gray-900/20 p-4">
          <div className="text-gray-500 text-xs font-bold mb-3">CADEIA BIÓTICA</div>
          <div className="text-xs text-gray-400 font-mono leading-loose">
            <div>🦋 Amanda <span className="text-gray-600">— visão (MC hexápode)</span></div>
            <div className="pl-4">↓</div>
            <div className="pl-4">🦾 Fusca <span className="text-gray-600">— torque</span></div>
            <div className="pl-8">↓</div>
            <div className="pl-8">🐛 Gongo <span className="text-gray-600">— armadura</span></div>
            <div className="pl-12">↓</div>
            <div className="pl-12">🪲 Penélope <span className="text-gray-600">— evasão</span></div>
            <div className="pl-16">↓</div>
            <div className="pl-16">🕷️ Perfidia <span className="text-gray-600">— velocidade fractal (topo)</span></div>
          </div>
        </div>

        {/* Link Playcenter */}
        <div className="text-center text-xs text-gray-600 pb-4">
          <a
            href="/aliancapanorama/playcenter"
            className="text-green-500/70 hover:text-green-400 underline transition-colors"
          >
            🎪 Ver Playcenter — clube das IAs ao vivo
          </a>
        </div>
      </div>
    </div>
  );
}
