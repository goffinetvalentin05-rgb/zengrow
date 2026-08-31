export const ROUTES = {
  home: "/",
  signup: "/pro/signup",
  login: "/pro/login",
  privacy: "/confidentialite",
  terms: "/conditions",
  explore: "#explore",
  categories: "#categories",
  how: "#how",
  faq: "#faq",
  start: "#start",
  contact: "mailto:contact@zengrow.ch",
} as const;

/** @deprecated Prefer locale dictionaries for SEO copy. Kept for legal pages. */
export const PRODUCT = {
  name: "Sharpz",
} as const;
