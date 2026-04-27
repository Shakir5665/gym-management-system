import { useEffect, useState } from "react";
import API from "../api/api";
import { socket } from "../socket";

export default function Dashboard({ memberId }) {
  const [game, setGame] = useState({});
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [gRes, rRes] = await Promise.all([
        API.get(`/gamification/${memberId}`),
        API.get(`/retention/${memberId}`),
      ]);

      setGame(gRes.data || {});
      setRisk(rRes.data.risk || "");
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [memberId]);

  useEffect(() => {
    socket.on("gamification:update", fetchData);
    socket.on("attendance:new", fetchData);

    return () => {
      socket.off("gamification:update");
      socket.off("attendance:new");
    };
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "HIGH":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      case "MEDIUM":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "LOW":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 p-6 rounded-xl border border-blue-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Points</p>
              <h2 className="text-4xl font-bold text-blue-400 mt-2">
                {game.points || 0}
              </h2>
            </div>
            <div className="text-5xl">⭐</div>
          </div>
          <p className="text-blue-300/70 text-xs mt-3">Total earned points</p>
        </div>

        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-600/20 to-orange-900/20 p-6 rounded-xl border border-orange-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Streak</p>
              <h2 className="text-4xl font-bold text-orange-400 mt-2">
                {game.streak || 0}
              </h2>
            </div>
            <div className="text-5xl">🔥</div>
          </div>
          <p className="text-orange-300/70 text-xs mt-3">
            Consecutive check-ins
          </p>
        </div>

        {/* Risk Level Card */}
        <div
          className={`bg-gradient-to-br p-6 rounded-xl border shadow-lg ${getRiskColor(risk)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Risk Level</p>
              <h2 className="text-4xl font-bold mt-2">{risk || "N/A"}</h2>
            </div>
            <div className="text-5xl">
              {risk === "HIGH" ? "⚠️" : risk === "MEDIUM" ? "⏱️" : "✅"}
            </div>
          </div>
          <p className="text-xs mt-3 opacity-70">Member retention status</p>
        </div>
      </div>

      {/* ADDITIONAL INFO */}
      {game.lastCheckIn && (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Last Check-in</p>
              <p className="text-white font-semibold mt-1">
                {new Date(game.lastCheckIn).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Check-ins</p>
              <p className="text-white font-semibold mt-1">
                {game.totalCheckIns || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME INDICATOR */}
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        Real-time updates enabled
      </div>
    </div>
  );
}
