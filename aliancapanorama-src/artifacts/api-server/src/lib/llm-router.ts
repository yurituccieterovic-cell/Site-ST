import { logger } from "./logger";

export type LLMMessage = { role: "user" | "assistant" | "system"; content: string };

export type LLMPool = "chat-live" | "batch" | "coder";

export interface LLMRequest {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  pool?: LLMPool;
}

interface Provider {
  name: string;
  cooldownMs: number;
  call(req: LLMRequest): Promise<string>;
}

// Cooling compartilhado entre todos os módulos
const cooldowns = new Map<string, number>();

function isCooling(name: string, ms: number): boolean {
  const last = cooldowns.get(name) ?? 0;
  return Date.now() - last < ms;
}

function markUsed(name: string): void {
  cooldowns.set(name, Date.now());
}

// ── Providers ──────────────────────────────────────────────────────────────

function makeOpenAI(): Provider {
  const key = process.env["OPENAI_API_KEY"] ?? "";
  return {
    name: "openai",
    cooldownMs: 500,
    async call(req) {
      if (!key) throw new Error("OPENAI_API_KEY não configurada");
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: req.messages,
          max_completion_tokens: req.maxTokens ?? 500,
          temperature: req.temperature ?? 0.7,
        }),
      });
      const data = await resp.json() as {
        choices?: { message: { content: string } }[];
        error?: { message: string };
      };
      if (data.error) throw new Error(`OpenAI: ${data.error.message}`);
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    },
  };
}

function makeGemini(): Provider {
  const key = process.env["GEMINI_API_KEY"] ?? "";
  return {
    name: "gemini",
    cooldownMs: 2000, // Gemini free: ~15 req/min → 4s entre chamadas é seguro; 2s é rápido mas ok
    async call(req) {
      if (!key) throw new Error("GEMINI_API_KEY não configurada");
      // Converter messages para o formato Gemini
      const contents = req.messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
      const systemMsg = req.messages.find(m => m.role === "system")?.content;
      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          maxOutputTokens: req.maxTokens ?? 500,
          temperature: req.temperature ?? 0.7,
          thinkingConfig: { thinkingBudget: 0 },
        },
      };
      if (systemMsg) body["systemInstruction"] = { parts: [{ text: systemMsg }] };

      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await resp.json() as {
        candidates?: { content: { parts: { text: string }[] } }[];
        error?: { message: string };
      };
      if (data.error) throw new Error(`Gemini: ${data.error.message}`);
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    },
  };
}

function makeGroq(): Provider {
  const key = process.env["GROQ_API_KEY"] ?? "";
  return {
    name: "groq",
    cooldownMs: 1000,
    async call(req) {
      if (!key) throw new Error("GROQ_API_KEY não configurada");
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: req.messages,
          max_tokens: req.maxTokens ?? 500,
          temperature: req.temperature ?? 0.7,
        }),
      });
      const data = await resp.json() as {
        choices?: { message: { content: string } }[];
        error?: { message: string };
      };
      if (data.error) throw new Error(`Groq: ${data.error.message}`);
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    },
  };
}

function makePollinations(): Provider {
  return {
    name: "pollinations",
    cooldownMs: 2000,
    async call(req) {
      const resp = await fetch("https://text.pollinations.ai/openai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: req.messages,
          max_tokens: req.maxTokens ?? 500,
          temperature: req.temperature ?? 0.7,
        }),
      });
      if (!resp.ok) throw new Error(`Pollinations: HTTP ${resp.status}`);
      const data = await resp.json() as {
        choices?: { message: { content: string } }[];
        error?: { message: string };
      };
      if (data.error) throw new Error(`Pollinations: ${data.error.message}`);
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    },
  };
}

// ── Pool definitions ────────────────────────────────────────────────────────
// chat-live: respostas rápidas (ISA chat, exercícios, sonhos)
// batch:     ciclo ISA, conteúdo de nós (latência ok)
// coder:     geração de código (usa OpenAI preferencialmente)
// Fallback gratuito: Pollinations.ai (sem key, último na fila)

const POOL_PROVIDERS: Record<LLMPool, Provider[]> = {
  "chat-live": [makeGroq(), makeGemini(), makeOpenAI(), makePollinations()],
  "batch":     [makeGemini(), makeGroq(), makeOpenAI(), makePollinations()],
  "coder":     [makeOpenAI(), makeGemini(), makePollinations()],
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const BUSY_PATTERNS = [
  /429/i, /rate.?limit/i, /too.?many.?request/i, /overload/i,
  /server.?busy/i, /capacity/i, /quota/i, /503/i, /service.?unavailable/i,
];

function isBusyError(msg: string): boolean {
  return BUSY_PATTERNS.some(p => p.test(msg));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Router ──────────────────────────────────────────────────────────────────

/**
 * Roteia uma chamada LLM pelo pool especificado.
 * Tenta provedores em ordem, pulando os em cooling.
 * Se TODOS falharem por ocupação/rate-limit → aguarda 10 min e retenta uma vez.
 */
export async function routeLLM(req: LLMRequest): Promise<string> {
  const poolName = req.pool ?? "chat-live";
  const providers = POOL_PROVIDERS[poolName];

  async function tryPool(): Promise<{ result: string | null; errors: string[]; allBusy: boolean }> {
    const errors: string[] = [];
    for (const provider of providers) {
      if (isCooling(provider.name, provider.cooldownMs)) {
        logger.debug({ provider: provider.name }, "llm-router: em cooling, tentando próximo");
        continue;
      }
      try {
        const result = await provider.call(req);
        markUsed(provider.name);
        logger.debug({ provider: provider.name, pool: poolName }, "llm-router: sucesso");
        return { result, errors, allBusy: false };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${provider.name}: ${msg}`);
        logger.warn({ provider: provider.name, err: msg }, "llm-router: provider falhou, tentando próximo");
      }
    }

    // Segunda passagem — ignorar cooling se todos estavam em cooling
    if (errors.length === 0) {
      for (const provider of providers) {
        try {
          const result = await provider.call(req);
          markUsed(provider.name);
          return { result, errors, allBusy: false };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`${provider.name}: ${msg}`);
        }
      }
    }

    const allBusy = errors.length > 0 && errors.every(e => isBusyError(e));
    return { result: null, errors, allBusy };
  }

  // Primeira tentativa
  const first = await tryPool();
  if (first.result !== null) return first.result;

  // Se todos ocupados → aguardar 10 min e retentar
  if (first.allBusy) {
    const WAIT_MS = 10 * 60 * 1000; // 10 minutos
    logger.warn({ pool: poolName, errors: first.errors }, `llm-router: todos os servidores ocupados — aguardando ${WAIT_MS / 60000}min antes de retentar`);
    await sleep(WAIT_MS);
    logger.info({ pool: poolName }, "llm-router: retentando após espera de 10 min");
    const second = await tryPool();
    if (second.result !== null) return second.result;
    throw new Error(`llm-router: todos os provedores ocupados (após retry de 10min) no pool ${poolName}:\n${second.errors.join("\n")}`);
  }

  throw new Error(`llm-router: todos os provedores falharam no pool ${poolName}:\n${first.errors.join("\n")}`);
}

/**
 * Shortcut para chamada simples com uma mensagem de usuário.
 */
export async function askLLM(
  userMessage: string,
  opts?: { systemPrompt?: string; pool?: LLMPool; maxTokens?: number; temperature?: number }
): Promise<string> {
  const messages: LLMMessage[] = [];
  if (opts?.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
  messages.push({ role: "user", content: userMessage });
  return routeLLM({ messages, pool: opts?.pool, maxTokens: opts?.maxTokens, temperature: opts?.temperature });
}
