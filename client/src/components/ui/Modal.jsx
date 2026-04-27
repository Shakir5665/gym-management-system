import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export default function Modal({ open, onClose, title, children, className }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-3 md:p-6">
        <div className={cn("glass-strong w-full max-w-lg p-5 md:p-6", className)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? <div className="text-sm font-bold text-white">{title}</div> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/6 hover:bg-white/10 px-2.5 py-2 text-white/70 transition"
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

