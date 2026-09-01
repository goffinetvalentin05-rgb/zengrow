import { normalizeHttpUrl } from "@/src/lib/discovery/media";
import { SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import type { SocialLink } from "@/src/lib/discovery/types";

export type ConnectionContactMethod = {
  platform: "instagram" | "linkedin" | "email" | "x" | "website";
  label: string;
  href: string;
};

const PRIORITY: ConnectionContactMethod["platform"][] = ["instagram", "linkedin", "email", "x", "website"];

export function connectionContactMethods(input: {
  socialLinks: SocialLink[];
  email?: string | null;
}): ConnectionContactMethod[] {
  const byPlatform = new Map(input.socialLinks.map((link) => [link.platform, link]));
  const methods: ConnectionContactMethod[] = [];

  for (const platform of PRIORITY) {
    if (platform === "email") {
      const email = input.email?.trim();
      if (email && email.includes("@") && !email.endsWith("@example.com")) {
        methods.push({ platform: "email", label: "Email", href: `mailto:${email}` });
      }
      continue;
    }
    const link = byPlatform.get(platform);
    if (!link?.url) continue;
    methods.push({
      platform,
      label: SOCIAL_PLATFORM_LABELS[platform as SocialPlatform] ?? platform,
      href: normalizeHttpUrl(link.url),
    });
  }

  return methods;
}
