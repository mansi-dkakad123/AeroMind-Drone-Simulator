/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050816",
        card: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
        neon: {
          blue: "#3b82f6",
          purple: "#a855f7",
          cyan: "#22d3ee",
        },
        muted: "#8b8fa3",
      },
      boxShadow: {
        glow: "0 0 20px rgba(59,130,246,0.35)",
        glowPurple: "0 0 20px rgba(168,85,247,0.35)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3b82f6, #a855f7)",
      },
    },
  },
  plugins: [],
};
