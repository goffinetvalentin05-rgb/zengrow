import type { Metadata } from "next";
import { LandingPage } from "@/components/zg-landing/LandingPage";

export const metadata: Metadata = {
  title: "ZenGrow — Vos clients reviennent automatiquement",
  description:
    "Automatisez le retour de vos clients récurrents. Ajoutez vos clients une fois, ZenGrow les recontacte au bon moment pour planifier leur prochain rendez-vous.",
};

export default function Home() {
  return <LandingPage />;
}
