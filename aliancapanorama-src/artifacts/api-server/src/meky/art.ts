// Geração de arte a partir dos sonhos da MEKY
// Usa Pollinations.ai — 100% gratuito, sem token, sem rate limit severo
// Sonho → prompt de arte → imagem → arquivo curável

import { db } from "../lib/db.js";
import { mekyArt, mekyDreams } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

// Estilos disponíveis e seus sufixos de prompt
const STYLES: Record<string, string> = {
  aquarela: "watercolor painting, soft colors, flowing brushstrokes, artistic",
  "pixel art": "pixel art, 8-bit, retro game style, colorful",
  gravura: "woodcut print, etching, black and white, high contrast, vintage",
  fotorrealismo: "photorealistic, sharp, detailed, cinematic lighting",
  oleo: "oil painting, impressionist, rich colors, textured brushstrokes",
  sketch: "pencil sketch, hand-drawn, graphite, detailed linework",
  cyberpunk: "cyberpunk, neon lights, dark city, futuristic, rain",
  "arte rupestre": "cave painting, primitive art, ochre, ancient symbols",
};

function buildImageUrl(prompt: string, style: string, seed?: number): string {
  const styleTag = STYLES[style] ?? STYLES["aquarela"];
  const fullPrompt = `${prompt}, ${styleTag}, no text, no watermark`;
  const encoded = encodeURIComponent(fullPrompt);
  const seedParam = seed ? `&seed=${seed}` : "";
  return `${POLLINATIONS_BASE}/${encoded}?width=1024&height=1024&nologo=true${seedParam}`;
}

// Extrair prompt de arte a partir da narrativa do sonho
function narrativeToArtPrompt(narrative: string, symbols: string[]): string {
  // Pega as primeiras 3 frases do sonho como base do prompt visual
  const sentences = narrative.match(/[^.!?]+[.!?]+/g) ?? [narrative];
  const base = sentences.slice(0, 3).join(" ").trim();

  const symbolStr = symbols.slice(0, 4).join(", ");
  return symbolStr ? `${base}. Symbols: ${symbolStr}` : base;
}

export async function generateArtFromDream(
  dreamId: string,
  style = "aquarela",
  customPrompt?: string
): Promise<{ artId: string; imageUrl: string; prompt: string }> {
  const [dream] = await db
    .select()
    .from(mekyDreams)
    .where(eq(mekyDreams.id, dreamId))
    .limit(1);

  if (!dream) throw new Error(`Sonho ${dreamId} não encontrado`);

  const symbols = (dream.symbols as string[]) ?? [];
  const prompt = customPrompt ?? narrativeToArtPrompt(dream.narrative, symbols);
  const seed = Math.floor(Math.random() * 999999);
  const imageUrl = buildImageUrl(prompt, style, seed);

  const [art] = await db
    .insert(mekyArt)
    .values({ dreamId, prompt, imageUrl, style })
    .returning({ id: mekyArt.id });

  // Marcar sonho como tendo arte gerada
  await db
    .update(mekyDreams)
    .set({ artGenerated: true })
    .where(eq(mekyDreams.id, dreamId));

  return { artId: art.id, imageUrl, prompt };
}

// Curar uma obra — Yuri dá título e notas
export async function curateArt(
  artId: string,
  title: string,
  notes?: string
): Promise<void> {
  await db
    .update(mekyArt)
    .set({ curated: true, title, notes: notes ?? null })
    .where(eq(mekyArt.id, artId));
}

// Gerar variações de estilo de uma mesma obra (mesmo prompt, estilos diferentes)
export async function generateStyleVariations(
  dreamId: string,
  styles = ["aquarela", "gravura", "pixel art"]
): Promise<Array<{ artId: string; imageUrl: string; style: string }>> {
  return Promise.all(styles.map((s) => generateArtFromDream(dreamId, s)));
}

// Gerar "escrita à mão" como imagem — texto manuscrito estilizado
export async function generateHandwriting(
  text: string,
  style: "cursive" | "print" | "rough" = "cursive"
): Promise<string> {
  const styleMap = {
    cursive: "elegant cursive handwriting, fountain pen, cream paper, personal letter",
    print: "neat block handwriting, pencil on lined paper, school notebook",
    rough: "rough handwriting, urgent note, ballpoint pen, scrawled",
  };
  const prompt = `Handwritten text saying exactly: "${text}". ${styleMap[style]}. Close up, high detail, realistic.`;
  return buildImageUrl(prompt, "fotorrealismo");
}

export { STYLES };
