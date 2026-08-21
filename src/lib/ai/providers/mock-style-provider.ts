/**
 * Mock isolé : simule le workflow en deux temps.
 * - analyzeStyleProfile : appelé AVANT paiement
 * - generateStyleLook : appelé UNIQUEMENT après webhook / paiement confirmé
 */
import { styleAnalysisResultSchema, type StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";
import type {
  AnalyzeStyleProfileInput,
  GenerateStyleLookInput,
  GeneratedLook,
  StyleAIProvider,
} from "@/src/lib/ai/style-provider";

function pickPrimary(universes: string[]) {
  const first = universes.find((item) => item !== "surprise");
  if (first === "old-money") return { name: "Old Money", score: 91 };
  if (first === "streetwear") return { name: "Streetwear", score: 90 };
  if (first === "smart-casual") return { name: "Smart Casual", score: 92 };
  if (first === "relaxed") return { name: "Relaxed", score: 89 };
  if (first === "workwear") return { name: "Workwear", score: 88 };
  return { name: "Clean Minimal", score: 94 };
}

function mockResult(input: AnalyzeStyleProfileInput): StyleAnalysisResult {
  const primary = pickPrimary(input.preferences.universes);
  const secondary =
    primary.name === "Clean Minimal"
      ? { name: "Smart Casual", score: 88 }
      : { name: "Clean Minimal", score: 84 };

  return styleAnalysisResultSchema.parse({
    primaryStyle: {
      name: primary.name,
      score: primary.score,
      reason:
        "Selon votre profil visuel et vos préférences, cet univers met particulièrement en valeur vos lignes et votre allure.",
    },
    secondaryStyle: {
      name: secondary.name,
      score: secondary.score,
      reason: "Un second univers qui fonctionne bien visuellement et reste facile à porter au quotidien.",
    },
    bestColors: [
      { name: "Cream", hex: "#E8DFD0", reason: "Éclaire le teint sans durcir le contraste." },
      { name: "Charcoal", hex: "#2C2C2C", reason: "Structure la silhouette avec calme." },
      { name: "Navy", hex: "#1F3347", reason: "Profondeur sobre, très portable." },
      { name: "Olive", hex: "#6B6A43", reason: "Chaleur discrète, fonctionne bien visuellement." },
      { name: "Taupe", hex: "#8A7A6B", reason: "Neutre souple pour les pièces du quotidien." },
      { name: "Burgundy", hex: "#6E2F3C", reason: "Accent profond, à doser sur une pièce forte." },
    ],
    lessFlatteringColors: [
      { name: "Fuchsia", hex: "#E23CA0", reason: "Contraste trop vif par rapport à votre palette." },
      { name: "Ice blue", hex: "#9BB7D4", reason: "Refroidit trop l’ensemble." },
      { name: "Acid yellow", hex: "#E8E04A", reason: "Attire l’œil au détriment de l’équilibre." },
    ],
    notes: [
      "Privilégiez les neutres chauds plutôt que des pièces trop chargées.",
      "Gardez vos tenues peu chargées : un seul point d’accent suffit.",
      "Le contraste moyen fonctionne particulièrement bien avec votre profil visuel.",
      "Smart casual fonctionne bien comme alternative, surtout en journée.",
    ].slice(0, 4),
  });
}

async function pause(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockStyleProvider(): StyleAIProvider {
  return {
    id: "mock",
    async analyzeStyleProfile(input) {
      await pause(1200);
      return mockResult(input);
    },
    async generateStyleLook(input: GenerateStyleLookInput): Promise<GeneratedLook> {
      await pause(700);
      return {
        label: `${input.targetStyle} — look ${input.lookIndex}`,
        style: input.targetStyle,
        bytes: input.sourceImage.bytes,
        mimeType: input.sourceImage.mimeType || "image/jpeg",
      };
    },
  };
}
