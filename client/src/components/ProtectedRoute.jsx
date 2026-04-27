import { useAuth } from "../context/AuthContext";
import SetupGym from "../pages/SetupGym";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { token, hasGym, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/" replace />;

  if (!hasGym) return <SetupGym />;

  return children;
}
