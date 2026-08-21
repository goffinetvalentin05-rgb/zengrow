export type StyleAIErrorCode =
  | "not_configured"
  | "no_photos"
  | "openai_unavailable"
  | "timeout"
  | "invalid_json"
  | "image_failed"
  | "storage_failed"
  | "unknown";

const USER_MESSAGES: Record<StyleAIErrorCode, string> = {
  not_configured: "Le service d’analyse n’est pas configuré.",
  no_photos: "Aucune photo utilisable n’a été trouvée. Ajoutez un portrait et une photo plein pied.",
  openai_unavailable: "Le service d’analyse est momentanément indisponible. Réessayez dans un instant.",
  timeout: "L’analyse a pris trop de temps. Réessayez.",
  invalid_json: "Nous n’avons pas pu construire votre profil. Réessayez.",
  image_failed: "Nous n’avons pas pu générer votre look. Réessayez.",
  storage_failed: "Impossible d’enregistrer votre look. Réessayez.",
  unknown: "Quelque chose n’a pas fonctionné. Réessayez.",
};

export class StyleAIError extends Error {
  readonly code: StyleAIErrorCode;
  readonly userMessage: string;
  readonly technicalMessage: string;

  constructor(code: StyleAIErrorCode, technicalMessage: string, userMessage = USER_MESSAGES[code]) {
    super(userMessage);
    this.name = "StyleAIError";
    this.code = code;
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage;
  }
}

export function userMessageForStyleAI(code: StyleAIErrorCode) {
  return USER_MESSAGES[code];
}

export function classifyStyleAIError(error: unknown): {
  code: StyleAIErrorCode;
  user: string;
  technical: string;
} {
  if (error instanceof StyleAIError) {
    return { code: error.code, user: error.userMessage, technical: error.technicalMessage };
  }

  const technical = error instanceof Error ? error.message : "Erreur inconnue.";
  const lower = technical.toLowerCase();

  if (lower.includes("openai_api_key") || lower.includes("n'est pas configuré") || lower.includes("n’est pas configuré")) {
    return { code: "not_configured", user: USER_MESSAGES.not_configured, technical };
  }
  if (lower.includes("timed out") || lower.includes("timeout") || lower.includes("etimedout") || lower.includes("aborted")) {
    return { code: "timeout", user: USER_MESSAGES.timeout, technical };
  }
  if (
    lower.includes("json") ||
    lower.includes("unexpected token") ||
    lower.includes("invalid_type") ||
    lower.includes("zod")
  ) {
    return { code: "invalid_json", user: USER_MESSAGES.invalid_json, technical };
  }
  if (
    lower.includes("photo") ||
    lower.includes("introuvable") && lower.includes("image") ||
    lower.includes("aucune photo")
  ) {
    return { code: "no_photos", user: USER_MESSAGES.no_photos, technical };
  }
  if (lower.includes("enregistrer") || lower.includes("storage") || lower.includes("bucket")) {
    return { code: "storage_failed", user: USER_MESSAGES.storage_failed, technical };
  }
  if (lower.includes("image generated") || lower.includes("look") || lower.includes("b64")) {
    return { code: "image_failed", user: USER_MESSAGES.image_failed, technical };
  }
  if (
    lower.includes("429") ||
    lower.includes("503") ||
    lower.includes("openai") ||
    lower.includes("rate limit") ||
    lower.includes("service unavailable")
  ) {
    return { code: "openai_unavailable", user: USER_MESSAGES.openai_unavailable, technical };
  }

  return { code: "unknown", user: USER_MESSAGES.unknown, technical };
}
