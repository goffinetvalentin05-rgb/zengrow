"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { DiscoveryAvatar } from "@/src/components/discovery/avatar";
import Button from "@/src/components/ui/button";
import { profileHref } from "@/src/lib/discovery/routes";
import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { useI18n } from "@/src/i18n/provider";

export function ConnectionRequests({
  requests,
}: {
  requests: { id: string; profile: ProfileCardModel }[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const visible = requests.filter((item) => !hidden.has(item.id));
  if (!visible.length) return null;

  async function respond(profileId: string, requestId: string, action: "accept" | "decline") {
    setHidden((current) => new Set(current).add(requestId));
    const response = await fetch("/api/discovery/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, action }),
    });
    if (!response.ok) {
      setHidden((current) => {
        const next = new Set(current);
        next.delete(requestId);
        return next;
      });
      return;
    }
    router.refresh();
  }

  return (
    <section className="mb-10 rounded-[1.6rem] border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
      <p className="sz-label">{t.followingPage.requests}</p>
      <ul className="mt-4 space-y-3">
        {visible.map(({ id, profile }) => {
          const href = profile.username ? profileHref(profile.username) : "#";
          const role =
            profile.profileType && t.roles[profile.profileType]
              ? t.roles[profile.profileType]
              : profile.primaryCategory?.name;
          return (
            <li key={id} className="flex flex-col gap-3 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:border-0 sm:pb-0">
              <div className="flex min-w-0 items-center gap-3">
                <Link href={href} className="shrink-0">
                  <DiscoveryAvatar name={profile.displayName} src={profile.avatarUrl} size="md" />
                </Link>
                <Link href={href} className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-white">{profile.displayName}</p>
                  {role ? <p className="truncate text-sm text-white/40">{role}</p> : null}
                </Link>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button type="button" className="min-h-11 flex-1 sm:flex-none" onClick={() => void respond(profile.id, id, "accept")}>
                  {t.actions.accept}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 flex-1 sm:flex-none"
                  onClick={() => void respond(profile.id, id, "decline")}
                >
                  {t.actions.decline}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
