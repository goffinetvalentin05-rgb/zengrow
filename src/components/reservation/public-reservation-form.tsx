"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Clock,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import type { AvailabilitySlot } from "@/src/lib/reservation/schemas";
import { cn, formatOpeningHoursLines, OpeningHours } from "@/src/lib/utils";

const HERO_NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")";

type PublicReservationFormProps = {
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
  primaryColor: string;
  buttonColor: string;
  textColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  fontSizeScale: "small" | "medium" | "large";
  borderRadius: "sharp" | "rounded" | "pill";
  buttonStyle: "filled" | "outlined" | "ghost";
  cardStyle: "flat" | "elevated" | "bordered";
  showPublicAddress: boolean;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showPublicWebsite: boolean;
  showPublicOpeningHours: boolean;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  websiteUrl?: string | null;
  preBookingMessage?: string | null;
  closureStartDate?: string | null;
  closureEndDate?: string | null;
  closureMessage?: string | null;
};

function scrollToReservation() {
  document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function PublicReservationForm({
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
  primaryColor,
  buttonColor,
  textColor,
  accentColor,
  headingFont,
  bodyFont,
  fontSizeScale,
  borderRadius,
  buttonStyle,
  cardStyle,
  showPublicAddress,
  showPublicPhone,
  showPublicEmail,
  showPublicWebsite,
  showPublicOpeningHours,
  instagramUrl,
  facebookUrl,
  websiteUrl,
  preBookingMessage,
  closureStartDate,
  closureEndDate,
  closureMessage,
}: PublicReservationFormProps) {
  const isLightTheme = useMemo(() => {
    const t = textColor.trim().toLowerCase();
    return t === "#111827" || t === "#111111" || t === "#1a1a1a" || t === "#222222";
  }, [textColor]);
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
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const sortedDocuments = useMemo(() => {
    const copy = [...documents];
    copy.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return copy;
  }, [documents]);

  const activeDocument = useMemo(() => {
    if (!activeDocumentId) return null;
    return sortedDocuments.find((d) => d.id === activeDocumentId) ?? null;
  }, [activeDocumentId, sortedDocuments]);

  const cssVars = useMemo(
    () =>
      ({
        "--bg-color": primaryColor,
        "--accent-color": accentColor,
        "--button-color": buttonColor,
        "--text-color": textColor,
        "--heading-font": `"${headingFont}", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
        "--body-font": `"${bodyFont}", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
        "--radius": borderRadius === "sharp" ? "0px" : borderRadius === "pill" ? "999px" : "8px",
        "--font-scale": fontSizeScale === "small" ? "0.92" : fontSizeScale === "large" ? "1.08" : "1",
      }) as React.CSSProperties,
    [accentColor, bodyFont, borderRadius, buttonColor, fontSizeScale, headingFont, primaryColor, textColor],
  );

  const fieldStyle = useMemo(
    () => ({
      backgroundColor: "color-mix(in srgb, var(--text-color) 7%, var(--bg-color))",
      borderColor: "color-mix(in srgb, var(--text-color) 14%, var(--bg-color))",
      color: "var(--text-color)",
    }),
    [],
  );

  useEffect(() => {
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
    restaurantId,
    reservationDate,
    guests,
    closureStartDate,
    closureEndDate,
    maxDateStr,
  ]);

  useEffect(() => {
    const times = new Set(availabilitySlots.map((s) => s.time));
    if (reservationTime && !times.has(reservationTime)) {
      setReservationTime("");
    }
  }, [availabilitySlots, reservationTime]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
  const introRaw = publicPageDescription?.trim();
  const introText =
    introRaw && taglineText && introRaw === taglineText ? null : introRaw;

  const openingHoursLines = formatOpeningHoursLines(openingHours);

  const showAddressRow = showPublicAddress && Boolean(restaurantAddress?.trim());
  const showPhoneRow = showPublicPhone && Boolean(restaurantPhone?.trim());
  const showEmailRow = showPublicEmail && Boolean(restaurantEmail?.trim());
  const showWebsiteRow = showPublicWebsite && Boolean(websiteUrl?.trim());
  const showHoursRow = showPublicOpeningHours;

  const hasContactGrid = showAddressRow || showPhoneRow || showEmailRow || showWebsiteRow;
  const hasContactRows = hasContactGrid || showHoursRow;
  const hasSocialLinks = Boolean(instagramUrl || facebookUrl);
  const showInfoCard = hasContactRows || hasSocialLinks;

  const labelClass = "block text-xs font-semibold uppercase tracking-[0.18em]";
  const iconRing =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius)] border bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)] text-[var(--accent-color)]";
  const inputClass =
    "min-h-[48px] w-full rounded-[var(--radius)] border px-4 py-3 text-sm outline-none transition focus:border-[color-mix(in_srgb,var(--accent-color)_45%,transparent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-color)_30%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-color)]";

  return (
    <>
      <div
      className="min-h-screen [font-size:calc(16px*var(--font-scale))]"
      style={{
        ...cssVars,
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        fontFamily: "var(--body-font), system-ui, sans-serif",
      }}
    >
      <section className="relative min-h-[min(60vh,520px)] w-full overflow-hidden sm:min-h-[min(65vh,560px)]">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={restaurantName}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br"
            style={{
              backgroundImage: `linear-gradient(135deg, var(--bg-color) 0%, color-mix(in srgb, var(--text-color) 7%, var(--bg-color)) 55%, var(--bg-color) 100%)`,
            }}
            aria-hidden
          />
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg-color)] via-[color:var(--bg-color)]/80 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.38]"
          style={{ backgroundImage: HERO_NOISE_SVG }}
          aria-hidden
        />

        <div className="relative z-[1] flex min-h-[min(60vh,520px)] flex-col justify-end px-5 pb-10 pt-24 sm:min-h-[min(65vh,560px)] sm:px-8 md:px-12 lg:px-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 md:flex-row md:items-end md:justify-start md:gap-10">
            {logoUrl ? (
              <div
                className="relative shrink-0 overflow-hidden rounded-[var(--radius)] border border-[color-mix(in_srgb,var(--text-color)_18%,transparent)] bg-[color-mix(in_srgb,var(--bg-color)_55%,transparent)] p-1 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-sm"
                style={{ boxShadow: `0 24px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px color-mix(in srgb, var(--accent-color) 28%, transparent)` }}
              >
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-40 md:w-40">
                  <Image
                    src={logoUrl}
                    alt={`Logo ${restaurantName}`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 112px, 160px"
                    unoptimized
                  />
                </div>
              </div>
            ) : null}

            <div className="max-w-3xl text-center md:text-left">
              <p
                className="mb-2 text-[11px] font-medium uppercase tracking-[0.35em] text-[color:var(--accent-color)]"
                style={{ fontFamily: "var(--body-font), system-ui, sans-serif" }}
              >
                Réservation
              </p>
              <h1
                className="text-balance text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.35rem]"
                style={{ fontFamily: "var(--heading-font), Georgia, serif", color: "var(--text-color)" }}
              >
                {restaurantName}
              </h1>
              {taglineText ? (
                <p
                  className="mt-4 max-w-xl text-pretty text-base font-light leading-relaxed sm:text-lg"
                  style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                >
                  {taglineText}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-[2] -mt-5 flex flex-col items-stretch justify-center gap-3 px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <button
            type="button"
            onClick={scrollToReservation}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius)] px-8 text-sm font-semibold tracking-wide shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] transition duration-300 hover:brightness-110 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.25)] active:scale-[0.98] sm:min-h-[52px] sm:w-auto sm:min-w-[220px] sm:max-w-xs"
            style={{
              ...(buttonStyle === "ghost"
                ? { backgroundColor: "transparent", color: "var(--button-color)" }
                : buttonStyle === "outlined"
                  ? { backgroundColor: "transparent", color: "var(--button-color)", border: "1px solid var(--button-color)" }
                  : { backgroundColor: "var(--button-color)", color: isLightTheme ? "#ffffff" : "#0b0b0b" }),
            }}
          >
            Réserver une table
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-5 py-14 sm:px-8 md:px-12 lg:px-16 lg:py-20">
        {sortedDocuments.length > 0 ? (
          <section
            className="rounded-[var(--radius)] border px-6 py-6 md:px-10 md:py-8"
            style={{
              backgroundColor: "color-mix(in srgb, var(--text-color) 7%, var(--bg-color))",
              borderColor: "color-mix(in srgb, var(--text-color) 14%, var(--bg-color))",
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--heading-font), Georgia, serif", color: "var(--text-color)" }}
                >
                  Nos cartes & menus
                </h2>
                <p className="mt-1 text-sm" style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}>
                  Consultez nos documents (PDF).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sortedDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setActiveDocumentId(doc.id)}
                    className="inline-flex items-center justify-center rounded-[var(--radius)] px-4 py-2 text-sm font-semibold transition hover:brightness-110 active:scale-[0.99]"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid var(--accent-color)",
                      color: "var(--accent-color)",
                    }}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {introText ? (
          <p
            className="mx-auto max-w-3xl text-center text-pretty text-base leading-relaxed md:text-lg"
            style={{ color: "color-mix(in srgb, var(--text-color) 72%, var(--bg-color))" }}
          >
            {introText}
          </p>
        ) : null}

        {showInfoCard ? (
          <div
            className={cn(
              "rounded-[var(--radius)] border px-6 py-8 backdrop-blur-md md:px-10 md:py-10",
              cardStyle === "elevated" && "shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)]",
              cardStyle === "flat" && "shadow-none",
              cardStyle === "bordered" && "shadow-none",
            )}
            style={{
              backgroundColor: "color-mix(in srgb, var(--text-color) 7%, var(--bg-color))",
              borderColor: "color-mix(in srgb, var(--text-color) 14%, var(--bg-color))",
            }}
          >
            {hasContactGrid ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {showAddressRow ? (
                <div className="flex gap-3">
                  <span className={cn(iconRing, "border-[color-mix(in_srgb,var(--accent-color)_35%,var(--text-color)_12%)]")}>
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(labelClass)}
                      style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                    >
                      Adresse
                    </p>
                    <p className="mt-1 text-sm leading-snug" style={{ color: "var(--text-color)" }}>
                      {restaurantAddress}
                    </p>
                  </div>
                </div>
              ) : null}
              {showPhoneRow ? (
                <div className="flex gap-3">
                  <span className={cn(iconRing, "border-[color-mix(in_srgb,var(--accent-color)_35%,var(--text-color)_12%)]")}>
                    <Phone className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(labelClass)}
                      style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                    >
                      Téléphone
                    </p>
                    <a
                      href={`tel:${restaurantPhone!.replace(/\s/g, "")}`}
                      className="mt-1 block text-sm transition hover:opacity-90"
                      style={{ color: "var(--accent-color)" }}
                    >
                      {restaurantPhone}
                    </a>
                  </div>
                </div>
              ) : null}
              {showEmailRow ? (
                <div className="flex gap-3">
                  <span className={cn(iconRing, "border-[color-mix(in_srgb,var(--accent-color)_35%,var(--text-color)_12%)]")}>
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(labelClass)}
                      style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                    >
                      E-mail
                    </p>
                    <a
                      href={`mailto:${restaurantEmail}`}
                      className="mt-1 block truncate text-sm transition hover:opacity-90"
                      style={{ color: "var(--accent-color)" }}
                    >
                      {restaurantEmail}
                    </a>
                  </div>
                </div>
              ) : null}
              {showWebsiteRow ? (
                <div className="flex gap-3">
                  <span className={cn(iconRing, "border-[color-mix(in_srgb,var(--accent-color)_35%,var(--text-color)_12%)]")}>
                    <Globe className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(labelClass)}
                      style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                    >
                      Site web
                    </p>
                    <a
                      href={websiteUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-sm transition hover:opacity-90"
                      style={{ color: "var(--accent-color)" }}
                    >
                      {websiteUrl!.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
            ) : null}

            {showHoursRow ? (
              <div
                className={cn(
                  "flex flex-col gap-3 sm:flex-row sm:gap-4",
                  hasContactGrid && "mt-6 border-t pt-6",
                )}
                style={{ borderColor: "color-mix(in srgb, var(--text-color) 14%, var(--bg-color))" }}
              >
                <span className={cn(iconRing, "h-10 w-10 shrink-0 border-[color-mix(in_srgb,var(--accent-color)_35%,var(--text-color)_12%)]")}>
                  <Clock className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(labelClass)}
                    style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                  >
                    Horaires
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-snug" style={{ color: "var(--text-color)" }}>
                    {openingHoursLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {hasSocialLinks ? (
              <div
                className={cn(
                  "flex flex-wrap items-center justify-center gap-4 md:justify-start",
                  (hasContactGrid || showHoursRow) && "mt-8 border-t pt-8",
                )}
                style={{ borderColor: "color-mix(in srgb, var(--text-color) 14%, var(--bg-color))" }}
              >
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[var(--radius)] border px-4 py-2 text-xs font-medium transition hover:opacity-90"
                    style={{
                      borderColor: "color-mix(in srgb, var(--text-color) 14%, var(--bg-color))",
                      color: "var(--accent-color)",
                    }}
                  >
                    <Instagram className="h-4 w-4" aria-hidden />
                    Instagram
                  </a>
                ) : null}
                {facebookUrl ? (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[var(--radius)] border px-4 py-2 text-xs font-medium transition hover:opacity-90"
                    style={{
                      borderColor: "color-mix(in srgb, var(--text-color) 14%, var(--bg-color))",
                      color: "var(--accent-color)",
                    }}
                  >
                    <Facebook className="h-4 w-4" aria-hidden />
                    Facebook
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <section id="reservation" className="scroll-mt-24">
          <div
            className={cn(
              "rounded-[var(--radius)] border p-6 backdrop-blur-md md:p-10",
              cardStyle === "elevated" && "shadow-[0_32px_100px_-48px_rgba(0,0,0,0.4)]",
              cardStyle === "flat" && "shadow-none",
              cardStyle === "bordered" && "shadow-none",
            )}
            style={{
              backgroundColor: "color-mix(in srgb, var(--text-color) 7%, var(--bg-color))",
              borderColor: "color-mix(in srgb, var(--text-color) 14%, var(--bg-color))",
            }}
          >
            <div className="mb-8 text-center md:text-left">
              <h2
                className="text-2xl font-medium md:text-3xl"
                style={{ fontFamily: "var(--heading-font), Georgia, serif", color: "var(--text-color)" }}
              >
                Réserver une table
              </h2>
              <p className="mt-2 text-sm" style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}>
                Indiquez vos préférences — nous vous confirmerons rapidement.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {closureNotice ? (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
                  {closureMessage?.trim() ? `${closureMessage.trim()} — ${closureNotice}` : closureNotice}
                </div>
              ) : null}
              {preBookingMessage ? (
                <div
                  className="rounded-xl border px-4 py-3 text-sm leading-relaxed"
                  style={{
                    borderColor: `color-mix(in srgb, var(--accent-color) 35%, transparent)`,
                    backgroundColor: `color-mix(in srgb, var(--accent-color) 8%, transparent)`,
                    color: "var(--text-color)",
                  }}
                >
                  {preBookingMessage}
                </div>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="date"
                    className={labelClass}
                    style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                  >
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
                    className={inputClass}
                    style={fieldStyle}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="time"
                    className={labelClass}
                    style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                  >
                    Heure
                  </label>
                  <Select
                    id="time"
                    value={reservationTime}
                    onChange={(event) => setReservationTime(event.target.value)}
                    required
                    disabled={isDateInClosurePeriod || slotsLoading}
                    className={cn(inputClass, "cursor-pointer")}
                    style={fieldStyle}
                  >
                    <option value="">
                      {slotsLoading ? "Chargement des créneaux…" : "Sélectionnez une heure"}
                    </option>
                    {availabilitySlots.map((slot) => (
                      <option key={slot.time} value={slot.time}>
                        {useTables
                          ? slot.time
                          : `${slot.time} — ${slot.remainingCapacity ?? 0} place(s) restante(s) après votre demande`}
                      </option>
                    ))}
                  </Select>
                  {slotsError ? (
                    <p className="text-xs text-amber-200/90">{slotsError}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="guests"
                  className={labelClass}
                  style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                >
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
                  className={inputClass}
                  style={fieldStyle}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className={labelClass}
                  style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                >
                  Nom complet
                </label>
                <Input
                  id="name"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  required
                  autoComplete="name"
                  className={inputClass}
                  style={fieldStyle}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {(allowEmail ?? true) ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className={labelClass}
                      style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                    >
                      E-mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={guestEmail}
                      onChange={(event) => setGuestEmail(event.target.value)}
                      required={allowEmail ?? true}
                      autoComplete="email"
                      className={inputClass}
                      style={fieldStyle}
                    />
                  </div>
                ) : null}
                <div className={cn("space-y-2", !(allowEmail ?? true) && "md:col-span-2")}>
                  <label
                    htmlFor="phone"
                    className={labelClass}
                    style={{ color: "color-mix(in srgb, var(--text-color) 62%, var(--bg-color))" }}
                  >
                    Téléphone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestPhone}
                    onChange={(event) => setGuestPhone(event.target.value)}
                    required={allowPhone ?? true}
                    autoComplete="tel"
                    className={inputClass}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isDateInClosurePeriod}
                className="w-full min-h-[52px] rounded-[var(--radius)] border border-transparent py-3.5 text-[15px] font-semibold tracking-wide shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                style={{
                  ...(buttonStyle === "ghost"
                    ? { backgroundColor: "transparent", color: "var(--button-color)" }
                    : buttonStyle === "outlined"
                      ? { backgroundColor: "transparent", color: "var(--button-color)", borderColor: "var(--button-color)" }
                      : { backgroundColor: "var(--button-color)", color: isLightTheme ? "#ffffff" : "#0b0b0b" }),
                }}
              >
                {isSubmitting ? "Envoi en cours…" : "Confirmer la demande"}
              </button>
            </form>

            {error ? (
              <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {message}
              </p>
            ) : null}
          </div>
        </section>

        {galleryImageUrls.length > 0 ? (
          <div>
            <h2
              className="mb-6 text-center text-2xl font-medium md:text-left md:text-3xl"
                style={{ fontFamily: "var(--heading-font), Georgia, serif", color: "var(--text-color)" }}
            >
              Galerie
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {galleryImageUrls.map((src) => (
                <div
                  key={src}
                  className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius)]"
                  style={{ backgroundColor: "color-mix(in srgb, var(--text-color) 7%, var(--bg-color))" }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    unoptimized
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--bg-color)]/45 to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
    {activeDocument ? (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Document PDF"
        onClick={() => setActiveDocumentId(null)}
      >
        <div
          className="w-full max-w-5xl overflow-hidden rounded-xl border bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{activeDocument.label}</p>
            <div className="flex items-center gap-3">
              <a
                href={activeDocument.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-gray-700 hover:underline"
              >
                Ouvrir dans un nouvel onglet
              </a>
              <button
                type="button"
                onClick={() => setActiveDocumentId(null)}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
          <div className="h-[75vh] bg-white">
            <iframe title={activeDocument.label} src={activeDocument.fileUrl} className="h-full w-full" />
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
