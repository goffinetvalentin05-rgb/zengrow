import { describe, expect, it, vi } from "vitest";

const create = vi.fn();
const edit = vi.fn();

vi.mock("@/src/lib/ai/openai", () => ({
  getOpenAIClient: () => ({
    chat: { completions: { create } },
    images: { edit },
  }),
  getStyleVisionModel: () => "gpt-4o",
  getStyleImageModel: () => "gpt-image-1",
}));

vi.mock("openai", () => ({
  toFile: async (bytes: Buffer, filename: string) => ({ bytes, filename }),
}));

import { createOpenAIStyleProvider } from "@/src/lib/ai/providers/openai-style-provider";
import { styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";

const validPayload = {
  primaryStyle: { name: "Clean Minimal", score: 94, reason: "Met particulièrement en valeur vos lignes." },
  secondaryStyle: { name: "Smart Casual", score: 88, reason: "Fonctionne bien au quotidien." },
  bestColors: [
    { name: "Cream", hex: "#E8DFD0", reason: "Éclaire." },
    { name: "Navy", hex: "#1F3347", reason: "Profondeur." },
    { name: "Olive", hex: "#6B6A43", reason: "Chaleur." },
    { name: "Charcoal", hex: "#2C2C2C", reason: "Structure." },
    { name: "Taupe", hex: "#8A7A6B", reason: "Neutre." },
    { name: "Burgundy", hex: "#6E2F3C", reason: "Accent." },
  ],
  lessFlatteringColors: [
    { name: "Fuchsia", hex: "#E23CA0", reason: "Trop vif." },
    { name: "Ice blue", hex: "#9BB7D4", reason: "Trop froid." },
    { name: "Acid yellow", hex: "#E8E04A", reason: "Déséquilibre." },
  ],
  notes: ["Simplifiez les volumes.", "Un seul accent suffit.", "Gardez un contraste moyen."],
  summary: "Un fil rouge Clean Minimal, net et portable.",
  strengths: ["Lignes nettes", "Neutres structurants"],
  stylingNotes: ["Simplifiez les volumes.", "Un seul accent suffit.", "Gardez un contraste moyen."],
  recommendedPieces: ["Chemise oxford", "Chino droit", "Manteau navy"],
  avoidOrLimit: ["Logos visibles", "Néons"],
  confidence: 91,
};

describe("openai style provider", () => {
  const provider = createOpenAIStyleProvider();
  const image = {
    type: "portrait" as const,
    bytes: Buffer.from("photo"),
    mimeType: "image/jpeg",
    filename: "portrait.jpg",
  };

  it("parses a structured vision response", async () => {
    create.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(validPayload) } }],
    });
    const result = await provider.analyzeStyleProfile({
      images: [image, { ...image, type: "full_body", filename: "full.jpg" }],
      preferences: { universes: ["clean-minimal"] },
    });
    expect(result.primaryStyle.name).toBe("Clean Minimal");
    expect(styleAnalysisResultSchema.parse(result).primaryStyle.name).toBe("Clean Minimal");
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("retries once when JSON is invalid then succeeds", async () => {
    create.mockReset();
    create
      .mockResolvedValueOnce({ choices: [{ message: { content: "{not-json" } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify(validPayload) } }] });
    const result = await provider.analyzeStyleProfile({
      images: [image, { ...image, type: "full_body", filename: "full.jpg" }],
      preferences: { universes: [] },
    });
    expect(result.secondaryStyle.name).toBe("Smart Casual");
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("retries image generation once", async () => {
    edit.mockReset();
    edit
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce({ data: [{ b64_json: Buffer.from("png").toString("base64") }] });
    const analysis = styleAnalysisResultSchema.parse(validPayload);
    const look = await provider.generateFinalLook({
      sourceImage: image,
      primaryStyle: analysis.primaryStyle.name,
      secondaryStyle: analysis.secondaryStyle.name,
      colorProfile: analysis.bestColors,
      recommendedPieces: analysis.recommendedPieces,
    });
    expect(look.mimeType).toBe("image/png");
    expect(edit).toHaveBeenCalledTimes(2);
  });
});
