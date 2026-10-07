// Síntese de fala via OpenAI TTS. Usado pelo SABIÁ no Age e potencialmente
// por outras IAs do ecossistema. Se OPENAI_API_KEY ausente, lança erro e o
// frontend cai automaticamente para a voz nativa do navegador (grátis).

const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";
const MAX_TTS_CHARS = 4000;

export const DEFAULT_TTS_VOICE = "nova"; // voz feminina, adequada para SABIÁ
const ALLOWED_VOICES = new Set([
  "alloy", "ash", "ballad", "coral", "echo", "fable",
  "nova", "onyx", "sage", "shimmer", "verse",
]);

export interface TtsResult {
  audio: Buffer;
  contentType: string;
}

export async function synthesizeSpeech(
  text: string,
  voice: string = DEFAULT_TTS_VOICE,
): Promise<TtsResult> {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) throw new Error("OPENAI_API_KEY ausente");

  const clean = (text || "").trim().slice(0, MAX_TTS_CHARS);
  if (!clean) throw new Error("texto vazio");

  const safeVoice = ALLOWED_VOICES.has(voice) ? voice : DEFAULT_TTS_VOICE;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(OPENAI_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: safeVoice,
        input: clean,
        response_format: "mp3",
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`OpenAI TTS ${res.status}: ${detail.slice(0, 200)}`);
    }
    const arrayBuf = await res.arrayBuffer();
    return { audio: Buffer.from(arrayBuf), contentType: "audio/mpeg" };
  } finally {
    clearTimeout(timeout);
  }
}
