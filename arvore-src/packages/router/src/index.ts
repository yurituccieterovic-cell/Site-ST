import type { ChatMessage, ProviderConfig, ProviderName, StreamCallback } from "./types.js";
import { streamGroq } from "./providers/groq.js";
import { streamGemini } from "./providers/gemini.js";
import { streamCloudflare } from "./providers/cloudflare.js";
import { streamOpenRouter } from "./providers/openrouter.js";
import { isAvailable, recordSuccess, recordFailure, getAllStates } from "./circuit-breaker.js";

export * from "./types.js";
export { getAllStates as getCircuitBreakerStates };

// Configuração das vozes — lida de env vars para permitir override sem rebuild
function makeConfig(): ProviderConfig[] {
  return [
    {
      name: "groq",
      voice: "veloz",
      label: "Voz Veloz",
      emoji: "⚡",
      enabled: !!process.env["GROQ_API_KEY"],
      isPaid: false,
      model: process.env["GROQ_MODEL"] ?? "llama-3.3-70b-versatile",
      timeoutMs: 15_000,
      maxRetries: 2,
    },
    {
      name: "gemini",
      voice: "expansiva",
      label: "Voz Expansiva",
      emoji: "🌿",
      enabled: !!process.env["GEMINI_API_KEY"],
      isPaid: false,
      model: process.env["GEMINI_MODEL"] ?? "gemini-2.0-flash",
      timeoutMs: 20_000,
      maxRetries: 1,
    },
    {
      name: "cloudflare",
      voice: "minima",
      label: "Voz Mínima",
      emoji: "🪨",
      enabled: !!(process.env["CLOUDFLARE_ACCOUNT_ID"] && process.env["CLOUDFLARE_API_TOKEN"]),
      isPaid: false,
      model: process.env["CF_MODEL"] ?? "@cf/meta/llama-3.1-8b-instruct",
      timeoutMs: 20_000,
      maxRetries: 1,
    },
    {
      name: "openrouter",
      voice: "livre",
      label: "Voz Livre",
      emoji: "🌊",
      // OpenRouter é pago por uso — só habilitar se a chave estiver explicitamente no env
      enabled: !!process.env["OPENROUTER_API_KEY"],
      isPaid: true,
      model: process.env["OPENROUTER_MODEL"] ?? "mistralai/mistral-7b-instruct",
      timeoutMs: 30_000,
      maxRetries: 1,
    },
  ];
}

// Mapeia provider para função de stream
const STREAM_FN: Record<ProviderName, (
  cfg: ProviderConfig,
  msgs: ChatMessage[],
  sys: string,
  cb: StreamCallback,
  sig: AbortSignal
) => Promise<{ tokensIn: number; tokensOut: number }>> = {
  groq:        streamGroq,
  gemini:      streamGemini,
  cloudflare:  streamCloudflare,
  openrouter:  streamOpenRouter,
};

function isTransientError(err: unknown): boolean {
  const e = err as { status?: number; code?: string };
  // 5xx e 429 são transitórios; 401/403/402/404 não são
  if (e.status) return e.status >= 500 || e.status === 429;
  return false;
}

function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

function jitter(ms: number) { return ms + Math.floor(Math.random() * ms * 0.3); }

export async function routeChat(
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: StreamCallback,
  options?: {
    preferProvider?: ProviderName;
    signal?: AbortSignal;
  }
): Promise<{ provider: ProviderName; voice: string; model: string; tokensIn: number; tokensOut: number }> {
  const configs = makeConfig();
  const externalSignal = options?.signal;

  // Ordenação: provider preferido primeiro, depois os demais habilitados e disponíveis
  let ordered = configs.filter((c) => c.enabled && !c.isPaid);
  if (options?.preferProvider) {
    ordered = [
      ...ordered.filter((c) => c.name === options.preferProvider),
      ...ordered.filter((c) => c.name !== options.preferProvider),
    ];
  }

  // Provedores pagos habilitados entram por último (nunca automático)
  const paid = configs.filter((c) => c.enabled && c.isPaid);
  ordered = [...ordered, ...paid];

  const available = ordered.filter((c) => isAvailable(c.name));

  if (available.length === 0) {
    onChunk({ type: "error", errorCode: "all_unavailable", errorMessage: "Nenhum provedor disponível no momento. Tente novamente em instantes." });
    throw new Error("all_unavailable");
  }

  for (const config of available) {
    if (externalSignal?.aborted) {
      onChunk({ type: "error", errorCode: "cancelled", errorMessage: "Cancelado pelo usuário." });
      throw new Error("cancelled");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
    const combinedSignal = externalSignal
      ? combineSignals(externalSignal, controller.signal)
      : controller.signal;

    // Watchdog de inatividade (sem bytes por 10s = stall)
    let lastActivity = Date.now();
    const watchdog = setInterval(() => {
      if (Date.now() - lastActivity > 10_000) controller.abort();
    }, 2_000);

    // Heartbeat SSE a cada 8s
    const heartbeat = setInterval(() => onChunk({ type: "heartbeat" }), 8_000);

    let attempt = 0;
    let lastErr: unknown;

    while (attempt <= config.maxRetries) {
      try {
        const wrappedCb: StreamCallback = (chunk) => {
          if (chunk.type === "delta") lastActivity = Date.now();
          onChunk(chunk);
        };

        const { tokensIn, tokensOut } = await STREAM_FN[config.name](
          config, messages, systemPrompt, wrappedCb, combinedSignal
        );

        clearTimeout(timeout);
        clearInterval(watchdog);
        clearInterval(heartbeat);
        recordSuccess(config.name);
        onChunk({ type: "done", provider: config.name, voice: config.voice, model: config.model, tokensIn, tokensOut });
        return { provider: config.name, voice: config.voice, model: config.model, tokensIn, tokensOut };

      } catch (err) {
        lastErr = err;
        const transient = isTransientError(err);

        if (!transient) {
          // 401/403/402/404 — não tentar de novo neste provedor
          recordFailure(config.name, false);
          break;
        }

        const e = err as { retryAfter?: number; status?: number };
        if (e.status === 429 && e.retryAfter) {
          await sleep(Math.min(e.retryAfter * 1000, 30_000));
        } else if (transient && attempt < config.maxRetries) {
          await sleep(jitter(1000 * (attempt + 1)));
        }

        attempt++;
        if (attempt > config.maxRetries) {
          recordFailure(config.name, transient);
          break;
        }
      }
    }

    clearTimeout(timeout);
    clearInterval(watchdog);
    clearInterval(heartbeat);

    // Tenta próximo provedor — loga o erro mas não falha
    console.warn(`[router] ${config.name} falhou após ${attempt} tentativas:`, lastErr);
  }

  onChunk({ type: "error", errorCode: "all_failed", errorMessage: "Todos os provedores falharam. Tente novamente mais tarde." });
  throw new Error("all_failed");
}

export function listProviders(): Pick<ProviderConfig, "name" | "voice" | "label" | "emoji" | "enabled" | "isPaid" | "model">[] {
  return makeConfig().map(({ name, voice, label, emoji, enabled, isPaid, model }) => ({
    name, voice, label, emoji, enabled, isPaid, model,
  }));
}

// Helper: combina dois AbortSignals (aborta se qualquer um abortar)
function combineSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const ctrl = new AbortController();
  const handler = () => ctrl.abort();
  a.addEventListener("abort", handler, { once: true });
  b.addEventListener("abort", handler, { once: true });
  return ctrl.signal;
}
