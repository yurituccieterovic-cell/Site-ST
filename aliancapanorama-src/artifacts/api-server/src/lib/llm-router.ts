// Roteador 8-vias de LLMs com cooling por provedor e pools por função.
// Forked do SalesCockpit (2026-10). Distribui carga entre OpenAI/Groq/Gemini/
// Cerebras/Mistral/DeepSeek/xAI/Cloudflare. Cada provedor tem cooling isolado.
//
// Pools:
//   chat-live  → latência baixa (Cana, SABIÁ chat, Jasmim, ISA)
//   batch      → tarefas autônomas/resumos (assembleia, heartbeat)
//   coder      → raciocínio profundo (geração de código)
//   curadoria  → polish/memória curta (registros no Conector)
//
// Interface pública: routeLLM + askLLM (backward-compat com router anterior).

import { logger } from "./logger";

// ── Tipos públicos ────────────────────────────────────────────────────────────

export type LLMMessage = { role: "user" | "assistant" | "system"; content: string };
export type LLMPool = "chat-live" | "batch" | "coder" | "curadoria";

export interface LLMRequest {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  pool?: LLMPool;
  signal?: AbortSignal;
  jsonMode?: boolean;
}

// ── Providers ─────────────────────────────────────────────────────────────────

type ProviderName =
  | "openai"
  | "groq"
  | "gemini"
  | "cerebras"
  | "mistral"
  | "deepseek"
  | "xai"
  | "cloudflare";

const MODELS: Record<ProviderName, string> = {
  openai:     "gpt-4o-mini",
  groq:       "qwen/qwen3.8-27b",
  gemini:     "gemini-2.5-flash",
  cerebras:   "gpt-oss-120b",
  mistral:    "mistral-small-latest",
  deepseek:   "deepseek-chat",
  xai:        "grok-3-mini",
  cloudflare: "@cf/meta/llama-3.1-8b-instruct",
};

const POOLS: Record<LLMPool, ProviderName[]> = {
  // Groq primeiro (rápido, gratuito); Cloudflare/Mistral como fallback garantido
  "chat-live": ["xai", "groq", "gemini", "openai", "cerebras", "cloudflare", "mistral"],
  // Tarefas background: Cloudflare 10k/dia, Mistral, Cerebras como reservas
  "batch":     ["cloudflare", "mistral", "cerebras", "gemini", "deepseek"],
  // Raciocínio profundo: DeepSeek-V3 forte e barato
  "coder":     ["deepseek", "groq", "openai", "gemini"],
  // Polish/curadoria curta
  "curadoria": ["mistral", "cloudflare", "deepseek", "cerebras"],
};

// ── Estado por provedor ───────────────────────────────────────────────────────

type ProviderState = {
  cooldownUntil: number;
  reqCount: number;
  failCount: number;
  successCount: number;
  consecFails: number;
  lastError?: string;
};

const state: Record<ProviderName, ProviderState> = {
  openai:     { cooldownUntil: 0, reqCount: 0, failCount: 0, successCount: 0, consecFails: 0 },
  groq:       { cooldownUntil: 0, reqCount: 0, failCount: 0, successCount: 0, consecFails: 0 },
  gemini:     { cooldownUntil: 0, reqCount: 0, failCount: 0, successCount: 0, consecFails: 0 },
  cerebras:   { cooldownUntil: 0, reqCount: 0, failCount: 0, successCount: 0, consecFails: 0 },
  mistral:    { cooldownUntil: 0, reqCount: 0, failCount: 0, successCount: 0, consecFails: 0 },
  deepseek:   { cooldownUntil: 0, reqCount: 0, failCount: 0, successCount: 0, consecFails: 0 },
  xai:        { cooldownUntil: 0, reqCount: 0, failCount: 0, successCount: 0, consecFails: 0 },
  cloudflare: { cooldownUntil: 0, reqCount: 0, failCount: 0, successCount: 0, consecFails: 0 },
};

function hasKey(p: ProviderName): boolean {
  switch (p) {
    case "openai":     return !!process.env["OPENAI_API_KEY"];
    case "groq":       return !!process.env["GROQ_API_KEY"];
    case "gemini":     return !!process.env["GEMINI_API_KEY"];
    case "cerebras":   return !!process.env["CEREBRAS_API_KEY"];
    case "mistral":    return !!process.env["MISTRAL_API_KEY"];
    case "deepseek":   return !!process.env["DEEPSEEK_API_KEY"];
    case "xai":        return !!process.env["XAI_API_KEY"];
    case "cloudflare": return !!(process.env["CLOUDFLARE_AI_TOKEN"] && process.env["CLOUDFLARE_ACCOUNT_ID"]);
  }
}

function classifyError(status: number, body: string): string {
  if (status === 429 || /quota|rate.?limit|queue_exceeded|too_many/i.test(body)) return "rate-limit";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404 || status === 410) return "dead";
  if (status >= 500) return "server-error";
  if (status >= 400) return "client-error";
  return "unknown";
}

function setCooling(p: ProviderName, status: number, body: string): void {
  const klass = classifyError(status, body);
  state[p].failCount += 1;
  let coolMs = 60_000;
  if (klass === "rate-limit") {
    state[p].consecFails += 1;
    coolMs = state[p].consecFails >= 4 ? 10 * 60_000 : 30_000;
  } else {
    state[p].consecFails = 0;
    if (klass === "unauthorized" || klass === "forbidden" || klass === "dead") {
      coolMs = 60 * 60_000;
    } else if (klass === "server-error") {
      coolMs = 2 * 60_000;
    }
  }
  state[p].cooldownUntil = Math.max(state[p].cooldownUntil, Date.now() + coolMs);
  state[p].lastError = `${status} ${klass}`;
}

function markSuccess(p: ProviderName): void {
  state[p].successCount += 1;
  state[p].consecFails = 0;
  if (state[p].cooldownUntil <= Date.now()) {
    state[p].cooldownUntil = 0;
    state[p].lastError = undefined;
  }
}

function isAvailable(p: ProviderName): boolean {
  return hasKey(p) && state[p].cooldownUntil <= Date.now();
}

// ── Adapters ──────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 45_000;

class AdapterError extends Error {
  status: number;
  body: string;
  constructor(status: number, msg: string, body: string) {
    super(msg);
    this.status = status;
    this.body = body;
  }
}

async function fetchT(url: string, init: RequestInit, outerSignal?: AbortSignal): Promise<Response> {
  if (outerSignal?.aborted) throw new AdapterError(499, "aborted", "caller-cancelled");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const onOuter = () => ctrl.abort();
  outerSignal?.addEventListener("abort", onOuter, { once: true });
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (err) {
    if (ctrl.signal.aborted) {
      if (outerSignal?.aborted) throw new AdapterError(499, "aborted", "caller-cancelled");
      throw new AdapterError(504, "timeout", `>${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(t);
    outerSignal?.removeEventListener("abort", onOuter);
  }
}

async function openaiCompat(
  url: string,
  key: string,
  model: string,
  req: LLMRequest,
): Promise<string> {
  const resp = await fetchT(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: req.messages,
      max_tokens: req.maxTokens,
      temperature: req.temperature,
      ...(req.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
    }),
  }, req.signal);
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new AdapterError(resp.status, `${resp.status}`, body);
  }
  const data = await resp.json() as { choices?: { message?: { content?: string } }[]; error?: { message: string } };
  if (data.error) throw new AdapterError(400, data.error.message, "");
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new AdapterError(500, "empty-response", "");
  return text;
}

async function callOpenAI(req: LLMRequest): Promise<string> {
  return openaiCompat(
    "https://api.openai.com/v1/chat/completions",
    process.env["OPENAI_API_KEY"]!,
    MODELS.openai,
    req,
  );
}

async function callGroq(req: LLMRequest): Promise<string> {
  return openaiCompat(
    "https://api.groq.com/openai/v1/chat/completions",
    process.env["GROQ_API_KEY"]!,
    MODELS.groq,
    req,
  );
}

async function callCerebras(req: LLMRequest): Promise<string> {
  return openaiCompat(
    "https://api.cerebras.ai/v1/chat/completions",
    process.env["CEREBRAS_API_KEY"]!,
    MODELS.cerebras,
    req,
  );
}

async function callMistral(req: LLMRequest): Promise<string> {
  return openaiCompat(
    "https://api.mistral.ai/v1/chat/completions",
    process.env["MISTRAL_API_KEY"]!,
    MODELS.mistral,
    req,
  );
}

async function callDeepSeek(req: LLMRequest): Promise<string> {
  return openaiCompat(
    "https://api.deepseek.com/chat/completions",
    process.env["DEEPSEEK_API_KEY"]!,
    MODELS.deepseek,
    req,
  );
}

async function callXAI(req: LLMRequest): Promise<string> {
  return openaiCompat(
    "https://api.x.ai/v1/chat/completions",
    process.env["XAI_API_KEY"]!,
    MODELS.xai,
    req,
  );
}

async function callGemini(req: LLMRequest): Promise<string> {
  const key = process.env["GEMINI_API_KEY"]!;
  const sys = req.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const turns = req.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const payload = {
    contents: turns.length ? turns : [{ role: "user", parts: [{ text: "" }] }],
    ...(sys ? { systemInstruction: { parts: [{ text: sys }] } } : {}),
    generationConfig: { maxOutputTokens: req.maxTokens, temperature: req.temperature },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent?key=${key}`;
  const resp = await fetchT(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, req.signal);
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new AdapterError(resp.status, `${resp.status}`, body);
  }
  const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[]; error?: { message: string } };
  if (data.error) throw new AdapterError(400, data.error.message, "");
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  if (!text) throw new AdapterError(500, "empty-response", "");
  return text;
}

async function callCloudflare(req: LLMRequest): Promise<string> {
  const acct  = process.env["CLOUDFLARE_ACCOUNT_ID"]!;
  const token = process.env["CLOUDFLARE_AI_TOKEN"]!;
  const url = `https://api.cloudflare.com/client/v4/accounts/${acct}/ai/run/${MODELS.cloudflare}`;
  const resp = await fetchT(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: req.messages, max_tokens: req.maxTokens, temperature: req.temperature }),
  }, req.signal);
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new AdapterError(resp.status, `${resp.status}`, body);
  }
  const data = await resp.json() as { success?: boolean; result?: { response?: string }; errors?: { message?: string }[] };
  if (data.success === false) {
    throw new AdapterError(500, data.errors?.[0]?.message ?? "cf-error", "");
  }
  const text = (data.result?.response ?? "").trim();
  if (!text) throw new AdapterError(500, "empty-response", "");
  return text;
}

const ADAPTERS: Record<ProviderName, (req: LLMRequest) => Promise<string>> = {
  openai:     callOpenAI,
  groq:       callGroq,
  gemini:     callGemini,
  cerebras:   callCerebras,
  mistral:    callMistral,
  deepseek:   callDeepSeek,
  xai:        callXAI,
  cloudflare: callCloudflare,
};

// ── Router ────────────────────────────────────────────────────────────────────

/**
 * Roteia uma chamada LLM pelo pool especificado.
 * Tenta provedores em ordem, pulando os em cooling.
 * Falha imediata se pool exausto — o caller decide se retenta.
 */
export async function routeLLM(req: LLMRequest): Promise<string> {
  const poolName  = req.pool ?? "chat-live";
  const providers = POOLS[poolName];
  // Default maxTokens generoso pra não truncar respostas
  const reqWithDefaults: LLMRequest = { maxTokens: 1500, temperature: 0.7, ...req, pool: poolName };

  const tried: string[] = [];
  for (const p of providers) {
    if (req.signal?.aborted) {
      const err = new Error("Request aborted by caller");
      err.name = "AbortError";
      throw err;
    }
    if (!hasKey(p)) { tried.push(`${p}=no-key`); continue; }
    if (!isAvailable(p)) {
      const rem = Math.max(0, Math.round((state[p].cooldownUntil - Date.now()) / 1000));
      tried.push(`${p}=cooling-${rem}s`);
      continue;
    }
    state[p].reqCount += 1;
    try {
      const text = await ADAPTERS[p](reqWithDefaults);
      markSuccess(p);
      logger.debug({ provider: p, pool: poolName, chars: text.length }, "llm-router: sucesso");
      return text;
    } catch (err) {
      const ae = err as AdapterError;
      const status = ae.status ?? 500;
      const body   = ae.body ?? String(err);
      setCooling(p, status, body);
      tried.push(`${p}=${status}`);
      logger.warn({ provider: p, pool: poolName, status }, "llm-router: provider falhou");
    }
  }

  throw new Error(`[llm-router] pool="${poolName}" exausto. Tentados: ${tried.join(", ")}`);
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
  return routeLLM({
    messages,
    pool:        opts?.pool,
    maxTokens:   opts?.maxTokens,
    temperature: opts?.temperature,
  });
}

/**
 * Divide texto longo em chunks, processa cada um e sintetiza.
 * Usado quando a entrada excede ~6000 chars (contexto de alguns provedores).
 */
export async function routeLLMChunked(
  chunks: string[],
  systemPrompt: string,
  opts?: { pool?: LLMPool; maxTokens?: number; temperature?: number }
): Promise<string> {
  if (chunks.length === 1) {
    return routeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: chunks[0] },
      ],
      pool:        opts?.pool,
      maxTokens:   opts?.maxTokens ?? 1500,
      temperature: opts?.temperature,
    });
  }

  // Processa cada chunk independentemente
  const partials: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const partial = await routeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: `[Parte ${i + 1}/${chunks.length}]\n${chunks[i]}` },
      ],
      pool:        opts?.pool ?? "batch",
      maxTokens:   opts?.maxTokens ?? 1500,
      temperature: opts?.temperature,
    });
    partials.push(partial);
  }

  // Sintetiza as partes
  return routeLLM({
    messages: [
      { role: "system", content: `${systemPrompt}\n\nSintetize as análises parciais abaixo em uma resposta coesa.` },
      { role: "user",   content: partials.map((p, i) => `[Parte ${i + 1}]\n${p}`).join("\n\n---\n\n") },
    ],
    pool:        opts?.pool ?? "chat-live",
    maxTokens:   (opts?.maxTokens ?? 1500) + 500,
    temperature: opts?.temperature,
  });
}

/**
 * Divide um texto longo em chunks de ~chunkSize chars, respeitando parágrafos.
 */
export function splitIntoChunks(text: string, chunkSize = 5000): string[] {
  if (text.length <= chunkSize) return [text];
  const chunks: string[] = [];
  let pos = 0;
  while (pos < text.length) {
    let end = pos + chunkSize;
    if (end < text.length) {
      // Tenta cortar no parágrafo mais próximo
      const paragraphBreak = text.lastIndexOf("\n\n", end);
      if (paragraphBreak > pos + chunkSize / 2) end = paragraphBreak + 2;
      else {
        const lineBreak = text.lastIndexOf("\n", end);
        if (lineBreak > pos + chunkSize / 2) end = lineBreak + 1;
      }
    }
    chunks.push(text.slice(pos, end).trim());
    pos = end;
  }
  return chunks.filter(Boolean);
}

// ── Estado para admin ─────────────────────────────────────────────────────────

export function getRouterState() {
  const now = Date.now();
  return {
    pools: POOLS,
    providers: (Object.keys(state) as ProviderName[]).map((name) => ({
      name,
      model:      MODELS[name],
      hasKey:     hasKey(name),
      available:  isAvailable(name),
      coolingSecs: state[name].cooldownUntil > now ? Math.ceil((state[name].cooldownUntil - now) / 1000) : 0,
      ...state[name],
    })),
  };
}

/** Limpa cooling de um provedor específico ou de todos. */
export function resetProviderCooling(provider?: string): { reset: string[] } {
  const targets = provider
    ? (state[provider as ProviderName] ? [provider as ProviderName] : [])
    : (Object.keys(state) as ProviderName[]);
  for (const p of targets) {
    state[p].cooldownUntil = 0;
    state[p].consecFails   = 0;
    state[p].lastError     = undefined;
  }
  return { reset: targets };
}
