import { useState } from "react";
import API from "../api/api";
import { GoogleLogin } from "@react-oauth/google";

export default function Register({ onSuccess }) {
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
    } catch (err) {
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

        <input
          type="text"
          className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition"
          placeholder="Enter your gym name"
          value={googleGymName}
          onChange={(e) => setGoogleGymName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleCompleteGoogleRegister();
          }}
          disabled={loading}
          autoFocus
        />

        <button
          onClick={handleCompleteGoogleRegister}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-3 rounded-lg font-semibold transition"
        >
          {loading ? "Completing registration..." : "Complete Registration"}
        </button>

        <button
          onClick={() => {
            setGoogleGymSetup(false);
            setGoogleGymName("");
            setGoogleToken("");
          }}
          disabled={loading}
          className="w-full mt-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 p-3 rounded-lg font-semibold transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
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

      {["name", "email", "password", "gymName"].map((field) => (
        <input
          key={field}
          type={field === "password" ? "password" : "text"}
          className="w-full p-3 mb-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition"
          placeholder={
            field === "name"
              ? "Full name"
              : field === "email"
                ? "Email address"
                : field === "password"
                  ? "Password (min 6)"
                  : "Gym name"
          }
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
      ))}

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 p-3 rounded-lg font-semibold mt-2 transition"
      >
        {loading ? "Creating account..." : "Register"}
      </button>

      <div className="text-center text-gray-400 my-4 text-sm">OR</div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleRegister}
          onError={() => {
            setMessage("Google registration failed");
            setMessageType("error");
          }}
          text="signup_with"
          useOneTap={false}
        />
      </div>
    </div>
  );
}
