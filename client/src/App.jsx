import Members from "./pages/Members";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";

function App() {
  // ✅ Hooks must be inside component
  const { token, logout, loading, user } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);

  // 🔥 Show loading while checking auth
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

  // 🔥 Show landing if not logged in
  if (!token) {
    return <Landing />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white flex">
        {/* 🔥 SIDEBAR */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-blue-400">Gym Pro</h2>
            <p className="text-gray-400 text-sm mt-1">Member Manager</p>
            {user && (
              <p className="text-gray-300 text-xs mt-3 truncate">
                👤 {user.name}
              </p>
            )}
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4">
            <Members setSelectedMember={setSelectedMember} />
          </div>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 🔥 MAIN CONTENT */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          {/* Top bar with logout in corner */}
          <div className="border-b border-gray-700 p-6 shadow flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {selectedMember ? "Member Dashboard" : "Dashboard"}
            </h1>

            {/* Logout button in top right */}
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedMember ? (
              <Dashboard memberId={selectedMember} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-400 text-lg">
                    Select a member from the sidebar to view their dashboard
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    You can view points, streaks, and risk levels
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default App;
