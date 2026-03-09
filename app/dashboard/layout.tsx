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
    <main className="min-h-screen bg-[var(--background)] p-4 md:p-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 lg:flex-row">
        <DashboardSidebar reservationLink={publicLink} />
        <section className="flex-1 space-y-6">
          <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[0_16px_36px_-28px_rgba(15,63,58,0.55)]">
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
                  Gerer les reservations
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
          {children}
        </section>
      </div>
    </main>
  );
}
