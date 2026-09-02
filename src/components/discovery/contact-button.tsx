"use client";

import { useId, useState } from "react";
import { Mail } from "lucide-react";
import Button from "@/src/components/ui/button";
import { SocialGlyph } from "@/src/components/discovery/social-glyph";
import { DiscoverySheet } from "@/src/components/discovery/mobile-sheet";
import { connectionContactMethods } from "@/src/lib/discovery/contact";
import { trackDiscoveryEvent } from "@/src/lib/discovery/track";
import type { SocialLink } from "@/src/lib/discovery/types";
import { useI18n } from "@/src/i18n/provider";
import { cn } from "@/src/lib/utils";

export function ContactButton({
  profileId,
  socialLinks,
  email,
  size = "sm",
  className,
}: {
  profileId: string;
  socialLinks: SocialLink[];
  email?: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const labelId = useId();
  const methods = connectionContactMethods({ socialLinks, email }).map((method) =>
    method.platform === "email" ? { ...method, label: t.common.email } : method,
  );

  return (
    <>
      <Button
        type="button"
        size={size}
        variant="secondary"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn("sz-press min-h-11 min-w-[6.5rem] rounded-2xl", className)}
      >
        {t.actions.contact}
      </Button>
      <DiscoverySheet open={open} title={t.actions.contact} onClose={() => setOpen(false)} labelledBy={labelId}>
        {methods.length ? (
          <ul className="space-y-1 pb-2">
            {methods.map((method) => (
              <li key={method.platform}>
                <a
                  href={method.href}
                  target={method.platform === "email" ? undefined : "_blank"}
                  rel={method.platform === "email" ? undefined : "noreferrer"}
                  onClick={() => {
                    trackDiscoveryEvent({
                      profileId,
                      eventType: "connection_contact_click",
                      platform: method.platform,
                      destination: method.href,
                    });
                    setOpen(false);
                  }}
                  className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-[15px] text-white/80"
                >
                  {method.platform === "email" ? (
                    <Mail className="h-4 w-4 text-white/50" strokeWidth={1.6} />
                  ) : (
                    <SocialGlyph platform={method.platform} className="h-4 w-4 text-white/50" />
                  )}
                  {method.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pb-4 text-sm text-white/40">{t.actions.noContact}</p>
        )}
      </DiscoverySheet>
    </>
  );
}
