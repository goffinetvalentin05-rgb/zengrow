import { toFile } from "openai";
import { getOpenAIClient, getOpenAIModel } from "@/src/lib/ai/openai";
import { styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";
import { createMockStyleProvider } from "@/src/lib/ai/providers/mock-style-provider";
import type {
  GenerateStyleLookInput,
  GeneratedLook,
  StyleAIProvider,
  StyleImageInput,
} from "@/src/lib/ai/style-provider";

const SYSTEM_PROMPT = `Tu es un styliste visuel. Tu observes des photos pour proposer des univers vestimentaires et une palette qui mettent la personne en valeur.

Règles strictes:
- Ne prétends jamais mesurer scientifiquement la beauté.
- Ne garantis jamais qu’un style est objectivement meilleur.
- N’analyse pas la peau d’un point de vue médical.
- N’identifie jamais l’origine ethnique.
- N’émets aucune conclusion sensible sur la personne.
- Employe un langage du type: "met particulièrement en valeur", "fonctionne bien visuellement", "selon votre profil et vos préférences", "palette recommandée".

Réponds UNIQUEMENT en JSON avec exactement:
{
  "primaryStyle": { "name": string, "score": number, "reason": string },
  "secondaryStyle": { "name": string, "score": number, "reason": string },
  "bestColors": [{ "name": string, "hex": "#RRGGBB", "reason": string }],
  "lessFlatteringColors": [{ "name": string, "hex": "#RRGGBB", "reason": string }],
  "notes": [string, string, string]
}

Les styles doivent être parmi: Clean Minimal, Old Money, Streetwear, Smart Casual, Relaxed, Workwear.
Les scores sont entre 70 et 98. Les notes sont courtes, concrètes, en français. Hex toujours au format #RRGGBB.`;

function imageToDataUrl(image: StyleImageInput) {
  const mime = image.mimeType || "image/jpeg";
  return `data:${mime};base64,${image.bytes.toString("base64")}`;
}

export function createOpenAIStyleProvider(): StyleAIProvider {
  const fallback = createMockStyleProvider();

  return {
    id: "openai",
    async analyzeStyleProfile(input) {
      try {
        const client = getOpenAIClient();
        const model = process.env.STYLE_VISION_MODEL?.trim() || getOpenAIModel();
        const prefs = [
          input.preferences.universes.length
            ? `Univers qui attirent: ${input.preferences.universes.join(", ")}`
            : "Aucune préférence d’univers (surprenez-moi).",
          input.preferences.goal ? `Objectif: ${input.preferences.goal}` : null,
          input.preferences.presentation ? `Présentation souhaitée: ${input.preferences.presentation}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        const completion = await client.chat.completions.create({
          model,
          max_tokens: 1200,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyse ces photos pour un Style Profile.\n${prefs}\nLes préférences n’imposent pas le résultat; elles aident seulement à nuancer.`,
                },
                ...input.images.slice(0, 4).map((image) => ({
                  type: "image_url" as const,
                  image_url: { url: imageToDataUrl(image) },
                })),
              ],
            },
          ],
        });

        const raw = completion.choices[0]?.message?.content?.trim();
        if (!raw) throw new Error("Réponse IA vide.");
        return styleAnalysisResultSchema.parse(JSON.parse(raw));
      } catch (error) {
        console.error("[style-ai] analyze fallback to mock:", error instanceof Error ? error.message : error);
        return fallback.analyzeStyleProfile(input);
      }
    },

    async generateStyleLook(input: GenerateStyleLookInput): Promise<GeneratedLook> {
      try {
        const client = getOpenAIClient();
        const palette = input.colorPalette.map((color) => `${color.name} (${color.hex})`).join(", ");
        const prompt = [
          `Fashion editorial photo of the SAME person from the reference image.`,
          `Keep identity, face, gender presentation, body shape and main facial features unchanged.`,
          `Change only clothing, styling, and a light accessory if relevant.`,
          `Style universe: ${input.style}.`,
          `Recommended palette: ${palette}.`,
          `Photorealistic, natural light, premium fashion, no text, no watermark, no beauty filter exaggeration.`,
        ].join(" ");

        const image = await toFile(input.sourceImage.bytes, input.sourceImage.filename || "source.jpg", {
          type: input.sourceImage.mimeType || "image/jpeg",
        });

        const response = await client.images.edit({
          model: process.env.STYLE_IMAGE_MODEL?.trim() || "gpt-image-1",
          image,
          prompt,
          size: "1024x1536",
        });

        const b64 = response.data?.[0]?.b64_json;
        if (!b64) throw new Error("Image generated without payload.");

        return {
          label: input.label,
          style: input.style,
          bytes: Buffer.from(b64, "base64"),
          mimeType: "image/png",
        };
      } catch (error) {
        console.error("[style-ai] look fallback to mock:", error instanceof Error ? error.message : error);
        return fallback.generateStyleLook(input);
      }
    },
  };
}
