import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "../components/MessageBubble.js";
import { ProviderBadge } from "../components/ProviderBadge.js";
import { randomUUID } from "../lib/uuid.js";

interface Conversation {
  id: number;
  title: string;
  updatedAt: string;
}

interface Message {
  id: number;
  role: string;
  content: string;
  status: string;
  provider?: string;
  voice?: string;
  model?: string;
  errorMessage?: string;
  clientId?: string;
}

interface Provider {
  name: string;
  voice: string;
  label: string;
  emoji: string;
  enabled: boolean;
  isPaid: boolean;
}

interface Props {
  onLogout: () => void;
  isAdmin: boolean;
}

export function ChatPage({ onLogout, isAdmin }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [streamMsgId, setStreamMsgId] = useState<number | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [preferProvider, setPreferProvider] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  // Carrega conversas e provedores
  useEffect(() => {
    Promise.all([
      fetch("/api/conversations", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/providers", { credentials: "include" }).then((r) => r.json()),
    ]).then(([convs, provs]) => {
      setConversations(convs);
      setProviders(provs.filter((p: Provider) => p.enabled));
    });
  }, []);

  // Carrega mensagens da conversa ativa
  useEffect(() => {
    if (!activeConvId) return;
    fetch(`/api/conversations/${activeConvId}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then(setMessages);
  }, [activeConvId]);

  // Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  const newConversation = async () => {
    const res = await fetch("/api/conversations", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Nova conversa" }),
    });
    const conv = await res.json();
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
    setMessages([]);
  };

  const deleteConversation = async (id: number) => {
    if (!confirm("Apagar esta conversa?")) return;
    await fetch(`/api/conversations/${id}`, { method: "DELETE", credentials: "include" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) { setActiveConvId(null); setMessages([]); }
  };

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || isStreaming) return;
    if (!activeConvId) {
      await newConversation();
      return; // useEffect re-carregará, usuario manda de novo
    }

    const clientId = randomUUID();
    setInput("");
    setIsStreaming(true);
    setStreamContent("");

    // Adiciona mensagem do usuário otimisticamente
    const tempUserMsg: Message = { id: -Date.now(), role: "user", content, status: "done", clientId };
    setMessages((prev) => [...prev, tempUserMsg]);

    const res = await fetch("/api/chat", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConvId,
        clientId,
        content,
        preferProvider: preferProvider || undefined,
      }),
    });

    if (!res.ok || !res.body) {
      setIsStreaming(false);
      setMessages((prev) => [...prev, {
        id: -Date.now(),
        role: "assistant",
        content: "",
        status: "failed",
        errorMessage: "Falha ao conectar com o servidor.",
      }]);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let assistantMsgId: number | null = null;
    let finalProvider: string | undefined;
    let finalVoice: string | undefined;
    let finalModel: string | undefined;
    let accumulated = "";

    abortRef.current = () => reader.cancel();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const events = buf.split("\n\n");
        buf = events.pop() ?? "";

        for (const event of events) {
          const lines = event.split("\n");
          const eventType = lines.find((l) => l.startsWith("event:"))?.slice(7).trim();
          const dataLine = lines.find((l) => l.startsWith("data:"))?.slice(5).trim();
          if (!dataLine) continue;

          try {
            const data = JSON.parse(dataLine);
            if (eventType === "start") {
              assistantMsgId = data.assistantMessageId;
              setStreamMsgId(data.assistantMessageId);
              // Substitui mensagem otimista do usuário pela real
              setMessages((prev) => prev.map((m) =>
                m.id === tempUserMsg.id ? { ...m, id: data.userMessageId } : m
              ));
            } else if (eventType === "delta" && data.content) {
              accumulated += data.content;
              setStreamContent(accumulated);
            } else if (eventType === "done") {
              finalProvider = data.provider;
              finalVoice = data.voice;
              finalModel = data.model;
            } else if (eventType === "error") {
              setMessages((prev) => [...prev, {
                id: assistantMsgId ?? -Date.now(),
                role: "assistant",
                content: accumulated,
                status: "failed",
                errorMessage: data.message,
              }]);
              setIsStreaming(false);
              setStreamMsgId(null);
              return;
            }
          } catch { /* parse error */ }
        }
      }
    } finally {
      abortRef.current = null;
    }

    // Mensagem final gravada no DB
    if (assistantMsgId) {
      setMessages((prev) => [...prev, {
        id: assistantMsgId!,
        role: "assistant",
        content: accumulated,
        status: "done",
        provider: finalProvider,
        voice: finalVoice,
        model: finalModel,
      }]);
    }

    // Atualiza título da conversa se mudou
    fetch("/api/conversations", { credentials: "include" })
      .then((r) => r.json())
      .then(setConversations);

    setIsStreaming(false);
    setStreamContent("");
    setStreamMsgId(null);
  }, [input, isStreaming, activeConvId, preferProvider]);

  const cancelGeneration = () => {
    abortRef.current?.();
    abortRef.current = null;
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const enabledProviders = providers.filter((p) => !p.isPaid);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{
          width: 240,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          <div style={{ padding: "12px 8px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <button
              onClick={newConversation}
              style={{
                flex: 1,
                background: "var(--accent)",
                color: "#0d1117",
                padding: "7px 12px",
                borderRadius: "var(--radius)",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              + Nova
            </button>
            <button onClick={() => setSidebarOpen(false)} title="Fechar sidebar" style={{ color: "var(--muted)", padding: "4px 8px" }}>
              ←
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => { setActiveConvId(conv.id); setMessages([]); }}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  background: activeConvId === conv.id ? "rgba(88,166,255,0.1)" : "transparent",
                  borderLeft: activeConvId === conv.id ? "2px solid var(--accent)" : "2px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conv.title}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  style={{ color: "var(--muted)", fontSize: 14, padding: "2px 4px", flexShrink: 0 }}
                  title="Apagar"
                >
                  ×
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>Nenhuma conversa.</p>
            )}
          </div>

          <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
            {isAdmin && (
              <a href="/admin" style={{ fontSize: 12, color: "var(--muted)" }}>⚙ Admin</a>
            )}
            <button onClick={onLogout} style={{ fontSize: 12, color: "var(--muted)", textAlign: "left" }}>
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Área principal */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ color: "var(--muted)" }}>☰</button>
          )}
          <span style={{ fontWeight: 600 }}>🌳 Árvore Oracular</span>

          {/* Seletor de voz */}
          {enabledProviders.length > 1 && (
            <select
              value={preferProvider}
              onChange={(e) => setPreferProvider(e.target.value)}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", fontSize: 12, color: "var(--text)", marginLeft: "auto" }}
              title="Voz preferida"
            >
              <option value="">Voz automática</option>
              {enabledProviders.map((p) => (
                <option key={p.name} value={p.name}>{p.emoji} {p.label}</option>
              ))}
            </select>
          )}
        </div>

        {/* Mensagens */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {!activeConvId && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 48 }}>🌳</span>
              <p style={{ fontSize: 16 }}>Selecione ou crie uma conversa.</p>
              {enabledProviders.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {enabledProviders.map((p) => (
                    <ProviderBadge key={p.name} provider={p.name} voice={p.voice} />
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={msg.id === streamMsgId}
              streamContent={msg.id === streamMsgId ? streamContent : undefined}
              onRetry={msg.status === "failed" || msg.status === "interrupted" ? () => {
                setInput(messages.find((m) => m.role === "user" && messages.indexOf(m) === messages.indexOf(msg) - 1)?.content ?? "");
                textareaRef.current?.focus();
              } : undefined}
            />
          ))}

          {/* Placeholder de streaming */}
          {isStreaming && streamMsgId === null && (
            <MessageBubble
              message={{ id: -1, role: "assistant", content: "", status: "streaming" }}
              isStreaming
              streamContent={streamContent}
            />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flexShrink: 0,
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeConvId ? "Mensagem (Enter = enviar, Shift+Enter = nova linha)" : "Crie uma conversa primeiro"}
            disabled={!activeConvId || isStreaming}
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              maxHeight: 160,
              overflowY: "auto",
              lineHeight: 1.5,
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
            }}
          />
          {isStreaming ? (
            <button
              onClick={cancelGeneration}
              style={{
                background: "rgba(248,81,73,0.15)",
                color: "var(--error)",
                border: "1px solid var(--error)",
                borderRadius: "var(--radius)",
                padding: "8px 14px",
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              ■ Parar
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !activeConvId}
              style={{
                background: "var(--accent)",
                color: "#0d1117",
                padding: "8px 14px",
                borderRadius: "var(--radius)",
                fontWeight: 600,
                fontSize: 13,
                flexShrink: 0,
                opacity: (!input.trim() || !activeConvId) ? 0.4 : 1,
              }}
            >
              Enviar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
