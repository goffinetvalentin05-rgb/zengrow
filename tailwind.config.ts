import type { Config } from "tailwindcss";

/**
 * Tailwind v4 : la palette dashboard vit surtout dans `app/globals.css` (:root + @theme).
 * Ici : landing + rappel des chemins `content`.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        landing: {
          bg: "#050403",
          section: "#120B07",
          card: "#1B100B",
          border: "#2A1F17",
          fg: "#FFF7EF",
          muted: "#AFA39A",
          accent: "#FF5A2A",
          "accent-soft": "#FF7A3D",
        },
      },
      fontFamily: {
        "landing-serif": [
          "var(--font-instrument-serif)",
          "ui-serif",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },
    },
  },
};

export default config;
