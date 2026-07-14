/**
 * Loop Registry — rastreador em memória dos laços internos do ecossistema.
 * Cada cron que roda atualiza seu status aqui.
 * O Orquestrador (Laço Externo) lê este registro no Playcenter.
 */

export interface LoopEntry {
  loopId: string;
  displayName: string;
  schedule: string;
  agentId: string;
  lastRun?: Date;
  lastSuccess: boolean;
  runCount: number;
  errorCount: number;
  lastData?: string;
}

const registry = new Map<string, LoopEntry>();

export function registerLoop(loopId: string, displayName: string, schedule: string, agentId: string): void {
  if (!registry.has(loopId)) {
    registry.set(loopId, { loopId, displayName, schedule, agentId, lastSuccess: true, runCount: 0, errorCount: 0 });
  }
}

export function updateLoop(loopId: string, success: boolean, data?: string): void {
  const entry = registry.get(loopId);
  if (!entry) return;
  entry.lastRun = new Date();
  entry.lastSuccess = success;
  entry.runCount++;
  if (!success) entry.errorCount++;
  if (data) entry.lastData = String(data).slice(0, 120);
}

export function getAllLoops(): LoopEntry[] {
  return Array.from(registry.values());
}

export function getEcosystemSummary(): string {
  const all = getAllLoops();
  if (all.length === 0) return "Laços ainda não iniciaram nesta instância.";
  return all.map(l => {
    const when = l.lastRun ? l.lastRun.toISOString().slice(11, 16) + "Z" : "—";
    const icon = !l.lastRun ? "⏸" : l.lastSuccess ? "✓" : "✗";
    return `${icon} [${l.agentId}] ${l.displayName} | schedule:${l.schedule} | runs:${l.runCount} erros:${l.errorCount} | último:${when}`;
  }).join("\n");
}
