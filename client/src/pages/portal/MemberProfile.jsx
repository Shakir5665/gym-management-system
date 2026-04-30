import { useState, useEffect } from "react";
import API from "../../api/api";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { User, Phone, MapPin, ShieldAlert, Save, Lock } from "lucide-react";

export default function MemberProfile() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    homeAddress: "",
    emergencyPhone: "",
    gender: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get("/portal/profile");
        const m = res.data.member;
        setForm({
          name: m.name || "",
          phone: m.phone || "",
          homeAddress: m.homeAddress || "",
          emergencyPhone: m.emergencyPhone || "",
          gender: m.gender || "",
          email: m.email || "",
          password: ""
        });
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load profile" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      await API.put("/portal/profile", form);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-[color:var(--muted)] font-bold">Loading Profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-3xl bg-brand-500 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-brand-500/20">
          {form.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-black text-[color:var(--text)]">Edit Profile</h1>
          <p className="text-sm text-[color:var(--muted)] font-medium">Keep your details up to date.</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold animate-slide-in-top ${
          message.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-500" 
            : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          <ShieldAlert className="h-5 w-5" />
          {message.text}
        </div>
      )}

      <Card className="p-6 md:p-8 border-[color:var(--control-border)]">
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

          <div className="pt-4">
            <Button type="submit" variant="primary" className="w-full gap-2" disabled={saving}>
              {saving ? "Saving Changes..." : (
                <>
                  <Save className="h-4 w-4" />
                  Update Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
