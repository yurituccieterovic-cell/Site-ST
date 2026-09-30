import type { ChatMessage, StreamCallback, ProviderConfig } from "../types.js";

// Gemini 2.0 Flash via REST (não usa SDK para manter dependências mínimas)
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export async function streamGemini(
  config: ProviderConfig,
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: StreamCallback,
  signal: AbortSignal
): Promise<{ tokensIn: number; tokensOut: number }> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");

  // Gemini usa "contents" com role=user/model (não system)
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 2048 },
  });

  const url = `${GEMINI_API_BASE}/${config.model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw Object.assign(new Error(`Gemini ${res.status}: ${err}`), { code: String(res.status), status: res.status });
  }

  if (!res.body) throw new Error("Gemini: resposta sem body");

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
      try {
        const parsed = JSON.parse(data);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onChunk({ type: "delta", content: text });
        const meta = parsed.usageMetadata;
        if (meta) {
          tokensIn  = meta.promptTokenCount ?? 0;
          tokensOut = meta.candidatesTokenCount ?? 0;
        }
      } catch { /* parcial */ }
    }
  }

  return { tokensIn, tokensOut };
}
