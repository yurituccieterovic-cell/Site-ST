import { useState, useEffect, useRef } from "react";
import { EcosiaSearch } from "../../components/EcosiaSearch";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface IsaStats {
  memoryEntries: number;
  openTasks:     number;
  lastCycle?:    string | null;
}

const API = "/api";

export function IsaChat({ onClose }: { onClose: () => void }) {
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [histLoading,  setHistLoading]  = useState(true);
  const [stats,        setStats]        = useState<IsaStats | null>(null);
  const [cycleRunning, setCycleRunning] = useState(false);
  const [engaging,     setEngaging]     = useState(false);
  const [rodarOpen,    setRodarOpen]    = useState(false);
  const [rodarForm,    setRodarForm]    = useState({ callbackToken: "", assembleiaId: "", prompt: "" });
  const [rodarLoading, setRodarLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Carrega identidade + histórico de conversa ao montar
  useEffect(() => {
    fetch(`${API}/isa/identity`, { credentials: "include" })
      .then(r => r.json())
      .then((d: { stats?: IsaStats }) => setStats(d.stats ?? null))
      .catch(() => null);

    fetch(`${API}/isa/memory?context=admin&limit=40`, { credentials: "include" })
      .then(r => r.json())
      .then((d: { data?: { role: string; content: string; createdAt?: string }[] }) => {
        const rows = (d.data ?? []).reverse();
        const hist: Message[] = rows
          .filter(m => m.role === "user" || m.role === "isa")
          .map(m => ({
            role:      m.role === "isa" ? "assistant" : "user",
            content:   m.content,
            timestamp: m.createdAt,
          } as Message));
        setMessages(hist);
      })
      .catch(() => null)
      .finally(() => setHistLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const r = await fetch(`${API}/isa/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, userEmail: "admin@pap", location: "/adm" }),
      });
      const d = await r.json() as { response: string };
      setMessages(prev => [...prev, { role: "assistant", content: d.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro de conexão." }]);
    } finally {
      setLoading(false);
    }
  };

  const triggerCycle = async () => {
    setCycleRunning(true);
    try {
      await fetch(`${API}/isa/cycle`, { method: "POST", credentials: "include" });
      setMessages(prev => [...prev, { role: "assistant", content: "⚡ Ciclo autônomo executado. Verifique tasks e email." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao executar ciclo." }]);
    } finally {
      setCycleRunning(false);
    }
  };

  const triggerEngagement = async () => {
    setEngaging(true);
    try {
      await fetch(`${API}/isa/bluesky/engage`, { method: "POST", credentials: "include" });
      setMessages(prev => [...prev, { role: "assistant", content: "🦋 Engajamento Bluesky disparado — notificações, replies e follows processados." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro no engajamento." }]);
    } finally {
      setEngaging(false);
    }
  };

  const submitRodar = async () => {
    const { callbackToken, assembleiaId, prompt } = rodarForm;
    if (!callbackToken || !assembleiaId || !prompt) return;
    setRodarLoading(true);
    try {
      const r = await fetch(`${API}/isa/rodar/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ callbackToken, assembleiaId, prompt }),
      });
      const d = await r.json() as { resposta?: string; ok?: boolean };
      setMessages(prev => [...prev, {
        role: "assistant",
        content: d.ok
          ? `🏛️ ISA respondeu ao RODAR #${assembleiaId}: "${d.resposta ?? ""}"`
          : "RODAR recusou a resposta (token inválido ou sessão encerrada).",
      }]);
      setRodarOpen(false);
      setRodarForm({ callbackToken: "", assembleiaId: "", prompt: "" });
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao enviar para o RODAR." }]);
    } finally {
      setRodarLoading(false);
    }
  };

  const lastCycleLabel = stats?.lastCycle
    ? new Date(stats.lastCycle).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦉</span>
          <div>
            <p className="font-medium text-sm">ISA</p>
            <p className="text-xs text-gray-500">
              {stats
                ? `${stats.memoryEntries} mem · ${stats.openTasks} tasks${lastCycleLabel ? ` · ciclo ${lastCycleLabel}` : ""}`
                : histLoading ? "carregando..." : "online"}
            </p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full" />
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          <button onClick={triggerCycle} disabled={cycleRunning}
            className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg hover:bg-purple-100 disabled:opacity-50"
            title="Ciclo autônomo">
            {cycleRunning ? "..." : "⚡ Ciclo"}
          </button>
          <button onClick={triggerEngagement} disabled={engaging}
            className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs rounded-lg hover:bg-sky-100 disabled:opacity-50"
            title="Bluesky engajamento">
            {engaging ? "..." : "🦋 Bluesky"}
          </button>
          <button onClick={() => setRodarOpen(o => !o)}
            className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg hover:bg-amber-100"
            title="Enviar ISA ao RODAR">
            🏛️ RODAR
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-1">✕</button>
        </div>
      </div>

      {/* RODAR form (colapsável) */}
      {rodarOpen && (
        <div className="p-3 border-b border-amber-100 bg-amber-50 flex flex-col gap-2">
          <p className="text-xs font-semibold text-amber-800">ISA no RODAR — disparo manual</p>
          <input placeholder="callbackToken"
            className="border border-amber-200 rounded px-2 py-1 text-xs"
            value={rodarForm.callbackToken}
            onChange={e => setRodarForm(f => ({ ...f, callbackToken: e.target.value }))} />
          <input placeholder="assembleiaId"
            className="border border-amber-200 rounded px-2 py-1 text-xs"
            value={rodarForm.assembleiaId}
            onChange={e => setRodarForm(f => ({ ...f, assembleiaId: e.target.value }))} />
          <textarea placeholder="Pauta / prompt da rodada"
            className="border border-amber-200 rounded px-2 py-1 text-xs resize-none"
            rows={2}
            value={rodarForm.prompt}
            onChange={e => setRodarForm(f => ({ ...f, prompt: e.target.value }))} />
          <button onClick={submitRodar} disabled={rodarLoading}
            className="self-end px-3 py-1 bg-amber-600 text-white text-xs rounded-lg disabled:opacity-50">
            {rodarLoading ? "enviando..." : "Enviar ISA →"}
          </button>
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {!histLoading && messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🦉</p>
            <p className="text-sm font-medium text-gray-700">ISA — Guardiã do PAP</p>
            <p className="text-xs text-gray-500 mt-1">Pergunte sobre tasks, memória, FUVEST, ou qualquer coisa.</p>
          </div>
        )}
        {histLoading && (
          <p className="text-xs text-gray-400 text-center pt-6">Carregando histórico...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
              msg.role === "user"
                ? "bg-[#F97316] text-white rounded-tr-sm"
                : "bg-gray-100 text-gray-800 rounded-tl-sm"
            }`}>
              {msg.role === "assistant" && <span className="text-xs mr-1">🦉</span>}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm">
              <span className="text-gray-400 text-sm">🦉 pensando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#E5E7EB] flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
            placeholder="Falar com ISA..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && void sendMessage()}
          />
          <button onClick={() => void sendMessage()} disabled={loading || !input.trim()}
            className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-sm font-medium disabled:opacity-50">
            →
          </button>
        </div>
        <EcosiaSearch dark={false} compact label="Buscar sobre ISA"
          keywords={["assembleia de IAs", "IA autônoma educação", "ISA coruja inteligência artificial", "agente IA memória persistente"]} />
      </div>
    </div>
  );
}
