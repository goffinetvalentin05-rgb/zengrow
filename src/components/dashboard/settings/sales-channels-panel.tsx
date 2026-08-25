"use client";

import Link from "next/link";
import { ExternalLink, Globe, Nfc, Share2, Store } from "lucide-react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import { SettingsCategoryCard } from "@/src/components/dashboard/settings/settings-category-card";
import { SettingsQrBlock, useCopyToClipboard } from "@/src/components/dashboard/settings/settings-copy-qr";
import { restaurantGiftShopUrl, restaurantPublicPageUrl } from "@/src/lib/settings/public-urls";

type SalesChannelsPanelProps = {
  origin: string;
  slug: string;
};

export function SalesChannelsPanel({ origin, slug }: SalesChannelsPanelProps) {
  const publicUrl = restaurantPublicPageUrl(origin, slug);
  const shopUrl = restaurantGiftShopUrl(origin, slug);
  const publicCopy = useCopyToClipboard();
  const shopCopy = useCopyToClipboard();

  return (
    <SettingsCategoryCard
      icon={Globe}
      iconWrapClassName="bg-[#3B82F6]/15 text-[#3B82F6]"
      iconClassName="text-[#3B82F6]"
      title="Canaux de vente"
      subtitle="Chaque lien et QR pointe vers votre établissement."
    >
      <SettingsAccordion title="Page publique" defaultOpen>
        <p className="text-sm text-zg-text-muted">Vitrine de votre commerce, section bons cadeaux incluse.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={publicUrl} className="font-mono text-xs sm:text-sm" />
          <Button type="button" variant="secondary" size="sm" onClick={() => void publicCopy.copy(publicUrl)}>
            {publicCopy.copied ? "Copié" : "Copier"}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}>
            Ouvrir
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Link href="/dashboard/public-page">
            <Button type="button" variant="secondary" size="sm">
              Personnaliser la page
            </Button>
          </Link>
        </div>
        {publicCopy.error ? <p className="mt-2 text-sm text-zg-danger">{publicCopy.error}</p> : null}
      </SettingsAccordion>

      <SettingsAccordion title="Lien partageable" description="Atterrit directement sur la section bons cadeaux." defaultOpen>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={shopUrl} className="font-mono text-xs sm:text-sm" />
          <Button type="button" variant="secondary" size="sm" onClick={() => void shopCopy.copy(shopUrl)}>
            {shopCopy.copied ? "Copié" : "Copier"}
          </Button>
        </div>
        {shopCopy.error ? <p className="mt-2 text-sm text-zg-danger">{shopCopy.error}</p> : null}
      </SettingsAccordion>

      <SettingsAccordion title="QR code" description="À imprimer ou afficher en caisse.">
        <SettingsQrBlock value={shopUrl} filename={`zengrow-bons-${slug}.png`} label="QR vers la boutique de bons" />
      </SettingsAccordion>

      <SettingsAccordion title="Plaquette NFC" description="Encodez la même URL que le QR.">
        <div className="flex items-start gap-3 text-sm text-zg-text-muted">
          <Nfc className="mt-0.5 h-5 w-5 shrink-0 text-zg-accent" aria-hidden />
          <p>
            Programmez la puce avec le lien ci-dessus. Un tap ouvre la page de demande de bon de votre établissement,
            pas un autre commerce.
          </p>
        </div>
        <p className="mt-3 break-all font-mono text-xs text-zg-fg">{shopUrl}</p>
      </SettingsAccordion>

      <SettingsAccordion title="Vente manuelle" description="Création depuis le tableau de bord.">
        <div className="flex items-start gap-3">
          <Store className="mt-0.5 h-5 w-5 shrink-0 text-zg-accent" aria-hidden />
          <div>
            <p className="text-sm text-zg-text-muted">
              Créez un bon digital ou papier, suivez le solde et encaissez les utilisations.
            </p>
            <Link
              href="/dashboard/gift-vouchers"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-zg-accent hover:underline"
            >
              Ouvrir les bons cadeaux
              <Share2 className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </SettingsAccordion>
    </SettingsCategoryCard>
  );
}
