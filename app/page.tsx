import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { getMessages } from "@/src/locales/app";
import { getRequestLocale } from "@/src/i18n/server";
import { getPublicSiteUrl } from "@/src/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getMessages(locale).landing;
  const ogLocale = locale === "en" ? "en_US" : "fr_CH";
  return {
    metadataBase: new URL(getPublicSiteUrl()),
    title: { absolute: t.meta.title },
    description: t.meta.description,
    applicationName: t.brand.name,
    alternates: {
      languages: {
        fr: "/",
        en: "/",
      },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      locale: ogLocale,
      alternateLocale: locale === "en" ? ["fr_CH"] : ["en_US"],
      siteName: t.brand.name,
      url: getPublicSiteUrl(),
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

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
