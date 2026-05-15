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
  Check,
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
import PublicPageLivePreview, { type PublicPagePreviewDraft } from "@/src/components/dashboard/public-page-live-preview";
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
  HIGHLIGHT_SUGGESTIONS,
  MAX_DESCRIPTION_CHARS,
  MAX_GALLERY_PHOTOS,
  MAX_HIGHLIGHTS,
  PUBLIC_AMBIANCE_OPTIONS,
  PUBLIC_STYLE_PRESETS,
  type PublicAmbiance,
  type PublicStylePreset,
} from "@/src/lib/public-page/constants";

const TABS = [
  { id: "identity", label: "Identité" },
  { id: "appearance", label: "Apparence" },
  { id: "photos", label: "Photos" },
  { id: "content", label: "Contenu" },
  { id: "reservation", label: "Réservation" },
  { id: "seo", label: "SEO & partage" },
  { id: "publish", label: "Publication" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
};

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-zg-text-muted">{children}</p>;
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-zg-accent text-white shadow-sm"
          : "text-zg-muted hover:bg-zg-card-hover hover:text-zg-fg",
      )}
    >
      {label}
    </button>
  );
}

const PublicPageSettingsPanel = forwardRef<PublicPageSettingsHandle, PublicPageSettingsPanelProps>(
  function PublicPageSettingsPanel({ initial, publicLinkBase, onMessage }, ref) {
    const supabase = createClient();

    const [activeTab, setActiveTab] = useState<TabId>("identity");
    const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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

    const markDirty = useCallback(() => {
      if (pageStatus === "published") setHasUnpublishedChanges(true);
    }, [pageStatus]);

    const applyPreset = useCallback(
      (preset: PublicStylePreset) => {
        const applied = applyStylePresetColors(preset, primaryColor, secondaryColor);
        setStylePreset(preset);
        setHeroPrimaryColor(applied.heroPrimary);
        setAccentColor(applied.accent);
        setHeadingFont(applied.headingFont);
        setBodyFont(applied.bodyFont);
        setHeroHeight(applied.heroHeight);
        markDirty();
      },
      [primaryColor, secondaryColor, markDirty],
    );

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

    const previewDraft = useMemo((): PublicPagePreviewDraft => {
      const heroCover =
        coverImageUrl.trim() ||
        (galleryUrls[featuredGalleryIndex] ?? galleryUrls[0] ?? "");
      return {
        restaurantId: initial.restaurantId,
        slug: effectiveSlug,
        displayName,
        tagline: resolvedHeroSubtitle,
        heroTitle: resolvedHeroTitle,
        cuisineType: cuisineType.trim() || null,
        city: city.trim() || null,
        highlights: highlights.filter(Boolean),
        specialMessage: specialMessage.trim() || null,
        publicDescription: shortDescription.trim(),
        logoUrl,
        coverImageUrl: heroCover,
        pageBackgroundColor,
        heroPrimaryColor,
        buttonBgColor: buttonColor || normalizeHexColor(primaryColor),
        buttonTextColor,
        headingTextColor,
        bodyTextColor,
        accentColor,
        footerBgColor,
        footerTextColor,
        headingFont,
        bodyFont,
        heroTitleSizePx,
        heroHeight,
        heroOverlayEnabled,
        heroOverlayOpacity,
        ctaLabel: ctaLabel.trim() || "Réserver une table",
        borderRadius: initial.borderRadius,
        buttonStyle: initial.buttonStyle,
        cardStyle: initial.cardStyle,
        fontSizeScale: initial.fontSizeScale,
        phone,
        address,
        email,
        websiteUrl,
        instagramUrl,
        facebookUrl,
        googleMapsUrl,
        showPublicAddress: initial.showPublicAddress,
        showPublicPhone: initial.showPublicPhone,
        showPublicEmail: initial.showPublicEmail,
        showPublicWebsite: initial.showPublicWebsite,
        showPublicOpeningHours: initial.showPublicOpeningHours,
        showPublicInstagram: initial.showPublicInstagram,
        showPublicFacebook: initial.showPublicFacebook,
        showPublicGoogleMaps: initial.showPublicGoogleMaps,
        documents: initial.menuDocuments,
        galleryImageUrls: galleryUrls,
        menuUrl: menuMode === "url" ? menuUrl.trim() || null : null,
        reservationEnabled,
        preBookingMessage: preBookingMessage.trim() || null,
        showHoursBeforeForm,
        showPhoneCta,
        terraceEnabled: initial.terraceEnabled,
        maxPartySize: initial.maxPartySize,
        openingHours: initial.openingHours,
      };
    }, [
      initial,
      effectiveSlug,
      displayName,
      resolvedHeroSubtitle,
      resolvedHeroTitle,
      cuisineType,
      city,
      highlights,
      specialMessage,
      shortDescription,
      logoUrl,
      coverImageUrl,
      galleryUrls,
      featuredGalleryIndex,
      pageBackgroundColor,
      heroPrimaryColor,
      buttonColor,
      primaryColor,
      buttonTextColor,
      headingTextColor,
      bodyTextColor,
      accentColor,
      footerBgColor,
      footerTextColor,
      headingFont,
      bodyFont,
      heroTitleSizePx,
      heroHeight,
      heroOverlayEnabled,
      heroOverlayOpacity,
      ctaLabel,
      phone,
      address,
      email,
      websiteUrl,
      instagramUrl,
      facebookUrl,
      googleMapsUrl,
      menuMode,
      menuUrl,
      reservationEnabled,
      preBookingMessage,
      showHoursBeforeForm,
      showPhoneCta,
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
      () => ({
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
      }),
      [
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

    function toggleHighlight(item: string) {
      markDirty();
      setHighlights((prev) => {
        if (prev.includes(item)) return prev.filter((h) => h !== item);
        if (prev.length >= MAX_HIGHLIGHTS) return prev;
        return [...prev, item];
      });
    }

    const editor = (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone}>{statusLabel}</Badge>
              <span className="text-sm text-zg-muted">Page complétée à {completionPercent}%</span>
            </div>
            <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-zg-border/60">
              <div
                className="h-full rounded-full bg-zg-accent transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 lg:hidden"
            onClick={() => setMobilePreviewOpen((v) => !v)}
          >
            {mobilePreviewOpen ? "Masquer l'aperçu" : "Voir l'aperçu"}
          </Button>
        </div>

        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              label={tab.label}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {activeTab === "identity" ? (
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
          </div>
        ) : null}

        {activeTab === "appearance" ? (
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
              <FieldHint>3 styles maximum — choisissez l'ambiance générale de votre page.</FieldHint>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
            <Button type="button" variant="secondary" className="min-h-11" onClick={resetStyle}>
              Réinitialiser le style
            </Button>
          </div>
        ) : null}

        {activeTab === "photos" ? (
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
        ) : null}

        {activeTab === "content" ? (
          <div className="space-y-5">
            <div>
              <label className="dashboard-field-label">Titre principal</label>
              <FieldHint>
                Ex. automatique : « {defaultHeroTitle(displayName)} »
              </FieldHint>
              <Input
                className="mt-2"
                value={heroTitle}
                onChange={(e) => { setHeroTitle(e.target.value); markDirty(); }}
                placeholder={defaultHeroTitle(displayName)}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Sous-titre court</label>
              <Input
                className="mt-2"
                value={heroSubtitle}
                onChange={(e) => { setHeroSubtitle(e.target.value); markDirty(); }}
                placeholder={defaultHeroSubtitle(cuisineType, city, ambiance)}
              />
            </div>
            <div>
              <label className="dashboard-field-label">Présentation courte</label>
              <FieldHint>Gardez ce texte court : l'objectif est de donner envie de réserver.</FieldHint>
              <Textarea
                className="mt-2 min-h-28"
                maxLength={MAX_DESCRIPTION_CHARS}
                value={shortDescription}
                onChange={(e) => { setShortDescription(e.target.value); markDirty(); }}
              />
              <p className="mt-1 text-xs text-zg-text-muted">
                {shortDescription.length}/{MAX_DESCRIPTION_CHARS}
              </p>
            </div>
            <div>
              <label className="dashboard-field-label">Points forts (max. {MAX_HIGHLIGHTS})</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {HIGHLIGHT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleHighlight(s)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      highlights.includes(s)
                        ? "border-zg-accent bg-zg-accent-soft-bg text-zg-accent"
                        : "border-zg-border text-zg-muted hover:border-zg-border-hover",
                    )}
                  >
                    {highlights.includes(s) ? <Check className="mr-1 inline h-3 w-3" /> : null}
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="dashboard-field-label">Menu</label>
              <div className="mt-2 flex flex-wrap gap-2">
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
                  Ajoutez vos PDF dans les documents du restaurant (section existante). Ils s&apos;affichent sur la page publique.
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
            <div className="rounded-xl border border-zg-border/70 bg-zg-surface/60 p-4">
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
        ) : null}

        {activeTab === "reservation" ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zg-fg">Bouton de réservation</p>
                <FieldHint>Votre bouton de réservation doit rester clair et visible.</FieldHint>
              </div>
              <Toggle checked={reservationEnabled} onChange={(v) => { setReservationEnabled(v); markDirty(); }} />
            </div>
            <div>
              <label className="dashboard-field-label">Texte du bouton principal</label>
              <Input value={ctaLabel} onChange={(e) => { setCtaLabel(e.target.value); markDirty(); }} placeholder="Réserver une table" />
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
        ) : null}

        {activeTab === "seo" ? (
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
        ) : null}

        {activeTab === "publish" ? (
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
        ) : null}
      </div>
    );

    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
        <div>{editor}</div>
        <div
          className={cn(
            "lg:sticky lg:top-24",
            mobilePreviewOpen ? "block" : "hidden lg:block",
          )}
        >
          <PublicPageLivePreview draft={previewDraft} publicPath={publicPath} />
        </div>
      </div>
    );
  },
);

export default PublicPageSettingsPanel;
