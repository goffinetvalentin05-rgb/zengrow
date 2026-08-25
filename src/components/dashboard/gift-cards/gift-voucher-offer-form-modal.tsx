"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import DashboardPortal from "@/src/components/dashboard/ui/dashboard-portal";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { centsToChf, formatCentsAsChf } from "@/src/lib/gift-vouchers/money";
import type { GiftVoucherOffer, GiftVoucherOfferKind } from "@/src/lib/gift-vouchers/offers/types";
import {
  imageExtensionForUpload,
  uploadRestaurantPublicAsset,
  validateRestaurantImageFile,
} from "@/src/lib/restaurant-storage-upload";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

type GiftVoucherOfferFormModalProps = {
  open: boolean;
  restaurantId: string;
  offer: GiftVoucherOffer | null;
  onClose: () => void;
  onSaved: (offer: GiftVoucherOffer) => void;
};

type FormState = {
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl: string;
  kind: GiftVoucherOfferKind;
  salePriceChf: string;
  faceValueChf: string;
  experienceLabel: string;
  partySize: string;
  validityMonths: string;
  terms: string;
  status: "active" | "inactive";
};

function fromOffer(offer: GiftVoucherOffer | null): FormState {
  if (!offer) {
    return {
      title: "",
      shortDescription: "",
      detailedDescription: "",
      imageUrl: "",
      kind: "monetary",
      salePriceChf: "80",
      faceValueChf: "80",
      experienceLabel: "",
      partySize: "",
      validityMonths: "12",
      terms: "",
      status: "active",
    };
  }
  return {
    title: offer.title,
    shortDescription: offer.shortDescription ?? "",
    detailedDescription: offer.detailedDescription ?? "",
    imageUrl: offer.imageUrl ?? "",
    kind: offer.kind,
    salePriceChf: String(centsToChf(offer.salePriceCents)),
    faceValueChf: String(centsToChf(offer.faceValueCents ?? offer.salePriceCents)),
    experienceLabel: offer.experienceLabel ?? "",
    partySize: offer.partySize ? String(offer.partySize) : "",
    validityMonths: String(offer.validityMonths),
    terms: offer.terms ?? "",
    status: offer.status === "archived" ? "inactive" : offer.status,
  };
}

export default function GiftVoucherOfferFormModal({
  open,
  restaurantId,
  offer,
  onClose,
  onSaved,
}: GiftVoucherOfferFormModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(fromOffer(offer));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(fromOffer(offer));
      setError(null);
    }
  }, [open, offer]);

  useDialogFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, saving]);

  if (!open) return null;

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const invalid = validateRestaurantImageFile(file);
    if (invalid) {
      setError(invalid);
      event.target.value = "";
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { publicUrl } = await uploadRestaurantPublicAsset(supabase, restaurantId, "gift-voucher-offers", file, {
        extension: imageExtensionForUpload(file),
      });
      setForm((current) => ({ ...current, imageUrl: publicUrl }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Impossible de charger l’image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        detailedDescription: form.detailedDescription.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        kind: form.kind,
        salePriceChf: Number(form.salePriceChf.replace(",", ".")),
        faceValueChf: form.kind === "monetary" ? Number(form.faceValueChf.replace(",", ".")) : undefined,
        experienceLabel: form.kind === "experience" ? form.experienceLabel.trim() || form.title.trim() : undefined,
        partySize: form.partySize ? Number(form.partySize) : undefined,
        validityMonths: Number(form.validityMonths) || 12,
        terms: form.terms.trim() || undefined,
        status: form.status,
        clearImage: offer && !form.imageUrl.trim() ? true : undefined,
      };
      const response = await fetch(offer ? `/api/gift-voucher-offers/${offer.id}` : "/api/gift-voucher-offers", {
        method: offer ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as { offer?: GiftVoucherOffer; error?: string } | null;
      if (!response.ok || !body?.offer) {
        setError(body?.error ?? "Impossible d’enregistrer l’offre.");
        return;
      }
      onSaved(body.offer);
    } catch {
      setError("Impossible d’enregistrer l’offre. Vérifiez votre connexion.");
    } finally {
      setSaving(false);
    }
  }

  const previewPrice =
    form.kind === "monetary"
      ? formatCentsAsChf(Math.round(Number(form.faceValueChf.replace(",", ".") || 0) * 100))
      : Number(form.salePriceChf.replace(",", ".")) > 0
        ? formatCentsAsChf(Math.round(Number(form.salePriceChf.replace(",", ".")) * 100))
        : "Offrir";

  return (
    <DashboardPortal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
        role="presentation"
        onClick={() => !saving && onClose()}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-offer-form-title"
          className={cn(
            "flex max-h-[min(94dvh,880px)] w-full max-w-3xl flex-col overflow-hidden border-zg-border bg-zg-surface shadow-2xl",
            "rounded-t-2xl border-t sm:rounded-2xl sm:border",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
            <div>
              <h2 id="gift-offer-form-title" className="text-lg font-semibold text-zg-fg">
                {offer ? "Modifier l’offre" : "Nouvelle offre"}
              </h2>
              <p className="mt-1 text-sm text-zg-text-muted">
                Le modèle catalogue. Les bons déjà vendus conservent leur snapshot.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg p-2 text-zg-text-muted hover:bg-zg-card-hover hover:text-zg-fg"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {error ? (
                <p className="rounded-xl border border-zg-danger/30 bg-zg-danger-soft-bg px-3 py-2 text-sm text-zg-danger" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, kind: "monetary" }))}
                  className={cn(
                    "rounded-2xl border p-4 text-left",
                    form.kind === "monetary" ? "border-zg-accent bg-zg-accent/10" : "border-zg-border",
                  )}
                >
                  <p className="font-semibold text-zg-fg">Bon monétaire</p>
                  <p className="mt-1 text-sm text-zg-text-muted">Valeur en CHF, utilisable en plusieurs fois.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, kind: "experience" }))}
                  className={cn(
                    "rounded-2xl border p-4 text-left",
                    form.kind === "experience" ? "border-zg-accent bg-zg-accent/10" : "border-zg-border",
                  )}
                >
                  <p className="font-semibold text-zg-fg">Expérience / prestation</p>
                  <p className="mt-1 text-sm text-zg-text-muted">Validée en une fois, sans encaissement partiel.</p>
                </button>
              </div>

              <div>
                <label className="dashboard-field-label" htmlFor="offer-title">
                  Titre
                </label>
                <Input
                  id="offer-title"
                  required
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="mt-1.5"
                  placeholder={form.kind === "experience" ? "Visite de la cave et apéritif" : "Bon cadeau 80 CHF"}
                />
              </div>

              <div>
                <label className="dashboard-field-label" htmlFor="offer-short">
                  Courte description
                </label>
                <Input
                  id="offer-short"
                  value={form.shortDescription}
                  onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
                  className="mt-1.5"
                  maxLength={280}
                />
              </div>

              <div>
                <label className="dashboard-field-label" htmlFor="offer-details">
                  Description détaillée (facultatif)
                </label>
                <Textarea
                  id="offer-details"
                  rows={3}
                  value={form.detailedDescription}
                  onChange={(event) => setForm((current) => ({ ...current, detailedDescription: event.target.value }))}
                  className="mt-1.5"
                />
              </div>

              <div>
                <p className="dashboard-field-label">Image de l’offre</p>
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="" className="mt-2 h-36 w-full rounded-xl object-cover" />
                ) : (
                  <div className="mt-2 flex h-36 items-center justify-center rounded-xl border border-dashed border-zg-border text-sm text-zg-text-muted">
                    Sans image, le PDF utilisera un fond couleur.
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleImage} />
                  <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    {uploading ? "Chargement…" : "Choisir une image"}
                  </Button>
                  {form.imageUrl ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm((current) => ({ ...current, imageUrl: "" }))}>
                      Retirer
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="dashboard-field-label" htmlFor="offer-sale">
                    Prix de vente (CHF)
                  </label>
                  <Input
                    id="offer-sale"
                    type="number"
                    min={0}
                    step="0.05"
                    required
                    value={form.salePriceChf}
                    onChange={(event) => setForm((current) => ({ ...current, salePriceChf: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                {form.kind === "monetary" ? (
                  <div>
                    <label className="dashboard-field-label" htmlFor="offer-face">
                      Valeur offerte (CHF)
                    </label>
                    <Input
                      id="offer-face"
                      type="number"
                      min={1}
                      step="0.05"
                      required
                      value={form.faceValueChf}
                      onChange={(event) => setForm((current) => ({ ...current, faceValueChf: event.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="dashboard-field-label" htmlFor="offer-party">
                      Nombre de personnes (facultatif)
                    </label>
                    <Input
                      id="offer-party"
                      type="number"
                      min={1}
                      max={50}
                      value={form.partySize}
                      onChange={(event) => setForm((current) => ({ ...current, partySize: event.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                )}
              </div>

              {form.kind === "experience" ? (
                <div>
                  <label className="dashboard-field-label" htmlFor="offer-experience">
                    Intitulé de la prestation
                  </label>
                  <Input
                    id="offer-experience"
                    value={form.experienceLabel}
                    onChange={(event) => setForm((current) => ({ ...current, experienceLabel: event.target.value }))}
                    className="mt-1.5"
                    placeholder={form.title || "Nom de l’expérience"}
                  />
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="dashboard-field-label" htmlFor="offer-validity">
                    Validité (mois)
                  </label>
                  <Input
                    id="offer-validity"
                    type="number"
                    min={1}
                    max={60}
                    value={form.validityMonths}
                    onChange={(event) => setForm((current) => ({ ...current, validityMonths: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="dashboard-field-label" htmlFor="offer-status">
                    Statut
                  </label>
                  <Select
                    id="offer-status"
                    className="mt-1.5"
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, status: event.target.value as "active" | "inactive" }))
                    }
                  >
                    <option value="active">Active — visible et achetable</option>
                    <option value="inactive">Inactive — masquée du catalogue</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="dashboard-field-label" htmlFor="offer-terms">
                  Conditions propres
                </label>
                <Textarea
                  id="offer-terms"
                  rows={3}
                  value={form.terms}
                  onChange={(event) => setForm((current) => ({ ...current, terms: event.target.value }))}
                  className="mt-1.5"
                />
              </div>

              <div className="rounded-2xl border border-zg-border p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Aperçu catalogue</p>
                <p className="mt-2 text-base font-semibold text-zg-fg">{form.title.trim() || "Titre de l’offre"}</p>
                <p className="mt-1 text-sm text-zg-text-muted">{form.shortDescription.trim() || "Courte description"}</p>
                <p className="mt-2 text-sm font-semibold text-zg-accent">{previewPrice}</p>
              </div>
            </div>

            <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? "Enregistrement…" : offer ? "Enregistrer" : "Créer l’offre"}
              </Button>
            </footer>
          </form>
        </div>
      </div>
    </DashboardPortal>
  );
}
