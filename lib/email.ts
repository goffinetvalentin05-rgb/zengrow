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
  googleReviewUrl: string;
  feedbackOkayUrl: string;
  feedbackBadUrl: string;
};

export async function sendReviewRequestEmail({
  to,
  restaurantName,
  googleReviewUrl,
  feedbackOkayUrl,
  feedbackBadUrl,
}: ReviewRequestParams) {
  const resend = getResendClient();

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `How was your experience at ${restaurantName}?`,
    html: `
      <p>Bonjour,</p>
      <p>Merci d'avoir visite ${restaurantName}.</p>
      <p>Votre experience s'est-elle bien passee ?</p>
      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
        <a href="${googleReviewUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:600;">
          😊 Oui
        </a>
        <a href="${feedbackOkayUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#f59e0b;color:#ffffff;text-decoration:none;font-weight:600;">
          😐 Bof
        </a>
        <a href="${feedbackBadUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:600;">
          😞 Non
        </a>
      </div>
    `,
    text: [
      "Bonjour,",
      "",
      `Merci d'avoir visite ${restaurantName}.`,
      "Votre experience s'est-elle bien passee ?",
      "",
      `Oui: ${googleReviewUrl}`,
      `Bof: ${feedbackOkayUrl}`,
      `Non: ${feedbackBadUrl}`,
    ].join("\n"),
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
