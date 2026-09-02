import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { getMessages } from "@/src/locales/app";
import { getRequestLocale } from "@/src/i18n/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getMessages(locale).landing;
  const ogLocale = locale === "en" ? "en_US" : "fr_CH";
  return {
    ...(siteUrl ? { metadataBase: new URL(siteUrl.replace(/\/$/, "")) } : {}),
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
