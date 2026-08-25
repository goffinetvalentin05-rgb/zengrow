import type { StorefrontLinkId } from "@/src/lib/public-storefront/footer-links";

export { storefrontFooterLinks } from "@/src/lib/public-storefront/footer-links";

const PATHS: Record<StorefrontLinkId, string> = {
  instagram:
    "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 1.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5V7A2.5 2.5 0 0 0 17 4.5zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.5A2.5 2.5 0 1 0 12 15a2.5 2.5 0 0 0 0-5zM17.2 6.3a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z",
  facebook: "M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z",
  tiktok:
    "M14.5 3c.4 2.4 1.8 4.1 4.2 4.4v2.6c-1.4 0-2.7-.4-3.9-1.2v6.7c0 3.3-2.6 5.5-5.6 5.5S3.5 18.8 3.5 15.5 6.2 10 9.2 10c.3 0 .7 0 1 .1v2.7c-.3-.1-.6-.2-1-.2-1.6 0-2.8 1.2-2.8 2.9s1.2 2.9 2.8 2.9 2.9-1.2 2.9-2.9V3h2.4z",
  website:
    "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 1.5a7.5 7.5 0 0 0 0 15m0-15a7.5 7.5 0 0 1 0 15M3.8 9h16.4M3.8 15h16.4M8 4.2c-1.6 2.4-2.4 5-2.4 7.8s.8 5.4 2.4 7.8M16 4.2c1.6 2.4 2.4 5 2.4 7.8s-.8 5.4-2.4 7.8",
  phone:
    "M7.2 3.6c.4-.4 1-.5 1.5-.3l2.4 1c.5.2.8.7.8 1.2v2.2c0 .4-.2.8-.5 1.1L10 10.2a12.4 12.4 0 0 0 3.8 3.8l1.4-1.4c.3-.3.7-.5 1.1-.5h2.2c.5 0 1 .3 1.2.8l1 2.4c.2.5.1 1.1-.3 1.5l-1.3 1.3c-.4.4-1 .6-1.6.6C11.2 20.7 3.3 12.8 3.3 6.5c0-.6.2-1.2.6-1.6L7.2 3.6z",
  email:
    "M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 1.6 7.4 5.1c.4.3.8.3 1.2 0L20 7.6V8L12.4 13c-.2.2-.6.2-.8 0L4 8v-.4z",
};

export function StorefrontGlyph({ id }: { id: StorefrontLinkId }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d={PATHS[id]} />
    </svg>
  );
}
