import { Send, Star, UserCheck, UserMinus, Users } from "lucide-react";
import DashboardInactiveClientsCard, {
  type InactiveClientPreview,
} from "@/src/components/dashboard/dashboard-inactive-clients-card";
import StatCard, { StatCardSkeleton } from "@/src/components/dashboard/stat-card";
import { createClient } from "@/src/lib/supabase/server";

const EMPTY = "—";
const INACTIVE_THRESHOLD_DAYS = 60;
const RETURNED_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function formatCustomerDisplayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Client";
  if (parts.length === 1) return parts[0]!;
  const firstName = parts[0]!;
  const lastInitial = parts[parts.length - 1]!.charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function daysSince(isoDate: string | null, nowMs: number): number | null {
  if (!isoDate) return null;
  const t = new Date(isoDate).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((nowMs - t) / DAY_MS));
}

function isInactiveCustomer(
  customer: { total_visits: number | null; last_visit_at: string | null },
  nowMs: number,
): boolean {
  if ((customer.total_visits ?? 0) <= 0) return false;
  const days = daysSince(customer.last_visit_at, nowMs);
  if (days == null) return true;
  return days >= INACTIVE_THRESHOLD_DAYS;
}

export function DashboardHomeMetricsSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 row-span-2 min-h-[240px] lg:col-span-4">
        <div className="h-full min-h-[220px] animate-pulse rounded-2xl bg-zg-surface" />
      </div>
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
        {Array.from({ length: 5 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export async function DashboardHomeMetrics({ restaurantId }: { restaurantId: string }) {
  const supabase = await createClient();
  const nowMs = Date.now();
  const returnedSinceMs = nowMs - RETURNED_WINDOW_DAYS * DAY_MS;

  const [
    { data: customers, error: errCustomers },
    { count: draftCampaignsCount, error: errDraftCampaigns },
    { count: reviewRequestsCount, error: errReviewRequests },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id, full_name, total_visits, last_visit_at")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("email_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .is("sent_at", null),
    supabase
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId)
      .eq("status", "sent"),
  ]);

  const customerRows = errCustomers ? [] : (customers ?? []);
  const registeredCount = customerRows.length;
  const inactiveCustomers = customerRows.filter((customer) => isInactiveCustomer(customer, nowMs));
  const inactiveCount = inactiveCustomers.length;

  const returnedCount = customerRows.filter((customer) => {
    if ((customer.total_visits ?? 0) < 2 || !customer.last_visit_at) return false;
    const lastVisitMs = new Date(customer.last_visit_at).getTime();
    return !Number.isNaN(lastVisitMs) && lastVisitMs >= returnedSinceMs;
  }).length;

  const inactivePreview: InactiveClientPreview[] = inactiveCustomers
    .map((customer) => {
      const days = daysSince(customer.last_visit_at, nowMs) ?? INACTIVE_THRESHOLD_DAYS;
      return {
        id: customer.id,
        displayName: formatCustomerDisplayName(customer.full_name),
        daysSinceVisit: days,
      };
    })
    .sort((a, b) => b.daysSinceVisit - a.daysSinceVisit)
    .slice(0, 3);

  const readyFollowUps =
    errDraftCampaigns || draftCampaignsCount == null ? null : draftCampaignsCount;
  const reviewRequests =
    errReviewRequests || reviewRequestsCount == null ? null : reviewRequestsCount;

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 row-span-2 lg:col-span-4">
        <DashboardInactiveClientsCard clients={inactivePreview} className="h-full min-h-[240px]" />
      </div>
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
        <StatCard
          label="Clients enregistrés"
          value={errCustomers ? EMPTY : registeredCount}
          icon={Users}
          dataTone="info"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Clients inactifs"
          value={errCustomers ? EMPTY : inactiveCount}
          icon={UserMinus}
          dataTone="warning"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Relances prêtes"
          value={readyFollowUps === null ? EMPTY : readyFollowUps}
          icon={Send}
          dataTone="accent"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Avis demandés"
          value={reviewRequests === null ? EMPTY : reviewRequests}
          icon={Star}
          dataTone="premium"
          trend="—"
          trendTone="muted"
        />
        <StatCard
          label="Clients revenus"
          value={errCustomers ? EMPTY : returnedCount}
          icon={UserCheck}
          dataTone="success"
          trend="—"
          trendTone="muted"
        />
      </div>
    </div>
  );
}
