import { clickThroughRate } from "@/src/lib/discovery/analytics";

export const PROFILE_CTA_TYPES = [
  "project",
  "website",
  "booking",
  "newsletter",
  "community",
  "content",
  "contact",
  "custom",
] as const;

export type ProfileCtaType = (typeof PROFILE_CTA_TYPES)[number];

export const PROFILE_CTA_TYPE_LABELS: Record<ProfileCtaType, string> = {
  project: "Project",
  website: "Website",
  booking: "Book a call",
  newsletter: "Newsletter",
  community: "Community",
  content: "Content",
  contact: "Contact",
  custom: "Custom",
};

export const PROFILE_CTA_PLACEHOLDERS: Record<ProfileCtaType, string> = {
  project: "See my SaaS",
  website: "Visit website",
  booking: "Book a call",
  newsletter: "Join my newsletter",
  community: "Join the community",
  content: "Watch the latest video",
  contact: "Get in touch",
  custom: "Learn more",
};

export const PROFILE_BLOCK_TYPES = [
  "featured_project",
  "featured_video",
  "newsletter",
  "booking",
  "offer",
  "community",
  "custom",
] as const;

export type ProfileBlockType = (typeof PROFILE_BLOCK_TYPES)[number];

export const PROFILE_BLOCK_TYPE_LABELS: Record<ProfileBlockType, string> = {
  featured_project: "Featured project",
  featured_video: "Featured video",
  newsletter: "Newsletter",
  booking: "Book a call",
  offer: "My offer",
  community: "Community",
  custom: "Custom link",
};

export const PROFILE_BLOCK_DEFAULTS: Record<
  ProfileBlockType,
  { title: string; description: string; ctaLabel: string }
> = {
  featured_project: { title: "Featured project", description: "", ctaLabel: "Open project" },
  featured_video: { title: "Featured video", description: "", ctaLabel: "Watch" },
  newsletter: { title: "Join my newsletter", description: "Weekly notes on building.", ctaLabel: "Subscribe" },
  booking: { title: "Book a call", description: "15–30 minutes.", ctaLabel: "Book a call" },
  offer: { title: "My offer", description: "", ctaLabel: "Learn more" },
  community: { title: "Join my community", description: "", ctaLabel: "Join" },
  custom: { title: "Custom", description: "", ctaLabel: "Open" },
};

export const MAX_ACTIVE_PROFILE_BLOCKS = 3;
export const MAX_PROFILE_BLOCKS = 8;
export const MAX_CTA_LABEL = 48;
export const MAX_BLOCK_TITLE = 80;
export const MAX_BLOCK_DESCRIPTION = 180;
export const MAX_BLOCK_CTA_LABEL = 40;

export function isProfileCtaType(value: string | null | undefined): value is ProfileCtaType {
  return Boolean(value && PROFILE_CTA_TYPES.includes(value as ProfileCtaType));
}

export function isProfileBlockType(value: string | null | undefined): value is ProfileBlockType {
  return Boolean(value && PROFILE_BLOCK_TYPES.includes(value as ProfileBlockType));
}

export function resolveProfileCta(input: {
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  ctaType?: string | null;
}) {
  const label = input.ctaLabel?.trim() ?? "";
  const url = input.ctaUrl?.trim() ?? "";
  if (!label || !url) return null;
  return {
    label: label.slice(0, MAX_CTA_LABEL),
    url,
    type: isProfileCtaType(input.ctaType) ? input.ctaType : "custom",
  };
}

export function activeProfileBlocks<T extends { isActive: boolean; url: string | null }>(blocks: T[]) {
  return blocks.filter((block) => block.isActive && Boolean(block.url?.trim())).slice(0, MAX_ACTIVE_PROFILE_BLOCKS);
}

export type ConversionBlockStat = {
  key: string;
  label: string;
  count: number;
};

export type ConversionMetrics = {
  ctaClicks: number;
  ctaCtr: number | null;
  blockClicks: ConversionBlockStat[];
  topConvertingBlock: ConversionBlockStat | null;
};

export function emptyConversionMetrics(): ConversionMetrics {
  return { ctaClicks: 0, ctaCtr: null, blockClicks: [], topConvertingBlock: null };
}

export function mapConversionMetrics(input: {
  views: number;
  ctaClicks: number;
  blockClicks: ConversionBlockStat[];
}): ConversionMetrics {
  const blockClicks = [...input.blockClicks].sort((a, b) => b.count - a.count);
  return {
    ctaClicks: input.ctaClicks,
    ctaCtr: clickThroughRate(input.ctaClicks, input.views),
    blockClicks,
    topConvertingBlock: blockClicks[0] ?? null,
  };
}

export function blockStatLabel(type: string, title?: string | null) {
  const fallback = isProfileBlockType(type) ? PROFILE_BLOCK_TYPE_LABELS[type] : type;
  const clean = title?.trim();
  return clean || fallback;
}
