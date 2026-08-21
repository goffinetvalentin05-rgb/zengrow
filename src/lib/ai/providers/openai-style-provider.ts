import { toFile } from "openai";
import { getOpenAIClient, getStyleImageModel, getStyleVisionModel } from "@/src/lib/ai/openai";
import { StyleAIError } from "@/src/lib/ai/style-ai-errors";
import { logStyleAICall } from "@/src/lib/ai/style-ai-log";
import { styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";
import { STYLE_PROFILE_TAXONOMY } from "@/src/lib/style-analysis/taxonomy";
import type {
  GenerateFinalLookInput,
  GeneratedImage,
  StyleAIProvider,
  StyleImageInput,
} from "@/src/lib/ai/style-provider";

const VISION_TIMEOUT_MS = 90_000;
const IMAGE_TIMEOUT_MS = 90_000;
const MAX_VISION_IMAGES = 4;

const SYSTEM_PROMPT = `Tu es un styliste visuel premium. Tu observes des photos pour recommander des univers vestimentaires et une palette qui mettent la personne en valeur.

Tu analyses uniquement des éléments visuels utiles au styling :
- visage (structure générale, pas un diagnostic)
- teint apparent
- contraste naturel
- couleur des cheveux visibles
- silhouette générale visible
- proportions visibles
- allure générale
- styles qui harmonisent le mieux l’apparence

Règles strictes :
- Recommandations stylistiques seulement.
- Aucun diagnostic médical.
- N’infère pas d’attributs sensibles (origine, santé, religion, orientation, âge exact, etc.).
- Aucun commentaire négatif, humiliant ou moralisateur sur le corps.
- Ne prétends jamais mesurer scientifiquement la beauté.
- Ne garantis jamais qu’un style est objectivement supérieur.
- Langage du type : "met particulièrement en valeur", "fonctionne bien visuellement", "correspond bien à votre profil".

Tous les textes (summary, reasons, notes, pièces, descriptions) sont en français : concis, premium, personnalisés, concrets. Pas de phrases vagues.

Réponds UNIQUEMENT en JSON valide avec exactement :
{
  "primaryStyle": { "name": string, "score": number, "reason": string },
  "secondaryStyle": { "name": string, "score": number, "reason": string },
  "bestColors": [{ "name": string, "hex": "#RRGGBB", "reason": string }],
  "lessFlatteringColors": [{ "name": string, "hex": "#RRGGBB", "reason": string }],
  "notes": [string, string, string],
  "summary": string,
  "strengths": [string, string],
  "stylingNotes": [string, string, string],
  "recommendedPieces": [string, string, string],
  "avoidOrLimit": [string, string],
  "confidence": number
}

Contraintes :
- primaryStyle.name et secondaryStyle.name doivent être parmi : ${STYLE_PROFILE_TAXONOMY.join(", ")}.
- scores 0-100, confidence 0-100.
- 6 bestColors, 3 ou 4 lessFlatteringColors.
- hex toujours #RRGGBB.
- Ne prépare aucun brief de look ni galerie d’images. L’image finale sera générée plus tard.`;

function visionTokenOptions(model: string, maxTokens: number) {
  if (/gpt-5|o1|o3|o4/i.test(model)) {
    return { max_completion_tokens: maxTokens };
  }
  return { max_tokens: maxTokens };
}

function imageToDataUrl(image: StyleImageInput) {
  const mime = image.mimeType || "image/jpeg";
  return `data:${mime};base64,${image.bytes.toString("base64")}`;
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new StyleAIError("invalid_json", "Réponse IA invalide (JSON attendu).");
  }
}

function parseVisionResult(raw: string) {
  const parsed = extractJsonObject(raw);
  const result = styleAnalysisResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new StyleAIError("invalid_json", result.error.issues.map((issue) => issue.message).join("; "));
  }
  return result.data;
}

function preferenceBlock(input: {
  universes: string[];
  goal?: string | null;
  presentation?: string | null;
  firstName?: string | null;
  ageRange?: string | null;
}) {
  return [
    input.firstName ? `Prénom: ${input.firstName}` : null,
    input.universes.length
      ? `Univers qui attirent: ${input.universes.join(", ")}`
      : "Aucune préférence d’univers (surprenez-moi).",
    input.goal ? `Objectif: ${input.goal}` : null,
    input.presentation ? `Présentation souhaitée: ${input.presentation}` : null,
    input.ageRange ? `Tranche d’âge déclarée: ${input.ageRange}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function finalLookPrompt(input: GenerateFinalLookInput, strongerIdentity: boolean) {
  const palette = input.colorProfile.map((color) => `${color.name} (${color.hex})`).join(", ");
  const pieces = input.recommendedPieces?.length
    ? `Prefer these kinds of pieces if they fit naturally: ${input.recommendedPieces.slice(0, 5).join(", ")}.`
    : "";
  return [
    `Photorealistic vertical fashion photograph of the SAME real person as in the reference photos.`,
    `Keep the same face, hairstyle, hair color, skin tone, body shape, proportions and visual identity.`,
    `Do not turn this into another person, a generic model, or a beauty-filtered version.`,
    strongerIdentity
      ? `Critical identity lock: the person must be immediately recognizable. Face and body come first, clothing second.`
      : `Priority: resemblance to the user over clothing fashion.`,
    `Use the full-body reference as the main base when available. Keep a similar crop and camera distance.`,
    `Change only clothing and light styling. Do not alter the body.`,
    `PRIMARY STYLE (must dominate the outfit, silhouette, and overall mood): ${input.primaryStyle}.`,
    `SECONDARY STYLE (subtle influence only): ${input.secondaryStyle}. Add at most one quiet layer, texture, or accessory from this universe. It must not take over.`,
    `The result should clearly read as ${input.primaryStyle}, gently enriched by ${input.secondaryStyle}.`,
    `Prefer this palette when it fits naturally: ${palette}.`,
    pieces,
    `Realistic, elegant, wearable in everyday life. Premium, clean, modern.`,
    `Not a costume, not a fashion-show exaggeration, not a caricature of the trend.`,
    `Natural light, no text, no watermark, no logo.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function createOpenAIStyleProvider(): StyleAIProvider {
  return {
    id: "openai",
    async analyzeStyleProfile(input) {
      if (!input.images.length) {
        throw new StyleAIError("no_photos", "No usable images provided to vision analysis");
      }

      const client = getOpenAIClient();
      const model = getStyleVisionModel();
      const prefs = preferenceBlock(input.preferences);
      const images = input.images.slice(0, MAX_VISION_IMAGES);

      const userContent = [
        {
          type: "text" as const,
          text: `Analyse ces photos pour un Style Profile FITME.\n${prefs}\nLes préférences n’imposent pas le résultat ; elles aident seulement à nuancer.\nPriorise le portrait pour le visage / teint / cheveux, et le plein pied pour la silhouette.`,
        },
        ...images.map((image) => ({
          type: "image_url" as const,
          image_url: {
            url: imageToDataUrl(image),
            detail: image.type === "extra" ? ("low" as const) : ("high" as const),
          },
        })),
      ];

      const started = Date.now();
      let raw = "";
      try {
        const completion = await client.chat.completions.create(
          {
            model,
            ...visionTokenOptions(model, 2200),
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userContent },
            ],
          },
          { timeout: VISION_TIMEOUT_MS, maxRetries: 0 },
        );
        raw = completion.choices[0]?.message?.content?.trim() || "";
        if (!raw) throw new StyleAIError("invalid_json", "Réponse IA vide.");
        const result = parseVisionResult(raw);
        logStyleAICall({
          provider: "openai",
          type: "vision",
          durationMs: Date.now() - started,
          ok: true,
        });
        return result;
      } catch (error) {
        const firstError = error instanceof StyleAIError ? error : error;
        if (!(firstError instanceof StyleAIError) || firstError.code !== "invalid_json") {
          logStyleAICall({
            provider: "openai",
            type: "vision",
            durationMs: Date.now() - started,
            ok: false,
            code: firstError instanceof StyleAIError ? firstError.code : "openai_unavailable",
          });
          if (firstError instanceof StyleAIError) throw firstError;
          const message = firstError instanceof Error ? firstError.message : "OpenAI vision failed";
          if (/timed? ?out|aborted/i.test(message)) {
            throw new StyleAIError("timeout", message);
          }
          throw new StyleAIError("openai_unavailable", message);
        }

        const repairStarted = Date.now();
        try {
          const repair = await client.chat.completions.create(
            {
              model,
              ...visionTokenOptions(model, 2200),
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                  role: "user",
                  content: `Corrige ce JSON pour qu’il respecte exactement le schema. Ne change pas le fond stylistique. JSON précédent:\n${raw.slice(0, 6000)}\nErreur: ${firstError.technicalMessage}`,
                },
              ],
            },
            { timeout: VISION_TIMEOUT_MS, maxRetries: 0 },
          );
          const repaired = repair.choices[0]?.message?.content?.trim() || "";
          if (!repaired) throw new StyleAIError("invalid_json", "Correction JSON vide.");
          const result = parseVisionResult(repaired);
          logStyleAICall({
            provider: "openai",
            type: "json_repair",
            durationMs: Date.now() - repairStarted,
            ok: true,
          });
          logStyleAICall({
            provider: "openai",
            type: "vision",
            durationMs: Date.now() - started,
            ok: true,
          });
          return result;
        } catch (repairError) {
          logStyleAICall({
            provider: "openai",
            type: "json_repair",
            durationMs: Date.now() - repairStarted,
            ok: false,
            code: "invalid_json",
          });
          logStyleAICall({
            provider: "openai",
            type: "vision",
            durationMs: Date.now() - started,
            ok: false,
            code: "invalid_json",
          });
          if (repairError instanceof StyleAIError) throw repairError;
          throw new StyleAIError(
            "invalid_json",
            repairError instanceof Error ? repairError.message : "JSON repair failed",
          );
        }
      }
    },

    async generateFinalLook(input: GenerateFinalLookInput): Promise<GeneratedImage> {
      const client = getOpenAIClient();
      const model = getStyleImageModel();
      const references = [input.sourceImage, ...(input.referenceImages ?? [])].filter(
        (image, index, all) => all.findIndex((candidate) => candidate.filename === image.filename) === index,
      );

      const toUploadables = () =>
        Promise.all(
          references.slice(0, 3).map((image) =>
            toFile(image.bytes, image.filename || "source.jpg", {
              type: image.mimeType || "image/jpeg",
            }),
          ),
        );

      const run = async (strongerIdentity: boolean) => {
        const started = Date.now();
        const files = await toUploadables();
        try {
          const response = await client.images.edit(
            {
              model,
              image: files.length === 1 ? files[0] : files,
              prompt: finalLookPrompt(input, strongerIdentity),
              size: "1024x1536",
              quality: "medium",
              input_fidelity: "high",
            } as Parameters<typeof client.images.edit>[0],
            { timeout: IMAGE_TIMEOUT_MS, maxRetries: 0 },
          );

          const b64 = "data" in response ? response.data?.[0]?.b64_json : undefined;
          if (!b64) throw new StyleAIError("image_failed", "Image generated without payload.");

          logStyleAICall({
            provider: "openai",
            type: "image",
            durationMs: Date.now() - started,
            ok: true,
          });

          return {
            title: "Votre look recommandé",
            style: input.primaryStyle,
            description: `${input.primaryStyle} en direction principale, avec une touche ${input.secondaryStyle}.`,
            pieces: input.recommendedPieces?.slice(0, 4) ?? [],
            colors: input.colorProfile.slice(0, 4).map((color) => color.hex),
            bytes: Buffer.from(b64, "base64"),
            mimeType: "image/png" as const,
          };
        } catch (error) {
          logStyleAICall({
            provider: "openai",
            type: "image",
            durationMs: Date.now() - started,
            ok: false,
            code: "image_failed",
          });
          if (error instanceof StyleAIError) throw error;
          const message = error instanceof Error ? error.message : "Image generation failed";
          if (/timed? ?out|aborted/i.test(message)) {
            throw new StyleAIError("timeout", message);
          }
          throw new StyleAIError("image_failed", message);
        }
      };

      try {
        return await run(false);
      } catch {
        return run(true);
      }
    },
  };
}
