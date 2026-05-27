"use client";

import type { ChangeEvent } from "react";
import Image from "next/image";
import {
  Copy,
  ExternalLink,
  ImageIcon,
  Phone,
  Sparkles,
  Upload,
  Trash2,
} from "lucide-react";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Button from "@/src/components/ui/button";
import Toggle from "@/src/components/ui/toggle";
import type { OpeningHours } from "@/src/lib/utils";
import { formatOpeningHoursLines } from "@/src/lib/utils";
import { sanitizePublicSlug } from "@/src/lib/public-page/slug";
import type { PublicPageEditorConfig } from "@/src/lib/public-page/editor-config";
import { parseEditorConfig } from "@/src/lib/public-page/editor-config";

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-zg-text-muted">{children}</p>;
}

export type ShowroomActionsFieldsProps = {
  ctaLabel: string;
  onCtaLabelChange: (v: string) => void;
  ctaReassurance: string;
  onCtaReassuranceChange: (v: string) => void;
  menuMode: "url" | "pdf" | null;
  menuUrl: string;
  onMenuModeChange: (mode: "url" | "pdf" | null) => void;
  onMenuUrlChange: (v: string) => void;
  menuEnabled: boolean;
  onMenuEnabledChange: (v: boolean) => void;
  onMenuPdfUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  isUploadingMenuPdf: boolean;
  instagramUrl: string;
  onInstagramChange: (v: string) => void;
  facebookUrl: string;
  onFacebookChange: (v: string) => void;
  tiktokUrl: string;
  onTiktokChange: (v: string) => void;
  websiteUrl: string;
  onWebsiteChange: (v: string) => void;
  markDirty: () => void;
};

export function ShowroomActionsFields({
  ctaLabel,
  onCtaLabelChange,
  ctaReassurance,
  onCtaReassuranceChange,
  menuMode,
  menuUrl,
  onMenuModeChange,
  onMenuUrlChange,
  menuEnabled,
  onMenuEnabledChange,
  onMenuPdfUpload,
  isUploadingMenuPdf,
  instagramUrl,
  onInstagramChange,
  facebookUrl,
  onFacebookChange,
  tiktokUrl,
  onTiktokChange,
  websiteUrl,
  onWebsiteChange,
  markDirty,
}: ShowroomActionsFieldsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="dashboard-field-label">Texte du bouton de réservation</label>
        <Input
          className="mt-2"
          value={ctaLabel}
          onChange={(e) => {
            onCtaLabelChange(e.target.value);
            markDirty();
          }}
          placeholder="Réserver une table"
        />
      </div>

      <div>
        <label className="dashboard-field-label">Microphrase sous le bouton</label>
        <FieldHint>Ex. « Réservation en moins de 30 secondes » — réduit la friction.</FieldHint>
        <Input
          className="mt-2"
          value={ctaReassurance}
          onChange={(e) => {
            onCtaReassuranceChange(e.target.value);
            markDirty();
          }}
          placeholder="Réservation en moins de 30 secondes"
        />
      </div>

      <Toggle
        checked={menuEnabled}
        onChange={(v) => {
          onMenuEnabledChange(v);
          markDirty();
        }}
        label="Afficher le bouton « Voir le menu »"
      />

      {menuEnabled ? (
        <div className="space-y-4 rounded-xl border border-zg-border/80 bg-zg-surface-elevated/30 p-4">
          <p className="text-sm font-semibold text-zg-fg">Menu</p>
          <FieldHint>PDF hébergé, lien externe ou image — affiché comme lien secondaire discret.</FieldHint>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={menuMode === "pdf" ? "primary" : "secondary"}
              className="min-h-9 text-xs"
              onClick={() => {
                onMenuModeChange(menuMode === "pdf" ? null : "pdf");
                markDirty();
              }}
            >
              PDF
            </Button>
            <Button
              type="button"
              variant={menuMode === "url" ? "primary" : "secondary"}
              className="min-h-9 text-xs"
              onClick={() => {
                onMenuModeChange(menuMode === "url" ? null : "url");
                markDirty();
              }}
            >
              Lien externe
            </Button>
          </div>

          {menuMode === "url" ? (
            <Input
              value={menuUrl}
              onChange={(e) => {
                onMenuUrlChange(e.target.value);
                markDirty();
              }}
              placeholder="https://…"
            />
          ) : null}

          {menuMode === "pdf" ? (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-medium">
              <Upload className="h-4 w-4" />
              {menuUrl ? "Remplacer le PDF" : "Importer un PDF"}
              <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={onMenuPdfUpload} disabled={isUploadingMenuPdf} />
            </label>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-zg-fg">Réseaux sociaux</p>
        <Input
          value={instagramUrl}
          onChange={(e) => {
            onInstagramChange(e.target.value);
            markDirty();
          }}
          placeholder="Instagram"
        />
        <Input
          value={facebookUrl}
          onChange={(e) => {
            onFacebookChange(e.target.value);
            markDirty();
          }}
          placeholder="Facebook"
        />
        <Input
          value={tiktokUrl}
          onChange={(e) => {
            onTiktokChange(e.target.value);
            markDirty();
          }}
          placeholder="TikTok"
        />
        <Input
          value={websiteUrl}
          onChange={(e) => {
            onWebsiteChange(e.target.value);
            markDirty();
          }}
          placeholder="Site web"
        />
      </div>
    </div>
  );
}

export type ShowroomPracticalFieldsProps = {
  address: string;
  onAddressChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  googleMapsUrl: string;
  onGoogleMapsChange: (v: string) => void;
  openingHours: OpeningHours;
  markDirty: () => void;
};

export function ShowroomPracticalFields({
  address,
  onAddressChange,
  phone,
  onPhoneChange,
  googleMapsUrl,
  onGoogleMapsChange,
  openingHours,
  markDirty,
}: ShowroomPracticalFieldsProps) {
  const hoursLines = formatOpeningHoursLines(openingHours).filter(Boolean);

  return (
    <div className="space-y-5">
      <p className="text-sm text-zg-text-muted">
        Horaires configurés dans les paramètres du restaurant. Affichage compact sur la page.
      </p>
      {hoursLines.length > 0 ? (
        <ul className="rounded-xl border border-zg-border/80 bg-zg-surface-elevated/30 p-4 text-sm text-zg-fg">
          {hoursLines.map((line: string) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zg-text-muted">Aucun horaire configuré — complétez dans Paramètres → Horaires.</p>
      )}

      <div>
        <label className="dashboard-field-label">Adresse</label>
        <Input
          className="mt-2"
          value={address}
          onChange={(e) => {
            onAddressChange(e.target.value);
            markDirty();
          }}
        />
      </div>

      <div>
        <label className="dashboard-field-label">Téléphone (optionnel)</label>
        <div className="mt-2 flex items-center gap-2">
          <Phone className="h-4 w-4 text-zg-muted" aria-hidden />
          <Input
            value={phone}
            onChange={(e) => {
              onPhoneChange(e.target.value);
              markDirty();
            }}
            placeholder="+41 …"
          />
        </div>
      </div>

      <div>
        <label className="dashboard-field-label">Lien Google Maps / itinéraire</label>
        <Input
          className="mt-2"
          value={googleMapsUrl}
          onChange={(e) => {
            onGoogleMapsChange(e.target.value);
            markDirty();
          }}
          placeholder="https://maps.google.com/…"
        />
      </div>
    </div>
  );
}

export type ShowroomRatingFieldsProps = {
  editorConfig: PublicPageEditorConfig;
  setEditorConfig: (fn: (c: PublicPageEditorConfig) => PublicPageEditorConfig) => void;
  markDirty: () => void;
};

export function ShowroomRatingFields({ editorConfig, setEditorConfig, markDirty }: ShowroomRatingFieldsProps) {
  const cred = editorConfig.premium.credibility;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Toggle
        checked={editorConfig.blockContent.reviews.showRating}
        onChange={(v) => {
          setEditorConfig((c) =>
            parseEditorConfig({
              ...c,
              blockContent: { ...c.blockContent, reviews: { ...c.blockContent.reviews, showRating: v } },
            }),
          );
          markDirty();
        }}
        label="Afficher la note Google"
      />
      <div>
        <label className="dashboard-field-label">Note (1–5)</label>
        <Input
          className="mt-2"
          type="number"
          min={1}
          max={5}
          step={0.1}
          value={cred.googleRating ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? null : Number(e.target.value);
            setEditorConfig((c) =>
              parseEditorConfig({
                ...c,
                premium: {
                  ...c.premium,
                  credibility: { ...c.premium.credibility, googleRating: v },
                },
              }),
            );
            markDirty();
          }}
        />
      </div>
      <div>
        <label className="dashboard-field-label">Nombre d&apos;avis</label>
        <Input
          className="mt-2"
          type="number"
          min={0}
          value={cred.reviewCount ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? null : Math.floor(Number(e.target.value));
            setEditorConfig((c) =>
              parseEditorConfig({
                ...c,
                premium: {
                  ...c.premium,
                  credibility: { ...c.premium.credibility, reviewCount: v },
                },
              }),
            );
            markDirty();
          }}
        />
      </div>
    </div>
  );
}

export type ShowroomPublicationFieldsProps = {
  slug: string;
  onSlugChange: (v: string) => void;
  publicPath: string;
  onCopyLink: () => void;
  onOpenPreview: () => void;
};

export function ShowroomPublicationFields({
  slug,
  onSlugChange,
  publicPath,
  onCopyLink,
  onOpenPreview,
}: ShowroomPublicationFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="dashboard-field-label">Lien public</label>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zg-muted">/r/</span>
          <Input
            className="font-mono text-sm"
            value={slug}
            onChange={(e) => onSlugChange(sanitizePublicSlug(e.target.value))}
          />
        </div>
        <p className="mt-2 break-all text-xs text-zg-muted">{publicPath}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="min-h-10" onClick={onCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copier le lien
        </Button>
        <a href={publicPath} target="_blank" rel="noreferrer">
          <Button type="button" variant="secondary" className="min-h-10">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ouvrir
          </Button>
        </a>
        <Button type="button" variant="secondary" className="min-h-10" onClick={onOpenPreview}>
          <Sparkles className="mr-2 h-4 w-4" />
          Aller à l&apos;aperçu
        </Button>
      </div>
    </div>
  );
}

export type ShowroomLogoHeroFieldsProps = {
  logoUrl: string;
  coverImageUrl: string;
  isUploadingLogo: boolean;
  isUploadingCover: boolean;
  onLogoUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onCoverUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
  onCoverRemove: () => void;
};

export function ShowroomLogoHeroFields({
  coverImageUrl,
  isUploadingCover,
  onCoverUpload,
  onCoverRemove,
}: Pick<
  ShowroomLogoHeroFieldsProps,
  "coverImageUrl" | "isUploadingCover" | "onCoverUpload" | "onCoverRemove"
>) {
  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-zg-border bg-zg-surface/60 p-4">
        <label className="dashboard-field-label">Image hero</label>
        <FieldHint>Photo immersive — le cœur de votre page de conversion.</FieldHint>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border px-3 py-2 text-sm font-medium">
            <Upload className="h-4 w-4" />
            {coverImageUrl ? "Remplacer" : "Importer"}
            <input type="file" accept="image/*" className="hidden" onChange={onCoverUpload} />
          </label>
          {coverImageUrl ? (
            <Button type="button" variant="secondary" className="min-h-9" onClick={onCoverRemove}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Retirer
            </Button>
          ) : null}
          {isUploadingCover ? <span className="text-xs text-zg-muted">Envoi…</span> : null}
        </div>
        <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl border border-zg-border">
          {coverImageUrl ? (
            <Image src={coverImageUrl} alt="" fill className="object-cover" unoptimized sizes="400px" />
          ) : (
            <div className="flex h-full items-center justify-center bg-zg-surface">
              <ImageIcon className="h-10 w-10 text-zg-muted" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
