"use client";

import { ChangeEvent, DragEvent, FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { GripVertical, Trash2 } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { cn } from "@/src/lib/utils";
import PublicPageLivePreview, { type PublicPagePreviewDraft } from "@/src/components/dashboard/public-page-live-preview";
import { PUBLIC_PAGE_FONT_OPTIONS } from "@/src/lib/public-page-fonts";

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

type RestaurantTableRow = {
  id: string;
  name: string;
  min_covers: number;
  max_covers: number;
};

type TableRowDraft = {
  key: string;
  name: string;
  min_covers: number;
  max_covers: number;
};

type SettingsFormProps = {
  restaurant: RestaurantData;
  settings: SettingsData;
  confirmationMode: "manual" | "automatic";
  publicLink: string;
  initialRestaurantTables: RestaurantTableRow[];
};

function draftRowsFromDb(rows: RestaurantTableRow[]): TableRowDraft[] {
  return rows.map((r) => ({
    key: r.id,
    name: r.name,
    min_covers: Math.max(1, r.min_covers),
    max_covers: Math.min(20, Math.max(1, r.max_covers)),
  }));
}

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
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsForm({
  restaurant,
  settings,
  confirmationMode,
  publicLink,
  initialRestaurantTables,
}: SettingsFormProps) {
  const supabase = createClient();
  const [name, setName] = useState(restaurant.name);
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [email, setEmail] = useState(restaurant.email ?? "");
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [slug, setSlug] = useState(restaurant.slug);
  const [restaurantCapacity, setRestaurantCapacity] = useState(
    settings.max_covers_per_slot ?? settings.restaurant_capacity ?? 40,
  );
  const [useTables, setUseTables] = useState(settings.use_tables ?? false);
  const [terraceEnabled, setTerraceEnabled] = useState(settings.terrace_enabled ?? false);
  const [terraceCapacity, setTerraceCapacity] = useState(
    Math.max(0, Math.min(500, settings.terrace_capacity ?? 0)),
  );
  const [daysInAdvance, setDaysInAdvance] = useState(settings.days_in_advance ?? 60);
  const [reservationDuration, setReservationDuration] = useState(settings.reservation_duration ?? 90);
  const [autoArchiveReservations, setAutoArchiveReservations] = useState(
    settings.auto_archive_reservations === true,
  );
  const [slotInterval, setSlotInterval] = useState(settings.reservation_slot_interval ?? 15);
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

  const [tableRows, setTableRows] = useState<TableRowDraft[]>(() => draftRowsFromDb(initialRestaurantTables));
  const [tableRowErrors, setTableRowErrors] = useState<
    Record<string, { name?: boolean; minMax?: boolean }>
  >({});
  const [tableListBlockError, setTableListBlockError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ key: string; until: number } | null>(null);

  useEffect(() => {
    if (!pendingDelete) return;
    const id = window.setInterval(() => {
      if (Date.now() >= pendingDelete.until) {
        setPendingDelete(null);
      }
    }, 150);
    return () => window.clearInterval(id);
  }, [pendingDelete]);

  useEffect(() => {
    if (!useTables) {
      setTableListBlockError(null);
      setTableRowErrors({});
    }
  }, [useTables]);

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
    setTableRowErrors({});
    setTableListBlockError(null);
    if (!useTables) {
      return true;
    }
    if (tableRows.length === 0) {
      setTableListBlockError("Ajoutez au moins une table pour activer ce mode.");
      return false;
    }

    const nextErrors: Record<string, { name?: boolean; minMax?: boolean }> = {};
    const seen = new Set<string>();
    let hasDup = false;

    for (const row of tableRows) {
      const trimmed = row.name.trim();
      if (!trimmed) {
        nextErrors[row.key] = { ...nextErrors[row.key], name: true };
      }
      const norm = trimmed.toLowerCase();
      if (norm) {
        if (seen.has(norm)) {
          hasDup = true;
        }
        seen.add(norm);
      }
      if (row.min_covers > row.max_covers) {
        nextErrors[row.key] = { ...nextErrors[row.key], minMax: true };
      }
    }

    if (Object.keys(nextErrors).some((k) => nextErrors[k]?.name)) {
      setTableRowErrors(nextErrors);
      return false;
    }
    if (hasDup) {
      setTableListBlockError("Deux tables ont le même nom.");
      return false;
    }
    if (Object.keys(nextErrors).some((k) => nextErrors[k]?.minMax)) {
      setTableRowErrors(nextErrors);
      return false;
    }
    return true;
  }

  function addTableRow() {
    const newKey = crypto.randomUUID();
    setTableRows((rows) => [...rows, { key: newKey, name: "", min_covers: 2, max_covers: 4 }]);
    requestAnimationFrame(() => {
      document.getElementById(`table-name-${newKey}`)?.focus();
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setTableRowErrors({});
    setTableListBlockError(null);

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
        restaurant_capacity: restaurantCapacity,
        max_covers_per_slot: restaurantCapacity,
        reservation_duration: reservationDuration,
        auto_archive_reservations: autoArchiveReservations,
        use_tables: useTables,
        terrace_enabled: terraceEnabled,
        terrace_capacity: Math.max(0, Math.min(500, terraceCapacity)),
        days_in_advance: daysInAdvance,
        reservation_slot_interval: slotInterval,
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

    if (useTables) {
      const { error: tablesRpcError } = await supabase.rpc("replace_restaurant_tables", {
        p_restaurant_id: restaurant.id,
        p_tables: tableRows.map((row) => ({
          name: row.name.trim(),
          min_covers: Math.max(1, Math.min(20, row.min_covers)),
          max_covers: Math.max(1, Math.min(20, row.max_covers)),
        })),
      });

      if (tablesRpcError) {
        setMessage(tablesRpcError.message);
        setIsSaving(false);
        return;
      }

      const { data: refreshedTables } = await supabase
        .from("restaurant_tables")
        .select("id, name, min_covers, max_covers")
        .eq("restaurant_id", restaurant.id)
        .order("name", { ascending: true });
      if (refreshedTables) {
        setTableRows(draftRowsFromDb(refreshedTables));
      }
    }

    setSaveButtonSuccess(true);
    window.setTimeout(() => setSaveButtonSuccess(false), 2000);
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Informations restaurant</CardTitle>
          <CardDescription>Informations générales de votre établissement.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
              Notes internes ou texte brut non affiché sur la page publique (la description visible par les clients se règle dans Personnalisation).
            </p>
            <Textarea
              className="min-h-20"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personnalisation — page publique</CardTitle>
          <CardDescription>
            Aperçu en direct à droite (bureau) ou en bas (mobile). Tout est enregistré avec le bouton en bas de la page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

              <details open className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
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

              <details open className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Typographie</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label">Police des titres</label>
                    <select
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
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
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
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
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
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

              <details open className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
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

              <details open className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Style</summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="dashboard-field-label">Rayon des bordures</label>
                    <select
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
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
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
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
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
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

          <details open className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
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
                    className="h-4 w-4 rounded border-gray-300"
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
                    className="h-4 w-4 rounded border-gray-300"
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
                    className="h-4 w-4 rounded border-gray-300"
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
                    className="h-4 w-4 rounded border-gray-300"
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
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Afficher les horaires d’ouverture dans le pied de page
                </label>
              </div>
            </div>
          </details>

          <details open className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
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
                    className="h-4 w-4 rounded border-gray-300"
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
                    className="h-4 w-4 rounded border-gray-300"
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
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Afficher le lien Google Maps dans le pied de page
                </label>
              </div>
            </div>
          </details>

          <details open className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
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
              <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
                        "flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3",
                        draggingDocId === doc.id && "opacity-60",
                      )}
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
                        <GripVertical className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{doc.label}</p>
                        <p className="truncate text-xs text-[var(--muted-foreground)]">{doc.file_url}</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
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

          <details open className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
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
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confirmation des réservations</CardTitle>
          <CardDescription>Choisissez comment les nouvelles réservations sont confirmées.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label
            className={cn(
              "flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors",
              reservationConfirmationMode === "manual"
                ? "border-green-200 bg-green-50/50"
                : "border-gray-200 hover:bg-gray-50/80",
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
                : "border-gray-200 hover:bg-gray-50/80",
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terrasse</CardTitle>
          <CardDescription>
            Proposez une zone « terrasse » distincte de la salle, avec sa propre capacité par créneau.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Toggle checked={terraceEnabled} onChange={setTerraceEnabled} label="Réservations en terrasse activées" />
          <p className="text-sm leading-relaxed text-gray-600">
            Lorsque l&apos;option est désactivée, toutes les demandes sont traitées comme en salle et le choix
            terrasse n&apos;apparaît pas sur votre page publique.
          </p>
          {terraceEnabled ? (
            <div className="space-y-2">
              <label className="dashboard-field-label">Capacité terrasse (couverts par créneau)</label>
              <p className="text-xs text-gray-500">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {useTables ? "Gestion par tables physiques" : "Gestion par couverts (mode simple)"}
          </CardTitle>
          <CardDescription>
            Règles appliquées sur votre page publique de réservation : créneaux, capacité et horizon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-[#CBE6DF] bg-[#F0F9F7]/60 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-[#0F3F3A]">Page « Réservations » du tableau de bord</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Activez l&apos;archivage pour masquer automatiquement les créneaux passés (heure + durée du repas) de la
              liste principale ; ils restent consultables sous Historique.
            </p>
            <div className="mt-4">
              <Toggle
                checked={autoArchiveReservations}
                onChange={setAutoArchiveReservations}
                label="Archivage automatique des réservations"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-[var(--surface)] p-4 md:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <Toggle
                  checked={useTables}
                  onChange={setUseTables}
                  label={useTables ? "Tables physiques activées" : "Mode couverts globaux activé"}
                />
                {useTables ? (
                  <>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Chaque réservation occupe une table spécifique définie dans votre base. Le système cherche
                      automatiquement une table disponible correspondant au nombre de personnes. Si aucune table
                      n&apos;est libre sur ce créneau, la réservation est refusée.
                    </p>
                    <p className="text-sm leading-relaxed text-gray-500">
                      <span className="font-medium text-gray-700">Exemple :</span> vous avez une table de 2 et une
                      table de 4 → une demande pour 3 personnes sera placée à la table de 4 si elle est libre.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Le système additionne les couverts de toutes les réservations sur un créneau. Quand la limite est
                      atteinte, le créneau est automatiquement fermé. Idéal si vos tables sont mobiles ou
                      interchangeables.
                    </p>
                    <p className="text-sm leading-relaxed text-gray-500">
                      <span className="font-medium text-gray-700">Exemple :</span> limite fixée à 40 couverts → une
                      réservation de 6 personnes à 12h30 sera refusée s&apos;il reste moins de 6 places sur ce créneau.
                    </p>
                  </>
                )}
              </div>
            </div>

            {useTables ? (
              <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">Vos tables</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Une ligne = une table. Enregistrez en bas de cette section pour appliquer les changements.
                  </p>
                </div>

                {tableListBlockError ? (
                  <p
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950"
                    role="alert"
                  >
                    {tableListBlockError}
                  </p>
                ) : null}

                <div className="hidden gap-2 text-xs font-medium uppercase tracking-wide text-gray-500 sm:grid sm:grid-cols-[1fr_minmax(0,5.5rem)_minmax(0,5.5rem)_2.5rem] sm:items-end sm:gap-3">
                  <span>Nom</span>
                  <span>min pers.</span>
                  <span>max pers.</span>
                  <span className="sr-only">Supprimer</span>
                </div>

                <ul className="space-y-3">
                  {tableRows.map((row) => {
                    const isPendingDelete = pendingDelete?.key === row.key;
                    const err = tableRowErrors[row.key];
                    return (
                      <li
                        key={row.key}
                        className={cn(
                          "rounded-lg border p-3 transition-colors sm:grid sm:grid-cols-[1fr_minmax(0,5.5rem)_minmax(0,5.5rem)_2.5rem] sm:items-center sm:gap-3",
                          isPendingDelete ? "border-red-400 bg-red-50/80" : "border-gray-200 bg-white",
                          err?.name || err?.minMax ? "border-red-300" : "",
                        )}
                      >
                        <div className="min-w-0 sm:col-span-1">
                          <label className="sr-only" htmlFor={`table-name-${row.key}`}>
                            Nom de la table
                          </label>
                          <Input
                            id={`table-name-${row.key}`}
                            value={row.name}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTableRows((rows) => rows.map((r) => (r.key === row.key ? { ...r, name: v } : r)));
                            }}
                            placeholder="ex : Table 1, Terrasse A, Bar..."
                            className={cn(err?.name && "border-red-500")}
                          />
                          {err?.name ? (
                            <p className="mt-1 text-xs font-medium text-red-600">Nom requis</p>
                          ) : null}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-500 sm:hidden">min pers.</label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={row.min_covers}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setTableRows((rows) =>
                                rows.map((r) => (r.key === row.key ? { ...r, min_covers: Number.isNaN(v) ? 1 : v } : r)),
                              );
                            }}
                            className={cn(err?.minMax && "border-red-500")}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-500 sm:hidden">max pers.</label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={row.max_covers}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setTableRows((rows) =>
                                rows.map((r) => (r.key === row.key ? { ...r, max_covers: Number.isNaN(v) ? 1 : v } : r)),
                              );
                            }}
                            className={cn(err?.minMax && "border-red-500")}
                          />
                          {err?.minMax ? (
                            <p className="mt-1 text-xs font-medium text-red-600">
                              Le min ne peut pas dépasser le max.
                            </p>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-col items-stretch gap-2 sm:mt-0">
                          {isPendingDelete ? (
                            <button
                              type="button"
                              className="rounded-md border border-red-300 bg-white px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setTableRows((rows) => rows.filter((r) => r.key !== row.key));
                                setPendingDelete(null);
                              }}
                            >
                              Confirmer la suppression
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                              aria-label="Supprimer cette table"
                              onClick={() =>
                                setPendingDelete({ key: row.key, until: Date.now() + 2000 })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <button
                  type="button"
                  onClick={addTableRow}
                  className="text-sm font-semibold text-[var(--primary)] hover:underline"
                >
                  + Ajouter une table
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ReservationField
              label="Intervalle entre créneaux"
              description="Définit la fréquence des créneaux proposés aux clients. 30 min = créneaux à 12:00, 12:30, 13:00… 15 min = créneaux à 12:00, 12:15, 12:30…"
            >
              <Input
                type="number"
                min={5}
                step={5}
                value={slotInterval}
                placeholder="ex : 30"
                onChange={(event) => setSlotInterval(Number(event.target.value))}
              />
            </ReservationField>

            <ReservationField
              label="Durée estimée d'un repas"
              description="Utilisée pour calculer quels créneaux sont bloqués. Si un client réserve à 12:00 pour 90 min, les créneaux 12:00, 12:30 et 13:00 seront occupés pour sa table. Évite les chevauchements."
            >
              <Input
                type="number"
                min={30}
                step={15}
                value={reservationDuration}
                placeholder="ex : 90"
                onChange={(event) => setReservationDuration(Number(event.target.value))}
              />
            </ReservationField>

            <ReservationField
              label="Horizon de réservation (jours)"
              description="Nombre de jours maximum pendant lesquels un client peut réserver depuis la page publique. Au-delà, les dates ne sont pas proposées."
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

            {!useTables ? (
              <ReservationField
                label="Capacité max par créneau"
                description="Nombre total de couverts acceptés simultanément sur un même créneau. Inclut toutes les réservations en attente et confirmées."
              >
                <Input
                  type="number"
                  min={1}
                  value={restaurantCapacity}
                  placeholder="ex : 40"
                  onChange={(event) => setRestaurantCapacity(Number(event.target.value))}
                />
              </ReservationField>
            ) : null}

            <ReservationField
              label="Groupe maximum accepté"
              description="Un client ne pourra pas réserver pour plus de X personnes depuis la page publique. Les réservations plus grandes devront être gérées manuellement."
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

          <div className="border-t border-gray-100 pt-6">
            <Button type="submit" disabled={isSaving} className="min-h-[44px] min-w-[200px]">
              {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              Enregistre l&apos;ensemble des paramètres de la page (y compris les tables ci-dessus), comme le bouton en
              bas.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lien public</CardTitle>
          <CardDescription>Personnalisez le slug et partagez facilement la page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Ouvrir la page publique
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fermeture temporaire</CardTitle>
          <CardDescription>Bloquez les réservations pendant une période de fermeture.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving} className="min-h-[44px]">
          {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement..." : "Enregistrer les paramètres"}
        </Button>
        {message ? <p className="text-sm text-[var(--muted-foreground)]">{message}</p> : null}
      </div>
    </form>
  );
}
