"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, RotateCcw } from "lucide-react";
import DesignerPanel from "@/src/components/dashboard/public-page-designer/designer-panel";
import DesignerPreview, { type PreviewDevice } from "@/src/components/dashboard/public-page-designer/designer-preview";
import ActionMenu from "@/src/components/dashboard/ui/action-menu";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import Button from "@/src/components/ui/button";
import type { PublicGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";
import type { StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import { configsAreEqual, type StorefrontConfig } from "@/src/lib/public-storefront/schema";
import { cn } from "@/src/lib/utils";

type PublicPageDesignerProps = {
  restaurantId: string;
  publicUrl: string;
  identity: StorefrontIdentity;
  offers: PublicGiftVoucherOffer[];
  initialDraft: StorefrontConfig;
  initialPublished: StorefrontConfig | null;
  initialPublishedAt: string | null;
};

export default function PublicPageDesigner({
  restaurantId,
  publicUrl,
  identity,
  offers,
  initialDraft,
  initialPublished,
  initialPublishedAt,
}: PublicPageDesignerProps) {
  const showToast = useDashboardToast();
  const [draft, setDraft] = useState(initialDraft);
  const [savedDraft, setSavedDraft] = useState(initialDraft);
  const [published, setPublished] = useState(initialPublished);
  const [publishedAt, setPublishedAt] = useState(initialPublishedAt);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = !configsAreEqual(draft, savedDraft);
  const unpublished = !published || !configsAreEqual(draft, published);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const statusLabel = useMemo(() => {
    if (!published) return "Non publiée";
    if (unpublished) return "Modifications non publiées";
    return "Publiée";
  }, [published, unpublished]);

  const saveDraft = useCallback(async () => {
    if (saving || publishing) return false;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/public-page-designer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: draft }),
      });
      const payload = (await response.json().catch(() => null)) as { config?: StorefrontConfig; error?: string } | null;
      if (!response.ok || !payload?.config) {
        const message = payload?.error ?? "Enregistrement impossible.";
        setError(message);
        showToast({ message });
        return false;
      }
      setSavedDraft(payload.config);
      setDraft(payload.config);
      showToast({ message: "Brouillon enregistré.", icon: CheckCircle2 });
      return true;
    } finally {
      setSaving(false);
    }
  }, [draft, publishing, saving, showToast]);

  const publish = useCallback(async () => {
    if (saving || publishing) return;
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch("/api/public-page-designer/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: draft }),
      });
      const payload = (await response.json().catch(() => null)) as {
        config?: StorefrontConfig;
        publishedAt?: string;
        error?: string;
      } | null;
      if (!response.ok || !payload?.config) {
        const message = payload?.error ?? "Publication impossible.";
        setError(message);
        showToast({ message });
        return;
      }
      setDraft(payload.config);
      setSavedDraft(payload.config);
      setPublished(payload.config);
      setPublishedAt(payload.publishedAt ?? new Date().toISOString());
      showToast({ message: "Page publique publiée.", icon: CheckCircle2 });
    } finally {
      setPublishing(false);
    }
  }, [draft, publishing, saving, showToast]);

  async function resetToPublished() {
    if (saving || publishing) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/public-page-designer/reset", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as { config?: StorefrontConfig; error?: string } | null;
      if (!response.ok || !payload?.config) {
        const message = payload?.error ?? "Réinitialisation impossible.";
        setError(message);
        showToast({ message });
        return;
      }
      setDraft(payload.config);
      setSavedDraft(payload.config);
      showToast({ message: "Brouillon réinitialisé à la version publiée.", icon: CheckCircle2 });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="-mx-4 -mb-6 -mt-8 flex h-[calc(100dvh-72px)] min-h-[640px] flex-col md:-mx-8 md:-mb-8 md:-mt-10">
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-zg-border bg-zg-surface/80 px-3 py-2.5 backdrop-blur md:px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zg-fg">Page publique</p>
          <p className="truncate text-xs text-zg-text-muted">
            <span
              className={cn(
                "mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                unpublished ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800",
              )}
            >
              {statusLabel}
            </span>
            {publishedAt ? `Dernière publication ${new Date(publishedAt).toLocaleString("fr-CH")}` : "Jamais publiée"}
            {dirty ? " · non enregistré" : null}
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}>
          <Eye className="h-4 w-4" />
          Voir la page publique
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={saving || publishing || !dirty} onClick={() => void saveDraft()}>
          {saving ? "Enregistrement…" : "Enregistrer le brouillon"}
        </Button>
        <Button type="button" size="sm" disabled={saving || publishing} onClick={() => void publish()}>
          {publishing ? "Publication…" : "Publier"}
        </Button>
        <ActionMenu
          compact
          label="Plus"
          items={[
            {
              kind: "action",
              label: "Réinitialiser le brouillon",
              icon: <RotateCcw className="h-4 w-4" />,
              onClick: () => void resetToPublished(),
              disabled: saving || publishing,
            },
          ]}
        />
      </header>

      {error ? <p className="shrink-0 border-b border-zg-danger/30 bg-red-50 px-4 py-2 text-sm text-zg-danger">{error}</p> : null}

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-full shrink-0 flex-col border-r border-zg-border bg-zg-app md:w-[360px] lg:w-[380px]">
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <DesignerPanel restaurantId={restaurantId} config={draft} identity={identity} onChange={setDraft} />
          </div>
          <div className="border-t border-zg-border p-3 md:hidden">
            <Button type="button" className="w-full" onClick={() => setMobilePreview(true)}>
              Voir l’aperçu
            </Button>
          </div>
        </aside>
        <div className="hidden min-w-0 flex-1 md:flex">
          <DesignerPreview config={draft} identity={identity} offers={offers} device={device} onDeviceChange={setDevice} />
        </div>
      </div>

      {mobilePreview ? (
        <div className="fixed inset-0 z-[80] flex flex-col bg-zg-app md:hidden">
          <div className="flex items-center justify-between border-b border-zg-border px-3 py-2">
            <p className="text-sm font-semibold">Aperçu</p>
            <Button type="button" variant="secondary" size="sm" onClick={() => setMobilePreview(false)}>
              Fermer
            </Button>
          </div>
          <DesignerPreview config={draft} identity={identity} offers={offers} device={device} onDeviceChange={setDevice} />
        </div>
      ) : null}
    </div>
  );
}
