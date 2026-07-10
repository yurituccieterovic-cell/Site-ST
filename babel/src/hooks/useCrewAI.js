// Analisa a resposta da Babel e dispara triggers CrewAI via serverless /api/crewai
const TRIGGER_RE = /\[TRIGGER:(\w+):([^\]]+)\]/g;

export function useCrewAI() {
  async function processTriggers(babelText) {
    let match;
    const results = [];
    while ((match = TRIGGER_RE.exec(babelText)) !== null) {
      const [, agent, proposal] = match;
      try {
        const r = await fetch("/api/crewai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent: agent.toLowerCase(), proposal }),
        });
        if (r.ok) results.push({ agent, proposal, ok: true });
      } catch { results.push({ agent, proposal, ok: false }); }
    }
    TRIGGER_RE.lastIndex = 0;
    return results;
  }

  function stripTriggers(text) {
    return text.replace(TRIGGER_RE, "").trim();
  }

  return { processTriggers, stripTriggers };
}
