import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PortalRoute({ children }) {
  const { token, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[color:var(--text)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-400 mx-auto" />
      </div>
    );
  }

  if (!token) return <Navigate to="/" replace />;
  
  if (role !== "MEMBER") return <Navigate to="/app" replace />;

  return children;
}
