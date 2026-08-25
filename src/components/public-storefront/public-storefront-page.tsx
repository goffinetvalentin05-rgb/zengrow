"use client";

import { useMemo, useState } from "react";
import { Clock, Gift, Mail, MapPin, Phone, Globe } from "lucide-react";
import type { PublicGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";
import { googleFontsHref, getFontDescriptor } from "@/src/lib/public-page-fonts";
import { storefrontButtonTextColor } from "@/src/lib/public-storefront/contrast";
import type { StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import type { StorefrontConfig, StorefrontSectionId } from "@/src/lib/public-storefront/schema";
import { cn } from "@/src/lib/utils";
import StorefrontOfferModal, { offerPriceLabel } from "@/src/components/public-storefront/storefront-offer-modal";

export type PublicStorefrontPageProps = {
  config: StorefrontConfig;
  identity: StorefrontIdentity;
  offers: PublicGiftVoucherOffer[];
  previewMode?: boolean;
  draftBanner?: boolean;
};

const CTA_HREF: Record<StorefrontConfig["hero"]["ctaTarget"], string> = {
  offers: "#bons-cadeaux",
  about: "#a-propos",
  contact: "#coordonnees",
  hours: "#horaires",
  map: "#carte",
};

const OFFER_BUTTON: Record<Exclude<StorefrontConfig["offers"]["buttonPreset"], "custom">, { monetary: string; experience: string }> = {
  offrir: { monetary: "Offrir", experience: "Offrir" },
  decouvrir: { monetary: "Découvrir", experience: "Découvrir" },
  choisir: { monetary: "Choisir ce bon", experience: "Offrir cette expérience" },
};

export function storefrontFontsHref(config: StorefrontConfig): string | null {
  return googleFontsHref([config.style.font]);
}

export default function PublicStorefrontPage({
  config,
  identity,
  offers,
  previewMode = false,
  draftBanner = false,
}: PublicStorefrontPageProps) {
  const [selected, setSelected] = useState<PublicGiftVoucherOffer | null | undefined>(undefined);
  const tokens = useMemo(() => storefrontTokens(config), [config]);
  const font = getFontDescriptor(config.style.font);
  const enabled = (id: StorefrontSectionId) => config.sections.find((section) => section.id === id)?.enabled !== false;

  return (
    <div
      className="storefront-root min-h-full"
      style={{
        backgroundColor: tokens.bg,
        color: tokens.text,
        fontFamily: font ? `${font.family}, ${font.fallback}` : "system-ui, sans-serif",
        ["--sf-bg" as string]: tokens.bg,
        ["--sf-text" as string]: tokens.text,
        ["--sf-heading" as string]: tokens.text,
        ["--sf-primary" as string]: tokens.primary,
        ["--sf-button-text" as string]: tokens.buttonText,
        ["--sf-font" as string]: font ? `${font.family}, ${font.fallback}` : "system-ui, sans-serif",
        ["--sf-radius" as string]: tokens.radius,
      }}
    >
      {draftBanner ? (
        <div className="sticky top-0 z-20 border-b border-amber-300/70 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-950">
          Aperçu du brouillon — non visible publiquement
        </div>
      ) : null}

      <div className="flex flex-col">
        {config.sections.map((section) => {
          if (!section.enabled) return null;
          if (section.id === "hero") {
            return <HeroSection key={section.id} config={config} identity={identity} tokens={tokens} />;
          }
          if (section.id === "offers") {
            return (
              <OffersSection
                key={section.id}
                config={config}
                offers={offers}
                tokens={tokens}
                onSelect={(offer) => setSelected(offer)}
              />
            );
          }
          if (section.id === "about") {
            return <AboutSection key={section.id} config={config} tokens={tokens} />;
          }
          if (section.id === "gallery" && config.gallery.images.length > 0) {
            return <GallerySection key={section.id} images={config.gallery.images} tokens={tokens} />;
          }
          if (section.id === "practical") {
            return <PracticalSection key={section.id} config={config} identity={identity} tokens={tokens} />;
          }
          if (section.id === "hours") {
            return <HoursSection key={section.id} identity={identity} tokens={tokens} />;
          }
          if (section.id === "contact") {
            return <ContactSection key={section.id} identity={identity} tokens={tokens} />;
          }
          if (section.id === "social") {
            return <SocialSection key={section.id} identity={identity} tokens={tokens} />;
          }
          if (section.id === "map") {
            return <MapSection key={section.id} identity={identity} tokens={tokens} />;
          }
          if (section.id === "footer") {
            return <FooterSection key={section.id} config={config} identity={identity} tokens={tokens} />;
          }
          return null;
        })}
      </div>

      {selected !== undefined ? (
        <StorefrontOfferModal
          restaurantSlug={identity.slug}
          offer={selected}
          previewMode={previewMode}
          buttonRadius={tokens.radius}
          onClose={() => setSelected(undefined)}
        />
      ) : null}

      {!enabled("footer") ? (
        <p className="px-4 py-6 text-center text-[11px] opacity-50">Propulsé par ZenGrow</p>
      ) : null}
    </div>
  );
}

type Tokens = ReturnType<typeof storefrontTokens>;

function storefrontTokens(config: StorefrontConfig) {
  return {
    bg: config.style.backgroundColor,
    text: config.style.textColor,
    primary: config.style.primaryColor,
    secondary: config.style.secondaryColor,
    buttonText: storefrontButtonTextColor(config.style.primaryColor),
    radius:
      config.style.buttonStyle === "pill" ? "999px" : config.style.buttonStyle === "rounded" ? "16px" : "10px",
    maxW:
      config.style.contentWidth === "narrow" ? "42rem" : config.style.contentWidth === "wide" ? "70rem" : "58rem",
    py: config.style.spacing === "compact" ? "3rem" : config.style.spacing === "relaxed" ? "6rem" : "4.5rem",
    cardShadow:
      config.style.cardStyle === "shadow"
        ? "0 18px 50px -28px rgba(0,0,0,0.35)"
        : "none",
    cardBorder:
      config.style.cardStyle === "minimal"
        ? "transparent"
        : "color-mix(in srgb, var(--sf-text) 12%, var(--sf-bg))",
  };
}

function Shell({ tokens, className, id, children }: { tokens: Tokens; className?: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("w-full scroll-mt-24", className)} style={{ paddingTop: tokens.py, paddingBottom: tokens.py }}>
      <div className="mx-auto w-full px-4 sm:px-6" style={{ maxWidth: tokens.maxW }}>
        {children}
      </div>
    </section>
  );
}

function HeroSection({ config, identity, tokens }: { config: StorefrontConfig; identity: StorefrontIdentity; tokens: Tokens }) {
  const hero = config.hero;
  const height = hero.coverHeight === "tall" ? "min-h-[72vh]" : hero.coverHeight === "compact" ? "min-h-[42vh]" : "min-h-[56vh]";
  const align = hero.align === "center" ? "items-center text-center" : "items-start text-left";
  const overlay = hero.overlayEnabled ? hero.overlayOpacity / 100 : 0;

  return (
    <header id="accueil" className={cn("relative isolate overflow-hidden", height)}>
      {hero.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hero.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: "color-mix(in srgb, var(--sf-primary) 18%, var(--sf-bg))" }} />
      )}
      {overlay > 0 ? <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} aria-hidden /> : null}
      <div className={cn("relative z-[1] mx-auto flex h-full w-full flex-col justify-end gap-4 px-4 py-12 sm:px-6 sm:py-16", align)} style={{ maxWidth: tokens.maxW }}>
        {hero.showLogo && identity.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={identity.logoUrl} alt="" className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/30" />
        ) : null}
        {(hero.showCategory && identity.category) || (hero.showAddress && identity.address) ? (
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/80">
            {[hero.showCategory ? identity.category : null, hero.showAddress ? identity.address : null].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl" style={{ fontFamily: "var(--sf-font)" }}>
          {hero.title.trim() || identity.displayName}
        </h1>
        {hero.subtitle.trim() ? <p className="max-w-xl text-pretty text-base text-white/85 sm:text-lg">{hero.subtitle}</p> : null}
        {hero.ctaVisible ? (
          <a
            href={CTA_HREF[hero.ctaTarget]}
            className="inline-flex min-h-11 items-center justify-center px-6 text-sm font-semibold"
            style={{ borderRadius: tokens.radius, backgroundColor: tokens.primary, color: tokens.buttonText }}
          >
            {hero.ctaText.trim() || "Offrir un bon cadeau"}
          </a>
        ) : null}
      </div>
    </header>
  );
}

function OffersSection({
  config,
  offers,
  tokens,
  onSelect,
}: {
  config: StorefrontConfig;
  offers: PublicGiftVoucherOffer[];
  tokens: Tokens;
  onSelect: (offer: PublicGiftVoucherOffer | null) => void;
}) {
  const cols = config.offers.columns;
  const grid =
    config.offers.layout === "list"
      ? "grid-cols-1"
      : cols === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : cols === 1
          ? "grid-cols-1"
          : "grid-cols-1 sm:grid-cols-2";
  const ratio = config.offers.imageRatio === "1/1" ? "aspect-square" : config.offers.imageRatio === "4/3" ? "aspect-[4/3]" : "aspect-[16/10]";
  const buttonLabel = (offer: PublicGiftVoucherOffer) => {
    if (config.offers.buttonPreset === "custom" && config.offers.customButtonText.trim()) {
      return config.offers.customButtonText.trim();
    }
    const preset = OFFER_BUTTON[config.offers.buttonPreset === "custom" ? "choisir" : config.offers.buttonPreset];
    return offer.kind === "experience" ? preset.experience : preset.monetary;
  };

  return (
    <Shell tokens={tokens} id="bons-cadeaux">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--sf-heading)" }}>
          {config.offers.title.trim() || "Bons cadeaux"}
        </h2>
        {config.offers.subtitle.trim() ? <p className="mt-2 max-w-2xl text-base opacity-80">{config.offers.subtitle}</p> : null}
      </div>
      {offers.length === 0 ? (
        <p className="text-sm opacity-70">Les offres publiées dans Mes offres apparaîtront ici.</p>
      ) : (
        <div className={cn("grid gap-5", grid)}>
          {offers.map((offer) => {
            const horizontal = config.offers.cardOrientation === "horizontal";
            return (
              <article
                key={offer.id}
                className={cn("overflow-hidden bg-[color-mix(in_srgb,var(--sf-text)_3%,var(--sf-bg))]", horizontal && "sm:flex")}
                style={{
                  borderRadius: tokens.radius === "999px" ? "24px" : tokens.radius,
                  border: `1px solid ${tokens.cardBorder}`,
                  boxShadow: tokens.cardShadow,
                }}
              >
                <div className={cn("relative overflow-hidden", ratio, horizontal && "sm:aspect-auto sm:w-48 sm:shrink-0")}>
                  {offer.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={offer.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[140px] items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--sf-primary) 14%, var(--sf-bg))" }}>
                      <Gift className="h-10 w-10 opacity-40" style={{ color: "var(--sf-primary)" }} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-lg font-semibold" style={{ color: "var(--sf-heading)" }}>
                    {offer.title}
                  </h3>
                  {config.offers.showDescription && offer.shortDescription ? (
                    <p className="mt-1 line-clamp-2 text-sm opacity-80">{offer.shortDescription}</p>
                  ) : null}
                  {config.offers.showPrice ? (
                    <p className="mt-3 text-sm font-semibold" style={{ color: "var(--sf-primary)" }}>
                      {offerPriceLabel(offer)}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onSelect(offer)}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-semibold"
                    style={{ borderRadius: tokens.radius, backgroundColor: tokens.primary, color: tokens.buttonText }}
                  >
                    {buttonLabel(offer)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

function AboutSection({ config, tokens }: { config: StorefrontConfig; tokens: Tokens }) {
  const placement = config.about.imagePlacement;
  const showImage = placement !== "none" && Boolean(config.about.imageUrl);
  return (
    <Shell tokens={tokens} id="a-propos">
      <div className={cn("grid gap-8", showImage && "md:grid-cols-2 md:items-center")}>
        {showImage && placement === "left" ? <AboutImage url={config.about.imageUrl} tokens={tokens} /> : null}
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--sf-heading)" }}>
            {config.about.title.trim() || "À propos"}
          </h2>
          {config.about.body.trim() ? (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed opacity-85">{config.about.body}</p>
          ) : (
            <p className="mt-4 text-sm opacity-60">Ajoutez un texte dans le concepteur.</p>
          )}
        </div>
        {showImage && placement === "right" ? <AboutImage url={config.about.imageUrl} tokens={tokens} /> : null}
      </div>
    </Shell>
  );
}

function AboutImage({ url, tokens }: { url: string; tokens: Tokens }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: tokens.radius === "999px" ? "24px" : tokens.radius }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

function GallerySection({ images, tokens }: { images: string[]; tokens: Tokens }) {
  return (
    <Shell tokens={tokens} id="galerie">
      <h2 className="mb-6 text-3xl font-semibold tracking-tight" style={{ color: "var(--sf-heading)" }}>
        Galerie
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url) => (
          <div key={url} className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: tokens.radius === "999px" ? "20px" : tokens.radius }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

function PracticalSection({ config, identity, tokens }: { config: StorefrontConfig; identity: StorefrontIdentity; tokens: Tokens }) {
  const rows: { icon: typeof MapPin; label: string; href?: string }[] = [];
  if (config.practical.showAddress && identity.address) rows.push({ icon: MapPin, label: identity.address, href: identity.googleMapsUrl || undefined });
  if (config.practical.showPhone && identity.phone) rows.push({ icon: Phone, label: identity.phone, href: `tel:${identity.phone}` });
  if (config.practical.showEmail && identity.email) rows.push({ icon: Mail, label: identity.email, href: `mailto:${identity.email}` });
  if (config.practical.showWebsite && identity.websiteUrl) rows.push({ icon: Globe, label: identity.websiteUrl.replace(/^https?:\/\//, ""), href: identity.websiteUrl });
  if (config.practical.showInstagram && identity.instagramUrl) rows.push({ icon: Globe, label: "Instagram", href: identity.instagramUrl });
  if (config.practical.showFacebook && identity.facebookUrl) rows.push({ icon: Globe, label: "Facebook", href: identity.facebookUrl });
  if (config.practical.showHours) rows.push({ icon: Clock, label: identity.hoursLines.filter((line) => !line.includes("Fermé")).slice(0, 3).join(" · ") || identity.hoursLines[0] || "" });
  if (rows.length === 0) return null;
  return (
    <Shell tokens={tokens} id="infos">
      <h2 className="mb-6 text-3xl font-semibold tracking-tight" style={{ color: "var(--sf-heading)" }}>
        Informations pratiques
      </h2>
      <ul className="space-y-3 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex items-start gap-3">
            <row.icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
            {row.href ? (
              <a href={row.href} className="underline-offset-2 hover:underline" target={row.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {row.label}
              </a>
            ) : (
              <span>{row.label}</span>
            )}
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function HoursSection({ identity, tokens }: { identity: StorefrontIdentity; tokens: Tokens }) {
  return (
    <Shell tokens={tokens} id="horaires">
      <h2 className="mb-6 text-3xl font-semibold tracking-tight" style={{ color: "var(--sf-heading)" }}>
        Horaires
      </h2>
      <ul className="space-y-2 text-sm">
        {identity.hoursLines.map((line) => (
          <li key={line} className="flex justify-between gap-6 border-b py-2 last:border-b-0" style={{ borderColor: "color-mix(in srgb, var(--sf-text) 10%, transparent)" }}>
            {line}
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function ContactSection({ identity, tokens }: { identity: StorefrontIdentity; tokens: Tokens }) {
  const items = [
    identity.phone ? { label: identity.phone, href: `tel:${identity.phone}` } : null,
    identity.email ? { label: identity.email, href: `mailto:${identity.email}` } : null,
    identity.websiteUrl ? { label: identity.websiteUrl.replace(/^https?:\/\//, ""), href: identity.websiteUrl } : null,
  ].filter(Boolean) as { label: string; href: string }[];
  if (items.length === 0) return null;
  return (
    <Shell tokens={tokens} id="coordonnees">
      <h2 className="mb-6 text-3xl font-semibold tracking-tight" style={{ color: "var(--sf-heading)" }}>
        Coordonnées
      </h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} className="hover:underline" target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function SocialSection({ identity, tokens }: { identity: StorefrontIdentity; tokens: Tokens }) {
  const links = [
    identity.instagramUrl ? { label: "Instagram", href: identity.instagramUrl } : null,
    identity.facebookUrl ? { label: "Facebook", href: identity.facebookUrl } : null,
  ].filter(Boolean) as { label: string; href: string }[];
  if (links.length === 0) return null;
  return (
    <Shell tokens={tokens} id="reseaux">
      <h2 className="mb-6 text-3xl font-semibold tracking-tight" style={{ color: "var(--sf-heading)" }}>
        Réseaux sociaux
      </h2>
      <div className="flex flex-wrap gap-3">
        {links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline">
            {link.label}
          </a>
        ))}
      </div>
    </Shell>
  );
}

function MapSection({ identity, tokens }: { identity: StorefrontIdentity; tokens: Tokens }) {
  if (!identity.address && !identity.googleMapsUrl) return null;
  return (
    <Shell tokens={tokens} id="carte">
      <h2 className="mb-6 text-3xl font-semibold tracking-tight" style={{ color: "var(--sf-heading)" }}>
        Adresse
      </h2>
      {identity.address ? <p className="text-sm opacity-85">{identity.address}</p> : null}
      {identity.googleMapsUrl ? (
        <a href={identity.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold hover:underline" style={{ color: "var(--sf-primary)" }}>
          Voir sur la carte
        </a>
      ) : null}
    </Shell>
  );
}

function FooterSection({ config, identity, tokens }: { config: StorefrontConfig; identity: StorefrontIdentity; tokens: Tokens }) {
  return (
    <footer className="border-t px-4 py-10 sm:px-6" style={{ borderColor: "color-mix(in srgb, var(--sf-text) 12%, transparent)" }}>
      <div className="mx-auto flex flex-col gap-4" style={{ maxWidth: tokens.maxW }}>
        {config.footer.showLogo && identity.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={identity.logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
        ) : null}
        <p className="text-sm font-semibold">{identity.displayName}</p>
        {config.footer.text.trim() ? <p className="text-sm opacity-75">{config.footer.text}</p> : null}
        {config.footer.showContact ? (
          <p className="text-xs opacity-70">{[identity.address, identity.phone, identity.email].filter(Boolean).join(" · ")}</p>
        ) : null}
        {config.footer.showSocial ? (
          <p className="text-xs opacity-70">
            {[identity.instagramUrl ? "Instagram" : null, identity.facebookUrl ? "Facebook" : null].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {config.footer.showPoweredBy ? <p className="pt-2 text-[11px] opacity-40">Propulsé par ZenGrow</p> : null}
      </div>
    </footer>
  );
}
