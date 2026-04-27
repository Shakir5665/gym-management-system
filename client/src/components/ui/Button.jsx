import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const styles = {
  base:
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition will-change-transform " +
    "focus:outline-none focus-visible:focus-ring disabled:opacity-50 disabled:cursor-not-allowed " +
    "active:translate-y-px",
  variants: {
    primary:
      "bg-gradient-to-b from-brand-400/25 to-brand-600/25 text-white border border-brand-400/25 shadow-glow " +
      "hover:from-brand-400/32 hover:to-brand-600/32",
    solid:
      "bg-white/10 text-white border border-white/10 hover:bg-white/14 hover:border-white/14",
    ghost:
      "bg-transparent text-white/80 hover:text-white hover:bg-white/6 border border-transparent",
    danger:
      "bg-gradient-to-b from-danger-500/22 to-danger-600/22 text-white border border-danger-500/25 " +
      "hover:from-danger-500/30 hover:to-danger-600/30",
  },
  sizes: {
    sm: "px-3 py-2 text-xs rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-5 py-3 text-sm rounded-xl",
  },
};

const Button = forwardRef(function Button(
  { className, variant = "solid", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(styles.base, styles.variants[variant], styles.sizes[size], className)}
      {...props}
    />
  );
});

export default Button;

