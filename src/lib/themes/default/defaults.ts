import type { PageSectionContentV1 } from "@/src/lib/public-page/page-sections";

/** Textes et listes par défaut (thème default) — le thème ne fait qu’habiller ces données. */
export function defaultPageSectionsContent(): PageSectionContentV1 {
  return {
    navigation: {
      items: [
        { anchorId: "accueil", label: "Accueil" },
        { anchorId: "concept", label: "Concept" },
        { anchorId: "menu", label: "Menu" },
        { anchorId: "reservation", label: "Réserver" },
        { anchorId: "infos", label: "Infos pratiques" },
        { anchorId: "contact", label: "Contact" },
      ],
      giftNavLabel: "Cadeaux",
    },
    hero: {
      scriptLineFallback: "Une expérience",
      scrollHintLabel: "Scroll",
      discoverConceptLabel: "Découvrir le concept",
    },
    concept: {
      eyebrow: "Le concept",
      imageStampLabel: "Maison",
    },
    highlights: {
      eyebrow: "",
    },
    menu_offers: {
      eyebrow: "Carte & offres",
      title: "Notre menu",
      pdfButtonLabel: "Voir la carte complète",
    },
    gallery: {
      eyebrow: "Galerie",
      titleIfInstagram: "L'ambiance en images",
      titleIfNoInstagram: "Le lieu en images",
      instagramLinkLabel: "Suivre sur Instagram",
    },
    reviews: {
      googleReviewsSuffix: "avis Google",
      googleCtaLabel: "Voir les avis",
      pressHeading: "On parle de nous",
      tripAdvisorLabel: "TripAdvisor",
    },
    gift_vouchers: {
      surfaceEyebrow: "Bons cadeaux",
      modalEyebrow: "Bon cadeau",
      modalTitle: "Votre demande",
      submitLabel: "Envoyer la demande",
      submittingLabel: "Envoi…",
      successTitle: "Demande envoyée.",
      successBody: "Le restaurant vous contactera pour finaliser le bon cadeau.",
      fallbackTitle: "Offrir un bon cadeau",
      fallbackBody:
        "Faites plaisir avec une expérience gourmande. Indiquez vos souhaits : nous vous recontactons pour finaliser le bon.",
      fallbackCta: "Demander un bon cadeau",
    },
    final_cta: {
      eyebrow: "Réservation",
    },
    practical: {
      eyebrow: "Venir nous voir",
      title: "Infos pratiques",
      labelAddress: "Adresse",
      labelPhone: "Téléphone",
      labelHours: "Horaires",
      labelParking: "Parking",
      labelAccessibility: "Accessibilité",
      directionsLabel: "Itinéraire",
    },
    reservation_shell: {
      eyebrow: "Réservation",
      phonePreferLabel: "Vous préférez appeler ?",
    },
    menu_documents: {
      eyebrow: "Documents",
      title: "Cartes & menus",
      linkPrefix: "Voir",
      linkOpen: "Ouvrir →",
    },
  };
}
