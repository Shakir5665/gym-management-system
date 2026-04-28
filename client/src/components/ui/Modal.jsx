import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export default function Modal({ open, onClose, title, children, className }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "var(--overlay)" }}
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 md:p-6">
        <div
          className={cn(
            "glass-strong w-full max-w-lg p-5 md:p-6 max-h-[85vh] overflow-y-auto md:max-h-none md:overflow-y-visible",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? (
                <div className="text-sm font-bold text-[color:var(--text)]">
                  {title}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[color:var(--control-border)] bg-[color:var(--control-bg)] hover:bg-[color:var(--control-bg-hover)] px-2.5 py-2 text-[color:var(--muted)] transition flex-shrink-0"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
