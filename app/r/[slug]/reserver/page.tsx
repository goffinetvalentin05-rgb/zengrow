import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicReservationRoutePage from "@/src/components/reservation/public-reservation-route-page";
import { buildPublicRestaurantPageProps } from "@/src/lib/public-page/build-public-restaurant-props";
import { loadRestaurant } from "@/src/lib/public-page/load-public-restaurant";

type PublicReserverPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicReserverPageProps): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadRestaurant(slug);
  if (!loaded) return { title: "Restaurant introuvable" };

  const { displayName, themeColor } = buildPublicRestaurantPageProps(loaded);
  const title = `Réserver — ${displayName}`;

  return {
    title,
    description: `Réservez une table chez ${displayName}.`,
    themeColor,
  };
}

export default async function PublicReserverPage({ params }: PublicReserverPageProps) {
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
        <PublicReservationRoutePage {...formProps} />
      </main>
    </>
  );
}
