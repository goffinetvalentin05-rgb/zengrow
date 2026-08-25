export type StorefrontLinkId = "instagram" | "facebook" | "tiktok" | "website" | "phone" | "email";

export type StorefrontLinkItem = {
  id: StorefrontLinkId;
  href: string;
  label: string;
};

export function storefrontFooterLinks(input: {
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  showSocial: boolean;
  showWebsite: boolean;
  showPhone: boolean;
  showEmail: boolean;
}): StorefrontLinkItem[] {
  const links: StorefrontLinkItem[] = [];
  if (input.showSocial && input.instagramUrl) links.push({ id: "instagram", href: input.instagramUrl, label: "Instagram" });
  if (input.showSocial && input.facebookUrl) links.push({ id: "facebook", href: input.facebookUrl, label: "Facebook" });
  if (input.showSocial && input.tiktokUrl) links.push({ id: "tiktok", href: input.tiktokUrl, label: "TikTok" });
  if (input.showWebsite && input.websiteUrl) links.push({ id: "website", href: input.websiteUrl, label: "Site internet" });
  if (input.showPhone && input.phone) links.push({ id: "phone", href: `tel:${input.phone}`, label: "Téléphone" });
  if (input.showEmail && input.email) links.push({ id: "email", href: `mailto:${input.email}`, label: "E-mail" });
  return links;
}
