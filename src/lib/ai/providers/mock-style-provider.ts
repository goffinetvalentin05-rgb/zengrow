/**
 * Mock isolé : simule le workflow en deux temps.
 * - analyzeStyleProfile : appelé AVANT paiement
 * - generateFinalLook : appelé UNIQUEMENT après webhook / paiement confirmé
 */
import { styleAnalysisResultSchema, type StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";
import type {
  AnalyzeStyleProfileInput,
  GenerateFinalLookInput,
  GeneratedImage,
  StyleAIProvider,
} from "@/src/lib/ai/style-provider";

function pickPrimary(universes: string[]) {
  const first = universes.find((item) => item !== "surprise");
  if (first === "old-money") return { name: "Old Money", score: 91 };
  if (first === "streetwear") return { name: "Streetwear", score: 90 };
  if (first === "smart-casual") return { name: "Smart Casual", score: 92 };
  if (first === "relaxed") return { name: "Relaxed", score: 89 };
  if (first === "workwear") return { name: "Workwear", score: 88 };
  if (first === "contemporary") return { name: "Contemporary", score: 90 };
  if (first === "classic") return { name: "Classic", score: 91 };
  if (first === "sporty") return { name: "Sporty", score: 88 };
  if (first === "elevated-casual") return { name: "Elevated Casual", score: 90 };
  return { name: "Clean Minimal", score: 94 };
}

function mockResult(input: AnalyzeStyleProfileInput): StyleAnalysisResult {
  const primary = pickPrimary(input.preferences.universes);
  const secondary =
    primary.name === "Clean Minimal"
      ? { name: "Smart Casual", score: 88 }
      : { name: "Clean Minimal", score: 84 };
  const firstName = input.preferences.firstName?.trim();
  const who = firstName ? firstName : "vous";

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
    ],
    summary: `${who === "vous" ? "Votre" : `Pour ${who}, le`} fil rouge est ${primary.name} : des lignes nettes, une palette calme, et des pièces que vous pouvez répéter sans effort.`,
    strengths: [
      "Allure lisible dès qu’on simplifie les volumes.",
      "Les neutres structurés mettent particulièrement en valeur le visage.",
      "Un second registre plus décontracté reste très portable.",
    ],
    stylingNotes: [
      "Privilégiez les neutres chauds plutôt que des pièces trop chargées.",
      "Gardez vos tenues peu chargées : un seul point d’accent suffit.",
      "Le contraste moyen fonctionne particulièrement bien avec votre profil visuel.",
      "Smart casual fonctionne bien comme alternative, surtout en journée.",
    ],
    recommendedPieces: [
      "Chemise oxford écrue",
      "Pantalon chino droit",
      "Manteau navy épuré",
      "Baskets cuir minimal",
      "Ceinture cuir fine",
    ],
    avoidOrLimit: [
      "Logos trop visibles",
      "Coupes trop larges sur toute la tenue",
      "Néons et pastels froids en pièce principale",
    ],
    confidence: 86,
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
    async generateFinalLook(input: GenerateFinalLookInput): Promise<GeneratedImage> {
      await pause(700);
      return {
        title: "Votre look recommandé",
        style: input.primaryStyle,
        description: `${input.primaryStyle} en direction principale, avec une touche ${input.secondaryStyle}.`,
        pieces: input.recommendedPieces?.slice(0, 4) ?? ["Chemise structurée", "Pantalon droit", "Manteau épuré"],
        colors: input.colorProfile.slice(0, 4).map((color) => color.hex),
        bytes: input.sourceImage.bytes,
        mimeType: input.sourceImage.mimeType || "image/jpeg",
      };
    },
  };
}
