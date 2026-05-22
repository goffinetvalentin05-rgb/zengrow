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
          bg: "#06040f",
          section: "#0c0818",
          card: "#120e1a",
          border: "rgb(255 255 255 / 0.1)",
          fg: "#f4f0ff",
          muted: "#9b8fb8",
          accent: "#7c5cff",
          "accent-soft": "#a78bfa",
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
