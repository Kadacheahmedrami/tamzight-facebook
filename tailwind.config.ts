import type { Config } from "tailwindcss"
import defaultConfig from "shadcn/ui/tailwind.config"

const config: Config = {
  ...defaultConfig,
  content: [...defaultConfig.content, "./src/**/*.{ts,tsx,mdx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    ...defaultConfig.theme,
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        ...defaultConfig.theme.extend.colors,
        primary: {
          ...defaultConfig.theme.extend.colors.primary,
          DEFAULT: "#dc2626",
          foreground: "#f8fafc",
        },
        secondary: {
          ...defaultConfig.theme.extend.colors.secondary,
          DEFAULT: "#e2e8f0",
          foreground: "#334155",
        },
        muted: "#94a3b8",
        accent: "#e4e7eb",
        popover: {
          ...defaultConfig.theme.extend.colors.popover,
          DEFAULT: "#ffffff",
          foreground: "#1e293b",
        },
        card: {
          ...defaultConfig.theme.extend.colors.card,
          DEFAULT: "#ffffff",
          foreground: "#1e293b",
        },
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#94a3b8",
      },
      borderRadius: {
        ...defaultConfig.theme.extend.borderRadius,
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        ...defaultConfig.theme.extend.animation,
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}

export default config
