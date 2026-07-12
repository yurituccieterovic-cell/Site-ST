import { Router } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { db } from "@workspace/db";
import { exercisesTable, exerciseAttemptsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";
import { canAccess, isInAllowedSubtree } from "../lib/canAccess";
import { getAllNodes } from "../lib/nodeCache";

const router = Router();

const generationInProgress = new Set<string>();

// Rate limit por userId (não por IP) — express-rate-limit limpa automaticamente
const generateRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 5,
  keyGenerator: (req) => `gen:${(req.session as { userId?: number }).userId ?? ipKeyGenerator(req) ?? "anon"}`,
  message: { error: "Muitas requisições de geração. Tente novamente em breve." },
  standardHeaders: true,
  legacyHeaders: false,
});

const attemptRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 60,
  keyGenerator: (req) => `att:${(req.session as { userId?: number }).userId ?? ipKeyGenerator(req) ?? "anon"}`,
  message: { error: "Muitas tentativas. Tente novamente em breve." },
  standardHeaders: true,
  legacyHeaders: false,
});

async function generateExercises(nodeCode: string, nodeTitle: string, nodeContent: string | null) {
  const prompt = `Você é um professor especialista no vestibular FUVEST integrado ao ecossistema PAP da Sociedade Tucci.
${PRINCIPIOS_ECOSSYSTEMMA}
Crie exatamente 3 questões de múltipla escolha sobre o tema: "${nodeTitle}".
Aplique o Princípio 8 (ciclo ético contínuo): as questões devem ser pedagogicamente justas e acessíveis a estudantes de diferentes contextos socioeconômicos.

Contexto do tema: ${nodeContent ?? nodeTitle}

Retorne APENAS um array JSON válido com exatamente 3 objetos. Cada objeto deve ter:
- "question": string com a pergunta
- "options": array com exatamente 4 strings (alternativas A, B, C, D)
- "correctOption": número inteiro 0-3 (índice da resposta correta no array options)
- "explanation": string curta explicando a resposta correta

Exemplo de formato:
[
  {
    "question": "O que é X?",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctOption": 1,
    "explanation": "A opção B está correta porque..."
  }
]

Retorne SOMENTE o array JSON, sem texto adicional, sem markdown.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content ?? "[]";
  const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = JSON.parse(cleanText) as Array<{
    question: string;
    options: string[];
    correctOption: number;
    explanation: string;
  }>;

  const inserted: typeof exercisesTable.$inferSelect[] = [];
  for (const q of parsed.slice(0, 3)) {
    const [ex] = await db
      .insert(exercisesTable)
      .values({
        nodeCode,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
      })
      .returning();
    if (ex) inserted.push(ex);
  }
  return inserted;
}

router.get("/exercises", generateRateLimit, async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  const tier = req.session.userTier ?? 0;
  if (tier < 1) {
    res.status(403).json({ error: "Exercícios disponíveis a partir do nível Aluno I" });
    return;
  }

  const nodeCode = String(req.query["nodeCode"] ?? "");
  if (!nodeCode) {
    res.status(400).json({ error: "nodeCode obrigatório" });
    return;
  }

  if (!canAccess(nodeCode, tier)) {
    res.status(403).json({ error: "Acesso negado para o seu nível de conta" });
    return;
  }

  const { map: nodeMap } = await getAllNodes();

  if (!isInAllowedSubtree(nodeCode, nodeMap, tier)) {
    res.status(403).json({ error: "Acesso negado para o seu nível de conta" });
    return;
  }

  const node = nodeMap.get(nodeCode);

  if (!node) {
    res.status(404).json({ error: "Nó não encontrado" });
    return;
  }

  let exercises = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.nodeCode, nodeCode))
    .limit(3);

  if (exercises.length < 3) {
    if (generationInProgress.has(nodeCode)) {
      if (exercises.length === 0) {
        res.status(503).json({ error: "Exercícios sendo gerados, tente novamente em instantes" });
        return;
      }
    } else {
      generationInProgress.add(nodeCode);
      try {
        exercises = await generateExercises(nodeCode, node.title, node.content);
      } catch (err) {
        req.log.error({ err }, "Failed to generate exercises");
        if (exercises.length === 0) {
          res.status(503).json({ error: "Não foi possível gerar exercícios agora" });
          return;
        }
      } finally {
        generationInProgress.delete(nodeCode);
      }
    }
  }

  res.json(
    exercises.map((e) => ({
      id: e.id,
      nodeCode: e.nodeCode,
      question: e.question,
      options: e.options as string[],
    }))
  );
});

router.post("/exercises/attempt", attemptRateLimit, async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  const tier = req.session.userTier ?? 0;
  if (tier < 1) {
    res.status(403).json({ error: "Exercícios disponíveis a partir do nível Aluno I" });
    return;
  }

  const { exerciseId, selectedOption } = req.body as { exerciseId: number; selectedOption: number };

  if (exerciseId === undefined || selectedOption === undefined) {
    res.status(400).json({ error: "exerciseId e selectedOption são obrigatórios" });
    return;
  }

  const [exercise] = await db
    .select()
    .from(exercisesTable)
    .where(eq(exercisesTable.id, exerciseId))
    .limit(1);

  if (!exercise) {
    res.status(404).json({ error: "Exercício não encontrado" });
    return;
  }

  if (!canAccess(exercise.nodeCode, tier)) {
    res.status(403).json({ error: "Acesso negado para o seu nível de conta" });
    return;
  }

  const { map: attemptNodeMap } = await getAllNodes();
  if (!isInAllowedSubtree(exercise.nodeCode, attemptNodeMap, tier)) {
    res.status(403).json({ error: "Acesso negado para o seu nível de conta" });
    return;
  }

  const correct = selectedOption === exercise.correctOption ? 1 : 0;

  await db.insert(exerciseAttemptsTable).values({
    userId: req.session.userId,
    exerciseId,
    nodeCode: exercise.nodeCode,
    selectedOption,
    correct,
  });

  res.json({
    correct: correct === 1,
    correctOption: exercise.correctOption,
    explanation: exercise.explanation,
  });
});

// GET /api/score — pontuação total do usuário (PSEUDO2 seção 3)
// score = Σ(nodeCode.length × 10) por cada exercise_attempt correto
router.get("/score", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "Autenticação necessária" });
    return;
  }

  // GROUP BY (exerciseId, nodeCode) para deduplicar: conta 1 por exercise, não por tentativa
  const attempts = await db
    .select({ nodeCode: exerciseAttemptsTable.nodeCode, exerciseId: exerciseAttemptsTable.exerciseId })
    .from(exerciseAttemptsTable)
    .where(and(
      eq(exerciseAttemptsTable.userId, userId),
      eq(exerciseAttemptsTable.correct, 1),
    ))
    .groupBy(exerciseAttemptsTable.exerciseId, exerciseAttemptsTable.nodeCode);

  const score = attempts.reduce((sum, a) => sum + a.nodeCode.length * 10, 0);
  res.json({ score, correctAttempts: attempts.length });
});

export default router;
