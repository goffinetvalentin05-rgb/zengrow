"use client";

import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
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
import Select from "@/src/components/ui/select";
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
  const todayDate = new Date().toISOString().slice(0, 10);
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + daysInAdvance);
    return d.toISOString().slice(0, 10);
  }, [daysInAdvance]);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [seatingZone, setSeatingZone] = useState<"interior" | "terrace">("interior");

  const sortedDocuments = useMemo(() => {
    const copy = [...documents];
    copy.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return copy;
  }, [documents]);

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
      setAvailabilitySlots([]);
      setSlotsError(null);
      return;
    }

    if (reservationDate > maxDateStr) {
      setAvailabilitySlots([]);
      setSlotsError("Cette date dépasse la fenêtre de réservation autorisée.");
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(null);

    const q = new URLSearchParams({
      restaurantId,
      date: reservationDate,
      covers: String(guests),
      zone: terraceEnabled ? seatingZone : "interior",
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
        if (!cancelled) {
          setAvailabilitySlots(slots);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setAvailabilitySlots([]);
          setSlotsError(err instanceof Error ? err.message : "Impossible de charger les créneaux.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSlotsLoading(false);
        }
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
    seatingZone,
  ]);

  useEffect(() => {
    const times = new Set(availabilitySlots.map((s) => s.time));
    if (reservationTime && !times.has(reservationTime)) {
      setReservationTime("");
    }
  }, [availabilitySlots, reservationTime]);

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
        ...(terraceEnabled ? { zone: seatingZone } : {}),
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
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setGuests(2);
    setReservationDate("");
    setReservationTime("");
    setSeatingZone("interior");
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
            <div className="mb-8 text-center md:text-left">
              <h2
                className="text-2xl font-medium md:text-3xl"
                style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
              >
                Réserver une table
              </h2>
              <p
                className="mt-2 text-sm"
                style={{ color: "color-mix(in srgb, var(--body-text) 72%, var(--page-bg))" }}
              >
                Indiquez vos préférences — nous vous confirmerons rapidement.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
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

              {terraceEnabled ? (
                <fieldset className="space-y-3">
                  <legend className={labelClass} style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}>
                    Emplacement <span className="text-rose-600">*</span>
                  </legend>
                  <p className="text-sm" style={{ color: "color-mix(in srgb, var(--body-text) 72%, var(--page-bg))" }}>
                    Choisissez la zone pour laquelle vous souhaitez réserver.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border px-4 py-3 transition",
                        seatingZone === "interior" ? "border-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)]" : "",
                      )}
                      style={{
                        borderColor:
                          seatingZone === "interior" ? undefined : "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                      }}
                    >
                      <input
                        type="radio"
                        name="seating-zone"
                        value="interior"
                        checked={seatingZone === "interior"}
                        onChange={() => setSeatingZone("interior")}
                        required
                        disabled={previewMode}
                        className="h-4 w-4 shrink-0 accent-[var(--accent-color)]"
                      />
                      <span className="text-sm font-medium" style={{ color: "var(--body-text)" }}>
                        Intérieur
                      </span>
                    </label>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border px-4 py-3 transition",
                        seatingZone === "terrace" ? "border-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)]" : "",
                      )}
                      style={{
                        borderColor:
                          seatingZone === "terrace" ? undefined : "color-mix(in srgb, var(--body-text) 18%, var(--page-bg))",
                      }}
                    >
                      <input
                        type="radio"
                        name="seating-zone"
                        value="terrace"
                        checked={seatingZone === "terrace"}
                        onChange={() => setSeatingZone("terrace")}
                        required
                        disabled={previewMode}
                        className="h-4 w-4 shrink-0 accent-[var(--accent-color)]"
                      />
                      <span className="text-sm font-medium" style={{ color: "var(--body-text)" }}>
                        Terrasse
                      </span>
                    </label>
                  </div>
                </fieldset>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="date" className={labelClass} style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}>
                    Date
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={reservationDate}
                    onChange={(event) => setReservationDate(event.target.value)}
                    min={todayDate}
                    max={maxDateStr}
                    required
                    disabled={previewMode}
                    className={inputClass}
                    style={fieldStyle}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="time" className={labelClass} style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}>
                    Heure
                  </label>
                  <Select
                    id="time"
                    value={reservationTime}
                    onChange={(event) => setReservationTime(event.target.value)}
                    required
                    disabled={previewMode || isDateInClosurePeriod || slotsLoading}
                    className={cn(inputClass, "cursor-pointer")}
                    style={fieldStyle}
                  >
                    <option value="">
                      {slotsLoading ? "Chargement des créneaux…" : "Sélectionnez une heure"}
                    </option>
                    {availabilitySlots.map((slot) => (
                      <option key={slot.time} value={slot.time}>
                        {useTables && slot.remainingCapacity == null
                          ? slot.time
                          : `${slot.time} — ${slot.remainingCapacity ?? 0} place(s) restante(s) après votre demande`}
                      </option>
                    ))}
                  </Select>
                  {slotsError ? (
                    <p className="text-xs text-amber-700">{slotsError}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="guests" className={labelClass} style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}>
                  Nombre de convives
                </label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  max={maxPartySize}
                  value={guests}
                  onChange={(event) => setGuests(Number(event.target.value))}
                  required
                  disabled={previewMode}
                  className={inputClass}
                  style={fieldStyle}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className={labelClass} style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}>
                  Nom complet
                </label>
                <Input
                  id="name"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  required
                  autoComplete="name"
                  disabled={previewMode}
                  className={inputClass}
                  style={fieldStyle}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {(allowEmail ?? true) ? (
                  <div className="space-y-2">
                    <label htmlFor="email" className={labelClass} style={{ color: "color-mix(in srgb, var(--body-text) 65%, var(--page-bg))" }}>
                      E-mail
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
                <div className={cn("space-y-2", !(allowEmail ?? true) && "md:col-span-2")}>
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

              <button
                type="submit"
                disabled={previewMode || isSubmitting || isDateInClosurePeriod}
                className="w-full min-h-[52px] rounded-[var(--radius)] border border-transparent py-3.5 text-[15px] font-semibold tracking-wide shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                style={{
                  ...(buttonStyle === "ghost"
                    ? { backgroundColor: "transparent", color: "var(--button-bg)" }
                    : buttonStyle === "outlined"
                      ? { backgroundColor: "transparent", color: "var(--button-bg)", borderColor: "var(--button-bg)" }
                      : { backgroundColor: "var(--button-bg)", color: "var(--button-text)" }),
                }}
              >
                {isSubmitting ? "Envoi en cours…" : "Confirmer la demande"}
              </button>
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
