/** Suggestions de réponse (V1 statique) selon la note — à brancher sur l’IA en V2. */
export function suggestedReplyForRating(rating: number, restaurantName: string): string {
  const name = restaurantName.trim() || "notre restaurant";
  if (rating >= 5) {
    return `Bonjour,\n\nMerci infiniment pour votre visite chez ${name} et pour ce magnifique retour. Toute l'équipe est ravie d'avoir contribué à ce moment.\n\nAu plaisir de vous accueillir à nouveau très bientôt,\nL'équipe ${name}`;
  }
  if (rating >= 4) {
    return `Bonjour,\n\nMerci d'avoir partagé votre expérience chez ${name}. Nous sommes heureux que votre visite vous ait plu et prenons note de vos remarques pour continuer à nous améliorer.\n\nBien cordialement,\nL'équipe ${name}`;
  }
  if (rating >= 3) {
    return `Bonjour,\n\nMerci pour votre retour après votre visite chez ${name}. Nous sommes désolés que l'expérience n'ait pas été à la hauteur de vos attentes et aimerions en savoir plus pour nous améliorer.\n\nN'hésitez pas à nous répondre,\nL'équipe ${name}`;
  }
  return `Bonjour,\n\nNous avons bien reçu votre message suite à votre visite chez ${name} et en sommes sincèrement désolés. Votre retour est important pour nous : nous allons le partager avec l'équipe et revenir vers vous si vous le souhaitez.\n\nBien cordialement,\nL'équipe ${name}`;
}
