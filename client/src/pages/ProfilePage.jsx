import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Lock, User as UserIcon, Building, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { user, gymName, gymLogo, setGymName, setGymLogo, login, token, hasGym } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    gymName: gymName || ""
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [passError, setPassError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // ✅ Re-enabling email update logic
      const userRes = await API.put("/auth/profile", { 
        name: formData.name,
        email: formData.email 
      });
      const gymRes = await API.put("/gym/profile", { name: formData.gymName });

      const updatedUser = userRes.data.user;
      
      login(token, hasGym, updatedUser);
      setGymName(gymRes.data.gym.name);
      localStorage.setItem("gymName", gymRes.data.gym.name);

      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPassError("Both password fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPassError("Passwords do not match");
      return;
    }

    try {
      setPassLoading(true);
      setPassError("");
      setPassMessage("");

      // ✅ Removing currentPassword check
      await API.post("/auth/change-password", {
        newPassword: passwordData.newPassword
      });

      setPassMessage("Password changed successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setPassMessage(""), 5000);
    } catch (err) {
      setPassError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Logo = reader.result;
        setGymLogo(base64Logo);
        localStorage.setItem("gymLogo", base64Logo);
        await API.put("/gym/logo", { logo: base64Logo });
        setMessage("Logo updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setError("Failed to upload logo");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-[color:var(--text)]">Gym Profile</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">Manage your identity, security, and gym branding.</p>
      </div>

      {message && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 rounded-xl border border-[color:var(--brand-soft-border)] bg-[color:var(--brand-soft-bg)] px-4 py-3 text-sm font-bold text-[color:var(--brand-ink)] flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 rounded-xl border border-[color:var(--danger-soft-border)] bg-[color:var(--danger-soft-bg)] px-4 py-3 text-sm font-bold text-[color:var(--danger-ink)]">
          {error}
        </div>
      )}

      <Card className="p-6 md:p-8 space-y-10">
        {/* LOGO SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-4 w-4 text-[color:var(--brand)]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-[color:var(--text)]">Branding</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-3xl overflow-hidden shadow-glow border border-white/10 shrink-0 bg-gradient-to-br from-brand-400/35 to-accent-500/25">
              {gymLogo ? (
                <img src={gymLogo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl font-black text-white/20 uppercase">
                  {formData.gymName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <label className="inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 px-5 py-2.5 text-xs font-black text-white transition cursor-pointer shadow-lg active:scale-95">
                Update Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <div className="mt-2 text-[11px] text-[color:var(--subtle)] font-medium">
                Recommend high-res PNG or JPG.
              </div>
            </div>
          </div>
        </section>

        {/* ACCOUNT DETAILS */}
        <section className="border-t border-[color:var(--glass-border)] pt-8">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="h-4 w-4 text-[color:var(--brand)]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-[color:var(--text)]">Account Identity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input 
              label="Full Name" 
              placeholder="e.g. Shakir Sar"
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <Input 
              label="Email Address" 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              hint="You can update your email here"
            />
          </div>
          <div className="mt-6">
            <Input 
              label="Gym Name" 
              placeholder="e.g. Titan Gym"
              value={formData.gymName} 
              onChange={e => setFormData({...formData, gymName: e.target.value})} 
            />
          </div>
          <div className="mt-8">
            <Button onClick={handleSave} disabled={loading} variant="primary" className="w-full h-12 text-sm font-black uppercase tracking-widest">
              {loading ? "Updating..." : "Save Identity Changes"}
            </Button>
          </div>
        </section>

        {/* SECURITY SECTION */}
        <section className="border-t border-[color:var(--glass-border)] pt-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-black uppercase tracking-widest text-[color:var(--text)]">Security</h2>
          </div>

          {passMessage && (
            <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-xs font-bold text-green-500">
              {passMessage}
            </div>
          )}
          {passError && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-500">
              {passError}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="New Password" 
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
              <Input 
                label="Confirm New Password" 
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>
            <div className="pt-2">
              <Button 
                onClick={handleChangePassword} 
                disabled={passLoading} 
                variant="ghost" 
                className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                {passLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </div>
        </section>
      </Card>
    </div>
  );
}
