"use client";

import { useMemo, useState } from "react";
import { Gift, MailCheck, Users } from "lucide-react";
import {
  MOCK_GIFT_CARD_BUYERS,
  type GiftCardBuyer,
} from "@/src/components/dashboard/customers/mock-gift-card-buyers";
import PageHeader from "@/src/components/dashboard/page-header";
import ReservationsKpiCard from "@/src/components/dashboard/reservations/header/reservations-kpi-card";
import Badge from "@/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { formatChf } from "@/src/components/dashboard/gift-cards/mock-data";
import Input from "@/src/components/ui/input";

export default function GiftCardBuyersPage() {
  const [query, setQuery] = useState("");

  const buyers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_GIFT_CARD_BUYERS;
    return MOCK_GIFT_CARD_BUYERS.filter(
      (buyer) => buyer.name.toLowerCase().includes(q) || buyer.email.toLowerCase().includes(q),
    );
  }, [query]);

  const kpis = useMemo(() => {
    const totalClients = MOCK_GIFT_CARD_BUYERS.length;
    const totalCards = MOCK_GIFT_CARD_BUYERS.reduce((sum, buyer) => sum + buyer.giftCardsBought, 0);
    const totalSpent = MOCK_GIFT_CARD_BUYERS.reduce((sum, buyer) => sum + buyer.totalSpentChf, 0);
    const optIn = MOCK_GIFT_CARD_BUYERS.filter((buyer) => buyer.marketingStatus === "opt-in").length;
    return { totalClients, totalCards, totalSpent, optIn };
  }, []);

  return (
    <section className="w-full min-w-0 space-y-8 md:space-y-12">
      <PageHeader
        title="Clients"
        subtitle="Les personnes qui ont acheté un bon cadeau dans votre établissement."
      />

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
        aria-labelledby="customers-kpi-heading"
      >
        <h2 id="customers-kpi-heading" className="sr-only">
          Indicateurs clients
        </h2>
        <ReservationsKpiCard
          label="Clients enregistrés"
          value={kpis.totalClients}
          subline="Acheteurs de bons"
          icon={Users}
          dataTone="accent"
        />
        <ReservationsKpiCard
          label="Bons achetés"
          value={kpis.totalCards}
          subline={`Total dépensé ${formatChf(kpis.totalSpent)}`}
          icon={Gift}
          dataTone="premium"
        />
        <ReservationsKpiCard
          label="Opt-in marketing"
          value={kpis.optIn}
          subline={`${Math.round((kpis.optIn / kpis.totalClients) * 100)} % de votre base`}
          icon={MailCheck}
          dataTone="success"
        />
      </div>

      <div className="space-y-3">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="min-h-11 max-w-md"
          aria-label="Rechercher un acheteur"
        />

        {buyers.length === 0 ? (
          <div className="rounded-2xl border border-zg-border bg-zg-surface px-6 py-12 text-center">
            <p className="text-base font-semibold text-zg-fg">Aucun acheteur trouvé</p>
            <p className="mt-1 text-sm text-zg-text-muted">Essayez un autre nom ou e-mail.</p>
          </div>
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bons achetés</TableHead>
                <TableHead>Total dépensé</TableHead>
                <TableHead>Dernier achat</TableHead>
                <TableHead>Statut marketing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.map((buyer) => (
                <BuyerRow key={buyer.id} buyer={buyer} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

function BuyerRow({ buyer }: { buyer: GiftCardBuyer }) {
  return (
    <TableRow>
      <TableCell className="font-semibold">{buyer.name}</TableCell>
      <TableCell className="text-zg-text-muted">{buyer.email}</TableCell>
      <TableCell>
        {buyer.giftCardsBought} bon{buyer.giftCardsBought > 1 ? "s" : ""}
      </TableCell>
      <TableCell className="tabular-nums">{formatChf(buyer.totalSpentChf)}</TableCell>
      <TableCell className="whitespace-nowrap text-zg-text-muted">{buyer.lastPurchaseLabel}</TableCell>
      <TableCell>
        <Badge tone={buyer.marketingStatus === "opt-in" ? "success" : "neutral"}>
          {buyer.marketingStatus === "opt-in" ? "Opt-in" : "Non inscrit"}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
