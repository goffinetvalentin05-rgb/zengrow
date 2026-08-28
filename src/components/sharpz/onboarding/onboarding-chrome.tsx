"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { DashboardLocaleSwitch } from "@/src/components/dashboard/i18n/dashboard-locale-switch";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";

const SHARPZ_LOGO_SRC = "/sharpz-logo.png";

export function OnboardingChrome() {
  const router = useRouter();
  const { t } = useDashboardI18n();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/pro/login");
  }

  return (
    <header className="relative z-20 flex h-16 items-center justify-between px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <Image
          src={SHARPZ_LOGO_SRC}
          alt="Sharpz"
          width={88}
          height={32}
          className="h-7 w-auto object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <DashboardLocaleSwitch />
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="inline-flex h-9 items-center gap-2 rounded-xl px-2.5 text-xs font-medium text-zg-text-muted transition-colors duration-200 hover:bg-white/5 hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/40"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          <span className="hidden sm:inline">{t.nav.logout}</span>
        </button>
      </div>
    </header>
  );
}
