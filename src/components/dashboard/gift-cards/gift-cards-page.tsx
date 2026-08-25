"use client";

import { useMemo, useState } from "react";
import CreateGiftCardModal from "@/src/components/dashboard/gift-cards/create-gift-card-modal";
import GiftCardDetailDrawer from "@/src/components/dashboard/gift-cards/gift-card-detail-drawer";
import GiftCardTable from "@/src/components/dashboard/gift-cards/gift-card-table";
import { MOCK_GIFT_CARDS } from "@/src/components/dashboard/gift-cards/mock-data";
import type { GiftCardRecord, GiftCardTypeFilter } from "@/src/components/dashboard/gift-cards/types";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import PageHeader from "@/src/components/dashboard/page-header";
import Tabs from "@/src/components/ui/tabs";

const FILTER_TABS: { id: GiftCardTypeFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "digital", label: "Digitaux" },
  { id: "paper", label: "Papier" },
];

export default function GiftCardsPage() {
  const showToast = useDashboardToast();
  const [filter, setFilter] = useState<GiftCardTypeFilter>("all");
  const [selected, setSelected] = useState<GiftCardRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return MOCK_GIFT_CARDS;
    return MOCK_GIFT_CARDS.filter((card) => card.type === filter);
  }, [filter]);

  function notifyMock(message: string) {
    showToast({ message: `${message} — aperçu uniquement pour le moment.` });
  }

  return (
    <section className="w-full min-w-0 space-y-6 md:space-y-8">
      <PageHeader
        title="Bons cadeaux"
        subtitle="Gérez tous vos bons digitaux et papier au même endroit."
        primaryAction={{
          kind: "button",
          label: "+ Créer un bon",
          onClick: () => setCreateOpen(true),
        }}
      />

      <Tabs
        tabs={FILTER_TABS}
        value={filter}
        onChange={(value) => setFilter(value as GiftCardTypeFilter)}
      />

      <GiftCardTable cards={filtered} onView={setSelected} />

      <GiftCardDetailDrawer
        card={selected}
        onClose={() => setSelected(null)}
        onAction={notifyMock}
      />
      <CreateGiftCardModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onMockCreate={() => {
          setCreateOpen(false);
          notifyMock("Bon créé");
        }}
      />
    </section>
  );
}
