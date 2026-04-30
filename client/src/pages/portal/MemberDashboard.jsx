import { useState, useEffect, useRef } from "react";
import API from "../../api/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { 
  Trophy, 
  Activity, 
  Calendar, 
  ChevronRight, 
  QrCode, 
  Info,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Star,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";

export default function MemberDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await API.get("/portal/profile");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLbLoading(true);
      const res = await API.get("/portal/leaderboard");
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Leaderboard error:", err);
    } finally {
      setLbLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // 🔌 Use Shared Socket
    const onConnect = () => console.log("✅ Live Dashboard Connected");
    const onAttendance = (payload) => {
      if (user?.memberId && payload.memberId === user.memberId) {
        console.log("🔄 Live Update: Attendance recorded");
        fetchDashboard(true);
      }
    };
    const onGamification = (payload) => {
      if (user?.memberId && payload.memberId === user.memberId) {
        console.log("🔄 Live Update: Gamification earned");
        fetchDashboard(true);
        if (leaderboardOpen) fetchLeaderboard();
      }
    };
    // Global leaderboard update (optional: if someone else checksin, rank might change)
    const onGlobalGamification = () => {
      if (leaderboardOpen) fetchLeaderboard();
    };

    socket.on("connect", onConnect);
    socket.on("attendance:new", onAttendance);
    socket.on("gamification:update", onGamification);
    socket.on("leaderboard:refresh", onGlobalGamification);

    return () => {
      socket.off("connect", onConnect);
      socket.off("attendance:new", onAttendance);
      socket.off("gamification:update", onGamification);
      socket.off("leaderboard:refresh", onGlobalGamification);
    };
  }, [user?.memberId, leaderboardOpen]);

  useEffect(() => {
    if (leaderboardOpen) {
      fetchLeaderboard();
    }
  }, [leaderboardOpen]);

  if (loading) {
    return (
      <div className="grid gap-6 animate-pulse p-6">
        <div className="h-40 bg-[color:var(--control-bg)] rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-[color:var(--control-bg)] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-danger-500/20 m-6">
        <div className="text-danger-500 font-bold mb-2">Error Loading Dashboard</div>
        <div className="text-sm text-[color:var(--muted)]">{error}</div>
      </Card>
    );
  }

  const { member, stats } = data;
  const isExpired = new Date(member.subscriptionEnd) < new Date();

  return (
    <div className="grid gap-6 p-4 md:p-6 pb-20 md:pb-6">
      {/* 👋 WELCOME HEADER */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[color:var(--text)]">
            Hey, {member.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-[color:var(--muted)] font-medium">
            Ready for your session at <span className="text-brand-500">{member.gymId?.name}</span>?
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="flex-1 md:flex-none border-brand-500/20 text-brand-600 hover:bg-brand-500/5 gap-2"
            onClick={() => setLeaderboardOpen(true)}
          >
            <Trophy className="h-4 w-4" /> Leaderboard
          </Button>
          <Badge 
            variant={isExpired ? "danger" : "success"}
            className="text-sm px-4 py-1.5 rounded-full"
          >
            {isExpired ? "Expired" : "Active"}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 🤳 QR ACCESS CARD */}
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-brand-500 to-brand-700 text-white border-none shadow-xl shadow-brand-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <QrCode size={200} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white p-4 rounded-3xl shadow-2xl">
              {member.qrCode ? (
                <img src={member.qrCode} alt="Member QR" className="w-40 h-40 object-contain" />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-gray-100 text-gray-400 rounded-2xl">
                  <QrCode size={48} />
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <div>
                <h2 className="text-2xl font-black">Scan to Check-in</h2>
                <p className="text-brand-100 text-sm mt-1">Show this at the reception scanner.</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-bold uppercase tracking-wider">
                  Member ID: {member._id.slice(-6).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 🏆 STATUS & QUICK ACTIONS */}
        <Card className="p-6 border-[color:var(--control-border)]">
          <h3 className="font-bold text-[color:var(--text)] mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-500" />
            Membership Info
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[color:var(--control-bg)]/50">
              <span className="text-xs text-[color:var(--muted)] font-bold uppercase">Expires On</span>
              <span className={`text-sm font-black ${isExpired ? "text-danger-500" : "text-[color:var(--text)]"}`}>
                {new Date(member.subscriptionEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </span>
            </div>
            
            <button 
              onClick={() => navigate("/portal/profile")}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-brand-500/5 hover:bg-brand-500/10 border border-brand-500/10 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-brand-600">My Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-brand-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Card>
      </div>

      {/* 📊 REAL-TIME STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={<Star className="text-yellow-500" />} 
          label="Points" 
          value={stats.points} 
          sub="Loyalty"
          highlight
        />
        <StatCard 
          icon={<Flame className="text-orange-500" />} 
          label="Streak" 
          value={`${stats.streak} Days`} 
          sub="Active"
          highlight
        />
        <StatCard 
          icon={<Calendar className="text-blue-500" />} 
          label="Visits" 
          value={stats.totalCheckins} 
          sub="Total"
        />
        <StatCard 
          icon={member.isBanned || member.hasFine ? <ShieldAlert className="text-red-500" /> : <ShieldCheck className="text-green-500" />} 
          label="Status" 
          value={member.isBanned ? "Banned" : member.hasFine ? "Fine" : "Good"} 
          sub="Standing"
        />
      </div>

      {/* 📈 ATTENDANCE TREND CHART */}
      <Card className="p-6 border-[color:var(--control-border)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-[color:var(--text)] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-500" />
              Attendance Trend
            </h3>
            <p className="text-[10px] text-[color:var(--muted)] uppercase font-bold mt-1 tracking-wider">Last 7 Days Activity</p>
          </div>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 px-2">
          {stats.attendanceTrend.map((day, idx) => {
            const visited = day.count > 0;
            const dateLabel = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative">
                <div 
                  className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ${
                    visited 
                      ? "bg-gradient-to-t from-brand-500 to-brand-400 opacity-90 shadow-lg shadow-brand-500/20" 
                      : "bg-[color:var(--control-bg)] opacity-30"
                  }`}
                  style={{ height: visited ? "100%" : "12px" }}
                />
                <span className={`text-[10px] font-bold ${visited ? "text-brand-600" : "text-[color:var(--text)]"}`}>
                  {dateLabel}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 🏆 LEADERBOARD MODAL */}
      <Modal 
        open={leaderboardOpen} 
        onClose={() => setLeaderboardOpen(false)} 
        title="Gym Leaderboard"
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--bg2)]">
            {lbLoading ? (
              <div className="p-8 text-center animate-pulse text-[color:var(--muted)] text-sm">Ranking members...</div>
            ) : leaderboard.length > 0 ? (
              <div className="divide-y divide-[color:var(--control-border)]">
                {leaderboard.map((m, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 ${m.memberId === member._id ? "bg-brand-500/5" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        i === 0 ? "bg-yellow-500 text-white" : 
                        i === 1 ? "bg-slate-400 text-white" :
                        i === 2 ? "bg-orange-600 text-white" :
                        "bg-[color:var(--control-bg)] text-[color:var(--muted)]"
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[color:var(--text)] flex items-center gap-2">
                          {m.name}
                          {m.memberId === member._id && <Badge variant="primary" className="text-[9px] py-0 px-1">YOU</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-[color:var(--muted)] flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" /> {m.streak} Day Streak
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-brand-600">{m.points}</div>
                      <div className="text-[9px] font-bold text-[color:var(--muted)] uppercase tracking-wider">Points</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[color:var(--muted)] text-sm font-medium">No activity yet. Be the first!</div>
            )}
          </div>
          <Button variant="primary" className="w-full" onClick={() => setLeaderboardOpen(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon, label, value, sub, highlight }) {
  return (
    <Card className={`p-5 flex flex-col gap-3 transition-all border-[color:var(--control-border)] ${highlight ? "bg-brand-500/[0.03] border-brand-500/10" : ""}`}>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${highlight ? "bg-white border-brand-500/20" : "bg-[color:var(--control-bg)] border-[color:var(--control-border)]"}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">{label}</div>
        <div className={`text-xl font-black mt-0.5 ${highlight ? "text-brand-600" : "text-[color:var(--text)]"}`}>{value}</div>
        {sub && <div className="text-[10px] text-[color:var(--subtle)] mt-1">{sub}</div>}
      </div>
    </Card>
  );
}
