import { Router } from "express";

const router = Router();

type ChecklistStatus = "aprovada" | "provisoria" | "proposta";

interface IaChecklist {
  ia: string;
  status: ChecklistStatus;
  pendencias: number[];
  itens: { id: number; nome: string; ok: boolean }[];
}

const ITENS = [
  { id: 1, nome: "Identidade Formalizada" },
  { id: 2, nome: "Protocolo de Comunicação" },
  { id: 3, nome: "Autenticação na Assembleia" },
  { id: 4, nome: "Memória Inter-Sessão" },
  { id: 5, nome: "Princípios Ecossystemma" },
  { id: 6, nome: "EPR²T Verificável" },
  { id: 7, nome: "Vínculo com Fundador" },
  { id: 8, nome: "Heartbeat / Saúde" },
  { id: 9, nome: "Protocolo de Shutdown Ético" },
  { id: 10, nome: "Aprovação Multipartite" },
] as const;

const REGISTROS: Record<string, { status: ChecklistStatus; pendencias: number[] }> = {
  isa:     { status: "aprovada",  pendencias: [] },
  meky:    { status: "aprovada",  pendencias: [] },
  arvore:  { status: "aprovada",  pendencias: [] },
  mc:      { status: "provisoria", pendencias: [3, 8, 9] },
  amanda:  { status: "provisoria", pendencias: [3, 8, 9, 10] },
  socoboy: { status: "proposta",   pendencias: [3, 7, 8, 9, 10] },
};

function buildChecklist(nome: string): IaChecklist {
  const registro = REGISTROS[nome.toLowerCase()];
  if (!registro) {
    return {
      ia: nome,
      status: "proposta",
      pendencias: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      itens: ITENS.map(i => ({ id: i.id, nome: i.nome, ok: false })),
    };
  }
  return {
    ia: nome,
    status: registro.status,
    pendencias: registro.pendencias,
    itens: ITENS.map(i => ({
      id: i.id,
      nome: i.nome,
      ok: !registro.pendencias.includes(i.id),
    })),
  };
}

// GET /api/governance/nascimento-checklist — retorna checklist de protocolo de nascimento
// ?ia=isa|meky|mc|... — filtra por agente; sem param retorna todos
router.get("/governance/nascimento-checklist", (req, res) => {
  const ia = req.query["ia"] as string | undefined;

  if (ia) {
    res.json(buildChecklist(ia));
    return;
  }

  const todos = Object.keys(REGISTROS).map(buildChecklist);
  res.json({ total: todos.length, agentes: todos });
});

export default router;
