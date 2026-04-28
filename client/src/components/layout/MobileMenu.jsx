import { NavLink } from "react-router-dom";
import { BarChart3, CreditCard, QrCode, ReceiptText, Users, X, LogOut, Settings } from "lucide-react";
import { cn } from "../../lib/cn";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Favicon from "../../assets/favicon.png";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/app/members", label: "Members", icon: Users },
  { to: "/app/scanner", label: "Scanner", icon: QrCode },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/accounting", label: "Accounting", icon: ReceiptText },
  { to: "/app/profile", label: "Profile", icon: Settings },
];

export default function MobileMenu({ open, onClose }) {
  const { user, gymName, gymLogo, logout } = useAuth();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            className="fixed inset-0 z-[100] backdrop-blur-md"
            style={{ background: "var(--overlay)" }}
            onClick={onClose}
            aria-label="Close menu"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 left-0 bottom-0 z-[101] w-[280px] bg-[color:var(--bg)] border-r border-[color:var(--glass-border)] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--control-border)]">
              <div className="flex items-center gap-3">
                <img
                  src={gymLogo || Favicon}
                  alt="Gym Logo"
                  className="h-10 w-10 rounded-2xl object-cover border border-white/12 shadow-glow bg-gradient-to-br from-brand-400/40 to-accent-500/28"
                />
                <div className="min-w-0">
                  <div className="text-sm font-black tracking-tight text-[color:var(--text)] truncate max-w-[160px]">
                    {gymName || "Gym Pro"}
                  </div>
                  <div className="text-[11px] text-[color:var(--subtle)] truncate max-w-[160px]">
                    {user?.name || "Account"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] px-2.5 py-2 text-[color:var(--muted)] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--subtle)]">
                Navigation
              </div>
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm transition",
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

            <div className="p-4 border-t border-[color:var(--control-border)]">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition text-danger-500 hover:bg-danger-500/10"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-danger-500/10 border border-danger-500/20">
                  <LogOut className="h-[18px] w-[18px]" />
                </span>
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
