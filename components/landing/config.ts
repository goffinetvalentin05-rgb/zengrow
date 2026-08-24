import { BRAND_NAME } from "./brand";

export const PRODUCT = {
  name: BRAND_NAME,
  tagline: "L’infrastructure de bons cadeaux pour les établissements physiques.",
} as const;

export const ROUTES = {
  home: "/",
  signup: "/pro/signup",
  login: "/pro/login",
  privacy: "/confidentialite",
  terms: "/conditions",
  product: "#produit",
  how: "#fonctionnement",
  pricing: "#commencer",
  faq: "#faq",
  start: "#commencer",
  contact: "mailto:contact@zengrow.ch",
} as const;

export const SEO = {
  title: `${PRODUCT.name} — Bons cadeaux digitaux pour établissements`,
  description:
    "Vendez vos propres bons cadeaux depuis votre site, dans votre établissement ou sur vos réseaux. Paiement, envoi, Wallet et utilisation : tout est centralisé.",
} as const;

export const CTA = {
  primary: "Commencer gratuitement",
  secondary: "Voir ZifTip en action",
  finePrint: "0 CHF tant que vous ne vendez rien.",
} as const;

export const NAV_LINKS = [
  { href: ROUTES.product, label: "Produit" },
  { href: ROUTES.how, label: "Comment ça marche" },
  { href: ROUTES.pricing, label: "Tarifs" },
  { href: ROUTES.faq, label: "FAQ" },
] as const;

export const MOBILE_NAV_PRIMARY = [
  ...NAV_LINKS,
  { href: ROUTES.contact, label: "Contact" },
] as const;

export const MOBILE_NAV_SECONDARY = [
  { href: ROUTES.login, label: "Connexion" },
  { href: ROUTES.terms, label: "Mentions légales" },
  { href: ROUTES.privacy, label: "Confidentialité" },
] as const;

export const FOOTER_PRODUCT_LINKS = [
  { href: ROUTES.home, label: "Produit" },
  { href: ROUTES.faq, label: "Comment ça marche" },
  { href: ROUTES.start, label: "Tarifs" },
  { href: ROUTES.faq, label: "FAQ" },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { href: ROUTES.contact, label: "Contact" },
  { href: ROUTES.login, label: "Connexion" },
  { href: ROUTES.terms, label: "Mentions légales" },
  { href: ROUTES.privacy, label: "Confidentialité" },
] as const;

export const LEGAL_LINKS = [
  { href: ROUTES.privacy, label: "Confidentialité" },
  { href: ROUTES.terms, label: "Mentions légales" },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Comment intégrer ZifTip à mon site ?",
    a: "Ajoutez un bouton ou un lien « Offrir un bon cadeau » sur votre site existant. ZifTip gère la page d’achat, le paiement et l’envoi — sans développement lourd. Si vous n’avez pas encore de site, un lien direct ou un QR suffisent.",
  },
  {
    q: "Puis-je vendre mes bons directement dans mon établissement ?",
    a: "Oui. Affichez un QR ou un support au comptoir : le client scanne, choisit un montant et paie. La vente rejoint le même système que vos ventes en ligne.",
  },
  {
    q: "Le bon peut-il être utilisé en plusieurs fois ?",
    a: "Oui. Chaque passage déduit le montant utilisé. Le solde restant reste visible sur le bon digital, jusqu’à épuisement.",
  },
  {
    q: "Comment mes clients reçoivent-ils leur bon ?",
    a: "Ils reçoivent un bon digital, immédiatement ou à la date choisie. Ils peuvent le conserver dans le téléphone, sans application à installer.",
  },
  {
    q: "Comment fonctionne la commission ?",
    a: "0 CHF tant que vous ne vendez rien. Aucun abonnement obligatoire pour commencer. Nous ne facturons que lorsqu’un bon est vendu — le taux exact est indiqué à l’activation.",
  },
  {
    q: "Comment suivre les bons utilisés ?",
    a: "Tout est centralisé au même endroit : ventes, soldes, utilisations partielles et origine de chaque bon (site, établissement, réseaux).",
  },
  {
    q: "Est-ce que ZifTip fonctionne avec Apple Wallet ?",
    a: "ZifTip est conçu pour Apple Wallet : le bon peut rester dans le téléphone, sans application à installer. Le client le présente simplement à l’établissement.",
  },
] as const;
