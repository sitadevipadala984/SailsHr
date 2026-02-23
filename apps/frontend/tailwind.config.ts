import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/theme/**/*.{ts,tsx}"
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
        primary: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#b6ceff",
          300: "#84aaff",
          400: "#4f82ff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554"
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827"
        },
        success: "#16a34a",
        warning: "#f59e0b",
        error: "#dc2626",
        info: "#0284c7",
        "bg-page": "#f3f4f6",
        "bg-card": "#ffffff",
        "bg-sidebar": "#ffffff",
        "bg-header": "#ffffff",
        "border-default": "#e5e7eb",
        "border-light": "#f3f4f6",
        "border-focus": "#2563eb"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
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
        lg: "12px"
      }
    }
  },
  plugins: []
};

export default config;
