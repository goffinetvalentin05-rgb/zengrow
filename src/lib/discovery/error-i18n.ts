import type { AppDictionary } from "@/src/locales/app";

export function translateDiscoveryError(
  message: string | null | undefined,
  t: Pick<AppDictionary, "errors" | "slug">,
): string {
  if (!message?.trim()) return t.errors.generic;
  const msg = message.toLowerCase();
  if (msg.includes("already taken") || msg.includes("déjà pris")) return t.errors.usernameTaken;
  if (msg.includes("reserved") || msg.includes("réservé")) return t.slug.reserved;
  if (msg.includes("invalid") && msg.includes("url")) return t.errors.invalidUrl;
  if (msg.includes("required") || msg.includes("obligatoire")) return t.errors.required;
  if (msg.includes("18+")) return t.errors.age18;
  if (msg.includes("3–30") || msg.includes("3-30") || msg.includes("letters, numbers")) return t.errors.linkFormat;
  if (msg.includes("niche")) return t.errors.pickNiche;
  if (msg.includes("who you are") || msg.includes("qui tu es")) return t.errors.pickRole;
  if (msg.includes("pro feature") || msg.includes("fonctionnalité pro")) return t.errors.proFeature;
  if (msg.includes("upload")) return t.errors.uploadFailed;
  return t.errors.generic;
}
