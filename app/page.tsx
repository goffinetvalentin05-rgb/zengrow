import type { Metadata } from "next";
import { LandingPageV2 } from "@/components/landing-v2/LandingPage";

export const metadata: Metadata = {
  title: "ZenGrow — Remplissez votre restaurant grâce à l'IA",
  description:
    "ZenGrow crée votre page de réservation, relance vos anciens clients, génère vos campagnes marketing et vous aide à récolter plus d'avis Google pour inspirer confiance et remplir vos tables plus souvent.",
};

export default function Home() {
  return <LandingPageV2 />;
}
