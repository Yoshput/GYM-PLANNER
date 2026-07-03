import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "var(--color-base)",
          card: "var(--color-base-card)",
          raised: "var(--color-base-raised)",
          border: "var(--color-base-border)",
        },
        lime: {
          DEFAULT: "#CCFF00",
          dim: "#A8D400",
        },
        ember: {
          DEFAULT: "#FF4500",
          dim: "#D93B00",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(24px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(204,255,0,0.35)" },
          "50%": { boxShadow: "0 0 0 10px rgba(204,255,0,0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "33%": { transform: "translateY(-18px) scale(1.03)" },
          "66%": { transform: "translateY(-9px) scale(0.98)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "33%": { transform: "translateY(14px) scale(0.97)" },
          "66%": { transform: "translateY(7px) scale(1.02)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "glow-pulse-lime": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(204,255,0,0.4), 0 0 20px rgba(204,255,0,0.1)",
          },
          "50%": {
            boxShadow: "0 0 0 8px rgba(204,255,0,0), 0 0 40px rgba(204,255,0,0.2)",
          },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3) translateY(20px)", opacity: "0" },
          "60%": { transform: "scale(1.05) translateY(-4px)", opacity: "1" },
          "80%": { transform: "scale(0.97) translateY(2px)" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "slide-down-fade": {
          "0%": { transform: "translateY(-12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "toast-in": {
          "0%": { transform: "translateY(80px) scale(0.9)", opacity: "0" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        "toast-out": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(80px) scale(0.9)", opacity: "0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "stagger-in": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-glow": "pulse-glow 2s infinite",
        "float": "float 7s ease-in-out infinite",
        "float-reverse": "float-reverse 9s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "glow-pulse-lime": "glow-pulse-lime 2s ease-in-out infinite",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down-fade": "slide-down-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-in": "toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-out": "toast-out 0.3s cubic-bezier(0.4, 0, 1, 1) forwards",
        "spin-slow": "spin-slow 8s linear infinite",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "count-up": "count-up 0.4s ease-out",
        "ripple": "ripple 0.6s ease-out",
        "stagger-in": "stagger-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
