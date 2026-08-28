import type { LandingDictionary } from "./types";

export const en: LandingDictionary = {
  meta: {
    title: "Sharpz — Know What To Do Next For Your SaaS",
    description:
      "Sharpz analyzes your SaaS, market and website to help you prioritize the actions that can actually move your product forward.",
  },
  brand: {
    name: "Sharpz",
    tagline: "Your SaaS growth copilot",
  },
  nav: {
    features: "Features",
    how: "How it works",
    faq: "FAQ",
    login: "Log in",
    cta: "Start for free",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    homeAria: "Sharpz — home",
  },
  lang: {
    fr: "FR",
    en: "EN",
    switchAria: "Switch language",
  },
  hero: {
    badge: "Your SaaS growth copilot",
    titleLine1: "Connect your SaaS.",
    titleLine2: "Know exactly what to do next.",
    subtitle:
      "Sharpz analyzes your product, market and growth to show you the actions that truly deserve your attention.",
    ctaPrimary: "Analyze my SaaS",
    ctaSecondary: "See how it works",
    finePrint: "One URL is enough to get started.",
    urlPlaceholder: "https://yoursaas.com",
  },
  todayMockup: {
    title: "Today",
    actions: [
      {
        index: "01",
        title: "Improve your hero",
        description: "Your value proposition lacks clarity.",
        impact: "High",
      },
      {
        index: "02",
        title: "Reach out to these 12 prospects",
        description: "They match your current ICP.",
        impact: "High",
      },
      {
        index: "03",
        title: "Publish this today",
        description: "A topic is gaining traction in your niche.",
        impact: "Medium",
      },
      {
        index: "04",
        title: "A competitor just changed pricing",
        description: "See what changed",
        impact: "Medium",
      },
    ],
  },
  problem: {
    label: "The problem",
    titleLine1: "Building got easier.",
    titleLine2: "Knowing what to do next didn’t.",
    questions: [
      "Is your landing clear enough?",
      "Where will your next users come from?",
      "What should you publish?",
      "Who should you contact?",
      "Is your pricing right?",
      "What are your competitors doing?",
    ],
    closeLabel: "What matters",
    closeTitle: "Not all of these questions matter equally.",
    closeSubtitle: "Sharpz analyzes them, ranks them, and shows you where to spend your time.",
    priorities: [
      { index: "01", impact: "High impact", title: "Rewrite your hero", tone: "high" },
      { index: "02", impact: "High impact", title: "Contact 8 prospects", tone: "high" },
      { index: "03", impact: "Medium impact", title: "Publish this topic today", tone: "medium" },
    ],
  },
  features: {
    label: "One place",
    title: "Sharpz looks at your SaaS from every angle.",
    subtitle:
      "Your product, market and growth are connected. Sharpz analyzes them together so you can make better decisions.",
    items: [
      {
        index: "01",
        title: "Improve what your visitors see.",
        text: "Sharpz analyzes your positioning, message, CTAs, pricing and the elements that may slow conversions.",
        chips: ["Clarity", "Trust", "CTA", "Pricing", "Positioning"],
      },
      {
        index: "02",
        title: "Focus on what matters now.",
        text: "Sharpz turns its analysis into a short list of actions ranked by impact and effort.",
        chips: [
          "Rewrite your hero",
          "Contact 8 prospects",
          "Test a new CTA",
          "Publish this topic today",
        ],
        phrase: "Fewer decisions. More execution.",
      },
      {
        index: "03",
        title: "Spot opportunities you might miss.",
        text: "Sharpz finds acquisition, conversion and growth leads that fit your SaaS.",
        chips: [
          "12 companies match your audience.",
          "A new opportunity is appearing in your niche.",
          "Your pricing can be repositioned.",
          "An acquisition channel is worth testing.",
        ],
      },
      {
        index: "04",
        title: "Find the right people to contact.",
        text: "Sharpz understands who your product is for and helps you identify companies that have a real reason to use it.",
        chips: ["High fit", "Matches your ICP", "Why this prospect?"],
      },
      {
        index: "05",
        title: "Stop wondering what to publish.",
        text: "Sharpz uses your product, audience and market to detect the topics that can attract the right people.",
        chips: ["LinkedIn", "X", "TikTok / Reels"],
      },
      {
        index: "06",
        title: "Know when your market moves.",
        text: "Sharpz watches important competitor changes and explains why they may matter to you.",
        chips: [
          "New pricing",
          "New positioning",
          "New feature",
          "Landing change",
        ],
      },
    ],
    closingLine1: "Sharpz analyzes a lot.",
    closingLine2: "It just doesn’t give you more noise.",
    closingLine3: "It shows you where to act.",
  },
  how: {
    label: "How it works",
    title: "One URL. A few questions. A direction.",
    subtitle:
      "Sharpz starts by understanding your SaaS, refines the analysis with a few questions, then shows you what to do next.",
    steps: [
      {
        index: "01",
        title: "Connect your SaaS",
        text: "Simply enter your product URL.",
        visual: "url",
        urlPlaceholder: "https://yoursaas.com",
      },
      {
        index: "02",
        title: "Sharpz asks a few questions",
        text: "A few quick questions to spot your priorities more clearly.",
        visual: "questions",
        bubbles: [
          "What’s your current priority?",
          "More users or more conversions?",
          "What stage are you at?",
        ],
      },
      {
        index: "03",
        title: "Sharpz understands your context",
        text: "Your product, audience, positioning and market are analyzed together.",
        visual: "context",
        orbs: ["Product", "ICP", "Landing", "Competitors", "Positioning", "Opportunities"],
      },
      {
        index: "04",
        title: "Every day, you know what to do",
        text: "Sharpz shows you the actions to prioritize to move your SaaS forward.",
        visual: "today",
        actions: ["Rewrite your hero", "Contact 8 prospects", "Publish this topic"],
      },
    ],
    closingLine1: "You build. Sharpz helps you decide",
    closingLine2: "where to go next.",
  },
  faq: {
    label: "FAQ",
    title: "The questions before you connect your SaaS.",
    items: [
      {
        q: "How does Sharpz analyze my SaaS?",
        a: "You start by entering your SaaS URL. Sharpz analyzes public information about your product to understand what you sell, who you serve and how your offer is presented.",
      },
      {
        q: "Do I need to connect my data to get started?",
        a: "No. One URL is enough to start. Integrations can later enrich the analysis with your own data, when you want.",
      },
      {
        q: "Does Sharpz work with any SaaS?",
        a: "Sharpz is built mainly for SaaS, digital products and founders who want to know which actions to prioritize.",
      },
      {
        q: "Does Sharpz act automatically for me?",
        a: "No. Sharpz helps you understand what to do and why, but you stay in control of the decisions and the actions.",
      },
      {
        q: "Is this just ChatGPT with another interface?",
        a: "No. Sharpz does more than answer a question. It understands your SaaS, its context, and surfaces the actions that deserve your attention.",
      },
    ],
  },
  finalCta: {
    label: "Your next step",
    titleLine1: "You built your SaaS.",
    titleLine2: "Sharpz shows you what to do next.",
    subtitle: "Enter your URL and see the actions that deserve your attention.",
    urlPlaceholder: "https://yoursaas.com",
    analyze: "Analyze my SaaS",
    finePrint: "One URL is enough to get started.",
  },
  footer: {
    product: "Product",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Terms",
    tagline: "Built for SaaS founders.",
  },
  sign: {
    marks: ["Positioning", "Growth", "Clarity", "Conversion", "Priorities"],
  },
};
