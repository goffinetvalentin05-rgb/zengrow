"use client";

import { useMemo, useState } from "react";
import { Gift } from "lucide-react";
import type { PublicGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";
import { googleFontsHref, getFontDescriptor } from "@/src/lib/public-page-fonts";
import { FONT_PAIRINGS } from "@/src/lib/public-storefront/defaults";
import { storefrontButtonTextColor } from "@/src/lib/public-storefront/contrast";
import type { StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import { offerGridClass, offerSectionMaxWidth } from "@/src/lib/public-storefront/offer-layout";
import type { StorefrontConfig } from "@/src/lib/public-storefront/schema";
import { cn } from "@/src/lib/utils";
import StorefrontOfferModal, { offerPriceLabel } from "@/src/components/public-storefront/storefront-offer-modal";
import { StorefrontGlyph } from "@/src/components/public-storefront/storefront-icons";
import { storefrontFooterLinks } from "@/src/lib/public-storefront/footer-links";

export type PublicStorefrontPageProps = {
  config: StorefrontConfig;
  identity: StorefrontIdentity;
  offers: PublicGiftVoucherOffer[];
  previewMode?: boolean;
  draftBanner?: boolean;
};

const BUTTON_COPY = {
  offrir: { monetary: "Offrir", experience: "Offrir cette expérience" },
  decouvrir: { monetary: "Découvrir", experience: "Découvrir" },
  choisir: { monetary: "Choisir ce bon", experience: "Offrir cette expérience" },
} as const;

export function storefrontFontsHref(config: StorefrontConfig): string | null {
  const pair = FONT_PAIRINGS[config.style.fontPairing];
  return googleFontsHref([pair.heading, pair.body]);
}

export default function PublicStorefrontPage({
  config,
  identity,
  offers,
  previewMode = false,
  draftBanner = false,
}: PublicStorefrontPageProps) {
  const [selected, setSelected] = useState<PublicGiftVoucherOffer | null | undefined>(undefined);
  const tokens = useMemo(() => tokensFrom(config), [config]);
  const pair = FONT_PAIRINGS[config.style.fontPairing];
  const heading = getFontDescriptor(pair.heading);
  const body = getFontDescriptor(pair.body);

  return (
    <div
      className="storefront-root min-h-full"
      style={{
        backgroundColor: tokens.bg,
        color: tokens.text,
        fontFamily: body ? `${body.family}, ${body.fallback}` : "system-ui, sans-serif",
        ["--sf-bg" as string]: tokens.bg,
        ["--sf-text" as string]: tokens.text,
        ["--sf-muted" as string]: tokens.muted,
        ["--sf-heading" as string]: tokens.text,
        ["--sf-primary" as string]: tokens.primary,
        ["--sf-accent" as string]: tokens.accent,
        ["--sf-button-text" as string]: tokens.buttonText,
        ["--sf-heading-font" as string]: heading ? `${heading.family}, ${heading.fallback}` : "Georgia, serif",
        ["--sf-radius" as string]: tokens.radius,
      }}
    >
      {draftBanner ? (
        <div className="sticky top-0 z-20 border-b border-amber-300/70 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-950">
          Aperçu du brouillon — non visible publiquement
        </div>
      ) : null}
      <HeroBlock config={config} identity={identity} tokens={tokens} />
      <OffersBlock config={config} offers={offers} tokens={tokens} onSelect={setSelected} />
      <FooterBlock config={config} identity={identity} tokens={tokens} />
      {selected !== undefined ? (
        <StorefrontOfferModal
          restaurantSlug={identity.slug}
          offer={selected}
          previewMode={previewMode}
          buttonRadius={tokens.radius}
          onClose={() => setSelected(undefined)}
        />
      ) : null}
    </div>
  );
}

type Tokens = ReturnType<typeof tokensFrom>;

function tokensFrom(config: StorefrontConfig) {
  return {
    bg: config.style.backgroundColor,
    text: config.style.textColor,
    muted: config.style.mutedTextColor,
    primary: config.style.primaryColor,
    accent: config.style.accentColor,
    buttonText: storefrontButtonTextColor(config.style.primaryColor),
    radius: config.style.radius === "pill" ? "999px" : config.style.radius === "rounded" ? "16px" : "10px",
    cardRadius: config.style.radius === "pill" ? "24px" : config.style.radius === "rounded" ? "18px" : "12px",
  };
}

function HeroBlock({ config, identity, tokens }: { config: StorefrontConfig; identity: StorefrontIdentity; tokens: Tokens }) {
  const hero = config.hero;
  const height =
    hero.height === "immersive" || hero.layout === "immersive"
      ? "min-h-[88vh]"
      : hero.height === "compact"
        ? "min-h-[38vh]"
        : "min-h-[54vh]";
  const align = hero.align === "center" ? "items-center text-center" : "items-start text-left";
  const logoH = hero.logoSize === "sm" ? "h-10 w-10" : hero.logoSize === "lg" ? "h-20 w-20" : "h-14 w-14";
  const pad = hero.padding === "compact" ? "py-10" : hero.padding === "relaxed" ? "py-20" : "py-14";
  const textColor = hero.textColor || (hero.layout === "split" || hero.layout === "minimal" ? tokens.text : "#FFFFFF");
  const objectPos = `${Math.round(hero.focalX * 100)}% ${Math.round(hero.focalY * 100)}%`;
  const frame = hero.frame === "rounded" ? "overflow-hidden sm:mx-4 sm:mt-4 sm:rounded-[28px]" : "";

  const cta = hero.ctaVisible ? (
    <a
      href="#bons-cadeaux"
      className="inline-flex min-h-11 items-center justify-center px-6 text-sm font-semibold transition hover:opacity-90"
      style={ctaStyle(hero.ctaStyle, tokens, textColor)}
    >
      {hero.ctaText.trim() || "Offrir un bon cadeau"}
    </a>
  ) : null;

  const copy = (
    <div className={cn("flex max-w-xl flex-col gap-4", align)} style={{ color: textColor }}>
      {hero.showLogo && identity.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={identity.logoUrl} alt="" className={cn(logoH, "rounded-2xl object-cover ring-1 ring-black/10")} />
      ) : null}
      <h1
        className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
        style={{ fontFamily: "var(--sf-heading-font)" }}
      >
        {hero.title.trim() || identity.displayName}
      </h1>
      {hero.subtitle.trim() ? <p className="text-pretty text-base opacity-90 sm:text-lg">{hero.subtitle}</p> : null}
      {cta}
    </div>
  );

  if (hero.layout === "split") {
    return (
      <header id="accueil" className={cn("mx-auto grid items-center gap-8 px-4 sm:px-6 lg:grid-cols-2", pad, frame)} style={{ maxWidth: "70rem" }}>
        {copy}
        <div className="relative aspect-[4/5] min-h-[280px] overflow-hidden sm:aspect-[5/6]" style={{ borderRadius: tokens.cardRadius }}>
          <HeroMedia hero={hero} tokens={tokens} objectPos={objectPos} />
        </div>
      </header>
    );
  }

  if (hero.layout === "minimal") {
    return (
      <header id="accueil" className={cn("relative px-4", pad, frame)} style={minimalBackground(hero, tokens)}>
        <div className={cn("mx-auto flex flex-col gap-6", align)} style={{ maxWidth: "42rem" }}>
          {copy}
          {hero.background !== "solid" && hero.coverImageUrl ? (
            <div className="relative mx-auto aspect-[16/10] w-full max-w-md overflow-hidden" style={{ borderRadius: tokens.cardRadius }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.coverImageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: objectPos }} />
            </div>
          ) : null}
        </div>
      </header>
    );
  }

  return (
    <header id="accueil" className={cn("relative isolate overflow-hidden", height, frame)}>
      <HeroMedia hero={hero} tokens={tokens} objectPos={objectPos} />
      {hero.overlayOpacity > 0 && hero.background !== "solid" ? (
        <div className="absolute inset-0 bg-black" style={{ opacity: hero.overlayOpacity / 100 }} aria-hidden />
      ) : null}
      <div className={cn("relative z-[1] mx-auto flex h-full w-full flex-col justify-end px-4 sm:px-6", pad, align, hero.layout === "immersive" ? "justify-end" : "justify-center")} style={{ maxWidth: "58rem" }}>
        {copy}
      </div>
    </header>
  );
}

function HeroMedia({ hero, tokens, objectPos }: { hero: StorefrontConfig["hero"]; tokens: Tokens; objectPos: string }) {
  if (hero.background === "solid" || (!hero.coverImageUrl && hero.background !== "gradient")) {
    return <div className="absolute inset-0" style={{ backgroundColor: tokens.primary }} />;
  }
  if (hero.background === "gradient" && !hero.coverImageUrl) {
    return (
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${tokens.bg} 0%, color-mix(in srgb, ${tokens.primary} 28%, ${tokens.bg}) 100%)` }}
      />
    );
  }
  if (!hero.coverImageUrl) {
    return <div className="absolute inset-0" style={{ backgroundColor: "color-mix(in srgb, var(--sf-primary) 18%, var(--sf-bg))" }} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={hero.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: objectPos }} />
  );
}

function minimalBackground(hero: StorefrontConfig["hero"], tokens: Tokens): React.CSSProperties {
  if (hero.background === "gradient") {
    return { background: `linear-gradient(165deg, ${tokens.bg} 0%, color-mix(in srgb, ${tokens.primary} 16%, ${tokens.bg}) 100%)` };
  }
  return { backgroundColor: tokens.bg };
}

function ctaStyle(style: StorefrontConfig["hero"]["ctaStyle"], tokens: Tokens, textColor: string): React.CSSProperties {
  if (style === "outline") {
    return { borderRadius: tokens.radius, border: `1px solid ${textColor}`, color: textColor, backgroundColor: "transparent" };
  }
  if (style === "soft") {
    return { borderRadius: tokens.radius, backgroundColor: "color-mix(in srgb, white 18%, transparent)", color: textColor };
  }
  return { borderRadius: tokens.radius, backgroundColor: tokens.primary, color: tokens.buttonText };
}

function OffersBlock({
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
  const pad = config.offers.paddingY === "compact" ? "py-10" : config.offers.paddingY === "relaxed" ? "py-16" : "py-12";
  const align = config.offers.align === "center" ? "text-center mx-auto" : "text-left";
  const maxWidth = offerSectionMaxWidth(offers.length, config.offers.maxWidth);
  const titleSize = config.offers.titleSize === "lg" ? "text-2xl sm:text-3xl" : config.offers.titleSize === "sm" ? "text-lg" : "text-xl sm:text-2xl";

  return (
    <section
      id="bons-cadeaux"
      className={cn("scroll-mt-24 px-4 sm:px-6", pad)}
      style={{ backgroundColor: config.offers.backgroundColor || "transparent" }}
    >
      <div className="mx-auto w-full" style={{ maxWidth }}>
        <div className={cn("mb-8 max-w-2xl", align)}>
          <h2 className={cn("font-semibold tracking-tight", titleSize)} style={{ fontFamily: "var(--sf-heading-font)", color: "var(--sf-heading)" }}>
            {config.offers.title.trim() || "Bons cadeaux"}
          </h2>
          {config.offers.subtitle.trim() ? <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--sf-muted)" }}>{config.offers.subtitle}</p> : null}
        </div>
        {offers.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--sf-muted)" }}>Les offres publiées dans Mes offres apparaîtront ici.</p>
        ) : (
          <div className={cn("grid gap-5", offerGridClass(offers.length, config.offers.columns))}>
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} config={config} tokens={tokens} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function OfferCard({
  offer,
  config,
  tokens,
  onSelect,
}: {
  offer: PublicGiftVoucherOffer;
  config: StorefrontConfig;
  tokens: Tokens;
  onSelect: (offer: PublicGiftVoucherOffer) => void;
}) {
  const style = config.offers.cardStyle;
  const ratio = config.offers.imageRatio === "1/1" ? "aspect-square" : config.offers.imageRatio === "4/3" ? "aspect-[4/3]" : "aspect-[16/10]";
  const titleSize = config.offers.titleSize === "lg" ? "text-2xl" : config.offers.titleSize === "sm" ? "text-base" : "text-lg";
  const label = offerButtonLabel(config, offer);
  const experience = offer.kind === "experience";

  const media = offer.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={offer.imageUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full min-h-[160px] items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--sf-primary) 14%, var(--sf-bg))" }}>
      <Gift className="h-10 w-10 opacity-40" style={{ color: "var(--sf-primary)" }} />
    </div>
  );

  const price = config.offers.showPrice ? (
    <p className={cn("font-semibold", experience ? "text-sm opacity-80" : "text-base")} style={{ color: experience ? "var(--sf-muted)" : "var(--sf-accent)" }}>
      {offerPriceLabel(offer)}
    </p>
  ) : null;

  const desc = config.offers.showDescription && offer.shortDescription ? (
    <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--sf-muted)" }}>{offer.shortDescription}</p>
  ) : null;

  const monetaryNote = offer.kind === "monetary" ? (
    <p className="mt-1 text-[11px]" style={{ color: "var(--sf-muted)" }}>Utilisable en plusieurs fois</p>
  ) : null;

  const button = (
    <button
      type="button"
      onClick={() => onSelect(offer)}
      className="mt-4 inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-semibold transition hover:opacity-90"
      style={offerButtonStyle(config.offers.buttonStyle, tokens)}
    >
      {label}
    </button>
  );

  if (style === "immersive") {
    return (
      <article className="relative min-h-[340px] overflow-hidden" style={{ borderRadius: tokens.cardRadius }}>
        <div className="absolute inset-0">{media}</div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="relative z-[1] flex min-h-[340px] flex-col justify-end p-5 text-white">
          <h3 className={cn("font-semibold", titleSize)} style={{ fontFamily: "var(--sf-heading-font)" }}>{offer.title}</h3>
          {desc}
          {price}
          {monetaryNote}
          {button}
        </div>
      </article>
    );
  }

  if (style === "horizontal") {
    return (
      <article
        className="flex overflow-hidden"
        style={{ borderRadius: tokens.cardRadius, border: "1px solid color-mix(in srgb, var(--sf-text) 10%, transparent)" }}
      >
        <div className="relative w-[42%] min-w-[8.5rem] overflow-hidden">{media}</div>
        <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
          <h3 className={cn("font-semibold", titleSize)} style={{ fontFamily: "var(--sf-heading-font)" }}>{offer.title}</h3>
          {desc}
          {price}
          {monetaryNote}
          {button}
        </div>
      </article>
    );
  }

  const padding = style === "premium" ? "p-5 pt-4" : style === "minimal" ? "pt-4" : "p-4";
  const border = style === "minimal" ? "none" : "1px solid color-mix(in srgb, var(--sf-text) 10%, transparent)";
  const imageRadius = style === "premium" || style === "minimal" ? tokens.cardRadius : undefined;

  return (
    <article className="overflow-hidden" style={{ borderRadius: tokens.cardRadius, border, boxShadow: style === "classic" ? "0 16px 40px -28px rgba(0,0,0,.28)" : "none" }}>
      <div className={cn("relative overflow-hidden", ratio)} style={{ borderRadius: imageRadius }}>{media}</div>
      <div className={padding}>
        <h3 className={cn("font-semibold", titleSize)} style={{ fontFamily: "var(--sf-heading-font)" }}>{offer.title}</h3>
        {desc}
        <div className={cn("mt-3", experience && "opacity-90")}>{price}</div>
        {monetaryNote}
        {button}
      </div>
    </article>
  );
}

function offerButtonLabel(config: StorefrontConfig, offer: PublicGiftVoucherOffer): string {
  if (config.offers.buttonPreset === "custom" && config.offers.customButtonText.trim()) return config.offers.customButtonText.trim();
  if (offer.kind === "experience") return "Offrir cette expérience";
  const preset = config.offers.buttonPreset === "custom" ? "choisir" : config.offers.buttonPreset;
  return BUTTON_COPY[preset].monetary;
}

function offerButtonStyle(style: StorefrontConfig["offers"]["buttonStyle"], tokens: Tokens): React.CSSProperties {
  if (style === "outline") {
    return { borderRadius: tokens.radius, border: "1px solid var(--sf-primary)", color: "var(--sf-primary)", background: "transparent" };
  }
  if (style === "subtle") {
    return { borderRadius: tokens.radius, backgroundColor: "color-mix(in srgb, var(--sf-primary) 12%, transparent)", color: "var(--sf-primary)" };
  }
  return { borderRadius: tokens.radius, backgroundColor: tokens.primary, color: tokens.buttonText };
}

function FooterBlock({ config, identity, tokens }: { config: StorefrontConfig; identity: StorefrontIdentity; tokens: Tokens }) {
  const footer = config.footer;
  const dark = footer.theme === "dark";
  const bg = footer.backgroundColor || (dark ? "#171412" : "color-mix(in srgb, var(--sf-text) 4%, var(--sf-bg))");
  const color = footer.textColor || (dark ? "#F5F0EA" : tokens.text);
  const pad = footer.spacing === "compact" ? "py-8" : "py-10";
  const align = footer.align === "center" ? "items-center text-center" : "items-start text-left";
  const links = storefrontFooterLinks({
    instagramUrl: identity.instagramUrl,
    facebookUrl: identity.facebookUrl,
    tiktokUrl: identity.tiktokUrl,
    websiteUrl: identity.websiteUrl,
    phone: identity.phone,
    email: identity.email,
    showSocial: footer.showSocial,
    showWebsite: footer.showWebsite && footer.showContact,
    showPhone: footer.showPhone && footer.showContact,
    showEmail: footer.showEmail && footer.showContact,
  });
  const address = footer.showContact && footer.showAddress ? identity.address : "";

  return (
    <footer className={cn("mt-2 border-t px-4 sm:px-6", pad)} style={{ backgroundColor: bg, color, borderColor: "color-mix(in srgb, currentColor 12%, transparent)" }}>
      <div className={cn("mx-auto flex max-w-3xl flex-col gap-4", align)}>
        {footer.showLogo && identity.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={identity.logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
        ) : null}
        <p className="text-sm font-semibold">{identity.displayName}</p>
        {address ? <p className="text-xs opacity-75">{address}</p> : null}
        {links.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={link.label}
                  className="inline-flex h-10 w-10 items-center justify-center transition hover:opacity-80"
                  style={iconChipStyle(footer.iconStyle, color)}
                >
                  <StorefrontGlyph id={link.id} />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {footer.showPoweredBy ? <p className="pt-1 text-[11px] opacity-45">Propulsé par ZenGrow</p> : null}
      </div>
    </footer>
  );
}

function iconChipStyle(style: StorefrontConfig["footer"]["iconStyle"], color: string): React.CSSProperties {
  if (style === "plain") return { color };
  if (style === "rounded") {
    return { color, borderRadius: "10px", backgroundColor: "color-mix(in srgb, currentColor 10%, transparent)" };
  }
  return { color, borderRadius: "999px", backgroundColor: "color-mix(in srgb, currentColor 10%, transparent)" };
}
