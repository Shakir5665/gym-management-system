import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

export default function Landing() {
  const [mode, setMode] = useState("login");

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-grid-fade bg-grid [mask-image:radial-gradient(60%_55%_at_50%_20%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl min-h-screen grid lg:grid-cols-2 gap-6 px-4 py-10 lg:py-0 items-center">
        {/* LEFT: HERO */}
        <div className="hidden lg:block">
          <div className="glass p-10 overflow-hidden relative">
            <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
            <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-accent-500/18 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold text-white/70">
                Premium SaaS UI • Dark glass theme
              </div>
              <h1 className="mt-5 text-5xl font-black tracking-tight text-white leading-[1.05]">
                Gym Management{" "}
                <span className="bg-gradient-to-r from-brand-200 to-accent-400 bg-clip-text text-transparent">
                  SaaS
                </span>
              </h1>
              <p className="mt-4 text-base text-white/60 leading-relaxed max-w-lg">
                A modern system for member management, QR check-ins, gamification, and real-time
                notifications—built for speed and clarity.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                {[
                  "Real-time member tracking",
                  "Gamification & streaks",
                  "QR check-ins",
                  "Live notifications",
                ].map((t) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-white/75"
                  >
                    <div className="text-xs font-bold text-white/85">{t}</div>
                    <div className="mt-1 text-[11px] text-white/45">Fast, minimal, high-contrast</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: AUTH */}
        <div className="flex items-center justify-center">
          <div className="glass-strong w-full max-w-md p-6 md:p-8">
            <div className="text-center">
              <div className="text-2xl font-black tracking-tight text-white">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </div>
              <div className="mt-1 text-sm text-white/55">
                {mode === "login"
                  ? "Sign in to manage your gym in seconds."
                  : "Set up your gym and start tracking members."}
              </div>
            </div>

            <div className="mt-6">{mode === "login" ? <Login /> : <Register onSuccess={() => setMode("login")} />}</div>

            <div className="mt-6 text-center text-sm text-white/55">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-brand-200 hover:text-white font-semibold transition"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-brand-200 hover:text-white font-semibold transition"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 text-center text-[11px] text-white/35">
              By continuing, you agree to secure authentication and real-time updates.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
