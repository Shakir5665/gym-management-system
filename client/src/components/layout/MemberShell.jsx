import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  User,
  CreditCard,
  History,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import Button from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/Logo-Dark.png";

export default function MemberShell() {
  const { logout, user } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Force dark mode exclusively for the Member Portal
  useEffect(() => {
    const originalTheme = localStorage.getItem("theme") || "dark";
    setTheme("dark");

    // Optional: Restore original theme when leaving the portal
    return () => {
      setTheme(originalTheme);
    };
  }, [setTheme]);

  const navItems = [
    { label: "Dashboard", path: "/portal/dashboard", icon: LayoutDashboard },
    { label: "Attendance", path: "/portal/attendance", icon: History },
    { label: "My Profile", path: "/portal/profile", icon: User },
    { label: "Payments", path: "/portal/payments", icon: CreditCard },
  ];

  const activeItem = navItems.find(item => location.pathname.startsWith(item.path)) || navItems[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* 📱 MOBILE HEADER */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#0a0a0a] border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-20 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-4">
          {/* 👤 MOBILE PROFILE ACCESS */}
          <div
            onClick={() => navigate("/portal/profile")}
            className="h-10 w-10 rounded-full border border-white/10 overflow-hidden bg-brand-500 flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-lg"
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-black">{user?.name?.slice(0, 1).toUpperCase()}</span>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 active:scale-90 transition-transform"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* 🏰 SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex flex-col w-80 h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/5 p-8">
          <div className="mb-14 flex justify-center">
            <img src={logo} alt="Logo" className="h-30 w-auto object-contain" />
          </div>

          <nav className="flex-1 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 group ${location.pathname === item.path
                  ? "bg-brand-500 text-white shadow-2xl shadow-brand-500/40"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <item.icon className={`h-6 w-6 ${location.pathname === item.path ? "" : "group-hover:scale-110 transition-transform"}`} />
                <span className="font-black text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 mb-8 p-4 rounded-3xl bg-white/5 border border-white/10">
              <div className="h-12 w-12 rounded-2xl bg-brand-500 overflow-hidden flex items-center justify-center font-black text-white shadow-xl">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black truncate">{user?.name}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start gap-4 text-red-500 hover:bg-red-500/10 rounded-2xl h-14"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-black text-sm">Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* 📱 MOBILE BOTTOM SHEET DRAWER */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Right Side Drawer Panel */}
            <div
              className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm bg-[#0f0f0f] shadow-[−20px_0_60px_rgba(0,0,0,0.8)] border-l border-white/[0.06] flex flex-col"
              style={{ animation: "slideRight 0.3s cubic-bezier(0.32,0.72,0,1)" }}
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-white/50" />
                </button>
              </div>

              {/* Member Identity Card */}
              <div className="mx-5 mt-2 mb-6 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-500 overflow-hidden flex items-center justify-center font-black text-white text-lg shadow-lg shrink-0">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black text-white truncate">{user?.name}</div>
                </div>
              </div>

              {/* Nav Items */}
              <nav className="px-5 space-y-2 flex-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-[0.98] ${isActive
                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                          : "text-white/40 bg-white/[0.03] hover:bg-white/[0.06] hover:text-white/70"
                        }`}
                    >
                      <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-black tracking-tight">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="mx-5 mt-4 mb-10 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 bg-red-500/[0.06] hover:bg-red-500/10 transition-all duration-200 active:scale-[0.98] font-black text-sm"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <style>{`
              @keyframes slideRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
          </div>
        )}

        {/* 🎬 MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen pb-32 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* 📱 MOBILE SOLID TAB BAR (Quick Access) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#0a0a0a] border-t border-white/10 pb-safe-area-inset-bottom">
        <nav className="h-20 flex items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 active:scale-90"
              >
                <div className={`transition-all duration-300 ${isActive ? "scale-110" : "scale-100 opacity-40"}`}>
                  <Icon className={`h-6 w-6 ${isActive ? "text-brand-500" : "text-white"}`} />
                </div>

                <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 transition-all duration-300 ${isActive ? "text-white" : "text-white/20"
                  }`}>
                  {item.label}
                </span>

                {isActive && (
                  <div className="absolute top-0 h-1 w-8 bg-brand-500 rounded-b-full shadow-[0_0_15px_rgba(204,255,0,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
