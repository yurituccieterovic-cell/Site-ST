/**
 * routes/telos.ts — Telos como Objeto Computacional v3.2
 *
 * Telos: vetor de orientação que transforma axiomas, ética, memória,
 * contexto e intenção em ação concreta e situada.
 *
 * Pendência #84: formalizar schema com todos os campos definidos na Sessão 45.
 */

import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { runMorfeu } from "../isa/morfeu";

const router = Router();

function requireAdmin(
  req: Parameters<Parameters<typeof router.get>[1]>[0],
  res: Parameters<Parameters<typeof router.get>[1]>[1]
): boolean {
  if ((req.session.userTier ?? 0) < 5) {
    res.status(403).json({ error: "Acesso restrito" });
    return false;
  }
  return true;
}

// ── Telos Objects ────────────────────────────────────────────────────────────

// GET /api/telos/objects — lista (público: só os campos essenciais)
router.get("/telos/objects", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT id, tipo, identificador, objetivo, modo, temperatura,
           agente_responsavel, restricoes_eticas, axiomas_prioritarios,
           contextos_ativacao, criterios_sucesso, criterios_interrupcao,
           created_at, updated_at
    FROM telos_objects
    ORDER BY tipo, created_at DESC
  `);
  res.json({ objects: rows.rows, count: rows.rows.length });
});

// GET /api/telos/objects/:id — detalhe completo
router.get("/telos/objects/:id", async (req, res): Promise<void> => {
  const { id } = req.params;
  const rows = await db.execute(sql`
    SELECT * FROM telos_objects WHERE id = ${id}
  `);
  if (!rows.rows.length) { res.status(404).json({ error: "Não encontrado" }); return; }
  res.json(rows.rows[0]);
});

// POST /api/telos/objects — criar telos (admin tier 5+)
router.post("/telos/objects", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const {
    tipo = "situacional",
    identificador,
    objetivo,
    modo = "",
    restricoes_eticas = [],
    axiomas_prioritarios = [],
    contextos_ativacao = [],
    criterios_sucesso = [],
    criterios_interrupcao = [],
    memorias_consultadas = [],
    memorias_produzidas = [],
    agente_responsavel = null,
    temperatura = "baixa",
  } = req.body as {
    tipo?: string;
    identificador?: string;
    objetivo?: string;
    modo?: string;
    restricoes_eticas?: string[];
    axiomas_prioritarios?: string[];
    contextos_ativacao?: string[];
    criterios_sucesso?: string[];
    criterios_interrupcao?: string[];
    memorias_consultadas?: string[];
    memorias_produzidas?: string[];
    agente_responsavel?: string | null;
    temperatura?: string;
  };

  if (!objetivo) { res.status(400).json({ error: "objetivo é obrigatório" }); return; }
  if (!identificador) { res.status(400).json({ error: "identificador é obrigatório" }); return; }

  const rows = await db.execute(sql`
    INSERT INTO telos_objects
      (tipo, identificador, objetivo, modo,
       restricoes_eticas, axiomas_prioritarios, contextos_ativacao,
       criterios_sucesso, criterios_interrupcao,
       memorias_consultadas, memorias_produzidas,
       agente_responsavel, temperatura)
    VALUES
      (${tipo}, ${identificador}, ${objetivo}, ${modo},
       ${JSON.stringify(restricoes_eticas)}, ${JSON.stringify(axiomas_prioritarios)},
       ${JSON.stringify(contextos_ativacao)}, ${JSON.stringify(criterios_sucesso)},
       ${JSON.stringify(criterios_interrupcao)}, ${JSON.stringify(memorias_consultadas)},
       ${JSON.stringify(memorias_produzidas)}, ${agente_responsavel}, ${temperatura})
    RETURNING *
  `);

  res.status(201).json(rows.rows[0]);
});

// PATCH /api/telos/objects/:id — atualizar campos
router.patch("/telos/objects/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { id } = req.params;

  const fields = req.body as Record<string, unknown>;
  const allowed = [
    "objetivo", "modo", "restricoes_eticas", "axiomas_prioritarios",
    "contextos_ativacao", "criterios_sucesso", "criterios_interrupcao",
    "memorias_consultadas", "memorias_produzidas", "agente_responsavel", "temperatura",
  ];

  const setClauses = Object.entries(fields)
    .filter(([k]) => allowed.includes(k))
    .map(([k, v]) => `${k} = '${typeof v === "object" ? JSON.stringify(v) : String(v)}'`)
    .join(", ");

  if (!setClauses) { res.status(400).json({ error: "Nenhum campo válido para atualizar" }); return; }

  const rows = await db.execute(sql`
    UPDATE telos_objects
    SET updated_at = NOW(), ${sql.raw(setClauses)}
    WHERE id = ${id}
    RETURNING *
  `);

  if (!rows.rows.length) { res.status(404).json({ error: "Não encontrado" }); return; }
  res.json(rows.rows[0]);
});

// DELETE /api/telos/objects/:id — remover (só superadm)
router.delete("/telos/objects/:id", async (req, res): Promise<void> => {
  if ((req.session.userTier ?? 0) < 9) { res.status(403).json({ error: "Superadm necessário" }); return; }
  const { id } = req.params;
  await db.execute(sql`DELETE FROM telos_objects WHERE id = ${id}`);
  res.json({ ok: true });
});

// ── Telos Dreams (Morfeu / Lua) ──────────────────────────────────────────────

// GET /api/telos/dreams — últimos sonhos de Morfeu (público)
router.get("/telos/dreams", async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query["limit"] ?? 30), 100);
  const ciclo = req.query["ciclo"] ? Number(req.query["ciclo"]) : null;

  const rows = ciclo
    ? await db.execute(sql`
        SELECT * FROM telos_dreams
        WHERE ciclo_numero = ${ciclo}
        ORDER BY created_at ASC
      `)
    : await db.execute(sql`
        SELECT * FROM telos_dreams
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);

  // Últimos ciclos disponíveis
  const ciclosRows = await db.execute(sql`
    SELECT DISTINCT ciclo_numero, MAX(created_at) as ts
    FROM telos_dreams
    GROUP BY ciclo_numero
    ORDER BY ts DESC
    LIMIT 5
  `);

  res.json({
    dreams: rows.rows,
    count: rows.rows.length,
    ciclosDisponiveis: ciclosRows.rows.map((r: Record<string, unknown>) => r.ciclo_numero),
  });
});

// GET /api/telos/dreams/latest — último ciclo completo
router.get("/telos/dreams/latest", async (_req, res): Promise<void> => {
  const maxRow = await db.execute(sql`
    SELECT MAX(ciclo_numero) as ultimo FROM telos_dreams
  `);
  const ultimo = Number((maxRow.rows[0] as { ultimo: number }).ultimo ?? 0);
  if (!ultimo) { res.json({ ciclo: 0, dreams: [] }); return; }

  const rows = await db.execute(sql`
    SELECT * FROM telos_dreams
    WHERE ciclo_numero = ${ultimo}
    ORDER BY created_at ASC
  `);

  res.json({ ciclo: ultimo, dreams: rows.rows });
});

// POST /api/telos/morfeu/run — disparar Morfeu manualmente (admin)
router.post("/telos/morfeu/run", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  try {
    const result = await runMorfeu();
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/telos/telos-mestre — Telos Mestre do ecossistema (o vetor central)
router.get("/telos/telos-mestre", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT * FROM telos_objects
    WHERE tipo = 'mestre'
    ORDER BY created_at ASC
    LIMIT 1
  `);

  if (!rows.rows.length) {
    res.json({
      tipo: "mestre",
      identificador: "telos_mestre_ecossistema_tucci",
      objetivo: "Construir um ecossistema de IAs que amplie a autonomia criativa humana sem substituir a soberania humana no ponto de homologação",
      modo: "Transparência técnica, semiótica operável, utilitarismo consciente",
      restricoes_eticas: [
        "Nunca substituir a decisão final de Yuri",
        "Nunca publicar conteúdo retido ou segredo",
        "Nunca agir sem Telos claramente definido",
        "Temperatura zero para automação de ações irreversíveis",
      ],
      axiomas_prioritarios: [
        "Soberania humana no ponto de homologação",
        "Assimetria constitutiva por design",
        "Tensionamento produtivo sem sínteses dogmáticas",
        "Gratuidade como restrição criativa",
        "Memória em camadas",
      ],
      contextos_ativacao: ["sempre — vale em qualquer situação"],
      criterios_sucesso: ["O sistema aprende e surpreende sem perder coerência ética"],
      criterios_interrupcao: ["Violação de qualquer restrição ética"],
      temperatura: "baixa",
      fonte: "axiomas do Ecossistema Tucci (não persistido no DB ainda)",
    });
    return;
  }

  res.json(rows.rows[0]);
});

export default router;
