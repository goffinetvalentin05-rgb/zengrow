import {
  Cormorant_Garamond,
  DM_Sans,
  Inter,
  Lato,
  Merriweather,
  Playfair_Display,
  Source_Sans_3,
} from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-public-playfair",
  display: "swap",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-public-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-cormorant",
  display: "swap",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-public-lato",
  display: "swap",
});
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-public-merriweather",
  display: "swap",
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-public-source-sans",
  display: "swap",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-public-dm-sans", display: "swap" });

export default function PublicRestaurantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable} ${lato.variable} ${merriweather.variable} ${sourceSans.variable} ${dmSans.variable} min-h-screen antialiased`}
      style={{ fontFamily: "var(--font-public-inter), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
