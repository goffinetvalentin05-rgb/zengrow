import type { StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";
import { styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";
import type {
  AnalyzeStyleProfileInput,
  GenerateStyleLookInput,
  GeneratedLook,
  StyleAIProvider,
} from "@/src/lib/ai/style-provider";

const UNIVERSE_FALLBACK = [
  { name: "Clean Minimal", hex: "#E8DFD0" },
  { name: "Smart Casual", hex: "#1F3347" },
];

function pickPrimary(universes: string[]) {
  const first = universes.find((item) => item !== "surprise");
  if (first === "old-money") return { name: "Old Money", score: 91 };
  if (first === "streetwear") return { name: "Streetwear", score: 90 };
  if (first === "smart-casual") return { name: "Smart Casual", score: 92 };
  if (first === "relaxed") return { name: "Relaxed", score: 89 };
  if (first === "workwear") return { name: "Workwear", score: 88 };
  return { name: "Clean Minimal", score: 93 };
}

function mockResult(input: AnalyzeStyleProfileInput): StyleAnalysisResult {
  const primary = pickPrimary(input.preferences.universes);
  const secondary =
    primary.name === "Clean Minimal"
      ? { name: "Smart Casual", score: 86 }
      : { name: "Clean Minimal", score: 84 };

  const parsed = styleAnalysisResultSchema.parse({
    primaryStyle: {
      name: primary.name,
      score: primary.score,
      reason:
        "Selon votre profil visuel et vos préférences, cet univers met particulièrement en valeur vos lignes et votre allure.",
    },
    secondaryStyle: {
      name: secondary.name,
      score: secondary.score,
      reason:
        "Un second univers qui fonctionne bien visuellement et reste facile à porter au quotidien.",
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
      "Privilégiez des volumes nets et des matières mates plutôt que des pièces trop chargées.",
      "Une base neutre (crème, marine, charcoal) simplifie vos looks tout en restant précise.",
      "Gardez un seul point d’accent (couleur ou accessoire) pour rester cohérent.",
      "Les coupes qui suivent votre silhouette, sans l’exagérer, vous mettent particulièrement en valeur.",
    ],
  });

  void UNIVERSE_FALLBACK;
  return parsed;
}

export function createMockStyleProvider(): StyleAIProvider {
  return {
    id: "mock",
    async analyzeStyleProfile(input) {
      return mockResult(input);
    },
    async generateStyleLook(input: GenerateStyleLookInput): Promise<GeneratedLook> {
      return {
        label: input.label,
        style: input.style,
        bytes: input.sourceImage.bytes,
        mimeType: input.sourceImage.mimeType || "image/jpeg",
      };
    },
  };
}
