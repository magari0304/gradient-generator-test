import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#191a1e",
        panelSoft: "#202229",
        ink: "#f2f3f5",
        muted: "#a3a8b3",
        line: "#30333b",
        accent: "#59c3c3",
        amber: "#e6b450",
      },
      boxShadow: {
        insetPanel: "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
