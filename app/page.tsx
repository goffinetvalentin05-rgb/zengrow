import type { Metadata } from "next";
import { ZenGrowLanding } from "@/src/components/landing/zen-grow-landing";

export const metadata: Metadata = {
  title: "ZenGrow — La découverte devient réservation",
  description:
    "ZenGrow transforme la découverte mobile en réservation instantanée : page restaurant premium, expérience fluide et plateforme pour réservations, clients, campagnes et données.",
};

export default function Home() {
  return <ZenGrowLanding />;
}
