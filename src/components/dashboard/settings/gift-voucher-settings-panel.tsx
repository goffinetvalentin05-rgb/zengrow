"use client";

import { ChangeEvent, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import type { GiftVoucherBrandingSettings } from "@/src/lib/gift-vouchers/branding";
import {
  clampGiftVoucherValidityMonths,
  DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS,
  formatSuggestedGiftVoucherAmounts,
  parseSuggestedGiftVoucherAmounts,
} from "@/src/lib/gift-vouchers/defaults";
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
  onDirtyChange?: (dirty: boolean) => void;
};

export type GiftVoucherSettingsHandle = {
  isDirty: () => boolean;
  save: () => Promise<boolean>;
};

function snapshotOf(state: {
  voucherName: string;
  offerTitle: string;
  voucherAccent: string;
  coverUrl: string;
  terms: string;
  footer: string;
  includeBuyer: boolean;
  validityMonths: number;
  suggestedAmounts: string;
  allowFreeAmount: boolean;
}) {
  return JSON.stringify(state);
}

const GiftVoucherSettingsPanel = forwardRef<GiftVoucherSettingsHandle, GiftVoucherSettingsPanelProps>(
  function GiftVoucherSettingsPanel(
    { restaurantId, displayName, logoUrl, pageCoverUrl, accentColor, phone, email, address, onDirtyChange },
    ref,
  ) {
    const supabase = createClient();
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [voucherName, setVoucherName] = useState("");
    const [offerTitle, setOfferTitle] = useState("");
    const [voucherAccent, setVoucherAccent] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [terms, setTerms] = useState("");
    const [footer, setFooter] = useState("");
    const [includeBuyer, setIncludeBuyer] = useState(false);
    const [validityMonths, setValidityMonths] = useState(DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS);
    const [suggestedAmounts, setSuggestedAmounts] = useState("50, 100, 150");
    const [allowFreeAmount, setAllowFreeAmount] = useState(true);
    const [savedSnapshot, setSavedSnapshot] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const currentSnapshot = snapshotOf({
      voucherName,
      offerTitle,
      voucherAccent,
      coverUrl,
      terms,
      footer,
      includeBuyer,
      validityMonths,
      suggestedAmounts,
      allowFreeAmount,
    });
    const dirty = Boolean(savedSnapshot) && currentSnapshot !== savedSnapshot;

    useEffect(() => {
      onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

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
            setError(payload?.error ?? "Impossible de charger la personnalisation des bons.");
            return;
          }
          applySettings(payload.settings, true);
        } catch {
          if (!cancelled) setError("Impossible de charger la personnalisation des bons.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []);

    function applySettings(settings: GiftVoucherBrandingSettings, markSaved = false) {
      const next = {
        voucherName: settings.displayName ?? "",
        offerTitle: settings.offerTitle ?? "",
        voucherAccent: settings.accentColor ?? "",
        coverUrl: settings.coverUrl ?? "",
        terms: settings.terms ?? "",
        footer: settings.footer ?? "",
        includeBuyer: settings.includeBuyerOnPdf,
        validityMonths: settings.defaultValidityMonths,
        suggestedAmounts: settings.suggestedAmounts.join(", "),
        allowFreeAmount: settings.allowFreeAmount !== false,
      };
      setVoucherName(next.voucherName);
      setOfferTitle(next.offerTitle);
      setVoucherAccent(next.voucherAccent);
      setCoverUrl(next.coverUrl);
      setTerms(next.terms);
      setFooter(next.footer);
      setIncludeBuyer(next.includeBuyer);
      setValidityMonths(next.validityMonths);
      setSuggestedAmounts(next.suggestedAmounts);
      setAllowFreeAmount(next.allowFreeAmount);
      if (markSaved) setSavedSnapshot(snapshotOf(next));
    }

    async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;
      const invalid = validateRestaurantImageFile(file);
      if (invalid) {
        setError(invalid);
        event.target.value = "";
        return;
      }
      setUploading(true);
      setError(null);
      setMessage(null);
      try {
        const { publicUrl } = await uploadRestaurantPublicAsset(supabase, restaurantId, "gift-vouchers", file, {
          extension: imageExtensionForUpload(file),
        });
        setCoverUrl(publicUrl);
        setMessage("Image de couverture chargée. Enregistrez pour l’appliquer.");
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Impossible de charger l’image.");
      } finally {
        setUploading(false);
        event.target.value = "";
      }
    }

    const save = useCallback(async (): Promise<boolean> => {
      if (saving) return false;
      setSaving(true);
      setMessage(null);
      setError(null);
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
            defaultValidityMonths: clampGiftVoucherValidityMonths(validityMonths),
            suggestedAmounts: parseSuggestedGiftVoucherAmounts(suggestedAmounts),
            allowFreeAmount,
          }),
        });
        const payload = (await response.json().catch(() => null)) as {
          settings?: GiftVoucherBrandingSettings;
          error?: string;
        } | null;
        if (!response.ok || !payload?.settings) {
          setError(payload?.error ?? "Impossible d’enregistrer la personnalisation des bons.");
          return false;
        }
        applySettings(payload.settings, true);
        setMessage("Personnalisation des bons enregistrée.");
        return true;
      } catch {
        setError("Impossible d’enregistrer. Vérifiez votre connexion.");
        return false;
      } finally {
        setSaving(false);
      }
    }, [
      saving,
      voucherName,
      offerTitle,
      voucherAccent,
      coverUrl,
      terms,
      footer,
      includeBuyer,
      validityMonths,
      suggestedAmounts,
      allowFreeAmount,
    ]);

    useImperativeHandle(ref, () => ({ isDirty: () => dirty, save }), [dirty, save]);

    const previewColor = normalizeHexColor(voucherAccent || accentColor, DEFAULT_PRIMARY);
    const previewCover = coverUrl || pageCoverUrl;
    const amountsPreview = useMemo(
      () => formatSuggestedGiftVoucherAmounts(parseSuggestedGiftVoucherAmounts(suggestedAmounts)),
      [suggestedAmounts],
    );

    return (
      <div className="space-y-3">
        <SettingsAccordion title="Identité réutilisée" description="Logo, nom et coordonnées de l’établissement." defaultOpen>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-12 w-12 rounded-xl border border-zg-border bg-white object-contain" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zg-accent-soft-bg text-sm font-semibold text-zg-accent">
                {(displayName || "É").slice(0, 1).toUpperCase()}
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
            Le logo et les coordonnées viennent de l’onglet Établissement. Modifiez-les là-bas, puis enregistrez.
          </p>
        </SettingsAccordion>

        <SettingsAccordion title="PDF, page publique et Wallet" description="Ces éléments visuels sont relus à chaque affichage." defaultOpen>
          {loading ? (
            <p className="text-sm text-zg-text-muted">Chargement…</p>
          ) : (
            <div className="space-y-4">
              <p className="rounded-xl border border-zg-border bg-zg-surface-elevated/50 px-3 py-2 text-xs leading-relaxed text-zg-text-muted">
                Logo, nom affiché et couleur restent dynamiques. Le titre, l’image et les conditions d’une offre
                vendue sont figés sur le bon émis. La couverture ci-dessous sert de repli pour les bons sans image
                d’offre.
              </p>
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
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <Input
                    id="gv-accent"
                    type="color"
                    value={previewColor}
                    onChange={(event) => setVoucherAccent(event.target.value)}
                    aria-label="Couleur principale du bon"
                    className="h-11 w-14 p-1"
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
                    className="mt-2 h-32 w-full rounded-xl border border-zg-border bg-zg-surface-elevated object-contain"
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
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={uploading}
                    onClick={() => coverInputRef.current?.click()}
                  >
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

              <Toggle checked={includeBuyer} onChange={setIncludeBuyer} label="Afficher le nom de l’acheteur sur le PDF" />
            </div>
          )}
        </SettingsAccordion>

        <SettingsAccordion
          title="Montant libre"
          description="Ces montants ne remplacent pas le catalogue « Mes offres ». Ils servent uniquement à l’option montant libre."
          defaultOpen
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label" htmlFor="gv-validity">
                Durée de validité par défaut (mois)
              </label>
              <Input
                id="gv-validity"
                type="number"
                min={1}
                max={60}
                className="mt-1.5"
                value={validityMonths}
                onChange={(event) => setValidityMonths(clampGiftVoucherValidityMonths(event.target.value))}
              />
            </div>
            <div>
              <label className="dashboard-field-label" htmlFor="gv-amounts">
                Montants proposés (CHF)
              </label>
              <Input
                id="gv-amounts"
                className="mt-1.5"
                value={suggestedAmounts}
                onChange={(event) => setSuggestedAmounts(event.target.value)}
                placeholder="50, 100, 150"
              />
              <p className="mt-1.5 text-xs text-zg-text-muted">Aperçu : {amountsPreview} CHF — utilisés uniquement pour le montant libre.</p>
            </div>
          </div>
          <div className="mt-4">
            <Toggle
              checked={allowFreeAmount}
              onChange={setAllowFreeAmount}
              label="Autoriser la création d’un bon à montant libre"
            />
          </div>
        </SettingsAccordion>

        {error ? (
          <p className="text-sm text-zg-danger" role="alert">
            {error}
          </p>
        ) : message ? (
          <p className="text-sm text-zg-text-muted">{message}</p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Link href="/dashboard/gift-vouchers/offers" className="text-sm font-medium text-zg-accent hover:underline">
            Gérer le catalogue d’offres →
          </Link>
          <Link href="/dashboard/gift-vouchers" className="text-sm font-medium text-zg-accent hover:underline">
            Créer un bon avec ces réglages →
          </Link>
        </div>
      </div>
    );
  },
);

export default GiftVoucherSettingsPanel;
