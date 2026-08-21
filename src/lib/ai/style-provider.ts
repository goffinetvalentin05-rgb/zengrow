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
  style: string;
  colorPalette: { name: string; hex: string }[];
  label: string;
};

export type StyleAIProvider = {
  id: "openai" | "mock";
  analyzeStyleProfile(input: AnalyzeStyleProfileInput): Promise<StyleAnalysisResult>;
  generateStyleLook(input: GenerateStyleLookInput): Promise<GeneratedLook>;
};

export function getStyleAIProvider(): StyleAIProvider {
  const forced = process.env.STYLE_AI_PROVIDER?.trim().toLowerCase();
  if (forced === "openai") return createOpenAIStyleProvider();
  return createMockStyleProvider();
}
