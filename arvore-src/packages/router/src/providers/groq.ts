import type { ChatMessage, StreamCallback, ProviderConfig } from "../types.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function streamGroq(
  config: ProviderConfig,
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: StreamCallback,
  signal: AbortSignal
): Promise<{ tokensIn: number; tokensOut: number }> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) throw new Error("GROQ_API_KEY não configurada");

  const body = JSON.stringify({
    model: config.model,
    stream: true,
    max_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body,
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    const code = String(res.status);
    throw Object.assign(new Error(`Groq ${res.status}: ${err}`), { code, status: res.status });
  }

  if (!res.body) throw new Error("Groq: resposta sem body");

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
      } catch { /* linha parcial */ }
    }
  }

  return { tokensIn, tokensOut };
}
