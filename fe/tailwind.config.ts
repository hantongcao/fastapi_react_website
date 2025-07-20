import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-noto-sans-sc)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-in-out",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            color: theme("colors.foreground"),
            "h1, h2, h3, h4, h5, h6": {
              color: theme("colors.foreground"),
            },
            h2: {
              fontFamily: `${theme("fontFamily.sans")}`,
              fontWeight: "700",
              marginTop: "1.5em",
              marginBottom: "0.5em",
              color: theme("colors.foreground"),
            },
            h3: {
              fontFamily: `${theme("fontFamily.sans")}`,
              fontWeight: "700",
              marginTop: "1.25em",
              marginBottom: "0.5em",
              color: theme("colors.foreground"),
            },
            "p, ul, ol, blockquote": {
              marginBottom: "1em",
              color: theme("colors.foreground"),
            },
            "li, td, th": {
              color: theme("colors.foreground"),
            },
            strong: {
              color: theme("colors.foreground"),
            },
            a: {
              color: theme("colors.primary.DEFAULT"),
              fontWeight: "600",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            blockquote: {
              borderLeftColor: theme("colors.primary.DEFAULT"),
              fontStyle: "italic",
              color: theme("colors.muted.foreground"),
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            code: {
              backgroundColor: theme("colors.muted.DEFAULT"),
              color: theme("colors.primary.DEFAULT"),
              fontFamily: theme("fontFamily.mono"),
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontWeight: "400",
            },
            pre: {
              backgroundColor: theme("colors.muted.DEFAULT"),
              padding: theme("spacing.4"),
              borderRadius: theme("borderRadius.lg"),
              overflowX: "auto",
              color: theme("colors.foreground"),
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: 0,
              color: theme("colors.foreground"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}

export default config
