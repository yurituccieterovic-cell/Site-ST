/**
 * Studio — canal de conversa entre Yuri, Cláudio e os agentes do Conselho.
 *
 * GET  /api/studio/chat         — histórico de mensagens
 * POST /api/studio/chat         — envia mensagem → aciona agente (async)
 * DELETE /api/studio/chat       — limpa histórico
 * GET  /api/studio/chat/stream  — SSE para atualizações em tempo real
 */
import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";

const router: IRouter = Router();

const ARPIA_URL = process.env.ARPIA_URL ?? "https://arpia-production.up.railway.app";
const BRIDGE_SECRET = process.env.BRIDGE_SECRET ?? "";

// ── Bootstrap da tabela ────────────────────────────────────────────────────────

async function bootstrapTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS studio_chat (
      id          SERIAL PRIMARY KEY,
      remetente   VARCHAR(32)  NOT NULL DEFAULT 'yuri',
      agente      VARCHAR(32)  NOT NULL DEFAULT 'artesao',
      conteudo    TEXT         NOT NULL,
      status      VARCHAR(32)  NOT NULL DEFAULT 'ok',
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}
bootstrapTable().catch(console.error);

// ── GET: histórico ─────────────────────────────────────────────────────────────

router.get("/studio/chat", async (_req, res): Promise<void> => {
  const { rows } = await pool.query(
    `SELECT id::text, remetente, agente, conteudo, status,
            created_at AS timestamp
     FROM studio_chat
     ORDER BY created_at ASC
     LIMIT 200`
  );
  res.json(rows);
});

// ── POST: enviar mensagem ──────────────────────────────────────────────────────

router.post("/studio/chat", async (req, res): Promise<void> => {
  const { mensagem, remetente = "yuri", agente = "artesao" } = req.body;
  if (!mensagem?.trim()) { res.status(400).json({ error: "mensagem obrigatória" }); return; }

  // Salva mensagem do remetente
  const { rows } = await pool.query(
    `INSERT INTO studio_chat (remetente, agente, conteudo, status)
     VALUES ($1, $2, $3, 'ok')
     RETURNING id::text, remetente, conteudo, created_at AS timestamp`,
    [remetente, agente, mensagem.trim()]
  );
  const msgSalva = rows[0];

  // Aciona agente ARPIA em background (não bloqueia a resposta)
  _triggerAgente(mensagem.trim(), agente).catch(console.error);

  res.json({ ok: true, msg: msgSalva });
});

// ── DELETE: limpar ──────────────────────────────────────────────────────────────

router.delete("/studio/chat", async (_req, res): Promise<void> => {
  await pool.query("DELETE FROM studio_chat");
  res.json({ ok: true, cleared: true });
});

// ── SSE: stream de atualizações ──────────────────────────────────────────────

router.get("/studio/chat/stream", (req, res): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let lastId = 0;
  const interval = setInterval(async () => {
    try {
      const { rows } = await pool.query(
        `SELECT id, remetente, conteudo, status, created_at AS timestamp
         FROM studio_chat WHERE id > $1 ORDER BY id ASC LIMIT 10`,
        [lastId]
      );
      if (rows.length > 0) {
        lastId = rows[rows.length - 1].id;
        res.write(`data: ${JSON.stringify(rows)}\n\n`);
      }
    } catch {}
  }, 2000);

  req.on("close", () => clearInterval(interval));
});

// ── Helper: chama ARPIA ───────────────────────────────────────────────────────

async function _triggerAgente(mensagem: string, agente: string) {
  try {
    let url = `${ARPIA_URL}/api/conselho/proposta`;
    let body: object;

    if (agente === "crew") {
      url = `${ARPIA_URL}/api/agents/crew/assembleia`;
      body = { tema: mensagem };
    } else {
      body = {
        origem: "studio",
        titulo: mensagem.slice(0, 80),
        descricao: mensagem,
        urgencia: "normal",
        projeto: "pap",
      };
    }

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bridge-secret": BRIDGE_SECRET },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000),
    });

    const data = await r.json() as Record<string, unknown>;
    const resposta = (data.resultado ?? data.resultado ?? data.message ??
      `Proposta recebida (id: ${(data as {proposta_id?: string}).proposta_id ?? "?"}). Artesão arquitetando...`) as string;

    await pool.query(
      `INSERT INTO studio_chat (remetente, agente, conteudo, status)
       VALUES ($1, $2, $3, 'ok')`,
      [agente, agente, String(resposta).slice(0, 4000)]
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await pool.query(
      `INSERT INTO studio_chat (remetente, agente, conteudo, status)
       VALUES ($1, $2, $3, 'erro')`,
      [agente, agente, `[Erro ao conectar ao ARPIA: ${msg}]`]
    ).catch(() => {});
  }
}

export default router;
