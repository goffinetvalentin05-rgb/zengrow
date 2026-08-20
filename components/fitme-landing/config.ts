export const PRODUCT = {
  name: "FITME",
  tagline: "Découvrez le style qui vous va vraiment",
} as const;

export const ROUTES = {
  home: "/",
  discover: "/discover",
  login: "/login",
  privacy: "/confidentialite",
  terms: "/conditions",
  contact: "mailto:hello@fitme.ch",
} as const;

export const CONTACT_EMAIL = "hello@fitme.ch";

export const SEO = {
  title: `${PRODUCT.name} — Découvrez le style qui vous va vraiment`,
  description:
    "Découvrez les styles et les couleurs qui vous mettent réellement en valeur. Visualisez plusieurs looks directement sur vous.",
  ogImage: "/fitme/hero-editorial.png",
} as const;

/** Placeholder until a live counter exists. Keep this the single source of truth. */
export const SOCIAL_PROOF = {
  profilesDiscoveredToday: 47,
} as const;

export function getSocialProofBadge(
  count: number = SOCIAL_PROOF.profilesDiscoveredToday,
) {
  return `+${count} profils de style découverts aujourd’hui`;
}

export const CTA = {
  primary: "Découvrir mon style",
  primaryArrow: "Découvrir mon style →",
  finePrint: "Analyse unique · Sans abonnement",
  noSubscription: "Sans abonnement",
  paywallNote: "Résultat complet payant après l’analyse.",
} as const;

export const IMAGES = {
  original: "/fitme/portrait-original.png",
  cleanMinimal: "/fitme/portrait-clean-minimal.png",
  oldMoney: "/fitme/portrait-old-money.png",
  streetwear: "/fitme/portrait-streetwear.png",
  smartCasual: "/fitme/portrait-smart-casual.png",
  relaxed: "/fitme/portrait-relaxed.png",
  workwear: "/fitme/portrait-workwear.png",
  colorBest: "/fitme/portrait-color-best.png",
  colorLess: "/fitme/portrait-color-less.png",
  fitcheckBuy: "/fitme/fitcheck-jacket.png",
  fitcheckSkip: "/fitme/fitcheck-skip-shirt.png",
  campaignDesktop: "/fitme/campaign-hero-desktop.png",
  campaignMobile: "/fitme/campaign-hero-mobile.png",
  heroEditorial: "/fitme/hero-editorial.png",
} as const;

export const BEST_COLORS = [
  { name: "Cream", hex: "#E8DFD0" },
  { name: "Charcoal", hex: "#2C2C2C" },
  { name: "Navy", hex: "#1F3347" },
  { name: "Olive", hex: "#6B6A43" },
  { name: "Taupe", hex: "#8A7A6B" },
  { name: "Burgundy", hex: "#6E2F3C" },
] as const;

export const LESS_FLATTERING_COLORS = [
  { name: "Fuchsia", hex: "#E23CA0" },
  { name: "Ice blue", hex: "#9BB7D4" },
  { name: "Acid yellow", hex: "#E8E04A" },
] as const;

export const DEMO_PROFILE = {
  topStyle: "Clean Minimal",
  topMatch: 94,
  topNote: "Lignes nettes, volumes calmes, presque rien de trop.",
  secondaryStyle: "Smart Casual",
  secondaryMatch: 88,
  looks: [
    { src: IMAGES.cleanMinimal, label: "Clean Minimal" },
    { src: IMAGES.smartCasual, label: "Smart Casual" },
    { src: IMAGES.oldMoney, label: "Old Money" },
    { src: IMAGES.streetwear, label: "Streetwear" },
  ],
} as const;

export const HOW_IT_WORKS = [
  {
    step: "01",
    visual: "upload",
    title: "Ajoutez vos photos",
    text: "Quelques photos suffisent pour créer votre profil.",
  },
  {
    step: "02",
    visual: "analyze",
    title: "On analyse votre style",
    text: "Plusieurs univers et palettes sont comparés à votre profil.",
  },
  {
    step: "03",
    visual: "profile",
    title: "Découvrez ce qui vous va",
    text: "Recevez vos meilleurs styles, vos couleurs et vos looks personnalisés.",
  },
] as const;

export const STYLE_SCAN_LOOKS = [
  { id: "original", label: "Original", image: IMAGES.original },
  { id: "old-money", label: "Old Money", image: IMAGES.oldMoney },
  { id: "streetwear", label: "Streetwear", image: IMAGES.streetwear },
  { id: "clean-minimal", label: "Clean Minimal", image: IMAGES.cleanMinimal },
  { id: "smart-casual", label: "Smart Casual", image: IMAGES.smartCasual },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Comment déterminez-vous les styles qui me correspondent ?",
    a: "À partir de vos photos, plusieurs univers vestimentaires et palettes sont comparés sur vous — apparence, teint, contraste, allure. Nous mettons ensuite en avant ceux qui vous mettent le plus en valeur, sans prétendre qu’un seul style serait « le bon ».",
  },
  {
    q: "Combien de photos dois-je envoyer ?",
    a: "Quelques photos suffisent. Idéalement de face, en lumière naturelle, avec des vêtements simples. Plus les photos sont claires, plus votre Style Profile est fidèle.",
  },
  {
    q: "Est-ce un abonnement ?",
    a: "Non. Aucun abonnement. Le résultat complet se débloque après l’analyse.",
  },
  {
    q: "Mes photos sont-elles privées ?",
    a: "Vos photos servent à créer votre Style Profile. Nous ne les publions pas et ne les utilisons pas comme contenu marketing.",
  },
  {
    q: "Qu’est-ce que FitCheck ?",
    a: "Une prochaine fonctionnalité : envoyez la photo ou le lien d’un vêtement avant de l’acheter, et obtenez un verdict selon votre Style Profile.",
  },
] as const;

export const NAV_LINKS = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#style-profile", label: "Style Profile" },
  { href: "#faq", label: "FAQ" },
] as const;

