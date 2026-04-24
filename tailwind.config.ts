import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EE",
        ink: {
          DEFAULT: "#2A2A2A",
          soft: "#4A4A4A",
        },
        sage: {
          light: "#AFBBA0",
          DEFAULT: "#6B7C5C",
          dark: "#455238",
        },
        rose: {
          light: "#F4D8DA",
          DEFAULT: "#C56874",
          dark: "#8F3F4C",
        },
      },
      fontFamily: {
        script: ["var(--font-script)", "cursive"],
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
