"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import GiftVoucherQr from "@/src/components/dashboard/gift-cards/gift-voucher-qr";
import GiftCardStatusBadge from "@/src/components/dashboard/gift-cards/gift-card-status-badge";
import Button from "@/src/components/ui/button";
import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";
import { formatGiftVoucherDate } from "@/src/lib/gift-vouchers/map";
import { giftVoucherPublicUrl } from "@/src/lib/gift-vouchers/public-token";
import { publicStatusHeadline, type PublicGiftVoucherView } from "@/src/lib/gift-vouchers/public-view";

type PublicGiftVoucherCardProps = {
  voucher: PublicGiftVoucherView;
  origin?: string;
};

export default function PublicGiftVoucherCard({ voucher, origin }: PublicGiftVoucherCardProps) {
  const [shareLabel, setShareLabel] = useState("Partager le bon");
  const url = giftVoucherPublicUrl(voucher.publicToken, origin);
  const headline = publicStatusHeadline(voucher.status);
  const showQr = voucher.status !== "draft";

  async function shareOrCopy() {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: `Bon cadeau ${voucher.restaurantName}`,
          text: `Bon cadeau ${voucher.code}`,
          url,
        });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel("Lien copié");
      window.setTimeout(() => setShareLabel("Copier le lien"), 2000);
    } catch {
      setShareLabel("Impossible de copier");
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-zg-border bg-white shadow-[0_24px_60px_-28px_rgba(79,70,229,0.35)]">
      <header className="border-b border-zg-border bg-zg-surface px-6 py-5">
        <div className="flex items-center gap-3">
          {voucher.restaurantLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={voucher.restaurantLogoUrl}
              alt=""
              className="h-12 w-12 rounded-xl border border-zg-border bg-white object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zg-accent-soft-bg text-sm font-semibold text-zg-accent">
              {voucher.restaurantName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Bon cadeau</p>
            <h1 className="truncate text-lg font-semibold text-zg-fg">{voucher.restaurantName}</h1>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-6 py-6">
        {headline ? (
          <p className="rounded-2xl border border-zg-border bg-zg-surface-elevated/70 px-4 py-3 text-center text-sm font-semibold text-zg-fg">
            {headline}
          </p>
        ) : null}

        {showQr ? (
          <div className="flex justify-center">
            <GiftVoucherQr value={url} size={248} label={`QR du bon ${voucher.code}`} />
          </div>
        ) : null}

        <div className="text-center">
          <p className="font-mono text-xl font-semibold tracking-[0.16em] text-zg-fg">{voucher.code}</p>
          <div className="mt-2 flex justify-center">
            <GiftCardStatusBadge status={voucher.status} />
          </div>
        </div>

        <dl className="space-y-3 rounded-2xl border border-zg-border bg-zg-surface px-4 py-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-zg-text-muted">Montant initial</dt>
            <dd className="font-medium text-zg-fg">{formatCentsAsChf(voucher.initialAmountCents)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-zg-text-muted">Solde restant</dt>
            <dd className="text-base font-semibold text-zg-fg">{formatCentsAsChf(voucher.remainingAmountCents)}</dd>
          </div>
          {voucher.recipientName?.trim() ? (
            <div className="flex justify-between gap-3">
              <dt className="text-zg-text-muted">Destinataire</dt>
              <dd className="max-w-[60%] text-right font-medium break-words text-zg-fg">{voucher.recipientName}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="text-zg-text-muted">Expiration</dt>
            <dd className="font-medium text-zg-fg">{formatGiftVoucherDate(voucher.expiresAt)}</dd>
          </div>
        </dl>

        <Button type="button" variant="secondary" className="min-h-12 w-full" onClick={() => void shareOrCopy()}>
          <Share2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          {shareLabel}
        </Button>
      </div>
    </article>
  );
}
