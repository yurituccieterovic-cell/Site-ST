import type { ChatMessage, StreamCallback, ProviderConfig } from "../types.js";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function streamOpenRouter(
  config: ProviderConfig,
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: StreamCallback,
  signal: AbortSignal
): Promise<{ tokensIn: number; tokensOut: number }> {
  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

  const body = JSON.stringify({
    model: config.model,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://site-st.vercel.app",
      "X-Title": "Árvore Oracular",
    },
    body,
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    const retryAfter = res.headers.get("retry-after");
    const e = Object.assign(new Error(`OpenRouter ${res.status}: ${err}`), {
      code: String(res.status),
      status: res.status,
      retryAfter: retryAfter ? Number(retryAfter) : undefined,
    });
    throw e;
  }

  if (!res.body) throw new Error("OpenRouter: resposta sem body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let tokensIn = 0;
  let tokensOut = 0;
  let buf = "";

  onChunk({ type: "delta", content: "", provider: config.name, voice: config.voice, model: config.model });

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) onChunk({ type: "delta", content: delta });
        if (parsed.usage) {
          tokensIn  = parsed.usage.prompt_tokens ?? 0;
          tokensOut = parsed.usage.completion_tokens ?? 0;
        }
      } catch { /* parcial */ }
    }
  }

  return { tokensIn, tokensOut };
}
