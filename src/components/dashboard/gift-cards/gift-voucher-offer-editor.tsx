"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Sparkles } from "lucide-react";
import GiftVoucherOfferImageField from "@/src/components/dashboard/gift-cards/gift-voucher-offer-image-field";
import GiftVoucherOfferLivePreview, {
  type OfferPreviewModel,
} from "@/src/components/dashboard/gift-cards/gift-voucher-offer-live-preview";
import GiftVoucherSectionNav from "@/src/components/dashboard/gift-cards/gift-voucher-section-nav";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import PageHeader from "@/src/components/dashboard/page-header";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { centsToChf } from "@/src/lib/gift-vouchers/money";
import type { GiftVoucherOffer, GiftVoucherOfferKind } from "@/src/lib/gift-vouchers/offers/types";
import { cn } from "@/src/lib/utils";

type FormState = {
  kind: GiftVoucherOfferKind | null;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl: string;
  salePriceChf: string;
  faceValueChf: string;
  experienceLabel: string;
  partySize: string;
  validityMonths: string;
  terms: string;
};

const EMPTY: FormState = {
  kind: null,
  title: "",
  shortDescription: "",
  detailedDescription: "",
  imageUrl: "",
  salePriceChf: "",
  faceValueChf: "",
  experienceLabel: "",
  partySize: "",
  validityMonths: "12",
  terms: "",
};

function fromOffer(offer: GiftVoucherOffer): FormState {
  return {
    kind: offer.kind,
    title: offer.title,
    shortDescription: offer.shortDescription ?? "",
    detailedDescription: offer.detailedDescription ?? "",
    imageUrl: offer.imageUrl ?? "",
    salePriceChf: offer.salePriceCents > 0 ? String(centsToChf(offer.salePriceCents)) : "",
    faceValueChf: offer.faceValueCents && offer.faceValueCents > 0 ? String(centsToChf(offer.faceValueCents)) : "",
    experienceLabel: offer.experienceLabel ?? "",
    partySize: offer.partySize ? String(offer.partySize) : "",
    validityMonths: String(offer.validityMonths),
    terms: offer.terms ?? "",
  };
}

type GiftVoucherOfferEditorProps = {
  restaurantId: string;
  offer?: GiftVoucherOffer | null;
};

export default function GiftVoucherOfferEditor({ restaurantId, offer = null }: GiftVoucherOfferEditorProps) {
  const router = useRouter();
  const showToast = useDashboardToast();
  const [form, setForm] = useState<FormState>(offer ? fromOffer(offer) : EMPTY);
  const [initial] = useState<FormState>(offer ? fromOffer(offer) : EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty || saving) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, saving]);

  const leave = useCallback(
    (href: string) => {
      if (dirty && !window.confirm("Vous avez des modifications non enregistrées. Quitter quand même ?")) return;
      router.push(href);
    },
    [dirty, router],
  );

  function patch(partial: Partial<FormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function validateForPublish(): string | null {
    if (!form.kind) return "Choisissez un type d’offre.";
    if (!form.title.trim()) return "Indiquez un titre.";
    if (form.kind === "monetary") {
      const face = Number(form.faceValueChf || form.salePriceChf);
      if (!Number.isFinite(face) || face <= 0) return "Indiquez la valeur du bon en CHF.";
    }
    if (form.kind === "experience") {
      const price = form.salePriceChf === "" ? 0 : Number(form.salePriceChf);
      if (!Number.isFinite(price) || price < 0) return "Indiquez le prix de vente, ou 0.";
    }
    return null;
  }

  async function save(status: "inactive" | "active") {
    if (saving || uploading) return;
    const missingBasics = !form.kind || !form.title.trim();
    if (missingBasics) {
      setError("Choisissez un type et un titre avant d’enregistrer.");
      return;
    }
    if (form.kind === "monetary") {
      const face = Number(form.faceValueChf || form.salePriceChf);
      if (!Number.isFinite(face) || face <= 0) {
        setError("Indiquez la valeur du bon en CHF.");
        return;
      }
    }
    if (status === "active") {
      const publishError = validateForPublish();
      if (publishError) {
        setError(publishError);
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: form.title.trim(),
        shortDescription: form.shortDescription,
        detailedDescription: form.detailedDescription,
        imageUrl: form.imageUrl || undefined,
        kind: form.kind,
        salePriceChf: form.salePriceChf === "" ? 0 : Number(form.salePriceChf),
        faceValueChf: form.faceValueChf === "" ? undefined : Number(form.faceValueChf),
        experienceLabel: form.experienceLabel,
        partySize: form.partySize === "" ? undefined : Number(form.partySize),
        validityMonths: Number(form.validityMonths),
        terms: form.terms,
        status,
        clearImage: offer && !form.imageUrl ? true : undefined,
      };
      const response = await fetch(offer ? `/api/gift-voucher-offers/${offer.id}` : "/api/gift-voucher-offers", {
        method: offer ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as { offer?: GiftVoucherOffer; error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Impossible d’enregistrer l’offre.");
        return;
      }
      showToast({
        message: status === "active" ? "Offre publiée. Elle apparaît sur la page publique." : "Brouillon enregistré.",
      });
      router.push("/dashboard/gift-vouchers/offers");
      router.refresh();
    } catch {
      setError("Impossible d’enregistrer l’offre. Vérifiez votre connexion.");
    } finally {
      setSaving(false);
    }
  }

  const preview: OfferPreviewModel = {
    title: form.title,
    shortDescription: form.shortDescription,
    imageUrl: form.imageUrl,
    kind: form.kind ?? "monetary",
    salePriceChf: form.salePriceChf,
    faceValueChf: form.faceValueChf,
    partySize: form.partySize,
  };

  const busy = saving || uploading;

  return (
    <section className="w-full min-w-0 space-y-6 md:space-y-8">
      <PageHeader
        title={offer ? "Modifier l’offre" : "Créer une offre"}
        subtitle={
          offer
            ? "Les nouveaux bons utiliseront cette version. Les bons déjà émis conservent leur snapshot."
            : "Cette offre pourra apparaître sur votre page publique une fois publiée."
        }
        secondaryActions={[{ kind: "button", label: "Retour", onClick: () => leave("/dashboard/gift-vouchers/offers") }]}
      />
      <GiftVoucherSectionNav />

      {!form.kind ? (
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => patch({ kind: "monetary", faceValueChf: form.faceValueChf || "80" })}
            className="rounded-3xl border border-zg-border bg-zg-surface p-6 text-left transition hover:border-zg-accent/40"
          >
            <Banknote className="h-8 w-8 text-zg-accent" />
            <h2 className="mt-4 text-lg font-semibold text-zg-fg">Bon d’un montant</h2>
            <p className="mt-2 text-sm leading-relaxed text-zg-text-muted">
              Crédit en CHF, utilisable en plusieurs fois, avec solde restant visible.
            </p>
          </button>
          <button
            type="button"
            onClick={() => patch({ kind: "experience", title: form.title || "Visite de la cave et apéritif" })}
            className="rounded-3xl border border-zg-border bg-zg-surface p-6 text-left transition hover:border-zg-accent/40"
          >
            <Sparkles className="h-8 w-8 text-zg-accent" />
            <h2 className="mt-4 text-lg font-semibold text-zg-fg">Expérience</h2>
            <p className="mt-2 text-sm leading-relaxed text-zg-text-muted">
              Prestation définie (menu, massage, visite, nuitée), utilisée en une seule fois.
            </p>
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void save("active");
            }}
          >
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => patch({ kind: "monetary" })}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold",
                  form.kind === "monetary" ? "bg-zg-accent text-white" : "bg-zg-surface-elevated text-zg-text-muted",
                )}
              >
                Montant
              </button>
              <button
                type="button"
                onClick={() => patch({ kind: "experience" })}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold",
                  form.kind === "experience" ? "bg-zg-accent text-white" : "bg-zg-surface-elevated text-zg-text-muted",
                )}
              >
                Expérience
              </button>
            </div>

            <div className="rounded-3xl border border-zg-border bg-zg-surface p-5 sm:p-6">
              <h2 className="text-base font-semibold text-zg-fg">Contenu</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="dashboard-field-label" htmlFor="offer-title">
                    Titre
                  </label>
                  <Input
                    id="offer-title"
                    className="mt-1.5"
                    value={form.title}
                    onChange={(event) => patch({ title: event.target.value })}
                    placeholder={form.kind === "experience" ? "Visite de la cave et apéritif" : "Bon cadeau 80 CHF"}
                    required
                  />
                </div>
                <div>
                  <label className="dashboard-field-label" htmlFor="offer-short">
                    Description courte
                  </label>
                  <Textarea
                    id="offer-short"
                    className="mt-1.5 min-h-20"
                    value={form.shortDescription}
                    onChange={(event) => patch({ shortDescription: event.target.value })}
                    maxLength={280}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label" htmlFor="offer-long">
                    Description détaillée (facultatif)
                  </label>
                  <Textarea
                    id="offer-long"
                    className="mt-1.5 min-h-28"
                    value={form.detailedDescription}
                    onChange={(event) => patch({ detailedDescription: event.target.value })}
                  />
                </div>
                {form.kind === "monetary" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="dashboard-field-label" htmlFor="offer-value">
                        Valeur du bon (CHF)
                      </label>
                      <Input
                        id="offer-value"
                        className="mt-1.5"
                        inputMode="decimal"
                        value={form.faceValueChf || form.salePriceChf}
                        onChange={(event) =>
                          patch({ faceValueChf: event.target.value, salePriceChf: event.target.value })
                        }
                      />
                      <p className="mt-1 text-xs text-zg-text-muted">Utilisable en plusieurs fois, jusqu’à épuisement du solde.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="dashboard-field-label" htmlFor="offer-price">
                        Prix de vente (CHF)
                      </label>
                      <Input
                        id="offer-price"
                        className="mt-1.5"
                        inputMode="decimal"
                        value={form.salePriceChf}
                        onChange={(event) => patch({ salePriceChf: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="dashboard-field-label" htmlFor="offer-people">
                        Nombre de personnes (facultatif)
                      </label>
                      <Input
                        id="offer-people"
                        className="mt-1.5"
                        inputMode="numeric"
                        value={form.partySize}
                        onChange={(event) => patch({ partySize: event.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="dashboard-field-label" htmlFor="offer-exp">
                        Contenu de la prestation
                      </label>
                      <Input
                        id="offer-exp"
                        className="mt-1.5"
                        value={form.experienceLabel}
                        onChange={(event) => patch({ experienceLabel: event.target.value })}
                        placeholder="Menu dégustation, massage 60 min…"
                      />
                      <p className="mt-1 text-xs text-zg-text-muted">Utilisation unique. Le scanner proposera « Valider cette prestation ».</p>
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label" htmlFor="offer-validity">
                      Durée de validité
                    </label>
                    <Select
                      id="offer-validity"
                      className="mt-1.5"
                      value={form.validityMonths}
                      onChange={(event) => patch({ validityMonths: event.target.value })}
                    >
                      {[3, 6, 12, 18, 24].map((months) => (
                        <option key={months} value={months}>
                          {months} mois
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="dashboard-field-label" htmlFor="offer-terms">
                    Conditions particulières (facultatif)
                  </label>
                  <Textarea
                    id="offer-terms"
                    className="mt-1.5 min-h-24"
                    value={form.terms}
                    onChange={(event) => patch({ terms: event.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zg-border bg-zg-surface p-5 sm:p-6">
              <GiftVoucherOfferImageField
                restaurantId={restaurantId}
                imageUrl={form.imageUrl}
                onChange={(imageUrl) => patch({ imageUrl })}
                onBusyChange={setUploading}
                onError={setError}
              />
            </div>

            {error ? <p className="text-sm text-zg-danger">{error}</p> : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" disabled={busy} onClick={() => void save("inactive")}>
                Enregistrer comme brouillon
              </Button>
              <Button type="submit" disabled={busy}>
                {saving ? "Publication…" : "Publier l’offre"}
              </Button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <GiftVoucherOfferLivePreview model={preview} />
          </aside>
        </div>
      )}
    </section>
  );
}
