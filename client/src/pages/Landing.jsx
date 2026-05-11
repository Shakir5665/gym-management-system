import { useState } from "react";
import Login from "./Login";
import LogoLight from "../assets/Logo-Light.png";
import LogoDark from "../assets/Logo-Dark.png";
import ShakirLogo from "../assets/shakir_logo.png";
import { useTheme } from "../context/ThemeContext";

export default function Landing() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-grid-fade bg-grid [mask-image:radial-gradient(60%_55%_at_50%_20%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl min-h-screen grid lg:grid-cols-2 gap-6 px-4 py-10 lg:py-0 items-center">
        {/* LEFT: HERO */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10">
          <div className="flex flex-col items-center">
            <img
              src={theme === "dark" ? LogoDark : LogoLight}
              alt="Gym Management Logo"
              className="w-full max-w-xl object-contain drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity duration-500"
            />

            {/* ✍️ Developer Signature - Anchored to Logo Block */}
            <div className="mt-8 flex justify-center w-full">
              <div className="flex items-center cursor-default group opacity-70 hover:opacity-100 transition-opacity">
                <img
                  src={ShakirLogo}
                  alt="Shakir Tech Solutions"
                  className="h-10 w-auto object-contain brightness-110"
                />
                <div className="flex flex-col justify-center -ml-1">
                  <span className="text-[8px] uppercase tracking-tighter text-[color:var(--subtle)] font-black leading-none mb-1">
                    POWERED BY
                  </span>
                  <span className="text-xs font-black tracking-tighter text-[color:var(--text)] leading-none">
                    Shakir Tech Solutions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: AUTH */}
        <div className="flex items-center justify-center">
          <div className="glass-strong w-full max-w-md p-6 md:p-8">
            <div className="text-center">
              <div className="text-2xl font-black tracking-tight text-[color:var(--text)]">
                Welcome back
              </div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">
                Sign in to access your portal.
              </div>
            </div>

            <div className="mt-6">
              <Login />
            </div>

            <div className="mt-6 text-center text-[11px] text-[color:var(--subtle)]">
              By continuing, you agree to secure authentication and real-time updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
