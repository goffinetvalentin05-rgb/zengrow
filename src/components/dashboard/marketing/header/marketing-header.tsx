"use client";

import PageHeader from "@/src/components/dashboard/page-header";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import { Sparkles } from "lucide-react";

export default function MarketingHeader() {
  const { showCreateForm, openCreateForm, closeCreateForm } = useMarketing();

  return (
    <PageHeader
      title="Campagnes IA"
      subtitle="Créez des campagnes personnalisées pour vos acheteurs."
      primaryAction={{
        kind: "button",
        label: showCreateForm ? "Annuler" : "Nouvelle campagne",
        icon: <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />,
        onClick: showCreateForm ? closeCreateForm : openCreateForm,
      }}
    />
  );
}
