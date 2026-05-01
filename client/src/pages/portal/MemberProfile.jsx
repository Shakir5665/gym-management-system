import { useState, useEffect } from "react";
import API from "../../api/api";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { User, Phone, MapPin, ShieldAlert, Save, Lock } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function MemberProfile() {
  const { user: authUser, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: authUser?.name || "",
    phone: "",
    homeAddress: "",
    emergencyPhone: "",
    gender: "",
    email: authUser?.email || "",
    password: "",
    profilePicture: authUser?.profilePicture || ""
  });
  // If we have authUser, we can show the UI immediately and just fetch details in BG
  const [loading, setLoading] = useState(!authUser);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/portal/me");
        const m = res.data.member;
        setForm(prev => ({
          ...prev,
          name: m.name || prev.name,
          phone: m.phone || "",
          homeAddress: m.homeAddress || "",
          emergencyPhone: m.emergencyPhone || "",
          gender: m.gender || "",
          email: m.email || prev.email,
        }));
      } catch (err) {
        if (!authUser) setMessage({ type: "error", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [authUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image must be less than 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const res = await API.put("/portal/profile", form);
      
      // Update global auth state so sidebar/topbar refresh immediately
      if (updateUser) {
        updateUser({ 
          ...authUser, 
          name: form.name, 
          email: form.email, 
          profilePicture: form.profilePicture 
        });
      }
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-white/20 font-bold tracking-widest uppercase">Fetching Profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="relative group">
          <div className="h-28 w-28 rounded-full border-2 border-white/10 p-1 bg-[#0a0a0a] overflow-hidden">
            {form.profilePicture ? (
              <img src={form.profilePicture} alt="Profile" className="h-full w-full object-cover rounded-full" />
            ) : (
              <div className="h-full w-full rounded-full bg-brand-500 text-white flex items-center justify-center text-4xl font-black shadow-inner">
                {form.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-white text-black border-2 border-[#050505] flex items-center justify-center cursor-pointer shadow-xl">
            <User className="h-5 w-5" />
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black text-white tracking-tight">Profile Settings</h1>
          <p className="text-sm text-white/40 font-medium mt-1">Manage your identity and security.</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold ${
          message.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-500" 
            : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          <ShieldAlert className="h-5 w-5" />
          {message.text}
        </div>
      )}

      <Card className="p-6 md:p-8 border-white/5 bg-white/[0.02]">
        <form onSubmit={handleUpdate} className="grid gap-5">
          <Input 
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            left={<User className="h-4 w-4" />}
            required
          />

          <div className="grid md:grid-cols-2 gap-5">
            <Input 
              label="Primary Phone"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              left={<Phone className="h-4 w-4" />}
              required
            />
            <Input 
              label="Emergency Contact"
              value={form.emergencyPhone}
              onChange={(e) => setForm({...form, emergencyPhone: e.target.value})}
              left={<Phone className="h-4 w-4" />}
            />
          </div>

          <Select 
            label="Gender"
            value={form.gender}
            onChange={(val) => setForm({...form, gender: val})}
            options={[
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
              { value: "OTHER", label: "Other" },
              { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" }
            ]}
          />

          <Input 
            label="Home Address"
            value={form.homeAddress}
            onChange={(e) => setForm({...form, homeAddress: e.target.value})}
            left={<MapPin className="h-4 w-4" />}
          />

          <div className="border-t border-[color:var(--control-border)] pt-5 mt-2">
            <h3 className="text-sm font-bold text-[color:var(--text)] mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-500" />
              Security & Credentials
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <Input 
                label="Login Email (Username)"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="your@email.com"
              />
              <Input 
                label="New Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>

          <div className="pt-6 mb-10">
            <Button type="submit" variant="primary" className="w-full gap-2 h-14 rounded-2xl shadow-2xl shadow-brand-500/20" disabled={saving}>
              {saving ? "Saving Changes..." : (
                <>
                  <Save className="h-5 w-5" />
                  <span className="font-black tracking-tight">Save Profile Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
