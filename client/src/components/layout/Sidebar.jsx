import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart3,
  CreditCard,
  QrCode,
  ReceiptText,
  Users,
  Settings,
  LayoutGrid
} from "lucide-react";
import { cn } from "../../lib/cn";
import Favicon from "../../assets/favicon.png";

export default function Sidebar() {
  const { role } = useAuth();

  const nav = [
    { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/app/members", label: "Members", icon: Users },
    { to: "/app/scanner", label: "Scanner", icon: QrCode },
    { to: "/app/payments", label: "Payments", icon: CreditCard },
    { to: "/app/accounting", label: "Accounting", icon: ReceiptText },
    { to: "/app/profile", label: "Profile", icon: Settings },
  ];

  // 🚀 Add Super Admin Portal for authorized users only
  if (role === "SUPER_ADMIN") {
    nav.push({ to: "/app/super", label: "Master Dashboard", icon: LayoutGrid });
  }

  return (
    <aside className="hidden md:flex w-[296px] shrink-0 flex-col p-4 bg-[color:var(--bg)] border-r border-[color:var(--control-border)]">
      <div className="rounded-2xl bg-gradient-to-br from-[color:var(--bg2)] to-[color:var(--bg)] border border-[color:var(--control-border)] px-4 py-4 relative overflow-hidden">
        <div className="absolute -top-24 -left-20 h-44 w-44 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-44 w-44 rounded-full bg-accent-500/16 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <img
            src={Favicon}
            alt="Smart Gym Logo"
            className="h-20 w-30 object-contain"
          />
          <div className="min-w-0">
            <div className="text-sm font-black tracking-tight text-[color:var(--text)]">
              SMART GYM
            </div>
            <div className="text-[11px] text-[color:var(--subtle)] truncate">
              Premium Gym OS
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-[color:var(--bg2)] to-[color:var(--bg)] border border-[color:var(--control-border)] p-2">
        <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--subtle)]">
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
                    ? "bg-gradient-to-r from-brand-400/14 to-accent-500/10 border border-[color:var(--glass-border)] text-[color:var(--text)] shadow-glass"
                    : "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--control-bg)] border border-transparent",
                )
              }
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--control-bg)] border border-[color:var(--control-border)] group-hover:bg-[color:var(--control-bg-hover)] transition">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="font-semibold">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-[color:var(--bg2)] to-[color:var(--bg)] border border-[color:var(--control-border)] p-4">
        <div className="text-xs font-semibold text-[color:var(--muted)]">
          Live system
        </div>
        <div className="mt-1 text-xs text-[color:var(--subtle)] leading-relaxed">
          Real-time updates, QR check-ins, and gamification—built for speed.
        </div>
        <div className="mt-3 h-px bg-[color:var(--control-border)]" />
        <div className="mt-3 text-[11px] text-[color:var(--subtle)]">
          Tip: Keep an eye on{" "}
          <span className="text-[color:var(--muted)] font-semibold">Churn Probability</span>{" "}
          to prevent churn.
        </div>
      </div>
    </aside>
  );
}
