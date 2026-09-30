import type { ProviderName, CircuitBreakerState } from "./types.js";

// Circuit breaker em memória (para instância única).
// Para múltiplas instâncias: persist no DB via ao_circuit_breakers.

const SHORT_COOLDOWN_MS  = 60_000;    // 1 min — falha isolada
const LONG_COOLDOWN_MS   = 600_000;   // 10 min — falhas consecutivas
const FAIL_THRESHOLD     = 3;         // falhas consecutivas para abrir o circuito
const HALF_OPEN_PROBES   = 1;         // tentativas em half-open antes de fechar

const breakers = new Map<ProviderName, CircuitBreakerState>();

function get(provider: ProviderName): CircuitBreakerState {
  if (!breakers.has(provider)) {
    breakers.set(provider, { state: "closed", failCount: 0 });
  }
  return breakers.get(provider)!;
}

export function isAvailable(provider: ProviderName): boolean {
  const b = get(provider);
  if (b.state === "closed") return true;
  if (b.state === "open") {
    if (b.cooldownUntil && Date.now() > b.cooldownUntil.getTime()) {
      b.state = "half-open";
      return true;
    }
    return false;
  }
  return true; // half-open: tenta
}

export function recordSuccess(provider: ProviderName): void {
  const b = get(provider);
  b.failCount = 0;
  b.state = "closed";
  b.cooldownUntil = undefined;
}

export function recordFailure(provider: ProviderName, isTransient: boolean): void {
  const b = get(provider);
  b.failCount++;

  if (!isTransient || b.failCount >= FAIL_THRESHOLD) {
    b.state = "open";
    const cooldownMs = b.failCount >= FAIL_THRESHOLD ? LONG_COOLDOWN_MS : SHORT_COOLDOWN_MS;
    b.cooldownUntil = new Date(Date.now() + cooldownMs);
  }
}

export function getState(provider: ProviderName): CircuitBreakerState {
  return { ...get(provider) };
}

export function getAllStates(): Record<ProviderName, CircuitBreakerState> {
  const all = {} as Record<ProviderName, CircuitBreakerState>;
  for (const p of ["groq", "gemini", "cloudflare", "openrouter"] as ProviderName[]) {
    all[p] = getState(p);
  }
  return all;
}
