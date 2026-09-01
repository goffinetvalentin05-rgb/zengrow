export type Locale = "fr" | "en";

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
  meta: { title: string; description: string };
  brand: { name: string };
  nav: {
    discover: string;
    how: string;
    pricing: string;
    faq: string;
    cta: string;
    login: string;
    openMenu: string;
    closeMenu: string;
    homeAria: string;
  };
  lang: { fr: string; en: string; switchAria: string };
  hero: {
    title: string;
    titleLead: string;
    titleRotating: readonly string[];
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  problem: {
    label: string;
    title: string;
    text: string;
  };
  answer: {
    label: string;
    title: string;
    text: string;
    discoverTitle: string;
    discoverText: string;
    followTitle: string;
    followText: string;
    connectTitle: string;
    connectText: string;
    example: string;
  };
  difference: { title: string };
  profile: { title: string; text1: string; text2: string; note: string };
  how: { title: string; steps: ReadonlyArray<{ title: string; text: string }> };
  pricing: {
    label: string;
    title: string;
    subtitle: string;
    free: {
      name: string;
      price: string;
      period: string;
      tagline: string;
      features: readonly string[];
      cta: string;
    };
    pro: {
      name: string;
      price: string;
      period: string;
      tagline: string;
      features: readonly string[];
      cta: string;
    };
  };
  faq: {
    label: string;
    title: string;
    subtitle: string;
    items: ReadonlyArray<{ q: string; a: string }>;
  };
  finalCta: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    privacy: string;
    terms: string;
    contact: string;
    pricing: string;
  };
};
