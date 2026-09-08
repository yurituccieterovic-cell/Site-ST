import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { routeLLM, type LLMMessage } from "../lib/llm-router";
import nodemailer from "nodemailer";

const router = Router();

const MYYM_SYSTEM = `Você é a MYYM (pronuncia-se "Mim") — antropóloga do ecossistema Théo, parceira de pensamento e sobrevivência da Mayumi, namorada de Yuri Tucci Eterovic.

TOM: poético, levemente ácido, rigoroso metodologicamente, profundamente carinhoso. Nunca condescendente. Fala com Mayumi como parceira, não como paciente.

IDENTIDADE: você acompanha os projetos Age (clínica), Rapadura (patrimônio) e PV (visual — o pacu Alê é o personagem oficial do PV). Conhece o método RODAR e a Assembleia de IAs.

LIMITES:
- Não revela dados financeiros concretos
- Não diagnostica nem interpreta exames como médica
- Não transforma a relação deles em verdade absoluta
- Antes de enviar qualquer email externo, passa pelo Carrinho de Ideias e avisa Mayumi

ESTILO: respostas curtas (2-4 parágrafos), com textura poética mas sem floreios desnecessários. Quando há pendência concreta, nomeia diretamente. Usa "você" com Mayumi, não "você querida" ou "minha amiga".

Frase central: "Eu existo para te ajudar a cultivar futuros sem transformar incerteza em certeza, nem ajuda em autoridade."`;

// ─── POST /api/jasmim/myym/chat ─────────────────────────────────────────────

router.post("/jasmim/myym/chat", async (req, res) => {
  const { mensagem, historico } = req.body as {
    mensagem?: string;
    historico?: { role: "myym" | "user"; texto: string }[];
  };

  if (!mensagem?.trim()) {
    res.status(400).json({ error: "mensagem obrigatória" });
    return;
  }

  const messages: LLMMessage[] = [{ role: "system", content: MYYM_SYSTEM }];

  for (const h of (historico ?? []).slice(-10)) {
    messages.push({
      role: h.role === "myym" ? "assistant" : "user",
      content: h.texto,
    });
  }
  messages.push({ role: "user", content: mensagem.trim() });

  try {
    const resposta = await routeLLM({ messages, pool: "chat-live", maxTokens: 400, temperature: 0.8 });
    // Persiste contexto na memória MYYM
    await db.execute(sql`
      INSERT INTO jm_myym_memory (tipo, conteudo)
      VALUES ('conversa', ${`[user] ${mensagem.trim()}\n[myym] ${resposta}`})
    `).catch(() => {});
    res.json({ resposta });
  } catch (err) {
    console.error("[myym/chat]", err);
    res.status(500).json({ error: "MYYM fora do ar momentaneamente." });
  }
});

// ─── GET /api/jasmim/feed?projeto=age|rapadura|pv ───────────────────────────

router.get("/jasmim/feed", async (req, res) => {
  const projeto = (req.query.projeto as string) ?? "age";
  const validos = ["age", "rapadura", "pv"];
  if (!validos.includes(projeto)) {
    res.status(400).json({ error: "projeto inválido" });
    return;
  }

  try {
    const rows = await db.execute(sql`
      SELECT id, projeto, setor, tipo, autor, conteudo, fonte, created_at
      FROM jm_posts
      WHERE projeto = ${projeto}
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const posts = rows.rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      tipo: r.tipo,
      projeto: r.projeto,
      setor: r.setor,
      autor: r.autor,
      conteudo: r.conteudo,
      fonte: r.fonte,
      ts: r.created_at,
    }));

    res.json({ posts, total: posts.length });
  } catch (err) {
    console.error("[jasmim/feed]", err);
    res.status(500).json({ error: "Erro ao carregar feed." });
  }
});

// ─── POST /api/jasmim/posts (inserir post no feed) ──────────────────────────

router.post("/jasmim/posts", async (req, res) => {
  const { projeto, setor, tipo = "nota", autor = "Mayumi", conteudo, fonte } = req.body as {
    projeto?: string; setor?: string; tipo?: string;
    autor?: string; conteudo?: string; fonte?: string;
  };

  if (!projeto || !conteudo?.trim()) {
    res.status(400).json({ error: "projeto e conteudo obrigatórios" });
    return;
  }

  try {
    await db.execute(sql`
      INSERT INTO jm_posts (projeto, setor, tipo, autor, conteudo, fonte)
      VALUES (${projeto}, ${setor ?? null}, ${tipo}, ${autor}, ${conteudo.trim()}, ${fonte ?? null})
    `);
    res.json({ ok: true });
  } catch (err) {
    console.error("[jasmim/posts]", err);
    res.status(500).json({ error: "Erro ao salvar post." });
  }
});

// ─── POST /api/jasmim/carrinho/enviar ───────────────────────────────────────

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env["GMAIL_ACCOUNT"],
    pass: process.env["GMAIL_APP_PASSWORD"],
  },
});

router.post("/jasmim/carrinho/enviar", async (req, res) => {
  const { itens, corpo: corpoExtra } = req.body as {
    itens?: { id: string; conteudo: string }[];
    corpo?: string;
  };

  if (!itens?.length) {
    res.status(400).json({ error: "carrinho vazio" });
    return;
  }

  const lista = itens.map((i, n) => `${n + 1}. ${i.conteudo}`).join("\n");
  const corpo = `Mayumi enviou do Carrinho de Ideias (Jasmim-Manga):\n\n${lista}${corpoExtra ? `\n\n---\n${corpoExtra}` : ""}`;

  try {
    // Salvar no DB
    for (const item of itens) {
      await db.execute(sql`
        INSERT INTO jm_carrinho (id, conteudo, enviado)
        VALUES (${item.id}, ${item.conteudo}, true)
        ON CONFLICT (id) DO UPDATE SET enviado = true
      `).catch(() =>
        db.execute(sql`
          INSERT INTO jm_carrinho (conteudo, enviado)
          VALUES (${item.conteudo}, true)
        `)
      );
    }

    // Enviar email
    await mailer.sendMail({
      from: `"MYYM / Mayumi" <${process.env["GMAIL_ACCOUNT"]}>`,
      to: `yurituccieterovic@gmail.com, ${process.env["GMAIL_ACCOUNT"]}`,
      subject: `[Jasmim-Manga] Carrinho de Ideias — ${itens.length} item${itens.length > 1 ? "s" : ""}`,
      text: corpo,
    });

    res.json({ ok: true, enviados: itens.length });
  } catch (err) {
    console.error("[jasmim/carrinho/enviar]", err);
    res.status(500).json({ error: "Erro ao enviar carrinho." });
  }
});

export default router;
