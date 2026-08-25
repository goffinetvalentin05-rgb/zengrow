"use client";

import { ChangeEvent, FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  CalendarCheck2,
  CreditCard,
  Gift,
  Globe,
  Star,
  Store,
  UserRound,
  Wallet,
} from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import { SettingsCategoryCard } from "@/src/components/dashboard/settings/settings-category-card";
import {
  parseSettingsSection,
  SettingsSectionTabs,
  type SettingsSectionId,
} from "@/src/components/dashboard/settings/settings-section-tabs";
import { DashboardThemeToggle } from "@/src/components/dashboard/dashboard-theme-toggle";
import { cn, type OpeningHours } from "@/src/lib/utils";
import AvailabilityEditor from "@/src/components/dashboard/availability-editor";
import BillingPlans from "@/src/components/dashboard/billing-plans";
import ReviewAutomationPanel from "@/src/components/dashboard/review-automation-panel";
import {
  buildReservationConfirmationVariableValues,
  effectiveReservationConfirmationBody,
  effectiveReservationConfirmationSubject,
  sampleReservationConfirmationContext,
} from "@/src/lib/email/reservation-confirmation-template";
import {
  normalizeReservationMode,
  timeHhMmFromDb,
  type ReservationMode,
} from "@/src/lib/reservation/reservation-modes";
import {
  clampCoversCapacity,
  clampMealDurationMinutes,
  clampPartySize,
  clampSlotInterval,
  clampTimeSlotsGroups,
  isReservationCapacityConfigured,
  validateReservationSettingsInput,
} from "@/src/lib/reservation/reservation-settings";
import {
  clampTerraceCapacity,
  normalizeTerraceLabel,
} from "@/src/lib/reservation/terrace-settings";
import { ReservationSettingsPanel } from "@/src/components/dashboard/settings/reservation-settings-panel";
import GiftVoucherSettingsPanel from "@/src/components/dashboard/settings/gift-voucher-settings-panel";

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
  reservation_mode?: string | null;
  reservation_duration: number | null;
  reservation_slot_interval: number | null;
  restaurant_capacity: number | null;
  max_covers_per_slot: number | null;
  max_party_size: number | null;
  time_slots_lunch_max_groups?: number | null;
  time_slots_dinner_max_groups?: number | null;
  time_slots_max_party_size?: number | null;
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
  terrace_label?: string | null;
  auto_archive_reservations?: boolean | null;
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

export default function SettingsForm({
  restaurant,
  settings,
  confirmationMode,
  subscriptionPlan,
  subscriptionStatus,
  trialEndDate,
  isOwnerDev,
  availabilitySettings,
}: SettingsFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(() =>
    parseSettingsSection(searchParams.get("section")),
  );
  const availabilityAnchorRef = useRef<HTMLDivElement | null>(null);
  const googleReviewsAnchorRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState(restaurant.name);
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [email, setEmail] = useState(restaurant.email ?? "");
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [slug, setSlug] = useState(restaurant.slug);
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
  const [terraceCapacity, setTerraceCapacity] = useState(() =>
    clampTerraceCapacity(settings.terrace_capacity ?? 0),
  );
  const [terraceLabel, setTerraceLabel] = useState(() =>
    normalizeTerraceLabel(settings.terrace_label),
  );
  const initialTerraceCapacityRef = useRef(clampTerraceCapacity(settings.terrace_capacity ?? 0));
  const [capacityConfirmOpen, setCapacityConfirmOpen] = useState(false);
  const [pendingCapacityConfirm, setPendingCapacityConfirm] = useState<{
    bookedCovers: number;
    newCapacity: number;
  } | null>(null);
  const [daysInAdvance, setDaysInAdvance] = useState(settings.days_in_advance ?? 60);
  const [reservationMode, setReservationMode] = useState<ReservationMode>(() =>
    normalizeReservationMode(settings.reservation_mode),
  );
  const savedReservationModeRef = useRef<ReservationMode>(normalizeReservationMode(settings.reservation_mode));
  const [slotInterval, setSlotInterval] = useState(() =>
    clampSlotInterval(settings.reservation_slot_interval ?? 30),
  );
  const [timeSlotsLunchMaxGroups, setTimeSlotsLunchMaxGroups] = useState(() =>
    clampTimeSlotsGroups(settings.time_slots_lunch_max_groups ?? 5),
  );
  const [timeSlotsDinnerMaxGroups, setTimeSlotsDinnerMaxGroups] = useState(() =>
    clampTimeSlotsGroups(settings.time_slots_dinner_max_groups ?? 8),
  );
  const [timeSlotsMaxPartySize, setTimeSlotsMaxPartySize] = useState(() =>
    clampPartySize(settings.time_slots_max_party_size ?? settings.max_party_size ?? 8),
  );
  const [lunchDurationMinutes, setLunchDurationMinutes] = useState(() =>
    clampMealDurationMinutes(settings.lunch_duration_minutes ?? settings.reservation_duration ?? 90),
  );
  const [dinnerDurationMinutes, setDinnerDurationMinutes] = useState(() =>
    clampMealDurationMinutes(settings.dinner_duration_minutes ?? settings.reservation_duration ?? 120),
  );
  const [autoArchiveReservations] = useState(
    settings.auto_archive_reservations === true,
  );
  const [maxPartySize, setMaxPartySize] = useState(() => clampPartySize(settings.max_party_size ?? 8));
  const showReservationSetupBanner = useMemo(
    () =>
      !isReservationCapacityConfigured({
        reservation_mode: reservationMode,
        service_lunch_enabled: lunchServiceEnabled,
        service_dinner_enabled: dinnerServiceEnabled,
        service_lunch_max_covers: lunchMaxCovers,
        service_dinner_max_covers: dinnerMaxCovers,
        time_slots_lunch_max_groups: timeSlotsLunchMaxGroups,
        time_slots_dinner_max_groups: timeSlotsDinnerMaxGroups,
      }),
    [
      reservationMode,
      lunchServiceEnabled,
      dinnerServiceEnabled,
      lunchMaxCovers,
      dinnerMaxCovers,
      timeSlotsLunchMaxGroups,
      timeSlotsDinnerMaxGroups,
    ],
  );
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
    setActiveSection(parseSettingsSection(section));
    const anchor =
      section === "availability"
        ? availabilityAnchorRef
        : section === "google-reviews"
          ? googleReviewsAnchorRef
          : null;
    if (!anchor) return;
    const id = window.requestAnimationFrame(() => {
      anchor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // Documents (PDF) : UI retirée de la refonte, donc pas de chargement ici.


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

  async function saveSettings() {
    setIsSaving(true);

    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update({
        name: name.trim(),
        slug: slug.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
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

    const clampedLunchCovers = clampCoversCapacity(lunchMaxCovers);
    const clampedDinnerCovers = clampCoversCapacity(dinnerMaxCovers);
    const clampedLunchDuration = clampMealDurationMinutes(lunchDurationMinutes);
    const clampedDinnerDuration = clampMealDurationMinutes(dinnerDurationMinutes);
    const clampedMaxParty = clampPartySize(maxPartySize);
    const clampedSlotInterval = clampSlotInterval(slotInterval);

    const { error: settingsError } = await supabase
      .from("restaurant_settings")
      .upsert({
        restaurant_id: restaurant.id,
        reservation_mode: reservationMode,
        website_url: websiteUrl.trim() || null,
        restaurant_capacity: Math.max(clampedLunchCovers, clampedDinnerCovers),
        max_covers_per_slot: Math.max(clampedLunchCovers, clampedDinnerCovers),
        max_guests_per_slot: Math.max(clampedLunchCovers, clampedDinnerCovers),
        reservation_duration: Math.round((clampedLunchDuration + clampedDinnerDuration) / 2),
        auto_archive_reservations: autoArchiveReservations,
        lunch_duration_minutes: clampedLunchDuration,
        dinner_duration_minutes: clampedDinnerDuration,
        service_lunch_enabled: lunchServiceEnabled,
        service_lunch_start: lunchServiceStart.length === 5 ? `${lunchServiceStart}:00` : lunchServiceStart,
        service_lunch_end: lunchServiceEnd.length === 5 ? `${lunchServiceEnd}:00` : lunchServiceEnd,
        service_lunch_max_covers: clampedLunchCovers,
        service_dinner_enabled: dinnerServiceEnabled,
        service_dinner_start: dinnerServiceStart.length === 5 ? `${dinnerServiceStart}:00` : dinnerServiceStart,
        service_dinner_end: dinnerServiceEnd.length === 5 ? `${dinnerServiceEnd}:00` : dinnerServiceEnd,
        service_dinner_max_covers: clampedDinnerCovers,
        time_slots_lunch_max_groups: clampTimeSlotsGroups(timeSlotsLunchMaxGroups),
        time_slots_dinner_max_groups: clampTimeSlotsGroups(timeSlotsDinnerMaxGroups),
        time_slots_max_party_size: clampPartySize(timeSlotsMaxPartySize),
        terrace_enabled: terraceEnabled,
        terrace_capacity: clampTerraceCapacity(terraceCapacity),
        terrace_label: normalizeTerraceLabel(terraceLabel),
        days_in_advance: daysInAdvance,
        reservation_slot_interval: clampedSlotInterval,
        max_party_size: clampedMaxParty,
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
    initialTerraceCapacityRef.current = clampTerraceCapacity(terraceCapacity);
    savedReservationModeRef.current = reservationMode;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const validation = validateReservationSettingsInput({
      mode: reservationMode,
      lunchServiceEnabled,
      dinnerServiceEnabled,
      lunchMaxCovers,
      dinnerMaxCovers,
      lunchDurationMinutes,
      dinnerDurationMinutes,
      maxPartySize,
      timeSlotsLunchMaxGroups,
      timeSlotsDinnerMaxGroups,
      timeSlotsMaxPartySize,
    });
    if (!validation.ok) {
      setMessage(validation.message);
      return;
    }

    if (!validateReservationTables()) {
      return;
    }

    const newCapacity = clampTerraceCapacity(terraceCapacity);
    if (newCapacity !== initialTerraceCapacityRef.current) {
      try {
        const res = await fetch(
          `/api/restaurant-settings/terrace-capacity-check?capacity=${encodeURIComponent(String(newCapacity))}`,
        );
        const payload = (await res.json().catch(() => null)) as {
          needsConfirmation?: boolean;
          bookedCovers?: number;
          newCapacity?: number;
        } | null;
        if (res.ok && payload?.needsConfirmation) {
          setPendingCapacityConfirm({
            bookedCovers: payload.bookedCovers ?? 0,
            newCapacity: payload.newCapacity ?? newCapacity,
          });
          setCapacityConfirmOpen(true);
          return;
        }
      } catch {
        /* enregistrement direct si la vérification échoue */
      }
    }

    await saveSettings();
  }

  return (
    <>
      <form id="settings-main-form" onSubmit={handleSubmit} className="relative mx-auto max-w-5xl space-y-6 pb-28">
        <SettingsSectionTabs value={activeSection} onChange={setActiveSection} />

        {activeSection === "payments" ? (
          <div className="space-y-6">
        <SettingsCategoryCard
          icon={CreditCard}
          iconWrapClassName="bg-[#A855F7]/15 text-[#A855F7]"
          iconClassName="text-[#A855F7]"
          title="Facturation"
          subtitle="Gère ton abonnement et ton plan."
        >
          <SettingsAccordion title="Plan actuel et abonnement">
            <BillingPlans
              status={subscriptionStatus}
              plan={subscriptionPlan}
              trialEndDate={trialEndDate}
              isOwnerDev={isOwnerDev}
            />
          </SettingsAccordion>

        </SettingsCategoryCard>

            <SettingsCategoryCard
              icon={Wallet}
              iconWrapClassName="bg-zg-accent/15 text-zg-accent"
              iconClassName="text-zg-accent"
              title="Paiements bons cadeaux"
              subtitle="Encaissement des ventes de bons. Connexion réelle plus tard."
            >
              <SettingsAccordion title="Stripe" defaultOpen>
                <div className="space-y-3">
                  <p className="text-sm text-zg-text-muted">
                    Les paiements des bons digitaux passeront par Stripe. Cette section est un aperçu
                    d&apos;interface.
                  </p>
                  <div className="flex items-center justify-between rounded-xl border border-zg-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-zg-fg">Compte Stripe</p>
                      <p className="text-xs text-zg-text-muted">Non connecté — aperçu uniquement</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" disabled>
                      Connecter
                    </Button>
                  </div>
                </div>
              </SettingsAccordion>
            </SettingsCategoryCard>
          </div>
        ) : null}

        {activeSection === "establishment" ? (
          <div className="space-y-6">
        <SettingsCategoryCard
          icon={Store}
          iconWrapClassName="bg-zg-accent/15 text-zg-accent"
          iconClassName="text-zg-accent"
          title="Informations de l'établissement"
          subtitle="Identité, coordonnées et présentation."
        >
          <SettingsAccordion title="Identité">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Nom du restaurant</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="md:col-span-2 rounded-xl border border-zg-border/70 bg-zg-surface/60 p-4">
                <p className="text-sm text-zg-muted">
                  Photos, hero, sections et publication :{" "}
                  <Link href="/dashboard/public-page" className="font-semibold text-zg-accent hover:underline">
                    Gérer le showroom →
                  </Link>
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
        </SettingsCategoryCard>

        <div ref={availabilityAnchorRef} id="settings-availability">
          <SettingsCategoryCard
            icon={CalendarCheck2}
            iconWrapClassName="bg-[#3B82F6]/15 text-[#3B82F6]"
            iconClassName="text-[#3B82F6]"
            title="Disponibilités & réservations"
            subtitle="Configure tes créneaux et les règles de réservation."
          >
            <SettingsAccordion title="Réservations" defaultOpen>
              <ReservationSettingsPanel
                reservationMode={reservationMode}
                savedReservationMode={savedReservationModeRef.current}
                onReservationModeChange={setReservationMode}
                showSetupBanner={showReservationSetupBanner}
                lunchServiceEnabled={lunchServiceEnabled}
                onLunchServiceEnabledChange={setLunchServiceEnabled}
                dinnerServiceEnabled={dinnerServiceEnabled}
                onDinnerServiceEnabledChange={setDinnerServiceEnabled}
                lunchServiceStart={lunchServiceStart}
                onLunchServiceStartChange={setLunchServiceStart}
                lunchServiceEnd={lunchServiceEnd}
                onLunchServiceEndChange={setLunchServiceEnd}
                dinnerServiceStart={dinnerServiceStart}
                onDinnerServiceStartChange={setDinnerServiceStart}
                dinnerServiceEnd={dinnerServiceEnd}
                onDinnerServiceEndChange={setDinnerServiceEnd}
                slotInterval={slotInterval}
                onSlotIntervalChange={setSlotInterval}
                daysInAdvance={daysInAdvance}
                onDaysInAdvanceChange={setDaysInAdvance}
                lunchMaxCovers={lunchMaxCovers}
                onLunchMaxCoversChange={setLunchMaxCovers}
                dinnerMaxCovers={dinnerMaxCovers}
                onDinnerMaxCoversChange={setDinnerMaxCovers}
                lunchDurationMinutes={lunchDurationMinutes}
                onLunchDurationMinutesChange={setLunchDurationMinutes}
                dinnerDurationMinutes={dinnerDurationMinutes}
                onDinnerDurationMinutesChange={setDinnerDurationMinutes}
                maxPartySize={maxPartySize}
                onMaxPartySizeChange={setMaxPartySize}
                timeSlotsLunchMaxGroups={timeSlotsLunchMaxGroups}
                onTimeSlotsLunchMaxGroupsChange={setTimeSlotsLunchMaxGroups}
                timeSlotsDinnerMaxGroups={timeSlotsDinnerMaxGroups}
                onTimeSlotsDinnerMaxGroupsChange={setTimeSlotsDinnerMaxGroups}
                timeSlotsMaxPartySize={timeSlotsMaxPartySize}
                onTimeSlotsMaxPartySizeChange={setTimeSlotsMaxPartySize}
              />
            </SettingsAccordion>
            <SettingsAccordion title="Horaires d'ouverture par jour">
              <AvailabilityEditor embedded embeddedPart="hours" restaurantId={restaurant.id} settings={availabilitySettings} />
            </SettingsAccordion>
            <SettingsAccordion
              title="Terrasse"
              description={
                reservationMode === "time_slots"
                  ? "Capacité en groupes pour la terrasse. L’activation du jour se fait depuis le tableau de bord."
                  : "Capacité en couverts pour la terrasse. L’activation du jour se fait depuis le tableau de bord."
              }
            >
              <div className="space-y-5">
                <p className="text-sm leading-relaxed text-zg-muted">
                  {reservationMode === "time_slots"
                    ? "Nombre de groupes maximum en terrasse en simultané lorsque celle-ci est activée pour la journée."
                    : "Nombre de couverts en plus que vous pouvez accueillir en terrasse lorsque celle-ci est activée pour la journée."}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <ReservationField
                    label="Capacité totale"
                    description={
                      reservationMode === "time_slots"
                        ? "Nombre maximum de groupes en terrasse en simultané (par créneau)."
                        : "Nombre maximum de couverts en terrasse en simultané (tous créneaux confondus sur un même horaire)."
                    }
                  >
                    <Input
                      type="number"
                      min={0}
                      max={500}
                      value={terraceCapacity}
                      onChange={(e) => setTerraceCapacity(clampTerraceCapacity(Number(e.target.value)))}
                    />
                  </ReservationField>
                  <ReservationField
                    label="Label affiché aux clients"
                    description="Ex. Patio, Jardin, Rooftop…"
                  >
                    <Input
                      value={terraceLabel}
                      onChange={(e) => setTerraceLabel(e.target.value)}
                      placeholder="Terrasse"
                      maxLength={40}
                    />
                  </ReservationField>
                </div>
              </div>
            </SettingsAccordion>
          </SettingsCategoryCard>
        </div>
          </div>
        ) : null}

        {activeSection === "notifications" ? (
          <div className="space-y-6">
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-zg-fg">Demande d&apos;avis après utilisation d&apos;un bon</span>
                  <p className="mt-1 text-xs text-zg-text-muted">
                    Configure le message et le délai dans la section « Avis Google » ci-dessous.
                  </p>
                </div>
              </div>
            </div>
          </SettingsAccordion>
        </SettingsCategoryCard>

        <div ref={googleReviewsAnchorRef} id="settings-google-reviews">
        <SettingsCategoryCard
          icon={Star}
          iconWrapClassName="bg-zg-warning-soft-bg text-zg-warning"
          iconClassName="text-zg-warning"
          title="Avis Google"
          subtitle="Configure l'automatisation des demandes d'avis Google envoyées après l'utilisation d'un bon."
        >
          {reviewAutomationLoading || !reviewAutomation ? (
            <div className="rounded-2xl border border-dashed border-zg-border bg-zg-surface-soft/60 py-10 text-center text-sm text-zg-muted">
              Chargement des réglages…
            </div>
          ) : (
            <ReviewAutomationPanel
              layout="settings"
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
              initialSettings={{
                ...reviewAutomation,
                channel: "email",
              }}
              initialFeedback={[]}
            />
          )}
        </SettingsCategoryCard>
        </div>
          </div>
        ) : null}

        {activeSection === "establishment" ? (
        <SettingsCategoryCard
          icon={UserRound}
          iconWrapClassName="bg-[#22C55E]/15 text-[#22C55E]"
          iconClassName="text-[#22C55E]"
          title="Compte"
          subtitle="Tes infos personnelles et préférences."
        >
          <SettingsAccordion title="Profil">
            <div className="space-y-4">
              <div>
                <label className="dashboard-field-label">E-mail de connexion</label>
                <Input readOnly value={authEmail ?? ""} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/pro/login");
                  }}
                >
                  Se déconnecter
                </Button>
              </div>
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Préférences" defaultOpen>
            <div className="space-y-6">
              <div>
                <label className="dashboard-field-label">Langue</label>
                <Input readOnly value="Français" className="mt-2 max-w-sm" />
              </div>
            </div>
          </SettingsAccordion>
          <SettingsAccordion title="Apparence" defaultOpen>
            <DashboardThemeToggle />
          </SettingsAccordion>
          <SettingsAccordion title="Zone de danger" danger>
            <p className="text-sm text-zg-muted">
              La suppression est définitive : réservations, showroom et données associées seront perdues.
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
        ) : null}

        {activeSection === "gift-cards" ? (
          <SettingsCategoryCard
            icon={Gift}
            iconWrapClassName="bg-zg-accent/15 text-zg-accent"
            iconClassName="text-zg-accent"
            title="Bons cadeaux"
            subtitle="Personnalisation du PDF imprimable et d’Apple Wallet."
          >
            <GiftVoucherSettingsPanel
              restaurantId={restaurant.id}
              displayName={restaurant.public_display_name?.trim() || name || "Établissement"}
              logoUrl={logoUrl}
              pageCoverUrl={coverImageUrl}
              accentColor={accentColor}
              phone={phone}
              email={email}
              address={address}
            />
            <SettingsAccordion title="Valeurs par défaut">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Validité par défaut</label>
                  <Input readOnly value="12 mois" className="mt-1.5" />
                </div>
                <div>
                  <label className="dashboard-field-label">Montants suggérés</label>
                  <Input readOnly value="50 / 100 / 150 CHF" className="mt-1.5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-zg-text-muted">
                Ces réglages seront branchés plus tard. Pour l&apos;instant, il s&apos;agit d&apos;un aperçu.
              </p>
            </SettingsAccordion>
          </SettingsCategoryCard>
        ) : null}

        {activeSection === "sales-channels" ? (
          <SettingsCategoryCard
            icon={Globe}
            iconWrapClassName="bg-[#3B82F6]/15 text-[#3B82F6]"
            iconClassName="text-[#3B82F6]"
            title="Canaux de vente"
            subtitle="Où vos clients peuvent acheter un bon."
          >
            <SettingsAccordion title="Canaux" defaultOpen>
              <ul className="space-y-3 text-sm text-zg-fg">
                <li className="rounded-xl border border-zg-border px-4 py-3">
                  <p className="font-medium">Lien de paiement public</p>
                  <p className="mt-0.5 text-zg-text-muted">Page dédiée à l&apos;achat de bons — bientôt.</p>
                </li>
                <li className="rounded-xl border border-zg-border px-4 py-3">
                  <p className="font-medium">Widget site</p>
                  <p className="mt-0.5 text-zg-text-muted">Bouton ou encart à intégrer sur votre site.</p>
                </li>
                <li className="rounded-xl border border-zg-border px-4 py-3">
                  <p className="font-medium">Vente sur place</p>
                  <p className="mt-0.5 text-zg-text-muted">Création de bons papier depuis le dashboard.</p>
                </li>
              </ul>
            </SettingsAccordion>
          </SettingsCategoryCard>
        ) : null}

        {activeSection === "site-integration" ? (
          <SettingsCategoryCard
            icon={Globe}
            iconWrapClassName="bg-zg-premium-soft-bg text-zg-premium"
            iconClassName="text-zg-premium"
            title="Intégration site"
            subtitle="Ajoutez la vente de bons sur votre site ou votre page ZenGrow."
          >
            <SettingsAccordion title="Page publique" defaultOpen>
              <p className="text-sm text-zg-text-muted">
                Photos, hero, sections et publication :{" "}
                <Link href="/dashboard/public-page" className="font-semibold text-zg-accent hover:underline">
                  Gérer le showroom →
                </Link>
              </p>
              <div className="mt-4 rounded-xl border border-dashed border-zg-border bg-zg-surface-elevated/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">
                  Extrait d&apos;intégration
                </p>
                <p className="mt-2 font-mono text-xs text-zg-text-muted">
                  {`<script src="https://zengrow.app/widget.js" data-slug="${slug}"></script>`}
                </p>
                <p className="mt-2 text-xs text-zg-text-muted">Aperçu uniquement — le widget n&apos;est pas encore actif.</p>
              </div>
            </SettingsAccordion>
          </SettingsCategoryCard>
        ) : null}
      </form>

      {(activeSection === "establishment" || activeSection === "notifications") ? (
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
      ) : null}

      {capacityConfirmOpen && pendingCapacityConfirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => !isSaving && setCapacityConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-zg-border bg-zg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-semibold text-zg-fg">Capacité terrasse réduite</p>
            <p className="mt-2 text-sm leading-relaxed text-zg-muted">
              Vous avez <strong className="text-zg-fg">{pendingCapacityConfirm.bookedCovers} couverts</strong>{" "}
              réservés en terrasse aujourd&apos;hui, mais la nouvelle capacité est de{" "}
              <strong className="text-zg-fg">{pendingCapacityConfirm.newCapacity}</strong>. Les réservations
              existantes seront conservées ; seules les nouvelles réservations seront limitées.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                disabled={isSaving}
                onClick={() => setCapacityConfirmOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="min-h-11"
                disabled={isSaving}
                onClick={async () => {
                  setCapacityConfirmOpen(false);
                  await saveSettings();
                }}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      ) : null}

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
