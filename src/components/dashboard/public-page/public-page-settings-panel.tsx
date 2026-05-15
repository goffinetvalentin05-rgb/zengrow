"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Check,
  Copy,
  ExternalLink,
  ImageIcon,
  Layout,
  Palette,
  Phone,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Type as TypeIcon,
  Upload,
  Utensils,
  FileText,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import {
  displayFileNameFromUrl,
  imageExtensionForUpload,
  tryRemoveRestaurantPublicObject,
  uploadRestaurantPublicAsset,
  validateRestaurantImageFile,
  validateRestaurantPdfFile,
} from "@/src/lib/restaurant-storage-upload";
import Button, { buttonClassName } from "@/src/components/ui/button";
import Badge from "@/src/components/ui/badge";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import PublicPagePreviewStudio, { type ExtendedPreviewDraft } from "@/src/components/dashboard/public-page/public-page-preview-studio";
import {
  type PublicPageEditorConfig,
  parseEditorConfig,
  editorConfigToPreviewDraft,
  type EditorContext,
  legacyHeroHeight,
} from "@/src/lib/public-page/editor-config";
import {
  PAGE_PRESETS,
  applyPagePreset,
  pagePresetHasMeaningfulImpact,
  type PagePresetId,
} from "@/src/lib/public-page/page-presets";
import { cn, formatOpeningHoursLines, type OpeningHours } from "@/src/lib/utils";
import { sanitizePublicSlug } from "@/src/lib/public-page/slug";
import {
  DEFAULT_PRIMARY,
  DEFAULT_SECONDARY,
  normalizeHexColor,
} from "@/src/lib/public-page/colors";
import {
  computeCompletionPercent,
  defaultHeroSubtitle,
  defaultHeroTitle,
  publicationChecklist,
} from "@/src/lib/public-page/defaults";
import {
  computeConversionScore,
  conversionRecommendations,
} from "@/src/lib/public-page/conversion";
import { newMenuOffer } from "@/src/lib/public-page/premium-content";
import {
  FONT_PAIRINGS,
  PUBLIC_PAGE_FONT_LIBRARY,
  googleFontsHref,
} from "@/src/lib/public-page-fonts";
import {
  MAX_DESCRIPTION_CHARS,
  MAX_GALLERY_PHOTOS,
  MAX_HIGHLIGHTS,
  type PublicAmbiance,
  type PublicStylePreset,
} from "@/src/lib/public-page/constants";
import type { PageBlockId } from "@/src/lib/public-page/editor-config";

/** Visuels distincts pour chaque style — préview rapide des cartes du Step 1. */
const PRESET_VISUALS: Partial<
  Record<PagePresetId, { gradient: string; foreground: string; accent: string; tagline: string }>
> = {
  premium_experience: {
    gradient: "linear-gradient(135deg, #0c0f14 0%, #1a1f29 65%, #2a2018 100%)",
    foreground: "#f8f5ef",
    accent: "#c9a26b",
    tagline: "Sombre · éditorial · grandes images",
  },
  warm_restaurant: {
    gradient: "linear-gradient(135deg, #fff1e3 0%, #f5d8b8 50%, #c98e5a 100%)",
    foreground: "#3a1f0e",
    accent: "#9b4a1e",
    tagline: "Chaleureux · convivial · familial",
  },
  modern_brasserie: {
    gradient: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 60%, #1f2937 100%)",
    foreground: "#0f172a",
    accent: "#0ea5e9",
    tagline: "Net · urbain · efficace",
  },
  event_venue: {
    gradient: "linear-gradient(135deg, #1e293b 0%, #475569 60%, #d4b483 100%)",
    foreground: "#f8fafc",
    accent: "#c8a674",
    tagline: "Hero en split · formules · contact",
  },
  minimal_conversion: {
    gradient: "linear-gradient(135deg, #ffffff 0%, #f4f4f5 70%, #18181b 100%)",
    foreground: "#09090b",
    accent: "#27272a",
    tagline: "Court · direct · ultra réservation",
  },
};

/** Sections personnalisables affichées au Step 3 (avec leur libellé et description). */
const PAGE_SECTIONS: { id: PageBlockId; label: string; description: string }[] = [
  { id: "about", label: "Concept", description: "Présentez votre restaurant en quelques mots." },
  { id: "menu", label: "Menu / carte", description: "Mettez en avant 3 plats ou formules et un lien menu." },
  { id: "gallery", label: "Galerie", description: "Vos plus belles photos du lieu et des plats." },
  { id: "reservation", label: "Réservation", description: "Formulaire intégré (paramétré à l'étape suivante)." },
  { id: "hours", label: "Horaires", description: "Affichés dans le formulaire et le pied de page." },
  { id: "location", label: "Contact & localisation", description: "Adresse, téléphone, itinéraire." },
  { id: "gift_vouchers", label: "Bons cadeaux", description: "Formulaire de demande de bon cadeau (traitement par vous)." },
  { id: "final_cta", label: "Rappel final", description: "Bandeau de fin de page qui ramène à la réservation." },
];

/** Petite carte d'étape réutilisée pour structurer le panneau. */
function StepCard({
  step,
  title,
  subtitle,
  icon,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-zg-border bg-zg-surface p-6 shadow-sm sm:p-8">
      <header className="mb-5 flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zg-accent/10 text-sm font-semibold text-zg-accent">
          {icon ?? step}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zg-muted">
            Étape {step}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold text-zg-fg sm:text-xl">{title}</h2>
          {subtitle ? (
            <p className="mt-1 max-w-2xl text-sm text-zg-muted">{subtitle}</p>
          ) : null}
        </div>
      </header>
      <div>{children}</div>
    </section>
  );
}

/** Sélecteur de couleur compact (carré couleur + champ hex). */
function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="dashboard-field-label">{label}</label>
      {hint ? <p className="mt-1 text-xs text-zg-muted">{hint}</p> : null}
      <div className="mt-2 flex items-center gap-2">
        <Input
          type="color"
          className="h-11 w-14 shrink-0 cursor-pointer p-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          className="font-mono text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

/** Sous-titre de groupe de contrôles (utilisé dans la Direction visuelle). */
function ControlGroupTitle({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3 flex items-start gap-2">
      {icon ? (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zg-accent/10 text-zg-accent">
          {icon}
        </span>
      ) : null}
      <div>
        <p className="text-sm font-semibold text-zg-fg">{title}</p>
        {hint ? <p className="mt-0.5 text-xs text-zg-muted">{hint}</p> : null}
      </div>
    </div>
  );
}

/** Bouton-chip visuel pour des options exclusives (button style, hero, cards…). */
type OptionChip = {
  id: string;
  label: string;
  hint?: string;
  preview?: ReactNode;
};

function OptionChipGroup<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: (OptionChip & { id: T })[];
  value: T;
  onChange: (v: T) => void;
  columns?: 2 | 3 | 4;
}) {
  const colsClass =
    columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
  return (
    <div className={cn("grid gap-2", colsClass)}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={cn(
              "group flex flex-col gap-1.5 rounded-xl border p-3 text-left transition",
              active
                ? "border-zg-accent bg-zg-accent/5 ring-1 ring-zg-accent"
                : "border-zg-border hover:border-zg-accent/40",
            )}
          >
            {opt.preview ? (
              <div className="flex h-10 items-center justify-center rounded-lg bg-zg-surface/60">
                {opt.preview}
              </div>
            ) : null}
            <p className="text-sm font-semibold text-zg-fg">{opt.label}</p>
            {opt.hint ? <p className="text-xs text-zg-muted">{opt.hint}</p> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Aperçu rapide d'une famille de police (utilisé dans le sélecteur Typographie). */
function FontPreviewCard({
  family,
  active,
  onSelect,
  size = "lg",
}: {
  family: string;
  active: boolean;
  onSelect: () => void;
  size?: "sm" | "lg";
}) {
  const descriptor = PUBLIC_PAGE_FONT_LIBRARY.find((f) => f.family === family);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
        active
          ? "border-zg-accent bg-zg-accent/5 ring-1 ring-zg-accent"
          : "border-zg-border hover:border-zg-accent/40",
      )}
    >
      <span
        className={cn(
          "block",
          size === "lg" ? "text-2xl leading-none" : "text-base leading-none",
        )}
        style={{
          fontFamily: `"${family}", ${descriptor?.fallback ?? "system-ui, sans-serif"}`,
        }}
      >
        Aa
      </span>
      <span className="text-xs font-semibold text-zg-fg">{family}</span>
      {descriptor ? (
        <span className="text-[10px] uppercase tracking-[0.15em] text-zg-muted">
          {descriptor.category}
        </span>
      ) : null}
    </button>
  );
}

export type PublicPageSettingsInitial = {
  restaurantId: string;
  name: string;
  slug: string;
  city: string;
  cuisineType: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string;
  googleMapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  primaryColor: string;
  secondaryColor: string;
  stylePreset: PublicStylePreset | null;
  ambiance: PublicAmbiance | null;
  heroTitle: string;
  heroSubtitle: string;
  shortDescription: string;
  highlights: string[];
  specialMessage: string;
  logoUrl: string;
  coverImageUrl: string;
  galleryUrls: string[];
  featuredGalleryIndex: number;
  menuMode: "url" | "pdf" | null;
  menuUrl: string;
  menuDocuments: { id: string; label: string; fileUrl: string; position: number }[];
  ctaLabel: string;
  reservationEnabled: boolean;
  preBookingMessage: string;
  maxPartySize: number;
  minBookingLeadMinutes: number;
  noSlotsMessage: string;
  showHoursBeforeForm: boolean;
  showPhoneCta: boolean;
  seoTitle: string;
  seoDescription: string;
  pageStatus: "draft" | "published";
  publishedAt: string | null;
  draftUpdatedAt: string | null;
  showPublicInstagram: boolean;
  showPublicFacebook: boolean;
  showPublicGoogleMaps: boolean;
  showPublicAddress: boolean;
  showPublicPhone: boolean;
  showPublicEmail: boolean;
  showPublicWebsite: boolean;
  showPublicOpeningHours: boolean;
  openingHours: OpeningHours;
  pageBackgroundColor: string;
  heroPrimaryColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  headingTextColor: string;
  bodyTextColor: string;
  footerBgColor: string;
  footerTextColor: string;
  headingFont: string;
  bodyFont: string;
  heroTitleSizePx: number;
  heroHeight: "compact" | "normal" | "tall";
  heroOverlayEnabled: boolean;
  heroOverlayOpacity: number;
  fontSizeScale: "small" | "medium" | "large";
  borderRadius: "sharp" | "rounded" | "pill";
  buttonStyle: "filled" | "outlined" | "ghost";
  cardStyle: "flat" | "elevated" | "bordered";
  terraceEnabled: boolean;
  editorConfigRaw?: unknown;
};

export type PublicPageSettingsHandle = {
  getRestaurantUpdate: () => Record<string, unknown>;
  getSettingsUpdate: () => Record<string, unknown>;
  getSlug: () => string;
  publishPage: () => Promise<{ ok: boolean; error?: string }>;
};

type PublicPageSettingsPanelProps = {
  initial: PublicPageSettingsInitial;
  publicLinkBase: string;
  onMessage?: (msg: string | null) => void;
  /** Affiche la barre statut / conversion en tête du panneau (désactivé si le header page est externe). */
  showSummaryBar?: boolean;
  /** Masque le bouton Publier dans l’aperçu (publication via le header de la page dédiée). */
  hidePreviewPublish?: boolean;
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-zg-text-muted">{children}</p>;
}

const PublicPageSettingsPanel = forwardRef<PublicPageSettingsHandle, PublicPageSettingsPanelProps>(
  function PublicPageSettingsPanel(
    { initial, publicLinkBase, onMessage, showSummaryBar = true, hidePreviewPublish = false },
    ref,
  ) {
    const supabase = createClient();

    // Charge toutes les polices premium dans le document du dashboard pour que
    // les chips de typographie s'affichent réellement dans la bonne police.
    useEffect(() => {
      const href = googleFontsHref(PUBLIC_PAGE_FONT_LIBRARY.map((f) => f.family));
      if (!href || typeof document === "undefined") return;
      const id = "zg-public-page-font-library";
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }, []);

    const [editorConfig, setEditorConfig] = useState<PublicPageEditorConfig>(() => {
      const base = parseEditorConfig(initial.editorConfigRaw);
      return parseEditorConfig({
        ...base,
        hero: {
          ...base.hero,
          title: initial.heroTitle,
          subtitle: initial.heroSubtitle,
          primaryCta: initial.ctaLabel,
          height: legacyHeroHeight(initial.heroHeight),
          overlayEnabled: initial.heroOverlayEnabled,
          overlayOpacity: initial.heroOverlayOpacity,
        },
        appearance: {
          ...base.appearance,
          primaryColor: initial.primaryColor || DEFAULT_PRIMARY,
          secondaryColor: initial.secondaryColor || DEFAULT_SECONDARY,
          accentColor: initial.accentColor,
          stylePreset: initial.stylePreset,
          ambiance: initial.ambiance,
          headingFont: initial.headingFont,
          bodyFont: initial.bodyFont,
          backgroundColor: initial.pageBackgroundColor,
          // Important : les colonnes plates restent la source de vérité au premier
          // chargement pour que les color pickers du Step 1 affichent les bonnes
          // valeurs aussitôt après refresh / publication.
          headingColor: initial.headingTextColor || base.appearance.headingColor,
          textColor: initial.bodyTextColor || base.appearance.textColor,
          footerBgColor: initial.footerBgColor || base.appearance.footerBgColor,
          footerTextColor: initial.footerTextColor || base.appearance.footerTextColor,
          buttonTextColor: initial.buttonTextColor || base.appearance.buttonTextColor,
          buttonStyle: (initial.buttonStyle as typeof base.appearance.buttonStyle) || base.appearance.buttonStyle,
          cardStyle: (initial.cardStyle as typeof base.appearance.cardStyle) || base.appearance.cardStyle,
          borderRadius:
            initial.borderRadius === "sharp"
              ? "soft"
              : initial.borderRadius === "pill"
                ? "premium"
                : "medium",
        },
        blockContent: {
          ...base.blockContent,
          about: { ...base.blockContent.about, body: initial.shortDescription },
          highlights: { items: initial.highlights },
          menu: { mode: initial.menuMode, url: initial.menuUrl },
        },
        reservation: {
          ...base.reservation,
          enabled: initial.reservationEnabled,
          intro: initial.preBookingMessage,
          showPhoneCta: initial.showPhoneCta,
          showHoursBeforeForm: initial.showHoursBeforeForm,
          noSlotsMessage: initial.noSlotsMessage,
          minLeadMinutes: initial.minBookingLeadMinutes,
        },
      });
    });
    const [isPublishing, setIsPublishing] = useState(false);

    const [name, setName] = useState(initial.name);
    const [slug, setSlug] = useState(initial.slug);
    const [city, setCity] = useState(initial.city);
    const [cuisineType, setCuisineType] = useState(initial.cuisineType);
    const [address, setAddress] = useState(initial.address);
    const [phone, setPhone] = useState(initial.phone);
    const [email, setEmail] = useState(initial.email);
    const [websiteUrl] = useState(initial.websiteUrl);
    const [googleMapsUrl, setGoogleMapsUrl] = useState(initial.googleMapsUrl);
    const [instagramUrl] = useState(initial.instagramUrl);
    const [facebookUrl] = useState(initial.facebookUrl);
    const [tiktokUrl] = useState(initial.tiktokUrl);

    const [primaryColor, setPrimaryColor] = useState(initial.primaryColor || DEFAULT_PRIMARY);
    const [secondaryColor, setSecondaryColor] = useState(initial.secondaryColor || DEFAULT_SECONDARY);
    const [stylePreset, setStylePreset] = useState<PublicStylePreset | null>(initial.stylePreset);
    const [ambiance] = useState<PublicAmbiance | null>(initial.ambiance);

    const [heroTitle] = useState(initial.heroTitle);
    const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
    const [shortDescription, setShortDescription] = useState(initial.shortDescription);
    const [highlights] = useState<string[]>(initial.highlights.slice(0, MAX_HIGHLIGHTS));
    const [specialMessage] = useState(initial.specialMessage);

    const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
    const [coverImageUrl, setCoverImageUrl] = useState(initial.coverImageUrl);
    const [galleryUrls, setGalleryUrls] = useState<string[]>(
      initial.galleryUrls.filter(Boolean).slice(0, MAX_GALLERY_PHOTOS),
    );
    const [featuredGalleryIndex] = useState(initial.featuredGalleryIndex);

    const [menuMode, setMenuMode] = useState<"url" | "pdf" | null>(initial.menuMode);
    const [menuUrl, setMenuUrl] = useState(initial.menuUrl);

    const [ctaLabel, setCtaLabel] = useState(initial.ctaLabel);
    const [reservationEnabled] = useState(initial.reservationEnabled);
    const [preBookingMessage, setPreBookingMessage] = useState(initial.preBookingMessage);
    const [minBookingLeadMinutes] = useState(initial.minBookingLeadMinutes);
    const [noSlotsMessage] = useState(initial.noSlotsMessage);
    const [showHoursBeforeForm] = useState(initial.showHoursBeforeForm);
    const [showPhoneCta, setShowPhoneCta] = useState(initial.showPhoneCta);

    const [seoTitle] = useState(initial.seoTitle);
    const [seoDescription] = useState(initial.seoDescription);

    const [pageStatus, setPageStatus] = useState<"draft" | "published">(initial.pageStatus);
    const [publishedAt, setPublishedAt] = useState<string | null>(initial.publishedAt);
    const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

    const [accentColor, setAccentColor] = useState(initial.accentColor);
    const [headingFont, setHeadingFont] = useState(initial.headingFont);
    const [bodyFont, setBodyFont] = useState(initial.bodyFont);
    const [heroHeight, setHeroHeight] = useState(initial.heroHeight);

    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);
    const [isUploadingConceptImage, setIsUploadingConceptImage] = useState(false);
    const [isUploadingGiftVoucherImage, setIsUploadingGiftVoucherImage] = useState(false);
    const [uploadingOfferIndex, setUploadingOfferIndex] = useState<number | null>(null);
    const [isUploadingMenuPdf, setIsUploadingMenuPdf] = useState(false);

    const displayName = name.trim() || "Restaurant";
    const effectiveSlug = sanitizePublicSlug(slug || name);
    const publicPath = publicLinkBase.replace(/\/r\/[^/]+$/, `/r/${effectiveSlug}`);

    const resolvedHeroTitle = heroTitle.trim() || defaultHeroTitle(displayName);

    const checklist = useMemo(
      () => ({
        hasName: Boolean(name.trim()),
        hasAddress: Boolean(address.trim()),
        hasHeroPhoto: Boolean(coverImageUrl.trim()),
        hasHours: formatOpeningHoursLines(initial.openingHours).some((l) => !l.includes("Fermé")),
        hasReservation: reservationEnabled && Boolean(ctaLabel.trim()),
      }),
      [name, address, coverImageUrl, initial.openingHours, reservationEnabled, ctaLabel],
    );

    const completionPercent = computeCompletionPercent(checklist);
    const checklistItems = publicationChecklist(checklist);

    const conversionScoreInput = useMemo(
      () => ({
        name: name.trim(),
        address: address.trim(),
        coverImageUrl: coverImageUrl.trim(),
        heroTitle: heroTitle.trim() || resolvedHeroTitle,
        shortDescription: shortDescription.trim(),
        highlights: highlights.filter(Boolean),
        galleryCount: galleryUrls.filter(Boolean).length,
        menuUrl:
          menuMode === "url" || menuMode === "pdf" ? menuUrl.trim() || null : null,
        menuMode,
        menuDocumentsCount: initial.menuDocuments.length,
        reservationEnabled,
        ctaLabel: ctaLabel.trim(),
        openingHours: initial.openingHours,
      }),
      [
        name,
        address,
        coverImageUrl,
        heroTitle,
        resolvedHeroTitle,
        shortDescription,
        highlights,
        galleryUrls,
        menuMode,
        menuUrl,
        initial.menuDocuments.length,
        reservationEnabled,
        ctaLabel,
        initial.openingHours,
      ],
    );

    const conversionScore = useMemo(
      () => computeConversionScore(conversionScoreInput),
      [conversionScoreInput],
    );
    const conversionRecs = useMemo(
      () => conversionRecommendations(conversionScoreInput, editorConfig.conversion),
      [conversionScoreInput, editorConfig.conversion],
    );

    const markDirty = useCallback(() => {
      if (pageStatus === "published") setHasUnpublishedChanges(true);
    }, [pageStatus]);

    // Confirmation avant d'appliquer un preset complet de page.
    const [pendingPresetId, setPendingPresetId] = useState<PagePresetId | null>(null);

    const applyFullPagePreset = useCallback(
      (presetId: PagePresetId) => {
        setEditorConfig((current) => {
          const next = applyPagePreset(current, presetId);

          // Synchronise les états locaux qui reflètent l'apparence (colonne dashboard).
          setStylePreset(next.appearance.stylePreset);
          setPrimaryColor(next.appearance.primaryColor);
          setSecondaryColor(next.appearance.secondaryColor);
          setAccentColor(next.appearance.accentColor);
          setHeadingFont(next.appearance.headingFont);
          setBodyFont(next.appearance.bodyFont);
          setHeroHeight(
            next.hero.height === "immersive"
              ? "tall"
              : next.hero.height === "compact"
                ? "compact"
                : "normal",
          );

          // Synchronise le libellé du CTA si l'utilisateur n'avait rien personnalisé,
          // pour qu'il reflète immédiatement le preset choisi dans le hero / aperçu.
          if (!ctaLabel.trim()) setCtaLabel(next.hero.primaryCta);

          return next;
        });
        markDirty();
      },
      [ctaLabel, markDirty],
    );

    const handlePresetClick = useCallback(
      (presetId: PagePresetId) => {
        if (pagePresetHasMeaningfulImpact(editorConfig, presetId)) {
          setPendingPresetId(presetId);
          return;
        }
        applyFullPagePreset(presetId);
      },
      [editorConfig, applyFullPagePreset],
    );

    const confirmPendingPreset = useCallback(() => {
      if (pendingPresetId) applyFullPagePreset(pendingPresetId);
      setPendingPresetId(null);
    }, [pendingPresetId, applyFullPagePreset]);

    async function handleFileUpload(
      event: ChangeEvent<HTMLInputElement>,
      kind: "logo" | "cover" | "gallery",
    ) {
      const file = event.target.files?.[0];
      if (!file) return;
      const err = validateRestaurantImageFile(file);
      if (err) {
        onMessage?.(err);
        event.target.value = "";
        return;
      }
      onMessage?.(null);
      const setLoading =
        kind === "logo" ? setIsUploadingLogo : kind === "cover" ? setIsUploadingCover : setIsUploadingGallery;
      setLoading(true);
      const previousUrl =
        kind === "logo" ? logoUrl : kind === "cover" ? coverImageUrl : "";
      try {
        const ext = imageExtensionForUpload(file);
        const { publicUrl } = await uploadRestaurantPublicAsset(
          supabase,
          initial.restaurantId,
          kind === "logo" ? "logo" : kind === "cover" ? "hero" : "gallery",
          file,
          { extension: ext },
        );
        if (kind === "logo") setLogoUrl(publicUrl);
        else if (kind === "cover") setCoverImageUrl(publicUrl);
        else if (galleryUrls.length < MAX_GALLERY_PHOTOS) setGalleryUrls((g) => [...g, publicUrl]);
        if (previousUrl && previousUrl !== publicUrl) {
          void tryRemoveRestaurantPublicObject(supabase, previousUrl);
        }
        markDirty();
        onMessage?.("Fichier enregistré.");
      } catch (e) {
        onMessage?.(e instanceof Error ? e.message : "Échec du chargement.");
      } finally {
        setLoading(false);
        event.target.value = "";
      }
    }

    async function handleConceptImageUpload(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;
      const err = validateRestaurantImageFile(file);
      if (err) {
        onMessage?.(err);
        event.target.value = "";
        return;
      }
      onMessage?.(null);
      const previous = editorConfig.premium.concept.imageUrl.trim();
      setIsUploadingConceptImage(true);
      try {
        const ext = imageExtensionForUpload(file);
        const { publicUrl } = await uploadRestaurantPublicAsset(
          supabase,
          initial.restaurantId,
          "sections",
          file,
          { extension: ext },
        );
        setEditorConfig((c) =>
          parseEditorConfig({
            ...c,
            premium: {
              ...c.premium,
              concept: { ...c.premium.concept, imageUrl: publicUrl },
            },
          }),
        );
        if (previous && previous !== publicUrl) {
          void tryRemoveRestaurantPublicObject(supabase, previous);
        }
        markDirty();
        onMessage?.("Image enregistrée.");
      } catch (e) {
        onMessage?.(e instanceof Error ? e.message : "Échec du chargement.");
      } finally {
        setIsUploadingConceptImage(false);
        event.target.value = "";
      }
    }

    async function handleGiftVoucherImageUpload(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;
      const err = validateRestaurantImageFile(file);
      if (err) {
        onMessage?.(err);
        event.target.value = "";
        return;
      }
      onMessage?.(null);
      const previous = editorConfig.premium.giftVouchers.imageUrl.trim();
      setIsUploadingGiftVoucherImage(true);
      try {
        const ext = imageExtensionForUpload(file);
        const { publicUrl } = await uploadRestaurantPublicAsset(
          supabase,
          initial.restaurantId,
          "sections",
          file,
          { extension: ext },
        );
        setEditorConfig((c) =>
          parseEditorConfig({
            ...c,
            premium: {
              ...c.premium,
              giftVouchers: { ...c.premium.giftVouchers, imageUrl: publicUrl },
            },
          }),
        );
        if (previous && previous !== publicUrl) {
          void tryRemoveRestaurantPublicObject(supabase, previous);
        }
        markDirty();
        onMessage?.("Image enregistrée.");
      } catch (e) {
        onMessage?.(e instanceof Error ? e.message : "Échec du chargement.");
      } finally {
        setIsUploadingGiftVoucherImage(false);
        event.target.value = "";
      }
    }

    async function handleOfferImageUpload(idx: number, event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;
      const err = validateRestaurantImageFile(file);
      if (err) {
        onMessage?.(err);
        event.target.value = "";
        return;
      }
      onMessage?.(null);
      const offer = editorConfig.premium.menuOffers[idx];
      const previous = offer?.imageUrl?.trim() ?? "";
      setUploadingOfferIndex(idx);
      try {
        const ext = imageExtensionForUpload(file);
        const { publicUrl } = await uploadRestaurantPublicAsset(
          supabase,
          initial.restaurantId,
          "offers",
          file,
          { extension: ext },
        );
        const menuOffers = [...editorConfig.premium.menuOffers];
        menuOffers[idx] = { ...menuOffers[idx], imageUrl: publicUrl };
        setEditorConfig((c) => parseEditorConfig({ ...c, premium: { ...c.premium, menuOffers } }));
        if (previous && previous !== publicUrl) {
          void tryRemoveRestaurantPublicObject(supabase, previous);
        }
        markDirty();
        onMessage?.("Photo enregistrée.");
      } catch (e) {
        onMessage?.(e instanceof Error ? e.message : "Échec du chargement.");
      } finally {
        setUploadingOfferIndex(null);
        event.target.value = "";
      }
    }

    async function handleMenuPdfUpload(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file) return;
      const err = validateRestaurantPdfFile(file);
      if (err) {
        onMessage?.(err);
        event.target.value = "";
        return;
      }
      onMessage?.(null);
      const previous = menuUrl.trim();
      setIsUploadingMenuPdf(true);
      try {
        const { publicUrl } = await uploadRestaurantPublicAsset(
          supabase,
          initial.restaurantId,
          "menus",
          file,
          { extension: "pdf" },
        );
        setMenuUrl(publicUrl);
        setMenuMode("pdf");
        setEditorConfig((c) =>
          parseEditorConfig({
            ...c,
            blockContent: {
              ...c.blockContent,
              menu: { ...c.blockContent.menu, mode: "pdf", url: publicUrl },
            },
          }),
        );
        if (previous && previous !== publicUrl) {
          void tryRemoveRestaurantPublicObject(supabase, previous);
        }
        markDirty();
        onMessage?.("Menu enregistré.");
      } catch (e) {
        onMessage?.(e instanceof Error ? e.message : "Échec du chargement.");
      } finally {
        setIsUploadingMenuPdf(false);
        event.target.value = "";
      }
    }

    const editorCtx: EditorContext = useMemo(
      () => ({
        restaurantId: initial.restaurantId,
        slug: effectiveSlug,
        name,
        city,
        cuisineType,
        address,
        phone,
        email,
        websiteUrl,
        googleMapsUrl,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        logoUrl,
        coverImageUrl:
          coverImageUrl.trim() || (galleryUrls[featuredGalleryIndex] ?? galleryUrls[0] ?? ""),
        galleryUrls: galleryUrls.filter(Boolean),
        openingHours: initial.openingHours,
        menuDocuments: initial.menuDocuments,
        maxPartySize: initial.maxPartySize,
        seoTitle,
        seoDescription,
        pageStatus,
        showPublicInstagram: initial.showPublicInstagram,
        showPublicFacebook: initial.showPublicFacebook,
        showPublicGoogleMaps: initial.showPublicGoogleMaps,
        showPublicAddress: initial.showPublicAddress,
        showPublicPhone: initial.showPublicPhone,
        showPublicEmail: initial.showPublicEmail,
        showPublicWebsite: initial.showPublicWebsite,
        showPublicOpeningHours: initial.showPublicOpeningHours,
      }),
      [
        initial,
        effectiveSlug,
        name,
        city,
        cuisineType,
        address,
        phone,
        email,
        websiteUrl,
        googleMapsUrl,
        instagramUrl,
        facebookUrl,
        tiktokUrl,
        logoUrl,
        coverImageUrl,
        galleryUrls,
        featuredGalleryIndex,
        seoTitle,
        seoDescription,
        pageStatus,
      ],
    );

    const buildMergedConfig = useCallback((): PublicPageEditorConfig => {
      const c = editorConfig;
      return parseEditorConfig({
        ...c,
        hero: { ...c.hero, title: heroTitle, subtitle: heroSubtitle, primaryCta: ctaLabel },
        appearance: {
          ...c.appearance,
          primaryColor,
          secondaryColor,
          accentColor,
          stylePreset,
          ambiance,
          headingFont,
          bodyFont,
        },
        blockContent: {
          ...c.blockContent,
          about: { ...c.blockContent.about, body: shortDescription, title: c.premium.concept.title },
          highlights: { items: highlights },
          menu: { mode: menuMode, url: menuUrl },
        },
        premium: {
          ...c.premium,
          concept: {
            ...c.premium.concept,
            title: c.premium.concept.title,
            body: shortDescription || c.premium.concept.body,
          },
        },
        reservation: {
          ...c.reservation,
          enabled: reservationEnabled,
          intro: preBookingMessage,
          showPhoneCta,
          showHoursBeforeForm,
          noSlotsMessage,
          minLeadMinutes: minBookingLeadMinutes,
        },
      });
    }, [
      editorConfig,
      heroTitle,
      heroSubtitle,
      ctaLabel,
      primaryColor,
      secondaryColor,
      accentColor,
      stylePreset,
      ambiance,
      headingFont,
      bodyFont,
      shortDescription,
      highlights,
      menuMode,
      menuUrl,
      reservationEnabled,
      preBookingMessage,
      showPhoneCta,
      showHoursBeforeForm,
      noSlotsMessage,
      minBookingLeadMinutes,
    ]);

    const previewDraft = useMemo((): ExtendedPreviewDraft => {
      const merged = buildMergedConfig();
      const draft = editorConfigToPreviewDraft(merged, editorCtx);
      return {
        ...draft,
        specialMessage: specialMessage.trim() || null,
        editorConfig: merged,
        heroBadgeText: merged.hero.badgeText,
        heroLayout: merged.hero.layout,
        heroAlign: merged.hero.align,
        secondaryCtaLabel: merged.hero.secondaryCtaEnabled ? merged.hero.secondaryCta : undefined,
        themeMode: merged.appearance.themeMode,
        borderRadius: initial.borderRadius,
        buttonStyle: initial.buttonStyle,
        cardStyle: initial.cardStyle,
        fontSizeScale: initial.fontSizeScale,
        terraceEnabled: initial.terraceEnabled,
      };
    }, [
      buildMergedConfig,
      editorCtx,
      specialMessage,
      initial.borderRadius,
      initial.buttonStyle,
      initial.cardStyle,
      initial.fontSizeScale,
      initial.terraceEnabled,
    ]);

    const getRestaurantUpdate = useCallback(() => {
      // `editorConfig.appearance` est la source unique de vérité pour les couleurs
      // et la typographie : les colonnes plates sont synchronisées à partir
      // de cette source pour rester cohérentes après refresh / publication.
      const a = editorConfig.appearance;
      return {
        name: name.trim(),
        slug: effectiveSlug,
        city: city.trim() || null,
        cuisine_type: cuisineType.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        primary_color: normalizeHexColor(a.primaryColor),
        public_secondary_color: normalizeHexColor(a.secondaryColor),
        public_style_preset: stylePreset,
        public_ambiance: ambiance,
        public_hero_title: heroTitle.trim() || null,
        public_tagline: heroSubtitle.trim() || null,
        public_description: shortDescription.trim().slice(0, MAX_DESCRIPTION_CHARS) || null,
        public_display_name: name.trim() || null,
        public_cta_label: ctaLabel.trim().slice(0, 80) || null,
        logo_url: logoUrl.trim() || null,
        banner_url: coverImageUrl.trim() || null,
        hero_primary_color: normalizeHexColor(a.primaryColor),
        public_accent_color: normalizeHexColor(a.accentColor),
        // Le bouton CTA prend toujours la couleur d'accent — c'est par
        // construction la couleur d'action choisie par l'utilisateur.
        public_button_bg_color: normalizeHexColor(a.accentColor),
        public_button_text_color: normalizeHexColor(a.buttonTextColor),
        public_heading_text_color: normalizeHexColor(a.headingColor),
        public_body_text_color: normalizeHexColor(a.textColor),
        public_footer_bg_color: normalizeHexColor(a.footerBgColor),
        public_footer_text_color: normalizeHexColor(a.footerTextColor),
        page_background_color: normalizeHexColor(a.backgroundColor),
        public_heading_font: a.headingFont,
        public_body_font: a.bodyFont,
        public_hero_height: heroHeight,
        google_maps_url: googleMapsUrl.trim() || null,
        tiktok_url: tiktokUrl.trim() || null,
        public_seo_title: seoTitle.trim().slice(0, 70) || null,
        public_seo_description: seoDescription.trim().slice(0, 160) || null,
        public_page_status: pageStatus,
        public_page_published_at: publishedAt,
        public_page_draft_updated_at: new Date().toISOString(),
      };
    }, [
      editorConfig.appearance,
      name,
      effectiveSlug,
      city,
      cuisineType,
      phone,
      email,
      address,
      stylePreset,
      ambiance,
      heroTitle,
      heroSubtitle,
      shortDescription,
      ctaLabel,
      logoUrl,
      coverImageUrl,
      heroHeight,
      googleMapsUrl,
      tiktokUrl,
      seoTitle,
      seoDescription,
      pageStatus,
      publishedAt,
    ]);

    const getSettingsUpdate = useCallback(
      () => {
        const mergedEditor = buildMergedConfig();
        const a = editorConfig.appearance;
        // Conversion preset radius -> legacy enum stocké en BDD.
        const legacyRadius =
          a.borderRadius === "soft"
            ? "sharp"
            : a.borderRadius === "premium"
              ? "pill"
              : "rounded";
        return {
          logo_url: logoUrl.trim() || null,
          cover_image_url: coverImageUrl.trim() || null,
          gallery_image_urls: galleryUrls.filter(Boolean).slice(0, MAX_GALLERY_PHOTOS),
          featured_gallery_index: Math.min(featuredGalleryIndex, Math.max(0, galleryUrls.length - 1)),
          public_highlights: highlights.filter(Boolean).slice(0, MAX_HIGHLIGHTS),
          special_message: specialMessage.trim() || null,
          instagram_url: instagramUrl.trim() || null,
          facebook_url: facebookUrl.trim() || null,
          website_url: websiteUrl.trim() || null,
          public_menu_mode: menuMode,
          public_menu_url:
            menuMode === "url" || menuMode === "pdf" ? menuUrl.trim() || null : null,
          public_page_description: shortDescription.trim().slice(0, MAX_DESCRIPTION_CHARS) || null,
          pre_booking_message: preBookingMessage.trim() || null,
          public_reservation_enabled: reservationEnabled,
          min_booking_lead_minutes: Math.max(0, Math.min(10080, minBookingLeadMinutes)),
          no_slots_message: noSlotsMessage.trim() || null,
          show_hours_before_form: showHoursBeforeForm,
          show_phone_cta: showPhoneCta,
          // Toutes les valeurs visuelles sont synchronisées depuis editorConfig.appearance.
          accent_color: normalizeHexColor(a.accentColor),
          button_color: normalizeHexColor(a.accentColor),
          text_color: normalizeHexColor(a.textColor),
          heading_font: a.headingFont,
          body_font: a.bodyFont,
          button_style: a.buttonStyle,
          card_style: a.cardStyle,
          border_radius: legacyRadius,
          public_page_editor_config: mergedEditor,
        };
      },
      [
        buildMergedConfig,
        editorConfig.appearance,
        logoUrl,
        coverImageUrl,
        galleryUrls,
        featuredGalleryIndex,
        highlights,
        specialMessage,
        instagramUrl,
        facebookUrl,
        websiteUrl,
        menuMode,
        menuUrl,
        shortDescription,
        preBookingMessage,
        reservationEnabled,
        minBookingLeadMinutes,
        noSlotsMessage,
        showHoursBeforeForm,
        showPhoneCta,
      ],
    );

    const publishPage = useCallback(async () => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("restaurants")
        .update({
          ...getRestaurantUpdate(),
          public_page_status: "published",
          public_page_published_at: now,
          public_page_draft_updated_at: now,
        })
        .eq("id", initial.restaurantId);

      if (error) return { ok: false, error: error.message };

      const { error: settingsError } = await supabase
        .from("restaurant_settings")
        .upsert(
          { restaurant_id: initial.restaurantId, ...getSettingsUpdate() },
          { onConflict: "restaurant_id" },
        );

      if (settingsError) return { ok: false, error: settingsError.message };

      setPageStatus("published");
      setPublishedAt(now);
      setHasUnpublishedChanges(false);
      onMessage?.("Page publiée.");
      return { ok: true };
    }, [supabase, getRestaurantUpdate, getSettingsUpdate, initial.restaurantId, onMessage]);

    useImperativeHandle(
      ref,
      () => ({
        getRestaurantUpdate,
        getSettingsUpdate,
        getSlug: () => effectiveSlug,
        publishPage,
      }),
      [getRestaurantUpdate, getSettingsUpdate, effectiveSlug, publishPage],
    );

    const statusLabel =
      pageStatus === "draft"
        ? "Brouillon"
        : hasUnpublishedChanges
          ? "Modifications non publiées"
          : "Publié";

    const statusTone =
      pageStatus === "published" && !hasUnpublishedChanges ? ("success" as const) : ("sand" as const);

    const editor = (
      <div className="space-y-8">
        {showSummaryBar ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={statusTone}>{statusLabel}</Badge>
                <span className="text-sm font-semibold text-zg-fg">
                  Potentiel de conversion : {conversionScore}%
                </span>
                <span className="text-sm text-zg-muted">
                  · Publication {completionPercent}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-zg-border/60">
                <div
                  className="h-full rounded-full bg-zg-accent transition-all"
                  style={{ width: `${conversionScore}%` }}
                />
              </div>
              {conversionRecs.length > 0 ? (
                <p className="mt-2 max-w-2xl text-sm text-zg-muted">
                  Prochaine étape :{" "}
                  {conversionRecs.find((r) => r.priority === "high")?.message ??
                    conversionRecs[0]?.message}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ============================================================
            STEP 1 — DIRECTION VISUELLE
            ============================================================ */}
        <StepCard
          step={1}
          icon={<Palette className="h-5 w-5" />}
          title="Direction visuelle"
          subtitle="Composez l'identité de votre page : typographie, couleurs, hero et style des éléments. Les inspirations en haut sont des points de départ — tout reste modifiable."
        >
          {/* — Inspirations / starting points — */}
          <div>
            <ControlGroupTitle
              icon={<Sparkles className="h-3.5 w-3.5" />}
              title="Points de départ"
              hint="Cliquez sur une inspiration pour pré-remplir polices, couleurs et structure. Vous ajusterez chaque détail ensuite."
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {PAGE_PRESETS.map((preset) => {
                const visuals = PRESET_VISUALS[preset.id] ?? {
                  gradient: "linear-gradient(135deg,#f5f5f4,#e7e5e4)",
                  foreground: "#0f172a",
                  accent: "#0f172a",
                  tagline: preset.description,
                };
                const selected = editorConfig.conversion.structureTemplate === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handlePresetClick(preset.id)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border text-left transition-all",
                      selected
                        ? "border-zg-accent shadow-md ring-2 ring-zg-accent"
                        : "border-zg-border hover:border-zg-accent/60 hover:shadow-sm",
                    )}
                  >
                    <div
                      className="relative h-20 w-full overflow-hidden"
                      style={{ background: visuals.gradient }}
                    >
                      {selected ? (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-zg-accent shadow-sm">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-zg-fg">{preset.label}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-zg-muted line-clamp-2">
                        {visuals.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* — Typographie — */}
          <div className="mt-8 border-t border-zg-border/60 pt-6">
            <ControlGroupTitle
              icon={<TypeIcon className="h-3.5 w-3.5" />}
              title="Typographie"
              hint="Choisissez une paire toute prête ou personnalisez police titre et texte indépendamment."
            />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                Paires recommandées
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {FONT_PAIRINGS.map((pair) => {
                  const active =
                    editorConfig.appearance.headingFont === pair.headingFont &&
                    editorConfig.appearance.bodyFont === pair.bodyFont;
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      onClick={() => {
                        setHeadingFont(pair.headingFont);
                        setBodyFont(pair.bodyFont);
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            appearance: {
                              ...c.appearance,
                              headingFont: pair.headingFont,
                              bodyFont: pair.bodyFont,
                            },
                          }),
                        );
                        markDirty();
                      }}
                      aria-pressed={active}
                      className={cn(
                        "rounded-xl border p-3 text-left transition",
                        active
                          ? "border-zg-accent bg-zg-accent/5 ring-1 ring-zg-accent"
                          : "border-zg-border hover:border-zg-accent/40",
                      )}
                    >
                      <p
                        className="text-lg leading-tight"
                        style={{
                          fontFamily: `"${pair.headingFont}", Georgia, serif`,
                        }}
                      >
                        {pair.label}
                      </p>
                      <p
                        className="mt-1 text-xs text-zg-muted"
                        style={{ fontFamily: `"${pair.bodyFont}", system-ui, sans-serif` }}
                      >
                        {pair.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                  Police des titres
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {PUBLIC_PAGE_FONT_LIBRARY.map((font) => (
                    <FontPreviewCard
                      key={font.family}
                      family={font.family}
                      active={editorConfig.appearance.headingFont === font.family}
                      onSelect={() => {
                        setHeadingFont(font.family);
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            appearance: { ...c.appearance, headingFont: font.family },
                          }),
                        );
                        markDirty();
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                  Police du texte
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {PUBLIC_PAGE_FONT_LIBRARY.map((font) => (
                    <FontPreviewCard
                      key={font.family}
                      family={font.family}
                      active={editorConfig.appearance.bodyFont === font.family}
                      onSelect={() => {
                        setBodyFont(font.family);
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            appearance: { ...c.appearance, bodyFont: font.family },
                          }),
                        );
                        markDirty();
                      }}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* — Couleurs avancées — */}
          <div className="mt-8 border-t border-zg-border/60 pt-6">
            <ControlGroupTitle
              icon={<Palette className="h-3.5 w-3.5" />}
              title="Palette"
              hint="Définissez les couleurs principales. Plus haut dans Step 2 vous trouverez aussi des raccourcis CTA & accent."
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ColorField
                label="Fond de page"
                value={editorConfig.appearance.backgroundColor}
                onChange={(v) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      appearance: { ...c.appearance, backgroundColor: v },
                    }),
                  );
                  markDirty();
                }}
              />
              <ColorField
                label="Fond des sections"
                value={editorConfig.appearance.surfaceColor}
                onChange={(v) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      appearance: { ...c.appearance, surfaceColor: v },
                    }),
                  );
                  markDirty();
                }}
              />
              <ColorField
                label="Titres"
                value={editorConfig.appearance.headingColor}
                onChange={(v) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      appearance: { ...c.appearance, headingColor: v },
                    }),
                  );
                  markDirty();
                }}
              />
              <ColorField
                label="Texte courant"
                value={editorConfig.appearance.textColor}
                onChange={(v) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      appearance: { ...c.appearance, textColor: v },
                    }),
                  );
                  markDirty();
                }}
              />
              <ColorField
                label="Fond pied de page"
                value={editorConfig.appearance.footerBgColor}
                onChange={(v) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      appearance: { ...c.appearance, footerBgColor: v },
                    }),
                  );
                  markDirty();
                }}
              />
              <ColorField
                label="Texte pied de page"
                value={editorConfig.appearance.footerTextColor}
                onChange={(v) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      appearance: { ...c.appearance, footerTextColor: v },
                    }),
                  );
                  markDirty();
                }}
              />
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                Thème global
              </p>
              <div className="mt-2">
                <OptionChipGroup<"light" | "dark" | "auto">
                  value={editorConfig.appearance.themeMode}
                  onChange={(v) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({
                        ...c,
                        appearance: { ...c.appearance, themeMode: v },
                      }),
                    );
                    markDirty();
                  }}
                  options={[
                    { id: "light", label: "Clair", hint: "Fond clair, hero classique" },
                    { id: "dark", label: "Sombre", hint: "Fond profond, ambiance lounge" },
                    { id: "auto", label: "Automatique", hint: "Suit la préférence visiteur" },
                  ]}
                  columns={3}
                />
              </div>
            </div>
          </div>

          {/* — Hero — */}
          <div className="mt-8 border-t border-zg-border/60 pt-6">
            <ControlGroupTitle
              icon={<Layout className="h-3.5 w-3.5" />}
              title="Mise en page du hero"
              hint="La première impression. Choisissez la composition, la hauteur, l'alignement."
            />
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                  Composition
                </p>
                <div className="mt-2">
                  <OptionChipGroup<"left" | "center" | "overlay" | "split">
                    value={editorConfig.hero.layout}
                    onChange={(v) => {
                      setEditorConfig((c) =>
                        parseEditorConfig({
                          ...c,
                          hero: { ...c.hero, layout: v },
                        }),
                      );
                      markDirty();
                    }}
                    options={[
                      {
                        id: "overlay",
                        label: "Overlay",
                        hint: "Texte sur l'image plein écran",
                        preview: <div className="h-6 w-12 rounded bg-zg-fg/70" />,
                      },
                      {
                        id: "split",
                        label: "Split",
                        hint: "Image à droite, texte à gauche",
                        preview: (
                          <div className="flex h-6 w-12 gap-0.5">
                            <div className="flex-1 rounded-sm bg-zg-fg/30" />
                            <div className="flex-1 rounded-sm bg-zg-fg/70" />
                          </div>
                        ),
                      },
                      {
                        id: "center",
                        label: "Centré",
                        hint: "Symétrique, gastronomique",
                        preview: (
                          <div className="flex h-6 w-12 flex-col items-center justify-center gap-0.5">
                            <div className="h-1 w-8 rounded bg-zg-fg/70" />
                            <div className="h-1 w-5 rounded bg-zg-fg/40" />
                          </div>
                        ),
                      },
                      {
                        id: "left",
                        label: "Gauche",
                        hint: "Texte ancré à gauche",
                        preview: (
                          <div className="flex h-6 w-12 flex-col justify-center gap-0.5">
                            <div className="h-1 w-6 rounded bg-zg-fg/70" />
                            <div className="h-1 w-3 rounded bg-zg-fg/40" />
                          </div>
                        ),
                      },
                    ]}
                    columns={4}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                    Hauteur
                  </p>
                  <div className="mt-2">
                    <OptionChipGroup<"compact" | "normal" | "immersive">
                      value={editorConfig.hero.height}
                      onChange={(v) => {
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            hero: { ...c.hero, height: v },
                          }),
                        );
                        setHeroHeight(
                          v === "immersive" ? "tall" : v === "compact" ? "compact" : "normal",
                        );
                        markDirty();
                      }}
                      options={[
                        { id: "compact", label: "Compact" },
                        { id: "normal", label: "Standard" },
                        { id: "immersive", label: "Immersif" },
                      ]}
                      columns={3}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                    Alignement du texte
                  </p>
                  <div className="mt-2">
                    <OptionChipGroup<"left" | "center" | "right">
                      value={editorConfig.hero.align}
                      onChange={(v) => {
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            hero: { ...c.hero, align: v },
                          }),
                        );
                        markDirty();
                      }}
                      options={[
                        { id: "left", label: "Gauche" },
                        { id: "center", label: "Centre" },
                        { id: "right", label: "Droite" },
                      ]}
                      columns={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                  Badge (au-dessus du titre)
                </p>
                <Input
                  className="mt-2"
                  value={editorConfig.hero.badgeText}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, hero: { ...c.hero, badgeText: e.target.value } }),
                    );
                    markDirty();
                  }}
                  placeholder="Ex. Cuisine maison · Genève"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Toggle
                  checked={editorConfig.hero.overlayEnabled}
                  onChange={(v) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({
                        ...c,
                        hero: { ...c.hero, overlayEnabled: v },
                      }),
                    );
                    markDirty();
                  }}
                  label="Voile sombre sur l'image hero"
                />
                <Toggle
                  checked={editorConfig.hero.secondaryCtaEnabled}
                  onChange={(v) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({
                        ...c,
                        hero: { ...c.hero, secondaryCtaEnabled: v },
                      }),
                    );
                    markDirty();
                  }}
                  label="Afficher un second bouton (voir le menu)"
                />
              </div>
            </div>
          </div>

          {/* — Style des éléments — */}
          <div className="mt-8 border-t border-zg-border/60 pt-6">
            <ControlGroupTitle
              icon={<Settings2 className="h-3.5 w-3.5" />}
              title="Style des éléments"
              hint="Boutons, cartes, coins arrondis : ajustez le caractère général de la page."
            />
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                  Boutons
                </p>
                <div className="mt-2">
                  <OptionChipGroup<"filled" | "outlined" | "ghost">
                    value={editorConfig.appearance.buttonStyle}
                    onChange={(v) => {
                      setEditorConfig((c) =>
                        parseEditorConfig({
                          ...c,
                          appearance: { ...c.appearance, buttonStyle: v },
                        }),
                      );
                      markDirty();
                    }}
                    options={[
                      {
                        id: "filled",
                        label: "Plein",
                        hint: "Couleur d'accent, fort impact",
                        preview: (
                          <div className="rounded-md bg-zg-accent px-3 py-1 text-[10px] font-semibold text-white">
                            Réserver
                          </div>
                        ),
                      },
                      {
                        id: "outlined",
                        label: "Contour",
                        hint: "Élégant, plus discret",
                        preview: (
                          <div className="rounded-md border-2 border-zg-accent px-3 py-1 text-[10px] font-semibold text-zg-accent">
                            Réserver
                          </div>
                        ),
                      },
                      {
                        id: "ghost",
                        label: "Lien",
                        hint: "Texte souligné, ultra-fin",
                        preview: (
                          <div className="text-[10px] font-semibold text-zg-accent underline underline-offset-4">
                            Réserver
                          </div>
                        ),
                      },
                    ]}
                    columns={3}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                  Cartes
                </p>
                <div className="mt-2">
                  <OptionChipGroup<"flat" | "elevated" | "bordered">
                    value={editorConfig.appearance.cardStyle}
                    onChange={(v) => {
                      setEditorConfig((c) =>
                        parseEditorConfig({
                          ...c,
                          appearance: { ...c.appearance, cardStyle: v },
                        }),
                      );
                      markDirty();
                    }}
                    options={[
                      {
                        id: "flat",
                        label: "Plat",
                        hint: "Sans ombre, ultra-minimal",
                        preview: <div className="h-6 w-10 rounded-md bg-zg-surface" />,
                      },
                      {
                        id: "elevated",
                        label: "Ombré",
                        hint: "Douces ombres premium",
                        preview: (
                          <div className="h-6 w-10 rounded-md bg-zg-surface shadow-md" />
                        ),
                      },
                      {
                        id: "bordered",
                        label: "Tracé",
                        hint: "Bordure fine, éditorial",
                        preview: (
                          <div className="h-6 w-10 rounded-md border border-zg-border bg-zg-surface" />
                        ),
                      },
                    ]}
                    columns={3}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zg-muted">
                  Coins arrondis
                </p>
                <div className="mt-2">
                  <OptionChipGroup<"soft" | "medium" | "premium">
                    value={editorConfig.appearance.borderRadius}
                    onChange={(v) => {
                      setEditorConfig((c) =>
                        parseEditorConfig({
                          ...c,
                          appearance: { ...c.appearance, borderRadius: v },
                        }),
                      );
                      markDirty();
                    }}
                    options={[
                      {
                        id: "soft",
                        label: "Doux",
                        hint: "Légèrement arrondis",
                        preview: <div className="h-5 w-10 rounded-sm border border-zg-border" />,
                      },
                      {
                        id: "medium",
                        label: "Standard",
                        hint: "Équilibré",
                        preview: <div className="h-5 w-10 rounded-md border border-zg-border" />,
                      },
                      {
                        id: "premium",
                        label: "Très arrondi",
                        hint: "Style pill, luxueux",
                        preview: <div className="h-5 w-10 rounded-full border border-zg-border" />,
                      },
                    ]}
                    columns={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </StepCard>

        {/* ============================================================
            STEP 2 — CONTENU PRINCIPAL
            ============================================================ */}
        <StepCard
          step={2}
          icon={<Settings2 className="h-5 w-5" />}
          title="Contenu principal"
          subtitle="Les informations essentielles affichées en haut de votre page."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Nom du restaurant</label>
              <Input
                className="mt-2"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  markDirty();
                }}
                required
              />
            </div>
            <div>
              <label className="dashboard-field-label">Type de cuisine</label>
              <Input
                className="mt-2"
                value={cuisineType}
                onChange={(e) => {
                  setCuisineType(e.target.value);
                  markDirty();
                }}
                placeholder="Italienne, française, brasserie…"
              />
            </div>
            <div>
              <label className="dashboard-field-label">Ville</label>
              <Input
                className="mt-2"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  markDirty();
                }}
                placeholder="Genève"
              />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Phrase d&apos;accroche</label>
              <FieldHint>Une phrase courte affichée sous le titre principal du hero.</FieldHint>
              <Input
                className="mt-2"
                value={heroSubtitle}
                onChange={(e) => {
                  setHeroSubtitle(e.target.value);
                  markDirty();
                }}
                placeholder={defaultHeroSubtitle(cuisineType, city, ambiance)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Petite description</label>
              <FieldHint>Présentez votre concept en 2 ou 3 phrases — pas plus.</FieldHint>
              <Textarea
                className="mt-2 min-h-24"
                maxLength={MAX_DESCRIPTION_CHARS}
                value={shortDescription}
                onChange={(e) => {
                  setShortDescription(e.target.value);
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        concept: { ...c.premium.concept, body: e.target.value },
                      },
                    }),
                  );
                  markDirty();
                }}
                placeholder="Cuisine maison, ambiance chaleureuse, produits de saison."
              />
              <p className="mt-1 text-xs text-zg-text-muted">
                {shortDescription.length}/{MAX_DESCRIPTION_CHARS}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zg-border bg-zg-surface/60 p-4">
              <label className="dashboard-field-label">Image principale (hero)</label>
              <FieldHint>
                Utilisez une photo nette et lumineuse pour donner envie de réserver.
              </FieldHint>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-medium hover:border-zg-accent/60">
                  <Upload className="h-4 w-4" />
                  {coverImageUrl ? "Remplacer" : "Importer une photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "cover")}
                  />
                </label>
                {coverImageUrl ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-9"
                    onClick={() => {
                      void tryRemoveRestaurantPublicObject(supabase, coverImageUrl);
                      setCoverImageUrl("");
                      markDirty();
                    }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Retirer
                  </Button>
                ) : null}
                {isUploadingCover ? <span className="text-xs text-zg-muted">Envoi…</span> : null}
              </div>
              <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl border border-zg-border bg-zg-surface">
                {coverImageUrl ? (
                  <Image
                    src={coverImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="400px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-zg-muted" />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-zg-border bg-zg-surface/60 p-4">
              <label className="dashboard-field-label">Logo</label>
              <FieldHint>
                Utilisez une photo nette pour votre logo. Format carré ou horizontal recommandé.
              </FieldHint>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-medium hover:border-zg-accent/60">
                  <Upload className="h-4 w-4" />
                  {logoUrl ? "Remplacer" : "Importer un logo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "logo")}
                  />
                </label>
                {logoUrl ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-9"
                    onClick={() => {
                      void tryRemoveRestaurantPublicObject(supabase, logoUrl);
                      setLogoUrl("");
                      markDirty();
                    }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Retirer
                  </Button>
                ) : null}
                {isUploadingLogo ? <span className="text-xs text-zg-muted">Envoi…</span> : null}
              </div>
              <div className="mt-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-zg-border bg-zg-surface">
                {logoUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={logoUrl}
                      alt=""
                      fill
                      className="object-contain p-2"
                      unoptimized
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <ImageIcon className="h-7 w-7 text-zg-muted" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ColorField
              label="Couleur principale"
              hint="Utilisée pour les titres et accents sur la page publique."
              value={primaryColor}
              onChange={(v) => {
                setPrimaryColor(v);
                setEditorConfig((c) =>
                  parseEditorConfig({
                    ...c,
                    appearance: { ...c.appearance, primaryColor: v },
                  }),
                );
                markDirty();
              }}
            />
            <ColorField
              label="Couleur du bouton « Réserver »"
              hint="Couleur du CTA principal — choisissez quelque chose de chaud et contrasté."
              value={accentColor}
              onChange={(v) => {
                setAccentColor(v);
                setSecondaryColor(v);
                setEditorConfig((c) =>
                  parseEditorConfig({
                    ...c,
                    appearance: { ...c.appearance, accentColor: v, secondaryColor: v },
                  }),
                );
                markDirty();
              }}
            />
          </div>
        </StepCard>

        {/* ============================================================
            STEP 3 — SECTIONS DE LA PAGE
            ============================================================ */}
        <StepCard
          step={3}
          icon={<Layout className="h-5 w-5" />}
          title="Sections de la page"
          subtitle="Activez les sections que vous voulez afficher. Personnalisez le contenu de chacune juste en dessous."
        >
          <div className="space-y-3">
            {PAGE_SECTIONS.map((section) => {
              const enabled = editorConfig.blocks[section.id]?.enabled !== false;
              return (
                <div
                  key={section.id}
                  className={cn(
                    "rounded-2xl border transition",
                    enabled
                      ? "border-zg-border bg-zg-surface"
                      : "border-zg-border/60 bg-zg-surface/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-semibold text-zg-fg">{section.label}</p>
                      <p className="mt-0.5 text-xs text-zg-muted">{section.description}</p>
                    </div>
                    <Toggle
                      checked={enabled}
                      onChange={(v) => {
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            blocks: {
                              ...c.blocks,
                              [section.id]: { ...c.blocks[section.id], enabled: v },
                            },
                          }),
                        );
                        markDirty();
                      }}
                    />
                  </div>

                  {enabled && section.id === "about" ? (
                    <div className="space-y-3 border-t border-zg-border/60 p-4">
                      <div>
                        <label className="dashboard-field-label">Titre de la section</label>
                        <Input
                          className="mt-2"
                          value={editorConfig.premium.concept.title}
                          onChange={(e) => {
                            setEditorConfig((c) =>
                              parseEditorConfig({
                                ...c,
                                premium: {
                                  ...c.premium,
                                  concept: { ...c.premium.concept, title: e.target.value },
                                },
                              }),
                            );
                            markDirty();
                          }}
                          placeholder="Notre histoire"
                        />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Photo du concept (optionnel)</label>
                        <FieldHint>
                          Utilisez une photo nette et lumineuse pour donner envie de réserver. Si vide, la
                          1<sup>re</sup> photo de la galerie peut être utilisée sur la page publique.
                        </FieldHint>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-medium hover:border-zg-accent/60">
                            <Upload className="h-4 w-4" />
                            {editorConfig.premium.concept.imageUrl.trim()
                              ? "Remplacer l’image"
                              : "Importer une image"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                              className="hidden"
                              onChange={handleConceptImageUpload}
                            />
                          </label>
                          {editorConfig.premium.concept.imageUrl.trim() ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="min-h-9"
                              onClick={() => {
                                const prev = editorConfig.premium.concept.imageUrl.trim();
                                void tryRemoveRestaurantPublicObject(supabase, prev);
                                setEditorConfig((c) =>
                                  parseEditorConfig({
                                    ...c,
                                    premium: {
                                      ...c.premium,
                                      concept: { ...c.premium.concept, imageUrl: "" },
                                    },
                                  }),
                                );
                                markDirty();
                              }}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Supprimer
                            </Button>
                          ) : null}
                          {isUploadingConceptImage ? (
                            <span className="text-xs text-zg-muted">Envoi…</span>
                          ) : null}
                        </div>
                        <div className="relative mt-3 aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl border border-zg-border bg-zg-surface">
                          {editorConfig.premium.concept.imageUrl.trim() ? (
                            <Image
                              src={editorConfig.premium.concept.imageUrl.trim()}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                              sizes="400px"
                            />
                          ) : (
                            <div className="flex h-full min-h-[140px] items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-zg-muted" />
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-zg-muted">
                        Le texte affiché est la « Petite description » saisie à l&apos;étape 2.
                      </p>
                    </div>
                  ) : null}

                  {enabled && section.id === "menu" ? (
                    <div className="space-y-4 border-t border-zg-border/60 p-4">
                      <div className="rounded-2xl border border-zg-border bg-zg-surface/60 p-4">
                        <label className="dashboard-field-label">Carte / menu (PDF)</label>
                        <FieldHint>
                          Importez votre carte au format PDF. Les visiteurs ouvriront le fichier dans un nouvel
                          onglet — aucun lien à copier.
                        </FieldHint>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {menuUrl.trim() ? (
                            <>
                              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2">
                                <FileText className="h-5 w-5 shrink-0 text-zg-accent" aria-hidden />
                                <span className="truncate text-sm font-medium text-zg-fg">
                                  {displayFileNameFromUrl(menuUrl.trim())}
                                </span>
                              </div>
                              <a
                                href={menuUrl.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={buttonClassName({
                                  variant: "secondary",
                                  size: "sm",
                                  className: "min-h-9 shrink-0",
                                })}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Voir le PDF
                              </a>
                              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-medium hover:border-zg-accent/60">
                                <Upload className="h-4 w-4" />
                                Remplacer
                                <input
                                  type="file"
                                  accept="application/pdf,.pdf"
                                  className="hidden"
                                  onChange={handleMenuPdfUpload}
                                  disabled={isUploadingMenuPdf}
                                />
                              </label>
                              <Button
                                type="button"
                                variant="secondary"
                                className="min-h-9"
                                onClick={() => {
                                  const prev = menuUrl.trim();
                                  void tryRemoveRestaurantPublicObject(supabase, prev);
                                  setMenuUrl("");
                                  setMenuMode(null);
                                  setEditorConfig((c) =>
                                    parseEditorConfig({
                                      ...c,
                                      blockContent: {
                                        ...c.blockContent,
                                        menu: { mode: null, url: "" },
                                      },
                                    }),
                                  );
                                  markDirty();
                                }}
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Supprimer
                              </Button>
                            </>
                          ) : (
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-medium hover:border-zg-accent/60">
                              <Upload className="h-4 w-4" />
                              Importer un PDF
                              <input
                                type="file"
                                accept="application/pdf,.pdf"
                                className="hidden"
                                onChange={handleMenuPdfUpload}
                                disabled={isUploadingMenuPdf}
                              />
                            </label>
                          )}
                          {isUploadingMenuPdf ? (
                            <span className="text-xs text-zg-muted">Envoi…</span>
                          ) : null}
                        </div>
                        {menuMode === "url" && menuUrl.trim() ? (
                          <p className="mt-2 text-xs text-zg-muted">
                            Un ancien lien externe est encore utilisé. Importez un PDF ci-dessus pour héberger la
                            carte sur ZenGrow.
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="dashboard-field-label mb-0">
                            Plats mis en avant ({editorConfig.premium.menuOffers.length}/3)
                          </label>
                          {editorConfig.premium.menuOffers.length < 3 ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="min-h-9"
                              onClick={() => {
                                setEditorConfig((c) =>
                                  parseEditorConfig({
                                    ...c,
                                    premium: {
                                      ...c.premium,
                                      menuOffers: [...c.premium.menuOffers, newMenuOffer()],
                                    },
                                  }),
                                );
                                markDirty();
                              }}
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              Ajouter
                            </Button>
                          ) : null}
                        </div>

                        {editorConfig.premium.menuOffers.slice(0, 3).map((offer, idx) => (
                          <div
                            key={offer.id}
                            className="space-y-2 rounded-xl border border-zg-border bg-zg-surface/60 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-zg-muted">
                                Plat #{idx + 1}
                              </span>
                              <Button
                                type="button"
                                variant="secondary"
                                className="min-h-8 px-2 text-xs"
                                onClick={() => {
                                  const menuOffers = editorConfig.premium.menuOffers.filter(
                                    (_, i) => i !== idx,
                                  );
                                  setEditorConfig((c) =>
                                    parseEditorConfig({
                                      ...c,
                                      premium: { ...c.premium, menuOffers },
                                    }),
                                  );
                                  markDirty();
                                }}
                                aria-label="Supprimer ce plat"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Nom du plat"
                              value={offer.title}
                              onChange={(e) => {
                                const menuOffers = [...editorConfig.premium.menuOffers];
                                menuOffers[idx] = { ...offer, title: e.target.value };
                                setEditorConfig((c) =>
                                  parseEditorConfig({
                                    ...c,
                                    premium: { ...c.premium, menuOffers },
                                  }),
                                );
                                markDirty();
                              }}
                            />
                            <Input
                              placeholder="Description courte"
                              value={offer.description}
                              onChange={(e) => {
                                const menuOffers = [...editorConfig.premium.menuOffers];
                                menuOffers[idx] = { ...offer, description: e.target.value };
                                setEditorConfig((c) =>
                                  parseEditorConfig({
                                    ...c,
                                    premium: { ...c.premium, menuOffers },
                                  }),
                                );
                                markDirty();
                              }}
                            />
                            <div className="grid gap-2 sm:grid-cols-2">
                              <Input
                                placeholder="Prix (optionnel)"
                                value={offer.price}
                                onChange={(e) => {
                                  const menuOffers = [...editorConfig.premium.menuOffers];
                                  menuOffers[idx] = { ...offer, price: e.target.value };
                                  setEditorConfig((c) =>
                                    parseEditorConfig({
                                      ...c,
                                      premium: { ...c.premium, menuOffers },
                                    }),
                                  );
                                  markDirty();
                                }}
                              />
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-zg-muted">Photo du plat (optionnel)</label>
                                <div className="flex flex-wrap items-center gap-2">
                                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zg-border bg-zg-surface px-2.5 py-1.5 text-xs font-medium hover:border-zg-accent/60">
                                    <Upload className="h-3.5 w-3.5" />
                                    {offer.imageUrl.trim() ? "Remplacer" : "Importer"}
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                                      className="hidden"
                                      disabled={uploadingOfferIndex !== null}
                                      onChange={(e) => handleOfferImageUpload(idx, e)}
                                    />
                                  </label>
                                  {offer.imageUrl.trim() ? (
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      className="min-h-8 px-2 text-xs"
                                      onClick={() => {
                                        const prev = offer.imageUrl.trim();
                                        void tryRemoveRestaurantPublicObject(supabase, prev);
                                        const menuOffers = [...editorConfig.premium.menuOffers];
                                        menuOffers[idx] = { ...offer, imageUrl: "" };
                                        setEditorConfig((c) =>
                                          parseEditorConfig({
                                            ...c,
                                            premium: { ...c.premium, menuOffers },
                                          }),
                                        );
                                        markDirty();
                                      }}
                                    >
                                      Supprimer photo
                                    </Button>
                                  ) : null}
                                  {uploadingOfferIndex === idx ? (
                                    <span className="text-xs text-zg-muted">Envoi…</span>
                                  ) : null}
                                </div>
                                {offer.imageUrl.trim() ? (
                                  <div className="relative h-20 w-full max-w-[200px] overflow-hidden rounded-lg border border-zg-border bg-zg-surface">
                                    <Image
                                      src={offer.imageUrl.trim()}
                                      alt=""
                                      fill
                                      className="object-cover"
                                      unoptimized
                                      sizes="200px"
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}

                        {editorConfig.premium.menuOffers.length === 0 ? (
                          <p className="text-xs text-zg-muted">
                            Aucun plat ajouté. La section affichera la carte PDF si vous en avez importé une.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {enabled && section.id === "gallery" ? (
                    <div className="space-y-3 border-t border-zg-border/60 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className="dashboard-field-label mb-0">
                          Photos ({galleryUrls.length}/{MAX_GALLERY_PHOTOS})
                        </label>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-xs font-medium hover:border-zg-accent/60">
                          <Camera className="h-3.5 w-3.5" />
                          Ajouter
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            className="hidden"
                            disabled={galleryUrls.length >= MAX_GALLERY_PHOTOS}
                            onChange={(e) => handleFileUpload(e, "gallery")}
                          />
                        </label>
                      </div>
                      {isUploadingGallery ? (
                        <p className="text-xs text-zg-muted">Envoi…</p>
                      ) : null}
                      {galleryUrls.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {galleryUrls.map((url, idx) => (
                            <div
                              key={url}
                              className="group relative aspect-square overflow-hidden rounded-lg border border-zg-border"
                            >
                              <Image
                                src={url}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                                sizes="120px"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const u = galleryUrls[idx];
                                  void tryRemoveRestaurantPublicObject(supabase, u);
                                  setGalleryUrls((g) => g.filter((_, i) => i !== idx));
                                  markDirty();
                                }}
                                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                                aria-label="Supprimer la photo"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zg-muted">
                          Utilisez des photos nettes et lumineuses pour donner envie de réserver. Ajoutez 3 à 8
                          visuels pour une belle galerie.
                        </p>
                      )}
                      <div>
                        <label className="dashboard-field-label">Style de galerie</label>
                        <select
                          className="mt-2 h-10 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                          value={editorConfig.premium.gallery.style}
                          onChange={(e) => {
                            setEditorConfig((c) =>
                              parseEditorConfig({
                                ...c,
                                premium: {
                                  ...c.premium,
                                  gallery: {
                                    style: e.target.value as typeof c.premium.gallery.style,
                                  },
                                },
                              }),
                            );
                            markDirty();
                          }}
                        >
                          <option value="showcase">Showcase (grande image + vignettes)</option>
                          <option value="grid">Grille (mosaïque)</option>
                          <option value="instagram">Style Instagram</option>
                        </select>
                      </div>
                    </div>
                  ) : null}

                  {enabled && section.id === "hours" ? (
                    <div className="space-y-2 border-t border-zg-border/60 p-4">
                      <div className="rounded-xl border border-zg-border bg-zg-surface/60 p-3">
                        <ul className="space-y-1 text-sm text-zg-muted">
                          {formatOpeningHoursLines(initial.openingHours).map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <Link
                        href="/dashboard/settings?section=availability"
                        className="inline-flex items-center text-sm font-semibold text-zg-accent hover:underline"
                      >
                        Modifier les horaires
                        <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ) : null}

                  {enabled && section.id === "location" ? (
                    <div className="space-y-3 border-t border-zg-border/60 p-4">
                      <div>
                        <label className="dashboard-field-label">Adresse complète</label>
                        <Input
                          className="mt-2"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            markDirty();
                          }}
                          placeholder="Rue, n°, ville"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="dashboard-field-label">Téléphone</label>
                          <Input
                            className="mt-2"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              markDirty();
                            }}
                            placeholder="+41 …"
                          />
                        </div>
                        <div>
                          <label className="dashboard-field-label">E-mail (optionnel)</label>
                          <Input
                            type="email"
                            className="mt-2"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              markDirty();
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="dashboard-field-label">
                          Lien Google Maps (optionnel)
                        </label>
                        <Input
                          className="mt-2"
                          value={googleMapsUrl}
                          onChange={(e) => {
                            setGoogleMapsUrl(e.target.value);
                            markDirty();
                          }}
                          placeholder="https://maps.google.com/…"
                        />
                      </div>
                    </div>
                  ) : null}

                  {enabled && section.id === "gift_vouchers" ? (
                    <div className="space-y-4 border-t border-zg-border/60 p-4">
                      <p className="text-xs text-zg-muted">
                        Les demandes arrivent dans le tableau de bord, menu « Bons cadeaux ». Vous préparez et
                        envoyez le bon vous-même au client.
                      </p>
                      <div>
                        <label className="dashboard-field-label">Titre</label>
                        <Input
                          className="mt-2"
                          value={editorConfig.premium.giftVouchers.title}
                          onChange={(e) => {
                            setEditorConfig((c) =>
                              parseEditorConfig({
                                ...c,
                                premium: {
                                  ...c.premium,
                                  giftVouchers: { ...c.premium.giftVouchers, title: e.target.value },
                                },
                              }),
                            );
                            markDirty();
                          }}
                          placeholder="Offrir un bon cadeau"
                          maxLength={120}
                        />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Texte de présentation</label>
                        <Textarea
                          className="mt-2 min-h-20"
                          value={editorConfig.premium.giftVouchers.body}
                          onChange={(e) => {
                            setEditorConfig((c) =>
                              parseEditorConfig({
                                ...c,
                                premium: {
                                  ...c.premium,
                                  giftVouchers: { ...c.premium.giftVouchers, body: e.target.value },
                                },
                              }),
                            );
                            markDirty();
                          }}
                          placeholder="Présentez votre offre en quelques phrases."
                          maxLength={1200}
                        />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Texte du bouton</label>
                        <Input
                          className="mt-2"
                          value={editorConfig.premium.giftVouchers.ctaLabel}
                          onChange={(e) => {
                            setEditorConfig((c) =>
                              parseEditorConfig({
                                ...c,
                                premium: {
                                  ...c.premium,
                                  giftVouchers: { ...c.premium.giftVouchers, ctaLabel: e.target.value },
                                },
                              }),
                            );
                            markDirty();
                          }}
                          placeholder="Demander un bon cadeau"
                          maxLength={80}
                        />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Image (optionnel)</label>
                        <FieldHint>Visuel fort type carte cadeau ou ambiance du restaurant.</FieldHint>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-medium hover:border-zg-accent/60">
                            <Upload className="h-4 w-4" />
                            {editorConfig.premium.giftVouchers.imageUrl.trim()
                              ? "Remplacer"
                              : "Importer une image"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                              className="hidden"
                              onChange={handleGiftVoucherImageUpload}
                              disabled={isUploadingGiftVoucherImage}
                            />
                          </label>
                          {editorConfig.premium.giftVouchers.imageUrl.trim() ? (
                            <Button
                              type="button"
                              variant="secondary"
                              className="min-h-9"
                              onClick={() => {
                                const prev = editorConfig.premium.giftVouchers.imageUrl.trim();
                                void tryRemoveRestaurantPublicObject(supabase, prev);
                                setEditorConfig((c) =>
                                  parseEditorConfig({
                                    ...c,
                                    premium: {
                                      ...c.premium,
                                      giftVouchers: { ...c.premium.giftVouchers, imageUrl: "" },
                                    },
                                  }),
                                );
                                markDirty();
                              }}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Supprimer
                            </Button>
                          ) : null}
                          {isUploadingGiftVoucherImage ? (
                            <span className="text-xs text-zg-muted">Envoi…</span>
                          ) : null}
                        </div>
                        <div className="relative mt-3 aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl border border-zg-border bg-zg-surface">
                          {editorConfig.premium.giftVouchers.imageUrl.trim() ? (
                            <Image
                              src={editorConfig.premium.giftVouchers.imageUrl.trim()}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                              sizes="400px"
                            />
                          ) : (
                            <div className="flex h-full min-h-[120px] items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-zg-muted" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {enabled && section.id === "final_cta" ? (
                    <div className="space-y-3 border-t border-zg-border/60 p-4">
                      <div>
                        <label className="dashboard-field-label">Titre</label>
                        <Input
                          className="mt-2"
                          value={editorConfig.blockContent.finalCta.title}
                          onChange={(e) => {
                            setEditorConfig((c) =>
                              parseEditorConfig({
                                ...c,
                                blockContent: {
                                  ...c.blockContent,
                                  finalCta: {
                                    ...c.blockContent.finalCta,
                                    title: e.target.value,
                                  },
                                },
                              }),
                            );
                            markDirty();
                          }}
                          placeholder="Prêt à réserver ?"
                          maxLength={120}
                        />
                      </div>
                      <div>
                        <label className="dashboard-field-label">
                          Sous-titre (optionnel)
                        </label>
                        <Textarea
                          className="mt-2 min-h-16"
                          value={editorConfig.blockContent.finalCta.subtitle}
                          onChange={(e) => {
                            setEditorConfig((c) =>
                              parseEditorConfig({
                                ...c,
                                blockContent: {
                                  ...c.blockContent,
                                  finalCta: {
                                    ...c.blockContent.finalCta,
                                    subtitle: e.target.value,
                                  },
                                },
                              }),
                            );
                            markDirty();
                          }}
                          placeholder="Réservez votre table en quelques secondes."
                          maxLength={280}
                        />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Texte du bouton</label>
                        <Input
                          className="mt-2"
                          value={editorConfig.blockContent.finalCta.button}
                          onChange={(e) => {
                            setEditorConfig((c) =>
                              parseEditorConfig({
                                ...c,
                                blockContent: {
                                  ...c.blockContent,
                                  finalCta: {
                                    ...c.blockContent.finalCta,
                                    button: e.target.value,
                                  },
                                },
                              }),
                            );
                            markDirty();
                          }}
                          placeholder="Réserver une table"
                          maxLength={60}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </StepCard>

        {/* ============================================================
            STEP 4 — RÉSERVATION
            ============================================================ */}
        <StepCard
          step={4}
          icon={<Utensils className="h-5 w-5" />}
          title="Réservation"
          subtitle="La réservation est le cœur de votre page. Gardez-la facile à trouver."
        >
          <div className="space-y-5">
            <div>
              <label className="dashboard-field-label">Texte du bouton principal</label>
              <Input
                className="mt-2"
                value={ctaLabel}
                onChange={(e) => {
                  setCtaLabel(e.target.value);
                  markDirty();
                }}
                placeholder="Réserver une table"
              />
            </div>

            <div>
              <label className="dashboard-field-label">Position du bloc de réservation</label>
              <FieldHint>Où le formulaire de réservation apparaît sur la page.</FieldHint>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { id: "top_only", label: "Tout en haut", hint: "Juste sous le hero" },
                    { id: "top_middle", label: "Au milieu", hint: "Après le concept" },
                    { id: "full", label: "Partout", hint: "Hero + milieu + sticky" },
                  ] as const
                ).map((opt) => {
                  const active = editorConfig.conversion.ctaPlacement === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            conversion: {
                              ...c.conversion,
                              ctaPlacement: opt.id,
                              stickyMobile:
                                opt.id === "full" ? true : c.conversion.stickyMobile,
                            },
                          }),
                        );
                        markDirty();
                      }}
                      className={cn(
                        "rounded-xl border p-3 text-left transition",
                        active
                          ? "border-zg-accent bg-zg-accent/5 ring-1 ring-zg-accent"
                          : "border-zg-border hover:border-zg-accent/40",
                      )}
                    >
                      <p className="text-sm font-semibold text-zg-fg">{opt.label}</p>
                      <p className="mt-0.5 text-xs text-zg-muted">{opt.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Toggle
              checked={editorConfig.conversion.stickyMobile}
              onChange={(v) => {
                setEditorConfig((c) =>
                  parseEditorConfig({
                    ...c,
                    conversion: { ...c.conversion, stickyMobile: v },
                  }),
                );
                markDirty();
              }}
              label="Bouton « Réserver » fixé en bas sur mobile"
            />

            <div>
              <label className="dashboard-field-label">Message au-dessus du formulaire</label>
              <FieldHint>Quelques mots pour rassurer ou guider avant la réservation.</FieldHint>
              <Textarea
                className="mt-2 min-h-20"
                value={preBookingMessage}
                onChange={(e) => {
                  setPreBookingMessage(e.target.value);
                  markDirty();
                }}
                placeholder="Choisissez votre date, votre heure et le nombre de personnes."
              />
            </div>

            <div>
              <Toggle
                checked={showPhoneCta}
                onChange={(v) => {
                  setShowPhoneCta(v);
                  markDirty();
                }}
                label="Proposer aussi de réserver par téléphone"
              />
              {showPhoneCta ? (
                <div className="mt-3">
                  <label className="dashboard-field-label">Numéro affiché</label>
                  <div className="mt-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-zg-muted" />
                    <Input
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        markDirty();
                      }}
                      placeholder="+41 …"
                    />
                  </div>
                  <FieldHint>
                    Modifiable aussi via la section Contact &amp; localisation.
                  </FieldHint>
                </div>
              ) : null}
            </div>
          </div>
        </StepCard>

        {/* ============================================================
            STEP 6 — APERÇU & PUBLICATION
            ============================================================ */}
        <StepCard
          step={6}
          icon={<Sparkles className="h-5 w-5" />}
          title="Aperçu & publication"
          subtitle="Vérifiez votre page puis publiez-la quand tout est prêt."
        >
          <div className="space-y-5">
            <div>
              <label className="dashboard-field-label">
                Adresse de votre page publique
              </label>
              <FieldHint>
                Vous pouvez choisir un identifiant simple, sans caractères spéciaux.
              </FieldHint>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-zg-muted">…/r/</span>
                <Input
                  className="font-mono text-sm"
                  value={slug}
                  onChange={(e) => {
                    setSlug(sanitizePublicSlug(e.target.value));
                    markDirty();
                  }}
                />
              </div>
              <p className="mt-2 break-all text-xs text-zg-muted">{publicPath}</p>
            </div>

            <div className="rounded-2xl border border-zg-border bg-zg-surface/60 p-4">
              <p className="text-sm font-semibold text-zg-fg">Checklist avant publication</p>
              <ul className="mt-3 space-y-2">
                {checklistItems.map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                        item.done ? "bg-zg-accent text-white" : "bg-zg-border text-zg-muted",
                      )}
                    >
                      {item.done ? "✓" : ""}
                    </span>
                    <span className={item.done ? "text-zg-fg" : "text-zg-muted"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicPath);
                    onMessage?.("Lien copié.");
                  } catch {
                    onMessage?.("Impossible de copier.");
                  }
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copier le lien
              </Button>
              <a href={publicPath} target="_blank" rel="noreferrer">
                <Button type="button" variant="secondary" className="min-h-11">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir la page
                </Button>
              </a>
              <Button
                type="button"
                className="min-h-11"
                disabled={isPublishing}
                onClick={async () => {
                  setIsPublishing(true);
                  const result = await publishPage();
                  setIsPublishing(false);
                  if (!result.ok) onMessage?.(result.error ?? "Échec de la publication.");
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isPublishing
                  ? "Publication…"
                  : pageStatus === "published"
                    ? "Republier"
                    : "Publier"}
              </Button>
            </div>
          </div>
        </StepCard>
      </div>
    );

    const pendingPreset = pendingPresetId
      ? PAGE_PRESETS.find((p) => p.id === pendingPresetId) ?? null
      : null;

    return (
      <div className="space-y-2">
        {editor}
        <PublicPagePreviewStudio
          draft={previewDraft}
          publicPath={publicPath}
          conversionScore={conversionScore}
          pageStatusLabel={statusLabel}
          onPublish={
            hidePreviewPublish
              ? undefined
              : async () => {
                  setIsPublishing(true);
                  const result = await publishPage();
                  setIsPublishing(false);
                  if (!result.ok) onMessage?.(result.error ?? "Échec de la publication.");
                }
          }
          isPublishing={hidePreviewPublish ? undefined : isPublishing}
        />

        {pendingPreset ? (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-preset-title"
          >
            <div className="w-full max-w-md rounded-2xl border border-zg-border bg-zg-surface p-6 shadow-2xl">
              <h2 id="apply-preset-title" className="text-lg font-semibold text-zg-fg">
                Appliquer le modèle « {pendingPreset.label} » ?
              </h2>
              <p className="mt-2 text-sm text-zg-muted">
                Appliquer ce modèle va modifier la structure et certains réglages visuels de
                votre page (style, ordre des sections, hero, CTA). Vos textes déjà remplis
                seront conservés autant que possible.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
                <Button
                  type="button"
                  className="min-h-11 sm:w-auto"
                  onClick={confirmPendingPreset}
                >
                  Appliquer le modèle
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 sm:w-auto"
                  onClick={() => setPendingPresetId(null)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

export default PublicPageSettingsPanel;
