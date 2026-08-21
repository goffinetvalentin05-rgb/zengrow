import type { StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";
import { createMockStyleProvider } from "@/src/lib/ai/providers/mock-style-provider";
import { createOpenAIStyleProvider } from "@/src/lib/ai/providers/openai-style-provider";

export type StyleImageInput = {
  type: "portrait" | "full_body" | "extra";
  bytes: Buffer;
  mimeType: string;
  filename: string;
};

export type GeneratedLook = {
  label: string;
  style: string;
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
  };
};

export type GenerateStyleLookInput = {
  sourceImage: StyleImageInput;
  targetStyle: string;
  colorProfile: { name: string; hex: string; reason?: string }[];
  lookIndex: number;
};

export type StyleAnalysisProvider = {
  analyzeStyleProfile(input: AnalyzeStyleProfileInput): Promise<StyleAnalysisResult>;
};

export type StyleImageProvider = {
  generateStyleLook(input: GenerateStyleLookInput): Promise<GeneratedLook>;
};

export type StyleAIProvider = StyleAnalysisProvider &
  StyleImageProvider & {
    id: "openai" | "mock";
  };

export function getStyleAIProvider(): StyleAIProvider {
  const forced = process.env.STYLE_AI_PROVIDER?.trim().toLowerCase();
  if (forced === "openai") return createOpenAIStyleProvider();
  return createMockStyleProvider();
}
