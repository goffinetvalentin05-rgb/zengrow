import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

export class AIConfigurationError extends Error {
  constructor(message = "Le service IA n'est pas configuré. Contactez l'administrateur.") {
    super(message);
    this.name = "AIConfigurationError";
  }
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini";
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

type GenerateWithToolsOptions = {
  system: string;
  messages: ChatCompletionMessageParam[];
  tools: ChatCompletionTool[];
  maxTokens?: number;
  timeoutMs?: number;
};

export type ToolCallRequest = {
  id: string;
  name: string;
  arguments: string;
};

export type GenerateWithToolsResult = {
  model: string;
  message: OpenAI.Chat.Completions.ChatCompletionMessage;
  toolCalls: ToolCallRequest[];
  finishReason: string | null;
};

export async function generateWithTools({
  system,
  messages,
  tools,
  maxTokens = 1600,
  timeoutMs = 25000,
}: GenerateWithToolsOptions): Promise<GenerateWithToolsResult> {
  const client = getOpenAIClient();
  const model = getOpenAIModel();
  const controller = timeoutMs ? new AbortController() : null;
  const timer = timeoutMs ? setTimeout(() => controller?.abort(), timeoutMs) : null;

  let completion;
  try {
    completion = await client.chat.completions.create(
      {
        model,
        max_tokens: maxTokens,
        messages: [{ role: "system", content: system }, ...messages],
        tools: tools.length ? tools : undefined,
        tool_choice: tools.length ? "auto" : undefined,
      },
      controller ? { signal: controller.signal } : undefined,
    );
  } finally {
    if (timer) clearTimeout(timer);
  }

  const message = completion.choices[0]?.message;
  if (!message) {
    throw new Error("Réponse IA vide.");
  }

  const toolCalls: ToolCallRequest[] = (message.tool_calls ?? [])
    .filter((call): call is OpenAI.Chat.Completions.ChatCompletionMessageToolCall & { type: "function" } => call.type === "function")
    .map((call) => ({
      id: call.id,
      name: call.function.name,
      arguments: call.function.arguments,
    }));

  return {
    model,
    message,
    toolCalls,
    finishReason: completion.choices[0]?.finish_reason ?? null,
  };
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
  timeoutMs?: number;
};

export async function generateStructuredAI<T>({
  system,
  user,
  maxTokens = 900,
  parse,
  timeoutMs,
}: GenerateStructuredAIOptions<T>) {
  const client = getOpenAIClient();
  const model = getOpenAIModel();
  const controller = timeoutMs ? new AbortController() : null;
  const timer = timeoutMs
    ? setTimeout(() => controller?.abort(), timeoutMs)
    : null;

  let completion;
  try {
    completion = await client.chat.completions.create(
      {
        model,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      },
      controller ? { signal: controller.signal } : undefined,
    );
  } finally {
    if (timer) clearTimeout(timer);
  }

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
