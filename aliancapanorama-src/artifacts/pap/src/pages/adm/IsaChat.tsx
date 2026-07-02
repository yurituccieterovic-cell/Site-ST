import { useState, useEffect, useRef } from "react";
import { EcosiaSearch } from "../../components/EcosiaSearch";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface IsaIdentity {
  name: string;
  version: string;
  status: string;
  memoryCount: number;
  taskCount: number;
  lastCycle?: string;
}

const API = "/api";

export function IsaChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState<IsaIdentity | null>(null);
  const [cycleRunning, setCycleRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/isa/identity`)
      .then((r) => r.json())
      .then((data) => setIdentity(data as IsaIdentity))
      .catch(() => null);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const r = await fetch(`${API}/isa/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userEmail: "admin@pap", context: "admin" }),
      });
      const data = await r.json() as { response: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erro ao conectar com a ISA. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  const triggerCycle = async () => {
    setCycleRunning(true);
    try {
      await fetch(`${API}/isa/cycle`, { method: "POST" });
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Ciclo autônomo executado. Verifique as tasks criadas e o email de sugestões.",
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erro ao executar o ciclo." }]);
    } finally {
      setCycleRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦉</span>
          <div>
            <p className="font-medium text-sm">ISA</p>
            <p className="text-xs text-gray-500">
              {identity ? `${identity.memoryCount} mem · ${identity.taskCount} tasks` : "conectando..."}
            </p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerCycle}
            disabled={cycleRunning}
            className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg hover:bg-purple-100 disabled:opacity-50"
            title="Executar ciclo autônomo agora"
          >
            {cycleRunning ? "..." : "⚡ Ciclo"}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🦉</p>
            <p className="text-sm font-medium text-gray-700">ISA — Guardiã do PAP</p>
            <p className="text-xs text-gray-500 mt-1">
              Pergunte sobre tasks, memória, sugestões ou execute o ciclo autônomo.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-[#F97316] text-white rounded-tr-sm"
                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
              }`}
            >
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            →
          </button>
        </div>
        <EcosiaSearch
          dark={false}
          compact
          label="Buscar sobre ISA"
          keywords={["assembleia de IAs", "IA autônoma educação", "ISA coruja inteligência artificial", "agente IA memória persistente"]}
        />
      </div>
    </div>
  );
}
