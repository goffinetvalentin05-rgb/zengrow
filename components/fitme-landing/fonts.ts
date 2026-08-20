import { Outfit, Syne } from "next/font/google";

export const fitmeDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-fitme-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const fitmeBody = Outfit({
  subsets: ["latin"],
  variable: "--font-fitme-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});
