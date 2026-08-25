"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ScanLine } from "lucide-react";
import CreateGiftCardModal from "@/src/components/dashboard/gift-cards/create-gift-card-modal";
import GiftCardDetailDrawer from "@/src/components/dashboard/gift-cards/gift-card-detail-drawer";
import GiftCardTable from "@/src/components/dashboard/gift-cards/gift-card-table";
import RedeemGiftVoucherModal from "@/src/components/dashboard/gift-cards/redeem-gift-voucher-modal";
import ScanGiftVoucherModal from "@/src/components/dashboard/gift-cards/scan-gift-voucher-modal";
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
  initialRedeem?: boolean;
  initialRedeemCode?: string;
  initialRedeemToken?: string;
  initialScan?: boolean;
};

export default function GiftCardsPage({
  initialCards,
  initialRedeem = false,
  initialRedeemCode = "",
  initialRedeemToken = "",
  initialScan = false,
}: GiftCardsPageProps) {
  const router = useRouter();
  const showToast = useDashboardToast();
  const [cards, setCards] = useState(initialCards);
  const [filter, setFilter] = useState<GiftCardTypeFilter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(initialRedeem && !initialRedeemToken);
  const [redeemCode, setRedeemCode] = useState(initialRedeemCode);
  const [redeemVoucher, setRedeemVoucher] = useState<GiftCardRecord | null>(null);
  const [scanOpen, setScanOpen] = useState(initialScan);
  const [busyAction, setBusyAction] = useState<GiftCardDrawerAction | null>(null);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  useEffect(() => {
    if (!initialRedeemToken) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(
          `/api/gift-vouchers/lookup-token?token=${encodeURIComponent(initialRedeemToken)}`,
        );
        const payload = (await response.json().catch(() => null)) as {
          voucher?: GiftCardRecord;
          error?: string;
        } | null;
        if (cancelled) return;
        if (!response.ok || !payload?.voucher) {
          showToast({ message: payload?.error ?? "Ce bon n’existe pas." });
          return;
        }
        setRedeemVoucher(payload.voucher);
        setRedeemOpen(true);
      } catch {
        if (!cancelled) showToast({ message: "Impossible de rechercher ce bon." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialRedeemToken, showToast]);

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

  function openRedeem(options?: { code?: string; voucher?: GiftCardRecord | null }) {
    setRedeemCode(options?.code ?? "");
    setRedeemVoucher(options?.voucher ?? null);
    setRedeemOpen(true);
  }

  async function handleRedeemed(voucher: GiftCardRecord) {
    setCards((prev) => {
      const exists = prev.some((card) => card.id === voucher.id);
      if (!exists) return [voucher, ...prev];
      return prev.map((card) => (card.id === voucher.id ? voucher : card));
    });
    router.refresh();
  }

  async function handleAction(action: GiftCardDrawerAction) {
    if (!selected) return;
    if (action === "resend") {
      showToast({ message: "L’envoi du bon arrivera plus tard." });
      return;
    }
    if (action === "redeem") {
      openRedeem({ voucher: selected, code: selected.code });
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
          action === "disable" ? "Bon désactivé." : action === "rotate_qr" ? "QR régénéré. L’ancien lien n’est plus valide." : "Bon réactivé.",
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
          label: "Scanner un bon",
          icon: <ScanLine className="h-4 w-4" strokeWidth={2} />,
          onClick: () => setScanOpen(true),
        }}
        secondaryActions={[
          {
            kind: "button",
            label: "Utiliser un bon",
            onClick: () => openRedeem(),
          },
          {
            kind: "button",
            label: "+ Créer un bon",
            onClick: () => setCreateOpen(true),
          },
        ]}
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
      <RedeemGiftVoucherModal
        open={redeemOpen}
        initialCode={redeemCode}
        initialVoucher={redeemVoucher}
        onScanRequest={() => setScanOpen(true)}
        onClose={() => {
          setRedeemOpen(false);
          setRedeemVoucher(null);
          setRedeemCode("");
        }}
        onRedeemed={handleRedeemed}
        onViewVoucher={(voucher) => setSelectedId(voucher.id)}
      />
      <ScanGiftVoucherModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onRedeemed={handleRedeemed}
      />
    </section>
  );
}
