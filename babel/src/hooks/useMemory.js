const PAP = import.meta.env.VITE_PAP_API_URL ?? "https://site-st-production.up.railway.app";

export function useMemory() {
  async function loadMemory(query = "") {
    try {
      const url = `${PAP}/api/memories?source=babel&limit=5${query ? `&query=${encodeURIComponent(query)}` : ""}`;
      const r = await fetch(url);
      if (!r.ok) return "";
      const { memories } = await r.json();
      return (memories ?? []).slice(0, 5).map(m => m.content).filter(Boolean).join("\n---\n");
    } catch { return ""; }
  }

  async function saveMemory(userMsg, babelReply) {
    try {
      await fetch(`${PAP}/api/memories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `[Usuário] ${userMsg}\n[Babel] ${babelReply}`.slice(0, 4000),
          tags: "babel,conversa",
          source: "babel",
        }),
      });
    } catch {}
  }

  return { loadMemory, saveMemory };
}
