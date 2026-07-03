// Gemini Flash 1.5 Vision — gratuito, 1M tokens/dia
// Usado para: descrever imagens, OCR, leitura de CAPTCHA, reconhecimento de escrita

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function geminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY não configurada");
  return key;
}

async function callGeminiVision(prompt: string, imageBase64: string, mimeType = "image/jpeg") {
  const res = await fetch(`${GEMINI_API_URL}?key=${geminiKey()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini Vision error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Descrever qualquer imagem em linguagem natural
export async function describeImage(imageBase64: string, mimeType?: string): Promise<string> {
  return callGeminiVision(
    "Descreva o que você vê nesta imagem de forma detalhada e objetiva. " +
      "Mencione objetos, pessoas, animais, cores, ambiente e qualquer texto visível.",
    imageBase64,
    mimeType
  );
}

// OCR — extrair texto de imagem (documentos, placas, rótulos)
export async function readTextFromImage(imageBase64: string, mimeType?: string): Promise<string> {
  return callGeminiVision(
    "Extraia e transcreva TODO o texto visível nesta imagem exatamente como aparece, " +
      "preservando quebras de linha e formatação. " +
      "Responda apenas com o texto extraído, sem comentários adicionais.",
    imageBase64,
    mimeType
  );
}

// Leitura de CAPTCHA — retorna apenas os caracteres
export async function solveCaptcha(imageBase64: string, mimeType?: string): Promise<string> {
  const raw = await callGeminiVision(
    "Esta imagem é um CAPTCHA de verificação humana. " +
      "Leia os caracteres exibidos e responda APENAS com eles, sem espaços, sem pontuação, sem explicação. " +
      "Exemplo de resposta: 'X7K2mP'",
    imageBase64,
    mimeType
  );
  // Limpar espaços e aspas que o modelo pode incluir
  return raw.trim().replace(/['"]/g, "");
}

// Reconhecimento de escrita manual — interpreta texto manuscrito
export async function readHandwriting(imageBase64: string, mimeType?: string): Promise<string> {
  return callGeminiVision(
    "Esta imagem contém texto escrito à mão. " +
      "Transcreva o texto manuscrito exatamente como está, preservando erros ortográficos e pontuação original. " +
      "Responda apenas com a transcrição.",
    imageBase64,
    mimeType
  );
}

// Análise para memória — extrai eventos significativos de uma cena
export async function analyzeSceneForMemory(imageBase64: string, context?: string): Promise<{
  description: string;
  tags: string[];
  significance: number; // 0-10
}> {
  const prompt =
    `Analise esta cena capturada por um robô de vigilância chamado MEKY.` +
    (context ? ` Contexto adicional: ${context}.` : "") +
    ` Responda em JSON com exatamente este formato:
{
  "description": "descrição do evento em 1-2 frases",
  "tags": ["tag1", "tag2"],
  "significance": 7
}
Tags possíveis: fauna, segurança, pessoa, veículo, clima, fogo, água, anomalia, rotina.
Significance: 0 = irrelevante, 10 = emergência crítica.`;

  const raw = await callGeminiVision(prompt, imageBase64);
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(match?.[0] ?? raw);
  } catch {
    return { description: raw.trim(), tags: [], significance: 3 };
  }
}
