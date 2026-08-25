"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Copy, Eye, GripVertical, Pencil, Plus, Power } from "lucide-react";
import GiftVoucherOfferFormModal from "@/src/components/dashboard/gift-cards/gift-voucher-offer-form-modal";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import Button from "@/src/components/ui/button";
import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";
import { offerKindLabel } from "@/src/lib/gift-vouchers/offers/map";
import type { GiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";
import { cn } from "@/src/lib/utils";

type GiftVoucherOffersSectionProps = {
  restaurantId: string;
};

function offerPriceLabel(offer: GiftVoucherOffer): string {
  if (offer.kind === "monetary") {
    return formatCentsAsChf(offer.faceValueCents ?? offer.salePriceCents);
  }
  return offer.salePriceCents > 0 ? formatCentsAsChf(offer.salePriceCents) : "Offrir";
}

export default function GiftVoucherOffersSection({ restaurantId }: GiftVoucherOffersSectionProps) {
  const showToast = useDashboardToast();
  const [offers, setOffers] = useState<GiftVoucherOffer[]>([]);
  const [archived, setArchived] = useState<GiftVoucherOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GiftVoucherOffer | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/gift-voucher-offers?includeArchived=1");
    const payload = (await response.json().catch(() => null)) as { offers?: GiftVoucherOffer[]; error?: string } | null;
    if (!response.ok || !payload?.offers) {
      throw new Error(payload?.error ?? "Impossible de charger les offres.");
    }
    setOffers(payload.offers.filter((offer) => offer.status !== "archived"));
    setArchived(payload.offers.filter((offer) => offer.status === "archived"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await load();
      } catch (error) {
        if (!cancelled) {
          showToast({ message: error instanceof Error ? error.message : "Impossible de charger les offres." });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, showToast]);

  const visible = useMemo(() => offers, [offers]);

  async function patchAction(id: string, action: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/gift-voucher-offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json().catch(() => null)) as { offer?: GiftVoucherOffer; error?: string } | null;
      if (!response.ok) {
        showToast({ message: payload?.error ?? "Action impossible." });
        return;
      }
      await load();
      if (action === "duplicate") showToast({ message: "Offre dupliquée (inactive)." });
      if (action === "archive") showToast({ message: "Offre archivée. Les bons déjà vendus restent valides." });
    } catch {
      showToast({ message: "Action impossible. Vérifiez votre connexion." });
    } finally {
      setBusyId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= offers.length) return;
    const reordered = [...offers];
    const [item] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, item);
    setOffers(reordered);
    try {
      await fetch("/api/gift-voucher-offers/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: reordered.map((offer) => offer.id) }),
      });
    } catch {
      showToast({ message: "Impossible de réordonner les offres." });
      await load();
    }
  }

  async function previewPdf(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/gift-voucher-offers/${id}/preview-pdf`);
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        showToast({ message: payload?.error ?? "Impossible de prévisualiser le PDF." });
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      showToast({ message: "Impossible de prévisualiser le PDF." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-zg-border bg-zg-surface p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zg-fg">Mes offres</h2>
          <p className="mt-1 text-sm text-zg-text-muted">
            Catalogue des modèles. Chaque bon émis conserve un snapshot de l’offre choisie.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Créer une offre
        </Button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-zg-text-muted">Chargement des offres…</p>
      ) : visible.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-zg-border px-4 py-8 text-center text-sm text-zg-text-muted">
          Aucune offre pour l’instant. Créez un bon de 80 CHF ou une expérience pour alimenter le catalogue public.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {visible.map((offer, index) => (
            <li
              key={offer.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-zg-border p-3 sm:flex-row sm:items-center",
                offer.status === "inactive" && "opacity-70",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="hidden flex-col sm:flex">
                  <button
                    type="button"
                    className="rounded p-1 text-zg-text-muted hover:bg-zg-card-hover disabled:opacity-30"
                    disabled={index === 0}
                    onClick={() => void move(index, -1)}
                    aria-label="Monter"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1 text-zg-text-muted hover:bg-zg-card-hover disabled:opacity-30"
                    disabled={index === visible.length - 1}
                    onClick={() => void move(index, 1)}
                    aria-label="Descendre"
                  >
                    <GripVertical className="h-4 w-4 rotate-180" />
                  </button>
                </div>
                {offer.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={offer.imageUrl} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-zg-accent-soft-bg text-xs font-semibold text-zg-accent">
                    Offre
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-zg-fg">{offer.title}</p>
                  <p className="mt-0.5 text-xs text-zg-text-muted">
                    {offerKindLabel(offer.kind)} · {offerPriceLabel(offer)}
                    {offer.status === "inactive" ? " · Inactive" : ""}
                  </p>
                  {offer.shortDescription ? (
                    <p className="mt-1 line-clamp-2 text-sm text-zg-text-muted">{offer.shortDescription}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busyId === offer.id}
                  onClick={() => {
                    setEditing(offer);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={busyId === offer.id} onClick={() => void previewPdf(offer.id)}>
                  <Eye className="h-4 w-4" />
                  PDF
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={busyId === offer.id} onClick={() => void patchAction(offer.id, "duplicate")}>
                  <Copy className="h-4 w-4" />
                  Dupliquer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busyId === offer.id}
                  onClick={() => void patchAction(offer.id, offer.status === "active" ? "deactivate" : "activate")}
                >
                  <Power className="h-4 w-4" />
                  {offer.status === "active" ? "Désactiver" : "Activer"}
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={busyId === offer.id} onClick={() => void patchAction(offer.id, "archive")}>
                  <Archive className="h-4 w-4" />
                  Archiver
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {archived.length > 0 ? (
        <div className="mt-4">
          <button type="button" className="text-sm font-medium text-zg-accent" onClick={() => setShowArchived((value) => !value)}>
            {showArchived ? "Masquer les archives" : `Voir les archives (${archived.length})`}
          </button>
          {showArchived ? (
            <ul className="mt-3 space-y-2">
              {archived.map((offer) => (
                <li key={offer.id} className="flex items-center justify-between rounded-xl border border-dashed border-zg-border px-3 py-2 text-sm">
                  <span className="text-zg-text-muted">{offer.title}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => void patchAction(offer.id, "activate")}>
                    Réactiver
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <GiftVoucherOfferFormModal
        open={formOpen}
        restaurantId={restaurantId}
        offer={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          setFormOpen(false);
          setEditing(null);
          void load();
        }}
      />
    </section>
  );
}
