import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0B0D",
        graphite: "#15171B",
        accent: "#0A84FF",
        label: "rgba(235,235,245,0.6)",
        "label-strong": "rgba(235,235,245,0.72)",
      },
      fontFamily: {
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      // Angles resserrés : les grands arrondis faisaient « application grand public ».
      borderRadius: { xl: "8px", "2xl": "10px", "3xl": "12px", "4xl": "14px", "5xl": "16px" },
    },
  },
  plugins: [],
};
export default config;
