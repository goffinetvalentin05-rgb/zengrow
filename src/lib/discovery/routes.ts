export const DISCOVERY_ROUTES = {
  explore: "/explore",
  following: "/following",
  saved: "/saved",
  me: "/me",
  meEdit: "/me/edit",
  analytics: "/analytics",
  settings: "/settings",
  onboarding: "/onboarding",
  search: "/search",
  categories: "/categories",
  admin: "/admin",
  login: "/pro/login",
  signup: "/pro/signup",
} as const;

export function categoryHref(slug: string) {
  return `/category/${slug}`;
}

export function profileHref(username: string) {
  return `/u/${username}`;
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
