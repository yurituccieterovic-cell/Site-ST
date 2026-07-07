import { logger } from "./logger";

/**
 * Parser JSON em 3 camadas para outputs de LLM.
 * Camada 1: JSON.parse estrito.
 * Camada 2: escapar caracteres de controle C0.
 * Camada 3: remover trailing commas + C0.
 * Loga quando cai nas camadas 2/3. Lança se tudo falhar.
 */
export function robustParseJSON(raw: string): unknown {
  // Camada 1 — parse estrito
  try {
    return JSON.parse(raw);
  } catch {}

  // Camada 2 — escapar controles C0 (exceto \n \r \t que JSON aceita como \u00XX)
  const escapeC0 = (s: string) =>
    s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, (c) => {
      const hex = c.charCodeAt(0).toString(16).padStart(4, "0");
      return `\\u${hex}`;
    });

  try {
    const escaped = escapeC0(raw);
    const result = JSON.parse(escaped);
    logger.warn({ snippet: raw.slice(0, 100) }, "robustParseJSON: camada 2 (C0 escape) ativada");
    return result;
  } catch {}

  // Camada 3 — trailing commas + C0
  try {
    const cleaned = escapeC0(raw)
      .replace(/,(\s*[}\]])/g, "$1"); // remove vírgula antes de } ou ]
    const result = JSON.parse(cleaned);
    logger.warn({ snippet: raw.slice(0, 100) }, "robustParseJSON: camada 3 (trailing commas + C0) ativada");
    return result;
  } catch {}

  logger.error({ snippet: raw.slice(0, 200) }, "robustParseJSON: falhou nas 3 camadas");
  throw new SyntaxError("JSON não parseável após 3 camadas de tentativa");
}

/**
 * Extrai o primeiro bloco JSON de uma string com texto ao redor (ex: markdown com ```json).
 * Útil quando o LLM envolve o JSON em texto explicativo.
 */
export function extractAndParseJSON(raw: string): unknown {
  // Tentar extrair bloco ```json ... ``` ou ``` ... ```
  const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock?.[1]) {
    return robustParseJSON(codeBlock[1].trim());
  }

  // Tentar encontrar { ... } ou [ ... ] diretamente
  const jsonStart = raw.search(/[{[]/);
  if (jsonStart !== -1) {
    const jsonEnd = raw.lastIndexOf(raw[jsonStart] === "{" ? "}" : "]");
    if (jsonEnd !== -1) {
      return robustParseJSON(raw.slice(jsonStart, jsonEnd + 1));
    }
  }

  return robustParseJSON(raw);
}
