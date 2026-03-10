import { headers } from "next/headers";
import Link from "next/link";
import DashboardSidebar from "@/src/components/dashboard/sidebar";
import { requireRestaurant } from "@/src/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const restaurant = await requireRestaurant();
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : "";
  const publicLink = origin ? `${origin}/r/${restaurant.slug}` : `/r/${restaurant.slug}`;

  return (
    <main className="min-h-screen bg-[var(--surface-muted)] p-3 md:p-4">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 lg:flex-row">
        <DashboardSidebar
          reservationLink={publicLink}
          subscriptionPlan={restaurant.subscription_plan}
          subscriptionStatus={restaurant.subscription_status}
        />
        <section className="flex-1">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_18px_42px_-30px_rgba(15,63,58,0.42)]">
            <header className="border-b border-[var(--border)] px-5 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  Espace restaurant
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/reservations"
                  className="inline-flex h-10 items-center rounded-xl bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-4 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Gérer les réservations
                </Link>
                <a
                  href={publicLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)]/80 hover:bg-[var(--surface-muted)]"
                >
                  Voir le lien public
                </a>
              </div>
            </div>
            </header>
            <div className="px-5 py-4 md:px-6 md:py-5">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
