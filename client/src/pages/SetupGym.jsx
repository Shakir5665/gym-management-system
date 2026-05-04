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

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleCreate = async () => {
    if (!gymName.trim()) {
      setError("Gym name is required");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms and Conditions to continue");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/gym/create", { gymName });

      console.log("✅ Gym created response:", res.data);

      // 🔑 Update auth with NEW token that includes gymId
      login(res.data.token, res.data.hasGym, res.data.user);

      // Persist gym name for header
      localStorage.setItem("gymName", gymName.trim());

      // ProtectedRoute will handle redirect to Dashboard
    } catch (err) {
      console.error("Gym creation error:", err);
      setError(err.response?.data?.message || "Failed to create gym");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && acceptedTerms) handleCreate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="mb-6">
          <div className="text-3xl font-black tracking-tight text-[color:var(--text)]">
            Create your gym
          </div>
          <div className="mt-1 text-sm text-[color:var(--muted)]">
            One quick step—then you’re ready to manage members.
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-[color:var(--danger-soft-border)] bg-[color:var(--danger-soft-bg)] px-3 py-2 text-xs font-semibold text-[color:var(--danger-ink)]">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          <Input
            label="Gym name"
            placeholder="e.g., Iron Temple Fitness"
            value={gymName}
            onChange={(e) => setGymName(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            left={<Building2 className="h-4 w-4" />}
          />

          <div className="flex items-start gap-2 px-1">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 accent-brand-500"
            />
            <label htmlFor="terms" className="text-xs leading-tight text-[color:var(--muted)]">
              I agree to the{" "}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-400 hover:underline font-medium"
              >
                Terms and Conditions
              </a>{" "}
              for commercial usage of the Smart Gym System.
            </label>
          </div>

          <Button
            onClick={handleCreate}
            disabled={loading || !acceptedTerms}
            variant="primary"
            className={`w-full mt-2 ${!acceptedTerms ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            {loading ? "Creating…" : "Create gym"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
