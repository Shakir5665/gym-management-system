import { useState, useEffect } from "react";
import API from "../../api/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { 
  Trophy, 
  Activity, 
  Calendar, 
  ChevronRight, 
  QrCode, 
  Info,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MemberDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await API.get("/portal/profile");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
          <h1 className="text-3xl font-black tracking-tight text-[color:var(--text)]">
            Hey, {member.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-[color:var(--muted)] font-medium">
            Ready for your session at <span className="text-brand-500">{member.gymId?.name}</span>?
          </p>
        </div>
        
        <Badge 
          variant={isExpired ? "danger" : "success"}
          className="text-sm px-4 py-1.5 rounded-full"
        >
          {isExpired ? "Subscription Expired" : "Active Member"}
        </Badge>
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

      {/* 📊 STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          icon={<Calendar className="text-blue-500" />} 
          label="Total Check-ins" 
          value={stats.totalCheckins} 
          sub="Lifetime visits"
        />
        <StatCard 
          icon={<Trophy className="text-yellow-500" />} 
          label="Rank" 
          value="Member" 
          sub="Loyalty tier"
        />
        <StatCard 
          icon={member.isBanned || member.hasFine ? <ShieldAlert className="text-red-500" /> : <ShieldCheck className="text-green-500" />} 
          label="Account Status" 
          value={member.isBanned ? "Restricted" : member.hasFine ? "Action Required" : "Good Standing"} 
          sub={member.isBanned ? "Contact Admin" : member.hasFine ? "Settle Dues" : "No restrictions"}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <Card className="p-5 flex flex-col gap-3 border-[color:var(--control-border)]">
      <div className="h-10 w-10 rounded-xl bg-[color:var(--control-bg)] flex items-center justify-center border border-[color:var(--control-border)]">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-wider">{label}</div>
        <div className="text-xl font-black text-[color:var(--text)] mt-0.5">{value}</div>
        {sub && <div className="text-[10px] text-[color:var(--subtle)] mt-1">{sub}</div>}
      </div>
    </Card>
  );
}
