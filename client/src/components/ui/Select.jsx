import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/cn";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Select({ className, label, value, onChange, options, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  return (
    <div className={cn("block", className)} ref={ref}>
      {label && (
        <div className="mb-1.5 flex items-end justify-between">
          <span className="text-xs font-semibold text-[color:var(--muted)]">{label}</span>
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 shadow-glass backdrop-blur text-sm outline-none transition-colors",
            "bg-[color:var(--control-bg)] border-[color:var(--control-border)] hover:border-[color:var(--glass-border-strong)]",
            open ? "border-brand-400/40 ring-2 ring-[var(--ring)]" : "",
            !selectedOption ? "text-[color:var(--subtle)]" : "text-[color:var(--text)]"
          )}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={cn("h-4 w-4 text-[color:var(--subtle)] transition-transform", open ? "rotate-180" : "")} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[color:var(--glass-border-strong)] bg-[color:var(--bg2)] shadow-2xl backdrop-blur-xl"
            >
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
                {options.map((opt) => {
                  const isSelected = String(value) === String(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center px-3 py-2.5 text-sm rounded-lg text-left transition-colors",
                        isSelected
                          ? "bg-[color:var(--brand-soft-bg)] text-[color:var(--brand-ink)] font-semibold"
                          : "text-[color:var(--text)] hover:bg-[color:var(--control-bg-hover)]"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
