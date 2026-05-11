export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          2: "var(--bg2)",
        },
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "hsl(var(--brand-hsl) / 0.8)",
          500: "hsl(var(--brand-hsl))",
          600: "hsl(var(--brand-hsl) / 0.9)",
          700: "hsl(var(--brand-hsl) / 0.8)",
          800: "hsl(var(--brand-hsl) / 0.7)",
          900: "hsl(var(--brand-hsl) / 0.6)",
        },
        accent: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        danger: {
          500: "hsl(var(--danger-hsl))",
          600: "hsl(var(--danger-hsl) / 0.9)",
        },
        success: {
          500: "hsl(var(--success-hsl))",
          600: "hsl(var(--success-hsl) / 0.9)",
        },
        warning: {
          500: "hsl(var(--warning-hsl))",
          600: "hsl(var(--warning-hsl) / 0.9)",
        },
      },
      boxShadow: {
        glass:
          "0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 50px rgba(0,0,0,0.55)",
        glow:
          "0 0 0 1px rgba(var(--brand-hsl) / 0.18), 0 18px 55px rgba(var(--brand-hsl) / 0.10)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(1200px 800px at 20% 10%, hsla(var(--brand-hsl) / 0.24), transparent 55%), radial-gradient(900px 600px at 80% 30%, rgba(139,92,246,0.20), transparent 55%), radial-gradient(1100px 700px at 50% 100%, rgba(59,130,246,0.18), transparent 55%)",
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