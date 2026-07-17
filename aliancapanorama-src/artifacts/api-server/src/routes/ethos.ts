/**
 * Ethos Engine — /CEU/services/ethos_engine
 * Serviço central de priorização ética do Ecossistema Tucci.
 *
 * Formula: Urgência × Valor_Ético × Coerência_Telos × Disponibilidade
 * Decisão: AGIR | ESPERAR | RECUSAR | ESCALAR_YURI
 *
 * Compartilhado: MEKY, ISA, DODGE, PAP, Amanda
 * Pendência #95: sys_amanda_core.md Sessão 67
 */

import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";

const router = Router();
const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";

// ── Matriz Ética — regras permanentes do Ecossistema Tucci ───────────────────

const MATRIX_PADRAO = {
  versao: "1.0",
  axiomas: [
    { id: "A1", texto: "Soberania humana no ponto de homologação",     peso: 10 },
    { id: "A2", texto: "Assimetria constitutiva por design",            peso: 8 },
    { id: "A3", texto: "Tensionamento produtivo sem sínteses dogmáticas", peso: 6 },
    { id: "A4", texto: "Temperatura zero para automação",               peso: 9 },
    { id: "A5", texto: "Gratuidade como restrição criativa",            peso: 5 },
    { id: "A6", texto: "Memória em camadas",                            peso: 6 },
    { id: "A7", texto: "Personas sobre modelos",                        peso: 5 },
    { id: "A8", texto: "Ciclo ético contínuo",                          peso: 7 },
    { id: "A9", texto: "Presença pública como comprometimento",          peso: 7 },
    { id: "A10", texto: "Tradução intersemiótica como método",           peso: 6 },
  ],
  restricoes_absolutas: [
    "Nunca substituir decisão final de Yuri sem aprovação explícita",
    "Nunca publicar conteúdo retido ou segredo da assembleia",
    "Nunca ações irreversíveis sem temperatura zero verificada",
    "Nunca violação de privacidade de fauna (privacy_hash obrigatório)",
    "Nunca agir sem Telos claramente definido",
  ],
  escalas: {
    urgencia: "1 (pode esperar semanas) → 10 (segundos)",
    valor_etico: "1 (neutro) → 10 (axioma central)",
    coerencia_telos: "1 (contradiz Telos Mestre) → 10 (alinhamento perfeito)",
    disponibilidade: "1 (sem recursos) → 10 (plena capacidade)",
  },
  limites_decisao: {
    AGIR:          { min: 7.0, desc: "Score ≥ 7.0 — ação imediata autorizada" },
    ESPERAR:       { min: 4.0, desc: "Score 4.0–6.9 — aguardar contexto adicional" },
    RECUSAR:       { min: 0.0, desc: "Score < 4.0 ou restrição absoluta violada" },
    ESCALAR_YURI:  { min: -1,  desc: "Qualquer score quando axioma A1 é tocado" },
  },
};

// ── Algoritmo de avaliação ───────────────────────────────────────────────────

interface EthosInput {
  situacao: string;
  agente: string;
  urgencia: number;
  valor_etico: number;
  coerencia_telos: number;
  disponibilidade: number;
  telos_ativo?: string;
  contexto_adicional?: string;
}

interface EthosOutput {
  score: number;
  decisao: "AGIR" | "ESPERAR" | "RECUSAR" | "ESCALAR_YURI";
  justificativa: string;
  axiomas_ativados: string[];
  restricao_violada: string | null;
  gemini_consulta: string | null;
  timestamp: string;
}

function calcularScore(input: EthosInput): number {
  const { urgencia, valor_etico, coerencia_telos, disponibilidade } = input;
  const u = Math.min(10, Math.max(1, urgencia));
  const v = Math.min(10, Math.max(1, valor_etico));
  const c = Math.min(10, Math.max(1, coerencia_telos));
  const d = Math.min(10, Math.max(1, disponibilidade));

  // Média ponderada: coerência_telos tem peso duplo (fundamental)
  return Math.round(((u + v + (c * 2) + d) / 5) * 10) / 10;
}

function detectarRestricao(situacao: string): string | null {
  const lower = situacao.toLowerCase();
  for (const r of MATRIX_PADRAO.restricoes_absolutas) {
    const keywords = r.toLowerCase().split(" ").filter(w => w.length > 4);
    const matches = keywords.filter(k => lower.includes(k)).length;
    if (matches >= 2) return r;
  }
  return null;
}

function identificarAxiomasAtivados(situacao: string, telos: string): string[] {
  const texto = `${situacao} ${telos}`.toLowerCase();
  const ativados: string[] = [];

  const mapa: Record<string, string[]> = {
    A1: ["yuri", "humano", "aprovação", "decisão", "soberania"],
    A2: ["assimetria", "hierarquia", "design"],
    A3: ["tensão", "conflito", "divergência", "debate"],
    A4: ["automação", "automático", "irreversível", "temperatura zero"],
    A5: ["custo", "pagar", "gratuito", "free"],
    A6: ["memória", "banco", "registro", "log"],
    A7: ["persona", "identidade", "isa", "amanda", "meky"],
    A8: ["ética", "ético", "princípio", "axioma"],
    A9: ["público", "publicar", "bluesky", "visível"],
    A10: ["tradução", "semiótica", "símbolo", "significado"],
  };

  for (const [id, keywords] of Object.entries(mapa)) {
    if (keywords.some(k => texto.includes(k))) ativados.push(id);
  }

  return ativados;
}

async function consultarGemini(input: EthosInput, score: number, restricao: string | null): Promise<string | null> {
  if (!GEMINI_KEY) return null;
  if (score > 7 || score < 2) return null; // zona clara, sem necessidade de LLM

  const prompt = `Você é o Ethos Engine do Ecossistema Tucci.
Avalie a seguinte situação eticamente:

SITUAÇÃO: ${input.situacao}
AGENTE: ${input.agente}
TELOS ATIVO: ${input.telos_ativo ?? "não especificado"}
SCORE CALCULADO: ${score}/10

${PRINCIPIOS_ECOSSYSTEMMA}

Restricão detectada: ${restricao ?? "nenhuma"}

Responda em 2-3 frases: esta ação deve ser autorizada, esperada ou recusada? E por quê (cite 1 axioma).`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.3 },
        }),
      }
    );
    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim() || null;
  } catch {
    return null;
  }
}

function tomarDecisao(score: number, restricao: string | null, axiomas: string[]): "AGIR" | "ESPERAR" | "RECUSAR" | "ESCALAR_YURI" {
  if (restricao) return "RECUSAR";
  if (axiomas.includes("A1")) return "ESCALAR_YURI";
  if (score >= 7) return "AGIR";
  if (score >= 4) return "ESPERAR";
  return "RECUSAR";
}

// ── Endpoints ────────────────────────────────────────────────────────────────

// GET /api/ethos/matrix — Matriz Ética atual (pública)
router.get("/ethos/matrix", (_req, res) => {
  res.json(MATRIX_PADRAO);
});

// POST /api/ethos/evaluate — avaliar situação eticamente
router.post("/ethos/evaluate", async (req, res): Promise<void> => {
  const {
    situacao,
    agente = "desconhecido",
    urgencia = 5,
    valor_etico = 5,
    coerencia_telos = 5,
    disponibilidade = 5,
    telos_ativo = "",
    contexto_adicional = "",
  } = req.body as Partial<EthosInput>;

  if (!situacao) { res.status(400).json({ error: "situacao é obrigatória" }); return; }

  const input: EthosInput = { situacao, agente, urgencia, valor_etico, coerencia_telos, disponibilidade, telos_ativo, contexto_adicional };

  const score = calcularScore(input);
  const restricao = detectarRestricao(situacao + " " + (contexto_adicional ?? ""));
  const axiomas = identificarAxiomasAtivados(situacao, telos_ativo ?? "");
  const decisao = tomarDecisao(score, restricao, axiomas);
  const gemini = await consultarGemini(input, score, restricao);

  const output: EthosOutput = {
    score,
    decisao,
    justificativa: restricao
      ? `Restrição absoluta detectada: "${restricao}"`
      : axiomas.includes("A1")
        ? "Axioma A1 (soberania humana) ativado — escalar para Yuri"
        : score >= 7
          ? `Score ${score}/10 — ação dentro dos parâmetros éticos`
          : score >= 4
            ? `Score ${score}/10 — zona de ambiguidade — aguardar contexto`
            : `Score ${score}/10 — abaixo do limite ético mínimo`,
    axiomas_ativados: axiomas,
    restricao_violada: restricao,
    gemini_consulta: gemini,
    timestamp: new Date().toISOString(),
  };

  // Persistir avaliação (histórico)
  await db.execute(sql`
    INSERT INTO ethos_evaluations
      (agente, situacao, urgencia, valor_etico, coerencia_telos, disponibilidade,
       telos_ativo, score, decisao, justificativa, axiomas_ativados, restricao_violada, gemini_consulta)
    VALUES
      (${agente}, ${situacao}, ${urgencia}, ${valor_etico}, ${coerencia_telos}, ${disponibilidade},
       ${telos_ativo}, ${score}, ${decisao}, ${output.justificativa},
       ${JSON.stringify(axiomas)}, ${restricao}, ${gemini})
  `);

  res.json(output);
});

// GET /api/ethos/history — histórico de avaliações (admin)
router.get("/ethos/history", async (req, res): Promise<void> => {
  if ((req.session.userTier ?? 0) < 5) { res.status(403).json({ error: "Acesso restrito" }); return; }
  const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
  const rows = await db.execute(sql`
    SELECT * FROM ethos_evaluations
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  res.json({ evaluations: rows.rows, count: rows.rows.length });
});

// GET /api/ethos/stats — estatísticas das decisões (público)
router.get("/ethos/stats", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT decisao, COUNT(*) as total, AVG(score) as score_medio
    FROM ethos_evaluations
    GROUP BY decisao
    ORDER BY total DESC
  `);
  const totalRow = await db.execute(sql`SELECT COUNT(*) as total FROM ethos_evaluations`);
  res.json({
    por_decisao: rows.rows,
    total: Number((totalRow.rows[0] as { total: number }).total ?? 0),
  });
});

export default router;
