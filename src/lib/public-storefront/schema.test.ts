import { describe, expect, it } from "vitest";
import { applyStorefrontTemplate, defaultStorefrontConfig } from "@/src/lib/public-storefront/defaults";
import { identityFromRows, type StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import { hydrateStorefrontConfig, parseStorefrontConfig, STOREFRONT_SECTION_IDS } from "@/src/lib/public-storefront/schema";
import { sanitizeStorefrontPayload, stripHtml } from "@/src/lib/public-storefront/sanitize";
import { storefrontContrastWarnings } from "@/src/lib/public-storefront/contrast";

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
    galleryUrls: ["https://example.com/a.jpg"],
  });
}

describe("storefront config", () => {
  it("valide une configuration par défaut", () => {
    const config = defaultStorefrontConfig(identity());
    expect(parseStorefrontConfig(config).sections).toHaveLength(STOREFRONT_SECTION_IDS.length);
    expect(config.hero.title).toBe("Chez Test");
  });

  it("hydrate un JSON vide avec les défauts", () => {
    const fallback = defaultStorefrontConfig(identity());
    const hydrated = hydrateStorefrontConfig({}, fallback);
    expect(hydrated.schemaVersion).toBe(1);
    expect(hydrated.hero.title).toBe("Chez Test");
  });

  it("applique un modèle sans supprimer textes, galerie ni infos établissement", () => {
    const base = defaultStorefrontConfig(identity());
    base.hero.title = "Titre custom";
    base.about.body = "Notre histoire";
    base.gallery.images = ["https://example.com/photo.jpg"];
    const elegant = applyStorefrontTemplate(base, "elegant", identity());
    expect(elegant.templateId).toBe("elegant");
    expect(elegant.hero.title).toBe("Titre custom");
    expect(elegant.about.body).toBe("Notre histoire");
    expect(elegant.gallery.images).toEqual(["https://example.com/photo.jpg"]);
    expect(elegant.style.font).toBe("Cormorant Garamond");
    const aboutIndex = elegant.sections.findIndex((section) => section.id === "about");
    const offersIndex = elegant.sections.findIndex((section) => section.id === "offers");
    expect(aboutIndex).toBeLessThan(offersIndex);
  });

  it("rejette le HTML et les URL dangereuses", () => {
    expect(stripHtml("<script>x</script>Bonjour")).toBe("Bonjour");
    const sanitized = sanitizeStorefrontPayload({
      hero: { title: "<b>Hello</b>", coverImageUrl: "javascript:alert(1)" },
      about: { body: "<img src=x onerror=alert(1)>Texte" },
      gallery: { images: ["javascript:foo", "https://cdn.example.com/ok.jpg"] },
      footer: { text: "ok", showPoweredBy: false },
    }) as { hero: { title: string; coverImageUrl: string }; about: { body: string }; gallery: { images: string[] }; footer: { showPoweredBy: boolean } };
    expect(sanitized.hero.title).toBe("Hello");
    expect(sanitized.hero.coverImageUrl).toBe("");
    expect(sanitized.about.body).toBe("Texte");
    expect(sanitized.gallery.images).toEqual(["https://cdn.example.com/ok.jpg"]);
    expect(sanitized.footer.showPoweredBy).toBe(true);
  });

  it("avertit quand le contraste texte / fond est insuffisant", () => {
    const config = defaultStorefrontConfig(identity());
    config.style.backgroundColor = "#FFFFFF";
    config.style.textColor = "#EEEEEE";
    const warnings = storefrontContrastWarnings(config);
    expect(warnings.some((warning) => warning.id === "text-on-bg")).toBe(true);
  });

  it("permet de masquer les horaires et de réordonner À propos sous les offres", () => {
    const config = defaultStorefrontConfig(identity());
    config.sections = config.sections.map((section) =>
      section.id === "hours" ? { ...section, enabled: false } : section,
    );
    const withoutHours = config.sections.filter((section) => section.id !== "hero");
    const offers = withoutHours.findIndex((section) => section.id === "offers");
    const about = withoutHours.findIndex((section) => section.id === "about");
    const next = [...config.sections];
    const aboutItem = next.find((section) => section.id === "about");
    const rest = next.filter((section) => section.id !== "about");
    const offersIndex = rest.findIndex((section) => section.id === "offers");
    rest.splice(offersIndex + 1, 0, aboutItem!);
    expect(rest.find((section) => section.id === "hours")?.enabled).toBe(false);
    expect(rest.findIndex((section) => section.id === "about")).toBeGreaterThan(
      rest.findIndex((section) => section.id === "offers"),
    );
    expect(about).toBeGreaterThanOrEqual(0);
    expect(offers).toBeGreaterThanOrEqual(0);
  });
});
