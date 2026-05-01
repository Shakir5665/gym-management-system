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
  Bell,
  X,
  AlertTriangle,
  DollarSign
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem(`read_notifications_${user?.memberId}`) || "[]");
  });
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const fetchDashboard = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      console.time("Dashboard Fetch");
      const res = await API.get("/portal/profile");
      console.timeEnd("Dashboard Fetch");
      setData(res.data);
    } catch (err) {
      console.timeEnd("Dashboard Fetch");
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Mark as Read
  const handleToggleNotifications = () => {
    if (!showNotifications && data?.notifications) {
      const ids = data.notifications.map(n => n.id);
      const newRead = Array.from(new Set([...readNotifications, ...ids]));
      setReadNotifications(newRead);
      localStorage.setItem(`read_notifications_${user?.memberId}`, JSON.stringify(newRead));
    }
    setShowNotifications(!showNotifications);
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
    const onConnect = () => { };
    const onAttendance = (payload) => {
      if (user?.memberId && payload.memberId === user.memberId) {
        fetchDashboard(true);
      }
    };
    const onGamification = (payload) => {
      if (user?.memberId && payload.memberId === user.memberId) {
        fetchDashboard(true);
      }
      if (leaderboardOpen) fetchLeaderboard();
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
  }, [user?.memberId]);

  useEffect(() => {
    if (leaderboardOpen) {
      fetchLeaderboard();
    }
  }, [leaderboardOpen]);

  if (loading) {
    return (
      <div className="grid gap-6 p-6">
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
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

  const { member, stats, notifications = [] } = data;

  const hasUnread = notifications.some(n => !readNotifications.includes(n.id));
  const isExpired = member.subscriptionEnd && new Date(member.subscriptionEnd) < new Date();
  const memberStatus = member.isBanned ? "Banned" : member.hasFine ? "Fined" : "Good";

  return (
    <div className="max-w-5xl mx-auto space-y-12">

      {/* 🚨 PERSISTENT BAN ALERT */}
      {member.isBanned && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-red-400 font-black text-lg tracking-tight">Your Account is Banned</h3>
                <p className="text-red-300/70 text-sm mt-1">
                  You have been restricted from accessing gym services. Please contact your gym administrator.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {member.banReason && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Reason</div>
                    <div className="text-red-300 text-sm font-semibold">{member.banReason}</div>
                  </div>
                )}
                {member.banFrom && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-1">Ban Period</div>
                    <div className="text-red-300 text-sm font-semibold">
                      {new Date(member.banFrom).toLocaleDateString()}
                      {member.banTo ? ` → ${new Date(member.banTo).toLocaleDateString()}` : ' → Indefinite'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💰 PERSISTENT FINE ALERT */}
      {member.hasFine && !member.isBanned && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-yellow-400 font-black text-lg tracking-tight">Outstanding Fine on Your Account</h3>
                <p className="text-yellow-300/70 text-sm mt-1">
                  You have an unpaid fine. Please settle this with your gym administrator at your earliest convenience.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {member.fineAmount && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-widest mb-1">Amount Due</div>
                    <div className="text-yellow-300 text-xl font-black">Rs. {member.fineAmount.toLocaleString()}</div>
                  </div>
                )}
                {member.fineReason && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-yellow-500/60 uppercase tracking-widest mb-1">Reason</div>
                    <div className="text-yellow-300 text-sm font-semibold">{member.fineReason}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📅 PERSISTENT EXPIRED PAYMENT ALERT */}
      {isExpired && !member.isBanned && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-orange-400 font-black text-lg tracking-tight">Subscription Expired</h3>
                <p className="text-orange-300/70 text-sm mt-1">
                  Your gym membership has expired. You may not be able to access gym services until you renew.
                  Please contact your gym administrator to make a payment.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest mb-1">Expired On</div>
                  <div className="text-orange-300 text-sm font-black">
                    {new Date(member.subscriptionEnd).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest mb-1">Days Overdue</div>
                  <div className="text-orange-300 text-sm font-black">
                    {Math.abs(Math.ceil((new Date(member.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24)))} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏛️ CLEAN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Welcome, {member.name}
          </h1>
          <p className="text-white/40 text-sm md:text-lg font-medium">
            Manage your session at <span className="text-white font-black tracking-tight text-lg md:text-xl">{member.gymId?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleNotifications}
            className="relative h-12 w-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center"
          >
            <Bell className="h-5 w-5 text-white/50" />
            {hasUnread && (
              <span className="absolute top-3.5 right-3.5 h-2 w-2 bg-brand-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              setLeaderboardOpen(true);
              fetchLeaderboard();
            }}
            className="h-12 px-6 rounded-xl bg-white text-black font-bold text-sm flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </button>
        </div>
      </div>

      {/* 📯 MINIMAL NOTIFICATION DRAWER */}
      {showNotifications && (
        <div
          ref={notificationRef}
          className="absolute top-24 right-4 md:right-2 w-[calc(100%-2rem)] md:w-80 bg-[#0f0f0f] p-5 z-[110] border border-white/10 shadow-2xl rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <h3 className="font-bold text-sm text-white/80">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="text-white/30 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-white/20 font-medium">No new alerts</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${n.type === 'DANGER' ? 'text-red-500' : 'text-brand-500'}`}>
                    {n.title}
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed font-medium">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* 🤳 THE ACCESS HUB */}
        <div className="lg:col-span-7 p-8 md:p-12 bg-white/[0.02] border border-white/10 rounded-3xl flex flex-col md:flex-row items-center gap-10 md:gap-14 shadow-sm">
          <div className="bg-white p-4 rounded-2xl shadow-2xl shrink-0">
            {member.qrCode ? (
              <img src={member.qrCode} alt="Member QR" className="w-40 h-40 md:w-48 md:h-48 object-contain" />
            ) : (
              <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center bg-gray-50 text-gray-300">
                <QrCode size={48} />
              </div>
            )}
          </div>

          <div className="text-center md:text-left space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">Quick Access</h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-[240px]">
                Scan this at the reception for instant entry.
              </p>
            </div>
            <div className="inline-block px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-white/60 tracking-widest uppercase">
              ID: {member._id.slice(-6).toUpperCase()}
            </div>
          </div>
        </div>

        {/* 💳 MEMBERSHIP SUMMARY */}
        <div className="lg:col-span-5 p-8 bg-white/[0.02] border border-white/10 rounded-3xl flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Membership</span>
              <div className={`h-2 w-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-brand-500'}`} />
            </div>

            <div className="space-y-1">
              <div className="text-white/40 text-xs font-semibold">Valid Until</div>
              <div className={`text-2xl font-bold tracking-tight ${isExpired ? "text-red-500" : "text-white"}`}>
                {new Date(member.subscriptionEnd).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/portal/profile")}
            className="mt-8 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white/80 font-bold text-sm"
          >
            Manage Account
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 📊 KEY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <MetricCard label="Points" value={stats.points} sub="Loyalty" icon={<Star className="h-4 w-4 text-yellow-500" />} />
        <MetricCard label="Streak" value={stats.streak} sub="Days" icon={<Flame className="h-4 w-4 text-orange-500" />} />
        <MetricCard label="Visits" value={stats.totalCheckins} sub="Total" icon={<Calendar className="h-4 w-4 text-blue-500" />} />
        <MetricCard
          label="Status"
          value={memberStatus}
          sub="Standing"
          icon={
            member.isBanned
              ? <ShieldAlert className="h-4 w-4 text-red-500" />
              : member.hasFine
                ? <ShieldAlert className="h-4 w-4 text-yellow-500" />
                : <Activity className="h-4 w-4 text-green-500" />
          }
        />
      </div>

      {/* 🏆 LEADERBOARD MODAL */}
      <Modal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        title="Leaderboard"
      >
        <div className="space-y-6 pt-4">
          <div className="rounded-3xl border border-white/5 bg-black/40 overflow-hidden shadow-2xl">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {lbLoading ? (
                <div className="p-20 text-center text-white/10 font-black text-sm uppercase tracking-[0.3em]">Calibrating</div>
              ) : leaderboard.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {leaderboard.map((m, idx) => (
                    <div
                      key={m._id}
                      className={`flex items-center justify-between p-6 ${m.memberId === member._id ? 'bg-brand-500/[0.03]' : ''
                        }`}
                    >
                      <div className="flex items-center gap-5">
                        {/* 🎖️ RANKING BADGE */}
                        <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black text-sm shadow-lg ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                            idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                              idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-black' :
                                'bg-white/5 text-white/30 border border-white/5'
                          }`}>
                          {idx + 1}
                        </div>

                        {/* 👤 AVATAR & NAME */}
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-black border-2 ${idx === 0 ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' :
                              m.memberId === member._id ? 'border-brand-500/50 bg-brand-500/10 text-brand-500' :
                                'border-white/10 bg-white/5 text-white/40'
                            }`}>
                            {m.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-black text-white flex items-center gap-2">
                              {m.name}
                              {m.memberId === member._id && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/20">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Flame className={`h-3 w-3 ${m.streak > 0 ? 'text-orange-500' : 'text-white/10'}`} />
                              <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{m.streak} Day Streak</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 💎 POINTS */}
                      <div className="text-right">
                        <div className="text-lg font-black text-brand-500 leading-none">{m.points}</div>
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Points</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-white/10 text-xs font-black uppercase tracking-widest">Awaiting Champions</div>
              )}
            </div>
          </div>
          <button className="w-full h-12 rounded-xl bg-white text-black font-bold text-sm hover:bg-brand-500 hover:text-white transition-all" onClick={() => setLeaderboardOpen(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

function MetricCard({ label, value, sub, icon }) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <div className="text-[10px] text-white/30 font-semibold uppercase mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
