import { useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Building2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="mb-6">
          <div className="text-3xl font-black tracking-tight text-white">Create your gym</div>
          <div className="mt-1 text-sm text-white/55">
            One quick step—then you’re ready to manage members.
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-danger-500/25 bg-danger-500/10 px-3 py-2 text-xs font-semibold text-red-200">
            {error}
          </div>
        ) : null}

        <Input
          label="Gym name"
          placeholder="e.g., Iron Temple Fitness"
          value={gymName}
          onChange={(e) => setGymName(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={loading}
          left={<Building2 className="h-4 w-4" />}
        />

        <Button
          onClick={handleCreate}
          disabled={loading}
          variant="primary"
          className="w-full mt-4"
        >
          {loading ? "Creating…" : "Create gym"}
        </Button>
      </Card>
    </div>
  );
}
