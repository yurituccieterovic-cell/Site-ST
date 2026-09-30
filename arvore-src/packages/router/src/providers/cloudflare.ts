import type { ChatMessage, StreamCallback, ProviderConfig } from "../types.js";

export async function streamCloudflare(
  config: ProviderConfig,
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: StreamCallback,
  signal: AbortSignal
): Promise<{ tokensIn: number; tokensOut: number }> {
  const accountId = process.env["CLOUDFLARE_ACCOUNT_ID"];
  const apiToken  = process.env["CLOUDFLARE_API_TOKEN"];
  if (!accountId || !apiToken) throw new Error("CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN não configurados");

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${config.model}`;

  const body = JSON.stringify({
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body,
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(`Cloudflare ${res.status}: ${err}`), { code: String(res.status), status: res.status });
  }

  if (!res.body) throw new Error("Cloudflare: resposta sem body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
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
        const text = parsed.response;
        if (text) onChunk({ type: "delta", content: text });
      } catch { /* parcial */ }
    }
  }

  // Cloudflare não retorna contagem de tokens no stream
  return { tokensIn: 0, tokensOut: 0 };
}
