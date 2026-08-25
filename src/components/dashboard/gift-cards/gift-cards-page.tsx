"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import CreateGiftCardModal from "@/src/components/dashboard/gift-cards/create-gift-card-modal";
import GiftCardDetailDrawer from "@/src/components/dashboard/gift-cards/gift-card-detail-drawer";
import GiftCardTable from "@/src/components/dashboard/gift-cards/gift-card-table";
import type {
  GiftCardDrawerAction,
  GiftCardRecord,
  GiftCardTypeFilter,
} from "@/src/components/dashboard/gift-cards/types";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import PageHeader from "@/src/components/dashboard/page-header";
import Input from "@/src/components/ui/input";
import Tabs from "@/src/components/ui/tabs";

const FILTER_TABS: { id: GiftCardTypeFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "digital", label: "Digitaux" },
  { id: "paper", label: "Papier" },
];

type GiftCardsPageProps = {
  initialCards: GiftCardRecord[];
};

export default function GiftCardsPage({ initialCards }: GiftCardsPageProps) {
  const router = useRouter();
  const showToast = useDashboardToast();
  const [cards, setCards] = useState(initialCards);
  const [filter, setFilter] = useState<GiftCardTypeFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<GiftCardDrawerAction | null>(null);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const selected = useMemo(
    () => cards.find((card) => card.id === selectedId) ?? null,
    [cards, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((card) => {
      if (filter !== "all" && card.type !== filter) return false;
      if (!q) return true;
      return (
        card.code.toLowerCase().includes(q) ||
        card.buyerName.toLowerCase().includes(q) ||
        card.buyerEmail.toLowerCase().includes(q)
      );
    });
  }, [cards, filter, query]);

  async function refreshFromServer() {
    const response = await fetch("/api/gift-vouchers");
    const payload = (await response.json().catch(() => null)) as { vouchers?: GiftCardRecord[]; error?: string } | null;
    if (!response.ok || !payload?.vouchers) {
      throw new Error(payload?.error ?? "Impossible de rafraîchir la liste.");
    }
    setCards(payload.vouchers);
    router.refresh();
  }

  async function handleCreated() {
    try {
      await refreshFromServer();
      setCreateOpen(false);
      showToast({ message: "Bon cadeau créé", icon: CheckCircle2 });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Bon créé, mais la liste n’a pas pu être rafraîchie.",
      });
      setCreateOpen(false);
    }
  }

  async function handleAction(action: GiftCardDrawerAction) {
    if (!selected) return;
    if (action === "resend") {
      showToast({ message: "L’envoi du bon arrivera plus tard." });
      return;
    }

    setBusyAction(action);
    try {
      const response = await fetch(`/api/gift-vouchers/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json().catch(() => null)) as { voucher?: GiftCardRecord; error?: string } | null;
      if (!response.ok || !payload?.voucher) {
        showToast({ message: payload?.error ?? "Impossible de mettre à jour ce bon." });
        return;
      }
      setCards((prev) => prev.map((card) => (card.id === payload.voucher!.id ? payload.voucher! : card)));
      showToast({
        message:
          action === "mark_used"
            ? "Bon marqué comme utilisé."
            : action === "disable"
              ? "Bon désactivé."
              : "Bon réactivé.",
        icon: CheckCircle2,
      });
      router.refresh();
    } catch {
      showToast({ message: "Impossible de mettre à jour ce bon." });
    } finally {
      setBusyAction(null);
    }
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={FILTER_TABS}
          value={filter}
          onChange={(value) => setFilter(value as GiftCardTypeFilter)}
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un code, un nom ou un e-mail…"
          className="min-h-11 w-full sm:max-w-xs"
          aria-label="Rechercher un bon cadeau"
        />
      </div>

      <GiftCardTable cards={filtered} onView={(card) => setSelectedId(card.id)} />

      <GiftCardDetailDrawer
        card={selected}
        onClose={() => setSelectedId(null)}
        onAction={handleAction}
        busyAction={busyAction}
      />
      <CreateGiftCardModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </section>
  );
}
