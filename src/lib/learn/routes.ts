export const LEARN_ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  updatePassword: "/update-password",
  onboarding: "/onboarding",
  today: "/today",
  library: "/library",
  review: "/review",
  week: "/week",
  progress: "/progress",
  settings: "/settings",
} as const;

export const LEARN_APP_ROUTES = [
  LEARN_ROUTES.today,
  LEARN_ROUTES.library,
  LEARN_ROUTES.review,
  LEARN_ROUTES.week,
  LEARN_ROUTES.progress,
  LEARN_ROUTES.settings,
] as const;

export function isLearnAppPath(pathname: string) {
  return LEARN_APP_ROUTES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isLearnOnboardingPath(pathname: string) {
  return pathname === LEARN_ROUTES.onboarding || pathname.startsWith(`${LEARN_ROUTES.onboarding}/`);
}
