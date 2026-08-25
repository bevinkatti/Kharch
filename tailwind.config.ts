import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs:  "390px",  // iPhone 14 width
      sm:  "640px",
      md:  "768px",
      lg:  "1024px",
      xl:  "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        brand:  "#3ecf8e",
        accent: "#6366f1",
        red:    "#f87171",
        amber:  "#fbbf24",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4" }],
        "xs":  ["12px", { lineHeight: "1.5" }],
        "sm":  ["13px", { lineHeight: "1.5" }],
        "base":["14px", { lineHeight: "1.5" }],
        "md":  ["15px", { lineHeight: "1.5" }],
        "lg":  ["16px", { lineHeight: "1.4" }],
        "xl":  ["18px", { lineHeight: "1.4" }],
        "2xl": ["20px", { lineHeight: "1.3" }],
        "3xl": ["24px", { lineHeight: "1.25" }],
        "4xl": ["30px", { lineHeight: "1.15" }],
        "5xl": ["36px", { lineHeight: "1.1"  }],
        "6xl": ["48px", { lineHeight: "1.05" }],
      },
      letterSpacing: {
        tight:   "-0.025em",
        tighter: "-0.04em",
      },
      borderRadius: {
        sm:    "4px",
        DEFAULT:"6px",
        md:    "8px",
        lg:    "10px",
        xl:    "12px",
        "2xl": "16px",
        "3xl": "20px",
        full:  "9999px",
      },
      boxShadow: {
        sm:    "var(--shadow-sm)",
        md:    "var(--shadow-md)",
        lg:    "var(--shadow-lg)",
        brand: "var(--shadow-brand)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease forwards",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
      },
    },
  },
  plugins: [],
};

export default config;
