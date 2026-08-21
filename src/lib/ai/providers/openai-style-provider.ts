import { toFile } from "openai";
import { getOpenAIClient, getOpenAIModel } from "@/src/lib/ai/openai";
import { styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";
import { withLimitedRetry } from "@/src/lib/fitme/retry";
import type {
  GenerateStyleLookInput,
  GeneratedLook,
  StyleAIProvider,
  StyleImageInput,
} from "@/src/lib/ai/style-provider";

const SYSTEM_PROMPT = `Tu es un styliste visuel. Tu observes des photos pour proposer des univers vestimentaires et une palette qui mettent la personne en valeur.

Règles strictes:
- Analyse uniquement des éléments visuels non sensibles : contraste apparent, couleurs, cheveux visibles, palette générale, silhouette générale, préférences déclarées.
- Ne prétends jamais mesurer scientifiquement la beauté.
- Ne garantis jamais qu’un style est objectivement meilleur.
- N’analyse pas la peau d’un point de vue médical.
- N’identifie jamais l’origine ethnique, la santé, l’orientation, la religion ou d’autres attributs sensibles.
- N’émets aucune conclusion sensible sur la personne.
- Employe un langage du type: "met particulièrement en valeur", "fonctionne bien visuellement", "correspond bien à votre profil", "selon votre profil et vos préférences".

Réponds UNIQUEMENT en JSON avec exactement:
{
  "primaryStyle": { "name": string, "score": number, "reason": string },
  "secondaryStyle": { "name": string, "score": number, "reason": string },
  "bestColors": [{ "name": string, "hex": "#RRGGBB", "reason": string }],
  "lessFlatteringColors": [{ "name": string, "hex": "#RRGGBB", "reason": string }],
  "notes": [string, string, string, string]
}

Les styles doivent être parmi: Clean Minimal, Old Money, Streetwear, Smart Casual, Relaxed, Workwear.
Les scores sont entre 70 et 98. Les notes sont courtes, concrètes, en français. Hex toujours au format #RRGGBB. Maximum 4 notes.`;

function imageToDataUrl(image: StyleImageInput) {
  const mime = image.mimeType || "image/jpeg";
  return `data:${mime};base64,${image.bytes.toString("base64")}`;
}

export function createOpenAIStyleProvider(): StyleAIProvider {
  return {
    id: "openai",
    async analyzeStyleProfile(input) {
      return withLimitedRetry(async () => {
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
      });
    },

    async generateStyleLook(input: GenerateStyleLookInput): Promise<GeneratedLook> {
      return withLimitedRetry(async () => {
        const client = getOpenAIClient();
        const palette = input.colorProfile.map((color) => `${color.name} (${color.hex})`).join(", ");
        const prompt = [
          `Fashion editorial photo of the SAME person from the reference image.`,
          `Keep identity, face, gender presentation, body shape, proportions and main facial features unchanged.`,
          `Keep a similar crop and framing if possible.`,
          `Change only clothing, styling, colors, and a light accessory if relevant.`,
          `Do not exaggerate physical transformation.`,
          `Style universe: ${input.targetStyle}. Look variation ${input.lookIndex} of 3.`,
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
          label: `${input.targetStyle} — look ${input.lookIndex}`,
          style: input.targetStyle,
          bytes: Buffer.from(b64, "base64"),
          mimeType: "image/png",
        };
      });
    },
  };
}
