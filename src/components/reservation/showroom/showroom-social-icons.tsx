"use client";

import { Facebook, Globe, Instagram, Music2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

type SocialLink = {
  href: string;
  label: string;
  icon: typeof Instagram;
};

/** Icônes réseaux — discret, centré, sans texte */
export function ShowroomSocialIcons({
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  websiteUrl,
  className,
}: {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  websiteUrl?: string | null;
  className?: string;
}) {
  const links: SocialLink[] = [];
  if (instagramUrl?.trim()) {
    links.push({ href: instagramUrl.trim(), label: "Instagram", icon: Instagram });
  }
  if (facebookUrl?.trim()) {
    links.push({ href: facebookUrl.trim(), label: "Facebook", icon: Facebook });
  }
  if (tiktokUrl?.trim()) {
    links.push({ href: tiktokUrl.trim(), label: "TikTok", icon: Music2 });
  }
  if (websiteUrl?.trim()) {
    links.push({ href: websiteUrl.trim(), label: "Site web", icon: Globe });
  }

  if (links.length === 0) return null;

  return (
    <div className={cn("zg-showroom-social-icons", className)} role="list">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="zg-showroom-social-icons__link"
            aria-label={link.label}
            role="listitem"
          >
            <Icon className="zg-showroom-social-icons__icon" aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
