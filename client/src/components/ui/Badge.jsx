import { cn } from "../../lib/cn";

const variants = {
  neutral: "bg-white/8 text-white/75 border-white/10",
  brand: "bg-brand-400/12 text-brand-200 border-brand-400/20",
  success: "bg-success-500/12 text-green-200 border-success-500/20",
  warning: "bg-warning-500/12 text-yellow-200 border-warning-500/20",
  danger: "bg-danger-500/12 text-red-200 border-danger-500/20",
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

