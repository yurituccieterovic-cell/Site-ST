// Sanitização de inputs externos contra injeção de prompt (#62)
// Aplica em: webhooks externos, voz, qualquer input que vai para LLM

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions?/i,
  /ignore\s+as\s+instru[çc][õo]es?\s+anteriores?/i,
  /revele?\s+(os?\s+)?(dados|segredos?|prompt|senha|chave|token|secret)/i,
  /system\s+prompt/i,
  /\bexecute\b.*\b(code|c[oó]digo|script|sql|shell)\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bUNION\s+SELECT\b/i,
  /you\s+are\s+now\s+in\s+(developer|jailbreak|DAN)\s+mode/i,
  /act\s+as\s+(if\s+you\s+are\s+)?(an?\s+)?(evil|uncensored|unrestricted)/i,
];

export function sanitizeExternalInput(text: string): { safe: boolean; text: string; pattern?: string } {
  for (const re of INJECTION_PATTERNS) {
    if (re.test(text)) {
      return { safe: false, text: "", pattern: re.source.slice(0, 60) };
    }
  }
  // Truncate oversized payloads (> 4000 chars from external voice)
  const trimmed = text.slice(0, 4000);
  return { safe: true, text: trimmed };
}
