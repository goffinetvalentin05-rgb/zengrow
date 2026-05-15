"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Copy,
  ExternalLink,
  ImageIcon,
  Palette,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Badge from "@/src/components/ui/badge";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import PublicPagePreviewStudio, { type ExtendedPreviewDraft } from "@/src/components/dashboard/public-page/public-page-preview-studio";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
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
  applyStylePresetColors,
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
  CTA_PLACEMENT_OPTIONS,
  PAGE_GOAL_OPTIONS,
  PERSUASION_OPTIONS,
} from "@/src/lib/public-page/conversion";
import { newEditorialSection, newMenuOffer } from "@/src/lib/public-page/premium-content";
import type { EditorialLayout } from "@/src/lib/public-page/premium-content";
import {
  MAX_DESCRIPTION_CHARS,
  MAX_GALLERY_PHOTOS,
  MAX_HIGHLIGHTS,
  PUBLIC_AMBIANCE_OPTIONS,
  PUBLIC_STYLE_PRESETS,
  type PublicAmbiance,
  type PublicStylePreset,
} from "@/src/lib/public-page/constants";
import type { PageBlockId } from "@/src/lib/public-page/editor-config";

const BLOCK_LABELS: Record<PageBlockId, string> = {
  trust: "Confiance (points forts)",
  reservation: "Réservation",
  gallery: "Galerie photos",
  about: "Concept / à propos",
  highlights: "Points forts",
  menu: "Menu",
  hours: "Horaires",
  reviews: "Avis & crédibilité",
  location: "Infos pratiques (pied de page)",
  social: "Réseaux sociaux",
  final_cta: "CTA final",
};

/** Blocs dont le toggle a un effet réel sur /r/[slug]. */
const PUBLIC_PAGE_BLOCK_TOGGLES: PageBlockId[] = [
  "about",
  "reservation",
  "gallery",
  "menu",
  "reviews",
  "location",
  "social",
  "final_cta",
];

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
    const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl);
    const [googleMapsUrl, setGoogleMapsUrl] = useState(initial.googleMapsUrl);
    const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
    const [facebookUrl, setFacebookUrl] = useState(initial.facebookUrl);
    const [tiktokUrl, setTiktokUrl] = useState(initial.tiktokUrl);

    const [primaryColor, setPrimaryColor] = useState(initial.primaryColor || DEFAULT_PRIMARY);
    const [secondaryColor, setSecondaryColor] = useState(initial.secondaryColor || DEFAULT_SECONDARY);
    const [stylePreset, setStylePreset] = useState<PublicStylePreset | null>(initial.stylePreset);
    const [ambiance, setAmbiance] = useState<PublicAmbiance | null>(initial.ambiance);

    const [heroTitle, setHeroTitle] = useState(initial.heroTitle);
    const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
    const [shortDescription, setShortDescription] = useState(initial.shortDescription);
    const [highlights, setHighlights] = useState<string[]>(initial.highlights.slice(0, MAX_HIGHLIGHTS));
    const [specialMessage, setSpecialMessage] = useState(initial.specialMessage);

    const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
    const [coverImageUrl, setCoverImageUrl] = useState(initial.coverImageUrl);
    const [galleryUrls, setGalleryUrls] = useState<string[]>(
      initial.galleryUrls.filter(Boolean).slice(0, MAX_GALLERY_PHOTOS),
    );
    const [featuredGalleryIndex, setFeaturedGalleryIndex] = useState(initial.featuredGalleryIndex);

    const [menuMode, setMenuMode] = useState<"url" | "pdf" | null>(initial.menuMode);
    const [menuUrl, setMenuUrl] = useState(initial.menuUrl);

    const [ctaLabel, setCtaLabel] = useState(initial.ctaLabel);
    const [reservationEnabled, setReservationEnabled] = useState(initial.reservationEnabled);
    const [preBookingMessage, setPreBookingMessage] = useState(initial.preBookingMessage);
    const [minBookingLeadMinutes, setMinBookingLeadMinutes] = useState(initial.minBookingLeadMinutes);
    const [noSlotsMessage, setNoSlotsMessage] = useState(initial.noSlotsMessage);
    const [showHoursBeforeForm, setShowHoursBeforeForm] = useState(initial.showHoursBeforeForm);
    const [showPhoneCta, setShowPhoneCta] = useState(initial.showPhoneCta);

    const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
    const [seoDescription, setSeoDescription] = useState(initial.seoDescription);

    const [pageStatus, setPageStatus] = useState<"draft" | "published">(initial.pageStatus);
    const [publishedAt, setPublishedAt] = useState<string | null>(initial.publishedAt);
    const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

    const [heroPrimaryColor, setHeroPrimaryColor] = useState(initial.heroPrimaryColor);
    const [accentColor, setAccentColor] = useState(initial.accentColor);
    const [pageBackgroundColor] = useState(initial.pageBackgroundColor);
    const [buttonColor] = useState(initial.buttonColor);
    const [buttonTextColor] = useState(initial.buttonTextColor);
    const [headingTextColor] = useState(initial.headingTextColor);
    const [bodyTextColor] = useState(initial.bodyTextColor);
    const [footerBgColor] = useState(initial.footerBgColor);
    const [footerTextColor] = useState(initial.footerTextColor);
    const [headingFont, setHeadingFont] = useState(initial.headingFont);
    const [bodyFont, setBodyFont] = useState(initial.bodyFont);
    const [heroTitleSizePx] = useState(initial.heroTitleSizePx);
    const [heroHeight, setHeroHeight] = useState(initial.heroHeight);
    const [heroOverlayEnabled] = useState(initial.heroOverlayEnabled);
    const [heroOverlayOpacity] = useState(initial.heroOverlayOpacity);

    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);

    const displayName = name.trim() || "Restaurant";
    const effectiveSlug = sanitizePublicSlug(slug || name);
    const publicPath = publicLinkBase.replace(/\/r\/[^/]+$/, `/r/${effectiveSlug}`);

    const resolvedHeroTitle = heroTitle.trim() || defaultHeroTitle(displayName);
    const resolvedHeroSubtitle =
      heroSubtitle.trim() || defaultHeroSubtitle(cuisineType, city, ambiance);

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
        menuUrl: menuMode === "url" ? menuUrl.trim() || null : null,
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

    const applyPreset = useCallback(
      (preset: PublicStylePreset) => {
        const applied = applyStylePresetColors(preset, primaryColor, secondaryColor);
        setStylePreset(preset);
        setPrimaryColor(applied.heroPrimary);
        setSecondaryColor(applied.accent);
        setHeroPrimaryColor(applied.heroPrimary);
        setAccentColor(applied.accent);
        setHeadingFont(applied.headingFont);
        setBodyFont(applied.bodyFont);
        setHeroHeight(applied.heroHeight);
        setEditorConfig((c) =>
          parseEditorConfig({
            ...c,
            appearance: {
              ...c.appearance,
              stylePreset: preset,
              primaryColor: applied.heroPrimary,
              secondaryColor: applied.accent,
              accentColor: applied.accent,
              backgroundColor: applied.pageBg,
              surfaceColor: applied.surfaceColor,
              textColor: applied.bodyColor,
              headingColor: applied.headingColor,
              footerBgColor: applied.footerBg,
              footerTextColor: applied.footerText,
              buttonTextColor: applied.buttonText,
              headingFont: applied.headingFont,
              bodyFont: applied.bodyFont,
              themeMode: applied.themeMode,
            },
          }),
        );
        markDirty();
      },
      [primaryColor, secondaryColor, markDirty],
    );

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
          setHeroPrimaryColor(next.appearance.primaryColor);
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

    const resetStyle = useCallback(() => {
      setPrimaryColor(DEFAULT_PRIMARY);
      setSecondaryColor(DEFAULT_SECONDARY);
      setStylePreset(null);
      setHeroPrimaryColor(DEFAULT_PRIMARY);
      setAccentColor(DEFAULT_SECONDARY);
      markDirty();
    }, [markDirty]);

    async function uploadAsset(file: File, type: "logo" | "cover" | "gallery") {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${initial.restaurantId}/${type}-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("restaurants").upload(filePath, file, { upsert: true });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("restaurants").getPublicUrl(filePath);
      return data.publicUrl;
    }

    async function handleFileUpload(
      event: ChangeEvent<HTMLInputElement>,
      kind: "logo" | "cover" | "gallery",
    ) {
      const file = event.target.files?.[0];
      if (!file) return;
      onMessage?.(null);
      const setLoading =
        kind === "logo" ? setIsUploadingLogo : kind === "cover" ? setIsUploadingCover : setIsUploadingGallery;
      setLoading(true);
      try {
        const url = await uploadAsset(file, kind);
        if (kind === "logo") setLogoUrl(url);
        else if (kind === "cover") setCoverImageUrl(url);
        else if (galleryUrls.length < MAX_GALLERY_PHOTOS) setGalleryUrls((g) => [...g, url]);
        markDirty();
        onMessage?.("Photo enregistrée.");
      } catch (e) {
        onMessage?.(e instanceof Error ? e.message : "Échec du chargement.");
      } finally {
        setLoading(false);
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
      const presetColors = stylePreset
        ? applyStylePresetColors(stylePreset, primaryColor, secondaryColor)
        : null;
      return {
        name: name.trim(),
        slug: effectiveSlug,
        city: city.trim() || null,
        cuisine_type: cuisineType.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        primary_color: normalizeHexColor(primaryColor),
        public_secondary_color: normalizeHexColor(secondaryColor),
        public_style_preset: stylePreset,
        public_ambiance: ambiance,
        public_hero_title: heroTitle.trim() || null,
        public_tagline: heroSubtitle.trim() || null,
        public_description: shortDescription.trim().slice(0, MAX_DESCRIPTION_CHARS) || null,
        public_display_name: name.trim() || null,
        public_cta_label: ctaLabel.trim().slice(0, 80) || null,
        logo_url: logoUrl.trim() || null,
        banner_url: coverImageUrl.trim() || null,
        hero_primary_color: presetColors?.heroPrimary ?? normalizeHexColor(heroPrimaryColor),
        public_accent_color: presetColors?.accent ?? normalizeHexColor(accentColor),
        public_button_bg_color: presetColors?.buttonBg ?? normalizeHexColor(buttonColor || primaryColor),
        page_background_color: presetColors?.pageBg ?? pageBackgroundColor,
        public_heading_font: presetColors?.headingFont ?? headingFont,
        public_body_font: presetColors?.bodyFont ?? bodyFont,
        public_hero_height: presetColors?.heroHeight ?? heroHeight,
        google_maps_url: googleMapsUrl.trim() || null,
        tiktok_url: tiktokUrl.trim() || null,
        public_seo_title: seoTitle.trim().slice(0, 70) || null,
        public_seo_description: seoDescription.trim().slice(0, 160) || null,
        public_page_status: pageStatus,
        public_page_published_at: publishedAt,
        public_page_draft_updated_at: new Date().toISOString(),
      };
    }, [
      name,
      effectiveSlug,
      city,
      cuisineType,
      phone,
      email,
      address,
      primaryColor,
      secondaryColor,
      stylePreset,
      ambiance,
      heroTitle,
      heroSubtitle,
      shortDescription,
      ctaLabel,
      logoUrl,
      coverImageUrl,
      heroPrimaryColor,
      accentColor,
      buttonColor,
      pageBackgroundColor,
      headingFont,
      bodyFont,
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
        public_menu_url: menuMode === "url" ? menuUrl.trim() || null : null,
        public_page_description: shortDescription.trim().slice(0, MAX_DESCRIPTION_CHARS) || null,
        pre_booking_message: preBookingMessage.trim() || null,
        public_reservation_enabled: reservationEnabled,
        min_booking_lead_minutes: Math.max(0, Math.min(10080, minBookingLeadMinutes)),
        no_slots_message: noSlotsMessage.trim() || null,
        show_hours_before_form: showHoursBeforeForm,
        show_phone_cta: showPhoneCta,
        accent_color: normalizeHexColor(accentColor),
        button_color: normalizeHexColor(buttonColor || primaryColor),
        public_page_editor_config: mergedEditor,
      };
      },
      [
        buildMergedConfig,
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
        accentColor,
        buttonColor,
        primaryColor,
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
      <div className="space-y-6">
        {showSummaryBar ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone}>{statusLabel}</Badge>
              <span className="text-sm font-semibold text-zg-fg">
                Potentiel de conversion : {conversionScore}%
              </span>
              <span className="text-sm text-zg-muted">· Publication {completionPercent}%</span>
            </div>
            <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-zg-border/60">
              <div
                className="h-full rounded-full bg-zg-accent transition-all"
                style={{ width: `${conversionScore}%` }}
              />
            </div>
            {conversionRecs.length > 0 ? (
              <p className="mt-2 max-w-2xl text-sm text-zg-muted">
                Prochaine étape : {conversionRecs.find((r) => r.priority === "high")?.message ?? conversionRecs[0]?.message}
              </p>
            ) : null}
          </div>
        </div>
        ) : null}

        <div className="space-y-3">
        <SettingsAccordion
          title="Conversion & structure"
          description="Modèle de page, objectif et sections visibles sur votre page publique."
          defaultOpen
        >
          <div className="space-y-5">
            <FieldHint>
              Chaque modèle applique une structure, un style visuel et une posture de
              persuasion adaptés. Vos textes déjà saisis sont conservés.
            </FieldHint>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAGE_PRESETS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={editorConfig.conversion.structureTemplate === t.id}
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    editorConfig.conversion.structureTemplate === t.id
                      ? "border-zg-accent bg-zg-accent/5 ring-1 ring-zg-accent"
                      : "border-zg-border hover:border-zg-accent/40",
                  )}
                  onClick={() => handlePresetClick(t.id)}
                >
                  <p className="font-semibold text-zg-fg">{t.label}</p>
                  <p className="mt-1 text-xs text-zg-muted">{t.description}</p>
                </button>
              ))}
            </div>
            <div>
              <label className="dashboard-field-label">Objectif principal</label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                value={editorConfig.conversion.pageGoal}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      conversion: { ...c.conversion, pageGoal: e.target.value as typeof c.conversion.pageGoal },
                    }),
                  );
                  markDirty();
                }}
              >
                {PAGE_GOAL_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="dashboard-field-label">Style de persuasion</label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                value={editorConfig.conversion.persuasionStyle}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      conversion: {
                        ...c.conversion,
                        persuasionStyle: e.target.value as typeof c.conversion.persuasionStyle,
                      },
                    }),
                  );
                  markDirty();
                }}
              >
                {PERSUASION_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="dashboard-field-label">Répétition du CTA</label>
              <FieldHint>Un bon bouton de réservation doit être visible avant même de scroller.</FieldHint>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                value={editorConfig.conversion.ctaPlacement}
                onChange={(e) => {
                  const ctaPlacement = e.target.value as typeof editorConfig.conversion.ctaPlacement;
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      conversion: {
                        ...c.conversion,
                        ctaPlacement,
                        stickyMobile: ctaPlacement === "full",
                      },
                    }),
                  );
                  markDirty();
                }}
              >
                {CTA_PLACEMENT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
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
              label="Bouton sticky mobile « Réserver »"
            />
            <div className="space-y-3 border-t border-zg-border/60 pt-4">
              <label className="dashboard-field-label">Sections affichées</label>
              <FieldHint>Désactivez une section pour la masquer sur la page et dans l&apos;aperçu.</FieldHint>
              <div className="grid gap-2 sm:grid-cols-2">
                {PUBLIC_PAGE_BLOCK_TOGGLES.map((id) => (
                  <Toggle
                    key={id}
                    checked={editorConfig.blocks[id]?.enabled !== false}
                    onChange={(v) => {
                      setEditorConfig((c) =>
                        parseEditorConfig({
                          ...c,
                          blocks: {
                            ...c.blocks,
                            [id]: { ...c.blocks[id], enabled: v },
                          },
                        }),
                      );
                      markDirty();
                    }}
                    label={BLOCK_LABELS[id]}
                  />
                ))}
              </div>
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="Concept & expérience"
          description="Votre histoire, vos piliers et le style de la galerie."
        >
          <div className="space-y-5">
            <FieldHint>Racontez votre concept comme sur un vrai site restaurant — pas des badges génériques.</FieldHint>
            <Toggle
              checked={editorConfig.premium.navigationEnabled}
              onChange={(v) => {
                setEditorConfig((c) => parseEditorConfig({ ...c, premium: { ...c.premium, navigationEnabled: v } }));
                markDirty();
              }}
              label="Navigation type site (Accueil, Concept, Menu…)"
            />
            <div>
              <label className="dashboard-field-label">Titre de la section concept</label>
              <Input
                className="mt-2"
                value={editorConfig.premium.concept.title}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: { ...c.premium, concept: { ...c.premium.concept, title: e.target.value } },
                    }),
                  );
                  markDirty();
                }}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Présentation courte</label>
              <Textarea
                className="mt-2 min-h-28"
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
              />
              <p className="mt-1 text-xs text-zg-text-muted">
                {shortDescription.length}/{MAX_DESCRIPTION_CHARS}
              </p>
            </div>
            <div>
              <label className="dashboard-field-label">Image concept (URL)</label>
              <Input
                className="mt-2"
                value={editorConfig.premium.concept.imageUrl}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: { ...c.premium, concept: { ...c.premium.concept, imageUrl: e.target.value } },
                    }),
                  );
                  markDirty();
                }}
                placeholder="Sinon, 1ère photo de la galerie"
              />
            </div>
            <div>
              <label className="dashboard-field-label">Style galerie</label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                value={editorConfig.premium.gallery.style}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        gallery: { style: e.target.value as typeof c.premium.gallery.style },
                      },
                    }),
                  );
                  markDirty();
                }}
              >
                <option value="showcase">Showcase (grande image + vignettes)</option>
                <option value="grid">Grille masonry</option>
                <option value="instagram">Style Instagram</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="dashboard-field-label">Piliers du concept (3 accroches)</label>
              {editorConfig.premium.concept.pillars.map((pillar, idx) => (
                <div key={idx} className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Titre"
                    value={pillar.title}
                    onChange={(e) => {
                      const pillars = [...editorConfig.premium.concept.pillars];
                      pillars[idx] = { ...pillar, title: e.target.value };
                      setEditorConfig((c) =>
                        parseEditorConfig({
                          ...c,
                          premium: { ...c.premium, concept: { ...c.premium.concept, pillars } },
                        }),
                      );
                      markDirty();
                    }}
                  />
                  <Input
                    placeholder="Description courte"
                    value={pillar.text}
                    onChange={(e) => {
                      const pillars = [...editorConfig.premium.concept.pillars];
                      pillars[idx] = { ...pillar, text: e.target.value };
                      setEditorConfig((c) =>
                        parseEditorConfig({
                          ...c,
                          premium: { ...c.premium, concept: { ...c.premium.concept, pillars } },
                        }),
                      );
                      markDirty();
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="Points forts"
          description="3 à 6 points forts visibles en haut de la page (selon le modèle choisi)."
        >
          <div className="space-y-3">
            <FieldHint>
              Apparaissent dans le bandeau « Points forts » de la page si le bloc est activé
              (ex. modèle « Restaurant chaleureux »).
            </FieldHint>
            <Toggle
              checked={editorConfig.blocks.highlights?.enabled === true}
              onChange={(v) => {
                setEditorConfig((c) =>
                  parseEditorConfig({
                    ...c,
                    blocks: {
                      ...c.blocks,
                      highlights: { ...c.blocks.highlights, enabled: v },
                    },
                  }),
                );
                markDirty();
              }}
              label="Afficher la section « Points forts » sur la page"
            />
            <div className="space-y-2">
              {highlights.map((value, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={value}
                    onChange={(e) => {
                      const next = [...highlights];
                      next[idx] = e.target.value;
                      setHighlights(next);
                      markDirty();
                    }}
                    placeholder="Ex. Produits frais, terrasse, ambiance familiale…"
                    maxLength={80}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => {
                      setHighlights((items) => items.filter((_, i) => i !== idx));
                      markDirty();
                    }}
                    aria-label="Supprimer ce point fort"
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
              {highlights.length < MAX_HIGHLIGHTS ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setHighlights((items) => [...items, ""]);
                    markDirty();
                  }}
                >
                  Ajouter un point fort
                </Button>
              ) : (
                <p className="text-sm text-zg-muted">
                  Vous pouvez ajouter jusqu&apos;à {MAX_HIGHLIGHTS} points forts.
                </p>
              )}
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="Sections personnalisées"
          description="Jusqu'à 4 blocs image + texte pour raconter votre histoire."
        >
          <div className="space-y-4">
            {editorConfig.premium.editorialSections.map((section, idx) => (
              <div key={section.id} className="space-y-3 rounded-xl border border-zg-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zg-fg">Section {idx + 1}</span>
                  <Toggle
                    checked={section.enabled}
                    onChange={(v) => {
                      const editorialSections = [...editorConfig.premium.editorialSections];
                      editorialSections[idx] = { ...section, enabled: v };
                      setEditorConfig((c) =>
                        parseEditorConfig({ ...c, premium: { ...c.premium, editorialSections } }),
                      );
                      markDirty();
                    }}
                    label="Visible"
                  />
                </div>
                <Input
                  placeholder="Titre"
                  value={section.title}
                  onChange={(e) => {
                    const editorialSections = [...editorConfig.premium.editorialSections];
                    editorialSections[idx] = { ...section, title: e.target.value };
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, premium: { ...c.premium, editorialSections } }),
                    );
                    markDirty();
                  }}
                />
                <Textarea
                  className="min-h-24"
                  placeholder="Texte"
                  value={section.text}
                  onChange={(e) => {
                    const editorialSections = [...editorConfig.premium.editorialSections];
                    editorialSections[idx] = { ...section, text: e.target.value };
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, premium: { ...c.premium, editorialSections } }),
                    );
                    markDirty();
                  }}
                />
                <Input
                  placeholder="Image URL"
                  value={section.imageUrl}
                  onChange={(e) => {
                    const editorialSections = [...editorConfig.premium.editorialSections];
                    editorialSections[idx] = { ...section, imageUrl: e.target.value };
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, premium: { ...c.premium, editorialSections } }),
                    );
                    markDirty();
                  }}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    className="h-10 rounded-xl border border-zg-border bg-zg-surface px-2 text-sm"
                    value={section.layout}
                    onChange={(e) => {
                      const editorialSections = [...editorConfig.premium.editorialSections];
                      editorialSections[idx] = {
                        ...section,
                        layout: e.target.value as EditorialLayout,
                      };
                      setEditorConfig((c) =>
                        parseEditorConfig({ ...c, premium: { ...c.premium, editorialSections } }),
                      );
                      markDirty();
                    }}
                  >
                    <option value="image-left">Image à gauche</option>
                    <option value="image-right">Image à droite</option>
                    <option value="full-bleed">Pleine largeur</option>
                  </select>
                  <Input
                    placeholder="Libellé bouton (optionnel)"
                    value={section.buttonLabel}
                    onChange={(e) => {
                      const editorialSections = [...editorConfig.premium.editorialSections];
                      editorialSections[idx] = { ...section, buttonLabel: e.target.value };
                      setEditorConfig((c) =>
                        parseEditorConfig({ ...c, premium: { ...c.premium, editorialSections } }),
                      );
                      markDirty();
                    }}
                  />
                </div>
                <Input
                  placeholder="Lien bouton (optionnel)"
                  value={section.buttonUrl}
                  onChange={(e) => {
                    const editorialSections = [...editorConfig.premium.editorialSections];
                    editorialSections[idx] = { ...section, buttonUrl: e.target.value };
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, premium: { ...c.premium, editorialSections } }),
                    );
                    markDirty();
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    const editorialSections = editorConfig.premium.editorialSections.filter(
                      (_, i) => i !== idx,
                    );
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, premium: { ...c.premium, editorialSections } }),
                    );
                    markDirty();
                  }}
                >
                  Supprimer cette section
                </Button>
              </div>
            ))}
            {editorConfig.premium.editorialSections.length >= 4 ? (
              <p className="text-sm text-zg-muted">Vous pouvez ajouter jusqu&apos;à 4 sections éditoriales.</p>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        editorialSections: [...c.premium.editorialSections, newEditorialSection()],
                      },
                    }),
                  );
                  markDirty();
                }}
              >
                Ajouter une section éditoriale
              </Button>
            )}
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="Crédibilité (avis & presse)"
          description="Uniquement des informations réelles — aucune note inventée."
        >
          <div className="space-y-4">
            <FieldHint>N&apos;affichez une note que si elle est réelle. Sinon, laissez vide — pas de fausses étoiles.</FieldHint>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Note Google (1–5)</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  className="mt-2"
                  value={editorConfig.premium.credibility.googleRating ?? ""}
                  onChange={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
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
                  type="number"
                  min={1}
                  className="mt-2"
                  value={editorConfig.premium.credibility.reviewCount ?? ""}
                  onChange={(e) => {
                    const v = e.target.value ? Number(e.target.value) : null;
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
            <div>
              <label className="dashboard-field-label">Lien avis Google</label>
              <Input
                className="mt-2"
                value={editorConfig.premium.credibility.googleReviewsUrl}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        credibility: { ...c.premium.credibility, googleReviewsUrl: e.target.value },
                      },
                    }),
                  );
                  markDirty();
                }}
                placeholder="https://g.page/…"
              />
            </div>
            <div>
              <label className="dashboard-field-label">Lien TripAdvisor (optionnel)</label>
              <Input
                className="mt-2"
                value={editorConfig.premium.credibility.tripAdvisorUrl}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        credibility: { ...c.premium.credibility, tripAdvisorUrl: e.target.value },
                      },
                    }),
                  );
                  markDirty();
                }}
                placeholder="https://www.tripadvisor.fr/…"
              />
            </div>
            <div>
              <label className="dashboard-field-label">Auteur de la citation (optionnel)</label>
              <Input
                className="mt-2"
                value={editorConfig.premium.credibility.quoteAuthor}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        credibility: { ...c.premium.credibility, quoteAuthor: e.target.value },
                      },
                    }),
                  );
                  markDirty();
                }}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Citation client (optionnel)</label>
              <Textarea
                className="mt-2 min-h-20"
                value={editorConfig.premium.credibility.quote}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        credibility: { ...c.premium.credibility, quote: e.target.value },
                      },
                    }),
                  );
                  markDirty();
                }}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Presse / labels (séparés par des virgules)</label>
              <Input
                className="mt-2"
                value={editorConfig.premium.credibility.pressMentions.join(", ")}
                onChange={(e) => {
                  const pressMentions = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: { ...c.premium, credibility: { ...c.premium.credibility, pressMentions } },
                    }),
                  );
                  markDirty();
                }}
                placeholder="Le Temps, Michelin Guide…"
              />
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="Menu & offres"
          description="Formules et plats mis en avant avant la réservation (2 à 6)."
        >
          <div className="space-y-4">
            {editorConfig.premium.menuOffers.map((offer, idx) => (
              <div key={offer.id} className="rounded-xl border border-zg-border p-4 space-y-2">
                <Input
                  placeholder="Titre"
                  value={offer.title}
                  onChange={(e) => {
                    const menuOffers = [...editorConfig.premium.menuOffers];
                    menuOffers[idx] = { ...offer, title: e.target.value };
                    setEditorConfig((c) => parseEditorConfig({ ...c, premium: { ...c.premium, menuOffers } }));
                    markDirty();
                  }}
                />
                <Input
                  placeholder="Description courte"
                  value={offer.description}
                  onChange={(e) => {
                    const menuOffers = [...editorConfig.premium.menuOffers];
                    menuOffers[idx] = { ...offer, description: e.target.value };
                    setEditorConfig((c) => parseEditorConfig({ ...c, premium: { ...c.premium, menuOffers } }));
                    markDirty();
                  }}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Prix (ex. 45 CHF)"
                    value={offer.price}
                    onChange={(e) => {
                      const menuOffers = [...editorConfig.premium.menuOffers];
                      menuOffers[idx] = { ...offer, price: e.target.value };
                      setEditorConfig((c) => parseEditorConfig({ ...c, premium: { ...c.premium, menuOffers } }));
                      markDirty();
                    }}
                  />
                  <Input
                    placeholder="Image URL (optionnel)"
                    value={offer.imageUrl}
                    onChange={(e) => {
                      const menuOffers = [...editorConfig.premium.menuOffers];
                      menuOffers[idx] = { ...offer, imageUrl: e.target.value };
                      setEditorConfig((c) => parseEditorConfig({ ...c, premium: { ...c.premium, menuOffers } }));
                      markDirty();
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    const menuOffers = editorConfig.premium.menuOffers.filter((_, i) => i !== idx);
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, premium: { ...c.premium, menuOffers } }),
                    );
                    markDirty();
                  }}
                >
                  Supprimer cette offre
                </Button>
              </div>
            ))}
            {editorConfig.premium.menuOffers.length >= 6 ? (
              <p className="text-sm text-zg-muted">Vous pouvez ajouter jusqu&apos;à 6 offres.</p>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: { ...c.premium, menuOffers: [...c.premium.menuOffers, newMenuOffer()] },
                    }),
                  );
                  markDirty();
                }}
              >
                Ajouter une offre
              </Button>
            )}
            <div className="space-y-3 border-t border-zg-border/60 pt-4">
              <label className="dashboard-field-label">Lien menu (PDF ou URL)</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium",
                    menuMode === "url" ? "border-zg-accent bg-zg-accent-soft-bg" : "border-zg-border",
                  )}
                  onClick={() => { setMenuMode("url"); markDirty(); }}
                >
                  Lien externe
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium",
                    menuMode === "pdf" ? "border-zg-accent bg-zg-accent-soft-bg" : "border-zg-border",
                  )}
                  onClick={() => { setMenuMode("pdf"); markDirty(); }}
                >
                  PDF (documents)
                </button>
              </div>
              {menuMode === "url" ? (
                <Input
                  className="mt-2"
                  value={menuUrl}
                  onChange={(e) => { setMenuUrl(e.target.value); markDirty(); }}
                  placeholder="https://…"
                />
              ) : (
                <p className="mt-2 text-sm text-zg-muted">
                  Les PDF déjà ajoutés à votre restaurant s&apos;affichent automatiquement sur la page.
                </p>
              )}
            </div>
            <div>
              <label className="dashboard-field-label">Message spécial (optionnel)</label>
              <Input
                value={specialMessage}
                onChange={(e) => { setSpecialMessage(e.target.value); markDirty(); }}
                placeholder="Terrasse ouverte en été…"
              />
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="Infos pratiques"
          description="Coordonnées affichées en bas de page et détails d'accès."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Nom du restaurant</label>
              <Input value={name} onChange={(e) => { setName(e.target.value); markDirty(); }} required />
            </div>
            <div>
              <label className="dashboard-field-label">Type de cuisine</label>
              <Input
                value={cuisineType}
                onChange={(e) => { setCuisineType(e.target.value); markDirty(); }}
                placeholder="Italienne, française…"
              />
            </div>
            <div>
              <label className="dashboard-field-label">Ville</label>
              <Input value={city} onChange={(e) => { setCity(e.target.value); markDirty(); }} />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Adresse complète</label>
              <Input value={address} onChange={(e) => { setAddress(e.target.value); markDirty(); }} />
            </div>
            <div>
              <label className="dashboard-field-label">Téléphone</label>
              <Input value={phone} onChange={(e) => { setPhone(e.target.value); markDirty(); }} />
            </div>
            <div>
              <label className="dashboard-field-label">E-mail de contact</label>
              <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); markDirty(); }} />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Site web (optionnel)</label>
              <Input value={websiteUrl} onChange={(e) => { setWebsiteUrl(e.target.value); markDirty(); }} placeholder="https://…" />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Lien Google Maps (optionnel)</label>
              <Input value={googleMapsUrl} onChange={(e) => { setGoogleMapsUrl(e.target.value); markDirty(); }} placeholder="https://maps.google.com/…" />
            </div>
            <div>
              <label className="dashboard-field-label">Instagram</label>
              <Input value={instagramUrl} onChange={(e) => { setInstagramUrl(e.target.value); markDirty(); }} />
            </div>
            <div>
              <label className="dashboard-field-label">Facebook</label>
              <Input value={facebookUrl} onChange={(e) => { setFacebookUrl(e.target.value); markDirty(); }} />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">TikTok (optionnel)</label>
              <Input value={tiktokUrl} onChange={(e) => { setTiktokUrl(e.target.value); markDirty(); }} />
            </div>
            <div>
              <label className="dashboard-field-label">Parking</label>
              <Input
                className="mt-2"
                value={editorConfig.premium.practical.parking}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: { ...c.premium, practical: { ...c.premium.practical, parking: e.target.value } },
                    }),
                  );
                  markDirty();
                }}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Accessibilité</label>
              <Input
                className="mt-2"
                value={editorConfig.premium.practical.accessibility}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        practical: { ...c.premium.practical, accessibility: e.target.value },
                      },
                    }),
                  );
                  markDirty();
                }}
              />
            </div>
            <div className="md:col-span-2 rounded-xl border border-zg-border/70 bg-zg-surface/60 p-4">
              <p className="text-sm font-semibold text-zg-fg">Horaires affichés</p>
              <ul className="mt-2 space-y-1 text-sm text-zg-muted">
                {formatOpeningHoursLines(initial.openingHours).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <Link href="/dashboard/settings?section=availability" className="mt-3 inline-block text-sm font-semibold text-zg-accent hover:underline">
                Modifier les horaires →
              </Link>
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="Hero & accroche"
          description="Titre, visuel principal et premier bouton de réservation."
        >
          <div className="space-y-5">
            <div>
              <label className="dashboard-field-label">Titre principal</label>
              <Input
                className="mt-2"
                value={heroTitle}
                onChange={(e) => { setHeroTitle(e.target.value); markDirty(); }}
                placeholder={defaultHeroTitle(displayName)}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Sous-titre</label>
              <Input
                className="mt-2"
                value={heroSubtitle}
                onChange={(e) => { setHeroSubtitle(e.target.value); markDirty(); }}
                placeholder={defaultHeroSubtitle(cuisineType, city, ambiance)}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Badge (au-dessus du titre)</label>
              <FieldHint>Ex. « Cuisine maison », « Réservation instantanée ».</FieldHint>
              <Input
                className="mt-2"
                value={editorConfig.hero.badgeText}
                onChange={(e) => {
                  setEditorConfig((c) => parseEditorConfig({ ...c, hero: { ...c.hero, badgeText: e.target.value } }));
                  markDirty();
                }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="dashboard-field-label">Mise en page</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.hero.layout}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, hero: { ...c.hero, layout: e.target.value as PublicPageEditorConfig["hero"]["layout"] } }),
                    );
                    markDirty();
                  }}
                >
                  <option value="center">Centré</option>
                  <option value="left">Aligné à gauche</option>
                  <option value="overlay">Overlay bas</option>
                </select>
              </div>
              <div>
                <label className="dashboard-field-label">Hauteur</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.hero.height}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, hero: { ...c.hero, height: e.target.value as PublicPageEditorConfig["hero"]["height"] } }),
                    );
                    markDirty();
                  }}
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="immersive">Immersif</option>
                </select>
              </div>
              <div>
                <label className="dashboard-field-label">Alignement texte</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.hero.align}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({ ...c, hero: { ...c.hero, align: e.target.value as PublicPageEditorConfig["hero"]["align"] } }),
                    );
                    markDirty();
                  }}
                >
                  <option value="left">Gauche</option>
                  <option value="center">Centre</option>
                  <option value="right">Droite</option>
                </select>
              </div>
            </div>
            <div>
              <label className="dashboard-field-label">Texte du bouton principal</label>
              <Input value={ctaLabel} onChange={(e) => { setCtaLabel(e.target.value); markDirty(); }} placeholder="Réserver une table" />
            </div>
            <Toggle
              checked={editorConfig.hero.secondaryCtaEnabled}
              onChange={(v) => {
                setEditorConfig((c) => parseEditorConfig({ ...c, hero: { ...c.hero, secondaryCtaEnabled: v } }));
                markDirty();
              }}
              label="Afficher un second bouton (menu)"
            />
            {editorConfig.hero.secondaryCtaEnabled ? (
              <Input
                value={editorConfig.hero.secondaryCta}
                onChange={(e) => {
                  setEditorConfig((c) => parseEditorConfig({ ...c, hero: { ...c.hero, secondaryCta: e.target.value } }));
                  markDirty();
                }}
                placeholder="Voir le menu"
              />
            ) : null}
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Apparence" description="Couleurs, polices et style visuel de la page.">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Couleur principale</label>
                <div className="mt-2 flex items-center gap-2">
                  <Input type="color" className="h-11 w-14 shrink-0" value={primaryColor} onChange={(e) => { setPrimaryColor(e.target.value); markDirty(); }} />
                  <Input value={primaryColor} onChange={(e) => { setPrimaryColor(e.target.value); markDirty(); }} />
                </div>
              </div>
              <div>
                <label className="dashboard-field-label">Couleur secondaire</label>
                <div className="mt-2 flex items-center gap-2">
                  <Input type="color" className="h-11 w-14 shrink-0" value={secondaryColor} onChange={(e) => { setSecondaryColor(e.target.value); markDirty(); }} />
                  <Input value={secondaryColor} onChange={(e) => { setSecondaryColor(e.target.value); markDirty(); }} />
                </div>
              </div>
            </div>
            <div>
              <label className="dashboard-field-label">Style de page</label>
              <FieldHint>Choisissez un style qui correspond à l&apos;ambiance du restaurant.</FieldHint>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PUBLIC_STYLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all",
                      stylePreset === p.id
                        ? "border-zg-border-focus bg-zg-accent-soft-bg ring-1 ring-zg-accent/25"
                        : "border-zg-border bg-zg-surface hover:border-zg-border-hover",
                    )}
                  >
                    <Palette className="mb-2 h-5 w-5 text-zg-accent" />
                    <p className="text-sm font-semibold text-zg-fg">{p.label}</p>
                    <p className="mt-1 text-xs text-zg-muted">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="dashboard-field-label">Ambiance du restaurant</label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm text-zg-fg"
                value={ambiance ?? ""}
                onChange={(e) => {
                  setAmbiance((e.target.value || null) as PublicAmbiance | null);
                  markDirty();
                }}
              >
                <option value="">— Choisir —</option>
                {PUBLIC_AMBIANCE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {(
                [
                  ["backgroundColor", "Fond principal"],
                  ["surfaceColor", "Fond des sections"],
                  ["headingColor", "Couleur des titres"],
                  ["textColor", "Couleur du texte"],
                  ["accentColor", "Couleur accent / CTA"],
                  ["footerBgColor", "Fond pied de page"],
                  ["footerTextColor", "Texte pied de page"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="dashboard-field-label">{label}</label>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="color"
                      className="h-11 w-14 shrink-0"
                      value={editorConfig.appearance[key]}
                      onChange={(e) => {
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            appearance: { ...c.appearance, [key]: e.target.value },
                          }),
                        );
                        markDirty();
                      }}
                    />
                    <Input
                      value={editorConfig.appearance[key]}
                      onChange={(e) => {
                        setEditorConfig((c) =>
                          parseEditorConfig({
                            ...c,
                            appearance: { ...c.appearance, [key]: e.target.value },
                          }),
                        );
                        markDirty();
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="dashboard-field-label">Thème global</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.appearance.themeMode}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({
                        ...c,
                        appearance: {
                          ...c.appearance,
                          themeMode: e.target.value as PublicPageEditorConfig["appearance"]["themeMode"],
                        },
                      }),
                    );
                    markDirty();
                  }}
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
              <div>
                <label className="dashboard-field-label">Style des boutons</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.appearance.buttonStyle}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({
                        ...c,
                        appearance: {
                          ...c.appearance,
                          buttonStyle: e.target.value as PublicPageEditorConfig["appearance"]["buttonStyle"],
                        },
                      }),
                    );
                    markDirty();
                  }}
                >
                  <option value="filled">Plein</option>
                  <option value="outlined">Contour</option>
                  <option value="ghost">Léger</option>
                </select>
              </div>
              <div>
                <label className="dashboard-field-label">Style des cartes</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm"
                  value={editorConfig.appearance.cardStyle}
                  onChange={(e) => {
                    setEditorConfig((c) =>
                      parseEditorConfig({
                        ...c,
                        appearance: {
                          ...c.appearance,
                          cardStyle: e.target.value as PublicPageEditorConfig["appearance"]["cardStyle"],
                        },
                      }),
                    );
                    markDirty();
                  }}
                >
                  <option value="flat">Plat</option>
                  <option value="elevated">Ombre</option>
                  <option value="bordered">Bordure</option>
                </select>
              </div>
            </div>
            <Button type="button" variant="secondary" className="min-h-11" onClick={resetStyle}>
              Réinitialiser le style
            </Button>
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Photos" description="Logo, image hero et galerie (jusqu'à 6 photos).">
          <div className="space-y-6">
            <div>
              <label className="dashboard-field-label">Logo</label>
              <FieldHint>Apparaît sur votre page publique, en petit format.</FieldHint>
              <div className="mt-2 flex flex-wrap gap-3">
                <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} className="max-w-xs" />
                {isUploadingLogo ? <span className="text-xs text-zg-muted">Envoi…</span> : null}
              </div>
              {logoUrl ? (
                <div className="relative mt-3 h-20 w-20 overflow-hidden rounded-xl border border-zg-border">
                  <Image src={logoUrl} alt="" fill className="object-contain p-2" unoptimized sizes="80px" />
                </div>
              ) : null}
            </div>
            <div className="rounded-2xl border border-zg-accent/20 bg-zg-accent-soft-bg/40 p-4">
              <label className="dashboard-field-label">Photo principale (hero)</label>
              <FieldHint>Votre photo principale doit donner envie en moins de 3 secondes.</FieldHint>
              <FieldHint>Cette photo sera la première chose que vos clients verront.</FieldHint>
              <div className="mt-2 flex flex-wrap gap-3">
                <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "cover")} className="max-w-xs" />
                <Input
                  value={coverImageUrl}
                  onChange={(e) => { setCoverImageUrl(e.target.value); markDirty(); }}
                  placeholder="URL de l'image"
                  className="min-w-[200px] flex-1"
                />
                {isUploadingCover ? <span className="text-xs text-zg-muted">Envoi…</span> : null}
              </div>
              {coverImageUrl ? (
                <div className="relative mt-4 aspect-[16/9] max-h-48 w-full overflow-hidden rounded-xl border border-zg-border">
                  <Image src={coverImageUrl} alt="" fill className="object-cover" unoptimized sizes="400px" />
                </div>
              ) : (
                <div className="mt-4 flex aspect-[16/9] max-h-40 items-center justify-center rounded-xl border border-dashed border-zg-border bg-zg-surface/80">
                  <ImageIcon className="h-8 w-8 text-zg-muted" />
                </div>
              )}
            </div>
            <div>
              <label className="dashboard-field-label">Galerie ({galleryUrls.length}/{MAX_GALLERY_PHOTOS})</label>
              <FieldHint>3 à 6 photos — sélectionnez celle mise en avant pour le hero si besoin.</FieldHint>
              <div className="mt-2 flex flex-wrap gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={galleryUrls.length >= MAX_GALLERY_PHOTOS}
                  onChange={(e) => handleFileUpload(e, "gallery")}
                  className="max-w-xs"
                />
                {isUploadingGallery ? <span className="text-xs text-zg-muted">Envoi…</span> : null}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {galleryUrls.map((url, idx) => (
                  <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-zg-border">
                    <Image src={url} alt="" fill className="object-cover" unoptimized sizes="160px" />
                    <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/60 p-1.5">
                      <button
                        type="button"
                        className={cn(
                          "flex-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-white",
                          featuredGalleryIndex === idx ? "bg-zg-accent" : "bg-white/20",
                        )}
                        onClick={() => { setFeaturedGalleryIndex(idx); markDirty(); }}
                      >
                        {featuredGalleryIndex === idx ? "À la une" : "Mettre en avant"}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-white/20 px-2 py-1 text-[10px] font-semibold text-white"
                        onClick={() => {
                          setGalleryUrls((g) => g.filter((_, i) => i !== idx));
                          markDirty();
                        }}
                      >
                        Suppr.
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SettingsAccordion>
        <SettingsAccordion
          title="Réservation"
          description="Formulaire en ligne, messages et options d'affichage."
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zg-fg">Réservation en ligne</p>
                <FieldHint>Le libellé du bouton se règle dans « Hero & accroche ».</FieldHint>
              </div>
              <Toggle checked={reservationEnabled} onChange={(v) => { setReservationEnabled(v); markDirty(); }} />
            </div>
            <div>
              <label className="dashboard-field-label">Message au-dessus du formulaire</label>
              <Textarea
                className="min-h-20"
                value={preBookingMessage}
                onChange={(e) => { setPreBookingMessage(e.target.value); markDirty(); }}
                placeholder="Choisissez votre date, votre heure et le nombre de personnes."
              />
            </div>
            <div>
              <label className="dashboard-field-label">Message groupes / événements</label>
              <Input
                value={editorConfig.premium.reservation.groupMessage}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      premium: {
                        ...c.premium,
                        reservation: { ...c.premium.reservation, groupMessage: e.target.value },
                      },
                    }),
                  );
                  markDirty();
                }}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Message si aucun créneau disponible</label>
              <Input
                value={noSlotsMessage}
                onChange={(e) => { setNoSlotsMessage(e.target.value); markDirty(); }}
                placeholder="Aucun créneau pour cette date. Essayez un autre jour."
              />
            </div>
            <div>
              <label className="dashboard-field-label">Délai minimum avant réservation (minutes)</label>
              <Input
                type="number"
                min={0}
                max={10080}
                value={minBookingLeadMinutes}
                onChange={(e) => { setMinBookingLeadMinutes(Number(e.target.value)); markDirty(); }}
              />
            </div>
            <Toggle
              checked={showHoursBeforeForm}
              onChange={(v) => { setShowHoursBeforeForm(v); markDirty(); }}
              label="Afficher les horaires avant le formulaire"
            />
            <Toggle
              checked={showPhoneCta}
              onChange={(v) => { setShowPhoneCta(v); markDirty(); }}
              label="Afficher le téléphone si le client préfère appeler"
            />
            <p className="text-xs text-zg-muted">
              Convives max. et délai max. à l&apos;avance : section « Disponibilités & réservations ».
            </p>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="CTA final"
          description="Encart d'appel à l'action affiché en fin de page."
        >
          <div className="space-y-4">
            <Toggle
              checked={editorConfig.blocks.final_cta?.enabled !== false}
              onChange={(v) => {
                setEditorConfig((c) =>
                  parseEditorConfig({
                    ...c,
                    blocks: {
                      ...c.blocks,
                      final_cta: { ...c.blocks.final_cta, enabled: v },
                    },
                  }),
                );
                markDirty();
              }}
              label="Afficher le CTA final"
            />
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
                        finalCta: { ...c.blockContent.finalCta, title: e.target.value },
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
              <label className="dashboard-field-label">Sous-titre</label>
              <Textarea
                className="mt-2 min-h-20"
                value={editorConfig.blockContent.finalCta.subtitle}
                onChange={(e) => {
                  setEditorConfig((c) =>
                    parseEditorConfig({
                      ...c,
                      blockContent: {
                        ...c.blockContent,
                        finalCta: { ...c.blockContent.finalCta, subtitle: e.target.value },
                      },
                    }),
                  );
                  markDirty();
                }}
                placeholder="Réservez votre table en quelques clics."
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
                        finalCta: { ...c.blockContent.finalCta, button: e.target.value },
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
        </SettingsAccordion>

        <SettingsAccordion title="SEO & publication" description="URL publique, référencement et mise en ligne.">
          <div className="space-y-5">
            <div>
              <label className="dashboard-field-label">URL publique (slug)</label>
              <FieldHint>Minuscules, tirets, sans caractères spéciaux.</FieldHint>
              <Input
                className="mt-2 font-mono text-sm"
                value={slug}
                onChange={(e) => {
                  setSlug(sanitizePublicSlug(e.target.value));
                  markDirty();
                }}
              />
              <p className="mt-2 break-all text-sm font-semibold text-zg-fg">{publicPath}</p>
            </div>
            <div>
              <label className="dashboard-field-label">Meta title</label>
              <Input
                maxLength={70}
                value={seoTitle}
                onChange={(e) => { setSeoTitle(e.target.value); markDirty(); }}
                placeholder={displayName}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Meta description</label>
              <Textarea
                className="min-h-20"
                maxLength={160}
                value={seoDescription}
                onChange={(e) => { setSeoDescription(e.target.value); markDirty(); }}
                placeholder={resolvedHeroSubtitle}
              />
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
            </div>
          </div>
        </SettingsAccordion>

        <SettingsAccordion title="Publication" description="Checklist, mise en ligne et lien public actif.">
          <div className="space-y-6">
            <div className="rounded-2xl border border-zg-border bg-zg-surface p-5">
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
                    <span className={item.done ? "text-zg-fg" : "text-zg-muted"}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="min-h-11"
                onClick={async () => {
                  const result = await publishPage();
                  if (!result.ok) onMessage?.(result.error ?? "Échec de la publication.");
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Publier
              </Button>
              <a href={publicPath} target="_blank" rel="noreferrer">
                <Button type="button" variant="secondary" className="min-h-11">
                  Voir la page publique
                </Button>
              </a>
            </div>
            <p className="text-xs text-zg-muted">
              Utilisez « Enregistrer les modifications » en bas de page pour sauvegarder un brouillon. « Publier » rend la page visible immédiatement.
            </p>
          </div>
        </SettingsAccordion>
        </div>
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
