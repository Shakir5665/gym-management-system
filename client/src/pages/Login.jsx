import { useState, useEffect } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState("error");

  // 🔧 Suppress Google GSI initialization warning
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("google.accounts.id.initialize")
      ) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  // 🔐 NORMAL LOGIN
  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Email and password are required");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      console.log("Attempting login with:", { email });

      const res = await API.post("/auth/login", { email, password });

      console.log("Login response:", res.data);

      // ✅ IMPORTANT: pass hasGym
      login(res.data.token, res.data.hasGym, res.data.user);
      setMessage("Login successful!");
      setMessageType("success");
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Login failed";
      setMessage(errorMsg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="grid gap-3">
      {message ? (
        <div
          className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
            messageType === "success"
              ? "bg-success-500/10 text-green-200 border-success-500/25"
              : "bg-danger-500/10 text-red-200 border-danger-500/25"
          }`}
        >
          {message}
        </div>
      ) : null}

      {/* GOOGLE (PRIMARY) */}
      {googleEnabled ? (
        <div className="rounded-xl border border-white/10 bg-white/6 px-3 py-3">
          <div className="text-[11px] text-white/50 mb-2 font-semibold">Continue with</div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  setLoading(true);
                  const res = await API.post("/auth/google", {
                    token: credentialResponse.credential,
                  });
                  login(res.data.token, res.data.hasGym, res.data.user);
                  setMessage("Google login successful!");
                  setMessageType("success");
                } catch (err) {
                  console.error("Google login error:", err);
                  setMessage("Google login failed");
                  setMessageType("error");
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                setMessage("Google login failed");
                setMessageType("error");
              }}
              width="320"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/6 px-3 py-3">
          <div className="text-[11px] text-white/50 mb-2 font-semibold">Google login</div>
          <div className="text-xs text-white/55">
            Add <span className="text-white/80 font-semibold">VITE_GOOGLE_CLIENT_ID</span> in{" "}
            <span className="text-white/80 font-semibold">client/.env</span> to enable Google sign-in.
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-white/10" />
        <div className="text-[11px] text-white/45">or sign in with email</div>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Input
        label="Email"
        placeholder="you@company.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={loading}
        left={<Mail className="h-4 w-4" />}
      />

      <Input
        label="Password"
        placeholder="••••••••"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={loading}
        left={<Lock className="h-4 w-4" />}
      />

      <Button
        onClick={handleLogin}
        disabled={loading}
        variant="primary"
        className="w-full mt-1"
      >
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </div>
  );
}
