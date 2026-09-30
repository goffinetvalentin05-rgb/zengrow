import { LEARN_ROUTES } from "@/src/lib/learn/routes";

export function destinationAfterAuth(onboardingCompleted: boolean | null | undefined) {
  return onboardingCompleted ? LEARN_ROUTES.today : LEARN_ROUTES.onboarding;
}
