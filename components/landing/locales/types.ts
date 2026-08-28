export type Locale = "fr" | "en";

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
    features: string;
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
    finePrint: string;
    urlPlaceholder: string;
  };
  todayMockup: {
    title: string;
    actions: Array<{
      index: string;
      title: string;
      description: string;
      impact: string;
    }>;
  };
  problem: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    questions: string[];
    closeLabel: string;
    closeTitle: string;
    closeSubtitle: string;
    priorities: Array<{
      index: string;
      impact: string;
      title: string;
      tone: "high" | "medium";
    }>;
  };
  features: {
    label: string;
    title: string;
    subtitle: string;
    items: Array<{
      index: string;
      title: string;
      text: string;
      chips: string[];
      phrase?: string;
    }>;
    closingLine1: string;
    closingLine2: string;
    closingLine3: string;
  };
  how: {
    label: string;
    title: string;
    subtitle: string;
    steps: Array<{
      index: string;
      title: string;
      text: string;
      visual: "url" | "questions" | "context" | "today";
      urlPlaceholder?: string;
      bubbles?: string[];
      orbs?: string[];
      actions?: string[];
    }>;
    closingLine1: string;
    closingLine2: string;
  };
  faq: {
    label: string;
    title: string;
    items: Array<{
      q: string;
      a: string;
    }>;
  };
  finalCta: {
    label: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    urlPlaceholder: string;
    analyze: string;
    finePrint: string;
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
