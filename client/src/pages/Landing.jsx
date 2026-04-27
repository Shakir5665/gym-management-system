import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

export default function Landing() {
  const [mode, setMode] = useState("login");

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div
        className="hidden lg:flex w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1558611848-73f7eb4001ab')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h1 className="text-5xl font-bold mb-6">
            Gym Management <span className="text-blue-400">SaaS</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Manage your gym efficiently with our smart system. Track members,
            attendance, and growth in real-time.
          </p>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span>Real-time member tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span>Gamification & rewards</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span>Multi-tenant architecture</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span>Socket.io live updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
        <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-700">
          <h2 className="text-3xl font-bold mb-2 text-center">
            {mode === "login" ? "Welcome Back" : "Join Us"}
          </h2>
          <p className="text-gray-400 text-center mb-6 text-sm">
            {mode === "login"
              ? "Login to your gym account"
              : "Create your gym account"}
          </p>

          {mode === "login" ? (
            <Login key="login" />
          ) : (
            <Register key="register" onSuccess={() => setMode("login")} />
          )}

          <p className="text-sm mt-6 text-center text-gray-400">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
