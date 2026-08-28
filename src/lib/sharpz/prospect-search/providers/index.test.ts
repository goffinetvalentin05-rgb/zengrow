import { afterEach, describe, expect, it, vi } from "vitest";

describe("prospect-search provider resolution P0.6", () => {
  const envKeys = [
    "PROSPECT_SEARCH_PROVIDER",
    "TAVILY_API_KEY",
    "SERPER_API_KEY",
    "BRAVE_SEARCH_API_KEY",
  ] as const;

  const snapshot: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const key of envKeys) {
      if (snapshot[key] === undefined) delete process.env[key];
      else process.env[key] = snapshot[key];
    }
    vi.resetModules();
  });

  function captureEnv() {
    for (const key of envKeys) snapshot[key] = process.env[key];
  }

  it("PROSPECT_SEARCH_PROVIDER=serper sans clé → null (pas de fallback tavily)", async () => {
    captureEnv();
    process.env.PROSPECT_SEARCH_PROVIDER = "serper";
    delete process.env.SERPER_API_KEY;
    process.env.TAVILY_API_KEY = "tvly-test";
    delete process.env.BRAVE_SEARCH_API_KEY;

    const { resolveProspectSearchProvider, requireProspectSearchProvider } = await import(
      "@/src/lib/sharpz/prospect-search/providers"
    );
    expect(resolveProspectSearchProvider()).toBeNull();
    expect(() => requireProspectSearchProvider()).toThrow(/serper/i);
  });

  it("sans PREFERRED → premier provider avec clé", async () => {
    captureEnv();
    delete process.env.PROSPECT_SEARCH_PROVIDER;
    delete process.env.TAVILY_API_KEY;
    process.env.SERPER_API_KEY = "serper-test";
    delete process.env.BRAVE_SEARCH_API_KEY;

    const { resolveProspectSearchProvider } = await import(
      "@/src/lib/sharpz/prospect-search/providers"
    );
    expect(resolveProspectSearchProvider()?.name).toBe("serper");
  });
});
