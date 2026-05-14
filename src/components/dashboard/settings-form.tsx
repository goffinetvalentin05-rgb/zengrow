"use client";

import { ChangeEvent, FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  CreditCard,
  Globe2,
  LayoutGrid,
  Megaphone,
  Shield,
  Star,
  CalendarCheck2,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { cn } from "@/src/lib/utils";
import PublicPageLivePreview, { type PublicPagePreviewDraft } from "@/src/components/dashboard/public-page-live-preview";
import BillingPlans from "@/src/components/dashboard/billing-plans";
import ReviewAutomationPanel from "@/src/components/dashboard/review-automation-panel";
import { PUBLIC_PAGE_FONT_OPTIONS } from "@/src/lib/public-page-fonts";
import {
  buildReservationConfirmationVariableValues,
  effectiveReservationConfirmationBody,
  effectiveReservationConfirmationSubject,
  sampleReservationConfirmationContext,
} from "@/src/lib/email/reservation-confirmation-template";
import {
  type ReservationMode,
  normalizeReservationMode,
  reservationModeFromLegacy,
  timeHhMmFromDb,
} from "@/src/lib/reservation/reservation-modes";

type RestaurantData = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  slug: string;
  primary_color: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  page_background_color?: string | null;
  hero_primary_color?: string | null;
  public_button_bg_color?: string | null;
  public_button_text_color?: string | null;
  public_heading_text_color?: string | null;
  public_body_text_color?: string | null;
  public_accent_color?: string | null;
  public_footer_bg_color?: string | null;
  public_footer_text_color?: string | null;
  public_heading_font?: string | null;
  public_body_font?: string | null;
  public_hero_title_size_px?: number | null;
  public_display_name?: string | null;
  public_tagline?: string | null;
  public_description?: string | null;
  public_cta_label?: string | null;
  public_hero_height?: string | null;
  public_hero_overlay_enabled?: boolean | null;
  public_hero_overlay_opacity?: number | null;
  google_maps_url?: string | null;
  show_public_instagram?: boolean | null;
  show_public_facebook?: boolean | null;
  show_public_google_maps?: boolean | null;
  reservation_confirmation_email_subject?: string | null;
  reservation_confirmation_email_body?: string | null;
};

type SettingsData = {
  reservation_duration: number | null;
  reservation_slot_interval: number | null;
  restaurant_capacity: number | null;
  max_covers_per_slot: number | null;
  max_party_size: number | null;
  use_tables: boolean | null;
  days_in_advance: number | null;
  accent_color: string | null;
  button_color: string | null;
  text_color?: string | null;
  heading_font?: string | null;
  body_font?: string | null;
  font_size_scale?: "small" | "medium" | "large" | string | null;
  border_radius?: "sharp" | "rounded" | "pill" | string | null;
  button_style?: "filled" | "outlined" | "ghost" | string | null;
  card_style?: "flat" | "elevated" | "bordered" | string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  pre_booking_message: string | null;
  closure_start_date: string | null;
  closure_end_date: string | null;
  closure_message: string | null;
  public_page_description: string | null;
  gallery_image_urls: string[] | null;
  public_page_show_address: boolean | null;
  public_page_show_phone: boolean | null;
  public_page_show_email: boolean | null;
  public_page_show_website: boolean | null;
  public_page_show_opening_hours: boolean | null;
  terrace_enabled?: boolean | null;
  terrace_capacity?: number | null;
  auto_archive_reservations?: boolean | null;
  reservation_mode?: string | null;
  /** Mode public en plan de salle: automatic | zone | table */
  public_table_selection_mode?: string | null;
  /** Mode public canonique plan de salle: automatic | area | table */
  floor_plan_public_selection_mode?: string | null;
  /** Legacy: ancien booléen (à migrer) */
  floor_plan_clients_choose_table?: boolean | null;
  floor_plan_lunch_duration?: number | null;
  floor_plan_dinner_duration?: number | null;
  lunch_duration_minutes?: number | null;
  dinner_duration_minutes?: number | null;
  service_lunch_enabled?: boolean | null;
  service_lunch_start?: string | null;
  service_lunch_end?: string | null;
  service_lunch_max_covers?: number | null;
  service_dinner_enabled?: boolean | null;
  service_dinner_start?: string | null;
  service_dinner_end?: string | null;
  service_dinner_max_covers?: number | null;
};

// Note: La refonte “Paramètres” n’expose plus la gestion des documents/galerie.
// Les données existantes restent compatibles côté DB et ne sont pas supprimées.

type SettingsFormProps = {
  restaurant: RestaurantData;
  settings: SettingsData;
  confirmationMode: "manual" | "automatic";
  publicLink: string;
  subscriptionStatus: "trial" | "active" | "expired";
  subscriptionPlan: "starter" | "pro" | null;
  trialEndDate: string | null;
  isOwnerDev: boolean;
};

function ReservationField({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="dashboard-field-label">{label}</label>
      <p className="text-sm leading-relaxed text-zg-muted">{description}</p>
      <div>{children}</div>
    </div>
  );
}

type SettingsSectionKey =
  | "restaurant"
  | "public_page"
  | "reservations"
  | "floor_plan"
  | "reviews"
  | "marketing"
  | "subscription"
  | "account";

function sectionLabel(key: SettingsSectionKey) {
  switch (key) {
    case "restaurant":
      return { title: "Restaurant", description: "Nom, logo et informations" };
    case "public_page":
      return { title: "Page publique", description: "Lien, présentation et réseaux sociaux" };
    case "reservations":
      return { title: "Réservations", description: "Horaires et mode de réservation" };
    case "floor_plan":
      return { title: "Plan de salle", description: "Espaces, tables et choix côté client" };
    case "reviews":
      return { title: "Avis Google", description: "Automatisation des demandes d’avis" };
    case "marketing":
      return { title: "Marketing", description: "Campagnes et relances" };
    case "subscription":
      return { title: "Abonnement", description: "Plan, essai et paiement" };
    case "account":
      return { title: "Compte", description: "Connexion et sécurité" };
  }
}

function sectionIcon(key: SettingsSectionKey) {
  switch (key) {
    case "restaurant":
      return Building2;
    case "public_page":
      return Globe2;
    case "reservations":
      return CalendarCheck2;
    case "floor_plan":
      return LayoutGrid;
    case "reviews":
      return Star;
    case "marketing":
      return Megaphone;
    case "subscription":
      return CreditCard;
    case "account":
      return Shield;
  }
}

function SettingsSectionCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0 shadow-zg-soft">
      <div className="px-6 py-6 md:px-8">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="mt-2 max-w-2xl">{description}</CardDescription>
      </div>
      <div className="border-t border-zg-border/80 px-6 py-6 md:px-8">{children}</div>
      {footer ? (
        <div className="border-t border-zg-border/80 bg-zg-surface-elevated/35 px-6 py-4 md:px-8">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}

export default function SettingsForm({
  restaurant,
  settings,
  confirmationMode,
  publicLink,
  subscriptionPlan,
  subscriptionStatus,
  trialEndDate,
  isOwnerDev,
}: SettingsFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionFromUrl = (searchParams.get("section") ?? "") as SettingsSectionKey;
  const [activeSection, setActiveSection] = useState<SettingsSectionKey>(() =>
    ([
      "restaurant",
      "public_page",
      "reservations",
      "floor_plan",
      "reviews",
      "marketing",
      "subscription",
      "account",
    ] as SettingsSectionKey[]).includes(sectionFromUrl)
      ? sectionFromUrl
      : "restaurant",
  );

  useEffect(() => {
    if (
      ([
        "restaurant",
        "public_page",
        "reservations",
        "floor_plan",
        "reviews",
        "marketing",
        "subscription",
        "account",
      ] as SettingsSectionKey[]).includes(sectionFromUrl)
    ) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);
  const [name, setName] = useState(restaurant.name);
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [email, setEmail] = useState(restaurant.email ?? "");
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [slug, setSlug] = useState(restaurant.slug);
  const [reservationMode, setReservationMode] = useState<ReservationMode>(() =>
    normalizeReservationMode(settings.reservation_mode ?? reservationModeFromLegacy(settings.use_tables)),
  );
  const [floorPlanPublicSelectionMode, setFloorPlanPublicSelectionMode] = useState<"automatic" | "area" | "table">(
    () => {
      const v = settings.floor_plan_public_selection_mode;
      if (v === "automatic" || v === "area" || v === "table") return v;
      const legacy = settings.public_table_selection_mode;
      if (legacy === "table") return "table";
      if (legacy === "zone") return "area";
      if (settings.floor_plan_clients_choose_table === true) return "table";
      return "automatic";
    },
  );
  const [lunchServiceEnabled, setLunchServiceEnabled] = useState(settings.service_lunch_enabled !== false);
  const [lunchServiceStart, setLunchServiceStart] = useState(
    timeHhMmFromDb(settings.service_lunch_start ?? null, "11:30"),
  );
  const [lunchServiceEnd, setLunchServiceEnd] = useState(timeHhMmFromDb(settings.service_lunch_end ?? null, "14:30"));
  const [lunchMaxCovers, setLunchMaxCovers] = useState(
    Math.max(1, Math.min(500, settings.service_lunch_max_covers ?? settings.max_covers_per_slot ?? 40)),
  );
  const [dinnerServiceEnabled, setDinnerServiceEnabled] = useState(settings.service_dinner_enabled !== false);
  const [dinnerServiceStart, setDinnerServiceStart] = useState(
    timeHhMmFromDb(settings.service_dinner_start ?? null, "18:00"),
  );
  const [dinnerServiceEnd, setDinnerServiceEnd] = useState(timeHhMmFromDb(settings.service_dinner_end ?? null, "22:30"));
  const [dinnerMaxCovers, setDinnerMaxCovers] = useState(
    Math.max(1, Math.min(500, settings.service_dinner_max_covers ?? settings.max_covers_per_slot ?? 40)),
  );
  const [terraceEnabled] = useState(settings.terrace_enabled ?? false);
  const [terraceCapacity] = useState(
    Math.max(0, Math.min(500, settings.terrace_capacity ?? 0)),
  );
  const [daysInAdvance] = useState(settings.days_in_advance ?? 60);
  const [floorPlanLunchDuration] = useState(
    settings.lunch_duration_minutes ?? settings.floor_plan_lunch_duration ?? settings.reservation_duration ?? 90,
  );
  const [floorPlanDinnerDuration] = useState(
    settings.dinner_duration_minutes ?? settings.floor_plan_dinner_duration ?? settings.reservation_duration ?? 90,
  );
  const [autoArchiveReservations] = useState(
    settings.auto_archive_reservations === true,
  );
  const [maxPartySize] = useState(settings.max_party_size ?? 8);
  const [pageBackgroundColor] = useState(
    restaurant.page_background_color ?? "#f8fafc",
  );
  const [heroPrimaryColor] = useState(
    restaurant.hero_primary_color ?? restaurant.primary_color ?? "#12151c",
  );
  const [buttonColor] = useState(
    restaurant.public_button_bg_color ?? settings.button_color ?? "#E85D2C",
  );
  const [buttonTextColor] = useState(restaurant.public_button_text_color ?? "#ffffff");
  const [headingTextColor] = useState(restaurant.public_heading_text_color ?? "#0f172a");
  const [bodyTextColor] = useState(
    restaurant.public_body_text_color ?? settings.text_color ?? "#334155",
  );
  const [accentColor, setAccentColor] = useState(
    restaurant.public_accent_color ?? settings.accent_color ?? "#E85D2C",
  );
  const [footerBgColor] = useState(restaurant.public_footer_bg_color ?? "#0f172a");
  const [footerTextColor] = useState(restaurant.public_footer_text_color ?? "#e2e8f0");
  const [headingFont, setHeadingFont] = useState(
    restaurant.public_heading_font ?? settings.heading_font ?? "Playfair Display",
  );
  const [bodyFont, setBodyFont] = useState(restaurant.public_body_font ?? settings.body_font ?? "Inter");
  const [heroTitleSizePx] = useState(restaurant.public_hero_title_size_px ?? 48);
  const [publicDisplayName, setPublicDisplayName] = useState(
    restaurant.public_display_name?.trim() || restaurant.name,
  );
  const [publicTagline] = useState(restaurant.public_tagline ?? "");
  const [ctaLabel] = useState(restaurant.public_cta_label?.trim() || "Réserver une table");
  const [heroHeight] = useState<"compact" | "normal" | "tall">(
    (restaurant.public_hero_height as "compact" | "normal" | "tall") || "normal",
  );
  const [heroOverlayEnabled] = useState(
    restaurant.public_hero_overlay_enabled !== false,
  );
  const [heroOverlayOpacity] = useState(restaurant.public_hero_overlay_opacity ?? 40);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(restaurant.google_maps_url ?? "");
  const [showPublicInstagram] = useState(restaurant.show_public_instagram !== false);
  const [showPublicFacebook] = useState(restaurant.show_public_facebook !== false);
  const [showPublicGoogleMaps] = useState(restaurant.show_public_google_maps !== false);
  const [fontSizeScale] = useState<"small" | "medium" | "large">(
    (settings.font_size_scale as "small" | "medium" | "large") ?? "medium",
  );
  const [borderRadius] = useState<"sharp" | "rounded" | "pill">(
    (settings.border_radius as "sharp" | "rounded" | "pill") ?? "rounded",
  );
  const [buttonStyle] = useState<"filled" | "outlined" | "ghost">(
    (settings.button_style as "filled" | "outlined" | "ghost") ?? "filled",
  );
  const [cardStyle] = useState<"flat" | "elevated" | "bordered">(
    (settings.card_style as "flat" | "elevated" | "bordered") ?? "elevated",
  );
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? restaurant.logo_url ?? "");
  const [coverImageUrl] = useState(settings.cover_image_url ?? restaurant.banner_url ?? "");
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url ?? "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebook_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(settings.website_url ?? "");
  const [preBookingMessage] = useState(settings.pre_booking_message ?? "");
  const [closureStartDate] = useState(settings.closure_start_date ?? "");
  const [closureEndDate] = useState(settings.closure_end_date ?? "");
  const [closureMessage] = useState(settings.closure_message ?? "");
  const [reservationConfirmationMode] = useState<"manual" | "automatic">(
    confirmationMode,
  );
  const [reservationConfirmationEmailSubject] = useState(
    restaurant.reservation_confirmation_email_subject?.trim() ?? "",
  );
  const [reservationConfirmationEmailBody] = useState(
    restaurant.reservation_confirmation_email_body?.trim() ?? "",
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const galleryUrls = useMemo(() => settings.gallery_image_urls ?? [], [settings.gallery_image_urls]);
  const [publicPageDescription, setPublicPageDescription] = useState(
    restaurant.public_description?.trim() || settings.public_page_description || "",
  );
  const showPublicAddress = settings.public_page_show_address ?? true;
  const showPublicPhone = settings.public_page_show_phone ?? true;
  const showPublicEmail = settings.public_page_show_email ?? true;
  const showPublicWebsite = settings.public_page_show_website ?? true;
  const showPublicOpeningHours = settings.public_page_show_opening_hours ?? true;
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveButtonSuccess, setSaveButtonSuccess] = useState(false);

  const [authEmail, setAuthEmail] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      setAuthEmail(data.user?.email ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const [reviewAutomationLoading, setReviewAutomationLoading] = useState(true);
  const [reviewAutomation, setReviewAutomation] = useState<{
    is_enabled: boolean;
    delay_minutes: number;
    google_review_url: string;
    email_subject: string;
    email_message: string;
    button_positive_label: string;
    button_neutral_label: string;
    button_negative_label: string;
    primary_color: string;
  } | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<Array<{ id: string; message: string | null; created_at: string }>>(
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setReviewAutomationLoading(true);
    (async () => {
      const [{ data: automation }, { data: feedback }] = await Promise.all([
        supabase
          .from("review_automation_settings")
          .select(
            "is_enabled, delay_minutes, google_review_url, email_subject, email_message, button_positive_label, button_neutral_label, button_negative_label, primary_color",
          )
          .eq("restaurant_id", restaurant.id)
          .maybeSingle(),
        supabase
          .from("feedbacks")
          .select("id, message, created_at")
          .eq("restaurant_id", restaurant.id)
          .not("responded_at", "is", null)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (cancelled) return;
      setReviewAutomation({
        is_enabled: automation?.is_enabled ?? false,
        delay_minutes: automation?.delay_minutes ?? 90,
        google_review_url: automation?.google_review_url ?? "",
        email_subject:
          automation?.email_subject ?? "Comment s'est passée votre expérience chez {{restaurant_name}} ?",
        email_message:
          automation?.email_message ??
          "Merci pour votre visite chez {{restaurant_name}}.\nNous aimerions connaître votre expérience.",
        button_positive_label: automation?.button_positive_label ?? "Excellent",
        button_neutral_label: automation?.button_neutral_label ?? "Moyen",
        button_negative_label: automation?.button_negative_label ?? "À améliorer",
        primary_color: automation?.primary_color ?? "#1A6B50",
      });
      setReviewFeedback((feedback ?? []) as Array<{ id: string; message: string | null; created_at: string }>);
      setReviewAutomationLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [restaurant.id, supabase]);

  // Documents PDF / Galerie: retirés de l’UI dans la refonte.

  const [floorPlanSummary, setFloorPlanSummary] = useState<{
    activeTables: number;
    blockedTables: number;
    inactiveTables: number;
    maxCovers: number;
    activeZones: number;
  } | null>(null);

  useEffect(() => {
    if (reservationMode !== "floor_plan") {
      setFloorPlanSummary(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const [{ data: tablesData, error: tablesError }, { data: plansData, error: plansError }] = await Promise.all([
        supabase
          .from("restaurant_tables")
          .select("id, status, max_covers, floor_plan_id")
          .eq("restaurant_id", restaurant.id),
        supabase
          .from("floor_plans")
          .select("id, is_active")
          .eq("restaurant_id", restaurant.id),
      ]);

      if (cancelled) return;
      if (tablesError || plansError) {
        setFloorPlanSummary(null);
        return;
      }

      const activeTables = (tablesData ?? []).filter((t) => t.status === "active");
      const blockedTables = (tablesData ?? []).filter((t) => t.status === "blocked");
      const inactiveTables = (tablesData ?? []).filter((t) => t.status === "inactive");
      const maxCovers = activeTables.reduce((sum, t) => sum + Math.max(0, t.max_covers ?? 0), 0);
      const activeZones = (plansData ?? []).filter((z) => z.is_active === true).length;

      setFloorPlanSummary({
        activeTables: activeTables.length,
        blockedTables: blockedTables.length,
        inactiveTables: inactiveTables.length,
        maxCovers,
        activeZones,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [reservationMode, restaurant.id, supabase]);

  // Documents (PDF) : UI retirée de la refonte, donc pas de chargement ici.

  const previewDraft = useMemo(
    (): PublicPagePreviewDraft => ({
      restaurantId: restaurant.id,
      slug: restaurant.slug,
      displayName: publicDisplayName,
      tagline: publicTagline,
      publicDescription: publicPageDescription,
      logoUrl,
      coverImageUrl,
      pageBackgroundColor,
      heroPrimaryColor,
      buttonBgColor: buttonColor,
      buttonTextColor,
      headingTextColor,
      bodyTextColor,
      accentColor,
      footerBgColor,
      footerTextColor,
      headingFont,
      bodyFont,
      heroTitleSizePx: Math.min(72, Math.max(32, heroTitleSizePx)),
      heroHeight,
      heroOverlayEnabled,
      heroOverlayOpacity,
      ctaLabel,
      borderRadius,
      buttonStyle,
      cardStyle,
      fontSizeScale,
      phone,
      address,
      email,
      websiteUrl,
      instagramUrl,
      facebookUrl,
      googleMapsUrl,
      showPublicAddress,
      showPublicPhone,
      showPublicEmail,
      showPublicWebsite,
      showPublicOpeningHours,
      showPublicInstagram,
      showPublicFacebook,
      showPublicGoogleMaps,
      documents: [],
      galleryImageUrls: galleryUrls,
      terraceEnabled,
      maxPartySize: Math.max(1, maxPartySize),
    }),
    [
      accentColor,
      address,
      bodyFont,
      bodyTextColor,
      borderRadius,
      buttonColor,
      buttonStyle,
      buttonTextColor,
      cardStyle,
      coverImageUrl,
      ctaLabel,
      email,
      facebookUrl,
      fontSizeScale,
      footerBgColor,
      footerTextColor,
      galleryUrls,
      googleMapsUrl,
      headingFont,
      headingTextColor,
      heroHeight,
      heroOverlayEnabled,
      heroOverlayOpacity,
      heroPrimaryColor,
      heroTitleSizePx,
      instagramUrl,
      logoUrl,
      pageBackgroundColor,
      phone,
      publicDisplayName,
      publicPageDescription,
      publicTagline,
      restaurant.id,
      restaurant.slug,
      showPublicAddress,
      showPublicEmail,
      showPublicFacebook,
      showPublicGoogleMaps,
      showPublicInstagram,
      showPublicOpeningHours,
      showPublicPhone,
      showPublicWebsite,
      terraceEnabled,
      maxPartySize,
      websiteUrl,
    ],
  );

  const confirmationEmailPreviewValues = useMemo(
    () =>
      buildReservationConfirmationVariableValues(
        sampleReservationConfirmationContext(name, phone || null, email || null),
      ),
    [name, phone, email],
  );

  // Préserve la logique de template e-mail sans exposer l’UI ici.
  void effectiveReservationConfirmationSubject(reservationConfirmationEmailSubject || null, confirmationEmailPreviewValues);
  void effectiveReservationConfirmationBody(reservationConfirmationEmailBody || null, confirmationEmailPreviewValues);

  async function uploadAsset(file: File, type: "logo" | "cover") {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${restaurant.id}/${type}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from("restaurants").upload(filePath, file, {
      upsert: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from("restaurants").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setIsUploadingLogo(true);
    try {
      const publicUrl = await uploadAsset(file, "logo");
      setLogoUrl(publicUrl);
      setMessage("Logo chargé.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible de charger le logo.");
    } finally {
      setIsUploadingLogo(false);
      event.target.value = "";
    }
  }

  function validateReservationTables(): boolean {
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (reservationMode === "simple" && !lunchServiceEnabled && !dinnerServiceEnabled) {
      setMessage("Activez au moins le service midi ou le service soir.");
      return;
    }

    if (!validateReservationTables()) {
      return;
    }

    setIsSaving(true);

    const descTrim = publicPageDescription.trim().slice(0, 500);
    const tagTrim = publicTagline.trim().slice(0, 100);

    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update({
        name,
        slug,
        phone: phone || null,
        email: email || null,
        address: address || null,
        description: description || null,
        primary_color: heroPrimaryColor || null,
        logo_url: logoUrl || null,
        banner_url: coverImageUrl || null,
        page_background_color: pageBackgroundColor || null,
        hero_primary_color: heroPrimaryColor || null,
        public_button_bg_color: buttonColor || null,
        public_button_text_color: buttonTextColor || null,
        public_heading_text_color: headingTextColor || null,
        public_body_text_color: bodyTextColor || null,
        public_accent_color: accentColor || null,
        public_footer_bg_color: footerBgColor || null,
        public_footer_text_color: footerTextColor || null,
        public_heading_font: headingFont || null,
        public_body_font: bodyFont || null,
        public_hero_title_size_px: Math.min(72, Math.max(32, heroTitleSizePx)),
        public_display_name: publicDisplayName.trim() || null,
        public_tagline: tagTrim || null,
        public_description: descTrim || null,
        public_cta_label: ctaLabel.trim().slice(0, 80) || null,
        public_hero_height: heroHeight,
        public_hero_overlay_enabled: heroOverlayEnabled,
        public_hero_overlay_opacity: Math.min(80, Math.max(0, heroOverlayOpacity)),
        google_maps_url: googleMapsUrl.trim() || null,
        show_public_instagram: showPublicInstagram,
        show_public_facebook: showPublicFacebook,
        show_public_google_maps: showPublicGoogleMaps,
        reservation_confirmation_mode: reservationConfirmationMode,
        reservation_confirmation_email_subject: reservationConfirmationEmailSubject.trim() || null,
        reservation_confirmation_email_body: reservationConfirmationEmailBody.trim() || null,
      })
      .eq("id", restaurant.id);

    if (restaurantError) {
      setMessage(restaurantError.message);
      setIsSaving(false);
      return;
    }

    const { error: settingsError } = await supabase
      .from("restaurant_settings")
      .upsert({
        restaurant_id: restaurant.id,
        restaurant_capacity: Math.max(lunchMaxCovers, dinnerMaxCovers),
        max_covers_per_slot: Math.max(lunchMaxCovers, dinnerMaxCovers),
        reservation_duration: Math.max(
          30,
          Math.min(600, Math.round((floorPlanLunchDuration + floorPlanDinnerDuration) / 2)),
        ),
        auto_archive_reservations: autoArchiveReservations,
        reservation_mode: reservationMode,
        use_tables: reservationMode === "floor_plan",
        floor_plan_public_selection_mode: reservationMode === "floor_plan" ? floorPlanPublicSelectionMode : "automatic",
        // legacy compat (zone/table/automatic)
        public_table_selection_mode:
          reservationMode === "floor_plan"
            ? floorPlanPublicSelectionMode === "area"
              ? "zone"
              : floorPlanPublicSelectionMode
            : "automatic",
        lunch_duration_minutes: Math.max(30, Math.min(600, floorPlanLunchDuration)),
        dinner_duration_minutes: Math.max(30, Math.min(600, floorPlanDinnerDuration)),
        floor_plan_lunch_duration: Math.max(30, Math.min(600, floorPlanLunchDuration)),
        floor_plan_dinner_duration: Math.max(30, Math.min(600, floorPlanDinnerDuration)),
        service_lunch_enabled: lunchServiceEnabled,
        service_lunch_start: lunchServiceStart.length === 5 ? `${lunchServiceStart}:00` : lunchServiceStart,
        service_lunch_end: lunchServiceEnd.length === 5 ? `${lunchServiceEnd}:00` : lunchServiceEnd,
        service_lunch_max_covers: Math.max(1, Math.min(500, lunchMaxCovers)),
        service_dinner_enabled: dinnerServiceEnabled,
        service_dinner_start: dinnerServiceStart.length === 5 ? `${dinnerServiceStart}:00` : dinnerServiceStart,
        service_dinner_end: dinnerServiceEnd.length === 5 ? `${dinnerServiceEnd}:00` : dinnerServiceEnd,
        service_dinner_max_covers: Math.max(1, Math.min(500, dinnerMaxCovers)),
        terrace_enabled: terraceEnabled,
        terrace_capacity: Math.max(0, Math.min(500, terraceCapacity)),
        days_in_advance: daysInAdvance,
        reservation_slot_interval: 15,
        max_party_size: maxPartySize,
        accent_color: accentColor || null,
        button_color: buttonColor || null,
        text_color: bodyTextColor || null,
        heading_font: headingFont || null,
        body_font: bodyFont || null,
        font_size_scale: fontSizeScale,
        border_radius: borderRadius,
        button_style: buttonStyle,
        card_style: cardStyle,
        logo_url: logoUrl || null,
        cover_image_url: coverImageUrl || null,
        instagram_url: instagramUrl || null,
        facebook_url: facebookUrl || null,
        website_url: websiteUrl || null,
        pre_booking_message: preBookingMessage || null,
        closure_start_date: closureStartDate || null,
        closure_end_date: closureEndDate || null,
        closure_message: closureMessage || null,
        public_page_description: descTrim || null,
        gallery_image_urls: galleryUrls.filter(Boolean),
        public_page_show_address: showPublicAddress,
        public_page_show_phone: showPublicPhone,
        public_page_show_email: showPublicEmail,
        public_page_show_website: showPublicWebsite,
        public_page_show_opening_hours: showPublicOpeningHours,
      }, { onConflict: "restaurant_id" });

    if (settingsError) {
      setMessage(settingsError.message);
      setIsSaving(false);
      return;
    }

    setSaveButtonSuccess(true);
    window.setTimeout(() => setSaveButtonSuccess(false), 2000);
    setIsSaving(false);
  }

  const desktopSections: SettingsSectionKey[] = [
    "restaurant",
    "public_page",
    "reservations",
    "floor_plan",
    "reviews",
    "marketing",
    "subscription",
    "account",
  ];

  function setSection(next: SettingsSectionKey) {
    setActiveSection(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", next);
    router.replace(`/dashboard/settings?${params.toString()}`);
  }

  return (
    <div className="grid gap-10 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
      <aside className="hidden md:block">
        <div className="sticky top-5 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zg-fg-muted">Sections</p>
          <nav className="space-y-1 rounded-2xl border border-zg-border bg-zg-surface-soft/70 p-2 shadow-zg-soft">
            {desktopSections.map((key) => {
              const Icon = sectionIcon(key);
              const meta = sectionLabel(key);
              const active = activeSection === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                    active
                      ? "bg-gradient-to-r from-zg-highlight/90 to-zg-surface shadow-[inset_0_0_0_1px_var(--zg-border-accent)]"
                      : "hover:bg-zg-highlight/60",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                      active
                        ? "border-zg-border-accent bg-zg-surface/90 text-zg-teal"
                        : "border-zg-border/70 bg-zg-surface/85 text-zg-muted",
                    )}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-sm font-semibold", active ? "text-zg-fg" : "text-zg-muted")}>
                      {meta.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-zg-muted">{meta.description}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Mobile: sections en accordéons nommés */}
        <div className="space-y-4 md:hidden">
          {desktopSections.map((key) => {
            const Icon = sectionIcon(key);
            const meta = sectionLabel(key);
            return (
              <details key={key} className="group overflow-hidden rounded-2xl border border-zg-border bg-zg-surface-soft/70 shadow-zg-soft">
                <summary className="list-none cursor-pointer px-5 py-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zg-border/70 bg-zg-surface/85 text-zg-muted">
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zg-fg">{meta.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zg-muted">{meta.description}</p>
                    </div>
                  </div>
                </summary>
                <div className="border-t border-zg-border/80 px-5 py-5">
                  <ActiveSettingsSection
                    section={key}
                    renderForm={(children, footer) => (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {children}
                        {footer}
                      </form>
                    )}
                  />
                </div>
              </details>
            );
          })}
        </div>

        {/* Desktop: contenu section sélectionnée */}
        <div className="hidden md:block">
          <ActiveSettingsSection
            section={activeSection}
            renderForm={(children, footer) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                {children}
                {footer}
              </form>
            )}
          />
        </div>
      </div>
    </div>
  );

  function ActiveSettingsSection({
    section,
    renderForm,
  }: {
    section: SettingsSectionKey;
    renderForm: (children: ReactNode, footer?: ReactNode) => ReactNode;
  }) {
    if (section === "subscription") {
      return (
        <SettingsSectionCard
          title="Abonnement"
          description="Plan actuel, essai et gestion du paiement."
        >
          <BillingPlans
            status={subscriptionStatus}
            plan={subscriptionPlan}
            trialEndDate={trialEndDate}
            isOwnerDev={isOwnerDev}
          />
        </SettingsSectionCard>
      );
    }

    if (section === "reviews") {
      return (
        <SettingsSectionCard
          title="Avis Google"
          description="Activez l’envoi automatique après la visite et personnalisez le message."
        >
          {reviewAutomationLoading || !reviewAutomation ? (
            <div className="rounded-2xl border border-dashed border-zg-border bg-zg-surface-soft/60 py-10 text-center text-sm text-zg-muted">
              Chargement des réglages…
            </div>
          ) : (
            <ReviewAutomationPanel
              restaurantId={restaurant.id}
              initialSettings={{
                ...reviewAutomation,
                channel: "email",
              }}
              initialFeedback={reviewFeedback}
            />
          )}
        </SettingsSectionCard>
      );
    }

    if (section === "marketing") {
      return (
        <SettingsSectionCard
          title="Marketing"
          description="Campagnes e-mail et relances clients (Pro)."
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zg-muted">Les campagnes se gèrent dans le module Marketing.</p>
              <Link href="/dashboard/marketing" className="inline-flex">
                <Button type="button" variant="secondary" className="min-h-11">
                  Ouvrir Marketing
                </Button>
              </Link>
            </div>
          }
        >
          <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-5">
            <p className="text-sm font-semibold text-zg-fg">Campagnes</p>
            <p className="mt-2 text-sm leading-relaxed text-zg-muted">
              Créez des e-mails groupés pour annoncer une soirée spéciale, un menu ou une offre.
            </p>
          </div>
        </SettingsSectionCard>
      );
    }

    if (section === "account") {
      return (
        <SettingsSectionCard
          title="Compte"
          description="Connexion et sécurité."
          footer={
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
              >
                Se déconnecter
              </Button>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zg-muted">E-mail connecté</p>
              <p className="mt-2 text-sm font-semibold text-zg-fg">{authEmail ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zg-muted">Sécurité</p>
              <p className="mt-2 text-sm text-zg-muted">
                La gestion du mot de passe dépend de votre méthode de connexion.
              </p>
            </div>
          </div>
        </SettingsSectionCard>
      );
    }

    if (section === "restaurant") {
      return renderForm(
        <SettingsSectionCard
          title="Restaurant"
          description="Nom, coordonnées et informations visibles ou internes."
          footer={
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSaving} className="min-h-11 min-w-[180px]">
                {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              {message ? <p className="text-sm text-zg-muted">{message}</p> : null}
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Nom du restaurant</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div>
              <label className="dashboard-field-label">Téléphone</label>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">E-mail</label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Adresse</label>
              <Input value={address} onChange={(event) => setAddress(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Site web</label>
              <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Description interne</label>
              <p className="mt-1 text-xs text-zg-muted">
                Notes internes. Le texte affiché côté clients se règle dans Page publique.
              </p>
              <Textarea className="mt-2 min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Logo</label>
              <div className="mt-2 grid gap-3 md:grid-cols-[1fr_220px] md:items-start">
                <div className="space-y-2">
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                  {isUploadingLogo ? <p className="text-xs text-zg-muted">Envoi du logo…</p> : null}
                  <Input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="URL du logo (optionnel)" />
                </div>
                <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-4">
                  {logoUrl ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-zg-border/70 bg-white/70">
                      <Image src={logoUrl} alt="" fill className="object-contain p-2" unoptimized sizes="80px" />
                    </div>
                  ) : (
                    <p className="text-sm text-zg-muted">Aucun logo.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </SettingsSectionCard>,
      );
    }

    if (section === "public_page") {
      const effectivePublicLink = publicLink.replace(restaurant.slug, slug);
      return renderForm(
        <SettingsSectionCard
          title="Page publique"
          description="Lien à partager, présentation et informations visibles par vos clients."
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isSaving} className="min-h-11 min-w-[180px]">
                  {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement…" : "Enregistrer"}
                </Button>
                {message ? <p className="text-sm text-zg-muted">{message}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(effectivePublicLink);
                      setMessage("Lien copié.");
                    } catch {
                      setMessage("Impossible de copier le lien.");
                    }
                  }}
                >
                  Copier
                </Button>
                <a href={effectivePublicLink} target="_blank" rel="noreferrer">
                  <Button type="button" variant="secondary" className="min-h-11">
                    Voir la page
                  </Button>
                </a>
              </div>
            </div>
          }
        >
          <div className="grid gap-5">
            <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-zg-muted">Lien public</p>
              <p className="mt-2 break-all text-sm font-semibold text-zg-fg">{effectivePublicLink}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Slug</label>
                <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
              </div>
              <div>
                <label className="dashboard-field-label">Couleur principale</label>
                <div className="mt-2 flex items-center gap-2">
                  <Input type="color" className="h-11 w-14 shrink-0" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                  <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Titre d’accueil</label>
                <Input value={publicDisplayName} onChange={(event) => setPublicDisplayName(event.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Texte d’accueil</label>
                <Textarea className="min-h-24" value={publicPageDescription} maxLength={500} onChange={(event) => setPublicPageDescription(event.target.value)} />
                <p className="mt-1 text-xs text-zg-muted">{publicPageDescription.length}/500</p>
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Réseaux sociaux</label>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="Instagram (URL)" />
                  <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="Facebook (URL)" />
                  <Input value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="Google Maps (URL)" className="md:col-span-2" />
                </div>
              </div>
            </div>

            <details className="rounded-2xl border border-zg-border bg-zg-surface-soft/50 p-5">
              <summary className="cursor-pointer text-sm font-semibold text-zg-fg">
                Options avancées
              </summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Police des titres</label>
                  <select
                    className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm text-zg-fg"
                    value={headingFont}
                    onChange={(event) => setHeadingFont(event.target.value)}
                  >
                    {PUBLIC_PAGE_FONT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="dashboard-field-label">Police du texte</label>
                  <select
                    className="mt-2 h-11 w-full rounded-xl border border-zg-border bg-zg-surface px-3 text-sm text-zg-fg"
                    value={bodyFont}
                    onChange={(event) => setBodyFont(event.target.value)}
                  >
                    {PUBLIC_PAGE_FONT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <PublicPageLivePreview draft={previewDraft} publicPath={publicLink} />
              </div>
            </details>
          </div>
        </SettingsSectionCard>,
      );
    }

    if (section === "reservations") {
      return renderForm(
        <SettingsSectionCard
          title="Réservations"
          description="Choisissez un mode simple ou un plan de salle. ZenGrow applique la même règle partout."
          footer={
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSaving} className="min-h-11 min-w-[180px]">
                {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              {message ? <p className="text-sm text-zg-muted">{message}</p> : null}
            </div>
          }
        >
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setReservationMode("simple")}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-zg-teal/30",
                  reservationMode === "simple"
                    ? "border-zg-border-accent bg-zg-highlight/60 ring-1 ring-zg-teal/10"
                    : "border-zg-border bg-zg-surface hover:border-zg-border-accent/70",
                )}
              >
                <p className="text-sm font-semibold text-zg-fg">Mode simple</p>
                <p className="mt-2 text-sm leading-relaxed text-zg-muted">
                  Idéal pour commencer : ZenGrow vérifie une capacité par service, sans gérer les tables.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReservationMode("floor_plan")}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-zg-teal/30",
                  reservationMode === "floor_plan"
                    ? "border-zg-border-accent bg-zg-highlight/60 ring-1 ring-zg-teal/10"
                    : "border-zg-border bg-zg-surface hover:border-zg-border-accent/70",
                )}
              >
                <p className="text-sm font-semibold text-zg-fg">Plan de salle</p>
                <p className="mt-2 text-sm leading-relaxed text-zg-muted">
                  Disponibilités calculées depuis vos espaces, vos tables et votre plan visuel.
                </p>
              </button>
            </div>

            {reservationMode === "simple" ? (
              <div className="space-y-6 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6">
                <div className="grid gap-4">
                  <Toggle checked={lunchServiceEnabled} onChange={setLunchServiceEnabled} label="Service midi activé" />
                  {lunchServiceEnabled ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="dashboard-field-label">Horaires midi — début</label>
                        <Input type="time" value={lunchServiceStart} onChange={(e) => setLunchServiceStart(e.target.value)} />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Horaires midi — fin</label>
                        <Input type="time" value={lunchServiceEnd} onChange={(e) => setLunchServiceEnd(e.target.value)} />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Capacité midi</label>
                        <Input type="number" min={1} max={500} value={lunchMaxCovers} onChange={(e) => setLunchMaxCovers(Number(e.target.value))} />
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-4">
                  <Toggle checked={dinnerServiceEnabled} onChange={setDinnerServiceEnabled} label="Service soir activé" />
                  {dinnerServiceEnabled ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="dashboard-field-label">Horaires soir — début</label>
                        <Input type="time" value={dinnerServiceStart} onChange={(e) => setDinnerServiceStart(e.target.value)} />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Horaires soir — fin</label>
                        <Input type="time" value={dinnerServiceEnd} onChange={(e) => setDinnerServiceEnd(e.target.value)} />
                      </div>
                      <div>
                        <label className="dashboard-field-label">Capacité soir</label>
                        <Input type="number" min={1} max={500} value={dinnerMaxCovers} onChange={(e) => setDinnerMaxCovers(Number(e.target.value))} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {reservationMode === "floor_plan" ? (
              <div className="space-y-5 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zg-muted">Espaces actifs</p>
                    <p className="mt-1 text-lg font-bold text-zg-fg">{floorPlanSummary?.activeZones ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zg-muted">Tables actives</p>
                    <p className="mt-1 text-lg font-bold text-zg-fg">{floorPlanSummary?.activeTables ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zg-muted">Capacité totale</p>
                    <p className="mt-1 text-lg font-bold text-zg-fg">{floorPlanSummary?.maxCovers ?? "—"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-zg-muted">
                    Ouvrez le plan de salle pour créer vos espaces et placer vos tables.
                  </p>
                  <Link href="/dashboard/floor-plan">
                    <Button type="button" className="min-h-11">
                      Ouvrir le plan de salle
                    </Button>
                  </Link>
                </div>

                <ReservationField
                  label="Choix côté client"
                  description="ZenGrow peut assigner automatiquement, proposer un espace, ou laisser le client choisir une table sur le plan."
                >
                  <Select
                    value={floorPlanPublicSelectionMode}
                    onChange={(e) => setFloorPlanPublicSelectionMode(e.target.value as "automatic" | "area" | "table")}
                  >
                    <option value="automatic">ZenGrow choisit automatiquement la table</option>
                    <option value="area">Le client choisit un espace</option>
                    <option value="table">Le client choisit une table sur le plan</option>
                  </Select>
                </ReservationField>
              </div>
            ) : null}
          </div>
        </SettingsSectionCard>,
      );
    }

    if (section === "floor_plan") {
      return renderForm(
        <SettingsSectionCard
          title="Plan de salle"
          description="Espaces, tables et configuration côté client."
          footer={
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSaving} className="min-h-11 min-w-[180px]">
                {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              {message ? <p className="text-sm text-zg-muted">{message}</p> : null}
            </div>
          }
        >
          {reservationMode === "floor_plan" ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-zg-border/70 bg-zg-surface/80 p-5">
                <p className="text-sm font-semibold text-zg-fg">Résumé</p>
                <p className="mt-2 text-sm text-zg-muted">
                  {floorPlanSummary
                    ? `${floorPlanSummary.activeZones} espaces actifs · ${floorPlanSummary.activeTables} tables actives · ${floorPlanSummary.maxCovers} couverts`
                    : "—"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/dashboard/floor-plan">
                  <Button type="button" className="min-h-11">
                    Ouvrir le plan de salle
                  </Button>
                </Link>
                <p className="text-sm text-zg-muted">
                  Créez vos espaces (Salle intérieure, Terrasse…) et ajoutez vos tables.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zg-border bg-zg-surface p-6">
              <p className="text-sm font-semibold text-zg-fg">Disponible avec le mode Plan de salle</p>
              <p className="mt-2 text-sm leading-relaxed text-zg-muted">
                Le plan de salle est disponible lorsque vous activez le mode Plan de salle dans Réservations.
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setReservationMode("floor_plan");
                    setActiveSection("reservations");
                    setSection("reservations");
                  }}
                  className="min-h-11"
                >
                  Activer le mode Plan de salle
                </Button>
              </div>
            </div>
          )}
        </SettingsSectionCard>,
      );
    }

    // fallback (ne devrait pas arriver)
    return (
      <SettingsSectionCard
        title="Paramètres"
        description="Sélectionnez une section."
      >
        <div className="rounded-2xl border border-dashed border-zg-border bg-zg-surface-soft/60 py-10 text-center text-sm text-zg-muted">
          Sélectionnez une section dans le menu.
        </div>
      </SettingsSectionCard>
    );
  }

  /*
   * NOTE: le reste du formulaire historique (PDF, galerie, e-mails, fermeture, etc.) a été déplacé
   * dans une UX “Options avancées” au sein de la section Page publique, pour garder une interface premium.
   * Les handlers et états restent inchangés afin de ne pas toucher à la logique métier.
   */

}
