import { escapeHtml } from "@/src/components/dashboard/marketing/utils/escape-html";

export type CampaignEmailPreviewInput = {
  restaurantName: string;
  restaurantLogoUrl: string | null;
  subject: string;
  content: string;
  imageUrl: string | null;
  ctaUrl: string;
  ctaLabel?: string;
};

export function buildCampaignEmailPreviewHtml({
  restaurantName,
  restaurantLogoUrl,
  subject,
  content,
  imageUrl,
  ctaUrl,
  ctaLabel = "Réserver une table",
}: CampaignEmailPreviewInput): string {
  const normalizedSubject = subject.trim() || "Dernières nouvelles de votre restaurant";
  const messageParagraphs = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin:0 0 10px 0;color:#334155;font-size:14px;line-height:1.65;">${escapeHtml(line)}</p>`,
    )
    .join("");

  const safeRestaurantName = escapeHtml(restaurantName);
  const safeImageUrl = imageUrl?.trim() ? escapeHtml(imageUrl.trim()) : null;
  const safeCtaUrl = ctaUrl.trim() ? escapeHtml(ctaUrl.trim()) : null;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(normalizedSubject)}</title>
</head>
<body style="margin:0;padding:0;">
  <div style="background:#f8fafc;padding:24px 12px;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;">
      <div style="text-align:center;margin-bottom:16px;">
        ${
          restaurantLogoUrl?.trim()
            ? `<img src="${escapeHtml(restaurantLogoUrl.trim())}" alt="${safeRestaurantName}" style="height:44px;max-width:180px;object-fit:contain;margin:0 auto 10px;" />`
            : ""
        }
        <p style="margin:0;color:#0f172a;font-size:18px;font-weight:700;">${safeRestaurantName}</p>
      </div>
      <h1 style="margin:0 0 14px 0;color:#0f172a;font-size:22px;line-height:1.3;">${escapeHtml(normalizedSubject)}</h1>
      <div style="margin-bottom:18px;">${messageParagraphs}</div>
      ${
        safeImageUrl
          ? `<img src="${safeImageUrl}" alt="Image de campagne" style="display:block;width:100%;height:auto;border-radius:12px;border:1px solid #e2e8f0;margin:0 0 18px 0;" />`
          : ""
      }
      ${
        safeCtaUrl
          ? `<a href="${safeCtaUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#1F7A6C;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${escapeHtml(ctaLabel)}</a>`
          : ""
      }
    </div>
  </div>
</body>
</html>`;
}
