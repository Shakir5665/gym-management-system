import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ProfilePage() {
  const { user, gymName, gymLogo, setGymName, setGymLogo, login, token, hasGym } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    gymName: gymName || ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const userRes = await API.put("/auth/profile", { name: formData.name, email: formData.email });
      const gymRes = await API.put("/gym/profile", { name: formData.gymName });

      const updatedUser = userRes.data.user;
      
      login(token, hasGym, updatedUser);
      setGymName(gymRes.data.gym.name);
      localStorage.setItem("gymName", gymRes.data.gym.name);

      setMessage("Profile updated successfully!");
      
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
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
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-[color:var(--text)]">Gym Profile</h1>
        <p className="text-sm text-[color:var(--muted)]">Manage your personal details and gym settings.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-[color:var(--danger-soft-border)] bg-[color:var(--danger-soft-bg)] px-3 py-2 text-xs font-semibold text-[color:var(--danger-ink)]">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-xl border border-[color:var(--brand-soft-border)] bg-[color:var(--brand-soft-bg)] px-3 py-2 text-xs font-semibold text-[color:var(--brand-ink)]">
          {message}
        </div>
      )}

      <Card className="p-6 md:p-8 space-y-8">
        <div>
          <label className="block text-sm font-semibold text-[color:var(--text)] mb-3">Gym Logo</label>
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-glow border border-white/10 shrink-0 bg-gradient-to-br from-brand-400/35 to-accent-500/25">
              {gymLogo && (
                <img src={gymLogo} alt="Logo" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center justify-center rounded-xl bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] border border-[color:var(--control-border)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] transition cursor-pointer shadow-sm">
                Upload new logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              <div className="mt-1.5 text-[11px] text-[color:var(--subtle)]">
                Recommended size: 256x256px
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[color:var(--glass-border)] pt-6">
          <h2 className="text-sm font-bold text-[color:var(--text)] mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Your Name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <Input 
              label="Email Address" 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              disabled={user?.provider === 'google'}
            />
          </div>
          {user?.provider === 'google' && (
            <div className="mt-2 text-[11px] text-[color:var(--subtle)]">
              Your email is managed by your Google account.
            </div>
          )}
        </div>

        <div className="border-t border-[color:var(--glass-border)] pt-6">
          <h2 className="text-sm font-bold text-[color:var(--text)] mb-4">Gym Details</h2>
          <Input 
            label="Gym Name" 
            value={formData.gymName} 
            onChange={e => setFormData({...formData, gymName: e.target.value})} 
          />
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={loading} variant="primary" className="w-full">
            {loading ? "Saving changes..." : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
