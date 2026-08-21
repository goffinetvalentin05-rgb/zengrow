import { describe, expect, it } from "vitest";
import { createMockStyleProvider } from "@/src/lib/ai/providers/mock-style-provider";
import { styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";

const sourceImage = {
  type: "full_body" as const,
  bytes: Buffer.from("fake-image"),
  mimeType: "image/jpeg",
  filename: "full.jpg",
};

describe("mock style provider", () => {
  const provider = createMockStyleProvider();

  it("returns a valid style profile without using photo bytes", async () => {
    const result = await provider.analyzeStyleProfile({
      images: [sourceImage],
      preferences: { universes: ["old-money"], firstName: "Léa" },
    });
    expect(provider.id).toBe("mock");
    expect(result.primaryStyle.name).toBe("Old Money");
    expect(styleAnalysisResultSchema.parse(result).confidence).toBeGreaterThan(0);
    expect(result.bestColors).toHaveLength(6);
    expect(result.summary.toLowerCase()).toContain("léa");
  });

  it("echoes the source image for the final look", async () => {
    const analysis = await provider.analyzeStyleProfile({
      images: [sourceImage],
      preferences: { universes: ["clean-minimal"] },
    });
    const look = await provider.generateFinalLook({
      sourceImage,
      primaryStyle: analysis.primaryStyle.name,
      secondaryStyle: analysis.secondaryStyle.name,
      colorProfile: analysis.bestColors,
      recommendedPieces: analysis.recommendedPieces,
    });
    expect(look.bytes.equals(sourceImage.bytes)).toBe(true);
    expect(look.title).toBe("Votre look recommandé");
    expect(look.style).toBe(analysis.primaryStyle.name);
  });
});
