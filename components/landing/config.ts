import { getSharpzContactMailto } from "@/src/lib/site-url";

export const ROUTES = {
  home: "/",
  signup: "/pro/signup",
  login: "/pro/login",
  privacy: "/confidentialite",
  terms: "/conditions",
  explore: "/explore",
  discover: "#decouvrir",
  how: "#how",
  pricing: "#pricing",
  faq: "#faq",
  start: "#start",
  contact: getSharpzContactMailto(),
} as const;

/** @deprecated Prefer locale dictionaries for SEO copy. Kept for legal pages. */
export const PRODUCT = {
  name: "Sharpz",
} as const;
