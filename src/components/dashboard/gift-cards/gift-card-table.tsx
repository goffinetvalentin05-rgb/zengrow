"use client";

import GiftCardStatusBadge from "@/src/components/dashboard/gift-cards/gift-card-status-badge";
import GiftCardTypeBadge from "@/src/components/dashboard/gift-cards/gift-card-type-badge";
import { formatChf } from "@/src/lib/gift-vouchers/money";
import type { GiftCardRecord } from "@/src/components/dashboard/gift-cards/types";
import Button from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

type GiftCardTableProps = {
  cards: GiftCardRecord[];
  onView: (card: GiftCardRecord) => void;
};

export default function GiftCardTable({ cards, onView }: GiftCardTableProps) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-zg-border bg-zg-surface px-6 py-12 text-center">
        <p className="text-base font-semibold text-zg-fg">Aucun bon dans ce filtre</p>
        <p className="mt-1 text-sm text-zg-text-muted">Essayez un autre type ou créez un nouveau bon.</p>
      </div>
    );
  }

  return (
    <Table className="min-w-[860px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Bon</TableHead>
          <TableHead>Acheteur</TableHead>
          <TableHead>Valeur</TableHead>
          <TableHead>Solde</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cards.map((card) => (
          <TableRow
            key={card.id}
            className="cursor-pointer"
            onClick={() => onView(card)}
          >
            <TableCell className="font-semibold tabular-nums">{card.code}</TableCell>
            <TableCell>{card.buyerName}</TableCell>
            <TableCell className="tabular-nums">
              {card.offerKind === "experience" ? card.offerTitle || "Prestation" : formatChf(card.amountChf)}
            </TableCell>
            <TableCell className="tabular-nums">
              {card.offerKind === "experience"
                ? card.status === "used"
                  ? "Utilisée"
                  : "À valider"
                : formatChf(card.balanceChf)}
            </TableCell>
            <TableCell>
              <GiftCardTypeBadge type={card.type} />
            </TableCell>
            <TableCell>
              <GiftCardStatusBadge status={card.status} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-zg-text-muted">{card.purchasedLabel}</TableCell>
            <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
              <Button type="button" variant="secondary" size="sm" onClick={() => onView(card)}>
                Voir
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
