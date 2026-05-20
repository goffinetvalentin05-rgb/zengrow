import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicLandingPage from "@/src/components/reservation/public-landing-page";
import { buildPublicRestaurantPageProps } from "@/src/lib/public-page/build-public-restaurant-props";
import { effectiveHeroSubtitle, effectiveHeroTitle } from "@/src/lib/public-page/defaults";
import type { PublicAmbiance } from "@/src/lib/public-page/constants";
import { loadRestaurant } from "@/src/lib/public-page/load-public-restaurant";

type PublicReservationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicReservationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadRestaurant(slug);
  if (!loaded) return { title: "Restaurant introuvable" };

  const { restaurant, settings } = loaded;
  const displayName = restaurant.public_display_name?.trim() || restaurant.name;
  const title =
    restaurant.public_seo_title?.trim() ||
    effectiveHeroTitle(restaurant.public_hero_title ?? "", displayName);
  const description =
    restaurant.public_seo_description?.trim() ||
    effectiveHeroSubtitle(
      restaurant.public_tagline ?? "",
      restaurant.cuisine_type ?? "",
      restaurant.city ?? "",
      (restaurant.public_ambiance as PublicAmbiance | null) ?? null,
    );

  const gallery = (settings?.gallery_image_urls ?? []).filter(Boolean);
  const featuredIdx = settings?.featured_gallery_index ?? 0;
  const ogImage =
    restaurant.banner_url ??
    settings?.cover_image_url ??
    gallery[featuredIdx] ??
    gallery[0] ??
    undefined;

  const themeColor = restaurant.page_background_color?.trim() || "#0A0A0B";

  return {
    title,
    description,
    themeColor,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function PublicReservationPage({ params }: PublicReservationPageProps) {
  const { slug } = await params;
  const loaded = await loadRestaurant(slug);

  if (!loaded) {
    notFound();
  }

  const { formProps, fontsHref } = buildPublicRestaurantPageProps(loaded);

  return (
    <>
      {fontsHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontsHref} />
        </>
      ) : null}
      <main className="min-h-[100dvh] min-h-dvh w-full">
        <PublicLandingPage {...formProps} />
      </main>
    </>
  );
}
