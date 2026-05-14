"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZenGrowAuthCard, ZenGrowAuthPageShell } from "@/src/components/auth/zengrow-auth-page-shell";
import { createClient } from "@/src/lib/supabase/client";
import { slugifyRestaurantName } from "@/src/lib/utils";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

const authFieldLabel = "mb-2 block text-xs font-medium uppercase tracking-wider text-landing-muted";

const authInputClassName =
  "min-h-[44px] w-full rounded-xl border border-landing-border bg-landing-bg px-4 py-3 text-sm text-landing-fg shadow-none placeholder:text-landing-muted/50 transition duration-200 focus:border-landing-accent focus:ring-2 focus:ring-landing-accent/20";

const authSubmitClassName =
  "h-12 w-full rounded-xl border-0 bg-landing-accent text-[15px] font-medium text-white shadow-[0_12px_36px_-14px_rgba(255,107,44,0.55)] transition hover:scale-[1.01] hover:bg-landing-accent/90 hover:shadow-[0_18px_44px_-12px_rgba(255,107,44,0.5)] focus-visible:ring-2 focus-visible:ring-landing-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-landing-bg active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-[0_12px_36px_-14px_rgba(255,107,44,0.55)]";

const authSectionClass =
  "rounded-2xl border border-landing-border bg-landing-section/25 p-4 sm:p-5";

const fileInputClassName =
  "block min-h-[44px] w-full cursor-pointer rounded-xl border border-landing-border bg-landing-bg px-3 py-2.5 text-sm text-landing-fg file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-landing-accent/15 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-landing-accent";

const authTextareaClassName =
  "w-full rounded-xl border border-landing-border bg-landing-bg px-4 py-3 text-sm text-landing-fg outline-none transition placeholder:text-landing-muted/50 focus:border-landing-accent focus:ring-2 focus:ring-landing-accent/20";

export default function SignupPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [tableCount, setTableCount] = useState("12");
  const [maxPeople, setMaxPeople] = useState("40");
  const [averageMealDuration, setAverageMealDuration] = useState("90");
  const [description, setDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#1F7A6C");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function uploadAsset(file: File, type: "logo" | "banner", userId: string, slug: string) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filePath = `${userId}/${slug}-${type}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from("restaurant-assets").upload(filePath, file, {
      upsert: true,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("restaurant-assets").getPublicUrl(filePath);
    return data.publicUrl;
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    setLogoFile(event.target.files?.[0] ?? null);
  }

  function handleBannerChange(event: ChangeEvent<HTMLInputElement>) {
    setBannerFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    const slug = slugifyRestaurantName(restaurantName);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          restaurant_name: restaurantName,
          restaurant_slug: slug,
          restaurant_phone: phone,
          restaurant_address: address,
          restaurant_city: city,
          restaurant_country: country,
          restaurant_table_count: Number.parseInt(tableCount, 10),
          restaurant_capacity: Number.parseInt(maxPeople, 10),
          reservation_duration: Number.parseInt(averageMealDuration, 10),
          restaurant_description: description,
          instagram_url: instagram,
          website_url: website,
          primary_color: primaryColor,
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
      return;
    }

    if (!signupData.session) {
      const hasMedia = Boolean(logoFile) || Boolean(bannerFile);
      setInfo(
        hasMedia
          ? "Compte créé. Confirmez votre e-mail puis connectez-vous. Vous pourrez ajouter le logo et la bannière après connexion."
          : "Compte créé. Confirmez votre e-mail puis connectez-vous.",
      );
      setIsLoading(false);
      return;
    }

    let logoUrl: string | null = null;
    let bannerUrl: string | null = null;

    if (logoFile || bannerFile) {
      try {
        const userId = signupData.user?.id ?? "owner";
        const [uploadedLogoUrl, uploadedBannerUrl] = await Promise.all([
          logoFile ? uploadAsset(logoFile, "logo", userId, slug) : Promise.resolve(null),
          bannerFile ? uploadAsset(bannerFile, "banner", userId, slug) : Promise.resolve(null),
        ]);
        logoUrl = uploadedLogoUrl;
        bannerUrl = uploadedBannerUrl;
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? `Compte créé, mais impossible de téléverser les images: ${uploadError.message}`
            : "Compte créé, mais impossible de téléverser les images.",
        );
      }
    }

    const bootstrapResponse = await fetch("/api/bootstrap-restaurant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantName,
        requestedSlug: slug,
        email,
        phone,
        address,
        city,
        country,
        tableCount: Number.parseInt(tableCount, 10),
        maxPeople: Number.parseInt(maxPeople, 10),
        averageMealDuration: Number.parseInt(averageMealDuration, 10),
        description,
        instagram,
        website,
        logoUrl,
        bannerUrl,
        primaryColor,
      }),
    });

    if (!bootstrapResponse.ok) {
      const data = (await bootstrapResponse.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Impossible de créer le restaurant.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <ZenGrowAuthPageShell variant="dark" contentMaxWidthClass="max-w-3xl" footerLine={null}>
      <ZenGrowAuthCard variant="dark">
        <div className="mb-8 flex flex-col items-center text-center">
          <p className="mb-2 font-landing-serif text-3xl italic text-landing-fg">ZenGrow</p>
          <span className="mb-6 inline-flex rounded-full border border-landing-accent/20 bg-landing-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-landing-accent">
            Espace professionnel
          </span>
          <h1 className="mb-2 font-landing-serif text-3xl font-normal text-landing-fg">Crée ton compte</h1>
          <p className="mb-8 text-sm text-landing-muted">Lance ta page restaurant en 10 minutes.</p>
          <p className="mb-8 max-w-lg text-pretty text-xs text-landing-muted">
            Aucune carte bancaire requise pour commencer. Tu paies uniquement quand tu mets ta page en ligne.
          </p>
        </div>

        <form
          className="max-h-[min(calc(100vh-12rem),880px)] space-y-5 overflow-y-auto pr-0.5 sm:max-h-none sm:overflow-visible"
          onSubmit={handleSubmit}
        >
          <section className={authSectionClass}>
            <h2 className="text-xs font-medium uppercase tracking-wider text-landing-accent">Compte</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="restaurantName" className={authFieldLabel}>
                  Nom du restaurant
                </label>
                <Input
                  id="restaurantName"
                  value={restaurantName}
                  onChange={(event) => setRestaurantName(event.target.value)}
                  className={authInputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className={authFieldLabel}>
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={authInputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className={authFieldLabel}>
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={authInputClassName}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </section>

          <section className={authSectionClass}>
            <h2 className="text-xs font-medium uppercase tracking-wider text-landing-accent">Restaurant</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="phone" className={authFieldLabel}>
                  Téléphone
                </label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className={authInputClassName}
                />
              </div>
              <div>
                <label htmlFor="address" className={authFieldLabel}>
                  Adresse
                </label>
                <Input
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className={authInputClassName}
                />
              </div>
              <div>
                <label htmlFor="city" className={authFieldLabel}>
                  Ville
                </label>
                <Input
                  id="city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className={authInputClassName}
                />
              </div>
              <div>
                <label htmlFor="country" className={authFieldLabel}>
                  Pays
                </label>
                <Input
                  id="country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className={authInputClassName}
                />
              </div>
            </div>
          </section>

          <section className={authSectionClass}>
            <h2 className="text-xs font-medium uppercase tracking-wider text-landing-accent">Réservations</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="tableCount" className={authFieldLabel}>
                  Nombre de tables
                </label>
                <Input
                  id="tableCount"
                  type="number"
                  min={1}
                  value={tableCount}
                  onChange={(event) => setTableCount(event.target.value)}
                  className={authInputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="maxPeople" className={authFieldLabel}>
                  Nombre maximum de personnes
                </label>
                <Input
                  id="maxPeople"
                  type="number"
                  min={1}
                  value={maxPeople}
                  onChange={(event) => setMaxPeople(event.target.value)}
                  className={authInputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="averageMealDuration" className={authFieldLabel}>
                  Durée moyenne d&apos;un repas (minutes)
                </label>
                <Input
                  id="averageMealDuration"
                  type="number"
                  min={30}
                  step={5}
                  value={averageMealDuration}
                  onChange={(event) => setAverageMealDuration(event.target.value)}
                  className={authInputClassName}
                  required
                />
              </div>
            </div>
          </section>

          <section className={authSectionClass}>
            <h2 className="text-xs font-medium uppercase tracking-wider text-landing-accent">Personnalisation</h2>
            <p className="mt-2 text-xs text-landing-muted">
              Ces informations sont optionnelles. Vous pourrez les modifier plus tard dans les paramètres.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="logoFile" className={authFieldLabel}>
                  Logo du restaurant
                </label>
                <input
                  id="logoFile"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className={fileInputClassName}
                />
                {logoFile ? <p className="mt-1 text-xs text-landing-muted/80">{logoFile.name}</p> : null}
              </div>
              <div>
                <label htmlFor="bannerFile" className={authFieldLabel}>
                  Bannière / image de couverture
                </label>
                <input
                  id="bannerFile"
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className={fileInputClassName}
                />
                {bannerFile ? <p className="mt-1 text-xs text-landing-muted/80">{bannerFile.name}</p> : null}
              </div>
              <div>
                <label htmlFor="primaryColor" className={authFieldLabel}>
                  Couleur principale du restaurant
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    className={`${authInputClassName} w-16 shrink-0 cursor-pointer p-1`}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    className={authInputClassName}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className={authFieldLabel}>
                  Description du restaurant
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className={authTextareaClassName}
                  placeholder="Cuisine, ambiance, spécialités..."
                />
              </div>
              <div>
                <label htmlFor="instagram" className={authFieldLabel}>
                  Instagram
                </label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(event) => setInstagram(event.target.value)}
                  className={authInputClassName}
                  placeholder="https://instagram.com/votre-resto"
                />
              </div>
              <div>
                <label htmlFor="website" className={authFieldLabel}>
                  Site web
                </label>
                <Input
                  id="website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  className={authInputClassName}
                  placeholder="https://www.votre-resto.ch"
                />
              </div>
            </div>
          </section>

          <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
            {isLoading ? "Création…" : "Créer mon compte"}
          </Button>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-950/50 px-3.5 py-3 text-sm font-medium text-red-200/95">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="mt-4 rounded-xl border border-landing-accent/25 bg-landing-accent/10 px-3.5 py-3 text-sm font-medium text-landing-fg">
            {info}
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-landing-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-landing-accent transition hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-landing-muted/70">
          Réservations en ligne, page web, avis clients — tout ZenGrow, rien de superflu.
        </p>
      </ZenGrowAuthCard>
    </ZenGrowAuthPageShell>
  );
}
