import { NavLink } from "react-router-dom";
import { BarChart3, Bell, CreditCard, QrCode, Users } from "lucide-react";
import { cn } from "../../lib/cn";
import { useNotifications } from "../../context/NotificationsContext";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/app/members", label: "Members", icon: Users },
  { to: "/app/scanner", label: "Scanner", icon: QrCode },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
  const { unreadCount } = useNotifications();

  return (
    <aside className="hidden md:flex w-[296px] shrink-0 flex-col p-4">
      <div className="glass px-4 py-4 relative overflow-hidden">
        <div className="absolute -top-24 -left-20 h-44 w-44 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-44 w-44 rounded-full bg-accent-500/16 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-400/40 to-accent-500/28 border border-white/12 shadow-glow" />
          <div className="min-w-0">
            <div className="text-sm font-black tracking-tight text-white">Gym Pro</div>
            <div className="text-[11px] text-white/45 truncate">Premium Gym OS</div>
          </div>
        </div>
      </div>

      <div className="mt-4 glass p-2">
        <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-white/45">
          Navigation
        </div>
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-gradient-to-r from-brand-400/16 to-accent-500/10 border border-white/10 text-white shadow-glass"
                    : "text-white/68 hover:text-white hover:bg-white/6 border border-transparent",
                )
              }
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/6 border border-white/10 group-hover:bg-white/10 transition">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="font-semibold">{item.label}</span>
              </div>
              {item.to === "/app/notifications" && unreadCount > 0 ? (
                <span className="min-w-[22px] rounded-full bg-brand-400/15 border border-brand-400/25 px-2 py-0.5 text-[11px] font-bold text-brand-200 text-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>

      <div className="mt-4 glass p-4">
        <div className="text-xs font-semibold text-white/70">Live system</div>
        <div className="mt-1 text-xs text-white/45 leading-relaxed">
          Real-time updates, QR check-ins, and gamification—built for speed.
        </div>
        <div className="mt-3 h-px bg-white/10" />
        <div className="mt-3 text-[11px] text-white/40">
          Tip: Keep an eye on <span className="text-white/55 font-semibold">Risk</span> to prevent churn.
        </div>
      </div>
    </aside>
  );
}

