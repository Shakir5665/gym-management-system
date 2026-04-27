import { Bell, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationsContext";
import Button from "../ui/Button";

export default function Topbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-4">
        <div className="glass px-4 py-3 md:px-5 md:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/app/dashboard")}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/6 transition"
                aria-label="Go to dashboard"
              >
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-400/35 to-accent-500/25 border border-white/10 shadow-glow" />
                <div className="hidden sm:block">
                  <div className="text-sm font-black tracking-tight text-white leading-tight">
                    Gym Pro
                  </div>
                  <div className="text-[11px] text-white/45 leading-tight">SaaS</div>
                </div>
              </button>

              <div className="hidden md:block min-w-0">
                <div className="text-sm font-bold text-white truncate">{title}</div>
                {subtitle ? <div className="text-xs text-white/50 mt-0.5">{subtitle}</div> : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/app/members")}
                className="hidden md:flex items-center gap-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 px-3 py-2 text-xs text-white/70 transition"
              >
                <Search className="h-4 w-4" />
                Search members
              </button>

              <button
                type="button"
                onClick={() => navigate("/app/notifications")}
                className="relative inline-flex items-center justify-center rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 px-3 py-2 text-white/80 transition"
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-brand-400/20 border border-brand-400/30 px-1 text-[11px] font-bold text-brand-200 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>

              <div className="hidden md:flex items-center gap-3 pl-2">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white/80 leading-tight">
                    {user?.name || "Account"}
                  </div>
                  <div className="text-[11px] text-white/45 leading-tight truncate max-w-[180px]">
                    {user?.email || " "}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
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
    </header>
  );
}

