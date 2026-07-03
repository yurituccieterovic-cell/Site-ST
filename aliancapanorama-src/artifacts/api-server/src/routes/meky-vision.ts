import { Router } from "express";
import {
  describeImage,
  readTextFromImage,
  solveCaptcha,
  readHandwriting,
  analyzeSceneForMemory,
} from "../meky/vision.js";
import { generateHandwriting } from "../meky/art.js";

export const mekyVisionRouter = Router();

// Middleware: requer sessão admin OU X-Meky-Token (robô enviando imagem de câmera)
function requireVisionAuth(req: any, res: any, next: any) {
  const isAdmin = req.session?.user?.tier >= 5;
  const isRobot = req.headers["x-meky-token"] === process.env.MEKY_TOKEN;
  if (!isAdmin && !isRobot) return res.status(401).json({ error: "unauthorized" });
  next();
}

// POST /api/meky/vision/describe
// Body: { image: "<base64>", mimeType?: "image/jpeg" }
mekyVisionRouter.post("/vision/describe", requireVisionAuth, async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: "image (base64) obrigatório" });
  const description = await describeImage(image, mimeType);
  res.json({ description });
});

// POST /api/meky/vision/ocr
// Body: { image: "<base64>", mimeType?: string }
mekyVisionRouter.post("/vision/ocr", requireVisionAuth, async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: "image obrigatório" });
  const text = await readTextFromImage(image, mimeType);
  res.json({ text });
});

// POST /api/meky/vision/captcha
// Body: { image: "<base64>" }
mekyVisionRouter.post("/vision/captcha", requireVisionAuth, async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: "image obrigatório" });
  const solution = await solveCaptcha(image, mimeType);
  res.json({ solution });
});

// POST /api/meky/vision/handwriting
// Body: { image: "<base64>" }
mekyVisionRouter.post("/vision/handwriting", requireVisionAuth, async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: "image obrigatório" });
  const transcription = await readHandwriting(image, mimeType);
  res.json({ transcription });
});

// POST /api/meky/vision/scene
// Body: { image: "<base64>", context?: string }
// Analisa cena para memória — retorna description, tags, significance
mekyVisionRouter.post("/vision/scene", requireVisionAuth, async (req, res) => {
  const { image, context, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: "image obrigatório" });
  const analysis = await analyzeSceneForMemory(image, context);
  res.json(analysis);
});

// POST /api/meky/vision/write
// Gera imagem de texto escrito à mão
// Body: { text: string, style?: "cursive"|"print"|"rough" }
mekyVisionRouter.post("/vision/write", requireVisionAuth, async (req, res) => {
  const { text, style = "cursive" } = req.body;
  if (!text) return res.status(400).json({ error: "text obrigatório" });
  const imageUrl = await generateHandwriting(text, style);
  res.json({ imageUrl });
});
