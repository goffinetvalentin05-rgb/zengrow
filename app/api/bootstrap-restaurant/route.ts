import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { getDefaultOpeningHours, slugifyRestaurantName } from "@/src/lib/utils";

type Payload = {
  restaurantName?: string;
  requestedSlug?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tableCount?: number;
  maxPeople?: number;
  averageMealDuration?: number;
  description?: string;
  instagram?: string;
  website?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string;
};

function optionalTrim(value: string | undefined) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function positiveIntegerOrDefault(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  const normalized = Math.trunc(value);
  return normalized > 0 ? normalized : fallback;
}

async function buildUniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string) {
  let candidate = base || "restaurant";
  let index = 1;

  while (true) {
    const { data } = await supabase.from("restaurants").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    index += 1;
    candidate = `${base}-${index}`;
  }
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Payload;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { data: existingRestaurant } = await supabase
    .from("restaurants")
    .select("id, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existingRestaurant) {
    return NextResponse.json({ restaurant: existingRestaurant });
  }

  const metadataName = (user.user_metadata?.restaurant_name as string | undefined) ?? "";
  const metadataSlug = (user.user_metadata?.restaurant_slug as string | undefined) ?? "";
  const metadataPhone = user.user_metadata?.restaurant_phone as string | undefined;
  const metadataAddress = user.user_metadata?.restaurant_address as string | undefined;
  const metadataCity = user.user_metadata?.restaurant_city as string | undefined;
  const metadataCountry = user.user_metadata?.restaurant_country as string | undefined;
  const metadataTableCount = user.user_metadata?.restaurant_table_count as number | undefined;
  const metadataCapacity = user.user_metadata?.restaurant_capacity as number | undefined;
  const metadataDuration = user.user_metadata?.reservation_duration as number | undefined;
  const metadataDescription = user.user_metadata?.restaurant_description as string | undefined;
  const metadataInstagram = user.user_metadata?.instagram_url as string | undefined;
  const metadataWebsite = user.user_metadata?.website_url as string | undefined;
  const metadataLogoUrl = user.user_metadata?.logo_url as string | undefined;
  const metadataBannerUrl = user.user_metadata?.banner_url as string | undefined;
  const metadataPrimaryColor = user.user_metadata?.primary_color as string | undefined;
  const restaurantName = payload.restaurantName?.trim() || metadataName || "Mon restaurant";
  const slugBase = slugifyRestaurantName(payload.requestedSlug || metadataSlug || restaurantName);
  const slug = await buildUniqueSlug(supabase, slugBase);
  const phone = optionalTrim(payload.phone ?? metadataPhone);
  const address = optionalTrim(payload.address ?? metadataAddress);
  const city = optionalTrim(payload.city ?? metadataCity);
  const country = optionalTrim(payload.country ?? metadataCountry);
  const description = optionalTrim(payload.description ?? metadataDescription);
  const instagram = optionalTrim(payload.instagram ?? metadataInstagram);
  const website = optionalTrim(payload.website ?? metadataWebsite);
  const logoUrl = optionalTrim(payload.logoUrl ?? metadataLogoUrl);
  const bannerUrl = optionalTrim(payload.bannerUrl ?? metadataBannerUrl);
  const primaryColor = optionalTrim(payload.primaryColor ?? metadataPrimaryColor) ?? "#1F7A6C";
  const tableCount = positiveIntegerOrDefault(payload.tableCount ?? metadataTableCount, 12);
  const maxPeople = positiveIntegerOrDefault(payload.maxPeople ?? metadataCapacity, 40);
  const averageMealDuration = positiveIntegerOrDefault(
    payload.averageMealDuration ?? metadataDuration,
    90,
  );
  const trialStartDate = new Date();
  const trialEndDate = new Date(trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .insert({
      owner_id: user.id,
      name: restaurantName,
      slug,
      email: optionalTrim(payload.email) ?? user.email ?? null,
      phone,
      address,
      city,
      country,
      description,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      primary_color: primaryColor,
      subscription_status: "trial",
      trial_start_date: trialStartDate.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
    })
    .select("id, slug")
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json(
      { error: restaurantError?.message ?? "Impossible de créer le restaurant." },
      { status: 400 },
    );
  }

  const { error: settingsError } = await supabase.from("restaurant_settings").insert({
    restaurant_id: restaurant.id,
    opening_hours: getDefaultOpeningHours(),
    table_count: tableCount,
    restaurant_capacity: maxPeople,
    max_covers_per_slot: maxPeople,
    reservation_duration: averageMealDuration,
    instagram_url: instagram,
    website_url: website,
    logo_url: logoUrl,
    cover_image_url: bannerUrl,
    button_color: primaryColor,
    accent_color: primaryColor,
  });

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 400 });
  }

  return NextResponse.json({ restaurant });
}
