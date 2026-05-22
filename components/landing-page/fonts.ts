import { DM_Sans, Syne } from "next/font/google";

export const landingDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-landing-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const landingBody = DM_Sans({
  subsets: ["latin"],
  variable: "--font-landing-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
