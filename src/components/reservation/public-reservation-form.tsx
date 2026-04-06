"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import {
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import { cn, generateTimeSlotsForDate, OpeningHours } from "@/src/lib/utils";

const HERO_NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")";

const fieldClass =
  "min-h-[48px] rounded-xl border border-white/12 bg-[#0f1218] px-4 py-3 text-sm text-[#f2ebe0] shadow-inner shadow-black/20 outline-none transition placeholder:text-stone-500 focus:border-[#c9a962]/45 focus:ring-2 focus:ring-[#c9a962]/20";

type PublicReservationFormProps = {
  restaurantId: string;
  restaurantName: string;
  restaurantTagline?: string | null;
  publicPageDescription?: string | null;
  galleryImageUrls?: string[];
  menuPublicHref?: string | null;
  restaurantPhone?: string | null;
  restaurantAddress?: string | null;
  restaurantEmail?: string | null;
  allowPhone?: boolean | null;
  allowEmail?: boolean | null;
  restaurantCapacity: number;
  maxPartySize: number;
  reservationDuration: number;
  slotInterval: number;
  openingHours: OpeningHours | null;
  blockedSlots: { reservation_date: string; reservation_time: string }[];
  existingReservations: {
    reservation_date: string;
    reservation_time: string;
    guests: number;
    status: string;
  }[];
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  accentColor?: string | null;
  buttonColor?: string | null;
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
  menuPublicHref,
  restaurantPhone,
  restaurantAddress,
  restaurantEmail,
  allowPhone,
  allowEmail,
  restaurantCapacity,
  maxPartySize,
  reservationDuration,
  slotInterval,
  openingHours,
  blockedSlots,
  existingReservations,
  logoUrl,
  coverImageUrl,
  accentColor,
  buttonColor,
  instagramUrl,
  facebookUrl,
  websiteUrl,
  preBookingMessage,
  closureStartDate,
  closureEndDate,
  closureMessage,
}: PublicReservationFormProps) {
  const todayDate = new Date().toISOString().slice(0, 10);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blockedSet = useMemo(() => {
    return new Set(blockedSlots.map((slot) => `${slot.reservation_date}|${slot.reservation_time}`));
  }, [blockedSlots]);

  const generatedSlots = useMemo(() => {
    if (!reservationDate) return [];
    if (closureStartDate && closureEndDate && reservationDate >= closureStartDate && reservationDate <= closureEndDate) {
      return [];
    }
    const baseSlots = generateTimeSlotsForDate(reservationDate, openingHours, slotInterval);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return baseSlots.filter((slot) => {
      if (blockedSet.has(`${reservationDate}|${slot}`)) return false;
      if (reservationDate !== todayDate) return true;
      const [hours, minutes] = slot.split(":").map(Number);
      const slotMinutes = hours * 60 + minutes;
      return slotMinutes >= currentMinutes;
    });
  }, [reservationDate, openingHours, slotInterval, blockedSet, closureStartDate, closureEndDate, todayDate]);

  const capacityBySlot = useMemo(() => {
    if (!reservationDate) return {};

    const reservationsForDate = existingReservations.filter(
      (reservation) =>
        reservation.reservation_date === reservationDate &&
        ["pending", "confirmed"].includes(reservation.status),
    );

    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const values: Record<string, number> = {};

    for (const slot of generatedSlots) {
      const slotStart = toMinutes(slot);
      const slotEnd = slotStart + reservationDuration;

      const usedSeats = reservationsForDate.reduce((total, reservation) => {
        const reservationStart = toMinutes(reservation.reservation_time);
        const reservationEnd = reservationStart + reservationDuration;
        const overlaps = reservationStart < slotEnd && reservationEnd > slotStart;
        return overlaps ? total + reservation.guests : total;
      }, 0);

      values[slot] = Math.max(restaurantCapacity - usedSeats, 0);
    }

    return values;
  }, [existingReservations, generatedSlots, reservationDate, reservationDuration, restaurantCapacity]);

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

    const response = await fetch("/api/public/reservations", {
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

  const primaryAccent = buttonColor || accentColor || "#c9a962";
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
  const hasContactRows = Boolean(restaurantAddress || restaurantPhone || restaurantEmail || websiteUrl);
  const hasSocialLinks = Boolean(instagramUrl || facebookUrl);
  const showInfoCard = hasContactRows || hasSocialLinks;

  return (
    <div className="text-[#e7e2d8]">
      <section className="relative min-h-[min(72vh,560px)] w-full overflow-hidden">
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
            className="absolute inset-0 bg-gradient-to-br from-[#1a2235] via-[#14161f] to-[#0a0c10]"
            aria-hidden
          />
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/75 to-[#0a0c10]/25"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.4]"
          style={{ backgroundImage: HERO_NOISE_SVG }}
          aria-hidden
        />

        <div className="relative z-[1] flex min-h-[min(72vh,560px)] flex-col justify-end px-5 pb-10 pt-28 sm:px-8 md:px-12 lg:px-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 md:flex-row md:items-end md:justify-start md:gap-10">
            {logoUrl ? (
              <div
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-[#0f1218]/60 p-1 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-sm",
                  "ring-1 ring-[#c9a962]/25",
                )}
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
                className="mb-2 text-[11px] font-medium uppercase tracking-[0.35em] text-[#c9a962]/90"
                style={{ fontFamily: "var(--font-public-sans), system-ui, sans-serif" }}
              >
                Réservation
              </p>
              <h1
                className="text-balance text-4xl font-medium leading-[1.08] tracking-tight text-[#f8f3ea] sm:text-5xl md:text-6xl lg:text-[3.35rem]"
                style={{ fontFamily: "var(--font-public-display), Georgia, serif" }}
              >
                {restaurantName}
              </h1>
              {taglineText ? (
                <p className="mt-4 max-w-xl text-pretty text-base font-light leading-relaxed text-[#d4cec2] sm:text-lg">
                  {taglineText}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-[2] -mt-5 flex flex-col items-stretch justify-center gap-3 px-5 sm:flex-row sm:flex-wrap sm:px-8 md:px-12 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={scrollToReservation}
            className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full px-8 text-sm font-semibold tracking-wide text-[#14161f] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] transition duration-300 hover:brightness-110 hover:shadow-[0_16px_48px_-12px_rgba(201,169,98,0.35)] active:scale-[0.98] sm:max-w-xs sm:flex-none"
            style={{ backgroundColor: primaryAccent }}
          >
            Réserver une table
          </button>
          {menuPublicHref ? (
            <a
              href={menuPublicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full border border-[#c9a962]/55 bg-transparent px-8 text-sm font-semibold tracking-wide text-[#f5f0e6] transition duration-300 hover:border-[#c9a962] hover:bg-[#c9a962]/10 active:scale-[0.98] sm:max-w-xs sm:flex-none"
            >
              Voir le menu
            </a>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-5 py-14 sm:px-8 md:px-12 lg:px-16 lg:py-20">
        {introText ? (
          <p className="mx-auto max-w-3xl text-center text-pretty text-base leading-relaxed text-[#b8b0a2] md:text-lg">
            {introText}
          </p>
        ) : null}

        {showInfoCard ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#161a24]/80 px-6 py-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md md:px-10 md:py-10">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {restaurantAddress ? (
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c9a962]/20 bg-[#c9a962]/10 text-[#c9a962]">
                    <MapPin className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8274]">Adresse</p>
                    <p className="mt-1 text-sm leading-snug text-[#e7e2d8]">{restaurantAddress}</p>
                  </div>
                </div>
              ) : null}
              {restaurantPhone ? (
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c9a962]/20 bg-[#c9a962]/10 text-[#c9a962]">
                    <Phone className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8274]">Téléphone</p>
                    <a
                      href={`tel:${restaurantPhone.replace(/\s/g, "")}`}
                      className="mt-1 block text-sm text-[#e7e2d8] transition hover:text-[#c9a962]"
                    >
                      {restaurantPhone}
                    </a>
                  </div>
                </div>
              ) : null}
              {restaurantEmail ? (
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c9a962]/20 bg-[#c9a962]/10 text-[#c9a962]">
                    <Mail className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8274]">E-mail</p>
                    <a
                      href={`mailto:${restaurantEmail}`}
                      className="mt-1 block truncate text-sm text-[#e7e2d8] transition hover:text-[#c9a962]"
                    >
                      {restaurantEmail}
                    </a>
                  </div>
                </div>
              ) : null}
              {websiteUrl ? (
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c9a962]/20 bg-[#c9a962]/10 text-[#c9a962]">
                    <Globe className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8274]">Site web</p>
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-sm text-[#e7e2d8] transition hover:text-[#c9a962]"
                    >
                      {websiteUrl.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              ) : null}
            </div>

            {hasSocialLinks ? (
              <div
                className={cn(
                  "flex flex-wrap items-center justify-center gap-4 md:justify-start",
                  hasContactRows && "mt-8 border-t border-white/[0.06] pt-8",
                )}
              >
                {instagramUrl ? (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-[#c9a962] transition hover:border-[#c9a962]/40 hover:bg-[#c9a962]/10"
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-[#c9a962] transition hover:border-[#c9a962]/40 hover:bg-[#c9a962]/10"
                  >
                    <Facebook className="h-4 w-4" aria-hidden />
                    Facebook
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {galleryImageUrls.length > 0 ? (
          <div>
            <h2
              className="mb-6 text-center text-2xl font-medium text-[#f5f0e6] md:text-left md:text-3xl"
              style={{ fontFamily: "var(--font-public-display), Georgia, serif" }}
            >
              Galerie
            </h2>
            <div className="columns-2 gap-3 md:columns-3 md:gap-4">
              {galleryImageUrls.map((src) => (
                <div
                  key={src}
                  className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-[#1a1e2a] md:mb-4"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      unoptimized
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0c10]/50 to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <section id="reservation" className="scroll-mt-24">
          <div className="rounded-2xl border border-white/[0.08] bg-[#161a24]/90 p-6 shadow-[0_32px_100px_-48px_rgba(0,0,0,0.95)] backdrop-blur-md md:p-10">
            <div className="mb-8 text-center md:text-left">
              <h2
                className="text-2xl font-medium text-[#f5f0e6] md:text-3xl"
                style={{ fontFamily: "var(--font-public-display), Georgia, serif" }}
              >
                Réserver une table
              </h2>
              <p className="mt-2 text-sm text-[#9a9285]">Indiquez vos préférences — nous vous confirmerons rapidement.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {closureNotice ? (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
                  {closureMessage?.trim() ? `${closureMessage.trim()} — ${closureNotice}` : closureNotice}
                </div>
              ) : null}
              {preBookingMessage ? (
                <div className="rounded-xl border border-[#c9a962]/20 bg-[#c9a962]/5 px-4 py-3 text-sm leading-relaxed text-[#d4cec2]">
                  {preBookingMessage}
                </div>
              ) : null}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8274]">
                    Date
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={reservationDate}
                    onChange={(event) => setReservationDate(event.target.value)}
                    min={todayDate}
                    required
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="time" className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8274]">
                    Heure
                  </label>
                  <Select
                    id="time"
                    value={reservationTime}
                    onChange={(event) => setReservationTime(event.target.value)}
                    required
                    disabled={isDateInClosurePeriod}
                    className={cn(fieldClass, "cursor-pointer")}
                  >
                    <option value="">Sélectionnez une heure</option>
                    {generatedSlots.map((slot) => (
                      <option
                        key={slot}
                        value={slot}
                        disabled={(capacityBySlot[slot] ?? 0) <= 0 || (capacityBySlot[slot] ?? 0) < guests}
                      >
                        {(capacityBySlot[slot] ?? 0) <= 0
                          ? `${slot} — Complet`
                          : `${slot} — ${capacityBySlot[slot] ?? restaurantCapacity} places`}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="guests" className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8274]">
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
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8274]">
                  Nom complet
                </label>
                <Input
                  id="name"
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                  required
                  autoComplete="name"
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8274]">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={guestEmail}
                    onChange={(event) => setGuestEmail(event.target.value)}
                    required={allowEmail ?? true}
                    autoComplete="email"
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a8274]">
                    Téléphone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestPhone}
                    onChange={(event) => setGuestPhone(event.target.value)}
                    required={allowPhone ?? true}
                    autoComplete="tel"
                    className={fieldClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isDateInClosurePeriod}
                className="w-full min-h-[52px] rounded-full border border-transparent py-3.5 text-[15px] font-semibold tracking-wide text-[#14161f] shadow-lg transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                style={{ backgroundColor: primaryAccent }}
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
      </div>
    </div>
  );
}
