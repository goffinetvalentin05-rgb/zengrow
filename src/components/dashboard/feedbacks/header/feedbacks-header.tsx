"use client";

import PageHeader from "@/src/components/dashboard/page-header";
import { Settings } from "lucide-react";

export default function FeedbacksHeader() {
  return (
    <PageHeader
      title="Feedbacks"
      subtitle="Avis privés laissés par vos clients après leur visite"
      secondaryActions={[
        {
          kind: "link",
          href: "/dashboard/settings?section=google-reviews",
          label: "Configurer l'envoi automatique",
          icon: <Settings className="h-4 w-4" strokeWidth={2} aria-hidden />,
        },
      ]}
    />
  );
}
