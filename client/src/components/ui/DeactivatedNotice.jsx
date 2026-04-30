import React from "react";
import { ShieldAlert, Mail, Phone, Lock } from "lucide-react";
import Button from "./Button";

export default function DeactivatedNotice() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[color:var(--bg)] flex items-center justify-center p-4">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-danger-500/10 blur-[120px] rounded-full" />

      <div className="relative max-w-md w-full glass p-8 text-center border-danger-500/20 shadow-2xl">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-danger-500 animate-pulse" />
        </div>

        <h1 className="text-2xl font-black text-[color:var(--text)] mb-2 tracking-tight">
          ACCOUNT DEACTIVATED
        </h1>

        <p className="text-[color:var(--muted)] text-sm mb-8 leading-relaxed">
          Your gym's access to the <strong>Smart Gym OS</strong> has been restricted by the system administrator.
          Please settle any pending dues or contact support to restore your access.
        </p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[color:var(--bg2)]/50 border border-[color:var(--control-border)] text-sm text-[color:var(--text)]">
            <Mail className="w-4 h-4 text-brand-400" />
            <span>support@smartgym.com</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[color:var(--bg2)]/50 border border-[color:var(--control-border)] text-sm text-[color:var(--text)]">
            <Phone className="w-4 h-4 text-brand-400" />
            <span>+94 75 295 8134</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[color:var(--control-border)]">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Check Status Again
          </Button>
          <p className="mt-4 text-[10px] text-[color:var(--subtle)] flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
            <Lock className="w-3 h-3" /> Secure System Lock
          </p>
        </div>
      </div>
    </div>
  );
}
