import type { StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";
import { StyleAIError } from "@/src/lib/ai/style-ai-errors";
import { createMockStyleProvider } from "@/src/lib/ai/providers/mock-style-provider";
import { createOpenAIStyleProvider } from "@/src/lib/ai/providers/openai-style-provider";

export type StyleImageInput = {
  type: "portrait" | "full_body" | "extra";
  bytes: Buffer;
  mimeType: string;
  filename: string;
};

export type GeneratedImage = {
  title: string;
  style: string;
  description: string;
  pieces: string[];
  colors: string[];
  bytes: Buffer;
  mimeType: string;
};

export type AnalyzeStyleProfileInput = {
  images: StyleImageInput[];
  preferences: {
    universes: string[];
    goal?: string | null;
    presentation?: string | null;
    firstName?: string | null;
    ageRange?: string | null;
  };
};

export type GenerateFinalLookInput = {
  sourceImage: StyleImageInput;
  referenceImages?: StyleImageInput[];
  primaryStyle: string;
  secondaryStyle: string;
  colorProfile: { name: string; hex: string; reason?: string }[];
  recommendedPieces?: string[];
};

export type StyleAnalysisProvider = {
  analyzeStyleProfile(input: AnalyzeStyleProfileInput): Promise<StyleAnalysisResult>;
};

export type StyleImageProvider = {
  generateFinalLook(input: GenerateFinalLookInput): Promise<GeneratedImage>;
};

export type StyleAIProvider = StyleAnalysisProvider &
  StyleImageProvider & {
    id: "openai" | "mock";
  };

export function getStyleAIProvider(): StyleAIProvider {
  const forced = process.env.STYLE_AI_PROVIDER?.trim().toLowerCase();
  if (forced === "openai") {
    if (!process.env.OPENAI_API_KEY?.trim()) {
      throw new StyleAIError(
        "not_configured",
        "STYLE_AI_PROVIDER=openai but OPENAI_API_KEY is missing",
      );
    }
    return createOpenAIStyleProvider();
  }
  return createMockStyleProvider();
}
