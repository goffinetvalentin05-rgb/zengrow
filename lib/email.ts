import { Resend } from "resend";
import {
  buildReservationConfirmationVariableValues,
  effectiveReservationConfirmationBody,
  effectiveReservationConfirmationSubject,
  type ReservationConfirmationTemplateContext,
} from "@/src/lib/email/reservation-confirmation-template";

/** Domaine d’envoi (ex. vérifié sur Resend) — à surcharger avec RESEND_FROM_EMAIL si besoin. */
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL?.trim() || "ZenGrow <notifications@obillz.com>";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing env var: RESEND_API_KEY");
  }

  return new Resend(apiKey);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export type SendReservationConfirmationEmailParams = {
  to: string;
  customSubject?: string | null;
  customBody?: string | null;
  context: ReservationConfirmationTemplateContext;
  restaurantLogoUrl?: string | null;
  primaryColor?: string | null;
};

export async function sendReservationConfirmationEmail({
  to,
  customSubject,
  customBody,
  context,
  restaurantLogoUrl,
  primaryColor,
}: SendReservationConfirmationEmailParams) {
  const resend = getResendClient();
  const values = buildReservationConfirmationVariableValues(context);
  const subject = effectiveReservationConfirmationSubject(customSubject, values);
  const bodyPlain = effectiveReservationConfirmationBody(customBody, values);
  const safeColor = primaryColor?.trim() || "#1F7A6C";
  const safeRestaurantName = escapeHtml(context.restaurantName.trim() || "Restaurant");

  const messageParagraphs = bodyPlain
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin:0 0 10px 0;color:#334155;font-size:15px;line-height:1.65;">${escapeHtml(line)}</p>`,
    )
    .join("");

  const html = `
      <div style="background:#f8fafc;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:28px 24px;">
          <div style="text-align:center;margin-bottom:18px;">
            ${
              restaurantLogoUrl
                ? `<img src="${escapeHtml(restaurantLogoUrl)}" alt="${safeRestaurantName}" style="height:44px;max-width:180px;object-fit:contain;margin:0 auto 10px;" />`
                : ""
            }
            <p style="margin:0;color:#0f172a;font-size:17px;font-weight:700;">${safeRestaurantName}</p>
          </div>
          <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:600;">Confirmation</p>
          <h1 style="margin:0 0 18px 0;color:#0f172a;font-size:22px;line-height:1.3;font-weight:700;">${escapeHtml(subject)}</h1>
          <div style="margin-bottom:22px;">${messageParagraphs}</div>
          <div style="margin-top:8px;padding-top:18px;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 6px 0;font-size:13px;color:#64748b;line-height:1.5;">Récapitulatif</p>
            <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.6;">
              <strong>Date</strong> : ${escapeHtml(values.reservation_date)}<br/>
              <strong>Heure</strong> : ${escapeHtml(values.reservation_time)}<br/>
              <strong>Personnes</strong> : ${escapeHtml(values.party_size)}<br/>
              <strong>Zone</strong> : ${escapeHtml(values.reservation_area)}
            </p>
          </div>
          ${
            values.restaurant_phone || values.restaurant_email
              ? `<div style="margin-top:18px;">
                  <p style="margin:0 0 6px 0;font-size:13px;color:#64748b;">Contact du restaurant</p>
                  ${
                    values.restaurant_phone
                      ? `<p style="margin:0;font-size:14px;color:#0f172a;"><a href="tel:${escapeHtml(values.restaurant_phone.replace(/\s/g, ""))}" style="color:${safeColor};text-decoration:none;font-weight:600;">${escapeHtml(values.restaurant_phone)}</a></p>`
                      : ""
                  }
                  ${
                    values.restaurant_email
                      ? `<p style="margin:4px 0 0 0;font-size:14px;color:#0f172a;"><a href="mailto:${escapeHtml(values.restaurant_email)}" style="color:${safeColor};text-decoration:none;font-weight:600;">${escapeHtml(values.restaurant_email)}</a></p>`
                      : ""
                  }
                </div>`
              : ""
          }
          <p style="margin:24px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">Ce message a été envoyé via ZenGrow pour ${safeRestaurantName}.</p>
        </div>
      </div>
    `;

  const textLines = [
    subject,
    "",
    bodyPlain,
    "",
    `Date : ${values.reservation_date}`,
    `Heure : ${values.reservation_time}`,
    `Personnes : ${values.party_size}`,
    `Zone : ${values.reservation_area}`,
  ];
  if (values.restaurant_phone) textLines.push("", `Téléphone : ${values.restaurant_phone}`);
  if (values.restaurant_email) textLines.push(`E-mail : ${values.restaurant_email}`);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text: textLines.join("\n"),
  });
}

type ReservationPendingParams = {
  to: string;
  customerName: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
};

export async function sendReservationReceivedEmail({
  to,
  customerName,
  restaurantName,
  date,
  time,
  guests,
}: ReservationPendingParams) {
  const resend = getResendClient();

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Demande de réservation bien reçue",
    text: [
      `Bonjour ${customerName}`,
      "",
      `Nous avons bien enregistré votre demande de réservation chez ${restaurantName}.`,
      "",
      `Date souhaitée : ${date}`,
      `Heure : ${time}`,
      `Personnes : ${guests}`,
      "",
      "Nous vous confirmerons la disponibilité dans les plus brefs délais.",
      "",
      restaurantName,
    ].join("\n"),
  });
}

type ReservationCancellationParams = {
  to: string;
  customerName: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
};

export async function sendReservationCancellationEmail({
  to,
  customerName,
  restaurantName,
  date,
  time,
  guests,
}: ReservationCancellationParams) {
  const resend = getResendClient();

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Votre réservation a été annulée",
    text: [
      `Bonjour ${customerName}`,
      "",
      `Votre réservation chez ${restaurantName} a été annulée.`,
      "",
      `Date : ${date}`,
      `Heure : ${time}`,
      `Personnes : ${guests}`,
      "",
      "Pour toute question, contactez directement le restaurant.",
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
  /** URL du pixel 1×1 pour compter les ouvertures (optionnel). */
  openTrackingPixelUrl?: string | null;
};

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
  openTrackingPixelUrl,
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
          ${
            openTrackingPixelUrl
              ? `<img src="${escapeHtml(openTrackingPixelUrl)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;margin:0;padding:0;" />`
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
      "Un client a laissé un retour privé.",
      "",
      `Note : ${rating}`,
      `Message : ${message || "(Aucun message)"}`,
    ].join("\n"),
  });
}
