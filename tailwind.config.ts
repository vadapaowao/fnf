import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff2800",
        "grid-primary": "#f91f1f",
        secondary: "#000000",
        "accent-green": "#00ff00",
        "accent-gold": "#ffd700",
        "background-light": "#f5f7f8",
        "background-dark": "#0a0a0a",
        "surface-dark": "#151515",
        "sector-1": "#FFD700",
        "sector-2": "#00FF00",
        "sector-3": "#9C27B0",
        border: "rgba(255, 255, 255, 0.1)",
        input: "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        display: ["Chakra Petch", "sans-serif"],
        body: ["Space Grotesk", "sans-serif"],
        "grid-display": ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)",
        "grid-pattern-landing":
          "linear-gradient(to right, rgba(255, 40, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 40, 0, 0.05) 1px, transparent 1px)",
        "stripes":
          "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(249, 31, 31, 0.05) 10px, rgba(249, 31, 31, 0.05) 20px)",
        "grid":
          "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-size": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
