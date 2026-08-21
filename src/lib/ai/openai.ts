import OpenAI from "openai";

export class AIConfigurationError extends Error {
  constructor(message = "Le service IA n'est pas configuré. Contactez l'administrateur.") {
    super(message);
    this.name = "AIConfigurationError";
  }
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini";
}

export function getStyleVisionModel() {
  return process.env.STYLE_VISION_MODEL?.trim() || "gpt-4o";
}

export function getStyleImageModel() {
  return process.env.STYLE_IMAGE_MODEL?.trim() || "gpt-image-1";
}

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AIConfigurationError();
  }
  return new OpenAI({ apiKey });
}

export function assertOpenAIConfigured() {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new AIConfigurationError();
  }
}

type GenerateAITextOptions = {
  system: string;
  user: string;
  maxTokens?: number;
};

export async function generateAIText({ system, user, maxTokens = 600 }: GenerateAITextOptions) {
  const client = getOpenAIClient();
  const model = getOpenAIModel();

  const completion = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Réponse IA vide.");
  }

  return { text, model };
}

type GenerateStructuredAIOptions<T> = GenerateAITextOptions & {
  parse: (raw: unknown) => T;
};

export async function generateStructuredAI<T>({
  system,
  user,
  maxTokens = 900,
  parse,
}: GenerateStructuredAIOptions<T>) {
  const client = getOpenAIClient();
  const model = getOpenAIModel();

  const completion = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("Réponse IA vide.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Réponse IA invalide (JSON attendu).");
  }

  return { data: parse(parsed), model, raw };
}
