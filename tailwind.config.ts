import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
        paper: "rgb(var(--c-paper) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        cream: "rgb(var(--c-cream) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        stone: "rgb(var(--c-stone) / <alpha-value>)",
        charcoal: "#26221f",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        accentSolid: "rgb(var(--c-accent-solid) / <alpha-value>)",
        "accent-dark": "#8f3f2a",
        success: "#2f6f4e",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 12px 40px -18px rgba(20,17,15,0.18)",
        lift: "0 22px 60px -28px rgba(20,17,15,0.28)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { "fade-up": "fade-up 0.5s ease-out both" },
    },
  },
  plugins: [],
};

export default config;
