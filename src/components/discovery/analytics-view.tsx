"use client";

import Button from "@/src/components/ui/button";
import { SHARPZ_PRO_PRICE_LABEL } from "@/src/lib/discovery/pro";
import type { ProfileAnalytics } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";

const SOURCE_LABELS: Record<string, string> = {
  explore: "Explore",
  search: "Search",
  category: "Category page",
  direct: "Direct profile",
  following: "Following",
  saved: "Saved",
};

export function AnalyticsView({
  isPro,
  analytics,
}: {
  isPro: boolean;
  analytics: ProfileAnalytics | null;
}) {
  async function upgrade() {
    const response = await fetch("/api/discovery/checkout", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (payload.url) {
      window.location.href = payload.url;
      return;
    }
    alert(payload.error ?? "Stripe is not configured yet. Set STRIPE_SHARPZ_PRO_PRICE_ID.");
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-zg-display)] text-4xl text-white">Analytics</h1>
        <p className="mt-2 text-sm text-white/45">Aggregated visibility only. We never show who visited your profile.</p>
      </header>

      <div className={cn("relative", !isPro && "min-h-[420px]")}>
        <div className={cn(!isPro && "pointer-events-none select-none blur-sm")}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Profile views" value={analytics?.views_total ?? 0} />
            <Stat label="Last 7 days" value={analytics?.views_7d ?? 0} />
            <Stat label="Last 30 days" value={analytics?.views_30d ?? 0} />
            <Stat label="External clicks" value={analytics?.external_clicks ?? 0} />
            <Stat label="New followers (7d)" value={analytics?.new_followers_7d ?? 0} />
            <Stat label="Followers" value={analytics?.followers_total ?? 0} />
          </div>

          <section className="mt-8 rounded-3xl border border-white/[0.07] p-5">
            <h2 className="text-sm text-white/50">Clicks by platform</h2>
            <BarList data={analytics?.clicks_by_platform ?? {}} />
          </section>
          <section className="mt-4 rounded-3xl border border-white/[0.07] p-5">
            <h2 className="text-sm text-white/50">Top discovery sources</h2>
            <BarList
              data={Object.fromEntries(
                Object.entries(analytics?.sources ?? {}).map(([key, value]) => [SOURCE_LABELS[key] ?? key, value]),
              )}
            />
          </section>
          <section className="mt-4 rounded-3xl border border-white/[0.07] p-5">
            <h2 className="text-sm text-white/50">Top niches of visitors</h2>
            {(analytics?.visitor_niches ?? []).length ? (
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {analytics?.visitor_niches.map((item) => (
                  <li key={item.slug}>
                    {item.share}% of visitors came from {item.slug}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/35">Not enough visits yet.</p>
            )}
          </section>
        </div>

        {!isPro ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 p-6">
            <div className="max-w-sm rounded-3xl border border-white/10 bg-[#0d0c12] p-6 text-center">
              <p className="font-[family-name:var(--font-zg-display)] text-2xl text-white">Unlock Sharpz Pro</p>
              <p className="mt-2 text-sm text-white/50">
                See how people discover you. {SHARPZ_PRO_PRICE_LABEL}.
              </p>
              <Button className="mt-5 w-full" onClick={upgrade}>
                Upgrade to Pro
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-zg-display)] text-3xl text-white">{value}</p>
    </div>
  );
}

function BarList({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  if (!entries.length) return <p className="mt-3 text-sm text-white/35">No data yet.</p>;
  return (
    <ul className="mt-4 space-y-3">
      {entries.map(([label, n]) => (
        <li key={label}>
          <div className="mb-1 flex justify-between text-sm text-white/70">
            <span>{label}</span>
            <span>{n}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-white/70" style={{ width: `${(n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
