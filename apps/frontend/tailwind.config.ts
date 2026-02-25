import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  safelist: [
    "bg-background",
    "bg-surface",
    "bg-muted",
    "bg-accent",
    "text-text-primary",
    "text-text-secondary",
    "text-white",
    "text-error",
    "text-success",
    "border-border",
    "border-accent",
    "ring-2",
    "ring-accent/20",
    "font-sans"
  ],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/theme/**/*.{ts,tsx}",
    "./src/styles/**/*.css"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        primary: "#0F172A",
        accent: "#6366F1",
        "accent-hover": "#4F46E5",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        muted: "#F1F5F9",
        border: "#CBD5E1",
        text: {
          primary: "#0F172A",
          secondary: "#64748B"
        },
        success: "#22C55E",
        error: "#DC2626"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"]
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }]
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px"
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem"
      }
    }
  },
  plugins: []
};

export default config;
