import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3478F6",
          dark: "#2456AE",
          light: "#EAF2FF",
          subtle: "#F0F5FF",
        },
        ink: {
          DEFAULT: "#122044",
          muted: "#53627E",
          light: "#8A99B5",
        },
        canvas: "#F6F9FF",
        surface: "#FFFFFF",
        line: {
          DEFAULT: "#DFE8F5",
          subtle: "#EDF3FA",
        },
        success: {
          DEFAULT: "#247A45",
          soft: "#EAF7EF",
        },
        error: {
          DEFAULT: "#B83949",
          soft: "#FFF0F2",
        },
        warning: {
          DEFAULT: "#D97706",
          soft: "#FEF3C7",
        },
        mascot: {
          green: "#83C768",
          leaf: "#8BD46D",
          cheek: "#FF9290",
          belly: "#FFF6DF",
          scarf: "#3478F6",
        },
      },
      borderRadius: {
        sm: "12px",
        md: "20px",
        lg: "32px",
        pill: "999px",
      },
      fontFamily: {
        sans: [
          '"Be Vietnam Pro"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        tactile: "0 4px 0 #2456AE",
        "tactile-secondary": "0 4px 0 #CADAF5",
        soft: "0 8px 30px rgba(18, 32, 68, 0.06)",
        panel: "0 12px 48px rgba(18, 32, 68, 0.12)",
      },
      transitionDuration: {
        fast: "140ms",
        panel: "260ms",
        celebrate: "1200ms",
      },
    },
  },
  plugins: [],
};

export default config;
