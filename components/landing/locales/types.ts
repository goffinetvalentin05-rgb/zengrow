export type Locale = "fr" | "en";

/** Drives which mock preview visual a category card renders. */
export type CategoryKind =
  | "saas"
  | "ecommerce"
  | "agency"
  | "ofm"
  | "creators"
  | "ai"
  | "realestate"
  | "marketing"
  | "sales"
  | "freelancing";

export type LandingDictionary = {
  meta: {
    title: string;
    description: string;
  };
  brand: {
    name: string;
    tagline: string;
  };
  nav: {
    explore: string;
    categories: string;
    how: string;
    faq: string;
    login: string;
    cta: string;
    openMenu: string;
    closeMenu: string;
    homeAria: string;
  };
  lang: {
    fr: string;
    en: string;
    switchAria: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  problem: {
    label: string;
    title: string;
    body: string;
    pointsLead: string;
    points: string[];
    visualCaption: string;
    visualKicker: string;
    visualAlt: string;
    popularLabel: string;
    foundLabel: string;
    popular: Array<{
      name: string;
      initials: string;
      followers: string;
    }>;
    rising: Array<{
      name: string;
      initials: string;
      tag: string;
    }>;
  };
  discover: {
    label: string;
    title: string;
    subtitle: string;
    categoryLabel: string;
    categoryValue: string;
    /** Order drives dome placement: first 8 on the back ring, last 4 in front. */
    niches: string[];
    filters: string[];
    viewProfile: string;
    followersLabel: string;
    projectLabel: string;
    profiles: Array<{
      name: string;
      role: string;
      project: string;
      followers: string;
      platforms: string[];
      initials: string;
      badge: string;
    }>;
  };
  how: {
    title: string;
    subtitle: string;
    steps: Array<{
      index: string;
      title: string;
      text: string;
    }>;
  };
  finalCta: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  faq: {
    label: string;
    title: string;
    items: Array<{
      q: string;
      a: string;
    }>;
  };
  footer: {
    product: string;
    faq: string;
    privacy: string;
    terms: string;
    tagline: string;
  };
  sign: {
    marks: [string, string, string, string, string];
  };
};
