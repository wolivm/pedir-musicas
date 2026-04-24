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
        sage: {
          light: "#AFBBA0",
          DEFAULT: "#7E8E6E",
          dark: "#5E6E50",
        },
        rose: {
          light: "#F4D8DA",
          DEFAULT: "#D4828C",
          dark: "#A85762",
        },
      },
      fontFamily: {
        script: ["var(--font-script)", "cursive"],
        serif: ["var(--font-serif)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
