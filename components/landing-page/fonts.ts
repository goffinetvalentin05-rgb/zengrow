import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";

export const landingDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-landing-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const landingBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-landing-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
