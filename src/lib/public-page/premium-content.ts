export type EditorialLayout = "image-left" | "image-right" | "full-bleed";
export type GalleryStyle = "grid" | "showcase" | "instagram";

export type ConceptPillar = {
  title: string;
  text: string;
};

export type EditorialSectionContent = {
  id: string;
  enabled: boolean;
  title: string;
  text: string;
  imageUrl: string;
  buttonLabel: string;
  buttonUrl: string;
  layout: EditorialLayout;
};

export type MenuOfferItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
};

export type CredibilityContent = {
  googleRating: number | null;
  reviewCount: number | null;
  googleReviewsUrl: string;
  tripAdvisorUrl: string;
  quote: string;
  quoteAuthor: string;
  pressMentions: string[];
};

export type PremiumPageContent = {
  navigationEnabled: boolean;
  concept: {
    enabled: boolean;
    title: string;
    body: string;
    imageUrl: string;
    pillars: ConceptPillar[];
  };
  editorialSections: EditorialSectionContent[];
  menuOffers: MenuOfferItem[];
  credibility: CredibilityContent;
  gallery: { style: GalleryStyle };
  practical: {
    parking: string;
    accessibility: string;
  };
  reservation: {
    groupMessage: string;
  };
};

export function defaultPremiumContent(): PremiumPageContent {
  return {
    navigationEnabled: true,
    concept: {
      enabled: true,
      title: "Notre expérience",
      body: "",
      imageUrl: "",
      pillars: [
        { title: "Une cuisine maison", text: "Des produits sélectionnés et une carte qui évolue au fil des saisons." },
        { title: "Une ambiance conviviale", text: "Un lieu pensé pour vos dîners en famille, entre amis ou en affaires." },
        { title: "Une réservation simple", text: "Réservez votre table en ligne en quelques secondes." },
      ],
    },
    editorialSections: [],
    menuOffers: [],
    credibility: {
      googleRating: null,
      reviewCount: null,
      googleReviewsUrl: "",
      tripAdvisorUrl: "",
      quote: "",
      quoteAuthor: "",
      pressMentions: [],
    },
    gallery: { style: "showcase" },
    practical: { parking: "", accessibility: "" },
    reservation: {
      groupMessage: "Pour les groupes ou événements, contactez-nous par téléphone.",
    },
  };
}

function normalizePillars(raw: unknown): ConceptPillar[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x === "object")
    .map((x) => {
      const o = x as Partial<ConceptPillar>;
      return {
        title: typeof o.title === "string" ? o.title.slice(0, 80) : "",
        text: typeof o.text === "string" ? o.text.slice(0, 280) : "",
      };
    })
    .filter((p) => p.title.trim() || p.text.trim())
    .slice(0, 4);
}

function normalizeEditorial(raw: unknown): EditorialSectionContent[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x === "object")
    .map((x, i) => {
      const o = x as Partial<EditorialSectionContent>;
      const layout: EditorialLayout =
        o.layout === "image-right" || o.layout === "full-bleed" ? o.layout : "image-left";
      return {
        id: typeof o.id === "string" ? o.id : `ed-${i}`,
        enabled: o.enabled !== false,
        title: typeof o.title === "string" ? o.title.slice(0, 120) : "",
        text: typeof o.text === "string" ? o.text.slice(0, 1200) : "",
        imageUrl: typeof o.imageUrl === "string" ? o.imageUrl : "",
        buttonLabel: typeof o.buttonLabel === "string" ? o.buttonLabel.slice(0, 60) : "",
        buttonUrl: typeof o.buttonUrl === "string" ? o.buttonUrl : "",
        layout,
      } satisfies EditorialSectionContent;
    })
    .filter((s) => s.title.trim() || s.text.trim() || s.imageUrl.trim())
    .slice(0, 4);
}

function normalizeOffers(raw: unknown): MenuOfferItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x === "object")
    .map((x, i) => {
      const o = x as Partial<MenuOfferItem>;
      return {
        id: typeof o.id === "string" ? o.id : `offer-${i}`,
        title: typeof o.title === "string" ? o.title.slice(0, 80) : "",
        description: typeof o.description === "string" ? o.description.slice(0, 240) : "",
        price: typeof o.price === "string" ? o.price.slice(0, 40) : "",
        imageUrl: typeof o.imageUrl === "string" ? o.imageUrl : "",
      };
    })
    .filter((o) => o.title.trim())
    .slice(0, 6);
}

function normalizeCredibility(raw: unknown, fallback: CredibilityContent): CredibilityContent {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Partial<CredibilityContent>;
  const rating =
    typeof o.googleRating === "number" && o.googleRating >= 1 && o.googleRating <= 5
      ? Math.round(o.googleRating * 10) / 10
      : null;
  const count = typeof o.reviewCount === "number" && o.reviewCount > 0 ? Math.floor(o.reviewCount) : null;
  return {
    googleRating: rating,
    reviewCount: count,
    googleReviewsUrl: typeof o.googleReviewsUrl === "string" ? o.googleReviewsUrl : "",
    tripAdvisorUrl: typeof o.tripAdvisorUrl === "string" ? o.tripAdvisorUrl : "",
    quote: typeof o.quote === "string" ? o.quote.slice(0, 400) : "",
    quoteAuthor: typeof o.quoteAuthor === "string" ? o.quoteAuthor.slice(0, 80) : "",
    pressMentions: Array.isArray(o.pressMentions)
      ? o.pressMentions.filter((x) => typeof x === "string").slice(0, 8)
      : [],
  };
}

export function normalizePremiumContent(raw: unknown): PremiumPageContent {
  const base = defaultPremiumContent();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Partial<PremiumPageContent>;
  const conceptRaw = o.concept as Partial<PremiumPageContent["concept"]> | undefined;
  const galleryRaw = o.gallery as Partial<PremiumPageContent["gallery"]> | undefined;
  const practicalRaw = o.practical as Partial<PremiumPageContent["practical"]> | undefined;
  const reservationRaw = o.reservation as Partial<PremiumPageContent["reservation"]> | undefined;
  const style =
    galleryRaw?.style === "grid" || galleryRaw?.style === "instagram" ? galleryRaw.style : "showcase";

  return {
    navigationEnabled: o.navigationEnabled !== false,
    concept: {
      enabled: conceptRaw?.enabled !== false,
      title: typeof conceptRaw?.title === "string" ? conceptRaw.title.slice(0, 120) : base.concept.title,
      body: typeof conceptRaw?.body === "string" ? conceptRaw.body.slice(0, 2000) : "",
      imageUrl: typeof conceptRaw?.imageUrl === "string" ? conceptRaw.imageUrl : "",
      pillars: normalizePillars(conceptRaw?.pillars).length
        ? normalizePillars(conceptRaw?.pillars)
        : base.concept.pillars,
    },
    editorialSections: normalizeEditorial(o.editorialSections),
    menuOffers: normalizeOffers(o.menuOffers),
    credibility: normalizeCredibility(o.credibility, base.credibility),
    gallery: { style },
    practical: {
      parking: typeof practicalRaw?.parking === "string" ? practicalRaw.parking.slice(0, 200) : "",
      accessibility:
        typeof practicalRaw?.accessibility === "string" ? practicalRaw.accessibility.slice(0, 200) : "",
    },
    reservation: {
      groupMessage:
        typeof reservationRaw?.groupMessage === "string"
          ? reservationRaw.groupMessage.slice(0, 280)
          : base.reservation.groupMessage,
    },
  };
}

export function hasCredibilityContent(c: CredibilityContent): boolean {
  if (c.googleRating && c.reviewCount) return true;
  if (c.quote.trim()) return true;
  if (c.pressMentions.some(Boolean)) return true;
  return false;
}

export function newEditorialSection(): EditorialSectionContent {
  return {
    id: `ed-${Date.now()}`,
    enabled: true,
    title: "",
    text: "",
    imageUrl: "",
    buttonLabel: "",
    buttonUrl: "",
    layout: "image-left",
  };
}

export function newMenuOffer(): MenuOfferItem {
  return {
    id: `offer-${Date.now()}`,
    title: "",
    description: "",
    price: "",
    imageUrl: "",
  };
}
