import { RESERVED_PROFILE_SLUG_SET, USERNAME_PATTERN } from "@/src/lib/discovery/constants";

export function slugifyUsername(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/_+/g, "_")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 30);
}

export function normalizePublicSlug(value: string) {
  return value.trim().toLowerCase().replace(/^\/+/, "");
}

export function isReservedProfileSlug(value: string) {
  return RESERVED_PROFILE_SLUG_SET.has(normalizePublicSlug(value));
}

export function isValidPublicSlug(value: string) {
  const slug = normalizePublicSlug(value);
  return USERNAME_PATTERN.test(slug) && !isReservedProfileSlug(slug);
}

export function slugifyHandle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}
