import { createClient } from "@/src/lib/supabase/server";
import { loadRestaurant } from "@/src/lib/public-page/load-public-restaurant";
import { defaultStorefrontConfig } from "@/src/lib/public-storefront/defaults";
import { identityFromRows, type StorefrontIdentity } from "@/src/lib/public-storefront/identity";
import { hydrateStorefrontConfig, type StorefrontConfig } from "@/src/lib/public-storefront/schema";
import type { PublicGiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";

export type PublishedStorefront = {
  identity: StorefrontIdentity;
  offers: PublicGiftVoucherOffer[];
  config: StorefrontConfig;
};

export async function loadPublishedStorefront(slug: string): Promise<PublishedStorefront | null> {
  const loaded = await loadRestaurant(slug);
  if (!loaded) return null;

  const { restaurant, settings, giftVoucherOffers = [] } = loaded;
  const identity = identityFromRows({
    restaurantId: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    displayName: restaurant.public_display_name,
    tagline: restaurant.public_tagline,
    description: restaurant.public_description ?? settings?.public_page_description,
    category: restaurant.cuisine_type,
    address: restaurant.address,
    city: restaurant.city,
    phone: restaurant.phone,
    email: restaurant.email,
    websiteUrl: settings?.website_url,
    logoUrl: settings?.logo_url || restaurant.logo_url,
    coverUrl: settings?.cover_image_url,
    bannerUrl: restaurant.banner_url,
    primaryColor: restaurant.primary_color,
    instagramUrl: settings?.instagram_url,
    facebookUrl: settings?.facebook_url,
    googleMapsUrl: restaurant.google_maps_url,
    openingHours: settings?.opening_hours,
    galleryUrls: settings?.gallery_image_urls,
  });

  const supabase = await createClient();
  const { data: published } = await supabase.rpc("get_restaurant_published_page_by_slug", { p_slug: slug });
  const fallback = defaultStorefrontConfig(identity);

  return {
    identity,
    offers: giftVoucherOffers,
    config: published ? hydrateStorefrontConfig(published, fallback) : fallback,
  };
}
