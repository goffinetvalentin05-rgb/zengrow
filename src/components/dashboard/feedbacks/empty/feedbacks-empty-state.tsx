"use client";

import EmptyState from "@/src/components/ui/empty-state";
import { Star } from "lucide-react";

export default function FeedbacksEmptyState() {
  return (
    <EmptyState
      icon={Star}
      title="Aucun retour client pour l’instant."
      description="Les premiers arriveront après la mise en place de l’automatisation (Paramètres → Avis Google)."
    />
  );
}
