"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function ShowroomReservationHeader({
  logoUrl,
  restaurantName,
  backHref,
}: {
  logoUrl?: string | null;
  restaurantName: string;
  backHref: string;
}) {
  const name = restaurantName.trim();

  return (
    <header
      className="sticky top-0 z-20 border-b border-white/[0.06] bg-[color-mix(in_srgb,var(--page-bg)_92%,transparent)] px-4 backdrop-blur-md sm:px-5"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingBottom: "0.75rem",
      }}
    >
      <div className="mx-auto flex w-full max-w-lg items-center gap-3 sm:max-w-xl">
        <Link
          href={backHref}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          aria-label="Retour à la page du restaurant"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>

        {logoUrl?.trim() ? (
          <div className="relative h-8 w-24 shrink-0 sm:h-9 sm:w-28">
            <Image
              src={logoUrl.trim()}
              alt=""
              fill
              className="object-contain object-left"
              sizes="112px"
              unoptimized
            />
          </div>
        ) : null}

        {name ? (
          <p
            className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90 sm:text-base"
            style={{ fontFamily: "var(--heading-font), Georgia, serif" }}
          >
            {name}
          </p>
        ) : null}
      </div>
    </header>
  );
}
