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
import { useState } from "react";
import Button from "../ui/Button";

export default function MemberShell() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/portal/dashboard", icon: LayoutDashboard },
    { label: "My Profile", path: "/portal/profile", icon: User },
    { label: "Payments", path: "/portal/payments", icon: CreditCard },
    { label: "Attendance", path: "/portal/attendance", icon: History },
  ];

  const activeItem = navItems.find(item => location.pathname.startsWith(item.path)) || navItems[0];

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      {/* 📱 MOBILE HEADER */}
      <header className="lg:hidden sticky top-0 z-50 glass border-b border-[color:var(--glass-border)] px-4 py-3 flex items-center justify-between">
        <div className="font-black text-lg tracking-tighter text-brand-500">MEMBER PORTAL</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-[color:var(--control-bg)] border border-[color:var(--control-border)]"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex">
        {/* 🏰 SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-[color:var(--bg)] border-r border-[color:var(--control-border)] p-6">
          <div className="mb-10">
            <div className="font-black text-2xl tracking-tighter text-brand-500">SMART GYM</div>
            <div className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-widest mt-1">Member Portal</div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  location.pathname === item.path
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "text-[color:var(--muted)] hover:bg-[color:var(--control-bg)] hover:text-[color:var(--text)]"
                }`}
              >
                <item.icon className={`h-5 w-5 ${location.pathname === item.path ? "" : "group-hover:scale-110 transition-transform"}`} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-[color:var(--control-border)]">
            <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-[color:var(--control-bg)]/50">
              <div className="h-10 w-10 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white shadow-inner">
                {user?.name?.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{user?.name}</div>
                <div className="text-[10px] text-[color:var(--muted)] truncate uppercase font-bold tracking-wider">Member Account</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={logout} 
              className="w-full justify-start gap-3 text-danger-500 hover:bg-danger-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-bold text-sm">Logout</span>
            </Button>
          </div>
        </aside>

        {/* 📱 MOBILE NAV OVERLAY */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-[color:var(--bg)] p-6 shadow-2xl animate-slide-in-right">
              <div className="flex justify-between items-center mb-8">
                <div className="font-black text-xl text-brand-500 tracking-tighter">PORTAL MENU</div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X className="h-6 w-6" /></button>
              </div>
              <nav className="space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition ${
                      location.pathname === item.path
                        ? "bg-brand-500 text-white shadow-xl shadow-brand-500/20"
                        : "text-[color:var(--muted)] bg-[color:var(--control-bg)]"
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-[color:var(--control-border)]">
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="w-full justify-start gap-4 text-danger-500"
                >
                  <LogOut className="h-6 w-6" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 🎬 MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
