import { describe, expect, it } from "vitest";
import { applyStorefrontPreset, defaultStorefrontConfig } from "@/src/lib/public-storefront/defaults";
import { identityFromRows, type StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import { hydrateStorefrontConfig, parseStorefrontConfig, STOREFRONT_PRESETS } from "@/src/lib/public-storefront/schema";
import { sanitizeStorefrontPayload, stripHtml } from "@/src/lib/public-storefront/sanitize";
import { storefrontContrastWarnings } from "@/src/lib/public-storefront/contrast";
import { offerGridClass, offerSectionMaxWidth } from "@/src/lib/public-storefront/offer-layout";
import { storefrontFooterLinks } from "@/src/lib/public-storefront/footer-links";

function identity(): StorefrontIdentity {
  return identityFromRows({
    restaurantId: "r1",
    name: "Chez Test",
    slug: "chez-test",
    tagline: "Cuisine de saison",
    description: "Une maison indépendante.",
    category: "Bistro",
    address: "1 rue de la Paix",
    city: "Lausanne",
    phone: "+41 21 000 00 00",
    email: "hello@test.ch",
    primaryColor: "#1F7A6C",
    instagramUrl: "https://instagram.com/cheztest",
    facebookUrl: "https://facebook.com/cheztest",
    galleryUrls: ["https://example.com/a.jpg"],
  });
}

const legacyAllSections = {
  schemaVersion: 1,
  templateId: "elegant",
  style: { primaryColor: "#1F7A6C", secondaryColor: "#E85D2C", backgroundColor: "#FAF7F2", textColor: "#1C1917", font: "Cormorant Garamond", buttonStyle: "soft", cardStyle: "minimal", contentWidth: "normal", spacing: "relaxed", themeMode: "light" },
  hero: { showLogo: true, coverImageUrl: "https://cdn.example.com/cover.jpg", title: "Titre custom", subtitle: "Sous-titre", align: "center", coverHeight: "tall", overlayEnabled: true, overlayOpacity: 50, ctaText: "Offrir", ctaVisible: true, ctaTarget: "about", showAddress: true, showCategory: true },
  offers: { title: "Nos bons", subtitle: "À offrir", columns: 2, layout: "grid", cardOrientation: "vertical", imageRatio: "16/10", showDescription: true, showPrice: true, buttonPreset: "choisir", customButtonText: "" },
  about: { title: "À propos", body: "Histoire", imageUrl: "https://cdn.example.com/about.jpg", imagePlacement: "left" },
  gallery: { images: ["https://cdn.example.com/g.jpg"] },
  practical: { showAddress: true, showPhone: true, showEmail: true, showWebsite: true, showHours: true, showInstagram: true, showFacebook: true },
  footer: { showLogo: true, text: "Note", showContact: true, showSocial: true, showPoweredBy: true },
  sections: [
    { id: "hero", enabled: true },
    { id: "offers", enabled: true },
    { id: "about", enabled: true },
    { id: "gallery", enabled: true },
    { id: "practical", enabled: false },
    { id: "hours", enabled: false },
    { id: "contact", enabled: true },
    { id: "social", enabled: true },
    { id: "map", enabled: true },
    { id: "footer", enabled: true },
  ],
};

describe("storefront config v2", () => {
  it("valide une configuration par défaut sans sections optionnelles", () => {
    const config = parseStorefrontConfig(defaultStorefrontConfig(identity()));
    expect(config.schemaVersion).toBe(2);
    expect(config.hero.layout).toBe("fullbleed");
    expect(config.offers.cardStyle).toBe("premium");
    expect(config).not.toHaveProperty("sections");
    expect(config).not.toHaveProperty("about");
  });

  it("normalise une ancienne config à 10 sections sans perdre hero, offres ni image", () => {
    const hydrated = hydrateStorefrontConfig(legacyAllSections, defaultStorefrontConfig(identity()));
    expect(hydrated.schemaVersion).toBe(2);
    expect(hydrated.hero.title).toBe("Titre custom");
    expect(hydrated.hero.coverImageUrl).toBe("https://cdn.example.com/cover.jpg");
    expect(hydrated.offers.title).toBe("Nos bons");
    expect(hydrated.presetId).toBe("gastronomie");
    expect(hydrated).not.toHaveProperty("about");
    expect(hydrated).not.toHaveProperty("gallery");
    expect(hydrated).not.toHaveProperty("sections");
  });

  it("applique chaque preset sans remplacer titre, couverture ni textes d’offres", () => {
    const base = defaultStorefrontConfig(identity());
    base.hero.title = "Titre custom";
    base.hero.coverImageUrl = "https://cdn.example.com/cover.jpg";
    base.offers.title = "Cartes cadeaux";
    for (const preset of STOREFRONT_PRESETS) {
      const next = applyStorefrontPreset(base, preset, identity());
      expect(next.presetId).toBe(preset);
      expect(next.hero.title).toBe("Titre custom");
      expect(next.hero.coverImageUrl).toBe("https://cdn.example.com/cover.jpg");
      expect(next.offers.title).toBe("Cartes cadeaux");
    }
  });

  it("expose les 4 dispositions hero et 5 styles de cartes", () => {
    const config = defaultStorefrontConfig(identity());
    for (const layout of ["fullbleed", "split", "minimal", "immersive"] as const) {
      expect(parseStorefrontConfig({ ...config, hero: { ...config.hero, layout } }).hero.layout).toBe(layout);
    }
    for (const cardStyle of ["classic", "immersive", "horizontal", "minimal", "premium"] as const) {
      expect(parseStorefrontConfig({ ...config, offers: { ...config.offers, cardStyle } }).offers.cardStyle).toBe(cardStyle);
    }
  });

  it("centre une offre unique et élargit à partir de deux", () => {
    expect(offerSectionMaxWidth(1, "wide")).toBe("28rem");
    expect(offerGridClass(1, 3)).toBe("grid-cols-1");
    expect(offerGridClass(2, 3)).toContain("sm:grid-cols-2");
    expect(offerGridClass(6, 3)).toContain("lg:grid-cols-3");
  });

  it("rejette le HTML et les URL dangereuses", () => {
    expect(stripHtml("<script>x</script>Bonjour")).toBe("Bonjour");
    const sanitized = sanitizeStorefrontPayload({
      hero: { title: "<b>Hello</b>", coverImageUrl: "javascript:alert(1)" },
      footer: { showPoweredBy: false },
    }) as { hero: { title: string; coverImageUrl: string }; footer: { showPoweredBy: boolean } };
    expect(sanitized.hero.title).toBe("Hello");
    expect(sanitized.hero.coverImageUrl).toBe("");
    expect(sanitized.footer.showPoweredBy).toBe(true);
  });

  it("avertit quand le contraste texte / fond est insuffisant", () => {
    const config = defaultStorefrontConfig(identity());
    config.style.backgroundColor = "#FFFFFF";
    config.style.textColor = "#EEEEEE";
    expect(storefrontContrastWarnings(config).some((warning) => warning.id === "text-on-bg")).toBe(true);
  });

  it("n’affiche les icônes sociales que si l’URL existe", () => {
    const withSocial = storefrontFooterLinks({
      instagramUrl: "https://instagram.com/x",
      facebookUrl: "https://facebook.com/x",
      tiktokUrl: "",
      websiteUrl: "",
      phone: "",
      email: "",
      showSocial: true,
      showWebsite: true,
      showPhone: true,
      showEmail: true,
    });
    expect(withSocial.map((item) => item.id)).toEqual(["instagram", "facebook"]);
    const hidden = storefrontFooterLinks({
      instagramUrl: "https://instagram.com/x",
      showSocial: false,
      showWebsite: false,
      showPhone: false,
      showEmail: false,
    });
    expect(hidden).toEqual([]);
  });
});
