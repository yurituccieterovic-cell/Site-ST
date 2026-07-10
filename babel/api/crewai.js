// Proxy seguro para triggers CrewAI — tokens ficam no servidor Vercel
export const config = { maxDuration: 30 };

const AGENTS = {
  artesao: {
    url:   process.env.ARTESAO_URL ?? "https://artesao-v1-853879a0-e8aa-43e9-aa8d-839bbb22-e8a66c76.crewai.com",
    token: process.env.ARTESAO_TOKEN ?? "",
    body:  proposal => ({ inputs: { proposal } }),
  },
  las_cinco: {
    url:   process.env.LAS_CINCO_URL ?? "",
    token: process.env.LAS_CINCO_TOKEN ?? "",
    body:  proposal => ({ inputs: { question: proposal } }),
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { agent, proposal } = req.body ?? {};
  const cfg = AGENTS[agent?.toLowerCase()];
  if (!cfg || !cfg.url) {
    return res.status(400).json({ error: `Agente desconhecido ou URL não configurada: ${agent}` });
  }

  try {
    const r = await fetch(`${cfg.url}/kickoff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {}),
      },
      body: JSON.stringify(cfg.body(proposal)),
    });
    const data = await r.json().catch(() => ({}));
    res.json({ ok: r.ok, agent, status: r.status, data });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
