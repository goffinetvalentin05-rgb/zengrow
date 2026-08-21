import { describe, expect, it } from "vitest";
import { classifyStyleAIError, StyleAIError } from "@/src/lib/ai/style-ai-errors";
import { getStyleImageModel, getStyleVisionModel } from "@/src/lib/ai/openai";
import { isFitmeDevUnlockEnabled } from "@/src/lib/fitme/dev-unlock";
import { pickLookReferences } from "@/src/lib/style-analysis/pipeline";

describe("classifyStyleAIError", () => {
  it("keeps StyleAIError codes", () => {
    const error = new StyleAIError("timeout", "aborted");
    expect(classifyStyleAIError(error)).toMatchObject({
      code: "timeout",
      user: "L’analyse a pris trop de temps. Réessayez.",
    });
  });

  it("maps OpenAI outages to a clean user message", () => {
    expect(classifyStyleAIError(new Error("OpenAI 429 rate limit"))).toMatchObject({
      code: "openai_unavailable",
    });
  });
});

describe("FITME model helpers", () => {
  it("defaults vision to gpt-4o", () => {
    const prev = process.env.STYLE_VISION_MODEL;
    delete process.env.STYLE_VISION_MODEL;
    expect(getStyleVisionModel()).toBe("gpt-4o");
    if (prev) process.env.STYLE_VISION_MODEL = prev;
  });

  it("defaults image to gpt-image-1", () => {
    const prev = process.env.STYLE_IMAGE_MODEL;
    delete process.env.STYLE_IMAGE_MODEL;
    expect(getStyleImageModel()).toBe("gpt-image-1");
    if (prev) process.env.STYLE_IMAGE_MODEL = prev;
  });
});

describe("isFitmeDevUnlockEnabled", () => {
  it("is disabled in production", () => {
    expect(isFitmeDevUnlockEnabled({ NODE_ENV: "production", VERCEL_ENV: "production" })).toBe(false);
  });

  it("is enabled in local development", () => {
    expect(isFitmeDevUnlockEnabled({ NODE_ENV: "development" })).toBe(true);
  });
});

describe("pickLookReferences", () => {
  it("prioritizes full-body then portrait", () => {
    const portrait = { type: "portrait" as const, bytes: Buffer.from("p"), mimeType: "image/jpeg", filename: "p.jpg" };
    const full = { type: "full_body" as const, bytes: Buffer.from("f"), mimeType: "image/jpeg", filename: "f.jpg" };
    const extra = { type: "extra" as const, bytes: Buffer.from("e"), mimeType: "image/jpeg", filename: "e.jpg" };
    const picked = pickLookReferences([extra, portrait, full]);
    expect(picked.source.filename).toBe("f.jpg");
    expect(picked.references.map((image) => image.filename)).toEqual(["f.jpg", "p.jpg", "e.jpg"]);
  });
});
