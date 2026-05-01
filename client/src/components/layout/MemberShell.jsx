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
                <div className="text-[10px] text-white/30 truncate uppercase font-black tracking-widest">Elite Member</div>
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

        {/* 📱 MOBILE NAV OVERLAY */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-[85%] bg-[#0a0a0a] p-8 shadow-2xl animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center mb-12">
                <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/40"><X className="h-8 w-8" /></button>
              </div>
              <nav className="space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] font-black transition-all duration-300 ${location.pathname === item.path
                      ? "bg-brand-500 text-white shadow-2xl shadow-brand-500/40"
                      : "text-white/40 bg-white/5"
                      }`}
                  >
                    <item.icon className="h-7 w-7" />
                    <span className="text-lg">{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="absolute bottom-10 left-8 right-8 pt-8 border-t border-white/10">
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start gap-5 text-red-500 h-16 rounded-[2rem]"
                >
                  <LogOut className="h-7 w-7" />
                  <span className="text-lg font-black">Logout</span>
                </Button>
              </div>
            </div>
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
