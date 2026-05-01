import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { ArrowLeft } from "lucide-react";
import { socket } from "../socket";

export default function TopMembersPage() {
  const navigate = useNavigate();
  const [topMembers, setTopMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTopMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/dashboard/lists?limit=50");
      setTopMembers(res.data?.topMembers || []);
    } catch {
      setError("Failed to load top members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopMembers();

    // Listen for updates
    socket.on("attendance:new", fetchTopMembers);
    socket.on("gamification:update", fetchTopMembers);
    socket.on("payment:update", fetchTopMembers);

    return () => {
      socket.off("attendance:new", fetchTopMembers);
      socket.off("gamification:update", fetchTopMembers);
      socket.off("payment:update", fetchTopMembers);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6">
        <Card className="p-6">
          <div className="h-6 w-64 rounded bg-white/5" />
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[80px] rounded-2xl bg-white/5"
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="p-5 md:p-6 border border-[color:var(--glass-border)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[color:var(--text)]">
              Top members
            </div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">
              Members ranked by their streak
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={fetchTopMembers}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/app/members")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </Card>

      {error ? (
        <Card className="p-4 border border-danger-500/20">
          <div className="text-sm font-semibold text-danger-500">{error}</div>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {topMembers.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-sm font-semibold text-[color:var(--text)]">
              No top members yet
            </div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">
              Members will appear here once they start building streaks.
            </div>
          </Card>
        ) : (
          topMembers.map((m, idx) => (
            <button
              key={m.memberId}
              type="button"
              onClick={() => navigate(`/app/member/${m.memberId}`)}
              className="text-left glass p-5 focus:outline-none focus-visible:focus-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/20 border border-brand-500/30 text-brand-400 font-bold flex-shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[color:var(--text)] truncate">
                      {m.name}
                    </div>
                    <div className="mt-0.5 text-xs text-[color:var(--muted)]">
                      Joined • {new Date(m.joinedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge variant="brand" className="flex-shrink-0">
                  {m.points} ⭐ • {m.streak} 🔥
                </Badge>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
