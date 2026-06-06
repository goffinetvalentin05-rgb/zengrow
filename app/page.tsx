import type { Metadata } from "next";
import { LandingPage } from "@/components/zg-landing/LandingPage";

export const metadata: Metadata = {
  title: "ZenGrow — L'IA qui fait revenir vos clients",
  description:
    "Ajoutez le numéro de vos clients. ZenGrow relance ceux qui ne seraient peut-être jamais revenus et récupère du chiffre d'affaires — sans effort.",
};

export default function Home() {
  return <LandingPage />;
}
