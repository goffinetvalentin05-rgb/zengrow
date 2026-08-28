import type { SupabaseClient } from "@supabase/supabase-js";
import type { AcquisitionChannel, ScanResult, UserObjective, UserSaas } from "@/src/lib/sharpz/types";

export type OnboardingFlowStep =
  | "url"
  | "scanning"
  | "pricing"
  | "stage"
  | "primary"
  | "extra"
  | "channels"
  | "summary"
  | "generating";

export const ONBOARDING_RESUME_STEPS = [
  "url",
  "pricing",
  "stage",
  "primary",
  "extra",
  "channels",
  "summary",
] as const;

export type OnboardingResumeStep = (typeof ONBOARDING_RESUME_STEPS)[number];

export type OnboardingDraft = {
  url?: string;
  scan?: ScanResult | null;
  pricing?: string;
  stage?: string;
  primaryObjective?: string;
  extraObjectives?: string[];
  channels?: string[];
};

export type OnboardingInitialState = {
  step: OnboardingResumeStep;
  url: string;
  scan: ScanResult | null;
  pricing: string;
  stage: string;
  primaryObjective: string;
  extraObjectives: string[];
  channels: string[];
};

export type OnboardingDraftPayload = OnboardingDraft & {
  step: OnboardingResumeStep;
};

function isResumeStep(value: string | null | undefined): value is OnboardingResumeStep {
  return ONBOARDING_RESUME_STEPS.includes(value as OnboardingResumeStep);
}

export function parseOnboardingDraft(value: unknown): OnboardingDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  return {
    url: typeof raw.url === "string" ? raw.url : undefined,
    scan: (raw.scan as ScanResult | null | undefined) ?? undefined,
    pricing: typeof raw.pricing === "string" ? raw.pricing : undefined,
    stage: typeof raw.stage === "string" ? raw.stage : undefined,
    primaryObjective: typeof raw.primaryObjective === "string" ? raw.primaryObjective : undefined,
    extraObjectives: Array.isArray(raw.extraObjectives)
      ? raw.extraObjectives.filter((item): item is string => typeof item === "string")
      : undefined,
    channels: Array.isArray(raw.channels)
      ? raw.channels.filter((item): item is string => typeof item === "string")
      : undefined,
  };
}

function inferResumeStep(
  saas: UserSaas | null,
  draft: OnboardingDraft,
  objectives: UserObjective[],
): OnboardingResumeStep {
  if (saas?.onboardingStep && isResumeStep(saas.onboardingStep)) {
    return saas.onboardingStep;
  }

  const primary = draft.primaryObjective ?? objectives.find((item) => item.isPrimary)?.key;
  const stage = draft.stage ?? saas?.stage ?? "";
  const pricing = draft.pricing ?? saas?.pricingSummary ?? "";
  const hasPricing = Boolean(draft.scan?.detected.pricingSummary || pricing || saas?.pricingDetected);

  if (primary && stage) return "summary";
  if (primary) return "channels";
  if (stage) return "primary";
  if (hasPricing || draft.scan === null) return "stage";
  return "pricing";
}

export function buildOnboardingInitialState(
  saas: UserSaas | null,
  objectives: UserObjective[],
  channelRows: AcquisitionChannel[],
): OnboardingInitialState {
  const draft = parseOnboardingDraft(saas?.onboardingDraft);
  const primary = objectives.find((item) => item.isPrimary);
  const extras = objectives.filter((item) => !item.isPrimary).map((item) => item.key);
  const channelKeys = channelRows.map((item) => item.channel);

  const step = saas?.onboardingStep && isResumeStep(saas.onboardingStep)
    ? saas.onboardingStep
    : inferResumeStep(saas, draft, objectives);

  return {
    step,
    url: draft.url ?? saas?.url ?? "",
    scan: draft.scan ?? null,
    pricing: draft.pricing ?? saas?.pricingSummary ?? "",
    stage: draft.stage ?? saas?.stage ?? "",
    primaryObjective: draft.primaryObjective ?? primary?.key ?? "",
    extraObjectives: draft.extraObjectives ?? extras,
    channels: draft.channels ?? channelKeys,
  };
}

export async function saveOnboardingDraft(
  supabase: SupabaseClient,
  restaurantId: string,
  payload: OnboardingDraftPayload,
) {
  const detected = payload.scan?.detected;
  const row: Record<string, unknown> = {
    restaurant_id: restaurantId,
    onboarding_completed: false,
    onboarding_step: payload.step,
    onboarding_draft: {
      url: payload.url ?? "",
      scan: payload.scan ?? null,
      pricing: payload.pricing ?? "",
      stage: payload.stage ?? "",
      primaryObjective: payload.primaryObjective ?? "",
      extraObjectives: payload.extraObjectives ?? [],
      channels: payload.channels ?? [],
    },
  };

  if (payload.url) row.url = payload.url;
  if (payload.pricing) {
    row.pricing_summary = payload.pricing;
    row.pricing_detected = true;
  }
  if (payload.stage) row.stage = payload.stage;
  if (detected?.name) row.name = detected.name;
  if (detected?.description) row.description = detected.description;
  if (detected?.market) row.market = detected.market;
  if (payload.scan?.extract) row.scan_extract = payload.scan.extract;

  const { error } = await supabase.from("user_saas").upsert(row, { onConflict: "restaurant_id" });
  if (error) throw new Error(error.message);
}
