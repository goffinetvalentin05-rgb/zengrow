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
  Copy,
  ExternalLink,
  ImageIcon,
  Layout,
  Phone,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  Utensils,
  FileText,
  Layers,
  Palette,
  CalendarCheck,
  MapPin,
} from "lucide-react";
import {
  ShowroomActionsFields,
  ShowroomLogoHeroFields,
  ShowroomPracticalFields,
  ShowroomPublicationFields,
  ShowroomRatingFields,
} from "@/src/components/dashboard/public-page/showroom-dashboard-fields";
import { createClient } from "@/src/lib/supabase/client";
import { isGiftCardsEnabled } from "@/src/lib/config/features";
import {
  displayFileNameFromUrl,
  imageExtensionForUpload,
  tryRemoveRestaurantPublicObject,
  uploadRestaurantPublicAsset,
  validateRestaurantImageFile,
  validateRestaurantPdfFile,
} from "@/src/lib/restaurant-storage-upload";
import type { ThemeId, ThemeOverrides } from "@/src/lib/themes/types";
import { resolvedFontFamiliesForPreview, resolveThemeFonts } from "@/src/lib/themes/fonts/resolve";
import { resolvePublicTheme } from "@/src/lib/themes/resolve";
import { normalizeThemeId } from "@/src/lib/themes/registry";
import CustomizationZone from "@/src/components/dashboard/public-page/customization-zone";
import PublicPageIdentitySection from "@/src/components/dashboard/public-page/public-page-identity-section";
import PublicPageThemePicker from "@/src/components/dashboard/public-page/public-page-theme-picker";
import Button, { buttonClassName } from "@/src/components/ui/button";
import Badge from "@/src/components/ui/badge";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import PublicPagePreviewStudio, { type ExtendedPreviewDraft } from "@/src/components/dashboard/public-page/public-page-preview-studio";
import {
  type PublicPageEditorConfig,
  type PageBlockId,
  parseEditorConfig,
  editorConfigToPreviewDraft,
  type EditorContext,
  legacyHeroHeight,
} from "@/src/lib/public-page/editor-config";
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
import {
  pageSectionsOverlayForPersistence,
  resolvePublicPageSectionContent,
  type SectionDisplayLegacyHints,
} from "@/src/lib/public-page/resolve-public-page-copy";
import {
  HERO_DISPLAY_TOGGLE_OPTIONS,
  PRACTICAL_DISPLAY_TOGGLE_OPTIONS,
  resolveHeroDisplay,
  resolvePracticalDisplay,
  practicalDisplayToLegacySettings,
} from "@/src/lib/public-page/section-display";
import {
  patchHeroDisplay,
  patchPracticalDisplay,
} from "@/src/lib/public-page/patch-section-display";
import SectionDisplayToggles from "@/src/components/dashboard/public-page/section-display-toggles";
import { newMenuOffer } from "@/src/lib/public-page/premium-content";
import { mergePageSectionContent, type PageSectionContentV1 } from "@/src/lib/public-page/page-sections";
import {
  applyStructureToEditorConfig,
  resolvePageSectionStructure,
  sectionLayoutVariantsMap,
  syncRestaurantPageSectionsFull,
  type PageSectionDbRow,
  type PageSectionLayoutItem,
} from "@/src/lib/public-page/page-section-structure";
import PageSectionsEditor from "@/src/components/dashboard/public-page/page-sections-editor";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { CheckCircle2 } from "lucide-react";
import { isBlockEnabledInStructure } from "@/src/lib/public-page/section-registry";
import { PUBLIC_PAGE_FONT_LIBRARY, googleFontsHref } from "@/src/lib/public-page-fonts";
import {
  MAX_DESCRIPTION_CHARS,
  MAX_GALLERY_PHOTOS,
  MAX_HIGHLIGHTS,
  type PublicAmbiance,
  type PublicStylePreset,
} from "@/src/lib/public-page/constants";
/** Sections personnalisables (ordre d’édition : étapes contenu → …). */
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

/** Sections affichées dans l’éditeur (hors feature flag bons cadeaux). */
const VISIBLE_PAGE_SECTIONS = PAGE_SECTIONS.filter(
  (section) => isGiftCardsEnabled() || section.id !== "gift_vouchers",
);

function sectionDisplayLegacyFromInitial(
  initial: PublicPageSettingsInitial,
): SectionDisplayLegacyHints {
  return {
    contact: {
      showAddress: initial.showPublicAddress,
      showPhone: initial.showPublicPhone,
      showEmail: initial.showPublicEmail,
      showWebsite: initial.showPublicWebsite,
      showOpeningHours: initial.showPublicOpeningHours,
      showInstagram: initial.showPublicInstagram,
      showFacebook: initial.showPublicFacebook,
      showGoogleMaps: initial.showPublicGoogleMaps,
    },
  };
}

function applyPageSectionPatch(
  c: PublicPageEditorConfig,
  partial: PageSectionContentV1,
): PublicPageEditorConfig {
  return parseEditorConfig({
    ...c,
    pageSections: mergePageSectionContent(c.pageSections ?? {}, partial),
  });
}

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
  themeId: ThemeId;
  themeOverrides: ThemeOverrides;
  /** Données brutes `restaurant_page_sections` (calque restaurant sur les défauts thème + gabarit). */
  pageSectionsFromDb: PageSectionContentV1;
  pageSectionRows: PageSectionDbRow[];
};

export type { PublicPagePublishState } from "@/src/components/dashboard/public-page/public-page-types";

export type PublicPageSettingsHandle = {
  getRestaurantUpdate: () => Record<string, unknown>;
  getSettingsUpdate: () => Record<string, unknown>;
  getSlug: () => string;
  /** Upsert minimal dans `restaurant_page_sections` (diff vs défauts thème + gabarit). */
  syncPageSectionsToDatabase: () => Promise<{ ok: boolean; error?: string }>;
  publishPage: () => Promise<{ ok: boolean; error?: string; noop?: boolean }>;
  getPublishState: () => import("@/src/components/dashboard/public-page/public-page-types").PublicPagePublishState;
  hasPendingChanges: () => boolean;
  acknowledgeSave: () => void;
};

type PublicPageSettingsPanelProps = {
  initial: PublicPageSettingsInitial;
  publicLinkBase: string;
  onMessage?: (msg: string | null) => void;
  /** Affiche la barre statut / conversion en tête du panneau (désactivé si le header page est externe). */
  showSummaryBar?: boolean;
  /** Masque le bouton Publier dans l’aperçu (publication via le header de la page dédiée). */
  hidePreviewPublish?: boolean;
  hideZoneNav?: boolean;
  hideLivePreview?: boolean;
  onDirtyChange?: () => void;
  onPublishStateChange?: (
    state: import("@/src/components/dashboard/public-page/public-page-types").PublicPagePublishState,
  ) => void;
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-zg-text-muted">{children}</p>;
}

function PageSectionsStructureCard({
  themeId,
  pageSectionStructure,
  setPageSectionStructure,
}: {
  themeId: ThemeId;
  pageSectionStructure: PageSectionLayoutItem[];
  setPageSectionStructure: (next: PageSectionLayoutItem[]) => void;
}) {
  return (
    <>
      <p className="max-w-2xl text-sm text-zg-text-muted">
        Glissez pour réordonner. Hero et Réservation sont obligatoires.
      </p>
      <div className="mt-4">
        <PageSectionsEditor
          themeId={themeId}
          structure={pageSectionStructure}
          onStructureChange={setPageSectionStructure}
        />
      </div>
    </>
  );
}

const PublicPageSettingsPanel = forwardRef<PublicPageSettingsHandle, PublicPageSettingsPanelProps>(
  function PublicPageSettingsPanel(
    {
      initial,
      publicLinkBase,
      onMessage,
      showSummaryBar = true,
      hidePreviewPublish = false,
      hideZoneNav = false,
      hideLivePreview = false,
      onDirtyChange,
      onPublishStateChange,
    },
    ref,
  ) {
    const showroomMode = hideZoneNav;
    const supabase = createClient();
    const showToast = useDashboardToast();

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
          // chargement pour que les réglages de la page (couleurs, etc.) reflètent la BDD.
          headingColor: initial.headingTextColor || base.appearance.headingColor,
          textColor: initial.bodyTextColor || base.appearance.textColor,
          footerBgColor: initial.pageBackgroundColor || initial.footerBgColor || base.appearance.footerBgColor,
          footerTextColor: initial.bodyTextColor || initial.footerTextColor || base.appearance.footerTextColor,
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
        pageSections: resolvePublicPageSectionContent(
          normalizeThemeId(initial.themeId),
          base.conversion.structureTemplate,
          initial.pageSectionsFromDb,
          sectionDisplayLegacyFromInitial(initial),
        ),
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
    const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl);
    const [googleMapsUrl, setGoogleMapsUrl] = useState(initial.googleMapsUrl);
    const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
    const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl);
    const [tiktokUrl, setTiktokUrl] = useState(initial.tiktokUrl);

    const [primaryColor, setPrimaryColor] = useState(initial.primaryColor || DEFAULT_PRIMARY);
    const [secondaryColor, setSecondaryColor] = useState(initial.secondaryColor || DEFAULT_SECONDARY);

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
    const [hasLocalChanges, setHasLocalChanges] = useState(false);

    const [accentColor, setAccentColor] = useState(initial.accentColor);
    const [headingFont, setHeadingFont] = useState(initial.headingFont);
    const [bodyFont, setBodyFont] = useState(initial.bodyFont);
    const [heroHeight, setHeroHeight] = useState(initial.heroHeight);

    const [themeId, setThemeId] = useState<ThemeId>(() => normalizeThemeId(initial.themeId));
    const [themeOverrides, setThemeOverrides] = useState<ThemeOverrides>(() => initial.themeOverrides ?? {});
    const [pageSectionStructure, setPageSectionStructure] = useState<PageSectionLayoutItem[]>(() =>
      resolvePageSectionStructure(initial.pageSectionRows, parseEditorConfig(initial.editorConfigRaw)),
    );

    useEffect(() => {
      setEditorConfig((c) =>
        parseEditorConfig({
          ...c,
          pageSections: resolvePublicPageSectionContent(
            themeId,
            c.conversion.structureTemplate,
            initial.pageSectionsFromDb,
            sectionDisplayLegacyFromInitial(initial),
          ),
        }),
      );
    }, [themeId, initial.pageSectionsFromDb, editorConfig.conversion.structureTemplate]);

    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);
    const [isUploadingConceptImage, setIsUploadingConceptImage] = useState(false);
    const [isUploadingGiftVoucherImage, setIsUploadingGiftVoucherImage] = useState(false);
    const [uploadingOfferIndex, setUploadingOfferIndex] = useState<number | null>(null);
    const [isUploadingMenuPdf, setIsUploadingMenuPdf] = useState(false);

    const displayName = name.trim() || "Restaurant";
    const practicalDisplayResolved = useMemo(
      () =>
        resolvePracticalDisplay(
          editorConfig.pageSections?.practical?.display,
          sectionDisplayLegacyFromInitial(initial).contact,
        ),
      [editorConfig.pageSections?.practical?.display, initial],
    );
    const heroDisplayResolved = useMemo(
      () =>
        resolveHeroDisplay(editorConfig.pageSections?.hero?.display, {
          showPhone: showPhoneCta,
          showSecondaryCta: editorConfig.hero.secondaryCtaEnabled,
        }),
      [
        editorConfig.pageSections?.hero?.display,
        editorConfig.hero.secondaryCtaEnabled,
        showPhoneCta,
      ],
    );
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

    const publishState = useMemo(
      () => ({
        pageStatus,
        publishedAt,
        hasUnpublishedChanges: hasUnpublishedChanges || hasLocalChanges,
      }),
      [pageStatus, publishedAt, hasUnpublishedChanges, hasLocalChanges],
    );

    useEffect(() => {
      onPublishStateChange?.(publishState);
    }, [publishState, onPublishStateChange]);

    const markDirty = useCallback(() => {
      setHasLocalChanges(true);
      if (pageStatus === "published") setHasUnpublishedChanges(true);
      onDirtyChange?.();
    }, [pageStatus, onDirtyChange]);

    const acknowledgeSave = useCallback(() => {
      setHasLocalChanges(false);
    }, []);

    const handleSectionStructureChange = useCallback(
      (next: PageSectionLayoutItem[]) => {
        setPageSectionStructure(next);
        setEditorConfig((c) => applyStructureToEditorConfig(c, next));
        markDirty();
        showToast({ message: "Ordre des sections mis à jour.", icon: CheckCircle2 });
      },
      [markDirty, showToast],
    );

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
      const merged = parseEditorConfig({
        ...c,
        hero: { ...c.hero, title: heroTitle, subtitle: heroSubtitle, primaryCta: ctaLabel },
        appearance: {
          ...c.appearance,
          primaryColor,
          secondaryColor,
          accentColor,
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
      return applyStructureToEditorConfig(merged, pageSectionStructure);
    }, [
      editorConfig,
      pageSectionStructure,
      heroTitle,
      heroSubtitle,
      ctaLabel,
      primaryColor,
      secondaryColor,
      accentColor,
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

    const syncPageSectionsToDatabase = useCallback(async () => {
      const merged = buildMergedConfig();
      const overlay = pageSectionsOverlayForPersistence(
        merged.pageSections ?? {},
        themeId,
        merged.conversion.structureTemplate,
      );
      const { error } = await syncRestaurantPageSectionsFull(
        supabase,
        initial.restaurantId,
        pageSectionStructure,
        overlay,
      );
      if (error) return { ok: false as const, error };
      return { ok: true as const };
    }, [buildMergedConfig, themeId, supabase, initial.restaurantId, pageSectionStructure]);

    const previewDraft = useMemo((): ExtendedPreviewDraft => {
      const merged = buildMergedConfig();
      const draft = editorConfigToPreviewDraft(merged, editorCtx);
      const resolvedTheme = resolvePublicTheme(themeId, themeOverrides);
      const resolvedFonts = resolveThemeFonts(themeId, themeOverrides.fonts);
      const themeFamilies = resolvedFontFamiliesForPreview(resolvedFonts);
      const useThemeTypography = Boolean(resolvedTheme.cssVarOverrides);
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
        visualThemeId: resolvedTheme.id,
        themeCssVarOverrides: resolvedTheme.cssVarOverrides,
        themeGoogleFontsUrl: resolvedTheme.googleFontsUrl,
        themeOverrides,
        headingFont: useThemeTypography ? themeFamilies.headingFont : draft.headingFont,
        bodyFont: useThemeTypography ? themeFamilies.bodyFont : draft.bodyFont,
        showGrainOverlay: resolvedTheme.showGrain,
        sectionLayoutVariants: sectionLayoutVariantsMap(themeId, pageSectionStructure),
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
      themeId,
      themeOverrides,
      pageSectionStructure,
    ]);

    const getRestaurantUpdate = useCallback(() => {
      // `editorConfig.appearance` est la source unique de vérité pour les couleurs
      // et la typographie : les colonnes plates sont synchronisées à partir
      // de cette source pour rester cohérentes après refresh / publication.
      const a = editorConfig.appearance;
      const practicalLegacy = practicalDisplayToLegacySettings(practicalDisplayResolved);
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
        public_style_preset: editorConfig.appearance.stylePreset,
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
        public_footer_bg_color: normalizeHexColor(a.backgroundColor),
        public_footer_text_color: normalizeHexColor(a.textColor),
        page_background_color: normalizeHexColor(a.backgroundColor),
        public_heading_font: a.headingFont,
        public_body_font: a.bodyFont,
        public_hero_height: heroHeight,
        google_maps_url: googleMapsUrl.trim() || null,
        tiktok_url: tiktokUrl.trim() || null,
        show_public_instagram: practicalLegacy.show_public_instagram,
        show_public_facebook: practicalLegacy.show_public_facebook,
        show_public_google_maps: practicalLegacy.show_public_google_maps,
        public_seo_title: seoTitle.trim().slice(0, 70) || null,
        public_seo_description: seoDescription.trim().slice(0, 160) || null,
        public_page_status: pageStatus,
        public_page_published_at: publishedAt,
        public_page_draft_updated_at: new Date().toISOString(),
        theme_id: themeId,
        theme_overrides: themeOverrides,
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
      themeId,
      themeOverrides,
      practicalDisplayResolved,
    ]);

    const getSettingsUpdate = useCallback(
      () => {
        const mergedEditor = buildMergedConfig();
        const { pageSections: _omitPageSections, ...editorForJson } = mergedEditor;
        const a = editorConfig.appearance;
        // Conversion preset radius -> legacy enum stocké en BDD.
        const legacyRadius =
          a.borderRadius === "soft"
            ? "sharp"
            : a.borderRadius === "premium"
              ? "pill"
              : "rounded";
        const practicalLegacy = practicalDisplayToLegacySettings(practicalDisplayResolved);
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
          public_page_show_address: practicalLegacy.public_page_show_address,
          public_page_show_phone: practicalLegacy.public_page_show_phone,
          public_page_show_email: practicalLegacy.public_page_show_email,
          public_page_show_website: practicalLegacy.public_page_show_website,
          public_page_show_opening_hours: practicalLegacy.public_page_show_opening_hours,
          // Toutes les valeurs visuelles sont synchronisées depuis editorConfig.appearance.
          accent_color: normalizeHexColor(a.accentColor),
          button_color: normalizeHexColor(a.accentColor),
          text_color: normalizeHexColor(a.textColor),
          heading_font: a.headingFont,
          body_font: a.bodyFont,
          button_style: a.buttonStyle,
          card_style: a.cardStyle,
          border_radius: legacyRadius,
          public_page_editor_config: editorForJson,
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
        practicalDisplayResolved,
      ],
    );

    const publishPage = useCallback(async () => {
      if (!hasLocalChanges && !hasUnpublishedChanges && pageStatus === "published") {
        return { ok: true, noop: true };
      }

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

      const sectionsSync = await syncPageSectionsToDatabase();
      if (!sectionsSync.ok) return { ok: false, error: sectionsSync.error };

      setPageStatus("published");
      setPublishedAt(now);
      setHasUnpublishedChanges(false);
      setHasLocalChanges(false);
      onMessage?.("Page publiée.");
      return { ok: true };
    }, [
      supabase,
      getRestaurantUpdate,
      getSettingsUpdate,
      initial.restaurantId,
      onMessage,
      syncPageSectionsToDatabase,
      hasLocalChanges,
      hasUnpublishedChanges,
      pageStatus,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        getRestaurantUpdate,
        getSettingsUpdate,
        getSlug: () => effectiveSlug,
        syncPageSectionsToDatabase,
        publishPage,
        getPublishState: () => publishState,
        hasPendingChanges: () => hasLocalChanges || hasUnpublishedChanges,
        acknowledgeSave,
      }),
      [
        getRestaurantUpdate,
        getSettingsUpdate,
        effectiveSlug,
        syncPageSectionsToDatabase,
        publishPage,
        publishState,
        hasLocalChanges,
        hasUnpublishedChanges,
        acknowledgeSave,
      ],
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

        {hideZoneNav ? null : (
          <nav
            className="flex flex-wrap gap-2 rounded-xl border border-zg-border/80 bg-zg-surface-elevated/40 p-2 text-xs font-medium"
            aria-label="Zones de personnalisation"
          >
            {[
              { href: "#zone-theme", label: "Thème" },
              { href: "#zone-identite", label: "Identité" },
              { href: "#zone-sections", label: "Sections" },
              { href: "#zone-contenu", label: "Contenu" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-zg-text-muted transition hover:bg-zg-border/40 hover:text-zg-fg"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <CustomizationZone
          id="zone-theme"
          icon={Palette}
          title={showroomMode ? "Apparence" : "Personnalisez l'expérience"}
          description={
            showroomMode
              ? "Template, couleurs principales et typographie."
              : "Template de conversion, couleurs et typographie."
          }
        >
          <PublicPageThemePicker
            publicUrl={publicLinkBase}
            selectedId={themeId}
            onSelect={(id) => {
              setThemeId(id);
              markDirty();
            }}
            onThemeApplied={() => {
              showToast({ message: "Thème changé.", icon: CheckCircle2 });
            }}
            overrides={themeOverrides}
            onResetOverrides={() => {
              setThemeOverrides({});
              markDirty();
            }}
          />
          {showroomMode ? (
            <div className="mt-6 border-t border-zg-border/60 pt-6">
              <PublicPageIdentitySection
                themeId={themeId}
                overrides={themeOverrides}
                onOverridesChange={(next) => {
                  setThemeOverrides(next);
                  markDirty();
                }}
                legacyAccentColor={accentColor}
                onLegacyAccentChange={(hex) => {
                  setAccentColor(hex);
                  setSecondaryColor(hex);
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      appearance: { ...c.appearance, accentColor: hex, secondaryColor: hex },
                    }),
                  );
                  markDirty();
                }}
                logoUrl={logoUrl}
                isUploadingLogo={isUploadingLogo}
                onLogoUpload={(e) => void handleFileUpload(e, "logo")}
                onLogoRemove={() => {
                  void tryRemoveRestaurantPublicObject(supabase, logoUrl);
                  setLogoUrl("");
                  markDirty();
                }}
              />
            </div>
          ) : null}
        </CustomizationZone>

        {!showroomMode ? (
          <CustomizationZone
            id="zone-identite"
            icon={Sparkles}
            title="Présentez votre restaurant"
            description="Nom, slogan, logo et identité visuelle."
          >
            <PublicPageIdentitySection
              themeId={themeId}
              overrides={themeOverrides}
              onOverridesChange={(next) => {
                setThemeOverrides(next);
                markDirty();
              }}
              legacyAccentColor={accentColor}
              onLegacyAccentChange={(hex) => {
                setAccentColor(hex);
                setSecondaryColor(hex);
                setEditorConfig((c) =>
                  parseEditorConfig({
                    ...c,
                    appearance: { ...c.appearance, accentColor: hex, secondaryColor: hex },
                  }),
                );
                markDirty();
              }}
              logoUrl={logoUrl}
              isUploadingLogo={isUploadingLogo}
              onLogoUpload={(e) => void handleFileUpload(e, "logo")}
              onLogoRemove={() => {
                void tryRemoveRestaurantPublicObject(supabase, logoUrl);
                setLogoUrl("");
                markDirty();
              }}
            />
          </CustomizationZone>
        ) : null}

        {!showroomMode ? (
          <CustomizationZone
            id="zone-sections"
            icon={Layers}
            title="Réservation"
            description="Bouton principal, sections visibles et parcours de réservation."
          >
            <PageSectionsStructureCard
              themeId={themeId}
              pageSectionStructure={pageSectionStructure}
              setPageSectionStructure={handleSectionStructureChange}
            />
          </CustomizationZone>
        ) : null}

        <CustomizationZone
          id="zone-contenu"
          icon={Sparkles}
          title={showroomMode ? "Contenu principal" : "Donnez envie de réserver"}
          description={
            showroomMode
              ? "Logo, image hero, identité et note Google."
              : "Photo principale, galerie, texte d'ambiance et menu."
          }
          className="space-y-8 !p-0 !border-0 !bg-transparent shadow-none"
        >
        <div className="space-y-8">
        {/* ============================================================
            ÉTAPE 1 — CONTENU PRINCIPAL
            ============================================================ */}
        <StepCard
          step={1}
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
            {showroomMode ? (
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Phrase d&apos;accroche</label>
                <FieldHint>
                  Poussez à réserver. Ex. « Réservez votre table en quelques secondes, sans appel et sans attente. »
                  Les textes trop descriptifs sont ignorés au profit du message par défaut.
                </FieldHint>
                <Textarea
                  className="mt-2 min-h-20"
                  maxLength={140}
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value);
                    setHeroSubtitle(e.target.value);
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
                  placeholder="Réservez votre table en quelques secondes, sans appel et sans attente."
                />
                <p className="mt-1 text-xs text-zg-text-muted">{shortDescription.length}/140</p>
              </div>
            ) : (
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
            )}
            {!showroomMode ? (
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
            ) : null}
          </div>

          {showroomMode ? (
            <>
              <ShowroomLogoHeroFields
                coverImageUrl={coverImageUrl}
                isUploadingCover={isUploadingCover}
                onCoverUpload={(e) => void handleFileUpload(e, "cover")}
                onCoverRemove={() => {
                  void tryRemoveRestaurantPublicObject(supabase, coverImageUrl);
                  setCoverImageUrl("");
                  markDirty();
                }}
              />
              <div className="mt-6 border-t border-zg-border/60 pt-6">
                <p className="mb-3 text-sm font-semibold text-zg-fg">Crédibilité Google</p>
                <ShowroomRatingFields
                  editorConfig={editorConfig}
                  setEditorConfig={setEditorConfig}
                  markDirty={markDirty}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mt-6">
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
              </div>

              <SectionDisplayToggles
                className="mt-6 border-t border-zg-border/60 pt-6"
                display={heroDisplayResolved}
                options={HERO_DISPLAY_TOGGLE_OPTIONS}
                availability={{
                  showCoverImage: Boolean(coverImageUrl.trim()),
                  showLogo: Boolean(logoUrl.trim()),
                  showBadge: Boolean(editorConfig.hero.badgeText?.trim()),
                  showPhone: Boolean(phone.trim()),
                  showSecondaryCta: editorConfig.hero.secondaryCtaEnabled,
                }}
                onChange={(key, value) => {
                  setEditorConfig((c) => parseEditorConfig(patchHeroDisplay(c, key, value)));
                  markDirty();
                  showToast({ message: "Affichage mis à jour", icon: CheckCircle2 });
                }}
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {themeId === "default" ? (
                  <ColorField
                    label="Couleur principale"
                    hint="Utilisée pour les titres sur la page publique (thème classique)."
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
                ) : (
                  <p className="md:col-span-2 rounded-lg border border-zg-border/80 bg-zg-surface-elevated/50 px-3 py-2 text-xs text-zg-text-muted">
                    Les couleurs d&apos;accent et de fond se règlent dans la zone <strong>Identité</strong> ci-dessus.
                  </p>
                )}
              </div>
            </>
          )}
        </StepCard>

        {showroomMode ? (
          <>
            <CustomizationZone
              id="zone-actions"
              icon={CalendarCheck}
              title="Actions"
              description="Bouton de réservation, menu et réseaux sociaux."
            >
              <ShowroomActionsFields
                ctaLabel={ctaLabel}
                onCtaLabelChange={setCtaLabel}
                ctaReassurance={preBookingMessage}
                onCtaReassuranceChange={setPreBookingMessage}
                menuMode={menuMode}
                menuUrl={menuUrl}
                onMenuModeChange={setMenuMode}
                onMenuUrlChange={setMenuUrl}
                menuEnabled={editorConfig.hero.secondaryCtaEnabled}
                onMenuEnabledChange={(v) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      hero: { ...c.hero, secondaryCtaEnabled: v },
                    }),
                  );
                }}
                onMenuPdfUpload={handleMenuPdfUpload}
                isUploadingMenuPdf={isUploadingMenuPdf}
                instagramUrl={instagramUrl}
                onInstagramChange={setInstagramUrl}
                facebookUrl={facebookUrl}
                onFacebookChange={setFacebookUrl}
                tiktokUrl={tiktokUrl}
                onTiktokChange={setTiktokUrl}
                websiteUrl={websiteUrl}
                onWebsiteChange={setWebsiteUrl}
                markDirty={markDirty}
              />
            </CustomizationZone>

            <CustomizationZone
              id="zone-infos"
              icon={MapPin}
              title="Infos pratiques"
              description="Horaires, adresse et itinéraire — affichage compact."
            >
              <ShowroomPracticalFields
                address={address}
                onAddressChange={setAddress}
                phone={phone}
                onPhoneChange={setPhone}
                googleMapsUrl={googleMapsUrl}
                onGoogleMapsChange={setGoogleMapsUrl}
                openingHours={initial.openingHours}
                markDirty={markDirty}
              />
            </CustomizationZone>

            <CustomizationZone
              id="zone-publication-slug"
              icon={Sparkles}
              title="Lien public"
              description="URL partageable pour Instagram, TikTok et QR code."
              className="scroll-mt-24"
            >
              <ShowroomPublicationFields
                slug={slug}
                onSlugChange={(v) => {
                  setSlug(v);
                  markDirty();
                }}
                publicPath={publicPath}
                onCopyLink={async () => {
                  try {
                    await navigator.clipboard.writeText(publicPath);
                    onMessage?.("Lien copié.");
                  } catch {
                    onMessage?.("Impossible de copier.");
                  }
                }}
                onOpenPreview={() => {
                  document.getElementById("zone-publication")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </CustomizationZone>
          </>
        ) : null}

        {!showroomMode ? (
        <>
        {/* ============================================================
            ÉTAPE 2 — TEXTES DES SECTIONS
            ============================================================ */}
        <StepCard
          step={2}
          icon={<FileText className="h-5 w-5" />}
          title="Textes des sections"
          subtitle="Titres, surtitres et libellés affichés sur votre page. Seules les personnalisations sont stockées en base ; le reste suit le thème."
        >
          <p className="text-sm text-zg-muted">
            Laissez un champ vide pour garder le texte suggéré par le thème et le gabarit de conversion.
          </p>

          <div className="mt-6 space-y-8">
            <div>
              <p className="text-sm font-semibold text-zg-fg">Navigation</p>
              {/* GIFT_CARDS feature flag — réactivable */}
              {isGiftCardsEnabled() ? (
                <div className="mt-3">
                  <label className="dashboard-field-label">Libellé du lien « bons cadeaux »</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.navigation?.giftNavLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          navigation: {
                            ...c.pageSections?.navigation,
                            items: c.pageSections?.navigation?.items ?? [],
                            giftNavLabel: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                    placeholder="Cadeaux"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Hero</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Invitation à découvrir le concept</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.hero?.discoverConceptLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          hero: { ...c.pageSections?.hero, discoverConceptLabel: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Indication de défilement</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.hero?.scrollHintLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          hero: { ...c.pageSections?.hero, scrollHintLabel: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="dashboard-field-label">Sous-texte script (thème sombre)</label>
                  <FieldHint>Remplace le statut d’ouverture au centre du hero si besoin.</FieldHint>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.hero?.scriptLineFallback ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          hero: { ...c.pageSections?.hero, scriptLineFallback: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Concept</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Surtitre (eyebrow)</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.concept?.eyebrow ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          concept: { ...c.pageSections?.concept, eyebrow: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Cachet sur l’image</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.concept?.imageStampLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          concept: { ...c.pageSections?.concept, imageStampLabel: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Points forts (bandeau)</p>
              <div className="mt-3">
                <label className="dashboard-field-label">Surtitre</label>
                <Input
                  className="mt-2"
                  value={editorConfig.pageSections?.highlights?.eyebrow ?? ""}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      applyPageSectionPatch(c, {
                        highlights: { ...c.pageSections?.highlights, eyebrow: e.target.value },
                      }),
                    );
                    markDirty();
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Menu / offres</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Surtitre</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.menu_offers?.eyebrow ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          menu_offers: { ...c.pageSections?.menu_offers, eyebrow: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Titre de section</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.menu_offers?.title ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          menu_offers: { ...c.pageSections?.menu_offers, title: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="dashboard-field-label">Libellé du bouton PDF / carte</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.menu_offers?.pdfButtonLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          menu_offers: {
                            ...c.pageSections?.menu_offers,
                            pdfButtonLabel: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Galerie</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Surtitre</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gallery?.eyebrow ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gallery: { ...c.pageSections?.gallery, eyebrow: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Titre (mosaïque premium)</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gallery?.title ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gallery: { ...c.pageSections?.gallery, title: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Titre si Instagram affiché</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gallery?.titleIfInstagram ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gallery: {
                            ...c.pageSections?.gallery,
                            titleIfInstagram: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Titre sans Instagram</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gallery?.titleIfNoInstagram ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gallery: {
                            ...c.pageSections?.gallery,
                            titleIfNoInstagram: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="dashboard-field-label">Libellé du lien Instagram</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gallery?.instagramLinkLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gallery: {
                            ...c.pageSections?.gallery,
                            instagramLinkLabel: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Avis & presse</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Suffixe « avis Google »</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.reviews?.googleReviewsSuffix ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          reviews: {
                            ...c.pageSections?.reviews,
                            googleReviewsSuffix: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Bouton Google</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.reviews?.googleCtaLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          reviews: { ...c.pageSections?.reviews, googleCtaLabel: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Titre bloc presse</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.reviews?.pressHeading ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          reviews: { ...c.pageSections?.reviews, pressHeading: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Libellé TripAdvisor</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.reviews?.tripAdvisorLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          reviews: {
                            ...c.pageSections?.reviews,
                            tripAdvisorLabel: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>

            {/* GIFT_CARDS feature flag — réactivable */}
            {isGiftCardsEnabled() ? (
            <div>
              <p className="text-sm font-semibold text-zg-fg">Bons cadeaux</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Surtitre (carte)</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gift_vouchers?.surfaceEyebrow ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gift_vouchers: {
                            ...c.pageSections?.gift_vouchers,
                            surfaceEyebrow: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Surtitre (fenêtre)</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gift_vouchers?.modalEyebrow ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gift_vouchers: {
                            ...c.pageSections?.gift_vouchers,
                            modalEyebrow: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="dashboard-field-label">Titre du formulaire</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gift_vouchers?.modalTitle ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gift_vouchers: {
                            ...c.pageSections?.gift_vouchers,
                            modalTitle: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="dashboard-field-label">Libellé du bouton d’envoi</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.gift_vouchers?.submitLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          gift_vouchers: {
                            ...c.pageSections?.gift_vouchers,
                            submitLabel: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>
            ) : null}

            <div>
              <p className="text-sm font-semibold text-zg-fg">Rappel final</p>
              <div className="mt-3">
                <label className="dashboard-field-label">Surtitre</label>
                <Input
                  className="mt-2"
                  value={editorConfig.pageSections?.final_cta?.eyebrow ?? ""}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      applyPageSectionPatch(c, {
                        final_cta: { ...c.pageSections?.final_cta, eyebrow: e.target.value },
                      }),
                    );
                    markDirty();
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Infos pratiques</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Surtitre</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.practical?.eyebrow ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          practical: { ...c.pageSections?.practical, eyebrow: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Titre</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.practical?.title ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          practical: { ...c.pageSections?.practical, title: e.target.value },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Bloc réservation</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Surtitre</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.reservation_shell?.eyebrow ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          reservation_shell: {
                            ...c.pageSections?.reservation_shell,
                            eyebrow: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Libellé « préférez le téléphone »</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.reservation_shell?.phonePreferLabel ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          reservation_shell: {
                            ...c.pageSections?.reservation_shell,
                            phonePreferLabel: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-zg-fg">Documents (PDF)</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Surtitre</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.menu_documents?.eyebrow ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          menu_documents: {
                            ...c.pageSections?.menu_documents,
                            eyebrow: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <label className="dashboard-field-label">Titre</label>
                  <Input
                    className="mt-2"
                    value={editorConfig.pageSections?.menu_documents?.title ?? ""}
                    onChange={(e) => {
                      setEditorConfig((c) =>
                        applyPageSectionPatch(c, {
                          menu_documents: {
                            ...c.pageSections?.menu_documents,
                            title: e.target.value,
                          },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </StepCard>

        {/* ============================================================
            ÉTAPE 3 — SECTIONS DE LA PAGE
            ============================================================ */}
        <StepCard
          step={3}
          icon={<Layout className="h-5 w-5" />}
          title="Contenu des sections"
          subtitle="Textes, images et options par bloc. L’ordre, l’activation et les variantes se règlent dans la zone Sections."
        >
          <p className="mb-4 text-sm text-zg-text-muted">
            Les sections désactivées sont réduites ci-dessous — réactivez-les via la zone{" "}
            <a href="#zone-sections" className="font-semibold text-zg-accent hover:underline">
              Sections
            </a>
            .
          </p>
          <div className="space-y-3">
            {VISIBLE_PAGE_SECTIONS.map((section) => {
              const enabled =
                section.id === "reservation" ||
                isBlockEnabledInStructure(pageSectionStructure, section.id, editorConfig);
              return (
                <div
                  key={section.id}
                  className={cn(
                    "rounded-2xl border transition",
                    enabled
                      ? "border-zg-border bg-zg-surface"
                      : "border-zg-border/60 bg-zg-surface/40 opacity-70",
                  )}
                >
                  <div className="p-4">
                    <p className="text-sm font-semibold text-zg-fg">{section.label}</p>
                    <p className="mt-0.5 text-xs text-zg-muted">{section.description}</p>
                    {!enabled ? (
                      <p className="mt-2 text-xs text-zg-text-muted">Section masquée sur la page publique.</p>
                    ) : null}
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
                        Le texte affiché est la « Petite description » saisie à l&apos;étape 1.
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
                          <option value="reels">Reels (vertical · TikTok / Stories)</option>
                          <option value="showcase">Showcase (grande image + vignettes)</option>
                          <option value="grid">Grille (mosaïque)</option>
                          <option value="instagram">Style Instagram (carré)</option>
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
                      <SectionDisplayToggles
                        display={practicalDisplayResolved}
                        options={PRACTICAL_DISPLAY_TOGGLE_OPTIONS}
                        availability={{
                          showDirections: Boolean(googleMapsUrl.trim()),
                          showEmail: Boolean(email.trim()),
                          showWebsite: Boolean(websiteUrl.trim()),
                          showParking: Boolean(editorConfig.premium.practical.parking.trim()),
                          showAccessibility: Boolean(
                            editorConfig.premium.practical.accessibility.trim(),
                          ),
                          showInstagram: Boolean(instagramUrl.trim()),
                          showFacebook: Boolean(facebookUrl.trim()),
                          showTiktok: Boolean(tiktokUrl.trim()),
                        }}
                        onChange={(key, value) => {
                          setEditorConfig((c) =>
                            parseEditorConfig(patchPracticalDisplay(c, key, value)),
                          );
                          markDirty();
                          showToast({ message: "Affichage mis à jour", icon: CheckCircle2 });
                        }}
                      />
                      <div className="space-y-3 border-t border-zg-border/60 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zg-muted">
                          Contenu
                        </p>
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
            ÉTAPE 4 — RÉSERVATION
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
            ÉTAPE 5 — APERÇU & PUBLICATION
            ============================================================ */}
        <StepCard
          step={5}
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
        </>
        ) : null}
        </div>
        </CustomizationZone>
      </div>
    );

    return (
      <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-start">
        <div className="min-w-0 flex-1 space-y-2">{editor}</div>
        {hideLivePreview ? null : (
          <div
            id="zone-publication"
            className="scroll-mt-24 2xl:sticky 2xl:top-6 2xl:w-[min(100%,400px)] 2xl:shrink-0"
          >
            <PublicPagePreviewStudio
              draft={previewDraft}
              publicPath={publicPath}
              conversionScore={conversionScore}
              pageStatusLabel={statusLabel}
              defaultViewport="mobile"
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
          </div>
        )}
      </div>
    );
  },
);

export default PublicPageSettingsPanel;
