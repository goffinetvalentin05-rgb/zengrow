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
          bg: "#0A0806",
          section: "#100C09",
          card: "#16110D",
          border: "#2A1F17",
          fg: "#FAF7F2",
          muted: "#8A7F73",
          accent: "#FF6B2C",
          "accent-soft": "#FFA86B",
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
