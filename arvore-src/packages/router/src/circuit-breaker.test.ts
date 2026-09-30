import { describe, it, expect, beforeEach } from "vitest";
import { isAvailable, recordFailure, recordSuccess, getState } from "./circuit-breaker.js";

// Reset do estado entre testes
function resetAll() {
  // Chama recordSuccess para todos os providers conhecidos para resetar
  for (const p of ["groq", "gemini", "cloudflare", "openrouter"] as const) {
    recordSuccess(p);
  }
}

describe("circuit-breaker", () => {
  beforeEach(resetAll);

  it("começa fechado (disponível)", () => {
    expect(isAvailable("groq")).toBe(true);
    expect(getState("groq").state).toBe("closed");
  });

  it("3 falhas transitórias abre o circuito", () => {
    recordFailure("groq", true);
    recordFailure("groq", true);
    expect(isAvailable("groq")).toBe(true); // ainda não atingiu threshold
    recordFailure("groq", true);
    expect(isAvailable("groq")).toBe(false);
    expect(getState("groq").state).toBe("open");
  });

  it("falha não transitória (401) abre imediatamente", () => {
    recordFailure("gemini", false);
    expect(isAvailable("gemini")).toBe(false);
  });

  it("sucesso reseta o circuito", () => {
    recordFailure("cloudflare", false);
    expect(isAvailable("cloudflare")).toBe(false);
    recordSuccess("cloudflare");
    expect(isAvailable("cloudflare")).toBe(true);
    expect(getState("cloudflare").failCount).toBe(0);
  });

  it("providers diferentes são independentes", () => {
    recordFailure("groq", false);
    expect(isAvailable("groq")).toBe(false);
    expect(isAvailable("gemini")).toBe(true);
  });
});
