import type { Metadata } from "next";
import { LandingPage } from "@/components/fitme-landing/LandingPage";
import { PRODUCT, SEO } from "@/components/fitme-landing/config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl.replace(/\/$/, "")) } : {}),
  title: { absolute: SEO.title },
  description: SEO.description,
  applicationName: PRODUCT.name,
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    type: "website",
    locale: "fr_CH",
    siteName: PRODUCT.name,
    images: [
      {
        url: SEO.ogImage,
        width: 735,
        height: 980,
        alt: SEO.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.title,
    description: SEO.description,
    images: [SEO.ogImage],
  },
};

export default function Home() {
  return <LandingPage />;
}
