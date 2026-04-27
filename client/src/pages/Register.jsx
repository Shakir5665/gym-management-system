import { useState } from "react";
import API from "../api/api";
import { GoogleLogin } from "@react-oauth/google";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Building2, Lock, Mail, User } from "lucide-react";

export default function Register({ onSuccess }) {
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gymName: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState("error");
  const [googleGymSetup, setGoogleGymSetup] = useState(false);
  const [googleGymName, setGoogleGymName] = useState("");
  const [googleToken, setGoogleToken] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    const { name, email, password, gymName } = form;

    // 🔴 REQUIRED FIELDS
    if (!name || !email || !password || !gymName) {
      setMessage("All fields are required");
      setMessageType("error");
      return;
    }

    // 🔴 EMAIL VALIDATION
    if (!validateEmail(email)) {
      setMessage("Invalid email format (example: user@gmail.com)");
      setMessageType("error");
      return;
    }

    // 🔴 PASSWORD LENGTH
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", form);

      setMessage("✅ Registered successfully. Redirecting...");
      setMessageType("success");

      // Persist gym name for header immediately (server doesn't return it)
      localStorage.setItem("gymName", gymName);

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  // 🔥 GOOGLE REGISTRATION
  const handleGoogleRegister = async (credentialResponse) => {
    try {
      setLoading(true);
      setMessage("");
      setGoogleToken(credentialResponse.credential);
      setGoogleGymSetup(true);
      setLoading(false);
    } catch {
      setMessage("Google registration failed");
      setMessageType("error");
      setLoading(false);
    }
  };

  const handleCompleteGoogleRegister = async () => {
    if (!googleGymName.trim()) {
      setMessage("Gym name is required");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await API.post("/auth/google-register", {
        token: googleToken,
        gymName: googleGymName.trim(),
      });

      setMessage("✅ Account created successfully. Redirecting to login...");
      setMessageType("success");

      setTimeout(() => {
        setGoogleGymSetup(false);
        setGoogleGymName("");
        setGoogleToken("");
        onSuccess();
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
      setMessageType("error");
      setLoading(false);
    }
  };

  if (googleGymSetup) {
    return (
      <div>
        <div className="mb-4 p-3 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/50 text-sm">
          Google account verified! Now set up your gym.
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium border ${messageType === "success" ? "bg-green-500/20 text-green-300 border-green-500/50" : "bg-red-500/20 text-red-300 border-red-500/50"}`}
          >
            {message}
          </div>
        )}

        <Input
          label="Gym name"
          placeholder="Enter your gym name"
          value={googleGymName}
          onChange={(e) => setGoogleGymName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCompleteGoogleRegister();
          }}
          disabled={loading}
          autoFocus
          left={<Building2 className="h-4 w-4" />}
        />

        <Button
          onClick={handleCompleteGoogleRegister}
          disabled={loading}
          variant="primary"
          className="w-full mt-3"
        >
          {loading ? "Completing registration..." : "Complete Registration"}
        </Button>

        <Button
          onClick={() => {
            setGoogleGymSetup(false);
            setGoogleGymName("");
            setGoogleToken("");
          }}
          disabled={loading}
          variant="ghost"
          className="w-full mt-2"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm font-medium border ${
            messageType === "success"
              ? "bg-green-500/20 text-green-300 border-green-500/50"
              : "bg-red-500/20 text-red-300 border-red-500/50"
          }`}
        >
          {message}
        </div>
      )}

      <Input
        label="Full name"
        placeholder="Mohamed"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        onKeyDown={handleKeyPress}
        disabled={loading}
        left={<User className="h-4 w-4" />}
      />
      <Input
        label="Email"
        placeholder="you@company.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        onKeyDown={handleKeyPress}
        disabled={loading}
        left={<Mail className="h-4 w-4" />}
      />
      <Input
        label="Password"
        placeholder="Minimum 6 characters"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        onKeyDown={handleKeyPress}
        disabled={loading}
        left={<Lock className="h-4 w-4" />}
      />
      <Input
        label="Gym name"
        placeholder="Your gym brand"
        value={form.gymName}
        onChange={(e) => setForm({ ...form, gymName: e.target.value })}
        onKeyDown={handleKeyPress}
        disabled={loading}
        left={<Building2 className="h-4 w-4" />}
      />

      <Button
        onClick={handleRegister}
        disabled={loading}
        variant="primary"
        className="w-full mt-1"
      >
        {loading ? "Creating account..." : "Register"}
      </Button>

      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-[color:var(--control-border)]" />
        <div className="text-[11px] text-[color:var(--subtle)]">or use Google</div>
        <div className="h-px flex-1 bg-[color:var(--control-border)]" />
      </div>

      <div className="flex justify-center">
        {googleEnabled ? (
          <GoogleLogin
            onSuccess={handleGoogleRegister}
            onError={() => {
              setMessage("Google registration failed");
              setMessageType("error");
            }}
            text="signup_with"
            useOneTap={false}
            width="320"
          />
        ) : (
          <div className="w-full rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-3 py-3 text-xs text-[color:var(--muted)] text-center">
            Add{" "}
            <span className="text-[color:var(--text)] font-semibold">VITE_GOOGLE_CLIENT_ID</span> in{" "}
            <span className="text-[color:var(--text)] font-semibold">client/.env</span> to enable
            Google signup.
          </div>
        )}
      </div>
    </div>
  );
}
