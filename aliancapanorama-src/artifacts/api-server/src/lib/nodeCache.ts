import { db, nodesTable } from "@workspace/db";

type Node = typeof nodesTable.$inferSelect;
type CacheEntry = { nodes: Node[]; map: Map<string, Node>; ts: number };

let cache: CacheEntry | null = null;
const TTL_MS = 30_000;

export async function getAllNodes(): Promise<CacheEntry> {
  const now = Date.now();
  if (cache && now - cache.ts < TTL_MS) return cache;
  const nodes = await db.select().from(nodesTable);
  const map = new Map(nodes.map((n) => [n.code, n]));
  cache = { nodes, map, ts: now };
  return cache;
}

export function invalidateNodeCache(): void {
  cache = null;
}
