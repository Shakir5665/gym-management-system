import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import { useAuth } from "./context/AuthContext";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import MembersPage from "./pages/MembersPage";
import NotificationsPage from "./pages/NotificationsPage";
import Scanner from "./pages/Scanner";
import Payments from "./pages/Payments";

function App() {
  // ✅ Hooks must be inside component
  const { token, loading } = useAuth();

  // 🔥 Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="glass px-8 py-7 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-400 mb-4 mx-auto" />
          <p className="text-white/60 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/app/dashboard" replace /> : <Landing />}
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="payments" element={<Payments />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
