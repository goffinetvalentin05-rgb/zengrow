import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicStorefrontPage, { storefrontFontsHref } from "@/src/components/public-storefront/public-storefront-page";
import { loadPublishedStorefront } from "@/src/lib/public-storefront/load-published";

type PublicReservationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicReservationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadPublishedStorefront(slug);
  if (!loaded) return { title: "Établissement introuvable" };

  const { identity, config } = loaded;
  const title = config.hero.title.trim() || identity.displayName;
  const description =
    config.hero.subtitle.trim() ||
    config.offers.subtitle.trim() ||
    `Bons cadeaux ${identity.displayName}`;
  const ogImage = config.hero.coverImageUrl || identity.coverUrl || identity.logoUrl || undefined;

  return {
    title,
    description,
    themeColor: config.style.backgroundColor,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function PublicReservationPage({ params }: PublicReservationPageProps) {
  const { slug } = await params;
  const loaded = await loadPublishedStorefront(slug);
  if (!loaded) notFound();

  const fontsHref = storefrontFontsHref(loaded.config);

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
        <PublicStorefrontPage config={loaded.config} identity={loaded.identity} offers={loaded.offers} />
      </main>
    </>
  );
}
