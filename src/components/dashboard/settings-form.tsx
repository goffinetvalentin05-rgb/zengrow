"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
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

type SettingsFormProps = {
  restaurant: RestaurantData;
  settings: SettingsData;
  confirmationMode: "manual" | "automatic";
  publicLink: string;
};

export default function SettingsForm({ restaurant, settings, confirmationMode, publicLink }: SettingsFormProps) {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
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

    setMessage("Paramètres enregistrés.");
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
          <CardTitle>Réservations</CardTitle>
          <CardDescription>Capacité par créneau, tables physiques et horizon de réservation en ligne.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
            <Toggle checked={useTables} onChange={setUseTables} label="Gestion par tables physiques" />
            <p className="text-sm text-gray-600">
              Si activé, chaque réservation occupe une table (définie en base). Sinon, la capacité est comptée en
              couverts par créneau.
            </p>
          </div>
          <div>
            <label className="dashboard-field-label">Jours réservables à l&apos;avance (page publique)</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={daysInAdvance}
              onChange={(event) => setDaysInAdvance(Number(event.target.value))}
            />
          </div>
          <div>
            <label className="dashboard-field-label">
              Couverts maximum par créneau (mode couverts)
            </label>
            <Input
              type="number"
              min={1}
              value={restaurantCapacity}
              onChange={(event) => setRestaurantCapacity(Number(event.target.value))}
            />
          </div>
          <div>
            <label className="dashboard-field-label">
              Limite max de personnes par réservation
            </label>
            <Input
              type="number"
              min={1}
              value={maxPartySize}
              onChange={(event) => setMaxPartySize(Number(event.target.value))}
            />
          </div>
          <div>
            <label className="dashboard-field-label">
              Durée moyenne d&apos;une réservation (minutes)
            </label>
            <Input
              type="number"
              min={30}
              step={15}
              value={reservationDuration}
              onChange={(event) => setReservationDuration(Number(event.target.value))}
            />
          </div>
          <div>
            <label className="dashboard-field-label">
              Intervalle entre créneaux (minutes)
            </label>
            <Input
              type="number"
              min={5}
              step={5}
              value={slotInterval}
              onChange={(event) => setSlotInterval(Number(event.target.value))}
            />
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
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer les paramètres"}
        </Button>
        {message && <p className="text-sm text-[var(--muted-foreground)]">{message}</p>}
      </div>
    </form>
  );
}
