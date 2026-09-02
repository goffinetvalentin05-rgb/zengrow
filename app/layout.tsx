import type { Metadata, Viewport } from "next";
import { zgBody, zgDisplay } from "@/components/zg-landing/fonts";
import { Cormorant_Garamond, Dancing_Script, Geist, Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import { AppI18nTree } from "@/src/i18n/app-i18n-tree";
import { getRequestLocale } from "@/src/i18n/server";
import { getMessages } from "@/src/locales/app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getMessages(locale);
  return {
    title: {
      default: "Sharpz",
      template: "%s | Sharpz",
    },
    description: t.landing.meta.description,
    applicationName: "Sharpz",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${instrumentSerif.variable} ${cormorant.variable} ${dancingScript.variable} ${zgDisplay.variable} ${zgBody.variable} antialiased`}
      >
        <AppI18nTree initialLocale={locale}>{children}</AppI18nTree>
      </body>
    </html>
  );
}
