import { describe, expect, it } from "vitest";
import { AIConfigurationError, assertOpenAIConfigured, getOpenAIModel } from "@/src/lib/ai/openai";

describe("getOpenAIModel", () => {
  it("falls back to gpt-5.4-mini when env is unset", () => {
    const prev = process.env.OPENAI_MODEL;
    delete process.env.OPENAI_MODEL;
    expect(getOpenAIModel()).toBe("gpt-5.4-mini");
    if (prev) process.env.OPENAI_MODEL = prev;
  });

  it("uses OPENAI_MODEL when set", () => {
    const prev = process.env.OPENAI_MODEL;
    process.env.OPENAI_MODEL = "gpt-4o-mini";
    expect(getOpenAIModel()).toBe("gpt-4o-mini");
    if (prev) process.env.OPENAI_MODEL = prev;
    else delete process.env.OPENAI_MODEL;
  });
});

describe("assertOpenAIConfigured", () => {
  it("throws when OPENAI_API_KEY is missing", () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    expect(() => assertOpenAIConfigured()).toThrow(AIConfigurationError);
    if (prev) process.env.OPENAI_API_KEY = prev;
  });
});
