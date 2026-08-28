import type { LandingDictionary } from "./types";

export const fr: LandingDictionary = {
  meta: {
    title: "Sharpz — Sachez quoi faire ensuite pour développer votre SaaS",
    description:
      "Sharpz analyse votre SaaS, votre marché et votre landing pour vous aider à prioriser les actions qui peuvent réellement faire avancer votre produit.",
  },
  brand: {
    name: "Sharpz",
    tagline: "Votre copilote de croissance pour SaaS",
  },
  nav: {
    features: "Fonctionnalités",
    how: "Comment ça marche",
    faq: "FAQ",
    login: "Se connecter",
    cta: "Commencer gratuitement",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    homeAria: "Sharpz — accueil",
  },
  lang: {
    fr: "FR",
    en: "EN",
    switchAria: "Changer de langue",
  },
  hero: {
    badge: "Votre copilote de croissance pour SaaS",
    titleLine1: "Connectez votre SaaS.",
    titleLine2: "Sachez quoi faire ensuite.",
    subtitle:
      "Sharpz analyse votre produit, votre marché et votre croissance pour vous montrer les actions qui méritent vraiment votre attention.",
    ctaPrimary: "Analyser mon SaaS",
    ctaSecondary: "Voir comment ça marche",
    finePrint: "Une URL suffit pour commencer.",
    urlPlaceholder: "https://votresaas.com",
  },
  todayMockup: {
    title: "Today",
    actions: [
      {
        index: "01",
        title: "Améliorez votre hero",
        description: "Votre proposition de valeur manque de clarté.",
        impact: "High",
      },
      {
        index: "02",
        title: "Contactez ces 12 prospects",
        description: "Ils correspondent à votre cible actuelle.",
        impact: "High",
      },
      {
        index: "03",
        title: "Publiez ceci aujourd’hui",
        description: "Un sujet gagne en traction dans votre niche.",
        impact: "Medium",
      },
      {
        index: "04",
        title: "Un concurrent vient de changer ses prix",
        description: "Voir ce qui a changé",
        impact: "Medium",
      },
    ],
  },
  problem: {
    label: "Le problème",
    titleLine1: "Construire est devenu facile.",
    titleLine2: "Savoir quoi faire ensuite, beaucoup moins.",
    questions: [
      "Votre landing est-elle assez claire ?",
      "Où trouver vos prochains utilisateurs ?",
      "Que devriez-vous publier ?",
      "Qui devriez-vous contacter ?",
      "Votre pricing est-il le bon ?",
      "Que font vos concurrents ?",
    ],
    closeLabel: "Ce qui compte",
    closeTitle: "Toutes ces questions n’ont pas la même importance.",
    closeSubtitle:
      "Sharpz les analyse, les classe et vous montre où concentrer votre temps.",
    priorities: [
      { index: "01", impact: "High impact", title: "Réécrire votre hero", tone: "high" },
      { index: "02", impact: "High impact", title: "Contacter 8 prospects", tone: "high" },
      { index: "03", impact: "Medium impact", title: "Publier ce sujet aujourd’hui", tone: "medium" },
    ],
  },
  features: {
    label: "Un seul endroit",
    title: "Sharpz regarde votre SaaS sous tous les angles.",
    subtitle:
      "Votre produit, votre marché et votre croissance sont liés. Sharpz les analyse ensemble pour vous aider à prendre de meilleures décisions.",
    items: [
      {
        index: "01",
        title: "Améliorez ce que vos visiteurs voient.",
        text: "Sharpz analyse votre positionnement, votre message, vos CTA, votre pricing et les éléments qui peuvent freiner vos conversions.",
        chips: ["Clarté", "Confiance", "CTA", "Pricing", "Positionnement"],
      },
      {
        index: "02",
        title: "Concentrez-vous sur ce qui compte maintenant.",
        text: "Sharpz transforme ses analyses en une liste courte d’actions classées selon leur impact et l’effort nécessaire.",
        chips: [
          "Réécrire votre hero",
          "Contacter 8 prospects",
          "Tester un nouveau CTA",
          "Publier ce sujet aujourd’hui",
        ],
        phrase: "Moins de décisions. Plus d’exécution.",
      },
      {
        index: "03",
        title: "Repérez les opportunités que vous pourriez manquer.",
        text: "Sharpz détecte des pistes d’acquisition, de conversion et de croissance adaptées à votre SaaS.",
        chips: [
          "12 entreprises correspondent à votre cible.",
          "Une nouvelle opportunité apparaît dans votre niche.",
          "Votre pricing peut être repositionné.",
          "Un canal d’acquisition mérite d’être testé.",
        ],
      },
      {
        index: "04",
        title: "Trouvez les bonnes personnes à contacter.",
        text: "Sharpz comprend à qui votre produit s’adresse et vous aide à identifier des entreprises qui ont une vraie raison de l’utiliser.",
        chips: ["Fit élevé", "Correspond à votre ICP", "Pourquoi ce prospect ?"],
      },
      {
        index: "05",
        title: "Ne cherchez plus quoi publier.",
        text: "Sharpz utilise votre produit, votre cible et votre marché pour détecter les sujets qui peuvent attirer l’attention des bonnes personnes.",
        chips: ["LinkedIn", "X", "TikTok / Reels"],
      },
      {
        index: "06",
        title: "Sachez quand votre marché bouge.",
        text: "Sharpz surveille les changements importants chez vos concurrents et vous explique pourquoi ils peuvent compter pour vous.",
        chips: [
          "Nouveau pricing",
          "Nouveau positionnement",
          "Nouvelle fonctionnalité",
          "Changement de landing",
        ],
      },
    ],
    closingLine1: "Sharpz analyse beaucoup de choses.",
    closingLine2: "Mais il ne vous donne pas plus de bruit.",
    closingLine3: "Il vous montre où agir.",
  },
  how: {
    label: "Comment ça marche",
    title: "Une URL. Quelques questions. Une direction.",
    subtitle:
      "Sharpz commence par comprendre votre SaaS, affine son analyse avec quelques questions, puis vous montre quoi faire ensuite.",
    steps: [
      {
        index: "01",
        title: "Connectez votre SaaS",
        text: "Entrez simplement l’URL de votre produit.",
        visual: "url",
        urlPlaceholder: "https://votresaas.com",
      },
      {
        index: "02",
        title: "Sharpz vous pose quelques questions",
        text: "Quelques questions rapides pour mieux repérer vos priorités.",
        visual: "questions",
        bubbles: [
          "Votre priorité actuelle ?",
          "Plus d’utilisateurs ou plus de conversions ?",
          "À quel stade en êtes-vous ?",
        ],
      },
      {
        index: "03",
        title: "Sharpz comprend votre contexte",
        text: "Votre produit, votre cible, votre positionnement et votre marché sont analysés ensemble.",
        visual: "context",
        orbs: ["Produit", "ICP", "Landing", "Concurrents", "Positionnement", "Opportunités"],
      },
      {
        index: "04",
        title: "Chaque jour, vous savez quoi faire",
        text: "Sharpz vous montre les actions à prioriser pour faire avancer votre SaaS.",
        visual: "today",
        actions: ["Réécrire votre hero", "Contacter 8 prospects", "Publier ce sujet"],
      },
    ],
    closingLine1: "Vous construisez. Sharpz vous aide à décider",
    closingLine2: "où aller ensuite.",
  },
  faq: {
    label: "FAQ",
    title: "Les questions avant de connecter votre SaaS.",
    items: [
      {
        q: "Comment Sharpz analyse-t-il mon SaaS ?",
        a: "Vous commencez simplement par entrer l’URL de votre SaaS. Sharpz analyse les informations publiques de votre produit pour comprendre ce que vous vendez, à qui vous vous adressez et comment votre offre est présentée.",
      },
      {
        q: "Dois-je connecter mes données pour commencer ?",
        a: "Non. Une URL suffit pour commencer. Des intégrations pourront ensuite enrichir l’analyse avec vos propres données lorsque vous le souhaitez.",
      },
      {
        q: "Sharpz fonctionne-t-il avec n’importe quel SaaS ?",
        a: "Sharpz est conçu principalement pour les SaaS, les produits numériques et les founders qui veulent savoir quelles actions prioriser.",
      },
      {
        q: "Est-ce que Sharpz agit automatiquement à ma place ?",
        a: "Non. Sharpz vous aide à comprendre quoi faire et pourquoi, mais vous gardez le contrôle sur les décisions et les actions.",
      },
      {
        q: "Est-ce simplement ChatGPT avec une autre interface ?",
        a: "Non. Sharpz ne se contente pas de répondre à une question. Il comprend votre SaaS, son contexte et fait remonter les actions qui méritent votre attention.",
      },
    ],
  },
  finalCta: {
    label: "Votre prochaine étape",
    titleLine1: "Vous avez construit votre SaaS.",
    titleLine2: "Sharpz vous montre quoi faire ensuite.",
    subtitle: "Entrez votre URL et découvrez les actions qui méritent votre attention.",
    urlPlaceholder: "https://votresaas.com",
    analyze: "Analyser mon SaaS",
    finePrint: "Une URL suffit pour commencer.",
  },
  footer: {
    product: "Produit",
    faq: "FAQ",
    privacy: "Confidentialité",
    terms: "Conditions",
    tagline: "Built for SaaS founders.",
  },
  sign: {
    marks: ["Positionnement", "Croissance", "Clarté", "Conversion", "Priorités"],
  },
};
