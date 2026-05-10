import type { Metadata } from "next";
import { ZenGrowLanding } from "@/src/components/landing/zen-grow-landing";

export const metadata: Metadata = {
  title: "ZenGrow — Page restaurant moderne & plateforme",
  description:
    "ZenGrow : une page restaurant rapide et professionnelle pour que vos clients comprennent vite et réservent tout de suite — avec une plateforme pour réservations, clients, campagnes, événements et avis Google.",
};

export default function Home() {
  return <ZenGrowLanding />;
}
