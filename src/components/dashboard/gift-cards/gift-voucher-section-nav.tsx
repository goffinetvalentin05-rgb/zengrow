"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

const ITEMS = [
  { href: "/dashboard/gift-vouchers", label: "Bons émis", match: "issued" as const },
  { href: "/dashboard/gift-vouchers/offers", label: "Mes offres", match: "offers" as const },
];

export default function GiftVoucherSectionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Section bons cadeaux" className="inline-flex rounded-xl border border-zg-border bg-zg-surface-elevated/80 p-1 backdrop-blur-sm">
      {ITEMS.map((item) => {
        const onOffers = pathname.startsWith("/dashboard/gift-vouchers/offers");
        const active = item.match === "offers" ? onOffers : pathname.startsWith("/dashboard/gift-vouchers") && !onOffers;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ease-out",
              active
                ? "bg-gradient-to-br from-[#7c5cff] to-[#6366f1] text-white shadow-[0_0_24px_-8px_rgba(124,92,255,0.55)]"
                : "text-zg-text-muted hover:bg-white/5 hover:text-zg-fg",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
