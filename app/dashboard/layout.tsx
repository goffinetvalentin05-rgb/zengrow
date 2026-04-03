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
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <DashboardSidebar
          reservationLink={publicLink}
          subscriptionPlan={restaurant.subscription_plan}
          subscriptionStatus={restaurant.subscription_status}
        />
        <section className="min-w-0 flex-1">
          <div className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] shadow-sm">
            <header className="border-b border-[rgba(0,0,0,0.06)] px-6 py-5 md:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="dashboard-section-kicker">Espace restaurant</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/dashboard/reservations"
                    className="inline-flex min-h-[42px] items-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] shadow-sm transition hover:bg-[var(--primary-hover)]"
                  >
                    Gérer les réservations
                  </Link>
                  <a
                    href={publicLink}
                    target="_blank"
                    rel="noreferrer"
                    className="dashboard-link-secondary"
                  >
                    Voir le lien public
                  </a>
                </div>
              </div>
            </header>
            <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
