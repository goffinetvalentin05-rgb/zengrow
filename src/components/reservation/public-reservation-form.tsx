"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import { generateTimeSlotsForDate, OpeningHours } from "@/src/lib/utils";

type PublicReservationFormProps = {
  restaurantId: string;
  restaurantName: string;
  restaurantDescription?: string | null;
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

export default function PublicReservationForm({
  restaurantId,
  restaurantName,
  restaurantDescription,
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

  const primaryColor = accentColor || "#1F7A6C";
  const ctaColor = buttonColor || primaryColor;
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

  return (
    <section className="overflow-hidden rounded-3xl border border-[#DDEFEA] bg-white shadow-[0_20px_45px_-30px_rgba(15,63,58,0.55)]">
      {coverImageUrl ? (
        <div className="h-40 w-full bg-cover bg-center" style={{ backgroundImage: `url(${coverImageUrl})` }} />
      ) : (
        <div className="h-20 w-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F]" />
      )}

      <div className="p-6 md:p-8">
        <header>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo restaurant"
                width={48}
                height={48}
                className="h-12 w-12 rounded-xl object-cover"
                unoptimized
              />
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
                Réservation en ligne
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">{restaurantName}</h1>
            </div>
          </div>
          {restaurantDescription && <p className="mt-3 text-sm text-slate-600">{restaurantDescription}</p>}
          <div className="mt-4 grid gap-2 rounded-2xl border border-[#E3F2EE] bg-[#F7FCFB] p-3 text-xs text-slate-600">
            {restaurantAddress && <p>Adresse : {restaurantAddress}</p>}
            {restaurantPhone && <p>Téléphone : {restaurantPhone}</p>}
            {restaurantEmail && <p>E-mail : {restaurantEmail}</p>}
            {(instagramUrl || facebookUrl || websiteUrl) && (
              <p>
                Réseaux :{" "}
                {websiteUrl ? (
                  <a className="font-semibold hover:underline" href={websiteUrl} target="_blank" rel="noreferrer">
                    Site web
                  </a>
                ) : null}
                {instagramUrl ? (
                  <>
                    {" "}
                    •{" "}
                    <a className="font-semibold hover:underline" href={instagramUrl} target="_blank" rel="noreferrer">
                      Instagram
                    </a>
                  </>
                ) : null}
                {facebookUrl ? (
                  <>
                    {" "}
                    •{" "}
                    <a className="font-semibold hover:underline" href={facebookUrl} target="_blank" rel="noreferrer">
                      Facebook
                    </a>
                  </>
                ) : null}
              </p>
            )}
          </div>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {closureNotice ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {closureMessage?.trim() ? `${closureMessage.trim()} - ${closureNotice}` : closureNotice}
            </div>
          ) : null}
          {preBookingMessage ? (
            <div className="rounded-2xl border border-[#CFE9E2] bg-[#EFFAF7] px-4 py-3 text-sm text-slate-700">
              {preBookingMessage}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={reservationDate}
                onChange={(event) => setReservationDate(event.target.value)}
                min={todayDate}
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="mb-1 block text-sm font-medium text-slate-700">
                Heure
              </label>
              <Select
                id="time"
                value={reservationTime}
                onChange={(event) => setReservationTime(event.target.value)}
                required
                disabled={isDateInClosurePeriod}
              >
                <option value="">Sélectionnez une heure</option>
                {generatedSlots.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={(capacityBySlot[slot] ?? 0) <= 0 || (capacityBySlot[slot] ?? 0) < guests}
                  >
                    {(capacityBySlot[slot] ?? 0) <= 0
                      ? `${slot} - Complet`
                      : `${slot} - ${capacityBySlot[slot] ?? restaurantCapacity} places restantes`}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="guests" className="mb-1 block text-sm font-medium text-slate-700">
              Nombre de personnes
            </label>
            <Input
              id="guests"
              type="number"
              min={1}
              max={maxPartySize}
              value={guests}
              onChange={(event) => setGuests(Number(event.target.value))}
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Nom complet
            </label>
            <Input
              id="name"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
                required={allowEmail ?? true}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                Téléphone
              </label>
              <Input
                id="phone"
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
                required={allowPhone ?? true}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isDateInClosurePeriod}
            className="w-full text-white"
            style={{ backgroundColor: ctaColor }}
          >
            {isSubmitting ? "Enregistrement..." : "Réserver ma table"}
          </Button>
        </form>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        {message && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
        )}
      </div>
    </section>
  );
}
