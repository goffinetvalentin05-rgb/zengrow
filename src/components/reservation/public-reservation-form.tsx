"use client";

import { FormEvent, Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Mail,
  Map,
  MapPin,
  Phone,
} from "lucide-react";
import Input from "@/src/components/ui/input";
import type { AvailabilitySlot } from "@/src/lib/reservation/schemas";
import { cn, formatOpeningHoursLines, OpeningHours } from "@/src/lib/utils";

export type PublicReservationFormProps = {
  previewMode?: boolean;
  restaurantId: string;
  restaurantName: string;
  restaurantTagline?: string | null;
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
  useTables: boolean;
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

function heroMinHeightClass(h: "compact" | "normal" | "tall") {
  if (h === "compact") return "min-h-[38vh] max-h-[440px]";
  if (h === "tall") return "min-h-[min(72vh,820px)]";
  return "min-h-[min(56vh,620px)]";
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
  restaurantName,
  restaurantTagline,
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
  useTables,
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
}: PublicReservationFormProps) {
  const todayDate = useMemo(() => localYmd(new Date()), []);
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysInAdvance);
    return localYmd(d);
  }, [daysInAdvance]);
  const totalSteps = terraceEnabled ? 4 : 3;
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
  const [zoneSlots, setZoneSlots] = useState<{ interior: AvailabilitySlot[]; terrace: AvailabilitySlot[] }>({
    interior: [],
    terrace: [],
  });
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [seatingZone, setSeatingZone] = useState<"interior" | "terrace" | null>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);

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

  const unionSlotTimes = useMemo(() => {
    if (terraceEnabled) {
      const set = new Set<string>();
      for (const s of zoneSlots.interior) set.add(s.time);
      for (const s of zoneSlots.terrace) set.add(s.time);
      return [...set].sort((a, b) => a.localeCompare(b));
    }
    return zoneSlots.interior.map((s) => s.time).sort((a, b) => a.localeCompare(b));
  }, [terraceEnabled, zoneSlots]);

  const slotsForSelectedZone = useMemo(() => {
    if (terraceEnabled) {
      if (seatingZone === "terrace") return zoneSlots.terrace;
      if (seatingZone === "interior") return zoneSlots.interior;
      return [];
    }
    return zoneSlots.interior;
  }, [terraceEnabled, seatingZone, zoneSlots]);

  const cssVars = useMemo(
    () =>
      ({
        "--page-bg": pageBackgroundColor,
        "--hero-primary": heroPrimaryColor,
        "--accent-color": accentColor,
        "--button-bg": buttonBgColor,
        "--button-text": buttonTextColor,
        "--heading-color": headingTextColor,
        "--body-text": bodyTextColor,
        "--footer-bg": footerBgColor,
        "--footer-text": footerTextColor,
        "--heading-font": `"${headingFont}", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
        "--body-font": `"${bodyFont}", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
        "--radius": borderRadius === "sharp" ? "0px" : borderRadius === "pill" ? "999px" : "8px",
        "--font-scale": fontSizeScale === "small" ? "0.92" : fontSizeScale === "large" ? "1.08" : "1",
      }) as React.CSSProperties,
    [
      accentColor,
      bodyFont,
      bodyTextColor,
      borderRadius,
      buttonBgColor,
      buttonTextColor,
      fontSizeScale,
      footerBgColor,
      footerTextColor,
      headingFont,
      headingTextColor,
      heroPrimaryColor,
      pageBackgroundColor,
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
        cardStyle === "elevated" && "shadow-[0_32px_100px_-48px_rgba(0,0,0,0.35)]",
        cardStyle === "flat" && "shadow-none",
        cardStyle === "bordered" && "shadow-none",
      ),
    [cardStyle],
  );

  const ctaStyle = useMemo(() => {
    const base =
      "inline-flex min-h-[48px] w-auto min-w-[220px] max-w-md items-center justify-center rounded-[var(--radius)] px-8 text-sm font-semibold tracking-wide transition duration-300 active:scale-[0.98] sm:min-h-[52px]";
    if (buttonStyle === "ghost") {
      return {
        className: cn(base, "bg-transparent"),
        style: { color: "var(--button-bg)", border: "1px solid transparent" } as React.CSSProperties,
      };
    }
    if (buttonStyle === "outlined") {
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
  }, [buttonStyle]);

  useEffect(() => {
    if (previewMode) return;
    if (
      !reservationDate ||
      guests < 1 ||
      (closureStartDate && closureEndDate && reservationDate >= closureStartDate && reservationDate <= closureEndDate)
    ) {
      setZoneSlots({ interior: [], terrace: [] });
      setSlotsError(null);
      return;
    }

    if (reservationDate > maxDateStr) {
      setZoneSlots({ interior: [], terrace: [] });
      setSlotsError("Cette date dépasse la fenêtre de réservation autorisée.");
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);

    const loadZone = async (zone: "interior" | "terrace") => {
      const q = new URLSearchParams({
        restaurantId,
        date: reservationDate,
        covers: String(guests),
        zone,
      });
      const response = await fetch(`/api/reservations/availability?${q.toString()}`);
      const payload = (await response.json().catch(() => ({}))) as {
        slots?: AvailabilitySlot[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de charger les créneaux.");
      }
      return payload.slots ?? [];
    };

    const run = terraceEnabled
      ? Promise.all([loadZone("interior"), loadZone("terrace")]).then(([interior, terrace]) => {
          if (!cancelled) setZoneSlots({ interior, terrace });
        })
      : loadZone("interior").then((interior) => {
          if (!cancelled) setZoneSlots({ interior, terrace: [] });
        });

    run
      .catch((err: unknown) => {
        if (!cancelled) {
          setZoneSlots({ interior: [], terrace: [] });
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
  ]);

  useEffect(() => {
    const times = new Set(unionSlotTimes);
    if (reservationTime && !times.has(reservationTime)) {
      setReservationTime("");
    }
  }, [unionSlotTimes, reservationTime]);

  useEffect(() => {
    if (!terraceEnabled || !seatingZone) return;
    const times = new Set(slotsForSelectedZone.map((s) => s.time));
    if (reservationTime && !times.has(reservationTime)) {
      setReservationTime("");
    }
  }, [terraceEnabled, seatingZone, slotsForSelectedZone, reservationTime]);

  useEffect(() => {
    setGuests((g) => Math.min(Math.max(1, g), effectiveMaxParty));
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
        `${closureLabel}Le restaurant est ferme du ${closureStartDate} au ${closureEndDate}. Les reservations restent disponibles apres cette periode.`,
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

    if (terraceEnabled) {
      if (!seatingZone) {
        setError("Veuillez choisir un emplacement (intérieur ou terrasse).");
        setIsSubmitting(false);
        return;
      }
      const okTime = slotsForSelectedZone.some((s) => s.time === reservationTime);
      if (!okTime) {
        setError("Ce créneau n'est pas disponible pour la zone choisie. Modifiez l'heure ou l'emplacement.");
        setIsSubmitting(false);
        return;
      }
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
        ...(terraceEnabled && seatingZone ? { zone: seatingZone } : {}),
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
        : "Votre demande de réservation a été enregistrée. Nous la confirmerons rapidement.",
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
      ? `Le restaurant est ferme du ${closureStartDate} au ${closureEndDate}. Les reservations restent disponibles apres cette periode.`
      : null;

  const taglineText = restaurantTagline?.trim();
  const descriptionText = publicPageDescription?.trim() ?? "";

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

  return (
    <div
      className="min-h-screen [font-size:calc(16px*var(--font-scale))]"
      style={{
        ...cssVars,
        backgroundColor: "var(--page-bg)",
        color: "var(--body-text)",
        fontFamily: "var(--body-font), system-ui, sans-serif",
      }}
    >
      <section className={cn("relative flex w-full flex-col overflow-hidden", heroMinHeightClass(heroHeight))}>
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, var(--hero-primary) 0%, color-mix(in srgb, var(--body-text) 12%, var(--hero-primary)) 100%)`,
            }}
            aria-hidden
          />
        )}

        {heroOverlayEnabled ? (
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
            aria-hidden
          />
        ) : null}

        <div
          className="absolute inset-0 bg-gradient-to-t from-[color:var(--page-bg)] via-transparent to-transparent opacity-90"
          aria-hidden
        />

        <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-5 pt-16 pb-20 text-center sm:px-8 sm:pb-24 md:pt-20 md:pb-28">
          {logoUrl ? (
            <div className="relative mb-6 h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius)] border border-white/25 bg-white/10 p-1 shadow-lg backdrop-blur-sm sm:mb-8 sm:h-24 sm:w-24">
              <Image
                src={logoUrl}
                alt=""
                fill
                className="object-contain p-1"
                sizes="96px"
                unoptimized
              />
            </div>
          ) : null}

          <p
            className="mb-3 text-[11px] font-medium uppercase tracking-[0.35em]"
            style={{ fontFamily: "var(--body-font)", color: "var(--accent-color)" }}
          >
            Réservation en ligne
          </p>
          <h1
            className="max-w-4xl text-balance font-semibold leading-[1.08] tracking-tight"
            style={{
              fontFamily: "var(--heading-font), Georgia, serif",
              color: headingTextColor,
              fontSize: `clamp(1.75rem, 5vw, ${Math.min(72, Math.max(32, heroTitleSizePx))}px)`,
            }}
          >
            {restaurantName}
          </h1>
          {taglineText ? (
            <p
              className="mx-auto mt-4 max-w-2xl text-pretty text-base font-light leading-relaxed sm:mt-5 sm:text-lg"
              style={{ color: "color-mix(in srgb, var(--heading-color) 88%, transparent)" }}
            >
              {taglineText}
            </p>
          ) : null}

          <button
            type="button"
            onClick={scrollToReservation}
            className={cn(ctaStyle.className, "mt-10 shrink-0 sm:mt-12")}
            style={ctaStyle.style}
          >
            {ctaLabel}
          </button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6 md:px-10 lg:px-12 lg:py-16">
        {sortedDocuments.length > 0 ? (
          <section
            className={cn(
              "rounded-[var(--radius)] border px-5 py-6 md:px-8",
              cardStyle === "elevated" && "shadow-md",
            )}
            style={{
              backgroundColor: "color-mix(in srgb, var(--body-text) 6%, var(--page-bg))",
              borderColor: "color-mix(in srgb, var(--body-text) 14%, var(--page-bg))",
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

        {descriptionText ? (
          <PublicDescription text={descriptionText} bodyColor={bodyTextColor} accentColor={accentColor} />
        ) : null}

        <section id="reservation" className="scroll-mt-24">
          <div
            className={cardShell}
            style={{
              backgroundColor: "color-mix(in srgb, var(--body-text) 7%, var(--page-bg))",
              borderColor: "color-mix(in srgb, var(--body-text) 14%, var(--page-bg))",
            }}
          >
            <div className="mb-6 text-center md:text-left">
              <h2
                className="text-2xl font-medium md:text-3xl"
                style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
              >
                Réserver une table
              </h2>
            </div>

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

                    <div className="flex flex-col gap-3">
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

                {wizardStep === 2 ? (
                  <div className="flex flex-col gap-4">
                    {slotsLoading ? (
                      <p className="text-center text-sm" style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}>
                        Chargement des créneaux…
                      </p>
                    ) : slotsError ? (
                      <p className="text-center text-sm text-amber-800">{slotsError}</p>
                    ) : unionSlotTimes.length === 0 ? (
                      <p className="text-center text-sm" style={{ color: "color-mix(in srgb, var(--body-text) 70%, var(--page-bg))" }}>
                        Aucun créneau disponible pour cette date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {unionSlotTimes.map((t) => (
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

                {wizardStep === 3 && terraceEnabled ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={previewMode}
                      onClick={() => setSeatingZone("interior")}
                      className={cn(
                        "flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-[var(--radius)] border-2 px-4 py-6 text-lg font-semibold transition active:scale-[0.99] disabled:opacity-40",
                        seatingZone === "interior" ? "border-transparent shadow-md" : "bg-transparent",
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
                      <span className="text-3xl" aria-hidden>
                        🪑
                      </span>
                      Intérieur
                    </button>
                    <button
                      type="button"
                      disabled={previewMode}
                      onClick={() => setSeatingZone("terrace")}
                      className={cn(
                        "flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-[var(--radius)] border-2 px-4 py-6 text-lg font-semibold transition active:scale-[0.99] disabled:opacity-40",
                        seatingZone === "terrace" ? "border-transparent shadow-md" : "bg-transparent",
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
                      <span className="text-3xl" aria-hidden>
                        ☀️
                      </span>
                      Terrasse
                    </button>
                  </div>
                ) : null}

                {wizardStep === totalSteps ? (
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
                        (!reservationDate || guests < 1 || isDateInClosurePeriod || reservationDate > maxDateStr)) ||
                      (wizardStep === 2 && !reservationTime) ||
                      (wizardStep === 3 && terraceEnabled && !seatingZone)
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
                      ...(buttonStyle === "ghost"
                        ? { backgroundColor: "transparent", color: "var(--button-bg)" }
                        : buttonStyle === "outlined"
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
          </div>
        </section>

        {galleryImageUrls.length > 0 ? (
          <div>
            <h2
              className="mb-6 text-center text-2xl font-medium md:text-left md:text-3xl"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              Galerie
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {galleryImageUrls.map((src) => (
                <div
                  key={src}
                  className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]"
                  style={{ backgroundColor: "color-mix(in srgb, var(--body-text) 7%, var(--page-bg))" }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {hasFooterContent ? (
        <footer
          className="mt-4 border-t px-4 py-12 sm:px-8"
          style={{
            backgroundColor: "var(--footer-bg)",
            color: "var(--footer-text)",
            borderColor: "color-mix(in srgb, var(--footer-text) 15%, transparent)",
          }}
        >
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Contact</p>
              <div className="space-y-4">
                {showAddressRow ? (
                  <div className="flex gap-3">
                    <span className={iconRing}>
                      <MapPin className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide opacity-70">Adresse</p>
                      <p className="mt-1 text-sm leading-snug break-words">{restaurantAddress}</p>
                    </div>
                  </div>
                ) : null}
                {showPhoneRow ? (
                  <div className="flex gap-3">
                    <span className={iconRing}>
                      <Phone className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide opacity-70">Téléphone</p>
                      <a
                        href={`tel:${restaurantPhone!.replace(/\s/g, "")}`}
                        className="mt-1 block text-sm font-medium underline-offset-2 hover:underline"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {restaurantPhone}
                      </a>
                    </div>
                  </div>
                ) : null}
                {showEmailRow ? (
                  <div className="flex gap-3">
                    <span className={iconRing}>
                      <Mail className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide opacity-70">E-mail</p>
                      <a
                        href={`mailto:${restaurantEmail}`}
                        className="mt-1 block break-all text-sm font-medium underline-offset-2 hover:underline"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {restaurantEmail}
                      </a>
                    </div>
                  </div>
                ) : null}
                {showWebsiteRow ? (
                  <div className="flex gap-3">
                    <span className={iconRing}>
                      <Globe className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide opacity-70">Site web</p>
                      <a
                        href={websiteUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate text-sm font-medium underline-offset-2 hover:underline"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {websiteUrl!.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                ) : null}
                {showMapsRow ? (
                  <div className="flex gap-3">
                    <span className={iconRing}>
                      <Map className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide opacity-70">Google Maps</p>
                      <a
                        href={googleMapsUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-sm font-medium underline-offset-2 hover:underline"
                        style={{ color: "var(--accent-color)" }}
                      >
                        Voir sur la carte
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {showHoursRow ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Horaires</p>
                <div className="mt-4 flex gap-3">
                  <span className={iconRing}>
                    <Clock className="h-4 w-4" aria-hidden />
                  </span>
                  <ul className="space-y-1.5 text-sm leading-snug">
                    {openingHoursLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div aria-hidden className="hidden lg:block" />
            )}

            {(showInstagram || showFacebook) ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Réseaux</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {showInstagram ? (
                    <a
                      href={instagramUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--footer-text)_25%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--footer-text)_12%,transparent)]"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  ) : null}
                  {showFacebook ? (
                    <a
                      href={facebookUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--footer-text)_25%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--footer-text)_12%,transparent)]"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
