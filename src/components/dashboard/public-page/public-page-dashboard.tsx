"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Eye, Instagram, Sparkles } from "lucide-react";
import {
  SHOWROOM_PRODUCT_NAME,
  SHOWROOM_PRODUCT_TAGLINE,
} from "@/src/lib/showroom/branding";
import { createClient } from "@/src/lib/supabase/client";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import PublicPageSettingsPanel, {
  type PublicPageSettingsHandle,
  type PublicPageSettingsInitial,
} from "@/src/components/dashboard/public-page/public-page-settings-panel";
import PublicPageSectionNav from "@/src/components/dashboard/public-page/public-page-section-nav";
import PublicPageStatusLine from "@/src/components/dashboard/public-page/public-page-status-line";
import PublicPageSaveIndicator, {
  type PublicPageSaveStatus,
} from "@/src/components/dashboard/public-page/public-page-save-indicator";
import type { PublicPagePublishState } from "@/src/components/dashboard/public-page/public-page-types";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { CheckCircle2 } from "lucide-react";

const AUTOSAVE_MS = 500;

type PublicPageDashboardProps = {
  initial: PublicPageSettingsInitial;
  publicLink: string;
};

export default function PublicPageDashboard({ initial, publicLink }: PublicPageDashboardProps) {
  const supabase = createClient();
  const showToast = useDashboardToast();
  const panelRef = useRef<PublicPageSettingsHandle | null>(null);
  const [publicPath, setPublicPath] = useState(publicLink);
  const [publishState, setPublishState] = useState<PublicPagePublishState>({
    pageStatus: initial.pageStatus,
    publishedAt: initial.publishedAt,
    hasUnpublishedChanges: false,
  });
  const [saveStatus, setSaveStatus] = useState<PublicPageSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autosaveTick, setAutosaveTick] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const effectivePublicPath = useMemo(() => {
    const slug = panelRef.current?.getSlug() ?? initial.slug;
    return publicLink.replace(initial.slug, slug);
  }, [publicLink, initial.slug, publicPath]);

  const handleSave = useCallback(async () => {
    const panel = panelRef.current;
    if (!panel) return { ok: false as const };

    setSaveStatus("saving");
    setSaveError(null);

    const restaurantPatch = panel.getRestaurantUpdate();
    const settingsPatch = panel.getSettingsUpdate();
    const slug = panel.getSlug();

    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update(restaurantPatch)
      .eq("id", initial.restaurantId);

    if (restaurantError) {
      setSaveError(restaurantError.message);
      setSaveStatus("error");
      return { ok: false as const, error: restaurantError.message };
    }

    const { error: settingsError } = await supabase
      .from("restaurant_settings")
      .upsert(
        { restaurant_id: initial.restaurantId, ...settingsPatch },
        { onConflict: "restaurant_id" },
      );

    if (settingsError) {
      setSaveError(settingsError.message);
      setSaveStatus("error");
      return { ok: false as const, error: settingsError.message };
    }

    const sectionsResult = await panel.syncPageSectionsToDatabase();
    if (!sectionsResult.ok) {
      const err = sectionsResult.error ?? "Échec de la synchronisation des sections.";
      setSaveError(err);
      setSaveStatus("error");
      return { ok: false as const, error: err };
    }

    panel.acknowledgeSave();
    setPublishState(panel.getPublishState());
    setPublicPath(publicLink.replace(initial.slug, slug));
    setSaveStatus("saved");
    window.setTimeout(() => setSaveStatus("idle"), 2000);
    return { ok: true as const };
  }, [supabase, initial.restaurantId, initial.slug, publicLink]);

  const handleDirtyChange = useCallback(() => {
    setSaveStatus("pending");
    setAutosaveTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (autosaveTick === 0) return;
    const panel = panelRef.current;
    if (!panel?.hasPendingChanges()) {
      setSaveStatus("idle");
      return;
    }

    const timer = window.setTimeout(() => {
      void handleSave();
    }, AUTOSAVE_MS);

    return () => window.clearTimeout(timer);
  }, [autosaveTick, handleSave]);

  const handlePublish = useCallback(async () => {
    const panel = panelRef.current;
    if (!panel) return;

    setIsPublishing(true);

    if (panel.hasPendingChanges()) {
      const saveResult = await handleSave();
      if (!saveResult.ok) {
        setIsPublishing(false);
        return;
      }
    }

    const result = await panel.publishPage();
    setIsPublishing(false);

    if (result.noop) {
      showToast({ message: "Aucun changement à publier.", icon: CheckCircle2 });
      return;
    }

    if (!result.ok) {
      showToast({ message: result.error ?? "Échec de la publication." });
      return;
    }

    setPublicPath(publicLink.replace(initial.slug, panel.getSlug()));
    showToast({ message: "Showroom publié.", icon: CheckCircle2 });
  }, [handleSave, initial.slug, publicLink, showToast]);

  const publishLabel = useMemo(() => {
    if (isPublishing) return "Publication…";
    const pending = publishState.hasUnpublishedChanges;
    if (publishState.pageStatus === "published") {
      return pending ? "Publier les changements" : "Publier";
    }
    return "Publier";
  }, [isPublishing, publishState]);

  return (
    <DashboardContent className="pb-16">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-zg-border/80 bg-gradient-to-br from-zg-accent/12 via-zg-surface to-zg-surface px-5 py-5 sm:px-7 sm:py-6">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-zg-accent/15 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-zg-accent">
                Page de conversion
              </p>
              <h2 className="text-xl font-bold tracking-tight text-zg-fg sm:text-2xl">
                {SHOWROOM_PRODUCT_NAME}
              </h2>
              <p className="text-sm leading-relaxed text-zg-text-muted">{SHOWROOM_PRODUCT_TAGLINE}</p>
            </div>
            <div className="flex items-center gap-2 text-zg-text-muted">
              <Instagram className="h-5 w-5 shrink-0 text-zg-accent" aria-hidden />
              <p className="text-xs leading-snug sm:max-w-[200px]">
                Une page courte qui donne envie de réserver — pas un site internet complet.
              </p>
            </div>
          </div>
        </div>

        <PageHeader
          title={SHOWROOM_PRODUCT_NAME}
          subtitle="Page de conversion mobile · réservez depuis Instagram, TikTok ou le lien en bio"
          secondaryActions={[
            {
              kind: "external",
              href: effectivePublicPath,
              label: "Aperçu",
              icon: <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />,
            },
            {
              kind: "copy",
              label: "Copier le lien",
              value: effectivePublicPath,
              icon: <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />,
            },
          ]}
          primaryAction={{
            kind: "button",
            label: publishLabel,
            icon: <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />,
            onClick: handlePublish,
            disabled: isPublishing,
          }}
        />

        <PublicPageStatusLine publicPath={effectivePublicPath} publishState={publishState} />

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <PublicPageSectionNav className="xl:order-1" />
          <div className="min-w-0 flex-1 space-y-8 xl:order-2">
            <PublicPageSettingsPanel
              ref={panelRef}
              initial={initial}
              publicLinkBase={publicPath}
              showSummaryBar={false}
              hidePreviewPublish
              hideZoneNav
              hideLivePreview={false}
              onDirtyChange={handleDirtyChange}
              onPublishStateChange={setPublishState}
            />
          </div>
        </div>
      </div>

      <PublicPageSaveIndicator status={saveStatus} errorMessage={saveError} />
    </DashboardContent>
  );
}
