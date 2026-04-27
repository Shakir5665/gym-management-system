import { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import AreaSpark from "../components/charts/AreaSpark";
import { Activity, Flame, ShieldAlert, Star } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";

function riskVariant(risk) {
  if (risk === "HIGH") return "danger";
  if (risk === "MEDIUM") return "warning";
  if (risk === "LOW") return "success";
  return "neutral";
}

export default function DashboardPage() {
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { items, markAllRead } = useNotifications();

  useEffect(() => {
    let cancelled = false;
    async function loadMembers() {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/members");
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setMembers(list);
        const stored = localStorage.getItem("selectedMemberId");
        const first = list[0]?._id;
        const selected = stored && list.some((m) => m._id === stored) ? stored : first || "";
        setMemberId(selected);
      } catch {
        if (!cancelled) setError("Failed to load members for analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMembers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (memberId) localStorage.setItem("selectedMemberId", memberId);
  }, [memberId]);

  const recentNotifs = useMemo(() => items.slice(0, 6), [items]);

  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6">
        <Card className="p-6">
          <div className="h-5 w-48 rounded bg-white/8 animate-pulse" />
          <div className="mt-3 h-10 w-full rounded bg-white/6 animate-pulse" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="h-[140px] bg-white/[0.05] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-sm text-danger-500 font-semibold">{error}</div>
        <div className="mt-3 text-xs text-white/50">
          Make sure your backend is running and `VITE_API_URL` is set correctly.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white">Real-time analytics</div>
            <div className="text-xs text-white/50 mt-0.5">
              Points, streak, risk level, and attendance trends.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-white/55">Member</div>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="rounded-xl bg-white/6 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              {members.map((m) => (
                <option key={m._id} value={m._id} className="bg-bg-2">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <DashboardMemberAnalytics memberId={memberId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2 p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white">Attendance trend</div>
              <div className="text-xs text-white/50 mt-0.5">Last 14 entries (if available)</div>
            </div>
            <Badge variant="brand">
              <Activity className="h-3.5 w-3.5" />
              Live
            </Badge>
          </div>
          <div className="mt-4">
            <AttendanceTrend memberId={memberId} />
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white">Notifications</div>
              <div className="text-xs text-white/50 mt-0.5">Real-time updates</div>
            </div>
            <Button size="sm" variant="ghost" onClick={markAllRead}>
              Mark read
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {recentNotifs.length === 0 ? (
              <div className="text-xs text-white/50">No notifications yet.</div>
            ) : (
              recentNotifs.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="w-full text-left rounded-xl border border-white/10 bg-white/6 hover:bg-white/10 px-3 py-2 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-white/85 truncate">{n.title}</div>
                    {!n.read ? (
                      <span className="h-2 w-2 rounded-full bg-brand-400/70" />
                    ) : null}
                  </div>
                  {n.message ? (
                    <div className="mt-0.5 text-[11px] text-white/50 line-clamp-2">
                      {n.message}
                    </div>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DashboardMemberAnalytics({ memberId }) {
  const [game, setGame] = useState({});
  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const [gRes, rRes] = await Promise.all([
          API.get(`/gamification/${memberId}`),
          API.get(`/retention/${memberId}`),
        ]);
        if (cancelled) return;
        setGame(gRes.data || {});
        setRisk(rRes.data?.risk || "");
      } catch {
        if (!cancelled) setError("Failed to load dashboard analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (memberId) fetchData();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  const metricCard =
    "glass p-5 md:p-6 transition hover:border-white/16 hover:bg-white/[0.08] hover:-translate-y-[1px] will-change-transform";

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="h-[150px] bg-white/[0.05] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-sm text-danger-500 font-semibold">{error}</div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className={metricCard}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/55 font-semibold">Points</div>
            <div className="mt-2 text-4xl font-black tracking-tight text-white">
              {game?.points ?? 0}
            </div>
            <div className="mt-1 text-xs text-white/45">Total earned</div>
          </div>
          <div className="rounded-2xl bg-brand-400/12 border border-brand-400/18 p-2.5">
            <Star className="h-5 w-5 text-brand-200" />
          </div>
        </div>
      </div>

      <div className={metricCard}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/55 font-semibold">Streak</div>
            <div className="mt-2 text-4xl font-black tracking-tight text-white">
              {game?.streak ?? 0}
            </div>
            <div className="mt-1 text-xs text-white/45">Consecutive check-ins</div>
          </div>
          <div className="rounded-2xl bg-warning-500/12 border border-warning-500/18 p-2.5">
            <Flame className="h-5 w-5 text-yellow-200" />
          </div>
        </div>
      </div>

      <div className={metricCard}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/55 font-semibold">Risk</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="text-3xl font-black tracking-tight text-white">{risk || "N/A"}</div>
              <Badge variant={riskVariant(risk)}>{riskVariant(risk).toUpperCase()}</Badge>
            </div>
            <div className="mt-1 text-xs text-white/45">Retention level</div>
          </div>
          <div className="rounded-2xl bg-danger-500/10 border border-danger-500/16 p-2.5">
            <ShieldAlert className="h-5 w-5 text-red-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceTrend({ memberId }) {
  const [values, setValues] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function loadTrend() {
      try {
        // If your backend later exposes a trend endpoint, plug it in here.
        // For now we derive a simple series from gamification fields when present.
        const gRes = await API.get(`/gamification/${memberId}`);
        if (cancelled) return;
        const g = gRes.data || {};
        const history = Array.isArray(g.attendanceHistory) ? g.attendanceHistory : [];
        const derived = history
          .map((x) => (typeof x === "number" ? x : x?.value))
          .filter((n) => typeof n === "number");
        setValues(derived.slice(-14));
      } catch {
        if (!cancelled) setValues([]);
      }
    }
    if (memberId) loadTrend();
    return () => {
      cancelled = true;
    };
  }, [memberId]);

  return <AreaSpark values={values} accent="brand" className="rounded-xl" />;
}

