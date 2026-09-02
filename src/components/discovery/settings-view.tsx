"use client";

import Button from "@/src/components/ui/button";
import { SharpzLinkEditor } from "@/src/components/discovery/sharpz-link-editor";
import { DISCOVERY_ROUTES } from "@/src/lib/discovery/routes";
import { SHARPZ_PRO_PRICE_LABEL } from "@/src/lib/discovery/pro";
import type { UserSubscription } from "@/src/lib/discovery/types";
import { LanguageSwitch } from "@/src/i18n/language-switch";
import { useI18n } from "@/src/i18n/provider";
import { interpolate } from "@/src/locales/app";
import Link from "next/link";

export function SettingsView({
  email,
  username,
  subscription,
  isPro,
  isAdmin,
}: {
  email: string | undefined;
  username: string | null;
  subscription: UserSubscription;
  isPro: boolean;
  isAdmin?: boolean;
}) {
  const { t } = useI18n();

  async function upgrade() {
    const response = await fetch("/api/discovery/checkout", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (payload.url) window.location.href = payload.url;
    else alert(payload.error ?? t.settingsPage.stripeMissing);
  }

  async function manage() {
    const response = await fetch("/api/discovery/portal", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (payload.url) window.location.href = payload.url;
    else alert(payload.error ?? t.settingsPage.noCustomer);
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="sz-display">{t.settingsPage.title}</h1>
      <section className="mt-8 rounded-[1.5rem] border border-white/[0.07] bg-[#0c0c0e] p-5">
        <p className="sz-label">{t.settingsPage.language}</p>
        <p className="mt-2 text-sm text-white/45">{t.settingsPage.languageHint}</p>
        <div className="mt-4">
          <LanguageSwitch />
        </div>
      </section>
      <section className="mt-4 rounded-[1.5rem] border border-white/[0.07] bg-[#0c0c0e] p-5">
        <SharpzLinkEditor username={username} compact />
      </section>
      <section className="mt-4 rounded-[1.5rem] border border-white/[0.07] bg-[#0c0c0e] p-5">
        <p className="sz-label">{t.settingsPage.account}</p>
        <p className="mt-2 text-white">{email}</p>
      </section>
      <section className="mt-4 rounded-[1.5rem] border border-white/[0.07] bg-[#0c0c0e] p-5">
        <p className="sz-label">{t.settingsPage.pro}</p>
        <p className="mt-2 text-white">
          {isPro ? t.settingsPage.proActive : t.common.free} · {SHARPZ_PRO_PRICE_LABEL}
        </p>
        <p className="sz-meta mt-1">{interpolate(t.settingsPage.status, { status: subscription.status })}</p>
        <div className="mt-4">
          {isPro ? (
            <Button variant="secondary" className="sz-press" onClick={manage}>
              {t.settingsPage.manage}
            </Button>
          ) : (
            <Button className="sz-press" onClick={upgrade}>
              {t.settingsPage.upgrade}
            </Button>
          )}
        </div>
      </section>
      {isAdmin ? (
        <section className="mt-4 rounded-[1.5rem] border border-white/[0.07] bg-[#0c0c0e] p-5">
          <p className="sz-label">{t.settingsPage.admin}</p>
          <Link href={DISCOVERY_ROUTES.admin} className="mt-2 inline-block text-sm text-white/70 hover:text-white">
            {t.settingsPage.openAdmin}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
