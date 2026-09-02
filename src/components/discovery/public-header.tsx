"use client";

import Link from "next/link";
import { LandingWordmark } from "@/components/landing/BrandLogo";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { LanguageSwitch } from "@/src/i18n/language-switch";
import { useI18n } from "@/src/i18n/provider";

export function PublicHeader({ loggedIn }: { loggedIn: boolean }) {
  const { t } = useI18n();
  return (
    <header className="flex items-center justify-between px-5 py-5 md:px-10">
      <Link href={loggedIn ? DISCOVERY_ROUTES.explore : "/"} aria-label="Sharpz">
        <LandingWordmark className="h-5 w-auto" />
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <LanguageSwitch />
        {loggedIn ? (
          <Link href={DISCOVERY_ROUTES.explore} className="text-white/60 hover:text-white">
            {t.publicHeader.explore}
          </Link>
        ) : (
          <>
            <Link href={DISCOVERY_ROUTES.login} className="text-white/60 hover:text-white">
              {t.publicHeader.logIn}
            </Link>
            <Link href={DISCOVERY_ROUTES.signup} className="rounded-full bg-white px-3 py-1.5 text-zinc-950">
              {t.publicHeader.join}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
