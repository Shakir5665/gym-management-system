import { useAuth } from "../context/AuthContext";
import SetupGym from "../pages/SetupGym";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { token, hasGym, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[color:var(--text)]">
        <div className="glass px-8 py-7 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-400 mb-4 mx-auto" />
          <p className="text-[color:var(--muted)] text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/" replace />;

  if (!hasGym && role !== "MEMBER" && role !== "SUPER_ADMIN") return <SetupGym />;

  return children;
}
