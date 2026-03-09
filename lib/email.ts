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
  customerName: string;
  restaurantName: string;
  reviewUrl: string;
};

export async function sendReviewRequestEmail({
  to,
  customerName,
  restaurantName,
  reviewUrl,
}: ReviewRequestParams) {
  const resend = getResendClient();

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Merci pour votre visite",
    html: `
      <p>Bonjour ${customerName}</p>
      <p>Merci pour votre visite chez ${restaurantName}.</p>
      <p>Avant de vous demander un avis public, nous aimerions savoir comment s'est passee votre experience.</p>
      <p>
        <a href="${reviewUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#1f7a6c;color:#ffffff;text-decoration:none;font-weight:600;">
          Donner mon avis
        </a>
      </p>
    `,
    text: [
      `Bonjour ${customerName}`,
      "",
      `Merci pour votre visite chez ${restaurantName}.`,
      "Avant de vous demander un avis public, nous aimerions savoir comment s'est passee votre experience.",
      "",
      `Donner mon avis : ${reviewUrl}`,
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
