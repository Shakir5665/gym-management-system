import { useState, useEffect } from "react";
import API from "../../api/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
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
  BarChart3,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function MemberDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
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

    // 🔌 Real-time Updates via Socket
    const socketURL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
    const socket = io(socketURL);

    socket.on("connect", () => {
      console.log("Connected to Real-time Sync");
    });

    // Listen for events related to this member
    socket.on("attendance:new", (payload) => {
      if (data && payload.memberId === data.member._id) {
        fetchDashboard();
      }
    });

    socket.on("gamification:update", (payload) => {
      if (data && payload.memberId === data.member._id) {
        fetchDashboard();
      }
      // If leaderboard is open, refresh it too
      if (leaderboardOpen) {
        fetchLeaderboard();
      }
    });

    return () => socket.disconnect();
  }, [leaderboardOpen]); // Re-run if leaderboard opens to ensure sync

  useEffect(() => {
    if (leaderboardOpen) {
      fetchLeaderboard();
    }
  }, [leaderboardOpen]);

  if (loading) {
    return (
      <div className="grid gap-6 animate-pulse">
        <div className="h-32 bg-[color:var(--control-bg)] rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[color:var(--control-bg)] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-danger-500/20">
        <div className="text-danger-500 font-bold mb-2">Error Loading Dashboard</div>
        <div className="text-sm text-[color:var(--muted)]">{error}</div>
      </Card>
    );
  }

  const { member, stats } = data;
  const isExpired = new Date(member.subscriptionEnd) < new Date();

  return (
    <div className="grid gap-6">
      {/* 👋 WELCOME HEADER */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-[color:var(--text)]">
              Hey, {member.name.split(' ')[0]}! 👋
            </h1>
          </div>
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
            {isExpired ? "Subscription Expired" : "Active Member"}
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
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[color:var(--control-bg)]/50">
              <span className="text-xs text-[color:var(--muted)] font-bold uppercase">Joined</span>
              <span className="text-sm font-black text-[color:var(--text)]">
                {new Date(member.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
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
                <span className="text-sm font-bold text-brand-600">Update Profile</span>
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
          sub="Loyalty score"
          highlight
        />
        <StatCard 
          icon={<Flame className="text-orange-500" />} 
          label="Streak" 
          value={`${stats.streak} Days`} 
          sub="Consecutive visits"
          highlight
        />
        <StatCard 
          icon={<Calendar className="text-blue-500" />} 
          label="Check-ins" 
          value={stats.totalCheckins} 
          sub="Lifetime visits"
        />
        <StatCard 
          icon={member.isBanned || member.hasFine ? <ShieldAlert className="text-red-500" /> : <ShieldCheck className="text-green-500" />} 
          label="Status" 
          value={member.isBanned ? "Restricted" : member.hasFine ? "Fine Due" : "Good Standing"} 
          sub={member.isBanned ? "Contact Admin" : member.hasFine ? "Settle Dues" : "No restrictions"}
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
            <p className="text-[10px] text-[color:var(--muted)] uppercase font-bold mt-1 tracking-wider">Activity over the last 7 days</p>
          </div>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 px-2">
          {stats.attendanceTrend.map((day, idx) => {
            const height = day.count > 0 ? "100%" : "8px"; // Simplified for member portal (visited or not)
            const visited = day.count > 0;
            const dateLabel = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' });
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative">
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[color:var(--bg2)] border border-[color:var(--control-border)] px-2 py-1 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-20">
                  {visited ? "Check-in recorded" : "No activity"}
                </div>
                
                <div 
                  className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ${
                    visited 
                      ? "bg-gradient-to-t from-brand-500 to-brand-400 opacity-90 hover:opacity-100" 
                      : "bg-[color:var(--control-bg)] opacity-30"
                  }`}
                  style={{ height: visited ? "100%" : "12px" }}
                />
                <span className={`text-[10px] font-bold ${visited ? "text-[color:var(--text)]" : "text-[color:var(--muted)]"}`}>
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
          <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white">
              <Trophy size={24} />
            </div>
            <div>
              <h4 className="font-black text-brand-600">Top Performers</h4>
              <p className="text-xs text-[color:var(--muted)]">Check out the most active members this month.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--control-border)] bg-[color:var(--bg2)]">
            {lbLoading ? (
              <div className="p-8 text-center animate-pulse text-[color:var(--muted)]">Loading ranking...</div>
            ) : leaderboard.length > 0 ? (
              <div className="divide-y divide-[color:var(--control-border)]">
                {leaderboard.map((m, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 ${m.memberId === member._id ? "bg-brand-500/5" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs ${
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
                          {m.memberId === member._id && <Badge variant="primary" className="text-[8px] py-0 px-1">You</Badge>}
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
              <div className="p-8 text-center text-[color:var(--muted)]">No data yet. Start training!</div>
            )}
          </div>

          <Button 
            variant="primary" 
            className="w-full mt-2" 
            onClick={() => setLeaderboardOpen(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon, label, value, sub, highlight }) {
  return (
    <Card className={`p-5 flex flex-col gap-3 transition-all border-[color:var(--control-border)] ${highlight ? "bg-brand-500/[0.02] border-brand-500/10 shadow-sm" : ""}`}>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${highlight ? "bg-white border-brand-500/20 shadow-sm" : "bg-[color:var(--control-bg)] border-[color:var(--control-border)]"}`}>
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
