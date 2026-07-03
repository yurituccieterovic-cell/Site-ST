import { Router } from "express";
import { db } from "@workspace/db";
import { mekyMemory, mekyDreams, mekyArt } from "@workspace/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { runDreamCycle, consolidateEvents } from "../meky/dreams.js";
import { generateArtFromDream, curateArt, generateStyleVariations, STYLES } from "../meky/art.js";

export const mekyMemoryRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.user || req.session.user.tier < 5) {
    return res.status(403).json({ error: "forbidden" });
  }
  next();
}

function requireMekyOrAdmin(req: any, res: any, next: any) {
  const isAdmin = req.session?.user?.tier >= 5;
  const isRobot = req.headers["x-meky-token"] === process.env.MEKY_TOKEN;
  if (!isAdmin && !isRobot) return res.status(401).json({ error: "unauthorized" });
  next();
}

// --- MEMÓRIA ---

// GET /api/meky/memory?limit=20&offset=0
mekyMemoryRouter.get("/memory", requireAdmin, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const memories = await db
    .select()
    .from(mekyMemory)
    .orderBy(desc(mekyMemory.createdAt))
    .limit(limit)
    .offset(offset);
  res.json({ memories, limit, offset });
});

// POST /api/meky/memory/consolidate
// Body: { eventDescriptions: string[], eventIds: string[] }
mekyMemoryRouter.post("/memory/consolidate", requireMekyOrAdmin, async (req, res) => {
  const { eventDescriptions, eventIds } = req.body;
  if (!Array.isArray(eventDescriptions) || eventDescriptions.length === 0) {
    return res.status(400).json({ error: "eventDescriptions obrigatório" });
  }
  const result = await consolidateEvents(eventDescriptions, eventIds ?? []);
  res.json(result);
});

// PATCH /api/meky/memory/:id/preserve — proteger memória de limpeza automática
mekyMemoryRouter.patch("/memory/:id/preserve", requireAdmin, async (req, res) => {
  const { preserved } = req.body;
  await db
    .update(mekyMemory)
    .set({ preserved: preserved ? 1 : 0 })
    .where(eq(mekyMemory.id, req.params.id));
  res.json({ ok: true });
});

// --- SONHOS ---

// GET /api/meky/dreams?limit=10
mekyMemoryRouter.get("/dreams", requireAdmin, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const dreams = await db
    .select()
    .from(mekyDreams)
    .orderBy(desc(mekyDreams.triggeredAt))
    .limit(limit);
  res.json({ dreams });
});

// GET /api/meky/dreams/:id
mekyMemoryRouter.get("/dreams/:id", requireAdmin, async (req, res) => {
  const [dream] = await db
    .select()
    .from(mekyDreams)
    .where(eq(mekyDreams.id, req.params.id))
    .limit(1);
  if (!dream) return res.status(404).json({ error: "not found" });
  const arts = await db
    .select()
    .from(mekyArt)
    .where(eq(mekyArt.dreamId, req.params.id));
  res.json({ dream, arts });
});

// POST /api/meky/dreams/run — dispara ciclo de sonho manualmente
mekyMemoryRouter.post("/dreams/run", requireMekyOrAdmin, async (req, res) => {
  const result = await runDreamCycle();
  res.json(result);
});

// --- ARTE ---

// GET /api/meky/art?curated=true
mekyMemoryRouter.get("/art", requireAdmin, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const works = await db
    .select()
    .from(mekyArt)
    .orderBy(desc(mekyArt.createdAt))
    .limit(limit);
  res.json({ works, styles: Object.keys(STYLES) });
});

// POST /api/meky/art/generate
// Body: { dreamId: string, style?: string, prompt?: string }
mekyMemoryRouter.post("/art/generate", requireAdmin, async (req, res) => {
  const { dreamId, style, prompt } = req.body;
  if (!dreamId) return res.status(400).json({ error: "dreamId obrigatório" });
  const result = await generateArtFromDream(dreamId, style, prompt);
  res.json(result);
});

// POST /api/meky/art/variations
// Body: { dreamId: string, styles?: string[] }
mekyMemoryRouter.post("/art/variations", requireAdmin, async (req, res) => {
  const { dreamId, styles } = req.body;
  if (!dreamId) return res.status(400).json({ error: "dreamId obrigatório" });
  const results = await generateStyleVariations(dreamId, styles);
  res.json({ variations: results });
});

// PATCH /api/meky/art/:id/curate — Yuri cura uma obra
mekyMemoryRouter.patch("/art/:id/curate", requireAdmin, async (req, res) => {
  const { title, notes } = req.body;
  if (!title) return res.status(400).json({ error: "title obrigatório" });
  await curateArt(req.params.id, title, notes);
  res.json({ ok: true });
});
