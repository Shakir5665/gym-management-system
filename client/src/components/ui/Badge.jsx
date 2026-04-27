import { cn } from "../../lib/cn";

const variants = {
  neutral:
    "bg-[color:var(--control-bg)] text-[color:var(--muted)] border-[color:var(--control-border)]",
  brand:
    "bg-[color:var(--brand-soft-bg)] text-[color:var(--brand-ink)] border-[color:var(--brand-soft-border)]",
  success:
    "bg-[color:var(--success-soft-bg)] text-[color:var(--success-ink)] border-[color:var(--success-soft-border)]",
  warning:
    "bg-[color:var(--warning-soft-bg)] text-[color:var(--warning-ink)] border-[color:var(--warning-soft-border)]",
  danger:
    "bg-[color:var(--danger-soft-bg)] text-[color:var(--danger-ink)] border-[color:var(--danger-soft-border)]",
};

export default function Badge({ className, variant = "neutral", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

