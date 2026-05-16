const PALETTES = [
  { bg: "bg-zg-accent-soft-bg", text: "text-zg-accent" },
  { bg: "bg-zg-info-soft-bg", text: "text-zg-info" },
  { bg: "bg-zg-premium-soft-bg", text: "text-zg-premium" },
  { bg: "bg-zg-success-soft-bg", text: "text-zg-success" },
  { bg: "bg-zg-warning-soft-bg", text: "text-zg-warning" },
  { bg: "bg-violet-500/15", text: "text-violet-300" },
  { bg: "bg-sky-500/15", text: "text-sky-300" },
  { bg: "bg-rose-500/15", text: "text-rose-300" },
] as const;

const SOLID_PALETTES = [
  { bg: "bg-zg-accent", text: "text-white" },
  { bg: "bg-zg-info", text: "text-white" },
  { bg: "bg-emerald-600", text: "text-white" },
  { bg: "bg-violet-600", text: "text-white" },
  { bg: "bg-sky-600", text: "text-white" },
  { bg: "bg-rose-600", text: "text-white" },
  { bg: "bg-amber-600", text: "text-white" },
  { bg: "bg-indigo-600", text: "text-white" },
] as const;

function hashName(name: string): number {
  const seed = name.trim() || "?";
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function guestAvatarColorClasses(name: string): { bg: string; text: string } {
  return PALETTES[hashName(name) % PALETTES.length] ?? PALETTES[0];
}

export function guestAvatarSolidClasses(name: string): { bg: string; text: string } {
  return SOLID_PALETTES[hashName(name) % SOLID_PALETTES.length] ?? SOLID_PALETTES[0];
}

export function guestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
  }
  return (parts[0] ?? "?").slice(0, 2).toUpperCase();
}
