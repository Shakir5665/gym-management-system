import { useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function SetupGym() {
  const [gymName, setGymName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleCreate = async () => {
    if (!gymName.trim()) {
      setError("Gym name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/gym/create", { gymName });

      console.log("✅ Gym created response:", res.data);

      // 🔑 Update auth with NEW token that includes gymId
      login(res.data.token, res.data.hasGym, res.data.user);

      // ProtectedRoute will handle redirect to Dashboard
    } catch (err) {
      console.error("Gym creation error:", err);
      setError(err.response?.data?.message || "Failed to create gym");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleCreate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md shadow-2xl border border-gray-700">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome! 🏋️</h1>
          <p className="text-gray-400">Let's set up your gym first</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-300 rounded-lg border border-red-500/50 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          className="w-full p-3 mb-4 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition"
          placeholder="Enter your gym name"
          value={gymName}
          onChange={(e) => setGymName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 p-3 rounded-lg font-semibold transition"
        >
          {loading ? "Creating..." : "Create Gym"}
        </button>
      </div>
    </div>
  );
}
