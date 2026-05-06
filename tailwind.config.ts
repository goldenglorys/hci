import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f172a",
        card: "#1e293b",
        accent: "#6366f1",
        "accent-light": "#818cf8",
        "text-primary": "#f1f5f9",
        muted: "#94a3b8",
        dim: "#64748b",
        border: "#334155",
        ok: "#22c55e",
        warn: "#f59e0b",
        err: "#ef4444",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
