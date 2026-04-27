import { NavLink } from "react-router-dom";
import { BarChart3, CreditCard, QrCode, ReceiptText, Users } from "lucide-react";
import { cn } from "../../lib/cn";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/app/members", label: "Members", icon: Users },
  { to: "/app/scanner", label: "Scanner", icon: QrCode },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/accounting", label: "Accounting", icon: ReceiptText },
];

export default function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-[color:var(--glass-border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-2">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-xl min-w-[64px] transition-all",
                  isActive
                    ? "text-[color:var(--brand-ink)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--text)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300",
                      isActive ? "bg-[color:var(--brand-soft-bg)] shadow-glow" : "bg-transparent"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                  </div>
                  <span className={cn("text-[10px] font-semibold transition-all", isActive ? "opacity-100" : "opacity-70")}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
