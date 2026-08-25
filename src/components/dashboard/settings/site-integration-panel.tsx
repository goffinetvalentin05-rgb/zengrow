"use client";

import { Globe } from "lucide-react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import { SettingsCategoryCard } from "@/src/components/dashboard/settings/settings-category-card";
import { SettingsQrBlock, useCopyToClipboard } from "@/src/components/dashboard/settings/settings-copy-qr";
import { giftShopEmbedSnippet, restaurantGiftShopUrl, restaurantPublicPageUrl } from "@/src/lib/settings/public-urls";

type SiteIntegrationPanelProps = {
  origin: string;
  slug: string;
};

export function SiteIntegrationPanel({ origin, slug }: SiteIntegrationPanelProps) {
  const publicUrl = restaurantPublicPageUrl(origin, slug);
  const shopUrl = restaurantGiftShopUrl(origin, slug);
  const snippet = giftShopEmbedSnippet(origin, slug);
  const publicCopy = useCopyToClipboard();
  const shopCopy = useCopyToClipboard();
  const snippetCopy = useCopyToClipboard();

  return (
    <SettingsCategoryCard
      icon={Globe}
      iconWrapClassName="bg-zg-premium-soft-bg text-zg-premium"
      iconClassName="text-zg-premium"
      title="Intégration site"
      subtitle="Liens et bouton HTML vers votre boutique de bons."
    >
      <SettingsAccordion title="Lien public" defaultOpen>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={publicUrl} className="font-mono text-xs sm:text-sm" />
          <Button type="button" variant="secondary" size="sm" onClick={() => void publicCopy.copy(publicUrl)}>
            {publicCopy.copied ? "Copié" : "Copier"}
          </Button>
        </div>
        {publicCopy.error ? <p className="mt-2 text-sm text-zg-danger">{publicCopy.error}</p> : null}
      </SettingsAccordion>

      <SettingsAccordion title="Bouton vers la boutique de bons" defaultOpen>
        <p className="text-sm text-zg-text-muted">
          Lien direct vers la section bons cadeaux de votre page. Collez-le sur votre site, vos réseaux ou un bouton
          existant.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={shopUrl} className="font-mono text-xs sm:text-sm" />
          <Button type="button" variant="secondary" size="sm" onClick={() => void shopCopy.copy(shopUrl)}>
            {shopCopy.copied ? "Copié" : "Copier"}
          </Button>
        </div>
        {shopCopy.error ? <p className="mt-2 text-sm text-zg-danger">{shopCopy.error}</p> : null}
      </SettingsAccordion>

      <SettingsAccordion title="QR téléchargeable">
        <SettingsQrBlock value={shopUrl} filename={`zengrow-integration-${slug}.png`} label="QR d’intégration vers les bons" />
      </SettingsAccordion>

      <SettingsAccordion title="Bouton HTML" description="Lien simple à coller sur un site externe. Pas de widget JavaScript.">
        <Textarea readOnly className="min-h-20 font-mono text-xs" value={snippet} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => void snippetCopy.copy(snippet)}>
            {snippetCopy.copied ? "Copié" : "Copier le code"}
          </Button>
          <p className="text-xs text-zg-text-muted">
            Un widget JavaScript n’est pas proposé : il n’est pas encore disponible pour un site externe.
          </p>
        </div>
        {snippetCopy.error ? <p className="mt-2 text-sm text-zg-danger">{snippetCopy.error}</p> : null}
      </SettingsAccordion>
    </SettingsCategoryCard>
  );
}
