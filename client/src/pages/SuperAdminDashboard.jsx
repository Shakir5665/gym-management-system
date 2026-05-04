import { useState, useEffect } from "react";
import API from "../api/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Building2, Users, CreditCard, Activity, Search, ShieldCheck, ShieldAlert, Plus, Mail, Lock, User, Trash2, RotateCcw } from "lucide-react";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

export default function SuperAdminDashboard() {
  const [gyms, setGyms] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    gymName: ""
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, gymId: null, gymName: "" });
  const [actionLoading, setActionLoading] = useState(false);

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

  const updateStatus = async (gymId, payload) => {
    try {
      await API.put(`/super/gyms/${gymId}/status`, payload);
      setGyms(prev => prev.map(g => g._id === gymId ? { ...g, ...payload } : g));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // 🛡️ Client-side Validations
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.gymName) {
      setRegisterError("All fields are required");
      return;
    }

    if (!acceptedTerms) {
      setRegisterError("Please confirm acceptance of the Terms and Conditions");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setRegisterError("Please enter a valid email address");
      return;
    }

    if (registerForm.password.length < 8) {
      setRegisterError("Password must be at least 8 characters long");
      return;
    }

    try {
      setRegisterLoading(true);
      setRegisterError("");
      await API.post("/super/register-gym", registerForm);
      setRegisterOpen(false);
      setRegisterForm({ name: "", email: "", password: "", gymName: "" });
      setAcceptedTerms(false);
      loadData();
    } catch (err) {
      setRegisterError(err.response?.data?.message || "Failed to register gym");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleScheduleDeletion = async () => {
    try {
      setActionLoading(true);
      await API.post(`/super/gyms/${deleteModal.gymId}/schedule-deletion`);
      setDeleteModal({ open: false, gymId: null, gymName: "" });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to schedule deletion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeDeletion = async (gymId) => {
    try {
      setActionLoading(true);
      await API.post(`/super/gyms/${gymId}/revoke-deletion`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to revoke deletion");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredGyms = gyms.filter(g => 
    g.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center text-white/20 font-black tracking-[0.3em] uppercase">Accessing Global Systems...</div>;

  return (
    <div className="grid gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* 🚀 Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
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
      </div>

      {/* 🏢 Gym Management Table */}
      <Card className="p-0 overflow-hidden border-[color:var(--control-border)]">
        <div className="p-5 border-b border-[color:var(--control-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[color:var(--bg2)]/30">
          <div>
            <h2 className="text-lg font-bold text-[color:var(--text)]">Gym Directory</h2>
            <p className="text-xs text-[color:var(--muted)]">Manage all businesses using your platform.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search by gym or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[color:var(--control-bg)] border border-[color:var(--control-border)] rounded-xl py-2 pl-10 pr-4 text-sm outline-none"
              />
            </div>
            <Button variant="primary" onClick={() => setRegisterOpen(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Register New Gym
            </Button>
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
                <tr key={gym._id} className="border-b border-white/5">
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
                    {!gym.isApproved ? (
                      <span className="flex items-center gap-1.5 text-yellow-500 font-medium">
                        <Activity className="h-4 w-4" /> Pending Approval
                      </span>
                      ) : gym.isActive ? (
                        <span className="flex items-center gap-1.5 text-green-500 font-medium">
                          <ShieldCheck className="h-4 w-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-500 font-medium">
                          <ShieldAlert className="h-4 w-4" /> Deactivated
                        </span>
                      )}
                      {gym.scheduledDeletionAt && (
                        <div className="mt-1 text-[10px] text-red-400 font-bold">
                          🗑️ Deletion on {new Date(gym.scheduledDeletionAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {gym.scheduledDeletionAt ? (
                          <Button 
                            variant="primary"
                            size="sm"
                            onClick={() => handleRevokeDeletion(gym._id)}
                            className="text-[10px] py-1 px-3 bg-blue-600 hover:bg-blue-700 border-none flex items-center gap-1"
                            disabled={actionLoading}
                          >
                            <RotateCcw className="h-3 w-3" /> Revoke Deletion
                          </Button>
                        ) : (
                          <>
                            {!gym.isApproved && (
                              <Button 
                                variant="primary"
                                size="sm"
                                onClick={() => updateStatus(gym._id, { isApproved: true, isActive: true })}
                                className="text-[10px] py-1 px-3 bg-green-600 hover:bg-green-700 border-none"
                                disabled={actionLoading}
                              >
                                Approve Gym
                              </Button>
                            )}
                            {gym.isApproved && (
                              <>
                                <Button 
                                  variant={gym.isActive ? "danger" : "primary"}
                                  size="sm"
                                  onClick={() => updateStatus(gym._id, { isActive: !gym.isActive })}
                                  className="text-[10px] py-1 px-3"
                                  disabled={actionLoading}
                                >
                                  {gym.isActive ? "Deactivate" : "Activate"}
                                </Button>
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteModal({ open: true, gymId: gym._id, gymName: gym.name })}
                                  className="text-red-500 hover:bg-red-500/10 p-1"
                                  disabled={actionLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </>
                        )}
                      </div>
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

      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title="Register New Gym">
        <form onSubmit={handleRegister} className="grid gap-4">
          {registerError && (
            <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-xs font-bold">
              {registerError}
            </div>
          )}
          <Input 
            label="Owner Full Name"
            placeholder="Mohamed"
            value={registerForm.name}
            onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
            required
            left={<User className="h-4 w-4" />}
          />
          <Input 
            label="Owner Email"
            type="email"
            placeholder="owner@gym.com"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
            required
            left={<Mail className="h-4 w-4" />}
          />
          <Input 
            label="Initial Password"
            type="password"
            placeholder="Min 8 chars, 1 num, 1 special"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
            required
            left={<Lock className="h-4 w-4" />}
          />
          <Input 
            label="Gym Name"
            placeholder="Elite Fitness Center"
            value={registerForm.gymName}
            onChange={(e) => setRegisterForm({...registerForm, gymName: e.target.value})}
            required
            left={<Building2 className="h-4 w-4" />}
          />

          <div className="flex items-start gap-2 px-1">
            <input
              id="reg-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 accent-brand-500"
            />
            <label htmlFor="reg-terms" className="text-[11px] leading-tight text-[color:var(--muted)]">
              The Client has reviewed and accepted the{" "}
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-400 hover:underline font-medium"
              >
                Terms and Conditions
              </a>.
            </label>
          </div>
          
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setRegisterOpen(false)} disabled={registerLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={registerLoading || !acceptedTerms}>
              {registerLoading ? "Registering..." : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal 
        open={deleteModal.open} 
        onClose={() => setDeleteModal({ open: false, gymId: null, gymName: "" })} 
        title="Schedule Gym Deletion"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <h3 className="text-red-500 font-bold mb-2 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Critical Action
            </h3>
            <p className="text-sm text-[color:var(--text)] leading-relaxed">
              You are about to schedule <span className="font-bold underline">{deleteModal.gymName}</span> for permanent deletion.
            </p>
          </div>

          <div className="bg-[color:var(--bg2)] p-4 rounded-xl border border-[color:var(--control-border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--muted)] mb-3">Permanent Deletion Rules:</h4>
            <ul className="text-xs space-y-2 text-[color:var(--subtle)]">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                <span>The gym will be deactivated <strong>immediately</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                <span>All data (Members, Payments, Attendance) will be <strong>permanently purged</strong> after 15 days.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                <span>You can <strong>revoke</strong> this decision anytime within the next 15 days.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              variant="ghost" 
              onClick={() => setDeleteModal({ open: false, gymId: null, gymName: "" })}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleScheduleDeletion}
              disabled={actionLoading}
              className="px-6"
            >
              {actionLoading ? "Processing..." : "Confirm Deletion Schedule"}
            </Button>
          </div>
        </div>
      </Modal>
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
