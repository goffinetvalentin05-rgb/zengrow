import { headers } from "next/headers";
import Link from "next/link";
import { Inter } from "next/font/google";
import DashboardSidebar from "@/src/components/dashboard/sidebar";
import { requireRestaurant } from "@/src/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
    <div className={`${inter.className} min-h-screen bg-[var(--background)] px-4 py-7 md:px-8 md:py-10`}>
      <div className="mx-auto flex max-w-[1480px] flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <DashboardSidebar
          reservationLink={publicLink}
          subscriptionPlan={restaurant.subscription_plan}
          subscriptionStatus={restaurant.subscription_status}
        />
        <section className="min-w-0 flex-1">
          <div className="dashboard-shell-card overflow-hidden">
            <header className="border-b border-[var(--border-soft)] px-7 py-6 md:px-10 md:py-8">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="dashboard-section-kicker">Espace restaurant</p>
                  <p className="mt-2 text-[13px] text-[var(--muted-foreground)]">
                    Gérez réservations, avis et visibilité en un coup d&apos;œil.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard/reservations"
                    className="inline-flex min-h-[44px] items-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] shadow-sm transition duration-200 hover:bg-[var(--primary-hover)] hover:shadow-[0_4px_14px_rgba(26,107,80,0.3)]"
                  >
                    Gérer les réservations
                  </Link>
                  <a href={publicLink} target="_blank" rel="noreferrer" className="dashboard-link-secondary">
                    Voir le lien public
                  </a>
                </div>
              </div>
            </header>
            <div className="px-7 py-8 md:px-10 md:py-10">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
