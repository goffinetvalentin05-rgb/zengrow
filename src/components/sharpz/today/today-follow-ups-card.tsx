"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, ExternalLink, Mail, MessageCircle } from "lucide-react";
import Badge from "@/src/components/ui/badge";
import Button, { buttonClassName } from "@/src/components/ui/button";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import type { DueFollowUpItem } from "@/src/lib/sharpz/follow-ups";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";

function fill(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

type Props = {
  items: DueFollowUpItem[];
};

export function TodayFollowUpsCard({ items: initialItems }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  if (!items.length) return null;

  async function runFollowUp(
    id: string,
    action: "completed" | "snooze",
    extra?: { channel?: string; daysFromNow?: number },
  ) {
    setBusyId(id);
    const response = await fetch(`/api/sharpz/prospects/${id}/follow-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        channel: extra?.channel,
        daysFromNow: extra?.daysFromNow ?? 3,
      }),
    });
    setBusyId(null);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    showToast({
      message: action === "completed" ? t.today.followUpMarkedDone : t.today.followUpSnoozed,
    });
    router.refresh();
  }

  async function copyScript(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      showToast({ message: t.today.scriptCopied });
    } catch {
      showToast({ message: t.common.error });
    }
  }

  const title =
    items.length === 1
      ? t.today.followUpCardTitleOne
      : fill(t.today.followUpCardTitleMany, { count: items.length });

  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  return (
    <div id="today-follow-ups" className="border-b border-white/[0.07] bg-white/[0.02]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning">{t.today.followUpBadge}</Badge>
            <span className="text-xs tabular-nums text-zg-muted">{items.length}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-zg-fg">{title}</h3>
          <p className="mt-1 text-sm text-zg-text-secondary">{t.today.followUpCardSubtitle}</p>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-zg-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-zg-muted" />
        )}
      </button>

      {open ? (
        <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {items.map((item) => {
            const statusLabel =
              t.prospectStatuses[item.status as keyof typeof t.prospectStatuses] ?? item.status;
            return (
              <li key={item.id} className="px-6 py-5">
                <div className="min-w-0">
                  <p className="font-semibold text-zg-fg">
                    {item.name?.trim() || item.company}
                    {item.name?.trim() ? (
                      <span className="font-normal text-zg-text-secondary"> · {item.company}</span>
                    ) : null}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zg-muted">
                    {statusLabel}
                    {" · "}
                    {item.recommendedChannel ?? t.today.followUpNoChannel}
                    {" · "}
                    {item.daysSinceContact != null
                      ? fill(t.today.followUpDaysSince, { days: item.daysSinceContact })
                      : t.today.followUpNeverContacted}
                    {item.contactedAt
                      ? ` · ${new Date(item.contactedAt).toLocaleDateString(dateLocale)}`
                      : null}
                  </p>
                  {item.recommendedScript ? (
                    <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-relaxed text-zg-text-secondary">
                      <span className="text-zg-muted">{t.today.recommendedScript}: </span>
                      {item.recommendedScript.content}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`${SHARPZ_ROUTES.prospects}?prospect=${item.id}`}
                    className={buttonClassName({ variant: "secondary", size: "sm" })}
                  >
                    <ExternalLink />
                    {t.today.openProspect}
                  </Link>
                  {item.recommendedScript ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void copyScript(item.recommendedScript!.content)}
                    >
                      <Copy />
                      {t.today.copyScript}
                    </Button>
                  ) : null}
                  {item.whatsappUrl ? (
                    <a
                      href={item.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClassName({ variant: "ghost", size: "sm" })}
                    >
                      <MessageCircle />
                      WhatsApp
                    </a>
                  ) : null}
                  {item.emailUrl ? (
                    <a href={item.emailUrl} className={buttonClassName({ variant: "ghost", size: "sm" })}>
                      <Mail />
                      Email
                    </a>
                  ) : null}
                  {item.linkedinUrl ? (
                    <a
                      href={item.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClassName({ variant: "ghost", size: "sm" })}
                    >
                      LinkedIn
                    </a>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    disabled={busyId === item.id}
                    onClick={() =>
                      void runFollowUp(item.id, "completed", {
                        channel: item.recommendedChannel ?? undefined,
                        daysFromNow: 3,
                      })
                    }
                  >
                    <Check />
                    {t.today.markFollowedUp}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busyId === item.id}
                    onClick={() => void runFollowUp(item.id, "snooze", { daysFromNow: 3 })}
                  >
                    {t.today.snoozeFollowUp}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
