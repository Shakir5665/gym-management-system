import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SuperRoute = ({ children }) => {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role !== "SUPER_ADMIN") {
    // If not super admin, kick back to normal dashboard
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default SuperRoute;
