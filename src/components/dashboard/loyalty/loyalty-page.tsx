"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ScanLine } from "lucide-react";
import AddLoyaltyClientModal from "@/src/components/dashboard/loyalty/add-loyalty-client-modal";
import LoyaltyDetailDrawer from "@/src/components/dashboard/loyalty/loyalty-detail-drawer";
import LoyaltyRewardsPanel from "@/src/components/dashboard/loyalty/loyalty-rewards-panel";
import LoyaltySectionNav from "@/src/components/dashboard/loyalty/loyalty-section-nav";
import LoyaltyTable from "@/src/components/dashboard/loyalty/loyalty-table";
import ScanLoyaltyCardModal from "@/src/components/dashboard/loyalty/scan-loyalty-card-modal";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import PageHeader from "@/src/components/dashboard/page-header";
import Input from "@/src/components/ui/input";
import Tabs from "@/src/components/ui/tabs";
import { defaultLoyaltySettings } from "@/src/lib/loyalty/schemas";
import type { LoyaltyCardRecord, LoyaltyProgramSettings, LoyaltyReward } from "@/src/lib/loyalty/types";

const FILTER_TABS = [
  { id: "all", label: "Tous" },
  { id: "active", label: "Actifs" },
  { id: "reward", label: "Récompense disponible" },
] as const;

type ClientFilter = (typeof FILTER_TABS)[number]["id"];

type LoyaltyPageProps = {
  initialCards: LoyaltyCardRecord[];
  initialRewards: LoyaltyReward[];
  initialSettings: LoyaltyProgramSettings;
  initialScan?: boolean;
  initialAdd?: boolean;
  initialTab?: "clients" | "rewards";
};

export default function LoyaltyPage({
  initialCards,
  initialRewards,
  initialSettings,
  initialScan = false,
  initialAdd = false,
  initialTab = "clients",
}: LoyaltyPageProps) {
  const router = useRouter();
  const showToast = useDashboardToast();
  const [cards, setCards] = useState(initialCards);
  const [rewards, setRewards] = useState(initialRewards);
  const [settings, setSettings] = useState(initialSettings);
  const [seenCards, setSeenCards] = useState(initialCards);
  if (seenCards !== initialCards) {
    setSeenCards(initialCards);
    setCards(initialCards);
  }
  const [seenRewards, setSeenRewards] = useState(initialRewards);
  if (seenRewards !== initialRewards) {
    setSeenRewards(initialRewards);
    setRewards(initialRewards);
  }
  const [seenSettings, setSeenSettings] = useState(initialSettings);
  if (seenSettings !== initialSettings) {
    setSeenSettings(initialSettings);
    setSettings(initialSettings);
  }

  const [section, setSection] = useState<"clients" | "rewards">(initialTab);
  const [filter, setFilter] = useState<ClientFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(initialAdd);
  const [scanOpen, setScanOpen] = useState(initialScan);

  const selected = useMemo(() => cards.find((card) => card.id === selectedId) ?? null, [cards, selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((card) => {
      if (filter === "active" && card.status !== "active") return false;
      if (filter === "reward" && !card.rewardState.bestAvailable) return false;
      if (!q) return true;
      return (
        card.customerName.toLowerCase().includes(q) ||
        card.customerEmail.toLowerCase().includes(q) ||
        card.cardCode.toLowerCase().includes(q) ||
        (card.customerPhone ?? "").toLowerCase().includes(q)
      );
    });
  }, [cards, filter, query]);

  async function refreshFromServer() {
    const [cardsRes, rewardsRes, settingsRes] = await Promise.all([
      fetch("/api/loyalty/cards"),
      fetch("/api/loyalty/rewards"),
      fetch("/api/loyalty/settings"),
    ]);
    const cardsPayload = (await cardsRes.json().catch(() => null)) as { cards?: LoyaltyCardRecord[]; error?: string } | null;
    const rewardsPayload = (await rewardsRes.json().catch(() => null)) as { rewards?: LoyaltyReward[] } | null;
    const settingsPayload = (await settingsRes.json().catch(() => null)) as { settings?: LoyaltyProgramSettings } | null;
    if (!cardsRes.ok || !cardsPayload?.cards) {
      throw new Error(cardsPayload?.error ?? "Impossible de rafraîchir la liste.");
    }
    setCards(cardsPayload.cards);
    if (rewardsPayload?.rewards) setRewards(rewardsPayload.rewards);
    if (settingsPayload?.settings) setSettings(settingsPayload.settings);
    router.refresh();
  }

  function upsertCard(card: LoyaltyCardRecord) {
    setCards((prev) => {
      const exists = prev.some((item) => item.id === card.id);
      if (!exists) return [card, ...prev];
      return prev.map((item) => (item.id === card.id ? card : item));
    });
    router.refresh();
  }

  async function handleCreated() {
    try {
      await refreshFromServer();
      setAddOpen(false);
      showToast({ message: "Client ajouté, carte créée.", icon: CheckCircle2 });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Client ajouté, mais la liste n’a pas pu être rafraîchie.",
      });
      setAddOpen(false);
    }
  }

  return (
    <section className="w-full min-w-0 space-y-6 md:space-y-8">
      <PageHeader
        title="Cartes de fidélité"
        subtitle="Suivez les points, récompenses et passages de vos clients."
        primaryAction={{
          kind: "button",
          label: "Scanner une carte",
          icon: <ScanLine className="h-4 w-4" strokeWidth={2} />,
          onClick: () => setScanOpen(true),
        }}
        secondaryActions={[
          {
            kind: "button",
            label: "+ Ajouter un client",
            onClick: () => setAddOpen(true),
          },
        ]}
      />

      <LoyaltySectionNav value={section} onChange={setSection} />

      {section === "clients" ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs tabs={[...FILTER_TABS]} value={filter} onChange={(value) => setFilter(value as ClientFilter)} />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un client, un e-mail ou une carte…"
              className="min-h-11 w-full sm:max-w-xs"
              aria-label="Rechercher un client, un e-mail ou une carte"
            />
          </div>
          <LoyaltyTable cards={filtered} onView={(card) => setSelectedId(card.id)} />
        </>
      ) : (
        <LoyaltyRewardsPanel
          rewards={rewards}
          onChange={(next) => {
            setRewards(next);
            void refreshFromServer().catch(() => undefined);
          }}
        />
      )}

      <LoyaltyDetailDrawer
        card={selected}
        onClose={() => setSelectedId(null)}
        onCardUpdated={upsertCard}
      />
      <AddLoyaltyClientModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={handleCreated} />
      <ScanLoyaltyCardModal
        open={scanOpen}
        settings={settings ?? defaultLoyaltySettings()}
        onClose={() => setScanOpen(false)}
        onUpdated={upsertCard}
      />
    </section>
  );
}
