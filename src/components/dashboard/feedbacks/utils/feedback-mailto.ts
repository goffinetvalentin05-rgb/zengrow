export function buildFeedbackReplyMailto(
  email: string,
  restaurantName: string,
  body?: string,
): string {
  const trimmed = email.trim();
  if (!trimmed) return "";
  const params = new URLSearchParams();
  params.set("subject", `Re: votre visite chez ${restaurantName}`);
  const draft = body?.trim();
  if (draft) params.set("body", draft);
  return `mailto:${trimmed}?${params.toString()}`;
}
