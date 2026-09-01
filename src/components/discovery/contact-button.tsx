"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Mail } from "lucide-react";
import Button from "@/src/components/ui/button";
import { SocialGlyph } from "@/src/components/discovery/social-glyph";
import { connectionContactMethods } from "@/src/lib/discovery/contact";
import { trackDiscoveryEvent } from "@/src/lib/discovery/track";
import type { SocialLink } from "@/src/lib/discovery/types";
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
  const root = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const methods = connectionContactMethods({ socialLinks, email });

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <Button
        type="button"
        size={size}
        variant="secondary"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className={cn("sz-press min-w-[6.5rem] rounded-2xl", className)}
      >
        Contact
      </Button>
      {open ? (
        <div
          role="dialog"
          aria-labelledby={labelId}
          className="absolute left-0 right-0 z-30 mt-2 min-w-[16rem] overflow-hidden rounded-[1.25rem] border border-white/[0.1] bg-[#121214] p-2 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)] sm:left-auto sm:right-0"
        >
          <p id={labelId} className="sz-label px-3 py-2">
            Contact
          </p>
          {methods.length ? (
            <ul>
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
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/80 hover:bg-white/[0.06] hover:text-white"
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
            <p className="px-3 pb-3 pt-1 text-sm text-white/40">No contact method available.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
