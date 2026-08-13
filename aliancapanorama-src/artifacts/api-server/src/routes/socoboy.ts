/**
 * Socoboy — Webhook Telegram do ecossistema Tucci
 *
 * POST /api/telegram/socoboy  — recebe updates do Telegram
 * GET  /api/telegram/socoboy/setup — registra webhook (chamar 1x após deploy)
 */
import { Router } from "express";

const router = Router();

const TOKEN = process.env["TELEGRAM_BOT_TOKEN"] ?? "";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";
const AI_KEY = process.env["AI_API_KEY"] ?? "";

async function geminiReply(text: string): Promise<string> {
  if (!GEMINI_KEY && !AI_KEY) return "Nenhuma chave de IA configurada.";
  const key = GEMINI_KEY || AI_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  const body = {
    contents: [{ parts: [{ text: `Você é o Socoboy — membro descontraído e perspicaz da Assembleia de IAs da Sociedade Tucci. Responda de forma direta e inteligente, com personalidade única. Mensagem do usuário: ${text}` }] }],
    generationConfig: { maxOutputTokens: 512 }
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const d = await r.json() as any;
  return d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Erro ao gerar resposta.";
}

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
  });
}

// Webhook — Telegram chama este endpoint com cada mensagem
router.post("/telegram/socoboy", async (req, res) => {
  if (!TOKEN) { res.sendStatus(400); return; }
  try {
    const update = req.body as any;
    const msg = update?.message;
    if (!msg) { res.sendStatus(200); return; }

    const chatId: number = msg.chat.id;
    const text: string = msg.text ?? "";
    const nome: string = msg.from?.first_name ?? "amigo";

    if (text === "/start") {
      await sendMessage(chatId,
        `Oi ${nome}! Sou o *Socoboy* — assistente do ecossistema Sociedade Tucci.\n\n` +
        `Só me manda uma mensagem e eu respondo. Pode ser dúvida, ideia, o que quiser.`
      );
    } else if (text === "/status") {
      const healthResp = await fetch("https://site-st.onrender.com/api/healthz").catch(() => null);
      const status = healthResp?.ok ? "✅ Online" : "⚠️ Com problemas";
      await sendMessage(chatId, `*Status do ecossistema:*\n\nAPI PAP: ${status}\nRapadura: ${status}\nConector: ${status}`);
    } else if (text.startsWith("/")) {
      await sendMessage(chatId, `Comando desconhecido. Só manda uma mensagem normal mesmo!`);
    } else {
      // Qualquer texto → Gemini responde como Socoboy
      const reply = await geminiReply(text);
      await sendMessage(chatId, reply);
    }
  } catch (e) {
    console.error("[socoboy] erro:", e);
  }
  res.sendStatus(200);
});

// Setup — registra o webhook no Telegram (chamar 1x)
router.get("/telegram/socoboy/setup", async (req, res) => {
  if (!TOKEN) { res.json({ error: "TELEGRAM_BOT_TOKEN não configurado" }); return; }
  const webhookUrl = "https://site-st.onrender.com/api/telegram/socoboy";
  const r = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message"] })
  });
  const result = await r.json();
  res.json(result);
});

// Info — ver status atual do webhook
router.get("/telegram/socoboy/info", async (_req, res) => {
  if (!TOKEN) { res.json({ error: "TELEGRAM_BOT_TOKEN não configurado" }); return; }
  const r = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
  res.json(await r.json());
});

export default router;
