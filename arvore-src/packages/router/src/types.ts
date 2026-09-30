export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type ProviderName = "groq" | "gemini" | "cloudflare" | "openrouter";
export type VoiceName = "veloz" | "expansiva" | "minima" | "livre";

export interface ProviderConfig {
  name: ProviderName;
  voice: VoiceName;
  label: string;         // exibido no UI
  emoji: string;
  enabled: boolean;
  isPaid: boolean;       // nunca habilitar automaticamente se true
  model: string;
  timeoutMs: number;
  maxRetries: number;
}

export interface StreamChunk {
  type: "delta" | "done" | "error" | "heartbeat";
  content?: string;
  provider?: ProviderName;
  voice?: VoiceName;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface ProviderResult {
  provider: ProviderName;
  voice: VoiceName;
  model: string;
  content: string;
  tokensIn?: number;
  tokensOut?: number;
}

export type StreamCallback = (chunk: StreamChunk) => void;

export interface CircuitBreakerState {
  state: "closed" | "open" | "half-open";
  failCount: number;
  cooldownUntil?: Date;
}
