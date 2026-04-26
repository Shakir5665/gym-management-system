import { useEffect, useState } from "react";
import API from "../api/api";

export default function Dashboard({ memberId }) {
  const [game, setGame] = useState({});
  const [risk, setRisk] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const g = await API.get(`/gamification/${memberId}`);
      const r = await API.get(`/retention/${memberId}`);

      setGame(g.data);
      setRisk(r.data.risk);
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>

      <p>Points: {game.points}</p>
      <p>Streak: {game.streak}</p>
      <p>Risk Level: {risk}</p>
    </div>
  );
}