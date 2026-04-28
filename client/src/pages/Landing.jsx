import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import LogoLight from "../assets/Logo-Light.png";
import LogoDark from "../assets/Logo-Dark.png";
import { useTheme } from "../context/ThemeContext";

export default function Landing() {
  const [mode, setMode] = useState("login");
  const { theme } = useTheme();

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-grid-fade bg-grid [mask-image:radial-gradient(60%_55%_at_50%_20%,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-7xl min-h-screen grid lg:grid-cols-2 gap-6 px-4 py-10 lg:py-0 items-center">
        {/* LEFT: HERO */}
        <div className="hidden lg:flex items-center justify-center p-10">
          <img 
            src={theme === "dark" ? LogoDark : LogoLight} 
            alt="Gym Management Logo" 
            className="w-full max-w-xl object-contain drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity duration-500"
          />
        </div>

        {/* RIGHT: AUTH */}
        <div className="flex items-center justify-center">
          <div className="glass-strong w-full max-w-md p-6 md:p-8">
            <div className="text-center">
              <div className="text-2xl font-black tracking-tight text-[color:var(--text)]">
                {mode === "login" ? "Welcome back" : mode === "forgot-password" ? "Reset Password" : "Create your account"}
              </div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">
                {mode === "login"
                  ? "Sign in to manage your gym in seconds."
                  : mode === "forgot-password"
                  ? "Recover access to your account securely."
                  : "Set up your gym and start tracking members."}
              </div>
            </div>

            <div className="mt-6">
              {mode === "login" ? (
                <Login onForgotPassword={() => setMode("forgot-password")} />
              ) : mode === "forgot-password" ? (
                <ForgotPassword onSuccess={() => setMode("login")} onCancel={() => setMode("login")} />
              ) : (
                <Register onSuccess={() => setMode("login")} />
              )}
            </div>

            <div className="mt-6 text-center text-sm text-[color:var(--muted)]">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-[color:var(--brand-ink)] hover:text-[color:var(--text)] font-semibold transition"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-[color:var(--brand-ink)] hover:text-[color:var(--text)] font-semibold transition"
                  >
                    Login
                  </button>
                </>
              )}
            </div>

            {mode !== "forgot-password" && (
              <div className="mt-6 text-center text-[11px] text-[color:var(--subtle)]">
                By continuing, you agree to secure authentication and real-time updates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
