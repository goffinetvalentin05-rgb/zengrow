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

export function guestAvatarColorClasses(name: string): { bg: string; text: string } {
  const seed = name.trim() || "?";
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTES[Math.abs(hash) % PALETTES.length] ?? PALETTES[0];
}

export function guestInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
  }
  return (parts[0] ?? "?").slice(0, 2).toUpperCase();
}
