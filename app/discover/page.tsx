import type { Metadata } from "next";
import { PRODUCT } from "@/components/fitme-landing/config";
import { FitmeShell } from "@/components/fitme-landing/FitmeShell";
import { DiscoverClient } from "./discover-client";

export const metadata: Metadata = {
  title: { absolute: `Découvrir mon style — ${PRODUCT.name}` },
  description:
    "Ajoutez vos photos pour découvrir les styles et les couleurs qui vous mettent réellement en valeur.",
};

export default function DiscoverPage() {
  return (
    <FitmeShell>
      <DiscoverClient />
    </FitmeShell>
  );
}
