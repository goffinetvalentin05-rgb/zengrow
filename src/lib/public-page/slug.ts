import { slugifyRestaurantName } from "@/src/lib/utils";

export function sanitizePublicSlug(raw: string): string {
  return slugifyRestaurantName(raw).replace(/^-+|-+$/g, "").slice(0, 80);
}
