import { describe, expect, it } from "vitest";
import { styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";

describe("style analysis result schema", () => {
  it("accepts snake_case payloads from the model", () => {
    const parsed = styleAnalysisResultSchema.parse({
      primary_style: { name: "clean-minimal", score: "94", reason: "Met vos lignes en valeur." },
      secondary_style: { name: "Smart Casual", score: 88, reason: "Portable au quotidien." },
      best_colors: [
        { name: "Navy", hex: "1f2a44", reason: "Profondeur sobre." },
        { name: "Cream", hex: "#E8DFD0", reason: "Éclaire le teint." },
        { name: "Charcoal", hex: "#2C2C2C", reason: "Structure." },
        { name: "Olive", hex: "#6B6A43", reason: "Chaleur." },
        { name: "Taupe", hex: "#8A7A6B", reason: "Neutre." },
        { name: "Burgundy", hex: "#6E2F3C", reason: "Accent." },
      ],
      less_flattering_colors: [
        { name: "Fuchsia", hex: "#E23CA0", reason: "Trop vif." },
        { name: "Ice blue", hex: "#9BB7D4", reason: "Trop froid." },
        { name: "Acid yellow", hex: "#E8E04A", reason: "Déséquilibre." },
      ],
      styling_notes: ["Simplifiez les volumes.", "Un seul accent suffit.", "Gardez un contraste moyen."],
      summary: "Un fil rouge Clean Minimal, facile à porter tous les jours.",
      strengths: ["Lignes nettes", "Neutres structurants"],
      recommended_pieces: ["Chemise oxford", "Chino droit", "Manteau navy"],
      avoid_or_limit: ["Logos visibles", "Néons"],
      confidence: 90,
    });

    expect(parsed.primaryStyle.name).toBe("Clean Minimal");
    expect(parsed.primaryStyle.score).toBe(94);
    expect(parsed.bestColors[0]?.hex).toBe("#1F2A44");
    expect(parsed.stylingNotes).toHaveLength(3);
    expect(parsed.confidence).toBe(90);
  });
});
