/** Relative post-OAuth path only. Blocks open redirects. */
export function safeAuthNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/start";
  }
  return value;
}

/** Browser: current origin. Server: NEXT_PUBLIC_SITE_URL, else localhost. */
export function getAuthCallbackUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return `${site || "http://localhost:3000"}/auth/callback`;
}
