import { Bell, LogOut, Moon, Search, Sun, Menu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import Button from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";
import API from "../../api/api";
import MobileMenu from "./MobileMenu";

export default function Topbar({ title, subtitle }) {
  const { user, gymName, gymLogo, setGymLogo, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wrapRef = useRef(null);

  const trimmed = useMemo(() => q.trim(), [q]);

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
      } catch (err) {
        console.error("Failed to upload logo:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!trimmed) {
        setResults([]);
        setSearching(false);
        return;
      }
      try {
        setSearching(true);
        const res = await API.get(
          `/members?query=${encodeURIComponent(trimmed)}&limit=6`,
        );
        if (cancelled) return;
        setResults(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }

    const t = setTimeout(run, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [trimmed]);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-4">
        <div className="rounded-2xl backdrop-blur-md border border-[color:var(--glass-border)] px-4 py-3 md:px-5 md:py-3 md:bg-[color:var(--glass-bg)] bg-[color:var(--bg2)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden inline-flex flex-shrink-0 items-center justify-center rounded-xl bg-[color:var(--control-bg)] border border-[color:var(--control-border)] p-2 text-[color:var(--muted)] hover:text-[color:var(--text)] transition"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 rounded-xl px-1.5 md:px-2 py-1.5 hover:bg-[color:var(--control-bg)] transition">
                <label
                  htmlFor="gym-logo-upload"
                  className="relative group cursor-pointer shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  title="Upload Gym Logo"
                >
                  {gymLogo ? (
                    <img src={gymLogo} alt="Gym Logo" className="h-10 w-10 rounded-xl object-cover shadow-glow border border-sky-600 dark:border-white/10" />
                  ) : (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-400/35 to-accent-500/25 border border-sky-600 dark:border-white/10 shadow-glow" />
                  )}
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <input
                    type="file"
                    id="gym-logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/app/dashboard")}
                  className="hidden sm:block text-left"
                  aria-label="Go to dashboard"
                >
                  <div className="text-sm font-black tracking-tight text-[color:var(--text)] leading-tight truncate max-w-[240px]">
                    {gymName || "----"}
                  </div>
                  <div className="text-[11px] text-[color:var(--subtle)] leading-tight truncate max-w-[240px]">
                    {gymName ? "Your gym" : "Premium Gym OS"}
                  </div>
                </button>
              </div>


            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:block relative" ref={wrapRef}>
                <div className="flex items-center gap-2 rounded-xl bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] border border-[color:var(--control-border)] px-3 py-2 text-xs text-[color:var(--muted)] transition">
                  <Search className="h-4 w-4" />
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Search members…"
                    className="w-[220px] bg-transparent outline-none text-[color:var(--text)] placeholder:text-[color:var(--subtle)]"
                  />
                </div>

                {open && trimmed ? (
                  <div className="absolute right-0 mt-2 w-[340px] glass-strong p-2">
                    {searching ? (
                      <div className="px-3 py-2 text-xs text-[color:var(--muted)]">
                        Searching…
                      </div>
                    ) : results.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-[color:var(--muted)]">
                        No members found
                      </div>
                    ) : (
                      <div className="grid gap-1">
                        {results.map((m) => (
                          <button
                            key={m._id}
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              setQ("");
                              navigate(`/app/member/${m._id}`);
                            }}
                            className="text-left rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] px-3 py-2 transition"
                          >
                            <div className="text-xs font-semibold text-[color:var(--text)] truncate">
                              {m.name}
                            </div>
                            <div className="text-[11px] text-[color:var(--muted)] truncate">
                              {m.phone || " "}
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            navigate("/app/members");
                          }}
                          className="mt-1 text-xs font-semibold text-[color:var(--brand-ink)] hover:text-[color:var(--text)] px-3 py-2 text-left transition"
                        >
                          Open Members page →
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center justify-center rounded-xl bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] border border-[color:var(--control-border)] px-3 py-2 text-[color:var(--muted)] transition"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/app/notifications")}
                className="relative inline-flex items-center justify-center rounded-xl bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] border border-[color:var(--control-border)] px-3 py-2 text-[color:var(--muted)] transition"
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-[color:var(--brand-soft-bg)] border border-[color:var(--brand-soft-border)] px-1 text-[11px] font-bold text-[color:var(--brand-ink)] flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>

              <div className="hidden md:flex items-center gap-3 pl-2">
                <div className="text-right">
                  <div className="text-xs font-semibold text-[color:var(--text)] leading-tight">
                    {user?.name || "Account"}
                  </div>
                  <div className="text-[11px] text-[color:var(--subtle)] leading-tight truncate max-w-[220px]">
                    {user?.email || " "}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="md:hidden"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </header>
  );
}
