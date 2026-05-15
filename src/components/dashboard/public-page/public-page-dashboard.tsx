"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Copy, ExternalLink, Sparkles } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Button from "@/src/components/ui/button";
import PublicPageSettingsPanel, {
  type PublicPageSettingsHandle,
  type PublicPageSettingsInitial,
} from "@/src/components/dashboard/public-page/public-page-settings-panel";

type PublicPageDashboardProps = {
  initial: PublicPageSettingsInitial;
  publicLink: string;
};

export default function PublicPageDashboard({ initial, publicLink }: PublicPageDashboardProps) {
  const supabase = createClient();
  const panelRef = useRef<PublicPageSettingsHandle | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publicPath, setPublicPath] = useState(publicLink);

  const effectivePublicPath = useMemo(() => {
    const slug = panelRef.current?.getSlug() ?? initial.slug;
    return publicLink.replace(initial.slug, slug);
  }, [publicLink, initial.slug, publicPath]);

  const handleSave = useCallback(async () => {
    setMessage(null);
    setIsSaving(true);
    const panel = panelRef.current;
    if (!panel) {
      setIsSaving(false);
      return;
    }

    const restaurantPatch = panel.getRestaurantUpdate();
    const settingsPatch = panel.getSettingsUpdate();
    const slug = panel.getSlug();

    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update(restaurantPatch)
      .eq("id", initial.restaurantId);

    if (restaurantError) {
      setMessage(restaurantError.message);
      setIsSaving(false);
      return;
    }

    const { error: settingsError } = await supabase
      .from("restaurant_settings")
      .upsert(
        { restaurant_id: initial.restaurantId, ...settingsPatch },
        { onConflict: "restaurant_id" },
      );

    if (settingsError) {
      setMessage(settingsError.message);
      setIsSaving(false);
      return;
    }

    const sectionsResult = await panel.syncPageSectionsToDatabase();
    if (!sectionsResult.ok) {
      setMessage(sectionsResult.error ?? "Échec de la synchronisation des textes de section.");
      setIsSaving(false);
      return;
    }

    setPublicPath(publicLink.replace(initial.slug, slug));
    setMessage("Modifications enregistrées.");
    setSaveSuccess(true);
    window.setTimeout(() => setSaveSuccess(false), 2000);
    setIsSaving(false);
  }, [supabase, initial.restaurantId, initial.slug, publicLink]);

  const handlePublish = useCallback(async () => {
    setMessage(null);
    setIsPublishing(true);
    const panel = panelRef.current;
    if (!panel) {
      setIsPublishing(false);
      return;
    }

    const result = await panel.publishPage();
    if (!result.ok) {
      setMessage(result.error ?? "Échec de la publication.");
    } else {
      setPublicPath(publicLink.replace(initial.slug, panel.getSlug()));
    }
    setIsPublishing(false);
  }, [initial.slug, publicLink]);

  return (
    <DashboardContent className="pb-8">
      <div className="space-y-8">
        <PageHeader
          title="Page publique"
          subtitle="Personnalisez votre page restaurant, optimisez vos réservations et publiez vos changements."
          titleClassName="text-3xl font-bold tracking-tight"
          subtitleClassName="text-sm text-zg-text-muted"
          secondaryActions={[
            {
              kind: "copy",
              label: "Copier le lien",
              value: effectivePublicPath,
              icon: <Copy className="mr-2 h-4 w-4" />,
            },
            {
              kind: "external",
              href: effectivePublicPath,
              label: "Ouvrir la page",
              icon: <ExternalLink className="mr-2 h-4 w-4" />,
            },
          ]}
          primaryAction={{
            kind: "button",
            label: isPublishing ? "Publication…" : "Publier",
            icon: <Sparkles className="mr-2 h-4 w-4" />,
            onClick: handlePublish,
            disabled: isPublishing,
          }}
        />

        <PublicPageSettingsPanel
          ref={panelRef}
          initial={initial}
          publicLinkBase={publicPath}
          onMessage={setMessage}
          showSummaryBar
          hidePreviewPublish
        />

        <div
          className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-zg-border bg-zg-surface px-4 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <p className="min-w-0 text-sm text-zg-text-muted">
            {message ? (
              <span className="text-zg-fg">{message}</span>
            ) : (
              <span>Enregistrez pour sauvegarder un brouillon avant de publier.</span>
            )}
          </p>
          <Button type="button" className="min-h-11 w-full shrink-0 px-6 sm:w-auto" disabled={isSaving} onClick={handleSave}>
            {saveSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>
    </DashboardContent>
  );
}
