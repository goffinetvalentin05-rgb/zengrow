"use client";

import { ChangeEvent, FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  CalendarCheck2,
  CreditCard,
  Globe2,
  Star,
  Store,
  UserRound,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Badge from "@/src/components/ui/badge";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import { SettingsCategoryCard } from "@/src/components/dashboard/settings/settings-category-card";
import { cn, formatOpeningHoursLines, type OpeningHours } from "@/src/lib/utils";
import AvailabilityEditor from "@/src/components/dashboard/availability-editor";
import PublicPageSettingsPanel, {
  type PublicPageSettingsHandle,
  type PublicPageSettingsInitial,
} from "@/src/components/dashboard/settings/public-page-settings-panel";
import BillingPlans from "@/src/components/dashboard/billing-plans";
import ReviewAutomationPanel from "@/src/components/dashboard/review-automation-panel";
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
  availabilitySettings: {
    opening_hours: OpeningHours;
    max_guests_per_slot: number;
    reservation_slot_interval: number;
    reservation_duration: number;
  };
  publicPageInitial: PublicPageSettingsInitial;
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

function SoonBadge() {
  return (
    <Badge tone="sand" className="shrink-0 text-[10px] font-semibold uppercase tracking-wide">
      Bientôt disponible
    </Badge>
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
  availabilitySettings,
  publicPageInitial,
}: SettingsFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const availabilityAnchorRef = useRef<HTMLDivElement | null>(null);
  const publicPageRef = useRef<PublicPageSettingsHandle | null>(null);
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
  const [daysInAdvance, setDaysInAdvance] = useState(settings.days_in_advance ?? 60);
  const [floorPlanLunchDuration] = useState(
    settings.lunch_duration_minutes ?? settings.floor_plan_lunch_duration ?? settings.reservation_duration ?? 90,
  );
  const [floorPlanDinnerDuration] = useState(
    settings.dinner_duration_minutes ?? settings.floor_plan_dinner_duration ?? settings.reservation_duration ?? 90,
  );
  const [autoArchiveReservations] = useState(
    settings.auto_archive_reservations === true,
  );
  const [maxPartySize, setMaxPartySize] = useState(settings.max_party_size ?? 8);
  const [pageBackgroundColor] = useState(
    restaurant.page_background_color ?? "#f8fafc",
  );
  const [heroPrimaryColor, setHeroPrimaryColor] = useState(
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
  const [coverImageUrl, setCoverImageUrl] = useState(settings.cover_image_url ?? restaurant.banner_url ?? "");
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url ?? "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebook_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(settings.website_url ?? "");
  const [preBookingMessage] = useState(settings.pre_booking_message ?? "");
  const [closureStartDate] = useState(settings.closure_start_date ?? "");
  const [closureEndDate] = useState(settings.closure_end_date ?? "");
  const [closureMessage] = useState(settings.closure_message ?? "");
  const [reservationConfirmationMode, setReservationConfirmationMode] = useState<"manual" | "automatic">(
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
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

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

  useEffect(() => {
    const section = searchParams.get("section");
    if (section !== "availability") return;
    const id = window.requestAnimationFrame(() => {
      availabilityAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [searchParams]);

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

  useEffect(() => {
    let cancelled = false;
    setReviewAutomationLoading(true);
    (async () => {
      const { data: automation } = await supabase
        .from("review_automation_settings")
        .select(
          "is_enabled, delay_minutes, google_review_url, email_subject, email_message, button_positive_label, button_neutral_label, button_negative_label, primary_color",
        )
        .eq("restaurant_id", restaurant.id)
        .maybeSingle();

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


  const openingSummaryLines = useMemo(
    () => formatOpeningHoursLines(availabilitySettings.opening_hours),
    [availabilitySettings.opening_hours],
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

    const publicRestaurantPatch = publicPageRef.current?.getRestaurantUpdate() ?? {};
    const publicSettingsPatch = publicPageRef.current?.getSettingsUpdate() ?? {};

    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update({
        ...publicRestaurantPatch,
        description: description || null,
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
        ...publicSettingsPatch,
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
        closure_start_date: closureStartDate || null,
        closure_end_date: closureEndDate || null,
        closure_message: closureMessage || null,
      }, { onConflict: "restaurant_id" });

    if (settingsError) {
      setMessage(settingsError.message);
      setIsSaving(false);
      return;
    }

    setMessage("Modifications enregistrées.");
    setSaveButtonSuccess(true);
    window.setTimeout(() => setSaveButtonSuccess(false), 2000);
    setIsSaving(false);
  }

  const effectivePublicLink = useMemo(
    () => publicLink.replace(restaurant.slug, publicPageRef.current?.getSlug() ?? slug),
    [publicLink, restaurant.slug, slug],
  );

  return (
    <>
      <form id="settings-main-form" onSubmit={handleSubmit} className="relative mx-auto max-w-5xl space-y-6 pb-28">
        <SettingsCategoryCard
          icon={CreditCard}
          iconWrapClassName="bg-[#A855F7]/15 text-[#A855F7]"
          iconClassName="text-[#A855F7]"
          title="Facturation"
          subtitle="Gère ton abonnement, ton plan et tes factures."
        >
          <SettingsAccordion title="Plan actuel et abonnement">
            <BillingPlans
              status={subscriptionStatus}
              plan={subscriptionPlan}
              trialEndDate={trialEndDate}
              isOwnerDev={isOwnerDev}
            />
          </SettingsAccordion>
          <SettingsAccordion title="Méthode de paiement">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Carte enregistrée</p>
                <p className="mt-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm text-zg-fg">•••• •••• •••• 4242</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="secondary" className="min-h-11" disabled>
                  Mettre à jour
                </Button>
                <SoonBadge />
              </div>
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Historique des factures">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-zg-text-muted">Aucune facture à afficher pour le moment.</p>
              <SoonBadge />
            </div>
          </SettingsAccordion>
        </SettingsCategoryCard>

        <SettingsCategoryCard
          icon={Store}
          iconWrapClassName="bg-zg-accent/15 text-zg-accent"
          iconClassName="text-zg-accent"
          title="Informations du restaurant"
          subtitle="Identité, coordonnées et présentation de ton resto."
        >
          <SettingsAccordion title="Identité">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Nom du restaurant</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="md:col-span-2 rounded-xl border border-zg-border/70 bg-zg-surface/60 p-4">
                <p className="text-sm text-zg-muted">
                  Identité, coordonnées et réseaux : configurez tout dans la section « Page publique » ci-dessous.
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Description courte</label>
                <Textarea className="min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Coordonnées">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Adresse complète</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <label className="dashboard-field-label">Téléphone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="dashboard-field-label">E-mail de contact</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Site web</label>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Horaires d'ouverture">
            <ul className="space-y-2 text-sm text-zg-fg">
              {openingSummaryLines.map((line) => (
                <li key={line} className="rounded-lg border border-zg-border/70 bg-zg-surface/60 px-3 py-2">
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-zg-text-muted">
              Ces horaires reflètent tes disponibilités de réservation. Pour les modifier, ouvre la section « Disponibilités & réservations ».
            </p>
          </SettingsAccordion>
        </SettingsCategoryCard>

        <div ref={availabilityAnchorRef} id="settings-availability">
          <SettingsCategoryCard
            icon={CalendarCheck2}
            iconWrapClassName="bg-[#3B82F6]/15 text-[#3B82F6]"
            iconClassName="text-[#3B82F6]"
            title="Disponibilités & réservations"
            subtitle="Configure tes créneaux et les règles de réservation."
          >
            <SettingsAccordion title="Horaires de réservation par jour">
              <AvailabilityEditor embedded embeddedPart="hours" restaurantId={restaurant.id} settings={availabilitySettings} />
            </SettingsAccordion>
            <SettingsAccordion title="Paramètres de réservation">
              <div className="flex flex-col gap-6">
                <AvailabilityEditor embedded embeddedPart="params" restaurantId={restaurant.id} settings={availabilitySettings} />
                <div className="grid gap-4 border-t border-zg-border/60 pt-4 md:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="dashboard-field-label">Délai minimum avant réservation</label>
                      <SoonBadge />
                    </div>
                    <Input className="mt-2" disabled placeholder="—" />
                  </div>
                  <div>
                    <label className="dashboard-field-label">Délai max. de réservation à l'avance (jours)</label>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      className="mt-2"
                      value={daysInAdvance}
                      onChange={(e) => setDaysInAdvance(Number(e.target.value))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label">Convives max. par groupe (réservation)</label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      className="mt-2"
                      value={maxPartySize}
                      onChange={(e) => setMaxPartySize(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </SettingsAccordion>
            <SettingsAccordion title="Règles de capacité">
              <div className="space-y-6">
                <div>
                  <label className="dashboard-field-label">Capacité totale (mode simple)</label>
                  <p className="mt-2 rounded-lg border border-zg-border bg-zg-surface px-3 py-2 text-sm font-semibold text-zg-fg">
                    {Math.max(lunchMaxCovers, dinnerMaxCovers)} couverts (max. midi / soir)
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setReservationMode("simple")}
                    className={cn(
                      "rounded-2xl border p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-zg-teal/30",
                      reservationMode === "simple"
                        ? "border-zg-border-focus bg-zg-accent-soft-bg ring-1 ring-zg-accent/25"
                        : "border-zg-border bg-zg-surface hover:border-zg-border-hover",
                    )}
                  >
                    <p className="text-sm font-semibold text-zg-fg">Mode simple</p>
                    <p className="mt-2 text-sm leading-relaxed text-zg-muted">
                      Capacité par service (midi / soir), sans gestion des tables.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReservationMode("floor_plan")}
                    className={cn(
                      "rounded-2xl border p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-zg-teal/30",
                      reservationMode === "floor_plan"
                        ? "border-zg-border-focus bg-zg-accent-soft-bg ring-1 ring-zg-accent/25"
                        : "border-zg-border bg-zg-surface hover:border-zg-border-hover",
                    )}
                  >
                    <p className="text-sm font-semibold text-zg-fg">Plan de salle</p>
                    <p className="mt-2 text-sm leading-relaxed text-zg-muted">
                      Disponibilités basées sur espaces, tables et plan visuel.
                    </p>
                  </button>
                </div>

                {reservationMode === "simple" ? (
                  <div className="space-y-6 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">Limite par service</p>
                    <div className="grid gap-4">
                      <Toggle checked={lunchServiceEnabled} onChange={setLunchServiceEnabled} label="Service midi activé" />
                      {lunchServiceEnabled ? (
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="dashboard-field-label">Début midi</label>
                            <Input type="time" value={lunchServiceStart} onChange={(e) => setLunchServiceStart(e.target.value)} />
                          </div>
                          <div>
                            <label className="dashboard-field-label">Fin midi</label>
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
                            <label className="dashboard-field-label">Début soir</label>
                            <Input type="time" value={dinnerServiceStart} onChange={(e) => setDinnerServiceStart(e.target.value)} />
                          </div>
                          <div>
                            <label className="dashboard-field-label">Fin soir</label>
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
                      <p className="text-sm text-zg-muted">Gère ton plan dans l'éditeur dédié.</p>
                      <Link href="/dashboard/floor-plan">
                        <Button type="button" className="min-h-11">
                          Ouvrir le plan de salle
                        </Button>
                      </Link>
                    </div>
                    <ReservationField
                      label="Choix côté client"
                      description="Assignation auto, espace ou table sur le plan."
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
                ) : (
                  <div className="rounded-2xl border border-zg-border bg-zg-surface p-5">
                    <p className="text-sm text-zg-muted">
                      Passe en mode plan de salle pour une capacité calculée depuis tes tables.
                    </p>
                    <Button type="button" className="mt-4 min-h-11" onClick={() => setReservationMode("floor_plan")}>
                      Activer le mode plan de salle
                    </Button>
                  </div>
                )}
              </div>
            </SettingsAccordion>
          </SettingsCategoryCard>
        </div>

        <SettingsCategoryCard
          icon={Globe2}
          iconWrapClassName="bg-[#EC4899]/15 text-[#EC4899]"
          iconClassName="text-[#EC4899]"
          title="Page publique"
          subtitle="Personnalisez votre page de réservation : identité, photos, contenu et publication."
        >
          <PublicPageSettingsPanel
            ref={publicPageRef}
            initial={publicPageInitial}
            publicLinkBase={publicLink}
            onMessage={setMessage}
          />
        </SettingsCategoryCard>

        <SettingsCategoryCard
          icon={Bell}
          iconWrapClassName="bg-[#F59E0B]/15 text-[#F59E0B]"
          iconClassName="text-[#F59E0B]"
          title="Notifications"
          subtitle="Configure les alertes pour toi et tes clients."
        >
          <SettingsAccordion title="Notifications clients (envoyées automatiquement)">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-zg-fg">E-mail de confirmation de réservation</span>
                <Toggle
                  checked={reservationConfirmationMode === "automatic"}
                  onChange={(v) => setReservationConfirmationMode(v ? "automatic" : "manual")}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 opacity-70">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zg-fg">E-mail de rappel J-1</span>
                  <SoonBadge />
                </div>
                <Toggle checked={false} onChange={() => {}} disabled />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 opacity-90">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-zg-fg">Demande d&apos;avis après la visite</span>
                  <p className="mt-1 text-xs text-zg-text-muted">
                    Configure le message et le délai dans la section « Avis Google » ci-dessous.
                  </p>
                </div>
              </div>
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Tes notifications (ce que tu reçois)">
            <div className="flex flex-col gap-4">
              {["Nouvelle réservation par e-mail", "Nouvelle réservation par SMS", "Digest quotidien des réservations", "Alerte annulation"].map(
                (label) => (
                  <div key={label} className="flex flex-wrap items-center justify-between gap-3 opacity-70">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zg-fg">{label}</span>
                      <SoonBadge />
                    </div>
                    <Toggle checked={false} onChange={() => {}} disabled />
                  </div>
                ),
              )}
            </div>
          </SettingsAccordion>
        </SettingsCategoryCard>

        <SettingsCategoryCard
          icon={Star}
          iconWrapClassName="bg-zg-warning-soft-bg text-zg-warning"
          iconClassName="text-zg-warning"
          title="Avis Google"
          subtitle="Configure l'automatisation des demandes d'avis Google envoyées à tes clients après leur visite."
        >
          {reviewAutomationLoading || !reviewAutomation ? (
            <div className="rounded-2xl border border-dashed border-zg-border bg-zg-surface-soft/60 py-10 text-center text-sm text-zg-muted">
              Chargement des réglages…
            </div>
          ) : (
            <ReviewAutomationPanel
              layout="settings"
              restaurantId={restaurant.id}
              initialSettings={{
                ...reviewAutomation,
                channel: "email",
              }}
              initialFeedback={[]}
            />
          )}
        </SettingsCategoryCard>

        <SettingsCategoryCard
          icon={UserRound}
          iconWrapClassName="bg-[#22C55E]/15 text-[#22C55E]"
          iconClassName="text-[#22C55E]"
          title="Compte"
          subtitle="Tes infos personnelles et préférences."
        >
          <SettingsAccordion title="Profil">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Prénom</label>
                <Input disabled placeholder="—" />
                <SoonBadge />
              </div>
              <div>
                <label className="dashboard-field-label">Nom</label>
                <Input disabled placeholder="—" />
                <SoonBadge />
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">E-mail de connexion</label>
                <Input readOnly value={authEmail ?? ""} />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-2">
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
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Sécurité">
            <p className="text-sm text-zg-muted">La gestion du mot de passe dépend de ta méthode de connexion.</p>
            <div className="mt-3 flex items-center gap-2">
              <Button type="button" variant="secondary" className="min-h-11" disabled>
                Changer le mot de passe
              </Button>
              <SoonBadge />
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Préférences">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Langue</label>
                <Input readOnly value="Français" />
                <SoonBadge />
              </div>
              <div>
                <label className="dashboard-field-label">Fuseau horaire</label>
                <Input readOnly value="Europe/Zurich" />
                <SoonBadge />
              </div>
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Zone de danger" danger>
            <p className="text-sm text-zg-muted">
              La suppression est définitive : réservations, page publique et données associées seront perdues.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 min-h-11 border border-zg-danger/50 bg-transparent text-zg-danger hover:bg-zg-danger/10"
              onClick={() => setDeleteAccountOpen(true)}
            >
              Supprimer mon compte
            </Button>
          </SettingsAccordion>
        </SettingsCategoryCard>
      </form>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-10">
        <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl border border-zg-border bg-zg-surface/95 px-4 py-3 shadow-lg backdrop-blur-md">
          <p className="min-w-0 truncate text-sm text-zg-text-muted">
            {message ? <span className="text-zg-fg">{message}</span> : <span>Enregistre les modifications du formulaire principal.</span>}
          </p>
          <Button type="submit" form="settings-main-form" disabled={isSaving} className="min-h-11 shrink-0 px-6">
            {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>

      {deleteAccountOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => setDeleteAccountOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-zg-border bg-zg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-semibold text-zg-fg">Supprimer ton compte ?</p>
            <p className="mt-2 text-sm text-zg-muted">Cette action est irréversible. Fonctionnalité en préparation.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" className="min-h-11" onClick={() => setDeleteAccountOpen(false)}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="danger"
                className="min-h-11"
                onClick={() => {
                  setDeleteAccountOpen(false);
                  setMessage("Suppression de compte : bientôt disponible. Contacte le support si besoin.");
                }}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
