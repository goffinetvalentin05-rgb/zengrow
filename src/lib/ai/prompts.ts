import type { CampaignAIResult, ImproveReviewEmailAIResult, PrivateFeedbackAIAnalysis } from "@/src/lib/ai/types";

const NO_EMOJI_RULE = "Ne pas utiliser d'emojis.";

export function buildGoogleReviewReplyPrompt(params: {
  reviewText: string;
  rating?: number;
  tone: string;
  language: string;
  length: string;
}) {
  const system = `Tu es un assistant spécialisé dans la gestion de réputation pour restaurants.
Rédige une réponse professionnelle à un avis Google.
Contraintes :
- Répondre dans la langue demandée (${params.language}).
- Ton : ${params.tone}.
- Longueur : ${params.length === "short" ? "courte" : "moyenne"}.
- Ton naturel, chaleureux et professionnel.
- Ne pas être défensif.
- Remercier le client.
- Si l'avis contient une critique, reconnaître le problème avec tact.
- Ne pas inventer de geste commercial.
- Ne pas promettre une action précise si elle n'est pas donnée.
- ${NO_EMOJI_RULE}
- Générer uniquement la réponse finale, sans explication.`;

  const ratingLine =
    params.rating != null ? `Note Google : ${params.rating}/5\n\n` : "";

  const user = `${ratingLine}Avis client :\n${params.reviewText}`;

  return { system, user };
}

export function buildCampaignPrompt(params: {
  objective: string;
  offer?: string;
  audience?: string;
  channels: string[];
  tone?: string;
  language: string;
}) {
  const system = `Tu es un assistant marketing spécialisé pour restaurants.
Génère une campagne claire, courte et directement utilisable.
Adapte le texte aux canaux demandés : ${params.channels.join(", ")}.
Langue : ${params.language}.
${params.tone ? `Ton : ${params.tone}.` : "Ton professionnel et chaleureux."}
Ne pas être trop générique.
Ne pas exagérer les promesses.
Pas d'emojis sauf si le ton demandé est très informel.
Réponds uniquement avec un objet JSON valide contenant les clés pertinentes parmi :
emailSubject, emailBody, sms, whatsapp, instagramPost, cta.
Omettre les clés des canaux non demandés.`;

  const user = [
    `Objectif : ${params.objective}`,
    params.offer ? `Offre : ${params.offer}` : null,
    params.audience ? `Audience : ${params.audience}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return { system, user };
}

export function parseCampaignResult(raw: unknown): CampaignAIResult {
  const o = raw as Record<string, unknown>;
  const pick = (key: keyof CampaignAIResult) =>
    typeof o[key] === "string" ? (o[key] as string) : undefined;

  return {
    emailSubject: pick("emailSubject"),
    emailBody: pick("emailBody"),
    sms: pick("sms"),
    whatsapp: pick("whatsapp"),
    instagramPost: pick("instagramPost"),
    cta: pick("cta"),
  };
}

export function buildPrivateFeedbackPrompt(params: { feedbackText: string; rating?: number }) {
  const system = `Tu es un assistant spécialisé dans l'expérience client pour restaurants.
Analyse un retour privé laissé par un client insatisfait ou moyennement satisfait.
Résume le problème, détecte le sentiment, donne une réponse conseillée et une action concrète.
Ne pas inventer d'informations.
Rester professionnel et utile.
${NO_EMOJI_RULE}
Réponds uniquement en JSON avec les clés :
summary (string),
sentiment ("positive" | "neutral" | "negative"),
mainIssue (string, optionnel),
urgency ("low" | "medium" | "high"),
suggestedReply (string),
recommendedAction (string).`;

  const ratingLine = params.rating != null ? `Note : ${params.rating}/5\n\n` : "";
  const user = `${ratingLine}Retour client :\n${params.feedbackText}`;

  return { system, user };
}

export function parsePrivateFeedbackAnalysis(raw: unknown): PrivateFeedbackAIAnalysis {
  const o = raw as Record<string, unknown>;
  const sentiment = o.sentiment;
  const urgency = o.urgency;

  if (typeof o.summary !== "string" || typeof o.suggestedReply !== "string" || typeof o.recommendedAction !== "string") {
    throw new Error("Analyse IA incomplète.");
  }

  if (sentiment !== "positive" && sentiment !== "neutral" && sentiment !== "negative") {
    throw new Error("Sentiment IA invalide.");
  }

  if (urgency !== "low" && urgency !== "medium" && urgency !== "high") {
    throw new Error("Urgence IA invalide.");
  }

  return {
    summary: o.summary,
    sentiment,
    mainIssue: typeof o.mainIssue === "string" ? o.mainIssue : undefined,
    urgency,
    suggestedReply: o.suggestedReply,
    recommendedAction: o.recommendedAction,
  };
}

export function buildImproveReviewEmailPrompt(params: {
  currentText?: string;
  restaurantName?: string;
  tone?: string;
  language: string;
}) {
  const system = `Tu es un assistant spécialisé dans les emails clients pour restaurants.
Améliore ou génère un email court de demande d'avis après une visite.
L'email doit inviter le client à donner son ressenti.
Il ne doit pas être agressif ni trop commercial.
Il doit rester naturel, professionnel et court.
Langue : ${params.language}.
${params.tone ? `Ton : ${params.tone}.` : ""}
Préserver les variables si elles existent : {{client_name}}, {{restaurant_name}}, {{review_link}}.
${NO_EMOJI_RULE}
Réponds uniquement en JSON avec subject (string) et body (string).`;

  const user = [
    params.restaurantName ? `Restaurant : ${params.restaurantName}` : null,
    params.currentText ? `Texte actuel :\n${params.currentText}` : "Générer un modèle par défaut adapté à un restaurant.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { system, user };
}

export function parseImproveReviewEmailResult(raw: unknown): ImproveReviewEmailAIResult {
  const o = raw as Record<string, unknown>;
  if (typeof o.subject !== "string" || typeof o.body !== "string") {
    throw new Error("Email IA incomplet.");
  }
  return { subject: o.subject, body: o.body };
}
