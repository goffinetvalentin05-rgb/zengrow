import { MAX_NICHES, ONBOARDING_ROLES, type ProfileType, type ProjectStatus } from "@/src/lib/discovery/constants";
import { classifyPublicSlug } from "@/src/lib/discovery/public-link";
import { normalizeHttpUrl } from "@/src/lib/discovery/media";
import { slugifyUsername } from "@/src/lib/discovery/slug";

export const ONBOARDING_STORAGE_KEY = "sharpz-onboarding-draft";
export const ONBOARDING_JUST_FINISHED_KEY = "sharpz-onboarding-just-finished";

export const ONBOARDING_STEPS = ["interests", "identity", "project", "appearance"] as const;
export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

export type OnboardingDraft = {
  profileId: string;
  step: OnboardingStepId;
  niches: string[];
  profileType: string;
  displayName: string;
  username: string;
  bio: string;
  location: string;
  country: string;
  skipProject: boolean;
  projectName: string;
  projectDescription: string;
  projectUrl: string;
  projectLogoUrl: string;
  projectCategory: string;
  projectStatus: ProjectStatus;
  themeKey: string;
  avatarUrl: string;
  coverImageUrl: string;
  links: Record<string, string>;
};

export function emptyOnboardingDraft(profileId: string, seed?: Partial<OnboardingDraft>): OnboardingDraft {
  return {
    step: "interests",
    niches: [],
    profileType: "",
    displayName: "",
    username: "",
    bio: "",
    location: "",
    country: "",
    skipProject: false,
    projectName: "",
    projectDescription: "",
    projectUrl: "",
    projectLogoUrl: "",
    projectCategory: "",
    projectStatus: "building",
    themeKey: "obsidian",
    avatarUrl: "",
    coverImageUrl: "",
    links: {},
    ...seed,
    profileId,
  };
}

export function isOnboardingRole(value: string): value is (typeof ONBOARDING_ROLES)[number] {
  return (ONBOARDING_ROLES as readonly string[]).includes(value);
}

export function canLeaveOnboardingStep(step: OnboardingStepId, draft: OnboardingDraft) {
  if (step === "interests") return draft.niches.length >= 1 && draft.niches.length <= MAX_NICHES;
  if (step === "identity") {
    return (
      draft.displayName.trim().length >= 2 &&
      classifyPublicSlug(slugifyUsername(draft.username)) === "ok" &&
      isOnboardingRole(draft.profileType)
    );
  }
  if (step === "project") {
    if (draft.skipProject) return true;
    if (!draft.projectName.trim()) {
      const started = Boolean(draft.projectUrl.trim() || draft.projectDescription.trim() || draft.projectLogoUrl);
      return !started;
    }
    return isOptionalUrlOk(draft.projectUrl);
  }
  if (step === "appearance") {
    return Object.values(draft.links).every((url) => isOptionalUrlOk(url));
  }
  return true;
}

export function isOptionalUrlOk(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(normalizeHttpUrl(trimmed));
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export function profileHasMinimumOnboarding(input: {
  onboardingCompleted?: boolean;
  username?: string | null;
  profileType?: string | null;
  nicheCount?: number;
}) {
  if (input.onboardingCompleted) return true;
  return Boolean(input.username?.trim() && input.profileType && (input.nicheCount ?? 0) > 0);
}

export function readOnboardingDraft(profileId: string): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraft;
    if (parsed?.profileId !== profileId) return null;
    return { ...emptyOnboardingDraft(profileId), ...parsed, profileId };
  } catch {
    return null;
  }
}

export function writeOnboardingDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(draft));
}

export function clearOnboardingDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function markOnboardingJustFinished() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ONBOARDING_JUST_FINISHED_KEY, "1");
  sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function consumeOnboardingJustFinished() {
  if (typeof window === "undefined") return false;
  const value = sessionStorage.getItem(ONBOARDING_JUST_FINISHED_KEY);
  if (!value) return false;
  sessionStorage.removeItem(ONBOARDING_JUST_FINISHED_KEY);
  return true;
}
