"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Gift, Store, UserRound } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
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
import AvailabilityEditor from "@/src/components/dashboard/availability-editor";
import GiftVoucherSettingsPanel, {
  type GiftVoucherSettingsHandle,
} from "@/src/components/dashboard/settings/gift-voucher-settings-panel";
import { PaymentsSettingsPanel } from "@/src/components/dashboard/settings/payments-settings-panel";
import { SalesChannelsPanel } from "@/src/components/dashboard/settings/sales-channels-panel";
import { SiteIntegrationPanel } from "@/src/components/dashboard/settings/site-integration-panel";
import { DEFAULT_PRIMARY, normalizeHexColor } from "@/src/lib/public-page/colors";
import {
  imageExtensionForUpload,
  uploadRestaurantPublicAsset,
  validateRestaurantImageFile,
} from "@/src/lib/restaurant-storage-upload";
import { type GiftVoucherNotificationPrefs } from "@/src/lib/notifications/preferences";
import type { OpeningHours } from "@/src/lib/utils";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

type RestaurantData = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  slug: string;
  primary_color: string | null;
  public_accent_color: string | null;
  logo_url: string | null;
  banner_url: string | null;
  public_display_name: string | null;
};

type SettingsData = {
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  logo_url: string | null;
  accent_color: string | null;
  cover_image_url: string | null;
};

type SettingsFormProps = {
  restaurant: RestaurantData;
  settings: SettingsData;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  trialEndDate: string | null;
  isOwnerDev: boolean;
  publicOrigin: string;
  notificationPrefs: GiftVoucherNotificationPrefs;
  availabilitySettings: {
    opening_hours: OpeningHours;
    max_guests_per_slot: number;
    reservation_slot_interval: number;
    reservation_duration: number;
  };
};

function establishmentSnapshot(values: {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  logoUrl: string;
  primaryColor: string;
}) {
  return JSON.stringify(values);
}

export default function SettingsForm({
  restaurant,
  settings,
  subscriptionPlan,
  subscriptionStatus,
  trialEndDate,
  isOwnerDev,
  publicOrigin,
  notificationPrefs,
  availabilitySettings,
}: SettingsFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const giftPanelRef = useRef<GiftVoucherSettingsHandle | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<SettingsSectionId>(() =>
    parseSettingsSection(searchParams.get("section")),
  );
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description ?? "");
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [email, setEmail] = useState(restaurant.email ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(settings.website_url ?? "");
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url ?? "");
  const [facebookUrl, setFacebookUrl] = useState(settings.facebook_url ?? "");
  const [logoUrl, setLogoUrl] = useState(settings.logo_url ?? restaurant.logo_url ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    normalizeHexColor(
      restaurant.public_accent_color || restaurant.primary_color || settings.accent_color || DEFAULT_PRIMARY,
      DEFAULT_PRIMARY,
    ),
  );
  const [prefs, setPrefs] = useState<GiftVoucherNotificationPrefs>(notificationPrefs);
  const initialEstablishment = useRef(
    establishmentSnapshot({
      name: restaurant.name,
      description: restaurant.description ?? "",
      address: restaurant.address ?? "",
      phone: restaurant.phone ?? "",
      email: restaurant.email ?? "",
      websiteUrl: settings.website_url ?? "",
      instagramUrl: settings.instagram_url ?? "",
      facebookUrl: settings.facebook_url ?? "",
      logoUrl: settings.logo_url ?? restaurant.logo_url ?? "",
      primaryColor: normalizeHexColor(
        restaurant.public_accent_color || restaurant.primary_color || settings.accent_color || DEFAULT_PRIMARY,
        DEFAULT_PRIMARY,
      ),
    }),
  );
  const initialPrefs = useRef(JSON.stringify(notificationPrefs));

  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveButtonSuccess, setSaveButtonSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [giftDirty, setGiftDirty] = useState(false);

  const establishmentDirty =
    establishmentSnapshot({
      name,
      description,
      address,
      phone,
      email,
      websiteUrl,
      instagramUrl,
      facebookUrl,
      logoUrl,
      primaryColor,
    }) !== initialEstablishment.current;
  const notificationsDirty = JSON.stringify(prefs) !== initialPrefs.current;

  const sectionHasForm =
    activeSection === "establishment" || activeSection === "gift-cards" || activeSection === "notifications";
  const isDirty =
    activeSection === "gift-cards"
      ? giftDirty
      : activeSection === "notifications"
        ? notificationsDirty
        : activeSection === "establishment"
          ? establishmentDirty
          : false;

  useEffect(() => {
    setActiveSection(parseSettingsSection(searchParams.get("section")));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) setAuthEmail(data.user?.email ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!establishmentDirty && !notificationsDirty && !giftDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [establishmentDirty, notificationsDirty, giftDirty]);

  const onGiftDirtyChange = useCallback((dirty: boolean) => setGiftDirty(dirty), []);

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const invalid = validateRestaurantImageFile(file);
    if (invalid) {
      setMessageTone("error");
      setMessage(invalid);
      event.target.value = "";
      return;
    }
    setIsUploadingLogo(true);
    setMessage(null);
    try {
      const { publicUrl } = await uploadRestaurantPublicAsset(supabase, restaurant.id, "logo", file, {
        extension: imageExtensionForUpload(file),
      });
      setLogoUrl(publicUrl);
      setMessageTone("success");
      setMessage("Logo chargé. Enregistrez pour l’appliquer partout.");
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Impossible de charger le logo.");
    } finally {
      setIsUploadingLogo(false);
      event.target.value = "";
    }
  }

  async function saveEstablishment(): Promise<boolean> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessageTone("error");
      setMessage("Le nom de l’établissement est obligatoire.");
      return false;
    }
    const color = normalizeHexColor(primaryColor, DEFAULT_PRIMARY);
    const { error: restaurantError } = await supabase
      .from("restaurants")
      .update({
        name: trimmedName,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        description: description.trim() || null,
        logo_url: logoUrl.trim() || null,
        primary_color: color,
        public_accent_color: color,
      })
      .eq("id", restaurant.id);

    if (restaurantError) {
      setMessageTone("error");
      setMessage(restaurantError.message);
      return false;
    }

    const { error: settingsError } = await supabase.from("restaurant_settings").upsert(
      {
        restaurant_id: restaurant.id,
        website_url: websiteUrl.trim() || null,
        instagram_url: instagramUrl.trim() || null,
        facebook_url: facebookUrl.trim() || null,
        logo_url: logoUrl.trim() || null,
        accent_color: color,
      },
      { onConflict: "restaurant_id" },
    );

    if (settingsError) {
      setMessageTone("error");
      setMessage(settingsError.message);
      return false;
    }

    initialEstablishment.current = establishmentSnapshot({
      name: trimmedName,
      description: description.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      websiteUrl: websiteUrl.trim(),
      instagramUrl: instagramUrl.trim(),
      facebookUrl: facebookUrl.trim(),
      logoUrl: logoUrl.trim(),
      primaryColor: color,
    });
    return true;
  }

  async function saveNotifications(): Promise<boolean> {
    const { error } = await supabase.from("restaurant_settings").upsert(
      {
        restaurant_id: restaurant.id,
        notify_gift_voucher_created: prefs.notify_gift_voucher_created,
        notify_gift_voucher_request: prefs.notify_gift_voucher_request,
        notify_gift_voucher_redeemed: prefs.notify_gift_voucher_redeemed,
        notify_gift_voucher_fully_used: prefs.notify_gift_voucher_fully_used,
      },
      { onConflict: "restaurant_id" },
    );
    if (error) {
      setMessageTone("error");
      setMessage(error.message);
      return false;
    }
    initialPrefs.current = JSON.stringify(prefs);
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || !isDirty) return;
    setIsSaving(true);
    setMessage(null);
    try {
      let ok = true;
      if (activeSection === "gift-cards") {
        ok = (await giftPanelRef.current?.save()) ?? false;
      } else if (activeSection === "notifications") {
        ok = await saveNotifications();
      } else {
        ok = await saveEstablishment();
      }
      if (ok) {
        setMessageTone("success");
        setMessage("Modifications enregistrées.");
        setSaveButtonSuccess(true);
        window.setTimeout(() => setSaveButtonSuccess(false), 2000);
        router.refresh();
      }
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "L’enregistrement a échoué.");
    } finally {
      setIsSaving(false);
    }
  }

  const saveHint = useMemo(() => {
    if (message) return message;
    if (isDirty) return "Modifications non enregistrées.";
    return "Aucune modification à enregistrer.";
  }, [isDirty, message]);

  return (
    <>
      <form id="settings-main-form" onSubmit={handleSubmit} className="relative mx-auto max-w-5xl space-y-6 pb-28">
        <SettingsSectionTabs value={activeSection} onChange={setActiveSection} />

        {activeSection === "establishment" ? (
          <div className="space-y-6">
            <SettingsCategoryCard
              icon={Store}
              iconWrapClassName="bg-zg-accent/15 text-zg-accent"
              iconClassName="text-zg-accent"
              title="Informations de l'établissement"
              subtitle="Identité, coordonnées et présentation."
            >
              <SettingsAccordion title="Identité" defaultOpen>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label" htmlFor="settings-name">
                      Nom de l’établissement
                    </label>
                    <Input id="settings-name" value={name} onChange={(event) => setName(event.target.value)} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label">Logo</label>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoUrl}
                          alt=""
                          className="h-16 w-16 rounded-xl border border-zg-border bg-white object-contain"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-zg-border text-sm font-semibold text-zg-accent">
                          {(name || "É").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={handleLogoUpload}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isUploadingLogo}
                          onClick={() => logoInputRef.current?.click()}
                        >
                          {isUploadingLogo ? "Chargement…" : "Choisir un logo"}
                        </Button>
                        {logoUrl ? (
                          <Button type="button" variant="ghost" size="sm" className="ml-2" onClick={() => setLogoUrl("")}>
                            Retirer
                          </Button>
                        ) : null}
                        <p className="mt-1.5 text-xs text-zg-text-muted">JPG, PNG ou WebP · 10 Mo max.</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label" htmlFor="settings-description">
                      Description
                    </label>
                    <Textarea
                      id="settings-description"
                      className="min-h-24"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label" htmlFor="settings-color">
                      Couleur principale
                    </label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <Input
                        id="settings-color"
                        type="color"
                        value={normalizeHexColor(primaryColor, DEFAULT_PRIMARY)}
                        onChange={(event) => setPrimaryColor(event.target.value)}
                        className="h-11 w-14 p-1"
                        aria-label="Couleur principale"
                      />
                      <Input value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
                    </div>
                    <p className="mt-1.5 text-xs text-zg-text-muted">
                      Utilisée sur la page publique, les bons, les PDF et les passes Wallet (sauf couleur spécifique aux
                      bons).
                    </p>
                  </div>
                </div>
              </SettingsAccordion>
              <SettingsAccordion title="Coordonnées" defaultOpen>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label" htmlFor="settings-address">
                      Adresse complète
                    </label>
                    <Input id="settings-address" value={address} onChange={(event) => setAddress(event.target.value)} />
                  </div>
                  <div>
                    <label className="dashboard-field-label" htmlFor="settings-phone">
                      Téléphone
                    </label>
                    <Input id="settings-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
                  </div>
                  <div>
                    <label className="dashboard-field-label" htmlFor="settings-email">
                      E-mail de contact
                    </label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="dashboard-field-label" htmlFor="settings-website">
                      Site internet
                    </label>
                    <Input
                      id="settings-website"
                      value={websiteUrl}
                      onChange={(event) => setWebsiteUrl(event.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="dashboard-field-label" htmlFor="settings-instagram">
                      Instagram
                    </label>
                    <Input
                      id="settings-instagram"
                      value={instagramUrl}
                      onChange={(event) => setInstagramUrl(event.target.value)}
                      placeholder="https://instagram.com/…"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="dashboard-field-label" htmlFor="settings-facebook">
                      Facebook
                    </label>
                    <Input
                      id="settings-facebook"
                      value={facebookUrl}
                      onChange={(event) => setFacebookUrl(event.target.value)}
                      placeholder="https://facebook.com/…"
                    />
                  </div>
                </div>
              </SettingsAccordion>
            </SettingsCategoryCard>

            <SettingsCategoryCard
              icon={Store}
              iconWrapClassName="bg-[#3B82F6]/15 text-[#3B82F6]"
              iconClassName="text-[#3B82F6]"
              title="Horaires d’ouverture"
              subtitle="Affichés sur la page publique. Enregistrement indépendant ci-dessous."
            >
              <AvailabilityEditor
                embedded
                embeddedPart="hours"
                restaurantId={restaurant.id}
                settings={availabilitySettings}
              />
            </SettingsCategoryCard>

            <SettingsCategoryCard
              icon={UserRound}
              iconWrapClassName="bg-[#22C55E]/15 text-[#22C55E]"
              iconClassName="text-[#22C55E]"
              title="Compte"
              subtitle="Connexion et apparence du tableau de bord."
            >
              <SettingsAccordion title="Profil" defaultOpen>
                <div className="space-y-4">
                  <div>
                    <label className="dashboard-field-label">E-mail de connexion</label>
                    <Input readOnly value={authEmail ?? ""} />
                  </div>
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
              </SettingsAccordion>
              <SettingsAccordion title="Apparence" defaultOpen>
                <DashboardThemeToggle />
              </SettingsAccordion>
              <SettingsAccordion title="Zone de danger" danger>
                <p className="text-sm text-zg-muted">
                  La suppression de compte n’est pas disponible en libre-service. Contactez le support pour une demande
                  définitive.
                </p>
              </SettingsAccordion>
            </SettingsCategoryCard>
          </div>
        ) : null}

        {activeSection === "gift-cards" ? (
          <SettingsCategoryCard
            icon={Gift}
            iconWrapClassName="bg-zg-accent/15 text-zg-accent"
            iconClassName="text-zg-accent"
            title="Bons cadeaux"
            subtitle="Personnalisation du PDF, de la page publique du bon et d’Apple Wallet."
          >
            <GiftVoucherSettingsPanel
              ref={giftPanelRef}
              restaurantId={restaurant.id}
              displayName={restaurant.public_display_name?.trim() || name || "Établissement"}
              logoUrl={logoUrl}
              pageCoverUrl={settings.cover_image_url ?? restaurant.banner_url ?? ""}
              accentColor={primaryColor}
              phone={phone}
              email={email}
              address={address}
              onDirtyChange={onGiftDirtyChange}
            />
          </SettingsCategoryCard>
        ) : null}

        {activeSection === "payments" ? (
          <PaymentsSettingsPanel
            subscriptionStatus={subscriptionStatus}
            subscriptionPlan={subscriptionPlan}
            trialEndDate={trialEndDate}
            isOwnerDev={isOwnerDev}
          />
        ) : null}

        {activeSection === "sales-channels" ? (
          <SalesChannelsPanel origin={publicOrigin} slug={restaurant.slug} />
        ) : null}

        {activeSection === "notifications" ? (
          <SettingsCategoryCard
            icon={Bell}
            iconWrapClassName="bg-[#F59E0B]/15 text-[#F59E0B]"
            iconClassName="text-[#F59E0B]"
            title="Notifications"
            subtitle="Alertes in-app réellement envoyées pour vos bons."
          >
            <SettingsAccordion title="Bons cadeaux" defaultOpen>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zg-fg">Nouveau bon créé manuellement</p>
                    <p className="mt-0.5 text-xs text-zg-text-muted">Lorsqu’un bon est émis depuis le tableau de bord.</p>
                  </div>
                  <Toggle
                    checked={prefs.notify_gift_voucher_created}
                    onChange={(value) => setPrefs((current) => ({ ...current, notify_gift_voucher_created: value }))}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zg-fg">Nouvelle demande depuis la page publique</p>
                    <p className="mt-0.5 text-xs text-zg-text-muted">
                      Quand un client envoie le formulaire de la section bons cadeaux.
                    </p>
                  </div>
                  <Toggle
                    checked={prefs.notify_gift_voucher_request}
                    onChange={(value) => setPrefs((current) => ({ ...current, notify_gift_voucher_request: value }))}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zg-fg">Bon utilisé partiellement</p>
                    <p className="mt-0.5 text-xs text-zg-text-muted">Après un encaissement qui laisse un solde.</p>
                  </div>
                  <Toggle
                    checked={prefs.notify_gift_voucher_redeemed}
                    onChange={(value) => setPrefs((current) => ({ ...current, notify_gift_voucher_redeemed: value }))}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zg-fg">Bon entièrement utilisé</p>
                    <p className="mt-0.5 text-xs text-zg-text-muted">Quand le solde arrive à zéro.</p>
                  </div>
                  <Toggle
                    checked={prefs.notify_gift_voucher_fully_used}
                    onChange={(value) => setPrefs((current) => ({ ...current, notify_gift_voucher_fully_used: value }))}
                  />
                </div>
              </div>
            </SettingsAccordion>
            <p className="text-sm text-zg-text-muted">
              Les demandes d’avis Google se configurent dans{" "}
              <Link href="/dashboard/reputation" className="font-medium text-zg-accent hover:underline">
                Avis Google
              </Link>
              . Les rappels d’expiration et les e-mails de remboursement ne sont pas proposés : ils n’existent pas
              encore.
            </p>
          </SettingsCategoryCard>
        ) : null}

        {activeSection === "site-integration" ? (
          <SiteIntegrationPanel origin={publicOrigin} slug={restaurant.slug} />
        ) : null}
      </form>

      {sectionHasForm ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 pt-10">
          <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl border border-zg-border bg-zg-surface/95 px-4 py-3 shadow-lg backdrop-blur-md">
            <p className="min-w-0 truncate text-sm text-zg-text-muted">
              {message ? (
                <span className={messageTone === "error" ? "text-zg-danger" : "text-zg-fg"}>{saveHint}</span>
              ) : (
                <span>{saveHint}</span>
              )}
            </p>
            <Button
              type="submit"
              form="settings-main-form"
              disabled={isSaving || !isDirty}
              className="min-h-11 shrink-0 px-6"
            >
              {saveButtonSuccess ? "Enregistré ✓" : isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
