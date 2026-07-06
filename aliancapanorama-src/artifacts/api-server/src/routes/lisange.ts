import { Router } from "express";
import { db } from "@workspace/db";
import { patientProfilesTable, agendaSlotsTable } from "@workspace/db";
import { eq, gte, lte, and } from "drizzle-orm";

const router = Router();

function requireAdmin(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): boolean {
  if ((req.session.userTier ?? 0) < 5) {
    res.status(403).json({ error: "Acesso restrito" });
    return false;
  }
  return true;
}

// ── Pacientes ─────────────────────────────────────────────────────────────────

// GET /api/lisange/pacientes
router.get("/lisange/pacientes", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const patients = await db.select().from(patientProfilesTable).where(eq(patientProfilesTable.ativo, true));
  res.json(patients);
});

// POST /api/lisange/pacientes
router.post("/lisange/pacientes", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { nome, telefone, email, observacoes } = req.body as {
    nome?: string;
    telefone?: string;
    email?: string;
    observacoes?: string;
  };

  if (!nome) { res.status(400).json({ error: "nome obrigatório" }); return; }

  const [patient] = await db.insert(patientProfilesTable)
    .values({ nome, telefone, email, observacoes })
    .returning();

  res.status(201).json(patient);
});

// ── Agenda ────────────────────────────────────────────────────────────────────

// GET /api/lisange/agenda?de=2026-07-01&ate=2026-07-31
router.get("/lisange/agenda", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { de, ate } = req.query as Record<string, string | undefined>;

  const conditions = [];
  if (de)  conditions.push(gte(agendaSlotsTable.dataHora, new Date(de)));
  if (ate) conditions.push(lte(agendaSlotsTable.dataHora, new Date(ate)));

  const slots = conditions.length > 0
    ? await db.select().from(agendaSlotsTable).where(and(...conditions))
    : await db.select().from(agendaSlotsTable);

  res.json(slots);
});

// POST /api/lisange/agenda — criar slot
router.post("/lisange/agenda", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const { patientId, dataHora, duracaoMinutos = 30, observacoes } = req.body as {
    patientId?: number;
    dataHora?: string;
    duracaoMinutos?: number;
    observacoes?: string;
  };

  if (!dataHora) { res.status(400).json({ error: "dataHora obrigatório" }); return; }

  const [slot] = await db.insert(agendaSlotsTable)
    .values({ patientId, dataHora: new Date(dataHora), duracaoMinutos, observacoes })
    .returning();

  res.status(201).json(slot);
});

// PATCH /api/lisange/agenda/:id — atualizar status do slot
router.patch("/lisange/agenda/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const id = parseInt(req.params.id ?? "0", 10);
  if (!id) { res.status(400).json({ error: "id inválido" }); return; }

  const { status, patientId, observacoes } = req.body as {
    status?: string;
    patientId?: number;
    observacoes?: string;
  };

  const updates: Partial<typeof agendaSlotsTable.$inferInsert> = {};
  if (status    !== undefined) updates.status    = status;
  if (patientId !== undefined) updates.patientId = patientId;
  if (observacoes !== undefined) updates.observacoes = observacoes;

  const [updated] = await db.update(agendaSlotsTable)
    .set(updates)
    .where(eq(agendaSlotsTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Slot não encontrado" }); return; }
  res.json(updated);
});

export default router;
