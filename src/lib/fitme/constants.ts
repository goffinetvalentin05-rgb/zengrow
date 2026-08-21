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
  { id: "surprise", name: "Je ne sais pas / surprenez-moi" },
] as const;

export const STYLE_GOALS = [
  { id: "everyday", label: "Mieux m’habiller au quotidien" },
  { id: "change", label: "Changer de style" },
  { id: "colors", label: "Comprendre mes couleurs" },
  { id: "identity", label: "Trouver une identité plus cohérente" },
  { id: "discover", label: "Simplement découvrir ce qui me va" },
] as const;

export const PHOTO_SLOTS = [
  {
    key: "portrait" as const,
    type: "portrait" as const,
    title: "Portrait",
    hint: "Visage net, lumière naturelle",
    required: true,
  },
  {
    key: "full_body" as const,
    type: "full_body" as const,
    title: "Plein pied",
    hint: "De face, corps entier visible",
    required: true,
  },
  {
    key: "extra" as const,
    type: "extra" as const,
    title: "Photo supplémentaire",
    hint: "Un autre angle récent",
    required: true,
  },
  {
    key: "extra2" as const,
    type: "extra" as const,
    title: "Optionnelle",
    hint: "Si vous en avez une de plus",
    required: false,
  },
] as const;

export const ANALYSIS_STATUS_COPY: Record<string, string> = {
  queued: "Analyse de vos photos…",
  analyzing: "Comparaison des univers…",
  preview_ready: "Votre Style Profile est prêt.",
  awaiting_payment: "Votre Style Profile est prêt.",
  generating_looks: "Génération de vos looks…",
  completed: "Votre Style Profile est prêt.",
  failed: "Quelque chose n’a pas fonctionné.",
};

export const ANALYSIS_IN_PROGRESS_STATUSES = ["queued", "analyzing"] as const;
export const PAYWALL_STATUSES = ["preview_ready", "awaiting_payment"] as const;
export const LOOKS_IN_PROGRESS_STATUSES = ["generating_looks"] as const;
export const RESUMABLE_DRAFT_STATUSES = ["draft", "uploaded"] as const;
