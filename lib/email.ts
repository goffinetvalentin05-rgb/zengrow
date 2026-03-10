import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing env var: RESEND_API_KEY");
  }

  return new Resend(apiKey);
}

type ReservationConfirmationParams = {
  to: string;
  customerName: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
};

export async function sendReservationConfirmationEmail({
  to,
  customerName,
  restaurantName,
  date,
  time,
  guests,
}: ReservationConfirmationParams) {
  const resend = getResendClient();

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Votre reservation est confirmee",
    text: [
      `Bonjour ${customerName}`,
      "",
      `Votre reservation chez ${restaurantName} est confirmee.`,
      "",
      `Date : ${date}`,
      `Heure : ${time}`,
      `Personnes : ${guests}`,
      "",
      "Nous avons hate de vous accueillir.",
      "",
      restaurantName,
    ].join("\n"),
  });
}

type ReviewRequestParams = {
  to: string;
  restaurantName: string;
  restaurantLogoUrl?: string | null;
  googleReviewUrl: string;
  feedbackNeutralUrl: string;
  feedbackNegativeUrl: string;
  emailSubject?: string | null;
  emailMessage?: string | null;
  buttonPositiveLabel?: string | null;
  buttonNeutralLabel?: string | null;
  buttonNegativeLabel?: string | null;
  primaryColor?: string | null;
};

type MarketingCampaignEmailParams = {
  to: string;
  restaurantName: string;
  restaurantLogoUrl?: string | null;
  subject: string;
  content: string;
  imageUrl?: string | null;
  ctaLabel?: string;
  ctaUrl?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendReviewRequestEmail({
  to,
  restaurantName,
  restaurantLogoUrl,
  googleReviewUrl,
  feedbackNeutralUrl,
  feedbackNegativeUrl,
  emailSubject,
  emailMessage,
  buttonPositiveLabel,
  buttonNeutralLabel,
  buttonNegativeLabel,
  primaryColor,
}: ReviewRequestParams) {
  const resend = getResendClient();
  const safeColor = primaryColor || "#1F7A6C";

  const applyRestaurantName = (value: string) =>
    value.replaceAll("{{restaurant_name}}", restaurantName).replaceAll("[Restaurant Name]", restaurantName);

  const subject =
    applyRestaurantName(emailSubject || "Comment s'est passée votre expérience chez {{restaurant_name}} ?");
  const bodyMessage = applyRestaurantName(
    emailMessage ||
      "Merci pour votre visite chez {{restaurant_name}}.\nNous aimerions connaître votre expérience.",
  );
  const positiveLabel = buttonPositiveLabel || "Excellent";
  const neutralLabel = buttonNeutralLabel || "Moyen";
  const negativeLabel = buttonNegativeLabel || "À améliorer";
  const messageParagraphs = bodyMessage
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 10px 0;color:#334155;font-size:14px;line-height:1.6;">${line}</p>`)
    .join("");

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="background:#f8fafc;padding:24px 12px;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;">
          <div style="text-align:center;margin-bottom:16px;">
            ${restaurantLogoUrl ? `<img src="${restaurantLogoUrl}" alt="${restaurantName}" style="height:44px;max-width:180px;object-fit:contain;margin:0 auto 10px;" />` : ""}
            <p style="margin:0;color:#0f172a;font-size:18px;font-weight:700;">${restaurantName}</p>
          </div>
          <h1 style="margin:0 0 14px 0;color:#0f172a;font-size:22px;line-height:1.3;">${subject}</h1>
          <div style="margin-bottom:18px;">${messageParagraphs}</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr>
              <td style="padding:0 4px 8px 0;">
                <a href="${googleReviewUrl}" style="display:block;text-align:center;padding:12px 10px;border-radius:10px;background:${safeColor};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${positiveLabel}</a>
              </td>
              <td style="padding:0 4px 8px 4px;">
                <a href="${feedbackNeutralUrl}" style="display:block;text-align:center;padding:12px 10px;border-radius:10px;border:1px solid #cbd5e1;background:#ffffff;color:#334155;text-decoration:none;font-size:14px;font-weight:600;">${neutralLabel}</a>
              </td>
              <td style="padding:0 0 8px 4px;">
                <a href="${feedbackNegativeUrl}" style="display:block;text-align:center;padding:12px 10px;border-radius:10px;border:1px solid #cbd5e1;background:#ffffff;color:#334155;text-decoration:none;font-size:14px;font-weight:600;">${negativeLabel}</a>
              </td>
            </tr>
          </table>
        </div>
      </div>
    `,
    text: [
      subject,
      "",
      bodyMessage,
      "",
      `${positiveLabel}: ${googleReviewUrl}`,
      `${neutralLabel}: ${feedbackNeutralUrl}`,
      `${negativeLabel}: ${feedbackNegativeUrl}`,
    ].join("\n"),
  });
}

export async function sendMarketingCampaignEmail({
  to,
  restaurantName,
  restaurantLogoUrl,
  subject,
  content,
  imageUrl,
  ctaLabel = "Réserver une table",
  ctaUrl,
}: MarketingCampaignEmailParams) {
  const resend = getResendClient();
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

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: normalizedSubject,
    html: `
      <div style="background:#f8fafc;padding:24px 12px;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;">
          <div style="text-align:center;margin-bottom:16px;">
            ${restaurantLogoUrl ? `<img src="${restaurantLogoUrl}" alt="${safeRestaurantName}" style="height:44px;max-width:180px;object-fit:contain;margin:0 auto 10px;" />` : ""}
            <p style="margin:0;color:#0f172a;font-size:18px;font-weight:700;">${safeRestaurantName}</p>
          </div>
          <h1 style="margin:0 0 14px 0;color:#0f172a;font-size:22px;line-height:1.3;">${escapeHtml(normalizedSubject)}</h1>
          <div style="margin-bottom:18px;">${messageParagraphs}</div>
          ${imageUrl ? `<img src="${imageUrl}" alt="Image de campagne" style="display:block;width:100%;height:auto;border-radius:12px;border:1px solid #e2e8f0;margin:0 0 18px 0;" />` : ""}
          ${
            ctaUrl
              ? `<a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#1F7A6C;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">${escapeHtml(ctaLabel)}</a>`
              : ""
          }
        </div>
      </div>
    `,
    text: [normalizedSubject, "", content, "", ctaUrl ? `${ctaLabel}: ${ctaUrl}` : ""].filter(Boolean).join("\n"),
  });
}

type NegativeFeedbackParams = {
  to: string;
  restaurantName: string;
  rating: number;
  message: string;
};

export async function sendNegativeFeedbackEmail({
  to,
  restaurantName,
  rating,
  message,
}: NegativeFeedbackParams) {
  const resend = getResendClient();

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Nouveau feedback client",
    text: [
      `Bonjour ${restaurantName},`,
      "",
      "Un client a laisse un retour prive.",
      "",
      `Note : ${rating}`,
      `Message : ${message || "(Aucun message)"}`,
    ].join("\n"),
  });
}
