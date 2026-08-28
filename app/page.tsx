import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { fr } from "@/components/landing/locales/fr";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl.replace(/\/$/, "")) } : {}),
  title: { absolute: fr.meta.title },
  description: fr.meta.description,
  applicationName: fr.brand.name,
  alternates: {
    languages: {
      fr: "/",
      en: "/",
    },
  },
  openGraph: {
    title: fr.meta.title,
    description: fr.meta.description,
    type: "website",
    locale: "fr_CH",
    alternateLocale: ["en_US"],
    siteName: fr.brand.name,
  },
  twitter: {
    card: "summary_large_image",
    title: fr.meta.title,
    description: fr.meta.description,
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`);
  }
  if (params.error) {
    redirect("/pro/login?error=oauth");
  }
  return <LandingPage />;
}
