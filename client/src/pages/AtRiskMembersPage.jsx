import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { ArrowLeft } from "lucide-react";
import { socket } from "../socket";

export default function ChurnWatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/dashboard/lists?limit=50");
      setWatchlist(res.data?.highChurnMembers || []);
    } catch {
      setError("Failed to load churn watchlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();

    // Listen for updates
    socket.on("attendance:new", fetchWatchlist);
    socket.on("gamification:update", fetchWatchlist);
    socket.on("payment:update", fetchWatchlist);

    return () => {
      socket.off("attendance:new", fetchWatchlist);
      socket.off("gamification:update", fetchWatchlist);
      socket.off("payment:update", fetchWatchlist);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6">
        <Card className="p-6">
          <div className="h-6 w-64 rounded bg-[color:var(--control-bg)] animate-pulse" />
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[80px] rounded-2xl bg-[color:var(--control-bg)] animate-pulse"
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
              Churn Watchlist
            </div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">
              Members with high churn probability based on low activity
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={fetchWatchlist}
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
        {watchlist.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="text-sm font-semibold text-[color:var(--text)]">
              No members at risk
            </div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">
              Great news! All members are actively engaged.
            </div>
          </Card>
        ) : (
          watchlist.map((m) => (
            <button
              key={m.memberId}
              type="button"
              onClick={() => navigate(`/app/member/${m.memberId}`)}
              className="text-left glass p-5 transition hover:bg-[color:var(--control-bg)] hover:border-[color:var(--glass-border-strong)] hover:-translate-y-[1px] focus:outline-none focus-visible:focus-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[color:var(--text)] truncate">
                    {m.name}
                  </div>
                  <div className="mt-0.5 text-xs text-[color:var(--muted)]">
                    Churn Probability: <span className="font-semibold">{m.probability}</span>
                  </div>
                  <div className="mt-1 text-xs text-[color:var(--subtle)]">
                    Requires immediate engagement
                  </div>
                </div>
                <Badge variant="danger" className="flex-shrink-0">
                  HIGH
                </Badge>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
