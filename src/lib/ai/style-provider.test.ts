import { afterEach, describe, expect, it } from "vitest";
import { getStyleAIProvider } from "@/src/lib/ai/style-provider";
import { StyleAIError } from "@/src/lib/ai/style-ai-errors";

describe("getStyleAIProvider", () => {
  const previousProvider = process.env.STYLE_AI_PROVIDER;
  const previousKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (previousProvider === undefined) delete process.env.STYLE_AI_PROVIDER;
    else process.env.STYLE_AI_PROVIDER = previousProvider;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  });

  it("defaults to mock", () => {
    delete process.env.STYLE_AI_PROVIDER;
    expect(getStyleAIProvider().id).toBe("mock");
  });

  it("keeps mock when STYLE_AI_PROVIDER=mock", () => {
    process.env.STYLE_AI_PROVIDER = "mock";
    expect(getStyleAIProvider().id).toBe("mock");
  });

  it("throws a clean error when openai is selected without API key", () => {
    process.env.STYLE_AI_PROVIDER = "openai";
    delete process.env.OPENAI_API_KEY;
    expect(() => getStyleAIProvider()).toThrow(StyleAIError);
    try {
      getStyleAIProvider();
    } catch (error) {
      expect(error).toBeInstanceOf(StyleAIError);
      expect((error as StyleAIError).code).toBe("not_configured");
      expect((error as StyleAIError).userMessage).toContain("n’est pas configuré");
    }
  });

  it("returns openai when provider and key are set", () => {
    process.env.STYLE_AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "sk-test";
    expect(getStyleAIProvider().id).toBe("openai");
  });
});
