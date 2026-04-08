"use client";

import { ChangeEvent, FormEvent, type ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Toggle from "@/src/components/ui/toggle";
import { cn } from "@/src/lib/utils";

type RestaurantData = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  slug: string;
  public_theme_key?: string | null;
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
  public_menu_mode: "url" | "pdf" | null;
  public_menu_url: string | null;
  public_menu_pdf_url: string | null;
  public_page_show_address: boolean | null;
  public_page_show_phone: boolean | null;
  public_page_show_email: boolean | null;
  public_page_show_website: boolean | null;
  public_page_show_opening_hours: boolean | null;
};

function storagePathFromRestaurantAssetUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/storage/v1/object/public/restaurant-assets/");
    if (parts.length < 2) return null;
    return decodeURIComponent(parts[1]);
  } catch {
    return null;
  }
}

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
  const [daysInAdvance, setDaysInAdvance] = useState(settings.days_in_advance ?? 60);
  const [reservationDuration, setReservationDuration] = useState(settings.reservation_duration ?? 90);
  const [slotInterval, setSlotInterval] = useState(settings.reservation_slot_interval ?? 15);
  const [maxPartySize, setMaxPartySize] = useState(settings.max_party_size ?? 8);
  const [accentColor, setAccentColor] = useState(settings.accent_color ?? "#1A6B50");
  const [buttonColor, setButtonColor] = useState(settings.button_color ?? "#1A6B50");
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(settings.cover_image_url ?? "");
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
  const [menuMode, setMenuMode] = useState<"url" | "pdf">(() => {
    if (settings.public_menu_mode === "pdf") return "pdf";
    if (settings.public_menu_mode === "url") return "url";
    if (settings.public_menu_pdf_url?.trim()) return "pdf";
    return "url";
  });
  const [menuUrl, setMenuUrl] = useState(settings.public_menu_url ?? "");
  const [menuPdfUrl, setMenuPdfUrl] = useState(settings.public_menu_pdf_url ?? "");
  const [isUploadingMenuPdf, setIsUploadingMenuPdf] = useState(false);
  const [publicPageDescription, setPublicPageDescription] = useState(settings.public_page_description ?? "");
  const [publicThemeKey, setPublicThemeKey] = useState<"moderne" | "classique" | "naturel" | "minimaliste">(
    restaurant.public_theme_key && ["moderne", "classique", "naturel", "minimaliste"].includes(restaurant.public_theme_key)
      ? (restaurant.public_theme_key as "moderne" | "classique" | "naturel" | "minimaliste")
      : "moderne",
  );
  const [showPublicAddress, setShowPublicAddress] = useState(settings.public_page_show_address ?? true);
  const [showPublicPhone, setShowPublicPhone] = useState(settings.public_page_show_phone ?? true);
  const [showPublicEmail, setShowPublicEmail] = useState(settings.public_page_show_email ?? true);
  const [showPublicWebsite, setShowPublicWebsite] = useState(settings.public_page_show_website ?? true);
  const [showPublicOpeningHours, setShowPublicOpeningHours] = useState(settings.public_page_show_opening_hours ?? true);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveButtonSuccess, setSaveButtonSuccess] = useState(false);

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

  async function uploadAsset(file: File, type: "logo" | "cover") {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${restaurant.id}/${type}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage.from("restaurant-assets").upload(filePath, file, {
      upsert: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from("restaurant-assets").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function uploadGalleryPhoto(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${restaurant.id}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error } = await supabase.storage.from("restaurant-assets").upload(filePath, file, {
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from("restaurant-assets").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function uploadMenuPdf(file: File) {
    const filePath = `${restaurant.id}/menu-${Date.now()}.pdf`;

    const { error } = await supabase.storage.from("restaurant-assets").upload(filePath, file, {
      upsert: true,
      contentType: "application/pdf",
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from("restaurant-assets").getPublicUrl(filePath);
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
    const path = storagePathFromRestaurantAssetUrl(url);
    if (path) {
      await supabase.storage.from("restaurant-assets").remove([path]);
    }
    setGalleryUrls((prev) => prev.filter((u) => u !== url));
  }

  async function handleMenuPdfUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setMessage("Veuillez choisir un fichier PDF.");
      event.target.value = "";
      return;
    }
    setMessage(null);
    setIsUploadingMenuPdf(true);
    try {
      const publicUrl = await uploadMenuPdf(file);
      setMenuPdfUrl(publicUrl);
      setMenuMode("pdf");
      setMessage("Menu PDF chargé.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible de charger le PDF.");
    } finally {
      setIsUploadingMenuPdf(false);
      event.target.value = "";
    }
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

    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update({
        name,
        slug,
        phone: phone || null,
        email: email || null,
        address: address || null,
        description: description || null,
        // Theme key for public reservation page (curated presets)
        public_theme_key: publicThemeKey,
        reservation_confirmation_mode: reservationConfirmationMode,
      })
      .eq("id", restaurant.id);

    if (restaurantError) {
      setMessage(restaurantError.message);
      setIsSaving(false);
      return;
    }

    const descTrim = publicPageDescription.trim().slice(0, 300);
    let publicMenuMode: "url" | "pdf" | null = null;
    let publicMenuUrlSave: string | null = null;
    let publicMenuPdfUrlSave: string | null = null;
    if (menuMode === "url" && menuUrl.trim()) {
      publicMenuMode = "url";
      publicMenuUrlSave = menuUrl.trim();
    } else if (menuMode === "pdf" && menuPdfUrl.trim()) {
      publicMenuMode = "pdf";
      publicMenuPdfUrlSave = menuPdfUrl.trim();
    }

    const { error: settingsError } = await supabase
      .from("restaurant_settings")
      .upsert({
        restaurant_id: restaurant.id,
        restaurant_capacity: restaurantCapacity,
        max_covers_per_slot: restaurantCapacity,
        reservation_duration: reservationDuration,
        use_tables: useTables,
        days_in_advance: daysInAdvance,
        reservation_slot_interval: slotInterval,
        max_party_size: maxPartySize,
        accent_color: accentColor || null,
        button_color: buttonColor || null,
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
        public_menu_mode: publicMenuMode,
        public_menu_url: publicMenuUrlSave,
        public_menu_pdf_url: publicMenuPdfUrlSave,
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apparence de la page</CardTitle>
          <CardDescription>Personnalisez votre page publique de réservation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label">
                Logo du restaurant
              </label>
              <Input type="file" accept="image/*" onChange={handleLogoUpload} />
              {isUploadingLogo ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">Envoi...</p> : null}
              {logoUrl ? (
                <div className="mt-2 flex items-center gap-3">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg object-cover"
                    unoptimized
                  />
                  <Input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
                </div>
              ) : null}
            </div>
            <div>
              <label className="dashboard-field-label">
                Photo de couverture
              </label>
              <Input type="file" accept="image/*" onChange={handleCoverUpload} />
              {isUploadingCover ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">Envoi...</p> : null}
              {coverImageUrl ? (
                <div className="mt-2 space-y-2">
                  <Image
                    src={coverImageUrl}
                    alt="Couverture"
                    width={1200}
                    height={320}
                    className="h-24 w-full rounded-xl object-cover"
                    unoptimized
                  />
                  <Input value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} />
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label">Couleur principale</label>
              <div className="flex items-center gap-2">
                <Input type="color" className="h-10 w-16 p-1" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} />
                <Input value={accentColor} onChange={(event) => setAccentColor(event.target.value)} />
              </div>
            </div>
            <div>
              <label className="dashboard-field-label">Couleur du bouton</label>
              <div className="flex items-center gap-2">
                <Input type="color" className="h-10 w-16 p-1" value={buttonColor} onChange={(event) => setButtonColor(event.target.value)} />
                <Input value={buttonColor} onChange={(event) => setButtonColor(event.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="text-sm font-medium text-[var(--foreground)]">Thème de la page publique</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              4 styles premium, cohérents et adaptés aux restaurants. Ce thème pilote fond, accent, texte et polices sur la page publique.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {([
                { key: "moderne", title: "Moderne", desc: "Charbon profond, vert lumineux, Playfair + Inter" },
                { key: "classique", title: "Classique", desc: "Crème chaude, bordeaux, Cormorant + Lato" },
                { key: "naturel", title: "Naturel", desc: "Beige chaud, terracotta, Merriweather + Source Sans" },
                { key: "minimaliste", title: "Minimaliste", desc: "Blanc pur, noir, DM Sans" },
              ] as const).map((opt) => (
                <label
                  key={opt.key}
                  className={cn(
                    "flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors",
                    publicThemeKey === opt.key ? "border-green-200 bg-green-50/50" : "border-gray-200 hover:bg-gray-50/80",
                  )}
                >
                  <input
                    type="radio"
                    name="public-theme-key"
                    value={opt.key}
                    checked={publicThemeKey === opt.key}
                    onChange={() => setPublicThemeKey(opt.key)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      publicThemeKey === opt.key
                        ? "border-[var(--primary)] bg-[var(--primary)]"
                        : "border-[rgba(0,0,0,0.12)] bg-[var(--surface)]",
                    )}
                  >
                    {publicThemeKey === opt.key ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-[var(--foreground)]">{opt.title}</span>
                    <span className="mt-0.5 block text-sm text-[var(--muted-foreground)]">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="text-sm font-medium text-[var(--foreground)]">Coordonnées visibles sur la page publique</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Choisissez les blocs affichés. Si tout est désactivé et qu’aucun réseau social n’est renseigné, la carte disparaît.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showPublicAddress}
                  onChange={(event) => setShowPublicAddress(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Adresse
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showPublicPhone}
                  onChange={(event) => setShowPublicPhone(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Téléphone
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showPublicEmail}
                  onChange={(event) => setShowPublicEmail(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                E-mail
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showPublicWebsite}
                  onChange={(event) => setShowPublicWebsite(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Site web
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={showPublicOpeningHours}
                  onChange={(event) => setShowPublicOpeningHours(event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Horaires d’ouverture
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label">Instagram</label>
              <Input value={instagramUrl} onChange={(event) => setInstagramUrl(event.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="dashboard-field-label">Facebook</label>
              <Input value={facebookUrl} onChange={(event) => setFacebookUrl(event.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Site web</label>
              <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label">Adresse</label>
              <Input value={address} onChange={(event) => setAddress(event.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">Téléphone</label>
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="dashboard-field-label">Description</label>
              <Textarea
                className="min-h-20"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>

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
          <CardTitle>Apparence de la page publique</CardTitle>
          <CardDescription>
            Galerie, menu et texte d’accroche affichés sur votre page de réservation publique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <label className="dashboard-field-label">Photos des plats / galerie</label>
            <p className="mb-2 text-sm text-[var(--muted-foreground)]">
              Jusqu’à 6 images (plats, ambiance, etc.). Affichées sous le formulaire de réservation sur la page publique.
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              disabled={galleryUrls.length >= 6 || isUploadingGallery}
            />
            {isUploadingGallery ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Envoi...</p>
            ) : null}
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

          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--foreground)]">Menu</p>
            <label
              className={cn(
                "flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors",
                menuMode === "url" ? "border-green-200 bg-green-50/50" : "border-gray-200 hover:bg-gray-50/80",
              )}
            >
              <input
                type="radio"
                name="public-menu-mode"
                value="url"
                checked={menuMode === "url"}
                onChange={() => setMenuMode("url")}
                className="sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  menuMode === "url"
                    ? "border-[var(--primary)] bg-[var(--primary)]"
                    : "border-[rgba(0,0,0,0.12)] bg-[var(--surface)]",
                )}
              >
                {menuMode === "url" ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <span className="flex-1 space-y-2">
                <span className="block text-sm font-semibold text-[var(--foreground)]">Lien vers le menu</span>
                <Input
                  type="url"
                  value={menuUrl}
                  onChange={(event) => setMenuUrl(event.target.value)}
                  placeholder="https://… (PDF externe ou page web)"
                  disabled={menuMode !== "url"}
                />
              </span>
            </label>

            <label
              className={cn(
                "flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors",
                menuMode === "pdf" ? "border-green-200 bg-green-50/50" : "border-gray-200 hover:bg-gray-50/80",
              )}
            >
              <input
                type="radio"
                name="public-menu-mode"
                value="pdf"
                checked={menuMode === "pdf"}
                onChange={() => setMenuMode("pdf")}
                className="sr-only"
              />
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  menuMode === "pdf"
                    ? "border-[var(--primary)] bg-[var(--primary)]"
                    : "border-[rgba(0,0,0,0.12)] bg-[var(--surface)]",
                )}
              >
                {menuMode === "pdf" ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <span className="flex-1 space-y-2">
                <span className="block text-sm font-semibold text-[var(--foreground)]">PDF du menu</span>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={handleMenuPdfUpload}
                  disabled={menuMode !== "pdf" || isUploadingMenuPdf}
                />
                {isUploadingMenuPdf ? (
                  <p className="text-xs text-[var(--muted-foreground)]">Envoi du PDF...</p>
                ) : null}
                {menuPdfUrl && menuMode === "pdf" ? (
                  <p className="break-all text-xs text-[var(--muted-foreground)]">{menuPdfUrl}</p>
                ) : null}
              </span>
            </label>
          </div>

          <div>
            <label className="dashboard-field-label">Description du restaurant (page publique)</label>
            <p className="mb-2 text-sm text-[var(--muted-foreground)]">
              Texte court sous le nom du restaurant, au-dessus du formulaire. Maximum 300 caractères.
            </p>
            <Textarea
              className="min-h-24"
              value={publicPageDescription}
              maxLength={300}
              onChange={(event) => setPublicPageDescription(event.target.value)}
              placeholder="Ex. : Cuisine du marché, terrasse ombragée…"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {publicPageDescription.length}/300
            </p>
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
          <CardTitle>
            {useTables ? "Gestion par tables physiques" : "Gestion par couverts (mode simple)"}
          </CardTitle>
          <CardDescription>
            Règles appliquées sur votre page publique de réservation : créneaux, capacité et horizon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
