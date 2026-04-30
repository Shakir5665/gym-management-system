import { useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mail, Lock } from "lucide-react";

export default function Login({ onForgotPassword }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState("error");

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Email and password are required");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/auth/login", { email, password });
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
    <div className="grid gap-3 pt-2">
      {message ? (
        <div
          className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
            messageType === "success"
              ? "bg-[color:var(--success-soft-bg)] text-[color:var(--success-ink)] border-[color:var(--success-soft-border)]"
              : "bg-[color:var(--danger-soft-bg)] text-[color:var(--danger-ink)] border-[color:var(--danger-soft-border)]"
          }`}
        >
          {message}
        </div>
      ) : null}

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
        hint={
          onForgotPassword ? (
            <button 
              type="button" 
              onClick={onForgotPassword}
              className="text-[11px] font-bold tracking-wide text-brand-400 hover:text-brand-300 hover:underline transition-all"
            >
              Forgot password?
            </button>
          ) : null
        }
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
