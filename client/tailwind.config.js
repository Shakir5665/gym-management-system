export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#070A12",
          2: "#0A0F1F",
          3: "#0C1329",
        },
        surface: {
          1: "rgba(255,255,255,0.06)",
          2: "rgba(255,255,255,0.09)",
          3: "rgba(255,255,255,0.12)",
        },
        border: {
          1: "rgba(255,255,255,0.10)",
          2: "rgba(255,255,255,0.14)",
        },
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        accent: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
        success: {
          500: "#22c55e",
          600: "#16a34a",
        },
        warning: {
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      boxShadow: {
        glass:
          "0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 50px rgba(0,0,0,0.55)",
        glow:
          "0 0 0 1px rgba(34,211,238,0.18), 0 18px 55px rgba(6,182,212,0.10)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(1200px 800px at 20% 10%, rgba(6,182,212,0.24), transparent 55%), radial-gradient(900px 600px at 80% 30%, rgba(139,92,246,0.20), transparent 55%), radial-gradient(1100px 700px at 50% 100%, rgba(59,130,246,0.18), transparent 55%)",
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "56px 56px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 1.3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};