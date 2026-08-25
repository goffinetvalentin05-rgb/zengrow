"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import type { GiftVoucherBrandingSettings } from "@/src/lib/gift-vouchers/branding";
import { DEFAULT_PRIMARY, normalizeHexColor } from "@/src/lib/public-page/colors";
import {
  imageExtensionForUpload,
  uploadRestaurantPublicAsset,
  validateRestaurantImageFile,
} from "@/src/lib/restaurant-storage-upload";

type GiftVoucherSettingsPanelProps = {
  restaurantId: string;
  displayName: string;
  logoUrl: string;
  pageCoverUrl: string;
  accentColor: string;
  phone: string;
  email: string;
  address: string;
};

export default function GiftVoucherSettingsPanel({
  restaurantId,
  displayName,
  logoUrl,
  pageCoverUrl,
  accentColor,
  phone,
  email,
  address,
}: GiftVoucherSettingsPanelProps) {
  const supabase = createClient();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [voucherName, setVoucherName] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [voucherAccent, setVoucherAccent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [terms, setTerms] = useState("");
  const [footer, setFooter] = useState("");
  const [includeBuyer, setIncludeBuyer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/gift-vouchers/settings");
        const payload = (await response.json().catch(() => null)) as {
          settings?: GiftVoucherBrandingSettings;
          error?: string;
        } | null;
        if (cancelled) return;
        if (!response.ok || !payload?.settings) {
          setMessage(payload?.error ?? "Impossible de charger la personnalisation des bons.");
          return;
        }
        applySettings(payload.settings);
      } catch {
        if (!cancelled) setMessage("Impossible de charger la personnalisation des bons.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function applySettings(settings: GiftVoucherBrandingSettings) {
    setVoucherName(settings.displayName ?? "");
    setOfferTitle(settings.offerTitle ?? "");
    setVoucherAccent(settings.accentColor ?? "");
    setCoverUrl(settings.coverUrl ?? "");
    setTerms(settings.terms ?? "");
    setFooter(settings.footer ?? "");
    setIncludeBuyer(settings.includeBuyerOnPdf);
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const invalid = validateRestaurantImageFile(file);
    if (invalid) {
      setMessage(invalid);
      event.target.value = "";
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const { publicUrl } = await uploadRestaurantPublicAsset(supabase, restaurantId, "gift-vouchers", file, {
        extension: imageExtensionForUpload(file),
      });
      setCoverUrl(publicUrl);
      setMessage("Image de couverture chargée.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible de charger l’image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/gift-vouchers/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: voucherName.trim() || undefined,
          offerTitle: offerTitle.trim() || undefined,
          accentColor: voucherAccent.trim() || undefined,
          coverUrl: coverUrl.trim() || undefined,
          terms: terms.trim() || undefined,
          footer: footer.trim() || undefined,
          includeBuyerOnPdf: includeBuyer,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        settings?: GiftVoucherBrandingSettings;
        error?: string;
      } | null;
      if (!response.ok || !payload?.settings) {
        setMessage(payload?.error ?? "Impossible d’enregistrer.");
        return;
      }
      applySettings(payload.settings);
      setMessage("Personnalisation des bons enregistrée.");
    } catch {
      setMessage("Impossible d’enregistrer.");
    } finally {
      setSaving(false);
    }
  }

  const previewColor = normalizeHexColor(voucherAccent || accentColor, DEFAULT_PRIMARY);
  const previewCover = coverUrl || pageCoverUrl;

  return (
    <div className="space-y-3">
      <SettingsAccordion title="Identité réutilisée" description="Logo, nom et coordonnées de l’établissement." defaultOpen>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-12 w-12 rounded-xl border border-zg-border object-contain bg-white" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zg-accent-soft-bg text-sm font-semibold text-zg-accent">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zg-fg">{displayName || "Établissement"}</p>
            <p className="text-xs text-zg-text-muted">
              {[address, phone, email].filter(Boolean).join(" · ") || "Coordonnées non renseignées"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-zg-text-muted">
          Le logo et les coordonnées viennent de votre établissement. Modifiez-les dans{" "}
          <Link href="/dashboard/public-page" className="font-medium text-zg-accent hover:underline">
            Page publique
          </Link>
          .
        </p>
      </SettingsAccordion>

      <SettingsAccordion title="PDF et Apple Wallet" description="Couverture, couleur, conditions et pied de page." defaultOpen>
        {loading ? (
          <p className="text-sm text-zg-text-muted">Chargement…</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label" htmlFor="gv-display-name">
                  Nom affiché sur le bon
                </label>
                <Input
                  id="gv-display-name"
                  className="mt-1.5"
                  value={voucherName}
                  onChange={(event) => setVoucherName(event.target.value)}
                  placeholder={displayName || "Nom de l’établissement"}
                />
              </div>
              <div>
                <label className="dashboard-field-label" htmlFor="gv-offer-title">
                  Titre de l’offre
                </label>
                <Input
                  id="gv-offer-title"
                  className="mt-1.5"
                  value={offerTitle}
                  onChange={(event) => setOfferTitle(event.target.value)}
                  placeholder="Bon cadeau"
                />
              </div>
            </div>

            <div>
              <label className="dashboard-field-label" htmlFor="gv-accent">
                Couleur principale
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <Input
                  id="gv-accent"
                  type="color"
                  value={previewColor}
                  onChange={(event) => setVoucherAccent(event.target.value)}
                  aria-label="Couleur principale du bon"
                />
                <Input
                  value={voucherAccent}
                  onChange={(event) => setVoucherAccent(event.target.value)}
                  placeholder={accentColor || DEFAULT_PRIMARY}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setVoucherAccent("")}>
                  Reprendre la couleur de l’établissement
                </Button>
              </div>
            </div>

            <div>
              <label className="dashboard-field-label">Image de couverture</label>
              {previewCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewCover}
                  alt=""
                  className="mt-2 h-32 w-full rounded-xl border border-zg-border object-contain bg-zg-surface-elevated"
                />
              ) : (
                <div className="mt-2 flex h-32 items-center justify-center rounded-xl border border-dashed border-zg-border text-sm text-zg-text-muted">
                  Aucune image — un fond couleur sera utilisé.
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleCoverUpload}
                />
                <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => coverInputRef.current?.click()}>
                  {uploading ? "Chargement…" : "Choisir une image"}
                </Button>
                {coverUrl ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setCoverUrl("")}>
                    Utiliser l’image de la page publique
                  </Button>
                ) : null}
              </div>
            </div>

            <div>
              <label className="dashboard-field-label" htmlFor="gv-terms">
                Conditions d’utilisation
              </label>
              <Textarea
                id="gv-terms"
                className="mt-1.5 min-h-28"
                value={terms}
                onChange={(event) => setTerms(event.target.value)}
                placeholder="Utilisable en plusieurs fois jusqu’à épuisement du solde…"
              />
            </div>

            <div>
              <label className="dashboard-field-label" htmlFor="gv-footer">
                Texte de pied de page
              </label>
              <Textarea
                id="gv-footer"
                className="mt-1.5 min-h-20"
                value={footer}
                onChange={(event) => setFooter(event.target.value)}
                placeholder="Adresse, téléphone, site…"
              />
            </div>

            <Toggle
              checked={includeBuyer}
              onChange={setIncludeBuyer}
              label="Afficher le nom de l’acheteur sur le PDF"
            />

            <div className="flex items-center gap-3">
              <Button type="button" onClick={() => void save()} disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              {message ? <p className="text-sm text-zg-text-muted">{message}</p> : null}
            </div>
          </div>
        )}
      </SettingsAccordion>
    </div>
  );
}
