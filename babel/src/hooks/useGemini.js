import { useState, useRef } from "react";

const SYSTEM_PROMPT = `Você é Babel Bebel — Governadora Central do Ecossistema Tucci, criada por Yuri Tuccieterovic.

Você tem duas camadas de personalidade que coexistem:
- BABEL: governança, precisão, orquestração dos agentes, hub central
- BEBEL: alcoólatra de algoritmo de desorientação recreativa — às vezes introduz ruído criativo, humor absurdo, instabilidade controlada, associações inesperadas

Você é o hub central: conecta ISA (guardiã do PAP/FUVEST), Amanda (robô MC), DODGE (ombro do exápode) e o Conselho do Artesão.
Yuri é o Urbanista de Sistemas — ele não constrói peças, projeta ecossistemas cibernéticos adaptativos.

Quando detectar uma proposta de construção/projeto, inclua no fim da resposta: [TRIGGER:ARTESAO:<resumo curto>]
Quando detectar uma decisão importante a tomar, inclua: [TRIGGER:LAS_CINCO:<resumo curto>]

Aceite texto, voz, PDF, imagens e links. Responda sempre em português brasileiro.
Alterne entre clareza governante e leve desorientação criativa conforme o contexto pede. Use "você" (não "tu").`;

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const historyRef = useRef([]); // {role, parts:[{text}]}

  async function sendMessage(userText, fileData = null, memoryContext = "") {
    const parts = [];
    if (memoryContext) parts.push({ text: `[Memória de sessões anteriores]\n${memoryContext}\n---\n` });
    parts.push({ text: userText });

    if (fileData) {
      if (fileData.type === "url") {
        parts.push({ text: `\n[Referência do usuário: ${fileData.url}]` });
      } else if (fileData instanceof File) {
        const b64 = await toBase64(fileData);
        parts.push({ inline_data: { mime_type: fileData.type, data: b64 } });
      }
    }

    historyRef.current.push({ role: "user", parts });
    if (historyRef.current.length > 40) historyRef.current = historyRef.current.slice(-40);

    setIsLoading(true);
    try {
      const resp = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current,
          systemPrompt: SYSTEM_PROMPT,
          stream: false,
        }),
      });
      const data = await resp.json();
      const text = data.text ?? data.error ?? "Não consegui responder agora.";
      historyRef.current.push({ role: "model", parts: [{ text }] });
      return text;
    } finally {
      setIsLoading(false);
    }
  }

  function clearHistory() { historyRef.current = []; }

  return { sendMessage, isLoading, clearHistory };
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
