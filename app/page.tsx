import type { Metadata } from "next";
import { LandingPage } from "@/components/zg-landing/LandingPage";

export const metadata: Metadata = {
  title: "ZenGrow — Remplissez votre restaurant grâce à l'IA",
  description:
    "ZenGrow aide les restaurants à obtenir plus de réservations, faire revenir leurs clients et récolter plus d'avis Google grâce à une plateforme simple basée sur l'intelligence artificielle.",
};

export default function Home() {
  return <LandingPage />;
}
