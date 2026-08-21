export const STYLE_PROFILE_PRODUCT = "style_profile" as const;

export const STYLE_PROFILE_PRICE = {
  amount: Number.parseInt(process.env.STRIPE_STYLE_PROFILE_AMOUNT ?? "790", 10) || 790,
  currency: (process.env.STRIPE_STYLE_PROFILE_CURRENCY ?? "chf").toLowerCase(),
  label: "7,90 CHF",
} as const;

export const STYLE_INPUTS_BUCKET = "style-inputs";
export const STYLE_RESULTS_BUCKET = "style-results";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
export const COMPRESSED_MAX_EDGE = 1600;
export const COMPRESSED_JPEG_QUALITY = 0.84;

export const STYLE_UNIVERSES = [
  { id: "clean-minimal", name: "Clean Minimal" },
  { id: "old-money", name: "Old Money" },
  { id: "streetwear", name: "Streetwear" },
  { id: "smart-casual", name: "Smart Casual" },
  { id: "relaxed", name: "Relaxed" },
  { id: "workwear", name: "Workwear" },
] as const;

export const SURPRISE_UNIVERSE = {
  id: "surprise",
  name: "Je ne sais pas — surprenez-moi.",
} as const;

export const STYLE_GOALS = [
  { id: "coherent", label: "Trouver un style plus cohérent" },
  { id: "colors", label: "Découvrir mes meilleures couleurs" },
  { id: "change", label: "Changer ma façon de m’habiller" },
  { id: "stop-random", label: "Arrêter d’acheter au hasard" },
  { id: "see-what-fits", label: "Juste voir ce qui me va" },
] as const;

export const PHOTO_SLOTS = [
  {
    key: "portrait" as const,
    type: "portrait" as const,
    title: "Portrait",
    hint: "Visage net, lumière naturelle",
    required: true,
    fileStem: "portrait",
  },
  {
    key: "full_body" as const,
    type: "full_body" as const,
    title: "Plein pied",
    hint: "De face, corps entier visible",
    required: true,
    fileStem: "full-body",
  },
  {
    key: "extra" as const,
    type: "extra" as const,
    title: "Photo supplémentaire",
    hint: "Un autre angle récent",
    required: true,
    fileStem: "extra-1",
  },
  {
    key: "extra2" as const,
    type: "extra" as const,
    title: "Optionnelle",
    hint: "Si vous en avez une de plus",
    required: false,
    fileStem: "extra-2",
  },
] as const;

export const ONBOARDING_STEPS = [
  { id: 1, label: "Photos" },
  { id: 2, label: "Préférences" },
  { id: 3, label: "Vérification" },
] as const;

export const ANALYSIS_STAGE_COPY = [
  "Analyse de vos photos…",
  "Comparaison des univers…",
  "Création de votre palette…",
  "Construction de votre Style Profile…",
] as const;

export const ANALYSIS_STATUS_COPY: Record<string, string> = {
  queued: ANALYSIS_STAGE_COPY[0],
  analyzing: ANALYSIS_STAGE_COPY[1],
  preview_ready: "Votre Style Profile est prêt.",
  awaiting_payment: "Votre Style Profile est prêt.",
  paid: "Votre profil est débloqué.",
  generating_looks: "Nous créons maintenant votre look recommandé.",
  completed: "Votre Style Profile est prêt.",
  failed: "On n’a pas réussi à terminer votre analyse.",
};

export const ANALYSIS_IN_PROGRESS_STATUSES = ["queued", "analyzing"] as const;
export const PAYWALL_STATUSES = ["preview_ready", "awaiting_payment"] as const;
export const LOOKS_IN_PROGRESS_STATUSES = ["paid", "generating_looks"] as const;
export const RESUMABLE_DRAFT_STATUSES = ["draft", "uploaded"] as const;

export function sourceStoragePath(
  userId: string,
  analysisId: string,
  stem: string,
  ext = "jpg",
) {
  return `${userId}/${analysisId}/${stem}.${ext}`;
}
