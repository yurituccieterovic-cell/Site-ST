import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProviderBadge } from "./ProviderBadge.js";

interface Message {
  id: number;
  role: string;
  content: string;
  status: string;
  provider?: string;
  voice?: string;
  model?: string;
  errorMessage?: string;
}

interface Props {
  message: Message;
  isStreaming?: boolean;
  streamContent?: string;
  onRetry?: () => void;
}

export function MessageBubble({ message, isStreaming, streamContent, onRetry }: Props) {
  const isUser = message.role === "user";
  const isFailed = message.status === "failed";
  const isInterrupted = message.status === "interrupted";
  const content = isStreaming ? (streamContent ?? "") : message.content;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      margin: "8px 0",
      padding: "0 12px",
    }}>
      <div style={{
        maxWidth: "min(680px, 90vw)",
        background: isUser ? "var(--user-bg)" : "var(--ai-bg)",
        border: `1px solid ${isFailed ? "var(--error)" : isInterrupted ? "var(--muted)" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: "10px 14px",
        position: "relative",
      }}>
        {/* Indicador de streaming */}
        {isStreaming && (
          <div style={{ marginBottom: 4, fontSize: 11, color: "var(--muted)" }}>
            <span style={{ animation: "pulse 1s infinite" }}>●</span> gerando...
          </div>
        )}

        {/* Conteúdo */}
        {isUser ? (
          <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{content}</div>
        ) : (
          <div className="md-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || (isStreaming ? "▋" : "")}</ReactMarkdown>
          </div>
        )}

        {/* Erro */}
        {isFailed && (
          <div style={{ marginTop: 8, color: "var(--error)", fontSize: 12 }}>
            {message.errorMessage || "Falha na geração."}
            {onRetry && (
              <button
                onClick={onRetry}
                style={{ marginLeft: 8, color: "var(--accent)", textDecoration: "underline", fontSize: 12 }}
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}

        {/* Interrompido */}
        {isInterrupted && !isStreaming && (
          <div style={{ marginTop: 4, fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>
            — resposta interrompida
            {onRetry && (
              <button
                onClick={onRetry}
                style={{ marginLeft: 8, color: "var(--accent)", textDecoration: "underline", fontSize: 11 }}
              >
                Continuar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Badge do provedor */}
      {!isUser && (message.voice || message.provider) && !isStreaming && (
        <div style={{ marginTop: 4, marginLeft: 2 }}>
          <ProviderBadge provider={message.provider} voice={message.voice} model={message.model} />
        </div>
      )}
    </div>
  );
}
