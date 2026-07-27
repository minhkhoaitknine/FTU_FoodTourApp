import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "hsl(var(--color-canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--color-surface) / <alpha-value>)",
          elevated: "hsl(var(--color-surface-elevated) / <alpha-value>)",
          muted: "hsl(var(--color-surface-muted) / <alpha-value>)",
          inverse: "hsl(var(--color-surface-inverse) / <alpha-value>)"
        },
        content: {
          DEFAULT: "hsl(var(--color-content) / <alpha-value>)",
          muted: "hsl(var(--color-content-muted) / <alpha-value>)",
          subtle: "hsl(var(--color-content-subtle) / <alpha-value>)",
          inverse: "hsl(var(--color-content-inverse) / <alpha-value>)"
        },
        brand: {
          DEFAULT: "hsl(var(--color-brand) / <alpha-value>)",
          strong: "hsl(var(--color-brand-strong) / <alpha-value>)",
          soft: "hsl(var(--color-brand-soft) / <alpha-value>)"
        },
        success: {
          DEFAULT: "hsl(var(--color-success) / <alpha-value>)",
          soft: "hsl(var(--color-success-soft) / <alpha-value>)"
        },
        info: {
          DEFAULT: "hsl(var(--color-info) / <alpha-value>)",
          soft: "hsl(var(--color-info-soft) / <alpha-value>)"
        },
        warning: {
          DEFAULT: "hsl(var(--color-warning) / <alpha-value>)",
          soft: "hsl(var(--color-warning-soft) / <alpha-value>)"
        },
        danger: {
          DEFAULT: "hsl(var(--color-danger) / <alpha-value>)",
          soft: "hsl(var(--color-danger-soft) / <alpha-value>)"
        },
        line: {
          DEFAULT: "hsl(var(--color-border) / <alpha-value>)",
          strong: "hsl(var(--color-border-strong) / <alpha-value>)"
        },
        clay: {
          50: "#fff8ed",
          100: "#ffefcf",
          500: "#d97b28",
          700: "#8b451a"
        },
        leaf: {
          500: "#348f50",
          700: "#1f6c3b"
        },
        ink: "#2c241f"
      },
      fontFamily: {
        sans: ["var(--font-sans)"]
      },
      fontSize: {
        display: ["2.5rem", { lineHeight: "1.12", fontWeight: "750" }],
        "page-title": ["2rem", { lineHeight: "1.2", fontWeight: "750" }],
        "section-title": ["1.5rem", { lineHeight: "1.28", fontWeight: "700" }],
        "card-title": ["1.125rem", { lineHeight: "1.4", fontWeight: "700" }]
      },
      borderRadius: {
        app: "var(--radius-md)",
        "app-sm": "var(--radius-sm)",
        "app-lg": "var(--radius-lg)"
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        lift: "var(--shadow-lift)",
        overlay: "var(--shadow-overlay)"
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        background: "var(--duration-background)"
      },
      transitionTimingFunction: {
        app: "var(--ease-standard)",
        entrance: "var(--ease-entrance)"
      },
      zIndex: {
        base: "var(--z-base)",
        sticky: "var(--z-sticky)",
        dropdown: "var(--z-dropdown)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)"
      },
      screens: {
        xs: "480px"
      }
    }
  },
  plugins: []
};

export default config;
