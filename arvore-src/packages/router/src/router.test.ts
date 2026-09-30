import { describe, it, expect, vi, beforeEach } from "vitest";
import { routeChat } from "./index.js";
import * as cb from "./circuit-breaker.js";

// Mock dos providers
vi.mock("./providers/groq.js", () => ({
  streamGroq: vi.fn().mockResolvedValue({ tokensIn: 10, tokensOut: 20 }),
}));
vi.mock("./providers/gemini.js", () => ({
  streamGemini: vi.fn().mockResolvedValue({ tokensIn: 10, tokensOut: 20 }),
}));
vi.mock("./providers/cloudflare.js", () => ({
  streamCloudflare: vi.fn().mockResolvedValue({ tokensIn: 0, tokensOut: 0 }),
}));
vi.mock("./providers/openrouter.js", () => ({
  streamOpenRouter: vi.fn().mockResolvedValue({ tokensIn: 10, tokensOut: 20 }),
}));

describe("routeChat", () => {
  beforeEach(() => {
    // Reset circuit breakers
    vi.spyOn(cb, "isAvailable").mockReturnValue(true);
    vi.spyOn(cb, "recordSuccess").mockReturnValue(undefined);
    vi.spyOn(cb, "recordFailure").mockReturnValue(undefined);
    // Configura env
    process.env["GROQ_API_KEY"] = "test-key";
    process.env["GEMINI_API_KEY"] = "test-key";
  });

  it("retorna provider e voice no resultado", async () => {
    const chunks: string[] = [];
    const result = await routeChat(
      [{ role: "user", content: "olá" }],
      "sistema",
      (chunk) => { if (chunk.type === "delta" && chunk.content) chunks.push(chunk.content); },
      {}
    );
    expect(result.provider).toBeTruthy();
    expect(result.voice).toBeTruthy();
  });

  it("falha num provider, tenta o próximo", async () => {
    const { streamGroq } = await import("./providers/groq.js");
    vi.mocked(streamGroq).mockRejectedValueOnce(
      Object.assign(new Error("Groq 500"), { status: 500 })
    );

    const result = await routeChat(
      [{ role: "user", content: "olá" }],
      "sistema",
      () => {},
      {}
    );
    // Groq falhou, deve ter usado outro provider
    expect(result.provider).toBeTruthy();
  });

  it("todos falham — joga all_failed", async () => {
    vi.spyOn(cb, "isAvailable").mockReturnValue(false);
    await expect(routeChat(
      [{ role: "user", content: "olá" }],
      "sistema",
      () => {},
      {}
    )).rejects.toThrow("all_unavailable");
  });

  it("respeita signal de cancelamento", async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    await expect(routeChat(
      [{ role: "user", content: "olá" }],
      "sistema",
      () => {},
      { signal: ctrl.signal }
    )).rejects.toThrow("cancelled");
  });
});
