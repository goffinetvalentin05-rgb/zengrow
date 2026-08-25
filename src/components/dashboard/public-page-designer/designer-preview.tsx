"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import PublicStorefrontPage from "@/src/components/public-storefront/public-storefront-page";
import type { PublicGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";
import type { StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import type { StorefrontConfig } from "@/src/lib/public-storefront/schema";
import { cn } from "@/src/lib/utils";

export type PreviewDevice = "desktop" | "tablet" | "phone";

const FRAME: Record<PreviewDevice, string> = {
  desktop: "w-full max-w-none",
  tablet: "w-[768px] max-w-full",
  phone: "w-[390px] max-w-full",
};

type DesignerPreviewProps = {
  config: StorefrontConfig;
  identity: StorefrontIdentity;
  offers: PublicGiftVoucherOffer[];
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
};

export default function DesignerPreview({ config, identity, offers, device, onDeviceChange }: DesignerPreviewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zg-app">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zg-border px-3 py-2">
        <p className="text-xs font-medium text-zg-text-muted">Aperçu du brouillon</p>
        <div className="inline-flex rounded-lg border border-zg-border p-0.5">
          {(
            [
              ["desktop", Monitor, "Ordinateur"],
              ["tablet", Tablet, "Tablette"],
              ["phone", Smartphone, "Téléphone"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={device === id}
              onClick={() => onDeviceChange(id)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium",
                device === id ? "bg-zg-surface-elevated text-zg-fg" : "text-zg-text-muted hover:text-zg-fg",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3 md:p-5">
        <div
          className={cn(
            "mx-auto overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm",
            FRAME[device],
            device !== "desktop" && "min-h-[640px]",
          )}
        >
          <div className="flex h-8 items-center gap-1.5 border-b border-black/10 bg-neutral-100 px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="ml-2 truncate font-mono text-[10px] text-neutral-500">/r/{identity.slug}</span>
          </div>
          <div className={cn("overflow-y-auto", device === "desktop" ? "max-h-[calc(100dvh-220px)]" : "h-[640px]")}>
            <PublicStorefrontPage config={config} identity={identity} offers={offers} previewMode draftBanner />
          </div>
        </div>
      </div>
    </div>
  );
}
