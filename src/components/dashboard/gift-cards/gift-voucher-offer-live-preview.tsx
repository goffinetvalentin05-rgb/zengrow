"use client";

import { Gift } from "lucide-react";
import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";
import type { GiftVoucherOfferKind } from "@/src/lib/gift-vouchers/offers/types";
import { offerKindShortLabel } from "@/src/lib/gift-vouchers/offers/status";
import { cn } from "@/src/lib/utils";

export type OfferPreviewModel = {
  title: string;
  shortDescription: string;
  imageUrl: string;
  kind: GiftVoucherOfferKind;
  salePriceChf: string;
  faceValueChf: string;
  partySize: string;
};

function previewPrice(model: OfferPreviewModel): string {
  if (model.kind === "monetary") {
    const value = Number(model.faceValueChf || model.salePriceChf);
    return Number.isFinite(value) && value > 0 ? formatCentsAsChf(Math.round(value * 100)) : "Montant";
  }
  const price = Number(model.salePriceChf);
  return Number.isFinite(price) && price > 0 ? formatCentsAsChf(Math.round(price * 100)) : "Offrir";
}

export default function GiftVoucherOfferLivePreview({ model }: { model: OfferPreviewModel }) {
  const title = model.title.trim() || "Titre de l’offre";
  const cta = model.kind === "experience" ? "Offrir cette expérience" : "Choisir ce bon";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zg-text-muted">Carte publique</p>
        <article className="mt-2 overflow-hidden rounded-2xl border border-zg-border bg-zg-surface">
          <div className="relative aspect-[16/10] overflow-hidden bg-zg-accent-soft-bg">
            {model.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={model.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Gift className="h-10 w-10 text-zg-accent/50" />
              </div>
            )}
          </div>
          <div className="space-y-2 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zg-accent">{offerKindShortLabel(model.kind)}</p>
            <h3 className="text-lg font-semibold text-zg-fg">{title}</h3>
            {model.shortDescription.trim() ? (
              <p className="line-clamp-2 text-sm text-zg-text-muted">{model.shortDescription.trim()}</p>
            ) : (
              <p className="text-sm text-zg-text-muted">Description courte visible sur la page publique.</p>
            )}
            <p className="text-sm font-semibold text-zg-accent">{previewPrice(model)}</p>
            <div className="rounded-xl bg-zg-accent px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              {cta}
            </div>
          </div>
        </article>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zg-text-muted">Aperçu PDF</p>
        <div className="mt-2 rounded-2xl border border-zg-border bg-white p-4 text-[#0f172a] shadow-sm">
          <div className={cn("overflow-hidden rounded-xl", model.imageUrl ? "" : "bg-[#1E4ED8]")}>
            {model.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={model.imageUrl} alt="" className="h-28 w-full object-cover" />
            ) : (
              <div className="flex h-28 items-center justify-center px-4 text-center text-sm font-semibold text-white">
                {title}
              </div>
            )}
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E4ED8]">
            {model.kind === "experience" ? "Expérience" : "Bon cadeau"}
          </p>
          <p className="mt-1 text-lg font-semibold">{title}</p>
          {model.kind === "monetary" ? (
            <p className="mt-1 text-xl font-bold text-[#1E4ED8]">{previewPrice(model)}</p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              {model.partySize ? `${model.partySize} personne(s)` : "Prestation — sans gros montant"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
