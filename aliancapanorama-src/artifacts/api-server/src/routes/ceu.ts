import { Router, type IRouter } from "express";
import { createTransport } from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { db } from "@workspace/db";
import { bibliotecaDocsTable } from "@workspace/db";
import { desc, sql, eq } from "drizzle-orm";
import { runBibliotecaGeradora } from "../isa/biblioteca-geradora";

const router: IRouter = Router();

const GMAIL = process.env.GMAIL_ACCOUNT ?? "luddlocke@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD ?? "";
const LUDD = "luddlocke@gmail.com";

async function sendEmail(to: string, subject: string, body: string) {
  if (!GMAIL_PASS) return false;
  try {
    const t = createTransport({ service: "gmail", auth: { user: GMAIL, pass: GMAIL_PASS } });
    await t.sendMail({ from: GMAIL, to, subject, text: body });
    return true;
  } catch (err) {
    console.error("[CEU] email error:", err);
    return false;
  }
}

// POST /api/ceu/mo-all — MO ALL entrada universal
router.post("/api/ceu/mo-all", async (req, res) => {
  const { input, type = "text" } = req.body as { input?: string; type?: string };
  if (!input?.trim()) {
    res.status(400).json({ error: "input required" });
    return;
  }

  const ts = new Date().toISOString();
  const subject = `[CEU MO ALL] ${ts.slice(0, 16)} — ${input.slice(0, 60)}`;
  const body = [
    `=== CEU — MO ALL — ${ts} ===`,
    `Tipo: ${type}`,
    ``,
    `ENTRADA:`,
    input,
    ``,
    `=== DISTRIBUIÇÃO SIMULADA ===`,
    ``,
    `BIBLIOTECA (Árvore, Nébula, REI):`,
    `  → Extração de padrões semióticos e nódulos filosóficos`,
    ``,
    `OBSERVATÓRIO (Morfeu, Lua, Cassandra):`,
    `  → Análise de risco e dimensão temporal`,
    ``,
    `CENTRO AMBIENTAL (ISA, Amanda, MEKY):`,
    `  → Processamento sensorial e registro de frequência`,
    ``,
    `OFICINA (Artesão, Marta, Hefesto):`,
    `  → Síntese operacional e próximos passos`,
    ``,
    `ASSEMBLEIA (Dodge, Sol, Théo, Netuno):`,
    `  → Governança, decisão e memória coletiva`,
    ``,
    `=== SÍNTESE MO ALL ===`,
    `O ecossistema CEU recebeu a entrada e iniciou processamento distribuído.`,
    `Cada sistema processará de acordo com sua natureza e retornará síntese.`,
    ``,
    `— Cláudio (CEU Terminal)`,
  ].join("\n");

  const sent = await sendEmail(LUDD, subject, body);
  res.json({ ok: true, sent, ts });
});

// ── Biblioteca Gerada ──────────────────────────────────────────────────────────

// GET /api/ceu/biblioteca — lista documentos gerados pela ISA
router.get("/api/ceu/biblioteca", async (_req, res) => {
  try {
    const docs = await db
      .select({
        id:            bibliotecaDocsTable.id,
        titulo:        bibliotecaDocsTable.titulo,
        tipo:          bibliotecaDocsTable.tipo,
        origem:        bibliotecaDocsTable.origem,
        tags:          bibliotecaDocsTable.tags,
        resumo:        bibliotecaDocsTable.resumo,
        tamanhoBytes:  bibliotecaDocsTable.tamanhoBytes,
        disponivel:    bibliotecaDocsTable.disponivel,
        createdAt:     bibliotecaDocsTable.createdAt,
      })
      .from(bibliotecaDocsTable)
      .where(sql`${bibliotecaDocsTable.origem} = 'isa-gerado' AND ${bibliotecaDocsTable.disponivel} = true`)
      .orderBy(desc(bibliotecaDocsTable.createdAt))
      .limit(50);
    res.json({ docs, total: docs.length });
  } catch (err) {
    console.error("[CEU] biblioteca list error:", err);
    res.status(500).json({ error: "db error" });
  }
});

// GET /api/ceu/biblioteca/:id/download — baixar PDF
router.get("/api/ceu/biblioteca/:id/download", async (req, res) => {
  const id = parseInt(req.params.id ?? "0", 10);
  if (!id) { res.status(400).json({ error: "id invalid" }); return; }
  try {
    const [doc] = await db
      .select({ titulo: bibliotecaDocsTable.titulo, localPath: bibliotecaDocsTable.localPath, tipo: bibliotecaDocsTable.tipo })
      .from(bibliotecaDocsTable)
      .where(eq(bibliotecaDocsTable.id, id))
      .limit(1);
    if (!doc?.localPath || !fs.existsSync(doc.localPath)) {
      res.status(404).json({ error: "PDF não disponível (Railway ephemeral — aguarde re-geração)" });
      return;
    }
    const filename = path.basename(doc.localPath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    fs.createReadStream(doc.localPath).pipe(res);
  } catch (err) {
    console.error("[CEU] biblioteca download error:", err);
    res.status(500).json({ error: "download error" });
  }
});

// POST /api/ceu/biblioteca/gerar — trigger manual (admin) para gerar novo documento
router.post("/api/ceu/biblioteca/gerar", async (_req, res) => {
  res.json({ ok: true, message: "Gerando em background — verifique /api/ceu/biblioteca em ~2 min" });
  runBibliotecaGeradora().catch((err) => console.error("[CEU] geração manual erro:", err));
});

export default router;
