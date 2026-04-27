import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const Input = forwardRef(function Input(
  { className, label, hint, error, left, right, ...props },
  ref,
) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <div className="mb-1.5 flex items-end justify-between">
          <span className="text-xs font-semibold text-white/80">{label}</span>
          {hint ? <span className="text-[11px] text-white/45">{hint}</span> : null}
        </div>
      ) : null}
      <div
        className={cn(
          "group flex items-center gap-2 rounded-xl border px-3 py-2.5 shadow-glass backdrop-blur",
          "bg-white/[0.06] border-white/10 hover:border-white/14",
          "focus-within:border-brand-400/40 focus-within:ring-2 focus-within:ring-[var(--ring)]",
          error && "border-danger-500/40 focus-within:border-danger-500/55 focus-within:ring-danger-500/25",
        )}
      >
        {left ? <div className="text-white/55">{left}</div> : null}
        <input
          ref={ref}
          className={cn(
            "w-full bg-transparent text-sm text-white placeholder:text-white/35 outline-none",
          )}
          {...props}
        />
        {right ? <div className="text-white/55">{right}</div> : null}
      </div>
      {error ? <p className="mt-1.5 text-xs text-danger-500">{error}</p> : null}
    </label>
  );
});

export default Input;

