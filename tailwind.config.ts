import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFFF",
          bg: "#F6FAF8",
          green: "#16A34A",
          "green-dark": "#15803D",
          blue: "#2563EB",
          text: "#172033",
          border: "#E2E8F0",
        },
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgba(23, 32, 51, 0.06), 0 2px 4px -2px rgba(23, 32, 51, 0.04)",
        card: "0 10px 15px -3px rgba(23, 32, 51, 0.06), 0 4px 6px -4px rgba(23, 32, 51, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
