import type { CustomerRecord } from "@/src/components/dashboard/customers/types";

export type CustomerKpisTrendTone = "success" | "warning" | "muted";

export type CustomerKpis = {
  totalClients: number;
  newThisMonth: number;
  newMonthTrend: { label: string; tone: CustomerKpisTrendTone };
  loyalClients: number;
  loyalPercent: number;
  totalReservations: number;
  avgVisitsPerClient: number;
};

export function newCustomersMonthTrend(
  current: number,
  previous: number,
): { label: string; tone: CustomerKpisTrendTone } {
  const suffix = " vs mois dernier";
  if (current === previous) {
    return { label: `→ stable${suffix}`, tone: "muted" };
  }
  const delta = current - previous;
  const arrow = delta > 0 ? "↑" : "↓";
  if (previous <= 0 && current > 0) {
    return { label: `${arrow} +${current}${suffix}`, tone: "success" };
  }
  const signed = delta > 0 ? `+${delta}` : `${delta}`;
  return {
    label: `${arrow} ${signed}${suffix}`,
    tone: delta > 0 ? "success" : "warning",
  };
}

export function formatNewThisMonthSubline(count: number): string {
  if (count === 0) return "Aucun nouveau ce mois";
  if (count === 1) return "1 nouveau ce mois";
  return `${count} nouveaux ce mois`;
}

export function formatLoyalPercentSubline(percent: number): string {
  return `${percent} % de votre base`;
}

export function formatAvgVisitsSubline(avg: number): string {
  const rounded = Math.round(avg * 10) / 10;
  const label = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toLocaleString("fr-CH", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (rounded === 1) return `Moyenne ${label} visite par client`;
  return `Moyenne ${label} visites par client`;
}

export function countCustomersCreatedBetween(
  rows: readonly { createdAt: string }[],
  startIso: string,
  endIso: string,
): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return rows.reduce((acc, row) => {
    const t = new Date(row.createdAt).getTime();
    if (Number.isNaN(t)) return acc;
    return t >= start && t <= end ? acc + 1 : acc;
  }, 0);
}

export function computeCustomerKpis(
  customers: readonly CustomerRecord[],
  newThisMonth: number,
  newPreviousMonth: number,
): CustomerKpis {
  const totalClients = customers.length;
  const loyalClients = customers.filter((c) => c.totalVisits >= 3).length;
  const loyalPercent =
    totalClients > 0 ? Math.round((loyalClients / totalClients) * 100) : 0;
  const totalReservations = customers.reduce((sum, c) => sum + c.reservationCount, 0);
  const avgVisitsPerClient =
    totalClients > 0 ? Math.round((totalReservations / totalClients) * 10) / 10 : 0;

  return {
    totalClients,
    newThisMonth,
    newMonthTrend: newCustomersMonthTrend(newThisMonth, newPreviousMonth),
    loyalClients,
    loyalPercent,
    totalReservations,
    avgVisitsPerClient,
  };
}
