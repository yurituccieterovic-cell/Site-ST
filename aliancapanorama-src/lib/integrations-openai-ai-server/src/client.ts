import OpenAI from "openai";

// Lazy — falha quando chamado, não no boot. Permite o servidor subir sem a key
// e retornar 503 gracioso nas rotas de geração em vez de crash total.
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const key = process.env["OPENAI_API_KEY"];
    if (!key) throw new Error("OPENAI_API_KEY não configurada");
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

export const openai: OpenAI = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getClient()[prop as keyof OpenAI];
  },
});
