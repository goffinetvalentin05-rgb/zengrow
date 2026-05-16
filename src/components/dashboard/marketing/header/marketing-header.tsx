"use client";

import PageHeader from "@/src/components/dashboard/page-header";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import { Megaphone } from "lucide-react";

export default function MarketingHeader() {
  const { showCreateForm, openCreateForm, closeCreateForm } = useMarketing();

  return (
    <PageHeader
      title="Marketing"
      subtitle="Restez en contact avec vos clients et faites-les revenir"
      primaryAction={{
        kind: "button",
        label: showCreateForm ? "Annuler" : "Nouvelle campagne",
        icon: <Megaphone className="h-4 w-4" strokeWidth={2} aria-hidden />,
        onClick: showCreateForm ? closeCreateForm : openCreateForm,
      }}
    />
  );
}
