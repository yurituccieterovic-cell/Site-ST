import { Router, type IRouter } from "express";
import { createTransport } from "nodemailer";

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

export default router;
