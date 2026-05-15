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
import type { AvailabilitySlot } from "@/src/lib/reservation/schemas";
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
  reservationSectionTitle,
  resolveEffectiveSectionOrder,
} from "@/src/lib/public-page/conversion";
import { openStatusLabel } from "@/src/lib/public-page/opening-status";
import {
  hasCredibilityContent,
  visibleEditorialSections,
  visibleMenuOffers,
} from "@/src/lib/public-page/premium-content";
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

export type PublicReservationFormProps = {
  previewMode?: boolean;
  restaurantId: string;
  /** Slug URL publique `/r/[slug]` — requis pour les demandes de bons cadeaux. */
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
  websiteUrl?: string | null;
  googleMapsUrl?: string | null;
  preBookingMessage?: string | null;
  closureStartDate?: string | null;
  closureEndDate?: string | null;
  closureMessage?: string | null;
  /** Si vrai, le client doit choisir salle ou terrasse (paramètres restaurant). */
  terraceEnabled?: boolean;
  /** Mode réservation canonique (2 modes uniquement). */
  reservationMode?: "simple" | "floor_plan";
  /** Mode public en plan de salle. */
  publicFloorPlanSelectionMode?: "automatic" | "area" | "table";
  /** Abonnement (pour désactiver le plan de salle en Starter). */
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
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
  websiteUrl,
  googleMapsUrl,
  preBookingMessage,
  closureStartDate,
  closureEndDate,
  closureMessage,
  terraceEnabled = false,
  reservationMode = "simple",
  publicFloorPlanSelectionMode = "automatic",
  subscriptionPlan = "starter",
  subscriptionStatus = "active",
}: PublicReservationFormProps) {
  const todayDate = useMemo(() => localYmd(new Date()), []);
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysInAdvance);
    return localYmd(d);
  }, [daysInAdvance]);
  const canUseProFeatures = subscriptionStatus === "trial" || subscriptionPlan === "pro";
  const effectiveReservationMode: "simple" | "floor_plan" =
    canUseProFeatures && reservationMode === "floor_plan" ? "floor_plan" : "simple";

  const resolvedPublicMode: "automatic" | "area" | "table" = publicFloorPlanSelectionMode ?? "automatic";
  const allowAreaChoice = effectiveReservationMode === "floor_plan" && resolvedPublicMode === "area";
  const canChooseTable = effectiveReservationMode === "floor_plan" && resolvedPublicMode === "table";
  const totalSteps = canChooseTable ? 5 : allowAreaChoice ? 5 : 4;
  const contactStep = canChooseTable ? 5 : allowAreaChoice ? 5 : 4;
  const [wizardStep, setWizardStep] = useState(1);
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
  const chooseTableInZone = canChooseTable;
  const datePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!terraceEnabled) return;
    if (allowAreaChoice) return;
    // Si la terrasse est activée mais que le mode public ne propose pas le choix de zone,
    // on force l'intérieur pour éviter un état bloquant.
    queueMicrotask(() => setSeatingZone("interior"));
  }, [terraceEnabled, allowAreaChoice]);

  const [clientSelectedTableId, setClientSelectedTableId] = useState<string | null>(null);
  const [tablesChoiceLoading, setTablesChoiceLoading] = useState(false);
  const [tablesChoiceError, setTablesChoiceError] = useState<string | null>(null);
  const [publicPlans, setPublicPlans] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [publicPlanId, setPublicPlanId] = useState<string | null>(null);
  const [availablePlanIds, setAvailablePlanIds] = useState<Set<string>>(new Set());
  const [tablesChoice, setTablesChoice] = useState<
    Array<{
      id: string;
      name: string;
      min_covers: number;
      max_covers: number;
      status: string;
      reserved: boolean;
      isSelectable: boolean;
    }>
  >([]);

  const selectedPublicPlan = useMemo(
    () => (publicPlanId ? publicPlans.find((p) => p.id === publicPlanId) ?? null : null),
    [publicPlans, publicPlanId],
  );
  const zoneForSelectedPlan: "interior" | "terrace" =
    selectedPublicPlan?.type === "terrace" ? "terrace" : "interior";

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

  /**
   * Source unique de vérité pour les variables visuelles :
   * `effectiveConfig.appearance` est mis à jour en temps réel par le dashboard
   * et reflète exactement ce que l'utilisateur a choisi.
   * Les props anciens (`headingFont`, `buttonBgColor`, etc.) ne sont conservés
   * que comme fallback pour les pages legacy sans editorConfig.
   */
  const appearance = effectiveConfig.appearance;
  // CTA / accent = même couleur : c'est la couleur d'action choisie par l'utilisateur.
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

  const cssVars = useMemo(
    () =>
      ({
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
      }) as React.CSSProperties,
    [
      pageTheme,
      effHeroPrimary,
      effButtonBg,
      effButtonText,
      effHeadingFont,
      effBodyFont,
      effRadius,
      fontSizeScale,
    ],
  );

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

  /* eslint-disable react-hooks/set-state-in-effect -- chargement asynchrone des créneaux et indicateurs associés */
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
        setSlotsError("Cette date dépasse la fenêtre de réservation autorisée.");
      });
      return;
    }

    if (allowAreaChoice && !seatingZone) {
      queueMicrotask(() => {
        setAvailabilitySlots([]);
        setSlotsError(null);
      });
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);

    const zone: "interior" | "terrace" = allowAreaChoice ? seatingZone! : "interior";
    const q = new URLSearchParams({
      restaurantId,
      date: reservationDate,
      covers: String(guests),
      zone,
    });

    fetch(`/api/reservations/availability?${q.toString()}`)
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          slots?: AvailabilitySlot[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Impossible de charger les créneaux.");
        }
        return payload.slots ?? [];
      })
      .then((slots) => {
        if (!cancelled) setAvailabilitySlots(slots);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAvailabilitySlots([]);
          setSlotsError(err instanceof Error ? err.message : "Impossible de charger les créneaux.");
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
    terraceEnabled,
    allowAreaChoice,
    seatingZone,
  ]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const times = new Set(availabilitySlots.map((s) => s.time));
    if (reservationTime && !times.has(reservationTime)) {
      queueMicrotask(() => setReservationTime(""));
    }
  }, [availabilitySlots, reservationTime]);

  useEffect(() => {
    if (!canChooseTable && !allowAreaChoice) return;
    // Si l'utilisateur change le créneau ou les paramètres, on réinitialise le choix table.
    queueMicrotask(() => {
      setClientSelectedTableId(null);
      setPublicPlans([]);
      setPublicPlanId(null);
      setTablesChoice([]);
      setTablesChoiceError(null);
      setAvailablePlanIds(new Set());
    });
  }, [canChooseTable, allowAreaChoice, reservationTime, reservationDate, guests, seatingZone]);

  useEffect(() => {
    if (!canChooseTable && !allowAreaChoice) return;
    if (wizardStep !== 4) return;

    let cancelled = false;
    fetch(`/api/floor-plan/plans?${new URLSearchParams({ restaurantId }).toString()}`)
      .then(async (r) => {
        const payload = (await r.json().catch(() => ({}))) as { plans?: Array<{ id: string; name: string; type: string }>; error?: string };
        if (!r.ok) throw new Error(payload.error ?? "Impossible de charger les plans.");
        return payload.plans ?? [];
      })
      .then((plans) => {
        if (cancelled) return;
        setPublicPlans(plans);
        if (!publicPlanId) {
          const indoor = plans.find((p) => p.type === "indoor") ?? plans[0];
          setPublicPlanId(indoor?.id ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setPublicPlans([]);
      });

    return () => {
      cancelled = true;
    };
  }, [canChooseTable, allowAreaChoice, wizardStep, restaurantId, publicPlanId]);

  // Mode “choix d’espace” : déterminer quels plans ont au moins une table disponible
  useEffect(() => {
    if (!allowAreaChoice) return;
    if (wizardStep !== 4) return;
    if (!reservationTime || !reservationDate) return;
    if (!guests || guests < 1) return;
    if (publicPlans.length === 0) return;

    let cancelled = false;
    (async () => {
      const checks = await Promise.all(
        publicPlans.map(async (p) => {
          const query = new URLSearchParams({
            restaurantId,
            date: reservationDate,
            time: reservationTime,
            covers: String(guests),
            zone: p.type === "terrace" ? "terrace" : "interior",
            planId: p.id,
          });
          const res = await fetch(`/api/floor-plan/tables-availability?${query.toString()}`);
          const payload = (await res.json().catch(() => ({}))) as { tables?: Array<{ isSelectable: boolean }> };
          const ok = (payload.tables ?? []).some((t) => t.isSelectable);
          return { id: p.id, ok };
        }),
      );

      if (cancelled) return;
      const next = new Set(checks.filter((c) => c.ok).map((c) => c.id));
      setAvailablePlanIds(next);
      if (!publicPlanId || !next.has(publicPlanId)) {
        const first = checks.find((c) => c.ok)?.id ?? null;
        setPublicPlanId(first);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [allowAreaChoice, wizardStep, reservationTime, reservationDate, guests, publicPlans, restaurantId, publicPlanId]);

  useEffect(() => {
    if (!chooseTableInZone) return;
    if (wizardStep !== 4) return;
    if (!reservationTime || !reservationDate) return;
    if (!guests || guests < 1) return;
    if (!publicPlanId) return;

    let cancelled = false;
    queueMicrotask(() => {
      setTablesChoiceLoading(true);
      setTablesChoiceError(null);
      setTablesChoice([]);
    });

    const query = new URLSearchParams({
      restaurantId,
      date: reservationDate,
      time: reservationTime,
      covers: String(guests),
      zone: zoneForSelectedPlan,
      planId: publicPlanId,
    });

    fetch(`/api/floor-plan/tables-availability?${query.toString()}`)
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          tables?: Array<{
            id: string;
            name: string;
            min_covers: number;
            max_covers: number;
            status: string;
            reserved: boolean;
            isSelectable: boolean;
          }>;
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error ?? "Impossible de charger les tables.");
        return payload.tables ?? [];
      })
      .then((tables) => {
        if (!cancelled) setTablesChoice(tables);
      })
      .catch((err: unknown) => {
        if (!cancelled) setTablesChoiceError(err instanceof Error ? err.message : "Erreur de chargement.");
      })
      .finally(() => {
        if (!cancelled) setTablesChoiceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    chooseTableInZone,
    wizardStep,
    reservationTime,
    reservationDate,
    guests,
    restaurantId,
    publicPlanId,
    zoneForSelectedPlan,
  ]);

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
        `${closureLabel}Le restaurant est fermé du ${closureStartDate} au ${closureEndDate}. Les réservations restent disponibles après cette période.`,
      );
      setIsSubmitting(false);
      return;
    }

    const guestName = `${guestFirstName.trim()} ${guestLastName.trim()}`.trim();
    if (!guestName) {
      setError("Le prénom et le nom sont requis.");
      setIsSubmitting(false);
      return;
    }

    if ((allowEmail ?? true) && !guestEmail.trim()) {
      setError("L’adresse e-mail est requise.");
      setIsSubmitting(false);
      return;
    }

    if ((allowEmail ?? true) && guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      setError("Adresse e-mail invalide.");
      setIsSubmitting(false);
      return;
    }

    if ((allowPhone ?? true) && !guestPhone.trim()) {
      setError("Le numéro de téléphone est requis.");
      setIsSubmitting(false);
      return;
    }

    if (guestPhone.trim() && guestPhone.trim().replace(/\D/g, "").length < 8) {
      setError("Numéro de téléphone invalide (minimum 8 chiffres).");
      setIsSubmitting(false);
      return;
    }

    if (allowAreaChoice && !publicPlanId) {
      setError("Veuillez choisir un espace.");
      setIsSubmitting(false);
      return;
    }
    if (!availabilitySlots.some((s) => s.time === reservationTime)) {
      setError("Ce créneau n'est plus disponible. Veuillez choisir une autre heure.");
      setIsSubmitting(false);
      return;
    }

    if (canChooseTable && !clientSelectedTableId) {
      setError("Choisissez une table disponible sur le plan.");
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
        ...(allowAreaChoice && publicPlanId ? { floorPlanId: publicPlanId } : {}),
        ...(canChooseTable ? { zone: zoneForSelectedPlan } : {}),
        ...(canChooseTable && clientSelectedTableId ? { tableId: clientSelectedTableId } : {}),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; status?: string };

    if (!response.ok) {
      setError(payload.error ?? "Impossible d'enregistrer votre réservation.");
      setIsSubmitting(false);
      return;
    }

    const isConfirmed = payload.status === "confirmed";
    setMessage(
      isConfirmed
        ? "Votre réservation est confirmée. Un e-mail de confirmation vous a été envoyé."
        : "Votre demande de réservation a été enregistrée. Si vous avez indiqué une adresse e-mail, un accusé de réception vous a été envoyé.",
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
      ? `Le restaurant est fermé du ${closureStartDate} au ${closureEndDate}. Les réservations restent disponibles après cette période.`
      : null;

  const headlineText = heroTitle?.trim() || restaurantName;
  const taglineText = restaurantTagline?.trim();
  const descriptionText = publicPageDescription?.trim() ?? "";
  const menuHref =
    menuUrl?.trim() ||
    (sortedDocuments[0]?.fileUrl ?? null);
  const activeHighlights = highlights.filter(Boolean).slice(0, 6);

  const openingHoursLines = formatOpeningHoursLines(openingHours);

  const showAddressRow = showPublicAddress && Boolean(restaurantAddress?.trim());
  const showPhoneRow = showPublicPhone && Boolean(restaurantPhone?.trim());
  const showEmailRow = showPublicEmail && Boolean(restaurantEmail?.trim());
  const showWebsiteRow = showPublicWebsite && Boolean(websiteUrl?.trim());
  const showMapsRow = showPublicGoogleMaps && Boolean(googleMapsUrl?.trim());
  const showHoursRow = showPublicOpeningHours;
  const showInstagram = showPublicInstagram && Boolean(instagramUrl?.trim());
  const showFacebook = showPublicFacebook && Boolean(facebookUrl?.trim());

  const hasFooterContent =
    showAddressRow ||
    showPhoneRow ||
    showEmailRow ||
    showWebsiteRow ||
    showMapsRow ||
    showHoursRow ||
    showInstagram ||
    showFacebook;

  const labelClass = "block text-xs font-semibold uppercase tracking-[0.18em]";
  const iconRing =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--footer-text)_22%,transparent)] bg-[color-mix(in_srgb,var(--footer-text)_10%,transparent)] text-[var(--footer-text)]";
  const inputClass =
    "min-h-[48px] w-full rounded-[var(--radius)] border px-4 py-3 text-sm outline-none transition focus:border-[color-mix(in_srgb,var(--accent-color)_45%,transparent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-color)_30%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]";

  const overlayOpacity = Math.min(80, Math.max(0, heroOverlayOpacity)) / 100;

  const blockEnabled = (id: PageBlockId) =>
    effectiveConfig.blocks[id]?.enabled !== false;

  const sectionOrder = resolveEffectiveSectionOrder(effectiveConfig);
  const sectionOrderIndex = (id: PageBlockId) => {
    const i = sectionOrder.indexOf(id);
    return i >= 0 ? i : 50;
  };
  const conversionCta = ctaFlags(effectiveConfig.conversion);
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
    premium.concept.title.trim() || effectiveConfig.blockContent.about.title || "Notre expérience";
  const conceptImage =
    premium.concept.imageUrl.trim() || galleryImageUrls[0] || coverImageUrl || "";

  const reservationSortIndex = sectionOrder.indexOf("reservation");
  let nextSectionPos = reservationSortIndex + 1;
  while (
    nextSectionPos < sectionOrder.length &&
    !blockEnabled(sectionOrder[nextSectionPos]!)
  ) {
    nextSectionPos += 1;
  }
  const middleCtaOrder =
    nextSectionPos < sectionOrder.length
      ? Math.floor((reservationSortIndex + nextSectionPos) / 2) + 1
      : reservationSortIndex + 2;

  const secondaryLabel =
    secondaryCtaLabel?.trim() || effectiveConfig.hero.secondaryCta || "Voir le menu";
  const menuOffers = visibleMenuOffers(premium.menuOffers);

  const heroContentClass = cn(
    "relative z-[1] flex flex-1 flex-col px-5 pt-14 pb-14 sm:px-8 sm:pb-20 md:pt-20 md:pb-24",
    heroLayout === "overlay" ? "justify-end" : "justify-center",
    heroAlign === "left" || heroLayout === "left"
      ? "items-start text-left"
      : heroAlign === "right"
        ? "items-end text-right"
        : "items-center text-center",
  );

  return (
    <div
      className={cn(
        previewMode ? "relative min-h-0 w-full" : "min-h-screen",
        "[font-size:calc(16px*var(--font-scale))]",
        !previewMode && conversionCta.showSticky && reservationEnabled && "pb-24 md:pb-0",
      )}
      style={{
        ...cssVars,
        backgroundColor: "var(--page-bg)",
        color: "var(--body-text)",
        fontFamily: "var(--body-font), system-ui, sans-serif",
      }}
    >
      <PublicPageNav
        restaurantName={restaurantName}
        ctaLabel={ctaLabel}
        onReserve={scrollToReservation}
        visible={premium.navigationEnabled}
        previewMode={previewMode}
        showGiftVouchers={blockEnabled("gift_vouchers")}
      />

      <PremiumHero
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
        showSecondary={Boolean(menuHref && effectiveConfig.hero.secondaryCtaEnabled)}
        onReserve={scrollToReservation}
        ctaStyle={ctaStyle}
        overlayOpacity={heroOverlayEnabled ? overlayOpacity : 0}
        heroAlign={heroLayout === "left" ? "left" : heroAlign}
        heroLayout={heroLayout}
        heroHeight={heroHeight}
        previewMode={previewMode}
      />

      {specialMessage?.trim() ? (
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

      <div className="flex w-full flex-col">

        {blockEnabled("highlights") && activeHighlights.length > 0 ? (
          <div style={{ order: sectionOrderIndex("highlights") }}>
            <HighlightsBand items={activeHighlights} />
          </div>
        ) : null}

        {blockEnabled("about") && premium.concept.enabled ? (
          <div style={{ order: sectionOrderIndex("about") }}>
            <ConceptSection
              title={conceptTitle}
              body={conceptBody}
              imageUrl={conceptImage || undefined}
              pillars={premium.concept.pillars}
              eyebrow={effectiveConfig.conversion.structureTemplate === "event_venue" ? "Notre maison" : "Le concept"}
              layout={
                effectiveConfig.conversion.structureTemplate === "modern_brasserie" ||
                effectiveConfig.conversion.structureTemplate === "minimal_conversion"
                  ? "stacked"
                  : effectiveConfig.conversion.structureTemplate === "warm_restaurant"
                    ? "image-left"
                    : "image-right"
              }
            />
            {visibleEditorialSections(premium.editorialSections).map((section, idx) => (
              <EditorialBlock
                key={section.id}
                section={section}
                previewMode={previewMode}
                eyebrow={
                  idx === 0
                    ? "Notre histoire"
                    : idx === 1
                      ? "Notre cuisine"
                      : "L'expérience"
                }
              />
            ))}
          </div>
        ) : null}

        {blockEnabled("menu") && sortedDocuments.length > 0 && !menuHref ? (
          <section
            className={cn(
              "rounded-[var(--radius)] border px-5 py-6 md:px-8",
              effCardStyle === "elevated" && "shadow-md",
            )}
            style={{
              backgroundColor: "color-mix(in srgb, var(--body-text) 6%, var(--page-bg))",
              borderColor: "color-mix(in srgb, var(--body-text) 14%, var(--page-bg))",
              order: sectionOrderIndex("menu"),
            }}
          >
            <h2
              className="text-center text-lg font-semibold md:text-left"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              Cartes & menus
            </h2>
            <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
              {sortedDocuments.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius)] border-2 px-5 py-2 text-sm font-semibold transition hover:opacity-90"
                  style={{
                    borderColor: "var(--accent-color)",
                    color: "var(--accent-color)",
                    backgroundColor: "transparent",
                  }}
                >
                  {doc.label}
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {blockEnabled("reservation") && reservationEnabled ? (
        <div style={{ order: sectionOrderIndex("reservation") }}>
        <PremiumReservationSection
          title={reservationSectionTitle()}
          intro={effectiveConfig.reservation.intro}
          groupMessage={premium.reservation.groupMessage}
          showPhoneAlt={showPhoneCta && showPhoneRow}
          phone={restaurantPhone}
        >
            {showHoursBeforeForm && showHoursRow ? (
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
                  {closureMessage?.trim() ? `${closureMessage.trim()} — ${closureNotice}` : closureNotice}
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

              <nav aria-label="Étapes" className="w-full px-1">
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
                {wizardStep === 1 ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={previewMode || !todaySelectable}
                          onClick={() => setReservationDate(todayDate)}
                          className={cn(
                            "min-h-[48px] flex-1 rounded-[var(--radius)] border-2 px-2 py-3 text-xs font-semibold tracking-wide transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 sm:text-sm",
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
                            "min-h-[48px] flex-1 rounded-[var(--radius)] border-2 px-2 py-3 text-xs font-semibold tracking-wide transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 sm:text-sm",
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
                            "flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-[var(--radius)] border-2 transition active:scale-[0.99] disabled:opacity-40",
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
                        {reservationDate ? formatDateDdMmYyyy(reservationDate) : "—"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {wizardStep === 2 ? (
                  <div className="flex flex-col gap-6">
                    {allowAreaChoice && terraceEnabled ? (
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
                            Intérieur
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
                            onClick={() => setGuests(n)}
                            className={cn(
                              "min-h-[48px] rounded-[var(--radius)] border-2 text-base font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
                              guests === n ? "border-transparent shadow-sm" : "bg-transparent",
                            )}
                            style={
                              guests === n
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
                      <p
                        className="text-center text-xs leading-snug sm:text-sm"
                        style={{ color: "color-mix(in srgb, var(--body-text) 62%, var(--page-bg))" }}
                      >
                        {`Veuillez nous appeler pour les groupes de plus de ${effectiveMaxParty} personnes.`}
                      </p>
                    </div>
                  </div>
                ) : null}

                {wizardStep === 3 ? (
                  <div className="flex flex-col gap-4">
                    {slotsLoading ? (
                      <p className="text-center text-sm" style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}>
                        Chargement des créneaux…
                      </p>
                    ) : slotsError ? (
                      <p className="text-center text-sm text-amber-800">{slotsError}</p>
                    ) : slotTimes.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <p
                          className="text-center text-sm"
                          style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}
                        >
                          {noSlotsMessage?.trim() || "Aucun créneau disponible pour cette date."}
                        </p>
                        <button
                          type="button"
                          className="text-sm font-semibold underline-offset-4 hover:underline"
                          style={{ color: "var(--accent-color)" }}
                          onClick={() => setWizardStep(1)}
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
                              "min-h-[48px] rounded-[var(--radius)] border-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40",
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

                {allowAreaChoice && !canChooseTable && wizardStep === 4 ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-center text-sm font-medium" style={{ color: "var(--heading-color)" }}>
                        Choisissez votre espace
                      </p>
                      <p
                        className="text-center text-xs"
                        style={{ color: "color-mix(in srgb, var(--body-text) 62%, var(--page-bg))" }}
                      >
                        Seuls les espaces avec au moins une table disponible sont proposés.
                      </p>
                    </div>

                    {publicPlans.length === 0 ? (
                      <p
                        className="text-center text-sm"
                        style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}
                      >
                        Chargement des espaces…
                      </p>
                    ) : availablePlanIds.size === 0 ? (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <p
                          className="text-center text-sm"
                          style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}
                        >
                          Aucune table disponible pour ce créneau.
                        </p>
                        <button
                          type="button"
                          className="text-sm font-semibold underline-offset-4 hover:underline"
                          style={{ color: "var(--accent-color)" }}
                          onClick={() => setWizardStep(3)}
                        >
                          Choisir un autre horaire
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {publicPlans
                          .filter((p) => availablePlanIds.has(p.id))
                          .map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              disabled={previewMode}
                              onClick={() => setPublicPlanId(p.id)}
                              className={cn(
                                "min-h-[52px] rounded-[var(--radius)] border-2 px-4 py-3 text-base font-semibold transition active:scale-[0.99] disabled:opacity-40",
                                publicPlanId === p.id ? "border-transparent shadow-sm" : "bg-transparent",
                              )}
                              style={
                                publicPlanId === p.id
                                  ? {
                                      backgroundColor: "var(--button-bg)",
                                      color: "var(--button-text)",
                                      borderColor: "var(--button-bg)",
                                    }
                                  : {
                                      borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                      color: "color-mix(in srgb, var(--body-text) 85%, var(--page-bg))",
                                    }
                              }
                            >
                              {p.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {canChooseTable && wizardStep === 4 ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-center text-sm font-medium" style={{ color: "var(--heading-color)" }}>
                        Choisissez votre table
                      </p>
                      <p className="text-center text-xs" style={{ color: "color-mix(in srgb, var(--body-text) 62%, var(--page-bg))" }}>
                        Les tables réservées et bloquées sont visibles mais non sélectionnables.
                      </p>
                    </div>

                    {publicPlans.length > 1 ? (
                      <div className="flex flex-wrap justify-center gap-2">
                        {publicPlans.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            disabled={previewMode}
                            onClick={() => {
                              setPublicPlanId(p.id);
                              setClientSelectedTableId(null);
                            }}
                            className={cn(
                              "min-h-[44px] rounded-[var(--radius)] border-2 px-4 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-40",
                              publicPlanId === p.id ? "border-transparent shadow-sm" : "bg-transparent",
                            )}
                            style={
                              publicPlanId === p.id
                                ? { backgroundColor: "var(--button-bg)", color: "var(--button-text)", borderColor: "var(--button-bg)" }
                                : {
                                    borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                                    color: "color-mix(in srgb, var(--body-text) 85%, var(--page-bg))",
                                  }
                            }
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {tablesChoiceLoading ? (
                      <p
                        className="text-center text-sm"
                        style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}
                      >
                        Chargement du plan…
                      </p>
                    ) : tablesChoiceError ? (
                      <p className="text-center text-sm text-amber-800">{tablesChoiceError}</p>
                    ) : tablesChoice.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <p
                          className="text-center text-sm"
                          style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}
                        >
                          Aucune table disponible pour ce créneau.
                        </p>
                        <button
                          type="button"
                          className="text-sm font-semibold underline-offset-4 hover:underline"
                          style={{ color: "var(--accent-color)" }}
                          onClick={() => setWizardStep(3)}
                        >
                          Choisir un autre horaire
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                        {tablesChoice.map((t) => {
                          const isSelected = clientSelectedTableId === t.id;
                          const isDisabled = previewMode || !t.isSelectable;

                          let border = "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))";
                          let bg = "transparent";
                          let text = "color-mix(in srgb, var(--body-text) 82%, var(--page-bg))";
                          let overlayText = "";

                          if (t.status === "blocked") {
                            border = "color-mix(in srgb, #ef4444 45%, transparent)";
                            bg = "color-mix(in srgb, #ef4444 10%, transparent)";
                            text = "#ef4444";
                            overlayText = "Bloquée";
                          } else if (t.reserved) {
                            border = "color-mix(in srgb, #f59e0b 45%, transparent)";
                            bg = "color-mix(in srgb, #f59e0b 10%, transparent)";
                            text = "#b45309";
                            overlayText = "Réservée";
                          }

                          if (isSelected) {
                            border = "var(--accent-color)";
                            bg = "color-mix(in srgb, var(--accent-color) 12%, transparent)";
                          }

                          return (
                            <button
                              key={t.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => setClientSelectedTableId(t.id)}
                              className="min-h-[52px] rounded-[var(--radius)] border-2 px-3 py-2 text-left transition active:scale-[0.99] disabled:opacity-40"
                              style={{
                                borderColor: isSelected ? "var(--accent-color)" : border,
                                backgroundColor: bg,
                                color: text,
                              }}
                            >
                              <div className="text-sm font-semibold">{t.name}</div>
                              <div className="mt-1 text-xs font-semibold" style={{ opacity: 0.7 }}>
                                {t.min_covers}–{t.max_covers} pers.
                              </div>
                              {overlayText ? <div className="mt-1 text-[11px] font-semibold">{overlayText}</div> : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                {wizardStep === contactStep ? (
                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="guest-first-name"
                          className={labelClass}
                          style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}
                        >
                          Prénom
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
                        Téléphone
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

                {wizardStep < totalSteps ? (
                  <button
                    type="button"
                    disabled={
                      previewMode ||
                      (wizardStep === 1 &&
                        (!reservationDate || isDateInClosurePeriod || reservationDate > maxDateStr)) ||
                      (wizardStep === 2 &&
                        (guests < 1 || isDateInClosurePeriod)) ||
                      (wizardStep === 3 && !reservationTime) ||
                      (wizardStep === 4 && canChooseTable && !clientSelectedTableId) ||
                      (wizardStep === 4 && allowAreaChoice && !canChooseTable && !publicPlanId)
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
                    {isSubmitting ? "Envoi en cours…" : "Confirmer la réservation"}
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
        </div>
        ) : showPhoneCta && showPhoneRow ? (
        <section id="reservation" className="scroll-mt-24">
          <div className={cardShell} style={{ backgroundColor: "color-mix(in srgb, var(--body-text) 7%, var(--page-bg))", borderColor: "color-mix(in srgb, var(--body-text) 14%, var(--page-bg))" }}>
            <h2 className="text-2xl font-medium" style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}>Réserver</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--body-text)" }}>Les réservations en ligne sont désactivées. Appelez-nous pour réserver.</p>
            <a href={`tel:${restaurantPhone!.replace(/\s/g, "")}`} className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius)] px-6 text-sm font-semibold" style={{ backgroundColor: "var(--button-bg)", color: "var(--button-text)" }}>
              <Phone className="mr-2 h-4 w-4" /> {restaurantPhone}
            </a>
          </div>
        </section>
        ) : null}

        {blockEnabled("menu") && (menuHref || menuOffers.length > 0) ? (
          <div style={{ order: sectionOrderIndex("menu") }}>
            <MenuOffersSection
              offers={menuOffers}
              menuHref={menuHref}
              menuPdfLabel={sortedDocuments[0]?.label ?? secondaryLabel}
              eyebrow={
                effectiveConfig.conversion.structureTemplate === "event_venue"
                  ? "Formules & menus"
                  : effectiveConfig.conversion.structureTemplate === "modern_brasserie"
                    ? "À la carte"
                    : "Carte & offres"
              }
              title={
                effectiveConfig.conversion.structureTemplate === "event_venue"
                  ? "Nos formules"
                  : effectiveConfig.conversion.structureTemplate === "minimal_conversion"
                    ? "Le menu"
                    : "Notre menu"
              }
            />
          </div>
        ) : null}

        {showCredibility ? (
          <div style={{ order: sectionOrderIndex("reviews") }}>
            <CredibilitySection data={credibilityData} />
          </div>
        ) : null}

        {blockEnabled("gallery") && galleryImageUrls.length > 0 ? (
          <div style={{ order: sectionOrderIndex("gallery") }}>
            <PremiumGallery
              images={galleryImageUrls}
              style={premium.gallery.style}
              instagramUrl={instagramUrl}
              showInstagram={showInstagram}
              eyebrow={
                effectiveConfig.conversion.structureTemplate === "premium_experience"
                  ? "Galerie"
                  : effectiveConfig.conversion.structureTemplate === "warm_restaurant"
                    ? "Ambiance"
                    : effectiveConfig.conversion.structureTemplate === "event_venue"
                      ? "Nos espaces"
                      : "En images"
              }
            />
          </div>
        ) : null}

        {blockEnabled("gift_vouchers") ? (
          <div style={{ order: sectionOrderIndex("gift_vouchers") }}>
            <GiftVouchersSection
              content={premium.giftVouchers}
              restaurantSlug={restaurantSlug}
              previewMode={previewMode}
              surface={pageTheme.section("gift_vouchers")}
            />
          </div>
        ) : null}

        {blockEnabled("final_cta") && reservationEnabled && conversionCta.showFinal ? (
          <div style={{ order: sectionOrderIndex("final_cta") }}>
            <PremiumFinalCta
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

      <StickyReserveBar
        label={ctaLabel}
        onClick={scrollToReservation}
        visible={!previewMode && conversionCta.showSticky && reservationEnabled && blockEnabled("reservation")}
      />

      {blockEnabled("location") && hasFooterContent ? (
        <>
          <PremiumPracticalInfo
            address={showAddressRow ? restaurantAddress : null}
            phone={showPhoneRow ? restaurantPhone : null}
            openingHoursLines={showHoursRow ? openingHoursLines : []}
            googleMapsUrl={googleMapsUrl}
            parking={premium.practical.parking}
            accessibility={premium.practical.accessibility}
            showMaps={showMapsRow}
          />
          {(showInstagram || showFacebook) && blockEnabled("social") ? (
            <div className="py-10">
              <div className="mx-auto flex max-w-7xl justify-center gap-4 px-5">
                {showInstagram ? (
                  <a href={instagramUrl!} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-70 transition hover:opacity-100">
                    <Instagram className="h-6 w-6" />
                  </a>
                ) : null}
                {showFacebook ? (
                  <a href={facebookUrl!} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="opacity-70 transition hover:opacity-100">
                    <Facebook className="h-6 w-6" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
