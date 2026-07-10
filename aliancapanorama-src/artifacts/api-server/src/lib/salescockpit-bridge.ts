/**
 * Bridge client — PAP → SalesCockpit.
 * Usa BRIDGE_SECRET compartilhado (x-bridge-secret). Falha silenciosa: retorna
 * arrays/strings vazios se o SC não estiver disponível ou o secret não estiver set.
 */

const SC_URL = process.env.SALESCOCKPIT_API_URL ?? "https://api-production-89f4a.up.railway.app";
const SECRET = process.env.BRIDGE_SECRET ?? "";

export interface ScArvoreChatEntry {
  id: number;
  role: string;
  author: string | null;
  content: string;
  createdAt: string;
}

export interface ScAssembleiaSession {
  id: number;
  topic: string;
  mode: string;
  status: string;
  createdBy: string;
  agoraResultado: string | null;
  editorialReport: string | null;
  closedAt: string | null;
  createdAt: string;
}

export interface ScAssembleiaMessage {
  id: number;
  sessionId: number;
  sender: string;
  senderType: string;
  content: string;
  score: number | null;
  createdAt: string;
}

export interface ScBridgeDoc {
  titulo: string;
  url: string;
  tipo: string;
  origem: string;
}

async function scFetch<T>(path: string, fallback: T): Promise<T> {
  if (!SECRET) return fallback;
  try {
    const r = await fetch(`${SC_URL}${path}`, {
      headers: { "x-bridge-secret": SECRET },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return fallback;
    return (await r.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getScArvoreChat(limit = 100): Promise<ScArvoreChatEntry[]> {
  const res = await scFetch<{ data: ScArvoreChatEntry[] }>(`/api/bridge/sc/arvore-chat?limit=${limit}`, { data: [] });
  return res.data;
}

export async function getScAssembleias(limit = 20): Promise<ScAssembleiaSession[]> {
  const res = await scFetch<{ data: ScAssembleiaSession[] }>(`/api/bridge/sc/assembleias?limit=${limit}`, { data: [] });
  return res.data;
}

export async function getScAssembleiaMessages(sessionId: number): Promise<ScAssembleiaMessage[]> {
  const res = await scFetch<{ data: ScAssembleiaMessage[] }>(`/api/bridge/sc/assembleias/${sessionId}/messages`, { data: [] });
  return res.data;
}

export async function getScAgoras(limit = 20): Promise<ScAssembleiaSession[]> {
  const res = await scFetch<{ data: ScAssembleiaSession[] }>(`/api/bridge/sc/agoras?limit=${limit}`, { data: [] });
  return res.data;
}

export async function getScDocs(): Promise<ScBridgeDoc[]> {
  const res = await scFetch<{ data: ScBridgeDoc[] }>("/api/bridge/sc/docs", { data: [] });
  return res.data;
}

export async function getScStatus(): Promise<{ ok: boolean; uptime?: number }> {
  return scFetch<{ ok: boolean; uptime?: number }>("/api/bridge/sc/status", { ok: false });
}
