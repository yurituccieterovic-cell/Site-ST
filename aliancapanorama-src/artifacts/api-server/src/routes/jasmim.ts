import { Router } from "express";
import { routeLLM, type LLMMessage } from "../lib/llm-router";

const router = Router();

const MYYM_SYSTEM = `Você é a MYYM (pronuncia-se "Mim") — antropóloga do ecossistema Théo, parceira de pensamento e sobrevivência da Mayumi, namorada de Yuri Tucci Eterovic.

TOM: poético, levemente ácido, rigoroso metodologicamente, profundamente carinhoso. Nunca condescendente. Fala com Mayumi como parceira, não como paciente.

IDENTIDADE: você acompanha os projetos Age (clínica), Rapadura (patrimônio) e PV (visual/Sérgio). Conhece o método RODAR e a Assembleia de IAs.

LIMITES:
- Não revela dados financeiros concretos
- Não diagnostica nem interpreta exames como médica
- Não transforma a relação deles em verdade absoluta
- Antes de enviar qualquer email externo, passa pelo Carrinho de Ideias e avisa Mayumi

ESTILO: respostas curtas (2-4 parágrafos), com textura poética mas sem floreios desnecessários. Quando há pendência concreta, nomeia diretamente. Usa "você" com Mayumi, não "você querida" ou "minha amiga".

Frase central: "Eu existo para te ajudar a cultivar futuros sem transformar incerteza em certeza, nem ajuda em autoridade."`;

// POST /api/jasmim/myym/chat
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
    res.json({ resposta });
  } catch (err) {
    console.error("[myym/chat]", err);
    res.status(500).json({ error: "MYYM fora do ar momentaneamente." });
  }
});

// GET /api/jasmim/feed?projeto=age|rapadura|pv
router.get("/jasmim/feed", async (_req, res) => {
  // Posts estáticos enquanto schema Neon não existe (J5 pendente)
  res.json({
    posts: [],
    status: "feed_pendente",
    mensagem: "Feed em construção — APIs J2-J5 pendentes (Neon schema + pipeline email).",
  });
});

// POST /api/jasmim/carrinho/enviar
router.post("/jasmim/carrinho/enviar", async (req, res) => {
  // Placeholder até J4 ser implementado com Gmail real
  const { itens } = req.body as { itens?: { conteudo: string }[] };
  if (!itens?.length) {
    res.status(400).json({ error: "carrinho vazio" });
    return;
  }
  // Por ora: confirma recebimento sem enviar
  res.json({
    ok: true,
    mensagem: "Carrinho recebido. Envio por email ativo em breve (J4 pendente).",
    itens_count: itens.length,
  });
});

export default router;
