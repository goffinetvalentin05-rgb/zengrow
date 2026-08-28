"use client";

import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { formatPoints, formatPointsProgress } from "@/src/lib/loyalty/points";
import type { LoyaltyCardRecord } from "@/src/lib/loyalty/types";

type LoyaltyTableProps = {
  cards: LoyaltyCardRecord[];
  onView: (card: LoyaltyCardRecord) => void;
};

function RewardCell({ card }: { card: LoyaltyCardRecord }) {
  if (card.rewardState.bestAvailable) {
    return <Badge tone="accent">Récompense disponible</Badge>;
  }
  if (card.rewardState.next) {
    return (
      <span className="text-sm text-zg-text-muted tabular-nums">
        {formatPointsProgress(card.pointsBalance, card.rewardState.next.pointsRequired)}
      </span>
    );
  }
  return <span className="text-sm text-zg-text-muted">—</span>;
}

export default function LoyaltyTable({ cards, onView }: LoyaltyTableProps) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-zg-border bg-zg-surface px-6 py-12 text-center">
        <p className="text-base font-semibold text-zg-fg">Aucun client dans ce filtre</p>
        <p className="mt-1 text-sm text-zg-text-muted">Ajoutez un client pour créer automatiquement sa carte de fidélité.</p>
      </div>
    );
  }

  return (
    <Table className="min-w-[860px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Client</TableHead>
          <TableHead>Carte</TableHead>
          <TableHead>Points</TableHead>
          <TableHead>Récompense</TableHead>
          <TableHead>Dernière visite</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cards.map((card) => (
          <TableRow key={card.id} className="cursor-pointer" onClick={() => onView(card)}>
            <TableCell>
              <div className="min-w-0">
                <p className="font-medium text-zg-fg">{card.customerName}</p>
                {card.customerEmail ? (
                  <p className="mt-0.5 truncate text-xs text-zg-text-muted">{card.customerEmail}</p>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="font-semibold tabular-nums">{card.cardCode}</TableCell>
            <TableCell className="font-medium tabular-nums">{formatPoints(card.pointsBalance)}</TableCell>
            <TableCell>
              <RewardCell card={card} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-zg-text-muted">{card.lastVisitLabel}</TableCell>
            <TableCell>
              <Badge tone={card.status === "active" ? "success" : "neutral"}>
                {card.status === "active" ? "Actif" : "Désactivé"}
              </Badge>
            </TableCell>
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
