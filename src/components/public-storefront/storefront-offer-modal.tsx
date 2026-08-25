"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { PublicGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";
import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";

type StorefrontOfferModalProps = {
  restaurantSlug: string;
  offer: PublicGiftVoucherOffer | null;
  previewMode?: boolean;
  buttonRadius: string;
  onClose: () => void;
};

export function offerPriceLabel(offer: PublicGiftVoucherOffer): string {
  if (offer.kind === "monetary") return formatCentsAsChf(offer.faceValueCents ?? offer.salePriceCents);
  return offer.salePriceCents > 0 ? formatCentsAsChf(offer.salePriceCents) : "Offrir";
}

export default function StorefrontOfferModal({
  restaurantSlug,
  offer,
  previewMode = false,
  buttonRadius,
  onClose,
}: StorefrontOfferModalProps) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [message, setMessage] = useState("");
  const cents = offer
    ? offer.kind === "monetary"
      ? offer.faceValueCents ?? offer.salePriceCents
      : offer.salePriceCents
    : 0;
  const [amount, setAmount] = useState(cents > 0 ? String(Math.round(cents / 100)) : "");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErr(null);
    if (previewMode) {
      setErr("L’envoi est désactivé dans l’aperçu.");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErr("Merci de remplir prénom, nom et e-mail.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/public/gift-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: restaurantSlug.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          amount: amount.trim() || undefined,
          beneficiary: beneficiary.trim() || undefined,
          occasion: offer?.title,
          message: message.trim() || undefined,
          offerId: offer?.id,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setErr(data.error ?? "Envoi impossible. Réessayez plus tard.");
        return;
      }
      setDone(true);
    } catch {
      setErr("Erreur réseau. Réessayez plus tard.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="Fermer" onClick={() => !busy && onClose()} />
      <div
        className="relative z-[1] w-full max-w-lg rounded-t-3xl border p-6 shadow-2xl sm:rounded-3xl sm:p-8"
        style={{
          backgroundColor: "var(--sf-bg)",
          color: "var(--sf-text)",
          borderColor: "color-mix(in srgb, var(--sf-text) 12%, var(--sf-bg))",
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-60">Bon cadeau</p>
            <h3 className="mt-1 text-xl font-semibold" style={{ color: "var(--sf-heading)", fontFamily: "var(--sf-heading-font)" }}>
              {done ? "Demande envoyée" : offer?.title ?? "Offrir un bon"}
            </h3>
          </div>
          <button type="button" className="rounded-full p-2 opacity-70 hover:opacity-100" onClick={() => !busy && onClose()} aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <p className="text-sm leading-relaxed opacity-90">Nous avons bien reçu votre demande. L’établissement vous recontactera.</p>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Prénom" value={firstName} onChange={setFirstName} required autoComplete="given-name" />
              <Field label="Nom" value={lastName} onChange={setLastName} required autoComplete="family-name" />
            </div>
            <Field label="E-mail" type="email" value={email} onChange={setEmail} required autoComplete="email" />
            <Field label="Téléphone" value={phone} onChange={setPhone} autoComplete="tel" />
            <Field label="Pour" value={beneficiary} onChange={setBeneficiary} />
            <Field label="Montant (CHF)" value={amount} onChange={setAmount} />
            <label className="block text-xs font-semibold uppercase tracking-wide opacity-70">
              Message
              <textarea
                className="mt-1.5 min-h-[88px] w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={fieldStyle}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-semibold disabled:opacity-60"
              style={{
                borderRadius: buttonRadius,
                backgroundColor: "var(--sf-primary)",
                color: "var(--sf-button-text)",
              }}
            >
              {busy ? "Envoi…" : "Envoyer la demande"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const fieldStyle = {
  borderColor: "color-mix(in srgb, var(--sf-text) 16%, var(--sf-bg))",
  backgroundColor: "color-mix(in srgb, var(--sf-text) 4%, var(--sf-bg))",
  color: "var(--sf-heading)",
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide opacity-70">
      {label}
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-1.5 min-h-[46px] w-full rounded-xl border px-3 text-sm outline-none"
        style={fieldStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
