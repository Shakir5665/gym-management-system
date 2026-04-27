import { useState, useEffect } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const { login } = useAuth();

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
    <div>
      {/* 🟢 MESSAGE BOX */}
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

      {/* EMAIL */}
      <input
        className="w-full p-3 mb-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition"
        placeholder="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />

      {/* PASSWORD */}
      <input
        type="password"
        className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
      />

      {/* LOGIN BUTTON */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded-lg font-semibold mb-4 transition"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* DIVIDER */}
      <div className="text-center text-gray-400 mb-4 text-sm">OR</div>

      {/* 🔥 GOOGLE LOGIN */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              setLoading(true);
              const res = await API.post("/auth/google", {
                token: credentialResponse.credential,
              });

              // ✅ IMPORTANT: pass hasGym
              login(res.data.token, res.data.hasGym, res.data.user);
              setMessage("Google login successful!");
              setMessageType("success");

              // ❌ REMOVE redirect → ProtectedRoute handles it
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
        />
      </div>
    </div>
  );
}
