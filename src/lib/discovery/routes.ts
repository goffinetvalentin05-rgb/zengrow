export const DISCOVERY_ROUTES = {
  explore: "/explore",
  following: "/following",
  saved: "/saved",
  me: "/me",
  meEdit: "/me/edit",
  analytics: "/analytics",
  settings: "/discovery-settings",
  onboarding: "/discovery-onboarding",
  search: "/search",
  categories: "/categories",
  admin: "/admin",
  login: "/login",
  signup: "/signup",
} as const;

export function categoryHref(slug: string) {
  return `/category/${slug}`;
}

export function profileHref(username: string) {
  return `/${username.toLowerCase()}`;
}

export const DISCOVERY_AUTH_PATHS = [
  DISCOVERY_ROUTES.explore,
  DISCOVERY_ROUTES.following,
  DISCOVERY_ROUTES.saved,
  DISCOVERY_ROUTES.me,
  DISCOVERY_ROUTES.analytics,
  DISCOVERY_ROUTES.settings,
  DISCOVERY_ROUTES.onboarding,
  DISCOVERY_ROUTES.search,
  DISCOVERY_ROUTES.admin,
] as const;

export function isDiscoveryAuthPath(pathname: string) {
  return DISCOVERY_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
