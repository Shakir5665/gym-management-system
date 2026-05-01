import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import AreaSpark from "../components/charts/AreaSpark";
import { Flame, TrendingUp, Users, Wallet, Phone, Clock } from "lucide-react";
import Modal from "../components/ui/Modal";
import { socket } from "../socket";

function formatMoneyLKR(amount) {
  const n = Number(amount || 0);
  return `${n.toLocaleString("en-LK", { maximumFractionDigits: 0 })} LKR`;
}

function StatCard({ icon: Icon, label, value, sub, className, iconColor, onClick }) {
  return (
    <Card
      className={
        "p-5 md:p-6 border border-[color:var(--glass-border)] transition-all " +
        (onClick ? "cursor-pointer hover:border-[color:var(--brand)] hover:shadow-xl active:scale-[0.98] " : "") +
        (className || "")
      }
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-[color:var(--muted)]">
            {label}
          </div>
          <div className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-[color:var(--text)]">
            {value}
          </div>
          {sub ? (
            <div className="mt-1 text-xs text-[color:var(--subtle)]">{sub}</div>
          ) : null}
        </div>
        <div className="rounded-2xl bg-[color:var(--control-bg)] border border-[color:var(--control-border)] p-2.5">
          <Icon className={`h-5 w-5 ${iconColor || "text-[color:var(--muted)]"}`} />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);

  const [activeListOpen, setActiveListOpen] = useState(false);
  const [activeMembers, setActiveMembers] = useState([]);
  const [loadingActive, setLoadingActive] = useState(false);

  async function loadActiveList() {
    try {
      setLoadingActive(true);
      setActiveListOpen(true);
      const res = await API.get("/dashboard/active-list");
      setActiveMembers(res.data);
    } catch (e) {
      console.error("Failed to load active members", e);
    } finally {
      setLoadingActive(false);
    }
  }

  async function load(isInitial = false) {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    try {
      setError("");
      const [sRes, tRes] = await Promise.all([
        API.get("/dashboard/summary"),
        API.get("/dashboard/trend/checkins?days=7"),
      ]);
      setSummary(sRes.data);
      setTrend(Array.isArray(tRes.data?.series) ? tRes.data.series : []);
    } catch (e) {
      setError(
        e?.response?.data?.message || "Failed to load dashboard metrics",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    load(true);

    function refresh() {
      if (!cancelled) load();
    }

    socket.on("attendance:new", refresh);
    socket.on("gamification:update", refresh);
    socket.on("payment:update", refresh);
    return () => {
      cancelled = true;
      socket.off("attendance:new", refresh);
      socket.off("gamification:update", refresh);
      socket.off("payment:update", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trendValues = useMemo(() => trend.map((d) => d.count || 0), [trend]);

  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6">
        <Card className="p-6">
          <div className="h-6 w-64 rounded bg-white/5" />
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[120px] rounded-2xl bg-white/5"
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-sm text-danger-500 font-semibold">{error}</div>
        <div className="mt-3">
          <Button variant="ghost" onClick={load}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const activeChange = summary?.activeNowChangePct ?? 0;
  const changeLabel =
    activeChange === 0
      ? "0%"
      : `${activeChange > 0 ? "+" : ""}${activeChange}%`;

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="p-5 md:p-6 border border-[color:var(--glass-border)]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-xs font-semibold tracking-wide text-[color:var(--muted)] uppercase">
              Dashboard
            </div>
            <div className="mt-1 text-2xl md:text-3xl font-black tracking-tight text-[color:var(--text)]">
              Performance Overview
            </div>
            <div className="mt-1 text-xs text-[color:var(--subtle)]">
              Clean real-time visibility into members, revenue, and retention.
            </div>
          </div>
          <Button variant="ghost" onClick={() => load(false)} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          icon={TrendingUp}
          iconColor="text-emerald-500"
          label="Active now"
          value={summary?.activeNow ?? 0}
          sub={`${changeLabel} vs yesterday`}
          onClick={loadActiveList}
        />
        <StatCard
          icon={Users}
          iconColor="text-blue-500"
          label="Total members"
          value={summary?.totalMembers ?? 0}
        />
        <StatCard
          icon={Flame}
          iconColor="text-orange-500"
          label="Today check-ins"
          value={summary?.todayCheckins ?? 0}
        />
        <StatCard
          icon={Wallet}
          iconColor="text-amber-500"
          label="Revenue this month"
          value={formatMoneyLKR(summary?.revenueThisMonth ?? 0)}
        />
      </div>

      <Card className="p-5 md:p-6 border border-[color:var(--glass-border)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[color:var(--text)]">
              Alerts
            </div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">
              Quick actions to stay on top
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate("/app/members")}>
            View members
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => navigate("/app/members/churn-watchlist")}
            className="text-left rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-4 py-3"
          >
            <div className="text-xs font-semibold text-[color:var(--muted)]">
              Churn Probability (High)
            </div>
            <div className="mt-2 text-2xl font-black text-[color:var(--text)]">
              {summary?.alerts?.highChurnCount ?? 0}
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate("/app/members?view=paymentsdue")}
            className="text-left rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-4 py-3"
          >
            <div className="text-xs font-semibold text-[color:var(--muted)]">
              Payments due
            </div>
            <div className="mt-2 text-2xl font-black text-[color:var(--text)]">
              {summary?.alerts?.paymentsDueCount ?? 0}
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate("/app/members?view=new")}
            className="text-left rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] px-4 py-3"
          >
            <div className="text-xs font-semibold text-[color:var(--muted)]">
              New members (7d)
            </div>
            <div className="mt-2 text-2xl font-black text-[color:var(--text)]">
              {summary?.alerts?.newMembersCount ?? 0}
            </div>
          </button>
        </div>
      </Card>

      <Card className="p-5 md:p-6 border border-[color:var(--glass-border)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-[color:var(--text)]">
              Check-in trend
            </div>
            <div className="text-xs text-[color:var(--muted)] mt-0.5">
              Last 7 days
            </div>
          </div>
          <Badge variant="brand">Live</Badge>
        </div>
        <div className="mt-4">
          <AreaSpark
            values={trendValues}
            accent="brand"
            className="rounded-xl"
          />
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2 text-[11px] text-[color:var(--subtle)]">
          {trend.map((d) => (
            <div key={d.date} className="text-center truncate" title={d.date}>
              {d.count}
            </div>
          ))}
        </div>
      </Card>

      <Modal 
        open={activeListOpen} 
        onClose={() => setActiveListOpen(false)} 
        title="Active Members Now"
        className="max-w-md"
      >
        <div className="space-y-4">
          {loadingActive ? (
            <div className="py-12 text-center text-sm text-[color:var(--muted)] font-black uppercase tracking-[0.2em] animate-pulse">
              Fetching active list...
            </div>
          ) : activeMembers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-4">🏠</div>
              <div className="text-sm font-bold text-[color:var(--text)]">Gym is empty</div>
              <div className="text-xs text-[color:var(--muted)] mt-1">No members are currently checked in.</div>
            </div>
          ) : (
            <div className="divide-y divide-[color:var(--glass-border)]">
              {activeMembers.map((m) => (
                <div key={m.attendanceId} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[color:var(--brand)] overflow-hidden shadow-lg shrink-0 flex items-center justify-center font-black text-white">
                    {m.profilePicture ? (
                      <img src={m.profilePicture} alt={m.name} className="h-full w-full object-cover" />
                    ) : (
                      m.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-[color:var(--text)] truncate">
                      {m.name}
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">
                        <Clock className="h-3 w-3" />
                        In at {new Date(m.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[color:var(--subtle)]">
                        <Phone className="h-3 w-3" />
                        {m.phone}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/app/member/${m.memberId}`)}
                    className="shrink-0 text-xs px-3 py-1.5"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
