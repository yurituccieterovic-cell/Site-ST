/**
 * StudioPage — /studio
 * Canal de conversa entre Yuri, Claude Code (Cláudio) e os agentes do Conselho (Artesão, Ajudante, ISA, Árvore).
 * Acessível de qualquer lugar. Mensagens persistem via PAP API.
 */
import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

interface Msg {
  id: string;
  remetente: string;   // "yuri" | "artesao" | "ajudante" | "isa" | "arvore" | "claudio"
  conteudo: string;
  timestamp: string;
  status?: string;
}

const AVATAR: Record<string, string> = {
  yuri:     "👤",
  artesao:  "🎨",
  ajudante: "🛠️",
  isa:      "🦉",
  arvore:   "🌳",
  claudio:  "⚡",
  crew:     "🤖",
  sistema:  "⚙️",
};

const COR: Record<string, string> = {
  yuri:     "text-cyan-300",
  artesao:  "text-purple-300",
  ajudante: "text-yellow-300",
  isa:      "text-blue-300",
  arvore:   "text-green-300",
  claudio:  "text-orange-300",
  crew:     "text-pink-300",
  sistema:  "text-gray-400",
};

export function StudioPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [agente, setAgente] = useState<"artesao" | "crew" | "isa">("artesao");
  const [remetente, setRemetente] = useState("yuri");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMsgs = async () => {
    try {
      const r = await fetch(`${API}/api/studio/chat`);
      if (r.ok) setMsgs(await r.json());
    } catch {}
  };

  useEffect(() => {
    fetchMsgs();
    const id = setInterval(fetchMsgs, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const enviar = async () => {
    if (!input.trim() || enviando) return;
    setEnviando(true);
    const texto = input.trim();
    setInput("");
    try {
      await fetch(`${API}/api/studio/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: texto, remetente, agente }),
      });
      await fetchMsgs();
    } finally {
      setEnviando(false);
    }
  };

  const limpar = async () => {
    if (!confirm("Limpar histórico do Studio?")) return;
    await fetch(`${API}/api/studio/chat`, { method: "DELETE" });
    setMsgs([]);
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white font-mono flex flex-col">
      {/* Header */}
      <div className="border-b border-purple-900/40 px-4 py-3 flex items-center justify-between bg-[#0a0d1a]">
        <div>
          <span className="text-purple-400 font-bold text-sm">⚗️ STUDIO</span>
          <span className="text-gray-500 text-xs ml-3">Conselho do Artesão · Ecossistema Théo</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Agente:</span>
          <select
            className="bg-[#111827] border border-gray-700 text-xs text-gray-200 rounded px-2 py-1"
            value={agente}
            onChange={e => setAgente(e.target.value as "artesao" | "crew" | "isa")}
          >
            <option value="artesao">🎨 Artesão</option>
            <option value="crew">🤖 Crew Completo</option>
            <option value="isa">🦉 ISA</option>
          </select>
          <span className="text-xs text-gray-500">Eu:</span>
          <select
            className="bg-[#111827] border border-gray-700 text-xs text-gray-200 rounded px-2 py-1"
            value={remetente}
            onChange={e => setRemetente(e.target.value)}
          >
            <option value="yuri">👤 Yuri</option>
            <option value="claudio">⚡ Cláudio</option>
          </select>
          <button
            onClick={limpar}
            className="text-xs text-red-500/60 hover:text-red-400 transition-colors"
          >
            limpar
          </button>
        </div>
      </div>

      {/* Agentes online */}
      <div className="px-4 py-2 bg-[#080b15] border-b border-gray-800/30 flex gap-4 text-xs">
        {["artesao","ajudante","isa","arvore","claudio"].map(a => (
          <span key={a} className={`${COR[a] ?? "text-gray-400"} opacity-70`}>
            {AVATAR[a]} {a}
          </span>
        ))}
        <span className="ml-auto text-gray-600">atualiza a cada 3s</span>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {msgs.length === 0 && (
          <div className="text-center text-gray-600 text-xs mt-12">
            <div className="text-2xl mb-2">⚗️</div>
            Studio vazio. Envie uma mensagem para iniciar a conversa.
          </div>
        )}
        {msgs.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.remetente === "yuri" || m.remetente === "claudio" ? "flex-row-reverse" : "flex-row"}`}>
            <div className="text-xl shrink-0 mt-0.5">
              {AVATAR[m.remetente] ?? "💬"}
            </div>
            <div className={`max-w-[75%] ${m.remetente === "yuri" || m.remetente === "claudio" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div className={`text-xs ${COR[m.remetente] ?? "text-gray-400"} flex gap-2`}>
                <span className="font-bold">{m.remetente}</span>
                <span className="text-gray-600">{new Date(m.timestamp).toLocaleTimeString("pt-BR")}</span>
                {m.status && m.status !== "ok" && (
                  <span className="text-yellow-600">{m.status}</span>
                )}
              </div>
              <div className={`rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                m.remetente === "yuri" ? "bg-cyan-900/30 border border-cyan-800/40 text-cyan-100" :
                m.remetente === "claudio" ? "bg-orange-900/30 border border-orange-800/40 text-orange-100" :
                "bg-gray-900/60 border border-gray-700/40 text-gray-200"
              }`}>
                {m.conteudo}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800/50 p-3 bg-[#080b15]">
        <div className="flex gap-2">
          <textarea
            className="flex-1 bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none focus:border-purple-600 transition-colors"
            placeholder={`Mensagem para o ${agente}... (Enter para enviar, Shift+Enter para nova linha)`}
            value={input}
            rows={2}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
          />
          <button
            onClick={enviar}
            disabled={enviando || !input.trim()}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition-colors"
          >
            {enviando ? "..." : "▶"}
          </button>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Studio · Cláudio (Claude Code) também monitora este canal · Use #2 no terminal para conectar
        </div>
      </div>
    </div>
  );
}
