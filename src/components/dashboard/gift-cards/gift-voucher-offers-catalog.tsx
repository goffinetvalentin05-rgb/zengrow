"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Archive, Copy, Eye, Gift, GripVertical, Pencil, Plus } from "lucide-react";
import GiftVoucherSectionNav from "@/src/components/dashboard/gift-cards/gift-voucher-section-nav";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import PageHeader from "@/src/components/dashboard/page-header";
import ActionMenu from "@/src/components/dashboard/ui/action-menu";
import { buttonClassName } from "@/src/components/ui/button";
import { formatCentsAsChf } from "@/src/lib/gift-vouchers/money";
import type { GiftVoucherOfferListItem } from "@/src/lib/gift-vouchers/offers/types";
import { offerKindShortLabel, offerStatusLabel, offerValidityLabel } from "@/src/lib/gift-vouchers/offers/status";
import { cn } from "@/src/lib/utils";

type GiftVoucherOffersCatalogProps = {
  publicPath: string | null;
  initialOffers: GiftVoucherOfferListItem[];
};

function priceLabel(offer: GiftVoucherOfferListItem): string {
  if (offer.kind === "monetary") return formatCentsAsChf(offer.faceValueCents ?? offer.salePriceCents);
  return offer.salePriceCents > 0 ? formatCentsAsChf(offer.salePriceCents) : "Offrir";
}

export default function GiftVoucherOffersCatalog({
  publicPath,
  initialOffers,
}: GiftVoucherOffersCatalogProps) {
  const router = useRouter();
  const showToast = useDashboardToast();
  const [offers, setOffers] = useState(initialOffers);
  const [seen, setSeen] = useState(initialOffers);
  if (seen !== initialOffers) {
    setSeen(initialOffers);
    setOffers(initialOffers);
  }
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const visible = useMemo(
    () => offers.filter((offer) => (showArchived ? offer.status === "archived" : offer.status !== "archived")),
    [offers, showArchived],
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function patchAction(id: string, action: string) {
    if (action === "archive" && !window.confirm("Archiver cette offre ? Les bons déjà vendus restent valides.")) {
      return;
    }
    setBusyId(id);
    try {
      const response = await fetch(`/api/gift-voucher-offers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json().catch(() => null)) as {
        offer?: GiftVoucherOfferListItem;
        error?: string;
      } | null;
      if (!response.ok) {
        showToast({ message: payload?.error ?? "Action impossible." });
        return;
      }
      if (action === "duplicate") {
        showToast({ message: "Copie créée en brouillon." });
        router.refresh();
        return;
      }
      router.refresh();
      if (action === "archive") showToast({ message: "Offre archivée. Les bons déjà émis restent utilisables." });
      if (action === "activate") showToast({ message: "Offre publiée." });
      if (action === "deactivate") showToast({ message: "Offre masquée." });
    } catch {
      showToast({ message: "Action impossible. Vérifiez votre connexion." });
    } finally {
      setBusyId(null);
    }
  }

  const persistOrder = useCallback(
    async (next: GiftVoucherOfferListItem[]) => {
      const ids = next.filter((offer) => offer.status !== "archived").map((offer) => offer.id);
      try {
        await fetch("/api/gift-voucher-offers/reorder", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
      } catch {
        showToast({ message: "Impossible d’enregistrer l’ordre." });
        router.refresh();
      }
    },
    [router, showToast],
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const current = visible;
    const oldIndex = current.findIndex((offer) => offer.id === active.id);
    const newIndex = current.findIndex((offer) => offer.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reorderedVisible = arrayMove(current, oldIndex, newIndex);
    const archived = offers.filter((offer) => offer.status === "archived");
    const next = showArchived ? [...offers.filter((offer) => offer.status !== "archived"), ...reorderedVisible] : [...reorderedVisible, ...archived];
    setOffers(next);
    void persistOrder(next);
  }

  return (
    <section className="w-full min-w-0 space-y-6 md:space-y-8">
      <PageHeader
        title="Mes offres de bons cadeaux"
        subtitle="Ces offres apparaissent sur votre page publique lorsqu’elles sont publiées. Chaque bon émis conserve un snapshot de l’offre choisie."
        primaryAction={{
          kind: "link",
          href: "/dashboard/gift-vouchers/offers/new",
          label: "Créer une offre",
          icon: <Plus className="h-4 w-4" strokeWidth={2} />,
        }}
        secondaryActions={
          publicPath
            ? [{ kind: "external", href: publicPath, label: "Voir la page publique", icon: <Eye className="h-4 w-4" /> }]
            : []
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <GiftVoucherSectionNav />
        <button
          type="button"
          className="text-sm font-medium text-zg-text-muted hover:text-zg-fg"
          onClick={() => setShowArchived((value) => !value)}
        >
          {showArchived ? "Voir les offres actives" : "Voir les archives"}
        </button>
      </div>

      {visible.length === 0 ? (
        showArchived ? (
          <p className="rounded-2xl border border-dashed border-zg-border px-4 py-10 text-center text-sm text-zg-text-muted">
            Aucune offre archivée.
          </p>
        ) : (
          <EmptyOffersState />
        )
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={visible.map((offer) => offer.id)} strategy={rectSortingStrategy}>
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((offer) => (
                <SortableOfferCard
                  key={offer.id}
                  offer={offer}
                  busy={busyId === offer.id}
                  onAction={patchAction}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function EmptyOffersState() {
  return (
    <div className="rounded-3xl border border-dashed border-zg-border bg-zg-surface px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zg-accent-soft-bg">
        <Gift className="h-8 w-8 text-zg-accent" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-zg-fg">Créez votre première offre</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zg-text-muted">
        Le catalogue public se construit à partir de vos offres, pas des montants proposés.
      </p>
      <ul className="mx-auto mt-6 max-w-sm space-y-2 text-sm text-zg-text-secondary">
        <li>Bon cadeau 100 CHF</li>
        <li>Menu dégustation pour deux</li>
        <li>Visite de la cave et apéritif</li>
      </ul>
      <Link href="/dashboard/gift-vouchers/offers/new" className={buttonClassName({ className: "mt-8" })}>
        <Plus className="h-4 w-4" />
        Créer ma première offre
      </Link>
    </div>
  );
}

function SortableOfferCard({
  offer,
  busy,
  onAction,
}: {
  offer: GiftVoucherOfferListItem;
  busy: boolean;
  onAction: (id: string, action: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: offer.id,
    disabled: offer.status === "archived",
  });
  const published = offer.status === "active";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "overflow-hidden rounded-3xl border border-zg-border bg-zg-surface shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]",
        isDragging && "z-10 opacity-90",
        offer.status === "inactive" && "opacity-90",
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zg-accent-soft-bg">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={offer.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gift className="h-10 w-10 text-zg-accent/40" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white">
          {offerStatusLabel(offer.status)}
        </span>
        {offer.status !== "archived" ? (
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full bg-black/45 p-1.5 text-white"
            aria-label="Réordonner"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-zg-fg">{offer.title}</p>
            <p className="mt-1 text-xs text-zg-text-muted">
              {offerKindShortLabel(offer.kind)} · {priceLabel(offer)} · {offerValidityLabel(offer.validityMonths)}
            </p>
          </div>
          <ActionMenu
            compact
            label="Actions de l’offre"
            items={[
              { kind: "link", label: "Modifier", href: `/dashboard/gift-vouchers/offers/${offer.id}`, icon: <Pencil className="h-4 w-4" /> },
              {
                kind: "action",
                label: "Dupliquer",
                disabled: busy,
                onClick: () => onAction(offer.id, "duplicate"),
                icon: <Copy className="h-4 w-4" />,
              },
              {
                kind: "action",
                label: published ? "Masquer" : "Publier",
                disabled: busy || offer.status === "archived",
                onClick: () => onAction(offer.id, published ? "deactivate" : "activate"),
                icon: <Eye className="h-4 w-4" />,
              },
              {
                kind: "action",
                label: "Archiver",
                tone: "danger",
                disabled: busy || offer.status === "archived",
                onClick: () => onAction(offer.id, "archive"),
                icon: <Archive className="h-4 w-4" />,
              },
            ]}
          />
        </div>
        <p className="text-xs text-zg-text-muted">
          {offer.issuedCount === 0
            ? "Aucun bon émis pour l’instant"
            : `${offer.issuedCount} bon${offer.issuedCount > 1 ? "s" : ""} créé${offer.issuedCount > 1 ? "s" : ""} depuis cette offre`}
        </p>
      </div>
    </li>
  );
}
