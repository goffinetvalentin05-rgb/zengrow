function trimOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, "");
}

export function restaurantPublicPageUrl(origin: string, slug: string): string {
  const base = trimOrigin(origin);
  const path = `/r/${slug.trim()}`;
  return base ? `${base}${path}` : path;
}

export function restaurantGiftShopUrl(origin: string, slug: string): string {
  return `${restaurantPublicPageUrl(origin, slug)}#bons-cadeaux`;
}

export function giftShopEmbedSnippet(origin: string, slug: string): string {
  const href = restaurantGiftShopUrl(origin, slug);
  return `<a href="${href}">Offrir un bon cadeau</a>`;
}
