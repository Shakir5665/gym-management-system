import { useEffect, useState } from "react";
import API from "../api/api";
import { socket } from "../socket";

export default function Dashboard({ memberId }) {
  const [game, setGame] = useState({});
  const [risk, setRisk] = useState("");

  const fetchData = async () => {
    const g = await API.get(`/gamification/${memberId}`);
    const r = await API.get(`/retention/${memberId}`);

    setGame(g.data || {});
    setRisk(r.data.risk || "");
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

  return (
    <div className="grid grid-cols-3 gap-4">

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <p className="text-gray-400">Points</p>
        <h2 className="text-2xl text-green-400">
          {game.points || 0}
        </h2>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <p className="text-gray-400">Streak</p>
        <h2 className="text-2xl text-blue-400">
          {game.streak || 0}
        </h2>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <p className="text-gray-400">Risk</p>
        <h2
          className={`text-2xl ${
            risk === "HIGH"
              ? "text-red-500"
              : risk === "MEDIUM"
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {risk}
        </h2>
      </div>
    </div>
  );
}