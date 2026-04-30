import { useState, useEffect } from "react";
import API from "../api/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Building2, Users, CreditCard, Activity, Search, ShieldCheck, ShieldAlert } from "lucide-react";

export default function SuperAdminDashboard() {
  const [gyms, setGyms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gymsRes, statsRes] = await Promise.all([
        API.get("/super/gyms"),
        API.get("/super/stats")
      ]);
      setGyms(gymsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load super admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (gymId, currentStatus) => {
    try {
      await API.put(`/super/gyms/${gymId}/status`, { isActive: !currentStatus });
      setGyms(prev => prev.map(g => g._id === gymId ? { ...g, isActive: !currentStatus } : g));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredGyms = gyms.filter(g => 
    g.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-[color:var(--muted)]">Loading System Data...</div>;

  return (
    <div className="grid gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* 🚀 Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Building2 className="text-brand-500" />} 
          title="Total Gyms" 
          value={stats?.totalGyms || 0} 
        />
        <StatCard 
          icon={<Users className="text-blue-500" />} 
          title="Total Members" 
          value={stats?.totalMembers || 0} 
        />
        <StatCard 
          icon={<CreditCard className="text-green-500" />} 
          title="Total Revenue" 
          value={`${(stats?.totalRevenue || 0).toLocaleString()} LKR`} 
        />
        <StatCard 
          icon={<Activity className="text-purple-500" />} 
          title="Global Check-ins" 
          value={stats?.totalCheckins || 0} 
        />
      </div>

      {/* 🏢 Gym Management Table */}
      <Card className="p-0 overflow-hidden border-[color:var(--control-border)]">
        <div className="p-5 border-b border-[color:var(--control-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[color:var(--bg2)]/30">
          <div>
            <h2 className="text-lg font-bold text-[color:var(--text)]">Gym Directory</h2>
            <p className="text-xs text-[color:var(--muted)]">Manage all businesses using your platform.</p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted)]" />
            <input 
              type="text" 
              placeholder="Search by gym or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[color:var(--control-bg)] border border-[color:var(--control-border)] rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 ring-brand-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] uppercase tracking-wider text-[color:var(--muted)] bg-[color:var(--bg2)]/50 border-b border-[color:var(--control-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Gym Details</th>
                <th className="px-6 py-4 font-semibold">Owner</th>
                <th className="px-6 py-4 font-semibold">Members</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--control-border)]">
              {filteredGyms.map((gym) => (
                <tr key={gym._id} className="hover:bg-[color:var(--bg2)]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[color:var(--text)]">{gym.name}</div>
                    <div className="text-[10px] text-[color:var(--muted)]">ID: {gym._id.slice(-8)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[color:var(--text)]">{gym.owner?.name}</div>
                    <div className="text-[11px] text-[color:var(--muted)]">{gym.owner?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="brand">{gym.memberCount} members</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {gym.isActive ? (
                      <span className="flex items-center gap-1.5 text-green-500 font-medium">
                        <ShieldCheck className="h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 font-medium">
                        <ShieldAlert className="h-4 w-4" /> Deactivated
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant={gym.isActive ? "danger" : "primary"}
                      size="sm"
                      onClick={() => toggleStatus(gym._id, gym.isActive)}
                      className="text-[10px] py-1 px-3"
                    >
                      {gym.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGyms.length === 0 && (
            <div className="p-12 text-center text-[color:var(--muted)] italic">
              No gyms found matching your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="p-3 rounded-2xl bg-[color:var(--bg2)] border border-[color:var(--control-border)]">
        {icon}
      </div>
      <div>
        <div className="text-xs text-[color:var(--muted)] font-medium">{title}</div>
        <div className="text-xl font-bold text-[color:var(--text)]">{value}</div>
      </div>
    </Card>
  );
}
