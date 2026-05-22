import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page/LandingPage";

export const metadata: Metadata = {
  title: "ZenGrow — Remplissez votre restaurant grâce à l'IA",
  description:
    "ZenGrow aide les restaurants à obtenir plus de réservations, faire revenir leurs anciens clients et récolter plus d'avis Google grâce à l'IA, aux relances et aux campagnes marketing.",
};

export default function Home() {
  return <LandingPage />;
}
