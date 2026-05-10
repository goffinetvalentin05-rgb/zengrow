"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { slugifyRestaurantName } from "@/src/lib/utils";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

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
    <main className="relative min-h-screen overflow-hidden bg-[#F6FBFA] text-[#0F3F3A]">
      <div className="absolute left-1/2 top-16 -z-10 h-[420px] w-[min(90vw,760px)] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#1F7A6C]/20 via-[#3DBE9F]/15 to-transparent blur-3xl" />
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-start justify-center px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <section className="w-full rounded-[30px] border border-[#DDEFEA] bg-white/95 p-5 shadow-[0_35px_70px_-45px_rgba(15,63,58,0.7)] sm:p-7 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="inline-flex">
              <Image
                src="/Zengrow-logo.png"
                alt="Logo ZenGrow"
                width={165}
                height={46}
                className="h-8 w-auto object-contain sm:h-10"
                priority
              />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#CBE6DF] bg-white px-4 py-2 text-sm font-medium text-[#0F3F3A]/80 transition hover:border-[#A3D8CC] hover:bg-[#F0F9F7] hover:text-[#0F3F3A]"
            >
              Déjà un compte ?
            </Link>
          </div>

          <div className="mt-6">
            <span className="inline-flex rounded-full border border-[#CBE6DF] bg-[#F4FCF9] px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#1F7A6C]">
              ONBOARDING RESTAURATEUR
            </span>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Configurez votre restaurant en quelques minutes
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#0F3F3A]/70 sm:text-base">
              Créez votre compte ZenGrow et préparez directement votre page de réservation publique.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <section className="rounded-3xl border border-[#DDEFEA] bg-[#FBFEFD] p-4 sm:p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1F7A6C]">Compte</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="restaurantName"
                    className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80"
                  >
                    Nom du restaurant
                  </label>
                  <Input
                    id="restaurantName"
                    value={restaurantName}
                    onChange={(event) => setRestaurantName(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#DDEFEA] bg-[#FBFEFD] p-4 sm:p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1F7A6C]">
                Restaurant
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Téléphone
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Adresse
                  </label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Ville
                  </label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Pays
                  </label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#DDEFEA] bg-[#FBFEFD] p-4 sm:p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1F7A6C]">
                Réservations
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="tableCount" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Nombre de tables
                  </label>
                  <Input
                    id="tableCount"
                    type="number"
                    min={1}
                    value={tableCount}
                    onChange={(event) => setTableCount(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="maxPeople" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Nombre maximum de personnes
                  </label>
                  <Input
                    id="maxPeople"
                    type="number"
                    min={1}
                    value={maxPeople}
                    onChange={(event) => setMaxPeople(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="averageMealDuration"
                    className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80"
                  >
                    Durée moyenne d&apos;un repas (minutes)
                  </label>
                  <Input
                    id="averageMealDuration"
                    type="number"
                    min={30}
                    step={5}
                    value={averageMealDuration}
                    onChange={(event) => setAverageMealDuration(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#DDEFEA] bg-[#FBFEFD] p-4 sm:p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1F7A6C]">
                Personnalisation
              </h2>
              <p className="mt-2 text-sm text-[#0F3F3A]/65">
                Ces informations sont optionnelles. Vous pourrez les modifier plus tard dans les
                paramètres.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="logoFile" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Logo du restaurant
                  </label>
                  <input
                    id="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block h-11 w-full rounded-2xl border border-[#CEE8E2] bg-white px-3 py-2 text-sm text-[#0F3F3A] file:mr-3 file:rounded-full file:border-0 file:bg-[#EAF8F4] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#1F7A6C]"
                  />
                  {logoFile ? <p className="mt-1 text-xs text-[#0F3F3A]/60">{logoFile.name}</p> : null}
                </div>
                <div>
                  <label
                    htmlFor="bannerFile"
                    className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80"
                  >
                    Bannière / image de couverture
                  </label>
                  <input
                    id="bannerFile"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="block h-11 w-full rounded-2xl border border-[#CEE8E2] bg-white px-3 py-2 text-sm text-[#0F3F3A] file:mr-3 file:rounded-full file:border-0 file:bg-[#EAF8F4] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#1F7A6C]"
                  />
                  {bannerFile ? <p className="mt-1 text-xs text-[#0F3F3A]/60">{bannerFile.name}</p> : null}
                </div>
                <div>
                  <label
                    htmlFor="primaryColor"
                    className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80"
                  >
                    Couleur principale du restaurant
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(event) => setPrimaryColor(event.target.value)}
                      className="h-11 w-16 cursor-pointer rounded-xl border-[#CEE8E2] p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(event) => setPrimaryColor(event.target.value)}
                      className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80"
                  >
                    Description du restaurant
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-[#CEE8E2] bg-white px-3 py-2.5 text-sm text-[#0F3F3A] outline-none transition placeholder:text-[#0F3F3A]/35 focus:border-[#3DBE9F] focus:ring-2 focus:ring-[#c8efe4]"
                    placeholder="Cuisine, ambiance, spécialités..."
                  />
                </div>
                <div>
                  <label htmlFor="instagram" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Instagram
                  </label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(event) => setInstagram(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    placeholder="https://instagram.com/votre-resto"
                  />
                </div>
                <div>
                  <label htmlFor="website" className="mb-1.5 block text-sm font-medium text-[#0F3F3A]/80">
                    Site web
                  </label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    className="h-11 rounded-2xl border-[#CEE8E2] focus:border-[#3DBE9F] focus:ring-[#c8efe4]"
                    placeholder="https://www.votre-resto.ch"
                  />
                </div>
              </div>
            </section>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-sm font-semibold text-white shadow-[0_16px_36px_-18px_rgba(31,122,108,0.9)] hover:scale-[1.01] hover:bg-gradient-to-r"
            >
              {isLoading ? "Création..." : "Créer mon restaurant"}
            </Button>
          </form>

          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          {info && <p className="mt-4 text-sm font-medium text-[#1F7A6C]">{info}</p>}
        </section>
      </div>
    </main>
  );
}
