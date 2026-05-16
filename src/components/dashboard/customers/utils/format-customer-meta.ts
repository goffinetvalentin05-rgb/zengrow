import { formatGuestPhoneDisplay } from "@/src/components/dashboard/reservations/utils/reservation-list-metadata";
import type { CustomerRecord } from "@/src/components/dashboard/customers/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatCustomerLastVisit(
  lastVisitAt: string | null,
  now: Date = new Date(),
): string {
  if (!lastVisitAt) return "pas encore";
  const date = new Date(lastVisitAt);
  if (Number.isNaN(date.getTime())) return "—";
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

export function buildCustomerContactLine(customer: CustomerRecord): string {
  const parts: string[] = [];
  const email = customer.email?.trim();
  if (email) parts.push(email);
  const phone = formatGuestPhoneDisplay(customer.phone);
  if (phone) parts.push(phone);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function buildCustomerMetadataLine(customer: CustomerRecord, now: Date = new Date()): string {
  const visits =
    customer.totalVisits === 1
      ? "1 visite"
      : `${customer.totalVisits} visites`;
  const last = `dernière : ${formatCustomerLastVisit(customer.lastVisitAt, now)}`;
  const segments = [visits, last];
  if (customer.avgCovers != null) {
    const avg =
      customer.avgCovers === 1
        ? "moyenne 1 pers"
        : `moyenne ${customer.avgCovers.toLocaleString("fr-CH", { maximumFractionDigits: 1 })} pers`;
    segments.push(avg);
  }
  return segments.join(" · ");
}
