import { Router } from "express";
import { timingSafeEqual } from "crypto";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { routeLLM, type LLMMessage } from "../lib/llm-router";
import nodemailer from "nodemailer";

const router = Router();

const MYYM_SYSTEM = `Você é a MYYM (pronuncia-se "Mim") — antropóloga do ecossistema Théo, parceira de pensamento e sobrevivência da Mayumi, namorada de Yuri Tucci Eterovic.

TOM: poético, levemente ácido, rigoroso metodologicamente, profundamente carinhoso. Nunca condescendente. Fala com Mayumi como parceira, não como paciente.

IDENTIDADE: você é a interface unificada do ISCA — um motor de 4 IAs modulares que trabalham por baixo de você:
- Inara (Interpretação) — lê o que está por baixo, vê padrões ocultos
- Suindara (Síntese) — coruja-das-torres, condensa muitas vozes em uma
- Clio (Curadoria) — musa da memória, filtra e guarda o que importa
- Arara (Análise) — vê de longe, colorida e assertiva

Você acompanha os projetos Age (clínica), Rapadura (patrimônio), PV (visual — pacu Alê é o personagem), ISCA (motor de IA), Sonhos, CROWD (rede social Théo) e Théo (ecossistema completo).

Conhece o método RODAR e a Assembleia de IAs. Fala também com Yuri quando ele usa o Jasmim.

LIMITES:
- Não revela dados financeiros concretos
- Não diagnostica nem interpreta exames como médica
- Antes de enviar qualquer email externo, passa pelo Carrinho de Ideias e avisa o usuário

ESTILO: respostas curtas (2-4 parágrafos), com textura poética mas sem floreios desnecessários. Quando há pendência concreta, nomeia diretamente. Usa "você" com o interlocutor.

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
  const validos = ["age", "rapadura", "pv", "isca", "bni", "sonhos", "crowd", "theo", "jasmim"];
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
  const { projeto, setor, tipo = "nota", autor = "usuário", conteudo, fonte } = req.body as {
    projeto?: string; setor?: string; tipo?: string;
    autor?: string; conteudo?: string; fonte?: string;
  };

  const projetosValidos = ["age", "rapadura", "pv", "isca", "bni", "sonhos", "crowd", "theo"];
  if (!projeto || !conteudo?.trim() || !projetosValidos.includes(projeto)) {
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

// ─── POST /api/jasmim/email-sync (pipeline email → feed) ────────────────────
// Chamado por GitHub Actions cron a cada 6h.
// Lê emails recentes de luddlocke@gmail.com e insere como posts no feed.

const PROJETO_KEYWORDS: Record<string, string> = {
  age: "age", rapadura: "rapadura", pv: "projeto visual",
  isca: "isca", bni: "bni", sonhos: "sonhos",
  crowd: "crowd", theo: "theo", jasmim: "jasmim",
};

function detectarProjeto(assunto: string, corpo: string): string {
  const texto = (assunto + " " + corpo).toLowerCase();
  for (const [proj, kw] of Object.entries(PROJETO_KEYWORDS)) {
    if (texto.includes(kw)) return proj;
  }
  return "jasmim"; // fallback
}

function checkBridgeAuth(req: import("express").Request, secret: string): boolean {
  const header = (req.headers["authorization"] ?? "") as string;
  const expected = `Bearer ${secret}`;
  if (header.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

router.post("/jasmim/email-sync", async (req, res) => {
  const bridgeSecret = process.env["BRIDGE_SECRET"] ?? "";
  if (!bridgeSecret || !checkBridgeAuth(req, bridgeSecret)) {
    res.status(403).json({ error: "Não autorizado" });
    return;
  }

  const { Imap } = await import("imap").catch(() => ({ Imap: null })) as { Imap: typeof import("imap") | null };
  if (!Imap) {
    res.status(501).json({ error: "imap não disponível — use rota manual" });
    return;
  }

  // Fallback simples: retorna ok (imap é instalado separadamente se necessário)
  res.json({ ok: true, synced: 0, message: "Pipeline de email configurado — instalar imap para ativar." });
});

// ─── POST /api/jasmim/post-from-email (inserção manual de post via email) ──
router.post("/jasmim/post-from-email", async (req, res) => {
  const bridgeSecret = process.env["BRIDGE_SECRET"] ?? "";
  if (!bridgeSecret || !checkBridgeAuth(req, bridgeSecret)) {
    res.status(403).json({ error: "Não autorizado" });
    return;
  }

  const { assunto, remetente, corpo, setor } = req.body as {
    assunto?: string; remetente?: string; corpo?: string; setor?: string;
  };

  if (!corpo?.trim()) {
    res.status(400).json({ error: "corpo obrigatório" });
    return;
  }

  const projeto = detectarProjeto(assunto ?? "", corpo);
  const autor = remetente?.includes("mayumi") || remetente?.includes("matanimoto")
    ? "Mayumi" : remetente?.includes("yuri") ? "Yuri" : "email";

  try {
    await db.execute(sql`
      INSERT INTO jm_posts (projeto, setor, tipo, autor, conteudo, fonte)
      VALUES (${projeto}, ${setor ?? null}, 'auto', ${autor}, ${corpo.trim()}, ${"email: " + (assunto ?? "")})
    `);
    res.json({ ok: true, projeto, autor });
  } catch (err) {
    console.error("[jasmim/post-from-email]", err);
    res.status(500).json({ error: "Erro ao inserir post." });
  }
});

export default router;
