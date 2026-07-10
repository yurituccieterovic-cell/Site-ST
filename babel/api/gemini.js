// Vercel Serverless — proxy seguro para Gemini 2.0 Flash
// Mantém a API key fora do frontend

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, systemPrompt, stream } = req.body ?? {};
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "GEMINI_API_KEY não configurada" });

  const endpoint = stream
    ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${key}&alt=sse`
    : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  const body = {
    contents: messages ?? [],
    systemInstruction: systemPrompt
      ? { parts: [{ text: systemPrompt }] }
      : undefined,
    generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
  };

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    } else {
      const data = await upstream.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      res.json({ text });
    }
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
