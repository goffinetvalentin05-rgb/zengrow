"use client";

import { ChangeEvent, DragEvent, FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { cn } from "@/src/lib/utils";
import PublicPageLivePreview, { type PublicPagePreviewDraft } from "@/src/components/dashboard/public-page-live-preview";
import { PUBLIC_PAGE_FONT_OPTIONS } from "@/src/lib/public-page-fonts";
import {
  DEFAULT_RESERVATION_CONFIRMATION_EMAIL_BODY,
  DEFAULT_RESERVATION_CONFIRMATION_EMAIL_SUBJECT,
  RESERVATION_CONFIRMATION_EMAIL_VARIABLES,
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

const STORAGE_BUCKETS = ["restaurants", "restaurant-assets"] as const;

function storageRefFromPublicUrl(url: string): { bucket: string; path: string } | null {
  try {
    const u = new URL(url);
    for (const bucket of STORAGE_BUCKETS) {
      const marker = `/storage/v1/object/public/${bucket}/`;
      const parts = u.pathname.split(marker);
      if (parts.length >= 2) {
        return { bucket, path: decodeURIComponent(parts[1]) };
      }
    }
    return null;
  } catch {
    return null;
  }
}

type RestaurantDocument = {
  id: string;
  restaurant_id: string;
  label: string;
  file_url: string;
  position: number;
  created_at: string;
};

type SettingsFormProps = {
  restaurant: RestaurantData;
  settings: SettingsData;
  confirmationMode: "manual" | "automatic";
  publicLink: string;
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
      <p className="text-sm leading-relaxed text-zg-fg/52">{description}</p>
      <div>{children}</div>
    </div>
  );
}

function AccordionCard({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group">
      <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-zg-card">
        <summary className="cursor-pointer list-none focus-visible:outline-none">
          <div className="flex items-start justify-between gap-4 px-5 py-5 md:px-7 md:py-6">
            <div className="min-w-0">
              <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
            <ChevronDown
              className="mt-1 h-5 w-5 shrink-0 text-zg-fg/55 transition-transform duration-200 group-open:rotate-180"
              aria-hidden
            />
          </div>
        </summary>
        <div className="border-t border-zg-border/80 px-5 py-5 md:px-7 md:py-6">{children}</div>
      </Card>
    </details>
  );
}

export default function SettingsForm({
  restaurant,
  settings,
  confirmationMode,
  publicLink,
}: SettingsFormProps) {
  const supabase = createClient();
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
  const [terraceEnabled, setTerraceEnabled] = useState(settings.terrace_enabled ?? false);
  const [terraceCapacity, setTerraceCapacity] = useState(
    Math.max(0, Math.min(500, settings.terrace_capacity ?? 0)),
  );
  const [daysInAdvance, setDaysInAdvance] = useState(settings.days_in_advance ?? 60);
  const [floorPlanLunchDuration, setFloorPlanLunchDuration] = useState(
    settings.lunch_duration_minutes ?? settings.floor_plan_lunch_duration ?? settings.reservation_duration ?? 90,
  );
  const [floorPlanDinnerDuration, setFloorPlanDinnerDuration] = useState(
    settings.dinner_duration_minutes ?? settings.floor_plan_dinner_duration ?? settings.reservation_duration ?? 90,
  );
  const [autoArchiveReservations, setAutoArchiveReservations] = useState(
    settings.auto_archive_reservations === true,
  );
  const [maxPartySize, setMaxPartySize] = useState(settings.max_party_size ?? 8);
  const [pageBackgroundColor, setPageBackgroundColor] = useState(
    restaurant.page_background_color ?? "#f8fafc",
  );
  const [heroPrimaryColor, setHeroPrimaryColor] = useState(
    restaurant.hero_primary_color ?? restaurant.primary_color ?? "#12151c",
  );
  const [buttonColor, setButtonColor] = useState(
    restaurant.public_button_bg_color ?? settings.button_color ?? "#1F7A6C",
  );
  const [buttonTextColor, setButtonTextColor] = useState(restaurant.public_button_text_color ?? "#ffffff");
  const [headingTextColor, setHeadingTextColor] = useState(restaurant.public_heading_text_color ?? "#0f172a");
  const [bodyTextColor, setBodyTextColor] = useState(
    restaurant.public_body_text_color ?? settings.text_color ?? "#334155",
  );
  const [accentColor, setAccentColor] = useState(
    restaurant.public_accent_color ?? settings.accent_color ?? "#1F7A6C",
  );
  const [footerBgColor, setFooterBgColor] = useState(restaurant.public_footer_bg_color ?? "#0f172a");
  const [footerTextColor, setFooterTextColor] = useState(restaurant.public_footer_text_color ?? "#e2e8f0");
  const [headingFont, setHeadingFont] = useState(
    restaurant.public_heading_font ?? settings.heading_font ?? "Playfair Display",
  );
  const [bodyFont, setBodyFont] = useState(restaurant.public_body_font ?? settings.body_font ?? "Inter");
  const [heroTitleSizePx, setHeroTitleSizePx] = useState(restaurant.public_hero_title_size_px ?? 48);
  const [publicDisplayName, setPublicDisplayName] = useState(
    restaurant.public_display_name?.trim() || restaurant.name,
  );
  const [publicTagline, setPublicTagline] = useState(restaurant.public_tagline ?? "");
  const [ctaLabel, setCtaLabel] = useState(restaurant.public_cta_label?.trim() || "Réserver une table");
  const [heroHeight, setHeroHeight] = useState<"compact" | "normal" | "tall">(
    (restaurant.public_hero_height as "compact" | "normal" | "tall") || "normal",
  );
  const [heroOverlayEnabled, setHeroOverlayEnabled] = useState(
    restaurant.public_hero_overlay_enabled !== false,
  );
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState(restaurant.public_hero_overlay_opacity ?? 40);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(restaurant.google_maps_url ?? "");
  const [showPublicInstagram, setShowPublicInstagram] = useState(restaurant.show_public_instagram !== false);
  const [showPublicFacebook, setShowPublicFacebook] = useState(restaurant.show_public_facebook !== false);
  const [showPublicGoogleMaps, setShowPublicGoogleMaps] = useState(restaurant.show_public_google_maps !== false);
  const [fontSizeScale, setFontSizeScale] = useState<"small" | "medium" | "large">(
    (settings.font_size_scale as "small" | "medium" | "large") ?? "medium",
  );
  const [borderRadius, setBorderRadius] = useState<"sharp" | "rounded" | "pill">(
    (settings.border_radius as "sharp" | "rounded" | "pill") ?? "rounded",
  );
  const [buttonStyle, setButtonStyle] = useState<"filled" | "outlined" | "ghost">(
    (settings.button_style as "filled" | "outlined" | "ghost") ?? "filled",
  );
  const [cardStyle, setCardStyle] = useState<"flat" | "elevated" | "bordered">(
    (settings.card_style as "flat" | "elevated" | "bordered") ?? "elevated",
  );
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? restaurant.logo_url ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(settings.cover_image_url ?? restaurant.banner_url ?? "");
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url ?? "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebook_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(settings.website_url ?? "");
  const [preBookingMessage, setPreBookingMessage] = useState(settings.pre_booking_message ?? "");
  const [closureStartDate, setClosureStartDate] = useState(settings.closure_start_date ?? "");
  const [closureEndDate, setClosureEndDate] = useState(settings.closure_end_date ?? "");
  const [closureMessage, setClosureMessage] = useState(settings.closure_message ?? "");
  const [reservationConfirmationMode, setReservationConfirmationMode] = useState<"manual" | "automatic">(
    confirmationMode,
  );
  const [reservationConfirmationEmailSubject, setReservationConfirmationEmailSubject] = useState(
    restaurant.reservation_confirmation_email_subject?.trim() ?? "",
  );
  const [reservationConfirmationEmailBody, setReservationConfirmationEmailBody] = useState(
    restaurant.reservation_confirmation_email_body?.trim() ?? "",
  );
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(settings.gallery_image_urls ?? []);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [publicPageDescription, setPublicPageDescription] = useState(
    restaurant.public_description?.trim() || settings.public_page_description || "",
  );
  const [showPublicAddress, setShowPublicAddress] = useState(settings.public_page_show_address ?? true);
  const [showPublicPhone, setShowPublicPhone] = useState(settings.public_page_show_phone ?? true);
  const [showPublicEmail, setShowPublicEmail] = useState(settings.public_page_show_email ?? true);
  const [showPublicWebsite, setShowPublicWebsite] = useState(settings.public_page_show_website ?? true);
  const [showPublicOpeningHours, setShowPublicOpeningHours] = useState(settings.public_page_show_opening_hours ?? true);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveButtonSuccess, setSaveButtonSuccess] = useState(false);

  const [documents, setDocuments] = useState<RestaurantDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [newDocLabel, setNewDocLabel] = useState("");
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [draggingDocId, setDraggingDocId] = useState<string | null>(null);

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
      const [{ data: tablesData, error: tablesError }, { data: zonesData, error: zonesError }] = await Promise.all([
        supabase
          .from("restaurant_tables")
          .select("id, status, max_covers")
          .eq("restaurant_id", restaurant.id),
        supabase
          .from("restaurant_zones")
          .select("id, is_active")
          .eq("restaurant_id", restaurant.id),
      ]);

      if (cancelled) return;
      if (tablesError || zonesError) {
        setFloorPlanSummary(null);
        return;
      }

      const activeTables = (tablesData ?? []).filter((t) => t.status === "active");
      const blockedTables = (tablesData ?? []).filter((t) => t.status === "blocked");
      const inactiveTables = (tablesData ?? []).filter((t) => t.status === "inactive");
      const maxCovers = activeTables.reduce((sum, t) => sum + Math.max(0, t.max_covers ?? 0), 0);
      const activeZones = (zonesData ?? []).filter((z) => z.is_active === true).length;

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

  const sortedDocuments = useMemo(() => {
    const copy = [...documents];
    copy.sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.created_at.localeCompare(b.created_at));
    return copy;
  }, [documents]);

  useEffect(() => {
    let cancelled = false;
    setDocumentsLoading(true);
    setDocumentsError(null);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("restaurant_documents")
          .select("id, restaurant_id, label, file_url, position, created_at")
          .eq("restaurant_id", restaurant.id)
          .order("position", { ascending: true });
        if (cancelled) return;
        if (error) {
          setDocumentsError(error.message);
          setDocuments([]);
          return;
        }
        setDocuments((data ?? []) as RestaurantDocument[]);
      } finally {
        if (!cancelled) setDocumentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurant.id, supabase]);

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
      documents: sortedDocuments.map((d) => ({
        id: d.id,
        label: d.label,
        fileUrl: d.file_url,
        position: d.position ?? 0,
      })),
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
      sortedDocuments,
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

  const confirmationEmailPreviewSubject = useMemo(
    () =>
      effectiveReservationConfirmationSubject(
        reservationConfirmationEmailSubject || null,
        confirmationEmailPreviewValues,
      ),
    [reservationConfirmationEmailSubject, confirmationEmailPreviewValues],
  );

  const confirmationEmailPreviewBody = useMemo(
    () =>
      effectiveReservationConfirmationBody(
        reservationConfirmationEmailBody || null,
        confirmationEmailPreviewValues,
      ),
    [reservationConfirmationEmailBody, confirmationEmailPreviewValues],
  );

  async function copyReservationEmailVariable(token: string) {
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      /* navigateur ou contexte non sécurisé */
    }
  }

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

  async function uploadGalleryPhoto(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${restaurant.id}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error } = await supabase.storage.from("restaurants").upload(filePath, file, {
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from("restaurants").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function uploadRestaurantDocumentPdf(file: File) {
    const filePath = `${restaurant.id}/documents/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
    const { error } = await supabase.storage.from("restaurants").upload(filePath, file, {
      upsert: false,
      contentType: "application/pdf",
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("restaurants").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (galleryUrls.length >= 6) {
      setMessage("Maximum 6 photos pour la galerie.");
      event.target.value = "";
      return;
    }
    setMessage(null);
    setIsUploadingGallery(true);
    try {
      const publicUrl = await uploadGalleryPhoto(file);
      setGalleryUrls((prev) => [...prev, publicUrl]);
      setMessage("Photo ajoutée à la galerie.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible d’ajouter la photo.");
    } finally {
      setIsUploadingGallery(false);
      event.target.value = "";
    }
  }

  async function removeGalleryPhoto(url: string) {
    const ref = storageRefFromPublicUrl(url);
    if (ref) {
      await supabase.storage.from(ref.bucket).remove([ref.path]);
    }
    setGalleryUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleDocumentUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const label = newDocLabel.trim().slice(0, 60);
    if (!label) {
      setMessage("Ajoutez un libellé avant d’envoyer le PDF.");
      event.target.value = "";
      return;
    }
    if (file.type !== "application/pdf") {
      setMessage("Veuillez choisir un fichier PDF.");
      event.target.value = "";
      return;
    }
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessage("Fichier trop volumineux (max 10MB).");
      event.target.value = "";
      return;
    }
    setMessage(null);
    setIsUploadingDocument(true);
    try {
      const publicUrl = await uploadRestaurantDocumentPdf(file);
      const nextPosition =
        sortedDocuments.length > 0 ? Math.max(...sortedDocuments.map((d) => d.position ?? 0)) + 1 : 0;
      const { data, error } = await supabase
        .from("restaurant_documents")
        .insert({
          restaurant_id: restaurant.id,
          label,
          file_url: publicUrl,
          position: nextPosition,
        })
        .select("id, restaurant_id, label, file_url, position, created_at")
        .single();
      if (error) throw new Error(error.message);
      if (data) {
        setDocuments((prev) => [...prev, data as RestaurantDocument]);
      }
      setNewDocLabel("");
      setMessage("Document ajouté.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible d’ajouter le document.");
    } finally {
      setIsUploadingDocument(false);
      event.target.value = "";
    }
  }

  async function deleteDocument(doc: RestaurantDocument) {
    setMessage(null);
    const ref = storageRefFromPublicUrl(doc.file_url);
    if (ref) {
      await supabase.storage.from(ref.bucket).remove([ref.path]);
    }
    const { error } = await supabase.from("restaurant_documents").delete().eq("id", doc.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    setMessage("Document supprimé.");
  }

  function reorderDocuments(dragId: string, overId: string) {
    if (dragId === overId) return;
    const list = sortedDocuments;
    const fromIndex = list.findIndex((d) => d.id === dragId);
    const toIndex = list.findIndex((d) => d.id === overId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDocuments(
      next.map((d, idx) => ({
        ...d,
        position: idx,
      })),
    );
  }

  async function persistDocumentPositions() {
    const next = [...sortedDocuments].map((d, idx) => ({ ...d, position: idx }));
    setDocuments(next);
    const updates = next.map((d) => supabase.from("restaurant_documents").update({ position: d.position }).eq("id", d.id));
    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) {
      setMessage(firstError.message);
      return;
    }
    setMessage("Ordre mis à jour.");
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

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setIsUploadingCover(true);
    try {
      const publicUrl = await uploadAsset(file, "cover");
      setCoverImageUrl(publicUrl);
      setMessage("Photo de couverture chargée.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible de charger la couverture.");
    } finally {
      setIsUploadingCover(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <AccordionCard
        title="Informations du restaurant"
        description="Nom, coordonnées et informations internes."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="dashboard-field-label">Nom du restaurant</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div>
            <label className="dashboard-field-label">Email</label>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="dashboard-field-label">Description interne (optionnel)</label>
            <p className="mb-1 text-xs text-[var(--muted-foreground)]">
              Notes internes ou texte brut non affiché sur la page publique (la description visible par les clients se règle dans Page publique).
            </p>
            <Textarea className="min-h-20" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
        </div>
      </AccordionCard>

      <AccordionCard
        title="Abonnement"
        description="Plan actuel, statut et gestion Stripe."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/billing"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-zg-teal to-zg-mint px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_rgba(31,122,108,0.82)] transition hover:scale-[1.02] active:scale-[0.99]"
          >
            Gérer mon abonnement
          </Link>
          <p className="text-sm text-zg-fg/55">Changement de plan, paiements et accès Pro.</p>
        </div>
      </AccordionCard>

      <AccordionCard
        title="Page publique"
        description="Lien public, contenu et design affichés aux clients."
      >
        <div className="space-y-6">
          <p className="text-sm text-[var(--muted-foreground)]">
            Bucket Supabase : <span className="font-mono text-xs">restaurants</span> pour les fichiers. Enregistrez tout en bas de la page.
          </p>

          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,440px)] lg:items-start lg:gap-8">
            <div className="order-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--foreground)]">Personnalisation</p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setPageBackgroundColor("#f8fafc");
                    setHeroPrimaryColor("#12151c");
                    setButtonColor("#1F7A6C");
                    setButtonTextColor("#ffffff");
                    setHeadingTextColor("#0f172a");
                    setBodyTextColor("#334155");
                    setAccentColor("#1F7A6C");
                    setFooterBgColor("#0f172a");
                    setFooterTextColor("#e2e8f0");
                    setHeadingFont("Playfair Display");
                    setBodyFont("Inter");
                    setHeroTitleSizePx(48);
                    setPublicDisplayName(name);
                    setPublicTagline("");
                    setCtaLabel("Réserver une table");
                    setHeroHeight("normal");
                    setHeroOverlayEnabled(true);
                    setHeroOverlayOpacity(40);
                    setFontSizeScale("medium");
                    setBorderRadius("rounded");
                    setButtonStyle("filled");
                    setCardStyle("elevated");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>

              <details open className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/55 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Couleurs</summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="dashboard-field-label">Fond de la page publique</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={pageBackgroundColor} onChange={(event) => setPageBackgroundColor(event.target.value)} />
                      <Input value={pageBackgroundColor} onChange={(event) => setPageBackgroundColor(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Couleur principale (hero / en-tête)</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={heroPrimaryColor} onChange={(event) => setHeroPrimaryColor(event.target.value)} />
                      <Input value={heroPrimaryColor} onChange={(event) => setHeroPrimaryColor(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Couleur du bouton de réservation</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={buttonColor} onChange={(event) => setButtonColor(event.target.value)} />
                      <Input value={buttonColor} onChange={(event) => setButtonColor(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Texte du bouton de réservation</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={buttonTextColor} onChange={(event) => setButtonTextColor(event.target.value)} />
                      <Input value={buttonTextColor} onChange={(event) => setButtonTextColor(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Couleur des titres (h1, h2)</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={headingTextColor} onChange={(event) => setHeadingTextColor(event.target.value)} />
                      <Input value={headingTextColor} onChange={(event) => setHeadingTextColor(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Texte courant (paragraphes)</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={bodyTextColor} onChange={(event) => setBodyTextColor(event.target.value)} />
                      <Input value={bodyTextColor} onChange={(event) => setBodyTextColor(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Liens / accents</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} />
                      <Input value={accentColor} onChange={(event) => setAccentColor(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Fond du pied de page</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={footerBgColor} onChange={(event) => setFooterBgColor(event.target.value)} />
                      <Input value={footerBgColor} onChange={(event) => setFooterBgColor(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Texte du pied de page</label>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-10 w-16 p-1" value={footerTextColor} onChange={(event) => setFooterTextColor(event.target.value)} />
                      <Input value={footerTextColor} onChange={(event) => setFooterTextColor(event.target.value)} />
                    </div>
                  </div>
                </div>
              </details>

              <details open className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/55 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Typographie</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label">Police des titres</label>
                    <select
                      className="h-10 w-full rounded-md border border-zg-border-strong bg-zg-surface/98 px-3 text-sm text-zg-fg"
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
                    <label className="dashboard-field-label">Police du corps</label>
                    <select
                      className="h-10 w-full rounded-md border border-zg-border-strong bg-zg-surface/98 px-3 text-sm text-zg-fg"
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
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label">Taille du titre principal ({heroTitleSizePx}px)</label>
                    <input
                      type="range"
                      min={32}
                      max={72}
                      value={heroTitleSizePx}
                      onChange={(e) => setHeroTitleSizePx(Number(e.target.value))}
                      className="mt-2 w-full"
                    />
                    <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
                      <span>32px</span>
                      <span>72px</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label">Échelle du corps de page</label>
                    <select
                      className="h-10 w-full rounded-md border border-zg-border-strong bg-zg-surface/98 px-3 text-sm text-zg-fg"
                      value={fontSizeScale}
                      onChange={(event) => setFontSizeScale(event.target.value as "small" | "medium" | "large")}
                    >
                      <option value="small">Petit</option>
                      <option value="medium">Moyen</option>
                      <option value="large">Grand</option>
                    </select>
                  </div>
                </div>
              </details>

              <details open className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/55 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Hero / en-tête</summary>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="dashboard-field-label">Logo (fichier)</label>
                      <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                      {isUploadingLogo ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">Envoi...</p> : null}
                    </div>
                    <div>
                      <label className="dashboard-field-label">Photo de couverture (fichier)</label>
                      <Input type="file" accept="image/*" onChange={handleCoverUpload} />
                      {isUploadingCover ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">Envoi...</p> : null}
                    </div>
                  </div>
                  <div>
                    <label className="dashboard-field-label">URL du logo</label>
                    <Input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="dashboard-field-label">URL de la photo de couverture</label>
                    <Input value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="dashboard-field-label">Nom affiché sur la page publique</label>
                    <Input value={publicDisplayName} onChange={(event) => setPublicDisplayName(event.target.value)} />
                  </div>
                  <div>
                    <label className="dashboard-field-label">Slogan / sous-titre (max 100 caractères)</label>
                    <Input value={publicTagline} maxLength={100} onChange={(event) => setPublicTagline(event.target.value)} />
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{publicTagline.length}/100</p>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Description (page publique, max 500 caractères)</label>
                    <Textarea
                      className="min-h-28"
                      value={publicPageDescription}
                      maxLength={500}
                      onChange={(event) => setPublicPageDescription(event.target.value)}
                    />
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{publicPageDescription.length}/500</p>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Texte du bouton de réservation (hero)</label>
                    <Input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} maxLength={80} />
                  </div>
                  <div>
                    <label className="dashboard-field-label">Hauteur du hero</label>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="radio" name="hero-height" checked={heroHeight === "compact"} onChange={() => setHeroHeight("compact")} />
                        Compact
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="radio" name="hero-height" checked={heroHeight === "normal"} onChange={() => setHeroHeight("normal")} />
                        Normal
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="radio" name="hero-height" checked={heroHeight === "tall"} onChange={() => setHeroHeight("tall")} />
                        Grand
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Toggle checked={heroOverlayEnabled} onChange={setHeroOverlayEnabled} label="Assombrir la photo (overlay)" />
                    {heroOverlayEnabled ? (
                      <div className="flex flex-1 flex-col gap-1 sm:max-w-xs">
                        <label className="text-xs text-[var(--muted-foreground)]">Opacité overlay ({heroOverlayOpacity}%)</label>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          value={heroOverlayOpacity}
                          onChange={(e) => setHeroOverlayOpacity(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </details>

              <details open className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/55 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Style</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label">Rayon des bordures</label>
                    <select
                      className="h-10 w-full rounded-md border border-zg-border-strong bg-zg-surface/98 px-3 text-sm text-zg-fg"
                      value={borderRadius}
                      onChange={(event) => setBorderRadius(event.target.value as "sharp" | "rounded" | "pill")}
                    >
                      <option value="sharp">Sharp (0px)</option>
                      <option value="rounded">Rounded (8px)</option>
                      <option value="pill">Pill (999px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="dashboard-field-label">Style des boutons</label>
                    <select
                      className="h-10 w-full rounded-md border border-zg-border-strong bg-zg-surface/98 px-3 text-sm text-zg-fg"
                      value={buttonStyle}
                      onChange={(event) => setButtonStyle(event.target.value as "filled" | "outlined" | "ghost")}
                    >
                      <option value="filled">Filled</option>
                      <option value="outlined">Outlined</option>
                      <option value="ghost">Ghost</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label">Style des cartes</label>
                    <select
                      className="h-10 w-full rounded-md border border-zg-border-strong bg-zg-surface/98 px-3 text-sm text-zg-fg"
                      value={cardStyle}
                      onChange={(event) => setCardStyle(event.target.value as "flat" | "elevated" | "bordered")}
                    >
                      <option value="flat">Flat</option>
                      <option value="elevated">Elevated (shadow)</option>
                      <option value="bordered">Bordered</option>
                    </select>
                  </div>
                </div>
              </details>
            </div>

            <div className="order-2 lg:sticky lg:top-4 lg:self-start">
              <PublicPageLivePreview draft={previewDraft} publicPath={publicLink} />
            </div>
          </div>

          <details open className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/55 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Informations de contact</summary>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Ces champs alimentent le pied de page public. Cochez ce qui doit être visible.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Téléphone</label>
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPublicPhone}
                    onChange={(event) => setShowPublicPhone(event.target.checked)}
                    className="h-4 w-4 rounded border-zg-border-strong/75"
                  />
                  Afficher sur la page publique
                </label>
              </div>
              <div>
                <label className="dashboard-field-label">Site web</label>
                <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://..." />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPublicWebsite}
                    onChange={(event) => setShowPublicWebsite(event.target.checked)}
                    className="h-4 w-4 rounded border-zg-border-strong/75"
                  />
                  Afficher sur la page publique
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Adresse</label>
                <Input value={address} onChange={(event) => setAddress(event.target.value)} />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPublicAddress}
                    onChange={(event) => setShowPublicAddress(event.target.checked)}
                    className="h-4 w-4 rounded border-zg-border-strong/75"
                  />
                  Afficher sur la page publique
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">E-mail de contact</label>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPublicEmail}
                    onChange={(event) => setShowPublicEmail(event.target.checked)}
                    className="h-4 w-4 rounded border-zg-border-strong/75"
                  />
                  Afficher sur la page publique
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPublicOpeningHours}
                    onChange={(event) => setShowPublicOpeningHours(event.target.checked)}
                    className="h-4 w-4 rounded border-zg-border-strong/75"
                  />
                  Afficher les horaires d’ouverture dans le pied de page
                </label>
              </div>
            </div>
          </details>

          <details open className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/55 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Réseaux sociaux</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="dashboard-field-label">Instagram (URL)</label>
                <Input value={instagramUrl} onChange={(event) => setInstagramUrl(event.target.value)} placeholder="https://instagram.com/..." />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPublicInstagram}
                    onChange={(event) => setShowPublicInstagram(event.target.checked)}
                    className="h-4 w-4 rounded border-zg-border-strong/75"
                  />
                  Afficher l’icône Instagram
                </label>
              </div>
              <div>
                <label className="dashboard-field-label">Facebook (URL)</label>
                <Input value={facebookUrl} onChange={(event) => setFacebookUrl(event.target.value)} placeholder="https://facebook.com/..." />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPublicFacebook}
                    onChange={(event) => setShowPublicFacebook(event.target.checked)}
                    className="h-4 w-4 rounded border-zg-border-strong/75"
                  />
                  Afficher l’icône Facebook
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Google Maps (URL)</label>
                <Input value={googleMapsUrl} onChange={(event) => setGoogleMapsUrl(event.target.value)} placeholder="https://maps.google.com/..." />
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPublicGoogleMaps}
                    onChange={(event) => setShowPublicGoogleMaps(event.target.checked)}
                    className="h-4 w-4 rounded border-zg-border-strong/75"
                  />
                  Afficher le lien Google Maps dans le pied de page
                </label>
              </div>
            </div>
          </details>

          <details open className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/55 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Cartes & menus (PDF)</summary>
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--muted-foreground)]">Ajoutez autant de PDF que nécessaire, avec un libellé affiché sur la page publique.</p>
                <Button type="button" variant="secondary" onClick={() => void persistDocumentPositions()} disabled={documentsLoading || sortedDocuments.length < 2}>
                  Enregistrer l’ordre
                </Button>
              </div>
              {documentsError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800" role="alert">
                  {documentsError}
                </p>
              ) : null}
              <div className="grid gap-3 rounded-xl border border-zg-border-strong bg-zg-surface/95 p-4">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <label className="dashboard-field-label">Libellé du bouton</label>
                    <Input
                      value={newDocLabel}
                      onChange={(e) => setNewDocLabel(e.target.value)}
                      placeholder='Ex. : « Menu », « Carte des vins »'
                      maxLength={60}
                      disabled={isUploadingDocument}
                    />
                  </div>
                  <div>
                    <label className="dashboard-field-label">Fichier PDF (max 10 Mo)</label>
                    <Input type="file" accept="application/pdf" onChange={handleDocumentUpload} disabled={isUploadingDocument} />
                  </div>
                </div>
                {isUploadingDocument ? <p className="text-xs text-[var(--muted-foreground)]">Envoi du PDF...</p> : null}
              </div>
              {documentsLoading ? (
                <p className="text-sm text-[var(--muted-foreground)]">Chargement des documents…</p>
              ) : sortedDocuments.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">Aucun document. Utilisez « Ajouter » via le fichier ci-dessus.</p>
              ) : (
                <ul className="space-y-2">
                  {sortedDocuments.map((doc) => (
                    <li
                      key={doc.id}
                      draggable
                      onDragStart={() => setDraggingDocId(doc.id)}
                      onDragEnd={() => setDraggingDocId(null)}
                      onDragOver={(e: DragEvent<HTMLLIElement>) => e.preventDefault()}
                      onDrop={() => {
                        if (!draggingDocId) return;
                        reorderDocuments(draggingDocId, doc.id);
                        setDraggingDocId(null);
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-zg-border-strong bg-zg-surface/95 p-3",
                        draggingDocId === doc.id && "opacity-60",
                      )}
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zg-border-strong text-zg-fg/52">
                        <GripVertical className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{doc.label}</p>
                        <p className="truncate text-xs text-[var(--muted-foreground)]">{doc.file_url}</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zg-border-strong text-zg-fg/62 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                        aria-label="Supprimer ce document"
                        onClick={() => void deleteDocument(doc)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>

          <details open className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/55 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Galerie photos</summary>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-[var(--muted-foreground)]">Jusqu’à 6 images, affichées sous le formulaire de réservation.</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={galleryUrls.length >= 6 || isUploadingGallery}
              />
              {isUploadingGallery ? <p className="text-xs text-[var(--muted-foreground)]">Envoi...</p> : null}
              {galleryUrls.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {galleryUrls.map((url) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-zg-border-strong">
                      <Image src={url} alt="" fill className="object-cover" unoptimized sizes="(max-width: 640px) 50vw, 33vw" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => void removeGalleryPhoto(url)}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </details>

          <div>
            <label className="dashboard-field-label">
              Message avant réservation
            </label>
            <Textarea
              className="min-h-20"
              value={preBookingMessage}
              onChange={(event) => setPreBookingMessage(event.target.value)}
              placeholder="Ex : Pour les groupes de plus de 8 personnes, merci de nous contacter par téléphone."
            />
          </div>
        </div>
      </AccordionCard>

      <AccordionCard
        title="Confirmation des réservations"
        description="Choisissez comment les nouvelles réservations sont confirmées."
      >
        <div className="space-y-3">
          <label
            className={cn(
              "flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors",
              reservationConfirmationMode === "manual"
                ? "border-green-200 bg-green-50/50"
                : "border-zg-border-strong hover:bg-zg-highlight/55",
            )}
          >
            <input
              type="radio"
              name="reservation-confirmation-mode"
              value="manual"
              checked={reservationConfirmationMode === "manual"}
              onChange={() => setReservationConfirmationMode("manual")}
              className="sr-only"
            />
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                reservationConfirmationMode === "manual"
                  ? "border-[var(--primary)] bg-[var(--primary)]"
                  : "border-[rgba(0,0,0,0.12)] bg-[var(--surface)]",
              )}
            >
              {reservationConfirmationMode === "manual" ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
            </span>
            <span>
              <span className="block text-sm font-semibold text-[var(--foreground)]">Confirmation manuelle</span>
              <span className="mt-0.5 block text-sm text-[var(--muted-foreground)]">
                Le restaurant doit confirmer ou refuser les réservations.
              </span>
            </span>
          </label>

          <label
            className={cn(
              "flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors",
              reservationConfirmationMode === "automatic"
                ? "border-green-200 bg-green-50/50"
                : "border-zg-border-strong hover:bg-zg-highlight/55",
            )}
          >
            <input
              type="radio"
              name="reservation-confirmation-mode"
              value="automatic"
              checked={reservationConfirmationMode === "automatic"}
              onChange={() => setReservationConfirmationMode("automatic")}
              className="sr-only"
            />
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                reservationConfirmationMode === "automatic"
                  ? "border-[var(--primary)] bg-[var(--primary)]"
                  : "border-[rgba(0,0,0,0.12)] bg-[var(--surface)]",
              )}
            >
              {reservationConfirmationMode === "automatic" ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
            </span>
            <span>
              <span className="block text-sm font-semibold text-[var(--foreground)]">Confirmation automatique</span>
              <span className="mt-0.5 block text-sm text-[var(--muted-foreground)]">
                Les réservations sont confirmées automatiquement si les disponibilités le permettent.
              </span>
            </span>
          </label>
        </div>
      </AccordionCard>

      <AccordionCard
        title="E-mail de confirmation"
        description="Texte envoyé au client lorsque sa réservation est confirmée."
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-zg-border-strong bg-zg-surface-elevated/50 p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Variables dynamiques</p>
            <p className="mt-1 text-xs leading-relaxed text-zg-fg/55">
              Insérez-les dans l&apos;objet ou le corps. Cliquez sur une pastille pour copier la variable.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RESERVATION_CONFIRMATION_EMAIL_VARIABLES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  title={label}
                  onClick={() => void copyReservationEmailVariable(`{{${key}}}`)}
                  className="rounded-lg border border-zg-border-strong bg-[var(--surface)] px-2.5 py-1 font-mono text-[11px] font-medium text-[#0F3F3A] transition-colors hover:border-[#A3D8CC] hover:bg-[#F0F9F7]"
                >
                  {`{{${key}}}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="dashboard-field-label" htmlFor="reservation-confirmation-email-subject">
              Objet du mail
            </label>
            <p className="text-xs text-zg-fg/52">
              Laisser vide pour utiliser le modèle ZenGrow par défaut (
              <span className="font-mono text-[11px]">{DEFAULT_RESERVATION_CONFIRMATION_EMAIL_SUBJECT}</span>).
            </p>
            <Input
              id="reservation-confirmation-email-subject"
              value={reservationConfirmationEmailSubject}
              onChange={(e) => setReservationConfirmationEmailSubject(e.target.value)}
              placeholder={DEFAULT_RESERVATION_CONFIRMATION_EMAIL_SUBJECT}
              maxLength={200}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label className="dashboard-field-label" htmlFor="reservation-confirmation-email-body">
              Contenu du mail
            </label>
            <p className="text-xs text-zg-fg/52">
              Laisser vide pour le texte par défaut ZenGrow. Astuce : plusieurs phrases possibles en utilisant des
              retours à ligne.
            </p>
            <Textarea
              id="reservation-confirmation-email-body"
              className="min-h-[140px] font-sans"
              value={reservationConfirmationEmailBody}
              onChange={(e) => setReservationConfirmationEmailBody(e.target.value)}
              placeholder={DEFAULT_RESERVATION_CONFIRMATION_EMAIL_BODY}
              maxLength={4000}
              spellCheck
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setReservationConfirmationEmailSubject("");
                setReservationConfirmationEmailBody("");
              }}
            >
              Réinitialiser (modèle ZenGrow)
            </Button>
            <p className="text-xs text-zg-fg/50">
              Efface vos textes personnalisés ; après enregistrement, les valeurs par défaut s&apos;appliquent à nouveau.
            </p>
          </div>

          <div className="rounded-xl border border-[#CBE6DF] bg-[#F0F9F7]/55 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0F3F3A]/70">Aperçu avec des exemples</p>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{confirmationEmailPreviewSubject}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zg-fg/78">{confirmationEmailPreviewBody}</p>
          </div>
        </div>
      </AccordionCard>

      <AccordionCard
        title="Terrasse"
        description="Optionnel : proposer un choix Terrasse distinct, avec capacité dédiée."
      >
        <div className="space-y-5">
          <Toggle checked={terraceEnabled} onChange={setTerraceEnabled} label="Réservations en terrasse activées" />
          <p className="text-sm leading-relaxed text-zg-fg/62">
            Lorsque l&apos;option est désactivée, toutes les demandes sont traitées comme en salle et le choix
            terrasse n&apos;apparaît pas sur votre page publique.
          </p>
          {terraceEnabled ? (
            <div className="space-y-2">
              <label className="dashboard-field-label">Capacité terrasse (couverts par créneau)</label>
              <p className="text-xs text-zg-fg/52">
                Nombre maximum de convives en terrasse en même temps sur un créneau (indépendant de la capacité
                intérieure).
              </p>
              <Input
                type="number"
                min={0}
                max={500}
                value={terraceCapacity}
                onChange={(e) => setTerraceCapacity(Number(e.target.value))}
              />
            </div>
          ) : null}
        </div>
      </AccordionCard>

      <AccordionCard
        title="Réservations"
        description="Un seul mode actif : la page publique, le dashboard et la validation serveur suivent exactement la même règle."
        defaultOpen
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="dashboard-field-label">Comment souhaitez-vous gérer vos réservations ?</p>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setReservationMode("simple")}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0F3F3A]/35",
                  reservationMode === "simple"
                    ? "border-[#0F3F3A] bg-[#F0F9F7] ring-2 ring-[#0F3F3A]/20"
                    : "border-zg-border-strong bg-[var(--surface)] hover:border-[#0F3F3A]/35",
                )}
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">Mode simple</p>
                <p className="mt-2 text-xs leading-relaxed text-zg-fg/58">
                  Idéal pour commencer : définissez une capacité par service (midi/soir) et acceptez les réservations
                  sans gérer les tables.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setReservationMode("floor_plan")}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0F3F3A]/35",
                  reservationMode === "floor_plan"
                    ? "border-[#0F3F3A] bg-[#F0F9F7] ring-2 ring-[#0F3F3A]/20"
                    : "border-zg-border-strong bg-[var(--surface)] hover:border-[#0F3F3A]/35",
                )}
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">Plan de salle</p>
                <p className="mt-2 text-xs leading-relaxed text-zg-fg/58">
                  Mode avancé : disponibilités calculées depuis vos tables actives et votre plan visuel.
                </p>
              </button>
            </div>
          </div>

          {reservationMode === "simple" ? (
            <div className="space-y-6 rounded-xl border border-zg-border-strong bg-[var(--surface)] p-4 md:p-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Mode simple</h3>
                <p className="mt-2 text-sm leading-relaxed text-zg-fg/62">
                  Les clients choisissent une heure dans vos plages d&apos;ouverture. ZenGrow vérifie uniquement la
                  capacité globale du service midi ou soir, sans gérer les tables.
                </p>
                <p className="mt-3 text-sm text-zg-fg/55">
                  <Link
                    href="/dashboard/availability"
                    className="font-medium text-[var(--primary)] underline-offset-2 hover:underline"
                  >
                    Disponibilités
                  </Link>{" "}
                  : jours et plages où vous acceptez des réservations.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-zg-border/70 bg-white/60 p-4">
                <Toggle checked={lunchServiceEnabled} onChange={setLunchServiceEnabled} label="Activer le service midi" />
                {lunchServiceEnabled ? (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="dashboard-field-label" htmlFor="ss-lunch-start">
                        Début du midi
                      </label>
                      <Input
                        id="ss-lunch-start"
                        type="time"
                        value={lunchServiceStart}
                        onChange={(e) => setLunchServiceStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="dashboard-field-label" htmlFor="ss-lunch-end">
                        Fin du midi
                      </label>
                      <Input
                        id="ss-lunch-end"
                        type="time"
                        value={lunchServiceEnd}
                        onChange={(e) => setLunchServiceEnd(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="dashboard-field-label" htmlFor="ss-lunch-max">
                        Capacité max du midi
                      </label>
                      <Input
                        id="ss-lunch-max"
                        type="number"
                        min={1}
                        max={500}
                        value={lunchMaxCovers}
                        onChange={(e) => setLunchMaxCovers(Number(e.target.value))}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 rounded-lg border border-zg-border/70 bg-white/60 p-4">
                <Toggle
                  checked={dinnerServiceEnabled}
                  onChange={setDinnerServiceEnabled}
                  label="Activer le service soir"
                />
                {dinnerServiceEnabled ? (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="dashboard-field-label" htmlFor="ss-dinner-start">
                        Début du soir
                      </label>
                      <Input
                        id="ss-dinner-start"
                        type="time"
                        value={dinnerServiceStart}
                        onChange={(e) => setDinnerServiceStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="dashboard-field-label" htmlFor="ss-dinner-end">
                        Fin du soir
                      </label>
                      <Input
                        id="ss-dinner-end"
                        type="time"
                        value={dinnerServiceEnd}
                        onChange={(e) => setDinnerServiceEnd(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="dashboard-field-label" htmlFor="ss-dinner-max">
                        Capacité max du soir
                      </label>
                      <Input
                        id="ss-dinner-max"
                        type="number"
                        min={1}
                        max={500}
                        value={dinnerMaxCovers}
                        onChange={(e) => setDinnerMaxCovers(Number(e.target.value))}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {reservationMode === "floor_plan" ? (
            <div className="space-y-6 rounded-xl border border-zg-border-strong bg-[var(--surface)] p-4 md:p-6">
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Plan de salle</h3>
                <p className="mt-2 text-sm leading-relaxed text-zg-fg/62">
                  Mode avancé : disponibilités calculées depuis vos tables actives. ZenGrow assigne automatiquement la
                  meilleure table compatible, ou laisse la réservation « À placer » si aucune table ne convient (selon la
                  logique existante).
                </p>
              </div>

              <div className="grid gap-4 border-t border-zg-border/82 pt-4 md:grid-cols-2">
                <ReservationField
                  label={"Durée moyenne d’occupation (midi, minutes)"}
                  description="Durée pendant laquelle une table reste indisponible après une réservation du midi."
                >
                  <Input
                    type="number"
                    min={30}
                    step={15}
                    value={floorPlanLunchDuration}
                    onChange={(e) => setFloorPlanLunchDuration(Number(e.target.value))}
                  />
                </ReservationField>
                <ReservationField
                  label={"Durée moyenne d’occupation (soir, minutes)"}
                  description="Durée pendant laquelle une table reste indisponible après une réservation du soir."
                >
                  <Input
                    type="number"
                    min={30}
                    step={15}
                    value={floorPlanDinnerDuration}
                    onChange={(e) => setFloorPlanDinnerDuration(Number(e.target.value))}
                  />
                </ReservationField>
              </div>

              <div className="space-y-4 border-t border-zg-border/82 pt-4">
                <div className="rounded-xl border border-zg-border-strong bg-zg-surface/95 p-4">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Résumé automatique</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-zg-border/70 bg-white/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Tables actives</p>
                      <p className="mt-1 text-lg font-bold text-zg-fg">{floorPlanSummary?.activeTables ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border border-zg-border/70 bg-white/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Couverts max (actives)</p>
                      <p className="mt-1 text-lg font-bold text-zg-fg">{floorPlanSummary?.maxCovers ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border border-zg-border/70 bg-white/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Zones actives</p>
                      <p className="mt-1 text-lg font-bold text-zg-fg">{floorPlanSummary?.activeZones ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border border-zg-border/70 bg-white/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Tables bloquées</p>
                      <p className="mt-1 text-lg font-bold text-zg-fg">{floorPlanSummary?.blockedTables ?? "—"}</p>
                    </div>
                  </div>
                </div>

                <ReservationField
                  label="Choix proposé au client (page publique)"
                  description="Par défaut, ZenGrow assigne automatiquement. Vous pouvez autoriser le choix d'une zone ou d'une table."
                >
                  <Select
                    value={floorPlanPublicSelectionMode}
                    onChange={(e) => setFloorPlanPublicSelectionMode(e.target.value as "automatic" | "area" | "table")}
                  >
                    <option value="automatic">Automatique — ZenGrow choisit la meilleure table</option>
                    <option value="area">Choix d’espace — le client choisit Salle / Terrasse / etc.</option>
                    <option value="table">Choix de table — le client choisit sur le plan</option>
                  </Select>
                </ReservationField>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard/floor-plan"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-zg-teal to-zg-mint px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_-14px_rgba(31,122,108,0.82)] transition hover:scale-[1.02] active:scale-[0.99]"
                  >
                    Ouvrir le plan de salle
                  </Link>
                  {(floorPlanSummary?.activeTables ?? 0) === 0 ? (
                    <p className="text-sm text-zg-fg/55">
                      Commencez par créer votre plan de salle (zones + tables actives) pour activer pleinement ce mode.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-[#CBE6DF] bg-[#F0F9F7]/60 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-[#0F3F3A]">Page « Réservations » du tableau de bord</h3>
            <p className="mt-1 text-sm leading-relaxed text-zg-fg/62">
              Masquez automatiquement les réservations dont l&apos;heure affichée est passée (archivage côté liste ;
              l&apos;historique reste accessible).
            </p>
            <div className="mt-4">
              <Toggle
                checked={autoArchiveReservations}
                onChange={setAutoArchiveReservations}
                label="Archivage automatique des réservations"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ReservationField
              label="Horizon de réservation (jours)"
              description="Nombre de jours à l'avance ouverts sur la page publique."
            >
              <Input
                type="number"
                min={1}
                max={365}
                value={daysInAdvance}
                placeholder="ex : 60"
                onChange={(event) => setDaysInAdvance(Number(event.target.value))}
              />
            </ReservationField>

            <ReservationField
              label="Groupe maximum accepté"
              description={"Taille maximum d'un groupe pour une réservation en ligne."}
            >
              <Input
                type="number"
                min={1}
                value={maxPartySize}
                placeholder="ex : 8"
                onChange={(event) => setMaxPartySize(Number(event.target.value))}
              />
            </ReservationField>
          </div>

          <div className="border-t border-zg-border/82 pt-6">
            <Button type="submit" disabled={isSaving} className="min-h-[44px] min-w-[200px]">
              {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <p className="mt-2 text-xs text-zg-fg/52">
              Les changements de mode et les paramètres publics sont enregistrés ici. Les tables et éléments se gèrent
              dans le module « Plan de salle ».
            </p>
          </div>
        </div>
      </AccordionCard>

      <AccordionCard
        title="Lien public"
        description="Personnalisez le slug et partagez facilement la page."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label">Slug</label>
              <Input value={slug} onChange={(event) => setSlug(event.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">URL</label>
              <Input value={publicLink.replace(restaurant.slug, slug)} readOnly />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="text-sm font-medium text-green-700 hover:underline"
              onClick={() => navigator.clipboard.writeText(publicLink.replace(restaurant.slug, slug))}
            >
              Copier le lien
            </button>
            <a
              href={publicLink.replace(restaurant.slug, slug)}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-zg-fg/62 hover:text-zg-fg"
            >
              Ouvrir la page publique
            </a>
          </div>
        </div>
      </AccordionCard>

      <AccordionCard
        title="Fermeture temporaire"
        description="Bloquez les réservations pendant une période de fermeture."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="dashboard-field-label">Date de début</label>
            <Input
              type="date"
              value={closureStartDate}
              onChange={(event) => setClosureStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className="dashboard-field-label">Date de fin</label>
            <Input type="date" value={closureEndDate} onChange={(event) => setClosureEndDate(event.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="dashboard-field-label">
              Message (optionnel)
            </label>
            <Textarea
              className="min-h-20"
              value={closureMessage}
              onChange={(event) => setClosureMessage(event.target.value)}
              placeholder="Ex : Vacances d'ete"
            />
          </div>
        </div>
      </AccordionCard>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving} className="min-h-[44px]">
          {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement..." : "Enregistrer les paramètres"}
        </Button>
        {message ? <p className="text-sm text-[var(--muted-foreground)]">{message}</p> : null}
      </div>
    </form>
  );
}
