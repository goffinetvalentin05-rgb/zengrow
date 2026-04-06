import { DM_Sans, Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-public-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export default function PublicRestaurantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} min-h-screen antialiased`}
      style={{ fontFamily: "var(--font-public-sans), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
