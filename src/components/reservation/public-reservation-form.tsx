"use client";

import { FormEvent, Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Check,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Mail,
  Map,
  MapPin,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import Input from "@/src/components/ui/input";
import { isGiftCardsEnabled, isGiftVouchersBlockId } from "@/src/lib/config/features";
import type { AvailabilitySlot } from "@/src/lib/reservation/schemas";
import {
  fetchAvailabilityForZone,
  fetchSlotsByZone,
  findSlotAtTime,
  mergeAvailabilitySlotTimes,
  resolveInteriorSeatOption,
  resolveTerraceSeatOption,
  type SlotsByZone,
} from "@/src/lib/reservation/terrace-zone-availability";
import { LargeGroupContactBlock } from "@/src/components/reservation/large-group-contact-block";
import {
  normalizeReservationMode,
  type ReservationMode,
} from "@/src/lib/reservation/reservation-modes";
import { buildPublicWizardSteps, type PublicWizardStepKey } from "@/src/lib/reservation/public-wizard-steps";
import { normalizeTerraceLabel } from "@/src/lib/reservation/terrace-settings";
import SeatingZonePicker from "@/src/components/reservation/seating-zone-picker";
import { cn, formatOpeningHoursLines, OpeningHours } from "@/src/lib/utils";
import {
  type PublicPageEditorConfig,
  type PageBlockId,
  parseEditorConfig,
  defaultEditorConfig,
} from "@/src/lib/public-page/editor-config";
import { resolvePublicPageTheme } from "@/src/lib/public-page/theme";
import { PublicPageSection } from "@/src/components/reservation/public-page-section";
import {
  ctaFlags,
  isSocialShowroomFlow,
  reservationSectionTitle,
  resolveEffectiveSectionOrder,
} from "@/src/lib/public-page/conversion";
import { openStatusLabel } from "@/src/lib/public-page/opening-status";
import {
  buildPublicNavLinks,
  type PageSectionContentV1,
} from "@/src/lib/public-page/page-sections";
import { resolvePublicPageSectionContent } from "@/src/lib/public-page/resolve-public-page-copy";
import { hasCredibilityContent, visibleEditorialSections, visibleMenuOffers } from "@/src/lib/public-page/premium-content";
import {
  ConceptSection,
  CredibilitySection,
  EditorialBlock,
  HighlightsBand,
  MenuOffersSection,
  GiftVouchersSection,
  PremiumFinalCta,
  PremiumGallery,
  PremiumHero,
  PremiumPracticalInfo,
  PremiumReservationSection,
  PublicPageNav,
  StickyReserveBar,
} from "@/src/components/reservation/public-page-premium";
import type { ThemeId } from "@/src/lib/themes/types";
import type { SectionLayoutVariantsMap } from "@/src/lib/themes/sections/types";
import { conceptLayoutFromVariant } from "@/src/lib/themes/sections/registry";
import GrainOverlay from "@/src/lib/themes/shared/grain-overlay";
import {
  PremiumDarkHero,
  PremiumDarkMenuOffersSection,
  PremiumDarkMasonryGallery,
  PremiumDarkNav,
} from "@/src/lib/themes/premium-dark/components";
import { ShowroomHero } from "@/src/components/reservation/showroom/showroom-hero";
import { ShowroomGallery } from "@/src/components/reservation/showroom/showroom-gallery";
import { ShowroomHighlights } from "@/src/components/reservation/showroom/showroom-trust";
import { ShowroomMenu } from "@/src/components/reservation/showroom/showroom-menu";
import { ShowroomPractical } from "@/src/components/reservation/showroom/showroom-practical";
import { ShowroomFinalCta } from "@/src/components/reservation/showroom/showroom-final-cta";
import { ShowroomReservationDrawer } from "@/src/components/reservation/showroom/showroom-reservation-drawer";

export type PublicReservationFormProps = {
  /**
   * Force le renderer landing cinématique (route publique `/r/[slug]`).
   * Ignore le template « site web » legacy et la navbar.
   */
  forceLandingExperience?: boolean;
  previewMode?: boolean;
  /** ThÃ¨me visuel page publique (`default` = rendu historique inchangÃ© cÃ´tÃ© structure). */
  visualThemeId?: ThemeId;
  /** Variables CSS fusionnÃ©es depuis `resolvePublicTheme` (premium uniquement). */
  themeCssVarOverrides?: Record<string, string>;
  /** Grain SVG (thÃ¨mes premium avec `effects.grain`). */
  showGrainOverlay?: boolean;
  restaurantId: string;
  /** Slug URL publique `/r/[slug]` â€” requis pour les demandes de bons cadeaux. */
  restaurantSlug: string;
  restaurantName: string;
  heroTitle?: string | null;
  restaurantTagline?: string | null;
  cuisineType?: string | null;
  city?: string | null;
  highlights?: string[];
  specialMessage?: string | null;
  menuUrl?: string | null;
  reservationEnabled?: boolean;
  showHoursBeforeForm?: boolean;
  showPhoneCta?: boolean;
  noSlotsMessage?: string | null;
  publicPageDescription?: string | null;
  galleryImageUrls?: string[];
  documents?: { id: string; label: string; fileUrl: string; position: number }[];
  restaurantPhone?: string | null;
  restaurantAddress?: string | null;
  restaurantEmail?: string | null;
  allowPhone?: boolean | null;
  allowEmail?: boolean | null;
  maxPartySize: number;
  reservationMode?: ReservationMode | string | null;
  openingHours: OpeningHours | null;
  daysInAdvance: number;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  pageBackgroundColor: string;
  heroPrimaryColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  headingTextColor: string;
  bodyTextColor: string;
  accentColor: string;
  footerBgColor: string;
  footerTextColor: string;
  headingFont: string;
  bodyFont: string;
  heroTitleSizePx: number;
  heroHeight: "compact" | "normal" | "tall";
  heroOverlayEnabled: boolean;
  heroOverlayOpacity: number;
  ctaLabel: string;
  secondaryCtaLabel?: string;
  heroBadgeText?: string;
  heroLayout?: "left" | "center" | "overlay" | "split";
  heroAlign?: "left" | "center" | "right";
  /** Contenu Ã©ditorial des sections (rÃ©solu serveur ou issu de lâ€™Ã©diteur). */
  sectionContent?: PageSectionContentV1;
  /** Variantes de mise en page par section (thÃ¨mes premium). */
  sectionLayoutVariants?: SectionLayoutVariantsMap;
  editorConfig?: PublicPageEditorConfig;
  fontSizeScale: "small" | "medium" | "large";
  borderRadius: "sharp" | "rounded" | "pill";
  buttonStyle: "filled" | "outlined" | "ghost";
  cardStyle: "flat" | "elevated" | "bordered";
  showPublicAddress: boolean;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showPublicWebsite: boolean;
  showPublicOpeningHours: boolean;
  showPublicInstagram: boolean;
  showPublicFacebook: boolean;
  showPublicGoogleMaps: boolean;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  googleMapsUrl?: string | null;
  preBookingMessage?: string | null;
  closureStartDate?: string | null;
  closureEndDate?: string | null;
  closureMessage?: string | null;
  /** Si vrai, le client doit choisir salle ou terrasse (paramÃ¨tres restaurant). */
  terraceEnabled?: boolean;
  /** Label terrasse affichÃ© au client (ex. Patio). */
  terraceLabel?: string;
  /** CapacitÃ© max terrasse (affichage indicatif). */
  terraceCapacity?: number;
};

function scrollToReservation() {
  document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDdMmYyyy(iso: string): string {
  const [y, mo, da] = iso.split("-");
  if (!y || !mo || !da) return "";
  return `${da}.${mo}.${y}`;
}

function PublicDescription({
  text,
  bodyColor,
  accentColor,
}: {
  text: string;
  bodyColor: string;
  accentColor: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [clampNeeded, setClampNeeded] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (expanded) return;
    setClampNeeded(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <p
        ref={ref}
        className={cn(
          "text-center text-pretty text-base leading-relaxed break-words md:text-lg",
          !expanded && "line-clamp-3",
        )}
        style={{ color: bodyColor }}
      >
        {text}
      </p>
      {clampNeeded || expanded ? (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            className="text-sm font-semibold underline-offset-4 hover:underline"
            style={{ color: accentColor }}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Voir moins" : "Voir plus"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function PublicReservationForm({
  forceLandingExperience = false,
  previewMode = false,
  restaurantId,
  restaurantSlug = "",
  restaurantName,
  heroTitle,
  restaurantTagline,
  cuisineType,
  city,
  highlights = [],
  specialMessage,
  menuUrl,
  reservationEnabled = true,
  showHoursBeforeForm = true,
  showPhoneCta = true,
  noSlotsMessage,
  publicPageDescription,
  galleryImageUrls = [],
  documents = [],
  restaurantPhone,
  restaurantAddress,
  restaurantEmail,
  allowPhone,
  allowEmail,
  maxPartySize,
  reservationMode: reservationModeProp = "global_covers",
  openingHours,
  daysInAdvance,
  logoUrl,
  coverImageUrl,
  pageBackgroundColor,
  heroPrimaryColor,
  buttonBgColor,
  buttonTextColor,
  headingTextColor,
  bodyTextColor,
  accentColor,
  footerBgColor,
  footerTextColor,
  headingFont,
  bodyFont,
  heroTitleSizePx,
  heroHeight,
  heroOverlayEnabled,
  heroOverlayOpacity,
  ctaLabel,
  secondaryCtaLabel,
  heroBadgeText,
  heroLayout = "center",
  heroAlign = "center",
  editorConfig,
  fontSizeScale,
  borderRadius,
  buttonStyle,
  cardStyle,
  showPublicAddress,
  showPublicPhone,
  showPublicEmail,
  showPublicWebsite,
  showPublicOpeningHours,
  showPublicInstagram,
  showPublicFacebook,
  showPublicGoogleMaps,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  googleMapsUrl,
  preBookingMessage,
  closureStartDate,
  closureEndDate,
  closureMessage,
  terraceEnabled = false,
  terraceLabel = "Terrasse",
  terraceCapacity = 0,
  visualThemeId = "default",
  themeCssVarOverrides,
  showGrainOverlay = false,
  sectionContent,
  sectionLayoutVariants,
}: PublicReservationFormProps) {
  const todayDate = useMemo(() => localYmd(new Date()), []);
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysInAdvance);
    return localYmd(d);
  }, [daysInAdvance]);
  const usePremiumChrome = visualThemeId !== "default";
  const allowTerraceZoneChoice = terraceEnabled;
  const normalizedReservationMode = normalizeReservationMode(reservationModeProp);
  const isTimeSlotsMode = normalizedReservationMode === "time_slots";
  const stepOrder = useMemo(
    () => buildPublicWizardSteps(normalizedReservationMode, allowTerraceZoneChoice),
    [normalizedReservationMode, allowTerraceZoneChoice],
  );
  const totalSteps = stepOrder.length;
  const [wizardStep, setWizardStep] = useState(1);
  const [largeGroupContact, setLargeGroupContact] = useState(false);
  const groupBlocksOnlineBooking = isTimeSlotsMode && largeGroupContact;
  const currentStepKey: PublicWizardStepKey = stepOrder[Math.max(0, wizardStep - 1)] ?? "date";
  const terraceZoneStep = useMemo(() => {
    const index = stepOrder.indexOf("zone");
    return index >= 0 ? index + 1 : null;
  }, [stepOrder]);
  const contactStep = useMemo(() => stepOrder.indexOf("contact") + 1, [stepOrder]);
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [reservationDate, setReservationDate] = useState(todayDate);
  const [reservationTime, setReservationTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [seatingZone, setSeatingZone] = useState<"interior" | "terrace" | null>(null);
  const [slotsByZone, setSlotsByZone] = useState<SlotsByZone>({ interior: [], terrace: [] });
  const [terraceMinCoverSlots, setTerraceMinCoverSlots] = useState<AvailabilitySlot[]>([]);
  const [zoneStepLoading, setZoneStepLoading] = useState(false);
  const [showroomReserveOpen, setShowroomReserveOpen] = useState(false);
  const effectiveTerraceLabel = normalizeTerraceLabel(terraceLabel);
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (allowTerraceZoneChoice) return;
    queueMicrotask(() => setSeatingZone("interior"));
  }, [allowTerraceZoneChoice]);

  useEffect(() => {
    if (!allowTerraceZoneChoice) return;
    queueMicrotask(() => setSeatingZone(null));
  }, [allowTerraceZoneChoice, reservationTime, reservationDate, guests]);

  const effectiveMaxParty = useMemo(
    () => Math.max(1, Math.floor(Number(maxPartySize)) || 8),
    [maxPartySize],
  );

  const tomorrowDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return localYmd(d);
  }, []);

  const dateInClosure = (iso: string) =>
    Boolean(closureStartDate && closureEndDate && iso >= closureStartDate && iso <= closureEndDate);

  const todaySelectable = !dateInClosure(todayDate) && todayDate <= maxDateStr;
  const tomorrowSelectable = !dateInClosure(tomorrowDate) && tomorrowDate <= maxDateStr;

  const sortedDocuments = useMemo(() => {
    const copy = [...documents];
    copy.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return copy;
  }, [documents]);

  const slotTimes = useMemo(
    () => [...availabilitySlots.map((s) => s.time)].sort((a, b) => a.localeCompare(b)),
    [availabilitySlots],
  );

  const effectiveConfig = useMemo((): PublicPageEditorConfig => {
    if (editorConfig) return editorConfig;
    return parseEditorConfig({
      ...defaultEditorConfig(),
      hero: {
        ...defaultEditorConfig().hero,
        layout: heroLayout,
        align: heroAlign,
        badgeText: heroBadgeText ?? defaultEditorConfig().hero.badgeText,
        primaryCta: ctaLabel,
        secondaryCta: secondaryCtaLabel ?? "Voir le menu",
        secondaryCtaEnabled: Boolean(secondaryCtaLabel),
      },
      appearance: {
        ...defaultEditorConfig().appearance,
        primaryColor: heroPrimaryColor,
        accentColor,
        backgroundColor: pageBackgroundColor,
        textColor: bodyTextColor,
        headingColor: headingTextColor,
        footerBgColor,
        footerTextColor,
        buttonTextColor,
        headingFont,
        bodyFont,
        buttonStyle,
        cardStyle,
      },
    });
  }, [
    editorConfig,
    heroLayout,
    heroAlign,
    heroBadgeText,
    ctaLabel,
    secondaryCtaLabel,
    heroPrimaryColor,
    accentColor,
    pageBackgroundColor,
    bodyTextColor,
    headingTextColor,
    footerBgColor,
    footerTextColor,
    buttonTextColor,
    headingFont,
    bodyFont,
    buttonStyle,
    cardStyle,
  ]);

  const pageTheme = useMemo(() => resolvePublicPageTheme(effectiveConfig), [effectiveConfig]);

  const effectiveHeroHeight = useMemo<"compact" | "normal" | "tall">(() => {
    const preset = effectiveConfig.hero.height;
    if (preset === "immersive") return "tall";
    if (preset === "compact") return "compact";
    if (preset === "normal") return "normal";
    return heroHeight;
  }, [effectiveConfig.hero.height, heroHeight]);

  /**
   * Source unique de vÃ©ritÃ© pour les variables visuelles :
   * `effectiveConfig.appearance` est mis Ã  jour en temps rÃ©el par le dashboard
   * et reflÃ¨te exactement ce que l'utilisateur a choisi.
   * Les props anciens (`headingFont`, `buttonBgColor`, etc.) ne sont conservÃ©s
   * que comme fallback pour les pages legacy sans editorConfig.
   */
  const appearance = effectiveConfig.appearance;
  // CTA / accent = mÃªme couleur : c'est la couleur d'action choisie par l'utilisateur.
  const effButtonBg = appearance.accentColor || buttonBgColor;
  const effButtonText = appearance.buttonTextColor || buttonTextColor;
  const effHeadingFont = appearance.headingFont || headingFont;
  const effBodyFont = appearance.bodyFont || bodyFont;
  const effHeroPrimary = appearance.primaryColor || heroPrimaryColor;
  // Convertit le format "soft/medium/premium" -> radius en px.
  const effRadius =
    appearance.borderRadius === "soft"
      ? "4px"
      : appearance.borderRadius === "premium"
        ? "20px"
        : "12px";
  const effButtonStyle = appearance.buttonStyle || buttonStyle;
  const effCardStyle = appearance.cardStyle || cardStyle;

  const cssVars = useMemo(() => {
    const base = {
      ...pageTheme.cssVars,
      "--page-bg": pageTheme.pageBg,
      "--hero-primary": effHeroPrimary,
      "--accent-color": pageTheme.accentColor,
      "--button-bg": effButtonBg,
      "--button-text": effButtonText,
      "--heading-color": pageTheme.headingColor,
      "--body-text": pageTheme.bodyColor,
      "--footer-bg": pageTheme.footerBg,
      "--footer-text": pageTheme.footerText,
      "--heading-font": `"${effHeadingFont}", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
      "--body-font": `"${effBodyFont}", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
      "--radius": effRadius,
      "--font-scale": fontSizeScale === "small" ? "0.92" : fontSizeScale === "large" ? "1.08" : "1",
    } as Record<string, string | number>;

    if (themeCssVarOverrides) {
      for (const [k, v] of Object.entries(themeCssVarOverrides)) {
        base[k] = v;
      }
    }

    const resolvedPageBg = String(base["--page-bg"]);
    base["--footer-bg"] = resolvedPageBg;
    base["--footer-text"] = String(base["--body-text"]);

    return base as React.CSSProperties;
  }, [
    pageTheme,
    effHeroPrimary,
    effButtonBg,
    effButtonText,
    effHeadingFont,
    effBodyFont,
    effRadius,
    fontSizeScale,
    themeCssVarOverrides,
  ]);

  const fieldStyle = useMemo(
    () => ({
      backgroundColor: "color-mix(in srgb, var(--body-text) 8%, var(--page-bg))",
      borderColor: "color-mix(in srgb, var(--body-text) 16%, var(--page-bg))",
      color: "var(--body-text)",
    }),
    [],
  );

  const cardShell = useMemo(
    () =>
      cn(
        "rounded-[var(--radius)] border p-6 backdrop-blur-md md:p-10",
        effCardStyle === "elevated" && "shadow-[0_32px_100px_-48px_rgba(0,0,0,0.35)]",
        effCardStyle === "flat" && "shadow-none",
        effCardStyle === "bordered" && "shadow-none",
      ),
    [effCardStyle],
  );

  const ctaStyle = useMemo(() => {
    const base =
      "inline-flex min-h-[48px] w-auto min-w-[220px] max-w-md items-center justify-center rounded-[var(--radius)] px-8 text-sm font-semibold tracking-wide transition duration-300 active:scale-[0.98] sm:min-h-[52px]";
    if (effButtonStyle === "ghost") {
      return {
        className: cn(base, "bg-transparent"),
        style: { color: "var(--button-bg)", border: "1px solid transparent" } as React.CSSProperties,
      };
    }
    if (effButtonStyle === "outlined") {
      return {
        className: cn(base, "bg-transparent"),
        style: {
          color: "var(--button-bg)",
          border: "2px solid var(--button-bg)",
        } as React.CSSProperties,
      };
    }
    return {
      className: cn(base, "shadow-lg"),
      style: {
        backgroundColor: "var(--button-bg)",
        color: "var(--button-text)",
        border: "1px solid transparent",
      } as React.CSSProperties,
    };
  }, [effButtonStyle]);

  /* eslint-disable react-hooks/set-state-in-effect -- chargement asynchrone des crÃ©neaux et indicateurs associÃ©s */
  useEffect(() => {
    if (previewMode) return;
    if (
      !reservationDate ||
      guests < 1 ||
      (closureStartDate && closureEndDate && reservationDate >= closureStartDate && reservationDate <= closureEndDate)
    ) {
      queueMicrotask(() => {
        setAvailabilitySlots([]);
        setSlotsError(null);
      });
      return;
    }

    if (reservationDate > maxDateStr) {
      queueMicrotask(() => {
        setAvailabilitySlots([]);
        setSlotsError("Cette date dÃ©passe la fenÃªtre de rÃ©servation autorisÃ©e.");
      });
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);

    const loadSlots = allowTerraceZoneChoice
      ? fetchSlotsByZone(restaurantId, reservationDate, guests).then((byZone) => {
          if (cancelled) return;
          setSlotsByZone(byZone);
          return mergeAvailabilitySlotTimes(byZone.interior, byZone.terrace);
        })
: fetchAvailabilityForZone(restaurantId, reservationDate, guests, "interior");

    loadSlots
      .then((slots) => {
        if (!cancelled && slots) setAvailabilitySlots(slots);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAvailabilitySlots([]);
          setSlotsByZone({ interior: [], terrace: [] });
          setSlotsError(err instanceof Error ? err.message : "Impossible de charger les crÃ©neaux.");
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    previewMode,
    restaurantId,
    reservationDate,
    guests,
    closureStartDate,
    closureEndDate,
    maxDateStr,
    allowTerraceZoneChoice,
    seatingZone,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const zoneSeatStates = useMemo(() => {
    if (!reservationTime) {
      return {
        interior: resolveInteriorSeatOption(null),
        terrace: resolveTerraceSeatOption(null, null, guests),
      };
    }
    const interiorSlot = findSlotAtTime(slotsByZone.interior, reservationTime);
    const terraceSlot = findSlotAtTime(slotsByZone.terrace, reservationTime);
    const terraceMinSlot = findSlotAtTime(terraceMinCoverSlots, reservationTime);
    return {
      interior: resolveInteriorSeatOption(interiorSlot),
      terrace: resolveTerraceSeatOption(terraceSlot, terraceMinSlot, guests),
    };
  }, [slotsByZone, terraceMinCoverSlots, reservationTime, guests]);

  useEffect(() => {
    if (!allowTerraceZoneChoice) return;
    if (currentStepKey !== "zone") return;
    if (!reservationDate || !reservationTime || guests < 1) return;

    let cancelled = false;
    setZoneStepLoading(true);

    Promise.all([
      fetchSlotsByZone(restaurantId, reservationDate, guests),
      fetchAvailabilityForZone(restaurantId, reservationDate, 1, "terrace"),
    ])
      .then(([byZone, minTerrace]) => {
        if (cancelled) return;
        setSlotsByZone(byZone);
        setTerraceMinCoverSlots(minTerrace);
      })
      .catch(() => {
        if (!cancelled) setTerraceMinCoverSlots([]);
      })
      .finally(() => {
        if (!cancelled) setZoneStepLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    allowTerraceZoneChoice,
    currentStepKey,
    restaurantId,
    reservationDate,
    reservationTime,
    guests,
  ]);

  useEffect(() => {
    if (!allowTerraceZoneChoice || !seatingZone) return;
    const state = seatingZone === "terrace" ? zoneSeatStates.terrace : zoneSeatStates.interior;
    if (!state.available) {
      queueMicrotask(() => setSeatingZone(null));
    }
  }, [allowTerraceZoneChoice, seatingZone, zoneSeatStates]);

  useEffect(() => {
    const times = new Set(availabilitySlots.map((s) => s.time));
    if (reservationTime && !times.has(reservationTime)) {
      queueMicrotask(() => setReservationTime(""));
    }
  }, [availabilitySlots, reservationTime]);

  useEffect(() => {
    queueMicrotask(() => setGuests((g) => Math.min(Math.max(1, g), effectiveMaxParty)));
  }, [effectiveMaxParty]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewMode) return;
    setMessage(null);
    setError(null);
    setIsSubmitting(true);

    if (closureStartDate && closureEndDate && reservationDate >= closureStartDate && reservationDate <= closureEndDate) {
      const closureLabel = closureMessage?.trim()
        ? `${closureMessage.trim()} - `
        : "";
      setError(
        `${closureLabel}Le restaurant est fermÃ© du ${closureStartDate} au ${closureEndDate}. Les rÃ©servations restent disponibles aprÃ¨s cette pÃ©riode.`,
      );
      setIsSubmitting(false);
      return;
    }

    const guestName = `${guestFirstName.trim()} ${guestLastName.trim()}`.trim();
    if (!guestName) {
      setError("Le prÃ©nom et le nom sont requis.");
      setIsSubmitting(false);
      return;
    }

    if ((allowEmail ?? true) && !guestEmail.trim()) {
      setError("Lâ€™adresse e-mail est requise.");
      setIsSubmitting(false);
      return;
    }

    if ((allowEmail ?? true) && guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      setError("Adresse e-mail invalide.");
      setIsSubmitting(false);
      return;
    }

    if ((allowPhone ?? true) && !guestPhone.trim()) {
      setError("Le numÃ©ro de tÃ©lÃ©phone est requis.");
      setIsSubmitting(false);
      return;
    }

    if (guestPhone.trim() && guestPhone.trim().replace(/\D/g, "").length < 8) {
      setError("NumÃ©ro de tÃ©lÃ©phone invalide (minimum 8 chiffres).");
      setIsSubmitting(false);
      return;
    }

    if (allowTerraceZoneChoice && !seatingZone) {
      setError("Veuillez choisir un emplacement (salle ou terrasse).");
      setIsSubmitting(false);
      return;
    }

    const submitZone: "interior" | "terrace" = allowTerraceZoneChoice ? seatingZone! : "interior";

    const slotsForZone =
      submitZone === "terrace" ? slotsByZone.terrace : slotsByZone.interior;
    const zoneSlotsCheck = allowTerraceZoneChoice
      ? slotsForZone
      : availabilitySlots;

    if (!zoneSlotsCheck.some((s) => s.time === reservationTime)) {
      setError("Ce crÃ©neau n'est plus disponible. Veuillez choisir une autre heure.");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        guestName,
        guestEmail,
        guestPhone,
        guests,
        reservationDate,
        reservationTime,
        ...(allowTerraceZoneChoice ? { zone: submitZone } : {}),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; status?: string };

    if (!response.ok) {
      setError(payload.error ?? "Impossible d'enregistrer votre rÃ©servation.");
      setIsSubmitting(false);
      return;
    }

    const isConfirmed = payload.status === "confirmed";
    setMessage(
      isConfirmed
        ? "Votre rÃ©servation est confirmÃ©e. Un e-mail de confirmation vous a Ã©tÃ© envoyÃ©."
        : "Votre demande de rÃ©servation a Ã©tÃ© enregistrÃ©e. Si vous avez indiquÃ© une adresse e-mail, un accusÃ© de rÃ©ception vous a Ã©tÃ© envoyÃ©.",
    );
    setGuestFirstName("");
    setGuestLastName("");
    setGuestEmail("");
    setGuestPhone("");
    setGuests(2);
    setReservationDate(todayDate);
    setReservationTime("");
    setSeatingZone(null);
    setWizardStep(1);
    setIsSubmitting(false);
  }

  const isDateInClosurePeriod = Boolean(
    reservationDate &&
      closureStartDate &&
      closureEndDate &&
      reservationDate >= closureStartDate &&
      reservationDate <= closureEndDate,
  );
  const closureNotice =
    closureStartDate && closureEndDate
      ? `Le restaurant est fermÃ© du ${closureStartDate} au ${closureEndDate}. Les rÃ©servations restent disponibles aprÃ¨s cette pÃ©riode.`
      : null;

  const headlineText = heroTitle?.trim() || restaurantName;
  const taglineText = restaurantTagline?.trim();
  const descriptionText = publicPageDescription?.trim() ?? "";
  const showroomHeroCopy = (() => {
    const name = restaurantName.trim();
    const title = heroTitle?.trim();
    const tag = taglineText;
    const desc = descriptionText;
    let headline: string | null = null;
    let subtitle: string | null = null;
    if (title && title.toLowerCase() !== name.toLowerCase()) {
      headline = title;
      subtitle = tag && tag.toLowerCase() !== title.toLowerCase() ? tag : desc?.slice(0, 140) || null;
    } else if (tag && tag.toLowerCase() !== name.toLowerCase()) {
      headline = tag;
      subtitle = desc?.slice(0, 140) || null;
    } else if (desc) {
      subtitle = desc.slice(0, 140);
    }
    return { headline, subtitle };
  })();
  const menuHref =
    menuUrl?.trim() ||
    (sortedDocuments[0]?.fileUrl ?? null);
  const activeHighlights = highlights.filter(Boolean).slice(0, 6);

  const openingHoursLines = formatOpeningHoursLines(openingHours);
  const showroomHoursSummary = useMemo(() => {
    const lines = openingHoursLines.filter(Boolean);
    if (lines.length === 0) return null;
    const joined = lines.slice(0, 2).join(" • ");
    return joined.length > 80 ? `${joined.slice(0, 77).trimEnd()}…` : joined;
  }, [openingHoursLines]);

  const legacyContactHints = useMemo(
    () => ({
      showAddress: showPublicAddress,
      showPhone: showPublicPhone,
      showEmail: showPublicEmail,
      showWebsite: showPublicWebsite,
      showOpeningHours: showPublicOpeningHours,
      showInstagram: showPublicInstagram,
      showFacebook: showPublicFacebook,
      showGoogleMaps: showPublicGoogleMaps,
    }),
    [
      showPublicAddress,
      showPublicPhone,
      showPublicEmail,
      showPublicWebsite,
      showPublicOpeningHours,
      showPublicInstagram,
      showPublicFacebook,
      showPublicGoogleMaps,
    ],
  );

  const labelClass = "block text-xs font-semibold uppercase tracking-[0.18em]";
  const iconRing =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--body-text)_22%,transparent)] bg-[color-mix(in_srgb,var(--body-text)_10%,transparent)] text-[var(--body-text)]";
  const inputClass = useMemo(
    () =>
      usePremiumChrome
        ? "min-h-[48px] w-full border-0 border-b-2 border-[color-mix(in_srgb,var(--body-text)_20%,transparent)] bg-transparent px-0 py-3 text-sm outline-none transition focus:border-[color-mix(in_srgb,var(--accent-color)_55%,transparent)] focus-visible:ring-0"
        : "min-h-[48px] w-full rounded-[var(--radius)] border px-4 py-3 text-sm outline-none transition focus:border-[color-mix(in_srgb,var(--accent-color)_45%,transparent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-color)_30%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]",
    [usePremiumChrome],
  );

  const overlayOpacity = Math.min(80, Math.max(0, heroOverlayOpacity)) / 100;

  const blockEnabled = (id: PageBlockId) => {
    // GIFT_CARDS feature flag â€” rÃ©activable
    if (isGiftVouchersBlockId(id) && !isGiftCardsEnabled()) return false;
    return effectiveConfig.blocks[id]?.enabled !== false;
  };

  const resolvedSectionContent = useMemo(
    () =>
      sectionContent ??
      resolvePublicPageSectionContent(
        visualThemeId,
        effectiveConfig.conversion.structureTemplate,
        {},
        {
          contact: legacyContactHints,
          hero: {
            showPhone: showPhoneCta,
            showSecondaryCta: effectiveConfig.hero.secondaryCtaEnabled,
          },
          reservation: {
            showHoursBlock: showHoursBeforeForm,
            showPhoneAlt: showPhoneCta,
          },
          gallery: { showInstagramLink: showPublicInstagram },
          finalCta: { showPhone: showPhoneCta },
        },
      ),
    [
      sectionContent,
      visualThemeId,
      effectiveConfig.conversion.structureTemplate,
      effectiveConfig.hero.secondaryCtaEnabled,
      legacyContactHints,
      showPhoneCta,
      showHoursBeforeForm,
      showPublicInstagram,
    ],
  );

  const practicalDisplay = resolvedSectionContent.practical?.display;
  const galleryDisplay = resolvedSectionContent.gallery?.display;
  const showAddressRow = Boolean(practicalDisplay?.showAddress && restaurantAddress?.trim());
  const showPhoneRow = Boolean(practicalDisplay?.showPhone && restaurantPhone?.trim());
  const showEmailRow = Boolean(practicalDisplay?.showEmail && restaurantEmail?.trim());
  const showWebsiteRow = Boolean(practicalDisplay?.showWebsite && websiteUrl?.trim());
  const showHoursRow = Boolean(practicalDisplay?.showHours && openingHoursLines.length > 0);
  const showInstagram =
    Boolean(galleryDisplay?.showInstagramLink && instagramUrl?.trim()) ||
    Boolean(practicalDisplay?.showInstagram && instagramUrl?.trim());
  const showFacebook = Boolean(practicalDisplay?.showFacebook && facebookUrl?.trim());

  const navLinksPublic = useMemo(
    () => buildPublicNavLinks(resolvedSectionContent.navigation, blockEnabled("gift_vouchers")),
    [resolvedSectionContent.navigation, effectiveConfig.blocks.gift_vouchers?.enabled],
  );

  const sectionOrder = resolveEffectiveSectionOrder(effectiveConfig);
  const sectionOrderIndex = (id: PageBlockId) => {
    const i = sectionOrder.indexOf(id);
    return i >= 0 ? i : 50;
  };
  const isLandingPage =
    forceLandingExperience === true ||
    isSocialShowroomFlow(effectiveConfig.conversion.structureTemplate);
  const conversionCta = ctaFlags(
    effectiveConfig.conversion,
    isLandingPage ? "social_showroom" : effectiveConfig.conversion.structureTemplate,
  );

  const heroDisplay = useMemo(() => {
    const base = resolvedSectionContent.hero?.display;
    if (!isLandingPage) return base;
    return {
      ...base,
      showOpenStatus: false,
      showPhone: false,
      showBadge: base?.showBadge ?? false,
      showScrollHint: base?.showScrollHint ?? true,
    };
  }, [isLandingPage, resolvedSectionContent.hero?.display]);
  const premium = effectiveConfig.premium;
  const openStatus = openStatusLabel(openingHours);
  const credibilityData = premium.credibility;
  const showCredibility =
    blockEnabled("reviews") && hasCredibilityContent(credibilityData);
  const conceptBody =
    premium.concept.body.trim() ||
    descriptionText ||
    effectiveConfig.blockContent.about.body.trim();
  const conceptTitle =
    premium.concept.title.trim() || effectiveConfig.blockContent.about.title || "Notre expÃ©rience";
  const conceptImage =
    premium.concept.imageUrl.trim() || galleryImageUrls[0] || coverImageUrl || "";
  const showroomAtmosphereImage =
    premium.concept.imageUrl.trim() || galleryImageUrls[0] || null;
  const showroomGalleryImages =
    showroomAtmosphereImage &&
    !premium.concept.imageUrl.trim() &&
    galleryImageUrls[0] === showroomAtmosphereImage
      ? galleryImageUrls.slice(1)
      : galleryImageUrls;

  const secondaryLabel =
    secondaryCtaLabel?.trim() || effectiveConfig.hero.secondaryCta || "Voir le menu";
  const menuOffers = visibleMenuOffers(premium.menuOffers);

  const menuPdfLinkLabel = useMemo(() => {
    const docLabel = sortedDocuments[0]?.label?.trim();
    if (docLabel) return docLabel;
    const secondary = secondaryLabel?.trim();
    if (secondary) return secondary;
    return resolvedSectionContent.menu_offers?.pdfButtonLabel?.trim() ?? "";
  }, [
    sortedDocuments,
    secondaryLabel,
    resolvedSectionContent.menu_offers?.pdfButtonLabel,
  ]);

  const dateBtnRadius = usePremiumChrome ? "rounded-full" : "rounded-[var(--radius)]";

  function handleReserve() {
    if (isLandingPage) {
      setShowroomReserveOpen(true);
      return;
    }
    scrollToReservation();
  }

  function closeShowroomReserve() {
    setShowroomReserveOpen(false);
  }

  return (
    <div
      data-zg-theme={visualThemeId}
      className={cn(
        previewMode ? "relative min-h-0 w-full" : "min-h-screen",
        "[font-size:calc(16px*var(--font-scale))]",
        isLandingPage && "zg-showroom-flow",
        !previewMode &&
          (isLandingPage || conversionCta.showSticky) &&
          reservationEnabled &&
          blockEnabled("reservation") &&
          "pb-[5.25rem]",
      )}
      data-showroom-flow={isLandingPage ? "true" : undefined}
      style={{
        ...cssVars,
        backgroundColor: "var(--page-bg)",
        color: "var(--body-text)",
        fontFamily: "var(--body-font), system-ui, sans-serif",
      }}
    >
      {showGrainOverlay && !isLandingPage ? <GrainOverlay /> : null}

      {isLandingPage ? (
        <ShowroomHero
          coverImageUrl={coverImageUrl}
          logoUrl={logoUrl}
          restaurantName={restaurantName}
          emotionalHeadline={showroomHeroCopy.headline}
          emotionalSubtitle={showroomHeroCopy.subtitle}
          cuisineType={cuisineType}
          city={city}
          openStatus={openStatus}
          hoursSummary={showroomHoursSummary}
          ctaLabel={ctaLabel}
          secondaryLabel={secondaryLabel}
          secondaryHref={menuHref}
          showSecondary={Boolean(menuHref || effectiveConfig.hero.secondaryCtaEnabled)}
          onReserve={handleReserve}
          previewMode={previewMode}
        />
      ) : usePremiumChrome ? (
        <>
          <PremiumDarkNav
            restaurantName={restaurantName}
            ctaLabel={ctaLabel}
            onReserve={scrollToReservation}
            visible={premium.navigationEnabled}
            previewMode={previewMode}
            navLinks={navLinksPublic}
            showReserveCta={conversionCta.showNavReserve}
          />
          <PremiumDarkHero
            badgeText={effectiveConfig.hero.badgeText?.trim() || heroBadgeText?.trim() || undefined}
            coverImageUrl={coverImageUrl}
            headline={headlineText}
            tagline={taglineText || undefined}
            openStatus={openStatus}
            phone={restaurantPhone}
            showPhone={showPhoneCta}
            ctaLabel={ctaLabel}
            secondaryLabel={secondaryLabel}
            secondaryHref={menuHref}
            showSecondary={
              isLandingPage
                ? Boolean(menuHref || effectiveConfig.hero.secondaryCtaEnabled)
                : Boolean(menuHref && effectiveConfig.hero.secondaryCtaEnabled)
            }
            onReserve={scrollToReservation}
            ctaStyle={ctaStyle}
            previewMode={previewMode}
            scriptLineFallback={resolvedSectionContent.hero?.scriptLineFallback ?? ""}
            scrollHintLabel={resolvedSectionContent.hero?.scrollHintLabel ?? ""}
          />
        </>
      ) : (
        <>
          <PublicPageNav
            restaurantName={restaurantName}
            ctaLabel={ctaLabel}
            onReserve={scrollToReservation}
            visible={premium.navigationEnabled}
            previewMode={previewMode}
            navLinks={navLinksPublic}
            showReserveCta={conversionCta.showNavReserve}
          />

          <PremiumHero
            badgeText={effectiveConfig.hero.badgeText?.trim() || heroBadgeText?.trim() || undefined}
            coverImageUrl={coverImageUrl}
            logoUrl={logoUrl}
            headline={headlineText}
            tagline={taglineText || undefined}
            openStatus={openStatus}
            phone={restaurantPhone}
            showPhone={showPhoneCta}
            ctaLabel={ctaLabel}
            secondaryLabel={secondaryLabel}
            secondaryHref={menuHref}
            showSecondary={
              isLandingPage
                ? Boolean(menuHref || effectiveConfig.hero.secondaryCtaEnabled)
                : Boolean(menuHref && effectiveConfig.hero.secondaryCtaEnabled)
            }
            onReserve={scrollToReservation}
            ctaStyle={ctaStyle}
            overlayOpacity={heroOverlayEnabled ? overlayOpacity : 0}
            heroAlign={heroLayout === "left" ? "left" : heroAlign}
            heroLayout={heroLayout}
            heroHeight={effectiveHeroHeight}
            previewMode={previewMode}
            discoverConceptLabel={resolvedSectionContent.hero?.discoverConceptLabel ?? ""}
            scrollHintLabel={resolvedSectionContent.hero?.scrollHintLabel ?? ""}
            display={heroDisplay}
            discoverAnchorId={isLandingPage ? "galerie" : "concept"}
            tone={isLandingPage ? "cinematic" : "default"}
          />
        </>
      )}

      {specialMessage?.trim() && !isLandingPage ? (
        <div
          className="mx-auto mt-6 max-w-3xl rounded-2xl border px-5 py-3 text-center text-sm font-medium"
          style={{
            borderColor: "color-mix(in srgb, var(--accent-color) 30%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--accent-color) 10%, var(--page-bg))",
            color: "var(--heading-color)",
          }}
        >
          {specialMessage.trim()}
        </div>
      ) : null}

      <div className={cn("flex w-full flex-col", isLandingPage && "flex flex-col")}>

        {!isLandingPage && blockEnabled("highlights") && activeHighlights.length > 0 ? (
          <div style={{ order: sectionOrderIndex("highlights") }}>
            <HighlightsBand
              items={activeHighlights}
              eyebrow={resolvedSectionContent.highlights?.eyebrow}
            />
          </div>
        ) : null}

        {!isLandingPage && blockEnabled("about") && premium.concept.enabled ? (
          <div style={{ order: sectionOrderIndex("about") }}>
            <ConceptSection
              title={conceptTitle}
              body={conceptBody}
              imageUrl={conceptImage || undefined}
              pillars={premium.concept.pillars}
              eyebrow={resolvedSectionContent.concept?.eyebrow ?? ""}
              imageStampLabel={resolvedSectionContent.concept?.imageStampLabel ?? ""}
              layout={
                usePremiumChrome && sectionLayoutVariants?.concept
                  ? conceptLayoutFromVariant(sectionLayoutVariants.concept)
                  : effectiveConfig.conversion.structureTemplate === "modern_brasserie" ||
                      effectiveConfig.conversion.structureTemplate === "minimal_conversion"
                    ? "stacked"
                    : effectiveConfig.conversion.structureTemplate === "warm_restaurant"
                      ? "image-left"
                      : "image-right"
              }
            />
            {visibleEditorialSections(premium.editorialSections).map((section) => (
              <EditorialBlock key={section.id} section={section} previewMode={previewMode} />
            ))}
          </div>
        ) : null}

        {!isLandingPage && blockEnabled("menu") && sortedDocuments.length > 0 && !menuHref ? (
          <section
            className="relative scroll-mt-24 overflow-hidden"
            style={{
              order: sectionOrderIndex("menu"),
              background:
                "linear-gradient(180deg, var(--page-bg) 0%, color-mix(in srgb, var(--body-text) 3.5%, var(--page-bg)) 100%)",
            }}
          >
            <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-[4.5rem] lg:px-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
                <div className="max-w-xl text-center lg:text-left">
                  <div className="flex items-center justify-center gap-3 lg:justify-start">
                    <span
                      className="h-px w-10"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--accent-color) 55%, transparent)",
                      }}
                      aria-hidden
                    />
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.34em]"
                      style={{ color: "var(--accent-color)" }}
                    >
                      {resolvedSectionContent.menu_documents?.eyebrow ?? ""}
                    </p>
                  </div>
                  <h2
                    className="mt-5 text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.05]"
                    style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)", letterSpacing: "-0.018em" }}
                  >
                    {resolvedSectionContent.menu_documents?.title ?? ""}
                  </h2>
                </div>
              </div>
              <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                {sortedDocuments.map((doc) => (
                  <li key={doc.id} className="min-w-0 flex-1 sm:flex-none">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-[56px] flex-col justify-center rounded-[calc(var(--radius)+4px)] border border-[color-mix(in_srgb,var(--body-text)_09%,transparent)] bg-[color-mix(in_srgb,var(--page-bg)_55%,transparent)] px-6 py-4 text-left shadow-[0_34px_110px_-74px_rgba(0,0,0,0.45)] backdrop-blur-[2px] transition hover:border-[color-mix(in_srgb,var(--accent-color)_45%,transparent)] sm:min-h-0 sm:inline-flex sm:flex-row sm:items-center sm:gap-3 sm:py-3.5"
                    >
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.26em] opacity-60"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {resolvedSectionContent.menu_documents?.linkPrefix ?? ""}
                      </span>
                      <span
                        className="mt-1 text-base font-medium leading-snug sm:mt-0 sm:text-[1.05rem]"
                        style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
                      >
                        {doc.label}
                      </span>
                      <span
                        className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-0 transition group-hover:opacity-100 sm:ml-auto sm:mt-0 sm:pl-4"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {resolvedSectionContent.menu_documents?.linkOpen ?? ""}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {blockEnabled("reservation") && reservationEnabled ? (
          <ReservationWizardShell
            landing={isLandingPage}
            drawerOpen={showroomReserveOpen}
            onClose={closeShowroomReserve}
            sectionOrder={sectionOrderIndex("reservation")}
          >
        <PremiumReservationSection
          title={isLandingPage ? "Réserver une table" : reservationSectionTitle()}
          intro={isLandingPage ? "" : effectiveConfig.reservation.intro}
          groupMessage={premium.reservation.groupMessage}
          showPhoneAlt={showPhoneCta && showPhoneRow}
          phone={restaurantPhone}
          eyebrow={resolvedSectionContent.reservation_shell?.eyebrow ?? ""}
          phonePreferLabel={resolvedSectionContent.reservation_shell?.phonePreferLabel ?? ""}
          showroomMinimal={isLandingPage}
        >
            {showHoursBeforeForm && showHoursRow && !isLandingPage ? (
              <div
                className="mb-5 rounded-xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "color-mix(in srgb, var(--body-text) 14%, var(--page-bg))",
                  backgroundColor: "color-mix(in srgb, var(--body-text) 4%, var(--page-bg))",
                }}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">Horaires</p>
                <ul className="space-y-0.5 text-sm">
                  {openingHoursLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <form className="flex min-h-0 flex-col gap-5" onSubmit={handleSubmit}>
              {closureNotice ? (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-950">
                  {closureMessage?.trim() ? `${closureMessage.trim()} â€” ${closureNotice}` : closureNotice}
                </div>
              ) : null}
              {preBookingMessage ? (
                <div
                  className="rounded-xl border px-4 py-3 text-sm leading-relaxed"
                  style={{
                    borderColor: `color-mix(in srgb, var(--accent-color) 35%, transparent)`,
                    backgroundColor: `color-mix(in srgb, var(--accent-color) 8%, transparent)`,
                    color: "var(--body-text)",
                  }}
                >
                  {preBookingMessage}
                </div>
              ) : null}

              <nav aria-label="Ã‰tapes" className="w-full px-1">
                <ol className="flex w-full list-none items-center justify-between gap-1 p-0">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n, idx) => {
                    const active = wizardStep === n;
                    const mutedLine = "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))";
                    return (
                      <Fragment key={n}>
                        <li className="flex list-none items-center">
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition sm:h-11 sm:w-11",
                              active ? "border-transparent shadow-sm" : "border-current bg-transparent opacity-45",
                            )}
                            style={
                              active
                                ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)" }
                                : { borderColor: mutedLine, color: "color-mix(in srgb, var(--body-text) 55%, var(--page-bg))" }
                            }
                            aria-current={active ? "step" : undefined}
                          >
                            {n}
                          </span>
                        </li>
                        {idx < totalSteps - 1 ? (
                          <li className="mx-1 min-w-[12px] flex-1 list-none" aria-hidden>
                            <div
                              className="h-0.5 w-full rounded-full"
                              style={{ backgroundColor: wizardStep > n ? "var(--button-bg)" : mutedLine }}
                            />
                          </li>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </ol>
              </nav>

              <div className="min-h-0 flex-1">
                {currentStepKey === "date" ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={previewMode || !todaySelectable}
                          onClick={() => setReservationDate(todayDate)}
                          className={cn(
                            "min-h-[48px] flex-1 border-2 px-2 py-3 text-xs font-semibold tracking-wide transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 sm:text-sm",
                            dateBtnRadius,
                            reservationDate === todayDate ? "border-transparent shadow-sm" : "bg-transparent",
                          )}
                          style={
                            reservationDate === todayDate
                              ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)", borderColor: "var(--button-bg)" }
                              : {
                                  borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                  color: "color-mix(in srgb, var(--body-text) 78%, var(--page-bg))",
                                }
                          }
                        >
                          AUJOURD&apos;HUI
                        </button>
                        <button
                          type="button"
                          disabled={previewMode || !tomorrowSelectable}
                          onClick={() => setReservationDate(tomorrowDate)}
                          className={cn(
                            "min-h-[48px] flex-1 border-2 px-2 py-3 text-xs font-semibold tracking-wide transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 sm:text-sm",
                            dateBtnRadius,
                            reservationDate === tomorrowDate ? "border-transparent shadow-sm" : "bg-transparent",
                          )}
                          style={
                            reservationDate === tomorrowDate
                              ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)", borderColor: "var(--button-bg)" }
                              : {
                                  borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                  color: "color-mix(in srgb, var(--body-text) 78%, var(--page-bg))",
                                }
                          }
                        >
                          DEMAIN
                        </button>
                        <button
                          type="button"
                          disabled={previewMode}
                          onClick={() => datePickerRef.current?.showPicker?.() ?? datePickerRef.current?.click()}
                          className={cn(
                            "flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center border-2 transition active:scale-[0.99] disabled:opacity-40",
                            dateBtnRadius,
                            reservationDate &&
                              reservationDate !== todayDate &&
                              reservationDate !== tomorrowDate
                              ? "border-transparent shadow-sm"
                              : "bg-transparent",
                          )}
                          style={
                            reservationDate &&
                            reservationDate !== todayDate &&
                            reservationDate !== tomorrowDate
                              ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)", borderColor: "var(--button-bg)" }
                              : {
                                  borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                  color: "color-mix(in srgb, var(--body-text) 78%, var(--page-bg))",
                                }
                          }
                          aria-label="Choisir une date au calendrier"
                        >
                          <Calendar className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </div>
                      <input
                        ref={datePickerRef}
                        id="public-reservation-date-picker"
                        type="date"
                        value={reservationDate}
                        min={todayDate}
                        max={maxDateStr}
                        disabled={previewMode}
                        className="sr-only"
                        tabIndex={-1}
                        onChange={(e) => setReservationDate(e.target.value)}
                      />
                      <p
                        className="text-center text-sm font-medium tabular-nums sm:text-base"
                        style={{ color: "var(--heading-color)" }}
                      >
                        {reservationDate ? formatDateDdMmYyyy(reservationDate) : "â€”"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {currentStepKey === "guests" ? (
                  <div className="flex flex-col gap-6">
                    {false ? (
                      <div className="flex flex-col gap-2" role="group" aria-label="Emplacement">
                        <p className="text-center text-sm font-medium" style={{ color: "var(--heading-color)" }}>
                          Emplacement
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            disabled={previewMode}
                            onClick={() => setSeatingZone("interior")}
                            className={cn(
                              "min-h-[52px] rounded-[var(--radius)] border-2 px-4 py-3 text-base font-semibold transition active:scale-[0.99] disabled:opacity-40",
                              seatingZone === "interior" ? "border-transparent shadow-sm" : "bg-transparent",
                            )}
                            style={
                              seatingZone === "interior"
                                ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)", borderColor: "var(--button-bg)" }
                                : {
                                    borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                    color: "color-mix(in srgb, var(--body-text) 85%, var(--page-bg))",
                                  }
                            }
                          >
                            IntÃ©rieur
                          </button>
                          <button
                            type="button"
                            disabled={previewMode}
                            onClick={() => setSeatingZone("terrace")}
                            className={cn(
                              "min-h-[52px] rounded-[var(--radius)] border-2 px-4 py-3 text-base font-semibold transition active:scale-[0.99] disabled:opacity-40",
                              seatingZone === "terrace" ? "border-transparent shadow-sm" : "bg-transparent",
                            )}
                            style={
                              seatingZone === "terrace"
                                ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)", borderColor: "var(--button-bg)" }
                                : {
                                    borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                    color: "color-mix(in srgb, var(--body-text) 85%, var(--page-bg))",
                                  }
                            }
                          >
                            Terrasse
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-3">
                      <p className="text-center text-sm font-medium" style={{ color: "var(--heading-color)" }}>
                        Nombre de personnes
                      </p>
                      {groupBlocksOnlineBooking ? (
                        <LargeGroupContactBlock
                          maxPartySize={effectiveMaxParty}
                          restaurantPhone={restaurantPhone}
                        />
                      ) : null}
                      {!groupBlocksOnlineBooking ? (
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: "repeat(auto-fill, minmax(3.25rem, 1fr))",
                        }}
                      >
                        {Array.from({ length: effectiveMaxParty }, (_, i) => i + 1).map((n) => (
                          <button
                            key={n}
                            type="button"
                            disabled={previewMode}
                            onClick={() => {
                              setGuests(n);
                              setLargeGroupContact(false);
                            }}
                            className={cn(
                              "min-h-[48px] border-2 text-base font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
                              dateBtnRadius,
                              guests === n && !largeGroupContact ? "border-transparent shadow-sm" : "bg-transparent",
                            )}
                            style={
                              guests === n && !largeGroupContact
                                ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)", borderColor: "var(--button-bg)" }
                                : {
                                    borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                    color: "color-mix(in srgb, var(--body-text) 78%, var(--page-bg))",
                                  }
                            }
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      ) : null}
                      {!groupBlocksOnlineBooking && isTimeSlotsMode ? (
                        <button
                          type="button"
                          disabled={previewMode}
                          onClick={() => setLargeGroupContact(true)}
                          className={cn(
                            "min-h-[48px] w-full border-2 px-4 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40",
                            dateBtnRadius,
                            largeGroupContact ? "border-transparent shadow-sm" : "bg-transparent",
                          )}
                          style={
                            largeGroupContact
                              ? {
                                  backgroundColor: "var(--button-bg)",
                                  color: "var(--button-text)",
                                  borderColor: "var(--button-bg)",
                                }
                              : {
                                  borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                  color: "color-mix(in srgb, var(--body-text) 78%, var(--page-bg))",
                                }
                          }
                        >
                          Plus de {effectiveMaxParty} personnes
                        </button>
                      ) : null}
                      {!groupBlocksOnlineBooking && !isTimeSlotsMode ? (
                        <p
                          className="text-center text-xs leading-snug sm:text-sm"
                          style={{ color: "color-mix(in srgb, var(--body-text) 62%, var(--page-bg))" }}
                        >
                          {`Veuillez nous appeler pour les groupes de plus de ${effectiveMaxParty} personnes.`}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {currentStepKey === "time" ? (
                  <div className="flex flex-col gap-4">
                    {slotsLoading ? (
                      <p className="text-center text-sm" style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}>
                        Chargement des crÃ©neauxâ€¦
                      </p>
                    ) : slotsError ? (
                      <p className="text-center text-sm text-amber-800">{slotsError}</p>
                    ) : slotTimes.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <p
                          className="text-center text-sm"
                          style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}
                        >
                          {noSlotsMessage?.trim() || "Aucun crÃ©neau disponible pour cette date."}
                        </p>
                        <button
                          type="button"
                          className="text-sm font-semibold underline-offset-4 hover:underline"
                          style={{ color: "var(--accent-color)" }}
                          onClick={() => setWizardStep(stepOrder.indexOf("date") + 1)}
                        >
                          Choisir un autre jour
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {slotTimes.map((t) => (
                          <button
                            key={t}
                            type="button"
                            disabled={previewMode || isDateInClosurePeriod}
                            onClick={() => setReservationTime(t)}
                            className={cn(
                              "min-h-[48px] border-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40",
                              dateBtnRadius,
                              reservationTime === t ? "border-transparent shadow-sm" : "bg-transparent",
                            )}
                            style={
                              reservationTime === t
                                ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)", borderColor: "var(--button-bg)" }
                                : {
                                    borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                    color: "color-mix(in srgb, var(--body-text) 82%, var(--page-bg))",
                                  }
                            }
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {allowTerraceZoneChoice && currentStepKey === "zone" ? (
                  <div className="flex flex-col gap-4">
                    {zoneStepLoading ? (
                      <p
                        className="text-center text-sm"
                        style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}
                      >
                        VÃ©rification des placesâ€¦
                      </p>
                    ) : (
                      <SeatingZonePicker
                        interiorLabel="Salle"
                        terraceLabel={effectiveTerraceLabel}
                        value={seatingZone}
                        onChange={setSeatingZone}
                        interiorState={zoneSeatStates.interior}
                        terraceState={zoneSeatStates.terrace}
                        previewMode={previewMode}
                        radiusClass={dateBtnRadius}
                      />
                    )}
                  </div>
                ) : null}

                {currentStepKey === "contact" ? (
                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="guest-first-name"
                          className={labelClass}
                          style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}
                        >
                          PrÃ©nom
                        </label>
                        <Input
                          id="guest-first-name"
                          value={guestFirstName}
                          onChange={(event) => setGuestFirstName(event.target.value)}
                          required
                          autoComplete="given-name"
                          disabled={previewMode}
                          className={inputClass}
                          style={fieldStyle}
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="guest-last-name"
                          className={labelClass}
                          style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}
                        >
                          Nom
                        </label>
                        <Input
                          id="guest-last-name"
                          value={guestLastName}
                          onChange={(event) => setGuestLastName(event.target.value)}
                          required
                          autoComplete="family-name"
                          disabled={previewMode}
                          className={inputClass}
                          style={fieldStyle}
                        />
                      </div>
                    </div>
                    {(allowEmail ?? true) ? (
                      <div className="space-y-2">
                        <label htmlFor="email" className={labelClass} style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}>
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={guestEmail}
                          onChange={(event) => setGuestEmail(event.target.value)}
                          required={allowEmail ?? true}
                          autoComplete="email"
                          disabled={previewMode}
                          className={inputClass}
                          style={fieldStyle}
                        />
                      </div>
                    ) : null}
                    <div className="space-y-2">
                      <label htmlFor="phone" className={labelClass} style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}>
                        TÃ©lÃ©phone
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={guestPhone}
                        onChange={(event) => setGuestPhone(event.target.value)}
                        required={allowPhone ?? true}
                        autoComplete="tel"
                        disabled={previewMode}
                        className={inputClass}
                        style={fieldStyle}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    disabled={previewMode || isSubmitting}
                    onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
                    className="order-2 min-h-[48px] rounded-[var(--radius)] border-2 px-6 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-40 sm:order-1"
                    style={{
                      borderColor: "color-mix(in srgb, var(--body-text) 24%, var(--page-bg))",
                      color: "color-mix(in srgb, var(--body-text) 88%, var(--page-bg))",
                      backgroundColor: "transparent",
                    }}
                  >
                    Retour
                  </button>
                ) : (
                  <span className="hidden sm:block sm:flex-1" aria-hidden />
                )}

                {wizardStep < totalSteps && !groupBlocksOnlineBooking ? (
                  <button
                    type="button"
                    disabled={
                      previewMode ||
                      (currentStepKey === "date" &&
                        (!reservationDate || isDateInClosurePeriod || reservationDate > maxDateStr)) ||
                      (currentStepKey === "guests" && (guests < 1 || isDateInClosurePeriod)) ||
                      (currentStepKey === "time" && !reservationTime) ||
                      (currentStepKey === "zone" &&
                        allowTerraceZoneChoice &&
                        (zoneStepLoading || !seatingZone))
                    }
                    onClick={() => setWizardStep((s) => Math.min(totalSteps, s + 1))}
                    className="order-1 min-h-[48px] w-full rounded-[var(--radius)] border border-transparent px-6 text-sm font-semibold shadow-md transition hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 sm:order-2 sm:ml-auto sm:w-auto sm:min-w-[200px]"
                    style={{
                      backgroundColor: "var(--button-bg)",
                      color: "var(--button-text)",
                    }}
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={previewMode || isSubmitting || isDateInClosurePeriod}
                    className="order-1 min-h-[52px] w-full rounded-[var(--radius)] border border-transparent px-6 text-[15px] font-semibold shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 sm:order-2 sm:ml-auto sm:w-auto sm:min-w-[220px]"
                    style={{
                      ...(effButtonStyle === "ghost"
                        ? { backgroundColor: "transparent", color: "var(--button-bg)" }
                        : effButtonStyle === "outlined"
                          ? { backgroundColor: "transparent", color: "var(--button-bg)", borderColor: "var(--button-bg)" }
                          : { backgroundColor: "var(--button-bg)", color: "var(--button-text)" }),
                    }}
                  >
                    {isSubmitting ? "Envoi en coursâ€¦" : "Confirmer la rÃ©servation"}
                  </button>
                )}
              </div>
            </form>

            {error ? (
              <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-900">
                {error}
              </p>
            ) : null}
{message ? (
              <p className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900">
                {message}
              </p>
            ) : null}
        </PremiumReservationSection>
          </ReservationWizardShell>
        ) : showPhoneCta && showPhoneRow ? (
        <section id="reservation" className="scroll-mt-24">
          <div className={cardShell} style={{ backgroundColor: "color-mix(in srgb, var(--body-text) 7%, var(--page-bg))", borderColor: "color-mix(in srgb, var(--body-text) 14%, var(--page-bg))" }}>
            <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}>RÃ©server</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--body-text)" }}>Les rÃ©servations en ligne sont dÃ©sactivÃ©es. Appelez-nous pour rÃ©server.</p>
            <a href={`tel:${restaurantPhone!.replace(/\s/g, "")}`} className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius)] px-6 text-sm font-semibold" style={{ backgroundColor: "var(--button-bg)", color: "var(--button-text)" }}>
              <Phone className="mr-2 h-4 w-4" /> {restaurantPhone}
            </a>
          </div>
        </section>
        ) : null}

        {!isLandingPage && blockEnabled("menu") && (menuHref || menuOffers.length > 0) ? (
          <div style={{ order: sectionOrderIndex("menu") }}>
            {usePremiumChrome ? (
              <PremiumDarkMenuOffersSection
                offers={menuOffers}
                menuHref={menuHref}
                menuPdfLabel={menuPdfLinkLabel}
                eyebrow={resolvedSectionContent.menu_offers?.eyebrow ?? ""}
                title={resolvedSectionContent.menu_offers?.title ?? ""}
                variant={
                  (sectionLayoutVariants?.menu_offers as
                    | "editorial-list"
                    | "grid-photos"
                    | "split-categories"
                    | undefined) ?? "editorial-list"
                }
              />
            ) : (
            <MenuOffersSection
              offers={menuOffers}
              menuHref={menuHref}
              menuPdfLabel={menuPdfLinkLabel}
              eyebrow={resolvedSectionContent.menu_offers?.eyebrow ?? ""}
              title={resolvedSectionContent.menu_offers?.title ?? ""}
            />
            )}
          </div>
        ) : null}

        {!isLandingPage && showCredibility ? (
          <div style={{ order: sectionOrderIndex("reviews") }}>
            <CredibilitySection
              data={credibilityData}
              copy={{
                googleReviewsSuffix: resolvedSectionContent.reviews?.googleReviewsSuffix ?? "",
                googleCtaLabel: resolvedSectionContent.reviews?.googleCtaLabel ?? "",
                pressHeading: resolvedSectionContent.reviews?.pressHeading ?? "",
                tripAdvisorLabel: resolvedSectionContent.reviews?.tripAdvisorLabel ?? "",
              }}
            />
          </div>
        ) : null}

        {!isLandingPage && blockEnabled("gallery") && galleryImageUrls.length > 0 ? (
          <div style={{ order: sectionOrderIndex("gallery") }}>
            {usePremiumChrome ? (
              <PremiumDarkMasonryGallery
                images={galleryImageUrls}
                eyebrow={resolvedSectionContent.gallery?.eyebrow ?? ""}
                title={resolvedSectionContent.gallery?.title ?? ""}
                instagramUrl={instagramUrl}
                showInstagram={showInstagram}
                instagramLinkLabel={resolvedSectionContent.gallery?.instagramLinkLabel ?? ""}
                variant={
                  (sectionLayoutVariants?.gallery as "masonry" | "grid-uniform" | "showcase-row" | undefined) ??
                  "masonry"
                }
              />
            ) : (
            <PremiumGallery
              images={galleryImageUrls}
              style={premium.gallery.style}
              instagramUrl={instagramUrl}
              showInstagram={showInstagram}
              eyebrow={resolvedSectionContent.gallery?.eyebrow ?? ""}
              title={
                showInstagram
                  ? (resolvedSectionContent.gallery?.titleIfInstagram ?? "")
                  : (resolvedSectionContent.gallery?.titleIfNoInstagram ?? "")
              }
              instagramLinkLabel={resolvedSectionContent.gallery?.instagramLinkLabel ?? ""}
            />
            )}
          </div>
        ) : null}

        {/* GIFT_CARDS feature flag â€” rÃ©activable */}
        {!isLandingPage && blockEnabled("gift_vouchers") ? (
          <div style={{ order: sectionOrderIndex("gift_vouchers") }}>
            <GiftVouchersSection
              content={premium.giftVouchers}
              surfaceCopy={{
                surfaceEyebrow: resolvedSectionContent.gift_vouchers?.surfaceEyebrow ?? "",
                modalEyebrow: resolvedSectionContent.gift_vouchers?.modalEyebrow ?? "",
                modalTitle: resolvedSectionContent.gift_vouchers?.modalTitle ?? "",
                submitLabel: resolvedSectionContent.gift_vouchers?.submitLabel ?? "",
                submittingLabel: resolvedSectionContent.gift_vouchers?.submittingLabel ?? "",
                successTitle: resolvedSectionContent.gift_vouchers?.successTitle ?? "",
                successBody: resolvedSectionContent.gift_vouchers?.successBody ?? "",
                fallbackTitle: resolvedSectionContent.gift_vouchers?.fallbackTitle ?? "",
                fallbackBody: resolvedSectionContent.gift_vouchers?.fallbackBody ?? "",
                fallbackCta: resolvedSectionContent.gift_vouchers?.fallbackCta ?? "",
              }}
              restaurantSlug={restaurantSlug}
              previewMode={previewMode}
              surface={pageTheme.section("gift_vouchers")}
            />
          </div>
        ) : null}

        {!isLandingPage && blockEnabled("final_cta") && reservationEnabled && conversionCta.showFinal ? (
          <div style={{ order: sectionOrderIndex("final_cta") }}>
            <PremiumFinalCta
              eyebrow={resolvedSectionContent.final_cta?.eyebrow ?? ""}
              title={effectiveConfig.blockContent.finalCta.title}
              subtitle={effectiveConfig.blockContent.finalCta.subtitle}
              buttonLabel={effectiveConfig.blockContent.finalCta.button || ctaLabel}
              phone={restaurantPhone}
              showPhone={showPhoneCta && showPhoneRow}
              onReserve={scrollToReservation}
              ctaStyle={ctaStyle}
            />
          </div>
        ) : null}
      </div>

      {isLandingPage ? (
        <>
          <ShowroomHighlights highlights={activeHighlights} />
          {blockEnabled("gallery") && showroomGalleryImages.length > 0 ? (
            <ShowroomGallery
              images={showroomGalleryImages}
              title={resolvedSectionContent.gallery?.titleIfNoInstagram ?? "L'ambiance"}
              eyebrow={resolvedSectionContent.gallery?.eyebrow ?? "Galerie"}
              tagline={taglineText || publicPageDescription?.trim() || undefined}
            />
          ) : null}
          {(menuOffers.length > 0 || menuHref) && blockEnabled("menu") ? (
            <ShowroomMenu
              offers={menuOffers}
              menuHref={menuHref}
              menuPdfLabel={menuPdfLinkLabel}
              title={resolvedSectionContent.menu_offers?.title ?? "À la carte"}
              eyebrow={resolvedSectionContent.menu_offers?.eyebrow ?? "Le menu"}
              onReserve={handleReserve}
            />
          ) : null}
          <ShowroomPractical
            address={restaurantAddress}
            phone={restaurantPhone}
            email={restaurantEmail}
            websiteUrl={websiteUrl}
            openingHoursLines={openingHoursLines}
            googleMapsUrl={googleMapsUrl}
            instagramUrl={instagramUrl}
            facebookUrl={facebookUrl}
            showAddress={practicalDisplay?.showAddress}
            showPhone={practicalDisplay?.showPhone}
            showEmail={practicalDisplay?.showEmail}
            showWebsite={practicalDisplay?.showWebsite}
            showHours={practicalDisplay?.showHours}
            showInstagram={practicalDisplay?.showInstagram}
            showFacebook={practicalDisplay?.showFacebook}
            directionsLabel={resolvedSectionContent.practical?.directionsLabel ?? "Itinéraire"}
          />
          {blockEnabled("final_cta") && reservationEnabled ? (
            <ShowroomFinalCta
              title={effectiveConfig.blockContent.finalCta.title || "Votre table vous attend"}
              subtitle={
                effectiveConfig.blockContent.finalCta.subtitle || "Réservez en quelques clics — confirmation rapide."
              }
              buttonLabel={effectiveConfig.blockContent.finalCta.button || ctaLabel}
              onReserve={handleReserve}
            />
          ) : null}
        </>
      ) : null}

      <StickyReserveBar
        label={ctaLabel}
        onClick={handleReserve}
        visible={
          isLandingPage
            ? !previewMode && reservationEnabled && blockEnabled("reservation") && !showroomReserveOpen
            : !previewMode &&
              conversionCta.showSticky &&
              reservationEnabled &&
              blockEnabled("reservation")
        }
        previewMode={previewMode}
        scrollSmart={isLandingPage}
      />

      {blockEnabled("location") && !isLandingPage ? (
        <PremiumPracticalInfo
          address={restaurantAddress}
          phone={restaurantPhone}
          email={restaurantEmail}
          websiteUrl={websiteUrl}
          openingHoursLines={openingHoursLines}
          googleMapsUrl={googleMapsUrl}
          parking={premium.practical.parking}
          accessibility={premium.practical.accessibility}
          instagramUrl={instagramUrl}
          facebookUrl={facebookUrl}
          tiktokUrl={tiktokUrl}
          display={practicalDisplay}
          copy={{
              eyebrow: resolvedSectionContent.practical?.eyebrow ?? "",
              title: resolvedSectionContent.practical?.title ?? "",
              labelAddress: resolvedSectionContent.practical?.labelAddress ?? "",
              labelPhone: resolvedSectionContent.practical?.labelPhone ?? "",
              labelHours: resolvedSectionContent.practical?.labelHours ?? "",
              labelParking: resolvedSectionContent.practical?.labelParking ?? "",
              labelAccessibility: resolvedSectionContent.practical?.labelAccessibility ?? "",
              directionsLabel: resolvedSectionContent.practical?.directionsLabel ?? "",
            }}
        />
      ) : null}
    </div>
  );
}

/** Enveloppe landing (drawer) vs site legacy (inline) — sans dupliquer le wizard */
function ReservationWizardShell({
  landing,
  drawerOpen,
  onClose,
  sectionOrder,
  children,
}: {
  landing: boolean;
  drawerOpen: boolean;
  onClose: () => void;
  sectionOrder: number;
  children: React.ReactNode;
}) {
  if (landing) {
    return (
      <ShowroomReservationDrawer open={drawerOpen} onClose={onClose} title="Réserver une table">
        <div id="reservation">{children}</div>
      </ShowroomReservationDrawer>
    );
  }
  return (
    <div id="reservation" style={{ order: sectionOrder }}>
      {children}
    </div>
  );
}

