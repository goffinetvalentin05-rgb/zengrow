"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

type RestaurantData = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  slug: string;
};

type SettingsData = {
  reservation_duration: number | null;
  reservation_slot_interval: number | null;
  restaurant_capacity: number | null;
  max_party_size: number | null;
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
};

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
  const [restaurantCapacity, setRestaurantCapacity] = useState(settings.restaurant_capacity ?? 40);
  const [reservationDuration, setReservationDuration] = useState(settings.reservation_duration ?? 90);
  const [slotInterval, setSlotInterval] = useState(settings.reservation_slot_interval ?? 15);
  const [maxPartySize, setMaxPartySize] = useState(settings.max_party_size ?? 8);
  const [accentColor, setAccentColor] = useState(settings.accent_color ?? "#0D5C4A");
  const [buttonColor, setButtonColor] = useState(settings.button_color ?? "#0D5C4A");
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
        reservation_duration: reservationDuration,
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
          <CardTitle>Confirmation des réservations</CardTitle>
          <CardDescription>Choisissez comment les nouvelles réservations sont confirmées.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label
            className={cn(
              "flex cursor-pointer gap-4 rounded-xl border p-4 transition-all",
              reservationConfirmationMode === "manual"
                ? "border-[rgba(13,92,74,0.32)] bg-[rgba(13,92,74,0.05)] shadow-[0_0_0_3px_rgba(13,92,74,0.08)]"
                : "border-[rgba(0,0,0,0.07)] hover:bg-[var(--surface-muted)]/50",
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
              "flex cursor-pointer gap-4 rounded-xl border p-4 transition-all",
              reservationConfirmationMode === "automatic"
                ? "border-[rgba(13,92,74,0.32)] bg-[rgba(13,92,74,0.05)] shadow-[0_0_0_3px_rgba(13,92,74,0.08)]"
                : "border-[rgba(0,0,0,0.07)] hover:bg-[var(--surface-muted)]/50",
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
          <CardTitle>Reservations intelligentes</CardTitle>
          <CardDescription>Réglez la capacité et la logique de chevauchement des réservations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="dashboard-field-label">
              Capacité maximale du restaurant
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
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(publicLink.replace(restaurant.slug, slug))}
            >
              Copier
            </Button>
            <a
              href={publicLink.replace(restaurant.slug, slug)}
              target="_blank"
              rel="noreferrer"
              className="dashboard-link-secondary"
            >
              Voir la page publique
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
